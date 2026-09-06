import gleam/list
import gleam/option.{None, Some}
import gleam/string
import harness/bugs.{type Bug, Board, Bug}

fn bug(id: String, status: bugs.BugStatus) -> Bug {
  Bug(
    id:,
    title: "t " <> id,
    area: bugs.Guard,
    severity: bugs.Friction,
    body: "b " <> id,
    reported_by: "Vesper",
    source: bugs.Worker,
    node: Some("evolve_left_edge"),
    run: Some("20260906T013237Z"),
    session_id: Some("abc"),
    signature: None,
    filed: "2026-09-06T02:00:00Z",
    occurrences: 1,
    status:,
    resolution: None,
    fixed: None,
  )
}

pub fn round_trip_json_test() {
  let board =
    Board([
      bug("a", bugs.Open),
      Bug(
        ..bug("b", bugs.Fixed),
        area: bugs.Hooks,
        severity: bugs.Blocks,
        source: bugs.Harness,
        signature: Some("guard:Bash"),
        occurrences: 4,
        resolution: Some("widened the allowlist, 1a2b3c4"),
        fixed: Some("2026-09-06T03:00:00Z"),
      ),
      Bug(
        ..bug("c", bugs.Wontfix),
        area: bugs.Docs,
        severity: bugs.Papercut,
        source: bugs.Hand,
        node: None,
        run: None,
        session_id: None,
      ),
    ])
  assert bugs.decode(bugs.encode(board)) == Ok(board)
}

pub fn unknown_area_fails_the_decode_test() {
  let text =
    "{\"bugs\":[{\"id\":\"a\",\"title\":\"t\",\"area\":\"grud\",\"severity\":\"friction\",\"body\":\"b\",\"reported_by\":\"Keel\",\"source\":\"hand\",\"node\":null,\"run\":null,\"session_id\":null,\"signature\":null,\"filed\":\"2026-09-06T02:00:00Z\",\"occurrences\":1,\"status\":\"open\",\"resolution\":null,\"fixed\":null}]}"
  let assert Error(reason) = bugs.decode(text)
  assert string.contains(does: reason, contain: "Area")
}

pub fn unknown_status_fails_the_decode_test() {
  let text =
    "{\"bugs\":[{\"id\":\"a\",\"title\":\"t\",\"area\":\"guard\",\"severity\":\"friction\",\"body\":\"b\",\"reported_by\":\"Keel\",\"source\":\"hand\",\"node\":null,\"run\":null,\"session_id\":null,\"signature\":null,\"filed\":\"2026-09-06T02:00:00Z\",\"occurrences\":1,\"status\":\"closed\",\"resolution\":null,\"fixed\":null}]}"
  let assert Error(reason) = bugs.decode(text)
  assert string.contains(does: reason, contain: "BugStatus")
}

pub fn empty_board_round_trips_test() {
  assert bugs.decode(bugs.encode(Board([]))) == Ok(Board([]))
}

/// Every `Severity`, both directions. Cheap insurance against a string
/// mapping drifting out of sync with the type as variants are added.
pub fn every_severity_round_trips_test() {
  [bugs.Blocks, bugs.Friction, bugs.Papercut]
  |> list.each(fn(severity) {
    assert bugs.severity_from_string(bugs.severity_to_string(severity))
      == Ok(severity)
  })
}

/// Every `Area`, both directions. `BoardArea` is the one variant whose
/// constructor name deliberately differs from its JSON string
/// (`"board"`, because `Board` was already the board type's name), so it is
/// exactly the mapping a typo could hide in without failing any other test.
pub fn every_area_round_trips_test() {
  [
    bugs.Guard, bugs.Dispatch, bugs.Verify, bugs.Brief, bugs.BoardArea,
    bugs.Hooks, bugs.Docs, bugs.Other,
  ]
  |> list.each(fn(area) {
    assert bugs.area_from_string(bugs.area_to_string(area)) == Ok(area)
  })
}

