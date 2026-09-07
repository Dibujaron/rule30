//// The theorist's rule set: two files and the seeder's commands, separate
//// from both the prover's list and the seeder's.
////
//// A theorist writes one attack document and may add to the obstructions
//// file; it runs scripts under `explorer/` but cannot write there, and it
//// cannot reach the seeder's proposal file. The tests that matter are the
//// negative ones again — the proposal file, the statement file, a script it
//// would like to author — because a role whose deliverable is prose is
//// fenced by what it cannot do rather than by what it can.

import gleam/string
import harness/guard.{Rules}

const theorist = Rules(
  repo_root: "C:\\r",
  role: guard.Theorist(
    attack_path: "C:\\r\\docs\\attacks\\2026-09-07-the-transients.md",
    obstructions_path: "C:\\r\\docs\\obstructions.md",
  ),
  holder: "theorist-1",
)

const seeder = Rules(
  repo_root: "C:\\r",
  role: guard.Seeder(proposal_path: "C:\\r\\blueprint\\proposals\\next.json"),
  holder: "seed-1",
)

fn write(path: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\""
  <> path
  <> "\"}}"
}

fn edit(path: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\""
  <> path
  <> "\"}}"
}

fn bash(command: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\""
  <> command
  <> "\"}}"
}

// --- what a theorist may do ---------------------------------------------------

pub fn theorist_may_write_its_attack_document_test() {
  assert guard.decide(
      theorist,
      write("c:/r/docs/attacks/2026-09-07-the-transients.md"),
    )
    == guard.Allow
  assert guard.decide(
      theorist,
      edit("C:\\\\r\\\\docs\\\\attacks\\\\2026-09-07-the-transients.md"),
    )
    == guard.Allow
}

/// The guard sees an `Edit` on the obstructions file and lets it through;
/// it cannot see whether the edit appended. Append-only is the brief's rule
/// and a captain's diff, which is why this test asserts `Allow` on an edit
/// and not on anything narrower.
pub fn theorist_may_edit_the_obstructions_file_test() {
  assert guard.decide(theorist, edit("c:/r/docs/obstructions.md"))
    == guard.Allow
  assert guard.decide(theorist, write("c:/r/docs/obstructions.md"))
    == guard.Allow
}

pub fn theorist_may_run_a_script_under_explorer_test() {
  assert guard.decide(theorist, bash("node explorer/diagonalscan.mjs"))
    == guard.Allow
}

pub fn theorist_keeps_the_lake_grammar_test() {
  assert guard.decide(theorist, bash("lake build Rule30.Basic"))
    == guard.AcquireBuild
  assert guard.decide(theorist, bash("lake env lean explorer/probe.lean"))
    == guard.Allow
}

// --- the fence ----------------------------------------------------------------

/// The seeder's file is the one a theorist must not have: a theorist that
/// could write `next.json` would be a seeder with a longer brief, and the
/// design's whole point is that its claims reach the board through a
/// captain and the seed check.
pub fn theorist_cannot_write_the_proposal_file_test() {
  let assert guard.Deny(reason:, ..) =
    guard.decide(theorist, write("c:/r/blueprint/proposals/next.json"))
  assert string.contains(reason, "attack document")
  assert string.contains(reason, "obstructions.md")
}

pub fn theorist_cannot_write_the_statements_or_the_dag_test() {
  let assert guard.Deny(..) =
    guard.decide(theorist, write("c:/r/Rule30/Statements.lean"))
  let assert guard.Deny(..) =
    guard.decide(theorist, write("c:/r/blueprint/dag.json"))
  let assert guard.Deny(..) =
    guard.decide(theorist, write("c:/r/blueprint/crystals.md"))
  let assert guard.Deny(..) =
    guard.decide(theorist, write("c:/r/agents/Keel.md"))
}

/// A theorist runs scripts it cannot author: `explorer/` is not writable
/// for it, unlike for a seeder, so a script it wants has to already exist
/// or go into the document as text.
pub fn theorist_cannot_write_under_explorer_test() {
  let assert guard.Deny(..) =
    guard.decide(theorist, write("c:/r/explorer/probe.mjs"))
  assert guard.decide(seeder, write("c:/r/explorer/probe.mjs")) == guard.Allow
}

/// A second attack document is not this session's file.
pub fn theorist_cannot_write_a_different_attack_document_test() {
  let assert guard.Deny(..) =
    guard.decide(theorist, write("c:/r/docs/attacks/2026-09-07-other.md"))
}

pub fn theorist_cannot_pass_node_an_argument_test() {
  let assert guard.Deny(..) =
    guard.decide(theorist, bash("node explorer/diagonalscan.mjs 4000"))
  let assert guard.Deny(..) = guard.decide(theorist, bash("node harness/x.mjs"))
  let assert guard.Deny(..) =
    guard.decide(theorist, bash("node explorer/../evil.mjs"))
}

pub fn theorist_cannot_use_shell_operators_test() {
  let assert guard.Deny(..) =
    guard.decide(theorist, bash("node explorer/a.mjs | tee out.txt"))
  let assert guard.Deny(..) =
    guard.decide(theorist, bash("lake build && node explorer/a.mjs"))
}

// --- no role may message a session ---------------------------------------------

pub fn a_theorist_cannot_send_a_message_either_test() {
  let send =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"SendMessage\",\"tool_input\":{\"to\":\"Rowan\",\"message\":\"hi\"}}"
  let assert guard.Deny(reason:, ..) = guard.decide(theorist, send)
  assert reason == guard.message_deny_reason
}
