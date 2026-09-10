//// Which artifacts a session produces, and what — if anything — ever reads
//// them back.
////
//// **A producer with no reader is not an error state, it is silence.**
//// Nothing fails, nothing warns, and the work is simply never mentioned
//// again. That is the whole of the row
//// `an-artifact-that-answers-the-question-exists-and-nothing-points-at-it`,
//// which by 2026-09-10 had six instances from six different producers, every
//// one of them found by a person who happened to be looking for something
//// else.
////
//// The largest was `docs/connections/`: twelve documents, 549 KB, thirteen
//// connector sessions, read by no brief in the harness — the only mentions of
//// that path in source were doc comments. Twelve sessions had produced one
//// crystal the seeder could see.
////
//// So this module makes "produced and unread" a REPORTED state, in a report
//// later sessions already read. It adjudicates nothing and fixes nothing; it
//// only refuses to let an artifact family go unmentioned.
////
//// **The table below is hand-maintained, and that is a defect this module has
//// to answer for rather than one it can ignore** — a stale table is the same
//// failure one level up. So the table is not the only signal: `undeclared`
//// walks `docs/` and names any directory no row claims, which is what a
//// forgotten row looks like from outside.

import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import simplifile

/// One family of artifact: where it lives, what writes it, and what reads it
/// back. `read_by` is `None` for a family nothing reads — which is the state
/// this module exists to make visible, so it is a value here rather than an
/// omission.
pub type Family {
  Family(
    dir: String,
    produced_by: String,
    read_by: Option(String),
    extension: String,
  )
}

/// Every artifact family the harness produces, as of 2026-09-10.
///
/// A new producer wants a row here. Forgetting one is expected rather than
/// hypothetical — that forgetting is the row this module is named for — which
/// is why `undeclared` exists to catch the omission from the other side.
pub fn families() -> List(Family) {
  [
    Family(
      dir: "docs/connections",
      produced_by: "connect sessions",
      read_by: Some("the seeder brief, each document's section 5 verbatim"),
      extension: ".md",
    ),
    Family(
      dir: "docs/attacks",
      produced_by: "theorist sessions",
      read_by: None,
      extension: ".md",
    ),
    Family(
      dir: "blueprint/proposals",
      produced_by: "seeder sessions",
      read_by: Some("`seed check`, and a captain landing them"),
      extension: ".json",
    ),
  ]
}

/// A family's count and its reader, as one line.
pub fn row(repo_root: String, f: Family) -> String {
  let n = count(repo_root, f)
  let head =
    "  "
    <> string.pad_end(f.dir, 24, " ")
    <> string.pad_end(int.to_string(n), 5, " ")
  case f.read_by {
    Some(reader) -> head <> "read by " <> reader
    None ->
      head
      <> "READ BY NOTHING — written by "
      <> f.produced_by
      <> " and pointed at by no brief or verb"
  }
}

/// How many artifacts of this family exist.
pub fn count(repo_root: String, f: Family) -> Int {
  case simplifile.read_directory(repo_root <> "/" <> f.dir) {
    Error(_) -> 0
    Ok(entries) ->
      entries
      |> list.filter(string.ends_with(_, f.extension))
      |> list.length
  }
}

/// Directories under `docs/` that no family claims.
///
/// The table above is written by hand and will be forgotten; this is the
/// signal that does not depend on remembering. A directory here is either a
/// new artifact family nobody declared, or prose that is not an artifact
/// family at all — and the report says which it cannot tell, rather than
/// guessing.
pub fn undeclared(repo_root: String) -> List(String) {
  let declared =
    families()
    |> list.map(fn(f) { f.dir })
  case simplifile.read_directory(repo_root <> "/docs") {
    Error(_) -> []
    Ok(entries) ->
      entries
      |> list.filter(fn(name) {
        let path = "docs/" <> name
        simplifile.is_directory(repo_root <> "/" <> path) == Ok(True)
        && !list.contains(declared, path)
      })
      |> list.sort(string.compare)
      |> list.map(fn(name) { "docs/" <> name })
  }
}

/// The whole section, for `status`.
pub fn section(repo_root: String) -> String {
  let rows = list.map(families(), row(repo_root, _))
  let unread =
    families()
    |> list.filter(fn(f) { f.read_by == None && count(repo_root, f) > 0 })
    |> list.length
  let tail = case undeclared(repo_root) {
    [] -> ""
    dirs ->
      "\n  undeclared under docs/, so nothing here says whether anything "
      <> "reads them: "
      <> string.join(dirs, ", ")
  }
  let warning = case unread {
    0 -> ""
    n ->
      "\n  "
      <> int.to_string(n)
      <> " famil"
      <> case n {
        1 -> "y has"
        _ -> "ies have"
      }
      <> " artifacts and no reader. Work already paid for that no "
      <> "session will be shown."
  }
  "Artifacts, and what reads them back: a producer with no reader is not an "
  <> "error, it is silence, so it is printed here rather than left out:\n"
  <> string.join(rows, "\n")
  <> warning
  <> tail
}
