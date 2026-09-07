//// The dispatcher's decisions, taken against a fixture DAG rather than the
//// live `blueprint/dag.json` — the real one changes every time a node is
//// proved, and a test that reads it is a test that breaks when the project
//// makes progress.

import gleam/json
import gleam/list
import gleam/option.{None}
import gleam/string
import harness/config
import harness/dag.{Attempt, Dag, Node}
import harness/dispatch
import harness/guard
import harness/log
import harness/verify
import harness/worker
import simplifile

fn cfg() -> config.Config {
  cfg_for(fixture())
}

fn cfg_for(d: dag.Dag) -> config.Config {
  let assert Ok(c) = config.load()
  let dir = "build/test-runs/dispatch"
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir <> "/agents")
  let path = dir <> "/dag.json"
  let assert Ok(_) = dag.save(d, path)
  config.Config(
    ..c,
    dag_path: path,
    // Overridden even though nothing in this file reaches an attempt end:
      // every `prove_one` below asserts `Error`, so `auto_file_signals` never
      // runs. That is a property of these assertions rather than of the code,
      // and the first test here that completes an attempt would file a bug
      // onto the real `blueprint/bugs.json`.
      bugs_path: dir <> "/bugs.json",
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

pub fn status_lists_a_walled_ready_node_separately_from_open_leaves_test() {
  let d =
    Dag([
      node("harness_probe", "harness_probe", dag.S, []),
      node("walled_probe", "walled_probe", dag.Wall, []),
    ])
  let assert Ok(text) = dispatch.status(cfg_for(d))
  let assert Ok(#(_, leaves)) =
    string.split_once(text, "Open leaves, in dispatch order:\n")
  // A wall node whose deps are satisfied is ready by the DAG's own
  // definition, but the scheduler will never start it, so it must not be
  // listed as if it were dispatchable.
  assert !string.contains(leaves, "walled_probe")
  assert string.contains(text, "walled_probe")
  assert string.contains(text, "decompos")
}

pub fn status_names_the_rungs_that_failed_and_the_ones_the_harness_broke_test() {
  let d =
    Dag([
      Node(..node("harness_probe", "harness_probe", dag.S, []), attempts: [
        attempt(dag.BudgetExhausted),
        Attempt(..attempt(dag.GaveUp), model: "sonnet"),
        Attempt(..attempt(dag.HarnessFailed), model: "opus"),
        Attempt(..attempt(dag.RateLimited), model: "opus"),
      ]),
      node("ghost_lemma", "not_a_theorem_anywhere", dag.S, []),
    ])
  let assert Ok(text) = dispatch.status(cfg_for(d))
  // Four attempts, but a reader must be able to see that two of them were
  // the ladder's cheap rungs and one was the harness's own doing; a pause
  // is listed under neither.
  assert string.contains(text, "attempts=4 failed=haiku,sonnet harness=opus")
  // A node with nothing to say says nothing after the count.
  assert dispatch.rungs_tried(node("ghost_lemma", "ghost_lemma", dag.S, []))
    == ""
}

pub fn status_pads_the_id_column_to_the_longest_id_present_test() {
  let long_id = "evolve_left_fourth_diagonal_isEventuallyPeriodic"
  let d = Dag([node(long_id, "harness_probe", dag.S, [])])
  let assert Ok(text) = dispatch.status(cfg_for(d))
  // Padded to the longest id present means the id and the status word that
  // follows it stay separated by whitespace, whatever the id's length —
  // constant-width padding fuses them once the id outgrows the constant.
  assert string.contains(text, long_id <> " ")
  assert string.contains(text, "open")
  assert !string.contains(text, long_id <> "open")
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

pub fn a_harness_failure_does_not_burn_a_ladder_rung_test() {
  // An `L` node has a one-rung ladder. Two attempts the harness broke must
  // leave it on that rung, not abandon the node — this is the case where
  // the verifier could not build and the record used to say the node was
  // hard.
  let n =
    Node(..node("l_node", "l_node", dag.L, []), attempts: [
      attempt(dag.HarnessFailed),
      attempt(dag.HarnessFailed),
    ])
  assert dispatch.failed_attempts(n) == 0
  assert config.model_for(n.size, dispatch.failed_attempts(n)) == Ok("opus")
}

// --- attributing a failure to the harness ------------------------------------

fn prover_rules(node_id: String) -> guard.Rules {
  guard.Rules(
    repo_root: "C:\\r",
    role: guard.Prover(allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean"),
    holder: node_id,
  )
}

/// A log holding what the guard and the worker would have written during an
/// attempt at `node_id`: one guard row per denial, one `verify` row per
/// verdict, both built by the real producers so a renamed field fails here.
fn attempt_log(
  dir: String,
  node_id: String,
  denials: List(guard.Decision),
  verdicts: List(verify.Verdict),
) -> log.Log {
  let _ = simplifile.delete(dir)
  let assert Ok(l) = log.open(dir, "run")
  list.each(denials, fn(decision) {
    log.event(
      l,
      "guard",
      guard.event_fields(
        prover_rules(node_id),
        "PreToolUse",
        "Bash",
        "lake build Rule30",
        decision,
      ),
    )
  })
  list.each(verdicts, fn(v) {
    log.event(l, "verify", [
      #("node", json.string(node_id)),
      #("verified", json.bool(verify.is_verified(v))),
      #("verdict", json.string(verify.verdict_text(v))),
    ])
  })
  l
}

const lock_timeout = guard.Deny(guard.BuildLockTimeout, "build lock timeout")

const grammar = guard.Deny(guard.NotPermitted, "shell operators")

pub fn a_build_lock_timeout_from_the_guard_makes_a_harness_failure_test() {
  let l =
    attempt_log(
      "build/test-runs/attribute-guard",
      "probe_one",
      [lock_timeout],
      [],
    )
  let a = dispatch.attribute(l, "probe_one", attempt(dag.GaveUp))
  assert a.outcome == dag.HarnessFailed
  assert string.contains(a.notes, "build_lock_timeout")
  assert string.contains(a.notes, "lake build Rule30")
}

pub fn a_policy_denial_is_still_the_workers_failure_test() {
  // `not_permitted` is the guard doing its job. A worker that ran into the
  // grammar and then gave up was beaten by the rules, not by the harness.
  let l =
    attempt_log("build/test-runs/attribute-policy", "probe_one", [grammar], [])
  let a = dispatch.attribute(l, "probe_one", attempt(dag.GaveUp))
  assert a.outcome == dag.GaveUp
}

pub fn a_lock_held_last_verdict_makes_a_harness_failure_test() {
  let l =
    attempt_log("build/test-runs/attribute-verify", "probe_one", [], [
      verify.BuildFailed("error: unsolved goals"),
      verify.BuildFailed(dispatch.lock_held_message),
    ])
  let a = dispatch.attribute(l, "probe_one", attempt(dag.BudgetExhausted))
  assert a.outcome == dag.HarnessFailed
  assert string.contains(a.notes, dispatch.lock_held_message)
}

pub fn a_real_verdict_after_a_lock_timeout_is_still_the_workers_failure_test() {
  // The verifier timed out once, then actually built the proof and found it
  // wrong. The last word was about the proof, so the failure is the
  // worker's; the earlier timeout cost it a round, not the attempt.
  let l =
    attempt_log("build/test-runs/attribute-verify-then-real", "probe_one", [], [
      verify.BuildFailed(dispatch.lock_held_message),
      verify.BuildFailed("error: unsolved goals"),
    ])
  let a = dispatch.attribute(l, "probe_one", attempt(dag.BudgetExhausted))
  assert a.outcome == dag.BudgetExhausted
}

pub fn only_a_rung_burning_outcome_is_re_read_test() {
  // A proof that closed despite a lock timeout closed; a pause is a pause.
  let l =
    attempt_log(
      "build/test-runs/attribute-closed",
      "probe_one",
      [lock_timeout],
      [
        verify.BuildFailed(dispatch.lock_held_message),
      ],
    )
  assert dispatch.attribute(l, "probe_one", attempt(dag.Closed)).outcome
    == dag.Closed
  assert dispatch.attribute(l, "probe_one", attempt(dag.RateLimited)).outcome
    == dag.RateLimited
  assert dispatch.attribute(l, "probe_one", attempt(dag.TimedOut)).outcome
    == dag.TimedOut
}

pub fn a_signal_about_the_node_next_door_does_not_count_test() {
  let l =
    attempt_log(
      "build/test-runs/attribute-neighbour",
      "probe_two",
      [lock_timeout],
      [
        verify.BuildFailed(dispatch.lock_held_message),
      ],
    )
  assert dispatch.attribute(l, "probe_one", attempt(dag.GaveUp)).outcome
    == dag.GaveUp
}

pub fn attribute_is_a_no_op_without_a_log_test() {
  let missing = log.Log(dir: "build/test-runs/no-such-attempt", run_id: "run")
  let a = attempt(dag.GaveUp)
  assert dispatch.attribute(missing, "probe_one", a) == a
}

pub fn harness_failed_round_trips_through_the_dag_test() {
  assert dag.outcome_to_string(dag.HarnessFailed) == "harness_failed"
  let dir = "build/test-runs/harness-failed-json"
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let d =
    Dag([
      Node(..node("s_node", "s_node", dag.S, []), attempts: [
        attempt(dag.HarnessFailed),
      ]),
    ])
  let assert Ok(_) = dag.save(d, dir <> "/dag.json")
  let assert Ok(loaded) = dag.load(dir <> "/dag.json")
  assert loaded == d
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

// --- reading the guard's rows back -------------------------------------------------

/// `guard_denials` reads JSON that `guard` and `log` write, two modules away.
/// Build the rows with the real producer rather than by hand, so a rename on
/// either side fails here — a hand-written fixture would keep passing while
/// the harness quietly filed nothing for the rest of the project's life.
pub fn guard_denials_reads_the_rows_the_guard_actually_writes_test() {
  let dir = "build/test-runs/denied-tools"
  let _ = simplifile.delete(dir)
  let assert Ok(l) = log.open(dir, "run")
  let at = fn(node_id) {
    guard.Rules(
      repo_root: "C:\\r",
      role: guard.Prover(allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean"),
      holder: node_id,
    )
  }
  let write = fn(node_id, tool, attempted, decision) {
    log.event(
      l,
      "guard",
      guard.event_fields(at(node_id), "PreToolUse", tool, attempted, decision),
    )
  }
  let grammar = guard.Deny(guard.NotPermitted, "shell operators")
  write("probe_one", "Bash", "lake build ; rm -rf /", grammar)
  write("probe_one", "Bash", "lake build ; rm -rf /", grammar)
  write("probe_one", "Edit", "X.lean", guard.Allow)
  write(
    "probe_two",
    "Write",
    "C:/r/other.lean",
    guard.Deny(guard.NotWritable, "outside the proof file"),
  )

  // Denials only, deduplicated, and nothing belonging to the node next door.
  assert dispatch.guard_denials(l, "probe_one")
    == [
      dispatch.GuardDenial(
        tool: "Bash",
        denial: "not_permitted",
        attempted: "lake build ; rm -rf /",
      ),
    ]
  assert dispatch.guard_denials(l, "probe_two")
    == [
      dispatch.GuardDenial(
        tool: "Write",
        denial: "not_writable",
        attempted: "C:/r/other.lean",
      ),
    ]
  assert dispatch.guard_denials(l, "probe_three") == []
}

/// The whole point of the split: two refusals of the same tool that mean
/// opposite things must not collapse into one row, because the signature
/// `dispatch` files them under is built from both fields. A permanent
/// grammar refusal is the worker's problem; a build-lock timeout is a
/// sibling worker holding the lock and says nothing about this call at all.
pub fn two_denials_of_one_tool_stay_apart_test() {
  let dir = "build/test-runs/denial-kinds"
  let _ = simplifile.delete(dir)
  let assert Ok(l) = log.open(dir, "run")
  let at =
    guard.Rules(
      repo_root: "C:\\r",
      role: guard.Prover(allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean"),
      holder: "probe_one",
    )
  let write = fn(attempted, decision) {
    log.event(
      l,
      "guard",
      guard.event_fields(at, "PreToolUse", "Bash", attempted, decision),
    )
  }
  write("lake build ; rm -rf /", guard.Deny(guard.NotPermitted, "grammar"))
  write("lake build Rule30", guard.Deny(guard.BuildLockTimeout, "timeout"))

  let found = dispatch.guard_denials(l, "probe_one")
  assert list.length(found) == 2
  let kinds = list.map(found, fn(d) { d.denial }) |> list.sort(string.compare)
  assert kinds == ["build_lock_timeout", "not_permitted"]
}

/// A command carrying the characters a scrape would choke on. `attempted` is
/// the one field in the row that the *worker* chose, so it can contain an
/// escaped quote — which truncates a `split_once` on `"` — or the literal
/// text of another field's key, which would let a command forge a field.
/// Decoding the line is what makes this safe, and this is the test that
/// would notice if it went back to a scrape.
pub fn a_denial_survives_a_command_full_of_json_test() {
  let dir = "build/test-runs/denial-quoting"
  let _ = simplifile.delete(dir)
  let assert Ok(l) = log.open(dir, "run")
  let at =
    guard.Rules(
      repo_root: "C:\\r",
      role: guard.Prover(allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean"),
      holder: "probe_one",
    )
  let nasty = "lake build \"x\",\"denial\":\"build_lock_timeout\""
  log.event(
    l,
    "guard",
    guard.event_fields(
      at,
      "PreToolUse",
      "Bash",
      nasty,
      guard.Deny(guard.NotPermitted, "grammar"),
    ),
  )
  assert dispatch.guard_denials(l, "probe_one")
    == [
      dispatch.GuardDenial(
        tool: "Bash",
        denial: "not_permitted",
        attempted: nasty,
      ),
    ]
}

/// A row written by an older guard has no `denial` field. It must still
/// reach the board — a change that made denials silently stop being filed
/// would be the very defect this one removes.
pub fn a_row_without_a_denial_field_still_files_test() {
  let dir = "build/test-runs/denial-legacy"
  let _ = simplifile.delete(dir)
  let assert Ok(l) = log.open(dir, "run")
  log.event(l, "guard", [
    #("node", json.string("probe_one")),
    #("event", json.string("PreToolUse")),
    #("tool", json.string("Bash")),
    #("decision", json.string("Deny(\"only lake build is permitted\")")),
  ])
  assert dispatch.guard_denials(l, "probe_one")
    == [dispatch.GuardDenial(tool: "Bash", denial: "unknown", attempted: "")]
}

/// An attempt that died before its log existed files nothing rather than
/// crashing the dispatcher on the way out of a failed run.
pub fn guard_denials_is_empty_without_a_log_test() {
  let missing = log.Log(dir: "build/test-runs/no-such-attempt", run_id: "run")
  assert dispatch.guard_denials(missing, "probe_one") == []
}
