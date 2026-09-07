//// The sender-side message log: `.claude/hooks/log-message.sh`, run the way
//// Claude Code runs it — as a `PreToolUse` hook for `SendMessage`, through
//// `sh`, with the hook's JSON on stdin — and judged on the two things it
//// promises. It appends one line with every field, and it never blocks a
//// send: exit 0 and nothing on stdout, however the logging went.
////
//// Stdout and stderr are kept apart on purpose. `shell.run` interleaves
//// them, and Claude Code reads only stdout, so a script that complained on
//// stdout would look fine to a test reading the combined stream while
//// leaking its complaint into the tool result. The wrapper below sends
//// stderr to a file so stdout can be asserted empty on its own.

import gleam/dynamic/decode
import gleam/json
import gleam/string
import harness/shell
import simplifile

const script = "../.claude/hooks/log-message.sh"

/// One logged line, as the script writes it.
type Line {
  Line(
    ts: String,
    session_id: String,
    cwd: String,
    to: String,
    summary: String,
    message: String,
  )
}

fn line_decoder() -> decode.Decoder(Line) {
  use ts <- decode.field("ts", decode.string)
  use session_id <- decode.field("session_id", decode.string)
  use cwd <- decode.field("cwd", decode.string)
  use to <- decode.field("to", decode.string)
  use summary <- decode.field("summary", decode.string)
  use message <- decode.field("message", decode.string)
  decode.success(Line(ts:, session_id:, cwd:, to:, summary:, message:))
}

/// A `SendMessage` hook body with the fields Claude Code puts at the top
/// level and the three the tool takes, built with `json` so the escaping is
/// the real thing rather than hand-typed.
fn hook_body(session_id: String, cwd: String, to: String) -> String {
  json.object([
    #("session_id", json.string(session_id)),
    #("cwd", json.string(cwd)),
    #("hook_event_name", json.string("PreToolUse")),
    #("tool_name", json.string("SendMessage")),
    #(
      "tool_input",
      json.object([
        #("to", json.string(to)),
        #("message", json.string("first line\nsecond \"quoted\" line ü")),
        #("summary", json.string("a test message")),
      ]),
    ),
  ])
  |> json.to_string
}

/// Run the script as the hook would be run: `body` on stdin,
/// `HARNESS_MESSAGE_LOG` pointed at `log_path`, stderr diverted to
/// `stderr_path`. Returns the exit status and stdout alone.
///
/// The body reaches the script through a file, not an argument. An argument
/// crosses from the Erlang port into MSYS `sh` through Windows argv quoting,
/// which halves the `\\` a JSON string carries for one backslash — so a
/// `cwd` of `C:\Users\...` arrived as invalid JSON. Stdin is a stream and is
/// what the real hook gets.
fn run_hook(body: String, log_path: String, stderr_path: String) -> shell.Run {
  let body_path = stderr_path <> ".body.json"
  let assert Ok(_) = simplifile.write(body_path, body)
  let assert Ok(sh) = shell.which("sh")
  let assert Ok(r) =
    shell.run(
      sh,
      [
        "-c",
        "HARNESS_MESSAGE_LOG=\"$2\" sh \"$3\" <\"$1\" 2>\"$4\"",
        "sh",
        body_path,
        log_path,
        script,
        stderr_path,
      ],
      ".",
      20_000,
    )
  r
}

/// The line lands with every field, in a directory that did not exist a
/// moment before, and the send is not blocked.
pub fn a_send_is_logged_with_every_field_test() {
  let dir = "build/test-runs-message-logged"
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let log_path = dir <> "/not-yet/messages.jsonl"
  let r =
    run_hook(
      hook_body("sess-42", "C:\\Users\\dib\\dev\\rule30", "Rowan"),
      log_path,
      dir <> "/stderr.txt",
    )
  assert r.status == 0
  assert r.output == ""
  let assert Ok(text) = simplifile.read(log_path)
  let assert [line, ""] = string.split(text, "\n")
  let assert Ok(logged) = json.parse(line, line_decoder())
  assert logged.session_id == "sess-42"
  assert logged.cwd == "C:\\Users\\dib\\dev\\rule30"
  assert logged.to == "Rowan"
  assert logged.summary == "a test message"
  assert logged.message == "first line\nsecond \"quoted\" line ü"
  assert string.ends_with(logged.ts, "Z")
  assert string.length(logged.ts) == 20
  let assert Ok(stderr) = simplifile.read(dir <> "/stderr.txt")
  assert stderr == ""
  let assert Ok(_) = simplifile.delete(dir)
}

/// Two sends append two lines; the log is a log, not a last-value cell.
pub fn a_second_send_appends_test() {
  let dir = "build/test-runs-message-appends"
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let log_path = dir <> "/messages.jsonl"
  let _ = run_hook(hook_body("s1", "c", "Keel"), log_path, dir <> "/err1")
  let _ = run_hook(hook_body("s2", "c", "Fathom"), log_path, dir <> "/err2")
  let assert Ok(text) = simplifile.read(log_path)
  let assert [first, second, ""] = string.split(text, "\n")
  let assert Ok(a) = json.parse(first, line_decoder())
  let assert Ok(b) = json.parse(second, line_decoder())
  assert a.to == "Keel"
  assert b.to == "Fathom"
  let assert Ok(_) = simplifile.delete(dir)
}

/// **The promise that matters.** A log path that cannot be created — here,
/// one whose parent is a regular file — must not stop the send: exit 0, so
/// Claude Code has no opinion to act on, and an empty stdout, so nothing
/// leaks into the tool result. The complaint goes to stderr and names the
/// path, which is where a person looking for the missing line will find out
/// why it is missing.
pub fn a_log_that_cannot_be_written_still_lets_the_send_through_test() {
  let dir = "build/test-runs-message-blocked"
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let assert Ok(_) = simplifile.write(dir <> "/afile", "not a directory")
  let log_path = dir <> "/afile/messages.jsonl"
  let r =
    run_hook(hook_body("s1", "c", "Rowan"), log_path, dir <> "/stderr.txt")
  assert r.status == 0
  assert r.output == ""
  let assert Ok(stderr) = simplifile.read(dir <> "/stderr.txt")
  assert string.contains(stderr, "NOT logged")
  assert string.contains(stderr, "messages.jsonl")
  let assert Ok(_) = simplifile.delete(dir)
}

/// Stdin that is not JSON is a hook bug upstream, not a reason to block a
/// send: same contract, exit 0 and silence on stdout.
pub fn malformed_hook_input_still_lets_the_send_through_test() {
  let dir = "build/test-runs-message-malformed"
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let log_path = dir <> "/messages.jsonl"
  let r = run_hook("not json at all", log_path, dir <> "/stderr.txt")
  assert r.status == 0
  assert r.output == ""
  assert simplifile.is_file(log_path) == Ok(False)
  let assert Ok(stderr) = simplifile.read(dir <> "/stderr.txt")
  assert string.contains(stderr, "NOT logged")
  let assert Ok(_) = simplifile.delete(dir)
}
