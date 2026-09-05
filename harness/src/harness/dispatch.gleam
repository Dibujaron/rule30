//// The dispatcher: pick a node, decide who works it and on which model,
//// stand up the guard, run one attempt, and record what happened.
////
//// Everything the harness knows lives in two files it owns — `blueprint/
//// dag.json` and `agents/roster.json` — plus the run's own log directory.
//// A worker writes only its one proof file; the notebook, the journal and
//// the DAG are written here, from the worker's report, verbatim.

import gleam/int
import gleam/io
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import harness/config
import harness/dag
import harness/guard
import harness/lock
import harness/log
import harness/roster
import harness/worker
import harness/worker/brief

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
        <> dependency_summary(d, node),
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
      allowed_write: cfg.repo_root <> "/" <> dag.proof_path(node),
      holder: node_id,
    ),
    lock_actor,
    l,
    cfg.guard_port,
  ))
  use _ <- result.try(guard.write_settings(g, g.settings_path))

  use identity <- result.try(ensure_identity(cfg, roster_, node, model, g, l))
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

  write_channels(cfg, l, identity, node_id, model, attempt, report)
  io.println(summary(d, l, identity, attempt, node_id))
  Ok(attempt.outcome)
}

/// Every node, then the open leaves in the order the dispatcher would take
/// them.
pub fn status(cfg: config.Config) -> Result(String, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  let rows =
    d.nodes
    |> list.map(fn(n) {
      string.pad_end(n.id, 34, " ")
      <> string.pad_end(dag.status_to_string(n.status), 10, " ")
      <> string.pad_end(dag.size_to_string(n.size), 6, " ")
      <> string.pad_end(n.region, 5, " ")
      <> "attempts="
      <> int.to_string(list.length(n.attempts))
    })
  let leaves = case dag.open_leaves(d) {
    [] -> ["  (none)"]
    open ->
      open
      |> list.map(fn(n) {
        "  "
        <> n.id
        <> " — unblocks "
        <> int.to_string(dag.unblocks(d, n.id))
        <> ", size "
        <> dag.size_to_string(n.size)
      })
  }
  Ok(
    string.join(rows, "\n")
    <> "\n\nOpen leaves, in dispatch order:\n"
    <> string.join(leaves, "\n"),
  )
}

/// The identity for this node's region, naming one if the region has none
/// yet. A newly named identity is saved to the roster and its notebook is
/// opened with the paragraph it wrote about itself.
fn ensure_identity(
  cfg: config.Config,
  roster_: roster.Roster,
  node: dag.Node,
  model: String,
  g: guard.Guard,
  l: log.Log,
) -> Result(roster.Identity, String) {
  case roster.for_region(roster_, node.region) {
    Some(identity) -> Ok(identity)
    None -> {
      use identity <- result.try(worker.name_identity(
        cfg,
        roster_,
        node.region,
        model,
        g.settings_path,
        l,
      ))
      let roster_ = roster.add(roster_, identity)
      use _ <- result.try(roster.save(roster_, cfg.roster_path))
      use _ <- result.try(roster.append_notebook(
        cfg.agents_dir,
        identity,
        identity.created <> " — named for " <> node.region,
        identity.naming_reason,
      ))
      log.event(l, "naming", [
        #("name", json.string(identity.name)),
        #("region", json.string(identity.region)),
        #("reason", json.string(identity.naming_reason)),
      ])
      Ok(identity)
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
    }
  }
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
      roster.scorecard_text(roster.scorecard(d, identity.name)),
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
