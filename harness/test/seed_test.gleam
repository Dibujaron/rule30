//// The route check, including its calibration.
////
//// The calibration tests are the point of this file. A checker that only
//// ever sees good input is a checker nobody has shown to work, and the
//// obvious calibration — run it over the closed nodes — is worthless here,
//// because their routes *are* their proofs and every case passes by
//// construction. So the labelled pair below is one statement with two
//// routes, one known-bad and one known-good, both adjudicated by hand on
//// 2026-09-06 and one of them by a live run that cost $0.97 to learn it.

import envoy
import gleam/string
import harness/seed.{Claimed, NoClaim, Route}
import harness/shell
import simplifile

fn repo() -> String {
  case envoy.get("HARNESS_REPO_ROOT") {
    Ok("") | Error(Nil) -> "C:\\Users\\dibuj\\dev\\rule30"
    Ok(root) -> root
  }
}

fn statements() -> String {
  let assert Ok(source) = simplifile.read(repo() <> "/Rule30/Statements.lean")
  source
}

fn check(lean_name: String, claim: seed.Claim) -> seed.RouteVerdict {
  let assert Ok(lake) = shell.which("lake")
  seed.check_route(repo(), lake, statements(), lean_name, claim)
}

// --- lifting the declaration -------------------------------------------

pub fn lifts_the_declaration_verbatim_test() {
  let assert Ok(d) =
    seed.declaration_without_proof(statements(), "bool_map_iterate_three")
  // Verbatim: the binder is `(f : Bool → Bool)`, a parameter rather than a
  // `∀`. That distinction is the entire bug this module exists to catch, so
  // it is asserted rather than assumed.
  assert d
    == "theorem bool_map_iterate_three (f : Bool → Bool) : f^[3] = f := by"
}

pub fn lifts_a_multi_line_declaration_test() {
  let assert Ok(d) =
    seed.declaration_without_proof(statements(), "evolve_eq_false_of_outside_cone")
  assert string.contains(d, "theorem evolve_eq_false_of_outside_cone")
  assert string.ends_with(d, ":= by")
  // The type wraps, so a one-line assumption would have silently truncated.
  assert string.contains(d, "\n")
}

pub fn does_not_match_a_longer_name_test() {
  let source =
    "theorem evolve_left_edge_two (t : ℕ) : True := by\n  sorry\n"
  assert seed.declaration_without_proof(source, "evolve_left_edge")
    == Error(Nil)
}

pub fn missing_statement_is_reported_test() {
  assert check("not_a_theorem_anywhere", Claimed(Route("rfl", [])))
    == seed.StatementNotFound("not_a_theorem_anywhere")
}

// --- the source that gets elaborated ------------------------------------

pub fn check_source_never_imports_the_statement_file_test() {
  let src =
    seed.check_source("theorem t : True := by", Route("trivial", ["Mathlib.Tactic"]))
  assert string.starts_with(src, "import Rule30.Basic\n")
  assert string.contains(src, "import Mathlib.Tactic")
  assert string.contains(src, "  trivial")
  // A `type_of%`-style check would import this and elaborate the ∀-form,
  // where a route that fails for the worker passes. See the module note.
  assert !string.contains(src, "Rule30.Statements")
}

// --- claiming nothing ---------------------------------------------------

pub fn no_claim_is_not_a_failure_test() {
  // The expected value. A captain owes the reason, not a route.
  assert check("bool_map_iterate_three", NoClaim) == seed.NoRoute
}

// --- calibration: one statement, two routes, opposite verdicts ----------

/// The known negative, and the one that cost real money.
///
/// `by decide` was seeded for this statement with "which the captain
/// confirmed before seeding" attached. The captain had confirmed it for an
/// `example` with a `∀`-bound `f`. Here `f` is a parameter, the goal carries
/// a free variable, and `decide` has nothing to evaluate.
///
/// **A route check that does not flag this is broken.**
pub fn flags_the_route_that_cost_a_rung_test() {
  let assert seed.RouteFailed(out) =
    check("bool_map_iterate_three", Claimed(Route("decide", [])))
  assert string.contains(out, "free variables")
}

/// The known positive, on the same statement, so the only thing that varies
/// is the route. Both halves matter: `revert f` puts the binder back so
/// `decide` has a closed proposition, and `Mathlib.Data.Fintype.Pi` supplies
/// the `Decidable` instance that `Rule30.Basic` alone does not.
pub fn accepts_the_corrected_route_test() {
  assert check(
      "bool_map_iterate_three",
      Claimed(Route("revert f; decide", ["Mathlib.Data.Fintype.Pi"])),
    )
    == seed.RouteClosed
}

