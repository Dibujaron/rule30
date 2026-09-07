//// The dispatcher: pick a node, decide who works it and on which model,
//// stand up the guard, run one attempt, and record what happened.
////
//// Everything the harness knows lives in two files it owns — `blueprint/
//// dag.json` and `agents/roster.json` — plus the run's own log directory.
//// A worker writes only its one proof file; the notebook, the journal and
//// the DAG are written here, from the worker's report, verbatim.

import gleam/dynamic/decode
import gleam/erlang/process.{type Pid, type Subject}
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
import harness/lock
import harness/log
import harness/roster
import harness/schedule.{type Plan}
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
            ". If no attempt is actually running, `gleam run -- reopen "
            <> node_id
            <> "` puts it back on the board."
          _ -> ""
        },
      )
  })
  let failed = failed_attempts(node)
  use model <- result.try(
    config.model_for(node.size, failed)
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
  use l <- result.try(log.open(cfg.runs_root, log.new_run_id()))
  use lock_actor <- result.try(
    lock.start(240_000)
    |> result.map_error(fn(e) {
      "could not start the build lock: " <> string.inspect(e)
    }),
  )
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

  let who = schedule.who_for(roster_, node.region, busy: [])
  use identity <- result.try(ensure_identity(cfg, roster_, who, model, g, l))
  log.event(l, "dispatch", [
    #("node", json.string(node_id)),
    #("identity", json.string(identity.name)),
    #("model", json.string(model)),
    #("reason", json.string(dispatch_reason(d, node, failed))),
  ])

  let claimed =
    dag.Node(
      ..node,
      status: dag.Claimed,
      proof_file: Some(dag.proof_path(node)),
    )
  let d = dag.update(d, claimed)
  use _ <- result.try(dag.save(d, cfg.dag_path))

  let #(attempt, report) =
    worker.attempt(
      cfg,
      worker.live_deps(cfg, task_message),
      d,
      claimed,
      identity,
      model,
      g,
      l,
    )
  let d = dag.update(d, record(claimed, attempt))
  use _ <- result.try(dag.save(d, cfg.dag_path))
  use _ <- result.try(case attempt.outcome {
    dag.Closed -> index_proof(cfg, l, claimed)
    _ -> Ok(Nil)
  })

  write_channels(cfg, l, identity, node_id, model, attempt, report)
  auto_file_signals(cfg, l, node_id, identity, attempt)
  let text = summary(d, l, identity, attempt, node_id)
  log.summary(l, text)
  io.println(text)
  Ok(attempt.outcome)
}

// --- run: several attempts, up to a few at once ------------------------------

/// What `run` reaches outside itself for, so a test can hand it stand-ins:
/// the verifier (given the run's build lock, since a verification is a
/// `lake build` too and must queue with the workers'), the annotator that
/// writes a verified statement into its proof note, and the proofs-index
/// writer. The last two both write under `Rule30/`, which is why a test
/// must be able to replace them.
pub type Env {
  Env(
    verifier: fn(Subject(lock.Msg)) -> fn(dag.Node) -> verify.Verdict,
    annotate: fn(dag.Node, String) -> Result(Nil, String),
    index: fn(dag.Node) -> Result(Nil, String),
  )
}

/// The real thing: `verify.verify` under the build lock, `verify.annotate`
/// outside it — it edits one comment block, and `lake` will re-elaborate
/// that one module on its next build — and `Rule30/Proofs.lean`.
pub fn live_env(cfg: config.Config) -> Env {
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
          False ->
            verify.BuildFailed(
              "the build lock was held by another worker for ten minutes",
            )
        }
      }
    },
    annotate: fn(node, statement) {
      verify.annotate(cfg.repo_root, node, statement)
    },
    index: fn(node) { write_index(cfg, node) },
  )
}

/// Dispatch up to `plan.max_attempts` attempts, keeping up to
/// `plan.concurrency` in flight, until the plan is spent or nothing is left
/// to start. The DAG is a build graph and this is its scheduler: whenever a
/// slot frees up, the best open leaf goes into it — including a leaf that
/// only just became one because a sibling closed its dependency. The `Ok`
/// is the run's closing summary.
pub fn run(cfg: config.Config, plan: Plan) -> Result(String, String) {
  run_with(cfg, plan, live_env(cfg))
}

