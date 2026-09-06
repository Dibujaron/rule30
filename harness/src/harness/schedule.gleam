//// The scheduler's pure half. The DAG is a build graph: a node is a task,
//// an open leaf is a task whose dependencies are all satisfied, and `run`
//// is the scheduler that keeps up to `concurrency` of them in flight until
//// `max_attempts` have been started. Everything here is a function of the
//// DAG and two counters, so it is unit-tested as one; the process spawning
//// and the waiting live in `dispatch.run`.

import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}
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
  case roster.idle_for_region(roster_, region, busy:) {
    Some(identity) -> Existing(identity)
    None ->
      Mint(
        region:,
        busy: roster.for_region(roster_, region)
          |> list.map(fn(i) { i.name })
          |> list.filter(fn(name) { list.contains(busy, name) }),
      )
  }
}

/// The assignment to start next, or `None` if nothing should start: every
/// slot is busy, the attempt budget is spent, or no open leaf is left that
/// is not in `skip`. Claimed nodes are never open leaves, so a node already
/// in flight is excluded by the DAG itself; `skip` is for nodes this run has
/// decided not to touch again, such as one whose attempt crashed. `busy`
/// is the names in flight; persona availability never changes which node
/// is chosen, only who runs it.
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
      dag.open_leaves(d)
      |> list.find(fn(n) { !list.contains(skip, n.id) })
      |> option.from_result
      |> option.map(fn(node) {
        Assignment(node:, who: who_for(roster_, node.region, busy:))
      })
  }
}
