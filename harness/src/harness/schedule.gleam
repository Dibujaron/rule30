//// The scheduler's pure half. The DAG is a build graph: a node is a task,
//// an open leaf is a task whose dependencies are all satisfied, and `run`
//// is the scheduler that keeps up to `concurrency` of them in flight until
//// `max_attempts` have been started. Everything here is a function of the
//// DAG and two counters, so it is unit-tested as one; the process spawning
//// and the waiting live in `dispatch.run`.

import gleam/int
import gleam/list
import gleam/option.{type Option, None}
import gleam/result
import harness/config
import harness/dag
import harness/roster

/// What one `run` is allowed to do: how many attempts it may start in all,
/// and how many may be in flight at once. Three is the ceiling on
/// concurrency because three workers already share one `lake build` lock,
/// one subscription window, and one checkout.
pub type Plan {
  Plan(max_attempts: Int, concurrency: Int)
}

pub const max_concurrency = 3

/// Read `run`'s flags: `--max-attempts N` (default 1) and `--concurrency K`
/// (default 1, at most `max_concurrency`), in either order.
pub fn parse_plan(args: List(String)) -> Result(Plan, String) {
  parse_flags(args, Plan(max_attempts: 1, concurrency: 1))
}

fn parse_flags(args: List(String), plan: Plan) -> Result(Plan, String) {
  case args {
    [] -> Ok(plan)
    ["--max-attempts", value, ..rest] -> {
      case positive(value) {
        Ok(n) -> parse_flags(rest, Plan(..plan, max_attempts: n))
        Error(Nil) ->
          Error("--max-attempts must be a positive integer, not " <> value)
      }
    }
    ["--concurrency", value, ..rest] -> {
      case positive(value) {
        Ok(n) if n <= max_concurrency ->
          parse_flags(rest, Plan(..plan, concurrency: n))
        _ ->
          Error(
            "--concurrency must be between 1 and "
            <> int.to_string(max_concurrency)
            <> ", not "
            <> value,
          )
      }
    }
    [flag, ..] ->
      case flag == "--max-attempts" || flag == "--concurrency" {
        True -> Error(flag <> " needs a value")
        False -> Error("unknown flag `" <> flag <> "`")
      }
  }
}

fn positive(text: String) -> Result(Int, Nil) {
  case int.parse(text) {
    Ok(n) if n >= 1 -> Ok(n)
    _ -> Error(Nil)
  }
}

/// Who an attempt runs as. A persona is a resource with capacity one, so
/// when every persona for a region is in flight the scheduler does not
/// wait: it decides to mint a new one, and carries the names it found busy
/// so the log can say why.
pub type Who {
  Existing(roster.Identity)
  Mint(region: String, busy: List(String))
}

/// A node to start, and who starts it.
pub type Assignment {
  Assignment(node: dag.Node, who: Who)
}

/// The eldest idle persona for `region`, or the decision to mint one.
pub fn who_for(
  roster_: roster.Roster,
  region: String,
  busy busy: List(String),
) -> Who {
  who_avoiding(roster_, region, busy:, avoid: [])
}

/// Who runs the next attempt at `node`: `who_for` on the node's region,
/// except at the repeatable top rung of a research node
/// (`config.on_research_rung`), where the point of a further attempt is a
/// different notebook — so among the idle personas the eldest that has not
/// yet attempted this node is preferred. If every idle persona has, the
/// eldest idle one goes again; a mint is decided only when nobody in the
/// region is idle, exactly as for any other node. Below the top rung a
/// research node keeps its persona like any other, because the notebook is
/// what spans the climb up the ladder.
pub fn who_for_node(
  roster_: roster.Roster,
  node: dag.Node,
  busy busy: List(String),
) -> Who {
  let avoid = case config.on_research_rung(node) {
    True -> list.map(node.attempts, fn(a) { a.identity })
    False -> []
  }
  who_avoiding(roster_, node.region, busy:, avoid:)
}

fn who_avoiding(
  roster_: roster.Roster,
  region: String,
  busy busy: List(String),
  avoid avoid: List(String),
) -> Who {
  let idle =
    roster.for_region(roster_, region)
    |> list.filter(fn(i) { !list.contains(busy, i.name) })
  let preferred =
    list.find(idle, fn(i) { !list.contains(avoid, i.name) })
    |> result.lazy_or(fn() { list.first(idle) })
  case preferred {
    Ok(identity) -> Existing(identity)
    Error(Nil) ->
      Mint(
        region:,
        busy: roster.for_region(roster_, region)
          |> list.map(fn(i) { i.name })
          |> list.filter(fn(name) { list.contains(busy, name) }),
      )
  }
}

/// The open leaves the scheduler would actually start, in the order it
/// would take them: `dag.open_leaves`' order — most unblocked first, then
/// smallest — with every `Wall` removed and every `research` node moved
/// behind every ordinary one.
///
/// `dag.open_leaves` states a fact about the DAG — this node's dependencies
/// are satisfied — and that is true of a wall node too. Whether it can be
/// *started* is a scheduling decision, not a DAG fact, and a wall node's
/// answer is always no: `wall` means "do not attempt without decomposing
/// first", and `config.model_for` gives it an empty model ladder on
/// purpose. So it is filtered here, not in `dag.open_leaves`, and a run
/// with only a walled leaf left correctly finds nothing to start rather
/// than erroring.
///
/// A research node goes last for the same reason it goes at all: it is a
/// search rather than a probe, its attempts are the run's most expensive,
/// and it is never exhausted — so it is what a free slot does when nothing
/// cheaper is startable, and never what it does instead of something
/// cheaper.
pub fn startable(d: dag.Dag) -> List(dag.Node) {
  let #(research, ordinary) =
    dag.open_leaves(d)
    |> list.filter(fn(n) { n.size != dag.Wall })
    |> list.partition(fn(n) { n.research })
  list.append(ordinary, research)
}

/// The assignment to start next, or `None` if nothing should start: every
/// slot is busy, the attempt budget is spent, or no `startable` leaf is
/// left that is not in `skip`. Claimed nodes are never open leaves, so a
/// node already in flight is excluded by the DAG itself; `skip` is for
/// nodes this run has decided not to touch again, such as one whose attempt
/// crashed. `busy` is the names in flight; persona availability never
/// changes which node is chosen, only who runs it.
pub fn next_to_start(
  d: dag.Dag,
  roster_: roster.Roster,
  plan: Plan,
  running running: Int,
  busy busy: List(String),
  dispatched dispatched: Int,
  skip skip: List(String),
) -> Option(Assignment) {
  case running < plan.concurrency && dispatched < plan.max_attempts {
    False -> None
    True ->
      startable(d)
      |> list.find(fn(n) { !list.contains(skip, n.id) })
      |> option.from_result
      |> option.map(fn(node) {
        Assignment(node:, who: who_for_node(roster_, node, busy:))
      })
  }
}