/// The second axis, isolated: correct tactics, missing import. This fails
/// with "failed to synthesize Decidable", which reads as though the
/// statement were false rather than as though an import were missing — which
/// is why the `Route` type carries imports at all.
pub fn a_route_without_its_import_fails_test() {
  let assert seed.RouteFailed(out) =
    check("bool_map_iterate_three", Claimed(Route("revert f; decide", [])))
  assert string.contains(out, "Decidable")
}

// --- the falsification witness ------------------------------------------------
//
// The calibration below is labelled the same way the route check's is, and for
// the same reason: a checker that only ever sees input it accepts has not been
// shown to work. Here the labelled negative is not a subtle one — it is a
// witness that evaluates to `false`, which the checker must call `Falsified`
// and must not call anything else.

/// **`#eval false` exits 0.** Measured 2026-09-06 against the real toolchain.
///
/// This is the whole reason `witness_verdict` reads stdout rather than the exit
/// status. A checker built on the status would pass every false statement it
/// was ever given while reporting that it checked them.
pub fn a_false_witness_exits_zero_and_must_still_be_falsified_test() {
  let assert seed.Falsified(_) = seed.witness_verdict("t < 16", 0, "false\n")
}

pub fn a_true_witness_holds_and_keeps_its_range_test() {
  let assert seed.WitnessHolds(range) =
    seed.witness_verdict("t < 16", 0, "true\n")
  assert range == "t < 16"
}

/// A witness that did not elaborate says NOTHING about the statement, so it
/// must not share a verdict with one that evaluated to `false`. Collapsing
/// these two would retract true lemmas on a typo in the witness.
pub fn a_witness_that_does_not_elaborate_is_broken_not_falsified_test() {
  let assert seed.WitnessBroken(_) =
    seed.witness_verdict("t < 16", 1, "error: unknown identifier `foo`")
  // And a zero exit with output that is neither Bool is equally not a verdict
  // about the statement — `#eval` of a non-Bool prints something else entirely.
  let assert seed.WitnessBroken(_) =
    seed.witness_verdict("t < 16", 0, "[1, 2, 3]")
}

/// Exit status alone must never decide. Same output, both statuses, and the
/// status is not what separates them.
pub fn status_zero_does_not_make_a_verdict_test() {
  let assert seed.WitnessBroken(_) = seed.witness_verdict("r", 0, "")
  let assert seed.WitnessBroken(_) = seed.witness_verdict("r", 1, "true")
}

pub fn witness_source_never_imports_the_statement_file_test() {
  let src =
    seed.witness_source(seed.Witness(
      expression: "(List.range 4).all (fun t => centerColumn t == true)",
      imports: [],
      range: "t < 4",
    ))
  assert !string.contains(src, "Rule30.Statements")
  assert string.contains(src, "import Rule30.Basic")
  // The range travels with the source, so a leftover check file says what it
  // was checking.
  assert string.contains(src, "-- range: t < 4")
}

/// The witness calibration, against the real toolchain, and the negative is
/// the point. A checker that only ever sees witnesses it accepts has not been
/// shown to work — and here the negative is cheap to state and impossible to
/// argue with: `centerColumn` is not constantly true, so a witness claiming it
/// is must come back `Falsified`.
fn check_w(expression: String, range: String) -> seed.WitnessVerdict {
  let assert Ok(lake) = shell.which("lake")
  seed.check_witness(
    repo(),
    lake,
    "witness_calibration",
    seed.Claims(seed.Witness(expression:, imports: [], range:)),
    180_000,
  )
}

/// The known positive. `evolve_left_edge` is a closed node, so this is true —
/// and t < 12 is inside the tractable range measured on 2026-09-06.
pub fn a_true_witness_comes_back_holding_test() {
  let assert seed.WitnessHolds(range) =
    check_w("(List.range 12).all (fun t => evolve t (-(t:Int)) == true)", "t < 12")
  assert range == "t < 12"
}

/// **The known negative. A witness checker that does not flag this is broken.**
///
/// `centerColumn` is 1,1,1,0,1,… — not constantly true, and false by t = 3. So
/// `#eval` prints `false`, and it prints it with EXIT STATUS 0, which is the
/// whole reason this test exists rather than being assumed.
pub fn a_false_witness_is_falsified_and_not_a_pass_test() {
  let assert seed.Falsified(_) =
    check_w("(List.range 12).all (fun t => centerColumn t == true)", "t < 12")
}

