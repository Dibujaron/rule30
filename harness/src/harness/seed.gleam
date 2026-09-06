//// Check a captain's *route* against the statement it claims to close.
////
//// `verify.gleam` is the gate on the proof side: it adjudicates what a
//// worker wrote. This is the same idea one step earlier, on the statement
//// side, where the project has never had one — every seeded lemma is true
//// because a captain checked it by hand and said so, and every route is
//// prose in a node's `description` that nothing reads.
////
//// What it costs to have no check here was measured on 2026-09-06.
//// `bool_map_iterate_three` was seeded with "`by decide` closes it, which
//// the captain confirmed before seeding". It does not: the captain had
//// verified an `example` with a `∀`-bound `f` and seeded a `theorem` with
//// `f` as a parameter, where the goal carries a free variable and `decide`
//// has nothing to evaluate. The statement was true throughout; only the
//// route was false. It cost $0.97 and a wasted rung on a one-line proof.
////
//// Two rules follow, and both are load-bearing enough that breaking either
//// reproduces the bug this module exists to catch:
////
//// 1. **Elaborate the declaration text verbatim**, lifted out of
////    `Rule30/Statements.lean` rather than retyped. A check built on
////    `type_of% Statements.<name>` elaborates the `∀`-form, where `by
////    decide` *passes* — while the worker's own file has `f` introduced as
////    a parameter, where it fails. Same route, opposite outcomes.
//// 2. **Use a proof file's imports**, not the statement file's. A
////    `type_of%` check imports `Rule30.Statements`, which pulls
////    `Rule30.Prize` and its Mathlib imports — a strictly richer instance
////    environment than a proof file has. `revert f; decide` closes under
////    that and fails under `import Rule30.Basic` alone with "failed to
////    synthesize Decidable", an error that reads as though the statement
////    were false when an import is missing.
////
//// `type_of%` still has a job, but the second one — see `verify.gleam`,
//// which already does it for proofs. First the shape the worker will meet,
//// then the identity with the seeded text.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/float
import gleam/int
import gleam/json
import gleam/list
import gleam/result
import gleam/string
import harness/config
import harness/dag
import harness/shell
import simplifile

/// A claimed way to close a statement: the tactic block that replaces
/// `sorry`, and any imports a proof file would need beyond `Rule30.Basic`.
///
/// `imports` is not a convenience. A route is only meaningful together with
/// the environment it elaborates in, and a captain who supplies tactics
/// without the import that makes them work has supplied a route that fails.
pub type Route {
  Route(tactics: String, imports: List(String))
}

/// `NoRoute` is a success, not a gap. The reason a statement is true is what
/// a captain owes; a route is optional and admissible only once elaborated,
/// because an unverified route is read in the captain's voice by a model
/// with no standing to doubt it, and it forecloses a search that a stronger
/// model might win. Claiming nothing is strictly better than claiming
/// something unchecked.
pub type Claim {
  NoClaim
  Claimed(Route)
}

/// The verdict on one claimed route.
pub type RouteVerdict {
  RouteClosed
  RouteFailed(output: String)
  StatementNotFound(lean_name: String)
  NoRoute
}

/// Every proof file in this project starts here, so every route is checked
/// against at least this much. Deliberately *not* `Rule30.Statements`.
const base_import = "Rule30.Basic"

/// Lift a declaration out of `Rule30/Statements.lean` verbatim, minus its
/// trailing `sorry` line, ready for a route to be appended.
///
/// Verbatim is the whole point: the failure this module catches is a
/// captain checking a *retyping* of a statement rather than the statement.
/// So this reads the source and slices it — it never reconstructs a
/// declaration from a name and a type.
///
/// Multi-line statements are the common case (the type often wraps several
/// lines before `:= by`), which is why this collects until the `sorry`
/// rather than assuming one line.
pub fn declaration_without_proof(
  source: String,
  lean_name: String,
) -> Result(String, Nil) {
  let lines = string.split(source, "\n")
  use start <- result.try(index_of_declaration(lines, lean_name))
  let rest = list.drop(lines, start)
  let body = take_until_sorry(rest, [])
  case body {
    [] -> Error(Nil)
    _ -> Ok(string.join(body, "\n"))
  }
}

