//// Verify a worker's proof file against the captain's statement.
////
//// This is the gate: a node is only marked `Proved` once its proof file
//// builds, avoids the two things a worker must never do (import
//// `Rule30.Statements`, leave a `sorry`), and — checked from outside the
//// worker's own file — has exactly the statement's type and depends on no
//// axiom beyond the three Lean/Mathlib allows. The check theorem is written
//// fresh each time under `<repo>/harness/build/checks/`, which is
//// git-ignored.
////
//// The same check file also prints the statement's signature, and
//// `annotate` writes that into the worker's `/-!` note once the verdict is
//// in. The note is the one artifact a human reads and the one nothing
//// adjudicates: on 2026-09-06 two verified proofs carried notes that were
//// wrong about what they proved, in opposite directions. The harness's
//// block is the signature as Lean printed it and not a sentence about it,
//// because a type cannot be over-read into a claim about its own hypotheses
//// and English about a type can. See `nothing-checks-what-a-proof-note-claims`.

import gleam/bool
import gleam/list
import gleam/option.{type Option}
import gleam/result
import gleam/string
import harness/dag
import harness/shell
import simplifile

/// What verification found. `Verified` is the only success; every other
/// variant carries enough to explain the failure back to the worker.
///
/// `statement` is the seeded statement's signature as `#check` printed it
/// from the check file — what `annotate` writes into the proof note. It is
/// `""` when the output had no such line, which is a harness defect and
/// never the worker's: the proof still verified, and the annotation is
/// skipped rather than the node failed.
pub type Verdict {
  Verified(axioms: List(String), statement: String, output: String)
  ForbiddenImport(line: String)
  ContainsSorry(line: String)
  BuildFailed(output: String)
  CheckFailed(output: String)
  BadAxioms(axioms: List(String), output: String)
}

/// The axioms a proof may depend on: `propext`, `Classical.choice`, and
/// `Quot.sound` — the three Lean and Mathlib rely on throughout.
pub const allowed_axioms = ["propext", "Classical.choice", "Quot.sound"]

/// Verify `node`'s proof file, running `lake` (an absolute path, from
/// `shell.which("lake")`) with `repo_root` as its working directory.
pub fn verify(repo_root: String, lake: String, node: dag.Node) -> Verdict {
  let path = repo_root <> "/" <> dag.proof_path(node)
  case simplifile.read(path) {
    Error(_) -> BuildFailed("no proof file at " <> path)
    Ok(source) ->
      case find_forbidden_import(source) {
        option.Some(line) -> ForbiddenImport(line)
        option.None ->
          case find_sorry(source) {
            option.Some(line) -> ContainsSorry(line)
            option.None -> verify_build(repo_root, lake, node)
          }
      }
  }
}

/// Build the proof module *and* `Rule30.Statements`. The check theorem in
/// `verify_check` imports both, and `lake env lean` will not build a missing
/// dependency for itself — a stale `Statements` olean turns a real proof
/// into a `CheckFailed` that reads like the worker's fault.
fn verify_build(repo_root: String, lake: String, node: dag.Node) -> Verdict {
  let proof_module = dag.proof_module(node)
  case
    shell.run(
      lake,
      ["build", "Rule30.Statements", proof_module],
      repo_root,
      600_000,
    )
  {
    Error(msg) -> BuildFailed(msg)
    Ok(shell.Run(status:, output:)) if status != 0 -> BuildFailed(output)
    Ok(_) -> verify_check(repo_root, lake, node)
  }
}

fn verify_check(repo_root: String, lake: String, node: dag.Node) -> Verdict {
  let checks_dir = repo_root <> "/harness/build/checks"
  let check_path = checks_dir <> "/" <> node.id <> ".lean"
  let assert Ok(_) = simplifile.create_directory_all(checks_dir)
  let assert Ok(_) = simplifile.write(check_path, check_source(node))
  case shell.run(lake, ["env", "lean", check_path], repo_root, 600_000) {
    Error(msg) -> CheckFailed(msg)
    Ok(shell.Run(status:, output:)) if status != 0 -> CheckFailed(output)
    Ok(shell.Run(output:, ..)) -> judge_axioms(node, output)
  }
}

fn judge_axioms(node: dag.Node, output: String) -> Verdict {
  let axioms = parse_axioms(output)
  case list.all(axioms, list.contains(allowed_axioms, _)) {
    True -> Verified(axioms, statement_of(output, node.lean_name), output)
    False -> BadAxioms(axioms, output)
  }
}