/// Every `BugStatus`, both directions.
pub fn every_status_round_trips_test() {
  [bugs.Open, bugs.Claimed, bugs.Fixed, bugs.Wontfix]
  |> list.each(fn(status) {
    assert bugs.status_from_string(bugs.status_to_string(status)) == Ok(status)
  })
}

/// Every `Source`, both directions.
pub fn every_source_round_trips_test() {
  [bugs.Worker, bugs.Harness, bugs.Hand]
  |> list.each(fn(source) {
    assert bugs.source_from_string(bugs.source_to_string(source)) == Ok(source)
  })
}

fn auto_bug(title: String, signature: String, filed: String) -> Bug {
  Bug(
    ..bug("", bugs.Open),
    title:,
    source: bugs.Harness,
    signature: Some(signature),
    filed:,
  )
}

pub fn append_slugs_an_id_from_the_title_test() {
  let board =
    bugs.append(
      Board([]),
      Bug(..bug("", bugs.Open), title: "Guard denies lake env lean!"),
    )
  let assert [b] = board.bugs
  assert b.id == "guard-denies-lake-env-lean"
}

pub fn append_suffixes_a_colliding_id_test() {
  let board =
    Board([])
    |> bugs.append(Bug(..bug("", bugs.Open), title: "Same title"))
    |> bugs.append(Bug(..bug("", bugs.Open), title: "Same title"))
    |> bugs.append(Bug(..bug("", bugs.Open), title: "Same title"))
  assert list.map(board.bugs, fn(b) { b.id })
    == ["same-title", "same-title-2", "same-title-3"]
}

pub fn append_dedupes_a_signature_that_matches_an_open_bug_test() {
  let board =
    Board([])
    |> bugs.append(auto_bug("Denied", "guard:Bash", "2026-09-06T02:00:00Z"))
    |> bugs.append(auto_bug("Denied", "guard:Bash", "2026-09-06T02:05:00Z"))
  let assert [b] = board.bugs
  assert b.occurrences == 2
  assert b.filed == "2026-09-06T02:05:00Z"
}

pub fn append_does_not_dedupe_against_a_fixed_bug_test() {
  let board =
    Board([])
    |> bugs.append(auto_bug("Denied", "guard:Bash", "2026-09-06T02:00:00Z"))
  let assert [first] = board.bugs
  let board = bugs.update(board, Bug(..first, status: bugs.Fixed))
  let board =
    bugs.append(board, auto_bug("Denied", "guard:Bash", "2026-09-06T09:00:00Z"))
  assert list.length(board.bugs) == 2
}

pub fn append_never_dedupes_an_unsigned_bug_test() {
  let board =
    Board([])
    |> bugs.append(Bug(..bug("", bugs.Open), title: "Same friction"))
    |> bugs.append(Bug(..bug("", bugs.Open), title: "Same friction"))
  assert list.length(board.bugs) == 2
}

pub fn open_bugs_is_newest_first_and_excludes_settled_test() {
  let board =
    Board([
      Bug(..bug("old", bugs.Open), filed: "2026-09-06T01:00:00Z"),
      Bug(..bug("done", bugs.Fixed), filed: "2026-09-06T02:00:00Z"),
      Bug(..bug("new", bugs.Claimed), filed: "2026-09-06T03:00:00Z"),
      Bug(..bug("nope", bugs.Wontfix), filed: "2026-09-06T04:00:00Z"),
    ])
  assert list.map(bugs.open_bugs(board), fn(b) { b.id }) == ["new", "old"]
}

pub fn filtered_narrows_by_area_and_severity_test() {
  let board =
    Board([
      Bug(..bug("g", bugs.Open), area: bugs.Guard, severity: bugs.Blocks),
      Bug(..bug("d", bugs.Open), area: bugs.Dispatch, severity: bugs.Blocks),
      Bug(..bug("g2", bugs.Open), area: bugs.Guard, severity: bugs.Papercut),
    ])
  assert list.map(bugs.filtered(board, Some(bugs.Guard), None, False), fn(b) {
      b.id
    })
    == ["g", "g2"]
  assert list.map(bugs.filtered(board, None, Some(bugs.Blocks), False), fn(b) {
      b.id
    })
    == ["g", "d"]
}
