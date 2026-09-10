//// The dispatcher: pick a node, decide who works it and on which model,
//// stand up the guard, run one attempt, and record what happened.
////
//// Everything the harness knows lives in two files it owns — `blueprint/
//// dag.json` and `agents/roster.json` — plus the run's own log directory.
//// A worker writes only its one proof file; the notebook, the journal and
//// the DAG are written here, from the worker's report, verbatim.

import gleam/dynamic/decode
import gleam/erlang/process.{type Pid, type Subject}
import gleam/float
import gleam/int
import gleam/io
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import harness/bugs
import harness/config
import harness/dag
import harness/guard
import harness/guard_event
import harness/index
import harness/lock
import harness/log
import harness/roster
import harness/schedule.{type Plan}
import harness/seed
import harness/stray
import harness/verify
import harness/worker
import harness/worker/brief
import simplifile

/// Dispatch one attempt at one node, end to end. The `Ok` is how the
/// attempt ended, not whether the node closed — `dag.Closed` is the only
/// outcome that means proved.
pub fn prove_one(
  cfg: config.Config,
  node_id: String,
) -> Result(dag.Outcome, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  use node <- result.try(
    dag.get(d, node_id)
    |> result.replace_error("no node `" <> node_id <> "` in " <> cfg.dag_path),
  )
  use _ <- result.try(case dag.is_open_leaf(d, node) {
    True -> Ok(Nil)
    False ->
      Error(
        "`"
        <> node_id
        <> "` is not an open leaf: it is "
        <> dag.status_to_string(node.status)
        <> " and its dependencies are "
        <> dependency_summary(d, node)
        <> case node.status {
          // A claim outlives the run that made it: a dispatcher that
          // crashed mid-attempt leaves its node claimed with nothing left
          // running, and nothing else ever clears it.
          dag.Claimed ->
            " ("
            <> claim_text(cfg, node, log.now_iso())
            <> "). If no attempt is actually running, `gleam run -- reopen "
            <> node_id
            <> "` puts it back on the board."
          _ -> ""
        },
      )
  })
  let failed = failed_attempts(node)
  use model <- result.try(
    config.model_for(node.size, failed, research: node.research)
    |> result.replace_error(
      "ladder exhausted for `"
      <> node_id
      <> "` (size "
      <> dag.size_to_string(node.size)
      <> ", "
      <> int.to_string(failed)
      <> " failed attempts)",
    ),
  )
  // Before anything is started: a node whose statement is not in
  // `Rule30/Statements.lean` has nothing to dispatch a worker about, and
  // finding that out after the guard is up and an identity has been named
  // wastes both.
  use task_message <- result.try(brief.task_message(cfg, node))
  use roster_ <- result.try(roster.load(cfg.roster_path))
  // One run log and one attempt log, the same two `run` opens, rather than
  // a single log at the run root. Three readers assume every attempt lives
  // in `<run>/<name>-<n>/`: `brief.previous_attempt_file`, which otherwise
  // cannot name a proof file this attempt parks, and
  // `.claude/skills/startup/state.sh`, whose `runs/*/*/events.jsonl` glob
  // otherwise cannot see this attempt at all while it is live — which is
  // the one guard against a hand-started session messaging a live prover.
  // The third is state.sh's claim check, which greps `runs/*/events.jsonl`
  // for the `dispatch` event, so that event goes to the run log below and
  // not to the attempt's.
  use run_log <- result.try(log.open(cfg.runs_root, log.new_run_id()))
  use l <- result.try(log.open(
    run_log.dir,
    node_id <> "-" <> int.to_string(list.length(node.attempts) + 1),
  ))
  use lock_actor <- result.try(
    lock.start(240_000)
    |> result.map_error(fn(e) {
      "could not start the build lock: " <> string.inspect(e)
    }),
  )
  // Same gate as `run`, and here for the reason the comment above gives
  // about a missing statement: a node whose name does not resolve is
  // unverifiable by construction, and finding that out after the guard is
  // up and an identity has been named wastes both. It sits below that
  // check rather than beside it because it needs the build lock.
  use _ <- result.try(statement_gate(cfg, lock_actor, node, run_log))

  use g <- result.try(guard.start(
    guard.Rules(
      repo_root: cfg.repo_root,
      role: guard.Prover(
        allowed_write: cfg.repo_root <> "/" <> dag.proof_path(node),
      ),
      holder: node_id,
    ),
    lock_actor,
    l,
    cfg.guard_port,
  ))
  use _ <- result.try(guard.write_settings(g, g.settings_path))

  let who = schedule.who_for_node(roster_, node, busy: [])
  use identity <- result.try(ensure_identity(cfg, roster_, who, model, g, l))
  let attempt_cfg = config.for_attempt(cfg, node)
  io.println(dispatch_line(node_id, identity.name, model, attempt_cfg))
  log.event(run_log, "dispatch", [
    #("node", json.string(node_id)),
    #("identity", json.string(identity.name)),
    #("model", json.string(model)),
    #("reason", json.string(dispatch_reason(d, node, failed))),
    #("max_turns", json.int(attempt_cfg.max_turns)),
    #("max_budget_usd", json.float(attempt_cfg.max_budget_usd)),
    #("log", json.string(l.dir)),
  ])

  let claimed =
    dag.claim(node, by: identity.name, at: log.now_iso(), run: run_log.run_id)
  use d <- result.try(dag.save_node(claimed, cfg.dag_path))

  let #(attempt, report) =
    worker.attempt(
      attempt_cfg,
      worker.live_deps(cfg, task_message),
      d,
      claimed,
      identity,
      model,
      g,
      l,
    )
  let attempt = attribute(l, node_id, attempt)
  use d <- result.try(dag.save_node(record(claimed, attempt), cfg.dag_path))
  // On the attempt log, not the run log where `run` puts its `index` event
  // (see `returned`). Nothing reads either, and one attempt per run makes
  // this the more specific of the two homes; noted so the asymmetry reads
  // as chosen rather than as whichever log was in scope.
  use _ <- result.try(case attempt.outcome {
    dag.Closed -> index_proof(cfg, l, claimed)
    _ -> Ok(Nil)
  })

  let pending =
    write_channels(cfg, run_log, l, identity, claimed, model, attempt, report)
  auto_file_signals(cfg, l, node_id, identity, attempt)
  let parked = case attempt.outcome {
    dag.Closed -> None
    _ -> park_proof_file(cfg, l, claimed)
  }
  let text = summary(d, l, identity, attempt, node_id, parked)
  log.summary(l, text)
  // Load-bearing, not tidiness: `claim_text` decides whether a claim is
  // stale by testing `runs/<claimed_run>/summary.txt`, and the claim above
  // records `run_log.run_id`. Without this line every finished `prove-one`
  // claim reads as "not ended (live, or died without writing)" forever.
  // The run holds exactly one attempt, so its summary is the run's too.
  log.summary(run_log, text)
  io.println(text)
  // Only now, with the attempt's whole record already written — board
  // saved, channels written, signals auto-filed, summary logged and
  // printed: see `run_check`'s doc comment for why this cannot run any
  // earlier.
  case pending {
    None -> Nil
    Some(p) ->
      run_check(fn(path) { seed.check_file_in(cfg.repo_root, path) }, p)
  }
  // `run` sweeps and this did not, which was an omission and not a choice.
  // `prove-one` is the verb a captain reaches for on the node they just
  // seeded and care about, so it dispatches exactly the attempts most
  // likely to park a proof — six such dispatches on 2026-09-09 each went
  // past a chance to fill the cache, and the section stayed `unchecked`
  // afterwards, which reads identically to a sweep that ran and died.
  //
  // Called directly rather than through an `Env`, because `prove_one` has
  // none and builds its live behaviour inline. The suite reaches this line
  // in no test: every `prove_one` case in `dispatch_test` asserts `Error`
  // from validation, far above here.
  sweep_strays(cfg, lock_actor, run_log)
  Ok(attempt.outcome)
}

// --- run: several attempts, up to a few at once ------------------------------

/// What `run` reaches outside itself for, so a test can hand it stand-ins:
/// the verifier (given the run's build lock, since a verification is a
/// `lake build` too and must queue with the workers'), the annotator that
/// writes a verified statement into its proof note, and the proofs-index
/// writer. The last two both write under `Rule30/`, which is why a test
/// must be able to replace them.
///
/// `check_proposals` is `seed.check_file_in` with `repo_root` closed over:
/// path of a `proposals.json` in, the check's report text out. It is
/// injected for the same reason `verifier` is — a test must be able to
/// avoid the real thing — and for one more: the real one can block up to
/// 600s per route claim and 180s per witness, and has its own `let assert`
/// writes (`seed.gleam` ~245, ~537) that panic rather than return `Error`
/// on a checkout with no `.lake`. Nothing here calls it on the scheduler's
/// thread; see `run_check` and `run_with_log`'s closing sweep.
pub type Env {
  Env(
    verifier: fn(Subject(lock.Msg)) -> fn(dag.Node) -> verify.Verdict,
    annotate: fn(dag.Node, String) -> Result(Nil, String),
    index: fn(dag.Node) -> Result(Nil, String),
    check_proposals: fn(String) -> Result(String, String),
    /// Elaborate the unchecked strays once the run is over. Injected for
    /// exactly the reason `check_proposals` is: the real one runs Lean, so
    /// a test that called it would elaborate this checkout's own parked
    /// proofs against whatever `lake` the test config names.
    sweep_strays: fn(Subject(lock.Msg)) -> Nil,
    /// Does this node's seeded statement resolve as
    /// `Statements.<lean_name>`? `Error` refuses the dispatch. Injected for
    /// the same reason as the two above and learned the same way: wired
    /// directly, it ran a real `lake build` inside every fixture run and
    /// took the suite past ten minutes without failing anything.
    statement_gate: fn(Subject(lock.Msg), dag.Node) -> Result(Nil, String),
  )
}

/// What the verifier says when it could not run at all because a sibling
/// worker held the build lock for its whole wait. It is a `BuildFailed` only
/// because that is the verdict that reaches the worker as text; the proof
/// was never built. `attribute` matches this text in the attempt's `verify`
/// events, so a change here must keep the two in step.
pub const lock_held_message = "the build lock was held by another worker for ten minutes"

