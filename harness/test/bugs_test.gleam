import gleam/int
import gleam/list
import gleam/option.{None, Some}
import gleam/result
import gleam/string
import harness/bugs.{type Bug, Board, Bug}
import simplifile

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
    claimed_by: None,
    claimed_at: None,
    claimed_ref: None,
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
        ..bug("held", bugs.Claimed),
        claimed_by: Some("Keel"),
        claimed_at: Some("2026-09-06T04:00:00Z"),
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

// --- one bug per line on disk ----------------------------------------------

/// The on-disk shape git can merge: a header line, one compact row per
/// line, a footer line. Three bugs is five lines exactly.
pub fn encode_writes_one_bug_per_line_test() {
  let text =
    bugs.encode(
      Board([bug("a", bugs.Open), bug("b", bugs.Open), bug("c", bugs.Open)]),
    )
  let lines = string.split(text, "\n")
  assert list.length(lines) == 5
  let assert [first, ..] = lines
  assert first == "{\"bugs\":["
  assert list.last(lines) == Ok("]}")
}

/// Each middle line, minus its trailing comma, is one bug on its own: it
/// decodes as a one-row board through the public decoder, which is the row
/// decoder in the only wrapping it accepts.
pub fn each_encoded_line_is_one_decodable_bug_test() {
  let text =
    bugs.encode(
      Board([bug("a", bugs.Open), bug("b", bugs.Open), bug("c", bugs.Open)]),
    )
  let assert [_, ..rest] = string.split(text, "\n")
  let rows = list.take(rest, 3)
  list.zip(rows, ["a", "b", "c"])
  |> list.each(fn(pair) {
    let #(line, id) = pair
    assert string.starts_with(line, "{\"id\":\"")
    assert string.ends_with(line, "}") || string.ends_with(line, "},")
    let row = case string.ends_with(line, ",") {
      True -> string.drop_end(line, 1)
      False -> line
    }
    let assert Ok(board) = bugs.decode("{\"bugs\":[" <> row <> "]}")
    let assert [b] = board.bugs
    assert b.id == id
  })
}

pub fn an_empty_board_encodes_to_the_bare_shape_test() {
  assert bugs.encode(Board([])) == "{\"bugs\":[]}"
}

/// A row with neither `claimed_by` nor `claimed_at` key decodes with both
/// `None`. This pins compatibility with the live board: every row filed
/// before the claim fields existed lacks the keys, and so does the row that
/// was claimed by hand-editing the file. The decoder must treat an absent
/// key like a `null`, not like a malformed row, because a board that refuses
/// to load is a board nobody can claim or reopen anything on.
pub fn a_row_without_the_claim_keys_decodes_with_no_holder_test() {
  let text = "{\"bugs\":[" <> good_row("legacy") <> "]}"
  let assert Ok(board) = bugs.decode(text)
  let assert [b] = board.bugs
  assert b.claimed_by == None
  assert b.claimed_at == None
  assert b.claimed_ref == None
}

// --- claiming and reopening ------------------------------------------------

pub fn claim_with_a_session_ref_stores_it_test() {
  let board = Board([bug("a", bugs.Open)])
  let assert Ok(board) =
    bugs.claim(board, "a", "Fathom", Some("88ad51"), "2026-09-06T05:00:00Z")
  let assert Ok(b) = bugs.get(board, "a")
  assert b.claimed_ref == Some("88ad51")
}

pub fn claim_without_a_session_ref_leaves_it_absent_test() {
  let board = Board([bug("a", bugs.Open)])
  let assert Ok(board) =
    bugs.claim(board, "a", "Fathom", None, "2026-09-06T05:00:00Z")
  let assert Ok(b) = bugs.get(board, "a")
  assert b.claimed_ref == None
}

pub fn reopen_clears_the_session_ref_test() {
  let board =
    Board([
      Bug(
        ..bug("a", bugs.Claimed),
        claimed_by: Some("Keel"),
        claimed_at: Some("2026-09-06T04:00:00Z"),
        claimed_ref: Some("88ad51"),
      ),
    ])
  let assert Ok(board) = bugs.reopen(board, "a")
  let assert Ok(b) = bugs.get(board, "a")
  assert b.claimed_ref == None
}

/// A ref survives the file, like the rest of the claim.
pub fn a_claim_with_a_session_ref_round_trips_through_json_test() {
  let assert Ok(board) =
    bugs.claim(
      Board([bug("a", bugs.Open)]),
      "a",
      "Keel",
      Some("88ad51"),
      "2026-09-06T05:00:00Z",
    )
  assert bugs.decode(bugs.encode(board)) == Ok(board)
}

