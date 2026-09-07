//// The proof DAG: nodes are Lean lemmas with dependencies, a status, and a
//// history of dispatch attempts. Persisted as JSON so the dispatcher and any
//// tooling can share one file as the source of truth.

import gleam/dynamic/decode
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
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
///
/// Every constructor but the last is a claim about the worker or the node.
/// `HarnessFailed` is a claim about the harness: the attempt happened and
/// tells you nothing about the node, because something on the harness's
/// side of the trust boundary broke it. It is the one outcome that neither
/// spends a rung of the model ladder (`dispatch.failed_attempts`) nor scores
/// the identity's calibration (`roster.scorecard`). `dispatch.attribute`
/// is where an attempt earns it, and lists the signals that count.
pub type Outcome {
  Closed
  GaveUp
  Reduced
  BudgetExhausted
  RateLimited
  TimedOut
  HarnessFailed
}

/// A record of one Claude Code session dispatched at a node.
///
/// `reported` says whether `estimate` is the worker's own re-pricing or just
/// the node's size copied in because the attempt never produced a structured
/// report. Only a re-pricing is evidence about the identity's calibration:
/// an attempt that died before reporting would otherwise score a free hit
/// for agreeing with a number it never saw.
pub type Attempt {
  Attempt(
    identity: String,
    session_id: String,
    model: String,
    started: String,
    ended: String,
    outcome: Outcome,
    estimate: Size,
    reported: Bool,
    cost_usd: Float,
    turns: Int,
    notes: String,
  )
}

/// One Lean lemma in the proof DAG.
///
/// The DAG is a build graph and a `Claimed` node is a task the scheduler has
/// handed out and not yet had back. The three `claimed_*` fields are the
/// claim's own record: who holds it, since when, and which run
/// (`runs/<claimed_run>/`) is holding it. They are `Some` exactly while the
/// node is `Claimed` and `None` otherwise — `claim` sets all three and
/// `release` clears them, and every status change out of `Claimed` goes
/// through `release`. The `attempts` rows cannot stand in for them: an
/// attempt is appended when it ends, so a node held by a live run has no
/// row for the attempt holding it.
///
/// The run id is the checkable half. A dispatched prover is not a registered
/// session, so the one thing outside the process that can vouch for a claim
/// is the run directory: `runs/<claimed_run>/summary.txt` exists only once
/// that run has written its closing summary, after which the claim is
/// certainly stale. Its absence proves nothing — the run may be live or may
/// have died without writing — which is why `claimed_at` is there too.
///
/// `object` is what the theorem is *about* — `row`, `column`,
/// `leftDiagonal`, `machine`, and so on — set by hand on the board by the
/// captain and read by the index renderer, which groups entries by it. The
/// harness never sets it and never checks the value: it only carries it,
/// so that a run's `save` gives back exactly what the captain wrote. `None`
/// is a node nobody has classified yet, and the file carries no key for it.
///
/// `under` is the wall this node was seeded to attack — the id of a `Wall`
/// node — set by hand on the board by the captain at landing, and carried
/// the way `object` is: never set, never checked, encoded only when
/// present. It is a different relation from `deps`. `deps` means "must be
/// proved before this node is dispatched" and the scheduler reads it that
/// way; a wall is never dispatched and lists no dependents, so the walls a
/// block attacks cannot be recovered from `deps` — the index renderer
/// computed exactly that and rendered it on zero of 64 nodes. `None` is a
/// node seeded under no wall, and the file carries no key for it.
///
/// `research` marks a task the scheduler keeps retrying at full strength: a
/// node where nobody knows the proof, so an attempt is a search rather than
/// a probe. The model ladder is a cost optimiser and below its top rung a
/// research node climbs it like any other; at the top rung it is never
/// exhausted (`config.model_for`), runs under the research budget
/// (`config.for_attempt`), and is offered only when nothing cheaper is
/// startable (`schedule.startable`). Set by hand on the board by the
/// captain; the harness never sets it. Absent from the file means `False`,
/// and a save writes the key only when it is `True`.
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
    claimed_by: Option(String),
    claimed_at: Option(String),
    claimed_run: Option(String),
    object: Option(String),
    under: Option(String),
    research: Bool,
  )
}

/// The full proof DAG.
pub type Dag {
  Dag(nodes: List(Node))
}

/// Parse a `Dag` from its JSON text representation, rejecting a DAG whose
/// nodes would share a proof file.
pub fn decode(text: String) -> Result(Dag, String) {
  use dag <- result.try(
    json.parse(from: text, using: dag_decoder())
    |> result.map_error(fn(e) { string.inspect(e) }),
  )
  use _ <- result.try(no_duplicate_proof_paths(dag))
  Ok(dag)
}

