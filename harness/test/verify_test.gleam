//// The verifier, run against the real toolchain.
////
//// `verify` builds the proof module with `lake build Rule30.Proofs.<Pascal>`,
//// so the fixture file must sit inside a Lean project whose `Rule30.Basic`
//// and `Rule30.Statements` build. That project is `test/fixture-project`
//// (see `lean_fixture`), not the live checkout: its `Rule30/Proofs/` holds
//// no real proof, so the write and the delete below can only ever touch a
//// file this test made. Two runners in one tree still share that
//// directory, and a per-run token in the fixture id keeps them off each
//// other's files.

import gleam/option.{None}
import gleam/string
import harness/dag.{type Node, Node}
import harness/shell
import harness/verify
import lean_fixture
import simplifile

/// The fixture's node id prefix. `dag.proof_path` derives the file name from
/// the *id*, not the `lean_name`, so the id decides which file gets written
/// and then deleted. It is deliberately not `harness_probe`, the
/// `lean_name`, so that the file a fixture writes is always recognisably a
/// fixture's — a killed runner's leftover in `Rule30/Proofs/` says what it
/// is.
const probe_prefix = "harness_probe_fixture"

/// A fixture id nothing else on this machine can be holding: the prefix plus
/// 32 hex characters of CSPRNG, fresh per call.
///
/// The token is what makes concurrent suites in one tree safe, and it is not
/// decoration: a constant id gave every runner one absolute path with no
/// lock on it. Measured, 2026-09-06: a healthy peer's write tripped another
/// suite's "already exists" guard for four spurious failures. The
/// destructive direction is NOT reachable — the `is_file` check below
/// precedes the write and the delete, and a failed `let assert` panics, so a
/// runner that finds a peer's file aborts before it can remove it. What
/// remains is the window where both runners pass that check before either
/// writes; every interleaving of it ends in a failed assertion here rather
/// than a wrong verdict. Loud and spurious, never silent.
///
/// The cost, which is real: litter from a killed runner no longer has one
/// known name. Untidy beats silently wrong.
fn probe_id() -> String {
  probe_prefix <> "_" <> token()
}

/// 32 lowercase hex characters from a CSPRNG. Same source `guard.gleam` uses
/// for its auth token.
@external(erlang, "harness_ffi", "token")
fn token() -> String

/// The statement this fixture proves. Unlike the id, this *must* match a
/// real `Statements.` declaration: `verify` writes
/// `type_of% Statements.<lean_name>` into its check theorem.
const probe_lean_name = "harness_probe"

fn harness_probe(id: String) -> Node {
  Node(
    id:,
    region: "P2",
    lean_name: probe_lean_name,
    description: "",
    deps: [],
    status: dag.Claimed,
    size: dag.S,
    proof_file: None,
    attempts: [],
    verified: None,
    claimed_by: None,
    claimed_at: None,
    claimed_run: None,
  )
}

/// Writes `body` to the fixture path inside the fixture project, runs
/// `verify.verify` against it, and deletes the fixture before returning the
/// verdict — even if the caller's own assertion on the verdict fails, since
/// the delete happens first. `verify` runs its own `lake build` of
/// `Rule30.Statements` and the proof module, so the project need not be
/// built beforehand.
///
/// Refuses to start if the file already exists. A leftover from a killed
/// runner is the expected cause, and the right response is to fail loudly:
/// overwriting it would destroy whatever is there, and this fixture must
/// never be the thing that deletes a file it did not create.
fn verify_with_proof(body: String) -> verify.Verdict {
  let root = lean_fixture.root()
  // One node, built once and used for both the path and the verify call. A
  // fresh `probe_id()` per call would write one file and verify another.
  let node = harness_probe(probe_id())
  let path = root <> "/" <> dag.proof_path(node)
  let assert Ok(_) = simplifile.create_directory_all(root <> "/Rule30/Proofs")
  let assert Ok(False) = simplifile.is_file(path)
  let assert Ok(_) = simplifile.write(path, body)
  let assert Ok(lake) = shell.which("lake")
  let v = verify.verify(root, lake, node)
  let assert Ok(_) = simplifile.delete(path)
  v
}

pub fn accepts_a_real_proof_test() {
  let v =
    verify_with_proof(
      "import Rule30.Basic\ntheorem harness_probe : True := trivial\n",
    )
  assert verify.is_verified(v)
  // The verdict carries the statement's signature as the real toolchain
  // printed it, which is what the annotation writes — so this is the one
  // assertion that ties `statement_of` to Lean's actual output format.
  let assert verify.Verified(statement:, ..) = v
  assert statement == "Statements.harness_probe : True"
}

