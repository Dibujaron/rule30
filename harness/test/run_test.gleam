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
import harness/bugs
import harness/config
import harness/dag.{Dag, Node}
import harness/dispatch
import harness/roster
import harness/schedule.{Plan}
import harness/verify
import ports
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

/// A second coloured P2 identity, younger than `Scripted`, so two P2 leaves
/// can run at once without a ceremony.
fn understudy() -> roster.Identity {
  roster.Identity(
    name: "Understudy",
    region: "P2",
    created: "2026-09-05T00:00:01Z",
    naming_reason: "a test never names itself either",
    opening: "",
    color: Some("#654321"),
  )
}

type Fixture {
  Fixture(cfg: config.Config, dir: String, index_path: String)
}

/// A fresh test directory holding the DAG, two P2 personas and the runs
/// root, with the fake shim scripted to play `script` at every session it
/// is asked for. `port` keeps this test's guards off the port the guard
/// tests and the live default use.
fn fixture(name: String, script: List(List(String)), port: Int) -> Fixture {
  fixture_with_roster(
    name,
    script,
    port,
    roster.Roster([scripted_identity(), understudy()]),
  )
}

/// `fixture` with the roster chosen by the test.
fn fixture_with_roster(
  name: String,
  script: List(List(String)),
  port: Int,
  roster_: roster.Roster,
) -> Fixture {
  let dir = "build/test-runs/run/" <> name
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir <> "/agents")
  let assert Ok(_) = dag.save(board(), dir <> "/dag.json")
  let assert Ok(_) = roster.save(roster_, dir <> "/roster.json")
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
      bugs_path: dir <> "/bugs.json",
      runs_root: dir <> "/runs",
      roster_path: dir <> "/roster.json",
      agents_dir: dir <> "/agents",
      guard_port: port,
      turn_timeout_ms: 20_000,
    )
  Fixture(cfg:, dir:, index_path: dir <> "/indexed.txt")
}

