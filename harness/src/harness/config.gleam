//// Everything the dispatcher needs to know about this machine and this run:
//// where the repo, the toolchain and the Claude Code CLI live, and the
//// ceilings a single attempt runs under.
////
//// Every field has a default that works on Dib's box and an `HARNESS_*`
//// environment variable that overrides it, so a run from a git worktree can
//// point at the main checkout — which is where the Lean toolchain lives —
//// with `HARNESS_REPO_ROOT`.
////
//// The model ladder also lives here: the cheapest model that could
//// plausibly close a node goes first, and a failed attempt escalates. The
//// ladder is keyed to node size, never to identity — an identity is a
//// notebook, and the notebook is what spans models. The ladder is a cost
//// optimiser, and for a research node (`dag.Node.research`) its top rung
//// is repeatable: once the cheap rungs are spent every further attempt is
//// at the top, under the research budget, and the node is never abandoned
//// for having exhausted the ladder.

import envoy
import gleam/float
import gleam/int
import gleam/list
import gleam/result
import gleam/string
import harness/dag
import harness/shell
import simplifile

/// One resolved run configuration. Paths are absolute; `lake` comes from
/// `PATH`.
///
/// `stop_path` is where a captain writes to end a run: `STOP` at the
/// repository root by default. At the root and in capitals because the
/// situation it exists for is a person who has just realised a live run is
/// doing something wrong, and needs to act before reading anything.
/// Gitignored — committing it would halt every run. The dispatcher reads
/// this field and nothing else, so a test fixture that redirects it into
/// its own directory cannot halt a live run, whatever its `repo_root` is.
///
/// `max_turns` and `max_budget_usd` are the ceilings one ordinary attempt
/// runs under. `research_max_turns` and `research_max_budget_usd` replace
/// them for an attempt at the top rung of a research node
/// (`for_attempt`): a probe that fails cheaply is what the ladder is for,
/// but a search at a node nobody knows the proof of needs room to leave
/// partial structure behind, and forty turns is not room.
pub type Config {
  Config(
    repo_root: String,
    node_exe: String,
    claude_exe: String,
    shim: String,
    lake: String,
    runs_root: String,
    dag_path: String,
    bugs_path: String,
    roster_path: String,
    agents_dir: String,
    stop_path: String,
    guard_port: Int,
    max_turns: Int,
    max_budget_usd: Float,
    research_max_turns: Int,
    research_max_budget_usd: Float,
    turn_timeout_ms: Int,
    max_verify_rounds: Int,
    rate_limit_ceiling: Float,
  )
}

const default_node_exe = "C:\\Program Files\\nodejs\\node.exe"

const default_claude_exe = "C:\\Users\\dibuj\\AppData\\Roaming\\npm\\node_modules\\@anthropic-ai\\claude-code\\bin\\claude.exe"

/// Resolve the configuration from the environment, falling back to the
/// verified defaults. Fails only when `lake` is not on `PATH`: without it
/// nothing can be verified, and an unverifiable run is not worth starting.
pub fn load() -> Result(Config, String) {
  let repo_root = case env("HARNESS_REPO_ROOT") {
    Ok(root) -> slashed(root)
    Error(Nil) -> default_repo_root()
  }
  use lake <- result.try(
    env("HARNESS_LAKE")
    |> result.try_recover(fn(_) { shell.which("lake") })
    |> result.replace_error("harness config: `lake` is not on PATH"),
  )
  Ok(Config(
    repo_root:,
    node_exe: env("HARNESS_NODE") |> result.unwrap(default_node_exe),
    claude_exe: env("HARNESS_CLAUDE") |> result.unwrap(default_claude_exe),
    shim: repo_root <> "/harness/shim/claude_shim.mjs",
    lake:,
    runs_root: repo_root <> "/runs",
    dag_path: repo_root <> "/blueprint/dag.json",
    bugs_path: env("HARNESS_BUGS_PATH")
      |> result.unwrap(repo_root <> "/blueprint/bugs.json"),
    roster_path: repo_root <> "/agents/roster.json",
    agents_dir: repo_root <> "/agents",
    stop_path: repo_root <> "/STOP",
    guard_port: env_int("HARNESS_GUARD_PORT", 4130),
    max_turns: env_int("HARNESS_MAX_TURNS", 40),
    max_budget_usd: env_float("HARNESS_MAX_BUDGET_USD", 4.0),
    // Three times the turns of an ordinary attempt, on a model priced at
    // about twice the rung below it: the dollar ceiling is sized so that the
    // turn ceiling, not the dollar one, is what ends a research attempt.
    research_max_turns: env_int("HARNESS_RESEARCH_MAX_TURNS", 120),
    research_max_budget_usd: env_float("HARNESS_RESEARCH_MAX_BUDGET_USD", 20.0),
    turn_timeout_ms: env_int("HARNESS_TURN_TIMEOUT_MS", 900_000),
    max_verify_rounds: env_int("HARNESS_MAX_VERIFY_ROUNDS", 4),
    rate_limit_ceiling: env_float("HARNESS_RATE_LIMIT_CEILING", 0.9),
  ))
}

