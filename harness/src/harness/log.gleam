//// One run's on-disk record: an append-only event log and a human journal.
////
//// `open` creates `<runs_root>/<run_id>/` and touches `events.jsonl` and
//// `journal.md`. `event` and `raw` append one JSON line each to
//// `events.jsonl`; `journal` appends one Markdown section to `journal.md`.
//// Append failures are not fatal — they are printed to stderr and
//// swallowed, since a broken log should not take down a run.

import gleam/io
import gleam/json
import gleam/result
import simplifile

/// A run's log directory and id.
pub type Log {
  Log(dir: String, run_id: String)
}

/// A fresh run id shaped like `"20260905T211500Z"`.
pub fn new_run_id() -> String {
  run_id_ffi()
}

/// Create `<runs_root>/<run_id>/` and touch `events.jsonl` and `journal.md`.
pub fn open(runs_root: String, run_id: String) -> Result(Log, String) {
  let dir = runs_root <> "/" <> run_id
  use _ <- result.try(
    simplifile.create_directory_all(dir)
    |> result.map_error(simplifile.describe_error),
  )
  use _ <- result.try(touch(dir <> "/events.jsonl"))
  use _ <- result.try(touch(dir <> "/journal.md"))
  Ok(Log(dir:, run_id:))
}

fn touch(path: String) -> Result(Nil, String) {
  case simplifile.append(to: path, contents: "") {
    Ok(_) -> Ok(Nil)
    Error(err) -> Error(simplifile.describe_error(err))
  }
}

/// Append one structured event: `{"ts": now_iso(), "kind": kind, ...fields}`.
pub fn event(
  log: Log,
  kind: String,
  fields: List(#(String, json.Json)),
) -> Nil {
  let obj =
    json.object([
      #("ts", json.string(now_iso())),
      #("kind", json.string(kind)),
      ..fields
    ])
  append_line(log, json.to_string(obj))
}

/// Append one raw event, storing `raw_line` as a JSON string without
/// re-parsing it.
pub fn raw(log: Log, kind: String, raw_line: String) -> Nil {
  let obj =
    json.object([
      #("ts", json.string(now_iso())),
      #("kind", json.string(kind)),
      #("raw", json.string(raw_line)),
    ])
  append_line(log, json.to_string(obj))
}

fn append_line(log: Log, line: String) -> Nil {
  case
    simplifile.append(to: log.dir <> "/events.jsonl", contents: line <> "\n")
  {
    Ok(_) -> Nil
    Error(err) -> {
      io.println_error("harness/log: " <> simplifile.describe_error(err))
      Nil
    }
  }
}

/// Append one journal section:
///
/// ```
/// ## <identity> on <node_id> — <now_iso()>
///
/// <text>
///
/// ```
pub fn journal(
  log: Log,
  identity: String,
  node_id: String,
  text: String,
) -> Nil {
  let section =
    "## "
    <> identity
    <> " on "
    <> node_id
    <> " — "
    <> now_iso()
    <> "\n\n"
    <> text
    <> "\n\n"
  case simplifile.append(to: log.dir <> "/journal.md", contents: section) {
    Ok(_) -> Nil
    Error(err) -> {
      io.println_error("harness/log: " <> simplifile.describe_error(err))
      Nil
    }
  }
}

/// The current UTC time, shaped like `"2026-09-05T21:15:00Z"`.
pub fn now_iso() -> String {
  now_iso_ffi()
}

/// A monotonic millisecond counter. Not a wall clock — the origin is
/// arbitrary — but the right thing to subtract when a budget has to hold
/// across several waits.
pub fn mono_ms() -> Int {
  mono_ms_ffi()
}

@external(erlang, "harness_ffi", "now_iso")
fn now_iso_ffi() -> String

@external(erlang, "harness_ffi", "mono_ms")
fn mono_ms_ffi() -> Int

@external(erlang, "harness_ffi", "run_id")
fn run_id_ffi() -> String
