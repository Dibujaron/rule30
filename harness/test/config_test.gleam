import harness/config
import harness/dag

pub fn ladder_starts_cheap_and_ends_on_opus_test() {
  assert config.ladder(dag.S) == ["haiku", "sonnet", "opus"]
  assert config.ladder(dag.M) == ["sonnet", "opus"]
  assert config.ladder(dag.L) == ["opus"]
  assert config.ladder(dag.Wall) == []
}

pub fn model_for_escalates_on_each_failure_test() {
  assert config.model_for(dag.S, 0) == Ok("haiku")
  assert config.model_for(dag.S, 1) == Ok("sonnet")
  assert config.model_for(dag.S, 2) == Ok("opus")
  assert config.model_for(dag.M, 0) == Ok("sonnet")
  assert config.model_for(dag.M, 1) == Ok("opus")
  assert config.model_for(dag.L, 0) == Ok("opus")
}

pub fn model_for_exhausts_the_ladder_test() {
  assert config.model_for(dag.S, 3) == Error(Nil)
  assert config.model_for(dag.M, 2) == Error(Nil)
  assert config.model_for(dag.L, 1) == Error(Nil)
}

/// `wall` is never dispatched, at any attempt count.
pub fn model_for_never_dispatches_a_wall_test() {
  assert config.model_for(dag.Wall, 0) == Error(Nil)
  assert config.model_for(dag.Wall, 5) == Error(Nil)
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
