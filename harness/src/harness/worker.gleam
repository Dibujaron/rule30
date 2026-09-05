//// One attempt at one node: a Claude Code session driven turn by turn until
//// the verifier is satisfied or the attempt runs out of road.
////
//// The worker never gets to declare itself done. Its `outcome: "proved"` is
//// a *claim*; `verify.verify` is the adjudication, and a failing verdict
//// goes straight back into the session as the next user turn. That loop —
//// send, read a structured report, verify, send the verdict — is the whole
//// point of holding the session open instead of shelling out to `claude -p`
//// once per attempt.
////
//// Nothing an agent writes is summarised here. The notebook and journal
//// fields of a report are carried out of this module verbatim; only the
//// verifier's own output is ever clipped, and the full text stays in the
//// event log.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/float
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import harness/claude
import harness/config
import harness/dag
import harness/guard
import harness/log
import harness/roster
import harness/verify
import harness/worker/brief
import simplifile

/// What a worker reports at the end of every turn. `outcome` is the worker's
/// claim, not the harness's finding.
pub type Report {
  Report(
    outcome: String,
    estimate: dag.Size,
    notebook: String,
    journal: String,
    posts: List(String),
    summary: String,
  )
}

/// Decode a `Report` out of a turn's `structured_output`.
pub fn report_from_dynamic(dyn: Dynamic) -> Result(Report, String) {
  decode.run(dyn, report_decoder())
  |> result.map_error(string.inspect)
}

fn report_decoder() -> decode.Decoder(Report) {
  use outcome <- decode.field("outcome", decode.string)
  use estimate <- decode.field("estimate", size_decoder())
  use summary <- decode.optional_field("summary", "", decode.string)
  use notebook <- decode.optional_field("notebook", "", decode.string)
  use journal <- decode.optional_field("journal", "", decode.string)
  use posts <- decode.optional_field("posts", [], decode.list(decode.string))
  decode.success(Report(
    outcome:,
    estimate:,
    notebook:,
    journal:,
    posts:,
    summary:,
  ))
}

fn size_decoder() -> decode.Decoder(dag.Size) {
  decode.string
  |> decode.then(fn(s) {
    case dag.size_from_string(s) {
      Ok(size) -> decode.success(size)
      Error(Nil) -> decode.failure(dag.M, "Size")
    }
  })
}

// --- the naming ceremony ------------------------------------------------------

/// Ask a fresh session to name itself for `region` and write the opening
/// paragraph of its notebook. No tools, one turn, and one re-ask if the
/// first name is malformed or already taken.
pub fn name_identity(
  cfg: config.Config,
  roster_: roster.Roster,
  region: String,
  model: String,
  guard_settings: String,
  l: log.Log,
) -> Result(roster.Identity, String) {
  let launch =
    claude.Launch(
      node: cfg.node_exe,
      shim: cfg.shim,
      exe: cfg.claude_exe,
      args: [
        "-p",
        "--input-format",
        "stream-json",
        "--output-format",
        "stream-json",
        "--verbose",
        "--model",
        model,
        "--max-turns",
        "1",
        "--disallowedTools",
        "Bash,Edit,Write,Read,Glob,Grep,Task",
        "--settings",
        guard_settings,
        "--json-schema",
        roster.naming_schema(),
      ],
      env: [],
    )
  let session = claude.start(launch)
  let prompt = roster.naming_prompt(region, roster.region_description(region))
  let outcome = ask_name(session, roster_, prompt, cfg.turn_timeout_ms, l, True)
  shutdown(session, l)
  case outcome {
    Error(reason) -> Error(reason)
    Ok(naming) ->
      Ok(roster.Identity(
        name: naming.name,
        region:,
        created: log.now_iso(),
        naming_reason: naming.reason,
        opening: naming.opening,
      ))
  }
}

fn ask_name(
  session: claude.Session,
  roster_: roster.Roster,
  prompt: String,
  timeout_ms: Int,
  l: log.Log,
  may_retry: Bool,
) -> Result(roster.Naming, String) {
  claude.send(session, prompt)
  case claude.read_turn(session, timeout_ms) {
    Error(Nil) -> Error("naming ceremony: no reply within the turn timeout")
    Ok(#(session, result_event, seen)) -> {
      list.each(seen, fn(e) { log.raw(l, "naming", raw_of(e)) })
      log.raw(l, "naming", raw_of(result_event))
      case naming_of(result_event) {
        Error(reason) -> Error("naming ceremony: " <> reason)
        Ok(naming) ->
          case roster.check_name(roster_, naming.name), may_retry {
            Ok(Nil), _ -> Ok(naming)
            Error(reason), False -> Error("naming ceremony: " <> reason)
            Error(reason), True ->
              ask_name(
                session,
                roster_,
                reason <> " Choose another name and reply with the same JSON.",
                timeout_ms,
                l,
                False,
              )
          }
      }
    }
  }
}

