//// One Claude Code session behind an Erlang port.
////
//// The session is `claude -p --input-format stream-json --output-format
//// stream-json`, reached through `shim/claude_shim.mjs` because an Erlang
//// port cannot half-close a child's stdin. The dispatcher sends user
//// messages with `send` and reads newline-delimited JSON events with `next`.
//// The session stays open until `finish` sends the EOF sentinel.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string

/// An opaque Erlang port.
pub type Port

pub type Session {
  Session(port: Port, session_id: Option(String))
}

/// How to start a session. `exe` is the absolute path to `claude.exe`, `node`
/// the absolute path to `node.exe`, `shim` the absolute path to
/// `claude_shim.mjs`. `env` is appended to the child's environment.
pub type Launch {
  Launch(
    node: String,
    shim: String,
    exe: String,
    args: List(String),
    env: List(#(String, String)),
  )
}

/// One line of the event stream, parsed just enough to route it. The raw
/// line is kept so the log can record it verbatim.
pub type Event {
  /// `{"type":"system","subtype":"init",...}` — carries the session id.
  Init(session_id: String, raw: String)
  /// `{"type":"assistant",...}`
  Assistant(raw: String)
  /// `{"type":"user",...}` — tool results echoed back into the transcript.
  User(raw: String)
  /// `{"type":"rate_limit_event",...}` — five-hour and seven-day windows.
  RateLimit(five_hour_utilization: Float, resets_at: Int, raw: String)
  /// `{"type":"system","subtype":"api_retry",...}`
  ApiRetry(error: String, attempt: Int, raw: String)
  /// The end of one turn. `structured_output` is present only when the
  /// session was started with `--json-schema`.
  TurnResult(
    session_id: String,
    is_error: Bool,
    total_cost_usd: Float,
    num_turns: Int,
    structured_output: Option(Dynamic),
    raw: String,
  )
  /// Anything else (hook lifecycle, permission denials, stream events).
  Other(raw: String)
  /// The child exited.
  Exited(status: Int)
}

@external(erlang, "harness_ffi", "spawn_port")
fn spawn_port(
  exe: String,
  args: List(String),
  env: List(#(String, String)),
) -> Port

@external(erlang, "harness_ffi", "port_send")
fn port_send(port: Port, line: String) -> Nil

@external(erlang, "harness_ffi", "port_recv")
fn port_recv(port: Port, timeout_ms: Int) -> RecvResult

@external(erlang, "harness_ffi", "port_close")
fn port_close(port: Port) -> Nil

pub type RecvResult {
  Line(line: String)
  Exit(status: Int)
  Timeout
}

pub fn start(launch: Launch) -> Session {
  let args = list.append([launch.shim, launch.exe], launch.args)
  Session(port: spawn_port(launch.node, args, launch.env), session_id: None)
}

/// Send one user turn.
pub fn send(session: Session, text: String) -> Nil {
  let line =
    json.object([
      #("type", json.string("user")),
      #(
        "message",
        json.object([
          #("role", json.string("user")),
          #(
            "content",
            json.array([text], fn(t) {
              json.object([
                #("type", json.string("text")),
                #("text", json.string(t)),
              ])
            }),
          ),
        ]),
      ),
    ])
    |> json.to_string
  port_send(session.port, line)
}

/// Read the next event, waiting up to `timeout_ms` for it — elapsed time,
/// not silence: a line that arrives in pieces cannot extend the budget
/// piece by piece. Non-JSON lines (claude prints a few, e.g. plugin
/// warnings) come back as `Other`.
pub fn next(session: Session, timeout_ms: Int) -> Result(Event, Nil) {
  case port_recv(session.port, timeout_ms) {
    Line(line) -> Ok(parse_event(line))
    Exit(status) -> Ok(Exited(status))
    Timeout -> Error(Nil)
  }
}

