import gleam/list
import gleam/option.{None, Some}
import gleam/string
import harness/dag.{type Node, Attempt, Dag, Node}
import simplifile

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
    claimed_by: None,
    claimed_at: None,
    claimed_run: None,
    object: None,
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
        claimed_by: Some("Vesper"),
        claimed_at: Some("2026-09-07T03:00:00Z"),
        claimed_run: Some("20260907T030000Z"),
        object: Some("row"),
      ),
    ])
  let assert Ok(back) = dag.decode(dag.encode(d))
  assert back == d
  // The field names are the contract the shell-side readers grep for.
  let text = dag.encode(d)
  assert string.contains(text, "\"claimed_by\":\"Vesper\"")
  assert string.contains(text, "\"claimed_at\":\"2026-09-07T03:00:00Z\"")
  assert string.contains(text, "\"claimed_run\":\"20260907T030000Z\"")
  assert string.contains(text, "\"object\":\"row\"")
}

pub fn a_node_with_an_object_keeps_it_through_a_save_test() {
  // The captain writes `object` on the board by hand and the harness never
  // sets it. The hazard is a run's first `save` — a claim, a returned
  // attempt — re-encoding every node from its record and quietly dropping
  // a field the record never carried.
  let n = Node(..node("row_lemma", [], dag.Open, dag.S), object: Some("row"))
  let assert Ok(back) = dag.decode(dag.encode(Dag([n])))
  assert back == Dag([n])
  let assert Ok(again) = dag.get(back, "row_lemma")
  assert again.object == Some("row")
  // The value is carried, not checked: a word outside the vocabulary is the
  // renderer's problem to show, not the decoder's to refuse.
  let odd = Node(..n, object: Some("not-a-known-object"))
  let assert Ok(odd_back) = dag.decode(dag.encode(Dag([odd])))
  assert odd_back == Dag([odd])
}

pub fn a_node_without_an_object_decodes_to_none_and_stays_keyless_test() {
  // A hand-written row with no `object` key is an unclassified node, and
  // saving it must not invent a key — not `null`, not anything — so that
  // what the board says after a run is what the captain wrote before it.
  let text =
    "{\"nodes\":[{\"id\":\"plain\",\"region\":\"P1\",\"lean_name\":\"plain\","
    <> "\"description\":\"d\",\"deps\":[],\"status\":\"open\",\"size\":\"S\","
    <> "\"proof_file\":null,\"attempts\":[],\"verified\":null}]}"
  let assert Ok(d) = dag.decode(text)
  let assert Ok(n) = dag.get(d, "plain")
  assert n.object == None
  assert !string.contains(dag.encode(d), "object")
  let assert Ok(again) = dag.decode(dag.encode(d))
  assert again == d
}

pub fn the_real_board_loses_no_object_through_a_save_test() {
  // The checked-in board of this tree, read and never written. Every
  // `object` the file carries must come out of `decode`, and go back into
  // `encode`, unchanged — the count against the raw text is what shows the
  // decoder is reading the key rather than agreeing with itself about
  // `None`. (A board with no `object` keys at all passes this vacuously,
  // and starts meaning something the moment the captain writes one.)
  let path = "../blueprint/dag.json"
  let assert Ok(text) = simplifile.read(path)
  let assert Ok(board) = dag.load(path)
  let carried =
    list.filter_map(board.nodes, fn(n) { option.to_result(n.object, Nil) })
  assert list.length(carried) == count_occurrences(text, "\"object\":")
  let assert Ok(saved) = dag.decode(dag.encode(board))
  assert list.map(saved.nodes, fn(n) { #(n.id, n.object) })
    == list.map(board.nodes, fn(n) { #(n.id, n.object) })
  assert count_occurrences(dag.encode(board), "\"object\":")
    == list.length(carried)
}

fn count_occurrences(haystack: String, needle: String) -> Int {
  list.length(string.split(haystack, needle)) - 1
}

pub fn a_row_written_before_claims_had_a_record_decodes_test() {
  // A `dag.json` from before the three claim fields existed has no such
  // keys at all. It must still load — the board is the source of truth and
  // a decoder that refused it would take the whole board down — and a
  // claimed node from then honestly has no holder, time or run.
  let text =
    "{\"nodes\":[{\"id\":\"old_claim\",\"region\":\"P1\",\"lean_name\":\"old_claim\","
    <> "\"description\":\"d\",\"deps\":[],\"status\":\"claimed\",\"size\":\"S\","
    <> "\"proof_file\":null,\"attempts\":[],\"verified\":null}]}"
  let assert Ok(d) = dag.decode(text)
  let assert Ok(n) = dag.get(d, "old_claim")
  assert n.status == dag.Claimed
  assert n.claimed_by == None
  assert n.claimed_at == None
  assert n.claimed_run == None
  // And `null`, which is what `encode` writes for an unclaimed node, reads
  // back the same way.
  let assert Ok(again) = dag.decode(dag.encode(d))
  assert again == d
}

pub fn claim_sets_all_three_and_release_clears_them_test() {
  let n = node("evolve_left_edge", [], dag.Open, dag.M)
  let held =
    dag.claim(
      n,
      by: "Vesper",
      at: "2026-09-07T03:00:00Z",
      run: "20260907T030000Z",
    )
  assert held.status == dag.Claimed
  assert held.proof_file == Some("Rule30/Proofs/EvolveLeftEdge.lean")
  assert held.claimed_by == Some("Vesper")
  assert held.claimed_at == Some("2026-09-07T03:00:00Z")
  assert held.claimed_run == Some("20260907T030000Z")
  // Every way out of `Claimed` goes through `release`, and none of them
  // keeps a claim: a proved node is not held, and neither is an abandoned
  // one.
  let proved = dag.release(held, dag.Proved)
  assert proved.status == dag.Proved
  assert proved.claimed_by == None
  assert proved.claimed_at == None
  assert proved.claimed_run == None
  assert dag.release(held, dag.Open).claimed_run == None
  assert dag.release(held, dag.Abandoned).claimed_by == None
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