/// The real thing: `verify.verify` under the build lock, `verify.annotate`
/// outside it — it edits one comment block, and `lake` will re-elaborate
/// that one module on its next build — and `Rule30/Proofs.lean`. `l` is the
/// run's own log: `index` closes over it so a render it triggers reports
/// against the same `events.jsonl` as everything else the run does.
pub fn live_env(cfg: config.Config, l: log.Log) -> Env {
  Env(
    verifier: fn(build_lock: Subject(lock.Msg)) {
      fn(node: dag.Node) {
        let holder = node.id <> " (verifier)"
        case lock.acquire(build_lock, holder, 600_000) {
          True -> {
            let verdict = verify.verify(cfg.repo_root, cfg.lake, node)
            lock.release(build_lock, holder)
            verdict
          }
          False -> verify.BuildFailed(lock_held_message)
        }
      }
    },
    annotate: fn(node, statement) {
      verify.annotate(cfg.repo_root, node, statement)
    },
    index: fn(node) { write_index(cfg, l, node) },
    sweep_strays: fn(build_lock) { sweep_strays(cfg, build_lock, l) },
    statement_gate: fn(build_lock, node) {
      statement_gate(cfg, build_lock, node, l)
    },
    check_proposals: fn(path) { seed.check_file_in(cfg.repo_root, path) },
  )
}

/// Dispatch up to `plan.max_attempts` attempts, keeping up to
/// `plan.concurrency` in flight, until the plan is spent or nothing is left
/// to start. The DAG is a build graph and this is its scheduler: whenever a
/// slot frees up, the best open leaf goes into it — including a leaf that
/// only just became one because a sibling closed its dependency. The `Ok`
/// is the run's closing summary.
pub fn run(cfg: config.Config, plan: Plan) -> Result(String, String) {
  use l <- result.try(log.open(cfg.runs_root, log.new_run_id()))
  run_with_log(cfg, plan, live_env(cfg, l), l)
}

/// `run` with its environment injected.
pub fn run_with(
  cfg: config.Config,
  plan: Plan,
  env: Env,
) -> Result(String, String) {
  use run_log <- result.try(log.open(cfg.runs_root, log.new_run_id()))
  run_with_log(cfg, plan, env, run_log)
}

/// `run_with`, given the run's log already opened — the one thing `run`
/// needs before it, since `live_env`'s index writer closes over it too, and
/// the two must share the same `events.jsonl` rather than each opening its
/// own.
fn run_with_log(
  cfg: config.Config,
  plan: Plan,
  env: Env,
  run_log: log.Log,
) -> Result(String, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  use roster_ <- result.try(roster.load(cfg.roster_path))
  use build_lock <- result.try(
    lock.start(240_000)
    |> result.map_error(fn(e) {
      "could not start the build lock: " <> string.inspect(e)
    }),
  )
  log.event(run_log, "run", [
    #("max_attempts", json.int(plan.max_attempts)),
    #("concurrency", json.int(plan.concurrency)),
  ])
  let done = process.new_subject()
  let selector =
    process.new_selector()
    |> process.select(done)
    |> process.select_monitors(fn(down) {
      case down {
        process.ProcessDown(pid:, reason:, ..) ->
          Crashed(pid, string.inspect(reason))
        process.PortDown(..) -> Noise
      }
    })
  let run_ =
    Run(
      cfg:,
      plan:,
      env:,
      run_log:,
      build_lock:,
      done:,
      selector:,
      verify: env.verifier(build_lock),
    )
  let state =
    RunState(
      d:,
      roster_:,
      running: [],
      dispatched: 0,
      skip: [],
      halted: None,
      finished: [],
      next_port: cfg.guard_port,
      pending_checks: [],
    )
  use state <- result.try(loop(run_, state))
  let text = run_summary(state)
  log.summary(run_log, text)
  io.println(text)
  // Only now, with the run's own record already complete: see
  // `pending_checks`'s doc comment for why this cannot run any earlier.
  // Dispatch order, not `returned`'s newest-first order, since a reader
  // scanning the console has no other order to expect.
  case state.pending_checks {
    [] -> Nil
    pending -> {
      io.println(
        "checking "
        <> int.to_string(list.length(pending))
        <> " proposal file(s) from this run; a proposal with a route or witness can take minutes each",
      )
      list.each(list.reverse(pending), fn(p) {
        run_check(env.check_proposals, p)
      })
    }
  }
  env.sweep_strays(build_lock)
  Ok(text)
}

/// Everything about one `run` that does not change while it runs.
type Run {
  Run(
    cfg: config.Config,
    plan: Plan,
    env: Env,
    run_log: log.Log,
    build_lock: Subject(lock.Msg),
    done: Subject(Done),
    selector: process.Selector(Done),
    verify: fn(dag.Node) -> verify.Verdict,
  )
}

/// One attempt in flight: the process running it, and what the run needs
/// to record it when it comes back.
type InFlight {
  InFlight(
    pid: Pid,
    node_id: String,
    identity: roster.Identity,
    model: String,
    attempt_log: log.Log,
  )
}

/// One attempt that came back, for the closing summary.
type Finished {
  Finished(node_id: String, identity: String, attempt: dag.Attempt)
}

type RunState {
  RunState(
    d: dag.Dag,
    roster_: roster.Roster,
    running: List(InFlight),
    dispatched: Int,
    /// Nodes this run will not start again: an attempt at them crashed, or
    /// their brief could not be written.
    skip: List(String),
    /// Why no further attempt will be started, once there is a reason.
    halted: Option(String),
    finished: List(Finished),
    /// Guard ports are handed out in sequence and never reused within a
    /// run, so a finished attempt's guard — still listening, since nothing
    /// stops it — can never collide with a new one.
    next_port: Int,
    /// Proposals files written by attempts that have already returned,
    /// waiting for `seed.check_file_in` — prepended in `returned`, so this
    /// is newest first. Deliberately not run there: `returned` executes on
    /// the scheduler's own process with sibling attempts still claimed, and
    /// the real checker can block up to 600s per route claim and 180s per
    /// witness per proposal (stalling every other slot for that long) and
    /// panics via its own `let assert` writes on a checkout with no
    /// `.lake` (which would take the whole run down rather than fail one
    /// attempt). `run_with_log` runs these only after `loop` returns and
    /// the run's own record is already written.
    ///
    /// A run whose loop errors or is killed before reaching this sweep
    /// leaves a `proposals.json` with a `proposals` event in its
    /// attempt's log and no `proposals_checked` event: the file sits
    /// inert rather than dangerous, and `gleam run -- seed check
    /// <attempt-dir>/proposals.json` is the manual re-run to finish it.
    pending_checks: List(PendingCheck),
  )
}

/// What the run process waits for.
type Done {
  Returned(node_id: String, attempt: dag.Attempt, report: Option(worker.Report))
  Crashed(pid: Pid, reason: String)
  Noise
}

fn loop(run_: Run, state: RunState) -> Result(RunState, String) {
  use state <- result.try(fill(run_, state))
  case state.running {
    [] -> Ok(state)
    _ -> {
      let msg = process.selector_receive_forever(run_.selector)
      use state <- result.try(handle(run_, state, msg))
      loop(run_, state)
    }
  }
}

/// Start attempts until the plan says stop or nothing is startable.
fn fill(run_: Run, state: RunState) -> Result(RunState, String) {
  let candidate = case state.halted {
    Some(_) -> None
    None ->
      schedule.next_to_start(
        state.d,
        state.roster_,
        run_.plan,
        running: list.length(state.running),
        busy: list.map(state.running, fn(r) { r.identity.name }),
        dispatched: state.dispatched,
        skip: state.skip,
      )
  }
  // The stop file is checked HERE, where the scheduler already decides whether
  // to start another attempt, and nowhere else. That placement is the whole
  // design: attempts already in flight run to completion, and no new one
  // begins. A process kill cannot do that — in run 20260906T230339Z the node
  // the ladder was burning against had already been proved and opus had left a
  // working proof on disk, which a kill would have discarded along with a
  // claimed node and a half-written file.
  //
  // Checked per fill rather than once per run, because the point is to be
  // usable by a captain who has just realised something is wrong DURING a run.
  // See `a-run-cannot-be-stopped-once-a-defect-in-it-is-known`.
  case candidate {
    None -> Ok(state)
    Some(schedule.Assignment(node:, who:)) ->
      case stop_requested(run_.cfg.stop_path) {
        // Recorded as `halted`, reusing the mechanism a rate limit already
        // uses, rather than as a quiet `Ok(state)`. That is not tidiness: it
        // is what puts the reason in the run's closing summary AND in its
        // events. A run that started nothing and a run that was STOPPED
        // produce an identical summary otherwise — "nothing happened" reading
        // the same as "something was prevented" is this project's most
        // expensive shape, and it would be absurd to reintroduce it in the
        // feature built to end a run that had gone wrong.
        //
        // The declined node is named, so the record says what the stop cost.
        True -> {
          let reason =
            "stopped by "
            <> run_.cfg.stop_path
            <> "; declined to start "
            <> node.id
          log.event(run_.run_log, "stopped", [
            #("reason", json.string(reason)),
            #("declined", json.string(node.id)),
          ])
          Ok(RunState(..state, halted: Some(reason)))
        }
        False -> {
          use state <- result.try(start(run_, state, node, who))
          fill(run_, state)
        }
      }
  }
}

/// Has a captain asked this run to stop? `stop_path` is `config.stop_path`:
/// `STOP` at the repository root for a real run, and the only path the
/// dispatcher ever checks, so a fixture that points it elsewhere cannot be
/// stopped by — or stop — a run at the root.
///
/// Deliberately a file rather than a signal or an interruptible dispatcher.
/// A file needs no process to be reachable, survives the session that wrote
/// it, works when a permission classifier refuses a kill — which is what
/// happened — and is removable by the same person who wrote it. It is the
/// "derive it from outside the process" half of CLAUDE.md's rule about state
/// surviving a session that dies without warning.
pub fn stop_requested(stop_path: String) -> Bool {
  case simplifile.is_file(stop_path) {
    Ok(True) -> True
    _ -> False
  }
}

