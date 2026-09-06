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

import gleam/list
import gleam/result
import gleam/string
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
