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

/// What `attempt` needs from outside itself: the adjudicator for a `proved`
/// claim, and the first user turn. Both are passed in rather than reached
/// for — the verifier because "was this claim actually adjudicated?" is then
/// an observable fact a test can assert, and the task message because a node
/// whose statement cannot be found must fail before a session is ever
/// started.
pub type Deps {
  Deps(verify: fn(dag.Node) -> verify.Verdict, task_message: String)
}

/// The real dependencies: `verify.verify` against this run's repo and lake.
pub fn live_deps(cfg: config.Config, task_message: String) -> Deps {
  Deps(
    verify: fn(node) { verify.verify(cfg.repo_root, cfg.lake, node) },
    task_message:,
  )
}

// --- the naming ceremony ------------------------------------------------------

/// Ask a fresh session to name itself for `region`, write the opening
/// paragraph of its notebook, and choose a colour. No tools, one turn, and
/// one re-ask if the first name is malformed or already taken; the colour
/// gets its own one-shot re-ask, and falls back to no colour at all rather
/// than failing the whole ceremony. The second element of the result is the
/// colour's stated reason, for the caller to fold into the same notebook
/// entry as the naming reason — it is not persisted on the `Identity`
/// itself.
pub fn name_identity(
  cfg: config.Config,
  roster_: roster.Roster,
  region: String,
  model: String,
  guard_settings: String,
  l: log.Log,
) -> Result(#(roster.Identity, Option(String)), String) {
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
        // Six, not one: schema rejections each cost a turn, and a re-ask needs room.
        "--max-turns",
        "6",
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
  let ceremony =
    ask_name(session, roster_, prompt, cfg.turn_timeout_ms, l, True)
  shutdown(session, l, ceremony.gone)
  case ceremony.naming {
    Error(reason) -> Error(reason)
    Ok(naming) -> {
      let color = case roster.valid_color(naming.color) {
        True -> Some(string.lowercase(naming.color))
        False -> None
      }
      let color_reason = case color {
        Some(_) -> Some(naming.color_reason)
        None -> None
      }
      Ok(#(
        roster.Identity(
          name: naming.name,
          region:,
          created: log.now_iso(),
          naming_reason: naming.reason,
          opening: naming.opening,
          color:,
        ),
        color_reason,
      ))
    }
  }
}

/// Send one line to a session, logging it first. Every turn the harness
/// sends — the task, a verdict, a nudge, a ceremony's questions — goes
/// through here, because half a conversation is not a transcript: the log
/// has to answer "what was this agent actually asked?" as well as "what did
/// it say?".
fn say(session: claude.Session, l: log.Log, text: String) -> Nil {
  log.raw(l, "sent", text)
  claude.send(session, text)
}

/// A turn the session is not going to answer. Killing the port outright
/// terminates the Node shim and leaves `claude.exe` running underneath it,
/// so close stdin first and give the shim a few seconds to take its child
/// down with it; `drain` kills if that grace runs out.
fn stop(session: claude.Session, l: log.Log) -> Nil {
  claude.finish(session)
  drain(session, l, log.mono_ms() + stop_budget_ms)
}

const stop_budget_ms = 5000

/// How the ceremony ended. `gone` says the child is already dead, so there
/// is nothing left to close.
type Ceremony {
  Ceremony(naming: Result(roster.Naming, String), gone: Bool)
}

