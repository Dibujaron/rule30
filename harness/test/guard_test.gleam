import gleam/erlang/process.{type Subject}
import gleam/json
import gleam/list
import gleam/string
import harness/guard.{Rules}
import harness/lock
import harness/log
import harness/shell
import ports
import simplifile

const rules = Rules(
  repo_root: "C:\\r",
  role: guard.Prover(allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean"),
  holder: "w1",
)

pub fn denies_edit_outside_proof_file_test() {
  let input =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"C:\\\\r\\\\Rule30\\\\Prize.lean\"}}"
  let assert guard.Deny(reason:, ..) = guard.decide(rules, input)
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
  let assert guard.Deny(..) = guard.decide(rules, rm)
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
      let assert guard.Deny(reason:, ..) = guard.decide(rules, input)
      assert string.contains(reason, "lake build")
      list_each_is_denied(rest, rules)
    }
  }
}

pub fn decide_denies_unparseable_json_test() {
  let assert guard.Deny(reason:, ..) = guard.decide(rules, "not json")
  assert string.contains(reason, "parse")
}

pub fn non_tool_events_are_allowed_test() {
  let input = "{\"hook_event_name\":\"SessionStart\"}"
  assert guard.decide(rules, input) == guard.Allow
}

pub fn deny_json_shape_test() {
  let j =
    guard.decision_json(guard.Deny(guard.NotPermitted, "no"), "PreToolUse")
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
      role: guard.Prover(allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean"),
      holder: "evolve_left_edge",
    )
  let fields =
    guard.event_fields(
      at_node,
      "PreToolUse",
      "Bash",
      "lake clean",
      guard.Deny(guard.NotPermitted, "nope"),
    )
  let assert Ok(#(_, node)) = list.find(fields, fn(f) { f.0 == "node" })
  assert json.to_string(node) == "\"evolve_left_edge\""
}

pub fn guard_events_still_carry_event_tool_and_decision_test() {
  let fields = guard.event_fields(rules, "PreToolUse", "Bash", "", guard.Allow)
  let keys = list.map(fields, fn(f) { f.0 })
  assert list.contains(keys, "event")
  assert list.contains(keys, "tool")
  assert list.contains(keys, "decision")
}

/// A denial row must say what was refused, not merely that something was.
/// Before this, a row read `tool: Bash, decision: Deny(...)` and the command
/// appeared nowhere, so a bug filed from it could not be acted on without the
/// transcript — which the board does not have.
pub fn a_denial_row_carries_the_command_and_the_kind_test() {
  let fields =
    guard.event_fields(
      rules,
      "PreToolUse",
      "Bash",
      "rm -rf /",
      guard.Deny(guard.NotPermitted, "nope"),
    )
  let assert Ok(#(_, attempted)) =
    list.find(fields, fn(f) { f.0 == "attempted" })
  let assert Ok(#(_, denial)) = list.find(fields, fn(f) { f.0 == "denial" })
  assert json.to_string(attempted) == "\"rm -rf /\""
  assert json.to_string(denial) == "\"not_permitted\""
}

/// The field is empty for anything that was not a denial, which is what
/// `dispatch.guard_denials` keys on. If this ever became the slug of some
/// non-denial, every allowed call in a run would be filed as a bug.
pub fn a_non_denial_row_carries_an_empty_denial_test() {
  let fields =
    guard.event_fields(rules, "PreToolUse", "Bash", "lake build", guard.Allow)
  let assert Ok(#(_, denial)) = list.find(fields, fn(f) { f.0 == "denial" })
  assert json.to_string(denial) == "\"\""
}

/// The two denials that a worker cannot tell apart from the outside, and
/// that the board most needs to: one is permanent, one is a transient
/// contention with a sibling worker, and they used to share a signature.
pub fn a_lock_timeout_and_a_grammar_refusal_have_different_slugs_test() {
  assert guard.denial_slug(guard.BuildLockTimeout)
    != guard.denial_slug(guard.NotPermitted)
  assert guard.denial_slug(guard.BuildLockTimeout) == "build_lock_timeout"
}

/// A command longer than the cap is cut, and says so. A silently shortened
/// command is a well-formed log row that is wrong.
pub fn a_very_long_command_is_truncated_and_says_so_test() {
  let long = string.repeat("lake build Rule30.Proofs.X ", 100)
  let fields =
    guard.event_fields(
      rules,
      "PreToolUse",
      "Bash",
      long,
      guard.Deny(guard.NotPermitted, "nope"),
    )
  let assert Ok(#(_, attempted)) =
    list.find(fields, fn(f) { f.0 == "attempted" })
  assert string.contains(json.to_string(attempted), "truncated")
}

/// Start a guard on a port the OS says is free, retrying on a bind collision.
/// A test must never bind 4130: that is `config.guard_port`, the dispatcher's
/// first guard, so a live run holds it and a second checkout running this
/// suite races for it.
///
/// The failure was never a failed test. `mist.start` builds a `OneForOne`
/// supervisor and adds the listener as a child, so the bind happens inside
/// child start and the supervisor is linked to the caller: a child that cannot
/// bind takes this process down with it. Observed 2026-09-06 by holding 4231
/// from outside — the runner died, `run_test` stopped counting, and the
/// summary still read "106 passed, 3 failures" against a true total of 181.
///
/// Which is why the retry below is thin cover, not the fix: on that path there
/// is no `Error` to retry. Not colliding is the fix.
fn start_on_free_port(
  lock_actor: Subject(lock.Msg),
  run_log: log.Log,
  attempts: Int,
) -> guard.Guard {
  case guard.start(rules, lock_actor, run_log, ports.span(1)), attempts {
    Ok(started), _ -> started
    Error(_), n if n > 1 -> start_on_free_port(lock_actor, run_log, n - 1)
    Error(e), _ ->
      panic as { "guard.start found no free port in 8 attempts: " <> e }
  }
}

pub fn guard_http_denies_rm_over_hook_endpoint_test() {
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open("build/test-runs", "guard")
  let started = start_on_free_port(lock_actor, run_log, 8)
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
        "http://127.0.0.1:" <> string.inspect(started.port) <> "/hook",
      ],
      ".",
      5000,
    )
  assert string.contains(r.output, "deny")
  let assert Ok(_) = simplifile.delete("build/test-runs")
}