pub fn rejects_sorry_test() {
  let v =
    verify_with_proof(
      "import Rule30.Basic\ntheorem harness_probe : True := by sorry\n",
    )
  let assert verify.ContainsSorry(_) = v
  Nil
}

pub fn rejects_wrong_statement_test() {
  let v = verify_with_proof("theorem harness_probe : 1 = 1 := rfl\n")
  let assert verify.CheckFailed(out) = v
  assert string.contains(out, "type mismatch") || string.contains(out, "error")
}

pub fn rejects_forbidden_import_test() {
  let v =
    verify_with_proof(
      "import Rule30.Statements\ntheorem harness_probe : True := Statements.harness_probe\n",
    )
  let assert verify.ForbiddenImport(_) = v
  Nil
}

/// The regression guard for the concurrency half of
/// `offline-fixtures-write-into-the-live-checkout`.
///
/// Two runners must never derive the same fixture path. This asserts the
/// property directly rather than trying to stage two suites: if `probe_id`
/// ever goes back to being a constant — which is what it was, and what read
/// as obviously safe — this fails, and nothing else in the file would.
pub fn two_fixture_ids_never_collide_test() {
  assert probe_id() != probe_id()
  // And both are still fixture paths: the prefix is what makes a leftover
  // file recognisable, and it must survive the token.
  assert string.starts_with(probe_id(), probe_prefix <> "_")
}

// --- the check theorem --------------------------------------------------------

fn a_node(lean_name: String) -> Node {
  Node(
    id: "some_node",
    region: "P1",
    lean_name:,
    description: "",
    deps: [],
    status: dag.Claimed,
    size: dag.S,
    proof_file: None,
    attempts: [],
    verified: None,
    claimed_by: None,
    claimed_at: None,
    claimed_run: None,
  )
}

/// **`@` on both sides, and it is load-bearing.**
///
/// Without it a statement carrying implicit or instance binders elaborates as
/// a bare term, Lean inserts those binders as metavariables, and the typeclass
/// problem is stuck. Measured on `{S : Type} [Fintype S]`:
///
///     type_of% stmt  := prf    error: typeclass instance problem is stuck
///                                     Fintype ?m.1
///     type_of% @stmt := @prf   depends on axioms: [propext, Classical.choice,
///                                                  Quot.sound]
///
/// It cost a node and two attempts in run 20260906T230339Z. The worker's proof
/// was correct and `lake build` was green — only the harness's own check
/// failed, so a harness defect was scored as node difficulty and the ladder
/// escalated against it.
pub fn the_check_theorem_makes_binders_explicit_on_both_sides_test() {
  let src = verify.check_source(a_node("isEventuallyPeriodic_of_periodic_step"))
  assert string.contains(
    src,
    "type_of% @Statements.isEventuallyPeriodic_of_periodic_step",
  )
  assert string.contains(src, ":= @isEventuallyPeriodic_of_periodic_step")
  // The bare forms must be gone, not merely accompanied. An `@` added on one
  // side only would still leave the other elaborating with metavariables.
  assert !string.contains(src, "type_of% Statements.")
  assert !string.contains(src, ":= isEventuallyPeriodic")
}

/// The check theorem still imports both modules and still prints axioms —
/// `@` is the only thing that changed, and the rest of the shape is what makes
/// a worker unable to prove something merely NEAR what it was asked for.
pub fn the_check_theorem_keeps_its_shape_test() {
  let src = verify.check_source(a_node("evolve_left_edge"))
  assert string.contains(src, "import Rule30.Statements")
  assert string.contains(src, "#print axioms harness_check")
  assert string.contains(src, "theorem harness_check :")
}

/// The check file prints the statement's signature so the annotation has
/// something to write. It prints the STATEMENT, not the worker's theorem:
/// the two are defeq once the check theorem elaborates, but only the
/// statement's form is the one the captain seeded and a reader can follow.
pub fn the_check_file_prints_the_statement_test() {
  let src = verify.check_source(a_node("evolve_left_edge"))
  assert string.contains(src, "#check Statements.evolve_left_edge\n")
  assert !string.contains(src, "#check evolve_left_edge")
}

// --- the statement out of the check output ------------------------------------

