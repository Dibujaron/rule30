import gleam/json
import gleam/string
import harness/log
import simplifile

pub fn event_and_journal_append_test() {
  let root = "build/test-runs"
  let assert Ok(l) = log.open(root, "t1")
  log.event(l, "dispatch", [#("node", json.string("a"))])
  log.raw(l, "stream", "{\"type\":\"assistant\"}")
  log.journal(l, "Noether", "a", "First entry.")
  let assert Ok(events) = simplifile.read(l.dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"dispatch\"")
  assert string.contains(events, "\"node\":\"a\"")
  assert string.contains(events, "\"raw\":\"{\\\"type\\\":\\\"assistant\\\"}\"")
  let assert Ok(j) = simplifile.read(l.dir <> "/journal.md")
  assert string.contains(j, "## Noether on a")
  assert string.contains(j, "First entry.")
  let assert Ok(_) = simplifile.delete(root)
}

pub fn summary_is_written_beside_the_journal_test() {
  let root = "build/test-runs"
  let assert Ok(l) = log.open(root, "t2")
  log.summary(
    l,
    "node      a
outcome   proved",
  )
  let assert Ok(text) = simplifile.read(l.dir <> "/summary.txt")
  assert string.contains(text, "outcome   proved")
  let assert Ok(_) = simplifile.delete(root)
}

pub fn now_iso_shape_test() {
  let s = log.now_iso()
  assert string.length(s) == 20
  assert string.ends_with(s, "Z")
}

pub fn new_run_id_shape_test() {
  let s = log.new_run_id()
  assert string.length(s) == 16
  assert string.contains(s, "T")
  assert string.ends_with(s, "Z")
}

pub fn seconds_between_reads_iso_z_times_test() {
  // Pinned at both ends: this is arithmetic, not a clock.
  assert log.seconds_between(
      from: "2026-09-07T03:00:00Z",
      to: "2026-09-07T03:00:00Z",
    )
    == Ok(0)
  assert log.seconds_between(
      from: "2026-09-07T03:00:00Z",
      to: "2026-09-07T05:07:30Z",
    )
    == Ok(7650)
  // Across a month end, a leap day and a year end — the days-from-civil
  // formula has to get all three right or the age of an overnight claim
  // is wrong exactly when someone is reading it at 2am.
  assert log.seconds_between(
      from: "2028-02-28T00:00:00Z",
      to: "2028-03-01T00:00:00Z",
    )
    == Ok(2 * 86_400)
  assert log.seconds_between(
      from: "2025-12-31T23:59:00Z",
      to: "2026-01-01T00:01:00Z",
    )
    == Ok(120)
  // The epoch itself, as the one absolute anchor.
  assert log.seconds_between(
      from: "1970-01-01T00:00:00Z",
      to: "2026-09-07T03:00:00Z",
    )
    == Ok(1_788_750_000)
  // Backwards is negative, not an error; garbage is an error, not a number.
  assert log.seconds_between(
      from: "2026-09-07T03:01:00Z",
      to: "2026-09-07T03:00:00Z",
    )
    == Ok(-60)
  assert log.seconds_between(from: "yesterday", to: "2026-09-07T03:00:00Z")
    == Error(Nil)
  assert log.seconds_between(
      from: "2026-13-07T03:00:00Z",
      to: "2026-09-07T03:00:00Z",
    )
    == Error(Nil)
}

pub fn age_text_reads_like_a_status_line_test() {
  let now = "2026-09-07T05:07:30Z"
  assert log.age_text(then: "2026-09-07T04:55:30Z", now:) == "12m ago"
  assert log.age_text(then: "2026-09-07T02:00:30Z", now:) == "3h 07m ago"
  assert log.age_text(then: "2026-09-05T00:00:00Z", now:) == "2d 05h ago"
  assert log.age_text(then: "t0", now:) == "age unknown"
}
