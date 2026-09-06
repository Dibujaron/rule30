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
import gleam/list
import gleam/result
import gleam/string
import harness/lock
import harness/log
import mist
import simplifile

/// The one file a worker may edit, the repo it works in, and the name it
/// takes the build lock under.
///
/// `holder` is the **node id**, not an identity: the dispatcher passes
/// `node_id`, and one attempt sits at one node, so the node id is already a
/// unique lock name. `event_fields` logs it as `node` so a decision row says
/// which node it came from without the reader having to know which attempt
/// directory it was found in.
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
  /// A `lake build` just finished: give the build lock back.
  ReleaseBuild
  /// The session is about to compact: copy its transcript aside first.
  Archive(session_id: String, transcript_path: String)
}

/// The handful of fields `decide` cares about, pulled out of a hook's JSON.
type HookInput {
  HookInput(
    event: String,
    tool_name: String,
    file_path: String,
    command: String,
    session_id: String,
    transcript_path: String,
  )
}

fn hook_input_decoder() -> decode.Decoder(HookInput) {
  use event <- decode.field("hook_event_name", decode.string)
  use tool_name <- decode.optional_field("tool_name", "", decode.string)
  use session_id <- decode.optional_field("session_id", "", decode.string)
  use transcript_path <- decode.optional_field(
    "transcript_path",
    "",
    decode.string,
  )
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
  decode.success(HookInput(
    event:,
    tool_name:,
    file_path:,
    command:,
    session_id:,
    transcript_path:,
  ))
}

fn parse_hook_input(hook_input: String) -> Result(HookInput, json.DecodeError) {
  json.parse(from: hook_input, using: hook_input_decoder())
}

/// Decide what a hook call should do, from its raw JSON body. Pure — no
/// side effects, so this is what the unit tests exercise directly. The
/// actual lock acquire/release and logging happen in the HTTP handler.
pub fn decide(rules: Rules, hook_input: String) -> Decision {
  case parse_hook_input(hook_input) {
    Error(_) -> Deny("harness guard: could not parse hook input")
    Ok(hi) -> decide_input(rules, hi)
  }
}

