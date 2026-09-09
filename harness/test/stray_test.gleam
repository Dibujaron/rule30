import gleam/int
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import harness/shell
import harness/stray.{type Entry, Assumes, Broken, Clean, Entry, NoTheorems}
import lean_fixture
import simplifile

pub fn theorem_names_reads_declarations_and_not_prose_test() {
  // The failure this exists to stop, and it is one the filer already made
  // by hand: `Rule30/Statements.lean` carries a wrapped doc-comment line
  // that begins with the word `theorem`, and a scan matching on the first
  // word reads it as a declaration named `needs`. Here that would cost more
  // than a wrong count — `#print axioms needs` fails the elaboration, so a
  // file that is perfectly fine gets reported as one that does not compile.
  let source =
    "/-!
This is the sharp form of what `rightDiagonal_period_unbounded` uses: that
theorem needs only *some* failure, while this says which one.
-/
import Mathlib

theorem rule30_translate (n : Nat) : True := by trivial

-- lemma commented_out : False := by sorry

private lemma helper {x : Nat} : x = x := rfl

def notATheorem : Nat := 3
"
  assert stray.theorem_names(source) == ["rule30_translate", "helper"]
}

pub fn theorem_names_survives_a_nested_block_comment_test() {
  // Lean block comments nest, so a depth that toggles rather than counts
  // comes back out of the comment one `-/` early and starts reading prose
  // as code again.
  let source =
    "/- outer /- inner -/ theorem hidden : True := trivial -/
theorem visible : True := trivial
"
  assert stray.theorem_names(source) == ["visible"]
}

pub fn theorem_names_ends_a_name_at_whatever_follows_it_test() {
  let source =
    "theorem plain : True := trivial
theorem with_binder (n : Nat) : True := trivial
theorem with_implicit {n : Nat} : True := trivial
theorem with_instance [Fintype S] : True := trivial
theorem colon_hugging: True := trivial
"
  assert stray.theorem_names(source)
    == [
      "plain", "with_binder", "with_implicit", "with_instance",
      "colon_hugging",
    ]
}

pub fn parse_axioms_reads_every_theorem_not_just_one_test() {
  // `verify.parse_axioms` reads the single line naming `harness_check`,
  // because a node has one theorem by construction. A stray declares its
  // own names and there may be many, so every line counts and the union is
  // what the verdict is judged on.
  let output =
    "'rightDiagonal_first_failure' depends on axioms: [propext, Classical.choice, Quot.sound]
'rule30_translate' does not depend on any axioms
'shaky' depends on axioms: [propext, sorryAx]
"
  let axioms = stray.parse_axioms(output)
  assert list.contains(axioms, "propext")
  assert list.contains(axioms, "Classical.choice")
  assert list.contains(axioms, "Quot.sound")
  assert list.contains(axioms, "sorryAx")
  // Deduplicated: propext is named twice above and counted once.
  assert list.length(axioms) == 4
}

pub fn parse_axioms_of_a_theorem_that_assumes_nothing_is_empty_test() {
  // A theorem proved without choice prints "does not depend on any axioms".
  // That is the good case, not a parse failure, and it must not read as
  // "could not tell".
  assert stray.parse_axioms("'clean' does not depend on any axioms") == []
}

pub fn check_source_appends_a_print_for_each_theorem_test() {
  let out = stray.check_source("theorem a : True := trivial", ["a", "b"])
  assert string.contains(out, "theorem a : True := trivial")
  assert string.contains(out, "#print axioms a")
  assert string.contains(out, "#print axioms b")
  // The original source comes first and is not rewritten: the harness
  // elaborates a copy and never edits somebody's parked proof.
  assert string.starts_with(out, "theorem a : True := trivial")
}

pub fn a_cached_verdict_is_used_only_for_the_bytes_it_was_computed_over_test() {
  // The stale entry is the hazard: a verdict that was true of the file an
  // hour ago, reported as though it were true of the file now. A hash that
  // no longer matches is treated as no entry at all — inert rather than
  // wrong.
  let cache = [
    Entry(
      path: "explorer/scratch.lean",
      hash: "abc",
      verdict: Clean(["rule30_translate"]),
      checked: "2026-09-09T18:00:00Z",
    ),
  ]
  assert stray.lookup(cache, "explorer/scratch.lean", "abc")
    == Some(Clean(["rule30_translate"]))
  assert stray.lookup(cache, "explorer/scratch.lean", "different") == None
  assert stray.lookup(cache, "explorer/other.lean", "abc") == None
}

