//// Tests for the re-verification verb.
////
//// Every test here injects its verifier, so none of them runs Lean. That is
//// the same choice `dispatch_test` makes and for the same reason: a test
//// wired to the real verifier would elaborate this checkout's own proofs
//// against whatever `lake` the test config names, which is slow and is not
//// what any of these are about. The one thing that must be tested against
//// the real toolchain is the SHAPE of Lean's output, and that lives in
//// `verify_test` where the real output is captured.

import gleam/option
import gleam/string
import harness/dag
import harness/reverify
import harness/verify

fn a_node(id: String) -> dag.Node {
  dag.Node(
    id:,
    region: "P2",
    lean_name: id,
    description: "a fixture node",
    deps: [],
    status: dag.Proved,
    size: dag.S,
    proof_file: option.None,
    attempts: [],
    verified: option.None,
    claimed_by: option.None,
    claimed_at: option.None,
    claimed_run: option.None,
    object: option.None,
    under: option.None,
    research: False,
  )
}

/// A file whose note already carries the block, holding `statement`.
fn annotated_file(statement: String) -> String {
  let assert Ok(source) =
    verify.annotated(
      "import Rule30.Basic\n\n/-!\n**What this says.** A thing.\n-/\n\ntheorem t : True := trivial\n",
      statement,
    )
  source
}

const bare_file = "import Rule30.Basic\n\n/-!\n**What this says.** A thing.\n-/\n\ntheorem t : True := trivial\n"

/// An `Env` that verifies to `statement`, reads back `source`, and accepts
/// any write. Tests that must prove nothing was written pass their own
/// `annotate` that panics instead.
fn env_for(statement: String, source: String) -> reverify.Env {
  reverify.Env(
    verifier: fn(_node) {
      verify.Verified(axioms: [], statement: statement, output: "")
    },
    read: fn(_node) { Ok(source) },
    annotate: fn(_node, _statement) { Ok(Nil) },
  )
}

pub fn a_block_that_matches_agrees_test() {
  let statement = "Statements.t : True"
  let env = env_for(statement, annotated_file(statement))
  let assert reverify.Agrees(..) = reverify.one(env, a_node("t"))
  Nil
}

/// The case the verb exists for: the seeded statement changed under a proof
/// that still verifies, so the block is asserting something that is no
/// longer true.
pub fn a_block_that_disagrees_is_drift_test() {
  let env =
    env_for("Statements.t : True", annotated_file("Statements.t : 1 = 1"))
  let assert reverify.Refreshed(before:, after:, ..) =
    reverify.one(env, a_node("t"))
  assert before == "Statements.t : 1 = 1"
  assert after == "Statements.t : True"
}

/// A file with no block gets one — but only from `one`, which verified it a
/// moment ago. This is the path that repairs the two files
/// `verify.statement_of` cost their block.
pub fn a_file_with_no_block_is_annotated_test() {
  let env = env_for("Statements.t : True", bare_file)
  let assert reverify.Annotated(statement:, ..) = reverify.one(env, a_node("t"))
  assert statement == "Statements.t : True"
}

/// A survey never writes. 34 proof files predate the annotation and are not
/// drift; a sweep that backfilled them would put 34 unreviewed blocks in one
/// commit, and a first run that reports 34 findings is a report nobody reads
/// a second time.
pub fn a_survey_reports_an_unannotated_file_and_writes_nothing_test() {
  let env =
    reverify.Env(
      verifier: fn(_n) { verify.Verified(axioms: [], statement: "Statements.t : True", output: "") },
      read: fn(_n) { Ok(bare_file) },
      annotate: fn(_n, _s) { panic as "a survey must never write" },
    )
  let assert reverify.Unannotated(..) = reverify.survey_one(env, a_node("t"))
  Nil
}

