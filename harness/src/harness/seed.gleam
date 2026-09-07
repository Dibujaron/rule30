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
////
//// There are two places a statement's text can live, and a route is only
//// ever checked against one of them at a time. `check_route` takes the text
//// of `Rule30/Statements.lean`. `check_proposal` takes a proposal, whose
//// `statement` field is the declaration as the seeder wants it landed, and
//// Rowan lands it BY HAND — nothing in the harness writes the statement
//// file. So once a proposal's name appears in `Rule30/Statements.lean`, the
//// two texts are compared byte for byte before any Lean runs, and a route
//// whose two texts disagree gets `SeededTextDiffers` and no elaboration at
//// all: a verdict on either text would be a verdict about the other's
//// object, which is the failure this module exists to catch.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/float
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
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
///
/// `RouteUsesSorry` is its own arm and not a `RouteFailed`, because it is the
/// one failure Lean reports as a success: a route containing `sorry` (or a
/// tactic that falls back to one) elaborates with a warning and EXIT 0, so a
/// checker that read only the exit status would call it closed. That is
/// `sorry`'s founding failure mode — a build that says success over nothing —
/// arriving at the statement gate, and it gets a verdict a reader cannot
/// mistake for "the tactics were wrong".
///
/// `SeededTextDiffers` is the verdict for a route that was NOT elaborated,
/// because the proposal's declaration and the one now in
/// `Rule30/Statements.lean` are different texts. Both are carried so the
/// report can show the reader exactly which bytes moved.
pub type RouteVerdict {
  RouteClosed
  RouteFailed(output: String)
  RouteUsesSorry(output: String)
  StatementNotFound(lean_name: String)
  SeededTextDiffers(proposed: String, seeded: String)
  NoRoute
}

/// Every proof file in this project starts here, so every route is checked
/// against at least this much. Deliberately *not* `Rule30.Statements`.
const base_import = "Rule30.Basic"

