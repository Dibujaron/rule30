//// Artifacts and their readers.
////
//// The point under test is not the counting — it is that a family with no
//// reader is LOUD rather than absent, and that a family nobody declared is
//// loud too. A quiet report about an unread artifact is the defect, so a
//// test that only checks the numbers would pass on a broken version of this.

import gleam/list
import gleam/option.{None, Some}
import gleam/string
import harness/reach.{Family}
import simplifile

fn tmp(name: String) -> String {
  let dir = "build/test-runs/reach/" <> name
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir)
  dir
}

fn write_files(dir: String, sub: String, names: List(String)) -> Nil {
  let assert Ok(_) = simplifile.create_directory_all(dir <> "/" <> sub)
  list.each(names, fn(n) {
    let assert Ok(_) = simplifile.write(dir <> "/" <> sub <> "/" <> n, "x")
    Nil
  })
}

pub fn a_family_with_a_reader_names_it_test() {
  let dir = tmp("has-reader")
  write_files(dir, "docs/connections", ["a.md", "b.md"])
  let f =
    Family(
      dir: "docs/connections",
      produced_by: "connect sessions",
      read_by: Some("the seeder brief"),
      extension: ".md",
    )
  assert reach.count(dir, f) == 2
  let line = reach.row(dir, f)
  assert string.contains(line, "read by the seeder brief")
  assert !string.contains(line, "READ BY NOTHING")
}

/// The assertion this module exists for: a family nothing reads must SAY so.
///
/// A version that simply omitted unread families would count correctly and
/// report nothing, which is the silence the row is about — so the test is on
/// the words, not the number.
pub fn a_family_with_no_reader_says_read_by_nothing_test() {
  let dir = tmp("no-reader")
  write_files(dir, "docs/attacks", ["a.md", "b.md", "c.md"])
  let f =
    Family(
      dir: "docs/attacks",
      produced_by: "theorist sessions",
      read_by: None,
      extension: ".md",
    )
  let line = reach.row(dir, f)
  assert string.contains(line, "READ BY NOTHING")
  assert string.contains(line, "theorist sessions")
}

/// An empty unread family is not a warning. Nothing has been paid for yet, so
/// there is nothing being thrown away — the warning counts artifacts, not
/// declarations, or it would cry about every family someone sketched.
pub fn an_empty_unread_family_raises_no_warning_test() {
  let dir = tmp("empty-unread")
  let assert Ok(_) = simplifile.create_directory_all(dir <> "/docs")
  let text = reach.section(dir)
  assert !string.contains(text, "no reader. Work already paid for")
}

/// A `docs/` directory no family declares is named.
///
/// This is the half that stops the mechanism catching the disease it treats:
/// the family table is hand-maintained and will be forgotten, and a table
/// that silently omits a family is exactly the row's own defect arriving
/// inside the fix for it. So the table is not its own only signal.
pub fn a_docs_directory_no_family_declares_is_named_test() {
  let dir = tmp("undeclared")
  write_files(dir, "docs/connections", ["a.md"])
  write_files(dir, "docs/somethingnew", ["a.md"])
  let un = reach.undeclared(dir)
  assert list.contains(un, "docs/somethingnew")
  assert !list.contains(un, "docs/connections")
  assert string.contains(reach.section(dir), "docs/somethingnew")
}

/// A checkout with no `docs/` at all reports nothing rather than failing.
pub fn a_checkout_with_no_docs_is_quiet_test() {
  let dir = tmp("no-docs")
  assert reach.undeclared(dir) == []
  let f =
    Family(
      dir: "docs/connections",
      produced_by: "connect sessions",
      read_by: Some("the seeder brief"),
      extension: ".md",
    )
  assert reach.count(dir, f) == 0
}

/// The live checkout, against the real families rather than fixtures.
///
/// On 2026-09-10 this found a seventh instance of the row on its first run:
/// `docs/attacks/`, 14 theorist documents, 416 KB, whose only mentions in
/// source are the guard permitting the write and a doc comment. Every earlier
/// instance was found by a person looking for something else. This one was
/// found by the report.
pub fn the_live_checkout_declares_every_docs_directory_test() {
  let root = ".."
  // Not an assertion that nothing is undeclared — `docs/superpowers` is prose
  // rather than an artifact family and is expected here. The assertion is
  // that the two families we know are artifacts ARE declared, so a future
  // rename that drops one shows up as a new undeclared entry.
  let un = reach.undeclared(root)
  assert !list.contains(un, "docs/connections")
  assert !list.contains(un, "docs/attacks")
  let text = reach.section(root)
  assert string.contains(text, "docs/connections")
  assert string.contains(text, "docs/attacks")
}