/// A survey does not write over drift either, but it does still report it —
/// as `Drifted`, NOT as `Refreshed`. An outcome named after a write that
/// never happened is the exact defect this module exists to fix, and this
/// test is here so nobody quietly collapses the two variants back together.
pub fn a_survey_reports_drift_without_writing_test() {
  let env =
    reverify.Env(
      verifier: fn(_n) { verify.Verified(axioms: [], statement: "Statements.t : True", output: "") },
      read: fn(_n) { Ok(annotated_file("Statements.t : 1 = 1")) },
      annotate: fn(_n, _s) { panic as "a survey must never write" },
    )
  let assert reverify.Drifted(before:, after:, ..) =
    reverify.survey_one(env, a_node("t"))
  assert before == "Statements.t : 1 = 1"
  assert after == "Statements.t : True"
  Nil
}

/// A proof that no longer verifies leaves its block ALONE. A stale block is
/// misleading; replacing it on the strength of a failed check would be
/// worse, because the replacement would carry the harness's authority with
/// nothing behind it.
pub fn a_failed_check_does_not_touch_the_block_test() {
  let env =
    reverify.Env(
      verifier: fn(_n) { verify.CheckFailed("type mismatch") },
      read: fn(_n) { panic as "must not even read on a failed check" },
      annotate: fn(_n, _s) { panic as "must never write on a failed check" },
    )
  let assert reverify.Failed(..) = reverify.one(env, a_node("t"))
  Nil
}

/// Verified, but the check printed no signature — the defect that caused
/// this module to exist. It must be reported as a harness fault and must not
/// be confused with a file that simply has no block.
pub fn a_verified_node_with_no_signature_is_its_own_outcome_test() {
  let env =
    reverify.Env(
      verifier: fn(_n) { verify.Verified(axioms: [], statement: "", output: "") },
      read: fn(_n) { panic as "nothing to reconcile without a signature" },
      annotate: fn(_n, _s) { panic as "must never write an empty block" },
    )
  let assert reverify.NoStatement(..) = reverify.one(env, a_node("t"))
  Nil
}

/// A refused write is reported, not swallowed. `annotated` refuses a
/// statement carrying comment or fence delimiters, and that refusal must
/// reach the reader rather than looking like a successful refresh.
pub fn a_refused_write_is_reported_test() {
  let env =
    reverify.Env(
      verifier: fn(_n) { verify.Verified(axioms: [], statement: "Statements.t : True", output: "") },
      read: fn(_n) { Ok(bare_file) },
      annotate: fn(_n, _s) { Error("the statement contains comment delimiters") },
    )
  let assert reverify.NotWritten(reason:, ..) = reverify.one(env, a_node("t"))
  assert string.contains(reason, "comment delimiters")
}

// --- the report ---------------------------------------------------------------

/// `agrees` and `unannotated` are not findings; everything else is. A report
/// whose count includes the healthy cases is a count nobody can act on.
pub fn the_tally_counts_only_what_needs_attention_test() {
  let out =
    reverify.report([
      reverify.Agrees(a_node("a")),
      reverify.Unannotated(a_node("b"), "Statements.b : True"),
      reverify.Refreshed(a_node("c"), "was", "now"),
    ])
  assert string.contains(out, "3 node(s) re-verified, 1 needing attention")
}

/// Drift is the one line meaning a file is currently asserting something
/// untrue, so it is named in a way a reader cannot skim past.
pub fn drift_is_named_loudly_test() {
  let out = reverify.report([reverify.Refreshed(a_node("c"), "was", "now")])
  assert string.contains(out, "DRIFTED")
}

/// A wrapped signature folds onto one line in the report — the shape that
/// broke `statement_of` is exactly the shape a report has to survive.
pub fn a_wrapped_signature_folds_onto_one_report_line_test() {
  let wrapped = "Statements.t\n  (h : True)\n  (k : Nat) : True"
  let out = reverify.report([reverify.Annotated(a_node("t"), wrapped)])
  assert string.contains(out, "Statements.t (h : True) (k : Nat) : True")
}