/// Stand up one attempt at `node` in its own process: its own guard on the
/// next port, its own log directory under the run's, the identity the
/// scheduler assigned (named or coloured first, inline, if it has to be),
/// and the node claimed in the DAG before the worker is launched.
fn start(
  run_: Run,
  state: RunState,
  node: dag.Node,
  who: schedule.Who,
) -> Result(RunState, String) {
  let cfg = run_.cfg
  let failed = failed_attempts(node)
  use model <- result.try(
    config.model_for(node.size, failed, research: node.research)
    |> result.replace_error(
      "no model for `"
      <> node.id
      <> "` (size "
      <> dag.size_to_string(node.size)
      <> ", "
      <> int.to_string(failed)
      <> " failed attempt(s)): its ladder is empty or exhausted, and the "
      <> "scheduler should never have offered a node in this state",
    ),
  )
  // A statement that does not resolve is no statement as far as the
  // verifier is concerned, so it takes the same exit as one that is missing.
  let gated = case run_.env.statement_gate(run_.build_lock, node) {
    Error(reason) -> Error(reason)
    Ok(Nil) -> brief.task_message(cfg, node)
  }
  case gated {
    // No statement, no attempt — but not the run's end either: skip the
    // node and let the loop find another.
    Error(reason) -> {
      log.event(run_.run_log, "skip", [
        #("node", json.string(node.id)),
        #("reason", json.string(reason)),
      ])
      io.println_error(
        "harness/dispatch: skipping " <> node.id <> ": " <> reason,
      )
      Ok(RunState(..state, skip: [node.id, ..state.skip]))
    }
    Ok(task_message) -> {
      let attempt_n = list.length(node.attempts) + 1
      use attempt_log <- result.try(log.open(
        run_.run_log.dir,
        node.id <> "-" <> int.to_string(attempt_n),
      ))
      let port = state.next_port
      use g <- result.try(guard.start(
        guard.Rules(
          repo_root: cfg.repo_root,
          role: guard.Prover(
            allowed_write: cfg.repo_root <> "/" <> dag.proof_path(node),
          ),
          holder: node.id,
        ),
        run_.build_lock,
        attempt_log,
        port,
      ))
      use _ <- result.try(guard.write_settings(g, g.settings_path))
      use identity <- result.try(ensure_identity(
        cfg,
        state.roster_,
        who,
        model,
        g,
        attempt_log,
      ))
      // A ceremony may have written the roster; read it back so the next
      // attempt in this run sees the name and colour.
      use roster_ <- result.try(roster.load(cfg.roster_path))
      // The budget is the attempt's, not the run's: a research attempt at
      // the top rung runs under the research ceilings and every other
      // attempt under the ordinary ones. Recorded here so the event says
      // what the attempt was allowed, not only what it was asked.
      let attempt_cfg = config.for_attempt(cfg, node)
      io.println(dispatch_line(node.id, identity.name, model, attempt_cfg))
      log.event(run_.run_log, "dispatch", [
        #("node", json.string(node.id)),
        #("identity", json.string(identity.name)),
        #("model", json.string(model)),
        #("reason", json.string(dispatch_reason(state.d, node, failed))),
        #("max_turns", json.int(attempt_cfg.max_turns)),
        #("max_budget_usd", json.float(attempt_cfg.max_budget_usd)),
        #("port", json.int(port)),
        #("log", json.string(attempt_log.dir)),
        #("in_flight", json.int(list.length(state.running) + 1)),
      ])
      let claimed =
        dag.claim(
          node,
          by: identity.name,
          at: log.now_iso(),
          run: run_.run_log.run_id,
        )
      use d <- result.try(dag.save_node(claimed, cfg.dag_path))
      let deps =
        worker.Deps(
          verify: run_.verify,
          annotate: run_.env.annotate,
          task_message:,
        )
      let done = run_.done
      let pid =
        process.spawn_unlinked(fn() {
          let #(attempt, report) =
            worker.attempt(
              attempt_cfg,
              deps,
              d,
              claimed,
              identity,
              model,
              g,
              attempt_log,
            )
          process.send(done, Returned(claimed.id, attempt, report))
        })
      let _monitor = process.monitor(pid)
      Ok(
        RunState(
          ..state,
          d:,
          roster_:,
          running: [
            InFlight(pid:, node_id: node.id, identity:, model:, attempt_log:),
            ..state.running
          ],
          dispatched: state.dispatched + 1,
          next_port: port + 1,
        ),
      )
    }
  }
}

fn handle(run_: Run, state: RunState, msg: Done) -> Result(RunState, String) {
  case msg {
    Noise -> Ok(state)
    Returned(node_id:, attempt:, report:) ->
      case list.find(state.running, fn(f) { f.node_id == node_id }) {
        Error(Nil) -> Ok(state)
        Ok(flight) -> returned(run_, state, flight, attempt, report)
      }
    Crashed(pid:, reason:) ->
      // A normal exit after `Returned` also arrives here, for a process
      // that is no longer in flight; only a process that died without
      // reporting is a crash.
      case list.find(state.running, fn(f) { f.pid == pid }) {
        Error(Nil) -> Ok(state)
        Ok(flight) -> crashed(run_, state, flight, reason)
      }
  }
}

/// Fold a returned attempt into the DAG, index a closed proof, write the
/// worker's three channels, and free its slot.
fn returned(
  run_: Run,
  state: RunState,
  flight: InFlight,
  attempt: dag.Attempt,
  report: Option(worker.Report),
) -> Result(RunState, String) {
  let cfg = run_.cfg
  use node <- result.try(
    dag.get(state.d, flight.node_id)
    |> result.replace_error("`" <> flight.node_id <> "` vanished from the DAG"),
  )
  let attempt = attribute(flight.attempt_log, node.id, attempt)
  let recorded = record(node, attempt)
  use d <- result.try(dag.save_node(recorded, cfg.dag_path))
  case attempt.outcome {
    dag.Closed -> {
      log.event(run_.run_log, "index", [
        #("node", json.string(node.id)),
        #("module", json.string(dag.proof_module(node))),
        #("file", json.string(proofs_index)),
      ])
      case run_.env.index(recorded) {
        Ok(Nil) -> Nil
        Error(reason) -> io.println_error("harness/dispatch: " <> reason)
      }
    }
    _ -> Nil
  }
  let pending =
    write_channels(
      cfg,
      run_.run_log,
      flight.attempt_log,
      flight.identity,
      node,
      flight.model,
      attempt,
      report,
    )
  auto_file_signals(cfg, flight.attempt_log, node.id, flight.identity, attempt)
  let parked = case attempt.outcome {
    dag.Closed -> None
    _ -> park_proof_file(cfg, flight.attempt_log, node)
  }
  log.summary(
    flight.attempt_log,
    summary(d, flight.attempt_log, flight.identity, attempt, node.id, parked),
  )
  let halted = case attempt.outcome, state.halted {
    dag.RateLimited, None ->
      Some("rate limit reached at " <> node.id <> "; nothing more was started")
    _, halted -> halted
  }
  Ok(
    RunState(
      ..state,
      d:,
      running: list.filter(state.running, fn(f) { f.node_id != node.id }),
      halted:,
      finished: [
        Finished(node.id, flight.identity.name, attempt),
        ..state.finished
      ],
      pending_checks: case pending {
        None -> state.pending_checks
        Some(p) -> [p, ..state.pending_checks]
      },
    ),
  )
}

/// An attempt's process died without reporting. Put the node back on the
/// board — with no attempt recorded, since nothing is known about it — and
/// do not start it again in this run.
fn crashed(
  run_: Run,
  state: RunState,
  flight: InFlight,
  reason: String,
) -> Result(RunState, String) {
  use node <- result.try(
    dag.get(state.d, flight.node_id)
    |> result.replace_error("`" <> flight.node_id <> "` vanished from the DAG"),
  )
  use d <- result.try(dag.save_node(dag.release(node, dag.Open), run_.cfg.dag_path))
  log.event(run_.run_log, "crashed", [
    #("node", json.string(node.id)),
    #("reason", json.string(reason)),
  ])
  let _ = park_proof_file(run_.cfg, flight.attempt_log, node)
  io.println_error(
    "harness/dispatch: the attempt at "
    <> node.id
    <> " crashed and the node is open again: "
    <> reason,
  )
  Ok(
    RunState(
      ..state,
      d:,
      running: list.filter(state.running, fn(f) { f.node_id != node.id }),
      skip: [node.id, ..state.skip],
    ),
  )
}

/// The tail of a status row: which models have failed at this node, which
/// attempts the harness broke, and which models refused it, e.g. `
/// failed=haiku,sonnet harness=opus refused=fable`. Empty when there is
/// nothing to say. `attempts=3` alone reads as three verdicts on the node;
/// with the rungs beside it a reader can see that two of them were the
/// ladder's cheap probes and discount them by eye.
///
/// `refused=` earns its place by naming the one fact a refusal makes
/// actionable: WHICH model refused. A refusal is a property of the model
/// against this brief rather than of the brief or the node — the same
/// connector brief refused on fable and ran on opus minutes later on
/// 2026-09-08 — so a role whose default model refuses looks exactly like a
/// broken brief until someone pays to try another one. Without this the
/// attempt appears in neither `failed=` nor `harness=`, because it spends no
/// rung and the harness did not break it, and so leaves no trace on the row
/// at all.
pub fn rungs_tried(n: dag.Node) -> String {
  let models = fn(label: String, keep: fn(dag.Outcome) -> Bool) {
    case
      list.filter_map(n.attempts, fn(a) {
        case keep(a.outcome) {
          True -> Ok(a.model)
          False -> Error(Nil)
        }
      })
    {
      [] -> ""
      ms -> " " <> label <> "=" <> string.join(ms, ",")
    }
  }
  models("failed", burns_a_rung)
  <> models("harness", fn(o) { o == dag.HarnessFailed })
  <> models("refused", fn(o) { o == dag.Refused })
}

fn run_summary(state: RunState) -> String {
  let finished = list.reverse(state.finished)
  let rows =
    finished
    |> list.map(fn(f) {
      string.pad_end(f.node_id, 34, " ")
      <> string.pad_end(f.identity, 9, " ")
      <> string.pad_end(f.attempt.model, 8, " ")
      <> string.pad_end(dag.outcome_to_string(f.attempt.outcome), 18, " ")
      <> "$"
      <> string.pad_end(roster.usd(f.attempt.cost_usd), 7, " ")
      <> int.to_string(f.attempt.turns)
      <> " turns"
    })
  let closed = list.count(finished, fn(f) { f.attempt.outcome == dag.Closed })
  let cost = list.fold(finished, 0.0, fn(acc, f) { acc +. f.attempt.cost_usd })
  string.join(
    list.flatten([
      [""],
      rows,
      [
        "",
        int.to_string(list.length(finished))
          <> " attempt(s), "
          <> int.to_string(closed)
          <> " closed, $"
          <> roster.usd(cost)
          <> " in all",
      ],
      case state.halted {
        Some(reason) -> ["halted: " <> reason]
        None -> []
      },
      case state.skip {
        [] -> []
        skipped -> ["skipped: " <> string.join(list.reverse(skipped), ", ")]
      },
    ]),
    "\n",
  )
}

// --- indexing a closed proof: the Proofs.lean import and the theorem index --

/// Where the import list of every closed proof lives, relative to the repo
/// root. `Rule30.lean` imports it, so `lake build` from the root builds the
/// proofs; nothing else does.
pub const proofs_index = "Rule30/Proofs.lean"

