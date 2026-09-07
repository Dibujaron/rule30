//// The row the guard writes to `events.jsonl` for every hook call, and the
//// reader the dispatcher uses to get those rows back.
////
//// The producer (`guard`) and the consumer (`dispatch`) are two modules
//// apart, with `log` serialising in between, so the row's `kind`, its key
//// names and the vocabulary of its `denial` field are a contract. This
//// module is where that contract lives: `write` is the only way a guard row
//// is written and `read` the only way one is read, both from the one
//// `GuardEvent` type, so a key renamed here renames on both sides at once
//// and a key renamed anywhere else does not compile. Think of it as the
//// shared `interface` between two packages — the difference from TypeScript
//// being that the check reaches the bytes on disk, not only the values in
//// memory, because `read` decodes what `write` encoded and the round trip
//// is tested.
////
//// Reading is by decoding every line, not by scanning for a substring. A
//// substring pre-filter was the previous shape and it is exactly what a
//// silent rename slips past: the filter selects nothing, nothing fails, and
//// the board stops receiving a class of bug. Parsing every row of a log a
//// few hundred kilobytes long costs milliseconds once per attempt, which is
//// a good price for a channel that cannot go quiet.

import gleam/dynamic/decode
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import harness/log
import simplifile

/// The `kind` of every row the guard writes. Other rows in the same log
/// (`dispatch`, `stream`, `precompact`, ...) carry other kinds and `read`
/// passes over them.
pub const kind = "guard"

const node_key = "node"

const event_key = "event"

const tool_key = "tool"

const attempted_key = "attempted"

const denial_key = "denial"

const decision_key = "decision"

/// Why a call was refused. A closed set rather than a sentence, because
/// everything downstream has to *group* refusals, and the split that
/// matters to it is not what the worker was told but whether the identical
/// call could ever succeed — see `meaning`.
///
/// Like a TypeScript string-literal union (`"not_permitted" |
/// "build_lock_timeout" | ...`) with one difference that is the point: a
/// `case` over it must name every member, so adding one is a compile error
/// everywhere a decision depends on which it was.
pub type Denial {
  /// The command is not in the `lake` grammar. Retrying is pointless: the
  /// worker asked for something it is never allowed to have.
  NotPermitted
  /// The path is not the one file this worker may edit. Also permanent.
  NotWritable
  /// The build lock did not come free in time. Nothing was wrong with the
  /// call, and the identical call would very likely succeed later — this is
  /// the one denial that says nothing about the worker.
  BuildLockTimeout
  /// The hook body could not be read or parsed. Neither the worker's fault
  /// nor a policy refusal: something upstream sent us something we could not
  /// read, and failing closed is the safe response to that.
  Malformed
  /// A bad token, or a request to an endpoint that is not the hook. Should
  /// never come from a briefed worker at all.
  Unauthorized
  /// A slug this reader has no name for: written by a newer guard, or by
  /// one older than the slug itself. Only ever produced by `decoder`, never
  /// by the guard, and kept rather than dropped so the row still reaches
  /// the board under the slug it carried.
  Unrecognised(slug: String)
}

/// The short stable key for one denial: what the log row carries and what
/// a bug signature is built from. The spellings are on disk in every run
/// since the slug existed and must not change; `Unrecognised` carries its
/// own, so `denial_from_slug` and this are inverses.
pub fn denial_slug(d: Denial) -> String {
  case d {
    NotPermitted -> "not_permitted"
    NotWritable -> "not_writable"
    BuildLockTimeout -> "build_lock_timeout"
    Malformed -> "malformed"
    Unauthorized -> "unauthorized"
    Unrecognised(slug:) -> slug
  }
}

/// The denial a slug names, or `Unrecognised` carrying the slug.
pub fn denial_from_slug(slug: String) -> Denial {
  case slug {
    "not_permitted" -> NotPermitted
    "not_writable" -> NotWritable
    "build_lock_timeout" -> BuildLockTimeout
    "malformed" -> Malformed
    "unauthorized" -> Unauthorized
    other -> Unrecognised(slug: other)
  }
}

/// What a denial says about the call that was refused. The two have
/// opposite remedies, which is why they must never share a bug.
pub type Meaning {
  /// The call itself was refused and the same call would be refused again.
  /// The remedy is in what the worker was told or allowed — the brief or
  /// the allowlist — and the bug belongs to the guard.
  Policy
  /// Nothing was wrong with the call; a sibling worker held what it needed.
  /// The remedy is in the scheduler or the lock, and nothing about the
  /// worker, the brief or the allowlist would change it.
  Contention
}

/// Which of the two a denial is. Exhaustive on purpose: a new `Denial` has
/// to say here which side it falls on before it compiles.
pub fn meaning(d: Denial) -> Meaning {
  case d {
    BuildLockTimeout -> Contention
    NotPermitted | NotWritable | Malformed | Unauthorized | Unrecognised(_) ->
      Policy
  }
}