/// The models to try at a node of this size, cheapest first, ending on the
/// strongest model the CLI offers. `Wall` is never dispatched, so its
/// ladder is empty.
pub fn ladder(size: dag.Size) -> List(String) {
  case size {
    dag.S -> ["haiku", "sonnet", "opus", "fable"]
    dag.M -> ["sonnet", "opus", "fable"]
    dag.L -> ["opus", "fable"]
    dag.Wall -> []
  }
}

/// The model for the next attempt at a node of this size, given how many
/// attempts have already failed there (`failed_attempts`). Every rung gets
/// one attempt, and `Error(Nil)` means the ladder is exhausted and the node
/// should be abandoned — except at a `research` node, where the top rung is
/// repeatable: once the lower rungs are spent every further attempt is at
/// the top, and the only `Error` is a `Wall`, whose ladder is empty.
pub fn model_for(
  size: dag.Size,
  failed_attempts: Int,
  research research: Bool,
) -> Result(String, Nil) {
  let rungs = ladder(size)
  let step = case research {
    True -> int.min(failed_attempts, list.length(rungs) - 1)
    False -> failed_attempts
  }
  rungs
  |> list.drop(step)
  |> list.first
}

/// Is the next attempt at `node` a research attempt: the node is marked
/// `research` and its ladder's lower rungs are spent, so the attempt is at
/// the repeatable top rung. This is the one predicate behind the research
/// budget (`for_attempt`) and the scheduler's preference for a persona that
/// has not tried the node yet (`schedule.who_for_node`).
pub fn on_research_rung(node: dag.Node) -> Bool {
  node.research
  && failed_attempts(node) >= list.length(ladder(node.size)) - 1
  && ladder(node.size) != []
}

/// The configuration the next attempt at `node` runs under: `cfg` as it
/// is, or with the research ceilings in place of the ordinary ones when
/// `on_research_rung`. Everything else — paths, ports, timeouts — is the
/// run's and does not change per attempt.
pub fn for_attempt(cfg: Config, node: dag.Node) -> Config {
  case on_research_rung(node) {
    True ->
      Config(
        ..cfg,
        max_turns: cfg.research_max_turns,
        max_budget_usd: cfg.research_max_budget_usd,
      )
    False -> cfg
  }
}

/// How many attempts at this node count against its model ladder: the two
/// outcomes that mean a model was given the node and could not close it.
///
/// A `RateLimited` or `TimedOut` attempt is a pause, not a verdict on the
/// model — the spec's line is that nothing is lost to a rate limit. Counting
/// one would escalate the ladder for free and, at an ordinary `L` node,
/// spend a rung the node never got. A `HarnessFailed` attempt is not a
/// verdict on anything: the harness broke it, and escalating on it would
/// manufacture the very evidence of difficulty it does not carry.
pub fn failed_attempts(node: dag.Node) -> Int {
  list.count(node.attempts, fn(a) { burns_a_rung(a.outcome) })
}

/// Does an attempt that ended this way spend a rung of the ladder.
pub fn burns_a_rung(o: dag.Outcome) -> Bool {
  case o {
    dag.GaveUp | dag.BudgetExhausted -> True
    dag.Closed
    | dag.Reduced
    | dag.RateLimited
    | dag.TimedOut
    | dag.HarnessFailed -> False
  }
}

/// The repo root when `HARNESS_REPO_ROOT` is unset: the parent of the
/// working directory if we were started from `harness/` (which is what
/// `gleam run` does), else the working directory itself.
fn default_repo_root() -> String {
  let cwd =
    simplifile.current_directory()
    |> result.unwrap(".")
    |> slashed
  case last_segment(cwd) == "harness" {
    True -> parent(cwd)
    False -> cwd
  }
}

/// Backslashes to forward slashes. Windows accepts either, and every path
/// this module builds is joined with `/`, so normalising here keeps a
/// configured `C:\Users\dibuj\dev\rule30` from producing mixed separators.
fn slashed(path: String) -> String {
  string.replace(string.trim(path), "\\", "/")
}

fn last_segment(path: String) -> String {
  path |> string.split("/") |> list.last |> result.unwrap(path)
}

fn parent(path: String) -> String {
  let parts = string.split(path, "/")
  parts |> list.take(list.length(parts) - 1) |> string.join("/")
}

/// An environment variable, treating unset and empty as the same thing.
fn env(name: String) -> Result(String, Nil) {
  case envoy.get(name) {
    Ok("") -> Error(Nil)
    other -> other
  }
}

fn env_int(name: String, fallback: Int) -> Int {
  env(name) |> result.try(int.parse) |> result.unwrap(fallback)
}

fn env_float(name: String, fallback: Float) -> Float {
  env(name) |> result.try(parse_float) |> result.unwrap(fallback)
}

/// `float.parse` rejects `"4"`, so fall back to an integer parse: `4` is a
/// reasonable thing to write for a dollar ceiling.
fn parse_float(text: String) -> Result(Float, Nil) {
  case float.parse(text) {
    Ok(f) -> Ok(f)
    Error(Nil) -> int.parse(text) |> result.map(int.to_float)
  }
}
