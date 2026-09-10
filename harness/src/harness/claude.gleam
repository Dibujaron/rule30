//// One Claude Code session behind an Erlang port.
////
//// The session is `claude -p --input-format stream-json --output-format
//// stream-json`, reached through `shim/claude_shim.mjs` because an Erlang
//// port cannot half-close a child's stdin. The dispatcher sends user
//// messages with `send` and reads newline-delimited JSON events with `next`.
//// The session stays open until `finish` sends the EOF sentinel.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/int
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
  RateLimit(
    five_hour_utilization: Float,
    resets_at: Int,
    status: String,
    raw: String,
  )
  /// `{"type":"system","subtype":"api_retry",...}`
  ApiRetry(error: String, attempt: Int, raw: String)
  /// The end of one turn. `structured_output` is present only when the
  /// session was started with `--json-schema`. `subtype` is the CLI's own
  /// word for how the turn ended — `success`, or when `is_error` is set,
  /// which ceiling ended the session: `error_max_turns` for `--max-turns`,
  /// `error_max_budget_usd` for `--max-budget-usd`. Kept as the raw string
  /// rather than parsed here, because the CLI has more subtypes than the
  /// harness has names for, and a result must decode whatever it says.
  /// `stop_reason` is the CLI's word for why the model stopped, and it is
  /// the field that separates endings `subtype` folds together. A refused
  /// request arrives as `subtype: "success"` with `is_error: true` and
  /// `stop_reason: "refusal"`; a session limit arrives as `subtype:
  /// "success"` with `is_error: true` and `stop_reason: "stop_sequence"`.
  /// Read from the same event the loop already decodes — this is not new
  /// evidence, it is evidence that was one field away and not looked at.
  TurnResult(
    session_id: String,
    subtype: Option(String),
    stop_reason: Option(String),
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

/// A JSON number, whichever way it was written. JSON has one number type
/// and a serialiser is free to write a whole value as `1` rather than `1.0`,
/// so a field that is conceptually a fraction arrives as an integer whenever
/// it lands exactly on one. `decode.float` alone rejects that, and every
/// field here that means "how full is this window" hits it precisely at the
/// full and empty ends.
fn json_number() -> decode.Decoder(Float) {
  decode.one_of(decode.float, [decode.int |> decode.map(int.to_float)])
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
      // Read as a JSON number, not as a float, and optional rather than
      // required — for the same reason `status` below is optional, which was
      // written down here and then not applied to these two.
      //
      // **`decode.float` is blind at both ends of the range and nowhere
      // else.** JSON has one number type and a whole value is serialised
      // bare, so utilization arrives as an integer for exactly two readings —
      // `0` and `1` — because every value in between carries a decimal
      // point. An empty window and a full one are therefore the only two the
      // float decoder cannot read, and a full window is the only reading that
      // must park a run.
      //
      // And `subfield` being required meant the rejection was never a misread
      // field: the whole decode failed, `parse_event` fell back to `Other`,
      // `hit_ceiling` never saw a `RateLimit`, and the attempt ran on to the
      // CLI's error result and was filed `budget_exhausted` against the
      // node's ladder.
      //
      // Measured on 2026-09-10 over the attempt logs, `runs/*/*/events.jsonl`
      // — 166 files, 774 rate-limit events; 803 if the run-root logs are
      // included, which hold none of the integers. Six integers, and the
      // split is the whole story:
      //
      //     u=0  allowed           x4   harmless
      //     u=0  allowed_warning   x1   harmless
      //     u=1  rejected          x1   runs/20260907T210826Z/column_settledConfig_eq-1
      //
      // So the decoder was blind five times where blindness cost nothing and
      // once where it cost an attempt — which is why any ordinary sample of
      // this field makes it look perfect. The `allowed_warning` zero is
      // listed separately rather than folded in with the four on purpose: it
      // is harmless only because `hit_ceiling` tests the `allowed` prefix, so
      // if that test ever narrows, that row stops being harmless and a reader
      // told "the zeros are all allowed" would not know to look.
      //
      // The defaults keep a shape change from costing the signal rather than
      // the field. `status` is the authority in `hit_ceiling` and it now
      // survives a missing `five_hour` block, where before either field going
      // absent took the whole event with it.
      use utilization <- decode.then(decode.optionally_at(
        ["rate_limit_info", "unifiedWindows", "five_hour", "utilization"],
        0.0,
        json_number(),
      ))
      use resets_at <- decode.then(decode.optionally_at(
        ["rate_limit_info", "unifiedWindows", "five_hour", "resetsAt"],
        0,
        decode.int,
      ))
      // Optional, not required: `subfield` here would make a status-less
      // event fail the whole decode and fall back to `Other` in
      // `parse_event`, silently dropping the rate-limit signal altogether —
      // an older CLI, a seven-day-only event, or a shape change would then
      // never park a run at all, worse than misreading it. `""` does not
      // start with `"allowed"`, so a missing status keeps the pre-`status`
      // fail-closed behaviour.
      use status <- decode.then(decode.optionally_at(
        ["rate_limit_info", "status"],
        "",
        decode.string,
      ))
      decode.success(RateLimit(
        five_hour_utilization: utilization,
        resets_at:,
        status:,
        raw:,
      ))
    }
    "result" -> {
      use session_id <- decode.field("session_id", decode.string)
      // Optional, like `structured_output`: a result without a subtype
      // must still be a result, or the turn that ended the session would
      // fall back to `Other` and the loop would wait for one that never
      // comes.
      use subtype <- decode.optional_field(
        "subtype",
        None,
        decode.optional(decode.string),
      )
      use stop_reason <- decode.optional_field(
        "stop_reason",
        None,
        decode.optional(decode.string),
      )
      use is_error <- decode.field("is_error", decode.bool)
      // `json_number` for the same reason as the window's utilization: a
      // free session, or one whose cost rounds to a whole number of dollars,
      // would arrive as a bare integer and take the entire result event down
      // with it — and a result that fails to decode is worse here than
      // anywhere else, because the loop is waiting for exactly this event and
      // would sit until the turn timeout. Never yet observed in `runs/`;
      // fixed with its neighbour rather than left to be found the expensive
      // way.
      use total_cost_usd <- decode.then(decode.optionally_at(
        ["total_cost_usd"],
        0.0,
        json_number(),
      ))
      use num_turns <- decode.field("num_turns", decode.int)
      use structured_output <- decode.optional_field(
        "structured_output",
        None,
        decode.optional(decode.dynamic),
      )
      decode.success(TurnResult(
        session_id:,
        subtype:,
        stop_reason:,
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

/// The `input` of the last `StructuredOutput` tool call in an `assistant`
/// event, or `None` if it made none. A session started with `--json-schema`
/// reports by calling that tool, and the CLI copies the call's input into
/// the turn's `result` as `structured_output` — except when that result
/// ends the session in error (`error_max_budget_usd`, for one), when it
/// carries no `structured_output` at all and the call is the only copy of
/// the report.
/// The refusal category named by a `system` / `model_refusal_no_fallback`
/// event among `events`, if one is there.
///
/// That event carries the only word anyone can act on — `reasoning_extraction`
/// on the 2026-09-08 connector refusal — and it has no variant of its own, so
/// it arrives as `Other` and is read back out of the raw line here. The
/// result event's `stop_reason` is what decides that a refusal happened; this
/// only says what it was called, and a refusal with no such event is still a
/// refusal.
pub fn refusal_category(events: List(Event)) -> Option(String) {
  let decoder = {
    use kind <- decode.field("type", decode.string)
    use subtype <- decode.field("subtype", decode.string)
    case kind, subtype {
      "system", "model_refusal_no_fallback" -> {
        use category <- decode.field("api_refusal_category", decode.string)
        decode.success(Some(category))
      }
      _, _ -> decode.success(None)
    }
  }
  list.fold(events, None, fn(found, event) {
    case found {
      Some(_) -> found
      None ->
        case event {
          Other(raw) ->
            json.parse(raw, decoder) |> result.unwrap(None)
          _ -> None
        }
    }
  })
}

pub fn structured_output_call(raw: String) -> Option(Dynamic) {
  let decoder = {
    use blocks <- decode.subfield(
      ["message", "content"],
      decode.list({
        use kind <- decode.field("type", decode.string)
        case kind {
          "tool_use" -> {
            use name <- decode.field("name", decode.string)
            case name {
              "StructuredOutput" -> {
                use input <- decode.field("input", decode.dynamic)
                decode.success(Some(input))
              }
              _ -> decode.success(None)
            }
          }
          _ -> decode.success(None)
        }
      }),
    )
    decode.success(
      list.fold(blocks, None, fn(last, block) { option.or(block, last) }),
    )
  }
  json.parse(raw, decoder) |> result.unwrap(None)
}
