import harness/guard_event.{GuardEvent}
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
      denial: "not_permitted",
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
      denial: "",
      decision: "Allow",
    )
  guard_event.write(l, e)
  assert guard_event.read(l, "probe_one") == [e]
  assert guard_event.parse("not json") == Error(Nil)
  let assert Ok(_) = simplifile.delete(dir)
}
