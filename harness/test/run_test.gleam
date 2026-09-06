//// `dispatch.run_with`, driven offline: the scheduler loop that keeps up to
//// `concurrency` attempts in flight, against a fixture DAG, a fixture
//// roster, the scripted fake shim and an injected verifier. What is under
//// test is the loop — that it starts what the plan allows, waits for what
//// it started, records every attempt on the right node, and stops when it
//// should — not the worker, which `worker_loop_test` covers.
////
//// Nothing here spends the subscription, touches the real DAG, or writes
//// to `Rule30/Proofs.lean`: the index writer is injected too.

import envoy
import gleam/json
import gleam/list
import gleam/option.{None, Some}
import gleam/result
import gleam/string
import harness/config
import harness/dag.{Dag, Node}
import harness/dispatch
import harness/roster
import harness/schedule.{Plan}
import harness/verify
import simplifile

// --- fixtures -------------------------------------------------------------------

/// Two independent open leaves and one node behind the first.
fn board() -> dag.Dag {
  Dag([
    probe("probe_one", []),
    probe("probe_two", []),
    probe("probe_three", ["probe_one"]),
  ])
}

/// A node whose statement is the real `harness_probe : True`, so the brief
/// can be written, under an id of its own so two of them can be on the
/// board at once.
fn probe(id: String, deps: List(String)) -> dag.Node {
  Node(
    id:,
    region: "P2",
    lean_name: "harness_probe",
    description: "a node that exists only in this test",
    deps:,
    status: dag.Open,
    size: dag.S,
    proof_file: None,
    attempts: [],
    verified: None,
  )
}

/// A coloured identity for P2, so no ceremony runs.
fn scripted_identity() -> roster.Identity {
  roster.Identity(
    name: "Scripted",
    region: "P2",
    created: "2026-09-05T00:00:00Z",
    naming_reason: "a test never names itself",
    opening: "",
    color: Some("#123456"),
  )
}

type Fixture {
  Fixture(cfg: config.Config, dir: String, index_path: String)
}

/// A fresh test directory holding the DAG, the roster and the runs root,
/// with the fake shim scripted to play `script` at every session it is
/// asked for. `port` keeps this test's guards off the port the guard tests
/// and the live default use.
fn fixture(name: String, script: List(List(String)), port: Int) -> Fixture {
  let dir = "build/test-runs/run/" <> name
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir <> "/agents")
  let assert Ok(_) = dag.save(board(), dir <> "/dag.json")
  let assert Ok(_) =
    roster.save(roster.Roster([scripted_identity()]), dir <> "/roster.json")
  let script_path = dir <> "/script.json"
  let assert Ok(_) =
    simplifile.write(
      script_path,
      json.array(script, fn(turn) { json.array(turn, json.string) })
        |> json.to_string,
    )
  envoy.set("HARNESS_FAKE_SCRIPT", script_path)
  envoy.unset("HARNESS_FAKE_MARKER")
  envoy.unset("HARNESS_FAKE_KILLED")
  envoy.unset("HARNESS_FAKE_IGNORE_EOF")
  let assert Ok(base) = config.load()
  let cfg =
    config.Config(
      ..base,
      shim: base.repo_root <> "/harness/test/fake_shim.mjs",
      dag_path: dir <> "/dag.json",
      runs_root: dir <> "/runs",
      roster_path: dir <> "/roster.json",
      agents_dir: dir <> "/agents",
      guard_port: port,
      turn_timeout_ms: 20_000,
    )
  Fixture(cfg:, dir:, index_path: dir <> "/indexed.txt")
}

/// An environment whose verifier always says `verdict` and whose index
/// writer appends the node id to a file instead of touching the real
/// `Rule30/Proofs.lean`.
fn env(f: Fixture, verdict: verify.Verdict) -> dispatch.Env {
  dispatch.Env(verifier: fn(_lock) { fn(_node) { verdict } }, index: fn(node) {
    simplifile.append(f.index_path, node.id <> "\n")
    |> result.map_error(simplifile.describe_error)
  })
}

fn init_line(session_id: String) -> String {
  json.object([
    #("type", json.string("system")),
    #("subtype", json.string("init")),
    #("session_id", json.string(session_id)),
  ])
  |> json.to_string
}

fn result_line(session_id: String, outcome: String) -> String {
  json.object([
    #("type", json.string("result")),
    #("session_id", json.string(session_id)),
    #("is_error", json.bool(False)),
    #("total_cost_usd", json.float(0.25)),
    #("num_turns", json.int(3)),
    #(
      "structured_output",
      json.object([
        #("outcome", json.string(outcome)),
        #("estimate", json.string("S")),
        #("summary", json.string("scripted " <> outcome)),
        #("notebook", json.string("scripted notebook entry")),
        #("journal", json.string("scripted journal entry")),
        #("posts", json.array([], json.string)),
      ]),
    ),
  ])
  |> json.to_string
}

