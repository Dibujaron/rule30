//// The route check, including its calibration.
////
//// The calibration tests are the point of this file. A checker that only
//// ever sees good input is a checker nobody has shown to work, and the
//// obvious calibration — run it over the closed nodes — is worthless here,
//// because their routes *are* their proofs and every case passes by
//// construction. So the labelled pair below is one statement with two
//// routes, one known-bad and one known-good, both adjudicated by hand on
//// 2026-09-06 and one of them by a live run that cost $0.97 to learn it.

import gleam/option
import gleam/string
import harness/dag
import harness/seed.{Claimed, NoClaim, Route}
import harness/shell
import lean_fixture
import simplifile

/// The Mathlib-free fixture project (see `lean_fixture`), whose
/// `Rule30/Statements.lean` carries the declarations these tests lift and
/// whose `Rule30/Basic.lean` is what their routes and witnesses elaborate
/// against. Tests that hand `lake` to Lean use `lean_fixture.built()`
/// instead, since `lake env lean` builds nothing for itself.
fn repo() -> String {
  lean_fixture.root()
}

fn statements() -> String {
  let assert Ok(source) = simplifile.read(repo() <> "/Rule30/Statements.lean")
  source
}

fn check(lean_name: String, claim: seed.Claim) -> seed.RouteVerdict {
  let assert Ok(lake) = shell.which("lake")
  seed.check_route(lean_fixture.built(), lake, statements(), lean_name, claim)
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
    seed.declaration_without_proof(
      statements(),
      "evolve_eq_false_of_outside_cone",
    )
  assert string.contains(d, "theorem evolve_eq_false_of_outside_cone")
  assert string.ends_with(d, ":= by")
  // The type wraps, so a one-line assumption would have silently truncated.
  assert string.contains(d, "\n")
}

