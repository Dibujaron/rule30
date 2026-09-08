//// `theorist.run`, driven offline: one theorist session against the
//// scripted fake shim, a fixture board, a fixture roster and a fixture
//// checkout. What is under test is the verb's contract — that it derives a
//// topic, settles who runs (a named theorist, the eldest idle one, or a
//// minted one), briefs from the files on disk and the persona's own
//// notebook, fences the session with a Theorist guard on its own port,
//// records it under `runs/<id>/theorist-1/`, writes the notebook and
//// journal from the report, and reports the attack document's existence
//// after the session ends — not the loop, which `worker_loop_test` covers.
////
//// Nothing here spends the subscription, runs Lean, or touches the live
//// checkout: the fixture is its own `repo_root`, with its own `docs/`,
//// `blueprint/` and `agents/`, so the brief reads files this test wrote and
//// the guard is asked about paths under a directory this test owns.

import envoy
import gleam/dynamic/decode
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{None, Some}
import gleam/result
import gleam/string
import harness/config
import harness/dag.{Dag, Node}
import harness/guard
import harness/roster
import harness/schedule
import harness/shell
import harness/theorist
import harness/worker
import ports
import simplifile

// --- fixtures -------------------------------------------------------------------

fn node(id: String, region: String, size: dag.Size, status: dag.Status) {
  Node(
    id:,
    region:,
    lean_name: id,
    description: "what " <> id <> " must imply, verbatim",
    deps: [],
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

/// Two open P1 walls (one of them the frontier), a closed P1 wall, and an
/// open P2 wall: enough to tell "the frontier when open" from "the first
/// open P1 wall by id".
fn board() -> dag.Dag {
  Dag([
    node("leftDiagonal_onset_le", "P1", dag.Wall, dag.Open),
    node(theorist.frontier_wall, "P1", dag.Wall, dag.Open),
    node("aardvark_wall", "P1", dag.Wall, dag.Proved),
    node("density_wall", "P2", dag.Wall, dag.Open),
    node("probe_closed", "P1", dag.S, dag.Proved),
  ])
}

fn identity(name: String, region: String) -> roster.Identity {
  roster.Identity(
    name:,
    region:,
    created: "2026-09-06T00:00:00Z",
    naming_reason: "a test never names itself",
    opening: "I am " <> name <> ", a fixture.",
    color: None,
  )
}

/// Two theorists, Vesper the elder, and one P1 prover who must never be
/// picked as a theorist.
fn peopled() -> roster.Roster {
  roster.Roster([
    identity("Scripted", "P1"),
    identity("Vesper", theorist.region),
    identity("Quill", theorist.region),
  ])
}

type Fixture {
  Fixture(cfg: config.Config, dir: String, repo: String)
}

/// A fresh test directory holding a checkout-shaped `repo/` (the board, the
/// roster with its notebooks, the docs the brief inlines, an explorer
/// directory) and the runs root, with the fake shim scripted to play
/// `script`.
fn fixture(
  name: String,
  script: List(List(String)),
  roster_: roster.Roster,
) -> Fixture {
  let dir = "build/test-runs/theorist/" <> name
  let _ = simplifile.delete(dir)
  let assert Ok(cwd) = simplifile.current_directory()
  let repo = string.replace(cwd, "\\", "/") <> "/" <> dir <> "/repo"
  let assert Ok(_) = simplifile.create_directory_all(repo <> "/blueprint")
  let assert Ok(_) = simplifile.create_directory_all(repo <> "/docs")
  let assert Ok(_) = simplifile.create_directory_all(repo <> "/explorer")
  let assert Ok(_) = simplifile.create_directory_all(repo <> "/agents")
  let assert Ok(_) = dag.save(board(), repo <> "/blueprint/dag.json")
  let assert Ok(_) = roster.save(roster_, repo <> "/agents/roster.json")
  list.each(roster_.identities, fn(i) {
    let assert Ok(_) =
      simplifile.write(
        repo <> "/agents/" <> i.name <> ".md",
        "# " <> i.name <> "\n\n" <> i.opening <> "\n\nNOTEBOOK OF " <> i.name,
      )
  })
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
  envoy.unset("HARNESS_FAKE_ARGS")
  let assert Ok(base) = config.load()
  // The ceilings are pinned rather than loaded, so the test says which
  // pair reached the command line whatever the environment holds.
  let cfg =
    config.Config(
      ..base,
      repo_root: repo,
      shim: base.repo_root <> "/harness/test/fake_shim.mjs",
      dag_path: repo <> "/blueprint/dag.json",
      bugs_path: repo <> "/blueprint/bugs.json",
      runs_root: dir <> "/runs",
      roster_path: repo <> "/agents/roster.json",
      agents_dir: repo <> "/agents",
      stop_path: dir <> "/STOP",
      max_turns: 40,
      max_budget_usd: 4.0,
      theorist_max_turns: 600,
      theorist_max_budget_usd: 80.0,
      turn_timeout_ms: 20_000,
    )
  Fixture(cfg:, dir:, repo:)
}

fn put(f: Fixture, relative: String, text: String) -> Nil {
  let assert Ok(_) = simplifile.write(f.repo <> "/" <> relative, text)
  Nil
}

fn options(port: Int, topic: String) -> theorist.Options {
  theorist.Options(model: "haiku", port:, topic: Some(topic), persona: None)
}

fn init_line(session_id: String) -> String {
  json.object([
    #("type", json.string("system")),
    #("subtype", json.string("init")),
    #("session_id", json.string(session_id)),
  ])
  |> json.to_string
}

/// A theorist's report as `structured_output` fields: an outcome, a
/// notebook entry, a journal and a next topic, no estimate.
fn report_fields(outcome: String) -> List(#(String, json.Json)) {
  [
    #("outcome", json.string(outcome)),
    #("summary", json.string("scripted " <> outcome)),
    #("notebook", json.string("scripted theorist notebook entry")),
    #("journal", json.string("scripted theorist journal entry")),
    #(
      "next_topic",
      json.string("Attack the onset bound next, because it is the seam."),
    ),
  ]
}

fn result_with(session_id: String, fields: List(#(String, json.Json))) {
  json.object([
    #("type", json.string("result")),
    #("session_id", json.string(session_id)),
    #("is_error", json.bool(False)),
    #("total_cost_usd", json.float(1.25)),
    #("num_turns", json.int(9)),
    #("structured_output", json.object(fields)),
  ])
  |> json.to_string
}

fn result_line(session_id: String, outcome: String) -> String {
  result_with(session_id, report_fields(outcome))
}

/// The `result` the CLI ends a session with at one of its ceilings: the
/// last line of run 20260907T175146Z's `theorist-1/events.jsonl`, less the
/// usage, with `subtype` as given.
fn error_result_line(session_id: String, subtype: String) -> String {
  json.object([
    #("type", json.string("result")),
    #("subtype", json.string(subtype)),
    #("session_id", json.string(session_id)),
    #("is_error", json.bool(True)),
    #("errors", json.array(["Reached maximum budget ($80)"], json.string)),
    #("total_cost_usd", json.float(80.3)),
    #("num_turns", json.int(13)),
  ])
  |> json.to_string
}

/// A result whose `structured_output` answers both a naming ceremony and a
/// theorist's report: the shim plays the same script to every process, and
/// each decoder reads only the fields it knows.
fn naming_and_report_line(session_id: String) -> String {
  result_with(
    session_id,
    list.append(
      [
        #("name", json.string("Minted")),
        #("reason", json.string("a scripted reason")),
        #("opening", json.string("I am Minted, a scripted opening.")),
        #("color", json.string("#abcdef")),
        #("color_reason", json.string("scripted")),
      ],
      report_fields("attacked"),
    ),
  )
}

fn read(path: String) -> String {
  simplifile.read(path) |> result.unwrap("")
}

fn exists(path: String) -> Bool {
  simplifile.is_file(path) |> result.unwrap(False)
}

fn run_dir(f: Fixture) -> String {
  let assert Ok([run]) = simplifile.read_directory(f.cfg.runs_root)
  f.cfg.runs_root <> "/" <> run
}

/// POST one PreToolUse `Write` hook body to the session's guard, the way
/// Claude Code's hook does, and return what the hook would print back.
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

// --- the verb -----------------------------------------------------------------------

pub fn theorise_starts_one_fenced_session_and_reports_its_document_test() {
  // The document is written by the scripted session, mid-turn, the way a
  // theorist writes it — not by the test beforehand, because a file already
  // at the path at session start is a first session's, and the fence moves
  // to `-2`. What is under test is that the summary reads the file that is
  // there when the session ends.
  let assert Ok(cwd) = simplifile.current_directory()
  let repo =
    string.replace(cwd, "\\", "/") <> "/build/test-runs/theorist/attacked/repo"
  let attack =
    theorist.document_path(repo, theorist.today(), "the transients", "attacks")
  let f =
    fixture(
      "attacked",
      [
        [
          init_line("th-s"),
          "__WRITE__ " <> attack <> "\t# Attack\n\ntwenty-three",
          result_line("th-s", "attacked"),
        ],
      ],
      peopled(),
    )
  assert f.repo == repo
  put(f, "docs/theorist-brief.md", "# The theorist's task\n\nfixture task text")
  let port = ports.span(1)
  let args_path = f.dir <> "/args.json"
  envoy.set("HARNESS_FAKE_ARGS", args_path)
  let started = theorist.run(f.cfg, options(port, "the transients"))
  envoy.unset("HARNESS_FAKE_ARGS")
  let assert Ok(session) = started
  assert session.topic == "the transients"
  assert session.attack_path == attack
  // No `--as`: the eldest theorist on the roster, never the P1 prover.
  assert session.identity.name == "Vesper"

  // The record is `runs/<id>/theorist-1/`, like a seeder's `seed-1/`.
  let th_dir = run_dir(f) <> "/" <> theorist.session_name
  assert session.dir == th_dir
  assert exists(th_dir <> "/events.jsonl")
  assert exists(th_dir <> "/settings.json")
  let brief = read(th_dir <> "/briefs/theorist-1.md")
  assert string.contains(brief, "fixture task text")
  assert string.contains(brief, "Topic: the transients")
  assert string.contains(brief, attack)
  // Its own notebook, verbatim, and nobody else's.
  assert string.contains(brief, "You are Vesper, a theorist")
  assert string.contains(brief, "NOTEBOOK OF Vesper")
  assert !string.contains(brief, "NOTEBOOK OF Quill")
  assert !string.contains(brief, "NOTEBOOK OF Scripted")

  // The dispatch row names the role, the persona, the port, the topic and
  // the file; nothing was minted; the first message names the topic.
  let events = read(th_dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"dispatch\"")
  assert string.contains(events, "\"role\":\"theorist\"")
  assert string.contains(events, "\"identity\":\"Vesper\"")
  assert string.contains(events, "\"port\":" <> int.to_string(port))
  assert string.contains(events, "\"topic\":\"the transients\"")
  assert !string.contains(events, "\"kind\":\"naming\"")
  assert string.contains(events, "\"kind\":\"sent\"")
  assert string.contains(events, "Attack the topic `the transients`")

  // The session ran under the theorist's ceilings, not the prover's: the
  // dispatch row records them under the names a prover's row uses, the
  // shim saw them on its command line, and the summary prints them. The
  // first theorist ran under the prover's $4 and ended there.
  assert string.contains(events, "\"max_turns\":600")
  assert string.contains(events, "\"max_budget_usd\":80.0")
  assert !string.contains(events, "\"max_turns\":40")
  let args = read(args_path)
  assert string.contains(
    args,
    "\"--max-turns\",\"600\",\"--max-budget-usd\",\"80.0\"",
  )
  assert !string.contains(args, "\"--max-turns\",\"40\"")
  assert string.contains(session.summary, "ceilings  600 turns, $80.0")

  // The guard is a Theorist guard on the port it was asked for: it allows
  // the attack document, and it refuses the seeder's proposal file — the
  // one file the design takes away from this role — and the notebook.
  assert session.guard.port == port
  assert string.contains(
    read(th_dir <> "/settings.json"),
    "127.0.0.1:" <> int.to_string(port),
  )
  assert ask_to_write(session.guard, attack) == "{}"
  // A script under explorer/ is allowed, as for a seeder: the brief asks
  // for falsification runs, and a run is a script.
  assert ask_to_write(session.guard, f.repo <> "/explorer/probe.mjs") == "{}"
  let refused =
    ask_to_write(session.guard, f.repo <> "/blueprint/proposals/next.json")
  assert string.contains(refused, "deny")
  assert string.contains(refused, "attack document")
  assert string.contains(
    ask_to_write(session.guard, f.repo <> "/agents/Vesper.md"),
    "deny",
  )
  let after = read(th_dir <> "/events.jsonl")
  assert string.contains(after, "\"node\":\"theorist-1\"")
  assert string.contains(after, "\"denial\":\"not_writable\"")

  // The summary names who ran and the document, says it exists and how big
  // it is, carries the next topic, and never calls anything proved.
  assert string.contains(session.summary, "theorist  Vesper")
  assert string.contains(session.summary, "topic     the transients")
  assert string.contains(session.summary, "attack    " <> attack)
  assert string.contains(session.summary, "document  exists, 22 bytes")
  assert string.contains(session.summary, "ended     finished")
  assert !string.contains(session.summary, "proved")
  assert string.contains(session.summary, "Attack the onset bound next")
  assert string.contains(session.summary, "cost      $1.25")
  assert string.contains(session.summary, "session   th-s")
  assert read(run_dir(f) <> "/summary.txt") == session.summary <> "\n"

  // The notebook and the journal were written from the report, verbatim,
  // by the harness: Vesper's notebook grew by one dated section headed with
  // the topic and the ending, Quill's did not change.
  let notebook = read(f.cfg.agents_dir <> "/Vesper.md")
  assert string.contains(notebook, "NOTEBOOK OF Vesper")
  assert string.contains(notebook, "— the transients (haiku, attacked)")
  assert string.contains(notebook, "scripted theorist notebook entry")
  assert !string.contains(read(f.cfg.agents_dir <> "/Quill.md"), "scripted")
  let journal = read(run_dir(f) <> "/journal.md")
  assert string.contains(journal, "## Vesper on theorist-1")
  assert string.contains(journal, "scripted theorist journal entry")

  // The roster and the board are as they were.
  let assert Ok(r) = roster.load(f.cfg.roster_path)
  assert r == peopled()
  let assert Ok(d) = dag.load(f.cfg.dag_path)
  assert d == board()
}

/// `--as` with an idle theorist starts that one. A theorist that reports
/// `attacked` with no document on disk is recorded as abandoned — the
/// claim is about a file, and the file is not there — and its notebook
/// heading says so.
pub fn as_starts_the_named_theorist_and_a_missing_document_is_abandoned_test() {
  let f =
    fixture(
      "no-document",
      [[init_line("th-n"), result_line("th-n", "attacked")]],
      peopled(),
    )
  let assert Ok(session) =
    theorist.run(
      f.cfg,
      theorist.Options(
        model: "haiku",
        port: ports.span(1),
        topic: None,
        persona: Some("Quill"),
      ),
    )
  assert session.identity.name == "Quill"
  // No topic given: the frontier wall is open on the fixture board.
  assert session.topic == theorist.frontier_wall
  assert string.contains(session.summary, "theorist  Quill")
  assert string.contains(session.summary, "document  MISSING")
  assert string.contains(session.summary, "ended     abandoned")
  assert string.contains(session.summary, "no document exists")
  let notebook = read(f.cfg.agents_dir <> "/Quill.md")
  assert string.contains(
    notebook,
    "— " <> theorist.frontier_wall <> " (haiku, abandoned)",
  )
  assert !string.contains(read(f.cfg.agents_dir <> "/Vesper.md"), "scripted")
}

/// A session the CLI ended at its dollar ceiling is summarised as exactly
/// that, with the ceiling the session was launched under — the theorist's
/// $80, not the prover's $4 — so a reader of `summary.txt` can tell
/// Sextant's thirteen-turn ending from a session that talked itself out,
/// and the notebook heading says the same in a word.
pub fn a_session_the_cli_ended_at_its_dollar_ceiling_is_summarised_as_dollars_test() {
  let f =
    fixture(
      "dollar-ceiling",
      [[init_line("th-d"), error_result_line("th-d", "error_max_budget_usd")]],
      peopled(),
    )
  let assert Ok(session) =
    theorist.run(f.cfg, options(ports.span(1), "the transients"))
  assert string.contains(
    session.summary,
    "ended     stopped at the CLI's dollar ceiling ($80.0)",
  )
  assert !string.contains(session.summary, "turn ceiling")
  assert !string.contains(session.summary, "the notes below say which")
  // The notes under the summary name the ceiling too, then carry the CLI's
  // own line.
  assert string.contains(
    session.summary,
    "the CLI ended the session at the CLI's dollar ceiling ($80.0): ",
  )
  assert string.contains(
    session.summary,
    "\"subtype\":\"error_max_budget_usd\"",
  )
  assert string.contains(session.summary, "document  MISSING")
  assert string.contains(session.summary, "(no report, so no next topic)")
}

/// `--as` with a name the roster lacks, or a name from another region, is
/// refused before anything is written: no run directory, no ceremony.
pub fn as_with_an_unknown_or_foreign_name_refuses_test() {
  let f = fixture("as-unknown", [], peopled())
  let assert Error(unknown) =
    theorist.run(
      f.cfg,
      theorist.Options(
        model: "haiku",
        port: ports.span(1),
        topic: Some("x"),
        persona: Some("Nobody"),
      ),
    )
  assert string.contains(unknown, "no theorist named Nobody")
  assert string.contains(unknown, "Vesper, Quill")
  let assert Error(foreign) =
    theorist.run(
      f.cfg,
      theorist.Options(
        model: "haiku",
        port: ports.span(1),
        topic: Some("x"),
        persona: Some("Scripted"),
      ),
    )
  assert string.contains(foreign, "Scripted is on the roster for region P1")
  assert simplifile.is_directory(f.cfg.runs_root) == Ok(False)
}

/// No `--as` and no theorist on the roster: the naming ceremony runs under
/// the session's guard settings, the newcomer joins the roster in the
/// `theory` region, its notebook opens in its own voice, and the session
/// runs as it.
pub fn a_theorist_is_minted_when_the_roster_has_none_test() {
  let f =
    fixture(
      "mint",
      [[init_line("th-m"), naming_and_report_line("th-m")]],
      roster.Roster([identity("Scripted", "P1")]),
    )
  let assert Ok(session) = theorist.run(f.cfg, options(ports.span(1), "x"))
  assert session.identity.name == "Minted"
  assert session.identity.region == theorist.region
  let assert Ok(after) = roster.load(f.cfg.roster_path)
  assert list.map(roster.for_region(after, theorist.region), fn(i) { i.name })
    == ["Minted"]
  let events = read(session.dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"naming\"")
  assert string.contains(events, "\"name\":\"Minted\"")
  assert string.contains(events, "\"region\":\"theory\"")
  assert string.contains(events, "\"because\":\"region empty\"")
  assert string.contains(events, "\"identity\":\"Minted\"")
  let notebook = read(f.cfg.agents_dir <> "/Minted.md")
  assert string.starts_with(
    notebook,
    "# Minted\n\nI am Minted, a scripted opening.",
  )
  assert string.contains(notebook, "named for theory")
  assert string.contains(notebook, "Colour: #abcdef")
  assert string.contains(notebook, "scripted theorist notebook entry")
  let brief = read(session.dir <> "/briefs/theorist-1.md")
  assert string.contains(brief, "You are Minted, a theorist")
  assert string.contains(brief, "I am Minted, a scripted opening.")
  assert string.contains(session.summary, "theorist  Minted")
}

// --- who ----------------------------------------------------------------------------------

pub fn who_picks_the_eldest_theorist_or_decides_to_mint_test() {
  assert theorist.who(peopled(), theorist.region, "theorist", None)
    == Ok(schedule.Existing(identity("Vesper", theorist.region)))
  assert theorist.who(peopled(), theorist.region, "theorist", Some("Quill"))
    == Ok(schedule.Existing(identity("Quill", theorist.region)))
  assert theorist.who(
      roster.Roster([identity("Scripted", "P1")]),
      theorist.region,
      "theorist",
      None,
    )
    == Ok(schedule.Mint(region: theorist.region, busy: []))
  let assert Error(empty) =
    theorist.who(roster.Roster([]), theorist.region, "theorist", Some("Nobody"))
  assert string.contains(empty, "leave --as off")
}

// --- the default topic -----------------------------------------------------------------

pub fn the_default_topic_is_the_frontier_wall_when_it_is_open_test() {
  assert theorist.default_topic(board()) == Ok(theorist.frontier_wall)
}

/// With the frontier wall closed, the first open P1 wall by id; a P2 wall
/// never counts, and a P1 wall that is not open never counts.
pub fn the_default_topic_falls_back_to_the_first_open_p1_wall_test() {
  let without_frontier =
    Dag([
      node("zeta_wall", "P1", dag.Wall, dag.Open),
      node(theorist.frontier_wall, "P1", dag.Wall, dag.Proved),
      node("alpha_wall", "P1", dag.Wall, dag.Abandoned),
      node("beta_wall", "P1", dag.Wall, dag.Open),
      node("aaa_wall", "P2", dag.Wall, dag.Open),
    ])
  assert theorist.default_topic(without_frontier) == Ok("beta_wall")
  let assert Error(reason) =
    theorist.default_topic(Dag([node("aaa_wall", "P2", dag.Wall, dag.Open)]))
  assert string.contains(reason, "no open wall in P1")
}

pub fn the_document_path_is_dated_and_slugged_test() {
  assert theorist.slug(theorist.frontier_wall)
    == "centercolumn-other-iseventuallyperiodic-of-center"
  assert theorist.slug("  The transients of the left diagonals! ")
    == "the-transients-of-the-left-diagonals"
  assert theorist.document_path(
      "C:/r",
      "2026-09-07",
      "Onset & period",
      "attacks",
    )
    == "C:/r/docs/attacks/2026-09-07-onset-period.md"
  assert theorist.numbered_document_path(
      "C:/r",
      "2026-09-07",
      "Onset & period",
      "attacks",
      1,
    )
    == "C:/r/docs/attacks/2026-09-07-onset-period.md"
  assert theorist.numbered_document_path(
      "C:/r",
      "2026-09-07",
      "Onset & period",
      "attacks",
      2,
    )
    == "C:/r/docs/attacks/2026-09-07-onset-period-2.md"
  let today = theorist.today()
  assert string.length(today) == 10
  assert string.starts_with(today, "20")
}

/// The path a session is fenced to is the first free one: bare when
/// nothing is there, `-2` when the bare file exists, `-3` when both do — a
/// directory at the path counts as taken too.
pub fn the_free_document_path_is_the_first_not_taken_test() {
  let f = fixture("free-path", [], roster.Roster([]))
  let bare = theorist.document_path(f.repo, "2026-09-07", "the seam", "attacks")
  let second =
    theorist.numbered_document_path(
      f.repo,
      "2026-09-07",
      "the seam",
      "attacks",
      2,
    )
  let third =
    theorist.numbered_document_path(
      f.repo,
      "2026-09-07",
      "the seam",
      "attacks",
      3,
    )
  assert theorist.free_document_path(
      f.repo,
      "2026-09-07",
      "the seam",
      "attacks",
    )
    == bare
  let assert Ok(_) = simplifile.create_directory_all(f.repo <> "/docs/attacks")
  let assert Ok(_) = simplifile.write(bare, "first")
  assert theorist.free_document_path(
      f.repo,
      "2026-09-07",
      "the seam",
      "attacks",
    )
    == second
  let assert Ok(_) = simplifile.create_directory(second)
  assert theorist.free_document_path(
      f.repo,
      "2026-09-07",
      "the seam",
      "attacks",
    )
    == third
  // Another topic, or another day, is untouched by the seam's files.
  assert theorist.free_document_path(
      f.repo,
      "2026-09-07",
      "the onset",
      "attacks",
    )
    == theorist.document_path(f.repo, "2026-09-07", "the onset", "attacks")
  assert theorist.free_document_path(
      f.repo,
      "2026-09-08",
      "the seam",
      "attacks",
    )
    == theorist.document_path(f.repo, "2026-09-08", "the seam", "attacks")
}

/// The case the design intends — several independent sessions on one
/// topic, then a comparison — and the case that collided: with the first
/// session's document on disk, the second session is fenced to `-2`, every
/// record names that path, and the guard denies the first session's file.
pub fn a_second_attack_on_one_topic_in_a_day_gets_its_own_file_test() {
  let assert Ok(cwd) = simplifile.current_directory()
  let repo =
    string.replace(cwd, "\\", "/") <> "/build/test-runs/theorist/second/repo"
  let first =
    theorist.document_path(repo, theorist.today(), "the transients", "attacks")
  let second =
    theorist.numbered_document_path(
      repo,
      theorist.today(),
      "the transients",
      "attacks",
      2,
    )
  let f =
    fixture(
      "second",
      [
        [
          init_line("th-2"),
          "__WRITE__ " <> second <> "\t# Second attack",
          result_line("th-2", "attacked"),
        ],
      ],
      peopled(),
    )
  assert f.repo == repo
  let assert Ok(_) = simplifile.create_directory_all(repo <> "/docs/attacks")
  let assert Ok(_) = simplifile.write(first, "# First attack, Vesper's")
  let assert Ok(session) =
    theorist.run(f.cfg, options(ports.span(1), "the transients"))
  assert session.attack_path == second
  assert string.ends_with(second, "-the-transients-2.md")

  // The brief, the first message, the dispatch row and the summary all name
  // the second path and never the first.
  let brief = read(session.dir <> "/briefs/theorist-1.md")
  assert string.contains(brief, "Attack document: " <> second)
  assert !string.contains(brief, first)
  let events = read(session.dir <> "/events.jsonl")
  assert string.contains(events, "\"attack\":\"" <> second <> "\"")
  assert !string.contains(events, "\"attack\":\"" <> first <> "\"")
  assert string.contains(events, "attack document to `" <> second <> "`")
  assert string.contains(session.summary, "attack    " <> second)
  assert string.contains(session.summary, "document  exists, 15 bytes")

  // The guard allows exactly the second path and denies the first.
  assert ask_to_write(session.guard, second) == "{}"
  let refused = ask_to_write(session.guard, first)
  assert string.contains(refused, "deny")
  assert string.contains(refused, second)
  // And the first session's document is as it was.
  assert read(first) == "# First attack, Vesper's"
}

// --- flags -------------------------------------------------------------------------------

pub fn theorise_flags_parse_in_any_order_test() {
  let assert Ok(a) =
    theorist.parse_flags(["the seam", "--as", "Quill", "--model", "opus"])
  let assert Ok(b) =
    theorist.parse_flags(["--model", "opus", "the seam", "--as", "Quill"])
  let assert Ok(c) =
    theorist.parse_flags(["--as", "Quill", "--model", "opus", "the seam"])
  assert a == b
  assert b == c
  assert a
    == theorist.Flags(
      model: "opus",
      topic: Some("the seam"),
      persona: Some("Quill"),
    )
  assert theorist.parse_flags([])
    == Ok(theorist.Flags(
      model: theorist.default_model,
      topic: None,
      persona: None,
    ))
  assert theorist.default_model == "fable"
  assert theorist.parse_flags(["onset"])
    == Ok(theorist.Flags(model: "fable", topic: Some("onset"), persona: None))
  let assert Error(needs_value) = theorist.parse_flags(["--model"])
  assert string.contains(needs_value, "--model")
  let assert Error(needs_name) = theorist.parse_flags(["x", "--as"])
  assert string.contains(needs_name, "--as")
  let assert Error(unknown) = theorist.parse_flags(["--modle", "opus"])
  assert string.contains(unknown, "--modle")
  let assert Error(two) = theorist.parse_flags(["the", "seam"])
  assert string.contains(two, "quote")
}

// --- the brief ---------------------------------------------------------------------------

/// Every file the brief inlines is read from disk at render time: present,
/// it appears whole; absent, one line says so, and the task falls back to
/// the spec's sentences.
pub fn the_brief_inlines_each_file_when_present_test() {
  let f = fixture("brief-present", [], peopled())
  put(f, "docs/theorist-brief.md", "TASK TEXT FROM DISK")
  put(f, "blueprint/index.md", "INDEX TEXT")
  put(f, "docs/obstructions.md", "OBSTRUCTIONS TEXT")
  put(f, "blueprint/crystals.md", "CRYSTALS TEXT")
  put(f, "docs/sources.md", "SOURCES TEXT")
  let attack = f.repo <> "/docs/attacks/2026-09-07-x.md"
  let assert Ok(brief) =
    theorist.brief(f.cfg, identity("Vesper", theorist.region), "x", attack)
  assert string.contains(brief, "TASK TEXT FROM DISK")
  assert !string.contains(brief, "is absent")
  assert string.contains(brief, "INDEX TEXT")
  assert string.contains(brief, "OBSTRUCTIONS TEXT")
  assert string.contains(brief, "CRYSTALS TEXT")
  assert string.contains(brief, "SOURCES TEXT")
  // Order: who you are, task, topic and fence, index, obstructions,
  // crystals, sources, walls, notes, the document's sections.
  let assert Ok(#(_, after_who)) =
    string.split_once(brief, "NOTEBOOK OF Vesper")
  let assert Ok(#(_, after_task)) = string.split_once(after_who, "TASK TEXT")
  let assert Ok(#(_, after_topic)) = string.split_once(after_task, "Topic: x")
  let assert Ok(#(_, after_index)) =
    string.split_once(after_topic, "INDEX TEXT")
  let assert Ok(#(_, after_obs)) =
    string.split_once(after_index, "OBSTRUCTIONS TEXT")
  let assert Ok(#(_, after_crystals)) =
    string.split_once(after_obs, "CRYSTALS TEXT")
  let assert Ok(#(_, after_sources)) =
    string.split_once(after_crystals, "SOURCES TEXT")
  let assert Ok(#(_, after_walls)) =
    string.split_once(after_sources, "## The walls")
  let assert Ok(#(_, after_notes)) =
    string.split_once(after_walls, "provers' own words")
  assert string.contains(after_notes, "## What the document must contain")
}

pub fn the_brief_says_which_files_are_absent_test() {
  let f = fixture("brief-absent", [], roster.Roster([]))
  let attack = f.repo <> "/docs/attacks/2026-09-07-x.md"
  let assert Ok(brief) =
    theorist.brief(f.cfg, identity("Nova", theorist.region), "x", attack)
  assert string.contains(brief, "Your notebook is empty")
  assert string.contains(brief, "docs/theorist-brief.md is absent")
  assert string.contains(brief, theorist.fallback_task)
  assert string.contains(brief, "(no blueprint/index.md in this checkout)")
  assert string.contains(brief, "(no docs/obstructions.md in this checkout)")
  assert string.contains(brief, "(no blueprint/crystals.md in this checkout)")
  assert string.contains(brief, "(no docs/sources.md in this checkout)")
  assert string.contains(brief, "(no proof notes under Rule30/Proofs/)")
}

/// The brief names the persona and its region, its notebook and no other
/// theorist's, the topic and the two files, states the fence in words,
/// lists every wall with its description verbatim and nothing that is not
/// a wall, and ends with the required sections and the spec's sentences.
pub fn the_brief_names_the_persona_the_topic_the_fence_the_walls_and_the_sections_test() {
  let f = fixture("brief-walls", [], peopled())
  let attack = f.repo <> "/docs/attacks/2026-09-07-the-seam.md"
  let assert Ok(brief) =
    theorist.brief(
      f.cfg,
      identity("Quill", theorist.region),
      "the seam",
      attack,
    )
  assert string.contains(brief, "## Who you are")
  assert string.contains(brief, "You are Quill, a theorist for region theory")
  assert string.contains(brief, "NOTEBOOK OF Quill")
  assert !string.contains(brief, "NOTEBOOK OF Vesper")
  assert string.contains(brief, "Topic: the seam")
  assert string.contains(brief, "Attack document: " <> attack)
  assert string.contains(brief, f.repo <> "/docs/obstructions.md")
  assert string.contains(brief, "exactly two files outside explorer/")
  assert string.contains(brief, "Under explorer/ you may write")
  assert string.contains(brief, "not your own notebook")
  assert string.contains(brief, "node <one path")
  // Every wall, closed ones included, and only walls.
  assert string.contains(
    brief,
    "### leftDiagonal_onset_le  size=wall  deps=(none)",
  )
  assert string.contains(
    brief,
    "### " <> theorist.frontier_wall <> "  size=wall",
  )
  assert string.contains(brief, "### aardvark_wall  size=wall")
  assert string.contains(brief, "### density_wall  size=wall")
  assert string.contains(brief, "what density_wall must imply, verbatim")
  assert !string.contains(brief, "### probe_closed")
  // The document's shape and the spec's three sentences.
  assert string.contains(brief, "1. What would have to be true")
  assert string.contains(brief, "2. Why each known route fails")
  assert string.contains(brief, "3. Candidate claims")
  assert string.contains(brief, "4. Next topic")
  assert string.contains(brief, "Most claims are expected to die")
  assert string.contains(brief, "survives to depth a")
  assert string.contains(brief, "read by a captain and by")
  assert string.contains(brief, "not by a prover")
}

// --- the report -------------------------------------------------------------------------

/// The theorist's schema asks for a notebook and a next topic and no
/// estimate; the prover's decoder would refuse this report and the
/// theorist's reads it.
pub fn a_theorist_report_carries_a_notebook_and_a_next_topic_and_no_estimate_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"attacked\",\"summary\":\"done\",\"notebook\":\"n\",\"journal\":\"j\",\"next_topic\":\"the onset\"}",
      decode.dynamic,
    )
  let assert Ok(report) = theorist.report_from_dynamic(dyn)
  assert report.outcome == "attacked"
  assert report.notebook == "n"
  assert report.next_topic == "the onset"
  let assert Error(_) = worker.report_from_dynamic(dyn)
  // theorist_report_schema() is the no-argument shape `run` actually
  // launches with, restored after report_schema was parameterised for the
  // connector to reuse; asserting against its five production literals
  // directly (not placeholder text passed to report_schema) is what makes
  // editing any one of them fail this test.
  let schema = theorist.theorist_report_schema()
  assert !string.contains(schema, "estimate")
  assert string.contains(schema, "\"attacked\"")
  assert string.contains(schema, "\"next_topic\"")
  assert string.contains(
    schema,
    "an entry for your own notebook, for your future self: what you tried on this topic, what died and at what depth, which sources you searched, what you would try next.",
  )
  assert string.contains(
    schema,
    "a short written update for Dib, in your own words: what you attacked, what died, what survived and to what depth.",
  )
  assert string.contains(
    schema,
    "the Next topic paragraph of your document, verbatim: at least one sentence naming what should be attacked next and why.",
  )
}