/// An environment whose verifier always says `verdict`, whose annotator
/// writes nothing, and whose index writer appends the node id to a file
/// instead of touching the real `Rule30/Proofs.lean`.
fn env(f: Fixture, verdict: verify.Verdict) -> dispatch.Env {
  dispatch.Env(
    verifier: fn(_lock) { fn(_node) { verdict } },
    annotate: fn(_node, _statement) { Ok(Nil) },
    index: fn(node) {
      simplifile.append(f.index_path, node.id <> "\n")
      |> result.map_error(simplifile.describe_error)
    },
  )
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

fn rate_limit_line(utilization: Float, status: String) -> String {
  json.object([
    #("type", json.string("rate_limit_event")),
    #(
      "rate_limit_info",
      json.object([
        #("status", json.string(status)),
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
    fixture(
      "two-slots",
      [[init_line("s"), result_line("s", "proved")]],
      ports.span(16),
    )
  let assert Ok(text) =
    dispatch.run_with(
      f.cfg,
      Plan(max_attempts: 3, concurrency: 2),
      env(
        f,
        verify.Verified(
          ["propext"],
          "Statements.harness_probe : True",
          "'harness_check' depends on axioms",
        ),
      ),
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
  assert string.contains(journal, "Understudy on probe_two")
  assert string.contains(journal, " on probe_three")
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
      ports.span(16),
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
      [
        [
          init_line("s"),
          rate_limit_line(0.95, "surpassed_threshold"),
          result_line("s", "in_progress"),
        ],
      ],
      ports.span(16),
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

/// The same rate-limited attempt as above, but read from the bug board
/// rather than the DAG: the harness notices its own signal without the
/// worker having said a word about it.
pub fn a_rate_limited_run_files_one_bug_test() {
  let f =
    fixture(
      "rate-limit-files-a-bug",
      [
        [
          init_line("s"),
          rate_limit_line(0.95, "surpassed_threshold"),
          result_line("s", "in_progress"),
        ],
      ],
      ports.span(16),
    )
  let assert Ok(_) =
    dispatch.run_with(
      f.cfg,
      Plan(max_attempts: 3, concurrency: 1),
      env(f, verify.BuildFailed("never consulted")),
    )
  let assert Ok(board) = bugs.load(f.cfg.bugs_path)
  let filed = bugs.open_bugs(board)
  assert list.map(filed, fn(b) { b.signature }) == [Some("dispatch:rate_limit")]
}

// --- minting ------------------------------------------------------------------------

/// A result whose `structured_output` answers both a naming ceremony and a
/// worker's report: the shim plays the same script to every session, and
/// each decoder reads only the fields it knows.
fn naming_and_report_line(session_id: String) -> String {
  json.object([
    #("type", json.string("result")),
    #("session_id", json.string(session_id)),
    #("is_error", json.bool(False)),
    #("total_cost_usd", json.float(0.05)),
    #("num_turns", json.int(1)),
    #(
      "structured_output",
      json.object([
        #("name", json.string("Minted")),
        #("reason", json.string("a scripted reason")),
        #("opening", json.string("I am Minted, a scripted opening.")),
        #("color", json.string("#abcdef")),
        #("color_reason", json.string("scripted")),
        #("outcome", json.string("proved")),
        #("estimate", json.string("S")),
        #("summary", json.string("scripted proved")),
        #("notebook", json.string("scripted notebook entry")),
        #("journal", json.string("scripted journal entry")),
        #("posts", json.array([], json.string)),
      ]),
    ),
  ])
  |> json.to_string
}

/// Every `events.jsonl` under the one run, concatenated.
fn all_events(f: Fixture) -> String {
  let assert Ok(runs) = simplifile.read_directory(f.cfg.runs_root)
  let assert [run] = runs
  let root = f.cfg.runs_root <> "/" <> run
  let assert Ok(entries) = simplifile.read_directory(root)
  entries
  |> list.map(fn(e) { read(root <> "/" <> e <> "/events.jsonl") })
  |> list.prepend(read(root <> "/events.jsonl"))
  |> string.join("\n")
}

pub fn a_second_persona_is_minted_when_the_only_one_is_busy_test() {
  // One P2 persona, two P2 leaves, two slots: the second leaf cannot run as
  // Scripted, so a ceremony names Minted and the leaf runs as them.
  let f =
    fixture_with_roster(
      "mint-on-demand",
      [[init_line("s"), naming_and_report_line("s")]],
      ports.span(16),
      roster.Roster([scripted_identity()]),
    )
  let assert Ok(text) =
    dispatch.run_with(
      f.cfg,
      Plan(max_attempts: 2, concurrency: 2),
      env(
        f,
        verify.Verified(
          ["propext"],
          "Statements.harness_probe : True",
          "'harness_check' depends on axioms",
        ),
      ),
    )
  assert string.contains(text, "2 attempt(s)")
  // The roster grew by one, and the newcomer's notebook opened in its voice.
  let assert Ok(after) = roster.load(f.cfg.roster_path)
  assert list.map(roster.for_region(after, "P2"), fn(i) { i.name })
    == ["Scripted", "Minted"]
  let notebook = read(f.cfg.agents_dir <> "/Minted.md")
  assert string.contains(notebook, "I am Minted, a scripted opening.")
  assert string.contains(notebook, "scripted notebook entry")
  // The log says who ran what, and why a name was minted.
  let events = all_events(f)
  assert string.contains(events, "\"because\":\"all busy: Scripted\"")
  assert string.contains(events, "\"identity\":\"Scripted\"")
  assert string.contains(events, "\"identity\":\"Minted\"")
  // Both attempts closed.
  assert node_after(f, "probe_one").status == dag.Proved
  assert node_after(f, "probe_two").status == dag.Proved
  let assert [one] = node_after(f, "probe_one").attempts
  let assert [two] = node_after(f, "probe_two").attempts
  assert one.identity == "Scripted"
  assert two.identity == "Minted"
}

// --- the stop file ------------------------------------------------------------

/// **A run must be stoppable without killing a worker.**
///
/// From run 20260906T230339Z: a harness defect was diagnosed while the run was
/// live, and there was no way to end it. The only lever was killing the
/// process, which the permission classifier refused, so a run known to be
/// burning attempts against a harness bug had to be waited out until the ladder
/// exhausted. See `a-run-cannot-be-stopped-once-a-defect-in-it-is-known`.
///
/// The stop file is checked where the scheduler already decides whether to
/// start another attempt, so a stopped run **finishes what is in flight and
/// starts no more**. That is the property a kill cannot give: the node the
/// ladder was burning against in that run had ALREADY BEEN PROVED, and opus had
/// left a working proof on disk. A kill would have discarded it.
pub fn a_stop_file_starts_no_further_attempts_test() {
  let f =
    fixture(
      "stop-file",
      [[init_line("s"), result_line("s", "proved")]],
      ports.span(16),
    )
  let assert Ok(_) = simplifile.write(f.cfg.repo_root <> "/STOP", "keel")
  let assert Ok(text) =
    dispatch.run_with(
      f.cfg,
      Plan(max_attempts: 3, concurrency: 2),
      env(
        f,
        verify.Verified(
          ["propext"],
          "Statements.harness_probe : True",
          "'harness_check' depends on axioms",
        ),
      ),
    )
  let _ = simplifile.delete(f.cfg.repo_root <> "/STOP")
  // Nothing started. The plan allowed three attempts and two leaves were
  // ready; a stop present before the first fill means none of them begin.
  assert node_after(f, "probe_one").status == dag.Open
  assert node_after(f, "probe_two").status == dag.Open
  assert list.length(node_after(f, "probe_one").attempts) == 0
  // And the run says WHY it started nothing, rather than looking like a run
  // with nothing to do — those are the same summary otherwise, which is this
  // project's most expensive shape.
  assert string.contains(string.lowercase(text), "stop")
}

/// Without the file, the same fixture runs normally — the guard against a stop
/// check that is always on, which would be indistinguishable from a scheduler
/// that had stopped working.
pub fn no_stop_file_means_the_run_proceeds_test() {
  let f =
    fixture(
      "stop-file-absent",
      [[init_line("s"), result_line("s", "proved")]],
      ports.span(16),
    )
  let assert Ok(_) =
    dispatch.run_with(
      f.cfg,
      Plan(max_attempts: 1, concurrency: 1),
      env(
        f,
        verify.Verified(
          ["propext"],
          "Statements.harness_probe : True",
          "'harness_check' depends on axioms",
        ),
      ),
    )
  assert node_after(f, "probe_one").status == dag.Proved
}