fn naming_of(event: claude.Event) -> Result(roster.Naming, String) {
  case event {
    claude.TurnResult(structured_output: Some(dyn), ..) ->
      roster.naming_from_dynamic(dyn)
    claude.TurnResult(..) -> Error("the turn carried no structured output")
    claude.Exited(status) ->
      Error(
        "the session exited (" <> int.to_string(status) <> ") before replying",
      )
    _ -> Error("unexpected event")
  }
}

// --- the turn loop ------------------------------------------------------------

/// How one attempt ended, before it is turned into a `dag.Attempt`.
type Ending {
  Ending(outcome: dag.Outcome, notes: String, report: Option(Report))
}

/// What the last `result` event said about the session as a whole.
type Tally {
  Tally(session_id: String, cost_usd: Float, turns: Int)
}

/// Everything the turn loop threads through itself. `rounds` counts the
/// times the harness has sent the worker back round — a failed verdict, a
/// missing report, a turn that ended early — and is capped by
/// `cfg.max_verify_rounds`.
type Turn {
  Turn(
    cfg: config.Config,
    node: dag.Node,
    l: log.Log,
    session: claude.Session,
    tally: Tally,
    rounds: Int,
    rate_limited: Bool,
  )
}

/// Run one attempt at `node` on `model`, and return what to record about it
/// alongside the worker's last report.
pub fn attempt(
  cfg: config.Config,
  d: dag.Dag,
  node: dag.Node,
  identity: roster.Identity,
  model: String,
  guard_: guard.Guard,
  l: log.Log,
) -> #(dag.Attempt, Option(Report)) {
  let started = log.now_iso()
  let attempt_n = list.length(node.attempts) + 1
  let notebook = roster.read_notebook(cfg.agents_dir, identity)
  let brief_path =
    write_brief(
      l,
      node,
      attempt_n,
      brief.text(cfg, d, node, identity, notebook),
    )
  let session = claude.start(launch(cfg, model, guard_, brief_path))

  claude.send(session, brief.task_message(node))
  let #(tally, ending) =
    turn_loop(Turn(
      cfg:,
      node:,
      l:,
      session:,
      tally: Tally("", 0.0, 0),
      rounds: 0,
      rate_limited: False,
    ))
  shutdown(session, l)

  let attempt =
    dag.Attempt(
      identity: identity.name,
      session_id: tally.session_id,
      model:,
      started:,
      ended: log.now_iso(),
      outcome: ending.outcome,
      estimate: case ending.report {
        Some(r) -> r.estimate
        None -> node.size
      },
      cost_usd: tally.cost_usd,
      turns: tally.turns,
      notes: ending.notes,
    )
  #(attempt, ending.report)
}

/// The worker session's command line. `--bare` is deliberately absent: it
/// would switch the session to API-key billing, and this run is on a
/// subscription.
fn launch(
  cfg: config.Config,
  model: String,
  guard_: guard.Guard,
  brief_path: String,
) -> claude.Launch {
  claude.Launch(
    node: cfg.node_exe,
    shim: cfg.shim,
    exe: cfg.claude_exe,
    args: [
      "-p",
      "--input-format",
      "stream-json",
      "--output-format",
      "stream-json",
      "--verbose",
      "--model",
      model,
      "--max-turns",
      int.to_string(cfg.max_turns),
      "--max-budget-usd",
      float.to_string(cfg.max_budget_usd),
      "--allowedTools",
      "Read,Edit,Write,Grep,Glob,Bash",
      "--permission-mode",
      "dontAsk",
      "--permission-prompts",
      "none",
      "--settings",
      guard_.settings_path,
      "--append-system-prompt-file",
      brief_path,
      "--json-schema",
      brief.report_schema(),
    ],
    env: [],
  )
}

/// Read one turn and decide what it means. Every event is logged verbatim
/// on the way past.
fn turn_loop(t: Turn) -> #(Tally, Ending) {
  case claude.read_turn(t.session, t.cfg.turn_timeout_ms) {
    Error(Nil) -> {
      claude.kill(t.session)
      #(
        t.tally,
        Ending(
          dag.TimedOut,
          "no turn result within "
            <> int.to_string(t.cfg.turn_timeout_ms)
            <> " ms; session killed",
          None,
        ),
      )
    }
    Ok(#(session, event, seen)) -> {
      list.each(seen, fn(e) { log.raw(t.l, "stream", raw_of(e)) })
      log.raw(t.l, "stream", raw_of(event))
      let t =
        Turn(
          ..t,
          session:,
          rate_limited: t.rate_limited
            || hit_ceiling(seen, t.cfg.rate_limit_ceiling),
        )
      case event {
        claude.Exited(status) -> #(
          t.tally,
          Ending(dag.TimedOut, "exited " <> int.to_string(status), None),
        )
        claude.TurnResult(
          session_id:,
          is_error:,
          total_cost_usd:,
          num_turns:,
          structured_output:,
          raw:,
        ) -> {
          let t = Turn(..t, tally: Tally(session_id, total_cost_usd, num_turns))
          let report =
            structured_output
            |> option.then(fn(dyn) {
              report_from_dynamic(dyn) |> option.from_result
            })
          case t.rate_limited, is_error {
            // Park the attempt rather than losing it: a rate limit is a
            // pause, and the session id is how a later run resumes.
            True, _ -> #(
              t.tally,
              Ending(
                dag.RateLimited,
                "five-hour window at or above the ceiling; resume session "
                  <> session_id,
                report,
              ),
            )
            False, True -> #(
              t.tally,
              Ending(
                dag.BudgetExhausted,
                "the CLI ended the session: " <> clip(raw, 1000),
                report,
              ),
            )
            False, False -> act_on(t, report)
          }
        }
        _ -> turn_loop(t)
      }
    }
  }
}