/// The `#check Statements.<lean_name>` message out of the check file's
/// output: the line that opens with the statement's name, plus the indented
/// lines Lean wraps a long signature onto. `""` if there is no such line.
///
/// Measured against the real toolchain on 2026-09-07: `lean` on a file
/// prints an info message bare, with no `path:line:col:` prefix, and the
/// axioms line follows it. The name must be followed by a space or a colon
/// so that a statement whose name extends another's is not mistaken for it
/// — **or be the whole line**, which is the case that was missing.
///
/// Lean wraps a signature whose binders are long by putting the name alone
/// on the first line and indenting everything under it. Measured on
/// 2026-09-10 by generating what `check_source` emits for
/// `leftDiagonal_onset_le_of_line` and running `lake env lean` on it:
///
///     Statements.leftDiagonal_onset_le_of_line
///       (h :
///         ∀ (m : ℕ), leftDiagonal (m + 1) (m + 2) = true ∨ ...
///       (k : ℕ) : ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N
///
/// Requiring a space or a colon matched none of that, so this returned `""`
/// for exactly the statements with the most binders, and `annotate` wrote
/// no block. It cost two proof files their **Checked type** block
/// (`LeftDiagonalOnsetLeOfLine`, `LeftDiagonalOnsetLeOfStepModPreperiod`)
/// with no signal anywhere a reader would look: both attempts still
/// reported VERIFIED, both nodes still closed, and the only trace was
/// `"written": false` in an `annotate` event nobody reads. A missing block
/// then reads as an accepted gap rather than a failure.
///
/// Whole-line equality cannot reopen the hazard the space-or-colon rule
/// guards, because `Statements.foo` alone on a line differs from
/// `Statements.foo_bar` alone on a line by that same equality.
pub fn statement_of(output: String, lean_name: String) -> String {
  let name = "Statements." <> lean_name
  let opens = fn(line) {
    string.starts_with(line, name <> " ")
    || string.starts_with(line, name <> ":")
    || line == name
  }
  case list.drop_while(string.split(output, "\n"), fn(l) { !opens(l) }) {
    [] -> ""
    [first, ..more] -> {
      let continuation =
        list.take_while(more, fn(line) {
          string.starts_with(line, " ") && string.trim(line) != ""
        })
      string.join([first, ..continuation], "\n") |> string.trim_end
    }
  }
}

/// Parse the axioms line out of `#print axioms` output: either
/// `'harness_check' depends on axioms: [a, b]` or
/// `'harness_check' does not depend on any axioms`.
fn parse_axioms(output: String) -> List(String) {
  let names =
    output
    |> string.split("\n")
    |> list.find(fn(line) { string.contains(line, "harness_check") })
    |> result.unwrap("")
    |> string.split_once("[")
    |> result.map(fn(pair) { pair.1 })
    |> result.unwrap("")
    |> string.split_once("]")
    |> result.map(fn(pair) { pair.0 })
    |> result.unwrap("")
  case names {
    "" -> []
    _ ->
      names
      |> string.split(",")
      |> list.map(string.trim)
      |> list.filter(fn(s) { s != "" })
  }
}

/// The first line whose trimmed form starts with `import Rule30.Statements`,
/// if any.
fn find_forbidden_import(source: String) -> Option(String) {
  source
  |> string.split("\n")
  |> list.find(fn(line) {
    string.starts_with(string.trim(line), "import Rule30.Statements")
  })
  |> option.from_result
}