/// Two node ids that pascal-case to the same module — `evolve_left_edge` and
/// `evolveLeftEdge`, say — would be dispatched at the same file, and the
/// second worker to close would silently overwrite the first. Windows paths
/// are case-insensitive too, so the comparison is.
fn no_duplicate_proof_paths(dag: Dag) -> Result(Nil, String) {
  let paths =
    list.map(dag.nodes, fn(n) { #(n.id, string.lowercase(proof_path(n))) })
  case
    list.find(paths, fn(entry) {
      list.count(paths, fn(other) { other.1 == entry.1 }) > 1
    })
  {
    Error(Nil) -> Ok(Nil)
    Ok(#(_, path)) ->
      Error(
        "two or more nodes map to the same proof file `"
        <> path
        <> "`: "
        <> {
          paths
          |> list.filter(fn(entry) { entry.1 == path })
          |> list.map(fn(entry) { entry.0 })
          |> string.join(", ")
        },
      )
  }
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

/// `node` handed out: `Claimed`, pointed at its proof file, and carrying who
/// holds it (`by`, the persona), since when (`at`, an ISO-8601 `Z` time) and
/// under which run (`run`, the `runs/<run>` directory name). Called at the
/// moment a worker is about to be launched, and nowhere else.
pub fn claim(
  node: Node,
  by by: String,
  at at: String,
  run run: String,
) -> Node {
  Node(
    ..node,
    status: Claimed,
    proof_file: Some(proof_path(node)),
    claimed_by: Some(by),
    claimed_at: Some(at),
    claimed_run: Some(run),
  )
}

/// `node` with its claim handed back and `status` set. The scheduler no
/// longer holds this task — the attempt ended, the attempt's process died,
/// or a hand `reopen` decided the holder is gone — so the three claim
/// fields are cleared together. Whatever the outcome, a node that is not
/// `Claimed` carries no claim.
pub fn release(node: Node, status: Status) -> Node {
  Node(..node, status:, claimed_by: None, claimed_at: None, claimed_run: None)
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
  |> list.map(capitalise_first_grapheme)
  |> string.join("")
}

/// Uppercase only the first grapheme of `part`, leaving the rest exactly as
/// written (unlike `string.capitalise`, which lowercases the tail too).
fn capitalise_first_grapheme(part: String) -> String {
  case string.pop_grapheme(part) {
    Ok(#(first, rest)) -> string.uppercase(first) <> rest
    Error(Nil) -> part
  }
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
    HarnessFailed -> "harness_failed"
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
    "harness_failed" -> Ok(HarnessFailed)
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
  // Absent on attempts recorded before the field existed. Those all carried
  // a report — the only outcomes on the board then were `proved` ones — so
  // `True` is the honest default, and it keeps their calibration unchanged.
  use reported <- decode.optional_field("reported", True, decode.bool)
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
    reported:,
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
  // Absent on rows written before a claim had a record of its own; a node
  // claimed then is a node whose holder, time and run are unknown, and
  // `None` says exactly that.
  use claimed_by <- decode.optional_field(
    "claimed_by",
    None,
    decode.optional(decode.string),
  )
  use claimed_at <- decode.optional_field(
    "claimed_at",
    None,
    decode.optional(decode.string),
  )
  use claimed_run <- decode.optional_field(
    "claimed_run",
    None,
    decode.optional(decode.string),
  )
  // Absent on every node the captain has not classified. The value is not
  // checked against any vocabulary: the renderer that groups by it is the
  // place an unknown word shows up, and a decoder that refused one would
  // take the whole board down over a label.
  use object <- decode.optional_field(
    "object",
    None,
    decode.optional(decode.string),
  )
  // Absent on every node seeded under no wall. Unvalidated for `object`'s
  // reason: the value is a wall's id the captain wrote, and the renderer
  // that prints it is where a wrong one shows up.
  use under <- decode.optional_field(
    "under",
    None,
    decode.optional(decode.string),
  )
  // Absent on every node the captain has not marked; an ordinary node.
  use research <- decode.optional_field("research", False, decode.bool)
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
    claimed_by:,
    claimed_at:,
    claimed_run:,
    object:,
    under:,
    research:,
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
    #("reported", json.bool(attempt.reported)),
    #("cost_usd", json.float(attempt.cost_usd)),
    #("turns", json.int(attempt.turns)),
    #("notes", json.string(attempt.notes)),
  ])
}

/// `object`, `under` and `research` are written only when they say
/// something: a node the captain has not classified carries no `object` key
/// on disk, a node seeded under no wall no `under` key, and an ordinary node
/// no `research` key, and a save must not invent any of them — `null` or
/// `false` would put a key on every node that the hand-written board does
/// not have.
fn node_to_json(node: Node) -> json.Json {
  let object = case node.object {
    Some(o) -> [#("object", json.string(o))]
    None -> []
  }
  let under = case node.under {
    Some(w) -> [#("under", json.string(w))]
    None -> []
  }
  let research = case node.research {
    True -> [#("research", json.bool(True))]
    False -> []
  }
  json.object(
    list.flatten([
      [
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
        #("claimed_by", json.nullable(node.claimed_by, json.string)),
        #("claimed_at", json.nullable(node.claimed_at, json.string)),
        #("claimed_run", json.nullable(node.claimed_run, json.string)),
      ],
      object,
      under,
      research,
    ]),
  )
}

fn dag_to_json(dag: Dag) -> json.Json {
  json.object([#("nodes", json.array(dag.nodes, node_to_json))])
}