/// Add a closed node's module to `Rule30/Proofs.lean`, so the next root
/// `lake build` compiles it, and re-render `blueprint/index.md` from the
/// board. A proof nothing imports is a proof nobody notices has rotted; an
/// index nobody re-renders is one nobody notices has drifted.
fn index_proof(
  cfg: config.Config,
  l: log.Log,
  node: dag.Node,
) -> Result(Nil, String) {
  log.event(l, "index", [
    #("node", json.string(node.id)),
    #("module", json.string(dag.proof_module(node))),
    #("file", json.string(proofs_index)),
  ])
  write_index(cfg, l, node)
}

/// The write behind `index_proof`, without its event: the `import` line into
/// `Rule30/Proofs.lean`, then `blueprint/index.md` re-rendered from the
/// board so the two indexes are always written by the same step. The import
/// is the caller's failure — it means the next `lake build` will not see the
/// proof, so it is returned as `Error` exactly as before. The render is a
/// derived artifact, not a record of what happened: a failure to read
/// `Statements.lean`, load the board, or write the file is printed to
/// stderr and recorded as its own `theorem_index` event on `l` — `outcome`
/// `"written"` or `"failed"`, the latter carrying `reason` — but never
/// propagated, so it can never suppress the attempt's own record
/// (`write_channels`, `auto_file_signals`, the summary, the printed
/// outcome) for a node that was in fact proved and imported. The next
/// landing, or a `gleam run -- index` by hand, re-renders it.
fn write_index(
  cfg: config.Config,
  l: log.Log,
  node: dag.Node,
) -> Result(Nil, String) {
  let path = cfg.repo_root <> "/" <> proofs_index
  let existing = simplifile.read(path) |> result.unwrap("")
  let updated = with_import(existing, dag.proof_module(node))
  use _ <- result.try(
    simplifile.write(path, updated)
    |> result.map_error(fn(e) {
      "could not add "
      <> dag.proof_module(node)
      <> " to "
      <> path
      <> ": "
      <> simplifile.describe_error(e)
    }),
  )
  case index.write(cfg) {
    Ok(_) ->
      log.event(l, "theorem_index", [
        #("node", json.string(node.id)),
        #("file", json.string(index.index_path)),
        #("outcome", json.string("written")),
      ])
    Error(reason) -> {
      io.println_error("harness/dispatch: " <> reason)
      log.event(l, "theorem_index", [
        #("node", json.string(node.id)),
        #("file", json.string(index.index_path)),
        #("outcome", json.string("failed")),
        #("reason", json.string(reason)),
      ])
    }
  }
  Ok(Nil)
}

/// `existing` with `import <module>` present exactly once, the imports
/// sorted, and everything above the first of them — the file's header
/// comment — left exactly as it was. Idempotent: re-closing a node does not
/// add the line twice. The file is header-then-imports and nothing else, so
/// this does not have to think about code below the import block.
pub fn with_import(existing: String, module: String) -> String {
  let lines = string.split(existing, "\n")
  let is_import = fn(line) { string.starts_with(line, "import ") }
  let header =
    lines
    |> list.take_while(fn(line) { !is_import(line) })
    |> drop_trailing_blanks
  let imports =
    ["import " <> module, ..list.filter(lines, is_import)]
    |> list.unique
    |> list.sort(string.compare)
  string.join(list.append(header, imports), "\n") <> "\n"
}

fn drop_trailing_blanks(lines: List(String)) -> List(String) {
  lines
  |> list.reverse
  |> list.drop_while(fn(line) { string.trim(line) == "" })
  |> list.reverse
}

// --- reopening ----------------------------------------------------------------

/// Put a `Claimed` node back on the board. A crashed or killed dispatcher
/// leaves its node claimed forever — `prove_one` refuses a claimed node, and
/// nothing else ever clears the status — so this is the manual undo. Only
/// `Claimed` is reopened: an `Abandoned` node is a decision, and a `Proved`
/// one has a proof.
pub fn reopen(cfg: config.Config, node_id: String) -> Result(String, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  use node <- result.try(
    dag.get(d, node_id)
    |> result.replace_error("no node `" <> node_id <> "` in " <> cfg.dag_path),
  )
  case node.status {
    dag.Claimed -> {
      let held = claim_text(cfg, node, log.now_iso())
      let reopened = dag.release(node, dag.Open)
      use _ <- result.try(dag.save_node(reopened, cfg.dag_path))
      // The DAG is the source of truth, so a hand edit to it is an event
      // with a reason, like every dispatch decision — and this one names
      // the claim it discarded, since the node no longer does.
      use l <- result.try(log.open(cfg.runs_root, log.new_run_id()))
      log.event(l, "reopen", [
        #("node", json.string(node_id)),
        #("from", json.string(dag.status_to_string(node.status))),
        #("to", json.string(dag.status_to_string(dag.Open))),
        #("attempts", json.int(list.length(node.attempts))),
        #("claimed_by", json.nullable(node.claimed_by, json.string)),
        #("claimed_at", json.nullable(node.claimed_at, json.string)),
        #("claimed_run", json.nullable(node.claimed_run, json.string)),
        #(
          "reason",
          json.string(
            "asked for by hand: a claim outlives the run that made it",
          ),
        ),
      ])
      Ok(
        "`"
        <> node_id
        <> "` was "
        <> held
        <> ", with "
        <> int.to_string(list.length(node.attempts))
        <> " attempt(s) recorded, and is now open with that claim cleared. "
        <> "A claim outlives the run that made it, so this is how a crashed "
        <> "attempt gets its node back.",
      )
    }
    other ->
      Error(
        "`"
        <> node_id
        <> "` is "
        <> dag.status_to_string(other)
        <> ", not claimed; only a claimed node can be reopened",
      )
  }
}

/// A claimed node's claim, for a human: who holds it, since when and how
/// long ago, which run, and the one liveness fact readable from outside the
/// process — whether that run has already written its closing summary.
/// `runs/<run>/summary.txt` present means the run ended and the claim is
/// stale for certain; absent means the run is live or died without writing,
/// and the age is the only clue. A node claimed before claims had a record
/// says so rather than inventing one.
///
/// Public for `status`, `reopen` and the `prove_one` refusal, which all say
/// the same thing about the same claim.
pub fn claim_text(cfg: config.Config, node: dag.Node, now: String) -> String {
  case node.claimed_by, node.claimed_at, node.claimed_run {
    None, None, None -> "claimed, with no holder, time or run recorded"
    by, at, run -> {
      let at = option.unwrap(at, "?")
      let ended = case run {
        Some(id) ->
          case
            simplifile.is_file(cfg.runs_root <> "/" <> id <> "/summary.txt")
          {
            Ok(True) -> ", which has ended: this claim is stale"
            _ -> ", not ended (live, or died without writing)"
          }
        None -> ""
      }
      "held by "
      <> option.unwrap(by, "?")
      <> " since "
      <> at
      <> " ("
      <> log.age_text(then: at, now:)
      <> "), run "
      <> option.unwrap(run, "?")
      <> ended
    }
  }
}

/// Every node, then the open leaves in the order the dispatcher would take
/// them (`schedule.startable`: research nodes last).
///
/// A wall node whose dependencies are all proved is an open leaf by the
/// DAG's own definition — `dag.open_leaves` correctly lists it — but the
/// scheduler (`schedule.next_to_start`) will never offer one: `wall` means
/// "do not attempt without decomposing first", so `config.model_for` gives
/// it no model to dispatch with. Listing it under "Open leaves, in dispatch
/// order" would tell a human it is about to be picked up, which is false,
/// so it gets its own section instead.
///
/// A research node is marked `research` after its size, in the rows and in
/// the leaf list: a reader should see that its attempts will not end with
/// the ladder.
pub fn status(cfg: config.Config) -> Result(String, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  let now = log.now_iso()
  // Pad to the longest id actually present (with a little gutter), not a
  // constant: a constant narrower than some id fuses that id into the
  // column that follows it.
  let id_width =
    int.max(
      34,
      2
        + list.fold(d.nodes, 0, fn(acc, n) { int.max(acc, string.length(n.id)) }),
    )
  let rows =
    d.nodes
    |> list.map(fn(n) {
      string.pad_end(n.id, id_width, " ")
      <> string.pad_end(dag.status_to_string(n.status), 10, " ")
      <> string.pad_end(size_text(n), 15, " ")
      <> string.pad_end(n.region, 5, " ")
      <> "attempts="
      <> int.to_string(list.length(n.attempts))
      <> rungs_tried(n)
      <> case n.status {
        dag.Claimed -> "  " <> claim_text(cfg, n, now)
        _ -> ""
      }
    })
  let leaf_line = fn(n: dag.Node, name_next: Bool) {
    "  "
    <> n.id
    <> " — unblocks "
    <> int.to_string(dag.unblocks(d, n.id))
    <> ", size "
    <> size_text(n)
    <> case name_next {
      True -> next_attempt_text(cfg, n)
      False -> ""
    }
  }
  let walled = dag.open_leaves(d) |> list.filter(fn(n) { n.size == dag.Wall })
  let startable = schedule.startable(d)
  // A wall has an empty ladder, so `config.model_for` has no model to name
  // and the line must not invent one; the section already says the
  // scheduler will not offer these.
  let walled_lines = case walled {
    [] -> ["  (none)"]
    ws -> list.map(ws, fn(n) { leaf_line(n, False) })
  }
  let startable_lines = case startable {
    [] -> ["  (none)"]
    ss -> list.map(ss, fn(n) { leaf_line(n, True) })
  }
  Ok(
    string.join(rows, "\n")
    <> "\n\nWalled leaves, ready but never dispatched (deps are proved, but "
    <> "`wall` means decompose before attempting — the scheduler will not "
    <> "offer these):\n"
    <> string.join(walled_lines, "\n")
    <> "\n\nOpen leaves, in dispatch order:\n"
    <> string.join(startable_lines, "\n")
    <> "\n\n"
    <> stray_section(cfg),
  )
}

