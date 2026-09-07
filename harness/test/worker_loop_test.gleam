//// The worker's turn loop, driven offline.
////
//// `claude.Launch` takes the node binary and the shim as data, so a
//// scripted stand-in for the shim (`test/fake_shim.mjs`) can play a whole
//// session back at the loop: init, rate limits, results with structured
//// reports, and a CLI that dies mid-conversation. The verifier is injected
//// through `worker.Deps`, so "did the harness adjudicate this claim?" is an
//// observable fact rather than a `lake build`.
////
//// Nothing here spends the subscription or touches the real DAG.

import envoy
import gleam/erlang/process
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import harness/config
import harness/dag
import harness/guard
import harness/log
import harness/roster
import harness/verify
import harness/worker
import simplifile

// --- scripting a session ------------------------------------------------------

/// One scripted session: what the fake CLI says, what the injected verifier
/// finds, and the two ceilings the loop runs under.
type Scenario {
  Scenario(
    name: String,
    script: List(List(String)),
    verdicts: List(verify.Verdict),
    max_verify_rounds: Int,
    turn_timeout_ms: Int,
    ignore_eof: Bool,
  )
}

/// What a scripted session left behind. `eof` is the fake shim's own record
/// that it was told to close and `killed` its record that it was shut down
/// from outside, so an orphaned session is detectable either way.
type Run {
  Run(
    attempt: dag.Attempt,
    report: Option(worker.Report),
    eof: Bool,
    killed: Bool,
    events: String,
    verify_calls: Int,
    /// What the injected annotator was handed: one `<node>\t<statement>`
    /// line per call, so a test can assert both that it ran and what it was
    /// told to write.
    annotations: String,
    elapsed_ms: Int,
  )
}

fn scenario(name: String, script: List(List(String))) -> Scenario {
  Scenario(
    name:,
    script:,
    verdicts: [],
    max_verify_rounds: 4,
    turn_timeout_ms: 20_000,
    ignore_eof: False,
  )
}

fn go(s: Scenario) -> Run {
  let dir = "build/test-runs/worker-loop/" <> s.name
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let script_path = dir <> "/script.json"
  let marker_path = dir <> "/eof"
  let killed_path = dir <> "/killed"
  let calls_path = dir <> "/verify-calls"
  let annotations_path = dir <> "/annotations"
  let assert Ok(_) = simplifile.write(script_path, script_json(s.script))
  envoy.set("HARNESS_FAKE_SCRIPT", script_path)
  envoy.set("HARNESS_FAKE_MARKER", marker_path)
  envoy.set("HARNESS_FAKE_KILLED", killed_path)
  case s.ignore_eof {
    True -> envoy.set("HARNESS_FAKE_IGNORE_EOF", "1")
    False -> envoy.unset("HARNESS_FAKE_IGNORE_EOF")
  }

  let base = base_cfg()
  let cfg =
    config.Config(
      ..base,
      shim: base.repo_root <> "/harness/test/fake_shim.mjs",
      max_verify_rounds: s.max_verify_rounds,
      turn_timeout_ms: s.turn_timeout_ms,
    )
  let assert Ok(l) = log.open(dir, "run")
  let g =
    guard.Guard(port: 0, token: "test", settings_path: dir <> "/settings.json")
  let n = a_node()
  let deps =
    worker.Deps(
      verify: scripted_verifier(calls_path, s.verdicts),
      annotate: fn(node, statement) {
        simplifile.append(
          annotations_path,
          node.id <> "\t" <> statement <> "\n",
        )
        |> result.map_error(simplifile.describe_error)
      },
      task_message: "Prove it.",
    )

  let started = log.mono_ms()
  let #(attempt, report) =
    worker.attempt(cfg, deps, dag.Dag([n]), n, an_identity(), "haiku", g, l)
  Run(
    attempt:,
    report:,
    eof: exists(marker_path),
    // A killed shim writes its marker as it goes down, just after the port
    // was closed — so give it a moment rather than racing it.
    killed: case s.ignore_eof {
      True -> wait_for(killed_path, log.mono_ms() + 3000)
      False -> exists(killed_path)
    },
    events: simplifile.read(l.dir <> "/events.jsonl") |> result.unwrap(""),
    verify_calls: line_count(calls_path),
    annotations: simplifile.read(annotations_path) |> result.unwrap(""),
    elapsed_ms: log.mono_ms() - started,
  )
}