/// One guard decision, as it is written and as it is read back.
///
/// `node` is the holder the guard was started for; `event` is the hook that
/// fired (`PreToolUse`, `PreCompact`, ...); `tool` is the tool the worker
/// called; `attempted` is what it asked for — the command of a `Bash` call,
/// the path of a write — and is the one field the *worker* chose, so it is
/// never trusted to be short or well-behaved. `denial` is `Some` exactly
/// when the call was refused, and is the field the board is filed from.
/// `decision` is the rendered constructor, for a human reading the log, and
/// nothing keys on it.
pub type GuardEvent {
  GuardEvent(
    node: String,
    event: String,
    tool: String,
    attempted: String,
    denial: Option(Denial),
    decision: String,
  )
}

/// True for a row that refused the call, whatever the refusal meant.
pub fn is_denial(e: GuardEvent) -> Bool {
  option.is_some(e.denial)
}

/// Append one guard row to the attempt's event log.
pub fn write(l: log.Log, e: GuardEvent) -> Nil {
  log.event(l, kind, fields(e))
}

/// The row's fields, in the order they are written. `denial` is written as
/// its slug, and as `""` for a call that was allowed. Public so a test can
/// look at the encoding without a file in between.
pub fn fields(e: GuardEvent) -> List(#(String, json.Json)) {
  let denial = case e.denial {
    Some(d) -> denial_slug(d)
    None -> ""
  }
  [
    #(node_key, json.string(e.node)),
    #(event_key, json.string(e.event)),
    #(tool_key, json.string(e.tool)),
    #(attempted_key, json.string(e.attempted)),
    #(denial_key, json.string(denial)),
    #(decision_key, json.string(e.decision)),
  ]
}

/// Every guard row in the attempt's event log that names `node`, in the
/// order written. A missing log reads as empty; a line that does not parse
/// is skipped.
///
/// The `node` filter is belt and braces rather than what makes a row
/// attributable: `run` gives every attempt its own
/// `runs/<run-id>/<node>-<n>/events.jsonl` and hands that same log to that
/// attempt's guard, so the directory already says whose row it was. The
/// filter keeps this correct if a guard is ever pointed at a log it shares.
pub fn read(l: log.Log, node: String) -> List(GuardEvent) {
  case simplifile.read(l.dir <> "/events.jsonl") {
    Error(_) -> []
    Ok(text) ->
      text
      |> string.split("\n")
      |> list.filter_map(parse)
      |> list.filter(fn(e) { e.node == node })
  }
}

/// A row of any kind: `Some` for a guard row, `None` for every other kind
/// the log holds.
fn row_decoder() -> decode.Decoder(Option(GuardEvent)) {
  use k <- decode.field(log.kind_key, decode.string)
  case k == kind {
    True -> decode.map(decoder(), Some)
    False -> decode.success(None)
  }
}

/// Reads the fields `fields` writes.
///
/// `denial` and `attempted` are optional so that a log written by an older
/// guard still yields bugs rather than silently yielding none. A row with
/// no `denial` field at all was written before the slug existed, and the
/// only evidence it holds is the rendered constructor: one that renders as
/// a `Deny` becomes `Unrecognised("unknown")`, a worse signature than the
/// real one and a much better one than no bug. A row that *has* the field
/// is believed as written, empty or not — the rendering is never consulted
/// when the slug is present, so a renamed constructor cannot change what
/// is filed.
pub fn decoder() -> decode.Decoder(GuardEvent) {
  use node <- decode.field(node_key, decode.string)
  use event <- decode.optional_field(event_key, "", decode.string)
  use tool <- decode.field(tool_key, decode.string)
  use attempted <- decode.optional_field(attempted_key, "", decode.string)
  use slug <- decode.optional_field(
    denial_key,
    None,
    decode.map(decode.string, Some),
  )
  use decision <- decode.field(decision_key, decode.string)
  let denial = case slug {
    Some("") -> None
    Some(slug) -> Some(denial_from_slug(slug))
    None ->
      case string.starts_with(decision, "Deny(") {
        True -> Some(Unrecognised(slug: "unknown"))
        False -> None
      }
  }
  decode.success(GuardEvent(
    node:,
    event:,
    tool:,
    attempted:,
    denial:,
    decision:,
  ))
}

/// Decode one line of `events.jsonl` as a guard row. `Error` for a line
/// that is not one, whether another kind or not JSON at all.
pub fn parse(line: String) -> Result(GuardEvent, Nil) {
  case json.parse(line, row_decoder()) {
    Ok(Some(e)) -> Ok(e)
    _ -> Error(Nil)
  }
}