pub fn claim_on_an_open_bug_stamps_status_holder_and_time_test() {
  let board = Board([bug("a", bugs.Open)])
  let assert Ok(board) =
    bugs.claim(board, "a", "Fathom", None, "2026-09-06T05:00:00Z")
  let assert Ok(b) = bugs.get(board, "a")
  assert b.status == bugs.Claimed
  assert b.claimed_by == Some("Fathom")
  assert b.claimed_at == Some("2026-09-06T05:00:00Z")
}

pub fn claim_on_a_claimed_bug_fails_naming_the_holder_test() {
  let board =
    Board([
      Bug(
        ..bug("a", bugs.Claimed),
        claimed_by: Some("Keel"),
        claimed_at: Some("2026-09-06T04:00:00Z"),
      ),
    ])
  let assert Error(reason) =
    bugs.claim(board, "a", "Fathom", None, "2026-09-06T05:00:00Z")
  assert string.contains(reason, "Keel")
  assert string.contains(reason, "2026-09-06T04:00:00Z")
}

/// The live board has exactly this row: `claimed` by a hand edit, no holder.
pub fn claim_on_a_hand_claimed_bug_fails_saying_no_holder_test() {
  let board = Board([bug("a", bugs.Claimed)])
  let assert Error(reason) =
    bugs.claim(board, "a", "Fathom", None, "2026-09-06T05:00:00Z")
  assert string.contains(reason, "no holder")
}

pub fn claim_on_a_fixed_bug_fails_test() {
  let board = Board([bug("a", bugs.Fixed)])
  let assert Error(reason) =
    bugs.claim(board, "a", "Fathom", None, "2026-09-06T05:00:00Z")
  assert string.contains(reason, "settled")
}

pub fn claim_of_an_unknown_id_fails_naming_the_id_test() {
  let assert Error(reason) =
    bugs.claim(Board([]), "nope", "Fathom", None, "2026-09-06T05:00:00Z")
  assert string.contains(reason, "`nope`")
}

pub fn reopen_on_a_claimed_bug_clears_holder_and_time_test() {
  let board =
    Board([
      Bug(
        ..bug("a", bugs.Claimed),
        claimed_by: Some("Keel"),
        claimed_at: Some("2026-09-06T04:00:00Z"),
      ),
    ])
  let assert Ok(board) = bugs.reopen(board, "a")
  let assert Ok(b) = bugs.get(board, "a")
  assert b.status == bugs.Open
  assert b.claimed_by == None
  assert b.claimed_at == None
}

pub fn reopen_on_an_open_bug_fails_test() {
  let assert Error(reason) = bugs.reopen(Board([bug("a", bugs.Open)]), "a")
  assert string.contains(reason, "not claimed")
}

pub fn reopen_of_an_unknown_id_fails_naming_the_id_test() {
  let assert Error(reason) = bugs.reopen(Board([]), "nope")
  assert string.contains(reason, "`nope`")
}

pub fn close_open_as_fixed_stamps_status_resolution_and_time_test() {
  let assert Ok(board) =
    bugs.close(
      Board([bug("a", bugs.Open)]),
      "a",
      bugs.Fixed,
      "landed in 1a2b3c4",
      "2026-09-06T06:00:00Z",
    )
  let assert Ok(b) = bugs.get(board, "a")
  assert b.status == bugs.Fixed
  assert b.resolution == Some("landed in 1a2b3c4")
  assert b.fixed == Some("2026-09-06T06:00:00Z")
}

/// The holder stays on a closed row: it is the record of who worked it.
pub fn close_claimed_as_wontfix_keeps_the_holder_test() {
  let board =
    Board([
      Bug(
        ..bug("a", bugs.Claimed),
        claimed_by: Some("Keel"),
        claimed_at: Some("2026-09-06T04:00:00Z"),
      ),
    ])
  let assert Ok(board) =
    bugs.close(
      board,
      "a",
      bugs.Wontfix,
      "correct behaviour",
      "2026-09-06T06:00:00Z",
    )
  let assert Ok(b) = bugs.get(board, "a")
  assert b.status == bugs.Wontfix
  assert b.claimed_by == Some("Keel")
  assert b.claimed_at == Some("2026-09-06T04:00:00Z")
}

pub fn close_on_a_fixed_bug_fails_naming_its_status_test() {
  let assert Error(reason) =
    bugs.close(
      Board([bug("a", bugs.Fixed)]),
      "a",
      bugs.Wontfix,
      "again",
      "2026-09-06T06:00:00Z",
    )
  assert string.contains(reason, "already fixed")
}

pub fn close_with_open_as_the_verdict_fails_test() {
  let assert Error(reason) =
    bugs.close(
      Board([bug("a", bugs.Open)]),
      "a",
      bugs.Open,
      "nonsense",
      "2026-09-06T06:00:00Z",
    )
  assert string.contains(reason, "fixed or wontfix")
}

