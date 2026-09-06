import gleam/int
import gleam/list
import gleam/option.{None, Some}
import gleam/result
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

/// `--all` is the only thing that flips `filtered`'s `Bool`, so this is the
/// test standing in for that flag: without it, a future inversion of the
/// bool's sense would pass every other test here (none of which mixes a
/// settled bug into a `filtered` call) and only show up against the real
/// board.
pub fn filtered_all_flag_includes_settled_bugs_test() {
  let board =
    Board([
      Bug(..bug("live", bugs.Open), filed: "2026-09-06T01:00:00Z"),
      Bug(..bug("settled", bugs.Fixed), filed: "2026-09-06T02:00:00Z"),
    ])
  assert list.map(bugs.filtered(board, None, None, False), fn(b) { b.id })
    == ["live"]
  assert list.map(bugs.filtered(board, None, None, True), fn(b) { b.id })
    == ["settled", "live"]
}

/// A regression guard on the dedupe boundary at scale: forty appends of one
/// signature, in one fold the way a run's forty denials would arrive, still
/// leave one row rather than one row per append somehow surviving at a
/// larger n than the two-append test above exercises.
pub fn a_run_of_identical_denials_files_one_bug_test() {
  let board =
    list.repeat(Nil, 40)
    |> list.index_map(fn(_, i) { i + 1 })
    |> list.fold(Board([]), fn(board, n) {
      bugs.append(
        board,
        auto_bug(
          "Guard denied Bash",
          "guard:Bash",
          "2026-09-06T02:00:" <> pad2(n),
        ),
      )
    })
  assert list.length(board.bugs) == 1
  let assert [b] = board.bugs
  assert b.occurrences == 40
}

fn pad2(n: Int) -> String {
  string.pad_start(int.to_string(n), 2, "0")
}

// --- a board that will not decode ------------------------------------------

/// One row missing a field must be named, by index and by id.
///
/// The failure this replaces reported the nine fields it wanted and not the
/// row that lacked them, which on a board of thirty entries is a bisect.
pub fn a_malformed_row_is_named_by_index_and_id_test() {
  let text =
    "{\"bugs\":["
    <> good_row("first")
    <> ",{\"id\":\"broken\",\"title\":\"t\"},"
    <> good_row("third")
    <> "]}"
  let assert Error(reason) = bugs.decode(text)
  assert string.contains(reason, "entry 1")
  assert string.contains(reason, "\"broken\"")
  // The rows that are fine are not named, or the message is a haystack too.
  assert !string.contains(reason, "\"first\"")
  assert !string.contains(reason, "\"third\"")
}

/// A row so broken it has no readable id still gets located by index.
pub fn a_row_without_an_id_is_still_located_test() {
  let text = "{\"bugs\":[" <> good_row("first") <> ",{\"title\":42}]}"
  let assert Error(reason) = bugs.decode(text)
  assert string.contains(reason, "entry 1")
  assert string.contains(reason, "no readable id")
}

/// The count is stated so a reader knows whether they are fixing one row or
/// a board somebody generated wrong.
pub fn the_message_counts_the_malformed_entries_test() {
  let text =
    "{\"bugs\":[{\"id\":\"a\"},{\"id\":\"b\"}," <> good_row("ok") <> "]}"
  let assert Error(reason) = bugs.decode(text)
  assert string.contains(reason, "2 of 3 entries are malformed")
}

/// **The load must not silently drop the bad row.** `save` re-encodes the
/// whole file from whatever `load` returned, so a lenient decode would delete
/// a filed bug at the next save.
///
/// A DOCUMENTED DUPLICATE, and worth keeping for one reason. This was written
/// as the test that pinned the strictness, and it is not:
/// `unknown_area_fails_the_decode_test` and `unknown_status_fails_the_decode_
/// test` above already did, and both predate it — a mutation to the lenient
/// decode kills all three. What this one adds is the *reason*, which the
/// other two do not state: they pin that a bad value is refused, this pins
/// why refusing rather than dropping is the safe direction here. Found by
/// mutating the decode and being surprised at the body count, which is the
/// only way anyone was going to notice.
pub fn a_board_with_one_bad_row_does_not_decode_to_the_good_ones_test() {
  let text =
    "{\"bugs\":["
    <> good_row("first")
    <> ",{\"id\":\"broken\"},"
    <> good_row("third")
    <> "]}"
  assert result.is_error(bugs.decode(text))
}

/// A board that is not a `{"bugs": [...]}` object at all has no rows to
/// blame, so the raw parse error is the most specific thing available and is
/// what the reader gets.
pub fn a_board_that_is_not_a_board_reports_the_parse_error_test() {
  let assert Error(reason) = bugs.decode("[]")
  assert !string.contains(reason, "entries are malformed")
}

/// A whole, valid board still decodes — the check above must not have been
/// bought by making everything fail.
pub fn a_valid_board_still_decodes_test() {
  let text =
    "{\"bugs\":[" <> good_row("first") <> "," <> good_row("second") <> "]}"
  let assert Ok(board) = bugs.decode(text)
  assert list.map(board.bugs, fn(b: Bug) { b.id }) == ["first", "second"]
}

fn good_row(id: String) -> String {
  "{\"id\":\""
  <> id
  <> "\",\"title\":\"t\",\"area\":\"guard\",\"severity\":\"friction\","
  <> "\"body\":\"b\",\"reported_by\":\"Fathom\",\"source\":\"hand\","
  <> "\"node\":null,\"run\":null,\"session_id\":null,\"signature\":null,"
  <> "\"filed\":\"2026-09-07T00:00:00Z\",\"occurrences\":1,\"status\":\"open\","
  <> "\"resolution\":null,\"fixed\":null}"
}