pub fn put_replaces_the_entry_for_a_path_rather_than_stacking_test() {
  let first =
    Entry("a.lean", "h1", Clean(["one"]), "2026-09-09T18:00:00Z")
  let second =
    Entry("a.lean", "h2", Broken("error: no"), "2026-09-09T19:00:00Z")
  let cache = stray.put(stray.put([], first), second)
  assert list.length(cache) == 1
  assert stray.lookup(cache, "a.lean", "h2") == Some(Broken("error: no"))
  assert stray.lookup(cache, "a.lean", "h1") == None
}

pub fn the_cache_round_trips_every_verdict_test() {
  let cache = [
    Entry("clean.lean", "h1", Clean(["a", "b"]), "2026-09-09T18:00:00Z"),
    Entry(
      "assumes.lean",
      "h2",
      Assumes(["c"], ["sorryAx"]),
      "2026-09-09T18:00:00Z",
    ),
    Entry("broken.lean", "h3", Broken("error: boom"), "2026-09-09T18:00:00Z"),
    Entry("bare.lean", "h4", NoTheorems, "2026-09-09T18:00:00Z"),
  ]
  let path = "build/test-runs/stray/round-trip.json"
  let _ = simplifile.delete(path)
  let assert Ok(Nil) = stray.save(cache, path)
  assert stray.load(path) == cache
}

pub fn an_unreadable_or_corrupt_cache_is_empty_rather_than_fatal_test() {
  // Derived data: a cache that cannot be read costs one sweep to rebuild
  // and must never stop `status` from printing the section.
  assert stray.load("build/test-runs/stray/does-not-exist.json") == []
  let path = "build/test-runs/stray/corrupt.json"
  let _ = simplifile.create_directory_all("build/test-runs/stray")
  let assert Ok(Nil) = simplifile.write(path, "{not json at all")
  assert stray.load(path) == []
}

pub fn a_row_names_itself_so_it_survives_being_read_alone_test() {
  // The whole point of the marker. A reader piping `status` through
  // `tail -6` sees these rows without the header that gives them meaning,
  // which is how a $0.83 proof sat unread in a four-line window for an
  // evening. Every row therefore says what it is on its own.
  let clean = stray.row("explorer/scratch.lean", Some(Clean(["rule30_translate"])))
  assert string.starts_with(clean, "  stray: ")
  assert string.contains(clean, "rule30_translate")
  assert string.contains(clean, "explorer/scratch.lean")

  assert string.contains(
    stray.row("a.lean", Some(Assumes(["t"], ["sorryAx"]))),
    "ASSUMES sorryAx",
  )
  assert string.contains(stray.row("a.lean", None), "unchecked")
  assert string.contains(
    stray.row("a.lean", Some(Broken("error: unknown identifier"))),
    "does not elaborate",
  )
  assert string.contains(stray.row("a.lean", Some(NoTheorems)), "no theorems")
}

pub fn the_hash_is_of_content_and_not_of_the_path_test() {
  // Content, because a checkout, a rebase or a fresh worktree moves every
  // mtime in the tree without changing a byte.
  assert stray.sha256_hex("one") == stray.sha256_hex("one")
  assert stray.sha256_hex("one") != stray.sha256_hex("two")
  assert string.length(stray.sha256_hex("one")) == 64
}

// --- against a real Lean toolchain --------------------------------------------

/// A stray file written into the fixture project's scratch, elaborated by a
/// real `lake env lean`. Nothing here touches the live checkout.
fn stray_file(name: String, source: String) -> #(String, String) {
  let root = lean_fixture.built()
  let dir = root <> "/build/strays"
  let _ = simplifile.create_directory_all(dir)
  let path = dir <> "/" <> name <> ".lean"
  let assert Ok(Nil) = simplifile.write(path, source)
  #(root, path)
}