fn rate_limit_line(utilization: Float) -> String {
  json.object([
    #("type", json.string("rate_limit_event")),
    #(
      "rate_limit_info",
      json.object([
        #(
          "unifiedWindows",
          json.object([
            #(
              "five_hour",
              json.object([
                #("utilization", json.float(utilization)),
                #("resetsAt", json.int(1_757_100_000)),
              ]),
            ),
          ]),
        ),
      ]),
    ),
  ])
  |> json.to_string
}

fn node_after(f: Fixture, id: String) -> dag.Node {
  let assert Ok(d) = dag.load(f.cfg.dag_path)
  let assert Ok(n) = dag.get(d, id)
  n
}

fn run_dirs(f: Fixture) -> List(String) {
  let assert Ok(runs) = simplifile.read_directory(f.cfg.runs_root)
  let assert [run] = runs
  let assert Ok(entries) =
    simplifile.read_directory(f.cfg.runs_root <> "/" <> run)
  list.sort(entries, string.compare)
}

fn read(path: String) -> String {
  simplifile.read(path) |> result.unwrap("")
}

// --- the loop -----------------------------------------------------------------------

pub fn two_slots_take_both_leaves_and_a_close_opens_the_next_test() {
  // Every session claims proved and the verifier agrees: three attempts,
  // three closes, and `probe_three` — behind `probe_one` — is the third.
  let f =
    fixture("two-slots", [[init_line("s"), result_line("s", "proved")]], 4231)
  let assert Ok(text) =
    dispatch.run_with(
      f.cfg,
      Plan(max_attempts: 3, concurrency: 2),
      env(f, verify.Verified(["propext"], "'harness_check' depends on axioms")),
    )
  assert node_after(f, "probe_one").status == dag.Proved
  assert node_after(f, "probe_two").status == dag.Proved
  assert node_after(f, "probe_three").status == dag.Proved
  assert list.length(node_after(f, "probe_three").attempts) == 1
  // Each attempt has its own log directory under the one run.
  let dirs = run_dirs(f)
  assert list.contains(dirs, "probe_one-1")
  assert list.contains(dirs, "probe_two-1")
  assert list.contains(dirs, "probe_three-1")
  assert list.contains(dirs, "summary.txt")
  // The index writer saw every close, and the journal saw every entry.
  assert list.sort(
      string.split(string.trim(read(f.index_path)), "\n"),
      string.compare,
    )
    == ["probe_one", "probe_three", "probe_two"]
  let assert Ok(runs) = simplifile.read_directory(f.cfg.runs_root)
  let assert [run] = runs
  let journal = read(f.cfg.runs_root <> "/" <> run <> "/journal.md")
  assert string.contains(journal, "Scripted on probe_one")
  assert string.contains(journal, "Scripted on probe_three")
  assert string.contains(text, "3 attempt(s)")
  assert string.contains(
    read(f.cfg.agents_dir <> "/Scripted.md"),
    "scripted notebook entry",
  )
}

pub fn the_attempt_budget_bounds_what_starts_test() {
  let f =
    fixture(
      "attempt-budget",
      [[init_line("s"), result_line("s", "abandoned")]],
      4241,
    )
  let assert Ok(_) =
    dispatch.run_with(
      f.cfg,
      Plan(max_attempts: 1, concurrency: 2),
      env(f, verify.BuildFailed("never consulted")),
    )
  // One attempt, at the leaf the dispatch order puts first; the other leaf
  // was never touched.
  let one = node_after(f, "probe_one")
  assert list.length(one.attempts) == 1
  let assert [attempt] = one.attempts
  assert attempt.outcome == dag.GaveUp
  // A failed S attempt on haiku leaves sonnet on the ladder, so it reopens.
  assert one.status == dag.Open
  assert node_after(f, "probe_two").attempts == []
  assert node_after(f, "probe_two").status == dag.Open
  assert read(f.index_path) == ""
}

pub fn a_rate_limit_stops_the_run_from_starting_more_test() {
  let f =
    fixture(
      "rate-limit-halts",
      [[init_line("s"), rate_limit_line(0.95), result_line("s", "in_progress")]],
      4251,
    )
  let assert Ok(text) =
    dispatch.run_with(
      f.cfg,
      Plan(max_attempts: 3, concurrency: 1),
      env(f, verify.BuildFailed("never consulted")),
    )
  // The first attempt parked; with one slot, nothing else was ever started,
  // and the node is back on the board with its rung intact.
  let one = node_after(f, "probe_one")
  let assert [attempt] = one.attempts
  assert attempt.outcome == dag.RateLimited
  assert one.status == dag.Open
  assert node_after(f, "probe_two").attempts == []
  assert string.contains(text, "rate limit")
}
