//// CLI entry point. For now: the v0 spike — a two-turn conversation with
//// `claude -p` over stream-json, proving the port layer works on Windows.

import argv
import envoy
import gleam/int
import gleam/io
import gleam/list
import gleam/option.{None, Some}
import gleam/result
import harness/claude

pub fn main() {
  case argv.load().arguments {
    ["spike"] -> spike()
    _ -> io.println("usage: gleam run -- spike")
  }
}

fn spike() {
  let node =
    envoy.get("HARNESS_NODE")
    |> result.unwrap("C:\\Program Files\\nodejs\\node.exe")
  let exe =
    envoy.get("HARNESS_CLAUDE")
    |> result.unwrap(
      "C:\\Users\\dibuj\\AppData\\Roaming\\npm\\node_modules\\@anthropic-ai\\claude-code\\bin\\claude.exe",
    )
  let shim = "C:\\Users\\dibuj\\dev\\rule30\\harness\\shim\\claude_shim.mjs"
  let launch =
    claude.Launch(
      node:,
      shim:,
      exe:,
      args: [
        "-p",
        "--input-format",
        "stream-json",
        "--output-format",
        "stream-json",
        "--verbose",
        "--model",
        "sonnet",
        "--max-turns",
        "2",
      ],
      env: [],
    )
  let session = claude.start(launch)
  claude.send(session, "Remember the number 42. Reply with just OK.")
  let assert Ok(#(session, r1, seen1)) = claude.read_turn(session, 120_000)
  report("turn 1", r1, seen1)
  claude.send(session, "What number did I ask you to remember? Digits only.")
  let assert Ok(#(session, r2, seen2)) = claude.read_turn(session, 120_000)
  report("turn 2", r2, seen2)
  claude.finish(session)
  let assert Ok(#(_, last, _)) = claude.read_turn(session, 30_000)
  case last {
    claude.Exited(status) -> io.println("exited " <> int.to_string(status))
    _ -> io.println("unexpected: no exit after EOF")
  }
  case session.session_id {
    Some(id) -> io.println("session " <> id)
    None -> io.println("no session id seen")
  }
}

fn report(label: String, result: claude.Event, seen: List(claude.Event)) {
  io.println("== " <> label <> ": " <> int.to_string(list.length(seen)) <> " events")
  list.each(seen, fn(e) {
    case e {
      claude.Assistant(raw) -> io.println("assistant: " <> claude.assistant_text(raw))
      claude.RateLimit(u, _, _) ->
        io.println("rate limit five_hour utilization " <> float_to_string(u))
      claude.Init(id, _) -> io.println("init " <> id)
      claude.ApiRetry(err, n, _) ->
        io.println("api_retry " <> err <> " #" <> int.to_string(n))
      _ -> Nil
    }
  })
  case result {
    claude.TurnResult(session_id:, total_cost_usd:, num_turns:, ..) ->
      io.println(
        "result session="
        <> session_id
        <> " cost="
        <> float_to_string(total_cost_usd)
        <> " turns="
        <> int.to_string(num_turns),
      )
    claude.Exited(s) -> io.println("exited early " <> int.to_string(s))
    _ -> Nil
  }
}

@external(erlang, "erlang", "float_to_binary")
fn float_to_string(f: Float) -> String
