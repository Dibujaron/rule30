//// The hook guard: a tiny local HTTP server that Claude Code's hooks POST
//// to before (and after) every tool call. Claude Code's own hooks are shell
//// commands — each one is a `curl` that forwards the hook's JSON input here
//// and echoes back whatever this server replies — so the actual permission
//// decisions live in Gleam, not in shell.
////
//// A worker may only edit its one assigned proof file and may only run
//// `lake build …` / `lake env …`; everything else is denied. `lake build`
//// also serialises through the shared `lock` actor so two workers never
//// build at once — and a build that cannot get that lock within
//// `build_lock_wait_ms` is turned away with a message that says the command
//// was permitted and to run it again, which is a different message from
//// the one a forbidden command gets, because it asks for the opposite
//// response. The lock is given back when the build's `PostToolUse` or
//// `PostToolUseFailure` hook arrives, and as a backstop at the worker's
//// next `PreToolUse`, since a worker making a new call is not still
//// building.
////
//// `SendMessage` is denied for every role. A dispatched session speaks
//// through its end-of-turn report, which the harness writes to disk, and
//// a message it sent from inside an attempt would leave the attempt's
//// record looking complete while being wrong about what happened.

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
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import harness/guard_event.{
  type Denial, BuildLockTimeout, Malformed, NotPermitted, NotWritable,
  Unauthorized,
}
import harness/lock
import harness/log
import mist
import simplifile

/// The one file a worker may edit, the repo it works in, and the name it
/// takes the build lock under.
///
/// `holder` is the **node id**, not an identity: the dispatcher passes
/// `node_id`, and one attempt sits at one node, so the node id is already a
/// unique lock name. `event` logs it as `node` so a decision row says
/// which node it came from without the reader having to know which attempt
/// directory it was found in.
pub type Rules {
  Rules(repo_root: String, role: Role, holder: String)
}

/// What a session is allowed to be. **A sum type on purpose**: the seeder's
/// permission is wider than any prover's, and making the two separate
/// constructors rather than two settings on one record means a change to
/// `Seeder` cannot widen `Prover` by accident. The standing rule — that
/// loosening the guard is never a fix on its own — is about the prover's list,
/// and this shape keeps that list out of reach of anyone trying to make a
/// seeder work.
pub type Role {
  /// One file, and the `lake` grammar. Unchanged since the guard was written.
  Prover(allowed_write: String)
  /// Anything under `explorer/`, plus one proposal file, plus `node <script>`
  /// where the script is under `explorer/` — in addition to the `lake` grammar.
  ///
  /// Granted by Dib on 2026-09-06 with the cost stated rather than glossed:
  /// **`node` on a file the agent just authored is a shell wearing a hat.**
  /// The directory fence is a real bound on what gets WRITTEN and a thin one
  /// on what gets RUN. It buys a seeder that can scan diagonals to N=16000 —
  /// that morning's one good idea came out of a script which did not exist
  /// when the pass began — at the price of a wider trust surface, deliberately.
  ///
  /// What it does NOT buy: writing `Rule30/Statements.lean` or
  /// `blueprint/dag.json`. A seeder proposes; Rowan reviews and lands, because
  /// direction should not change while nobody is watching.
  Seeder(proposal_path: String)
  /// The seeder's guard with two changes, as the spec's fence paragraph
  /// says: `attack_path` — the one attack document the session exists to
  /// write, `docs/attacks/<date>-<topic>.md` — and `obstructions_path`,
  /// `docs/obstructions.md`, the shared list of known dead ends a theorist
  /// may add to, in place of the seeder's proposal file. Everything else
  /// is the seeder's: anything under `explorer/` writable, `node <script>`
  /// under `explorer/`, and the `lake` grammar. The brief asks for every
  /// candidate claim to carry an engine falsification run to a stated
  /// depth, and a falsification run is a script; a theorist that could run
  /// scripts but not write them did its falsification by pencil, which is
  /// what the first one did. It cannot reach `blueprint/proposals/next.json`:
  /// that is the seeder's file, and a theorist that could write it would be
  /// a seeder with a longer brief.
  ///
  /// **On `obstructions_path`, the spec says "append access" and this guard
  /// cannot grant that.** A hook sees a `Write` or `Edit` tool call with a
  /// path; it does not see whether the edit adds at the end or rewrites the
  /// middle, so the file is simply writable here. Append-only is a rule the
  /// brief states in words, and the check that it was obeyed is a captain's
  /// `git diff` of the file after the session — the same shape of check as a
  /// prover's proof file getting a diff, and not a property the fence holds.
  Theorist(attack_path: String, obstructions_path: String)
  /// The theorist's guard with three changes, as the connector design's
  /// fence paragraph says. `sighting_path` — the one sighting document the
  /// session exists to write, `docs/connections/<date>-<vantage>.md` — in
  /// place of the attack document; no obstructions file at all, because a
  /// connector's dead ends belong in its own section 4 and a captain moves
  /// any that is a real obstruction; and the two web tools, `WebFetch` and
  /// `WebSearch`, allowed read-only and logged (`decide_web`). Everything
  /// else is the theorist's: anything under `explorer/` writable, `node
  /// <script>` under `explorer/`, and the `lake` grammar.
  Connector(sighting_path: String)
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
  /// Block the tool call, and tell Claude Code why. `kind` is for the
  /// record and `reason` is for the worker; they are different audiences and
  /// collapsing them was the defect. `kind` is `guard_event.Denial`, the
  /// vocabulary the dispatcher reads the row back in, so a refusal the guard
  /// can express is one the board can name.
  Deny(kind: Denial, reason: String)
  /// A `lake build` just finished: give the build lock back.
  ReleaseBuild
  /// The session is about to compact: copy its transcript aside first.
  Archive(session_id: String, transcript_path: String)
}

