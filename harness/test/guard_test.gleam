import gleam/dynamic/decode
import gleam/erlang/process.{type Subject}
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{None, Some}
import gleam/result
import gleam/string
import harness/dispatch
import harness/guard.{type Rules, Rules}
import harness/guard_event
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

/// Dib's decision, 2026-09-07: a dispatched session does not message other
/// sessions. The guard sees the send on the sender's side, because there it
/// IS a tool call, and refuses it with a reason that says where the session
/// should speak instead. The report's old `posts` field is being retired on a
/// sibling branch and must not be named here.
pub fn a_prover_cannot_send_a_message_test() {
  let assert guard.Deny(kind: guard_event.NotPermitted, reason:) =
    guard.decide(rules, send_message("Rowan", "are you there"))
  assert reason == guard.message_deny_reason
  assert string.contains(reason, "notebook")
  assert string.contains(reason, "journal")
  assert !string.contains(reason, "posts")
}

/// One `SendMessage` hook body, as Claude Code would post it.
fn send_message(to: String, message: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"SendMessage\",\"tool_input\":{\"to\":\""
  <> to
  <> "\",\"message\":\""
  <> message
  <> "\",\"summary\":\"a test\"}}"
}

pub fn deny_json_shape_test() {
  let j =
    guard.decision_json(
      guard.Deny(guard_event.NotPermitted, "no"),
      "PreToolUse",
    )
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
  // Four hooks, four failure branches.
  assert count(content, "exit 2; }") == 4
  assert count(content, "curl -s -m ") == 4
  let assert Ok(_) = simplifile.delete("build/test-runs")
}

