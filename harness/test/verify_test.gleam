import gleam/option.{None}
import gleam/string
import harness/dag.{type Node, Node}
import harness/shell
import harness/verify
import simplifile

const repo = "C:\\Users\\dibuj\\dev\\rule30"

fn center_zero() -> Node {
  Node(
    id: "centerColumn_zero",
    region: "P2",
    lean_name: "centerColumn_zero",
    description: "",
    deps: [],
    status: dag.Claimed,
    size: dag.S,
    proof_file: None,
    attempts: [],
    verified: None,
  )
}

fn with_proof(body: String, run: fn() -> Nil) -> Nil {
  let path = repo <> "\\Rule30\\Proofs\\CenterColumnZero.lean"
  let assert Ok(_) = simplifile.create_directory_all(repo <> "\\Rule30\\Proofs")
  let assert Ok(_) = simplifile.write(path, body)
  run()
  let assert Ok(_) = simplifile.delete(path)
  Nil
}

pub fn accepts_a_real_proof_test() {
  let assert Ok(lake) = shell.which("lake")
  use <- with_proof(
    "import Rule30.Basic\ntheorem centerColumn_zero : centerColumn 0 = true := by decide\n",
  )
  let v = verify.verify(repo, lake, center_zero())
  assert verify.is_verified(v)
}

pub fn rejects_sorry_test() {
  let assert Ok(lake) = shell.which("lake")
  use <- with_proof(
    "import Rule30.Basic\ntheorem centerColumn_zero : centerColumn 0 = true := by sorry\n",
  )
  let assert verify.ContainsSorry(_) = verify.verify(repo, lake, center_zero())
  Nil
}

pub fn rejects_wrong_statement_test() {
  let assert Ok(lake) = shell.which("lake")
  use <- with_proof(
    "import Rule30.Basic\ntheorem centerColumn_zero : centerColumn 2 = false := by decide\n",
  )
  let v = verify.verify(repo, lake, center_zero())
  let assert verify.CheckFailed(out) = v
  assert string.contains(out, "type mismatch") || string.contains(out, "error")
}

pub fn rejects_forbidden_import_test() {
  let assert Ok(lake) = shell.which("lake")
  use <- with_proof(
    "import Rule30.Statements\ntheorem centerColumn_zero : centerColumn 0 = true := Statements.centerColumn_zero\n",
  )
  let assert verify.ForbiddenImport(_) =
    verify.verify(repo, lake, center_zero())
  Nil
}
