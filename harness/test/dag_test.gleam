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
    under: None,
    research: False,
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
            salvaged: False,
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
        under: None,
        research: False,
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

pub fn a_node_under_a_wall_keeps_it_through_a_save_test() {
  // `under` is the wall a block was seeded to attack, captain-set at
  // landing the way `object` is, and it is the relation `deps` cannot
  // carry: a wall is never dispatched and lists no dependents. Same
  // hazard, same test — a save must give back what the captain wrote.
  let n =
    Node(
      ..node("block_lemma", [], dag.Open, dag.S),
      under: Some("leftDiagonal_period_le"),
    )
  let text = dag.encode(Dag([n]))
  assert string.contains(text, "\"under\":\"leftDiagonal_period_le\"")
  let assert Ok(back) = dag.decode(text)
  assert back == Dag([n])
  let assert Ok(again) = dag.get(back, "block_lemma")
  assert again.under == Some("leftDiagonal_period_le")
  // Unvalidated: the id need not name a node on the board. The index shows
  // a wrong one; the decoder does not refuse the board over it.
  let stray = Node(..n, under: Some("no_such_wall"))
  let assert Ok(stray_back) = dag.decode(dag.encode(Dag([stray])))
  assert stray_back == Dag([stray])
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
  // The same for `under`: absent is a node seeded under no wall, and the
  // save writes no key for it — not `null`, not anything.
  assert n.under == None
  assert !string.contains(dag.encode(d), "under")
  // The same for `research`: absent is an ordinary node, and stays absent.
  assert n.research == False
  assert !string.contains(dag.encode(d), "research")
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
  // Counted as `"object":"` — the key followed by the opening quote of a
  // string — and not as `"object":` alone. A hand-written node may carry
  // `"object":null`, which means exactly what an absent key means and which
  // `encode` never produces (dag.gleam: the field is emitted only for
  // `Some`). Counting the KEY conflates a null with a value and fails the
  // moment a captain writes one explicitly, which happened on 2026-09-12.
  //
  // The intent survives the tighter pattern: a decoder that agreed with
  // itself about `None` would carry zero against a raw count of 169.
  //
  // But the tighter pattern is also more TOLERANT, and that cost something
  // once: the key-count version went red on two nodes whose `object` had been
  // blanked, and that red was a true signal about the BOARD rather than about
  // the test. Counting values would have passed it silently. So the data
  // question is asserted separately below rather than riding on this one.
  assert list.length(carried) == count_occurrences(text, "\"object\":\"")
  let assert Ok(saved) = dag.decode(dag.encode(board))
  assert list.map(saved.nodes, fn(n) { #(n.id, n.object) })
    == list.map(board.nodes, fn(n) { #(n.id, n.object) })
  assert count_occurrences(dag.encode(board), "\"object\":")
    == list.length(carried)
  // And the data question, which the count above no longer answers: every
  // node names the mathematical object it is about. A blanked `object` is not
  // a null to tolerate, it is a node nobody can find by subject — and it
  // arrived on 2026-09-12 from a captain building nodes off a prototype and
  // clearing every field they were unsure of, which cleared two that were not
  // theirs to clear.
  assert count_occurrences(text, "\"object\":null") == 0
  assert list.length(carried) == list.length(board.nodes)
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

pub fn a_research_node_keeps_its_mark_through_a_save_test() {
  // The captain marks a node `research` by hand; the harness only carries
  // the mark, and a save must write it back exactly once, as `true`.
  let n = Node(..node("hard_lemma", [], dag.Open, dag.L), research: True)
  let text = dag.encode(Dag([n]))
  assert string.contains(text, "\"research\":true")
  let assert Ok(back) = dag.decode(text)
  assert back == Dag([n])
  let assert Ok(again) = dag.get(back, "hard_lemma")
  assert again.research == True
  // An explicit `false` on disk reads as an ordinary node and is dropped on
  // the way back out, like an absent key.
  let explicit =
    "{\"nodes\":[{\"id\":\"plain\",\"region\":\"P1\",\"lean_name\":\"plain\","
    <> "\"description\":\"d\",\"deps\":[],\"status\":\"open\",\"size\":\"S\","
    <> "\"proof_file\":null,\"attempts\":[],\"verified\":null,\"research\":false}]}"
  let assert Ok(d) = dag.decode(explicit)
  let assert Ok(plain) = dag.get(d, "plain")
  assert plain.research == False
  assert !string.contains(dag.encode(d), "research")
}

/// A scratch DAG on disk, one directory per test so the tests cannot see
/// each other's files. Returns the path.
fn scratch_dag(name: String, d: dag.Dag) -> String {
  let dir = "build/test-runs/dag/" <> name
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let path = dir <> "/dag.json"
  let assert Ok(_) = dag.save(d, path)
  path
}

pub fn save_node_keeps_a_node_another_writer_added_test() {
  // The clobber this exists to stop. The dispatcher loads the DAG once at
  // the start of a run and writes the whole file back at every attempt
  // end, so a captain who seeds a node in between is doing a
  // read-modify-write against a copy the dispatcher is also holding — and
  // the dispatcher's write wins, silently, with no conflict and no error.
  // A node was lost exactly this way on 2026-09-08 (board:
  // a-captain-seeding-during-a-live-run-loses-the-node-silently).
  //
  // The fix is that a writer touching ONE node has no reason to write the
  // other hundred. This test fails against a whole-file `save` of the
  // stale copy, which is what makes it a test rather than a restatement.
  let path =
    scratch_dag(
      "concurrent",
      Dag([
        node("held", [], dag.Open, dag.M),
        node("other", [], dag.Open, dag.S),
      ]),
    )
  // The dispatcher's copy, loaded at the start of the run.
  let assert Ok(stale) = dag.load(path)

  // The captain seeds a new node, and edits nothing the dispatcher holds.
  let assert Ok(fresh) = dag.load(path)
  let seeded = node("seeded_meanwhile", [], dag.Open, dag.S)
  let assert Ok(_) = dag.save(Dag([seeded, ..fresh.nodes]), path)

  // The dispatcher now records its attempt on the node it does hold.
  let assert Ok(held) = dag.get(stale, "held")
  let assert Ok(merged) = dag.save_node(Node(..held, status: dag.Proved), path)

  // Both writes survive: the seed is still on the board, and the
  // dispatcher's own change landed.
  let assert Ok(after) = dag.load(path)
  assert list.map(after.nodes, fn(n) { n.id })
    == ["seeded_meanwhile", "held", "other"]
  let assert Ok(kept) = dag.get(after, "seeded_meanwhile")
  assert kept.status == dag.Open
  let assert Ok(recorded) = dag.get(after, "held")
  assert recorded.status == dag.Proved

  // And the caller is handed the merged board to adopt, so its NEXT write
  // is not based on the stale copy either. Without this the second write
  // reverts the first: the same bug one attempt later.
  assert merged == after
}

pub fn save_node_writes_a_node_the_file_does_not_have_test() {
  // A node held in memory but absent from the file on disk — the shape a
  // `reopen` or a hand-repaired board can produce. `dag.update` replaces
  // by id and adds nothing, so `save_node` must not silently drop the
  // write and report success.
  let path = scratch_dag("absent", Dag([node("a", [], dag.Open, dag.S)]))
  let assert Error(msg) =
    dag.save_node(node("never_seeded", [], dag.Open, dag.S), path)
  assert string.contains(msg, "never_seeded")
}

/// A salvaged attempt says so on the board, and an ordinary one carries no
/// key at all.
///
/// The key is written only when true, the way `research` is on a node, so
/// every attempt recorded before salvage existed round-trips unchanged. It is
/// written at all because `proved` on an attempt whose worker reported
/// `abandoned` is a true record and a confusing one: a reader given no reason
/// for it will reconstruct a wrong story about that node.
pub fn a_salvaged_attempt_round_trips_and_an_ordinary_one_adds_no_key_test() {
  let base =
    Attempt(
      identity: "X",
      session_id: "s",
      model: "haiku",
      started: "t0",
      ended: "t1",
      outcome: dag.Closed,
      estimate: dag.S,
      reported: False,
      salvaged: True,
      cost_usd: 1.0,
      turns: 4,
      notes: "the kernel accepted the parked proof",
    )
  let node = Node(..node("n", [], dag.Proved, dag.S), attempts: [base])
  let text = dag.encode(Dag([node]))
  assert string.contains(text, "\"salvaged\":true")
  let assert Ok(Dag([back])) = dag.decode(text)
  let assert [a] = back.attempts
  assert a.salvaged == True

  // The ordinary case writes no key, and decodes to False.
  let plain = Attempt(..base, salvaged: False)
  let plain_text = dag.encode(Dag([Node(..node, attempts: [plain])]))
  assert !string.contains(plain_text, "\"salvaged\"")
  let assert Ok(Dag([plain_back])) = dag.decode(plain_text)
  let assert [b] = plain_back.attempts
  assert b.salvaged == False
}
