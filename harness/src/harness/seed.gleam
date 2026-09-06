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