/// Refuse to dispatch at a node whose seeded statement does not resolve as
/// `Statements.<lean_name>`.
///
/// Every attempt at such a node is unverifiable by construction: the check
/// the harness generates is `type_of% @Statements.<lean_name>`, so a
/// correct proof is rejected and the failure reads as node difficulty. On
/// 2026-09-08 three statements were appended below `end Statements`, three
/// workers were dispatched, $5.02 was spent, and all three independently
/// reported that their proofs were right and the fault was beyond their
/// reach. It was.
///
/// **Pre-dispatch and not at seeding time, which is where the row asked for
/// it.** The seeder never writes `Rule30/Statements.lean` — it proposes,
/// and a captain lands by hand (`seed.gleam`'s Proposal doc, and the
/// seeder's own guard forbids that file). So at `seed check` time the name
/// is not in the statements file at all and there is nothing to resolve;
/// worse, the hand landing is exactly what produced the worked instance. A
/// gate here catches a bad name whoever wrote it.
///
/// Under the build lock, because it runs `lake` and a sibling worker may be
/// verifying. Costs one no-op `lake build` and one elaboration per dispatch
/// — seconds against an attempt that costs dollars and minutes.
fn statement_gate(
  cfg: config.Config,
  build_lock: Subject(lock.Msg),
  node: dag.Node,
  l: log.Log,
) -> Result(Nil, String) {
  let holder = node.id <> " (statement gate)"
  case lock.acquire(build_lock, holder, 600_000) {
    False -> {
      // Not a refusal: the gate could not run, and a node is not condemned
      // for that. The attempt proceeds and the verifier will still catch an
      // unresolvable name, at the cost this gate exists to avoid.
      //
      // **Said out loud, in both places, and that is the point of this
      // branch existing separately at all.** A gate that fails open
      // silently is absent exactly when the build lock is busiest — during
      // a concurrent run, which is when dispatch happens — and the record
      // afterwards shows an ordinary attempt. "Could not check" must not
      // read as "checked and clean": that is a state that looks like
      // success and is not, which is this project's most repeated defect.
      log.event(l, "statement_gate", [
        #("node", json.string(node.id)),
        #("result", json.string("not checked: the build lock was held")),
      ])
      io.println_error(
        "harness/dispatch: "
        <> node.id
        <> ": the statement gate did NOT run (the build lock was held for "
        <> "ten minutes); dispatching unchecked",
      )
      Ok(Nil)
    }
    True -> {
      let checked =
        verify.statement_resolves(cfg.repo_root, cfg.lake, node.lean_name)
      lock.release(build_lock, holder)
      case checked {
        Ok(signature) -> {
          log.event(l, "statement_gate", [
            #("node", json.string(node.id)),
            #("result", json.string("resolves")),
            #("statement", json.string(signature)),
          ])
          Ok(Nil)
        }
        Error(reason) -> {
          log.event(l, "statement_gate", [
            #("node", json.string(node.id)),
            #("result", json.string("refused")),
            #("reason", json.string(reason)),
          ])
          Error(reason)
        }
      }
    }
  }
}

/// How many strays one run will elaborate before it stops.
///
/// Measured 2026-09-09 with warm oleans: 2.5s, 5.3s, 5.8s, 9.0s and 19.7s
/// for five files. Twelve is about a minute of tail on a run that has just
/// spent tens of minutes, and the cache means successive runs work through
/// whatever is left rather than repeating it. A cap at all is because this
/// is the least urgent thing the harness does and must never be the reason
/// a run looks hung.
const stray_sweep_limit = 12

/// Elaborate the strays whose verdicts the cache does not already hold, and
/// record what they rest on.
///
/// **Here, at the end of a run, and nowhere else.** The lock is free (no
/// attempt is in flight), the process already holds it, and nobody is
/// waiting on the output. `status` cannot do this — it would block for
/// minutes on the lock a live run queues on, and a `status` that blocks is
/// a `status` nobody runs, which is exactly how this section went unread
/// for an evening on 2026-09-09.
///
/// A run killed before this point leaves the cache as it was, and those
/// files print `unchecked`: the inert failure rather than a wrong verdict.
fn sweep_strays(
  cfg: config.Config,
  build_lock: Subject(lock.Msg),
  l: log.Log,
) -> Nil {
  let cache_path = stray.cache_path(cfg.repo_root)
  let cache = stray.load(cache_path)
  let unchecked =
    stray_proofs(cfg)
    |> stray.sweep_order
    |> list.filter(fn(path) {
      case stray.hash_of(cfg.repo_root <> "/" <> path) {
        Error(_) -> False
        Ok(hash) -> stray.lookup(cache, path, hash) == None
      }
    })
    |> list.take(stray_sweep_limit)
  case unchecked {
    [] -> Nil
    some -> {
      io.println(
        "checking what "
        <> int.to_string(list.length(some))
        <> " unchecked stray .lean file(s) rest on; seconds each",
      )
      let holder = "stray sweep"
      case lock.acquire(build_lock, holder, 600_000) {
        False -> io.println_error("harness/dispatch: " <> lock_held_message)
        True -> {
          stray.sweep(
            cache,
            some,
            fn(path) {
              case stray.hash_of(cfg.repo_root <> "/" <> path) {
                Error(_) -> Error(Nil)
                Ok(hash) -> {
                  let verdict =
                    stray.check(
                      cfg.repo_root,
                      cfg.lake,
                      cfg.repo_root <> "/" <> path,
                    )
                  log.event(l, "stray", [
                    #("file", json.string(path)),
                    #("verdict", json.string(stray.verdict_tag(verdict))),
                  ])
                  Ok(stray.Entry(path:, hash:, verdict:, checked: log.now_iso()))
                }
              }
            },
            fn(entries) {
              case stray.save(entries, cache_path) {
                Ok(Nil) -> Nil
                Error(reason) ->
                  io.println_error("harness/dispatch: stray cache: " <> reason)
              }
            },
          )
          lock.release(build_lock, holder)
        }
      }
    }
  }
}

/// The `stray_proofs` section, listed by `status` rather than behind a
/// verb of its own: not going to look IS the failure this addresses, and
/// a verb a captain has to remember would reproduce it.
fn stray_section(cfg: config.Config) -> String {
  let strays = stray_proofs(cfg)
  let cache = stray.load(stray.cache_path(cfg.repo_root))
  "Checked Lean the build cannot see ("
  <> int.to_string(list.length(strays))
  <> "): `sorry`-free .lean under runs/ or explorer/ that "
  <> "Rule30/Proofs.lean does not import. A parked attempt's proof or a "
  <> "theorist's scratch -- work already paid for that no verb points at, "
  <> "and an attempt whose outcome says `abandoned` is exactly the record "
  <> "nobody re-reads. `proves X` means the file elaborates and rests only "
  <> "on the three permitted axioms: worth reading, never `seed this`, since "
  <> "a stray can be cleanly proved and prove something merely near what a "
  <> "node asks for:\n"
  <> case strays {
    [] -> "  (none)"
    some ->
      string.join(
        list.map(some, fn(p) { stray.row(p, verdict_for(cache, cfg, p)) }),
        "\n",
      )
  }
}

/// The cached verdict for one stray, if the cache holds one computed over
/// the bytes that are on disk now.
///
/// Never elaborates. `status` must not run Lean: the population is minutes
/// of work and it holds the `lake` lock a live run queues on, and a
/// `status` that blocks is a `status` nobody runs — which is how this very
/// section went unread for an evening. The sweep at the end of a run fills
/// the cache; anything it has not reached prints `unchecked`, which is
/// inert and true.
fn verdict_for(
  cache: List(stray.Entry),
  cfg: config.Config,
  path: String,
) -> Option(stray.Verdict) {
  case stray.hash_of(cfg.repo_root <> "/" <> path) {
    Error(_) -> None
    Ok(hash) -> stray.lookup(cache, path, hash)
  }
}

/// What the next attempt at `n` would actually spend: how many attempts
/// have already burned a rung, the model that rung selects, and the
/// ceilings that attempt would run under.
///
/// This exists because a dollar figure whose currency is unstated is not an
/// authorisation. Two `L research` leaves print an identical size, and one
/// may be on `opus` at $4.00 while the other is on `fable` — the scarcest
/// allowance in the project — at $20.00, because they differ only in how
/// many attempts have already failed. On 2026-09-08 two sessions each
/// approved a spend without seeing which of those they were approving. The
/// scheduler already computes both values (`config.model_for`,
/// `config.for_attempt`); this only puts them where the decision is made.
fn next_attempt_text(cfg: config.Config, n: dag.Node) -> String {
  let failed = config.failed_attempts(n)
  case config.model_for(n.size, failed, research: n.research) {
    Error(Nil) -> ""
    Ok(model) -> {
      let attempt_cfg = config.for_attempt(cfg, n)
      ", "
      <> int.to_string(failed)
      <> " failed, next: "
      <> model
      <> ", "
      <> int.to_string(attempt_cfg.max_turns)
      <> " turns, $"
      <> float.to_string(attempt_cfg.max_budget_usd)
    }
  }
}

/// The one line a captain sees on the terminal when an attempt actually
/// starts. The `dispatch` event has carried the model and both ceilings all
/// along; until now they reached `events.jsonl` and never the screen, so
/// the spend was authorised without its denomination being visible anywhere
/// the person authorising it was looking.
fn dispatch_line(
  node_id: String,
  identity: String,
  model: String,
  attempt_cfg: config.Config,
) -> String {
  "dispatching "
  <> node_id
  <> " as "
  <> identity
  <> " on "
  <> model
  <> " — "
  <> int.to_string(attempt_cfg.max_turns)
  <> " turns, $"
  <> float.to_string(attempt_cfg.max_budget_usd)
  <> " ceiling"
}

/// Every `.lean` under `dir`, recursively, or `[]` if `dir` is not there.
fn lean_files_under(dir: String) -> List(String) {
  case simplifile.read_directory(dir) {
    Error(_) -> []
    Ok(entries) ->
      list.flat_map(entries, fn(entry) {
        let path = dir <> "/" <> entry
        case simplifile.is_directory(path) {
          Ok(True) -> lean_files_under(path)
          _ ->
            case string.ends_with(entry, ".lean") {
              True -> [path]
              False -> []
            }
        }
      })
  }
}

/// Checked Lean sitting in the checkout that the build cannot see:
/// `sorry`-free `.lean` files under `runs/` and `explorer/`, which
/// `Rule30/Proofs.lean` never imports because it imports only
/// `Rule30.Proofs.*`.
///
/// Three things write Lean here and only one of them is read afterwards. A
/// prover that does not close its node has its file moved out of
/// `Rule30/Proofs/` into the attempt directory, and the next brief for that
/// node names the moved path (`brief.previous_attempt_file`) -- but only
/// when the file is under `<run>/<node.id>-<n>/` and carries the node's own
/// proof basename, which two of the eight files under `runs/` did not. A
/// theorist may write scratch anywhere it is allowed to, and `explorer/` is
/// allowed: fourteen `sorry`-free files sat there on 2026-09-08, one
/// holding four cleanly-proved theorems including translation equivariance
/// of rule 30, from a $14.22 session, which the board did not have.
///
/// The `sorry` filter is what separates a finding from noise. An unimported
/// file full of holes is scratch and always will be; an unimported file
/// with no holes is work already paid for that nothing points at.
pub fn stray_proofs(cfg: config.Config) -> List(String) {
  [cfg.runs_root, cfg.repo_root <> "/explorer"]
  |> list.flat_map(lean_files_under)
  |> list.filter(fn(path) {
    case simplifile.read(path) {
      Ok(text) -> !string.contains(text, "sorry")
      Error(_) -> False
    }
  })
  |> list.map(fn(path) {
    let root = cfg.repo_root <> "/"
    case string.starts_with(path, root) {
      True -> string.drop_start(path, string.length(root))
      False -> path
    }
  })
  |> list.sort(string.compare)
}

