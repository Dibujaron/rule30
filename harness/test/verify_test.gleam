//// The verifier, run against the real toolchain — the one test in this
//// suite that writes into the live checkout, and it has to.
////
//// `verify` builds the proof module with `lake build Rule30.Proofs.<Pascal>`,
//// so the fixture file must sit inside the Lean project, next to every real
//// proof, in a checkout with a built `.lake`. It cannot be moved to a temp
//// root without testing something other than the verifier.
////
//// So the write is unavoidable and the *delete* is the hazard: the fixture
//// is removed on the way out, and a runner killed between the write and the
//// delete leaves a file behind — or, if the name ever collided with a real
//// node, removed that node's proof. Three guards below make the worst case
//// litter rather than loss. See the bug
//// `offline-fixtures-write-into-the-live-checkout`.

import envoy
import gleam/list
import gleam/option.{None}
import gleam/string
import harness/dag.{type Node, Node}
import harness/shell
import harness/verify
import simplifile

/// The live checkout, because a built `.lake` lives there and nowhere else.
/// `HARNESS_REPO_ROOT` overrides it so this is not pinned to one machine —
/// note that pointing it at a fresh worktree makes these tests build Mathlib
/// from scratch, which is why the default is the main checkout.
fn repo() -> String {
  case envoy.get("HARNESS_REPO_ROOT") {
    Ok("") | Error(Nil) -> "C:\\Users\\dibuj\\dev\\rule30"
    Ok(root) -> root
  }
}

/// The fixture's node id, and the whole of its collision safety.
///
/// `dag.proof_path` derives the file name from the *id*, not the
/// `lean_name`, so this id alone decides which file gets written and then
/// deleted. It is deliberately not `harness_probe`: that is the `lean_name`
/// of a real statement in `Rule30/Statements.lean`, and a fixture whose file
/// name can coincide with a node's is one rename away from deleting a real
/// proof — which has happened once already (see `agents/Rowan.md`).
///
/// `probe_claims_no_real_node_test` is what keeps this true rather than
/// merely intended.
const probe_id = "harness_probe_fixture"

/// The statement this fixture proves. Unlike the id, this *must* match a
/// real `Statements.` declaration: `verify` writes
/// `type_of% Statements.<lean_name>` into its check theorem.
const probe_lean_name = "harness_probe"

fn harness_probe() -> Node {
  Node(
    id: probe_id,
    region: "P2",
    lean_name: probe_lean_name,
    description: "",
    deps: [],
    status: dag.Claimed,
    size: dag.S,
    proof_file: None,
    attempts: [],
    verified: None,
  )
}

/// No node in the live DAG may own the file this fixture writes and deletes.
///
/// This is the test that makes the rest of the file safe, so it asserts
/// against `blueprint/dag.json` itself rather than a fixture DAG: the thing
/// worth knowing is whether the *real* board has grown a node that collides,
/// and a fixture board cannot tell us that.
pub fn probe_claims_no_real_node_test() {
  let assert Ok(d) = dag.load(repo() <> "/blueprint/dag.json")
  let probe_path = dag.proof_path(harness_probe())
  let collisions =
    d.nodes
    |> list.filter(fn(n) { dag.proof_path(n) == probe_path })
    |> list.map(fn(n) { n.id })
  assert collisions == []
}

/// Writes `body` to the fixture path, runs `verify.verify` against it, and
/// deletes the fixture before returning the verdict — even if the caller's
/// own assertion on the verdict fails, since the delete happens first.
///
/// Refuses to start if the file already exists. A leftover from a killed
/// runner is the expected cause, and the right response is to fail loudly:
/// overwriting it would destroy whatever is there, and this fixture must
/// never be the thing that deletes a file it did not create.
fn verify_with_proof(body: String) -> verify.Verdict {
  let root = repo()
  let path = root <> "/" <> dag.proof_path(harness_probe())
  let assert Ok(_) = simplifile.create_directory_all(root <> "/Rule30/Proofs")
  let assert Ok(False) = simplifile.is_file(path)
  let assert Ok(_) = simplifile.write(path, body)
  let assert Ok(lake) = shell.which("lake")
  let v = verify.verify(root, lake, harness_probe())
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
