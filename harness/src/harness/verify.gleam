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
const allowed_axioms = ["propext", "Classical.choice", "Quot.sound"]

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
/// so that a statement whose name extends another's is not mistaken for it.
pub fn statement_of(output: String, lean_name: String) -> String {
  let name = "Statements." <> lean_name
  let opens = fn(line) {
    string.starts_with(line, name <> " ")
    || string.starts_with(line, name <> ":")
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