fn decide_input(rules: Rules, hi: HookInput) -> Decision {
  case hi.event {
    "PreToolUse" -> decide_pre(rules, hi)
    // Only a build releases the build lock. Every `Bash` call used to, so a
    // `lake env lean` finishing while a sibling worker held the lock handed
    // that worker's lock away.
    "PostToolUse" ->
      case hi.tool_name, decide_bash(hi.command) {
        "Bash", AcquireBuild -> ReleaseBuild
        _, _ -> Allow
      }
    "PreCompact" ->
      case hi.transcript_path {
        "" -> Allow
        path -> Archive(session_id: hi.session_id, transcript_path: path)
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

/// The characters that, anywhere in the raw (untrimmed) command, deny it
/// outright — regardless of how the rest of the command tokenises. Checked
/// before trimming so a leading/embedded newline is caught even though
/// `string.trim` would otherwise remove a merely-leading one.
const forbidden_bash_chars = [";", "&", "|", "`", "$", ">", "<", "\n", "\r"]

fn bash_deny() -> Decision {
  Deny(
    "harness guard: only 'lake build [modules]' and 'lake env lean <file>' are permitted, with no shell operators",
  )
}

fn contains_forbidden_bash_char(command: String) -> Bool {
  list.any(forbidden_bash_chars, fn(c) { string.contains(command, c) })
}

/// A strict grammar, not a prefix check. Allowed exactly:
/// - `lake build` optionally followed by one or more module names
///   (`[A-Za-z0-9_.]+`), each separated by a single space -> `AcquireBuild`.
/// - `lake env lean <path>` with exactly one path argument
///   (`[A-Za-z0-9_./:\\-]+`), optionally wrapped in double quotes -> `Allow`.
/// Everything else, including any shell operator anywhere in the command,
/// is denied.
fn decide_bash(command: String) -> Decision {
  case contains_forbidden_bash_char(command) {
    True -> bash_deny()
    False -> match_bash_grammar(string.trim(command))
  }
}

fn match_bash_grammar(trimmed: String) -> Decision {
  let tokens =
    string.split(trimmed, " ")
    |> list.filter(fn(t) { t != "" })
  case tokens {
    ["lake", "build", ..modules] ->
      case list.all(modules, is_module_name) {
        True -> AcquireBuild
        False -> bash_deny()
      }
    ["lake", "env", "lean", path] ->
      case is_lean_path_arg(path) {
        True -> Allow
        False -> bash_deny()
      }
    _ -> bash_deny()
  }
}

const module_name_extra_chars = "_."

const path_extra_chars = "_./:\\-"

const alnum_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

fn is_module_name(token: String) -> Bool {
  token != ""
  && list.all(string.to_graphemes(token), fn(g) {
    is_alnum(g) || string.contains(module_name_extra_chars, g)
  })
}

fn is_lean_path_arg(token: String) -> Bool {
  let unwrapped = unquote(token)
  unwrapped != ""
  && list.all(string.to_graphemes(unwrapped), fn(g) {
    is_alnum(g) || string.contains(path_extra_chars, g)
  })
}

fn unquote(token: String) -> String {
  let length = string.length(token)
  case
    length >= 2
    && string.starts_with(token, "\"")
    && string.ends_with(token, "\"")
  {
    True -> string.slice(token, 1, length - 2)
    False -> token
  }
}

fn is_alnum(g: String) -> Bool {
  string.contains(alnum_chars, g)
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
    Allow | AcquireBuild | ReleaseBuild | Archive(..) -> "{}"
  }
}

/// Copy a session's transcript into `<log_dir>/transcripts/` before Claude
/// Code compacts it away. The name carries the session id and the moment it
/// was taken, colons stripped so it is a legal Windows filename.
pub fn archive_transcript(
  log_dir: String,
  session_id: String,
  transcript_path: String,
) -> Result(String, String) {
  let dir = log_dir <> "/transcripts"
  let name =
    case session_id {
      "" -> "unknown"
      id -> id
    }
    <> "-precompact-"
    <> string.replace(log.now_iso(), ":", "")
    <> ".jsonl"
  let destination = dir <> "/" <> name
  use _ <- result.try(
    simplifile.create_directory_all(dir)
    |> result.map_error(simplifile.describe_error),
  )
  use text <- result.try(
    simplifile.read_bits(transcript_path)
    |> result.map_error(simplifile.describe_error),
  )
  use _ <- result.try(
    simplifile.write_bits(to: destination, bits: text)
    |> result.map_error(simplifile.describe_error),
  )
  Ok(destination)
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
  Ok(Guard(port:, token:, settings_path: log.dir <> "/settings.json"))
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
    _, _ -> deny_response(404, "harness guard: not found")
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
    _ -> deny_response(403, "harness guard: invalid or missing token")
  }
}

/// 16 MiB — generous enough that an ordinary large `Write`'s hook payload
/// is still judged by `decide` rather than denied outright for size, while
/// still bounding memory. Anything over this (or non-UTF-8) fails closed:
/// see the finding this responds to, guard.gleam's HTTP error paths used
/// to reply with a body identical to Allow.
const max_hook_body_bytes = 16_777_216

fn handle_hook(
  req: Request(mist.Connection),
  rules: Rules,
  lock: Subject(lock.Msg),
  log: log.Log,
) -> Response(mist.ResponseData) {
  case mist.read_body(req, max_hook_body_bytes) {
    Error(_) -> deny_response(400, "harness guard: could not read hook input")
    Ok(with_body) ->
      case bit_array.to_string(with_body.body) {
        Error(_) ->
          deny_response(400, "harness guard: could not read hook input")
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
  let decision = apply_side_effects(decide(rules, body), rules, lock, log)
  log.event(log, "guard", event_fields(rules, event_name, tool_name, decision))
  json_response(200, decision_json(decision, event_name))
}

/// The fields logged for one guard decision. Pulled out of `respond_to_hook`
/// so it can be tested without standing up the HTTP server. `dispatch`
/// reads these rows back by literal substring to auto-file guard bugs, so
/// these key names are a contract with another module, not just a format.
pub fn event_fields(
  rules: Rules,
  event_name: String,
  tool_name: String,
  decision: Decision,
) -> List(#(String, json.Json)) {
  [
    #("node", json.string(rules.holder)),
    #("event", json.string(event_name)),
    #("tool", json.string(tool_name)),
    #("decision", json.string(string.inspect(decision))),
  ]
}

/// Turn `AcquireBuild`/`ReleaseBuild` into actual lock operations, and
/// `Archive` into a copied transcript. An `AcquireBuild` that times out
/// becomes a `Deny`, so the worker never thinks it holds a lock it does not;
/// an archive that fails is logged and the compaction proceeds, because
/// blocking a session over a missing log file would cost more than the file.
fn apply_side_effects(
  decision: Decision,
  rules: Rules,
  lock: Subject(lock.Msg),
  l: log.Log,
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
    Archive(session_id:, transcript_path:) -> {
      let outcome = case
        archive_transcript(l.dir, session_id, transcript_path)
      {
        Ok(destination) -> destination
        Error(reason) -> "not archived: " <> reason
      }
      log.event(l, "precompact", [
        #("session", json.string(session_id)),
        #("transcript", json.string(transcript_path)),
        #("archived", json.string(outcome)),
      ])
      Archive(session_id:, transcript_path:)
    }
    other -> other
  }
}

fn json_response(status: Int, body: String) -> Response(mist.ResponseData) {
  response.new(status)
  |> response.set_header("content-type", "application/json")
  |> response.set_body(mist.Bytes(bytes_tree.from_string(body)))
}

/// A deny reply for an HTTP-layer failure (bad token, bad path, unreadable
/// body) — never the `"{}"` that a real `Allow` produces, so a hook script
/// that ignores curl's exit status still sees a deny.
fn deny_response(status: Int, reason: String) -> Response(mist.ResponseData) {
  json_response(status, decision_json(Deny(reason), "PreToolUse"))
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

/// The hook command a generated `settings.json` carries, for one event.
///
/// It must **fail closed**. Claude Code blocks a `PreToolUse` call only when
/// the hook exits 2; every transport failure curl has — connection refused
/// (7), timeout (28), a URL it cannot resolve (6) — exits non-zero but not
/// 2, which Claude Code reads as "no opinion" and allows the tool call. So a
/// bare `curl` means that with the guard down, every Edit, Write and Bash a
/// worker asks for is permitted. The `|| { …; exit 2; }` tail is what turns
/// an unreachable guard into a denial.
///
/// Claude Code spawns hook commands through Git Bash on Windows (it refuses
/// to run them at all when Git Bash is missing), so this is POSIX `sh`, not
/// `cmd.exe`: `||`, `{ … ; }` and `printf` are all honoured.
pub fn hook_command(
  token: String,
  port: Int,
  timeout_s: Int,
  event_name: String,
) -> String {
  let url = "http://127.0.0.1:" <> int.to_string(port) <> "/hook"
  "curl -s -m "
  <> int.to_string(timeout_s)
  <> " -X POST -H \"x-harness-token: "
  <> token
  <> "\" --data-binary @- "
  <> url
  <> " || { printf '%s' '"
  <> decision_json(Deny("harness guard unreachable"), event_name)
  <> "'; exit 2; }"
}

fn settings_json(token: String, port: Int) -> json.Json {
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
              hook_command(token, port, 280, "PreToolUse"),
              300,
            ),
          ]),
        ),
        #(
          "PostToolUse",
          json.preprocessed_array([
            hook_matcher(
              "Bash",
              hook_command(token, port, 20, "PostToolUse"),
              30,
            ),
          ]),
        ),
        #(
          "PreCompact",
          json.preprocessed_array([
            hook_matcher("", hook_command(token, port, 60, "PreCompact"), 90),
          ]),
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
