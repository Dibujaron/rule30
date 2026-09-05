//// The proof DAG: nodes are Lean lemmas with dependencies, a status, and a
//// history of dispatch attempts. Persisted as JSON so the dispatcher and any
//// tooling can share one file as the source of truth.

import gleam/dynamic/decode
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{type Option}
import gleam/order
import gleam/result
import gleam/string
import simplifile

/// Where a node stands in the proving pipeline.
pub type Status {
  Open
  Claimed
  Proved
  Blocked
  Abandoned
}

/// A rough estimate of how much work a lemma takes, used to prioritise
/// otherwise-equal open leaves.
pub type Size {
  S
  M
  L
  Wall
}

/// How one dispatch attempt at a node ended.
pub type Outcome {
  Closed
  GaveUp
  Reduced
  BudgetExhausted
  RateLimited
  TimedOut
}

/// A record of one Claude Code session dispatched at a node.
pub type Attempt {
  Attempt(
    identity: String,
    session_id: String,
    model: String,
    started: String,
    ended: String,
    outcome: Outcome,
    estimate: Size,
    cost_usd: Float,
    turns: Int,
    notes: String,
  )
}

/// One Lean lemma in the proof DAG.
pub type Node {
  Node(
    id: String,
    region: String,
    lean_name: String,
    description: String,
    deps: List(String),
    status: Status,
    size: Size,
    proof_file: Option(String),
    attempts: List(Attempt),
    verified: Option(String),
  )
}

/// The full proof DAG.
pub type Dag {
  Dag(nodes: List(Node))
}

/// Parse a `Dag` from its JSON text representation.
pub fn decode(text: String) -> Result(Dag, String) {
  json.parse(from: text, using: dag_decoder())
  |> result.map_error(fn(e) { string.inspect(e) })
}

/// Render a `Dag` to its JSON text representation.
pub fn encode(dag: Dag) -> String {
  dag_to_json(dag) |> json.to_string
}

/// Read and decode a `Dag` from a file.
pub fn load(path: String) -> Result(Dag, String) {
  use text <- result.try(
    simplifile.read(path)
    |> result.map_error(fn(e) { simplifile.describe_error(e) }),
  )
  decode(text)
}

/// Encode and write a `Dag` to a file, one trailing newline.
pub fn save(dag: Dag, path: String) -> Result(Nil, String) {
  simplifile.write(path, encode(dag) <> "\n")
  |> result.map_error(fn(e) { simplifile.describe_error(e) })
}

/// Find the node with the given id.
pub fn get(dag: Dag, id: String) -> Result(Node, Nil) {
  dag.nodes
  |> list.find(fn(n) { n.id == id })
}

/// Replace the node with the same id as `node`, leaving the rest untouched.
pub fn update(dag: Dag, node: Node) -> Dag {
  Dag(
    dag.nodes
    |> list.map(fn(n) {
      case n.id == node.id {
        True -> node
        False -> n
      }
    }),
  )
}

/// Is this node open and ready to work on: itself `Open`, every dependency
/// `Proved`.
pub fn is_open_leaf(dag: Dag, node: Node) -> Bool {
  case node.status {
    Open ->
      node.deps
      |> list.all(fn(dep_id) {
        case get(dag, dep_id) {
          Ok(dep) -> dep.status == Proved
          Error(Nil) -> False
        }
      })
    _ -> False
  }
}

/// Every open leaf, ranked by how many other nodes it would unblock
/// (descending), then by size (ascending: `S < M < L < Wall`), then by id.
pub fn open_leaves(dag: Dag) -> List(Node) {
  dag.nodes
  |> list.filter(is_open_leaf(dag, _))
  |> list.sort(fn(a, b) {
    order.break_tie(
      int.compare(unblocks(dag, b.id), unblocks(dag, a.id)),
      order.break_tie(
        int.compare(size_rank(a.size), size_rank(b.size)),
        string.compare(a.id, b.id),
      ),
    )
  })
}

fn size_rank(size: Size) -> Int {
  case size {
    S -> 0
    M -> 1
    L -> 2
    Wall -> 3
  }
}

/// How many nodes list `id` as a dependency and would become open leaves as
/// soon as `id` is proved (i.e. all their other deps are already `Proved`).
pub fn unblocks(dag: Dag, id: String) -> Int {
  dag.nodes
  |> list.filter(fn(n) {
    list.contains(n.deps, id)
    && n.deps
    |> list.all(fn(dep_id) {
      case dep_id == id {
        True -> True
        False ->
          case get(dag, dep_id) {
            Ok(dep) -> dep.status == Proved
            Error(Nil) -> False
          }
      }
    })
  })
  |> list.length
}

/// Every node that has been proved.
pub fn served(dag: Dag) -> List(Node) {
  dag.nodes
  |> list.filter(fn(n) { n.status == Proved })
}

/// The Lean module name for a node's proof, e.g. `Rule30.Proofs.EvolveLeftEdge`.
pub fn proof_module(node: Node) -> String {
  "Rule30.Proofs." <> pascal_case(node.id)
}

/// The Lean file path for a node's proof, e.g. `Rule30/Proofs/EvolveLeftEdge.lean`.
pub fn proof_path(node: Node) -> String {
  "Rule30/Proofs/" <> pascal_case(node.id) <> ".lean"
}

fn pascal_case(id: String) -> String {
  id
  |> string.split("_")
  |> list.map(string.capitalise)
  |> string.join("")
}

/// Render a `Size` to its JSON string form.
pub fn size_to_string(s: Size) -> String {
  case s {
    S -> "S"
    M -> "M"
    L -> "L"
    Wall -> "wall"
  }
}

