//// The dispatcher's decisions, taken against a fixture DAG rather than the
//// live `blueprint/dag.json` — the real one changes every time a node is
//// proved, and a test that reads it is a test that breaks when the project
//// makes progress.

import gleam/option.{None}
import gleam/string
import harness/config
import harness/dag.{Attempt, Dag, Node}
import harness/dispatch
import simplifile

fn cfg() -> config.Config {
  let assert Ok(c) = config.load()
  let dir = "build/test-runs/dispatch"
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let path = dir <> "/dag.json"
  let assert Ok(_) = dag.save(fixture(), path)
  config.Config(..c, dag_path: path)
}

fn node(
  id: String,
  lean_name: String,
  size: dag.Size,
  deps: List(String),
) -> dag.Node {
  Node(
    id:,
    region: "P2",
    lean_name:,
    description: "a fixture node",
    deps:,
    status: dag.Open,
    size:,
    proof_file: None,
    attempts: [],
    verified: None,
  )
}

/// Three open nodes: one that unblocks another, the one it blocks, and one
/// whose `lean_name` is in no statement file.
fn fixture() -> dag.Dag {
  Dag([
    node("harness_probe", "harness_probe", dag.S, []),
    node("probe_corollary", "harness_probe", dag.M, ["harness_probe"]),
    node("ghost_lemma", "not_a_theorem_anywhere", dag.S, []),
  ])
}

fn attempt(outcome: dag.Outcome) -> dag.Attempt {
  Attempt(
    identity: "Scripted",
    session_id: "s",
    model: "haiku",
    started: "t0",
    ended: "t1",
    outcome:,
    estimate: dag.S,
    cost_usd: 0.0,
    turns: 1,
    notes: "",
  )
}

// --- status -------------------------------------------------------------------

pub fn status_lists_every_node_and_the_open_leaves_test() {
  let assert Ok(text) = dispatch.status(cfg())
  assert string.contains(text, "harness_probe")
  assert string.contains(text, "ghost_lemma")
  assert string.contains(text, "attempts=")
  let assert Ok(#(_, leaves)) =
    string.split_once(text, "Open leaves, in dispatch order:\n")
  // `harness_probe` unblocks one other node, so it leads; `probe_corollary`
  // is not a leaf at all while its dependency is open.
  assert string.starts_with(string.trim(leaves), "harness_probe")
  assert !string.contains(leaves, "probe_corollary")
}

// --- refusals -----------------------------------------------------------------

pub fn prove_one_refuses_an_unknown_node_test() {
  let assert Error(reason) = dispatch.prove_one(cfg(), "no_such_node")
  assert string.contains(reason, "no node `no_such_node`")
}

pub fn prove_one_refuses_a_node_whose_deps_are_open_test() {
  let assert Error(reason) = dispatch.prove_one(cfg(), "probe_corollary")
  assert string.contains(reason, "is not an open leaf")
  assert string.contains(reason, "harness_probe=open")
}

pub fn prove_one_refuses_a_node_with_no_statement_test() {
  // Nothing is launched: a node whose statement cannot be found has nothing
  // to dispatch a worker *about*, and an empty lean block in the task
  // message would be a silent lie.
  let assert Error(reason) = dispatch.prove_one(cfg(), "ghost_lemma")
  assert string.contains(reason, "not_a_theorem_anywhere")
  assert string.contains(reason, "Statements.lean")
}

// --- what counts against the ladder -------------------------------------------

pub fn a_pause_does_not_burn_a_ladder_rung_test() {
  let n =
    Node(..node("l_node", "l_node", dag.L, []), attempts: [
      attempt(dag.RateLimited),
      attempt(dag.TimedOut),
    ])
  // An `L` node has a one-rung ladder. Two pauses must still leave it there.
  assert dispatch.failed_attempts(n) == 0
  assert config.model_for(n.size, dispatch.failed_attempts(n)) == Ok("opus")
}

pub fn giving_up_and_exhausting_the_budget_burn_a_rung_test() {
  let n =
    Node(..node("s_node", "s_node", dag.S, []), attempts: [
      attempt(dag.GaveUp),
      attempt(dag.BudgetExhausted),
    ])
  assert dispatch.failed_attempts(n) == 2
  assert config.model_for(n.size, dispatch.failed_attempts(n)) == Ok("opus")
}

pub fn a_closed_attempt_is_not_a_failure_test() {
  let n =
    Node(..node("s_node", "s_node", dag.S, []), attempts: [
      attempt(dag.Closed),
      attempt(dag.Reduced),
    ])
  assert dispatch.failed_attempts(n) == 0
}