pub fn a_real_proof_comes_back_clean_with_its_theorem_names_test() {
  // The good case, end to end: elaborate, print the axioms, judge them
  // against the permitted three.
  let #(root, path) =
    stray_file(
      "clean",
      "theorem stray_one : True := trivial\ntheorem stray_two : 1 = 1 := rfl\n",
    )
  let assert Ok(lake) = shell.which("lake")
  assert stray.check(root, lake, path)
    == stray.Clean(["stray_one", "stray_two"])
}

pub fn a_file_resting_on_something_unpermitted_is_not_clean_test() {
  // The verdict that has to be able to come back dirty, or the whole check
  // is a null check. A declared `axiom` is the cleanest way to get there:
  // the file has no `sorry` in it, so the stray sweep's own filter would
  // have let it through, and it still rests on something the project does
  // not permit.
  let #(root, path) =
    stray_file(
      "assumes",
      "axiom the_moon_is_cheese : False\n"
        <> "theorem stray_shaky : False := the_moon_is_cheese\n",
    )
  let assert Ok(lake) = shell.which("lake")
  case stray.check(root, lake, path) {
    stray.Assumes(theorems, axioms) -> {
      assert theorems == ["stray_shaky"]
      assert list.contains(axioms, "the_moon_is_cheese")
    }
    other -> panic as { "expected Assumes, got " <> string.inspect(other) }
  }
}

pub fn a_file_that_does_not_elaborate_says_so_and_names_the_error_test() {
  // Note what Lean does here: it reports the error AND prints
  // `depends on axioms: [sorryAx]` for the recovered declaration. So the
  // axioms alone would call this file dirty-but-elaborated; it is the
  // non-zero exit status that makes it `Broken`, and this test is what
  // holds those two apart.
  let #(root, path) =
    stray_file("broken", "theorem stray_broken : True := no_such_tactic\n")
  let assert Ok(lake) = shell.which("lake")
  case stray.check(root, lake, path) {
    stray.Broken(reason) -> {
      // The message, not the 120 characters of absolute path Lean puts in
      // front of it — a verdict a reader cannot act on is not a verdict.
      assert string.starts_with(reason, "error")
      assert string.contains(reason, "no_such_tactic")
    }
    other -> panic as { "expected Broken, got " <> string.inspect(other) }
  }
}

pub fn a_file_with_only_definitions_is_not_asked_about_axioms_test() {
  // No theorems means nothing to `#print axioms`, and that is a verdict
  // rather than a failure — it must not run Lean at all.
  let #(root, path) = stray_file("bare", "def stray_three : Nat := 3\n")
  let assert Ok(lake) = shell.which("lake")
  assert stray.check(root, lake, path) == stray.NoTheorems
}

pub fn a_sweep_saves_after_every_file_and_not_once_at_the_end_test() {
  // The failure this is the fix for. The sweep runs after a run's summary
  // has printed, so the console says the run is over while it is still
  // working — a reader who interrupts there is doing the ordinary thing.
  // Saving once at the end would throw away every verdict computed so far.
  //
  // The test records the size of the cache at each save, so a batched
  // implementation shows one line and this fails.
  let log = "build/test-runs/stray/saves.txt"
  let _ = simplifile.create_directory_all("build/test-runs/stray")
  let _ = simplifile.delete(log)
  let assert Ok(Nil) = simplifile.write(log, "")

  let entry_for = fn(path) {
    case path {
      "vanished.lean" -> Error(Nil)
      _ ->
        Ok(Entry(
          path: path,
          hash: "h-" <> path,
          verdict: Clean([path]),
          checked: "2026-09-09T19:00:00Z",
        ))
    }
  }
  let save = fn(entries: List(Entry)) {
    let assert Ok(Nil) =
      simplifile.append(log, int.to_string(list.length(entries)) <> "\n")
    Nil
  }

  let out =
    stray.sweep([], ["a.lean", "vanished.lean", "b.lean", "c.lean"], entry_for, save)

  // Three saves, of one, two and three entries: the cache on disk grows as
  // the sweep goes rather than appearing whole at the end.
  let assert Ok(text) = simplifile.read(log)
  assert string.trim(text) == "1\n2\n3"
  // The path that could not be read is skipped, not cached as a verdict.
  assert list.length(out) == 3
  assert stray.lookup(out, "vanished.lean", "h-vanished.lean") == None
}