/// Parse a `Size` from its JSON string form.
pub fn size_from_string(s: String) -> Result(Size, Nil) {
  case s {
    "S" -> Ok(S)
    "M" -> Ok(M)
    "L" -> Ok(L)
    "wall" -> Ok(Wall)
    _ -> Error(Nil)
  }
}

/// Render a `Status` to its JSON string form.
pub fn status_to_string(s: Status) -> String {
  case s {
    Open -> "open"
    Claimed -> "claimed"
    Proved -> "proved"
    Blocked -> "blocked"
    Abandoned -> "abandoned"
  }
}

fn status_from_string(s: String) -> Result(Status, Nil) {
  case s {
    "open" -> Ok(Open)
    "claimed" -> Ok(Claimed)
    "proved" -> Ok(Proved)
    "blocked" -> Ok(Blocked)
    "abandoned" -> Ok(Abandoned)
    _ -> Error(Nil)
  }
}

/// Render an `Outcome` to its JSON string form.
pub fn outcome_to_string(o: Outcome) -> String {
  case o {
    Closed -> "proved"
    GaveUp -> "abandoned"
    Reduced -> "reduced"
    BudgetExhausted -> "budget_exhausted"
    RateLimited -> "rate_limited"
    TimedOut -> "timed_out"
  }
}

fn outcome_from_string(s: String) -> Result(Outcome, Nil) {
  case s {
    "proved" -> Ok(Closed)
    "abandoned" -> Ok(GaveUp)
    "reduced" -> Ok(Reduced)
    "budget_exhausted" -> Ok(BudgetExhausted)
    "rate_limited" -> Ok(RateLimited)
    "timed_out" -> Ok(TimedOut)
    _ -> Error(Nil)
  }
}

fn status_decoder() -> decode.Decoder(Status) {
  decode.string
  |> decode.then(fn(s) {
    case status_from_string(s) {
      Ok(v) -> decode.success(v)
      Error(Nil) -> decode.failure(Open, "Status")
    }
  })
}

fn size_decoder() -> decode.Decoder(Size) {
  decode.string
  |> decode.then(fn(s) {
    case size_from_string(s) {
      Ok(v) -> decode.success(v)
      Error(Nil) -> decode.failure(S, "Size")
    }
  })
}

fn outcome_decoder() -> decode.Decoder(Outcome) {
  decode.string
  |> decode.then(fn(s) {
    case outcome_from_string(s) {
      Ok(v) -> decode.success(v)
      Error(Nil) -> decode.failure(Closed, "Outcome")
    }
  })
}

fn attempt_decoder() -> decode.Decoder(Attempt) {
  use identity <- decode.field("identity", decode.string)
  use session_id <- decode.field("session_id", decode.string)
  use model <- decode.field("model", decode.string)
  use started <- decode.field("started", decode.string)
  use ended <- decode.field("ended", decode.string)
  use outcome <- decode.field("outcome", outcome_decoder())
  use estimate <- decode.field("estimate", size_decoder())
  use cost_usd <- decode.field("cost_usd", decode.float)
  use turns <- decode.field("turns", decode.int)
  use notes <- decode.field("notes", decode.string)
  decode.success(Attempt(
    identity:,
    session_id:,
    model:,
    started:,
    ended:,
    outcome:,
    estimate:,
    cost_usd:,
    turns:,
    notes:,
  ))
}

fn node_decoder() -> decode.Decoder(Node) {
  use id <- decode.field("id", decode.string)
  use region <- decode.field("region", decode.string)
  use lean_name <- decode.field("lean_name", decode.string)
  use description <- decode.field("description", decode.string)
  use deps <- decode.field("deps", decode.list(decode.string))
  use status <- decode.field("status", status_decoder())
  use size <- decode.field("size", size_decoder())
  use proof_file <- decode.field("proof_file", decode.optional(decode.string))
  use attempts <- decode.field("attempts", decode.list(attempt_decoder()))
  use verified <- decode.field("verified", decode.optional(decode.string))
  decode.success(Node(
    id:,
    region:,
    lean_name:,
    description:,
    deps:,
    status:,
    size:,
    proof_file:,
    attempts:,
    verified:,
  ))
}

fn dag_decoder() -> decode.Decoder(Dag) {
  use nodes <- decode.field("nodes", decode.list(node_decoder()))
  decode.success(Dag(nodes:))
}

fn attempt_to_json(attempt: Attempt) -> json.Json {
  json.object([
    #("identity", json.string(attempt.identity)),
    #("session_id", json.string(attempt.session_id)),
    #("model", json.string(attempt.model)),
    #("started", json.string(attempt.started)),
    #("ended", json.string(attempt.ended)),
    #("outcome", json.string(outcome_to_string(attempt.outcome))),
    #("estimate", json.string(size_to_string(attempt.estimate))),
    #("cost_usd", json.float(attempt.cost_usd)),
    #("turns", json.int(attempt.turns)),
    #("notes", json.string(attempt.notes)),
  ])
}

fn node_to_json(node: Node) -> json.Json {
  json.object([
    #("id", json.string(node.id)),
    #("region", json.string(node.region)),
    #("lean_name", json.string(node.lean_name)),
    #("description", json.string(node.description)),
    #("deps", json.array(node.deps, json.string)),
    #("status", json.string(status_to_string(node.status))),
    #("size", json.string(size_to_string(node.size))),
    #("proof_file", json.nullable(node.proof_file, json.string)),
    #("attempts", json.array(node.attempts, attempt_to_json)),
    #("verified", json.nullable(node.verified, json.string)),
  ])
}

fn dag_to_json(dag: Dag) -> json.Json {
  json.object([#("nodes", json.array(dag.nodes, node_to_json))])
}