/// A node's size, with `research` after it when the node is one.
fn size_text(n: dag.Node) -> String {
  dag.size_to_string(n.size)
  <> case n.research {
    True -> " research"
    False -> ""
  }
}

/// The identity an attempt runs as, given the scheduler's decision. An
/// existing identity that never chose a colour — the roster predates the
/// ceremony asking for one — gets a short backfill ceremony first. A mint
/// runs the naming ceremony: the newcomer is saved to the roster, its
/// notebook is opened with the paragraph it wrote about itself, and the
/// `naming` event says whether it was named because the region was empty
/// or because every persona there was busy.
fn ensure_identity(
  cfg: config.Config,
  roster_: roster.Roster,
  who: schedule.Who,
  model: String,
  g: guard.Guard,
  l: log.Log,
) -> Result(roster.Identity, String) {
  case who {
    schedule.Existing(identity) ->
      case identity.color {
        Some(_) -> Ok(identity)
        None -> Ok(backfill_color(cfg, roster_, identity, model, g, l))
      }
    schedule.Mint(region:, busy:) -> {
      use #(identity, color_reason) <- result.try(worker.name_identity(
        cfg,
        roster_,
        region,
        model,
        g.settings_path,
        l,
      ))
      let roster_ = roster.add(roster_, identity)
      use _ <- result.try(roster.save(roster_, cfg.roster_path))
      use _ <- result.try(roster.append_notebook(
        cfg.agents_dir,
        identity,
        identity.created <> " — named for " <> region,
        naming_entry(identity, color_reason),
      ))
      let because = case busy {
        [] -> "region empty"
        names -> "all busy: " <> string.join(names, ", ")
      }
      log.event(l, "naming", [
        #("name", json.string(identity.name)),
        #("region", json.string(identity.region)),
        #("reason", json.string(identity.naming_reason)),
        #("because", json.string(because)),
      ])
      Ok(identity)
    }
  }
}

/// The naming ceremony's notebook entry: the naming reason, plus, when a
/// colour was actually settled on, the colour reason as its own paragraph.
fn naming_entry(
  identity: roster.Identity,
  color_reason: Option(String),
) -> String {
  case identity.color, color_reason {
    Some(color), Some(reason) ->
      identity.naming_reason <> "\n\nColour: " <> color <> " — " <> reason
    _, _ -> identity.naming_reason
  }
}

/// An identity named before colours existed: ask it, on its own, to choose
/// one. A colour it settles on is saved to the roster and recorded in its
/// notebook; two bad answers and it dispatches uncoloured rather than
/// failing outright.
fn backfill_color(
  cfg: config.Config,
  roster_: roster.Roster,
  identity: roster.Identity,
  model: String,
  g: guard.Guard,
  l: log.Log,
) -> roster.Identity {
  case worker.choose_color(cfg, identity, model, g.settings_path, l) {
    None -> identity
    Some(#(color, reason)) -> {
      let colored = roster.Identity(..identity, color: Some(color))
      let roster_ = roster.replace(roster_, colored)
      case roster.save(roster_, cfg.roster_path) {
        Ok(Nil) -> Nil
        Error(err) -> io.println_error("harness/dispatch: " <> err)
      }
      case
        roster.append_notebook(
          cfg.agents_dir,
          colored,
          log.now_iso() <> " — chose a colour",
          "Colour: " <> color <> " — " <> reason,
        )
      {
        Ok(Nil) -> Nil
        Error(err) -> io.println_error("harness/dispatch: " <> err)
      }
      colored
    }
  }
}

/// Fold one attempt into its node. A closed attempt proves the node; every
/// other outcome puts it back on the board, unless the ladder has no model
/// left for it — then it is abandoned, because an open leaf nothing can be
/// dispatched at is not an open leaf. A research node always has a model
/// left (`config.model_for`), so it always goes back on the board.
/// Whichever way, the attempt has ended, so the claim is released with it.
fn record(node: dag.Node, attempt: dag.Attempt) -> dag.Node {
  let attempts = list.append(node.attempts, [attempt])
  let node = dag.Node(..node, attempts:)
  case attempt.outcome {
    dag.Closed ->
      dag.Node(..dag.release(node, dag.Proved), verified: Some(log.now_iso()))
    _ ->
      case
        config.model_for(
          node.size,
          failed_attempts(node),
          research: node.research,
        )
      {
        Ok(_) -> dag.release(node, dag.Open)
        Error(Nil) -> dag.release(node, dag.Abandoned)
      }
  }
}

/// The worker's channels — notebook, journal, bugs, proposals — each written
/// from the report exactly as the worker wrote it.
///
/// `l` is the run log, where the notebook heading, the journal, the
/// `report_discarded` event and filed bugs go; `attempt_log` is the
/// attempt's own log, where a worker's proposed sub-lemmas are written.
/// Both callers pass two distinct logs: a run's `returned` one per attempt
/// in flight, and `prove_one` the single attempt its run holds.
///
/// One more row when the decoder had to leave something out: a single
/// `report_discarded` event naming the entries of `bugs` that did not
/// decode. Without it an attempt whose bug report was dropped reads
/// exactly like an attempt with nothing to report.
///
/// Returns what `write_proposals` returns: `Some(PendingCheck)` when a
/// proposals file was written and still needs `run_check`, `None`
/// otherwise (including when `report` itself is `None`). The caller
/// decides when that runs — see `run_check`'s doc comment.
fn write_channels(
  cfg: config.Config,
  l: log.Log,
  attempt_log: log.Log,
  identity: roster.Identity,
  node: dag.Node,
  model: String,
  attempt: dag.Attempt,
  report: Option(worker.Report),
) -> Option(PendingCheck) {
  let node_id = node.id
  case report {
    None -> None
    Some(r) -> {
      case string.trim(r.notebook) {
        "" -> Nil
        _ -> {
          let heading =
            log.now_iso()
            <> " — "
            <> node_id
            <> " ("
            <> model
            <> ", "
            <> dag.outcome_to_string(attempt.outcome)
            <> ")"
          case
            roster.append_notebook(
              cfg.agents_dir,
              identity,
              heading,
              r.notebook,
            )
          {
            Ok(Nil) -> Nil
            Error(reason) -> io.println_error("harness/dispatch: " <> reason)
          }
        }
      }
      case string.trim(r.journal) {
        "" -> Nil
        _ -> log.journal(l, identity.name, node_id, r.journal)
      }
      case r.discarded {
        [] -> Nil
        reasons ->
          log.event(l, "report_discarded", [
            #("from", json.string(identity.name)),
            #("node", json.string(node_id)),
            #("reasons", json.array(reasons, json.string)),
          ])
      }
      file_reported_bugs(cfg, l, identity, node_id, attempt, r.bugs)
      write_proposals(attempt_log, identity, node, r)
    }
  }
}

/// Where a worker's proposed sub-lemmas go, relative to the attempt
/// directory: the seeder's `next.json` shape under a name that cannot be
/// mistaken for the seeder's, so Rowan's landing script and the seeder path
/// are one path. The check's report sits beside it.
pub const proposals_file = "proposals.json"

pub const proposals_check_file = "proposals-check.txt"

/// A proposals file `write_proposals` has written and that still needs
/// `run_check` — the two are split apart so the (possibly slow, possibly
/// panicking) check can be deferred by its caller rather than run inline.
pub type PendingCheck {
  PendingCheck(node_id: String, attempt_log: log.Log, path: String)
}

/// A worker's proposed sub-lemmas, written to the attempt directory in the
/// seeder's shape and recorded as an event. A proposal file nobody has
/// checked is a hope; `run_check` — deliberately not called from here — is
/// what makes a failed attempt's output usable by the DAG.
///
/// Nothing here reads the rung or the outcome: a `proved` attempt with
/// proposals writes them too, and a proposal is weighed by the check, not by
/// which model made it.
///
/// One guard before the check, the only mechanical one: a proposal whose
/// name is the node's own — either `node.id` or `node.lean_name`, since a
/// worker may restate under whichever it knows — is dropped, named in a
/// `proposals_discarded` event. A restatement under another name is what the
/// check's report and the captain's reading are for.
///
/// Returns `Some(PendingCheck)` when a file was written and still needs
/// checking, `None` when there was nothing to write or the write itself
/// failed (that failure is still recorded, as `proposals_checked` /
/// `outcome: "failed"`, right here — the write is fast and cannot panic, so
/// nothing about it needs deferring).
pub fn write_proposals(
  attempt_log: log.Log,
  identity: roster.Identity,
  node: dag.Node,
  report: worker.Report,
) -> Option(PendingCheck) {
  case report.proposals {
    [] -> None
    proposals -> {
      let #(restating, kept) =
        list.partition(proposals, fn(p) {
          p.name == node.id || p.name == node.lean_name
        })
      case restating {
        [] -> Nil
        rs ->
          log.event(attempt_log, "proposals_discarded", [
            #("node", json.string(node.id)),
            #("reason", json.string("restates the node under its own name")),
            #("names", json.array(list.map(rs, fn(p) { p.name }), json.string)),
          ])
      }
      case kept {
        [] -> None
        survivors -> {
          let path = attempt_log.dir <> "/" <> proposals_file
          let text = proposals_json(node.id, identity, attempt_log, survivors)
          log.event(attempt_log, "proposals", [
            #("node", json.string(node.id)),
            #("from", json.string(identity.name)),
            #("file", json.string(path)),
            #("count", json.int(list.length(survivors))),
            #(
              "names",
              json.array(list.map(survivors, fn(p) { p.name }), json.string),
            ),
          ])
          case simplifile.write(path, text) {
            Error(e) -> {
              log.event(attempt_log, "proposals_checked", [
                #("node", json.string(node.id)),
                #("outcome", json.string("failed")),
                #(
                  "reason",
                  json.string(
                    "could not write "
                    <> path
                    <> ": "
                    <> simplifile.describe_error(e),
                  ),
                ),
              ])
              None
            }
            Ok(Nil) -> Some(PendingCheck(node_id: node.id, attempt_log:, path:))
          }
        }
      }
    }
  }
}

