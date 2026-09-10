//// The scheduler's pure half: what `run` is allowed to start next, and how
//// its flags are read. No sessions, no files.

import gleam/list
import gleam/option.{None, Some}
import harness/dag.{Attempt, Dag, Node}
import harness/roster.{type Identity, type Roster, Identity, Roster}
import harness/schedule.{Assignment, Existing, Mint, Plan}

fn node(id: String, status: dag.Status, deps: List(String)) -> dag.Node {
  Node(
    id:,
    region: "P2",
    lean_name: id,
    description: "a fixture node",
    deps:,
    status:,
    size: dag.S,
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

/// Two open leaves and one node behind them.
fn board() -> dag.Dag {
  Dag([
    node("a", dag.Open, []),
    node("b", dag.Open, []),
    node("c", dag.Open, ["a"]),
  ])
}

fn persona(name: String, region: String) -> Identity {
  Identity(
    name:,
    region:,
    created: "2026-09-05T00:00:00Z",
    naming_reason: "a fixture",
    opening: "",
    color: Some("#123456"),
  )
}

/// One P2 persona, Ada; the board's nodes are all P2.
fn one_persona() -> Roster {
  Roster([persona("Ada", "P2")])
}

fn two_personas() -> Roster {
  Roster([persona("Ada", "P2"), persona("Bea", "P2")])
}

// --- flags --------------------------------------------------------------------

pub fn plan_defaults_to_one_attempt_one_at_a_time_test() {
  assert schedule.parse_plan([]) == Ok(Plan(max_attempts: 1, concurrency: 1))
}

pub fn plan_reads_both_flags_in_either_order_test() {
  assert schedule.parse_plan(["--concurrency", "2", "--max-attempts", "5"])
    == Ok(Plan(max_attempts: 5, concurrency: 2))
  assert schedule.parse_plan(["--max-attempts", "5", "--concurrency", "2"])
    == Ok(Plan(max_attempts: 5, concurrency: 2))
}

pub fn plan_caps_concurrency_at_three_test() {
  let assert Error(reason) = schedule.parse_plan(["--concurrency", "4"])
  assert reason == "--concurrency must be between 1 and 3, not 4"
  let assert Error(_) = schedule.parse_plan(["--concurrency", "0"])
}

pub fn plan_rejects_a_flag_it_does_not_know_test() {
  let assert Error(reason) = schedule.parse_plan(["--max-nodes", "2"])
  assert reason == "unknown flag `--max-nodes`"
}

pub fn plan_rejects_a_non_number_and_a_missing_value_test() {
  let assert Error(_) = schedule.parse_plan(["--max-attempts", "many"])
  let assert Error(_) = schedule.parse_plan(["--max-attempts"])
  let assert Error(_) = schedule.parse_plan(["--max-attempts", "0"])
}

// --- what starts next -------------------------------------------------------------

pub fn next_is_the_first_open_leaf_with_its_idle_persona_test() {
  let assert Some(Assignment(node: n, who: Existing(who))) =
    schedule.next_to_start(
      board(),
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: [],
    )
  // `a` unblocks `c`, so it ranks first.
  assert n.id == "a"
  assert who.name == "Ada"
}

pub fn the_younger_persona_goes_when_the_eldest_is_busy_test() {
  let assert Some(Assignment(who: Existing(who), ..)) =
    schedule.next_to_start(
      board(),
      two_personas(),
      Plan(3, 2),
      running: 1,
      busy: ["Ada"],
      dispatched: 1,
      skip: [],
    )
  assert who.name == "Bea"
}

pub fn a_mint_is_decided_when_every_persona_is_busy_test() {
  let assert Some(Assignment(who: Mint(region:, busy:), ..)) =
    schedule.next_to_start(
      board(),
      one_persona(),
      Plan(3, 2),
      running: 1,
      busy: ["Ada"],
      dispatched: 1,
      skip: [],
    )
  assert region == "P2"
  assert busy == ["Ada"]
}

pub fn a_mint_is_decided_for_an_empty_region_test() {
  let assert Some(Assignment(who: Mint(region: "P2", busy: []), ..)) =
    schedule.next_to_start(
      board(),
      Roster([]),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: [],
    )
}

pub fn nothing_starts_while_every_slot_is_busy_test() {
  assert schedule.next_to_start(
      board(),
      two_personas(),
      Plan(3, 2),
      running: 2,
      busy: ["Ada", "Bea"],
      dispatched: 2,
      skip: [],
    )
    == None
}

pub fn nothing_starts_past_the_attempt_budget_test() {
  assert schedule.next_to_start(
      board(),
      one_persona(),
      Plan(2, 3),
      running: 0,
      busy: [],
      dispatched: 2,
      skip: [],
    )
    == None
}

pub fn a_claimed_node_is_not_a_candidate_test() {
  let d = dag.update(board(), node("a", dag.Claimed, []))
  let assert Some(Assignment(node: n, ..)) =
    schedule.next_to_start(
      d,
      two_personas(),
      Plan(3, 2),
      running: 1,
      busy: ["Ada"],
      dispatched: 1,
      skip: [],
    )
  assert n.id == "b"
}

pub fn a_skipped_node_is_passed_over_test() {
  let assert Some(Assignment(node: n, ..)) =
    schedule.next_to_start(
      board(),
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: ["a"],
    )
  assert n.id == "b"
  assert schedule.next_to_start(
      board(),
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: ["a", "b"],
    )
    == None
}

pub fn who_for_is_the_same_rule_on_its_own_test() {
  assert schedule.who_for(two_personas(), "P2", busy: ["Ada"])
    == Existing(persona("Bea", "P2"))
  assert schedule.who_for(two_personas(), "P1", busy: [])
    == Mint(region: "P1", busy: [])
}

// --- wall nodes ---------------------------------------------------------------

fn wall_node(id: String, deps: List(String)) -> dag.Node {
  Node(..node(id, dag.Open, deps), size: dag.Wall)
}

/// `w` is a wall node with two dependents, which gives it a higher
/// `unblocks` count than `b` and so ranks it first in `dag.open_leaves` —
/// exactly the case that must not be dispatched as-is.
fn board_with_wall() -> dag.Dag {
  Dag([
    wall_node("w", []),
    node("d1", dag.Open, ["w"]),
    node("d2", dag.Open, ["w"]),
    node("b", dag.Open, []),
  ])
}

pub fn a_wall_leaf_is_skipped_and_the_next_candidate_starts_test() {
  let assert Some(Assignment(node: n, ..)) =
    schedule.next_to_start(
      board_with_wall(),
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: [],
    )
  // `w` ranks first by unblocks, but it is a wall: `b` is what actually starts.
  assert n.id == "b"
}

pub fn a_wall_leaf_alone_yields_none_test() {
  let d = Dag([wall_node("w", [])])
  assert schedule.next_to_start(
      d,
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: [],
    )
    == None
}

pub fn a_non_wall_leaf_is_still_selected_normally_test() {
  let assert Some(Assignment(node: n, ..)) =
    schedule.next_to_start(
      board(),
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: [],
    )
  assert n.id == "a"
  assert n.size == dag.S
}

// --- research nodes -----------------------------------------------------------

fn research_node(id: String, deps: List(String)) -> dag.Node {
  Node(..node(id, dag.Open, deps), research: True)
}

fn failed(who: String, model: String) -> dag.Attempt {
  Attempt(
    identity: who,
    session_id: "s",
    model:,
    started: "t0",
    ended: "t1",
    outcome: dag.GaveUp,
    estimate: dag.S,
    reported: True,
    salvaged: False,
    cost_usd: 0.0,
    turns: 1,
    notes: "",
  )
}

/// An `S` research node whose four rungs are spent, all by `who`: its next
/// attempt is at the repeatable top rung.
fn spent_research_node(id: String, who: String) -> dag.Node {
  Node(..research_node(id, []), attempts: [
    failed(who, "haiku"),
    failed(who, "sonnet"),
    failed(who, "opus"),
    failed(who, "fable"),
  ])
}

pub fn a_research_leaf_starts_after_every_ordinary_leaf_test() {
  // `r` unblocks `c`, so `dag.open_leaves` ranks it first; it is research,
  // so the scheduler takes `b` first and `r` only when `b` is not startable.
  let d =
    Dag([
      research_node("r", []),
      node("b", dag.Open, []),
      node("c", dag.Open, ["r"]),
    ])
  assert list.map(dag.open_leaves(d), fn(n) { n.id }) == ["r", "b"]
  assert list.map(schedule.startable(d), fn(n) { n.id }) == ["b", "r"]
  let assert Some(Assignment(node: first, ..)) =
    schedule.next_to_start(
      d,
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: [],
    )
  assert first.id == "b"
  let assert Some(Assignment(node: then, ..)) =
    schedule.next_to_start(
      d,
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: ["b"],
    )
  assert then.id == "r"
}

pub fn a_research_leaf_alone_is_started_test() {
  let d = Dag([research_node("r", [])])
  let assert Some(Assignment(node: n, ..)) =
    schedule.next_to_start(
      d,
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: [],
    )
  assert n.id == "r"
}

pub fn the_top_rung_of_a_research_node_prefers_a_persona_that_has_not_tried_it_test() {
  // Ada spent every rung. Ada is idle and the eldest, and would be chosen
  // for any other node; at this one the point of another attempt is a
  // different notebook, so Bea goes.
  let n = spent_research_node("r", "Ada")
  assert schedule.who_for_node(two_personas(), n, busy: [])
    == Existing(persona("Bea", "P2"))
  // The same node from the scheduler's own entry point.
  let assert Some(Assignment(who: Existing(who), ..)) =
    schedule.next_to_start(
      Dag([n]),
      two_personas(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: [],
    )
  assert who.name == "Bea"
}

pub fn a_persona_that_tried_the_node_goes_again_rather_than_minting_test() {
  // Only Ada is idle, and Ada has tried it. The region's rule mints only
  // when nobody is idle, and that rule does not change here: Ada goes.
  let n = spent_research_node("r", "Ada")
  assert schedule.who_for_node(two_personas(), n, busy: ["Bea"])
    == Existing(persona("Ada", "P2"))
  assert schedule.who_for_node(one_persona(), n, busy: [])
    == Existing(persona("Ada", "P2"))
  // Nobody idle: a mint, exactly as for any node.
  assert schedule.who_for_node(one_persona(), n, busy: ["Ada"])
    == Mint(region: "P2", busy: ["Ada"])
}

pub fn below_the_top_rung_a_research_node_keeps_the_eldest_idle_persona_test() {
  // One failure on a four-rung ladder: the next attempt is sonnet, a climb,
  // and the notebook that started the climb continues it.
  let climbing =
    Node(..research_node("r", []), attempts: [failed("Ada", "haiku")])
  assert schedule.who_for_node(two_personas(), climbing, busy: [])
    == Existing(persona("Ada", "P2"))
  // An ordinary node with its ladder spent by Ada: still Ada.
  let ordinary = Node(..spent_research_node("o", "Ada"), research: False)
  assert schedule.who_for_node(two_personas(), ordinary, busy: [])
    == Existing(persona("Ada", "P2"))
}