fn base_cfg() -> config.Config {
  let assert Ok(c) = config.load()
  c
}

fn a_node() -> dag.Node {
  dag.Node(
    id: "harness_probe",
    region: "P2",
    lean_name: "harness_probe",
    description: "a node that exists only in this test",
    deps: [],
    status: dag.Claimed,
    size: dag.S,
    proof_file: None,
    attempts: [],
    verified: None,
  )
}

fn an_identity() -> roster.Identity {
  roster.Identity(
    name: "Scripted",
    region: "P2",
    created: "2026-09-05T00:00:00Z",
    naming_reason: "a test never names itself",
    opening: "",
    color: None,
  )
}

/// A verifier that hands back `verdicts` in order and records every call, so
/// a test can assert it was *not* consulted.
fn scripted_verifier(
  calls_path: String,
  verdicts: List(verify.Verdict),
) -> fn(dag.Node) -> verify.Verdict {
  fn(node: dag.Node) {
    let n = line_count(calls_path)
    let _ = simplifile.append(calls_path, node.id <> "\n")
    verdicts
    |> list.drop(n)
    |> list.first
    |> result.unwrap(verify.BuildFailed(
      "the test scripted no verdict for call " <> int.to_string(n + 1),
    ))
  }
}

fn script_json(script: List(List(String))) -> String {
  json.array(script, fn(turn) { json.array(turn, json.string) })
  |> json.to_string
}

fn line_count(path: String) -> Int {
  case simplifile.read(path) {
    Error(_) -> 0
    Ok(text) ->
      text
      |> string.split("\n")
      |> list.filter(fn(line) { line != "" })
      |> list.length
  }
}

fn exists(path: String) -> Bool {
  simplifile.is_file(path) |> result.unwrap(False)
}

/// `exists`, but willing to wait: a marker written by another OS process as
/// it dies may land a few milliseconds after the harness has moved on.
fn wait_for(path: String, deadline: Int) -> Bool {
  case exists(path), log.mono_ms() < deadline {
    True, _ -> True
    False, False -> False
    False, True -> {
      process.sleep(50)
      wait_for(path, deadline)
    }
  }
}

// --- the lines a session is made of -------------------------------------------

fn init_line(session_id: String) -> String {
  json.object([
    #("type", json.string("system")),
    #("subtype", json.string("init")),
    #("session_id", json.string(session_id)),
  ])
  |> json.to_string
}

fn result_line(session_id: String, is_error: Bool, outcome: String) -> String {
  json.object([
    #("type", json.string("result")),
    #("session_id", json.string(session_id)),
    #("is_error", json.bool(is_error)),
    #("total_cost_usd", json.float(0.25)),
    #("num_turns", json.int(3)),
    #(
      "structured_output",
      json.object([
        #("outcome", json.string(outcome)),
        #("estimate", json.string("S")),
        #("summary", json.string("scripted " <> outcome)),
        #("notebook", json.string("")),
        #("journal", json.string("")),
        #("posts", json.array([], json.string)),
      ]),
    ),
  ])
  |> json.to_string
}

fn rate_limit_line(utilization: Float, status: String) -> String {
  json.object([
    #("type", json.string("rate_limit_event")),
    #(
      "rate_limit_info",
      json.object([
        #("status", json.string(status)),
        #(
          "unifiedWindows",
          json.object([
            #(
              "five_hour",
              json.object([
                #("utilization", json.float(utilization)),
                #("resetsAt", json.int(1_757_100_000)),
              ]),
            ),
          ]),
        ),
      ]),
    ),
  ])
  |> json.to_string
}

fn api_retry_line(error: String) -> String {
  json.object([
    #("type", json.string("system")),
    #("subtype", json.string("api_retry")),
    #("error", json.string(error)),
    #("attempt", json.int(1)),
  ])
  |> json.to_string
}