/// `run` with its environment injected.
pub fn run_with(
  cfg: config.Config,
  plan: Plan,
  env: Env,
) -> Result(String, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  use roster_ <- result.try(roster.load(cfg.roster_path))
  use run_log <- result.try(log.open(cfg.runs_root, log.new_run_id()))
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
    )
  use state <- result.try(loop(run_, state))
  let text = run_summary(state)
  log.summary(run_log, text)
  io.println(text)
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
      case stop_requested(run_.cfg.repo_root) {
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
            <> stop_path(run_.cfg.repo_root)
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

/// Where a captain writes to end a run: `STOP` at the repository root.
///
/// At the root and in capitals because the situation it exists for is a person
/// who has just realised a live run is doing something wrong, and needs to act
/// before reading anything. Gitignored — committing it would halt every run.
pub fn stop_path(repo_root: String) -> String {
  repo_root <> "/STOP"
}

/// Has a captain asked this run to stop?
///
/// Deliberately a file rather than a signal or an interruptible dispatcher.
/// A file needs no process to be reachable, survives the session that wrote
/// it, works when a permission classifier refuses a kill — which is what
/// happened — and is removable by the same person who wrote it. It is the
/// "derive it from outside the process" half of CLAUDE.md's rule about state
/// surviving a session that dies without warning.
pub fn stop_requested(repo_root: String) -> Bool {
  case simplifile.is_file(stop_path(repo_root)) {
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
    config.model_for(node.size, failed)
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
  case brief.task_message(cfg, node) {
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
      log.event(run_.run_log, "dispatch", [
        #("node", json.string(node.id)),
        #("identity", json.string(identity.name)),
        #("model", json.string(model)),
        #("reason", json.string(dispatch_reason(state.d, node, failed))),
        #("port", json.int(port)),
        #("log", json.string(attempt_log.dir)),
        #("in_flight", json.int(list.length(state.running) + 1)),
      ])
      let claimed =
        dag.Node(
          ..node,
          status: dag.Claimed,
          proof_file: Some(dag.proof_path(node)),
        )
      let d = dag.update(state.d, claimed)
      use _ <- result.try(dag.save(d, cfg.dag_path))
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
              cfg,
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
  let recorded = record(node, attempt)
  let d = dag.update(state.d, recorded)
  use _ <- result.try(dag.save(d, cfg.dag_path))
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
  write_channels(
    cfg,
    run_.run_log,
    flight.identity,
    node.id,
    flight.model,
    attempt,
    report,
  )
  auto_file_signals(cfg, flight.attempt_log, node.id, flight.identity, attempt)
  log.summary(
    flight.attempt_log,
    summary(d, flight.attempt_log, flight.identity, attempt, node.id),
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
  let d = dag.update(state.d, dag.Node(..node, status: dag.Open))
  use _ <- result.try(dag.save(d, run_.cfg.dag_path))
  log.event(run_.run_log, "crashed", [
    #("node", json.string(node.id)),
    #("reason", json.string(reason)),
  ])
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

// --- the proofs index ---------------------------------------------------------

/// Where the import list of every closed proof lives, relative to the repo
/// root. `Rule30.lean` imports it, so `lake build` from the root builds the
/// proofs; nothing else does.
pub const proofs_index = "Rule30/Proofs.lean"

/// Add a closed node's module to `Rule30/Proofs.lean`, so the next root
/// `lake build` compiles it. A proof nothing imports is a proof nobody
/// notices has rotted.
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
  write_index(cfg, node)
}

/// The write behind `index_proof`, without the event.
fn write_index(cfg: config.Config, node: dag.Node) -> Result(Nil, String) {
  let path = cfg.repo_root <> "/" <> proofs_index
  let existing = simplifile.read(path) |> result.unwrap("")
  let updated = with_import(existing, dag.proof_module(node))
  simplifile.write(path, updated)
  |> result.map_error(fn(e) {
    "could not add "
    <> dag.proof_module(node)
    <> " to "
    <> path
    <> ": "
    <> simplifile.describe_error(e)
  })
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
      let reopened = dag.Node(..node, status: dag.Open)
      use _ <- result.try(dag.save(dag.update(d, reopened), cfg.dag_path))
      // The DAG is the source of truth, so a hand edit to it is an event
      // with a reason, like every dispatch decision.
      use l <- result.try(log.open(cfg.runs_root, log.new_run_id()))
      log.event(l, "reopen", [
        #("node", json.string(node_id)),
        #("from", json.string(dag.status_to_string(node.status))),
        #("to", json.string(dag.status_to_string(dag.Open))),
        #("attempts", json.int(list.length(node.attempts))),
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
        <> "` was claimed with "
        <> int.to_string(list.length(node.attempts))
        <> " attempt(s) recorded and is now open. A claim outlives the run "
        <> "that made it, so this is how a crashed attempt gets its node back.",
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

/// Every node, then the open leaves in the order the dispatcher would take
/// them.
///
/// A wall node whose dependencies are all proved is an open leaf by the
/// DAG's own definition — `dag.open_leaves` correctly lists it — but the
/// scheduler (`schedule.next_to_start`) will never offer one: `wall` means
/// "do not attempt without decomposing first", so `config.model_for` gives
/// it no model to dispatch with. Listing it under "Open leaves, in dispatch
/// order" would tell a human it is about to be picked up, which is false,
/// so it gets its own section instead.
pub fn status(cfg: config.Config) -> Result(String, String) {
  use d <- result.try(dag.load(cfg.dag_path))
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
      <> string.pad_end(dag.size_to_string(n.size), 6, " ")
      <> string.pad_end(n.region, 5, " ")
      <> "attempts="
      <> int.to_string(list.length(n.attempts))
    })
  let leaf_line = fn(n: dag.Node) {
    "  "
    <> n.id
    <> " — unblocks "
    <> int.to_string(dag.unblocks(d, n.id))
    <> ", size "
    <> dag.size_to_string(n.size)
  }
  let #(walled, startable) =
    dag.open_leaves(d) |> list.partition(fn(n) { n.size == dag.Wall })
  let walled_lines = case walled {
    [] -> ["  (none)"]
    ws -> list.map(ws, leaf_line)
  }
  let startable_lines = case startable {
    [] -> ["  (none)"]
    ss -> list.map(ss, leaf_line)
  }
  Ok(
    string.join(rows, "\n")
    <> "\n\nWalled leaves, ready but never dispatched (deps are proved, but "
    <> "`wall` means decompose before attempting — the scheduler will not "
    <> "offer these):\n"
    <> string.join(walled_lines, "\n")
    <> "\n\nOpen leaves, in dispatch order:\n"
    <> string.join(startable_lines, "\n"),
  )
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
/// dispatched at is not an open leaf.
fn record(node: dag.Node, attempt: dag.Attempt) -> dag.Node {
  let attempts = list.append(node.attempts, [attempt])
  let node = dag.Node(..node, attempts:)
  case attempt.outcome {
    dag.Closed ->
      dag.Node(..node, status: dag.Proved, verified: Some(log.now_iso()))
    _ ->
      case config.model_for(node.size, failed_attempts(node)) {
        Ok(_) -> dag.Node(..node, status: dag.Open)
        Error(Nil) -> dag.Node(..node, status: dag.Abandoned)
      }
  }
}

/// The three channels, each written from the report exactly as the worker
/// wrote it. Posts are logged, not delivered — routing is v2.
fn write_channels(
  cfg: config.Config,
  l: log.Log,
  identity: roster.Identity,
  node_id: String,
  model: String,
  attempt: dag.Attempt,
  report: Option(worker.Report),
) -> Nil {
  case report {
    None -> Nil
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
      list.each(r.posts, fn(post) {
        log.event(l, "post", [
          #("from", json.string(identity.name)),
          #("node", json.string(node_id)),
          #("text", json.string(post)),
        ])
      })
      file_reported_bugs(cfg, l, identity, node_id, attempt, r.bugs)
    }
  }
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
          ),
        )
      case bugs.save(board, cfg.bugs_path) {
        Ok(Nil) -> Nil
        Error(reason) -> io.println_error("harness/dispatch: " <> reason)
      }
    }
  }
}

/// The distinct tools this attempt was denied, read back from the guard's
/// own rows in the attempt's event log.
///
/// The `node` filter is belt and braces rather than what makes a denial
/// attributable: `run` gives every attempt its own
/// `runs/<run-id>/<node>-<n>/events.jsonl` and hands that same log to that
/// attempt's guard, so the directory already says whose denial it was. The
/// filter keeps this correct if a guard is ever pointed at a log it shares.
///
/// Candidate lines are found by substring and then **decoded**, rather than
/// scraped. The cheap filter is what keeps this affordable over a log that
/// may hold thousands of rows; the decode is not optional, because
/// `attempted` is a string the *worker* chose. Pulling it out with
/// `split_once` on a quote would truncate any command containing an escaped
/// quote, and a command containing the text `","denial":"` would forge a
/// field. A scrape is safe for values the guard controls and unsafe the
/// moment one of them is someone else's.
pub fn guard_denials(l: log.Log, node_id: String) -> List(GuardDenial) {
  case simplifile.read(l.dir <> "/events.jsonl") {
    Error(_) -> []
    Ok(text) ->
      text
      |> string.split(
        "
",
      )
      |> list.filter(fn(line) {
        string.contains(line, "\"kind\":\"guard\"")
        && string.contains(line, "\"node\":\"" <> node_id <> "\"")
      })
      |> list.filter_map(fn(line) {
        json.parse(line, guard_denial_decoder()) |> result.replace_error(Nil)
      })
      |> list.filter(fn(d) { d.denial != "" })
      |> list.unique
  }
}

/// One denial as the board needs to read it: which tool, why it was refused,
/// and what was actually asked for.
///
/// `denial` is the whole point. Before it, every refusal of one tool shared
/// the signature `guard:Bash`, so a permanent grammar refusal and a transient
/// build-lock timeout were one bug that could not be acted on in either of
/// its two meanings.
pub type GuardDenial {
  GuardDenial(tool: String, denial: String, attempted: String)
}

/// Reads the row `guard.event_fields` writes.
///
/// `denial` and `attempted` are optional so that a log written by an older
/// guard still yields bugs rather than silently yielding none — a run whose
/// denials stop reaching the board without anything failing is the shape of
/// defect this change exists to remove, and it would be perverse to
/// introduce it here. Such a row falls back to `"unknown"`, which is a worse
/// signature than the real slug and a much better one than no bug at all.
fn guard_denial_decoder() -> decode.Decoder(GuardDenial) {
  use tool <- decode.field("tool", decode.string)
  use decision <- decode.field("decision", decode.string)
  use denial <- decode.optional_field("denial", "", decode.string)
  use attempted <- decode.optional_field("attempted", "", decode.string)
  let denial = case denial, string.starts_with(decision, "Deny(") {
    "", True -> "unknown"
    other, _ -> other
  }
  decode.success(GuardDenial(tool:, denial:, attempted:))
}

/// The two auto-filed signals in scope this round: a rate-limited outcome,
/// and every distinct tool the guard denied during the attempt. Called once
/// per attempt end, right after `write_channels` — the worker's own report
/// may have said nothing about either, since a denied call does not always
/// read to the worker as the harness's fault, and a rate limit is not the
/// worker's story to tell at all.
fn auto_file_signals(
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
    auto_file(
      cfg,
      l,
      node_id,
      identity,
      "Guard denied " <> d.tool <> " (" <> d.denial <> ")",
      "The guard refused a "
        <> d.tool
        <> " call during the attempt at "
        <> node_id
        <> ", as "
        <> d.denial
        <> ". It tried: "
        <> case d.attempted {
        "" -> "(not recorded)"
        a -> a
      }
        <> ". If the worker needed it, the allowlist is wrong; if it did "
        <> "not, the brief is.",
      bugs.Guard,
      bugs.Friction,
      "guard:" <> d.tool <> ":" <> d.denial,
    )
  })
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

