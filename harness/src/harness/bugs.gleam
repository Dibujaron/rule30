//// The bug board: things wrong with the project's own machinery, filed by
//// whoever hit them and worked by Keel. Persisted as JSON beside the DAG,
//// because both are boards and `blueprint/` is where the work lives.
////
//// Provenance is never taken from the agent that reports it. `reported_by`,
//// `source`, `node`, `run`, `session_id` and `filed` are stamped by the
//// dispatcher from what it already knows, so a worker cannot file under
//// another identity or claim a node it was not dispatched to.

import gleam/dynamic/decode
import gleam/json
import gleam/option.{type Option}
import gleam/result
import gleam/string
import simplifile

/// How badly this got in someone's way. The reporter's claim, not a verdict:
/// Keel may correct it when working the bug.
pub type Severity {
  /// A worker could not finish.
  Blocks
  /// It cost turns, or produced a wrong belief.
  Friction
  /// Merely ugly.
  Papercut
}

/// Which part of the machinery is at fault. A closed set, because an open
/// string field becomes twelve spellings of "the guard" inside a week and
/// the area filter is how the board gets read.
pub type Area {
  Guard
  Dispatch
  Verify
  Brief
  BoardArea
  Hooks
  Docs
  /// The ingest escape hatch, for a reported area that did not parse. Never
  /// auto-filed: the harness always knows its own area.
  Other
}

/// Where a bug stands. Deliberately borrowing `dag.Status`'s vocabulary,
/// `claimed` included, so the one board idiom in the project transfers.
pub type BugStatus {
  Open
  Claimed
  Fixed
  Wontfix
}

/// Which filing path put this on the board: a prover under the guard, the
/// machine detecting its own failure, or someone writing it directly.
/// `reported_by` says who; this says only whether a dispatcher stamped it.
pub type Source {
  Worker
  Harness
  Hand
}

/// One thing wrong with the machinery.
pub type Bug {
  Bug(
    id: String,
    title: String,
    area: Area,
    severity: Severity,
    body: String,
    reported_by: String,
    source: Source,
    node: Option(String),
    run: Option(String),
    session_id: Option(String),
    /// Set only on auto-filed bugs: the area plus the denied tool or failing
    /// stage. Two auto-files with one signature are one bug seen twice; two
    /// agents describing the same friction in their own words are two pieces
    /// of evidence, so those carry `None` and never dedupe.
    signature: Option(String),
    filed: String,
    occurrences: Int,
    status: BugStatus,
    resolution: Option(String),
    fixed: Option(String),
  )
}

/// The full board.
pub type Board {
  Board(bugs: List(Bug))
}

/// Parse a `Board` from its JSON text representation.
pub fn decode(text: String) -> Result(Board, String) {
  json.parse(from: text, using: board_decoder())
  |> result.map_error(fn(e) { string.inspect(e) })
}

/// Render a `Board` to its JSON text representation.
pub fn encode(board: Board) -> String {
  board_to_json(board) |> json.to_string
}

/// Read and decode a `Board` from a file. A missing file is an empty board:
/// the first bug ever filed should not need the file to exist first.
pub fn load(path: String) -> Result(Board, String) {
  case simplifile.read(path) {
    Error(simplifile.Enoent) -> Ok(Board([]))
    Error(e) -> Error(simplifile.describe_error(e))
    Ok(text) -> decode(text)
  }
}

/// Encode and write a `Board` to a file, one trailing newline.
///
/// Re-encodes from a decoded value rather than patching text, so a field the
/// harness does not understand cannot survive a write half-mangled.
pub fn save(board: Board, path: String) -> Result(Nil, String) {
  simplifile.write(path, encode(board) <> "\n")
  |> result.map_error(fn(e) { simplifile.describe_error(e) })
}

/// Render a `Severity` to its JSON string form.
pub fn severity_to_string(s: Severity) -> String {
  case s {
    Blocks -> "blocks"
    Friction -> "friction"
    Papercut -> "papercut"
  }
}

/// Parse a `Severity` from its JSON string form.
pub fn severity_from_string(s: String) -> Result(Severity, Nil) {
  case s {
    "blocks" -> Ok(Blocks)
    "friction" -> Ok(Friction)
    "papercut" -> Ok(Papercut)
    _ -> Error(Nil)
  }
}

/// Render an `Area` to its JSON string form.
pub fn area_to_string(a: Area) -> String {
  case a {
    Guard -> "guard"
    Dispatch -> "dispatch"
    Verify -> "verify"
    Brief -> "brief"
    BoardArea -> "board"
    Hooks -> "hooks"
    Docs -> "docs"
    Other -> "other"
  }
}

/// Parse an `Area` from its JSON string form.
pub fn area_from_string(a: String) -> Result(Area, Nil) {
  case a {
    "guard" -> Ok(Guard)
    "dispatch" -> Ok(Dispatch)
    "verify" -> Ok(Verify)
    "brief" -> Ok(Brief)
    "board" -> Ok(BoardArea)
    "hooks" -> Ok(Hooks)
    "docs" -> Ok(Docs)
    "other" -> Ok(Other)
    _ -> Error(Nil)
  }
}