pub fn does_not_match_a_longer_name_test() {
  let source = "theorem evolve_left_edge_two (t : ℕ) : True := by\n  sorry\n"
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
    seed.check_source(
      "theorem t : True := by",
      Route("trivial", ["Mathlib.Tactic"]),
    )
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
/// `decide` has a closed proposition, and an import supplies the `Decidable`
/// instance that `Rule30.Basic` alone does not — `Mathlib.Data.Fintype.Pi`
/// in the real project, `Rule30.FintypePi` in the fixture project.
pub fn accepts_the_corrected_route_test() {
  assert check(
      "bool_map_iterate_three",
      Claimed(Route("revert f; decide", ["Rule30.FintypePi"])),
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

/// **A route of `sorry` elaborates with EXIT 0.** Measured 2026-09-06 against
/// `leanprover/lean4:v4.33.1`: the only sign is the line
/// `warning: declaration uses \`sorry\``. So a route check that read the exit
/// status alone would call this closed — which is `sorry`'s founding failure
/// mode, a success report over nothing, at the statement gate. The verdict is
/// its own arm so a reader cannot take it for a tactic that merely failed.
pub fn a_sorry_route_is_not_closed_test() {
  let assert seed.RouteUsesSorry(out) =
    check("bool_map_iterate_three", Claimed(Route("sorry", [])))
  assert string.contains(out, "declaration uses `sorry`")
}

pub fn the_report_names_a_sorry_route_as_such_test() {
  let out =
    seed.report([
      seed.Checked(
        proposal: a_proposal("eta"),
        route: seed.RouteUsesSorry("warning: declaration uses `sorry`"),
        witness: seed.Unchecked("no witness supplied"),
      ),
    ])
  assert string.contains(out, "DOES NOT CLOSE")
  assert string.contains(out, "`sorry`")
}

// --- which text a proposal's route is checked against -----------------------
//
// A proposal's `statement` is the declaration as the seeder wants it landed,
// and Rowan lands it by hand, so there are two texts and nothing in the
// harness makes them the same. The route check picks the seeded text when the
// two agree byte for byte, the proposal's own text when the name is not yet
// seeded, and NEITHER when they disagree — because that disagreement is the
// bug: a route confirmed against the ∀-form and seeded with a parameter.

const seeded_bool_map = "theorem bool_map_iterate_three (f : Bool → Bool) : f^[3] = f := by"

/// The paraphrase from the bug report, as a proposal would carry it: the
/// same name, the same theorem, `f` bound by `∀` instead of as a parameter.
const paraphrased_bool_map = "theorem bool_map_iterate_three : ∀ f : Bool → Bool, f^[3] = f := by"

pub fn an_unseeded_proposal_is_checked_on_its_own_text_test() {
  assert seed.declaration_to_check(
      "theorem not_yet_seeded_anywhere : True := by\n  sorry",
      statements(),
      "not_yet_seeded_anywhere",
    )
    == Ok("theorem not_yet_seeded_anywhere : True := by")
}

pub fn a_proposal_landed_byte_for_byte_is_checked_on_the_seeded_text_test() {
  assert seed.declaration_to_check(
      seeded_bool_map <> "\n  sorry\n",
      statements(),
      "bool_map_iterate_three",
    )
    == Ok(seeded_bool_map)
}

/// **The check that would have caught the original.** The captain's scratch
/// text and the seeded text differ only in how `f` is bound, and that is
/// exactly the difference that flipped `by decide` from passing to failing.
/// Neither text is elaborated: a verdict on either would be about the other's
/// object. Both texts come back so the report can show which bytes moved.
pub fn a_paraphrase_of_the_seeded_text_is_refused_not_checked_test() {
  assert seed.declaration_to_check(
      paraphrased_bool_map <> "\n  sorry",
      statements(),
      "bool_map_iterate_three",
    )
    == Error(seed.SeededTextDiffers(
      proposed: paraphrased_bool_map,
      seeded: seeded_bool_map,
    ))
}

pub fn a_proposal_whose_statement_is_not_a_declaration_is_not_found_test() {
  // Just the type, no `theorem <name> ... := by` and no `sorry` line: there
  // is nothing to lift, and the verdict says so rather than elaborating a
  // guess at what the seeder meant.
  assert seed.declaration_to_check(
      "∀ f : Bool → Bool, f^[3] = f",
      statements(),
      "bool_map_iterate_three",
    )
    == Error(seed.StatementNotFound("bool_map_iterate_three"))
}

/// Through `check_proposal`, with a `lake` that does not exist: if the route
/// were elaborated at all this would come back `RouteFailed` from the shell,
/// so the verdict doubles as proof that no Lean ran.
pub fn check_proposal_refuses_the_wrong_object_before_running_lean_test() {
  let checked =
    seed.check_proposal(
      repo(),
      "this-is-not-lake",
      statements(),
      seed.Proposal(
        ..a_proposal("bool_map_iterate_three"),
        statement: paraphrased_bool_map <> "\n  sorry",
        route: Claimed(Route("decide", [])),
      ),
      1000,
    )
  assert checked.route
    == seed.SeededTextDiffers(
      proposed: paraphrased_bool_map,
      seeded: seeded_bool_map,
    )
}

pub fn a_proposal_with_no_route_is_not_compared_test() {
  // Nothing was claimed, so nothing was checked against anything, and the
  // route column says exactly that even when the texts disagree.
  let checked =
    seed.check_proposal(
      repo(),
      "this-is-not-lake",
      statements(),
      seed.Proposal(
        ..a_proposal("bool_map_iterate_three"),
        statement: paraphrased_bool_map <> "\n  sorry",
      ),
      1000,
    )
  assert checked.route == seed.NoRoute
}

pub fn the_report_names_a_route_checked_against_the_wrong_object_test() {
  let out =
    seed.report([
      seed.Checked(
        proposal: a_proposal("theta"),
        route: seed.SeededTextDiffers(
          proposed: paraphrased_bool_map,
          seeded: seeded_bool_map,
        ),
        witness: seed.Unchecked("no witness supplied"),
      ),
    ])
  assert string.contains(out, "WRONG OBJECT")
  assert string.contains(out, "not elaborated")
  assert string.contains(out, paraphrased_bool_map)
  assert string.contains(out, seeded_bool_map)
  assert string.contains(out, "1 wrong object")
}

/// Against the real toolchain: the corrected route, on a proposal whose text
/// is the seeded text byte for byte, closes through `check_proposal` exactly
/// as it does through `check_route`.
pub fn a_proposal_landed_byte_for_byte_closes_on_the_corrected_route_test() {
  let assert Ok(lake) = shell.which("lake")
  let checked =
    seed.check_proposal(
      lean_fixture.built(),
      lake,
      statements(),
      seed.Proposal(
        ..a_proposal("bool_map_iterate_three"),
        statement: seeded_bool_map <> "\n  sorry",
        route: Claimed(Route("revert f; decide", ["Rule30.FintypePi"])),
      ),
      180_000,
    )
  assert checked.route == seed.RouteClosed
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
///
/// `statement` is what the witness is judged as being ABOUT; a witness naming
/// nothing from it is refused before Lean runs, so each calibration below
/// supplies a statement that names what its witness evaluates.
fn check_w(
  statement: String,
  expression: String,
  range: String,
) -> seed.WitnessVerdict {
  let assert Ok(lake) = shell.which("lake")
  seed.check_witness(
    lean_fixture.built(),
    lake,
    "witness_calibration",
    statement,
    seed.Claims(seed.Witness(expression:, imports: [], range:)),
    180_000,
  )
}

const evolve_statement = "theorem witness_calibration (t : ℕ) : evolve t (-(t:Int)) = true := by\n  sorry"

const center_statement = "theorem witness_calibration (t : ℕ) : centerColumn t = true := by\n  sorry"

/// The known positive. `evolve_left_edge` is a closed node, so this is true —
/// and t < 12 is inside the tractable range measured on 2026-09-06.
pub fn a_true_witness_comes_back_holding_test() {
  let assert seed.WitnessHolds(range) =
    check_w(
      evolve_statement,
      "(List.range 12).all (fun t => evolve t (-(t:Int)) == true)",
      "t < 12",
    )
  assert range == "t < 12"
}

/// **The known negative. A witness checker that does not flag this is broken.**
///
/// `centerColumn` is 1,1,0,1,1,1,0,… — not constantly true, and false at t = 2. So
/// `#eval` prints `false`, and it prints it with EXIT STATUS 0, which is the
/// whole reason this test exists rather than being assumed.
pub fn a_false_witness_is_falsified_and_not_a_pass_test() {
  let assert seed.Falsified(_) =
    check_w(
      center_statement,
      "(List.range 12).all (fun t => centerColumn t == true)",
      "t < 12",
    )
}

/// A witness that does not elaborate must not be reported as a statement that
/// is false. Same split as `Denial`: the thing is wrong, versus I could not
/// tell.
///
/// The statement names `no_such_function` too, so the witness gets past the
/// placeholder check and the thing under test is Lean's verdict, not ours.
pub fn a_witness_that_does_not_compile_is_broken_test() {
  let assert seed.WitnessBroken(_) =
    check_w(
      "theorem witness_calibration (t : ℕ) : no_such_function t = true := by\n  sorry",
      "(List.range 12).all (fun t => no_such_function t)",
      "t < 12",
    )
}

pub fn no_witness_is_unchecked_not_a_pass_test() {
  let assert Ok(lake) = shell.which("lake")
  let assert seed.Unchecked(_) =
    seed.check_witness(
      repo(),
      lake,
      "anything",
      center_statement,
      seed.NoWitness,
      1000,
    )
}

// --- placeholder witnesses ----------------------------------------------------
//
// A witness of `true` passes every checker that could ever be written — it
// evaluates to `true` because it IS `true` — and Rowan nearly seeded two walls
// with it as a stand-in. Nothing about exit status or stdout can catch it, so
// it is caught before Lean runs, by asking whether the expression mentions
// anything the statement is about.

/// **The literal `true` is refused, and refused without running Lean.** The
/// verdict is `WitnessPlaceholder`, not `Unchecked` — unchecked says the check
/// could not be done, this says the witness was never about the statement.
/// The 1 ms budget proves no Lean ran: a real check would time out on it.
pub fn a_literal_true_witness_is_refused_as_a_placeholder_test() {
  let assert Ok(lake) = shell.which("lake")
  let assert seed.WitnessPlaceholder(expression) =
    seed.check_witness(
      repo(),
      lake,
      "witness_calibration",
      center_statement,
      seed.Claims(seed.Witness(expression: "true", imports: [], range: "n/a")),
      1,
    )
  assert expression == "true"
}

/// A witness that names the statement's definition is not a placeholder, and
/// the refusal must not fire on it — a check that refused real witnesses
/// would be routed around by the next seeder in an afternoon.
pub fn a_witness_naming_the_statements_definition_is_not_refused_test() {
  assert seed.names_the_statement(
    "(List.range 12).all (fun t => centerColumn t == true)",
    "witness_calibration",
    center_statement,
  )
  // The lean_name alone counts too.
  assert seed.names_the_statement(
    "witness_calibration",
    "witness_calibration",
    "",
  )
}

/// Whole tokens, not substrings. `centerColumnDensity` contains `centerColumn`
/// and is a different definition; a substring check would let a witness about
/// the density stand in for one about the column.
pub fn a_longer_identifier_does_not_count_as_mentioning_a_shorter_one_test() {
  assert !seed.names_the_statement(
    "centerColumnDensity 100 == 50",
    "witness_calibration",
    center_statement,
  )
  // And the other way round: the statement's `evolve_left_edge_holds` is not
  // a mention of `evolve`.
  assert !seed.names_the_statement(
    "evolve 3 0",
    "evolve_left_edge",
    "theorem evolve_left_edge : evolve_left_edge_holds = true := by\n  sorry",
  )
}

/// The stoplist is what makes `true` a placeholder even when the statement
/// says `= true`: keywords, `Bool` literals and core types are in nearly every
/// statement and name none of them. Binders are single letters here and are
/// dropped for the same reason — `fun t => true` mentions `t` and nothing.
/// What survives is every name specific to this statement, and the theorem's
/// own name is one of them: it is a token of the statement text like any
/// other, so it is kept here and not only added by `names_the_statement`.
pub fn keywords_literals_and_binders_are_not_names_test() {
  assert seed.statement_names(center_statement)
    == ["witness_calibration", "centerColumn"]
  assert !seed.names_the_statement(
    "(List.range 4).all (fun t => true)",
    "witness_calibration",
    center_statement,
  )
}

pub fn identifiers_split_on_everything_but_identifier_characters_test() {
  assert seed.identifiers("(List.range 4).all (fun t => f^[3] = f')")
    == ["List", "range", "4", "all", "fun", "t", "f", "3", "f'"]
}

/// The report must say the witness was refused and why, and must not count it
/// as unchecked — an unchecked row invites a bigger timeout, a placeholder row
/// invites a real witness.
pub fn the_report_names_a_placeholder_witness_test() {
  let out =
    seed.report([
      seed.Checked(
        proposal: a_proposal("theta"),
        route: seed.NoRoute,
        witness: seed.WitnessPlaceholder("true"),
      ),
    ])
  assert string.contains(out, "PLACEHOLDER")
  assert string.contains(out, "names nothing from the statement")
  assert string.contains(out, "1 placeholder")
  assert !string.contains(out, "unchecked")
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
      lean_fixture.built(),
      lake,
      "witness_timeout",
      center_statement,
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

/// A complete proposal. The witness names `centerColumn`, which the statement
/// is about — this fixture used to carry the literal `true`, which is exactly
/// the placeholder the checker now refuses. It is only ever decoded, never
/// handed to Lean, so `route` and `range` are pinned by the decode test below
/// and are not claims about what elaborates.
const full_proposal = "\"id\":\"foo_bar\",\"lean_name\":\"foo_bar\",\"statement\":\"theorem foo_bar : centerColumn 0 = true := by\\n  sorry\",\"reason\":\"The centre cell starts on.\",\"route\":{\"tactics\":\"trivial\",\"imports\":[]},\"witness\":{\"expression\":\"centerColumn 0 == true\",\"imports\":[],\"range\":\"n/a\"}"

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
  let text = "{\"proposals\":[{" <> full_proposal <> "},{\"id\":\"bad\"}]}"
  let assert Error(reason) = seed.decode_proposals(text)
  assert string.contains(does: reason, contain: "1")
  assert string.contains(does: reason, contain: "bad")
}

// --- the proposal report ------------------------------------------------------

fn a_proposal(id: String) -> seed.Proposal {
  seed.Proposal(
    id:,
    lean_name: id,
    statement: "theorem " <> id <> " : True := by\n  sorry",
    reason: "Because.",
    disclaims: "",
    route: seed.NoClaim,
    witness: seed.NoWitness,
  )
}

/// **An unchecked proposal must be visible as unchecked**, not absent from the
/// report and not indistinguishable from a checked one. The whole value of the
/// witness is that its coverage is partial and stated; a report that quietly
/// omitted what it could not check would restore exactly the false confidence
/// the check was built to remove.
pub fn the_report_names_an_unchecked_proposal_test() {
  let out =
    seed.report([
      seed.Checked(
        proposal: a_proposal("alpha"),
        route: seed.NoRoute,
        witness: seed.Unchecked("no witness supplied"),
      ),
    ])
  assert string.contains(out, "alpha")
  // The specific rendering, not merely the word: the SUMMARY line also says
  // "1 unchecked", so asserting on the word alone passes even when the
  // proposal's own line reads "ok". That is how this test was written first
  // and a mutation caught it — the assertion has to name text that only the
  // per-proposal line can produce.
  assert string.contains(out, "unchecked — no witness supplied")
}

/// `Falsified` and `WitnessBroken` must not read the same in the report
/// either. One says the statement is false; the other says the check is, and
/// says nothing about the statement.
pub fn the_report_distinguishes_falsified_from_broken_test() {
  let broken =
    seed.report([
      seed.Checked(
        proposal: a_proposal("gamma"),
        route: seed.NoRoute,
        witness: seed.WitnessBroken("unknown identifier"),
      ),
    ])
  assert string.contains(broken, "says nothing about the statement")
  // The load-bearing negative. A broken check must never render as a claim
  // about the subject — collapsing these is what would retract a true lemma
  // on a typo, and the report is the last place a reader could catch it.
  assert !string.contains(broken, "the statement is false")

  let falsified =
    seed.report([
      seed.Checked(
        proposal: a_proposal("beta"),
        route: seed.NoRoute,
        witness: seed.Falsified("false"),
      ),
    ])
  assert string.contains(falsified, "the statement is false")
  assert !string.contains(falsified, "says nothing about the statement")
}

/// A falsified statement is the one result that must be impossible to skim
/// past: it means a captain proposed something untrue.
pub fn the_report_summarises_what_needs_attention_test() {
  let out =
    seed.report([
      seed.Checked(
        proposal: a_proposal("delta"),
        route: seed.NoRoute,
        witness: seed.WitnessHolds("t < 12"),
      ),
      seed.Checked(
        proposal: a_proposal("epsilon"),
        route: seed.NoRoute,
        witness: seed.Falsified("false"),
      ),
    ])
  // The range a passing witness covered travels with it — a pass is only ever
  // evidence about the range it searched.
  assert string.contains(out, "t < 12")
  assert string.contains(does: string.lowercase(out), contain: "1 falsified")
}

// --- the seeder's brief -------------------------------------------------------
//
// The ticket's own words: "the brief is where the quality lives, and it is the
// part worth spending on." The morning pass that produced a good tier worked
// because the captain had read every proof and knew which shapes close cheaply.
// A fresh session has none of that unless the brief carries it.
//
// So these tests are mostly about what the brief must NOT leave out. A missing
// section does not fail anything — it produces a worse tier a day later, which
// is the least checkable failure this project has.

fn closed_node(
  id: String,
  size: dag.Size,
  model: String,
  cost: Float,
) -> dag.Node {
  dag.Node(
    id:,
    region: "P1",
    lean_name: id,
    description: "the reason this node was worth proving",
    deps: [],
    status: dag.Proved,
    size:,
    proof_file: option.Some("Rule30/Proofs/X.lean"),
    attempts: [
      dag.Attempt(
        identity: "Vesper",
        session_id: "s",
        model:,
        started: "t0",
        ended: "t1",
        outcome: dag.Closed,
        estimate: size,
        reported: True,
        cost_usd: cost,
        turns: 9,
        notes: "VERIFIED",
      ),
    ],
    verified: option.None,
    claimed_by: option.None,
    claimed_at: option.None,
    claimed_run: option.None,
    object: option.None,
    research: False,
  )
}

/// An open node, the shape the seeder is aiming at. The description is
/// multi-line on purpose: a wall's description runs to a paragraph or two
/// and the brief must carry all of it.
fn open_node(id: String, size: dag.Size, deps: List(String)) -> dag.Node {
  dag.Node(
    ..closed_node(id, size, "-", 0.0),
    description: "WALL. What a decomposition must imply.\nAnd what was measured: periods 1, 1, 2 to k = 400.",
    deps:,
    status: dag.Open,
    proof_file: option.None,
    attempts: [],
  )
}

fn brief() -> String {
  seed.brief(
    open: [
      open_node("leftDiagonal_period_le", dag.Wall, []),
      open_node("some_leaf", dag.S, ["evolve_left_edge", "centerColumn_zero"]),
    ],
    closed: [
      closed_node("evolve_left_edge", dag.M, "sonnet", 0.36),
      closed_node("centerColumn_zero", dag.S, "haiku", 0.1),
    ],
    notes: [#("EvolveLeftEdge.lean", "**What this says.** The left edge is 1.")],
    crystals: Ok("# Seed crystals\n\nCandidate statements for future tiers."),
    explorer_readme: "the BigInt engine",
    proposal_path: "C:/r/blueprint/proposals/next.json",
    region: option.None,
  )
}

/// The same node in P2. The fixture's nodes are all P1, as the real board's
/// walls are, so a regional test needs one of each.
fn in_p2(node: dag.Node) -> dag.Node {
  dag.Node(..node, region: "P2")
}

/// A board with one open and one closed node in each of P1 and P2, briefed
/// for `region`.
fn two_region_brief(region: option.Option(String)) -> String {
  seed.brief(
    open: [
      open_node("leftDiagonal_period_le", dag.Wall, []),
      in_p2(open_node("density_wall", dag.Wall, [])),
    ],
    closed: [
      closed_node("evolve_left_edge", dag.M, "sonnet", 0.36),
      in_p2(closed_node("centerColumnDensity_nonneg", dag.S, "haiku", 0.1)),
    ],
    notes: [],
    crystals: Error(Nil),
    explorer_readme: "",
    proposal_path: "p",
    region:,
  )
}

/// The text under one `## ` heading of the brief, up to the next one. The
/// open and closed sections both name node ids, so a test about what ONE of
/// them lists has to look inside that one section and not the whole brief.
fn section(brief: String, heading: String) -> String {
  let assert Ok(#(_, after)) = string.split_once(brief, "\n" <> heading <> "\n")
  case string.split_once(after, "\n## ") {
    Ok(#(body, _)) -> body
    Error(Nil) -> after
  }
}

/// **The brief names what to aim at.** Rowan, about to hand-start the first
/// seeder against the four walls, found that the brief said "aim at what a
/// prize residual would need" and then listed 42 closed proofs and nothing
/// open — a target described and never named. The open nodes ARE the
/// residuals, and a wall's description is the specification of the tier, so
/// it is carried verbatim: id, size, deps, and every line of the description.
pub fn the_brief_lists_every_open_node_verbatim_test() {
  let open = section(brief(), "## What is open")
  assert string.contains(open, "leftDiagonal_period_le")
  assert string.contains(open, "size=wall")
  assert string.contains(open, "deps=(none)")
  assert string.contains(open, "deps=evolve_left_edge, centerColumn_zero")
  // The whole description, newline included — not a first line, not a
  // truncation.
  assert string.contains(
    open,
    "WALL. What a decomposition must imply.\nAnd what was measured: periods 1, 1, 2 to k = 400.",
  )
  assert string.contains(open, "2 open")
}

/// Closed nodes have their own table. One that leaked into the open section
/// would read as a target already met.
pub fn the_open_section_omits_what_has_closed_test() {
  let open = section(brief(), "## What is open")
  assert !string.contains(open, "### evolve_left_edge")
  assert !string.contains(open, "### centerColumn_zero")
  // And the ids still appear elsewhere — the negative above is about the
  // section, not about the brief losing the closed table.
  assert string.contains(brief(), "evolve_left_edge  size=M")
}

/// An empty section reads as a section somebody forgot to fill. The brief
/// says in words that nothing is open, which is a fact the seeder should
/// react to rather than a gap it should skip.
pub fn the_brief_says_when_nothing_is_open_test() {
  let b =
    seed.brief(
      open: [],
      closed: [closed_node("a", dag.S, "haiku", 0.1)],
      notes: [],
      crystals: Error(Nil),
      explorer_readme: "",
      proposal_path: "p",
      region: option.None,
    )
  assert string.contains(b, "## What is open")
  assert string.contains(section(b, "## What is open"), "(nothing is open)")
}

/// `blueprint/crystals.md` is the literature ranked by hand, and the seeder
/// is told to read it BEFORE proposing. Inlined rather than pointed at, for
/// the reason the proof notes are: a pointer is a file the session may not
/// open, and the brief is the one artifact it is guaranteed to have read.
pub fn the_brief_inlines_the_literature_seeds_test() {
  let seeds = section(brief(), "## Literature seeds (blueprint/crystals.md)")
  assert string.contains(seeds, "# Seed crystals")
  assert string.contains(seeds, "Candidate statements for future tiers.")
  assert string.contains(string.lowercase(seeds), "before proposing")
}

pub fn the_brief_says_when_the_literature_seeds_are_absent_test() {
  let b =
    seed.brief(
      open: [],
      closed: [],
      notes: [],
      crystals: Error(Nil),
      explorer_readme: "",
      proposal_path: "p",
      region: option.None,
    )
  let seeds = section(b, "## Literature seeds (blueprint/crystals.md)")
  assert string.contains(seeds, "(no blueprint/crystals.md in this checkout)")
  assert !string.contains(seeds, "# Seed crystals")
}

/// **The shape, not just the field names.** The brief used to name the
/// fields in prose and never the document they sit in, and a file with the
/// wrong shape is refused by the decoder before any check runs — the one
/// failure a seeder cannot learn from, because nothing it wrote was looked
/// at. The example must sit in the section that says where to write, and
/// must name every field the decoder knows, required and optional alike.
pub fn the_brief_shows_the_proposal_shape_where_it_says_where_to_write_test() {
  let format = section(brief(), "## The proposal format")
  assert string.contains(format, "C:/r/blueprint/proposals/next.json")
  assert string.contains(format, "{\"proposals\": [")
  assert string.contains(format, "\"id\"")
  assert string.contains(format, "\"lean_name\"")
  assert string.contains(format, "\"statement\"")
  assert string.contains(format, "\"reason\"")
  assert string.contains(format, "\"disclaims\"")
  assert string.contains(format, "\"route\"")
  assert string.contains(format, "\"tactics\"")
  assert string.contains(format, "\"witness\"")
  assert string.contains(format, "\"expression\"")
  assert string.contains(format, "\"range\"")
  assert string.contains(format, "\"imports\"")
  assert string.contains(
    format,
    "Required: `id`, `lean_name`, `statement`, `reason`",
  )
}

/// The example is the decoder's twin, so it is decoded by the decoder. Every
/// optional claim must come back CLAIMED: an example that decoded only
/// because its optional halves were ignored would be teaching the wrong
/// spelling for exactly the fields a seeder is most likely to get wrong.
pub fn the_proposal_shape_decodes_test() {
  let assert Ok([p]) = seed.decode_proposals(seed.proposal_shape())
  assert p.disclaims != ""
  let assert Claimed(Route(tactics: _, imports: [_])) = p.route
  let assert seed.Claims(seed.Witness(expression: _, imports: [], range: _)) =
    p.witness
  // The statement placeholder carries the escaped newline before `sorry`,
  // which is the one byte of the shape that JSON makes easy to get wrong.
  assert string.contains(p.statement, ":= by\n  sorry")
}

/// **What closed cheaply, and on which model.** The captain who seeded well had
/// read every proof; a fresh session has only this table. Cost and model are
/// the part that says which SHAPES are cheap, which is the actual transferable
/// knowledge — not which nodes exist.
pub fn the_brief_carries_what_closed_and_what_it_cost_test() {
  let b = brief()
  assert string.contains(b, "evolve_left_edge")
  assert string.contains(b, "haiku")
  assert string.contains(b, "sonnet")
  assert string.contains(b, "0.36")
}

/// The `/-!` notes are the only place the *reason* a proof worked is written in
/// English. Carrying the file list without them would hand over the index of a
/// book instead of the book.
pub fn the_brief_carries_the_proof_notes_test() {
  assert string.contains(brief(), "The left edge is 1.")
}

/// **The measured wall.** Without it a seeder proposes witnesses over ranges
/// that cannot finish, every one comes back `unchecked`, and the check it was
/// given looks broken rather than out of budget.
pub fn the_brief_states_the_witness_range_limit_test() {
  let b = brief()
  assert string.contains(b, "3^t")
  assert string.contains(b, "18")
}

/// The reason is required and the route is optional, with the measurement that
/// settled it — a seeder told only the rule will supply a route to look
/// diligent.
pub fn the_brief_says_the_reason_is_required_and_the_route_is_not_test() {
  let b = string.lowercase(brief())
  assert string.contains(b, "reason")
  assert string.contains(b, "required")
  assert string.contains(b, "optional")
}

/// **The load-bearing negative.** A brief that did not say this would produce a
/// seeder that spends its turns discovering the fence by being denied — and
/// each denial is a bug auto-filed against the guard rather than against the
/// brief that omitted it.
pub fn the_brief_states_the_fence_it_runs_behind_test() {
  let b = brief()
  assert string.contains(b, "explorer/")
  assert string.contains(b, "C:/r/blueprint/proposals/next.json")
  // It must say plainly that it cannot write the two files the fleet reads,
  // and WHY — a rule without its reason reads as an obstacle to route around.
  assert string.contains(b, "Statements.lean")
  assert string.contains(b, "dag.json")
  assert string.contains(string.lowercase(b), "propose")
}

/// It must never suggest the seeder can seed. Dib's ruling is that a seeder
/// proposes and Rowan lands, because direction should not change while nobody
/// is watching.
pub fn the_brief_never_tells_the_seeder_to_edit_the_board_test() {
  let b = string.lowercase(brief())
  assert !string.contains(b, "edit rule30/statements.lean")
  assert !string.contains(b, "add the node to blueprint/dag.json")
}

/// **What a proposal does NOT prove, in the captain's voice.**
///
/// Rowan's proposal, from run 20260906T210938Z, where a worker's proof note
/// claimed P1 was proved while the Lean was exactly the conditional statement
/// that had been seeded. The verifier was right about everything it checks;
/// the false claim was in the prose, which nothing checks. See the board:
/// `nothing-checks-what-a-proof-note-claims`.
///
/// Optional, because most nodes disclaim nothing. Present, because a
/// conditional whose hypothesis is the hard part looks exactly like the thing
/// it is conditional on — especially to a session that has just spent twenty
/// turns inside it.
pub fn a_proposal_can_say_what_it_does_not_prove_test() {
  let assert Ok([p]) =
    seed.decode_proposals(proposal_json(
      "\"id\":\"a\",\"lean_name\":\"a\",\"statement\":\"theorem a : True := by\\n  sorry\",\"reason\":\"r\",\"disclaims\":\"This does NOT prove P1: the hypothesis is the whole difficulty.\"",
    ))
  assert p.disclaims
    == "This does NOT prove P1: the hypothesis is the whole difficulty."
}

pub fn a_proposal_without_a_disclaimer_decodes_to_empty_test() {
  let assert Ok([p]) =
    seed.decode_proposals(proposal_json(
      "\"id\":\"a\",\"lean_name\":\"a\",\"statement\":\"theorem a : True := by\\n  sorry\",\"reason\":\"r\"",
    ))
  assert p.disclaims == ""
}

/// A disclaimer nobody reads is worse than none, because it looks like a
/// safeguard. It must reach the report the captain reads.
pub fn the_report_shows_what_a_proposal_disclaims_test() {
  let out =
    seed.report([
      seed.Checked(
        proposal: seed.Proposal(
          ..a_proposal("zeta"),
          disclaims: "does NOT prove P1",
        ),
        route: seed.NoRoute,
        witness: seed.WitnessHolds("t < 12"),
      ),
    ])
  assert string.contains(out, "does NOT prove P1")
}

/// **The brief may not state a count it was not given.**
///
/// Caught by Rowan on 2026-09-06, hours after I wrote it: the brief said "the
/// board has closed twenty nodes and not one of them had an edge into a prize",
/// which was true when written and false the same evening — twenty-seven
/// closed, seven with an edge. `files-describe-now-not-history`, in the one
/// artifact whose whole job is to carry accurate context to a session that has
/// no other source for it.
///
/// The closed table directly beneath that sentence is derived and cannot drift.
/// The sentence was hardcoded prose sitting on top of derived data, which is
/// the worst arrangement: it reads as authoritative BECAUSE the table below it
/// is right.
pub fn the_brief_derives_its_counts_rather_than_stating_them_test() {
  let two =
    seed.brief(
      open: [],
      closed: [
        closed_node("a", dag.S, "haiku", 0.1),
        closed_node("b", dag.S, "haiku", 0.1),
      ],
      notes: [],
      crystals: Error(Nil),
      explorer_readme: "",
      proposal_path: "p",
      region: option.None,
    )
  assert string.contains(two, "2 closed")
  // No number that was true on one day and is not derived from the argument.
  assert !string.contains(two, "twenty")
  assert !string.contains(two, "20 closed")

  let three =
    seed.brief(
      open: [],
      closed: [
        closed_node("a", dag.S, "haiku", 0.1),
        closed_node("b", dag.S, "haiku", 0.1),
        closed_node("c", dag.S, "haiku", 0.1),
      ],
      notes: [],
      crystals: Error(Nil),
      explorer_readme: "",
      proposal_path: "p",
      region: option.None,
    )
  assert string.contains(three, "3 closed")
}

// --- aiming at one region -----------------------------------------------------
//
// Rowan wanted one seeder aimed at P2, where four nodes are proved and
// nothing is open. The whole-board brief says "aim at what a prize residual
// needs" and then lists the open walls, which are all P1 — so a seeder read
// it and proposed P1 again. `--region` is the fix: the brief names the
// region and its conjecture, and lists nothing outside it.

/// The region section sits right after "What you are doing", before any
/// node is listed, and names the conjecture rather than just the id: "P2"
/// tells a fresh session nothing about what to aim at.
pub fn a_regional_brief_names_the_region_and_its_conjecture_test() {
  let b = two_region_brief(option.Some("P2"))
  let tier = section(b, "## This tier is for P2")
  assert string.contains(tier, "balance")
  assert string.contains(tier, "1/2")
  assert string.contains(tier, "will not be landed")
  let assert Ok(#(before, _)) = string.split_once(b, "## This tier is for P2")
  assert string.contains(before, "## What you are doing")
  assert !string.contains(before, "## What is open")
}

/// Only the region's nodes are listed, the headings say so, and the counts
/// are of what is listed. The P1 nodes appear nowhere: a P1 wall in a P2
/// brief is exactly the target the seeder would follow instead.
pub fn a_regional_brief_lists_only_that_regions_nodes_test() {
  let b = two_region_brief(option.Some("P2"))
  let open = section(b, "## What is open in P2")
  assert string.contains(open, "### density_wall")
  assert string.contains(open, "1 open")
  let closed = section(b, "## What has closed in P2, and what it cost")
  assert string.contains(closed, "centerColumnDensity_nonneg  size=S")
  assert string.contains(b, "1 closed")
  assert !string.contains(b, "leftDiagonal_period_le")
  assert !string.contains(b, "evolve_left_edge")
}

/// Without a region the brief is what it was: no region section, the plain
/// headings, and both regions' nodes in both sections.
pub fn a_brief_without_a_region_is_the_whole_board_test() {
  let b = two_region_brief(option.None)
  assert !string.contains(b, "This tier is for")
  let open = section(b, "## What is open")
  assert string.contains(open, "### density_wall")
  assert string.contains(open, "### leftDiagonal_period_le")
  assert string.contains(open, "2 open")
  let closed = section(b, "## What has closed, and what it cost")
  assert string.contains(closed, "centerColumnDensity_nonneg")
  assert string.contains(closed, "evolve_left_edge")
  assert string.contains(b, "2 closed")
}

/// The board Rowan actually aimed at: P2 has closed nodes and nothing open.
/// The aim paragraph says the residuals are the open nodes in the next
/// section, and that section is empty, so the brief must say where the
/// target is instead — the prize theorem, by its name in Rule30/Prize.lean.
pub fn a_regional_brief_with_nothing_open_aims_at_the_prize_theorem_test() {
  let b =
    seed.brief(
      open: [open_node("leftDiagonal_period_le", dag.Wall, [])],
      closed: [
        closed_node("evolve_left_edge", dag.M, "sonnet", 0.36),
        in_p2(closed_node("centerColumnDensity_nonneg", dag.S, "haiku", 0.1)),
      ],
      notes: [],
      crystals: Error(Nil),
      explorer_readme: "",
      proposal_path: "p",
      region: option.Some("P2"),
    )
  // The aim paragraph is the first section, so there is no newline before
  // its heading for `section` to find; everything before the region
  // heading is it.
  let assert Ok(#(aim, _)) = string.split_once(b, "\n## This tier is for P2")
  assert string.contains(aim, "Nothing in P2 is open today")
  assert string.contains(
    aim,
    "`centerColumn_density_tendsto_half` in Rule30/Prize.lean",
  )
  assert string.contains(aim, "proof of that theorem would cite it")
  assert string.contains(section(b, "## What is open in P2"), "0 open")
}

/// With something open in the region the pointer lands on it and the
/// sentence is not rendered: naming the prize theorem next to an open wall
/// would give the seeder two targets.
pub fn a_regional_brief_with_an_open_node_does_not_name_the_prize_theorem_test() {
  let b = two_region_brief(option.Some("P2"))
  assert !string.contains(b, "Nothing in P2 is open")
  assert !string.contains(b, "centerColumn_density_tendsto_half")
  let whole = two_region_brief(option.None)
  assert !string.contains(whole, "is open today")
}

// --- reading the proof notes --------------------------------------------------

/// The `/-!` block is the only place the *reason* a proof worked is written in
/// English, and it is what the brief carries so a seeder inherits the shapes
/// that closed cheaply.
pub fn lifts_the_note_out_of_a_proof_file_test() {
  let file =
    "import Rule30.Basic\n\n/-!\n**What this says.** The left edge is always 1.\n**Why it is true.** The cone.\n-/\n\ntheorem evolve_left_edge : True := trivial\n"
  let assert Ok(note) = seed.note_of(file)
  assert string.contains(note, "The left edge is always 1.")
  assert string.contains(note, "The cone.")
  // The delimiters are not part of the note — they are Lean syntax and the
  // brief is prose.
  assert !string.contains(note, "/-!")
  assert !string.contains(note, "-/")
  // And nothing outside the block leaks in.
  assert !string.contains(note, "import")
  assert !string.contains(note, "theorem")
}

/// A proof file without a note is not an error — older files predate the
/// convention. It must be skipped rather than contributing an empty section
/// that reads as a note nobody wrote.
pub fn a_proof_file_with_no_note_is_skipped_test() {
  assert seed.note_of("import Rule30.Basic\ntheorem t : True := trivial\n")
    == Error(Nil)
}

/// An unterminated block must not swallow the rest of the file. A note is
/// prose shown to a seeder; a note that is secretly the whole proof would
/// quietly blow up the brief and teach nothing.
pub fn an_unterminated_note_is_not_a_note_test() {
  assert seed.note_of(
      "/-!\n**What this says.** oops\ntheorem t : True := trivial\n",
    )
    == Error(Nil)
}

/// Cost is in the brief to be COMPARED at a glance — which shapes are cheap is
/// the transferable knowledge. `$0.7975254000000002` defeats that: the reader
/// is doing arithmetic on noise instead of seeing a pattern.
pub fn costs_are_rendered_as_money_test() {
  let b =
    seed.brief(
      open: [],
      closed: [closed_node("a", dag.M, "sonnet", 0.7975254000000002)],
      notes: [],
      crystals: Error(Nil),
      explorer_readme: "",
      proposal_path: "p",
      region: option.None,
    )
  assert string.contains(b, "$0.80")
  assert !string.contains(b, "0.7975254")
}

pub fn a_small_cost_keeps_both_places_test() {
  let b =
    seed.brief(
      open: [],
      closed: [closed_node("a", dag.S, "haiku", 0.0709461)],
      notes: [],
      crystals: Error(Nil),
      explorer_readme: "",
      proposal_path: "p",
      region: option.None,
    )
  assert string.contains(b, "$0.07")
  // The prefix alone is not the check: "$0.0709461" contains "$0.07". This
  // test passed against the unrounded implementation until that was noticed.
  assert !string.contains(b, "0.0709461")
}

// --- refusing to check without a built .lake ----------------------------------

/// **A checkout without `.lake` cannot check anything, and must say so instead
/// of trying.**
///
/// Hit for real on 2026-09-06: `seed check` run from a worktree found no
/// `.lake` — the 7.4 GB of compiled Mathlib that CLAUDE.md warns a fresh
/// worktree does not have — so `lake env lean` could not resolve `Rule30`,
/// STARTED CLONING MATHLIB, and reported every proposal as `BROKEN CHECK`. It
/// left 675 MB of partial clone behind.
///
/// The verdicts were right: `WitnessBroken` says the check failed, not the
/// statement, so nothing was retracted. The problem is that being right N
/// times is not the same as being useful once. A reader sees N broken checks
/// and looks for a fault in their proposals, because that is what the report
/// is about.
///
/// Same shape as a fixture written into the live checkout: a tool doing
/// something expensive and wrong OUTSIDE the thing it was asked about.
pub fn check_file_refuses_a_checkout_with_no_lake_test() {
  let dir = "build/test-runs/seed-nolake"
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let assert Ok(_) =
    simplifile.write(dir <> "/props.json", "{\"proposals\":[]}")
  let assert Error(reason) = seed.check_file_in(dir, dir <> "/props.json")
  // Names the missing thing, where it looked, and what to do — a reader who
  // gets this must not have to guess which of the three it is.
  assert string.contains(reason, ".lake")
  assert string.contains(does: string.lowercase(reason), contain: "worktree")
  assert string.contains(reason, "HARNESS_REPO_ROOT")
}

/// And it must refuse BEFORE reading proposals, so a malformed proposal in a
/// checkout that could never have checked it reports the checkout rather than
/// the proposal. The likelier confusion is the one this orders against.
pub fn the_lake_check_comes_before_the_proposal_decode_test() {
  let dir = "build/test-runs/seed-nolake-bad"
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let assert Ok(_) = simplifile.write(dir <> "/props.json", "not json at all")
  let assert Error(reason) = seed.check_file_in(dir, dir <> "/props.json")
  assert string.contains(reason, ".lake")
  assert !string.contains(reason, "proposals\": [...]")
}
