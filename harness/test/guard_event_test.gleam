import gleam/list
import gleam/option.{None, Some}
import harness/guard_event.{
  BuildLockTimeout, GuardEvent, Malformed, NotPermitted, NotWritable,
  Unauthorized, Unrecognised,
}
import harness/log
import simplifile

/// What `write` puts on disk, `read` gets back unchanged — including an
/// `attempted` that carries quotes, a newline escape and the literal text
/// of another field, since that value is the worker's to choose.
pub fn a_row_survives_the_round_trip_test() {
  let dir = "build/test-runs/guard-event-round-trip"
  let _ = simplifile.delete(dir)
  let assert Ok(l) = log.open(dir, "run")
  let e =
    GuardEvent(
      node: "probe_one",
      event: "PreToolUse",
      tool: "Bash",
      attempted: "lake build \"x\"\\n,\"denial\":\"build_lock_timeout\"",
      denial: Some(NotPermitted),
      decision: "Deny(NotPermitted, \"grammar\")",
    )
  guard_event.write(l, e)
  assert guard_event.read(l, "probe_one") == [e]
  assert guard_event.read(l, "probe_two") == []
  let assert Ok(_) = simplifile.delete(dir)
}

/// Rows of other kinds in the same log are passed over, and a line that is
/// not JSON at all is skipped rather than ending the read.
pub fn other_kinds_and_junk_are_passed_over_test() {
  let dir = "build/test-runs/guard-event-other-kinds"
  let _ = simplifile.delete(dir)
  let assert Ok(l) = log.open(dir, "run")
  log.event(l, "dispatch", [])
  log.raw(l, "stream", "{\"type\":\"assistant\"}")
  let assert Ok(_) =
    simplifile.append(to: l.dir <> "/events.jsonl", contents: "not json\n")
  let e =
    GuardEvent(
      node: "probe_one",
      event: "PreToolUse",
      tool: "Edit",
      attempted: "X.lean",
      denial: None,
      decision: "Allow",
    )
  guard_event.write(l, e)
  assert guard_event.read(l, "probe_one") == [e]
  assert !guard_event.is_denial(e)
  assert guard_event.parse("not json") == Error(Nil)
  let assert Ok(_) = simplifile.delete(dir)
}

/// The slugs are on disk in every run since they existed and are what a bug
/// signature is built from, so their spellings are pinned here; and every
/// denial reads back as itself, including one this reader has no name for.
pub fn every_denial_has_a_slug_that_reads_back_as_itself_test() {
  assert guard_event.denial_slug(NotPermitted) == "not_permitted"
  assert guard_event.denial_slug(BuildLockTimeout) == "build_lock_timeout"
  assert guard_event.denial_slug(NotWritable) == "not_writable"
  let all = [
    NotPermitted,
    NotWritable,
    BuildLockTimeout,
    Malformed,
    Unauthorized,
    Unrecognised("from_a_newer_guard"),
  ]
  list.each(all, fn(d) {
    assert guard_event.denial_from_slug(guard_event.denial_slug(d)) == d
  })
}

/// The one split the board acts on. A lock timeout is contention — a
/// sibling held the lock and the call was legal — and everything else,
/// including a slug this reader does not know, is a refusal of the call.
pub fn a_lock_timeout_is_the_only_contention_test() {
  assert guard_event.meaning(BuildLockTimeout) == guard_event.Contention
  assert guard_event.meaning(NotPermitted) == guard_event.Policy
  assert guard_event.meaning(NotWritable) == guard_event.Policy
  assert guard_event.meaning(Malformed) == guard_event.Policy
  assert guard_event.meaning(Unauthorized) == guard_event.Policy
  assert guard_event.meaning(Unrecognised("unknown")) == guard_event.Policy
}
