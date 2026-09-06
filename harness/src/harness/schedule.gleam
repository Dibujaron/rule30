//// The scheduler's pure half. The DAG is a build graph: a node is a task,
//// an open leaf is a task whose dependencies are all satisfied, and `run`
//// is the scheduler that keeps up to `concurrency` of them in flight until
//// `max_attempts` have been started. Everything here is a function of the
//// DAG and two counters, so it is unit-tested as one; the process spawning
//// and the waiting live in `dispatch.run`.

import gleam/int
import gleam/list
import gleam/option.{type Option, None}
import harness/dag

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

/// The node to start next, or `None` if nothing should start: every slot is
/// busy, the attempt budget is spent, or no open leaf is left that is not
/// in `skip`. Claimed nodes are never open leaves, so a node already in
/// flight is excluded by the DAG itself; `skip` is for nodes this run has
/// decided not to touch again, such as one whose attempt crashed.
pub fn next_to_start(
  d: dag.Dag,
  plan: Plan,
  running running: Int,
  dispatched dispatched: Int,
  skip skip: List(String),
) -> Option(dag.Node) {
  case running < plan.concurrency && dispatched < plan.max_attempts {
    False -> None
    True ->
      dag.open_leaves(d)
      |> list.find(fn(n) { !list.contains(skip, n.id) })
      |> option.from_result
  }
}
