//// The scheduler's pure half: what `run` is allowed to start next, and how
//// its flags are read. No sessions, no files.

import gleam/option.{None, Some}
import harness/dag.{Dag, Node}
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
