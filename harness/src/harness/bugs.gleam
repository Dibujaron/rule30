//// The bug board: things wrong with the project's own machinery, filed by
//// whoever hit them and worked by the framework agents. Persisted as JSON
//// beside the DAG, because both are boards and `blueprint/` is where the
//// work lives.
////
//// Provenance is never taken from the agent that reports it. `reported_by`,
//// `source`, `node`, `run`, `session_id` and `filed` are stamped by the
//// dispatcher from what it already knows, so a worker cannot file under
//// another identity or claim a node it was not dispatched to.

import gleam/dict.{type Dict}
import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import simplifile

/// How badly this got in someone's way. The reporter's claim, not a verdict:
/// A framework agent may correct it when working the bug.
pub type Severity {
  /// A worker could not finish.
  Blocks
  /// It cost turns, or produced a wrong belief.
  Friction
  /// Merely ugly.
  Papercut
}

/// Which part of the machinery is at fault. A closed set, because an open
/// string field becomes twelve spellings of "the guard" inside a week and
/// the area filter is how the board gets read.
pub type Area {
  Guard
  Dispatch
  Verify
  Brief
  BoardArea
  Hooks
  Docs
  /// The ingest escape hatch, for a reported area that did not parse. Never
  /// auto-filed: the harness always knows its own area.
  Other
}

/// Where a bug stands. Deliberately borrowing `dag.Status`'s vocabulary,
/// `claimed` included, so the one board idiom in the project transfers.
pub type BugStatus {
  Open
  Claimed
  Fixed
  Wontfix
}

/// Which filing path put this on the board: a prover under the guard, the
/// machine detecting its own failure, or someone writing it directly.
/// `reported_by` says who; this says only whether a dispatcher stamped it.
pub type Source {
  Worker
  Harness
  Hand
}

/// One thing wrong with the machinery.
pub type Bug {
  Bug(
    id: String,
    title: String,
    area: Area,
    severity: Severity,
    body: String,
    reported_by: String,
    source: Source,
    /// Where it was FIRST seen. On a signed row that `append` has bumped,
    /// these three still name the first occurrence, while `filed` and
    /// `occurrences` have moved on — so a row can name one node and carry a
    /// count gathered over several runs and nodes. Read the count against
    /// the events, not against these fields.
    node: Option(String),
    run: Option(String),
    session_id: Option(String),
    /// Set only on auto-filed bugs: the area plus the denied tool or failing
    /// stage. Two auto-files with one signature are one bug seen twice; two
    /// agents describing the same friction in their own words are two pieces
    /// of evidence, so those carry `None` and never dedupe.
    signature: Option(String),
    /// When it was LAST seen: `append` refreshes it on every bump, so on a
    /// signed row it is the latest occurrence, not the filing time.
    filed: String,
    /// Every occurrence `append` folded into this row while it was open,
    /// claimed or wontfix — across runs, nodes and personas alike.
    occurrences: Int,
    status: BugStatus,
    resolution: Option(String),
    fixed: Option(String),
    /// Who holds this bug. Set by `claim` when the status becomes `Claimed`,
    /// cleared by `reopen`. A `Claimed` row with no holder is a claim made
    /// by hand-editing the file, so nobody can be asked whether it is still
    /// alive.
    claimed_by: Option(String),
    /// When the claim was made, ISO-8601 with a `Z` like `filed`. Set and
    /// cleared alongside `claimed_by`.
    claimed_at: Option(String),
    /// The holder's session ref as `ListAgents` prints it (`88ad51`), so a
    /// reader can check the holder is alive instead of asking. Absent when
    /// the claim was made without one; cleared by `reopen` with the rest.
    claimed_ref: Option(String),
  )
}

/// The full board.
pub type Board {
  Board(bugs: List(Bug))
}

