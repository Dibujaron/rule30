//// `seeder.run`, driven offline: one seeder session against the scripted
//// fake shim, a fixture board and a fixture proposal path. What is under
//// test is the verb's contract — that it starts a session, fences it with a
//// Seeder guard on its own port, records it under `runs/<id>/seed-1/`, and
//// runs the check over the proposal after the session ends — not the loop,
//// which `worker_loop_test` covers, and not the checks, which `seed_test`
//// covers.
////
//// Nothing here spends the subscription, writes the real DAG, or runs Lean:
//// the fixture's proposal path is never written, so the check refuses to
//// read it before any `lake` is reached. The check does look for a built
//// `.lake` under `repo_root` before it reads anything, so the fixture's
//// `repo_root` is the Mathlib-free fixture project (see `lean_fixture`),
//// not this checkout — which may be a worktree with no `.lake` at all.

import envoy
import gleam/dynamic/decode
import gleam/int
import gleam/json
import gleam/option.{None}
import gleam/result
import gleam/string
import harness/config
import harness/dag.{Dag, Node}
import harness/guard
import harness/seeder
import harness/shell
import harness/worker
import lean_fixture
import ports
import simplifile

// --- fixtures -------------------------------------------------------------------

/// One closed node, so the brief has a closed table to render.
fn board() -> dag.Dag {
  Dag([
    Node(
      id: "probe_closed",
      region: "P2",
      lean_name: "harness_probe",
      description: "a node that exists only in this test",
      deps: [],
      status: dag.Proved,
      size: dag.S,
      proof_file: None,
      attempts: [],
      verified: None,
      claimed_by: None,
      claimed_at: None,
      claimed_run: None,
    ),
  ])
}

type Fixture {
  Fixture(cfg: config.Config, dir: String, proposal_path: String)
}

/// A fresh test directory holding the board and the runs root, with the
/// fake shim scripted to play `script`. The proposal path is under the
/// fixture too, so the guard fences the session to a file this test owns
/// and the check reads nothing from the live checkout's `blueprint/`. The
/// `repo_root` is the fixture project, which has the `.lake` the check
/// requires before it reads the proposal; the shim stays under this
/// harness, where the fake one lives.
fn fixture(name: String, script: List(List(String))) -> Fixture {
  let dir = "build/test-runs/seeder/" <> name
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir <> "/agents")
  let assert Ok(_) = dag.save(board(), dir <> "/dag.json")
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
      repo_root: lean_fixture.built(),
      shim: base.repo_root <> "/harness/test/fake_shim.mjs",
      dag_path: dir <> "/dag.json",
      bugs_path: dir <> "/bugs.json",
      runs_root: dir <> "/runs",
      roster_path: dir <> "/roster.json",
      agents_dir: dir <> "/agents",
      stop_path: dir <> "/STOP",
      turn_timeout_ms: 20_000,
    )
  Fixture(cfg:, dir:, proposal_path: dir <> "/proposals/next.json")
}

fn init_line(session_id: String) -> String {
  json.object([
    #("type", json.string("system")),
    #("subtype", json.string("init")),
    #("session_id", json.string(session_id)),
  ])
  |> json.to_string
}

/// A result whose structured output is a seeder's report: no size estimate,
/// no notebook, which is the shape `seeder.report_schema` asks for.
fn result_line(session_id: String, outcome: String) -> String {
  json.object([
    #("type", json.string("result")),
    #("session_id", json.string(session_id)),
    #("is_error", json.bool(False)),
    #("total_cost_usd", json.float(0.5)),
    #("num_turns", json.int(4)),
    #(
      "structured_output",
      json.object([
        #("outcome", json.string(outcome)),
        #("summary", json.string("scripted " <> outcome)),
        #("journal", json.string("scripted seeder journal entry")),
      ]),
    ),
  ])
  |> json.to_string
}

fn read(path: String) -> String {
  simplifile.read(path) |> result.unwrap("")
}

fn exists(path: String) -> Bool {
  simplifile.is_file(path) |> result.unwrap(False)
}

/// The one run directory this fixture's session wrote.
fn run_dir(f: Fixture) -> String {
  let assert Ok([run]) = simplifile.read_directory(f.cfg.runs_root)
  f.cfg.runs_root <> "/" <> run
}

/// POST one PreToolUse `Write` hook body to the session's guard, the way
/// Claude Code's hook does, and return what the hook would print back. The
/// guard outlives `seeder.run` — it is a server in this BEAM — so the rules
/// it was started with can be asked about directly.
fn ask_to_write(g: guard.Guard, path: String) -> String {
  let assert Ok(curl) = shell.which("curl")
  let assert Ok(r) =
    shell.run(
      curl,
      [
        "-s",
        "-X",
        "POST",
        "-H",
        "x-harness-token: " <> g.token,
        "--data",
        "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\""
          <> string.replace(path, "\\", "/")
          <> "\"}}",
        "http://127.0.0.1:" <> int.to_string(g.port) <> "/hook",
      ],
      ".",
      5000,
    )
  r.output
}

