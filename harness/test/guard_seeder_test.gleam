//// The seeder's rule set, which is **wider than any prover's and separate
//// from it**.
////
//// A seeder may create and run scripts under `explorer/`, granted by Dib on
//// 2026-09-06 with the tradeoff stated in the ticket rather than glossed:
//// `node` on a file the agent just authored is a shell wearing a hat, so the
//// directory fence is a real bound on what gets WRITTEN and a thin one on
//// what gets RUN. It is not a precedent for widening the prover's list —
//// different role, different list, and the standing rule that loosening the
//// guard is never a fix on its own is untouched.
////
//// The tests that matter most here are the negative ones. A permission this
//// wide is only as good as its fence, and a fence built on a prefix check is
//// defeated by `..`.

import gleam/string
import harness/guard.{Rules}

const seeder = Rules(
  repo_root: "C:\\r",
  role: guard.Seeder(proposal_path: "C:\\r\\blueprint\\proposals\\next.json"),
  holder: "seed-1",
)

const prover = Rules(
  repo_root: "C:\\r",
  role: guard.Prover(allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean"),
  holder: "w1",
)

fn write(path: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\""
  <> path
  <> "\"}}"
}

fn bash(command: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\""
  <> command
  <> "\"}}"
}

// --- what a seeder may do -----------------------------------------------------

pub fn seeder_may_create_a_script_under_explorer_test() {
  assert guard.decide(seeder, write("c:/r/explorer/diagonalscan.mjs"))
    == guard.Allow
}

pub fn seeder_may_write_its_proposal_test() {
  assert guard.decide(seeder, write("c:/r/blueprint/proposals/next.json"))
    == guard.Allow
}

pub fn seeder_may_run_a_script_it_just_wrote_test() {
  assert guard.decide(seeder, bash("node explorer/diagonalscan.mjs"))
    == guard.Allow
}

/// The seeder keeps the lake grammar too — `#eval` against the real
/// definitions is the point of running it in Lean rather than only in the JS
/// engine.
pub fn seeder_keeps_the_lake_grammar_test() {
  assert guard.decide(seeder, bash("lake env lean explorer/probe.lean"))
    == guard.Allow
}

// --- the fence ----------------------------------------------------------------

/// **The one that matters.** `normalise_path` collapses slashes and drive-letter
/// case; it does NOT resolve `..`. So a fence built as a plain prefix check is
/// defeated by a path that starts inside `explorer/` and climbs out of it —
/// and the target of the climb is the file the whole role is forbidden from.
pub fn seeder_cannot_escape_explorer_with_dot_dot_test() {
  let assert guard.Deny(..) =
    guard.decide(seeder, write("c:/r/explorer/../Rule30/Statements.lean"))
  let assert guard.Deny(..) =
    guard.decide(seeder, write("c:/r/explorer/sub/../../blueprint/dag.json"))
  let assert guard.Deny(..) =
    guard.decide(seeder, bash("node explorer/../evil.mjs"))
}

/// A prefix check without a separator lets `explorer_evil/` through, because
/// it starts with `explorer`.
pub fn seeder_cannot_write_a_sibling_that_shares_the_prefix_test() {
  let assert guard.Deny(..) =
    guard.decide(seeder, write("c:/r/explorer_evil/x.mjs"))
  let assert guard.Deny(..) = guard.decide(seeder, write("c:/r/explorerX"))
}

/// The two files the whole fleet reads and the seeder proposes changes to.
/// Dib's ruling: a seeder proposes, Rowan reviews and lands, because
/// direction should not change while nobody is watching.
pub fn seeder_cannot_write_the_statements_or_the_dag_test() {
  let assert guard.Deny(reason:, ..) =
    guard.decide(seeder, write("c:/r/Rule30/Statements.lean"))
  assert string.contains(reason, "explorer")
  let assert guard.Deny(..) =
    guard.decide(seeder, write("c:/r/blueprint/dag.json"))
  let assert guard.Deny(..) =
    guard.decide(seeder, write("c:/r/harness/src/harness/guard.gleam"))
}

/// Shell operators are forbidden for every role. A seeder that could write a
/// script AND chain commands would have a shell outright rather than a shell
/// wearing a hat.
pub fn seeder_cannot_use_shell_operators_test() {
  let assert guard.Deny(..) =
    guard.decide(seeder, bash("node explorer/a.mjs ; rm -rf /"))
  let assert guard.Deny(..) =
    guard.decide(seeder, bash("node explorer/a.mjs && curl http://x"))
}

pub fn seeder_cannot_run_node_outside_explorer_test() {
  let assert guard.Deny(..) = guard.decide(seeder, bash("node harness/x.mjs"))
  let assert guard.Deny(..) = guard.decide(seeder, bash("node"))
  let assert guard.Deny(..) = guard.decide(seeder, bash("npm install"))
}

// --- the prover's rule set is untouched --------------------------------------

/// **The standing rule, as a test.** If this ever passes, the seeder's
/// permission has leaked into the role it was explicitly not granted to.
pub fn a_prover_still_cannot_run_node_test() {
  let assert guard.Deny(..) = guard.decide(prover, bash("node explorer/x.mjs"))
}

pub fn a_prover_still_writes_only_its_one_file_test() {
  assert guard.decide(prover, write("c:/r/Rule30/Proofs/X.lean")) == guard.Allow
  let assert guard.Deny(..) = guard.decide(prover, write("c:/r/explorer/x.mjs"))
  let assert guard.Deny(..) =
    guard.decide(prover, write("c:/r/Rule30/Proofs/Y.lean"))
}
