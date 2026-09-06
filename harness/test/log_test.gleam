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
