//// The hook guard: a tiny local HTTP server that Claude Code's hooks POST
//// to before (and after) every tool call. Claude Code's own hooks are shell
//// commands — each one is a `curl` that forwards the hook's JSON input here
//// and echoes back whatever this server replies — so the actual permission
//// decisions live in Gleam, not in shell.
////
//// A worker may only edit its one assigned proof file and may only run
//// `lake build …` / `lake env …`; everything else is denied. `lake build`
//// also serialises through the shared `lock` actor so two workers never
//// build at once.

import gleam/bit_array
import gleam/bytes_tree
import gleam/dynamic/decode
import gleam/erlang/process.{type Subject}
import gleam/http.{Post}
import gleam/http/request.{type Request}
import gleam/http/response.{type Response}
import gleam/int
import gleam/json
import gleam/result
import gleam/string
import harness/lock
import harness/log
import mist
import simplifile

/// The one file a worker may edit, the repo it works in, and the identity it
/// acquires the build lock under.
pub type Rules {
  Rules(repo_root: String, allowed_write: String, holder: String)
}

/// A running guard: the port it listens on, the token hooks must present,
/// and the settings file its hooks were written into.
pub type Guard {
  Guard(port: Int, token: String, settings_path: String)
}

/// What to do with one hook call.
pub type Decision {
  /// Let the tool call through unchanged.
  Allow
  /// A `lake build` is starting: take the build lock before replying.
  AcquireBuild
  /// Block the tool call, and tell Claude Code why.
  Deny(reason: String)
  /// A `Bash` call just finished: give the build lock back.
  ReleaseBuild
}

/// The handful of fields `decide` cares about, pulled out of a hook's JSON.
type HookInput {
  HookInput(
    event: String,
    tool_name: String,
    file_path: String,
    command: String,
  )
}

fn hook_input_decoder() -> decode.Decoder(HookInput) {
  use event <- decode.field("hook_event_name", decode.string)
  use tool_name <- decode.optional_field("tool_name", "", decode.string)
  use file_path <- decode.then(decode.optionally_at(
    ["tool_input", "file_path"],
    "",
    decode.string,
  ))
  use command <- decode.then(decode.optionally_at(
    ["tool_input", "command"],
    "",
    decode.string,
  ))
  decode.success(HookInput(event:, tool_name:, file_path:, command:))
}

fn parse_hook_input(hook_input: String) -> Result(HookInput, json.DecodeError) {
  json.parse(from: hook_input, using: hook_input_decoder())
}

/// Decide what a hook call should do, from its raw JSON body. Pure — no
/// side effects, so this is what the unit tests exercise directly. The
/// actual lock acquire/release and logging happen in the HTTP handler.
pub fn decide(rules: Rules, hook_input: String) -> Decision {
  case parse_hook_input(hook_input) {
    Error(_) -> Allow
    Ok(hi) -> decide_input(rules, hi)
  }
}

fn decide_input(rules: Rules, hi: HookInput) -> Decision {
  case hi.event {
    "PreToolUse" -> decide_pre(rules, hi)
    "PostToolUse" ->
      case hi.tool_name {
        "Bash" -> ReleaseBuild
        _ -> Allow
      }
    _ -> Allow
  }
}

fn decide_pre(rules: Rules, hi: HookInput) -> Decision {
  case hi.tool_name {
    "Edit" | "Write" | "MultiEdit" | "NotebookEdit" ->
      decide_write(rules, hi.file_path)
    "Bash" -> decide_bash(hi.command)
    _ -> Allow
  }
}

fn decide_write(rules: Rules, file_path: String) -> Decision {
  case normalise_path(file_path) == normalise_path(rules.allowed_write) {
    True -> Allow
    False -> Deny("harness guard: you may only edit " <> rules.allowed_write)
  }
}

fn decide_bash(command: String) -> Decision {
  let trimmed = string.trim(command)
  case string.starts_with(trimmed, "lake build") {
    True -> AcquireBuild
    False ->
      case string.starts_with(trimmed, "lake env") {
        True -> Allow
        False ->
          Deny(
            "harness guard: only `lake build …` and `lake env …` are permitted",
          )
      }
  }
}

/// Compare paths after replacing `\` with `/`, lowercasing the drive
/// letter, and trimming — so `C:\r\X.lean` and `c:/r/X.lean` are equal.
fn normalise_path(path: String) -> String {
  let slashed = string.trim(path) |> string.replace("\\", "/")
  case string.pop_grapheme(slashed) {
    Ok(#(first, rest)) ->
      case string.starts_with(rest, ":") {
        True -> string.lowercase(first) <> rest
        False -> slashed
      }
    Error(_) -> slashed
  }
}

/// The JSON a hook must print back to Claude Code for a decision.
/// `Allow`/`AcquireBuild`/`ReleaseBuild` all mean "do nothing special":
/// `{}`. Only `Deny` carries a `hookSpecificOutput`.
pub fn decision_json(d: Decision, event_name: String) -> String {
  case d {
    Deny(reason) ->
      json.object([
        #(
          "hookSpecificOutput",
          json.object([
            #("hookEventName", json.string(event_name)),
            #("permissionDecision", json.string("deny")),
            #("permissionDecisionReason", json.string(reason)),
          ]),
        ),
      ])
      |> json.to_string
    Allow | AcquireBuild | ReleaseBuild -> "{}"
  }
}

