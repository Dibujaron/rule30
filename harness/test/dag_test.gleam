import gleam/list
import gleam/option.{None, Some}
import gleam/string
import harness/dag.{type Node, Attempt, Dag, Node}

fn node(
  id: String,
  deps: List(String),
  status: dag.Status,
  size: dag.Size,
) -> Node {
  Node(
    id:,
    region: "P1",
    lean_name: id,
    description: "d " <> id,
    deps:,
    status:,
    size:,
    proof_file: None,
    attempts: [],
    verified: None,
  )
}

pub fn open_leaves_ranks_by_unblocks_then_size_test() {
  let d =
    Dag([
      node("a", [], dag.Open, dag.M),
      node("b", [], dag.Open, dag.S),
      node("c", ["a"], dag.Open, dag.S),
      node("d", ["a", "b"], dag.Open, dag.S),
      node("p", [], dag.Proved, dag.S),
    ])
  // a unblocks c (d also needs b, which is open) → 1; b unblocks nothing yet → 0
  assert dag.unblocks(d, "a") == 1
  assert dag.unblocks(d, "b") == 0
  assert list.map(dag.open_leaves(d), fn(n) { n.id }) == ["a", "b"]
}

pub fn round_trip_json_test() {
  let d =
    Dag([
      Node(
        id: "evolve_left_edge",
        region: "P1",
        lean_name: "evolve_left_edge",
        description: "left edge is black",
        deps: ["cone"],
        status: dag.Claimed,
        size: dag.M,
        proof_file: Some("Rule30/Proofs/EvolveLeftEdge.lean"),
        attempts: [
          Attempt(
            identity: "X",
            session_id: "s",
            model: "sonnet",
            started: "t0",
            ended: "t1",
            outcome: dag.GaveUp,
            estimate: dag.L,
            reported: True,
            cost_usd: 0.5,
            turns: 7,
            notes: "stuck on abs",
          ),
        ],
        verified: None,
      ),
    ])
  let assert Ok(back) = dag.decode(dag.encode(d))
  assert back == d
}

pub fn proof_module_is_pascal_test() {
  let n = node("evolve_eq_false_of_outside_cone", [], dag.Open, dag.S)
  assert dag.proof_module(n) == "Rule30.Proofs.EvolveEqFalseOfOutsideCone"
  assert dag.proof_path(n) == "Rule30/Proofs/EvolveEqFalseOfOutsideCone.lean"
}

pub fn proof_module_preserves_tail_case_test() {
  let n = node("centerColumn_zero", [], dag.Open, dag.S)
  assert dag.proof_module(n) == "Rule30.Proofs.CenterColumnZero"
  assert dag.proof_path(n) == "Rule30/Proofs/CenterColumnZero.lean"
}

pub fn decode_rejects_two_nodes_that_share_a_proof_file_test() {
  // `evolve_left_edge` and `evolveLeftEdge` both pascal-case to
  // `EvolveLeftEdge`, so the second worker to close would silently overwrite
  // the first — and on Windows the paths are the same file regardless of
  // case.
  let clashing =
    Dag([
      node("evolve_left_edge", [], dag.Open, dag.S),
      node("evolveLeftEdge", [], dag.Open, dag.S),
      node("centerColumn_zero", [], dag.Open, dag.S),
    ])
  let assert Error(reason) = dag.decode(dag.encode(clashing))
  assert string.contains(reason, "same proof file")
  assert string.contains(reason, "evolve_left_edge, evolveLeftEdge")

  // The same DAG without the clash decodes.
  let assert Ok(_) =
    dag.decode(
      dag.encode(
        Dag([
          node("evolve_left_edge", [], dag.Open, dag.S),
          node("centerColumn_zero", [], dag.Open, dag.S),
        ]),
      ),
    )
}

pub fn served_is_proved_only_test() {
  let d =
    Dag([node("a", [], dag.Proved, dag.S), node("b", [], dag.Open, dag.S)])
  assert list.map(dag.served(d), fn(n) { n.id }) == ["a"]
}
