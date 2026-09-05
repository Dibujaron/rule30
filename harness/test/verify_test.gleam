import gleam/option.{None}
import gleam/string
import harness/dag.{type Node, Node}
import harness/shell
import harness/verify
import simplifile

const repo = "C:\\Users\\dibuj\\dev\\rule30"

fn harness_probe() -> Node {
  Node(
    id: "harness_probe",
    region: "P2",
    lean_name: "harness_probe",
    description: "",
    deps: [],
    status: dag.Claimed,
    size: dag.S,
    proof_file: None,
    attempts: [],
    verified: None,
  )
}

/// Writes `body` to the fixture path, runs `verify.verify` against it, and
/// deletes the fixture before returning the verdict — even if the caller's
/// own assertion on the verdict fails, since the delete happens first.
fn verify_with_proof(body: String) -> verify.Verdict {
  let path = repo <> "\\Rule30\\Proofs\\HarnessProbe.lean"
  let assert Ok(_) = simplifile.create_directory_all(repo <> "\\Rule30\\Proofs")
  let assert Ok(_) = simplifile.write(path, body)
  let assert Ok(lake) = shell.which("lake")
  let v = verify.verify(repo, lake, harness_probe())
  let assert Ok(_) = simplifile.delete(path)
  v
}

pub fn accepts_a_real_proof_test() {
  let v =
    verify_with_proof(
      "import Rule30.Basic\ntheorem harness_probe : True := trivial\n",
    )
  assert verify.is_verified(v)
}

pub fn rejects_sorry_test() {
  let v =
    verify_with_proof(
      "import Rule30.Basic\ntheorem harness_probe : True := by sorry\n",
    )
  let assert verify.ContainsSorry(_) = v
  Nil
}

pub fn rejects_wrong_statement_test() {
  let v = verify_with_proof("theorem harness_probe : 1 = 1 := rfl\n")
  let assert verify.CheckFailed(out) = v
  assert string.contains(out, "type mismatch") || string.contains(out, "error")
}

pub fn rejects_forbidden_import_test() {
  let v =
    verify_with_proof(
      "import Rule30.Statements\ntheorem harness_probe : True := Statements.harness_probe\n",
    )
  let assert verify.ForbiddenImport(_) = v
  Nil
}
