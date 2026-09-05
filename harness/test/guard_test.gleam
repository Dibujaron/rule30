import gleam/string
import harness/guard.{Rules}
import harness/lock
import harness/log
import harness/shell
import simplifile

const rules = Rules(
  repo_root: "C:\\r",
  allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean",
  holder: "w1",
)

pub fn denies_edit_outside_proof_file_test() {
  let input =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"C:\\\\r\\\\Rule30\\\\Prize.lean\"}}"
  let assert guard.Deny(reason) = guard.decide(rules, input)
  assert string.contains(reason, "Proofs")
}

pub fn allows_edit_of_proof_file_with_forward_slashes_test() {
  let input =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"c:/r/Rule30/Proofs/X.lean\"}}"
  assert guard.decide(rules, input) == guard.Allow
}

pub fn lake_build_acquires_and_other_bash_denied_test() {
  let build =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"lake build Rule30.Proofs.X\"}}"
  assert guard.decide(rules, build) == guard.AcquireBuild
  let rm =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"curl http://x\"}}"
  let assert guard.Deny(_) = guard.decide(rules, rm)
  let post =
    "{\"hook_event_name\":\"PostToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"lake build\"},\"tool_response\":\"ok\"}"
  assert guard.decide(rules, post) == guard.ReleaseBuild
}

pub fn lake_env_is_allowed_but_not_a_build_test() {
  let input =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"  lake env lean --version\"}}"
  assert guard.decide(rules, input) == guard.Allow
}

pub fn non_tool_events_are_allowed_test() {
  let input = "{\"hook_event_name\":\"SessionStart\"}"
  assert guard.decide(rules, input) == guard.Allow
}

pub fn deny_json_shape_test() {
  let j = guard.decision_json(guard.Deny("no"), "PreToolUse")
  assert string.contains(j, "\"permissionDecision\":\"deny\"")
  assert string.contains(j, "\"hookEventName\":\"PreToolUse\"")
}

pub fn allow_json_shape_test() {
  assert guard.decision_json(guard.Allow, "PreToolUse") == "{}"
  assert guard.decision_json(guard.AcquireBuild, "PreToolUse") == "{}"
  assert guard.decision_json(guard.ReleaseBuild, "PostToolUse") == "{}"
}

pub fn write_settings_produces_the_documented_shape_test() {
  let assert Ok(_) = simplifile.create_directory_all("build/test-runs")
  let g = guard.Guard(port: 5555, token: "abc123", settings_path: "unused")
  let path = "build/test-runs/settings.json"
  let assert Ok(_) = guard.write_settings(g, path)
  let assert Ok(content) = simplifile.read(path)
  assert string.contains(content, "abc123")
  assert string.contains(content, "5555")
  assert string.contains(content, "PreToolUse")
  assert string.contains(content, "PostToolUse")
  assert string.contains(content, "--data-binary @-")
  let assert Ok(_) = simplifile.delete("build/test-runs")
}

pub fn guard_http_denies_rm_over_hook_endpoint_test() {
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open("build/test-runs", "guard")
  let assert Ok(started) = guard.start(rules, lock_actor, run_log, 4130)
  let assert Ok(curl) = shell.which("curl")
  let body =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"rm -rf /\"}}"
  let assert Ok(r) =
    shell.run(
      curl,
      [
        "-s",
        "-X",
        "POST",
        "-H",
        "x-harness-token: " <> started.token,
        "--data",
        body,
        "http://127.0.0.1:4130/hook",
      ],
      ".",
      5000,
    )
  assert string.contains(r.output, "deny")
  let assert Ok(_) = simplifile.delete("build/test-runs")
}