/// Verbatim `lake env lean` output for a closed node, captured 2026-09-07,
/// with a second `#check` line and the axioms line after it — so this is
/// the format the parser has to survive, not the one it was written for.
const real_output = "Statements.evolve_eq_false_of_outside_cone (t : ℕ) (i : ℤ) (h : ↑t < |i|) : evolve t i = false
Statements.evolve_eq_false_of_outside_cone : ∀ (t : ℕ) (i : ℤ), ↑t < |i| → evolve t i = false
'harness_check' depends on axioms: [propext, Quot.sound]
"

pub fn statement_of_takes_the_first_check_line_test() {
  let s = verify.statement_of(real_output, "evolve_eq_false_of_outside_cone")
  assert s
    == "Statements.evolve_eq_false_of_outside_cone (t : ℕ) (i : ℤ) (h : ↑t < |i|) : evolve t i = false"
}

/// Lean wraps a long signature onto indented continuation lines; they are
/// part of the statement, and the unindented axioms line is not.
pub fn statement_of_keeps_wrapped_continuation_lines_test() {
  let out =
    "Statements.long_one (c : Config) (n : ℕ)\n    (h : n < 3) :\n    evolve n 0 = false\n'harness_check' depends on axioms: [propext]\n"
  assert verify.statement_of(out, "long_one")
    == "Statements.long_one (c : Config) (n : ℕ)\n    (h : n < 3) :\n    evolve n 0 = false"
}

/// A name that merely begins with the one sought is a different statement.
pub fn statement_of_does_not_match_a_longer_name_test() {
  let out = "Statements.evolve_left_edge_of_zero (n : ℕ) : True\n"
  assert verify.statement_of(out, "evolve_left_edge") == ""
}

pub fn statement_of_is_empty_when_no_check_line_test() {
  assert verify.statement_of("'harness_check' depends on axioms: []\n", "x")
    == ""
}

// --- the annotation -----------------------------------------------------------

const a_proof = "import Rule30.Basic

/-!
**What this says.** Nothing is black outside the cone.

**Why it is true.** Induction on `t`.

**Where the work is.** The arithmetic of `|i|`.
-/

theorem evolve_left_edge : True := trivial
"

const a_statement = "Statements.evolve_left_edge (t : ℕ) : evolve t (-t) = true"

/// The block lands as the last thing inside the note, under the harness's
/// own heading, and the rest of the file is untouched byte for byte.
pub fn annotated_appends_the_block_inside_the_note_test() {
  let assert Ok(out) = verify.annotated(a_proof, a_statement)
  let expected = "import Rule30.Basic

/-!
**What this says.** Nothing is black outside the cone.

**Why it is true.** Induction on `t`.

**Where the work is.** The arithmetic of `|i|`.

" <> verify.annotation_heading <> "
```lean
" <> a_statement <> "
```
-/

theorem evolve_left_edge : True := trivial
"
  assert out == expected
}

/// Re-verifying a node — a reopen, a second attempt on a closed file —
/// must replace the block, not stack a second one under the first.
pub fn annotated_replaces_an_existing_block_test() {
  let assert Ok(once) = verify.annotated(a_proof, "Statements.old : False")
  let assert Ok(twice) = verify.annotated(once, a_statement)
  let assert Ok(direct) = verify.annotated(a_proof, a_statement)
  assert twice == direct
  assert !string.contains(twice, "Statements.old")
}

pub fn annotated_refuses_a_file_without_a_note_test() {
  let assert Error(reason) =
    verify.annotated(
      "theorem evolve_left_edge : True := trivial\n",
      a_statement,
    )
  assert string.contains(reason, "no /-! note")
}

pub fn annotated_refuses_an_unclosed_note_test() {
  let assert Error(reason) =
    verify.annotated("/-!\n**What this says.** Open forever.\n", a_statement)
  assert string.contains(reason, "never closed")
}

/// An empty statement means the parser found nothing — a harness defect —
/// and the file must not carry an empty block claiming the harness checked
/// something.
pub fn annotated_refuses_an_empty_statement_test() {
  let assert Error(_) = verify.annotated(a_proof, "")
  let assert Error(_) = verify.annotated(a_proof, "   \n")
  Nil
}

/// Lean's block comments nest, so a statement carrying a comment delimiter
/// could move where the note ends and change what the file means. The write
/// that must never alter the verified proof refuses rather than escapes.
pub fn annotated_refuses_comment_delimiters_test() {
  let assert Error(_) = verify.annotated(a_proof, "Statements.x : a -/ b")
  let assert Error(_) = verify.annotated(a_proof, "Statements.x : a /- b")
  let assert Error(_) = verify.annotated(a_proof, "Statements.x : ```")
  Nil
}
