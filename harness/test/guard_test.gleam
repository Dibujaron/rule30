import gleam/json
import gleam/list
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

pub fn only_a_finished_build_releases_the_lock_test() {
  // `lake env lean` never took the lock, so its PostToolUse must not give
  // one back — a sibling worker's build would be the one released.
  let env =
    "{\"hook_event_name\":\"PostToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"lake env lean x.lean\"},\"tool_response\":\"ok\"}"
  assert guard.decide(rules, env) == guard.Allow
  let denied =
    "{\"hook_event_name\":\"PostToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"rm -rf /\"},\"tool_response\":\"ok\"}"
  assert guard.decide(rules, denied) == guard.Allow
  let read =
    "{\"hook_event_name\":\"PostToolUse\",\"tool_name\":\"Read\",\"tool_input\":{\"file_path\":\"x\"}}"
  assert guard.decide(rules, read) == guard.Allow
}

pub fn lake_env_lean_with_windows_path_is_allowed_test() {
  let input =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"  lake env lean C:\\\\Users\\\\dibuj\\\\dev\\\\rule30\\\\harness\\\\build\\\\checks\\\\x.lean\"}}"
  assert guard.decide(rules, input) == guard.Allow
}

pub fn lake_env_lean_with_quoted_path_is_allowed_test() {
  let input =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"lake env lean \\\"harness/build/checks/x.lean\\\"\"}}"
  assert guard.decide(rules, input) == guard.Allow
}

pub fn lake_build_with_module_is_acquire_test() {
  let input =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"lake build Rule30.Proofs.EvolveLeftEdge\"}}"
  assert guard.decide(rules, input) == guard.AcquireBuild
}

pub fn bash_grammar_denies_shell_operators_test() {
  let denied_commands = [
    "lake build; rm -rf x", "lake build && curl http://x",
    "lake env bash -c \"echo hi\"", "lake build $(whoami)",
    "lake build Rule30.Proofs.X | cat", "lake env lean foo.lean; echo",
    "\nlake build",
  ]
  denied_commands
  |> list_each_is_denied(rules)
}

fn list_each_is_denied(commands: List(String), rules: guard.Rules) -> Nil {
  case commands {
    [] -> Nil
    [command, ..rest] -> {
      let escaped =
        command
        |> string.replace("\\", "\\\\")
        |> string.replace("\"", "\\\"")
        |> string.replace("\n", "\\n")
      let input =
        "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\""
        <> escaped
        <> "\"}}"
      let assert guard.Deny(reason) = guard.decide(rules, input)
      assert string.contains(reason, "lake build")
      list_each_is_denied(rest, rules)
    }
  }
}

pub fn decide_denies_unparseable_json_test() {
  let assert guard.Deny(reason) = guard.decide(rules, "not json")
  assert string.contains(reason, "parse")
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
  assert string.contains(content, "PreCompact")
  assert string.contains(content, "--data-binary @-")
  let assert Ok(_) = simplifile.delete("build/test-runs")
}

pub fn the_hook_command_fails_closed_when_curl_fails_test() {
  // Claude Code blocks a tool call only on exit 2. curl's transport failures
  // exit 6/7/28, which are "no opinion" — so a bare curl means an
  // unreachable guard allows everything.
  let command = guard.hook_command("abc123", 5555, 280, "PreToolUse")
  assert string.starts_with(command, "curl -s -m 280")
  assert string.contains(command, "|| { printf '%s' '")
  assert string.contains(command, "; exit 2; }")
  assert string.contains(command, "\"permissionDecision\":\"deny\"")
  assert string.contains(command, "harness guard unreachable")
  assert string.contains(command, "\"hookEventName\":\"PreToolUse\"")
}

pub fn every_generated_hook_carries_the_failure_branch_test() {
  let assert Ok(_) = simplifile.create_directory_all("build/test-runs")
  let g = guard.Guard(port: 5555, token: "abc123", settings_path: "unused")
  let path = "build/test-runs/settings-failclosed.json"
  let assert Ok(_) = guard.write_settings(g, path)
  let assert Ok(content) = simplifile.read(path)
  // Three hooks, three failure branches.
  assert count(content, "exit 2; }") == 3
  assert count(content, "curl -s -m ") == 3
  let assert Ok(_) = simplifile.delete("build/test-runs")
}

fn count(haystack: String, needle: String) -> Int {
  list.length(string.split(haystack, needle)) - 1
}

// --- PreCompact ---------------------------------------------------------------

pub fn precompact_archives_the_transcript_test() {
  let dir = "build/test-runs/precompact"
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let transcript = dir <> "/live.jsonl"
  let assert Ok(_) = simplifile.write(transcript, "{\"a\":1}\n{\"b\":2}\n")
  let input =
    "{\"hook_event_name\":\"PreCompact\",\"session_id\":\"sess-9\",\"transcript_path\":\""
    <> transcript
    <> "\"}"
  let assert guard.Archive(session_id:, transcript_path:) =
    guard.decide(rules, input)
  assert session_id == "sess-9"
  assert transcript_path == transcript
  // An archive is not a permission decision: the session compacts as usual.
  assert guard.decision_json(guard.decide(rules, input), "PreCompact") == "{}"

  let assert Ok(copied) = guard.archive_transcript(dir, session_id, transcript)
  assert string.contains(copied, dir <> "/transcripts/sess-9-precompact-")
  assert string.ends_with(copied, ".jsonl")
  // The stamp is a legal Windows filename: no colons survive from now_iso().
  let assert Ok(#(_, name)) = string.split_once(copied, "/transcripts/")
  assert !string.contains(name, ":")
  let assert Ok(archived) = simplifile.read(copied)
  assert archived == "{\"a\":1}\n{\"b\":2}\n"
  let assert Ok(_) = simplifile.delete(dir)
}

pub fn precompact_without_a_transcript_is_allowed_test() {
  let input = "{\"hook_event_name\":\"PreCompact\",\"session_id\":\"sess-9\"}"
  assert guard.decide(rules, input) == guard.Allow
}

pub fn guard_events_name_the_node_test() {
  let at_node =
    Rules(
      repo_root: "C:\\r",
      allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean",
      holder: "evolve_left_edge",
    )
  let fields =
    guard.event_fields(at_node, "PreToolUse", "Bash", guard.Deny("nope"))
  let assert Ok(#(_, node)) = list.find(fields, fn(f) { f.0 == "node" })
  assert json.to_string(node) == "\"evolve_left_edge\""
}

pub fn guard_events_still_carry_event_tool_and_decision_test() {
  let fields = guard.event_fields(rules, "PreToolUse", "Bash", guard.Allow)
  let keys = list.map(fields, fn(f) { f.0 })
  assert list.contains(keys, "event")
  assert list.contains(keys, "tool")
  assert list.contains(keys, "decision")
}

pub fn guard_http_denies_rm_over_hook_endpoint_test() {
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open("build/test-runs", "guard")
  let assert Ok(started) = guard.start(rules, lock_actor, run_log, 4130)
  assert started.settings_path == run_log.dir <> "/settings.json"
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