/// Parse a `Board` from its JSON text representation.
///
/// On failure this says **which entry** is bad, by index and by id, and then
/// still fails. Both halves are deliberate.
///
/// *Located*, because `decode.list(bug_decoder())` fails as a unit: it
/// reports the fields it wanted and not the row that lacked them, so finding
/// the offender on a board of thirty is a bisect. A hand-written entry that
/// omits a field is the ordinary way this happens — the schema is wider than
/// any single entry displays, so reading the file to learn the shape teaches
/// you a subset with nothing to say it is one.
///
/// *Still fails*, and this is the part where the obvious fix is wrong. The
/// same defect in a worker's report was fixed by decoding elements
/// independently and dropping the bad ones, because there the dropped thing
/// is an optional extra and nothing rewrites the file from it. Neither holds
/// here. A row on this board **is** a filed bug, and `save` re-encodes the
/// whole file from whatever `load` returned — so a silent drop at load
/// becomes a permanent deletion at the next save. Leniency here would delete
/// bug reports to avoid an error message.
pub fn decode(text: String) -> Result(Board, String) {
  case json.parse(from: text, using: board_decoder()) {
    Ok(board) -> Ok(board)
    Error(whole) ->
      case json.parse(from: text, using: rows_decoder()) {
        // The board is not even a `{"bugs": [...]}` shape, so there are no
        // rows to blame and the original error is the most specific thing
        // there is.
        Error(_) -> Error(string.inspect(whole))
        Ok(rows) ->
          case list.filter_map(list.index_map(rows, bad_row), fn(r) { r }) {
            // Every row decodes on its own but the board does not. Nothing
            // here can localise that, so say so rather than implying the
            // rows were not checked.
            [] ->
              Error(
                "the bug board did not decode, and every entry decodes on its "
                <> "own, so the fault is in the surrounding object: "
                <> string.inspect(whole),
              )
            faults ->
              Error(
                "the bug board did not decode. "
                <> int.to_string(list.length(faults))
                <> " of "
                <> int.to_string(list.length(rows))
                <> " entries are malformed, and the whole board is refused "
                <> "rather than the entries dropped, because dropping one "
                <> "here deletes a filed bug at the next save:
"
                <> string.join(
                  faults,
                  "
",
                ),
              )
          }
      }
  }
}

/// The board as untyped rows, so each can be judged on its own.
fn rows_decoder() -> decode.Decoder(List(decode.Dynamic)) {
  use rows <- decode.field("bugs", decode.list(decode.dynamic))
  decode.success(rows)
}

/// `Ok(description)` when row `index` does not decode, `Error(Nil)` when it
/// does. Named by id where the row has one, because an index alone sends the
/// reader counting braces.
fn bad_row(row: decode.Dynamic, index: Int) -> Result(String, Nil) {
  case decode.run(row, bug_decoder()) {
    Ok(_) -> Error(Nil)
    Error(errors) -> {
      let name = case decode.run(row, id_only_decoder()) {
        Ok(id) -> "\"" <> id <> "\""
        Error(_) -> "(no readable id)"
      }
      Ok(
        "  entry "
        <> int.to_string(index)
        <> ", "
        <> name
        <> ": "
        <> string.inspect(errors),
      )
    }
  }
}

fn id_only_decoder() -> decode.Decoder(String) {
  use id <- decode.field("id", decode.string)
  decode.success(id)
}

/// Render a `Board` to its JSON text representation, one bug per line:
///
/// ```
/// {"bugs":[
/// {...row 1, compact...},
/// {...row 2, compact...}
/// ]}
/// ```
///
/// One row per line because git merges by line. On a single-line board any
/// two edits conflict on that one line and the obvious resolution drops a
/// row; laid out like this, two agents adding or editing different rows no
/// longer conflict at all, and a conflict that does happen is one legible
/// row. An empty board is exactly `{"bugs":[]}`. Still ordinary JSON, so
/// `decode` is unchanged.
pub fn encode(board: Board) -> String {
  case board.bugs {
    [] -> "{\"bugs\":[]}"
    rows ->
      "{\"bugs\":[\n"
      <> string.join(
        list.map(rows, fn(bug) { json.to_string(bug_to_json(bug)) }),
        ",\n",
      )
      <> "\n]}"
  }
}

/// Read and decode a `Board` from a file. A missing file is an empty board:
/// the first bug ever filed should not need the file to exist first.
pub fn load(path: String) -> Result(Board, String) {
  case simplifile.read(path) {
    Error(simplifile.Enoent) -> Ok(Board([]))
    Error(e) -> Error(simplifile.describe_error(e))
    Ok(text) -> decode(text)
  }
}

/// Encode and write a `Board` to a file, one trailing newline.
///
/// Re-encodes from a decoded value rather than patching text, so a field the
/// harness does not understand cannot survive a write half-mangled.
pub fn save(board: Board, path: String) -> Result(Nil, String) {
  simplifile.write(path, encode(board) <> "\n")
  |> result.map_error(fn(e) { simplifile.describe_error(e) })
}

