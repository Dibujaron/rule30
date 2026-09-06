//// The dispatcher's decisions, taken against a fixture DAG rather than the
//// live `blueprint/dag.json` — the real one changes every time a node is
//// proved, and a test that reads it is a test that breaks when the project
//// makes progress.

import gleam/option.{None}
import gleam/string
import harness/config
import harness/dag.{Attempt, Dag, Node}
import harness/dispatch
import harness/worker
import simplifile

fn cfg() -> config.Config {
  let assert Ok(c) = config.load()
  let dir = "build/test-runs/dispatch"
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir <> "/agents")
  let path = dir <> "/dag.json"
  let assert Ok(_) = dag.save(fixture(), path)
  config.Config(
    ..c,
    dag_path: path,
    runs_root: dir <> "/runs",
    roster_path: dir <> "/agents/roster.json",
    agents_dir: dir <> "/agents",
  )
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
    reported: True,
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

pub fn prove_one_points_a_claimed_node_at_reopen_test() {
  let c = cfg()
  let assert Ok(d) = dag.load(c.dag_path)
  let assert Ok(n) = dag.get(d, "harness_probe")
  let assert Ok(_) =
    dag.save(dag.update(d, Node(..n, status: dag.Claimed)), c.dag_path)
  let assert Error(reason) = dispatch.prove_one(c, "harness_probe")
  assert string.contains(reason, "it is claimed")
  assert string.contains(reason, "reopen harness_probe")
}

// --- reopen -------------------------------------------------------------------

pub fn reopen_puts_a_claimed_node_back_on_the_board_test() {
  let c = cfg()
  let assert Ok(d) = dag.load(c.dag_path)
  let assert Ok(n) = dag.get(d, "harness_probe")
  let assert Ok(_) =
    dag.save(dag.update(d, Node(..n, status: dag.Claimed)), c.dag_path)

  let assert Ok(said) = dispatch.reopen(c, "harness_probe")
  assert string.contains(said, "is now open")
  let assert Ok(after) = dag.load(c.dag_path)
  let assert Ok(reopened) = dag.get(after, "harness_probe")
  assert reopened.status == dag.Open
}

pub fn reopen_refuses_anything_that_is_not_claimed_test() {
  let c = cfg()
  // Open: there is nothing to undo.
  let assert Error(reason) = dispatch.reopen(c, "harness_probe")
  assert string.contains(reason, "is open, not claimed")

  let assert Ok(d) = dag.load(c.dag_path)
  let assert Ok(n) = dag.get(d, "harness_probe")
  let assert Ok(_) =
    dag.save(dag.update(d, Node(..n, status: dag.Proved)), c.dag_path)
  let assert Error(reason) = dispatch.reopen(c, "harness_probe")
  assert string.contains(reason, "is proved, not claimed")

  let assert Error(reason) = dispatch.reopen(c, "no_such_node")
  assert string.contains(reason, "no node `no_such_node`")
}

// --- the proofs index ---------------------------------------------------------

pub fn with_import_adds_one_sorted_line_and_keeps_the_header_test() {
  let header = "/-\n# Rule30.Proofs\n\nThe dispatcher maintains this.\n-/"
  let existing = header <> "\nimport Rule30.Proofs.EvolveLeftEdge\n"
  let after = dispatch.with_import(existing, "Rule30.Proofs.CenterColumnZero")
  assert after
    == header
    <> "\nimport Rule30.Proofs.CenterColumnZero\nimport Rule30.Proofs.EvolveLeftEdge\n"
}

pub fn with_import_is_idempotent_test() {
  let existing = "/-\nheader\n-/\nimport Rule30.Proofs.CenterColumnZero\n"
  let once = dispatch.with_import(existing, "Rule30.Proofs.CenterColumnZero")
  assert once == existing
  assert dispatch.with_import(once, "Rule30.Proofs.CenterColumnZero") == once
}

pub fn with_import_seeds_an_empty_file_test() {
  assert dispatch.with_import("", "Rule30.Proofs.CenterColumnZero")
    == "import Rule30.Proofs.CenterColumnZero\n"
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

pub fn worth_filing_drops_a_bug_that_lost_its_title_test() {
  // A malformed bug object decodes to `title: ""` (see
  // `worker.reported_bug_decoder`) rather than failing the whole report; the
  // titleless result must not reach the board as a nameless row.
  let good =
    worker.ReportedBug(
      title: "Guard refused lake env lean",
      area: "guard",
      severity: "blocks",
      body: "I needed it to check one file.",
    )
  let titleless =
    worker.ReportedBug(title: "", area: "guard", severity: "friction", body: "")
  assert dispatch.worth_filing([good, titleless]) == [good]
}