fn ask_name(
  session: claude.Session,
  roster_: roster.Roster,
  prompt: String,
  timeout_ms: Int,
  l: log.Log,
  may_retry: Bool,
) -> Ceremony {
  say(session, l, prompt)
  case claude.read_turn(session, timeout_ms) {
    Error(Nil) -> {
      stop(session, l)
      Ceremony(Error("naming ceremony: no reply within the turn timeout"), True)
    }
    Ok(#(session, result_event, seen)) -> {
      list.each(seen, fn(e) { log.raw(l, "naming", raw_of(e)) })
      log.raw(l, "naming", raw_of(result_event))
      let gone = case result_event {
        claude.Exited(..) -> True
        _ -> False
      }
      case naming_of(result_event) {
        Error(reason) -> Ceremony(Error("naming ceremony: " <> reason), gone)
        Ok(naming) ->
          case roster.check_name(roster_, naming.name), may_retry {
            // The name is settled; the colour gets its own one-shot re-ask.
            // `naming_of` only succeeds off a `TurnResult`, never an
            // `Exited`, so the session is still alive here.
            Ok(Nil), _ -> ask_color(session, naming, timeout_ms, l)
            Error(reason), False ->
              Ceremony(Error("naming ceremony: " <> reason), gone)
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

/// One re-ask for the colour alone, keeping the settled name, reason and
/// opening untouched. Unlike an invalid name, an invalid colour after the
/// re-ask does not fail the ceremony: `naming.color` is simply left as it
/// was, and `name_identity` turns an unparseable one into `color: None`.
fn ask_color(
  session: claude.Session,
  naming: roster.Naming,
  timeout_ms: Int,
  l: log.Log,
) -> Ceremony {
  case roster.valid_color(naming.color) {
    True -> Ceremony(Ok(naming), False)
    False -> {
      say(
        session,
        l,
        "\""
          <> naming.color
          <> "\" is not a colour I can use: it must be written as # followed by six hex digits, like #7b2d8e. Choose another colour and reply with the same JSON.",
      )
      case claude.read_turn(session, timeout_ms) {
        Error(Nil) -> {
          stop(session, l)
          Ceremony(Ok(naming), True)
        }
        Ok(#(_session, result_event, seen)) -> {
          list.each(seen, fn(e) { log.raw(l, "naming", raw_of(e)) })
          log.raw(l, "naming", raw_of(result_event))
          let gone = case result_event {
            claude.Exited(..) -> True
            _ -> False
          }
          case naming_of(result_event) {
            Error(_) -> Ceremony(Ok(naming), gone)
            Ok(retried) ->
              Ceremony(
                Ok(
                  roster.Naming(
                    ..naming,
                    color: retried.color,
                    color_reason: retried.color_reason,
                  ),
                ),
                gone,
              )
          }
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

// --- the backfill colour ceremony ---------------------------------------------

/// For an identity named before colours existed: ask it, on its own, to
/// choose one. Same launch shape as the naming ceremony — no tools, the
/// ladder model, one turn plus one re-ask — but the whole exchange is just
/// the colour. Two bad answers in a row and this gives up quietly: `None`
/// leaves the identity uncoloured rather than failing the dispatch.
pub fn choose_color(
  cfg: config.Config,
  identity: roster.Identity,
  model: String,
  guard_settings: String,
  l: log.Log,
) -> Option(#(String, String)) {
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
        "6",
        "--disallowedTools",
        "Bash,Edit,Write,Read,Glob,Grep,Task",
        "--settings",
        guard_settings,
        "--json-schema",
        roster.color_schema(),
      ],
      env: [],
    )
  let session = claude.start(launch)
  let prompt = roster.color_prompt(identity.name, identity.opening)
  let result = ask_color_only(session, prompt, cfg.turn_timeout_ms, l, True)
  shutdown(session, l, result.gone)
  result.choice
}

/// How the standalone colour ceremony ended: the colour and its stated
/// reason, if one was ever settled on.
type ColorResult {
  ColorResult(choice: Option(#(String, String)), gone: Bool)
}

fn ask_color_only(
  session: claude.Session,
  prompt: String,
  timeout_ms: Int,
  l: log.Log,
  may_retry: Bool,
) -> ColorResult {
  say(session, l, prompt)
  case claude.read_turn(session, timeout_ms) {
    Error(Nil) -> {
      stop(session, l)
      ColorResult(None, True)
    }
    Ok(#(session, result_event, seen)) -> {
      list.each(seen, fn(e) { log.raw(l, "colour", raw_of(e)) })
      log.raw(l, "colour", raw_of(result_event))
      let gone = case result_event {
        claude.Exited(..) -> True
        _ -> False
      }
      case color_choice_of(result_event), may_retry {
        Error(_), True ->
          ask_color_only(
            session,
            "Reply with a JSON object with exactly these two fields, all required: \"color\" (a hex colour that is yours, written #rrggbb) and \"color_reason\" (one sentence on why).",
            timeout_ms,
            l,
            False,
          )
        Error(_), False -> ColorResult(None, gone)
        Ok(choice), _ ->
          case roster.valid_color(choice.color), may_retry {
            True, _ ->
              ColorResult(
                Some(#(string.lowercase(choice.color), choice.color_reason)),
                gone,
              )
            False, False -> ColorResult(None, gone)
            False, True ->
              ask_color_only(
                session,
                "\""
                  <> choice.color
                  <> "\" is not a colour I can use: it must be written as # followed by six hex digits, like #7b2d8e. Choose another colour and reply with the same JSON.",
                timeout_ms,
                l,
                False,
              )
          }
      }
    }
  }
}

fn color_choice_of(event: claude.Event) -> Result(roster.ColorChoice, String) {
  case event {
    claude.TurnResult(structured_output: Some(dyn), ..) ->
      roster.color_choice_from_dynamic(dyn)
    claude.TurnResult(..) -> Error("the turn carried no structured output")
    claude.Exited(status) ->
      Error(
        "the session exited (" <> int.to_string(status) <> ") before replying",
      )
    _ -> Error("unexpected event")
  }
}

// --- the turn loop ------------------------------------------------------------

/// How one attempt ended, before it is turned into a `dag.Attempt`. `gone`
/// says the child is already dead — killed, or exited on its own — so there
/// is no stdin left to close and nothing left to drain.
type Ending {
  Ending(
    outcome: dag.Outcome,
    notes: String,
    report: Option(Report),
    gone: Bool,
  )
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
    deps: Deps,
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
  deps: Deps,
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
  case
    write_brief(
      l,
      node,
      attempt_n,
      brief.text(cfg, d, node, identity, notebook),
    )
  {
    // No brief, no attempt: the brief carries the worker's identity, its
    // constraints and the served list, and a session started without one is
    // a differently-briefed agent pretending to be this one.
    Error(reason) -> #(
      failed_attempt(identity, model, node, started, reason),
      None,
    )
    Ok(brief_path) ->
      run_session(
        cfg,
        deps,
        node,
        identity,
        model,
        guard_,
        l,
        brief_path,
        started,
      )
  }
}

/// An attempt that never got as far as a session.
fn failed_attempt(
  identity: roster.Identity,
  model: String,
  node: dag.Node,
  started: String,
  reason: String,
) -> dag.Attempt {
  dag.Attempt(
    identity: identity.name,
    session_id: "",
    model:,
    started:,
    ended: log.now_iso(),
    outcome: dag.TimedOut,
    estimate: node.size,
    reported: False,
    cost_usd: 0.0,
    turns: 0,
    notes: reason,
  )
}

fn run_session(
  cfg: config.Config,
  deps: Deps,
  node: dag.Node,
  identity: roster.Identity,
  model: String,
  guard_: guard.Guard,
  l: log.Log,
  brief_path: String,
  started: String,
) -> #(dag.Attempt, Option(Report)) {
  let session = claude.start(launch(cfg, model, guard_, brief_path))

  say(session, l, deps.task_message)
  let #(tally, ending) =
    turn_loop(Turn(
      cfg:,
      deps:,
      node:,
      l:,
      session:,
      tally: Tally("", 0.0, 0),
      rounds: 0,
      rate_limited: False,
    ))
  shutdown(session, l, ending.gone)

  let attempt =
    dag.Attempt(
      identity: identity.name,
      session_id: tally.session_id,
      model:,
      started:,
      ended: log.now_iso(),
      outcome: ending.outcome,
      // With no report there is no re-pricing: the node's own size stands
      // in, and `reported` says it is not the worker's estimate, so the
      // scorecard does not score it as calibration.
      estimate: case ending.report {
        Some(r) -> r.estimate
        None -> node.size
      },
      reported: option.is_some(ending.report),
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
      stop(t.session, t.l)
      let tally = with_session_id(t)
      #(
        tally,
        Ending(
          paused_or(t, dag.TimedOut),
          note(
            tally,
            "no turn result within "
              <> int.to_string(t.cfg.turn_timeout_ms)
              <> " ms; session closed, then killed",
          ),
          None,
          True,
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
        claude.Exited(status) -> {
          let tally = with_session_id(t)
          #(
            tally,
            Ending(
              paused_or(t, dag.TimedOut),
              note(tally, "exited " <> int.to_string(status)),
              None,
              True,
            ),
          )
        }
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
            True, _ -> park(t, report)
            False, True -> #(
              t.tally,
              Ending(
                dag.BudgetExhausted,
                "the CLI ended the session: " <> clip(raw, 1000),
                report,
                False,
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
        "abandoned" -> #(t.tally, Ending(dag.GaveUp, r.summary, Some(r), False))
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

/// Park a rate-limited turn — but adjudicate a `proved` claim first. A rate
/// limit is a pause, and a paused attempt costs the node nothing; throwing
/// away a proof that builds because the window happened to throttle the same
/// turn would cost it a whole attempt. Nothing goes back to the worker
/// either way: the window is what it is, and another turn would spend it for
/// nothing.
fn park(t: Turn, report: Option(Report)) -> #(Tally, Ending) {
  let claim = case report {
    Some(r) ->
      case r.outcome {
        "proved" -> Some(r)
        _ -> None
      }
    None -> None
  }
  case claim {
    None -> parked(t, report, "")
    Some(r) -> {
      let #(verdict, text) = judge(t)
      case verify.is_verified(verdict) {
        True -> #(t.tally, Ending(dag.Closed, clip(text, 2000), Some(r), False))
        False ->
          parked(t, report, "; the proof did not verify: " <> clip(text, 1000))
      }
    }
  }
}

fn parked(t: Turn, report: Option(Report), extra: String) -> #(Tally, Ending) {
  #(
    t.tally,
    Ending(
      dag.RateLimited,
      note(t.tally, "the five-hour window is rate limiting" <> extra),
      report,
      False,
    ),
  )
}

/// The worker claims a proof. Run the verifier; a failing verdict goes
/// straight back as the next user turn.
fn adjudicate(t: Turn, report: Report) -> #(Tally, Ending) {
  let #(verdict, text) = judge(t)
  case verify.is_verified(verdict) {
    True -> #(
      t.tally,
      Ending(dag.Closed, clip(text, 2000), Some(report), False),
    )
    False ->
      case t.rounds < t.cfg.max_verify_rounds {
        True -> {
          say(t.session, t.l, text <> "\n\nFix the proof and report again.")
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
            False,
          ),
        )
      }
  }
}

/// Run the verifier on this node and log what it found. The verdict's own
/// text is what goes back to the worker and into the attempt's notes.
fn judge(t: Turn) -> #(verify.Verdict, String) {
  let verdict = t.deps.verify(t.node)
  let text = verify.verdict_text(verdict)
  log.event(t.l, "verify", [
    #("node", json.string(t.node.id)),
    #("verified", json.bool(verify.is_verified(verdict))),
    #("verdict", json.string(text)),
  ])
  #(verdict, text)
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
      say(t.session, t.l, message)
      turn_loop(Turn(..t, rounds: t.rounds + 1))
    }
    False -> #(
      t.tally,
      Ending(dag.BudgetExhausted, exhausted_notes, report, False),
    )
  }
}

/// A rate limit outranks whatever else went wrong: the spec's line is that
/// nothing is lost to a rate limit, it is paused. `RateLimited` puts the
/// node back on the board without burning a rung of its model ladder;
/// `TimedOut` on a rate-limited session would too, but it would lose the
/// reason.
fn paused_or(t: Turn, otherwise: dag.Outcome) -> dag.Outcome {
  case t.rate_limited {
    True -> dag.RateLimited
    False -> otherwise
  }
}

/// The session id a later run resumes from. A turn's `result` carries one,
/// but a session that died before its first result has only what `init`
/// said — which `claude.read_turn` has already put on the session.
fn with_session_id(t: Turn) -> Tally {
  case t.tally.session_id {
    "" -> Tally(..t.tally, session_id: option.unwrap(t.session.session_id, ""))
    _ -> t.tally
  }
}

fn note(tally: Tally, text: String) -> String {
  case tally.session_id {
    "" -> text
    id -> text <> "; resume session " <> id
  }
}

/// The two signals that mean the subscription window is actually closed: a
/// `rate_limit_event` at or above the ceiling whose status is *not* one of
/// the `allowed*` ones, and a `system/api_retry` whose error is
/// `rate_limit`.
///
/// The status is what makes this correct. A `rate_limit_event` at 0.94
/// against a 0.9 ceiling carrying `allowed_warning` is the API saying we
/// are close, not refusing us. Reading that as a refusal parks a finished
/// attempt as `rate_limited`, and a rate-limited attempt stops the run from
/// starting any more — so one misread warning can halt a whole run. It did,
/// on 2026-09-06, to a proof that was already correct.
///
/// Public for its tests: a pure predicate over events, with no state to set
/// up, is worth testing directly rather than through the turn loop.
pub fn hit_ceiling(events: List(claude.Event), ceiling: Float) -> Bool {
  list.any(events, fn(e) {
    case e {
      claude.RateLimit(five_hour_utilization:, status:, ..) ->
        five_hour_utilization >=. ceiling
        && !string.starts_with(status, "allowed")
      claude.ApiRetry(error:, ..) -> error == "rate_limit"
      _ -> False
    }
  })
}

/// Close stdin and read until the child exits, killing it if it will not.
/// A child that is already gone is left alone: sending `__EOF__` to a dead
/// port and then waiting on it is 30 s of nothing.
fn shutdown(session: claude.Session, l: log.Log, gone: Bool) -> Nil {
  case gone {
    True -> Nil
    False -> {
      claude.finish(session)
      drain(session, l, log.mono_ms() + drain_budget_ms)
    }
  }
}

const drain_budget_ms = 30_000

/// Read what is left of the stream until the child exits. The 30 s is the
/// whole drain's budget, not each event's: a chatty shutdown must not be
/// able to extend it indefinitely.
fn drain(session: claude.Session, l: log.Log, deadline: Int) -> Nil {
  case deadline - log.mono_ms() {
    remaining if remaining > 0 ->
      case claude.next(session, remaining) {
        Ok(claude.Exited(_)) -> Nil
        Ok(event) -> {
          log.raw(l, "stream", raw_of(event))
          drain(session, l, deadline)
        }
        Error(Nil) -> claude.kill(session)
      }
    _ -> claude.kill(session)
  }
}

/// Write the brief this attempt's session is started with. A failure here
/// fails the attempt: `--append-system-prompt-file` on a file that is not
/// there would start a session with none of this, and silently.
fn write_brief(
  l: log.Log,
  node: dag.Node,
  attempt_n: Int,
  text: String,
) -> Result(String, String) {
  let dir = l.dir <> "/briefs"
  let path = dir <> "/" <> node.id <> "-" <> int.to_string(attempt_n) <> ".md"
  use _ <- result.try(
    simplifile.create_directory_all(dir)
    |> result.map_error(fn(e) {
      "could not create " <> dir <> ": " <> simplifile.describe_error(e)
    }),
  )
  use _ <- result.try(
    simplifile.write(path, text)
    |> result.map_error(fn(e) {
      "could not write the brief to "
      <> path
      <> ": "
      <> simplifile.describe_error(e)
    }),
  )
  Ok(path)
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
