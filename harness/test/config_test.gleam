import envoy
import gleam/option.{None}
import harness/config
import harness/dag.{type Node, Attempt, Node}

fn node(size: dag.Size, research: Bool, attempts: List(dag.Attempt)) -> Node {
  Node(
    id: "n",
    region: "P2",
    lean_name: "n",
    description: "a fixture node",
    deps: [],
    status: dag.Open,
    size:,
    proof_file: None,
    attempts:,
    verified: None,
    claimed_by: None,
    claimed_at: None,
    claimed_run: None,
    object: None,
    under: None,
    research:,
  )
}

fn attempt(outcome: dag.Outcome) -> dag.Attempt {
  Attempt(
    identity: "Scripted",
    session_id: "s",
    model: "opus",
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

pub fn ladder_starts_cheap_and_ends_on_fable_test() {
  assert config.ladder(dag.S) == ["haiku", "sonnet", "opus", "fable"]
  assert config.ladder(dag.M) == ["sonnet", "opus", "fable"]
  assert config.ladder(dag.L) == ["opus", "fable"]
  assert config.ladder(dag.Wall) == []
}

pub fn model_for_escalates_on_each_failure_test() {
  assert config.model_for(dag.S, 0, research: False) == Ok("haiku")
  assert config.model_for(dag.S, 1, research: False) == Ok("sonnet")
  assert config.model_for(dag.S, 2, research: False) == Ok("opus")
  assert config.model_for(dag.S, 3, research: False) == Ok("fable")
  assert config.model_for(dag.M, 0, research: False) == Ok("sonnet")
  assert config.model_for(dag.M, 1, research: False) == Ok("opus")
  assert config.model_for(dag.M, 2, research: False) == Ok("fable")
  assert config.model_for(dag.L, 0, research: False) == Ok("opus")
  assert config.model_for(dag.L, 1, research: False) == Ok("fable")
}

pub fn model_for_exhausts_the_ladder_test() {
  assert config.model_for(dag.S, 4, research: False) == Error(Nil)
  assert config.model_for(dag.M, 3, research: False) == Error(Nil)
  assert config.model_for(dag.L, 2, research: False) == Error(Nil)
}

/// `wall` is never dispatched, at any attempt count — research or not.
pub fn model_for_never_dispatches_a_wall_test() {
  assert config.model_for(dag.Wall, 0, research: False) == Error(Nil)
  assert config.model_for(dag.Wall, 5, research: False) == Error(Nil)
  assert config.model_for(dag.Wall, 0, research: True) == Error(Nil)
  assert config.model_for(dag.Wall, 5, research: True) == Error(Nil)
}

/// Below the top rung a research node climbs the ladder like any other;
/// at the top it stays there, however many attempts have failed.
pub fn a_research_node_climbs_the_ladder_then_repeats_its_top_rung_test() {
  assert config.model_for(dag.L, 0, research: True) == Ok("opus")
  assert config.model_for(dag.L, 1, research: True) == Ok("fable")
  assert config.model_for(dag.L, 2, research: True) == Ok("fable")
  assert config.model_for(dag.L, 9, research: True) == Ok("fable")
  assert config.model_for(dag.S, 2, research: True) == Ok("opus")
  assert config.model_for(dag.S, 3, research: True) == Ok("fable")
  assert config.model_for(dag.S, 40, research: True) == Ok("fable")
  assert config.model_for(dag.M, 7, research: True) == Ok("fable")
}

pub fn a_research_node_is_on_its_research_rung_once_the_cheap_rungs_are_spent_test() {
  // An `L` research node: opus first, and every attempt after one failure
  // is at the top rung.
  assert !config.on_research_rung(node(dag.L, True, []))
  assert config.on_research_rung(node(dag.L, True, [attempt(dag.GaveUp)]))
  assert config.on_research_rung(
    node(dag.L, True, [
      attempt(dag.GaveUp),
      attempt(dag.BudgetExhausted),
      attempt(dag.GaveUp),
    ]),
  )
  // A pause and a harness failure spend no rung, so they do not lift a
  // research node onto its top rung either.
  assert !config.on_research_rung(
    node(dag.L, True, [attempt(dag.RateLimited), attempt(dag.HarnessFailed)]),
  )
  // An ordinary node is never on a research rung, however many failures.
  assert !config.on_research_rung(
    node(dag.L, False, [attempt(dag.GaveUp), attempt(dag.GaveUp)]),
  )
  // A wall has no ladder, so it has no top rung to be on.
  assert !config.on_research_rung(node(dag.Wall, True, [attempt(dag.GaveUp)]))
}

pub fn for_attempt_swaps_in_the_research_ceilings_only_at_the_research_rung_test() {
  let assert Ok(base) = config.load()
  let cfg =
    config.Config(
      ..base,
      max_turns: 40,
      max_budget_usd: 4.0,
      research_max_turns: 120,
      research_max_budget_usd: 20.0,
    )
  let ordinary = config.for_attempt(cfg, node(dag.L, False, []))
  assert ordinary == cfg
  let climbing = config.for_attempt(cfg, node(dag.L, True, []))
  assert climbing == cfg
  let research =
    config.for_attempt(cfg, node(dag.L, True, [attempt(dag.GaveUp)]))
  assert research.max_turns == 120
  assert research.max_budget_usd == 20.0
  // Nothing but the two ceilings changes.
  assert config.Config(..research, max_turns: 40, max_budget_usd: 4.0) == cfg
}

pub fn failed_attempts_counts_only_the_outcomes_that_burn_a_rung_test() {
  assert config.failed_attempts(
      node(dag.S, False, [
        attempt(dag.GaveUp),
        attempt(dag.BudgetExhausted),
        attempt(dag.RateLimited),
        attempt(dag.TimedOut),
        attempt(dag.HarnessFailed),
        attempt(dag.Reduced),
        attempt(dag.Closed),
      ]),
    )
    == 2
}

pub fn load_derives_every_path_from_the_repo_root_test() {
  let assert Ok(cfg) = config.load()
  assert cfg.dag_path == cfg.repo_root <> "/blueprint/dag.json"
  assert cfg.roster_path == cfg.repo_root <> "/agents/roster.json"
  assert cfg.agents_dir == cfg.repo_root <> "/agents"
  assert cfg.runs_root == cfg.repo_root <> "/runs"
  assert cfg.shim == cfg.repo_root <> "/harness/shim/claude_shim.mjs"
  assert cfg.guard_port == 4130
  assert cfg.max_turns == 40
  assert cfg.max_verify_rounds == 4
  assert cfg.lake != ""
}

/// The research ceilings: three times the turns of an ordinary attempt,
/// and a dollar ceiling sized so the turn ceiling is the one that binds.
pub fn research_ceilings_default_to_120_turns_and_20_dollars_test() {
  let assert Ok(cfg) = config.load()
  assert cfg.research_max_turns == 120
  assert cfg.research_max_budget_usd == 20.0
  assert cfg.research_max_turns > cfg.max_turns
  assert cfg.research_max_budget_usd >. cfg.max_budget_usd
}

/// The hand-started session kinds have their own ceilings, both above a
/// prover's: a theorist's budget is hours, and a seeder's one pass over the
/// board was 26 turns before it could scan diagonals. The first theorist
/// ran under the prover's $4 and ended there, thirteen turns in.
pub fn theorist_and_seeder_ceilings_default_above_a_provers_test() {
  let assert Ok(cfg) = config.load()
  assert cfg.theorist_max_turns == 600
  assert cfg.theorist_max_budget_usd == 80.0
  assert cfg.seeder_max_turns == 80
  assert cfg.seeder_max_budget_usd == 12.0
  assert cfg.theorist_max_turns > cfg.research_max_turns
  assert cfg.theorist_max_budget_usd >. cfg.research_max_budget_usd
  assert cfg.seeder_max_turns > cfg.max_turns
  assert cfg.seeder_max_budget_usd >. cfg.max_budget_usd
}

/// Each of the four has its own `HARNESS_*` override, read at `load`.
pub fn theorist_and_seeder_ceilings_come_from_the_environment_test() {
  envoy.set("HARNESS_THEORIST_MAX_TURNS", "9")
  envoy.set("HARNESS_THEORIST_MAX_BUDGET_USD", "2.5")
  envoy.set("HARNESS_SEEDER_MAX_TURNS", "5")
  envoy.set("HARNESS_SEEDER_MAX_BUDGET_USD", "3")
  let loaded = config.load()
  envoy.unset("HARNESS_THEORIST_MAX_TURNS")
  envoy.unset("HARNESS_THEORIST_MAX_BUDGET_USD")
  envoy.unset("HARNESS_SEEDER_MAX_TURNS")
  envoy.unset("HARNESS_SEEDER_MAX_BUDGET_USD")
  let assert Ok(cfg) = loaded
  assert cfg.theorist_max_turns == 9
  assert cfg.theorist_max_budget_usd == 2.5
  assert cfg.seeder_max_turns == 5
  // `3` is a reasonable thing to write for a dollar ceiling.
  assert cfg.seeder_max_budget_usd == 3.0
  // The prover's ceilings are untouched by the four.
  assert cfg.max_turns == 40
  assert cfg.max_budget_usd == 4.0
}

/// `for_theorist` and `for_seeder` swap in their pair and change nothing
/// else, the way `for_attempt` does at a research rung.
pub fn for_theorist_and_for_seeder_swap_in_their_own_ceilings_test() {
  let assert Ok(base) = config.load()
  let cfg =
    config.Config(
      ..base,
      max_turns: 40,
      max_budget_usd: 4.0,
      theorist_max_turns: 600,
      theorist_max_budget_usd: 80.0,
      seeder_max_turns: 80,
      seeder_max_budget_usd: 12.0,
    )
  let theorist = config.for_theorist(cfg)
  assert theorist.max_turns == 600
  assert theorist.max_budget_usd == 80.0
  assert config.Config(..theorist, max_turns: 40, max_budget_usd: 4.0) == cfg
  let seeder = config.for_seeder(cfg)
  assert seeder.max_turns == 80
  assert seeder.max_budget_usd == 12.0
  assert config.Config(..seeder, max_turns: 40, max_budget_usd: 4.0) == cfg
}

pub fn bugs_path_sits_beside_the_dag_test() {
  let assert Ok(cfg) = config.load()
  assert cfg.bugs_path == cfg.repo_root <> "/blueprint/bugs.json"
}

/// The captain's stop file is `STOP` at the repository root — the place a
/// person who has just realised a run is going wrong can reach without
/// reading anything. A fixture redirects this field; a real run never does.
pub fn stop_path_defaults_to_stop_at_the_repo_root_test() {
  let assert Ok(cfg) = config.load()
  assert cfg.stop_path == cfg.repo_root <> "/STOP"
}
