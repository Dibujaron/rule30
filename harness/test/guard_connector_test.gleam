//// The connector's rule set: the theorist's with three changes, separate
//// from the prover's, the seeder's and the theorist's.
////
//// A connector writes one sighting document under `docs/connections/`; like
//// a theorist it writes and runs scripts under `explorer/` and keeps the
//// `lake` grammar; unlike a theorist it cannot add to `docs/obstructions.md`
//// — its dead ends go in the document's own section 4 — and it may reach
//// the web, read-only, through `WebFetch` and `WebSearch`. The tests that
//// matter are the negative ones: the obstructions file, the attack
//// directory, the proposal file, the statement file.

import gleam/string
import harness/guard.{Rules}

const connector = Rules(
  repo_root: "C:\\r",
  role: guard.Connector(
    sighting_path: "C:\\r\\docs\\connections\\2026-09-07-ergodic-theory.md",
  ),
  holder: "connector-1",
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

// --- what a connector may do --------------------------------------------------

pub fn connector_may_write_its_sighting_document_test() {
  assert guard.decide(
      connector,
      write("c:/r/docs/connections/2026-09-07-ergodic-theory.md"),
    )
    == guard.Allow
  assert guard.decide(
      connector,
      edit("C:\\\\r\\\\docs\\\\connections\\\\2026-09-07-ergodic-theory.md"),
    )
    == guard.Allow
}

pub fn connector_may_write_and_run_scripts_under_explorer_test() {
  assert guard.decide(connector, write("c:/r/explorer/probe.mjs"))
    == guard.Allow
  assert guard.decide(connector, edit("explorer/sub/scan.mjs")) == guard.Allow
  assert guard.decide(connector, bash("node explorer/probe.mjs")) == guard.Allow
}

pub fn connector_keeps_the_lake_grammar_test() {
  assert guard.decide(connector, bash("lake build Rule30.Basic"))
    == guard.AcquireBuild
  assert guard.decide(connector, bash("lake env lean explorer/probe.lean"))
    == guard.Allow
}

// --- the fence ----------------------------------------------------------------

/// The one file the design takes away from this role relative to a
/// theorist: a connector's dead ends go in its own section 4, and a captain
/// moves any that is a real obstruction.
pub fn connector_cannot_write_the_obstructions_file_test() {
  let assert guard.Deny(reason:, ..) =
    guard.decide(connector, edit("c:/r/docs/obstructions.md"))
  assert string.contains(reason, "sighting document")
  assert string.contains(reason, "explorer")
  assert string.contains(reason, "section 4")
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/docs/obstructions.md"))
}

pub fn connector_cannot_write_an_attack_document_or_another_sighting_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/docs/attacks/2026-09-07-x.md"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/docs/connections/2026-09-07-other.md"))
  let assert guard.Deny(..) =
    guard.decide(
      connector,
      write("c:/r/docs/connections/2026-09-07-ergodic-theory-2.md"),
    )
}

pub fn connector_cannot_write_the_proposal_the_statements_or_the_dag_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/blueprint/proposals/next.json"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/Rule30/Statements.lean"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/blueprint/dag.json"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/agents/Keel.md"))
}

pub fn connector_cannot_escape_explorer_with_dot_dot_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/explorer/../Rule30/Statements.lean"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/explorer_evil/probe.mjs"))
  let assert guard.Deny(..) =
    guard.decide(connector, bash("node explorer/../evil.mjs"))
}

pub fn connector_cannot_pass_node_an_argument_or_use_shell_operators_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, bash("node explorer/probe.mjs 4000"))
  let assert guard.Deny(..) =
    guard.decide(connector, bash("node explorer/a.mjs | tee out.txt"))
  let assert guard.Deny(..) =
    guard.decide(connector, bash("curl https://arxiv.org/abs/1"))
}

// --- no role may message a session ---------------------------------------------

pub fn a_connector_cannot_send_a_message_either_test() {
  let send =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"SendMessage\",\"tool_input\":{\"to\":\"Rowan\",\"message\":\"hi\"}}"
  let assert guard.Deny(reason:, ..) = guard.decide(connector, send)
  assert reason == guard.message_deny_reason
}