/// Run `checker` (`seed.check_file_in` with `repo_root` closed over, or a
/// stand-in) over the file named by `pending`, and record the outcome as one
/// more event: `written` with the report's path, or `failed` with the
/// reason, never a crash.
///
/// Takes the checker as an argument rather than calling `seed.check_file_in`
/// directly so its caller controls WHEN this runs. `prove_one` runs it once
/// the attempt's whole record is written, so nothing of the attempt's is
/// waiting on it. A run's `returned`
/// never calls this: it happens on the scheduler's own process with sibling
/// attempts still claimed, and the real checker can block up to 600s per
/// route claim and 180s per witness, and has its own `let assert` writes
/// (`seed.gleam` ~245, ~537) that panic — taking the whole run down — rather
/// than return `Error` on a checkout with no `.lake`. `returned` instead
/// queues the `PendingCheck` in `RunState.pending_checks`, and
/// `run_with_log` runs it here only after `loop` returns.
pub fn run_check(
  checker: fn(String) -> Result(String, String),
  pending: PendingCheck,
) -> Nil {
  let PendingCheck(node_id:, attempt_log:, path:) = pending
  let out = attempt_log.dir <> "/" <> proposals_check_file
  case checker(path) {
    Error(reason) ->
      log.event(attempt_log, "proposals_checked", [
        #("node", json.string(node_id)),
        #("outcome", json.string("failed")),
        #("reason", json.string(reason)),
      ])
    Ok(report_text) ->
      case simplifile.write(out, report_text) {
        Ok(Nil) ->
          log.event(attempt_log, "proposals_checked", [
            #("node", json.string(node_id)),
            #("outcome", json.string("written")),
            #("file", json.string(out)),
          ])
        Error(e) ->
          log.event(attempt_log, "proposals_checked", [
            #("node", json.string(node_id)),
            #("outcome", json.string("failed")),
            #(
              "reason",
              json.string(
                "could not write "
                <> out
                <> ": "
                <> simplifile.describe_error(e),
              ),
            ),
          ])
      }
  }
}

/// The seeder's `next.json` shape, with provenance beside the array. The
/// array's fields are exactly `seed.proposal_shape`'s so `seed.decode_proposals`
/// reads this file unchanged; the top-level keys beside `proposals` are
/// ignored by that decoder and are for the captain.
fn proposals_json(
  node_id: String,
  identity: roster.Identity,
  attempt_log: log.Log,
  proposals: List(worker.ProposedLemma),
) -> String {
  let entry = fn(p: worker.ProposedLemma) {
    let base = [
      #("id", json.string(p.name)),
      #("lean_name", json.string(p.name)),
      #("statement", json.string(p.statement)),
      #("reason", json.string(p.reason)),
      #("size", json.string(dag.size_to_string(p.size))),
    ]
    let disclaims = case p.disclaims {
      "" -> []
      d -> [#("disclaims", json.string(d))]
    }
    let route = case p.route {
      None -> []
      Some(#(tactics, imports)) -> [
        #(
          "route",
          json.object([
            #("tactics", json.string(tactics)),
            #("imports", json.array(imports, json.string)),
          ]),
        ),
      ]
    }
    let witness = case p.witness {
      None -> []
      Some(#(expression, imports, range)) -> [
        #(
          "witness",
          json.object([
            #("expression", json.string(expression)),
            #("imports", json.array(imports, json.string)),
            #("range", json.string(range)),
          ]),
        ),
      ]
    }
    json.object(list.flatten([base, disclaims, route, witness]))
  }
  json.object([
    #("node", json.string(node_id)),
    #("identity", json.string(identity.name)),
    #("run", json.string(attempt_log.run_id)),
    #("attempt_dir", json.string(attempt_log.dir)),
    #("filed", json.string(log.now_iso())),
    #("proposals", json.array(proposals, entry)),
  ])
  |> json.to_string
}

/// A worker's reported bugs, appended to the board with the provenance the
/// dispatcher already holds. Never deduped: two workers describing the same
/// friction in their own words are two pieces of evidence.
///
/// The event is logged before the board write is attempted, not after: a
/// failed `load` or `save` must not also lose the worker's own words to
/// nothing but a filesystem error on stderr.
fn file_reported_bugs(
  cfg: config.Config,
  l: log.Log,
  identity: roster.Identity,
  node_id: String,
  attempt: dag.Attempt,
  reported: List(worker.ReportedBug),
) -> Nil {
  case worth_filing(reported) {
    [] -> Nil
    reported -> {
      list.each(reported, fn(rb) {
        log.event(l, "bug", [
          #("from", json.string(identity.name)),
          #("node", json.string(node_id)),
          #("title", json.string(rb.title)),
          #("body", json.string(rb.body)),
        ])
      })
      case bugs.load(cfg.bugs_path) {
        Error(reason) -> filing_disabled(l, reason)
        Ok(board) -> {
          let board =
            list.fold(reported, board, fn(board, rb) {
              bugs.append(
                board,
                bugs.Bug(
                  id: "",
                  title: rb.title,
                  area: bugs.area_from_string(rb.area)
                    |> result.unwrap(bugs.Other),
                  severity: bugs.severity_from_string(rb.severity)
                    |> result.unwrap(bugs.Friction),
                  body: rb.body,
                  reported_by: identity.name,
                  source: bugs.Worker,
                  node: Some(node_id),
                  run: Some(l.dir),
                  session_id: Some(attempt.session_id),
                  signature: None,
                  filed: log.now_iso(),
                  occurrences: 1,
                  status: bugs.Open,
                  resolution: None,
                  fixed: None,
                  claimed_by: None,
                  claimed_at: None,
                  claimed_ref: None,
                ),
              )
            })
          case bugs.save(board, cfg.bugs_path) {
            Ok(Nil) -> Nil
            Error(reason) -> io.println_error("harness/dispatch: " <> reason)
          }
        }
      }
    }
  }
}

/// A board that will not decode means nothing gets filed for the rest of the
/// run, and "nothing filed" is exactly what a clean run looks like. So this
/// goes in the attempt's own event log as well as to stderr: a run whose
/// filing channel was off must say so in the record a reader actually has,
/// not only in a console line nobody kept.
fn filing_disabled(l: log.Log, reason: String) -> Nil {
  io.println_error("harness/dispatch: " <> reason)
  log.event(l, "filing_disabled", [
    #("reason", json.string(reason)),
    #(
      "effect",
      json.string(
        "no bug was filed for this attempt; the board must be repaired before the next run",
      ),
    ),
  ])
}

/// Bugs the harness files about itself, from signals it already has. Every
/// one carries a signature, so a run that trips the same fault forty times
/// leaves one row with `occurrences: 40` rather than forty rows.
fn auto_file(
  cfg: config.Config,
  l: log.Log,
  node_id: String,
  identity: roster.Identity,
  title: String,
  body: String,
  area: bugs.Area,
  severity: bugs.Severity,
  signature: String,
) -> Nil {
  case bugs.load(cfg.bugs_path) {
    Error(reason) -> filing_disabled(l, reason)
    Ok(board) -> {
      let board =
        bugs.append(
          board,
          bugs.Bug(
            id: "",
            title:,
            area:,
            severity:,
            body:,
            reported_by: identity.name,
            source: bugs.Harness,
            node: Some(node_id),
            run: Some(l.dir),
            session_id: None,
            signature: Some(signature),
            filed: log.now_iso(),
            occurrences: 1,
            status: bugs.Open,
            resolution: None,
            fixed: None,
            claimed_by: None,
            claimed_at: None,
            claimed_ref: None,
          ),
        )
      case bugs.save(board, cfg.bugs_path) {
        Ok(Nil) -> Nil
        Error(reason) -> io.println_error("harness/dispatch: " <> reason)
      }
    }
  }
}

/// The distinct policy denials of this attempt — refusals of the call
/// itself, which the same call would meet again — read back from the
/// guard's own rows in the attempt's event log. Contention is not here: a
/// build-lock timeout is a sibling holding the lock, and `guard_contention`
/// reads those.
///
/// The rows are read through `guard_event`, the module the guard wrote them
/// through, and classified by their decoded, typed `denial` — never by
/// searching the line for a word. A new kind of refusal reaches the board by
/// becoming a `guard_event.Denial` and saying which `Meaning` it has; a row
/// that merely mentions a denial (a worker's command can contain any text it
/// likes) does not.
pub fn guard_denials(l: log.Log, node_id: String) -> List(GuardDenial) {
  denials_meaning(l, node_id, guard_event.Policy) |> list.unique
}

/// Every contention denial of this attempt, one per row rather than
/// deduplicated, because for contention the count is the finding: how many
/// times a legal `lake build` waited its whole timeout on a sibling.
pub fn guard_contention(l: log.Log, node_id: String) -> List(GuardDenial) {
  denials_meaning(l, node_id, guard_event.Contention)
}

fn denials_meaning(
  l: log.Log,
  node_id: String,
  wanted: guard_event.Meaning,
) -> List(GuardDenial) {
  guard_event.read(l, node_id)
  |> list.filter_map(fn(e) {
    case e.denial {
      Some(d) ->
        case guard_event.meaning(d) == wanted {
          True ->
            Ok(GuardDenial(tool: e.tool, denial: d, attempted: e.attempted))
          False -> Error(Nil)
        }
      None -> Error(Nil)
    }
  })
}

/// One denial as the board needs to read it: which tool, why it was refused,
/// and what was actually asked for.
///
/// `denial` is the whole point. Before it, every refusal of one tool shared
/// the signature `guard:Bash`, so a permanent grammar refusal and a transient
/// build-lock timeout were one bug that could not be acted on in either of
/// its two meanings.
pub type GuardDenial {
  GuardDenial(tool: String, denial: guard_event.Denial, attempted: String)
}

