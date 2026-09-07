//// One run's on-disk record: an append-only event log and a human journal.
////
//// `open` creates `<runs_root>/<run_id>/` and touches `events.jsonl` and
//// `journal.md`. `event` and `raw` append one JSON line each to
//// `events.jsonl`; `journal` appends one Markdown section to `journal.md`;
//// `summary` writes the attempt's closing summary to `summary.txt`.
//// Append failures are not fatal — they are printed to stderr and
//// swallowed, since a broken log should not take down a run.

import gleam/int
import gleam/io
import gleam/json
import gleam/result
import gleam/string
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

/// The key every row carries naming what wrote it. A reader that selects
/// rows by kind (`guard_event.read`) keys on this name rather than on its
/// own copy of the string, so the two cannot drift apart.
pub const kind_key = "kind"

/// Append one structured event: `{"ts": now_iso(), "kind": kind, ...fields}`.
pub fn event(
  log: Log,
  kind: String,
  fields: List(#(String, json.Json)),
) -> Nil {
  let obj =
    json.object([
      #("ts", json.string(now_iso())),
      #(kind_key, json.string(kind)),
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
      #(kind_key, json.string(kind)),
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

/// Write the attempt's closing summary to `summary.txt` beside the journal,
/// so a run launched detached keeps its cost and verdict even when nobody
/// captured the dispatcher's stdout.
pub fn summary(log: Log, text: String) -> Nil {
  case simplifile.write(to: log.dir <> "/summary.txt", contents: text <> "
") {
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

/// Whole seconds from one `now_iso`-shaped time (`2026-09-05T21:15:00Z`) to
/// another, negative if `to` is the earlier one. `Error` for anything that
/// is not that exact shape — a claim stamped by hand in some other format
/// gets "age unknown" from `age_text`, not a plausible number.
///
/// Pure so a test can pin both ends: the clock stays in the caller.
pub fn seconds_between(from from: String, to to: String) -> Result(Int, Nil) {
  use a <- result.try(epoch_seconds(from))
  use b <- result.try(epoch_seconds(to))
  Ok(b - a)
}

/// `seconds_between(then, now)` rendered for a status line: `12m ago`,
/// `3h 07m ago`, `2d 05h ago`; `age unknown` when either end does not parse.
pub fn age_text(then then: String, now now: String) -> String {
  case seconds_between(from: then, to: now) {
    Error(Nil) -> "age unknown"
    Ok(s) -> {
      let m = s / 60
      let pad = fn(n: Int) { string.pad_start(int.to_string(n), 2, "0") }
      case m {
        _ if m >= 1440 ->
          int.to_string(m / 1440) <> "d " <> pad({ m % 1440 } / 60) <> "h ago"
        _ if m >= 60 -> int.to_string(m / 60) <> "h " <> pad(m % 60) <> "m ago"
        _ -> int.to_string(m) <> "m ago"
      }
    }
  }
}

/// Seconds since 1970-01-01T00:00:00Z for an ISO-8601 `Z` time, by the
/// days-from-civil formula (Howard Hinnant's), which needs no calendar
/// library and no clock.
fn epoch_seconds(iso: String) -> Result(Int, Nil) {
  case string.split(iso, "T") {
    [date, time] ->
      case string.split(date, "-"), string.split(time, ":") {
        [y, mo, d], [h, mi, s] -> {
          use y <- result.try(int.parse(y))
          use mo <- result.try(int.parse(mo))
          use d <- result.try(int.parse(d))
          use h <- result.try(int.parse(h))
          use mi <- result.try(int.parse(mi))
          use s <- result.try(int.parse(string.replace(s, "Z", "")))
          use _ <- result.try(case mo >= 1 && mo <= 12 && d >= 1 && d <= 31 {
            True -> Ok(Nil)
            False -> Error(Nil)
          })
          let y = case mo <= 2 {
            True -> y - 1
            False -> y
          }
          let era = y / 400
          let yoe = y - era * 400
          let mp = case mo > 2 {
            True -> mo - 3
            False -> mo + 9
          }
          let doy = { 153 * mp + 2 } / 5 + d - 1
          let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy
          let days = era * 146_097 + doe - 719_468
          Ok(days * 86_400 + h * 3600 + mi * 60 + s)
        }
        _, _ -> Error(Nil)
      }
    _ -> Error(Nil)
  }
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