/// Every `(matcher, command, timeout)` registered under one hook event in a
/// generated settings file, read by decoding the JSON rather than by
/// substring, because the command itself is full of quotes.
fn registered_hooks(
  content: String,
  event: String,
) -> List(#(String, String, Int)) {
  let one_hook = {
    use command <- decode.field("command", decode.string)
    use timeout <- decode.field("timeout", decode.int)
    decode.success(#(command, timeout))
  }
  let entry = {
    use matcher <- decode.field("matcher", decode.string)
    use hooks <- decode.field("hooks", decode.list(one_hook))
    decode.success(#(matcher, hooks))
  }
  let assert Ok(entries) =
    json.parse(content, decode.at(["hooks", event], decode.list(entry)))
  list.flat_map(entries, fn(e) { list.map(e.1, fn(h) { #(e.0, h.0, h.1) }) })
}

/// Claude Code fires `PostToolUse` only when the tool call succeeded; a
/// `Bash` call that exits non-zero fires `PostToolUseFailure` instead. A
/// failing `lake build` is the ordinary case mid-proof, so the release hook
/// has to be registered under both, with the same matcher and the same
/// command — differing only in the event name the fail-closed branch echoes.
pub fn a_failed_bash_call_is_hooked_the_same_as_a_successful_one_test() {
  let assert Ok(_) = simplifile.create_directory_all("build/test-runs")
  let g = guard.Guard(port: 5555, token: "abc123", settings_path: "unused")
  let path = "build/test-runs/settings-failure-hook.json"
  let assert Ok(_) = guard.write_settings(g, path)
  let assert Ok(content) = simplifile.read(path)
  let assert [#(success_matcher, success_command, 30)] =
    registered_hooks(content, "PostToolUse")
  let assert [#(failure_matcher, failure_command, 30)] =
    registered_hooks(content, "PostToolUseFailure")
  // `WebFetch` fires this same hook now, so a completed or failed fetch is
  // on the record too — see the `event` field a `web` row carries.
  assert list.contains(string.split(success_matcher, "|"), "Bash")
  assert list.contains(string.split(success_matcher, "|"), "WebFetch")
  assert success_matcher == failure_matcher
  assert failure_command
    == guard.hook_command("abc123", 5555, 20, "PostToolUseFailure")
  assert failure_command
    == string.replace(success_command, "PostToolUse", "PostToolUseFailure")
  let assert Ok(_) = simplifile.delete("build/test-runs")
}

fn count(haystack: String, needle: String) -> Int {
  list.length(string.split(haystack, needle)) - 1
}

/// The generated settings and `harness/hooks/settings.template.json` are the
/// same document with `<TOKEN>` and `<PORT>` filled in. The template is what
/// a reader opens to learn what a worker's hooks are, so the two must not
/// drift: every event, matcher, timeout and command is compared, decoded
/// rather than as text, because the template is hand-indented and the
/// generated file is not.
pub fn the_generated_settings_match_the_template_test() {
  let assert Ok(_) = simplifile.create_directory_all("build/test-runs")
  let g = guard.Guard(port: 5555, token: "abc123", settings_path: "unused")
  let path = "build/test-runs/settings-template.json"
  let assert Ok(_) = guard.write_settings(g, path)
  let assert Ok(generated) = simplifile.read(path)
  let assert Ok(template) = simplifile.read("hooks/settings.template.json")
  let filled =
    template
    |> string.replace("<TOKEN>", "abc123")
    |> string.replace("<PORT>", "5555")
  list.each(
    ["PreToolUse", "PostToolUse", "PostToolUseFailure", "PreCompact"],
    fn(event) {
      assert registered_hooks(generated, event)
        == registered_hooks(filled, event)
    },
  )
  let assert Ok(_) = simplifile.delete("build/test-runs")
}

/// A hook that is not registered never fires, so the guard's `SendMessage`
/// refusal is only as real as this matcher. Checked on the template, which
/// the test above holds equal to the generated file.
pub fn the_pretooluse_matcher_names_send_message_and_the_web_tools_test() {
  let assert Ok(template) = simplifile.read("hooks/settings.template.json")
  let assert [#(matcher, _, _)] = registered_hooks(template, "PreToolUse")
  let tools = string.split(matcher, "|")
  assert list.contains(tools, "SendMessage")
  assert list.contains(tools, "Bash")
  // A URL is only logged if the hook fires, and it only fires if the
  // matcher names the tool.
  assert list.contains(tools, "WebFetch")
  assert list.contains(tools, "WebSearch")
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
  let e =
    guard.event(
      at_node,
      "PreToolUse",
      "Bash",
      "lake clean",
      guard.Deny(guard_event.NotPermitted, "nope"),
    )
  assert e.node == "evolve_left_edge"
}

pub fn guard_events_still_carry_event_tool_and_decision_test() {
  let fields =
    guard_event.fields(guard.event(rules, "PreToolUse", "Bash", "", guard.Allow))
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
  let e =
    guard.event(
      rules,
      "PreToolUse",
      "Bash",
      "rm -rf /",
      guard.Deny(guard_event.NotPermitted, "nope"),
    )
  assert e.attempted == "rm -rf /"
  assert e.denial == Some(guard_event.NotPermitted)
}

/// The field is empty for anything that was not a denial, which is what
/// `dispatch.guard_denials` keys on. If this ever became the slug of some
/// non-denial, every allowed call in a run would be filed as a bug.
pub fn a_non_denial_row_carries_an_empty_denial_test() {
  let e = guard.event(rules, "PreToolUse", "Bash", "lake build", guard.Allow)
  assert e.denial == None
  assert !guard_event.is_denial(e)
}

/// The two denials that a worker cannot tell apart from the outside, and
/// that the board most needs to: one is permanent, one is a transient
/// contention with a sibling worker, and they used to share a signature.
pub fn a_lock_timeout_and_a_grammar_refusal_have_different_slugs_test() {
  assert guard_event.denial_slug(guard_event.BuildLockTimeout)
    != guard_event.denial_slug(guard_event.NotPermitted)
  assert guard_event.denial_slug(guard_event.BuildLockTimeout)
    == "build_lock_timeout"
}

/// The worker-facing half of the same distinction. A grammar refusal and a
/// lock timeout both travel as a hook `deny`, so the text is the only thing a
/// worker has to tell "never" from "not right now" — and the two ask for
/// opposite responses. The busy text must say the command was permitted, that
/// no rule was broken, to run the same command again ONCE, and to report
/// rather than retry if the same reply returns; it must not name the worker
/// holding the lock; and it must not carry the grammar refusal's sentence,
/// which is the one that says "only".
pub fn the_busy_reason_says_permitted_and_retry_once_then_report_test() {
  let busy = guard.build_lock_busy_reason(guard.build_lock_wait_ms)
  assert string.contains(busy, "permitted")
  assert string.contains(busy, "not a rule you broke")
  assert string.contains(busy, "run the same command again, once")
  assert string.contains(busy, "do not retry again")
  assert string.contains(busy, "end-of-turn report")
  assert string.contains(busy, "240 seconds")
  // No node id or persona: the text is built from the wait alone, and the
  // requesting worker's own holder name must not leak into it either.
  assert !string.contains(busy, rules.holder)
  let forbidden =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"curl http://x\"}}"
  let assert guard.Deny(kind: guard_event.NotPermitted, reason: grammar) =
    guard.decide(rules, forbidden)
  assert grammar != busy
  assert !string.contains(busy, "only 'lake build")
  assert !string.contains(grammar, "run the same command again")
}

/// A command longer than the cap is cut, and says so. A silently shortened
/// command is a well-formed log row that is wrong.
pub fn a_very_long_command_is_truncated_and_says_so_test() {
  let long = string.repeat("lake build Rule30.Proofs.X ", 100)
  let e =
    guard.event(
      rules,
      "PreToolUse",
      "Bash",
      long,
      guard.Deny(guard_event.NotPermitted, "nope"),
    )
  assert string.contains(e.attempted, "truncated")
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
  build_lock_wait_ms: Int,
  attempts: Int,
) -> guard.Guard {
  start_on_free_port_as(
    rules,
    lock_actor,
    run_log,
    build_lock_wait_ms,
    attempts,
  )
}

/// `start_on_free_port` for a rule set other than the prover's.
fn start_on_free_port_as(
  as_rules: Rules,
  lock_actor: Subject(lock.Msg),
  run_log: log.Log,
  build_lock_wait_ms: Int,
  attempts: Int,
) -> guard.Guard {
  case
    guard.start_with(
      as_rules,
      lock_actor,
      run_log,
      ports.span(1),
      build_lock_wait_ms,
    ),
    attempts
  {
    Ok(started), _ -> started
    Error(_), n if n > 1 ->
      start_on_free_port_as(
        as_rules,
        lock_actor,
        run_log,
        build_lock_wait_ms,
        n - 1,
      )
    Error(e), _ ->
      panic as { "guard.start found no free port in 8 attempts: " <> e }
  }
}

/// POST one PreToolUse `Bash` hook body to a running guard, the way Claude
/// Code's hook does, and return what the hook would print back.
fn post_bash_hook(started: guard.Guard, command: String) -> String {
  post_hook(
    started,
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\""
      <> command
      <> "\"}}",
  )
}

/// POST one raw hook body to a running guard and return the reply.
fn post_hook(started: guard.Guard, body: String) -> String {
  let assert Ok(curl) = shell.which("curl")
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
  r.output
}

pub fn guard_http_denies_rm_over_hook_endpoint_test() {
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open("build/test-runs", "guard")
  let started =
    start_on_free_port(lock_actor, run_log, guard.build_lock_wait_ms, 8)
  assert started.settings_path == run_log.dir <> "/settings.json"
  let output = post_bash_hook(started, "rm -rf /")
  assert string.contains(output, "deny")
  let assert Ok(_) = simplifile.delete("build/test-runs")
}

/// The whole channel, end to end: a hook call arrives over HTTP, the guard
/// refuses it and writes its row through its real code path, and the
/// dispatcher reads that row back through *its* real code path. Nothing in
/// this test names the row's kind or a key, so it is the one place a rename
/// on either side — or a guard that starts writing rows some other way —
/// fails instead of leaving the board quiet. Before it, the only round trip
/// wrote the kind by hand in the test and would have stayed green.
pub fn a_denial_over_the_wire_reaches_dispatch_test() {
  let dir = "build/test-runs/guard-wire"
  let _ = simplifile.delete(dir)
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open(dir, "run")
  let started =
    start_on_free_port(lock_actor, run_log, guard.build_lock_wait_ms, 8)
  let assert Ok(curl) = shell.which("curl")
  let body =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"rm -rf /\"}}"
  let assert Ok(_) =
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
  assert dispatch.guard_denials(run_log, rules.holder)
    == [
      dispatch.GuardDenial(
        tool: "Bash",
        denial: guard_event.NotPermitted,
        attempted: "rm -rf /",
      ),
    ]
  let assert Ok(_) = simplifile.delete(dir)
}

/// The whole path, over the wire and into the log, for the one denial that
/// is not the worker's fault. A sibling holds the lock; this worker's
/// `lake build` — the command its brief permits — is turned away. What comes
/// back must still be a `deny` (a worker that proceeds believing it holds a
/// lock it does not is the failure worth keeping), but its text must be the
/// busy text and not the grammar text, and the row in `events.jsonl` must
/// carry `build_lock_timeout` where a forbidden command's row carries
/// `not_permitted` — that field is what `dispatch.guard_denials` reads, and
/// before it the two were one signature.
///
/// The sibling must still hold the lock afterwards: turning the call away is
/// not the same as taking the lock from whoever has it.
pub fn a_busy_build_lock_is_denied_as_busy_not_as_forbidden_test() {
  let dir = "build/test-runs-busy-lock"
  let _ = simplifile.delete(dir)
  let assert Ok(lock_actor) = lock.start(60_000)
  assert lock.acquire(lock_actor, "sibling", 1000)
  let assert Ok(run_log) = log.open(dir, "guard")
  let started = start_on_free_port(lock_actor, run_log, 200, 8)

  let busy = post_bash_hook(started, "lake build Rule30.Proofs.X")
  assert string.contains(busy, "\"permissionDecision\":\"deny\"")
  assert string.contains(busy, "run the same command again, once")
  assert string.contains(busy, "end-of-turn report")
  assert string.contains(busy, "not a rule you broke")
  assert !string.contains(busy, "only 'lake build")
  // The holder is in hand here, so this is the direct check that the reply
  // names no sibling — neither the one holding the lock nor the requester.
  assert !string.contains(busy, "sibling")
  assert !string.contains(busy, rules.holder)

  let forbidden = post_bash_hook(started, "curl http://x")
  assert string.contains(forbidden, "\"permissionDecision\":\"deny\"")
  assert string.contains(forbidden, "only 'lake build")
  assert !string.contains(forbidden, "run the same command again")

  // The sibling was not evicted by the refusal.
  assert lock.acquire(lock_actor, "probe", 50) == False

  let assert [timeout_row, grammar_row] =
    guard_event.read(run_log, rules.holder)
  assert timeout_row.denial == Some(guard_event.BuildLockTimeout)
  assert timeout_row.attempted == "lake build Rule30.Proofs.X"
  assert grammar_row.denial == Some(guard_event.NotPermitted)
  let assert Ok(_) = simplifile.delete(dir)
}

/// A `lake build` that exits non-zero reaches the guard as
/// `PostToolUseFailure`, not `PostToolUse`. Observed in run 20260907T015318Z:
/// a worker acquired at 01:53:39, its build failed, no release was logged,
/// both siblings then timed out, and the first release came at 02:01:43
/// after the worker's first successful build. The failure event must release
/// exactly as the success event does, and a sibling must then get the lock
/// promptly. The body carries `error` where a success carries
/// `tool_response`; the guard reads neither.
pub fn a_failed_build_releases_the_lock_test() {
  let dir = "build/test-runs-failed-build"
  let _ = simplifile.delete(dir)
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open(dir, "guard")
  let started = start_on_free_port(lock_actor, run_log, 200, 8)

  assert post_bash_hook(started, "lake build Rule30.Proofs.X") == "{}"
  // Held by this worker now: a sibling cannot get it.
  assert lock.acquire(lock_actor, "sibling", 50) == False

  let failed =
    "{\"hook_event_name\":\"PostToolUseFailure\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"lake build Rule30.Proofs.X\"},\"error\":\"exit 1\"}"
  assert post_hook(started, failed) == "{}"
  assert lock.acquire(lock_actor, "sibling", 500)

  let assert [acquire_row, release_row] =
    guard_event.read(run_log, rules.holder)
  assert acquire_row.decision == "AcquireBuild"
  assert release_row.event == "PostToolUseFailure"
  assert release_row.decision == "ReleaseBuild"
  let assert Ok(_) = simplifile.delete(dir)
}

/// The backstop for a release hook that never arrives at all. A worker that
/// is making a new tool call is not still building, so its next `PreToolUse`
/// — here a `lake env lean`, which never takes the lock itself — gives back
/// the hold its build left behind, and the row that records it is written.
/// A sibling then gets the lock without waiting for the auto-release.
pub fn a_holders_next_call_releases_a_stale_hold_test() {
  let dir = "build/test-runs-stale-hold"
  let _ = simplifile.delete(dir)
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open(dir, "guard")
  let started = start_on_free_port(lock_actor, run_log, 200, 8)

  assert post_bash_hook(started, "lake build Rule30.Proofs.X") == "{}"
  assert lock.acquire(lock_actor, "sibling", 50) == False

  // No PostToolUse ever arrives. The worker's next call is a plain `lake env
  // lean`, which is allowed and is not a build.
  assert post_bash_hook(started, "lake env lean x.lean") == "{}"
  assert lock.acquire(lock_actor, "sibling", 500)

  let assert Ok(events) = simplifile.read(run_log.dir <> "/events.jsonl")
  let assert [stale_row] =
    string.split(events, "\n")
    |> list.filter(fn(line) { row_kind(line) == Ok("lock") })
  assert string.contains(stale_row, "\"released\":\"stale hold\"")
  assert string.contains(stale_row, "\"before\":\"Bash\"")
  assert string.contains(stale_row, "\"node\":\"w1\"")
  let assert Ok(_) = simplifile.delete(dir)
}

/// The rule must not fire for the build call itself: a `lake build` from a
/// worker whose previous hold is stale is one acquire, not a release and an
/// acquire, and the hold it gets is the one its build runs under. Checked
/// here by the absence of a stale-hold row and by the sibling still being
/// shut out after the second build starts.
pub fn a_second_build_does_not_release_in_front_of_its_own_acquire_test() {
  let dir = "build/test-runs-second-build"
  let _ = simplifile.delete(dir)
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open(dir, "guard")
  let started = start_on_free_port(lock_actor, run_log, 200, 8)

  assert post_bash_hook(started, "lake build Rule30.Proofs.X") == "{}"
  let post =
    "{\"hook_event_name\":\"PostToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"lake build Rule30.Proofs.X\"},\"tool_response\":\"ok\"}"
  assert post_hook(started, post) == "{}"
  assert post_bash_hook(started, "lake build Rule30.Proofs.X") == "{}"
  assert lock.acquire(lock_actor, "sibling", 50) == False

  let assert Ok(events) = simplifile.read(run_log.dir <> "/events.jsonl")
  assert list.all(string.split(events, "\n"), fn(line) {
    row_kind(line) != Ok("lock")
  })
  let assert Ok(_) = simplifile.delete(dir)
}

/// The `kind` of one `events.jsonl` line, decoded. Lock rows have no typed
/// reader the way guard rows do, so a test that looks for one keys on the
/// kind field by name rather than by substring.
fn row_kind(line: String) -> Result(String, Nil) {
  json.parse(line, decode.at([log.kind_key], decode.string))
  |> result.replace_error(Nil)
}

// --- SendMessage over the wire ------------------------------------------------

/// A prover's `SendMessage` refused through the real hook endpoint: the reply
/// is a deny carrying the reasoned text, and the row the dispatcher reads
/// back is `not_permitted` with the recipient as what was attempted — the
/// guard's record of a send the message log will never hold, since the
/// message never went.
pub fn a_provers_send_message_is_denied_over_the_wire_test() {
  let dir = "build/test-runs-send-message-prover"
  let _ = simplifile.delete(dir)
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open(dir, "run")
  let started =
    start_on_free_port(lock_actor, run_log, guard.build_lock_wait_ms, 8)
  let output = post_hook(started, send_message("Rowan", "hello"))
  assert string.contains(output, "\"permissionDecision\":\"deny\"")
  assert string.contains(output, "notebook and journal fields")
  assert dispatch.guard_denials(run_log, rules.holder)
    == [
      dispatch.GuardDenial(
        tool: "SendMessage",
        denial: guard_event.NotPermitted,
        attempted: "Rowan",
      ),
    ]
  let assert Ok(_) = simplifile.delete(dir)
}

/// The seeder's rule set is wider than the prover's and separate from it, so
/// the refusal has to be shown for it separately: a `Seeder` guard, the same
/// send, the same deny and the same row.
pub fn a_seeders_send_message_is_denied_over_the_wire_test() {
  let dir = "build/test-runs-send-message-seeder"
  let _ = simplifile.delete(dir)
  let seeder =
    Rules(
      repo_root: "C:\\r",
      role: guard.Seeder(
        proposal_path: "C:\\r\\blueprint\\proposals\\next.json",
      ),
      holder: "seed-1",
    )
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open(dir, "run")
  let started =
    start_on_free_port_as(
      seeder,
      lock_actor,
      run_log,
      guard.build_lock_wait_ms,
      8,
    )
  let output = post_hook(started, send_message("Keel", "hello"))
  assert string.contains(output, "\"permissionDecision\":\"deny\"")
  assert string.contains(output, guard.message_deny_reason)
  assert dispatch.guard_denials(run_log, seeder.holder)
    == [
      dispatch.GuardDenial(
        tool: "SendMessage",
        denial: guard_event.NotPermitted,
        attempted: "Keel",
      ),
    ]
  let assert Ok(_) = simplifile.delete(dir)
}

// --- counting up past an occupied port ----------------------------------------

/// The second hand-started session of a role aims at the port the first is
/// holding. Before `start_counting_up` the three derivations were bare
/// constants with no retry, so that session failed to bind, `mist` logged a
/// supervisor report on the way down, and the process printed
/// `[exited with code 0]` — leaving an empty run directory byte-identical to
/// a session that had not begun work.
///
/// This occupies a real port and asserts the next guard moves past it, rather
/// than asserting anything about the arithmetic.
pub fn start_counting_up_moves_past_an_occupied_port_test() {
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open("build/test-runs", "guard-countup")
  let base = ports.span(4)
  let assert Ok(first) =
    guard.start_counting_up(rules, lock_actor, run_log, base, 4)
  assert first.port == base
  // Same `from`, and the first is still listening on it.
  let assert Ok(second) =
    guard.start_counting_up(rules, lock_actor, run_log, base, 4)
  assert second.port > base
  assert second.port <= base + 3
  let assert Ok(_) = simplifile.delete("build/test-runs")
}

/// A role that cannot bind anything in its range gets an `Error` naming the
/// range it tried. "Could not bind" without the ports is a message nobody can
/// act on, and the whole cost of the original defect was a failure that said
/// nothing.
pub fn start_counting_up_names_the_range_it_exhausted_test() {
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open("build/test-runs", "guard-exhaust")
  let base = ports.span(2)
  let assert Ok(_) =
    guard.start_counting_up(rules, lock_actor, run_log, base, 1)
  // One try, at a port that is now held: no room to move.
  let assert Error(reason) =
    guard.start_counting_up(rules, lock_actor, run_log, base, 1)
  assert string.contains(reason, int.to_string(base))
  assert string.contains(reason, "no free port")
  let assert Ok(_) = simplifile.delete("build/test-runs")
}