/// The handful of fields `decide` cares about, pulled out of a hook's JSON.
/// `url` is a `WebFetch` call's target and `query` a `WebSearch` call's
/// text; both are empty for every other tool.
type HookInput {
  HookInput(
    event: String,
    tool_name: String,
    file_path: String,
    command: String,
    to: String,
    url: String,
    query: String,
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
  use to <- decode.then(decode.optionally_at(
    ["tool_input", "to"],
    "",
    decode.string,
  ))
  use url <- decode.then(decode.optionally_at(
    ["tool_input", "url"],
    "",
    decode.string,
  ))
  use query <- decode.then(decode.optionally_at(
    ["tool_input", "query"],
    "",
    decode.string,
  ))
  decode.success(HookInput(
    event:,
    tool_name:,
    file_path:,
    command:,
    to:,
    url:,
    query:,
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
    Error(_) -> Deny(Malformed, "harness guard: could not parse hook input")
    Ok(hi) -> decide_input(rules, hi)
  }
}

fn decide_input(rules: Rules, hi: HookInput) -> Decision {
  case hi.event {
    "PreToolUse" -> decide_pre(rules, hi)
    // Only a build releases the build lock. Every `Bash` call used to, so a
    // `lake env lean` finishing while a sibling worker held the lock handed
    // that worker's lock away.
    //
    // A build that FAILS is still a build that finished. Claude Code fires
    // `PostToolUse` only for a tool call that succeeded; a `Bash` call that
    // exits non-zero fires `PostToolUseFailure` instead, with the same
    // `tool_name` / `tool_input` and an `error` in place of the response.
    // A failing `lake build` is the normal case mid-proof, and listening to
    // the success event alone held the lock through every one of them until
    // the auto-release, so both events are one arm here.
    "PostToolUse" | "PostToolUseFailure" ->
      case hi.tool_name, decide_bash_for(rules, hi.command) {
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
    "Bash" -> decide_bash_for(rules, hi.command)
    "SendMessage" -> decide_message(rules)
    "WebFetch" | "WebSearch" -> decide_web(rules, hi)
    _ -> Allow
  }
}

/// No dispatched session may message another session, whatever its role.
///
/// The `case` names both constructors rather than using `_` so that a new
/// role has to say here, before it compiles, that it too cannot send — the
/// same reason `Role` is a sum type at all.
///
/// The reason is the one thing the session reads, so it says what the
/// session should do instead: the notebook and journal fields of the
/// end-of-turn report are how it reaches its peers and Dib, and the harness
/// writes them to disk verbatim. It deliberately does not say that a peer
/// message would go unrecorded, because the session cannot act on that.
fn decide_message(rules: Rules) -> Decision {
  case rules.role {
    Prover(..) | Seeder(..) | Theorist(..) | Connector(..) ->
      Deny(NotPermitted, message_deny_reason)
  }
}

/// What a dispatched session is told when it tries to `SendMessage`.
pub const message_deny_reason = "harness guard: a dispatched session cannot message another session. It speaks to peers and to Dib through the notebook and journal fields of its end-of-turn report, which the harness writes to disk verbatim; messaging a session from inside an attempt is not available to it."

/// The two web tools. A connector may fetch over `http://` or `https://`
/// and may search; anything else it hands `WebFetch` is refused, since the
/// grant is a read-only GET to the web and nothing wider — no login, no
/// form, no POST, in keeping with the boundary that no agent posts to an
/// external service. The other three roles are refused here as well as by
/// the CLI allowlist: `worker.launch` already leaves both tools off their
/// `--allowedTools`, so the CLI would refuse the call before any hook
/// fires, but the guard is the trust boundary the project names, not the
/// CLI's list — so the grant stays this role's alone whichever layer is
/// loosened later.
fn decide_web(rules: Rules, hi: HookInput) -> Decision {
  case rules.role, hi.tool_name {
    Connector(..), "WebFetch" ->
      case is_http_url(hi.url) {
        True -> Allow
        False -> Deny(NotPermitted, web_deny_reason)
      }
    Connector(..), _ -> Allow
    Prover(..), _ | Seeder(..), _ | Theorist(..), _ ->
      Deny(NotPermitted, web_other_role_deny_reason)
  }
}

/// What a connector is told when it hands `WebFetch` something that is not
/// a web URL.
pub const web_deny_reason = "harness guard: a connector may fetch http:// and https:// URLs only — read-only, no login, no form, no POST; anything else is not available to it"

/// What any role but the connector is told when it reaches for the web:
/// the grant is the connector's alone.
pub const web_other_role_deny_reason = "harness guard: the web is available to a connector session only; this session has no WebFetch or WebSearch"

fn is_http_url(url: String) -> Bool {
  // Lowercased first: a URL scheme is case-insensitive (RFC 3986 3.1), so
  // `HTTPS://` is a real https URL. Without this the guard denies it while
  // the denial text tells the session `https://` is exactly what it may
  // fetch, which costs a session a turn to discover.
  let trimmed = string.lowercase(string.trim(url))
  string.starts_with(trimmed, "http://")
  || string.starts_with(trimmed, "https://")
}

/// The `kind` of the second row written for every web call, beside the
/// guard row: `{"kind":"web","event":..,"node":..,"tool":..,"url":..,"query":..,"urls":[..]}`.
pub const web_kind = "web"

/// A second row beside the guard row for every `WebFetch` or `WebSearch`
/// `PreToolUse`, and for a `WebFetch`'s `PostToolUse` or
/// `PostToolUseFailure`, whatever the decision — a refused fetch is still a
/// URL the session reached for, and a `PostToolUseFailure` row says the
/// fetch never actually completed. `event` is the hook event name that
/// fired, `url` is the fetch's target, `query` the search's text, and
/// `urls` every `http://` or `https://` token anywhere in the hook body:
/// the URL itself for a fetch, and whatever a search's payload carried. The
/// guard row's `attempted` is capped at 400 characters and a citation is
/// matched by exact URL, so the URL is repeated here uncapped.
fn web_row(l: log.Log, rules: Rules, hi: HookInput, body: String) -> Nil {
  case hi.event, hi.tool_name {
    "PreToolUse", "WebFetch"
    | "PreToolUse", "WebSearch"
    | "PostToolUse", "WebFetch"
    | "PostToolUseFailure", "WebFetch"
    ->
      log.event(l, web_kind, [
        #("event", json.string(hi.event)),
        #("node", json.string(rules.holder)),
        #("tool", json.string(hi.tool_name)),
        #("url", json.string(hi.url)),
        #("query", json.string(hi.query)),
        #("urls", json.array(urls_in(body), json.string)),
      ])
    _, _ -> Nil
  }
}

/// Every `http://` or `https://` token in `text`, in order, once each. A
/// token runs to the next space, newline, tab, double quote or backslash —
/// the things that end a URL inside a JSON string — with trailing `,` `.`
/// `;` `)` `]` `}` dropped, since those are punctuation around a URL more
/// often than part of one.
pub fn urls_in(text: String) -> List(String) {
  text
  |> string.replace("\\", " ")
  |> string.replace("\"", " ")
  |> string.replace("\n", " ")
  |> string.replace("\t", " ")
  |> string.split(" ")
  |> list.filter(fn(t) {
    string.starts_with(t, "http://") || string.starts_with(t, "https://")
  })
  |> list.map(trim_trailing_punctuation)
  |> list.unique
}

fn trim_trailing_punctuation(t: String) -> String {
  case list.any([",", ".", ";", ")", "]", "}"], string.ends_with(t, _)) {
    True -> trim_trailing_punctuation(string.drop_end(t, 1))
    False -> t
  }
}

fn decide_write(rules: Rules, file_path: String) -> Decision {
  case rules.role {
    Prover(allowed_write:) ->
      case normalise_path(file_path) == normalise_path(allowed_write) {
        True -> Allow
        False ->
          Deny(
            NotWritable,
            "harness guard: you may only edit " <> allowed_write,
          )
      }
    Seeder(proposal_path:) ->
      case
        normalise_path(file_path) == normalise_path(proposal_path)
        || under_explorer(rules.repo_root, file_path)
      {
        True -> Allow
        False ->
          Deny(
            NotWritable,
            "harness guard: a seeder may only write under "
              <> explorer_dir(rules.repo_root)
              <> " or the proposal file "
              <> proposal_path,
          )
      }
    Theorist(attack_path:, obstructions_path:) ->
      case
        normalise_path(file_path) == normalise_path(attack_path)
        || normalise_path(file_path) == normalise_path(obstructions_path)
        || under_explorer(rules.repo_root, file_path)
      {
        True -> Allow
        False ->
          Deny(
            NotWritable,
            "harness guard: a theorist may only write its attack document "
              <> attack_path
              <> ", add to "
              <> obstructions_path
              <> ", or write scripts under "
              <> explorer_dir(rules.repo_root),
          )
      }
    Connector(sighting_path:) ->
      case
        normalise_path(file_path) == normalise_path(sighting_path)
        || under_explorer(rules.repo_root, file_path)
      {
        True -> Allow
        False ->
          Deny(
            NotWritable,
            "harness guard: a connector may only write its sighting document "
              <> sighting_path
              <> " or scripts under "
              <> explorer_dir(rules.repo_root)
              <> "; dead ends go in the document's section 4, not in the obstructions file",
          )
      }
  }
}

fn explorer_dir(repo_root: String) -> String {
  normalise_path(repo_root) <> "/explorer"
}

/// Is `path` inside the repo's `explorer/` directory?
///
/// **A `..` segment is a refusal, not something to resolve.** `normalise_path`
/// collapses slashes and drive-letter case and does not resolve traversal, so
/// a plain prefix check is defeated by `explorer/../Rule30/Statements.lean` —
/// precisely the file this role exists not to be able to write. The fix is not
/// to resolve the path: a fence with a path parser inside it is a fence with a
/// bug inside it, and the usual way that bug shows up is the parser and the
/// filesystem disagreeing. Refusing the segment is a property of the string,
/// checkable by reading it.
///
/// The trailing separator is the other half. Without it `explorer_evil/x` is
/// inside `explorer`, because it starts with those eight characters.
fn under_explorer(repo_root: String, path: String) -> Bool {
  let normalised = normalise_path(path)
  case has_dot_dot_segment(normalised) {
    True -> False
    False ->
      string.starts_with(normalised, explorer_dir(repo_root) <> "/")
      || string.starts_with(normalised, "explorer/")
  }
}

fn has_dot_dot_segment(path: String) -> Bool {
  string.split(path, "/") |> list.any(fn(segment) { segment == ".." })
}

/// The characters that, anywhere in the raw (untrimmed) command, deny it
/// outright — regardless of how the rest of the command tokenises. Checked
/// before trimming so a leading/embedded newline is caught even though
/// `string.trim` would otherwise remove a merely-leading one.
const forbidden_bash_chars = [";", "&", "|", "`", "$", ">", "<", "\n", "\r"]

/// Why a `Bash` command was refused, naming the grammar THIS role actually
/// has. A seeder, theorist and connector may also run `node <script>` under
/// `explorer/` (`decide_bash_for`), and a message that omits it is true
/// about everything it names and wrong about the set: Rowan's connector hit
/// this on its first two calls, and a session that reads it carefully
/// concludes it has no computational tool at all. The previous round's
/// value was almost entirely in its run tests, so that is an expensive
/// thing to be quietly told. The decision was right; only its account of
/// itself was wrong, so the role is threaded into the message rather than
/// anything being widened.
fn bash_deny(role: Role) -> Decision {
  Deny(
    NotPermitted,
    "harness guard: only 'lake build [modules]', 'lake env lean <file>'"
      <> case role {
      Prover(..) -> ""
      Seeder(..) | Theorist(..) | Connector(..) ->
        " and 'node <script>' under explorer/"
    }
      <> " are permitted, with no shell operators",
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
fn decide_bash_for(rules: Rules, command: String) -> Decision {
  case contains_forbidden_bash_char(command) {
    True -> bash_deny(rules.role)
    False -> {
      let trimmed = string.trim(command)
      // The `node` arm is reachable ONLY under `Seeder`, `Theorist` and
      // `Connector`, each named here rather than matched by `_`, so a fifth
      // role has to say which side of this line it is on before it
      // compiles.
      case rules.role, node_script(trimmed) {
        Seeder(..), Ok(script)
        | Theorist(..), Ok(script)
        | Connector(..), Ok(script)
        ->
          case under_explorer(rules.repo_root, script) {
            True -> Allow
            False ->
              Deny(
                NotPermitted,
                "harness guard: "
                  <> role_word(rules.role)
                  <> " may only run scripts under explorer/",
              )
          }
        Prover(..), _
        | Seeder(..), Error(Nil)
        | Theorist(..), Error(Nil)
        | Connector(..), Error(Nil)
        -> match_bash_grammar(rules.role, trimmed)
      }
    }
  }
}

/// The role as a denial reason names it.
fn role_word(role: Role) -> String {
  case role {
    Prover(..) -> "a prover"
    Seeder(..) -> "a seeder"
    Theorist(..) -> "a theorist"
    Connector(..) -> "a connector"
  }
}

/// `node <path>` with exactly one argument, or `Error(Nil)`.
///
/// Deliberately no extra arguments. A script that needs a parameter can carry
/// it in the file the seeder just wrote, and starting tight is the only honest
/// direction: widening later needs evidence, whereas narrowing later breaks a
/// role that has come to depend on the width.
fn node_script(command: String) -> Result(String, Nil) {
  case string.split(command, " ") {
    ["node", path] ->
      case path != "" && list.all(string.to_graphemes(path), is_path_grapheme) {
        True -> Ok(path)
        False -> Error(Nil)
      }
    _ -> Error(Nil)
  }
}

fn match_bash_grammar(role: Role, trimmed: String) -> Decision {
  let tokens =
    string.split(trimmed, " ")
    |> list.filter(fn(t) { t != "" })
  case tokens {
    ["lake", "build", ..modules] ->
      case list.all(modules, is_module_name) {
        True -> AcquireBuild
        False -> bash_deny(role)
      }
    ["lake", "env", "lean", path] ->
      case is_lean_path_arg(path) {
        True -> Allow
        False -> bash_deny(role)
      }
    _ -> bash_deny(role)
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
  unwrapped != "" && list.all(string.to_graphemes(unwrapped), is_path_grapheme)
}

/// One character a path argument may contain. Shared by the `lake env lean`
/// argument and the seeder's `node` argument so the two cannot drift into
/// permitting different character sets — a difference that would be invisible
/// until the day one of them accepted something the other refused.
fn is_path_grapheme(g: String) -> Bool {
  is_alnum(g) || string.contains(path_extra_chars, g)
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
    Deny(reason:, ..) ->
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

/// How long a `lake build` waits for the shared build lock before the guard
/// gives up on it and turns the call away. Four minutes: long enough that a
/// sibling's ordinary build finishes inside it, short enough to fit under the
/// 280-second `curl -m` in `hook_command`, since a hook that outlives its
/// own transport is a denial the worker never gets to read.
pub const build_lock_wait_ms = 240_000

/// The shared build lock as the HTTP handler sees it: the actor, and how long
/// one `lake build` may wait on it. Bundled so `start_with` can hand a test a
/// short wait without a fifth argument threading through every handler.
type BuildLock {
  BuildLock(actor: Subject(lock.Msg), wait_ms: Int)
}

/// What a worker is told when its `lake build` was permitted but the lock
/// did not come free. Generated here, from the wait actually used, rather
/// than written at the call site: this is the one denial that is not the
/// worker's fault, and the text has to carry that or the worker will treat
/// it like the grammar refusal it otherwise resembles — which is permanent,
/// and whose correct response (stop) is the opposite of this one's (retry).
///
/// It says four things, in this order, because a worker reads the first
/// clause and acts: the command was allowed; another worker held the lock;
/// run the same command again once; if the same reply comes back, report it
/// at the end of the turn instead of retrying. The last is what keeps a held
/// lock from eating a worker's whole turn budget — an attempt that loops
/// here is later scored as `budget_exhausted` against the node, which reads
/// as difficulty and was contention.
///
/// The other worker is never named. The text says a worker held the lock
/// and how long this guard waited, and nothing that identifies which
/// worker, node or persona: a worker's reply is not the place to learn who
/// else is on the run.
pub fn build_lock_busy_reason(waited_ms: Int) -> String {
  "harness guard: your command was permitted and nothing about it needs to change. "
  <> "Another worker held the shared build lock for the "
  <> int.to_string(waited_ms / 1000)
  <> " seconds this guard waited, so this call was turned away without running. "
  <> "This is contention, not a rule you broke: wait a little and run the same command again, once. "
  <> "If this same reply comes back, do not retry again; say so in your end-of-turn report instead, "
  <> "because a worker that keeps retrying a held lock spends its whole turn budget on it."
}

/// Start the guard: a fresh token, an HTTP server on `port` bound to
/// `127.0.0.1`, logging every decision to `log`. A `lake build` waits
/// `build_lock_wait_ms` for the lock.
pub fn start(
  rules: Rules,
  lock: Subject(lock.Msg),
  log: log.Log,
  port: Int,
) -> Result(Guard, String) {
  start_with(rules, lock, log, port, build_lock_wait_ms)
}

/// `start`, trying `from`, `from + 1`, ... until one binds or `tries` are
/// spent. Returns the guard and the port it actually got.
///
/// **Why counting up rather than an OS-assigned port.** A hand-started role's
/// port is derived from the run base so that a captain can find it — seeder
/// at +100, theorist at +200, connector at +300. An ephemeral port would fix
/// the collision and destroy that, so the first session of a role still lands
/// exactly where the arithmetic says and only a second one moves.
///
/// **Why this exists at all.** Those three derivations were bare constants
/// with no retry, so the SECOND hand-started session of a role always aimed
/// at the port the first was holding, failed to bind, and died. `mist` logs a
/// supervisor report on the way down, which is why it looked like a crash
/// rather than a refusal. Measured on 2026-09-11: 127.0.0.1:4330 held by one
/// theorist while a second started, 4430 likewise for connectors. Provers
/// never hit it because a run counts its ports up from the base already —
/// only the hand-started roles were fixed, and nobody fired two of one role
/// in a minute until that night.
///
/// The `Error` names every port tried, because "could not bind" without the
/// range is a message that cannot be acted on.
pub fn start_counting_up(
  rules: Rules,
  lock: Subject(lock.Msg),
  log: log.Log,
  from: Int,
  tries: Int,
) -> Result(Guard, String) {
  case tries <= 0 {
    True ->
      Error(
        "harness guard: no free port in "
        <> int.to_string(from)
        <> "..="
        <> int.to_string(from - 1)
        <> " (none tried; `tries` must be at least 1)",
      )
    False -> count_up(rules, lock, log, from, from, tries)
  }
}

fn count_up(
  rules: Rules,
  lock: Subject(lock.Msg),
  log: log.Log,
  first: Int,
  port: Int,
  left: Int,
) -> Result(Guard, String) {
  // Asked BEFORE starting, not after failing. `mist.start` does not return an
  // error on a taken port — it fails to start a supervised child and exits
  // the calling process, so a retry loop around it can never run. That exit
  // is the supervisor dump a colliding session printed, and it is why this
  // probes instead of reacting.
  case port_is_free(port), left <= 1 {
    True, _ -> start(rules, lock, log, port)
    False, False -> count_up(rules, lock, log, first, port + 1, left - 1)
    False, True ->
      Error(
        "harness guard: no free port in "
        <> int.to_string(first)
        <> "..="
        <> int.to_string(port)
        <> "; all "
        <> int.to_string(port - first + 1)
        <> " were bound by something else",
      )
  }
}

/// Can `127.0.0.1:port` be bound right now. See `harness_ffi:port_is_free/1`
/// for why the question has to be asked in advance.
@external(erlang, "harness_ffi", "port_is_free")
fn port_is_free(port: Int) -> Bool

/// `start`, with the build-lock wait chosen by the caller. Exists so a test
/// can drive the timeout path in milliseconds; the dispatcher uses `start`.
pub fn start_with(
  rules: Rules,
  lock: Subject(lock.Msg),
  log: log.Log,
  port: Int,
  build_lock_wait_ms: Int,
) -> Result(Guard, String) {
  let token = token_ffi()
  let build = BuildLock(actor: lock, wait_ms: build_lock_wait_ms)
  let handler = fn(req) { handle_request(req, rules, build, log, token) }
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
  build: BuildLock,
  log: log.Log,
  token: String,
) -> Response(mist.ResponseData) {
  case req.method, req.path {
    Post, "/hook" -> authorize(req, rules, build, log, token)
    _, _ -> deny_response(404, Unauthorized, "harness guard: not found")
  }
}

fn authorize(
  req: Request(mist.Connection),
  rules: Rules,
  build: BuildLock,
  log: log.Log,
  token: String,
) -> Response(mist.ResponseData) {
  case request.get_header(req, "x-harness-token") {
    Ok(t) if t == token -> handle_hook(req, rules, build, log)
    _ ->
      deny_response(
        403,
        Unauthorized,
        "harness guard: invalid or missing token",
      )
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
  build: BuildLock,
  log: log.Log,
) -> Response(mist.ResponseData) {
  case mist.read_body(req, max_hook_body_bytes) {
    Error(_) ->
      deny_response(400, Malformed, "harness guard: could not read hook input")
    Ok(with_body) ->
      case bit_array.to_string(with_body.body) {
        Error(_) ->
          deny_response(
            400,
            Malformed,
            "harness guard: could not read hook input",
          )
        Ok(body) -> respond_to_hook(body, rules, build, log)
      }
  }
}

fn respond_to_hook(
  body: String,
  rules: Rules,
  build: BuildLock,
  log: log.Log,
) -> Response(mist.ResponseData) {
  let parsed = parse_hook_input(body)
  let #(event_name, tool_name, attempted) = case parsed {
    Ok(hi) -> #(hi.event, hi.tool_name, attempted_of(hi))
    Error(_) -> #("", "", "")
  }
  let decided = decide(rules, body)
  release_stale_hold(event_name, tool_name, decided, rules, build, log)
  let decision = apply_side_effects(decided, rules, build, log)
  guard_event.write(
    log,
    event(rules, event_name, tool_name, attempted, decision),
  )
  case parsed {
    Ok(hi) -> web_row(log, rules, hi, body)
    Error(_) -> Nil
  }
  json_response(200, decision_json(decision, event_name))
}

/// A worker that is issuing a new tool call is not still building, so if
/// this guard's worker holds the build lock at a `PreToolUse`, that hold is
/// stale and is given back before the call is judged. This is the backstop
/// for every way the release hook can fail to arrive — a `curl` past its
/// timeout, a guard that was briefly unreachable, an event Claude Code did
/// not fire — so a missed hook can hold the lock only until this worker's
/// next action rather than until the auto-release.
///
/// Two things it deliberately does not do. It does not run for the
/// `AcquireBuild` call itself: that call's acquire is the one acquire per
/// build, and a release in front of it would hand back a hold that a
/// parallel build from this same worker might still be using. And it only
/// ever releases a hold that is *this worker's* — `release_if_holding`
/// leaves another holder and any queued request untouched — so a sibling's
/// build cannot be released by this worker's edit.
///
/// The residual hazard is a worker that runs a build and some other hooked
/// call in parallel in one turn: the second call's `PreToolUse` releases the
/// running build's hold. A brief that says one bare command per Bash call
/// makes that rare rather than impossible, and the row this writes is how it
/// would be seen.
fn release_stale_hold(
  event_name: String,
  tool_name: String,
  decided: Decision,
  rules: Rules,
  build: BuildLock,
  l: log.Log,
) -> Nil {
  case event_name, decided {
    "PreToolUse", AcquireBuild -> Nil
    "PreToolUse", _ ->
      case lock.release_if_holding(build.actor, rules.holder) {
        True ->
          log.event(l, "lock", [
            #("node", json.string(rules.holder)),
            #("released", json.string("stale hold")),
            #("before", json.string(tool_name)),
          ])
        False -> Nil
      }
    _, _ -> Nil
  }
}

/// What the worker actually asked for: the command for a `Bash` call, the
/// path for a write, the recipient for a `SendMessage`, the URL for a
/// `WebFetch`, the query for a `WebSearch`, and nothing for anything else.
/// This is the field a denial row was missing — `tool: Bash,
/// decision: Deny(...)` says a call was refused and never says which call, so
/// a filed guard bug could not be acted on without the transcript, which the
/// board does not have.
fn attempted_of(hi: HookInput) -> String {
  case hi.tool_name {
    "Bash" -> hi.command
    "Edit" | "Write" | "MultiEdit" | "NotebookEdit" -> hi.file_path
    "SendMessage" -> hi.to
    "WebFetch" -> hi.url
    "WebSearch" -> hi.query
    _ -> ""
  }
}

/// A hook body may be up to `max_hook_body_bytes`, and a log line is not the
/// place for it. Long values are cut rather than dropped, and say that they
/// were: a silently shortened command is a well-formed row that is wrong.
///
/// Applied in `event` rather than where the value is produced. The cap is a
/// property of the *row*, and enforcing it at one call site left it true
/// only along the path that call site takes — which a test calling `event`
/// directly then broke, correctly.
const max_attempted_chars = 400

fn truncate(value: String) -> String {
  case string.length(value) > max_attempted_chars {
    False -> value
    True -> string.slice(value, 0, max_attempted_chars) <> "... (truncated)"
  }
}

/// The row logged for one guard decision. Pulled out of `respond_to_hook`
/// so it can be tested without standing up the HTTP server.
///
/// `dispatch.guard_denials` reads these rows back to auto-file guard bugs.
/// The row's shape is `guard_event`'s, shared with the reader, so the only
/// choices made here are the values. Two are load-bearing. `denial` is the
/// typed kind of the refusal, written as its stable slug rather than an
/// inspect of the constructor, so a rename cannot silently change a bug
/// signature. `attempted` is what the worker asked for, so a filed bug can
/// be read without the transcript.
pub fn event(
  rules: Rules,
  event_name: String,
  tool_name: String,
  attempted: String,
  decision: Decision,
) -> guard_event.GuardEvent {
  guard_event.GuardEvent(
    node: rules.holder,
    event: event_name,
    tool: tool_name,
    attempted: truncate(attempted),
    denial: denial_of(decision),
    decision: string.inspect(decision),
  )
}

/// The denial behind a decision, if it was one.
fn denial_of(decision: Decision) -> Option(Denial) {
  case decision {
    Deny(kind:, ..) -> Some(kind)
    Allow | AcquireBuild | ReleaseBuild | Archive(..) -> None
  }
}

/// Turn `AcquireBuild`/`ReleaseBuild` into actual lock operations, and
/// `Archive` into a copied transcript. An `AcquireBuild` that times out
/// becomes a `Deny(BuildLockTimeout, ..)`, so the worker never thinks it
/// holds a lock it does not — the hook wire has only allow and deny, so a
/// "not right now" still has to travel as a deny, and `build_lock_busy_reason`
/// is what stops it reading as a "never". An archive that fails is logged and
/// the compaction proceeds, because blocking a session over a missing log
/// file would cost more than the file.
fn apply_side_effects(
  decision: Decision,
  rules: Rules,
  build: BuildLock,
  l: log.Log,
) -> Decision {
  case decision {
    AcquireBuild ->
      case lock.acquire(build.actor, rules.holder, build.wait_ms) {
        True -> AcquireBuild
        False -> Deny(BuildLockTimeout, build_lock_busy_reason(build.wait_ms))
      }
    ReleaseBuild -> {
      lock.release(build.actor, rules.holder)
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
fn deny_response(
  status: Int,
  kind: Denial,
  reason: String,
) -> Response(mist.ResponseData) {
  json_response(status, decision_json(Deny(kind, reason), "PreToolUse"))
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
  <> decision_json(Deny(Unauthorized, "harness guard unreachable"), event_name)
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
              "Edit|Write|MultiEdit|NotebookEdit|Bash|SendMessage|WebFetch|WebSearch",
              hook_command(token, port, 280, "PreToolUse"),
              300,
            ),
          ]),
        ),
        #(
          "PostToolUse",
          json.preprocessed_array([
            hook_matcher(
              "Bash|WebFetch",
              hook_command(token, port, 20, "PostToolUse"),
              30,
            ),
          ]),
        ),
        // The same hook again for a `Bash` call that exited non-zero, which
        // Claude Code reports as `PostToolUseFailure` and NOT as
        // `PostToolUse`. Without this a failing `lake build` — the ordinary
        // case mid-proof — never released the build lock, and every sibling
        // waited the full `build_lock_wait_ms`.
        #(
          "PostToolUseFailure",
          json.preprocessed_array([
            hook_matcher(
              "Bash|WebFetch",
              hook_command(token, port, 20, "PostToolUseFailure"),
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