/// What `lean` prints when a declaration's proof contains `sorry`, captured
/// 2026-09-06 from `leanprover/lean4:v4.33.1` by elaborating
/// `theorem bool_map_iterate_three (f : Bool → Bool) : f^[3] = f := by sorry`
/// under `lake env lean`:
///
///     <file>:2:8: warning: declaration uses `sorry`
///     exit=0
///
/// The backticks are Lean's own quoting and are part of the match. A toolchain
/// bump that rewords this warning turns `RouteUsesSorry` back into
/// `RouteClosed` silently, which is why the capture is dated and the test
/// `a_sorry_route_is_not_closed_test` runs against the real toolchain.
const sorry_warning = "declaration uses `sorry`"

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
fn index_of_declaration(
  lines: List(String),
  lean_name: String,
) -> Result(Int, Nil) {
  lines
  |> list.index_map(fn(line, i) { #(i, line) })
  |> list.find(fn(pair) { declares(pair.1, lean_name) })
  |> result.map(fn(pair) { pair.0 })
}

/// Does `line` declare `theorem <lean_name>`, followed by a delimiter so
/// that `evolve_left_edge` is never matched by a line declaring
/// `evolve_left_edge_two`. Shared with `index`, which walks the same
/// statement file looking for the same declarations and must find exactly
/// the ones this module would.
pub fn declares(line: String, lean_name: String) -> Bool {
  let head = "theorem " <> lean_name
  case string.starts_with(line, head) {
    False -> False
    True ->
      case string.drop_start(line, string.length(head)) {
        "" -> True
        rest -> list.any([" ", "(", "{", "[", ":"], string.starts_with(rest, _))
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

/// Elaborate one claimed route against the declaration named `lean_name`
/// in `statements_source` — the text of `Rule30/Statements.lean` — and say
/// whether it closes the statement.
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
        Ok(declaration) ->
          check_declaration(repo_root, lake, declaration, lean_name, route)
      }
  }
}

/// Elaborate `route` in place of the `sorry` of one already-lifted
/// declaration. Every route verdict that involves Lean comes from here.
///
/// Runs `lake env lean`, which reads oleans and takes no build lock — so
/// this is safe alongside a live run, unlike `lake build`. A whole
/// proposal's worth of routes costs about what one prover spends on one
/// compile.
fn check_declaration(
  repo_root: String,
  lake: String,
  declaration: String,
  lean_name: String,
  route: Route,
) -> RouteVerdict {
  let dir = repo_root <> "/harness/build/checks/seed"
  let path = dir <> "/" <> lean_name <> ".lean"
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let assert Ok(_) = simplifile.write(path, check_source(declaration, route))
  case shell.run(lake, ["env", "lean", path], repo_root, 600_000) {
    Error(msg) -> RouteFailed(msg)
    Ok(shell.Run(status:, output:)) if status != 0 -> RouteFailed(output)
    // Exit 0 is necessary and not sufficient: `sorry` elaborates cleanly and
    // warns. The warning is checked rather than the tactic text because it
    // also catches a `sorry` a tactic introduced on the route's behalf,
    // which a text scan of what the captain wrote would not see.
    Ok(shell.Run(output:, ..)) ->
      case string.contains(output, sorry_warning) {
        True -> RouteUsesSorry(output)
        False -> RouteClosed
      }
  }
}

/// The one declaration a proposal's route may be checked against, or the
/// verdict that says why there is none.
///
/// A proposal's `statement` is the declaration as the seeder wants it
/// landed, and landing is by hand. Until the name appears in
/// `Rule30/Statements.lean` the proposal's own text is the only text there
/// is, and the route is checked against it. Once the name is seeded there
/// are two texts, and the route is checked against neither unless they are
/// byte for byte the same: `bool_map_iterate_three` was checked against a
/// `∀`-form and seeded with a parameter, and a check that had picked either
/// text would have reported truthfully about the wrong object.
pub fn declaration_to_check(
  proposal_statement: String,
  statements_source: String,
  lean_name: String,
) -> Result(String, RouteVerdict) {
  case declaration_without_proof(proposal_statement, lean_name) {
    Error(Nil) -> Error(StatementNotFound(lean_name))
    Ok(proposed) ->
      case declaration_without_proof(statements_source, lean_name) {
        Error(Nil) -> Ok(proposed)
        Ok(seeded) if seeded == proposed -> Ok(seeded)
        Ok(seeded) -> Error(SeededTextDiffers(proposed:, seeded:))
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
///
/// `WitnessPlaceholder` is refused before Lean ever runs, and is not an
/// `Unchecked`: unchecked says the check could not be done, this says the
/// witness was never about the statement. The literal `true` passes every
/// checker that could ever be written, and it was nearly seeded twice as a
/// stand-in "to fill in later". See `names_the_statement` for exactly what is
/// and is not caught.
pub type WitnessVerdict {
  WitnessHolds(range: String)
  Falsified(output: String)
  WitnessBroken(output: String)
  Unchecked(reason: String)
  WitnessPlaceholder(expression: String)
}

/// Does `expression` mention at least one name that the statement is about?
///
/// **What is checked.** The statement text and the expression are both split
/// into identifier tokens — maximal runs of ASCII letters, digits, `_` and
/// `'` — so `centerColumn` is one token and `centerColumnDensity` is a
/// different one, never a match for it. From the statement's tokens, these
/// are dropped: anything starting with a digit, anything one character long
/// (in this project's statements a one-letter name is a binder like `f` or
/// `t`, never a definition), and the `stoplist` of Lean keywords, `Bool`
/// literals and core types that appear in nearly every statement and say
/// nothing about which one. `lean_name` is added to what remains. The
/// expression passes if it contains one of those, as a whole token.
///
/// **What is not caught.** A witness that names the right definition and then
/// evaluates something unrelated — `centerColumn 0 == centerColumn 0` — passes
/// this and every other syntactic check; only reading it catches that. A
/// non-ASCII name (`α`, `x₁`) is split at the non-ASCII character and so is
/// not a name here; the statements this project seeds use ASCII definition
/// names, and if that changes this comment is wrong before the code is.
///
/// This is the TypeScript `includes` you would write first, made honest
/// about token boundaries: it says "the witness talks about the statement's
/// subject", nothing stronger, and is here to stop a `true` from ever
/// reaching `#eval`.
pub fn names_the_statement(
  expression: String,
  lean_name: String,
  statement: String,
) -> Bool {
  let names = [lean_name, ..statement_names(statement)]
  identifiers(expression)
  |> list.any(fn(token) { list.contains(names, token) })
}

/// The identifier tokens of a statement that are specific to it: not a
/// keyword, not a literal, not a core type, not a digit run, not a single
/// character. See `names_the_statement` for why each class is excluded.
pub fn statement_names(statement: String) -> List(String) {
  identifiers(statement)
  |> list.filter(fn(token) {
    string.length(token) > 1
    && !starts_with_digit(token)
    && !list.contains(stoplist, token)
  })
  |> list.unique
}

/// Lean keywords, `Bool`/`Prop` literals and core types that appear in nearly
/// every statement. A witness that mentions only these — `true`, or
/// `(List.range 4).all (fun _ => true)` — is about nothing in particular.
const stoplist = [
  "theorem", "lemma", "def", "example", "by", "sorry", "fun", "let", "have",
  "show", "from", "if", "then", "else", "match", "with", "do", "at", "in",
  "true", "false", "True", "False", "Bool", "Nat", "Int", "List", "Prop", "Type",
  "Decidable", "decide", "rfl", "range", "all", "any", "not", "and", "or",
]

/// Maximal runs of ASCII letters, digits, `_` and `'` in `text`, in order.
/// Everything else — spaces, punctuation, operators, and any non-ASCII
/// character — separates tokens.
pub fn identifiers(text: String) -> List(String) {
  let #(tokens, current) =
    text
    |> string.to_graphemes
    |> list.fold(#([], ""), fn(acc, g) {
      let #(tokens, current) = acc
      case is_identifier_char(g) {
        True -> #(tokens, current <> g)
        False ->
          case current {
            "" -> #(tokens, "")
            _ -> #([current, ..tokens], "")
          }
      }
    })
  let tokens = case current {
    "" -> tokens
    _ -> [current, ..tokens]
  }
  list.reverse(tokens)
}

fn is_identifier_char(g: String) -> Bool {
  case g {
    "_" | "'" -> True
    _ ->
      case string.to_utf_codepoints(g) {
        [cp] -> {
          let n = string.utf_codepoint_to_int(cp)
          { n >= 48 && n <= 57 }
          || { n >= 65 && n <= 90 }
          || { n >= 97 && n <= 122 }
        }
        _ -> False
      }
  }
}

fn starts_with_digit(token: String) -> Bool {
  case string.to_utf_codepoints(string.slice(token, 0, 1)) {
    [cp] -> {
      let n = string.utf_codepoint_to_int(cp)
      n >= 48 && n <= 57
    }
    _ -> False
  }
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
  imports
  <> "\n-- range: "
  <> witness.range
  <> "\n#eval "
  <> witness.expression
  <> "\n"
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
///
/// `statement` is the declaration text the witness is meant to be about. A
/// witness that names nothing from it is refused as `WitnessPlaceholder`
/// before any file is written or any Lean is run — see `names_the_statement`.
pub fn check_witness(
  repo_root: String,
  lake: String,
  lean_name: String,
  statement: String,
  claim: WitnessClaim,
  timeout_ms: Int,
) -> WitnessVerdict {
  case claim {
    NoWitness -> Unchecked("no witness supplied")
    Claims(witness) ->
      case names_the_statement(witness.expression, lean_name, statement) {
        False -> WitnessPlaceholder(witness.expression)
        True -> run_witness(repo_root, lake, lean_name, witness, timeout_ms)
      }
  }
}

/// Write the witness source and run it. Only reached by a witness that
/// `names_the_statement`; the verdict is read from what Lean printed.
fn run_witness(
  repo_root: String,
  lake: String,
  lean_name: String,
  witness: Witness,
  timeout_ms: Int,
) -> WitnessVerdict {
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
      "harness/seed: not a {\"proposals\": [...]} document: "
      <> string.inspect(e)
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
  use imports <- decode.optional_field(
    "imports",
    [],
    decode.list(decode.string),
  )
  decode.success(Claimed(Route(tactics:, imports:)))
}

fn witness_claim_decoder() -> decode.Decoder(WitnessClaim) {
  use expression <- decode.field("expression", decode.string)
  use imports <- decode.optional_field(
    "imports",
    [],
    decode.list(decode.string),
  )
  use range <- decode.field("range", decode.string)
  decode.success(Claims(Witness(expression:, imports:, range:)))
}

/// The shape `decode_proposals` accepts, as one complete example the brief
/// hands the seeder.
///
/// This is the decoder above written out as JSON, and it is the decoder's
/// twin rather than its documentation: `the_proposal_shape_decodes_test`
/// runs it through `decode_proposals` and requires every optional claim to
/// come back claimed, so a field added to the decoder and not here fails a
/// test rather than a seeder. It exists because the brief used to name the
/// fields in prose and never the shape, and a file that gets the shape wrong
/// is refused before any check runs — the one failure a seeder cannot learn
/// from, since nothing it wrote was ever looked at.
pub fn proposal_shape() -> String {
  "{\"proposals\": [\n"
  <> "  {\n"
  <> "    \"id\": \"<node id, snake_case, unique on the board>\",\n"
  <> "    \"lean_name\": \"<the theorem's name, usually the same as id>\",\n"
  <> "    \"statement\": \"theorem <lean_name> ... := by\\n  sorry\",\n"
  <> "    \"reason\": \"<why a proof of an open node would cite this>\",\n"
  <> "    \"disclaims\": \"<what this does NOT prove; omit when nothing>\",\n"
  <> "    \"route\": {\"tactics\": \"<tactic script>\", \"imports\": [\"Rule30.Proofs.EvolveLeftEdge\"]},\n"
  <> "    \"witness\": {\"expression\": \"<Bool-valued Lean over the range>\", \"imports\": [], \"range\": \"t < 12\"}\n"
  <> "  }\n"
  <> "]}"
}

/// Run both checks over one proposal.
///
/// `statements_source` is the text of `Rule30/Statements.lean` as it stands.
/// The route is checked against the proposal's own statement text while the
/// name is not yet seeded, and against the seeded text once it is — and only
/// if the two are the same bytes. See `declaration_to_check` for why a
/// disagreement is a verdict of its own rather than a choice.
pub fn check_proposal(
  repo_root: String,
  lake: String,
  statements_source: String,
  proposal: Proposal,
  timeout_ms: Int,
) -> Checked {
  let route = case proposal.route {
    NoClaim -> NoRoute
    Claimed(route) ->
      case
        declaration_to_check(
          proposal.statement,
          statements_source,
          proposal.lean_name,
        )
      {
        Error(verdict) -> verdict
        Ok(declaration) ->
          check_declaration(
            repo_root,
            lake,
            declaration,
            proposal.lean_name,
            route,
          )
      }
  }
  Checked(
    proposal:,
    route:,
    witness: check_witness(
      repo_root,
      lake,
      proposal.lean_name,
      proposal.statement,
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
      #("wrong object", list.count(checked, fn(c) { is_wrong_object(c.route) })),
      #("falsified", list.count(checked, fn(c) { is_falsified(c.witness) })),
      #("placeholder", list.count(checked, fn(c) { is_placeholder(c.witness) })),
      #("broken check", list.count(checked, fn(c) { is_broken(c.witness) })),
      #("unchecked", list.count(checked, fn(c) { is_unchecked(c.witness) })),
      #("holds", list.count(checked, fn(c) { is_holding(c.witness) })),
    ]
    |> list.filter(fn(pair) { pair.1 > 0 })
    |> list.map(fn(pair) { int.to_string(pair.1) <> " " <> pair.0 })
    |> string.join(", ")
  string.join(
    lines,
    "
",
  )
  <> "

"
  <> counts
  <> "
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
    RouteUsesSorry(_) ->
      "DOES NOT CLOSE — the route itself uses `sorry`, which Lean accepts "
      <> "with exit 0 and a warning"
    StatementNotFound(name) ->
      "BROKEN CHECK — the statement text has no `theorem "
      <> name
      <> " ... := by` ending in a line that is only `sorry`, so nothing "
      <> "could be lifted to check against"
    SeededTextDiffers(proposed:, seeded:) ->
      "WRONG OBJECT, not elaborated — `Rule30/Statements.lean` now declares "
      <> "this name with different text from the proposal, so a verdict on "
      <> "either would be about the other's statement. Land the same bytes "
      <> "or check the seeded text.\n    proposed: "
      <> one_line(proposed)
      <> "\n    seeded:   "
      <> one_line(seeded)
  }
}

/// A declaration on one line, for a report a reader compares by eye.
fn one_line(declaration: String) -> String {
  declaration
  |> string.split("\n")
  |> list.map(string.trim)
  |> string.join(" ")
}

/// The five witness verdicts, worded so no two of them can be skimmed as the
/// same thing. `Falsified` is about the statement; `WitnessBroken` is about the
/// check; `Unchecked` is about neither and is the expected common case;
/// `WitnessPlaceholder` is about the witness and was never run.
fn witness_line(v: WitnessVerdict) -> String {
  case v {
    WitnessHolds(range) -> "holds over " <> range
    Falsified(output) ->
      "FALSIFIED — the statement is false: " <> first_line(output)
    WitnessBroken(output) ->
      "BROKEN CHECK, says nothing about the statement — " <> first_line(output)
    Unchecked(why) -> "unchecked — " <> why
    WitnessPlaceholder(expression) ->
      "PLACEHOLDER, refused without running — names nothing from the "
      <> "statement: "
      <> first_line(expression)
  }
}

fn first_line(output: String) -> String {
  case
    string.split(
      string.trim(output),
      "
",
    )
  {
    [line, ..] -> line
    [] -> ""
  }
}

fn is_wrong_object(v: RouteVerdict) -> Bool {
  case v {
    SeededTextDiffers(..) -> True
    _ -> False
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

fn is_placeholder(v: WitnessVerdict) -> Bool {
  case v {
    WitnessPlaceholder(_) -> True
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
/// `region`, when given, aims the whole brief at one region of the board:
/// the open section and the closed table carry only that region's nodes,
/// their headings and counts say so, and a section near the top names the
/// prize conjecture the region is about. Without it the brief is the whole
/// board, and a seeder reading it follows the open walls — which is how a
/// pass meant for P2 would end up proposing P1 again.
pub fn brief(
  open open: List(dag.Node),
  closed closed: List(dag.Node),
  notes notes: List(#(String, String)),
  crystals crystals: Result(String, Nil),
  explorer_readme explorer_readme: String,
  proposal_path proposal_path: String,
  region region: Option(String),
) -> String {
  let open = in_region(open, region)
  let closed = in_region(closed, region)
  let where = case region {
    None -> ""
    Some(r) -> " in " <> r
  }
  let node_word = case region {
    None -> "node"
    Some(r) -> r <> " node"
  }
  string.join(
    list.flatten([
      [
        "## What you are doing",
        "You are proposing the next tier of theorem statements for a Lean 4",
        "formalisation of Rule 30. You PROPOSE; a captain reviews and lands.",
        "",
        "Aim at what a proof of a prize conjecture's residual would NEED, not at",
        "what is merely true and provable. The residuals are not abstract: they",
        "are the open nodes in the next section, and a proposal is worth landing",
        "exactly when a proof of one of them would cite it. **A tier of true,",
        "cheap, unconnected lemmas is the failure mode here, and it looks like",
        "progress while it happens.**",
      ],
      aim_when_nothing_open(region, open),
      [
        "",
        "The closed table further down is the whole record of what has closed"
          <> where
          <> ", "
          <> int.to_string(list.length(closed))
          <> " closed as it",
        "stands. Read it and ask which of them a proof of an open node would",
        "actually cite. If the honest answer is none, that is the problem you are",
        "being asked to fix.",
        "",
      ],
      region_section(region),
      [
        "## What is open" <> where,
        "Every "
          <> node_word
          <> " on the board nobody has closed, "
          <> open_count(open)
          <> ".",
        "A `wall` is a node the scheduler never dispatches: it is not a task, it",
        "is a target, and its description says what a decomposition must imply",
        "and what has been measured. Read those descriptions as the",
        "specification of the tier you are proposing.",
        "",
        open_section(open),
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
        "The file at " <> proposal_path,
        "must be exactly this shape, or the decoder refuses it before any check",
        "runs and nothing you wrote is looked at:",
        "",
        proposal_shape(),
        "",
        "Required: `id`, `lean_name`, `statement`, `reason`. Optional, and to be",
        "OMITTED rather than filled with a placeholder: `disclaims` (defaults to",
        "empty), `route` (then `tactics` is required and `imports` optional), and",
        "`witness` (then `expression` and `range` are required and `imports`",
        "optional). One `{\"proposals\": [...]}` document, any number of entries.",
        "",
        "Each proposal carries an id, a lean_name, the statement text, and a",
        "`reason`. The statement text is the declaration EXACTLY as it should",
        "land in Rule30/Statements.lean — `theorem <lean_name> ... := by` with",
        "`sorry` on its own line — because a route is checked against those",
        "bytes and against nothing else, and the captain lands the same bytes.",
        "The reason is REQUIRED and the route is OPTIONAL, and that is",
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
        "## What has closed" <> where <> ", and what it cost",
        "Cost and model are the transferable part: they say which SHAPES are",
        "cheap, which is what you are choosing between.",
        "",
        closed_table(closed),
        "",
        "## Why those proofs worked, in the provers' own words",
        notes_section(notes),
        "",
        "## Literature seeds (blueprint/crystals.md)",
        crystals_section(crystals),
        "",
        "## The engine",
        explorer_readme,
      ],
    ]),
    "\n",
  )
}

/// The nodes of `region`, or all of them when no region is asked for.
fn in_region(nodes: List(dag.Node), region: Option(String)) -> List(dag.Node) {
  case region {
    None -> nodes
    Some(r) -> list.filter(nodes, fn(n) { n.region == r })
  }
}

/// The section that says which region this tier is for, or nothing when the
/// brief is the whole board. It names the conjecture in one sentence
/// because a region id alone says nothing about what to aim at, and it says
/// the fence out loud — a proposal outside the region is not landed — so a
/// seeder that finds the region's open list empty proposes into the region
/// rather than wandering to where the walls are.
fn region_section(region: Option(String)) -> List(String) {
  case region {
    None -> []
    Some(r) -> [
      "## This tier is for " <> r,
      "This seeding pass is aimed at one region of the board, "
        <> r
        <> ": "
        <> conjecture_of(r),
      "Only "
        <> r
        <> " nodes are listed below, open and closed. A proposal outside "
        <> r
        <> " will not be landed, however true or cheap it is.",
      "",
    ]
  }
}

/// The prize conjecture a region is about, in one sentence, from
/// `Rule30/Prize.lean` and `docs/prize.md`. A region that is not one of the
/// three prizes says so rather than borrowing a conjecture.
fn conjecture_of(region: String) -> String {
  case region {
    "P1" ->
      "the aperiodicity conjecture — the centre column of Rule 30 never becomes periodic, however far out you look and however long you wait for the repetition to start."
    "P2" ->
      "the balance conjecture — the fraction of black cells among the first N cells of the centre column tends to exactly 1/2 as N grows."
    "P3" ->
      "the irreducibility conjecture — every correct algorithm for the nth cell of the centre column needs effort at least linear in n; its statement in Rule30/Prize.lean is a first approximation and not ready to be attacked."
    _ -> "a region with no prize conjecture of its own on the board."
  }
}

/// The sentence the aim paragraph adds when a region is asked for and
/// nothing in it is open. The paragraph says the residuals are the open
/// nodes in the next section; for P2 today that section is empty, so the
/// pointer lands on nothing. This says where the target is instead: the
/// region's prize theorem, by name, so a proposal can be judged against it.
/// Nothing is added for a whole-board brief, for a region with something
/// open, or for a region with no prize theorem to name.
fn aim_when_nothing_open(
  region: Option(String),
  open: List(dag.Node),
) -> List(String) {
  case region, open {
    Some(r), [] ->
      case prize_theorem_of(r) {
        Ok(name) -> [
          "Nothing in "
            <> r
            <> " is open today, so the residual is the prize theorem itself,",
          "`"
            <> name
            <> "` in Rule30/Prize.lean: a proposal is worth landing when a",
          "proof of that theorem would cite it.",
        ]
        Error(Nil) -> []
      }
    _, _ -> []
  }
}

/// The name of the region's prize theorem as declared in
/// `Rule30/Prize.lean`, or nothing for a region that is not one of the
/// three prizes.
fn prize_theorem_of(region: String) -> Result(String, Nil) {
  case region {
    "P1" -> Ok("centerColumn_not_eventually_periodic")
    "P2" -> Ok("centerColumn_density_tendsto_half")
    "P3" -> Ok("centerColumn_cost_at_least_linear")
    _ -> Error(Nil)
  }
}

fn open_count(open: List(dag.Node)) -> String {
  case list.length(open) {
    1 -> "1 open"
    n -> int.to_string(n) <> " open"
  }
}

/// One entry per node, with its description VERBATIM. A wall's
/// description is the specification of what a decomposition must imply and
/// what has been measured, so cutting it would cut the only part of this
/// brief that says what to aim at. The seeder renders its open nodes with
/// this and the theorist its walls, so the two briefs describe a wall in
/// the same shape.
pub fn open_section(open: List(dag.Node)) -> String {
  case open {
    [] -> "(nothing is open)"
    nodes ->
      nodes
      |> list.map(fn(n) {
        let deps = case n.deps {
          [] -> "(none)"
          deps -> string.join(deps, ", ")
        }
        "### "
        <> n.id
        <> "  size="
        <> dag.size_to_string(n.size)
        <> "  deps="
        <> deps
        <> "\n"
        <> n.description
      })
      |> string.join("\n\n")
  }
}

/// `blueprint/crystals.md` inlined, or one line saying it is absent. The
/// file is the literature ranked by hand — the part of a seeder's
/// preparation that no amount of reading the closed proofs supplies — so it
/// is carried whole rather than pointed at, for the same reason the proof
/// notes are.
fn crystals_section(crystals: Result(String, Nil)) -> String {
  case crystals {
    Ok(text) ->
      "Read this before proposing: it is the literature on Rule 30 gathered\n"
      <> "and ranked, and a proposal that ignores it re-derives what a paper\n"
      <> "already settled or proposes what one already refuted.\n\n"
      <> text
    Error(Nil) -> "(no blueprint/crystals.md in this checkout)"
  }
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
  brief_at(cfg, proposal_path(cfg.repo_root), region: None)
}

/// `brief_for`, naming `proposal_path` as where the proposal goes, and
/// optionally aimed at one `region` of the board. The seeder verb fences its
/// session to one proposal file and briefs it from the same path through
/// this, so the file the brief names and the file the guard permits cannot
/// be two different files.
///
/// A region no node on the board carries is refused, not rendered: the
/// brief it would produce lists nothing open and nothing closed, which reads
/// as an empty region rather than as a typo.
pub fn brief_at(
  cfg: config.Config,
  proposal_path: String,
  region region: Option(String),
) -> Result(String, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  use _ <- result.try(case region {
    None -> Ok(Nil)
    Some(r) ->
      case list.any(d.nodes, fn(n) { n.region == r }) {
        True -> Ok(Nil)
        False ->
          Error(
            "harness/seed: no node on the board has region `"
            <> r
            <> "`; the board's regions are "
            <> string.join(
              d.nodes |> list.map(fn(n) { n.region }) |> list.unique,
              ", ",
            ),
          )
      }
  })
  let open = list.filter(d.nodes, fn(n) { n.status == dag.Open })
  let closed = list.filter(d.nodes, fn(n) { n.status == dag.Proved })
  let notes = proof_notes(cfg.repo_root)
  let crystals =
    simplifile.read(cfg.repo_root <> "/blueprint/crystals.md")
    |> result.replace_error(Nil)
  let readme =
    simplifile.read(cfg.repo_root <> "/explorer/README.md")
    |> result.unwrap("(no explorer/README.md)")
  Ok(brief(
    open: open,
    closed: closed,
    notes: notes,
    crystals: crystals,
    explorer_readme: readme,
    proposal_path: proposal_path,
    region: region,
  ))
}

/// Every `/-!` note under `Rule30/Proofs/`, paired with its file name.
///
/// Files without a note are skipped rather than contributing an empty
/// section: older proofs predate the convention, and an empty heading reads
/// as a note whose author had nothing to say. Shared with the theorist's
/// brief, which carries the same notes for the same reason.
pub fn proof_notes(repo_root: String) -> List(#(String, String)) {
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
pub fn check_file(cfg: config.Config, path: String) -> Result(String, String) {
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
      "harness/seed: cannot read "
      <> path
      <> ": "
      <> simplifile.describe_error(e)
    }),
  )
  use proposals <- result.try(decode_proposals(text))
  // Read once, so every proposal is compared against the same bytes.
  let statements_path = repo_root <> "/Rule30/Statements.lean"
  use statements_source <- result.try(
    simplifile.read(statements_path)
    |> result.map_error(fn(e) {
      "harness/seed: cannot read "
      <> statements_path
      <> ": "
      <> simplifile.describe_error(e)
    }),
  )
  use lake <- result.try(
    shell.which("lake")
    |> result.replace_error("harness/seed: no `lake` on PATH"),
  )
  let checked =
    list.map(proposals, fn(p) {
      check_proposal(repo_root, lake, statements_source, p, 180_000)
    })
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