fn naming_result_line(
  session_id: String,
  name: String,
  reason: String,
  opening: String,
  color: String,
  color_reason: String,
) -> String {
  json.object([
    #("type", json.string("result")),
    #("session_id", json.string(session_id)),
    #("is_error", json.bool(False)),
    #("total_cost_usd", json.float(0.01)),
    #("num_turns", json.int(1)),
    #(
      "structured_output",
      json.object([
        #("name", json.string(name)),
        #("reason", json.string(reason)),
        #("opening", json.string(opening)),
        #("color", json.string(color)),
        #("color_reason", json.string(color_reason)),
      ]),
    ),
  ])
  |> json.to_string
}

fn color_result_line(
  session_id: String,
  color: String,
  color_reason: String,
) -> String {
  json.object([
    #("type", json.string("result")),
    #("session_id", json.string(session_id)),
    #("is_error", json.bool(False)),
    #("total_cost_usd", json.float(0.01)),
    #("num_turns", json.int(1)),
    #(
      "structured_output",
      json.object([
        #("color", json.string(color)),
        #("color_reason", json.string(color_reason)),
      ]),
    ),
  ])
  |> json.to_string
}

/// A `Config` whose shim is the fake, scripted to answer with `script`, for
/// the naming and colour ceremonies — same trick as `go`, but for
/// `worker.name_identity` and `worker.choose_color`, which take a `Config`
/// directly rather than going through `worker.attempt`.
fn scripted_ceremony(dir: String, script: List(List(String))) -> config.Config {
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let script_path = dir <> "/script.json"
  let assert Ok(_) = simplifile.write(script_path, script_json(script))
  envoy.set("HARNESS_FAKE_SCRIPT", script_path)
  envoy.set("HARNESS_FAKE_MARKER", dir <> "/eof")
  let base = base_cfg()
  config.Config(..base, shim: base.repo_root <> "/harness/test/fake_shim.mjs")
}

// --- the naming and colour ceremonies -------------------------------------------