/// The auto-filed signals: a rate-limited outcome, every distinct policy
/// denial the guard made during the attempt, and any build-lock contention
/// the attempt suffered. Called once per attempt end, right after
/// `write_channels` — the worker's own report may have said nothing about
/// any of them, since a denied call does not always read to the worker as
/// the harness's fault, and a rate limit is not the worker's story to tell
/// at all. Public for its test, which reads the board it writes.
///
/// A policy denial and a lock timeout are filed apart, under different
/// areas, because their remedies are opposite: the first is the brief or
/// the allowlist and belongs to the guard; the second is the scheduler's
/// concurrency or the lock's wait and belongs to `dispatch` — the nearest
/// `bugs.Area` to a lock, since there is no `Lock` or `Scheduler` value.
/// One signature for either can only be acted on in one of its meanings.
pub fn auto_file_signals(
  cfg: config.Config,
  l: log.Log,
  node_id: String,
  identity: roster.Identity,
  attempt: dag.Attempt,
) -> Nil {
  case attempt.outcome {
    dag.RateLimited ->
      auto_file(
        cfg,
        l,
        node_id,
        identity,
        "Attempt stopped by the five-hour rate limit",
        "The run halted at "
          <> node_id
          <> " with the subscription window exhausted; no further attempts "
          <> "were started.",
        bugs.Dispatch,
        bugs.Blocks,
        "dispatch:rate_limit",
      )
    _ -> Nil
  }
  list.each(guard_denials(l, node_id), fn(d) {
    let slug = guard_event.denial_slug(d.denial)
    auto_file(
      cfg,
      l,
      node_id,
      identity,
      "Guard denied " <> d.tool <> " (" <> slug <> ")",
      "The guard refused a "
        <> d.tool
        <> " call during the attempt at "
        <> node_id
        <> ", as "
        <> slug
        <> ". It tried: "
        <> attempted_text(d)
        <> ". If the worker needed it, the allowlist is wrong; if it did "
        <> "not, the brief is.",
      bugs.Guard,
      bugs.Friction,
      "guard:" <> d.tool <> ":" <> slug,
    )
  })
  case guard_contention(l, node_id) {
    [] -> Nil
    [first, ..] as all -> {
      let slug = guard_event.denial_slug(first.denial)
      let n = list.length(all)
      auto_file(
        cfg,
        l,
        node_id,
        identity,
        "Build lock contention: "
          <> int.to_string(n)
          <> " "
          <> first.tool
          <> " call(s) timed out waiting for a sibling",
        "During the attempt at "
          <> node_id
          <> ", "
          <> int.to_string(n)
          <> " "
          <> first.tool
          <> " call(s) were refused as "
          <> slug
          <> ": the build lock did not come free within the guard's wait "
          <> "because another worker held it. The command was legal and the "
          <> "worker did nothing wrong, so neither the brief nor the allowlist "
          <> "is the remedy; the cost is in the scheduler's concurrency or the "
          <> "lock's wait, which is why this is filed under dispatch rather "
          <> "than guard. Last tried: "
          <> attempted_text(first)
          <> ".",
        bugs.Dispatch,
        bugs.Friction,
        "dispatch:" <> slug,
      )
    }
  }
}

fn attempted_text(d: GuardDenial) -> String {
  case d.attempted {
    "" -> "(not recorded)"
    a -> a
  }
}

/// Bugs actually worth putting on the board: a malformed report can decode a
/// bug down to an empty title (see `worker.reported_bug_decoder`) rather than
/// failing outright, and a titleless row is not useful. Public for its test,
/// like `worker.hit_ceiling` — a pure filter is worth testing directly.
pub fn worth_filing(
  reported: List(worker.ReportedBug),
) -> List(worker.ReportedBug) {
  list.filter(reported, fn(rb) { rb.title != "" })
}

/// Move an unclosed attempt's proof file out of `Rule30/Proofs/` and into
/// the attempt's own directory. Returns where it went, or `None` when there
/// was nothing to move or the move failed — a failure is printed and
/// recorded, never raised, because this runs after the attempt's record is
/// written and must not cost it.
///
/// `Rule30/Proofs/` is read by Dib and swept into commits by captains, and
/// CLAUDE.md says it holds one file per *closed* node. A parked, abandoned
/// or crashed attempt used to leave its file there, where nothing
/// distinguished debris from a proof whose attempt was mislabelled, and
/// where `git add -A Rule30/Proofs` took it in (65cf7a8). The file is kept
/// rather than deleted because it is often worth reading: the next brief on
/// the node names this path (`brief.previous_attempt_file`), so the intent
/// of `parked-attempt-leaves-untracked-proof-file` — the next worker reads
/// the previous work first — survives the move.
fn park_proof_file(
  cfg: config.Config,
  l: log.Log,
  node: dag.Node,
) -> Option(String) {
  let rel = dag.proof_path(node)
  let from = cfg.repo_root <> "/" <> rel
  let to =
    l.dir
    <> "/"
    <> {
      string.split(rel, "/")
      |> list.last
      |> result.unwrap(rel)
    }
  case simplifile.is_file(from) {
    Ok(True) ->
      case simplifile.rename(from, to) {
        Ok(Nil) -> {
          log.event(l, "proof_file", [
            #("node", json.string(node.id)),
            #("from", json.string(rel)),
            #("to", json.string(to)),
            #("outcome", json.string("moved")),
          ])
          Some(to)
        }
        Error(err) -> {
          let reason = simplifile.describe_error(err)
          log.event(l, "proof_file", [
            #("node", json.string(node.id)),
            #("from", json.string(rel)),
            #("to", json.string(to)),
            #("outcome", json.string("failed")),
            #("reason", json.string(reason)),
          ])
          io.println_error(
            "harness/dispatch: could not move "
            <> rel
            <> " into "
            <> l.dir
            <> ": "
            <> reason,
          )
          None
        }
      }
    _ -> None
  }
}

fn summary(
  d: dag.Dag,
  l: log.Log,
  identity: roster.Identity,
  attempt: dag.Attempt,
  node_id: String,
  parked: Option(String),
) -> String {
  string.join(
    [
      "",
      "node      " <> node_id,
      "identity  " <> identity.name,
      "model     " <> attempt.model,
      "outcome   " <> dag.outcome_to_string(attempt.outcome),
      "cost      $" <> roster.usd(attempt.cost_usd),
      "turns     " <> int.to_string(attempt.turns),
      "estimate  " <> dag.size_to_string(attempt.estimate),
      "session   " <> attempt.session_id,
      "log       " <> l.dir,
      "proof     "
        <> case parked {
        Some(path) ->
          path <> " (moved out of Rule30/Proofs/: not a closed node)"
        None -> "-"
      },
      "",
      "verifier:",
      attempt.notes,
      "",
      roster.scorecard_text(roster.scorecard(d, identity.name), identity.color),
    ],
    "\n",
  )
}

/// How many attempts at this node count against its model ladder:
/// `config.failed_attempts`, which lives beside the ladder it is counted
/// against. Kept here as the dispatcher's name for it, since this is where
/// the count is spent.
pub fn failed_attempts(node: dag.Node) -> Int {
  config.failed_attempts(node)
}

fn burns_a_rung(o: dag.Outcome) -> Bool {
  config.burns_a_rung(o)
}

/// Re-read a finished attempt against what the harness's own components
/// wrote about it, and mark it `HarnessFailed` if the harness is the reason
/// it failed. Called once per attempt end, before the attempt is folded into
/// the DAG, so the ladder and the scorecard never see the original outcome.
///
/// The guard and the verifier are the witnesses, not the worker: a worker
/// beaten by a harness defect it mistook for a rule files no complaint, so
/// the signal has to be derived from outside the session. Exactly these
/// count, and each is read from the attempt's `events.jsonl`:
///
/// - a `guard` row whose denial means contention
///   (`guard_event.BuildLockTimeout`, read back through `guard_contention`)
///   — the worker's one permitted build was refused because a sibling held
///   the lock, which is not a rule and not the worker's doing;
/// - the attempt's last `verify` row carrying `lock_held_message` — the
///   verifier never built the proof, so its "failed" verdict, and the
///   rounds the worker spent answering it, were about the lock.
///
/// Only a `GaveUp` or `BudgetExhausted` attempt is re-read: those are the
/// two outcomes that spend a rung and score calibration, so they are the
/// two a harness defect can corrupt. A `Closed` attempt with a lock timeout
/// in its history closed anyway; a pause stays a pause. Anything not listed
/// above — a `not_permitted` or `not_writable` denial, a real build error,
/// a worker that stopped reporting — is scored as difficulty by default,
/// because it is either the worker's doing or indistinguishable from it.
pub fn attribute(
  l: log.Log,
  node_id: String,
  attempt: dag.Attempt,
) -> dag.Attempt {
  case burns_a_rung(attempt.outcome) {
    False -> attempt
    True ->
      case harness_fault(l, node_id) {
        None -> attempt
        Some(reason) ->
          dag.Attempt(
            ..attempt,
            outcome: dag.HarnessFailed,
            notes: "harness failed: "
              <> reason
              <> ". This attempt says nothing about the node; the worker's own ending was "
              <> dag.outcome_to_string(attempt.outcome)
              <> ".\n"
              <> attempt.notes,
          )
      }
  }
}

/// The first harness-side signal on record for this attempt, as a phrase
/// for the attempt's notes, or `None` if the log holds nothing that counts.
fn harness_fault(l: log.Log, node_id: String) -> Option(String) {
  case list.first(guard_contention(l, node_id)) {
    Ok(d) ->
      Some(
        "the guard refused `"
        <> d.attempted
        <> "` with "
        <> guard_event.denial_slug(d.denial),
      )
    Error(Nil) ->
      case list.last(verify_verdicts(l, node_id)) {
        Ok(verdict) ->
          case string.contains(verdict, lock_held_message) {
            True ->
              Some("the verifier's last verdict was that " <> lock_held_message)
            False -> None
          }
        Error(Nil) -> None
      }
  }
}

/// The verdict text of every `verify` row the worker logged for this node,
/// in the order they happened. Every line is decoded and the `kind` and
/// `node` fields are compared as values, not scanned for as text, for the
/// reason `guard_denials` gives. Empty when the log does not exist.
pub fn verify_verdicts(l: log.Log, node_id: String) -> List(String) {
  case simplifile.read(l.dir <> "/events.jsonl") {
    Error(_) -> []
    Ok(text) ->
      text
      |> string.split("\n")
      |> list.filter_map(fn(line) {
        json.parse(line, verify_row_decoder(node_id))
        |> result.replace_error(Nil)
        |> result.try(option.to_result(_, Nil))
      })
  }
}

/// `Some(verdict)` for a `verify` row about `node_id`; `None` for a row of
/// any other kind or about any other node.
fn verify_row_decoder(node_id: String) -> decode.Decoder(Option(String)) {
  use kind <- decode.field(log.kind_key, decode.string)
  use node <- decode.optional_field("node", "", decode.string)
  case kind == "verify" && node == node_id {
    True -> {
      use verdict <- decode.field("verdict", decode.string)
      decode.success(Some(verdict))
    }
    False -> decode.success(None)
  }
}

/// The stated reason a node was dispatched, for the event log — the spec
/// asks for decisions to be recorded with their reasons, not just their
/// results.
fn dispatch_reason(d: dag.Dag, node: dag.Node, failed: Int) -> String {
  let rungs = list.length(config.ladder(node.size))
  "open leaf; unblocks "
  <> int.to_string(dag.unblocks(d, node.id))
  <> case config.on_research_rung(node) {
    True ->
      "; research node at its top rung, attempt "
      <> int.to_string(failed + 2 - rungs)
      <> " there"
    False -> "; ladder step " <> int.to_string(failed + 1)
  }
}

fn dependency_summary(d: dag.Dag, node: dag.Node) -> String {
  case node.deps {
    [] -> "none"
    deps ->
      deps
      |> list.map(fn(id) {
        case dag.get(d, id) {
          Ok(dep) -> id <> "=" <> dag.status_to_string(dep.status)
          Error(Nil) -> id <> "=missing"
        }
      })
      |> string.join(", ")
  }
}
