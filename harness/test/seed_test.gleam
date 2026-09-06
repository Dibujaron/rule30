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
