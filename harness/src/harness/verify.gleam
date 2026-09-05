//// Verify a worker's proof file against the captain's statement.
////
//// This is the gate: a node is only marked `Proved` once its proof file
//// builds, avoids the two things a worker must never do (import
//// `Rule30.Statements`, leave a `sorry`), and — checked from outside the
//// worker's own file — has exactly the statement's type and depends on no
//// axiom beyond the three Lean/Mathlib allows. The check theorem is written
//// fresh each time under `<repo>/harness/build/checks/`, which is
//// git-ignored.

import gleam/list
import gleam/option.{type Option}
import gleam/result
import gleam/string
import harness/dag
import harness/shell
import simplifile

/// What verification found. `Verified` is the only success; every other
/// variant carries enough to explain the failure back to the worker.
pub type Verdict {
  Verified(axioms: List(String), output: String)
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

fn verify_build(repo_root: String, lake: String, node: dag.Node) -> Verdict {
  let proof_module = dag.proof_module(node)
  case shell.run(lake, ["build", proof_module], repo_root, 600_000) {
    Error(msg) -> BuildFailed(msg)
    Ok(shell.Run(status:, output:)) if status != 0 -> BuildFailed(output)
    Ok(_) -> verify_check(repo_root, lake, node)
  }
}

fn verify_check(repo_root: String, lake: String, node: dag.Node) -> Verdict {
  let checks_dir = repo_root <> "/harness/build/checks"
  let check_path = checks_dir <> "/" <> node.id <> ".lean"
  let assert Ok(_) = simplifile.create_directory_all(checks_dir)
  let check_source =
    "import Rule30.Statements\n"
    <> "import "
    <> dag.proof_module(node)
    <> "\n"
    <> "theorem harness_check : type_of% Statements."
    <> node.lean_name
    <> " := "
    <> node.lean_name
    <> "\n"
    <> "#print axioms harness_check\n"
  let assert Ok(_) = simplifile.write(check_path, check_source)
  case shell.run(lake, ["env", "lean", check_path], repo_root, 600_000) {
    Error(msg) -> CheckFailed(msg)
    Ok(shell.Run(status:, output:)) if status != 0 -> CheckFailed(output)
    Ok(shell.Run(output:, ..)) -> judge_axioms(output)
  }
}

fn judge_axioms(output: String) -> Verdict {
  let axioms = parse_axioms(output)
  case list.all(axioms, list.contains(allowed_axioms, _)) {
    True -> Verified(axioms, output)
    False -> BadAxioms(axioms, output)
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