// --- the verb ---------------------------------------------------------------------

pub fn seed_starts_one_fenced_session_and_checks_its_proposal_after_it_test() {
  let f =
    fixture("proposed", [
      [init_line("seed-s"), result_line("seed-s", "proposed")],
    ])
  let port = ports.span(1)
  let assert Ok(session) =
    seeder.run(
      f.cfg,
      seeder.Options(model: "haiku", port:, proposal_path: f.proposal_path),
    )

  // The record is `runs/<id>/seed-1/`, with the event log, the generated
  // settings and the brief, like an attempt's.
  let seed_dir = run_dir(f) <> "/" <> seeder.session_name
  assert session.dir == seed_dir
  assert exists(seed_dir <> "/events.jsonl")
  assert exists(seed_dir <> "/settings.json")
  let brief = read(seed_dir <> "/briefs/seed-1.md")
  assert string.contains(brief, "## What you are doing")
  assert string.contains(brief, f.proposal_path)

  // The session was started and told its task: the dispatch row names the
  // role, the model and the port, and the first message the harness sent
  // names the proposal file.
  let events = read(seed_dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"dispatch\"")
  assert string.contains(events, "\"role\":\"seeder\"")
  assert string.contains(events, "\"port\":" <> int.to_string(port))
  assert string.contains(events, "\"kind\":\"sent\"")
  assert string.contains(events, "Propose the next tier")
  assert string.contains(events, "\"kind\":\"stream\"")

  // The guard is a Seeder guard on the port it was asked for: the settings
  // point the hooks at it, it allows a write under `explorer/`, and it
  // refuses the statement file — the fence Dib's ruling is about.
  assert session.guard.port == port
  assert string.contains(
    read(seed_dir <> "/settings.json"),
    "127.0.0.1:" <> int.to_string(port),
  )
  assert ask_to_write(session.guard, f.cfg.repo_root <> "/explorer/probe.mjs")
    == "{}"
  let refused =
    ask_to_write(session.guard, f.cfg.repo_root <> "/Rule30/Statements.lean")
  assert string.contains(refused, "deny")
  assert string.contains(refused, "explorer")
  // Those decisions were logged into the session's own record, under its
  // holder name.
  let after = read(seed_dir <> "/events.jsonl")
  assert string.contains(after, "\"node\":\"seed-1\"")
  assert string.contains(after, "\"denial\":\"not_writable\"")

  // The summary says how the session ended, in words that call the file
  // written and nothing proved — and the check ran over the proposal path
  // after the session, and said the file was not there rather than crashing.
  assert string.contains(session.summary, "ended     finished")
  assert !string.contains(session.summary, "proved")
  assert string.contains(session.summary, "check of " <> f.proposal_path)
  assert string.contains(session.summary, "the check could not run")
  assert string.contains(session.summary, "cannot read")
  assert string.contains(session.summary, "cost      $0.50")
  assert string.contains(session.summary, "session   seed-s")
  assert read(run_dir(f) <> "/summary.txt") == session.summary <> "\n"

  // The journal reached the run's journal, under the role name.
  let journal = read(run_dir(f) <> "/journal.md")
  assert string.contains(journal, "## Seeder on seed-1")
  assert string.contains(journal, "scripted seeder journal entry")

  // Nothing was written outside the record: no proposal (the session was
  // scripted, not real), no notebook, no board.
  assert !exists(f.proposal_path)
  assert simplifile.read_directory(f.cfg.agents_dir) == Ok([])
  assert !exists(f.cfg.bugs_path)
  let assert Ok(d) = dag.load(f.cfg.dag_path)
  assert d == board()
}

/// A seeder that gives up is reported as having given up, and its proposal
/// is still checked: the check is of the file, not of the session.
pub fn a_seeder_that_abandons_is_still_checked_test() {
  let f =
    fixture("abandoned", [
      [init_line("seed-a"), result_line("seed-a", "abandoned")],
    ])
  let assert Ok(session) =
    seeder.run(
      f.cfg,
      seeder.Options(
        model: "haiku",
        port: ports.span(1),
        proposal_path: f.proposal_path,
      ),
    )
  assert string.contains(session.summary, "ended     abandoned by the seeder")
  assert string.contains(session.summary, "check of " <> f.proposal_path)
  assert string.contains(session.summary, "cannot read")
}

// --- the report -------------------------------------------------------------------

/// The seeder's schema asks for no size estimate: a seeder has no node to
/// price. The prover's decoder would refuse this report; the seeder's
/// reads it.
pub fn a_seeder_report_needs_no_estimate_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"proposed\",\"summary\":\"done\",\"journal\":\"j\"}",
      decode.dynamic,
    )
  let assert Ok(report) = seeder.report_from_dynamic(dyn)
  assert report.outcome == "proposed"
  assert report.journal == "j"
  let assert Error(_) = worker.report_from_dynamic(dyn)
  assert !string.contains(seeder.report_schema(), "estimate")
  assert string.contains(seeder.report_schema(), "\"proposed\"")
}