/// A witness that does not elaborate must not be reported as a statement that
/// is false. Same split as `Denial`: the thing is wrong, versus I could not
/// tell.
pub fn a_witness_that_does_not_compile_is_broken_test() {
  let assert seed.WitnessBroken(_) =
    check_w("(List.range 12).all (fun t => no_such_function t)", "t < 12")
}

pub fn no_witness_is_unchecked_not_a_pass_test() {
  let assert Ok(lake) = shell.which("lake")
  let assert seed.Unchecked(_) =
    seed.check_witness(repo(), lake, "anything", seed.NoWitness, 1000)
}

/// **A timeout is `Unchecked`, never `Falsified`.** The most important line in
/// this module and it had no test until a mutation found the hole: flipping
/// that one arm to `Falsified` killed nothing, so the behaviour was documented
/// at length and defended by nothing.
///
/// It matters more than the other verdicts because the bias runs one way.
/// `List.all` short-circuits, so a FALSE witness returns almost instantly and
/// a TRUE one pays the full 3^t — measured 2026-09-06: t=16 in 12s, t=18 in
/// 84s, t=20 over 120s. So a witness that times out is preferentially a TRUE
/// one, and reading a timeout as a falsification would retract true lemmas
/// exactly where the check is most expensive. Reading it as a pass would be
/// the mirror bug.
///
/// A 100ms budget against a witness that needs seconds of Lean startup alone
/// makes this deterministic without waiting for a real exponential.
pub fn a_timed_out_witness_is_unchecked_not_falsified_test() {
  let assert Ok(lake) = shell.which("lake")
  let verdict =
    seed.check_witness(
      repo(),
      lake,
      "witness_timeout",
      seed.Claims(seed.Witness(
        expression: "(List.range 12).all (fun t => centerColumn t == true)",
        imports: [],
        range: "t < 12",
      )),
      100,
    )
  let assert seed.Unchecked(reason) = verdict
  assert string.contains(does: reason, contain: "timeout")
}

// --- proposals ----------------------------------------------------------------

fn proposal_json(fields: String) -> String {
  "{\"proposals\":[{" <> fields <> "}]}"
}

const full_proposal = "\"id\":\"foo_bar\",\"lean_name\":\"foo_bar\",\"statement\":\"theorem foo_bar : True := by\\n  sorry\",\"reason\":\"True is true.\",\"route\":{\"tactics\":\"trivial\",\"imports\":[]},\"witness\":{\"expression\":\"true\",\"imports\":[],\"range\":\"n/a\"}"

pub fn a_full_proposal_decodes_test() {
  let assert Ok([p]) = seed.decode_proposals(proposal_json(full_proposal))
  assert p.id == "foo_bar"
  let assert seed.Claimed(route) = p.route
  assert route.tactics == "trivial"
  let assert seed.Claims(w) = p.witness
  assert w.range == "n/a"
}

/// **The reason is required.** Settled by measurement rather than taste: across
/// the tier seeded on 2026-09-06, description quality dominated node difficulty
/// as a cost driver. A proposal without one is not a proposal.
pub fn a_proposal_without_a_reason_does_not_decode_test() {
  let assert Error(reason) =
    seed.decode_proposals(proposal_json(
      "\"id\":\"a\",\"lean_name\":\"a\",\"statement\":\"theorem a : True := by\\n  sorry\"",
    ))
  assert string.contains(does: reason, contain: "reason")
}

/// **The route is optional, and absent is a success rather than a gap.**
/// Claiming nothing is strictly better than claiming something unchecked.
pub fn a_proposal_without_a_route_or_witness_decodes_test() {
  let assert Ok([p]) =
    seed.decode_proposals(proposal_json(
      "\"id\":\"a\",\"lean_name\":\"a\",\"statement\":\"theorem a : True := by\\n  sorry\",\"reason\":\"Trivially.\"",
    ))
  let assert seed.NoClaim = p.route
  let assert seed.NoWitness = p.witness
}

/// Loud and located, not lenient — the board lesson applied one file over. A
/// dropped proposal is a node that quietly does not get seeded, and that is
/// indistinguishable from a seeder that wrote fewer proposals.
pub fn a_malformed_proposal_names_its_index_and_does_not_drop_test() {
  let text =
    "{\"proposals\":[{" <> full_proposal <> "},{\"id\":\"bad\"}]}"
  let assert Error(reason) = seed.decode_proposals(text)
  assert string.contains(does: reason, contain: "1")
  assert string.contains(does: reason, contain: "bad")
}