fn summary(
  d: dag.Dag,
  l: log.Log,
  identity: roster.Identity,
  attempt: dag.Attempt,
  node_id: String,
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
      "",
      "verifier:",
      attempt.notes,
      "",
      roster.scorecard_text(roster.scorecard(d, identity.name), identity.color),
    ],
    "\n",
  )
}

/// How many attempts at this node count against its model ladder: the two
/// outcomes that mean a model was given the node and could not close it.
///
/// A `RateLimited` or `TimedOut` attempt is a pause, not a verdict on the
/// model — the spec's line is that nothing is lost to a rate limit. Counting
/// one would escalate the ladder for free and, at an `L` node whose ladder
/// is one rung long, abandon the node outright.
pub fn failed_attempts(node: dag.Node) -> Int {
  node.attempts
  |> list.count(fn(a) {
    case a.outcome {
      dag.GaveUp | dag.BudgetExhausted -> True
      dag.Closed | dag.Reduced | dag.RateLimited | dag.TimedOut -> False
    }
  })
}

/// The stated reason a node was dispatched, for the event log — the spec
/// asks for decisions to be recorded with their reasons, not just their
/// results.
fn dispatch_reason(d: dag.Dag, node: dag.Node, failed: Int) -> String {
  "open leaf; unblocks "
  <> int.to_string(dag.unblocks(d, node.id))
  <> "; ladder step "
  <> int.to_string(failed + 1)
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