/// The first line containing the token `sorry` outside a `--` line comment,
/// if any.
fn find_sorry(source: String) -> Option(String) {
  source
  |> string.split("\n")
  |> list.find(fn(line) {
    let code = case string.split_once(line, "--") {
      Ok(#(before, _)) -> before
      Error(Nil) -> line
    }
    string.contains(code, "sorry")
  })
  |> option.from_result
}

/// The message sent back to the worker.
pub fn verdict_text(v: Verdict) -> String {
  case v {
    Verified(axioms:, ..) -> "VERIFIED. Axioms: " <> string.join(axioms, ", ")
    ForbiddenImport(line) ->
      "FORBIDDEN IMPORT. Never import Rule30.Statements:\n" <> line
    ContainsSorry(line) -> "CONTAINS SORRY:\n" <> line
    BuildFailed(output) ->
      "BUILD FAILED. lake build output follows:\n" <> output
    CheckFailed(output) ->
      "CHECK FAILED. lake env lean output follows:\n" <> output
    BadAxioms(axioms, output) ->
      "BAD AXIOMS: "
      <> string.join(axioms, ", ")
      <> ". lake env lean output follows:\n"
      <> output
  }
}

/// Is this verdict a success.
pub fn is_verified(v: Verdict) -> Bool {
  case v {
    Verified(..) -> True
    _ -> False
  }
}

/// The check theorem: the seeded statement's type, proved by the worker's
/// theorem. This is what makes a worker unable to prove something *near* what
/// it was asked for — the type comes from `Rule30/Statements.lean` and the
/// term comes from the worker's file, so they have to agree.
///
/// **`@` on both sides, and it is load-bearing rather than tidy.** Without it,
/// a statement with implicit or instance binders elaborates as a bare term and
/// Lean inserts those binders as metavariables it then cannot solve. Measured
/// 2026-09-06 against the real toolchain, on `{S : Type} [Fintype S]`:
///
///     type_of% stmt  := prf     error: typeclass instance problem is stuck
///                                      Fintype ?m.1
///     type_of% @stmt := @prf    'harness_check' depends on axioms:
///                                      [propext, Classical.choice, Quot.sound]
///
/// It cost a node and two attempts in run 20260906T230339Z before it was
/// found. The worker's proof was correct and `lake build` was green; only this
/// check failed, so the harness scored a harness defect as node difficulty and
/// escalated the ladder against it.
///
/// It never fired before because every statement seeded until that night had
/// only explicit binders — and `@` changes nothing for those, which was
/// verified on `evolve_left_edge` rather than assumed: identical axioms, both
/// forms, exit 0. That check is the one that matters for the twenty-seven
/// nodes already closed.
pub fn check_source(node: dag.Node) -> String {
  "import Rule30.Statements\n"
  <> "import "
  <> dag.proof_module(node)
  <> "\n"
  <> "theorem harness_check : type_of% @Statements."
  <> node.lean_name
  <> " := @"
  <> node.lean_name
  <> "\n"
  <> "#check Statements."
  <> node.lean_name
  <> "\n"
  <> "#print axioms harness_check\n"
}

// --- does a seeded name resolve where the verifier looks -----------------------

/// Does `Statements.<lean_name>` resolve? `Ok` carries the signature Lean
/// printed; `Error` carries one line saying what is wrong.
///
/// **The check a captain naturally runs answers a different question.**
/// `lake env lean Rule30/Statements.lean` exits 0 on a file whose theorems
/// sit in the wrong namespace, because the file genuinely compiles. On
/// 2026-09-08 three statements were appended AFTER `end Statements`, so they
/// compiled into the root namespace; three workers were dispatched, burned
/// $5.02, and each independently reported that its proof was correct and the
/// fault was outside its reach. It was: `check_source` generates
/// `type_of% @Statements.<lean_name>`, which cannot elaborate against a name
/// that is not there, so every attempt at such a node is unverifiable by
/// construction and its failure reads as node difficulty.
///
/// Reproduced against this toolchain on 2026-09-09 in the fixture project:
/// a theorem after `end Statements` gives `lake build` exit 0, `#check
/// @Statements.escaped_lemma` "Unknown identifier", and `#check
/// @escaped_lemma` a printed signature.
///
/// `@` for the same reason `check_source` uses it: without it a statement
/// with implicit or instance binders elaborates as a bare term and Lean
/// inserts metavariables it cannot solve, so a resolvable name reports as a
/// stuck instance problem.
///
/// **`lake build Rule30.Statements` runs first, and that is not a
/// nicety.** A stale olean reports unknown identifiers for a file that is
/// already correct, which sends the reader chasing a namespace fault that
/// does not exist. The row that asked for this check carried that caution
/// from the hour it was filed in.
pub fn statement_resolves(
  repo_root: String,
  lake: String,
  lean_name: String,
) -> Result(String, String) {
  case shell.run(lake, ["build", "Rule30.Statements"], repo_root, 600_000) {
    Error(msg) -> Error("could not build Rule30.Statements: " <> msg)
    Ok(shell.Run(status:, output:)) if status != 0 ->
      Error("Rule30.Statements does not build: " <> first_line(output))
    Ok(_) -> probe_name(repo_root, lake, lean_name)
  }
}

fn probe_name(
  repo_root: String,
  lake: String,
  lean_name: String,
) -> Result(String, String) {
  let dir = repo_root <> "/harness/build/checks"
  let path = dir <> "/resolves-" <> lean_name <> ".lean"
  let _ = simplifile.create_directory_all(dir)
  case simplifile.write(path, resolve_source(lean_name)) {
    Error(e) ->
      Error("could not write the probe: " <> simplifile.describe_error(e))
    Ok(Nil) ->
      case shell.run(lake, ["env", "lean", path], repo_root, 600_000) {
        Error(msg) -> Error(msg)
        Ok(shell.Run(status:, output:)) if status != 0 ->
          Error(unresolved_message(lean_name, output))
        Ok(shell.Run(output:, ..)) ->
          Ok(string.trim(statement_of(output, lean_name)))
      }
  }
}

/// The probe file: import the statements and ask for the name.
pub fn resolve_source(lean_name: String) -> String {
  "import Rule30.Statements
#check @Statements." <> lean_name <> "
"
}

/// Why a name did not resolve, in one line, with the root-namespace case
/// named because it is the one that has actually happened here and the one
/// a reader will not think of.
fn unresolved_message(lean_name: String, output: String) -> String {
  "`Statements."
  <> lean_name
  <> "` does not resolve, so every attempt at this node is unverifiable by "
  <> "construction: the generated check is `type_of% @Statements."
  <> lean_name
  <> "`. If the statement is in the file, check it is above `end "
  <> "Statements` -- a theorem below it compiles into the root namespace and "
  <> "`lake build` still exits 0. Lean said: "
  <> first_line(output)
}

fn first_line(output: String) -> String {
  output
  |> string.split("\n")
  |> list.find(fn(line) { string.contains(line, "error") })
  |> result.unwrap(string.trim(output))
  |> string.trim
}

// --- the annotation -----------------------------------------------------------

/// The line that opens the harness's block in a proof note. It names the
/// writer and nothing else: every sentence of English the harness adds to a
/// note is one more proposition a reader can misread, so the block is a
/// label and a signature. It is also the marker `annotated` strips before
/// writing, so re-verifying a node replaces the block instead of stacking
/// a second one.
pub const annotation_heading = "**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):"

/// Write `statement` into `node`'s proof file, inside its `/-!` note, once
/// the proof has verified. Nothing outside the note changes, and text that
/// could open or close a comment is refused, so the file that was verified
/// and the file on disk differ only inside one comment block.
pub fn annotate(
  repo_root: String,
  node: dag.Node,
  statement: String,
) -> Result(Nil, String) {
  let path = repo_root <> "/" <> dag.proof_path(node)
  use source <- result.try(
    simplifile.read(path)
    |> result.map_error(fn(e) {
      "could not read " <> path <> ": " <> simplifile.describe_error(e)
    }),
  )
  use updated <- result.try(annotated(source, statement))
  simplifile.write(path, updated)
  |> result.map_error(fn(e) {
    "could not write " <> path <> ": " <> simplifile.describe_error(e)
  })
}

/// The statement currently recorded in `source`'s **Checked type** block, if
/// it has one. `None` is a file that has never been annotated — which is not
/// the same as a file whose block disagrees, and the two must not be
/// collapsed: 34 proof files predate the annotation entirely and are not
/// drift, while a block that disagrees is.
///
/// Reads back exactly what `annotated` writes, so the pair round-trips: the
/// heading, a fenced `lean` block, the statement inside it.
pub fn annotation_in(source: String) -> Option(String) {
  case string.split_once(source, annotation_heading) {
    Error(Nil) -> option.None
    Ok(#(_, after)) ->
      case string.split_once(after, "```lean\n") {
        Error(Nil) -> option.None
        Ok(#(_, body)) ->
          case string.split_once(body, "```") {
            Error(Nil) -> option.None
            Ok(#(statement, _)) -> option.Some(string.trim(statement))
          }
      }
  }
}

/// `source` with the harness's block as the last thing inside its first
/// `/-!` note: `annotation_heading`, then `statement` in a fenced `lean`
/// block. An existing block is replaced, so this is idempotent. Everything
/// outside the note — imports, the theorem, the proof — comes back byte for
/// byte.
///
/// `Error` rather than a guess for a file with no note, a note that is never
/// closed, an empty statement (the parser found no `#check` line: a harness
/// defect the file should not carry), and a statement containing `/-`, `-/`
/// or a code fence — Lean's block comments nest, so any of those could move
/// where the comment ends, and this write must never be able to change what
/// the file means.
pub fn annotated(source: String, statement: String) -> Result(String, String) {
  use <- bool.guard(
    string.trim(statement) == "",
    Error("no statement to write: the check output had no #check line"),
  )
  use <- bool.guard(
    string.contains(statement, "/-")
      || string.contains(statement, "-/")
      || string.contains(statement, "```"),
    Error("the statement contains comment or fence delimiters; not written"),
  )
  use #(before, after) <- result.try(
    string.split_once(source, "/-!")
    |> result.replace_error("the proof file has no /-! note to annotate"),
  )
  use #(body, rest) <- result.try(
    string.split_once(after, "-/")
    |> result.replace_error("the proof file's /-! note is never closed"),
  )
  let worker_text = case string.split_once(body, annotation_heading) {
    Ok(#(theirs, _)) -> theirs
    Error(Nil) -> body
  }
  let block =
    annotation_heading <> "\n```lean\n" <> string.trim(statement) <> "\n```\n"
  Ok(
    before
    <> "/-!"
    <> string.trim_end(worker_text)
    <> "\n\n"
    <> block
    <> "-/"
    <> rest,
  )
}