/// Render a `BugStatus` to its JSON string form.
pub fn status_to_string(s: BugStatus) -> String {
  case s {
    Open -> "open"
    Claimed -> "claimed"
    Fixed -> "fixed"
    Wontfix -> "wontfix"
  }
}

/// Parse a `BugStatus` from its JSON string form.
pub fn status_from_string(s: String) -> Result(BugStatus, Nil) {
  case s {
    "open" -> Ok(Open)
    "claimed" -> Ok(Claimed)
    "fixed" -> Ok(Fixed)
    "wontfix" -> Ok(Wontfix)
    _ -> Error(Nil)
  }
}

/// Render a `Source` to its JSON string form.
pub fn source_to_string(s: Source) -> String {
  case s {
    Worker -> "worker"
    Harness -> "harness"
    Hand -> "hand"
  }
}

/// Parse a `Source` from its JSON string form.
pub fn source_from_string(s: String) -> Result(Source, Nil) {
  case s {
    "worker" -> Ok(Worker)
    "harness" -> Ok(Harness)
    "hand" -> Ok(Hand)
    _ -> Error(Nil)
  }
}

fn severity_decoder() -> decode.Decoder(Severity) {
  decode.string
  |> decode.then(fn(s) {
    case severity_from_string(s) {
      Ok(v) -> decode.success(v)
      Error(Nil) -> decode.failure(Friction, "Severity")
    }
  })
}

fn area_decoder() -> decode.Decoder(Area) {
  decode.string
  |> decode.then(fn(s) {
    case area_from_string(s) {
      Ok(v) -> decode.success(v)
      Error(Nil) -> decode.failure(Other, "Area")
    }
  })
}

fn status_decoder() -> decode.Decoder(BugStatus) {
  decode.string
  |> decode.then(fn(s) {
    case status_from_string(s) {
      Ok(v) -> decode.success(v)
      Error(Nil) -> decode.failure(Open, "BugStatus")
    }
  })
}

fn source_decoder() -> decode.Decoder(Source) {
  decode.string
  |> decode.then(fn(s) {
    case source_from_string(s) {
      Ok(v) -> decode.success(v)
      Error(Nil) -> decode.failure(Hand, "Source")
    }
  })
}

fn bug_decoder() -> decode.Decoder(Bug) {
  use id <- decode.field("id", decode.string)
  use title <- decode.field("title", decode.string)
  use area <- decode.field("area", area_decoder())
  use severity <- decode.field("severity", severity_decoder())
  use body <- decode.field("body", decode.string)
  use reported_by <- decode.field("reported_by", decode.string)
  use source <- decode.field("source", source_decoder())
  use node <- decode.field("node", decode.optional(decode.string))
  use run <- decode.field("run", decode.optional(decode.string))
  use session_id <- decode.field("session_id", decode.optional(decode.string))
  use signature <- decode.field("signature", decode.optional(decode.string))
  use filed <- decode.field("filed", decode.string)
  use occurrences <- decode.field("occurrences", decode.int)
  use status <- decode.field("status", status_decoder())
  use resolution <- decode.field("resolution", decode.optional(decode.string))
  use fixed <- decode.field("fixed", decode.optional(decode.string))
  decode.success(Bug(
    id:,
    title:,
    area:,
    severity:,
    body:,
    reported_by:,
    source:,
    node:,
    run:,
    session_id:,
    signature:,
    filed:,
    occurrences:,
    status:,
    resolution:,
    fixed:,
  ))
}

fn board_decoder() -> decode.Decoder(Board) {
  use bugs <- decode.field("bugs", decode.list(bug_decoder()))
  decode.success(Board(bugs:))
}

fn bug_to_json(bug: Bug) -> json.Json {
  json.object([
    #("id", json.string(bug.id)),
    #("title", json.string(bug.title)),
    #("area", json.string(area_to_string(bug.area))),
    #("severity", json.string(severity_to_string(bug.severity))),
    #("body", json.string(bug.body)),
    #("reported_by", json.string(bug.reported_by)),
    #("source", json.string(source_to_string(bug.source))),
    #("node", json.nullable(bug.node, json.string)),
    #("run", json.nullable(bug.run, json.string)),
    #("session_id", json.nullable(bug.session_id, json.string)),
    #("signature", json.nullable(bug.signature, json.string)),
    #("filed", json.string(bug.filed)),
    #("occurrences", json.int(bug.occurrences)),
    #("status", json.string(status_to_string(bug.status))),
    #("resolution", json.nullable(bug.resolution, json.string)),
    #("fixed", json.nullable(bug.fixed, json.string)),
  ])
}

fn board_to_json(board: Board) -> json.Json {
  json.object([#("bugs", json.array(board.bugs, bug_to_json))])
}