/// Read events until the next `Result` (or `Exited`), returning it and every
/// event seen on the way, oldest first.
///
/// `timeout_ms` is each event's budget, so what this bounds is how long a
/// working session may go silent — a turn that keeps talking may run as long
/// as it likes. That is deliberate: a 40-turn proof session is minutes of
/// legitimate work, and the thing worth killing is the one that has stopped
/// saying anything at all.
pub fn read_turn(
  session: Session,
  timeout_ms: Int,
) -> Result(#(Session, Event, List(Event)), Nil) {
  read_turn_loop(session, timeout_ms, [])
}

fn read_turn_loop(
  session: Session,
  timeout_ms: Int,
  seen: List(Event),
) -> Result(#(Session, Event, List(Event)), Nil) {
  use event <- result.try(next(session, timeout_ms))
  let session = case event {
    Init(session_id:, ..) -> Session(..session, session_id: Some(session_id))
    _ -> session
  }
  case event {
    TurnResult(..) | Exited(..) -> Ok(#(session, event, list.reverse(seen)))
    _ -> read_turn_loop(session, timeout_ms, [event, ..seen])
  }
}

/// Close claude's stdin so it exits cleanly after the current turn. The
/// caller should keep reading until `Exited`.
pub fn finish(session: Session) -> Nil {
  port_send(session.port, "__EOF__")
}

/// Kill the child outright.
pub fn kill(session: Session) -> Nil {
  port_close(session.port)
}

pub fn parse_event(line: String) -> Event {
  case json.parse(line, event_decoder(line)) {
    Ok(event) -> event
    Error(_) -> Other(line)
  }
}

fn event_decoder(raw: String) -> decode.Decoder(Event) {
  use kind <- decode.field("type", decode.string)
  case kind {
    "system" -> {
      use subtype <- decode.field("subtype", decode.string)
      case subtype {
        "init" -> {
          use session_id <- decode.field("session_id", decode.string)
          decode.success(Init(session_id:, raw:))
        }
        "api_retry" -> {
          use error <- decode.field("error", decode.string)
          use attempt <- decode.field("attempt", decode.int)
          decode.success(ApiRetry(error:, attempt:, raw:))
        }
        _ -> decode.success(Other(raw))
      }
    }
    "assistant" -> decode.success(Assistant(raw))
    "user" -> decode.success(User(raw))
    "rate_limit_event" -> {
      use utilization <- decode.subfield(
        ["rate_limit_info", "unifiedWindows", "five_hour", "utilization"],
        decode.float,
      )
      use resets_at <- decode.subfield(
        ["rate_limit_info", "unifiedWindows", "five_hour", "resetsAt"],
        decode.int,
      )
      decode.success(RateLimit(
        five_hour_utilization: utilization,
        resets_at:,
        raw:,
      ))
    }
    "result" -> {
      use session_id <- decode.field("session_id", decode.string)
      use is_error <- decode.field("is_error", decode.bool)
      use total_cost_usd <- decode.field("total_cost_usd", decode.float)
      use num_turns <- decode.field("num_turns", decode.int)
      use structured_output <- decode.optional_field(
        "structured_output",
        None,
        decode.optional(decode.dynamic),
      )
      decode.success(TurnResult(
        session_id:,
        is_error:,
        total_cost_usd:,
        num_turns:,
        structured_output:,
        raw:,
      ))
    }
    _ -> decode.success(Other(raw))
  }
}

/// Pull the assistant's text out of an `assistant` event, for logs and tests.
pub fn assistant_text(raw: String) -> String {
  let decoder = {
    use blocks <- decode.subfield(
      ["message", "content"],
      decode.list({
        use kind <- decode.field("type", decode.string)
        case kind {
          "text" -> {
            use text <- decode.field("text", decode.string)
            decode.success(text)
          }
          _ -> decode.success("")
        }
      }),
    )
    decode.success(string.join(blocks, ""))
  }
  json.parse(raw, decoder) |> result.unwrap("")
}
