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