/// Put `bug` on the board, giving it an id slugged from its title.
///
/// When it carries a signature, the newest row carrying that signature
/// decides what happens, because that row holds the last verdict on it:
///
/// - **open or claimed**: its `occurrences` is bumped and its `filed`
///   refreshed instead of a row being added — otherwise one bad guard rule
///   files forty identical bugs in a single run.
/// - **wontfix**: the same bump. That verdict said the behaviour is correct
///   and will recur, so a recurrence is the count it asked for, not a
///   question to answer again; the row stays wontfix and stays off the open
///   list. Before this, `guard:Bash:not_permitted` opened five rows in a day,
///   three closed wontfix with one reasoning.
/// - **fixed**: a new row, so a regression is visibly a regression.
///
/// Like an error tracker's Resolved and Ignored: a resolved issue reopens on
/// its next event, an ignored one keeps counting and stays quiet.
pub fn append(board: Board, bug: Bug) -> Board {
  case bug.signature {
    None -> add(board, bug)
    Some(sig) ->
      case
        list.filter(board.bugs, fn(b) { b.signature == Some(sig) })
        |> list.last
      {
        Ok(existing) if existing.status != Fixed ->
          update(
            board,
            Bug(
              ..existing,
              occurrences: existing.occurrences + 1,
              filed: bug.filed,
            ),
          )
        _ -> add(board, bug)
      }
  }
}

fn add(board: Board, bug: Bug) -> Board {
  Board(
    list.append(board.bugs, [Bug(..bug, id: unique_id(board, slug(bug.title)))]),
  )
}