/// A claim survives the file: what `claim` stamps, `load` after `save` still
/// carries, so the holder is readable by the session that comes after.
pub fn a_claim_round_trips_through_json_test() {
  let assert Ok(board) =
    bugs.claim(
      Board([bug("a", bugs.Open)]),
      "a",
      "Keel",
      None,
      "2026-09-06T05:00:00Z",
    )
  assert bugs.decode(bugs.encode(board)) == Ok(board)
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

/// A `wontfix` row is a verdict that the behaviour is correct and will
/// recur, so the next occurrence bumps that row rather than opening a
/// question already answered. Like an error tracker's Ignored issue: it
/// keeps counting and stays quiet.
pub fn append_bumps_a_wontfix_row_instead_of_filing_a_new_one_test() {
  let board =
    Board([])
    |> bugs.append(auto_bug("Denied", "guard:Bash", "2026-09-06T02:00:00Z"))
  let assert [first] = board.bugs
  let board = bugs.update(board, Bug(..first, status: bugs.Wontfix))
  let board =
    bugs.append(board, auto_bug("Denied", "guard:Bash", "2026-09-06T09:00:00Z"))
  let assert [only] = board.bugs
  assert only.status == bugs.Wontfix
  assert only.occurrences == 2
  assert only.filed == "2026-09-06T09:00:00Z"
}

/// The newest row carrying the signature holds the verdict. A signature
/// once waved through as wontfix and later fixed is, on its next
/// occurrence, a regression of that fix, not a recurrence of the wontfix.
pub fn append_lets_the_newest_row_decide_between_wontfix_and_fixed_test() {
  let board =
    Board([
      Bug(
        ..auto_bug("Denied", "guard:Bash", "2026-09-06T02:00:00Z"),
        id: "denied",
        status: bugs.Wontfix,
      ),
      Bug(
        ..auto_bug("Denied", "guard:Bash", "2026-09-06T05:00:00Z"),
        id: "denied-2",
        status: bugs.Fixed,
      ),
    ])
  let board =
    bugs.append(board, auto_bug("Denied", "guard:Bash", "2026-09-06T09:00:00Z"))
  assert list.map(board.bugs, fn(b) { b.id })
    == ["denied", "denied-2", "denied-3"]
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

// --- filing a row by hand --------------------------------------------------
//
// `bugs file` exists because on 2026-09-07 one hand-edited row with the
// area "dag" made the whole board refuse to decode, and every `bugs` verb
// with it. The verb runs the board's own row decoder over the row before
// anything is written, so the refusal happens to the one row instead of to
// the board.

/// The six fields a reporter writes; everything else is the verb's to fill.
fn minimal_row(id: String, area: String) -> String {
  "{\"id\":\""
  <> id
  <> "\",\"title\":\"Guard denies lake env lean\",\"area\":\""
  <> area
  <> "\",\"severity\":\"friction\",\"body\":\"the body\","
  <> "\"reported_by\":\"Rowan\"}"
}

/// A scratch board and row on disk, one directory per test so the tests
/// cannot see each other's files. Returns the two paths.
fn scratch(name: String, board: bugs.Board, row: String) -> #(String, String) {
  let dir = "build/test-runs/bugs/" <> name
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let board_path = dir <> "/bugs.json"
  let row_path = dir <> "/row.json"
  let assert Ok(_) = bugs.save(board, board_path)
  let assert Ok(_) = simplifile.write(row_path, row)
  #(board_path, row_path)
}

pub fn file_a_minimal_row_fills_the_defaults_and_round_trips_test() {
  let #(board_path, row_path) =
    scratch(
      "minimal",
      Board([]),
      minimal_row("guard-denies-lake-env-lean", "guard"),
    )
  let assert Ok(bug) =
    bugs.file_at(board_path:, row_path:, now: "2026-09-07T10:00:00Z")
  assert bug.id == "guard-denies-lake-env-lean"
  assert bug.title == "Guard denies lake env lean"
  assert bug.area == bugs.Guard
  assert bug.severity == bugs.Friction
  assert bug.body == "the body"
  assert bug.reported_by == "Rowan"
  assert bug.source == bugs.Hand
  assert bug.node == None
  assert bug.run == None
  assert bug.session_id == None
  assert bug.signature == None
  assert bug.filed == "2026-09-07T10:00:00Z"
  assert bug.occurrences == 1
  assert bug.status == bugs.Open
  assert bug.resolution == None
  assert bug.fixed == None
  assert bug.claimed_by == None
  assert bug.claimed_at == None
  assert bug.claimed_ref == None
  // What was written is what `load` reads back: the whole point of running
  // the board's decoder before the save.
  assert bugs.load(board_path) == Ok(Board([bug]))
}

/// A row that sets a field the verb would have filled keeps its own value,
/// and that value is checked like any other.
pub fn file_keeps_a_default_field_the_row_does_set_test() {
  let row =
    "{\"id\":\"seen-twice\",\"title\":\"t\",\"area\":\"verify\","
    <> "\"severity\":\"blocks\",\"body\":\"b\",\"reported_by\":\"Rowan\","
    <> "\"node\":\"evolve_left_edge\",\"occurrences\":2}"
  let #(board_path, row_path) = scratch("kept", Board([]), row)
  let assert Ok(bug) =
    bugs.file_at(board_path:, row_path:, now: "2026-09-07T10:00:00Z")
  assert bug.node == Some("evolve_left_edge")
  assert bug.occurrences == 2
  assert bug.source == bugs.Hand
}

/// Today's cause, refused at the row instead of at the board: the message
/// names the field, the word that was written, and the words that would
/// have been accepted.
pub fn file_refuses_an_area_outside_the_enum_naming_the_set_test() {
  let #(board_path, row_path) =
    scratch("area", Board([]), minimal_row("some-id", "dag"))
  let assert Error(reason) =
    bugs.file_at(board_path:, row_path:, now: "2026-09-07T10:00:00Z")
  assert string.contains(reason, "area: \"dag\" is not an area")
  assert string.contains(
    reason,
    "guard, dispatch, verify, brief, board, hooks, docs, other",
  )
}

pub fn file_refuses_an_id_already_on_the_board_test() {
  let #(board_path, row_path) =
    scratch(
      "dup",
      Board([bug("taken", bugs.Open)]),
      minimal_row("taken", "guard"),
    )
  let assert Error(reason) =
    bugs.file_at(board_path:, row_path:, now: "2026-09-07T10:00:00Z")
  assert string.contains(reason, "id: `taken` is already on the board")
}

pub fn file_refuses_an_id_that_is_not_a_slug_test() {
  let #(board_path, row_path) =
    scratch("slug", Board([]), minimal_row("Not A Slug", "guard"))
  let assert Error(reason) =
    bugs.file_at(board_path:, row_path:, now: "2026-09-07T10:00:00Z")
  assert string.contains(
    reason,
    "id: `Not A Slug` is not a slug of lowercase letters, digits and dashes",
  )
}

pub fn file_refuses_a_file_that_is_not_a_json_object_test() {
  let #(board_path, row_path) = scratch("list", Board([]), "[]")
  let assert Error(reason) =
    bugs.file_at(board_path:, row_path:, now: "2026-09-07T10:00:00Z")
  assert string.contains(reason, "not a JSON object")
  let #(board_path, row_path) = scratch("prose", Board([]), "not json at all")
  let assert Error(reason) =
    bugs.file_at(board_path:, row_path:, now: "2026-09-07T10:00:00Z")
  assert string.contains(reason, "not JSON")
}

/// Every problem in one refusal, so the row is fixed in one edit rather
/// than one problem per run.
pub fn file_names_every_problem_at_once_test() {
  let row =
    "{\"id\":\"Bad Id\",\"title\":\"t\",\"area\":\"guard\","
    <> "\"severity\":\"high\",\"reported_by\":\"Rowan\"}"
  let #(board_path, row_path) = scratch("all", Board([]), row)
  let assert Error(reason) =
    bugs.file_at(board_path:, row_path:, now: "2026-09-07T10:00:00Z")
  assert string.contains(reason, "3 problems")
  assert string.contains(
    reason,
    "severity: \"high\" is not a severity; one of blocks, friction, papercut",
  )
  assert string.contains(reason, "body: missing")
  assert string.contains(reason, "id: `Bad Id` is not a slug")
}

/// A refusal writes nothing: the board file is byte-for-byte what it was,
/// for every kind of refusal above.
pub fn the_board_is_unchanged_after_any_refusal_test() {
  let board = Board([bug("taken", bugs.Open)])
  [
    #("unchanged-area", minimal_row("some-id", "dag")),
    #("unchanged-dup", minimal_row("taken", "guard")),
    #("unchanged-slug", minimal_row("Not A Slug", "guard")),
    #("unchanged-list", "[]"),
    #("unchanged-prose", "not json at all"),
    #("unchanged-missing", "{\"id\":\"only-an-id\"}"),
  ]
  |> list.each(fn(case_) {
    let #(name, row) = case_
    let #(board_path, row_path) = scratch(name, board, row)
    let assert Ok(before) = simplifile.read(board_path)
    let assert Error(_) =
      bugs.file_at(board_path:, row_path:, now: "2026-09-07T10:00:00Z")
    let assert Ok(after) = simplifile.read(board_path)
    assert after == before
  })
}