pub fn naming_ceremony_stores_the_colour_it_chose_test() {
  let dir = "build/test-runs/worker-loop/naming-colour"
  let cfg =
    scripted_ceremony(dir, [
      [
        init_line("sess-n"),
        naming_result_line(
          "sess-n",
          "Thessaly",
          "a plain of long horizons",
          "I work the edges of the cone.",
          "#7B2D8E",
          "it is the colour of dusk on the boundary",
        ),
      ],
    ])
  let assert Ok(l) = log.open(dir, "run")
  let assert Ok(#(identity, color_reason)) =
    worker.name_identity(
      cfg,
      roster.Roster([]),
      "P1",
      "haiku",
      dir <> "/settings.json",
      l,
    )
  assert identity.name == "Thessaly"
  assert identity.color == Some("#7b2d8e")
  assert color_reason == Some("it is the colour of dusk on the boundary")
}

pub fn colour_ceremony_backfills_a_colour_test() {
  let dir = "build/test-runs/worker-loop/backfill-colour"
  let cfg =
    scripted_ceremony(dir, [
      [
        init_line("sess-c"),
        color_result_line(
          "sess-c",
          "#0F0F0F",
          "it is the colour of a closed proof",
        ),
      ],
    ])
  let assert Ok(l) = log.open(dir, "run")
  let identity =
    roster.Identity(
      name: "Ravel",
      region: "P2",
      created: "2026-09-05T00:00:00Z",
      naming_reason: "test fixture",
      opening: "I count black cells.",
      color: None,
    )
  let assert Some(#(color, reason)) =
    worker.choose_color(cfg, identity, "haiku", dir <> "/settings.json", l)
  assert color == "#0f0f0f"
  assert reason == "it is the colour of a closed proof"
}

// --- (a) a claim is adjudicated, and a failed verdict goes back ----------------

pub fn a_failed_verdict_goes_back_and_the_second_claim_closes_test() {
  let r =
    go(
      Scenario(
        ..scenario("verdict-round-trip", [
          [init_line("sess-a"), result_line("sess-a", False, "proved")],
          [result_line("sess-a", False, "proved")],
        ]),
        verdicts: [
          verify.BuildFailed("unknown identifier 'foo'"),
          verify.Verified(
            ["propext"],
            "Statements.harness_probe : True",
            "'harness_check' depends on axioms",
          ),
        ],
      ),
    )
  assert r.attempt.outcome == dag.Closed
  // Two claims, two adjudications: the worker never closed its own node.
  assert r.verify_calls == 2
  assert r.attempt.session_id == "sess-a"
  assert string.contains(r.attempt.notes, "VERIFIED")
  // The verified claim, and only that one, put the checked statement into
  // the proof note — the failed verdict wrote nothing.
  assert r.annotations == "harness_probe\tStatements.harness_probe : True\n"
  assert string.contains(r.events, "\"annotate\"")
  assert string.contains(r.events, "\"written\":true")
  let assert Some(report) = r.report
  assert report.outcome == "proved"
  assert r.eof
}

// --- (b) the CLI ends the session ---------------------------------------------

pub fn an_errored_result_is_budget_exhausted_and_is_never_verified_test() {
  let r =
    go(
      scenario("cli-error", [
        [init_line("sess-b"), result_line("sess-b", True, "proved")],
      ]),
    )
  assert r.attempt.outcome == dag.BudgetExhausted
  // A session the CLI killed did not prove anything, whatever it claimed.
  assert r.verify_calls == 0
  assert r.eof
}

// --- (c) a rate limit parks the attempt, with its session id -------------------

pub fn a_rate_limit_at_the_ceiling_parks_the_attempt_test() {
  let r =
    go(
      scenario("rate-limit-ceiling", [
        [
          init_line("sess-c"),
          rate_limit_line(0.95, "surpassed_threshold"),
          result_line("sess-c", False, "in_progress"),
        ],
      ]),
    )
  assert r.attempt.outcome == dag.RateLimited
  assert r.attempt.session_id == "sess-c"
  assert string.contains(r.attempt.notes, "sess-c")
  assert r.eof
}

pub fn an_api_retry_for_rate_limit_parks_the_attempt_test() {
  let r =
    go(
      scenario("rate-limit-api-retry", [
        [
          init_line("sess-r"),
          api_retry_line("rate_limit"),
          result_line("sess-r", False, "in_progress"),
        ],
      ]),
    )
  assert r.attempt.outcome == dag.RateLimited
  assert r.attempt.session_id == "sess-r"
  assert r.eof
}

pub fn a_rate_limited_turn_whose_proof_verifies_still_closes_test() {
  let r =
    go(
      Scenario(
        ..scenario("rate-limit-then-proved", [
          [
            init_line("sess-v"),
            api_retry_line("rate_limit"),
            result_line("sess-v", False, "proved"),
          ],
        ]),
        verdicts: [
          verify.Verified(
            ["propext"],
            "Statements.harness_probe : True",
            "depends on axioms: [propext]",
          ),
        ],
      ),
    )
  // A pause is not a reason to throw away a proof that builds: the claim is
  // adjudicated first, and only what did not close is parked.
  assert r.attempt.outcome == dag.Closed
  assert r.verify_calls == 1
  assert string.contains(r.attempt.notes, "VERIFIED")
  // The parked path closes through the same door as the ordinary one, so
  // the note is annotated here too.
  assert r.annotations == "harness_probe\tStatements.harness_probe : True\n"
  assert r.eof
}

pub fn a_rate_limited_turn_whose_proof_fails_is_parked_test() {
  let r =
    go(
      Scenario(
        ..scenario("rate-limit-then-unproved", [
          [
            init_line("sess-w"),
            rate_limit_line(0.97, "surpassed_threshold"),
            result_line("sess-w", False, "proved"),
          ],
        ]),
        verdicts: [verify.BuildFailed("unknown identifier 'foo'")],
      ),
    )
  assert r.attempt.outcome == dag.RateLimited
  assert r.attempt.session_id == "sess-w"
  assert string.contains(r.attempt.notes, "sess-w")
  // A failed verdict annotates nothing: the note only ever carries a
  // statement the check file actually printed for a verified proof.
  assert r.annotations == ""
  // Adjudicated once, and no verdict sent back: the window is throttling
  // us, so another turn would spend it for nothing.
  assert r.verify_calls == 1
  assert r.eof
}

pub fn an_api_retry_for_anything_else_does_not_park_the_attempt_test() {
  let r =
    go(
      Scenario(
        ..scenario("api-retry-overloaded", [
          [
            init_line("sess-o"),
            api_retry_line("overloaded_error"),
            result_line("sess-o", False, "abandoned"),
          ],
        ]),
        verdicts: [],
      ),
    )
  assert r.attempt.outcome == dag.GaveUp
  assert r.eof
}

// --- (d) the CLI dies before saying anything conclusive ------------------------

pub fn an_exit_before_a_result_keeps_the_session_id_from_init_test() {
  let r =
    go(scenario("exit-before-result", [[init_line("sess-d"), "__EXIT__ 0"]]))
  assert r.attempt.outcome == dag.TimedOut
  // The id came from `init`: there was never a result to carry one.
  assert r.attempt.session_id == "sess-d"
  assert string.contains(r.attempt.notes, "exited 0")
  // The child is already gone, so there is nothing left to orphan — and
  // nothing to send `__EOF__` to.
  assert !r.eof
}

pub fn an_exit_after_a_rate_limit_parks_rather_than_times_out_test() {
  let r =
    go(
      scenario("exit-after-rate-limit", [
        [
          init_line("sess-p"),
          rate_limit_line(0.99, "surpassed_threshold"),
          "__EXIT__ 1",
        ],
      ]),
    )
  assert r.attempt.outcome == dag.RateLimited
  assert r.attempt.session_id == "sess-p"
  assert string.contains(r.attempt.notes, "sess-p")
  // The child died on its own, so there was nothing to send `__EOF__` to.
  assert !r.eof
}

// --- (e) the round budget runs out --------------------------------------------

pub fn in_progress_past_the_round_budget_is_budget_exhausted_test() {
  let r =
    go(
      Scenario(
        ..scenario("rounds-exhausted", [
          [init_line("sess-e"), result_line("sess-e", False, "in_progress")],
          [result_line("sess-e", False, "in_progress")],
        ]),
        max_verify_rounds: 1,
      ),
    )
  assert r.attempt.outcome == dag.BudgetExhausted
  assert string.contains(r.attempt.notes, "still in progress")
  assert r.attempt.turns == 3
  assert r.eof
}

// --- a silent turn ------------------------------------------------------------

pub fn a_silent_turn_closes_the_session_before_killing_it_test() {
  let r = go(Scenario(..scenario("silent-turn", [[]]), turn_timeout_ms: 1000))
  assert r.attempt.outcome == dag.TimedOut
  assert string.contains(r.attempt.notes, "session closed, then killed")
  // Closing the port outright kills the shim and orphans `claude.exe` under
  // it, so a timed-out turn is closed politely first — and the shim, given
  // the chance, takes its child down with it.
  assert r.eof
  // Still bounded: the polite close gets seconds, not the full drain budget.
  assert r.elapsed_ms < 15_000
}

pub fn a_session_that_will_not_close_is_killed_test() {
  // The fake ignores `__EOF__`, which is a claude that will not exit. The
  // harness must escalate rather than wait: the shim's own shutdown path
  // (where the real one kills claude's process tree) has to run.
  let r =
    go(
      Scenario(
        ..scenario("silent-turn-unclosable", [[]]),
        turn_timeout_ms: 1000,
        ignore_eof: True,
      ),
    )
  assert r.attempt.outcome == dag.TimedOut
  assert r.eof
  assert r.killed
  assert r.elapsed_ms < 20_000
}

// --- what the harness said ----------------------------------------------------

pub fn every_line_the_harness_sends_is_logged_test() {
  let r =
    go(
      Scenario(
        ..scenario("sent-lines", [
          [init_line("sess-s"), result_line("sess-s", False, "proved")],
          [result_line("sess-s", False, "proved")],
        ]),
        verdicts: [
          verify.BuildFailed("unknown identifier 'foo'"),
          verify.Verified(
            ["propext"],
            "Statements.harness_probe : True",
            "depends on axioms: [propext]",
          ),
        ],
      ),
    )
  assert r.attempt.outcome == dag.Closed
  // The task message and the verdict the harness sent back are both in the
  // log, raw: a transcript missing the harness's half is not a transcript.
  assert string.contains(r.events, "\"kind\":\"sent\"")
  assert string.contains(r.events, "Prove it.")
  assert string.contains(r.events, "Fix the proof and report again.")
}