/// Put one hand-written row on the board, or say everything wrong with it.
///
/// `text` is one JSON object. The six fields a reporter knows — `id`,
/// `title`, `area`, `severity`, `body`, `reported_by` — are required; every
/// other field is filled when absent (`source` "hand", `filed` `now`,
/// `occurrences` 1, `status` open, the rest null) and taken as written when
/// present. The filled row is then checked by the board's own row decoder,
/// so what is accepted here is exactly what `load` will accept later: a
/// word outside an enum is refused now, naming the field, the word and the
/// valid set, instead of refusing the whole board at the next load.
///
/// Every problem is reported in one refusal — a missing field, a bad enum
/// value, an id already on the board, an id that is not a slug of lowercase
/// letters, digits and dashes — so a row is fixed in one edit. The id is
/// the reporter's, not slugged from the title as `append` does: a row filed
/// by hand is cited by id in commit messages before it is filed.
pub fn file(
  board: Board,
  text: String,
  now: String,
) -> Result(#(Board, Bug), String) {
  use row <- result.try(parse_row(text))
  let filled = fill_defaults(row, now)
  let decoded = decode.run(filled, bug_decoder())
  let problems =
    list.append(
      case decoded {
        Ok(_) -> []
        Error(errors) -> list.map(errors, fn(e) { describe(e, row) })
      },
      case decode.run(filled, id_only_decoder()) {
        Ok(id) -> id_problems(board, id)
        Error(_) -> []
      },
    )
  case decoded, problems {
    Ok(bug), [] -> Ok(#(Board(list.append(board.bugs, [bug])), bug))
    _, _ ->
      Error(
        "not filed; "
        <> int.to_string(list.length(problems))
        <> case problems {
          [_] -> " problem"
          _ -> " problems"
        }
        <> " with the row, and the board is unchanged:\n  "
        <> string.join(problems, "\n  "),
      )
  }
}

/// `file`, from the board at `board_path` and the row at `row_path`, saving
/// the board only when the row was accepted. A refusal leaves the file
/// byte-for-byte as it was, which is the property a caller relies on when
/// they fix the row and run it again.
pub fn file_at(
  board_path board_path: String,
  row_path row_path: String,
  now now: String,
) -> Result(Bug, String) {
  use text <- result.try(
    simplifile.read(row_path)
    |> result.map_error(fn(e) {
      "could not read `" <> row_path <> "`: " <> simplifile.describe_error(e)
    }),
  )
  use board <- result.try(load(board_path))
  use #(filed, bug) <- result.try(file(board, text, now))
  use _ <- result.try(save(filed, board_path))
  Ok(bug)
}

/// The row as a JSON object, or why it is not one.
fn parse_row(text: String) -> Result(Dict(String, Dynamic), String) {
  case json.parse(text, decode.dict(decode.string, decode.dynamic)) {
    Ok(row) -> Ok(row)
    Error(json.UnableToDecode([first, ..])) ->
      Error(
        "the row file is not a JSON object: found "
        <> first.found
        <> ", and a row is one {...} with id, title, area, severity, body "
        <> "and reported_by",
      )
    Error(e) -> Error("the row file is not JSON: " <> string.inspect(e))
  }
}

/// The row with every field a reporter need not write filled in, as the
/// `Dynamic` the board's row decoder reads. A key the row does carry is
/// left as written, so a captain who does set `status` or `node` has it
/// checked rather than overwritten.
fn fill_defaults(row: Dict(String, Dynamic), now: String) -> Dynamic {
  [
    #("source", dynamic.string(source_to_string(Hand))),
    #("node", dynamic.nil()),
    #("run", dynamic.nil()),
    #("session_id", dynamic.nil()),
    #("signature", dynamic.nil()),
    #("filed", dynamic.string(now)),
    #("occurrences", dynamic.int(1)),
    #("status", dynamic.string(status_to_string(Open))),
    #("resolution", dynamic.nil()),
    #("fixed", dynamic.nil()),
    #("claimed_by", dynamic.nil()),
    #("claimed_at", dynamic.nil()),
    #("claimed_ref", dynamic.nil()),
  ]
  |> list.fold(row, fn(row, entry) {
    let #(key, value) = entry
    case dict.has_key(row, key) {
      True -> row
      False -> dict.insert(row, key, value)
    }
  })
  |> dict.to_list
  |> list.map(fn(entry) { #(dynamic.string(entry.0), entry.1) })
  |> dynamic.properties
}

/// One decoder error as a line naming the field, and for an enum the word
/// that was written and the words that would have been accepted.
fn describe(error: decode.DecodeError, row: Dict(String, Dynamic)) -> String {
  let field = string.join(error.path, ".")
  let written = fn() {
    case dict.get(row, field) {
      Ok(value) ->
        case decode.run(value, decode.string) {
          Ok(s) -> "\"" <> s <> "\""
          Error(_) -> string.inspect(value)
        }
      Error(Nil) -> "(nothing)"
    }
  }
  let not_one_of = fn(what: String, names: List(String)) {
    field
    <> ": "
    <> written()
    <> " is not "
    <> what
    <> "; one of "
    <> string.join(names, ", ")
  }
  case error.expected, error.found {
    "Field", "Nothing" -> field <> ": missing"
    "Area", _ -> not_one_of("an area", list.map(all_areas, area_to_string))
    "Severity", _ ->
      not_one_of("a severity", list.map(all_severities, severity_to_string))
    "BugStatus", _ ->
      not_one_of("a status", list.map(all_statuses, status_to_string))
    "Source", _ ->
      not_one_of("a source", list.map(all_sources, source_to_string))
    expected, found -> field <> ": expected " <> expected <> ", found " <> found
  }
}

/// What is wrong with a proposed id, on this board: nothing, or one line
/// per fault.
fn id_problems(board: Board, id: String) -> List(String) {
  list.flatten([
    case is_slug(id) {
      True -> []
      False -> [
        "id: `"
        <> id
        <> "` is not a slug of lowercase letters, digits and dashes",
      ]
    },
    case taken(board, id) {
      True -> ["id: `" <> id <> "` is already on the board"]
      False -> []
    },
  ])
}

fn is_slug(id: String) -> Bool {
  id != ""
  && list.all(string.to_graphemes(id), fn(g) {
    string.contains(does: slug_chars <> "-", contain: g)
  })
}

const all_areas = [
  Guard,
  Dispatch,
  Verify,
  Brief,
  BoardArea,
  Hooks,
  Docs,
  Other,
]

const all_severities = [Blocks, Friction, Papercut]

const all_statuses = [Open, Claimed, Fixed, Wontfix]

const all_sources = [Worker, Harness, Hand]

fn is_live(bug: Bug) -> Bool {
  bug.status == Open || bug.status == Claimed
}

/// Find the bug with the given id.
pub fn get(board: Board, id: String) -> Result(Bug, Nil) {
  list.find(board.bugs, fn(b) { b.id == id })
}

/// Replace the bug with the same id as `bug`, leaving the rest untouched.
pub fn update(board: Board, bug: Bug) -> Board {
  Board(
    list.map(board.bugs, fn(b) {
      case b.id == bug.id {
        True -> bug
        False -> b
      }
    }),
  )
}

/// Take bug `id` for `by`, stamping who and when so a later reader can ask
/// whether the holder is still alive — and, when `ref` is given, the
/// holder's `ListAgents` ref so the reader can check instead of asking. Only
/// an `Open` bug can be claimed: a `Claimed` one is someone else's, and a
/// settled one wants no work.
pub fn claim(
  board: Board,
  id: String,
  by: String,
  ref: Option(String),
  now: String,
) -> Result(Board, String) {
  use bug <- result.try(
    get(board, id) |> result.replace_error("no bug `" <> id <> "` on the board"),
  )
  case bug.status {
    Open ->
      Ok(update(
        board,
        Bug(
          ..bug,
          status: Claimed,
          claimed_by: Some(by),
          claimed_at: Some(now),
          claimed_ref: ref,
        ),
      ))
    Claimed ->
      Error(
        "`"
        <> id
        <> "` is already claimed"
        <> case bug.claimed_by, bug.claimed_at {
          Some(who), Some(when) -> " by " <> who <> " since " <> when
          Some(who), None -> " by " <> who
          None, _ -> " by hand, with no holder recorded"
        },
      )
    settled ->
      Error(
        "`"
        <> id
        <> "` is "
        <> status_to_string(settled)
        <> "; a settled bug is not claimed, and reopen is not the tool for "
        <> "it either",
      )
  }
}

/// Put a `Claimed` bug back on the board, clearing who held it, since when,
/// and from which session. A claim outlives the session that made it, and nothing else ever
/// clears the status, so this is the manual undo for a session that died
/// holding a bug. Only `Claimed` is reopened: a `Fixed` or `Wontfix` bug is
/// a decision, not a stale claim.
pub fn reopen(board: Board, id: String) -> Result(Board, String) {
  use bug <- result.try(
    get(board, id) |> result.replace_error("no bug `" <> id <> "` on the board"),
  )
  case bug.status {
    Claimed ->
      Ok(update(
        board,
        Bug(
          ..bug,
          status: Open,
          claimed_by: None,
          claimed_at: None,
          claimed_ref: None,
        ),
      ))
    other ->
      Error(
        "`"
        <> id
        <> "` is "
        <> status_to_string(other)
        <> ", not claimed; only a claimed bug can be reopened",
      )
  }
}

/// Settle bug `id` as `Fixed` or `Wontfix`, recording the verdict's reason
/// and when it was reached. The claim fields are left as they are: a closed
/// bug's holder is the record of who worked it, and nobody reads a settled
/// row to ask whether its holder is alive.
pub fn close(
  board: Board,
  id: String,
  status: BugStatus,
  resolution: String,
  now: String,
) -> Result(Board, String) {
  use verdict <- result.try(case status {
    Fixed | Wontfix -> Ok(status)
    other ->
      Error(
        "a bug is closed as fixed or wontfix, not " <> status_to_string(other),
      )
  })
  use bug <- result.try(
    get(board, id) |> result.replace_error("no bug `" <> id <> "` on the board"),
  )
  case is_live(bug) {
    True ->
      Ok(update(
        board,
        Bug(
          ..bug,
          status: verdict,
          resolution: Some(resolution),
          fixed: Some(now),
        ),
      ))
    False ->
      Error(
        "`"
        <> id
        <> "` is already "
        <> status_to_string(bug.status)
        <> "; a settled bug is not closed again",
      )
  }
}

/// Every bug still wanting work — `open` or `claimed` — newest first.
pub fn open_bugs(board: Board) -> List(Bug) {
  board.bugs
  |> list.filter(is_live)
  |> newest_first
}

/// The board narrowed for display: by area, by severity, and by whether
/// settled bugs are included. Newest first, like `open_bugs`.
pub fn filtered(
  board: Board,
  area: Option(Area),
  severity: Option(Severity),
  all: Bool,
) -> List(Bug) {
  board.bugs
  |> list.filter(fn(b) { all || is_live(b) })
  |> list.filter(fn(b) {
    case area {
      None -> True
      Some(a) -> b.area == a
    }
  })
  |> list.filter(fn(b) {
    case severity {
      None -> True
      Some(s) -> b.severity == s
    }
  })
  |> newest_first
}

/// `filed` is ISO-8601 with a `Z`, so lexicographic order is chronological.
fn newest_first(bugs: List(Bug)) -> List(Bug) {
  list.sort(bugs, fn(a, b) { string.compare(b.filed, a.filed) })
}

fn unique_id(board: Board, base: String) -> String {
  case taken(board, base) {
    False -> base
    True -> next_free(board, base, 2)
  }
}

fn next_free(board: Board, base: String, n: Int) -> String {
  let candidate = base <> "-" <> int.to_string(n)
  case taken(board, candidate) {
    False -> candidate
    True -> next_free(board, base, n + 1)
  }
}

fn taken(board: Board, id: String) -> Bool {
  list.any(board.bugs, fn(b) { b.id == id })
}

/// A kebab-case id from a title: lowercased, everything but letters and
/// digits treated as a word break, capped at eight words so an id stays
/// quotable in a commit message. A title with nothing sluggable falls back
/// to `bug`, which then collision-suffixes like anything else.
fn slug(title: String) -> String {
  let words =
    title
    |> string.lowercase
    |> string.to_graphemes
    |> list.map(fn(g) {
      case string.contains(does: slug_chars, contain: g) {
        True -> g
        False -> " "
      }
    })
    |> string.join("")
    |> string.split(" ")
    |> list.filter(fn(w) { w != "" })
    |> list.take(8)
  case words {
    [] -> "bug"
    _ -> string.join(words, "-")
  }
}

const slug_chars = "abcdefghijklmnopqrstuvwxyz0123456789"

/// Render a `Severity` to its JSON string form.
pub fn severity_to_string(s: Severity) -> String {
  case s {
    Blocks -> "blocks"
    Friction -> "friction"
    Papercut -> "papercut"
  }
}

/// Parse a `Severity` from its JSON string form.
pub fn severity_from_string(s: String) -> Result(Severity, Nil) {
  case s {
    "blocks" -> Ok(Blocks)
    "friction" -> Ok(Friction)
    "papercut" -> Ok(Papercut)
    _ -> Error(Nil)
  }
}

/// Render an `Area` to its JSON string form.
pub fn area_to_string(a: Area) -> String {
  case a {
    Guard -> "guard"
    Dispatch -> "dispatch"
    Verify -> "verify"
    Brief -> "brief"
    BoardArea -> "board"
    Hooks -> "hooks"
    Docs -> "docs"
    Other -> "other"
  }
}

/// Parse an `Area` from its JSON string form.
pub fn area_from_string(a: String) -> Result(Area, Nil) {
  case a {
    "guard" -> Ok(Guard)
    "dispatch" -> Ok(Dispatch)
    "verify" -> Ok(Verify)
    "brief" -> Ok(Brief)
    "board" -> Ok(BoardArea)
    "hooks" -> Ok(Hooks)
    "docs" -> Ok(Docs)
    "other" -> Ok(Other)
    _ -> Error(Nil)
  }
}

/// Render a `BugStatus` to its JSON string form.
pub fn status_to_string(s: BugStatus) -> String {
  case s {
    Open -> "open"
    Claimed -> "claimed"
    Fixed -> "fixed"
    Wontfix -> "wontfix"
  }
}

/// Parse a `BugStatus` from its JSON string form.
pub fn status_from_string(s: String) -> Result(BugStatus, Nil) {
  case s {
    "open" -> Ok(Open)
    "claimed" -> Ok(Claimed)
    "fixed" -> Ok(Fixed)
    "wontfix" -> Ok(Wontfix)
    _ -> Error(Nil)
  }
}

/// Render a `Source` to its JSON string form.
pub fn source_to_string(s: Source) -> String {
  case s {
    Worker -> "worker"
    Harness -> "harness"
    Hand -> "hand"
  }
}

/// Parse a `Source` from its JSON string form.
pub fn source_from_string(s: String) -> Result(Source, Nil) {
  case s {
    "worker" -> Ok(Worker)
    "harness" -> Ok(Harness)
    "hand" -> Ok(Hand)
    _ -> Error(Nil)
  }
}

fn severity_decoder() -> decode.Decoder(Severity) {
  decode.string
  |> decode.then(fn(s) {
    case severity_from_string(s) {
      Ok(v) -> decode.success(v)
      Error(Nil) -> decode.failure(Friction, "Severity")
    }
  })
}

fn area_decoder() -> decode.Decoder(Area) {
  decode.string
  |> decode.then(fn(s) {
    case area_from_string(s) {
      Ok(v) -> decode.success(v)
      Error(Nil) -> decode.failure(Other, "Area")
    }
  })
}

fn status_decoder() -> decode.Decoder(BugStatus) {
  decode.string
  |> decode.then(fn(s) {
    case status_from_string(s) {
      Ok(v) -> decode.success(v)
      Error(Nil) -> decode.failure(Open, "BugStatus")
    }
  })
}

fn source_decoder() -> decode.Decoder(Source) {
  decode.string
  |> decode.then(fn(s) {
    case source_from_string(s) {
      Ok(v) -> decode.success(v)
      Error(Nil) -> decode.failure(Hand, "Source")
    }
  })
}

fn bug_decoder() -> decode.Decoder(Bug) {
  use id <- decode.field("id", decode.string)
  use title <- decode.field("title", decode.string)
  use area <- decode.field("area", area_decoder())
  use severity <- decode.field("severity", severity_decoder())
  use body <- decode.field("body", decode.string)
  use reported_by <- decode.field("reported_by", decode.string)
  use source <- decode.field("source", source_decoder())
  use node <- decode.field("node", decode.optional(decode.string))
  use run <- decode.field("run", decode.optional(decode.string))
  use session_id <- decode.field("session_id", decode.optional(decode.string))
  use signature <- decode.field("signature", decode.optional(decode.string))
  use filed <- decode.field("filed", decode.string)
  use occurrences <- decode.field("occurrences", decode.int)
  use status <- decode.field("status", status_decoder())
  use resolution <- decode.field("resolution", decode.optional(decode.string))
  use fixed <- decode.field("fixed", decode.optional(decode.string))
  // Optional *keys*, not just nullable values: rows written before the
  // claim fields existed, and rows claimed by hand, have neither key, and a
  // board that refuses to load deletes nothing but also helps nobody.
  use claimed_by <- decode.optional_field(
    "claimed_by",
    None,
    decode.optional(decode.string),
  )
  use claimed_at <- decode.optional_field(
    "claimed_at",
    None,
    decode.optional(decode.string),
  )
  use claimed_ref <- decode.optional_field(
    "claimed_ref",
    None,
    decode.optional(decode.string),
  )
  decode.success(Bug(
    id:,
    title:,
    area:,
    severity:,
    body:,
    reported_by:,
    source:,
    node:,
    run:,
    session_id:,
    signature:,
    filed:,
    occurrences:,
    status:,
    resolution:,
    fixed:,
    claimed_by:,
    claimed_at:,
    claimed_ref:,
  ))
}

fn board_decoder() -> decode.Decoder(Board) {
  use bugs <- decode.field("bugs", decode.list(bug_decoder()))
  decode.success(Board(bugs:))
}

fn bug_to_json(bug: Bug) -> json.Json {
  json.object([
    #("id", json.string(bug.id)),
    #("title", json.string(bug.title)),
    #("area", json.string(area_to_string(bug.area))),
    #("severity", json.string(severity_to_string(bug.severity))),
    #("body", json.string(bug.body)),
    #("reported_by", json.string(bug.reported_by)),
    #("source", json.string(source_to_string(bug.source))),
    #("node", json.nullable(bug.node, json.string)),
    #("run", json.nullable(bug.run, json.string)),
    #("session_id", json.nullable(bug.session_id, json.string)),
    #("signature", json.nullable(bug.signature, json.string)),
    #("filed", json.string(bug.filed)),
    #("occurrences", json.int(bug.occurrences)),
    #("status", json.string(status_to_string(bug.status))),
    #("resolution", json.nullable(bug.resolution, json.string)),
    #("fixed", json.nullable(bug.fixed, json.string)),
    #("claimed_by", json.nullable(bug.claimed_by, json.string)),
    #("claimed_at", json.nullable(bug.claimed_at, json.string)),
    #("claimed_ref", json.nullable(bug.claimed_ref, json.string)),
  ])
}
