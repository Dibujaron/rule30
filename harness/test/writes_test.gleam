//// The writer set, checked against the real source rather than a fixture.
////
//// Two of these run against `harness/src` itself on purpose. The bug this
//// module answers is that a *remembered* list drifts behind the code, so a
//// test that asks a fixture whether the list is right would reproduce the
//// defect rather than catch it — the fixture is another copy nobody diffs.
////
//// The fixture tests below exist for the opposite reason: to show the checks
//// can fail. A backstop that is green because it never fires is worth less
//// than no backstop, because it is also a claim.

import gleam/list
import gleam/string
import harness/writes.{type Site, type Written}
import simplifile

/// The real source tree, found relative to wherever the runner started.
///
/// Deliberately NOT `HARNESS_REPO_ROOT`: unlike `verify_test`, these tests
/// must read the source of the code that is *running*, not of some other
/// checkout. Pointing them at the shared checkout from a worktree would
/// happily pass while the branch under test had grown a new writer, which is
/// the exact silence this module exists to break.
fn src_root() -> String {
  case simplifile.is_directory("src/harness") {
    Ok(True) -> "src"
    _ -> "harness/src"
  }
}

/// Every declared file must have at least one live call site.
///
/// This is the half that catches a *stale* entry: rename `dag.save` and the
/// declaration keeps naming a function nobody calls, which is the same
/// silence as a freeze list that has fallen behind. `writes.report` prints a
/// loud line for this case too; the test is so nobody has to be running the
/// command to find out.
pub fn every_declared_file_has_a_live_writer_test() {
  let root = src_root()
  let empty =
    writes.declared()
    |> list.filter(fn(w) {
      let assert Ok(found) =
        list.try_map(w.writers, fn(name) { writes.sites(root, name) })
      list.flatten(found) == []
    })
    |> list.map(fn(w: Written) { w.what })
  assert empty == []
}

/// The real source contains no raw `simplifile` write outside the modules
/// `writes.implementations` accounts for.
///
/// This is the half that catches a *new* writer, which is the direction the
/// bug actually failed in: `blueprint/bugs.json` became dispatcher-written
/// and no list was told.
pub fn the_real_source_has_no_undeclared_writers_test() {
  let assert Ok(loose) = writes.unaccounted(src_root())
  assert loose == []
}

/// `bugs.save` really is called from `dispatch.gleam`, which is the exact
/// drift that produced the bug: the dispatcher gained a writer to the board
/// and every freeze announcement that afternoon still named only the DAG.
///
/// Pinned as a test rather than trusted from the report, because the report
/// is only run by someone who already suspects something.
pub fn the_dispatcher_is_still_a_writer_of_the_bug_board_test() {
  let assert Ok(found) = writes.sites(src_root(), "bugs.save")
  let modules = list.map(found, fn(s: Site) { s.module }) |> list.unique
  assert list.contains(modules, "harness/dispatch.gleam")
}

// --- showing the checks can fail ---------------------------------------------

/// A module outside the declared implementations, writing to disk, must be
/// reported. Without this test `the_real_source_has_no_undeclared_writers`
/// is green whether or not `unaccounted` does anything at all.
pub fn an_undeclared_writer_is_reported_test() {
  let root = "build/test-runs/writes-fixture/src"
  let _ = simplifile.delete("build/test-runs/writes-fixture")
  let assert Ok(_) = simplifile.create_directory_all(root <> "/harness")
  let assert Ok(_) =
    simplifile.write(
      root <> "/harness/newcomer.gleam",
      "pub fn save(p: String) {\n  simplifile.write(p, \"x\")\n}\n",
    )
  let assert Ok(loose) = writes.unaccounted(root)
  assert list.map(loose, fn(s: Site) { s.module }) == ["harness/newcomer.gleam"]
}

/// A module that only *talks* about writing is not a writer. This is the
/// false positive the scan produced on its first run, against `writes.gleam`
/// itself, which names every write token as data.
pub fn a_module_that_only_names_the_tokens_is_not_a_writer_test() {
  let root = "build/test-runs/writes-prose/src"
  let _ = simplifile.delete("build/test-runs/writes-prose")
  let assert Ok(_) = simplifile.create_directory_all(root <> "/harness")
  let assert Ok(_) =
    simplifile.write(
      root <> "/harness/talker.gleam",
      "//// This module explains simplifile.write to the reader.\n"
        <> "const tokens = [\n"
        <> "  \"simplifile.write\",\n"
        <> "]\n",
    )
  let assert Ok(loose) = writes.unaccounted(root)
  assert loose == []
}

/// A function's own declaration is not a call site. Left unfiltered, every
/// writer's `fn` line appeared in the report as though it were a caller, and
/// a report padded with rows that are not call sites is one nobody reads
/// closely enough to notice a real one appear.
pub fn a_declaration_is_not_a_call_site_test() {
  let root = "build/test-runs/writes-decl/src"
  let _ = simplifile.delete("build/test-runs/writes-decl")
  let assert Ok(_) = simplifile.create_directory_all(root <> "/harness")
  let assert Ok(_) =
    simplifile.write(
      root <> "/harness/thing.gleam",
      "pub fn save(p: String) {\n  Nil\n}\n\npub fn go() {\n  save(\"x\")\n}\n",
    )
  let assert Ok(found) = writes.sites(root, "save")
  assert list.map(found, fn(s: Site) { s.line }) == [6]
}

/// The report names every declared file, so a reader who runs it during a
/// freeze gets the whole set rather than whichever entries happened to
/// resolve.
pub fn the_report_names_every_declared_file_test() {
  let root = src_root()
  let assert Ok(text) = writes.report_from(root)
  list.each(writes.declared(), fn(w: Written) {
    assert string.contains(text, w.what)
  })
}
