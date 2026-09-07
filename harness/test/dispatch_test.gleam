//// The dispatcher's decisions, taken against a fixture DAG rather than the
//// live `blueprint/dag.json` — the real one changes every time a node is
//// proved, and a test that reads it is a test that breaks when the project
//// makes progress.

import gleam/json
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import harness/bugs
import harness/config
import harness/dag.{Attempt, Dag, Node}
import harness/dispatch
import harness/guard
import harness/guard_event
import harness/log
import harness/roster
import harness/seed
import harness/verify
import harness/worker
import lean_fixture
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
    // `prove_one` never checks the stop file, but a fixture whose `repo_root`
      // is the live checkout should not be one config field away from reading
      // the captain's `STOP`.
      stop_path: dir <> "/STOP",
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
    claimed_by: None,
    claimed_at: None,
    claimed_run: None,
    object: None,
    under: None,
    research: False,
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

pub fn status_marks_a_research_node_and_lists_it_last_test() {
  // `deep_probe` unblocks a node and would lead the leaf list by rank; it is
  // research, so the row says so and the leaf list puts it behind the
  // ordinary leaf the scheduler would take first.
  let d =
    Dag([
      Node(..node("deep_probe", "harness_probe", dag.L, []), research: True),
      node("deep_corollary", "harness_probe", dag.M, ["deep_probe"]),
      node("harness_probe", "harness_probe", dag.S, []),
    ])
  let assert Ok(text) = dispatch.status(cfg_for(d))
  assert string.contains(text, "L research")
  let assert Ok(#(_, leaves)) =
    string.split_once(text, "Open leaves, in dispatch order:\n")
  let assert Ok(#(before, after)) = string.split_once(leaves, "deep_probe")
  assert string.contains(before, "harness_probe")
  assert string.contains(after, "size L research")
}

pub fn a_research_node_always_has_a_model_left_test() {
  // Six failures on a four-rung ladder: an ordinary node is exhausted, a
  // research node is at its top rung again.
  let attempts = [
    attempt(dag.GaveUp),
    attempt(dag.BudgetExhausted),
    attempt(dag.GaveUp),
    attempt(dag.GaveUp),
    attempt(dag.GaveUp),
    attempt(dag.GaveUp),
  ]
  let ordinary = Node(..node("s_node", "s_node", dag.S, []), attempts:)
  let research = Node(..ordinary, research: True)
  assert dispatch.failed_attempts(research) == 6
  assert config.model_for(ordinary.size, 6, research: False) == Error(Nil)
  assert config.model_for(research.size, 6, research: True) == Ok("fable")
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
  // A claim with no record of its own says so, rather than inventing one.
  assert string.contains(reason, "no holder, time or run recorded")

  // A recorded claim is named in the refusal, so the reader deciding whether
  // to reopen has the holder, the run and the age in front of them.
  let assert Ok(_) = dag.save(dag.update(d, held(n)), c.dag_path)
  let assert Error(reason) = dispatch.prove_one(c, "harness_probe")
  assert string.contains(reason, "held by Vesper since 2026-09-07T03:00:00Z")
  assert string.contains(reason, "run 20260907T030000Z")
}

/// `harness_probe` as a claim made under a run that is not on disk.
fn held(n: dag.Node) -> dag.Node {
  dag.claim(
    n,
    by: "Vesper",
    at: "2026-09-07T03:00:00Z",
    run: "20260907T030000Z",
  )
}

pub fn status_names_the_holder_run_and_age_of_a_claim_test() {
  let c = cfg()
  let assert Ok(d) = dag.load(c.dag_path)
  let assert Ok(n) = dag.get(d, "harness_probe")
  let assert Ok(_) = dag.save(dag.update(d, held(n)), c.dag_path)
  let assert Ok(text) = dispatch.status(c)
  let assert Ok(row) =
    string.split(text, "\n")
    |> list.find(fn(line) { string.starts_with(line, "harness_probe ") })
  assert string.contains(row, "claimed")
  assert string.contains(row, "held by Vesper since 2026-09-07T03:00:00Z")
  // The age is computed against the real clock, so only its shape is
  // pinned here; the arithmetic is `log_test`'s.
  assert string.contains(row, " ago), run 20260907T030000Z")
  // No `runs/<run>/summary.txt` exists for that run, and its absence is
  // NOT evidence the run is dead — a live run has not written one either.
  assert string.contains(row, "not ended (live, or died without writing)")
  // An open node says nothing about a claim it does not hold.
  let assert Ok(other) =
    string.split(text, "\n")
    |> list.find(fn(line) { string.starts_with(line, "ghost_lemma ") })
  assert !string.contains(other, "held by")
}

pub fn status_calls_a_claim_stale_once_its_run_has_written_a_summary_test() {
  let c = cfg()
  let assert Ok(d) = dag.load(c.dag_path)
  let assert Ok(n) = dag.get(d, "harness_probe")
  let assert Ok(_) = dag.save(dag.update(d, held(n)), c.dag_path)
  // The one liveness fact readable from outside: the run's closing summary
  // is written when the run ends, so a claim whose run has one is stale
  // for certain.
  let assert Ok(l) = log.open(c.runs_root, "20260907T030000Z")
  log.summary(l, "run ended")
  let assert Ok(text) = dispatch.status(c)
  assert string.contains(text, "which has ended: this claim is stale")
  let _ = simplifile.delete(l.dir)
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
  assert string.contains(said, "no holder, time or run recorded")
  let assert Ok(after) = dag.load(c.dag_path)
  let assert Ok(reopened) = dag.get(after, "harness_probe")
  assert reopened.status == dag.Open
}

pub fn reopen_says_which_claim_it_is_clearing_and_clears_it_test() {
  let c = cfg()
  let assert Ok(d) = dag.load(c.dag_path)
  let assert Ok(n) = dag.get(d, "harness_probe")
  let assert Ok(_) = dag.save(dag.update(d, held(n)), c.dag_path)

  let assert Ok(said) = dispatch.reopen(c, "harness_probe")
  // The claim is gone from the node once this returns, so the message is
  // the last place it is legible: holder, time, run.
  assert string.contains(said, "held by Vesper since 2026-09-07T03:00:00Z")
  assert string.contains(said, "run 20260907T030000Z")
  assert string.contains(said, "claim cleared")
  let assert Ok(after) = dag.load(c.dag_path)
  let assert Ok(reopened) = dag.get(after, "harness_probe")
  assert reopened.status == dag.Open
  assert reopened.claimed_by == None
  assert reopened.claimed_at == None
  assert reopened.claimed_run == None
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
  // An `L` node starts on opus. Two pauses must still leave it there.
  assert dispatch.failed_attempts(n) == 0
  assert config.model_for(n.size, dispatch.failed_attempts(n), research: False)
    == Ok("opus")
}

pub fn giving_up_and_exhausting_the_budget_burn_a_rung_test() {
  let n =
    Node(..node("s_node", "s_node", dag.S, []), attempts: [
      attempt(dag.GaveUp),
      attempt(dag.BudgetExhausted),
    ])
  assert dispatch.failed_attempts(n) == 2
  assert config.model_for(n.size, dispatch.failed_attempts(n), research: False)
    == Ok("opus")
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
  // An `L` node starts on opus. Two attempts the harness broke must leave
  // it on that rung, not escalate the node — this is the case where the
  // verifier could not build and the record used to say the node was hard.
  let n =
    Node(..node("l_node", "l_node", dag.L, []), attempts: [
      attempt(dag.HarnessFailed),
      attempt(dag.HarnessFailed),
    ])
  assert dispatch.failed_attempts(n) == 0
  assert config.model_for(n.size, dispatch.failed_attempts(n), research: False)
    == Ok("opus")
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
    guard_event.write(
      l,
      guard.event(
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

const lock_timeout = guard.Deny(
  guard_event.BuildLockTimeout,
  "build lock timeout",
)

const grammar = guard.Deny(guard_event.NotPermitted, "shell operators")

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
/// (`guard_test.a_denial_over_the_wire_reaches_dispatch_test` goes one step
/// further and produces the row over HTTP.)
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
    guard_event.write(
      l,
      guard.event(at(node_id), "PreToolUse", tool, attempted, decision),
    )
  }
  let grammar = guard.Deny(guard_event.NotPermitted, "shell operators")
  write("probe_one", "Bash", "lake build ; rm -rf /", grammar)
  write("probe_one", "Bash", "lake build ; rm -rf /", grammar)
  write("probe_one", "Edit", "X.lean", guard.Allow)
  write(
    "probe_two",
    "Write",
    "C:/r/other.lean",
    guard.Deny(guard_event.NotWritable, "outside the proof file"),
  )

  // Denials only, deduplicated, and nothing belonging to the node next door.
  assert dispatch.guard_denials(l, "probe_one")
    == [
      dispatch.GuardDenial(
        tool: "Bash",
        denial: guard_event.NotPermitted,
        attempted: "lake build ; rm -rf /",
      ),
    ]
  assert dispatch.guard_denials(l, "probe_two")
    == [
      dispatch.GuardDenial(
        tool: "Write",
        denial: guard_event.NotWritable,
        attempted: "C:/r/other.lean",
      ),
    ]
  assert dispatch.guard_denials(l, "probe_three") == []
}

/// The whole point of the split: two refusals of the same tool that mean
/// opposite things go to opposite places. A permanent grammar refusal is
/// the worker's problem and a guard denial; a build-lock timeout is a
/// sibling worker holding the lock, says nothing about this call, and is
/// contention — counted per row, since how often it happened is the point.
pub fn a_lock_timeout_is_contention_not_a_guard_denial_test() {
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
    guard_event.write(
      l,
      guard.event(at, "PreToolUse", "Bash", attempted, decision),
    )
  }
  let timeout = guard.Deny(guard_event.BuildLockTimeout, "timeout")
  write(
    "lake build ; rm -rf /",
    guard.Deny(guard_event.NotPermitted, "grammar"),
  )
  write("lake build Rule30", timeout)
  write("lake build Rule30", timeout)

  assert dispatch.guard_denials(l, "probe_one")
    == [
      dispatch.GuardDenial(
        tool: "Bash",
        denial: guard_event.NotPermitted,
        attempted: "lake build ; rm -rf /",
      ),
    ]
  let held =
    dispatch.GuardDenial(
      tool: "Bash",
      denial: guard_event.BuildLockTimeout,
      attempted: "lake build Rule30",
    )
  assert dispatch.guard_contention(l, "probe_one") == [held, held]
}

/// A build-lock timeout must never become a guard bug: that bug's body says
/// the allowlist or the brief is wrong, and for a timeout neither is. It is
/// filed once per attempt under `dispatch`, with its own signature and a
/// body that names contention, while the policy denial beside it is filed
/// as before. Read back off the board `auto_file_signals` wrote, so this
/// covers the filing and not only the reader.
pub fn a_lock_timeout_files_under_dispatch_not_guard_test() {
  let c = cfg()
  let _ = simplifile.delete(c.bugs_path)
  let dir = c.runs_root <> "/contention"
  let _ = simplifile.delete(dir)
  let assert Ok(l) = log.open(dir, "run")
  let at =
    guard.Rules(
      repo_root: "C:\\r",
      role: guard.Prover(allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean"),
      holder: "probe_one",
    )
  let write = fn(attempted, decision) {
    guard_event.write(
      l,
      guard.event(at, "PreToolUse", "Bash", attempted, decision),
    )
  }
  let timeout = guard.Deny(guard_event.BuildLockTimeout, "timeout")
  write(
    "lake build ; rm -rf /",
    guard.Deny(guard_event.NotPermitted, "grammar"),
  )
  write("lake build Rule30", timeout)
  write("lake build Rule30", timeout)
  dispatch.auto_file_signals(c, l, "probe_one", scripted(), attempt(dag.GaveUp))

  let assert Ok(board) = bugs.load(c.bugs_path)
  let filed = bugs.open_bugs(board)
  assert list.length(filed) == 2
  let assert Ok(policy) = list.find(filed, fn(b) { b.area == bugs.Guard })
  assert policy.signature == Some("guard:Bash:not_permitted")
  let assert Ok(held) = list.find(filed, fn(b) { b.area == bugs.Dispatch })
  assert held.signature == Some("dispatch:build_lock_timeout")
  assert string.contains(held.body, "another worker held it")
  assert string.contains(held.body, "2 Bash call(s)")
  assert !string.contains(held.body, "allowlist is wrong")
  let _ = simplifile.delete(c.bugs_path)
}

fn scripted() -> roster.Identity {
  roster.Identity(
    name: "Scripted",
    region: "P2",
    created: "2026-09-05T00:00:00Z",
    naming_reason: "a test never names itself",
    opening: "",
    color: Some("#123456"),
  )
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
  guard_event.write(
    l,
    guard.event(
      at,
      "PreToolUse",
      "Bash",
      nasty,
      guard.Deny(guard_event.NotPermitted, "grammar"),
    ),
  )
  assert dispatch.guard_denials(l, "probe_one")
    == [
      dispatch.GuardDenial(
        tool: "Bash",
        denial: guard_event.NotPermitted,
        attempted: nasty,
      ),
    ]
}

/// A row written by an older guard has no `denial` field. It must still
/// reach the board — a change that made denials silently stop being filed
/// would be the very defect this one removes. The keys are spelled out by
/// hand because this is a fixture of the old format, not a use of the
/// current producer.
pub fn a_row_without_a_denial_field_still_files_test() {
  let dir = "build/test-runs/denial-legacy"
  let _ = simplifile.delete(dir)
  let assert Ok(l) = log.open(dir, "run")
  log.event(l, guard_event.kind, [
    #("node", json.string("probe_one")),
    #("event", json.string("PreToolUse")),
    #("tool", json.string("Bash")),
    #("decision", json.string("Deny(\"only lake build is permitted\")")),
  ])
  assert dispatch.guard_denials(l, "probe_one")
    == [
      dispatch.GuardDenial(
        tool: "Bash",
        denial: guard_event.Unrecognised("unknown"),
        attempted: "",
      ),
    ]
}

/// A row is a denial because of what it *is*, not because of what it
/// contains. A `dispatch` row that happens to carry every guard key, and a
/// raw stream line whose text is a guard row, must both read as nothing:
/// the old reader selected by substring, and would have filed the first.
pub fn a_row_of_another_kind_is_not_a_denial_test() {
  let dir = "build/test-runs/denial-other-kinds"
  let _ = simplifile.delete(dir)
  let assert Ok(l) = log.open(dir, "run")
  let at =
    guard.Rules(
      repo_root: "C:\\r",
      role: guard.Prover(allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean"),
      holder: "probe_one",
    )
  let refused =
    guard.event(
      at,
      "PreToolUse",
      "Bash",
      "rm -rf /",
      guard.Deny(guard_event.NotPermitted, "grammar"),
    )
  log.event(l, "dispatch", guard_event.fields(refused))
  let as_a_line =
    json.object([
      #("kind", json.string(guard_event.kind)),
      ..guard_event.fields(refused)
    ])
  log.raw(l, "stream", json.to_string(as_a_line))
  assert dispatch.guard_denials(l, "probe_one") == []
}

/// An attempt that died before its log existed files nothing rather than
/// crashing the dispatcher on the way out of a failed run.
pub fn guard_denials_is_empty_without_a_log_test() {
  let missing = log.Log(dir: "build/test-runs/no-such-attempt", run_id: "run")
  assert dispatch.guard_denials(missing, "probe_one") == []
}

// --- the theorem index render is derived, never a record --------------------

/// `write_index` — reached only through `live_env(cfg, l).index`, since
/// `index_proof` and `write_index` are both private — must never let a
/// render failure look like the import failed. Here `repo_root` has a
/// `Rule30/` directory (so the import write into `Rule30/Proofs.lean`
/// succeeds) but no `Rule30/Statements.lean` (so `index.write` fails to
/// read its sources). The import must still land and the call must still
/// report `Ok(Nil)`: the render's failure is printed to stderr and
/// swallowed, not propagated, so it can never suppress an attempt's own
/// record for a node that really was proved and imported. What the render
/// failed IS on the record, though: its own `theorem_index` event on the
/// log `live_env` was given, `outcome: "failed"` with the reason, so a
/// render that never happened does not read from `events.jsonl` as one
/// that did.
pub fn write_index_swallows_a_render_failure_but_keeps_the_import_test() {
  let dir = "build/test-runs/write-index-render-failure"
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir <> "/Rule30")
  let cfg = config.Config(..cfg(), repo_root: dir)
  let assert Ok(l) = log.open(dir <> "/runs", "run")
  let n = node("probe_one", "probe_one", dag.S, [])
  assert dispatch.live_env(cfg, l).index(n) == Ok(Nil)
  let assert Ok(text) = simplifile.read(dir <> "/Rule30/Proofs.lean")
  assert string.contains(text, "import Rule30.Proofs.ProbeOne")
  // The render itself never happened: no statement file, no index.
  assert simplifile.is_file(dir <> "/blueprint/index.md") == Ok(False)
  let assert Ok(events) = simplifile.read(l.dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"theorem_index\"")
  assert string.contains(events, "\"outcome\":\"failed\"")
  assert string.contains(events, "\"node\":\"probe_one\"")
  assert string.contains(events, "could not read")
}

// --- a worker's proposed sub-lemmas -------------------------------------------

fn proposals_identity() -> roster.Identity {
  roster.Identity(
    name: "Vesper",
    region: "P1",
    created: "2026-09-05T00:00:00Z",
    naming_reason: "a test never names itself",
    opening: "",
    color: Some("#123456"),
  )
}

/// The seeder's shape, byte-compatible with `seed.decode_proposals`; a
/// restatement dropped whichever of the node's two names it repeats — `id`
/// and `lean_name` differ here on purpose, since a worker can echo either
/// one back. `write_proposals` only writes and records; nothing here runs
/// the check — that is `run_check`'s job, covered below.
pub fn write_proposals_writes_the_seeder_shape_and_discards_either_name_test() {
  let root = "build/test-runs/write-proposals"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/runs")
  let assert Ok(l) = log.open(root <> "/runs", "run-1")
  let identity = proposals_identity()
  let target =
    node(
      "evolve_left_seventh_diagonal",
      "evolve_left_seventh_diagonal_isEventuallyPeriodic",
      dag.M,
      [],
    )
  let report =
    worker.Report(
      outcome: "abandoned",
      estimate: dag.L,
      notebook: "",
      journal: "",
      bugs: [],
      summary: "",
      discarded: [],
      proposals: [
        worker.ProposedLemma(
          name: "evolve_left_sixth_diagonal",
          statement: "theorem evolve_left_sixth_diagonal (t : ℕ) : evolve (t + 5) (-(t : ℤ)) = false := by\n  sorry",
          reason: "the seventh needs it",
          size: dag.S,
          disclaims: "",
          route: None,
          witness: Some(#("evolve (t + 5) (-(t : ℤ)) = false", [], "t < 12")),
        ),
        // Restates the node under its `id`: refused, named.
        worker.ProposedLemma(
          name: "evolve_left_seventh_diagonal",
          statement: "theorem evolve_left_seventh_diagonal : True := by\n  sorry",
          reason: "r",
          size: dag.M,
          disclaims: "",
          route: None,
          witness: None,
        ),
        // Restates the node under its `lean_name`, which is not its `id`
        // here: refused just the same, named just the same.
        worker.ProposedLemma(
          name: "evolve_left_seventh_diagonal_isEventuallyPeriodic",
          statement: "theorem evolve_left_seventh_diagonal_isEventuallyPeriodic : True := by\n  sorry",
          reason: "r",
          size: dag.M,
          disclaims: "",
          route: None,
          witness: None,
        ),
      ],
    )
  let assert Some(pending) =
    dispatch.write_proposals(l, identity, target, report)
  assert pending.node_id == "evolve_left_seventh_diagonal"
  let assert Ok(text) = simplifile.read(l.dir <> "/proposals.json")
  // Byte-compatible with the seeder's decoder, and carrying only the survivor.
  let assert Ok([p]) = seed.decode_proposals(text)
  assert p.id == "evolve_left_sixth_diagonal"
  assert p.lean_name == "evolve_left_sixth_diagonal"
  assert p.reason == "the seventh needs it"
  assert p.witness
    == seed.Claims(seed.Witness(
      expression: "evolve (t + 5) (-(t : ℤ)) = false",
      imports: [],
      range: "t < 12",
    ))
  // Provenance beside the array, which the decoder ignores.
  assert string.contains(text, "\"node\": \"evolve_left_seventh_diagonal\"")
    || string.contains(text, "\"node\":\"evolve_left_seventh_diagonal\"")
  let assert Ok(events) = simplifile.read(l.dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"proposals\"")
  assert string.contains(events, "\"count\":1")
  assert string.contains(events, "\"kind\":\"proposals_discarded\"")
  assert string.contains(events, "evolve_left_seventh_diagonal")
  assert string.contains(
    events,
    "evolve_left_seventh_diagonal_isEventuallyPeriodic",
  )
  // `write_proposals` never runs the check itself.
  assert simplifile.is_file(l.dir <> "/proposals-check.txt") == Ok(False)
}

/// Every proposal restates the node — one under `id`, one under
/// `lean_name` — so nothing survives: no file, no `proposals` event, and
/// exactly one `proposals_discarded` event naming both. `write_proposals`
/// returns `None`: there is nothing for a caller to check.
pub fn write_proposals_with_everything_discarded_writes_nothing_test() {
  let root = "build/test-runs/write-proposals-all-discarded"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/runs")
  let assert Ok(l) = log.open(root <> "/runs", "run-1")
  let target = node("node_id_x", "node_lean_x", dag.S, [])
  let report =
    worker.Report(
      outcome: "abandoned",
      estimate: dag.S,
      notebook: "",
      journal: "",
      bugs: [],
      summary: "",
      discarded: [],
      proposals: [
        worker.ProposedLemma(
          name: "node_id_x",
          statement: "theorem node_id_x : True := by\n  sorry",
          reason: "r",
          size: dag.S,
          disclaims: "",
          route: None,
          witness: None,
        ),
        worker.ProposedLemma(
          name: "node_lean_x",
          statement: "theorem node_lean_x : True := by\n  sorry",
          reason: "r",
          size: dag.S,
          disclaims: "",
          route: None,
          witness: None,
        ),
      ],
    )
  assert dispatch.write_proposals(l, proposals_identity(), target, report)
    == None
  assert simplifile.is_file(l.dir <> "/proposals.json") == Ok(False)
  let assert Ok(events) = simplifile.read(l.dir <> "/events.jsonl")
  assert !string.contains(events, "\"kind\":\"proposals\"")
  let discarded_lines =
    string.split(string.trim(events), "\n")
    |> list.filter(fn(line) {
      string.contains(line, "\"kind\":\"proposals_discarded\"")
    })
  assert list.length(discarded_lines) == 1
  assert string.contains(events, "node_id_x")
  assert string.contains(events, "node_lean_x")
}

/// A report with no proposals writes nothing and logs nothing named
/// `proposals` — the empty case must be silent, not an empty file and an
/// empty-count event. `write_proposals` returns `None`.
pub fn write_proposals_with_none_writes_nothing_test() {
  let root = "build/test-runs/write-proposals-none"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/runs")
  let assert Ok(l) = log.open(root <> "/runs", "run-1")
  let report =
    worker.Report(
      outcome: "proved",
      estimate: dag.S,
      notebook: "",
      journal: "",
      bugs: [],
      summary: "",
      discarded: [],
      proposals: [],
    )
  assert dispatch.write_proposals(
      l,
      proposals_identity(),
      node("n", "n", dag.S, []),
      report,
    )
    == None
  assert simplifile.is_file(l.dir <> "/proposals.json") == Ok(False)
  let assert Ok(events) = simplifile.read(l.dir <> "/events.jsonl")
  assert !string.contains(events, "proposals")
}

/// One survivor, written once, so the two `run_check` tests below share a
/// `PendingCheck` shape rather than each rebuilding a `worker.Report`.
fn a_pending_check(l: log.Log) -> dispatch.PendingCheck {
  let report =
    worker.Report(
      outcome: "abandoned",
      estimate: dag.S,
      notebook: "",
      journal: "",
      bugs: [],
      summary: "",
      discarded: [],
      proposals: [
        worker.ProposedLemma(
          name: "a_survivor",
          statement: "theorem a_survivor : True := by\n  sorry",
          reason: "r",
          size: dag.S,
          disclaims: "",
          route: None,
          witness: None,
        ),
      ],
    )
  let assert Some(pending) =
    dispatch.write_proposals(
      l,
      proposals_identity(),
      node("n", "n", dag.S, []),
      report,
    )
  pending
}

/// `run_check` never touches disk beyond the report it is handed: a
/// checker that fails records the failure as an event with its reason, and
/// no `proposals-check.txt` appears. Proven with a stub rather than by
/// starving a root of `.lake` and hoping `seed.check_file_in` fails for the
/// right reason — that real path is `write_proposals_records_a_check_that_ran_test`, below.
pub fn run_check_records_a_failed_check_test() {
  let root = "build/test-runs/run-check-failed"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/runs")
  let assert Ok(l) = log.open(root <> "/runs", "run-1")
  let pending = a_pending_check(l)
  dispatch.run_check(fn(_path) { Error("no .lake here") }, pending)
  let assert Ok(events) = simplifile.read(l.dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"proposals_checked\"")
  assert string.contains(events, "\"outcome\":\"failed\"")
  assert string.contains(events, "no .lake here")
  assert simplifile.is_file(l.dir <> "/proposals-check.txt") == Ok(False)
}

/// A checker that succeeds has its report text written to
/// `proposals-check.txt` and the event says so.
pub fn run_check_writes_the_report_on_a_successful_check_test() {
  let root = "build/test-runs/run-check-written"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/runs")
  let assert Ok(l) = log.open(root <> "/runs", "run-1")
  let pending = a_pending_check(l)
  dispatch.run_check(fn(_path) { Ok("the check's report text") }, pending)
  let assert Ok(events) = simplifile.read(l.dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"proposals_checked\"")
  assert string.contains(events, "\"outcome\":\"written\"")
  let assert Ok(check_text) = simplifile.read(l.dir <> "/proposals-check.txt")
  assert check_text == "the check's report text"
}

/// A cheaper, real check: against the built fixture project, a proposal
/// with no route and no witness gets a check that actually ran — its
/// report on disk, saying "none claimed" and "no witness supplied" rather
/// than a refusal. Routed through `run_check` exactly as `prove_one` routes
/// it, rather than calling `seed.check_file_in` from the test directly.
/// Scratch `seed.check_file_in` writes lands under
/// `harness/test/fixture-project/harness/`, which `.gitignore` already
/// lists, and this test's own report says whether `git status` agreed.
pub fn write_proposals_records_a_check_that_ran_test() {
  let repo_root = lean_fixture.built()
  let root = "build/test-runs/write-proposals-fixture"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root)
  let assert Ok(l) = log.open(root, "run-1")
  let report =
    worker.Report(
      outcome: "abandoned",
      estimate: dag.S,
      notebook: "",
      journal: "",
      bugs: [],
      summary: "",
      discarded: [],
      proposals: [
        worker.ProposedLemma(
          name: "harness_probe_child",
          statement: "theorem harness_probe_child : True := by\n  sorry",
          reason: "a fixture check that actually runs",
          size: dag.S,
          disclaims: "",
          route: None,
          witness: None,
        ),
      ],
    )
  let assert Some(pending) =
    dispatch.write_proposals(
      l,
      proposals_identity(),
      node("harness_probe", "harness_probe", dag.S, []),
      report,
    )
  dispatch.run_check(fn(p) { seed.check_file_in(repo_root, p) }, pending)
  let assert Ok(events) = simplifile.read(l.dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"proposals_checked\"")
  assert string.contains(events, "\"outcome\":\"written\"")
  let assert Ok(check_text) = simplifile.read(l.dir <> "/proposals-check.txt")
  assert string.contains(check_text, "none claimed")
  assert string.contains(check_text, "no witness supplied")
}