/// The index of the line declaring `lean_name`.
///
/// Matched on `theorem <name>` followed by a delimiter, so that a statement
/// named `evolve_left_edge` is never matched by one named
/// `evolve_left_edge_two`. A prefix check would find the wrong declaration
/// and check a route against a statement it was never claimed for, which is
/// the failure mode of this module rather than an ordinary bug.
fn index_of_declaration(lines: List(String), lean_name: String) -> Result(Int, Nil) {
  lines
  |> list.index_map(fn(line, i) { #(i, line) })
  |> list.find(fn(pair) { declares(pair.1, lean_name) })
  |> result.map(fn(pair) { pair.0 })
}

fn declares(line: String, lean_name: String) -> Bool {
  let head = "theorem " <> lean_name
  case string.starts_with(line, head) {
    False -> False
    True ->
      case string.drop_start(line, string.length(head)) {
        "" -> True
        rest ->
          list.any([" ", "(", "{", "[", ":"], string.starts_with(rest, _))
      }
  }
}

/// Collect declaration lines up to but excluding the line that is only
/// `sorry`. Anything else — a real proof, a statement without a hole — is
/// not a seeded statement and gets no route check.
fn take_until_sorry(lines: List(String), acc: List(String)) -> List(String) {
  case lines {
    [] -> []
    [line, ..rest] ->
      case string.trim(line) == "sorry" {
        True -> list.reverse(acc)
        False -> take_until_sorry(rest, [line, ..acc])
      }
  }
}

/// The Lean source this route will be judged on: a proof file's imports,
/// then the statement verbatim, then the route in place of the `sorry`.
pub fn check_source(declaration: String, route: Route) -> String {
  let imports =
    [base_import, ..route.imports]
    |> list.unique
    |> list.map(fn(m) { "import " <> m })
    |> string.join("\n")
  imports <> "\n" <> declaration <> "\n  " <> route.tactics <> "\n"
}

/// Elaborate one claimed route and say whether it closes the statement.
///
/// Runs `lake env lean`, which reads oleans and takes no build lock — so
/// this is safe alongside a live run, unlike `lake build`. A whole
/// proposal's worth of routes costs about what one prover spends on one
/// compile.
pub fn check_route(
  repo_root: String,
  lake: String,
  statements_source: String,
  lean_name: String,
  claim: Claim,
) -> RouteVerdict {
  case claim {
    NoClaim -> NoRoute
    Claimed(route) ->
      case declaration_without_proof(statements_source, lean_name) {
        Error(Nil) -> StatementNotFound(lean_name)
        Ok(declaration) -> {
          let dir = repo_root <> "/harness/build/checks/seed"
          let path = dir <> "/" <> lean_name <> ".lean"
          let assert Ok(_) = simplifile.create_directory_all(dir)
          let assert Ok(_) =
            simplifile.write(path, check_source(declaration, route))
          case shell.run(lake, ["env", "lean", path], repo_root, 600_000) {
            Error(msg) -> RouteFailed(msg)
            Ok(shell.Run(status:, output:)) if status != 0 -> RouteFailed(output)
            Ok(_) -> RouteClosed
          }
        }
      }
  }
}

// --- the falsification witness -----------------------------------------------

/// A claim that a statement survives a finite search, and the range searched.
///
/// `expression` must evaluate to a `Bool` under `#eval`. `range` is prose for
/// the record — "t < 16", "all 63 diagonals to N=200" — because a witness
/// that passes is only ever evidence about the range it covered, and a node
/// carrying `WitnessHolds` with no stated range is a claim nobody can size.
pub type Witness {
  Witness(expression: String, imports: List(String), range: String)
}

pub type WitnessClaim {
  NoWitness
  Claims(Witness)
}

/// The verdict on one witness, and it has four cases on purpose.
///
/// `Falsified` and `WitnessBroken` MUST NOT be collapsed: the first says the
/// statement is false on the range, the second says the witness did not
/// elaborate and therefore says nothing at all about the statement. Reading a
/// broken check as a falsified statement would retract true lemmas; reading it
/// as a pass would admit false ones.
///
/// `Unchecked` is a real verdict and is expected to be common. `evolve` costs
/// 3^t neighbour evaluations, so the usable depth is about t < 18 — measured
/// 2026-09-06: t=16 in 12s, t=18 in 84s, t=20 over 120s. Most claims about
/// periodicity live past that.
pub type WitnessVerdict {
  WitnessHolds(range: String)
  Falsified(output: String)
  WitnessBroken(output: String)
  Unchecked(reason: String)
}

/// The Lean source a witness is judged on: proof-file imports, then `#eval`.
///
/// Deliberately does NOT import `Rule30.Statements`. A witness evaluates the
/// definitions, not the seeded claim about them — importing the statement file
/// would let a witness accidentally reference a `sorry`-backed lemma and
/// evaluate something that was never proved.
pub fn witness_source(witness: Witness) -> String {
  let imports =
    [base_import, ..witness.imports]
    |> list.unique
    |> list.map(fn(m) { "import " <> m })
    |> string.join("\n")
  imports <> "\n-- range: " <> witness.range <> "\n#eval " <> witness.expression <> "\n"
}

/// Read a verdict out of what `lake env lean` printed.
///
/// **`#eval false` exits 0.** Verified 2026-09-06. So the exit status is not
/// the answer and cannot be — a checker built on it passes every false
/// statement silently, which is `sorry`'s failure mode (a success report over
/// nothing) moved to the statement side. The verdict is the stdout text, and
/// anything that is neither exactly `true` nor exactly `false` is a broken
/// check rather than a falsified statement.
///
/// See the board: `a-checker-built-on-exit-status-passes-every-false-statement`.
pub fn witness_verdict(
  range: String,
  status: Int,
  output: String,
) -> WitnessVerdict {
  case string.trim(output) {
    "true" if status == 0 -> WitnessHolds(range)
    "false" if status == 0 -> Falsified(output)
    _ -> WitnessBroken(output)
  }
}

/// Evaluate one witness and say what it shows.
///
/// Runs `lake env lean`, which reads oleans and takes NO build lock — so this
/// is safe alongside a live run, unlike `lake build`. That matters more here
/// than for `check_route`: a witness is the expensive check, and a seeder pass
/// wants to run a dozen of them without waiting behind a prover's compile.
///
/// `timeout_ms` is a real parameter and not a formality. `evolve` costs 3^t
/// neighbour evaluations, so the usable depth is about t < 18 — measured
/// 2026-09-06 against the real definitions: t=16 in 12s, t=18 in 84s, t=20
/// over 120s. A timeout is `Unchecked` and never a pass, because `List.all`
/// short-circuits: a FALSE witness returns almost instantly and a TRUE one
/// pays the full exponential, so **timing out correlates with the statement
/// being true** and "no falsification found before the deadline" would pass
/// exactly the statements too expensive to check. For the same reason the
/// budget cannot be tuned by watching how long checks take — the ones that
/// time out are the ones you most wanted an answer to.
pub fn check_witness(
  repo_root: String,
  lake: String,
  lean_name: String,
  claim: WitnessClaim,
  timeout_ms: Int,
) -> WitnessVerdict {
  case claim {
    NoWitness -> Unchecked("no witness supplied")
    Claims(witness) -> {
      let dir = repo_root <> "/harness/build/checks/seed"
      // A per-call token, for the reason `verify_test`'s fixture carries one:
      // two sessions on this machine share one checkout, and a path derived
      // only from the node name is one absolute path with no lock on it. That
      // collision was measured on 2026-09-06 and cost four spurious failures.
      let path = dir <> "/witness_" <> lean_name <> "_" <> token() <> ".lean"
      let assert Ok(_) = simplifile.create_directory_all(dir)
      let assert Ok(_) = simplifile.write(path, witness_source(witness))
      case shell.run(lake, ["env", "lean", path], repo_root, timeout_ms) {
        // Every failure to *run* is `Unchecked`, never `Falsified`. A timeout
        // is the common one and the dangerous one — `shell.run` reports it as
        // `Error("timeout after N ms")` — because timing out correlates with
        // the statement being true, so treating it as anything but "I could
        // not tell" would systematically pass the claims worth checking.
        Error(msg) -> Unchecked(msg)
        Ok(shell.Run(status:, output:)) ->
          witness_verdict(witness.range, status, output)
      }
    }
  }
}

/// 32 lowercase hex characters from a CSPRNG, the same source `guard.gleam`
/// uses for its auth token and `verify_test` for its fixture id.
@external(erlang, "harness_ffi", "token")
fn token() -> String

// --- proposals ----------------------------------------------------------------

/// One proposed node, as a seeder writes it and before anyone believes it.
///
/// This is deliberately NOT a `dag.Node`. A node is on the board; a proposal
/// is a claim about one, and the two must not be the same type or a proposal
/// becomes seedable by being parsed. Rowan reviews and lands; the seeder never
/// writes `Rule30/Statements.lean` or `blueprint/dag.json`.
///
/// `reason` is REQUIRED and `route` is OPTIONAL, which is the opposite of what
/// the first design assumed and was settled by measurement: across the tier
/// seeded on 2026-09-06, description quality dominated node difficulty as a
/// cost driver and it was not close. `bool_map_iterate_three` closed on sonnet
/// by implementing the English reason and ignoring both the captain's route
/// and the captain's correction to it. An unverified route misdirects in the
/// captain's voice to a model with no standing to doubt it; a correct reason
/// costs nothing and leaves the search open. A captain who cannot state the
/// reason has not finished thinking about the node. A captain who cannot
/// supply a route has merely left it open.
pub type Proposal {
  Proposal(
    id: String,
    lean_name: String,
    statement: String,
    reason: String,
    /// What this statement does NOT prove, in the captain's voice. Empty for
    /// most nodes; load-bearing for any node shaped like a prize.
    ///
    /// Added after run 20260906T210938Z, where a worker's proof note and
    /// journal entry claimed P1 was proved. The Lean was exactly the
    /// conditional statement that had been seeded and the harness checked its
    /// type — everything the verifier adjudicates was correct. The false claim
    /// was in the prose, which nothing checks, and which is the artifact a
    /// human actually reads.
    ///
    /// This does not fix that: nothing here can make a note true. What it does
    /// is put the disclaimer where a HUMAN wrote it, before the attempt, so a
    /// worker is told what its note must not contradict rather than being
    /// asked to derive the boundary itself — which is the derivation that
    /// failed. See `nothing-checks-what-a-proof-note-claims`.
    disclaims: String,
    route: Claim,
    witness: WitnessClaim,
  )
}

/// A proposal with both checks run over it. Neither verdict makes a node good
/// — a node is good only in retrospect, when it closes cheaply and later
/// proofs cite it — so this type carries verdicts and never a recommendation.
pub type Checked {
  Checked(proposal: Proposal, route: RouteVerdict, witness: WitnessVerdict)
}

/// Decode a proposal file.
///
/// Loud and located on a bad entry, never lenient, for the reason the board
/// decoder is: a silently dropped proposal is a node that quietly does not get
/// seeded, and "fewer proposals than the seeder wrote" is indistinguishable
/// from "the seeder wrote fewer proposals".
pub fn decode_proposals(text: String) -> Result(List(Proposal), String) {
  use rows <- result.try(
    json.parse(text, decode.at(["proposals"], decode.list(decode.dynamic)))
    |> result.map_error(fn(e) {
      "harness/seed: not a {\"proposals\": [...]} document: " <> string.inspect(e)
    }),
  )
  rows
  |> list.index_map(fn(row, i) { #(i, row) })
  |> list.try_map(fn(pair) {
    let #(i, row) = pair
    decode.run(row, proposal_decoder())
    |> result.map_error(fn(errors) {
      // Index AND id, because the index alone means counting entries by hand
      // and the id alone is absent from exactly the rows most likely to be
      // wrong. `UnableToDecode` naming nine missing fields and no entry is
      // what this exists not to be — see the board,
      // `a-malformed-board-row-silently-disables-auto-filing`.
      "harness/seed: proposal "
      <> int.to_string(i)
      <> " ("
      <> id_or_unnamed(row)
      <> "): "
      <> string.inspect(errors)
    })
  })
}

/// The `id` of a row that failed to decode, for the error message. A row too
/// malformed to have one still has to be locatable, so this falls back to a
/// marker rather than to the empty string.
fn id_or_unnamed(row: Dynamic) -> String {
  case decode.run(row, decode.at(["id"], decode.string)) {
    Ok(id) -> id
    Error(_) -> "<no id>"
  }
}

fn proposal_decoder() -> decode.Decoder(Proposal) {
  use id <- decode.field("id", decode.string)
  use lean_name <- decode.field("lean_name", decode.string)
  use statement <- decode.field("statement", decode.string)
  // `reason` is `field`, not `optional_field`, and that is the design rather
  // than an oversight: a proposal without one is not a proposal.
  use reason <- decode.field("reason", decode.string)
  // Optional, unlike `reason`: most nodes disclaim nothing, and a required
  // field that is usually empty gets filled with noise to satisfy it.
  use disclaims <- decode.optional_field("disclaims", "", decode.string)
  use route <- decode.optional_field("route", NoClaim, route_claim_decoder())
  use witness <- decode.optional_field(
    "witness",
    NoWitness,
    witness_claim_decoder(),
  )
  decode.success(Proposal(
    id:,
    lean_name:,
    statement:,
    reason:,
    disclaims:,
    route:,
    witness:,
  ))
}

fn route_claim_decoder() -> decode.Decoder(Claim) {
  use tactics <- decode.field("tactics", decode.string)
  use imports <- decode.optional_field("imports", [], decode.list(decode.string))
  decode.success(Claimed(Route(tactics:, imports:)))
}

fn witness_claim_decoder() -> decode.Decoder(WitnessClaim) {
  use expression <- decode.field("expression", decode.string)
  use imports <- decode.optional_field("imports", [], decode.list(decode.string))
  use range <- decode.field("range", decode.string)
  decode.success(Claims(Witness(expression:, imports:, range:)))
}

/// Run both checks over one proposal.
///
/// The route is checked against the proposal's OWN statement text, not against
/// `Rule30/Statements.lean` — the statement is not seeded yet, and checking it
/// anywhere else would be the bug this module exists to catch, one step
/// earlier: a route verified against a paraphrase of the thing that ships.
pub fn check_proposal(
  repo_root: String,
  lake: String,
  proposal: Proposal,
  timeout_ms: Int,
) -> Checked {
  Checked(
    proposal:,
    route: check_route(
      repo_root,
      lake,
      proposal.statement,
      proposal.lean_name,
      proposal.route,
    ),
    witness: check_witness(
      repo_root,
      lake,
      proposal.lean_name,
      proposal.witness,
      timeout_ms,
    ),
  )
}

/// Render checked proposals for the human who decides.
///
/// **Says what was checked, never what to do.** Neither verdict makes a node
/// good — a node is good only in retrospect, when it closes cheaply and later
/// proofs cite it — so a report that ranked or recommended would be inventing
/// a signal that does not exist. It reports, Rowan decides, and the two are
/// kept apart on purpose.
pub fn report(checked: List(Checked)) -> String {
  let lines = list.map(checked, report_line)
  let counts =
    [
      #("falsified", list.count(checked, fn(c) { is_falsified(c.witness) })),
      #("broken check", list.count(checked, fn(c) { is_broken(c.witness) })),
      #("unchecked", list.count(checked, fn(c) { is_unchecked(c.witness) })),
      #("holds", list.count(checked, fn(c) { is_holding(c.witness) })),
    ]
    |> list.filter(fn(pair) { pair.1 > 0 })
    |> list.map(fn(pair) { int.to_string(pair.1) <> " " <> pair.0 })
    |> string.join(", ")
  string.join(lines, "
") <> "

" <> counts <> "
"
}

fn report_line(c: Checked) -> String {
  // The disclaimer is printed FIRST among the proposal's own lines and in the
  // captain's own words. Nothing checks it — that is the point of it — so its
  // only value is being read, and a disclaimer placed below two verdicts is a
  // disclaimer read after the reader has decided.
  let disclaimer = case c.proposal.disclaims {
    "" -> ""
    text -> "\n  DOES NOT PROVE: " <> text
  }
  c.proposal.id <> disclaimer <> "
  route:   " <> route_line(c.route) <> "
  witness: " <> witness_line(c.witness)
}

fn route_line(v: RouteVerdict) -> String {
  case v {
    NoRoute -> "none claimed"
    RouteClosed -> "closes the statement"
    RouteFailed(output) -> "DOES NOT CLOSE — " <> first_line(output)
    StatementNotFound(name) -> "BROKEN CHECK — no declaration named " <> name
  }
}

/// The four witness verdicts, worded so no two of them can be skimmed as the
/// same thing. `Falsified` is about the statement; `WitnessBroken` is about the
/// check; `Unchecked` is about neither and is the expected common case.
fn witness_line(v: WitnessVerdict) -> String {
  case v {
    WitnessHolds(range) -> "holds over " <> range
    Falsified(output) -> "FALSIFIED — the statement is false: " <> first_line(output)
    WitnessBroken(output) -> "BROKEN CHECK, says nothing about the statement — " <> first_line(output)
    Unchecked(why) -> "unchecked — " <> why
  }
}

fn first_line(output: String) -> String {
  case string.split(string.trim(output), "
") {
    [line, ..] -> line
    [] -> ""
  }
}

fn is_falsified(v: WitnessVerdict) -> Bool {
  case v {
    Falsified(_) -> True
    _ -> False
  }
}

fn is_broken(v: WitnessVerdict) -> Bool {
  case v {
    WitnessBroken(_) -> True
    _ -> False
  }
}

fn is_unchecked(v: WitnessVerdict) -> Bool {
  case v {
    Unchecked(_) -> True
    _ -> False
  }
}

fn is_holding(v: WitnessVerdict) -> Bool {
  case v {
    WitnessHolds(_) -> True
    _ -> False
  }
}

// --- the brief ----------------------------------------------------------------

/// What a seeder is told, assembled. The pure half, so it can be tested
/// without a working directory.
///
/// **This is where the quality lives.** The pass that produced a good tier on
/// 2026-09-06 worked because the captain had read every proof and knew which
/// shapes close cheaply. A fresh session has none of that, and nothing in a
/// seeding attempt's own outcome will ever tell it — a seeded node is good only
/// in retrospect, when it closes cheaply and later proofs cite it. So the brief
/// is the only place that knowledge can enter, and every section below is here
/// because leaving it out costs a worse tier a day later rather than an error
/// today. That is the least checkable failure this project has.
pub fn brief(
  closed closed: List(dag.Node),
  notes notes: List(#(String, String)),
  explorer_readme explorer_readme: String,
  proposal_path proposal_path: String,
) -> String {
  string.join(
    [
      "## What you are doing",
      "You are proposing the next tier of theorem statements for a Lean 4",
      "formalisation of Rule 30. You PROPOSE; a captain reviews and lands.",
      "",
      "Aim at what a proof of a prize conjecture's residual would NEED, not at",
      "what is merely true and provable. **A tier of true, cheap, unconnected",
      "lemmas is the failure mode here, and it looks like progress while it",
      "happens.**",
      "",
      "The table below is the whole record of what has closed, "
        <> int.to_string(list.length(closed))
        <> " closed as it",
      "stands. Read it and ask which of them a proof of a prize residual would",
      "actually cite. If the honest answer is none, that is the problem you are",
      "being asked to fix.",
      "",
      "## What you may write and run",
      "  write   anything under explorer/",
      "  write   your proposal, at " <> proposal_path,
      "  run     node <one path under explorer/>",
      "  run     lake build [modules], lake env lean <file>",
      "",
      "You may NOT write Rule30/Statements.lean or blueprint/dag.json. That is",
      "not a formality to route around: seeding sets direction, and direction",
      "should not change while nobody is watching. Your output is a proposal",
      "and a captain lands it. Nothing else you do is checked by anything.",
      "",
      "## The proposal format",
      "Each proposal carries an id, a lean_name, the statement text, and a",
      "`reason`. The reason is REQUIRED and the route is OPTIONAL, and that is",
      "the opposite of what it looks like it should be. Measured on the tier",
      "seeded 2026-09-06: description quality dominated node difficulty as a",
      "cost driver and it was not close. One node was seeded with a route its",
      "captain had confirmed against a DIFFERENT form of the statement; haiku",
      "spent 41 turns and died on it, and sonnet then closed it by implementing",
      "the English reason and ignoring the route entirely.",
      "",
      "An unverified route misdirects in a captain's voice to a model with no",
      "standing to doubt it, and forecloses a search a stronger model would win.",
      "A correct reason costs nothing and leaves the search open. **If you",
      "cannot state the reason, you have not finished thinking about the node.**",
      "If you cannot supply a route, you have merely left it open, which is",
      "fine and is recorded as claiming nothing.",
      "",
      "## Falsification witnesses, and the wall you will hit",
      "Every proposal may carry a witness: a Bool-valued Lean expression over an",
      "explicit finite range, run with `lake env lean` and `#eval`.",
      "",
      "**The range is not free.** `evolve t` is `rule30^[t]` over `Int -> Bool`,",
      "so one cell at depth t costs 3^t neighbour evaluations. Measured against",
      "the real definitions: t=14 is 3.8s, t=16 is 12s, t=18 is 84s, t=20 times",
      "out at 120s. Usable depth is about t < 18 and the wall is sheer — two",
      "steps costs a factor of seven.",
      "",
      "`List.all` short-circuits, so a FALSE witness returns almost instantly",
      "and a TRUE one pays the full exponential. A witness that times out is",
      "therefore preferentially a true one, and it is recorded as `unchecked`,",
      "never as a pass. A statement whose claim only becomes interesting past",
      "t=18 cannot carry a naive witness at all — say so rather than inventing",
      "one, because `unchecked` stated plainly is worth more than coverage",
      "pretended.",
      "",
      "## What has closed, and what it cost",
      "Cost and model are the transferable part: they say which SHAPES are",
      "cheap, which is what you are choosing between.",
      "",
      closed_table(closed),
      "",
      "## Why those proofs worked, in the provers' own words",
      notes_section(notes),
      "",
      "## The engine",
      explorer_readme,
    ],
    "\n",
  )
}

fn closed_table(closed: List(dag.Node)) -> String {
  closed
  |> list.map(fn(n) {
    let #(model, cost) = case n.attempts {
      [] -> #("-", "-")
      attempts -> {
        let last = list.last(attempts)
        case last {
          Ok(a) -> #(a.model, dollars(a.cost_usd))
          Error(_) -> #("-", "-")
        }
      }
    }
    "  "
    <> n.id
    <> "  size="
    <> dag.size_to_string(n.size)
    <> "  "
    <> model
    <> "  "
    <> cost
  })
  |> string.join("\n")
}

fn notes_section(notes: List(#(String, String))) -> String {
  notes
  |> list.map(fn(pair) { "### " <> pair.0 <> "\n" <> pair.1 })
  |> string.join("\n\n")
}

/// The `/-!` block out of a proof file, without its delimiters.
///
/// That block is the only place in this project where the *reason* a proof
/// worked is written in English — CLAUDE.md requires one in every
/// `Rule30/Proofs/` file, addressed to a reader who will not read the tactic
/// script. It is what the brief carries so a seeder inherits which shapes
/// close cheaply, which is the knowledge a fresh session has no other route
/// to.
///
/// `Error(Nil)` for a file with no note, and — the case worth naming — for a
/// block that is opened and never closed. Taking the rest of the file in that
/// case would put a whole proof into the brief as though it were prose, which
/// is a silent way to blow up the one artifact whose job is to be read.
pub fn note_of(file: String) -> Result(String, Nil) {
  use #(_, after) <- result.try(string.split_once(file, "/-!"))
  use #(body, _) <- result.try(string.split_once(after, "-/"))
  case string.trim(body) {
    "" -> Error(Nil)
    text -> Ok(text)
  }
}

// --- the seeder, from disk ----------------------------------------------------

/// Where a seeder writes, and the only file outside `explorer/` it may touch.
///
/// Under `blueprint/` because that is where the board's own artifacts live,
/// and NOT in `blueprint/dag.json`: a proposal is a claim about the board, not
/// a change to it. Rowan reads this and lands what survives review.
pub fn proposal_path(repo_root: String) -> String {
  repo_root <> "/blueprint/proposals/next.json"
}

/// The brief, assembled from the repository as it stands right now.
///
/// Everything here is DERIVED rather than remembered — the closed table, the
/// count, the notes. A brief that carries a hardcoded fact is a brief that is
/// wrong on a day nobody notices, and this one had exactly that bug within
/// hours of being written.
pub fn brief_for(cfg: config.Config) -> Result(String, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  let closed = list.filter(d.nodes, fn(n) { n.status == dag.Proved })
  let notes = proof_notes(cfg.repo_root)
  let readme =
    simplifile.read(cfg.repo_root <> "/explorer/README.md")
    |> result.unwrap("(no explorer/README.md)")
  Ok(brief(
    closed: closed,
    notes: notes,
    explorer_readme: readme,
    proposal_path: proposal_path(cfg.repo_root),
  ))
}

/// Every `/-!` note under `Rule30/Proofs/`, paired with its file name.
///
/// Files without a note are skipped rather than contributing an empty
/// section: older proofs predate the convention, and an empty heading reads
/// as a note whose author had nothing to say.
fn proof_notes(repo_root: String) -> List(#(String, String)) {
  let dir = repo_root <> "/Rule30/Proofs"
  case simplifile.read_directory(dir) {
    Error(_) -> []
    Ok(entries) ->
      entries
      |> list.filter(string.ends_with(_, ".lean"))
      |> list.sort(string.compare)
      |> list.filter_map(fn(name) {
        use text <- result.try(
          simplifile.read(dir <> "/" <> name) |> result.replace_error(Nil),
        )
        use note <- result.try(note_of(text))
        Ok(#(name, note))
      })
  }
}

/// Check a proposal file and render the report a captain reads.
///
/// This is the whole statement-side gate in one call: decode loudly, run both
/// checks over every proposal, and render. It adjudicates nothing about
/// whether a node is WORTH proving — no mechanism here can — so it reports
/// and stops.
pub fn check_file(
  cfg: config.Config,
  path: String,
) -> Result(String, String) {
  check_file_in(cfg.repo_root, path)
}

/// `check_file` with the repository root given directly, so the refusal below
/// can be tested without a config.
pub fn check_file_in(
  repo_root: String,
  path: String,
) -> Result(String, String) {
  // FIRST, before the proposals are even read. A checkout without `.lake` can
  // check nothing, and `lake env lean` does not fail politely there — it
  // resolves no `Rule30`, starts CLONING MATHLIB, and every proposal comes
  // back `BROKEN CHECK`. Measured 2026-09-06 from a worktree: 675 MB of
  // partial clone and a report that read as though four proposals were at
  // fault.
  //
  // Those verdicts were correct — `WitnessBroken` says the check failed, not
  // the statement — and being correct N times is not the same as being useful
  // once. A reader looking at N broken checks looks for the fault in their
  // proposals, because that is what the report is about. So the checkout is
  // reported as the checkout, and it is reported before anything expensive
  // starts.
  use _ <- result.try(case simplifile.is_directory(repo_root <> "/.lake") {
    Ok(True) -> Ok(Nil)
    _ ->
      Error(
        "harness/seed: no built `.lake` under "
        <> repo_root
        <> ", so nothing can be elaborated there.
"
        <> "  A fresh worktree has none — `.lake` is gitignored and is 7.4 GB "
        <> "of compiled Mathlib, so building one takes hours.
"
        <> "  Point HARNESS_REPO_ROOT at a checkout that has one (the main "
        <> "checkout does) and run this again.
"
        <> "  Refused before reading any proposal: without `.lake` this would "
        <> "start cloning Mathlib and then report every proposal broken.",
      )
  })
  use text <- result.try(
    simplifile.read(path)
    |> result.map_error(fn(e) {
      "harness/seed: cannot read " <> path <> ": " <> simplifile.describe_error(e)
    }),
  )
  use proposals <- result.try(decode_proposals(text))
  use lake <- result.try(
    shell.which("lake") |> result.replace_error("harness/seed: no `lake` on PATH"),
  )
  let checked =
    list.map(proposals, fn(p) { check_proposal(repo_root, lake, p, 180_000) })
  Ok(report(checked))
}

/// A cost, as money rather than as a float.
///
/// The table exists to be compared at a glance — which shapes close cheaply is
/// the knowledge a seeder cannot get anywhere else. `$0.7975254000000002` makes
/// the reader do arithmetic on noise instead of seeing a pattern, which is a
/// quiet way for the most carefully assembled section of the brief to be
/// skipped.
fn dollars(amount: Float) -> String {
  let cents = float.round(amount *. 100.0)
  "$"
  <> int.to_string(cents / 100)
  <> "."
  <> string.pad_start(int.to_string(cents % 100), 2, "0")
}
