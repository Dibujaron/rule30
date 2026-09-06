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
//// notebook, and the notebook is what spans models.

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
    guard_port: Int,
    max_turns: Int,
    max_budget_usd: Float,
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
    guard_port: env_int("HARNESS_GUARD_PORT", 4130),
    max_turns: env_int("HARNESS_MAX_TURNS", 40),
    max_budget_usd: env_float("HARNESS_MAX_BUDGET_USD", 4.0),
    turn_timeout_ms: env_int("HARNESS_TURN_TIMEOUT_MS", 900_000),
    max_verify_rounds: env_int("HARNESS_MAX_VERIFY_ROUNDS", 4),
    rate_limit_ceiling: env_float("HARNESS_RATE_LIMIT_CEILING", 0.9),
  ))
}

/// The models to try at a node of this size, cheapest first. `Wall` is
/// never dispatched, so its ladder is empty.
pub fn ladder(size: dag.Size) -> List(String) {
  case size {
    dag.S -> ["haiku", "sonnet", "opus"]
    dag.M -> ["sonnet", "opus"]
    dag.L -> ["opus"]
    dag.Wall -> []
  }
}

/// The model for the next attempt at a node of this size, given how many
/// attempts have already failed there. `Error(Nil)` means the ladder is
/// exhausted and the node should be abandoned.
pub fn model_for(size: dag.Size, failed_attempts: Int) -> Result(String, Nil) {
  ladder(size)
  |> list.drop(failed_attempts)
  |> list.first
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