/// Start the guard: a fresh token, an HTTP server on `port` bound to
/// `127.0.0.1`, logging every decision to `log`.
pub fn start(
  rules: Rules,
  lock: Subject(lock.Msg),
  log: log.Log,
  port: Int,
) -> Result(Guard, String) {
  let token = token_ffi()
  let handler = fn(req) { handle_request(req, rules, lock, log, token) }
  use _started <- result.try(
    mist.new(handler)
    |> mist.bind("127.0.0.1")
    |> mist.port(port)
    |> mist.start
    |> result.map_error(fn(err) {
      "harness guard: failed to start on port "
      <> int.to_string(port)
      <> ": "
      <> string.inspect(err)
    }),
  )
  Ok(Guard(
    port:,
    token:,
    settings_path: rules.repo_root <> "/.claude/settings.json",
  ))
}

fn handle_request(
  req: Request(mist.Connection),
  rules: Rules,
  lock: Subject(lock.Msg),
  log: log.Log,
  token: String,
) -> Response(mist.ResponseData) {
  case req.method, req.path {
    Post, "/hook" -> authorize(req, rules, lock, log, token)
    _, _ -> empty_response(404)
  }
}

fn authorize(
  req: Request(mist.Connection),
  rules: Rules,
  lock: Subject(lock.Msg),
  log: log.Log,
  token: String,
) -> Response(mist.ResponseData) {
  case request.get_header(req, "x-harness-token") {
    Ok(t) if t == token -> handle_hook(req, rules, lock, log)
    _ -> empty_response(403)
  }
}

fn handle_hook(
  req: Request(mist.Connection),
  rules: Rules,
  lock: Subject(lock.Msg),
  log: log.Log,
) -> Response(mist.ResponseData) {
  case mist.read_body(req, 1_000_000) {
    Error(_) -> empty_response(400)
    Ok(with_body) ->
      case bit_array.to_string(with_body.body) {
        Error(_) -> empty_response(400)
        Ok(body) -> respond_to_hook(body, rules, lock, log)
      }
  }
}

fn respond_to_hook(
  body: String,
  rules: Rules,
  lock: Subject(lock.Msg),
  log: log.Log,
) -> Response(mist.ResponseData) {
  let #(event_name, tool_name) = case parse_hook_input(body) {
    Ok(hi) -> #(hi.event, hi.tool_name)
    Error(_) -> #("", "")
  }
  let decision = apply_side_effects(decide(rules, body), rules, lock)
  log.event(log, "guard", [
    #("event", json.string(event_name)),
    #("tool", json.string(tool_name)),
    #("decision", json.string(string.inspect(decision))),
  ])
  json_response(200, decision_json(decision, event_name))
}

/// Turn `AcquireBuild`/`ReleaseBuild` into actual lock operations. An
/// `AcquireBuild` that times out becomes a `Deny`, so the worker never
/// thinks it holds a lock it does not.
fn apply_side_effects(
  decision: Decision,
  rules: Rules,
  lock: Subject(lock.Msg),
) -> Decision {
  case decision {
    AcquireBuild ->
      case lock.acquire(lock, rules.holder, 240_000) {
        True -> AcquireBuild
        False -> Deny("build lock timeout")
      }
    ReleaseBuild -> {
      lock.release(lock, rules.holder)
      ReleaseBuild
    }
    other -> other
  }
}

fn json_response(status: Int, body: String) -> Response(mist.ResponseData) {
  response.new(status)
  |> response.set_header("content-type", "application/json")
  |> response.set_body(mist.Bytes(bytes_tree.from_string(body)))
}

fn empty_response(status: Int) -> Response(mist.ResponseData) {
  json_response(status, "{}")
}

/// Write the generated `settings.json` a worker's Claude Code session
/// reads its hooks from — see `harness/hooks/settings.template.json` for
/// the shape this produces, with `<TOKEN>` and `<PORT>` filled in.
pub fn write_settings(guard: Guard, path: String) -> Result(Nil, String) {
  settings_json(guard.token, guard.port)
  |> json.to_string
  |> fn(content) { simplifile.write(to: path, contents: content) }
  |> result.map_error(simplifile.describe_error)
}

fn settings_json(token: String, port: Int) -> json.Json {
  let url = "http://127.0.0.1:" <> int.to_string(port) <> "/hook"
  let curl_hook = fn(timeout_s: Int) {
    "curl -s -m "
    <> int.to_string(timeout_s)
    <> " -X POST -H \"x-harness-token: "
    <> token
    <> "\" --data-binary @- "
    <> url
  }
  json.object([
    #(
      "enabledPlugins",
      json.object([#("superpowers@claude-plugins-official", json.bool(False))]),
    ),
    #(
      "hooks",
      json.object([
        #(
          "PreToolUse",
          json.preprocessed_array([
            hook_matcher(
              "Edit|Write|MultiEdit|NotebookEdit|Bash",
              curl_hook(280),
              300,
            ),
          ]),
        ),
        #(
          "PostToolUse",
          json.preprocessed_array([hook_matcher("Bash", curl_hook(20), 30)]),
        ),
      ]),
    ),
  ])
}

fn hook_matcher(matcher: String, command: String, timeout: Int) -> json.Json {
  json.object([
    #("matcher", json.string(matcher)),
    #(
      "hooks",
      json.preprocessed_array([
        json.object([
          #("type", json.string("command")),
          #("timeout", json.int(timeout)),
          #("command", json.string(command)),
        ]),
      ]),
    ),
  ])
}

@external(erlang, "harness_ffi", "token")
fn token_ffi() -> String