/// What to do about one turn's report: adjudicate a claim, keep a working
/// session going, or stop.
fn act_on(t: Turn, report: Option(Report)) -> #(Tally, Ending) {
  case report {
    None ->
      nudge(
        t,
        report,
        "Your turn carried no structured report. End every turn with the report the harness asked for.",
        "the worker stopped reporting",
      )
    Some(r) ->
      case r.outcome {
        "proved" -> adjudicate(t, r)
        "abandoned" -> #(t.tally, Ending(dag.GaveUp, r.summary, Some(r)))
        // in_progress: the model ended its turn early, so ask for more.
        _ ->
          nudge(
            t,
            report,
            "Continue.",
            "still in progress when the round budget ran out: " <> r.summary,
          )
      }
  }
}

/// The worker claims a proof. Run the verifier; a failing verdict goes
/// straight back as the next user turn.
fn adjudicate(t: Turn, report: Report) -> #(Tally, Ending) {
  let verdict = verify.verify(t.cfg.repo_root, t.cfg.lake, t.node)
  let text = verify.verdict_text(verdict)
  log.event(t.l, "verify", [
    #("node", json.string(t.node.id)),
    #("verified", json.bool(verify.is_verified(verdict))),
    #("verdict", json.string(text)),
  ])
  case verify.is_verified(verdict) {
    True -> #(t.tally, Ending(dag.Closed, clip(text, 2000), Some(report)))
    False ->
      case t.rounds < t.cfg.max_verify_rounds {
        True -> {
          claude.send(t.session, text <> "\n\nFix the proof and report again.")
          turn_loop(Turn(..t, rounds: t.rounds + 1))
        }
        False -> #(
          t.tally,
          Ending(
            dag.BudgetExhausted,
            "the proof never verified in "
              <> int.to_string(t.cfg.max_verify_rounds)
              <> " rounds. Last verdict:\n"
              <> clip(text, 2000),
            Some(report),
          ),
        )
      }
  }
}

/// Send one more message and go round again, if there are rounds left.
fn nudge(
  t: Turn,
  report: Option(Report),
  message: String,
  exhausted_notes: String,
) -> #(Tally, Ending) {
  case t.rounds < t.cfg.max_verify_rounds {
    True -> {
      claude.send(t.session, message)
      turn_loop(Turn(..t, rounds: t.rounds + 1))
    }
    False -> #(t.tally, Ending(dag.BudgetExhausted, exhausted_notes, report))
  }
}

fn hit_ceiling(events: List(claude.Event), ceiling: Float) -> Bool {
  list.any(events, fn(e) {
    case e {
      claude.RateLimit(five_hour_utilization:, ..) ->
        five_hour_utilization >=. ceiling
      _ -> False
    }
  })
}

/// Close stdin and read until the child exits, killing it if it will not.
fn shutdown(session: claude.Session, l: log.Log) -> Nil {
  claude.finish(session)
  drain(session, l)
}

fn drain(session: claude.Session, l: log.Log) -> Nil {
  case claude.next(session, 30_000) {
    Ok(claude.Exited(_)) -> Nil
    Ok(event) -> {
      log.raw(l, "stream", raw_of(event))
      drain(session, l)
    }
    Error(Nil) -> claude.kill(session)
  }
}

fn write_brief(
  l: log.Log,
  node: dag.Node,
  attempt_n: Int,
  text: String,
) -> String {
  let dir = l.dir <> "/briefs"
  let path = dir <> "/" <> node.id <> "-" <> int.to_string(attempt_n) <> ".md"
  let _ = simplifile.create_directory_all(dir)
  let _ = simplifile.write(path, text)
  path
}

fn raw_of(event: claude.Event) -> String {
  case event {
    claude.Init(raw:, ..)
    | claude.Assistant(raw:)
    | claude.User(raw:)
    | claude.RateLimit(raw:, ..)
    | claude.ApiRetry(raw:, ..)
    | claude.TurnResult(raw:, ..)
    | claude.Other(raw:) -> raw
    claude.Exited(status) ->
      "{\"type\":\"exit\",\"status\":" <> int.to_string(status) <> "}"
  }
}

/// Keep long verifier output out of the DAG. The full text is already in
/// the event log, so nothing is lost.
fn clip(text: String, limit: Int) -> String {
  case string.length(text) > limit {
    True ->
      string.slice(text, 0, limit)
      <> "\n… (clipped; the full text is in events.jsonl)"
    False -> text
  }
}
