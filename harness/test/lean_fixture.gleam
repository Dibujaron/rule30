//// The Lean project the toolchain-dependent tests run against.
////
//// `verify_test` proves fixture theorems with a real `lake build`, and
//// `seed_test` elaborates routes and evaluates witnesses with a real
//// `lake env lean`. Neither needs Mathlib. The real project's built `.lake`
//// — 7.4 GB, present only in the live checkout — was the sole reason those
//// tests once defaulted to `C:/Users/dibuj/dev/rule30` and wrote their
//// fixture proofs next to real ones. `test/fixture-project` is a
//// dependency-free Lean project with the same layout (`Rule30/Basic.lean`,
//// `Rule30/Statements.lean`, `Rule30/Proofs/`, `Rule30/Proofs.lean`) that
//// builds from nothing in about two seconds, so the tests write there
//// instead and nothing they do can reach a real proof file.
////
//// The path is derived from where the runner started and never from
//// `HARNESS_REPO_ROOT`. Like `writes_test`, these tests must exercise the
//// tree that is running: a worktree's suite pointed at the shared checkout
//// would build and prove against a fixture project from another branch.

import gleam/string
import harness/shell
import simplifile

/// Absolute path of the fixture project — `test/fixture-project` under the
/// harness directory, which is where `gleam test` runs — with forward
/// slashes, as every other path the harness builds has.
pub fn root() -> String {
  let assert Ok(cwd) = simplifile.current_directory()
  let cwd = string.replace(cwd, "\\", "/")
  case simplifile.is_directory(cwd <> "/test/fixture-project") {
    Ok(True) -> cwd <> "/test/fixture-project"
    _ -> cwd <> "/harness/test/fixture-project"
  }
}

/// `root()`, once `lake build` there has succeeded. `lake env lean` reads
/// oleans and builds nothing, so a caller elaborating against
/// `Rule30.Basic` needs this; `verify.verify` runs its own `lake build` of
/// the modules it imports and does not. A no-op rebuild costs under a
/// second, a first build about two, and a failed one panics here with
/// lake's output rather than surfacing later as a verdict about a route.
pub fn built() -> String {
  let root = root()
  let assert Ok(lake) = shell.which("lake")
  case shell.run(lake, ["build"], root, 600_000) {
    Ok(shell.Run(status: 0, ..)) -> root
    Ok(shell.Run(output:, ..)) ->
      panic as {
        "lean_fixture: `lake build` failed in " <> root <> ":\n" <> output
      }
    Error(msg) ->
      panic as {
        "lean_fixture: could not run `lake build` in " <> root <> ": " <> msg
      }
  }
}
