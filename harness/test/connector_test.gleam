//// `connector`, driven offline: the verb's pure half here (flags, who, the
//// problem, the sighting path, the report, the brief), and in the second
//// half of this module one connector session against the scripted fake shim,
//// a fixture board, a fixture roster and a fixture checkout. Nothing here
//// spends the subscription, runs Lean, reaches the web, or touches the live
//// checkout: the fixture is its own `repo_root` with its own `docs/`,
//// `blueprint/`, `agents/` and `Rule30/`.

import envoy
import gleam/dynamic/decode
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{None, Some}
import gleam/result
import gleam/string
import harness/config
import harness/connector
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
    description: "RESIDUAL OF " <> id <> ", verbatim",
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

/// Two open P1 walls (one the frontier), a closed P1 wall, an open P2 wall
/// and a closed leaf: the problem must be the frontier and nothing else
/// must reach the brief.
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
    created: "2026-09-07T00:00:00Z",
    naming_reason: "a test never names itself",
    opening: "I am " <> name <> ", a fixture.",
    color: None,
  )
}

/// Two connectors, Meridian the elder; a theorist and a P1 prover who must
/// never be picked as a connector.
fn peopled() -> roster.Roster {
  roster.Roster([
    identity("Scripted", "P1"),
    identity("Vesper", theorist.region),
    identity("Meridian", connector.region),
    identity("Lodestar", connector.region),
  ])
}

type Fixture {
  Fixture(cfg: config.Config, dir: String, repo: String)
}

/// A fresh test directory holding a checkout-shaped `repo/` — the board,
/// the roster with its notebooks, `docs/`, `explorer/`, `Rule30/` — and the
/// runs root, with the fake shim scripted to play `script`. Files the brief
/// must NOT carry are put on disk on purpose, so their absence from the
/// brief is a fact about the render and not about the fixture.
fn fixture(
  name: String,
  script: List(List(String)),
  roster_: roster.Roster,
) -> Fixture {
  let dir = "build/test-runs/connector/" <> name
  let _ = simplifile.delete(dir)
  let assert Ok(cwd) = simplifile.current_directory()
  let repo = string.replace(cwd, "\\", "/") <> "/" <> dir <> "/repo"
  let assert Ok(_) = simplifile.create_directory_all(repo <> "/blueprint")
  let assert Ok(_) = simplifile.create_directory_all(repo <> "/docs")
  let assert Ok(_) = simplifile.create_directory_all(repo <> "/explorer")
  let assert Ok(_) = simplifile.create_directory_all(repo <> "/agents")
  let assert Ok(_) = simplifile.create_directory_all(repo <> "/Rule30/Proofs")
  let assert Ok(_) = dag.save(board(), repo <> "/blueprint/dag.json")
  let assert Ok(_) = roster.save(roster_, repo <> "/agents/roster.json")
  list.each(roster_.identities, fn(i) {
    let assert Ok(_) =
      simplifile.write(
        repo <> "/agents/" <> i.name <> ".md",
        "# " <> i.name <> "\n\n" <> i.opening <> "\n\nNOTEBOOK OF " <> i.name,
      )
  })
  let assert Ok(_) =
    simplifile.write(
      repo <> "/blueprint/index.md",
      "INDEX TEXT MUST NOT APPEAR",
    )
  let assert Ok(_) =
    simplifile.write(
      repo <> "/blueprint/crystals.md",
      "CRYSTALS TEXT MUST NOT APPEAR",
    )
  let assert Ok(_) =
    simplifile.write(
      repo <> "/Rule30/Proofs/ProbeClosed.lean",
      "import Rule30.Basic\n\n/-!\n**What this says.** PROOF NOTE MUST NOT APPEAR\n**Why it is true.** x\n**Where the work is.** y\n-/\n\ntheorem probe_closed : True := trivial\n",
    )
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
      connector_max_turns: 600,
      connector_max_budget_usd: 80.0,
      turn_timeout_ms: 20_000,
    )
  Fixture(cfg:, dir:, repo:)
}

fn put(f: Fixture, relative: String, text: String) -> Nil {
  let assert Ok(_) = simplifile.write(f.repo <> "/" <> relative, text)
  Nil
}

fn read(path: String) -> String {
  simplifile.read(path) |> result.unwrap("")
}

fn frontier() -> dag.Node {
  node(theorist.frontier_wall, "P1", dag.Wall, dag.Open)
}

// --- flags -------------------------------------------------------------------------------

pub fn connect_flags_parse_in_any_order_test() {
  let assert Ok(a) =
    connector.parse_flags([
      "ergodic theory", "--as", "Lodestar", "--model", "opus",
    ])
  let assert Ok(b) =
    connector.parse_flags([
      "--model", "opus", "ergodic theory", "--as", "Lodestar",
    ])
  assert a == b
  assert a
    == connector.Flags(
      model: "opus",
      vantage: Some("ergodic theory"),
      persona: Some("Lodestar"),
    )
  assert connector.parse_flags([])
    == Ok(connector.Flags(model: "fable", vantage: None, persona: None))
  assert connector.default_model == "fable"
  let assert Error(needs_value) = connector.parse_flags(["--model"])
  assert string.contains(needs_value, "--model")
  let assert Error(unknown) = connector.parse_flags(["--modle", "opus"])
  assert string.contains(unknown, "--modle")
  assert string.contains(unknown, "connect")
  let assert Error(two) = connector.parse_flags(["ergodic", "theory"])
  assert string.contains(two, "quote")
}

/// Three hundred above the run base: clear of a run (counting up from the
/// base), a seeder (+100) and a theorist (+200) started beside it.
pub fn the_connector_port_is_three_hundred_above_the_run_base_test() {
  let assert Ok(base) = config.load()
  assert connector.default_port(config.Config(..base, guard_port: 4130)) == 4430
  assert connector.default_port(config.Config(..base, guard_port: 5000)) == 5300
}

// --- who ----------------------------------------------------------------------------------

pub fn who_picks_the_eldest_connector_or_decides_to_mint_test() {
  assert connector.who(peopled(), None)
    == Ok(schedule.Existing(identity("Meridian", connector.region)))
  assert connector.who(peopled(), Some("Lodestar"))
    == Ok(schedule.Existing(identity("Lodestar", connector.region)))
  assert connector.who(
      roster.Roster([identity("Scripted", "P1"), identity("Vesper", "theory")]),
      None,
    )
    == Ok(schedule.Mint(region: connector.region, busy: []))
  let assert Error(empty) = connector.who(roster.Roster([]), Some("Nobody"))
  assert string.contains(empty, "leave --as off")
  // A theorist's name is refused, not borrowed: its notebook in a
  // connector's brief would be a theorist wearing the name.
  let assert Error(foreign) = connector.who(peopled(), Some("Vesper"))
  assert string.contains(foreign, "Vesper is on the roster for region theory")
  let assert Error(unknown) = connector.who(peopled(), Some("Nobody"))
  assert string.contains(unknown, "Meridian, Lodestar")
}

// --- the problem and the path -------------------------------------------------------------

/// The problem is the P1 frontier as the board has it, and it is the whole
/// node, because the brief carries its description.
pub fn the_problem_is_the_frontier_wall_test() {
  assert connector.problem(board()) == Ok(frontier())
  let assert Error(reason) =
    connector.problem(Dag([node("aaa_wall", "P2", dag.Wall, dag.Open)]))
  assert string.contains(reason, "no open wall in P1")
}

/// The file is named for the vantage, or for the problem when none was
/// given; a second sighting on one name in a day gets `-2`.
pub fn the_sighting_path_is_dated_slugged_and_numbered_test() {
  assert connector.named_for(theorist.frontier_wall, Some("Ergodic theory"))
    == "Ergodic theory"
  assert connector.named_for(theorist.frontier_wall, None)
    == theorist.frontier_wall
  assert connector.sighting_path("C:/r", "2026-09-07", "Ergodic & damage")
    == "C:/r/docs/connections/2026-09-07-ergodic-damage.md"
  assert connector.numbered_sighting_path(
      "C:/r",
      "2026-09-07",
      "Ergodic & damage",
      2,
    )
    == "C:/r/docs/connections/2026-09-07-ergodic-damage-2.md"
  assert connector.sighting_path("C:/r", "2026-09-07", theorist.frontier_wall)
    == "C:/r/docs/connections/2026-09-07-centercolumn-other-iseventuallyperiodic-of-center.md"
}

pub fn the_free_sighting_path_is_the_first_not_taken_test() {
  let f = fixture("free-path", [], roster.Roster([]))
  let bare = connector.sighting_path(f.repo, "2026-09-07", "the seam")
  let second =
    connector.numbered_sighting_path(f.repo, "2026-09-07", "the seam", 2)
  let third =
    connector.numbered_sighting_path(f.repo, "2026-09-07", "the seam", 3)
  assert connector.free_sighting_path(f.repo, "2026-09-07", "the seam") == bare
  let assert Ok(_) =
    simplifile.create_directory_all(f.repo <> "/docs/connections")
  let assert Ok(_) = simplifile.write(bare, "first")
  assert connector.free_sighting_path(f.repo, "2026-09-07", "the seam")
    == second
  let assert Ok(_) = simplifile.create_directory(second)
  assert connector.free_sighting_path(f.repo, "2026-09-07", "the seam") == third
  assert connector.free_sighting_path(f.repo, "2026-09-08", "the seam")
    == connector.sighting_path(f.repo, "2026-09-08", "the seam")
}

// --- the report -------------------------------------------------------------------------

pub fn a_connector_report_carries_a_next_vantage_and_no_estimate_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"sighted\",\"summary\":\"done\",\"notebook\":\"n\",\"journal\":\"j\",\"next_vantage\":\"automatic sequences\"}",
      decode.dynamic,
    )
  let assert Ok(report) = connector.report_from_dynamic(dyn)
  assert report.outcome == "sighted"
  assert report.next_vantage == "automatic sequences"
  let assert Error(_) = worker.report_from_dynamic(dyn)
  assert !string.contains(connector.report_schema(), "estimate")
  assert string.contains(connector.report_schema(), "\"sighted\"")
  assert string.contains(connector.report_schema(), "next_vantage")
  assert !string.contains(connector.report_schema(), "next_topic")
}

pub fn the_first_message_names_the_problem_the_vantage_and_the_file_test() {
  let with =
    connector.task_message(
      theorist.frontier_wall,
      Some("ergodic theory"),
      "C:/r/docs/connections/2026-09-07-ergodic-theory.md",
    )
  assert string.starts_with(
    with,
    "Sight the problem `"
      <> theorist.frontier_wall
      <> "` from the vantage `ergodic theory`",
  )
  assert string.contains(
    with,
    "sighting document to `C:/r/docs/connections/2026-09-07-ergodic-theory.md`",
  )
  assert string.contains(with, "six sections")
  assert string.contains(with, "WebFetch")
  assert string.contains(with, "every URL you fetch is recorded")
  assert string.contains(with, "may not add to docs/obstructions.md")
  assert string.contains(with, "`sighted`")
  assert string.contains(with, "next_vantage")
  let without = connector.task_message(theorist.frontier_wall, None, "p.md")
  assert string.contains(without, "choosing your own vantage")
}

// --- the brief ---------------------------------------------------------------------------

/// The six inputs and nothing else: the task text, the notebook, the
/// problem's residual, the obstructions, the sources, the definitions —
/// never the index, the crystals, the proof notes, the other walls, or
/// another persona's notebook, all of which the fixture puts on disk.
pub fn the_brief_carries_the_six_inputs_and_nothing_else_test() {
  let f = fixture("brief-six", [], peopled())
  put(f, "docs/connector-brief.md", "TASK TEXT FROM DISK")
  put(f, "docs/obstructions.md", "OBSTRUCTIONS TEXT")
  put(f, "docs/sources.md", "SOURCES TEXT")
  put(f, "Rule30/Basic.lean", "BASIC LEAN TEXT")
  let sighting = f.repo <> "/docs/connections/2026-09-07-ergodic-theory.md"
  let assert Ok(brief) =
    connector.brief(
      f.cfg,
      identity("Meridian", connector.region),
      frontier(),
      Some("ergodic theory"),
      sighting,
    )
  // Present.
  assert string.contains(brief, "## Who you are")
  assert string.contains(
    brief,
    "You are Meridian, a connector for region connect",
  )
  assert string.contains(brief, "NOTEBOOK OF Meridian")
  assert string.contains(brief, "TASK TEXT FROM DISK")
  assert string.contains(brief, "Problem: " <> theorist.frontier_wall)
  assert string.contains(brief, "Vantage: ergodic theory")
  assert string.contains(brief, "Sighting document: " <> sighting)
  assert string.contains(
    brief,
    "### " <> theorist.frontier_wall <> "  size=wall  deps=(none)",
  )
  assert string.contains(brief, "RESIDUAL OF " <> theorist.frontier_wall)
  assert string.contains(brief, "OBSTRUCTIONS TEXT")
  assert string.contains(brief, "SOURCES TEXT")
  assert string.contains(brief, "BASIC LEAN TEXT")
  assert string.contains(brief, "1. The problem, seen from outside")
  assert string.contains(brief, "4. Died in translation")
  assert string.contains(brief, "6. Next vantage")
  // The fence in words.
  assert string.contains(brief, "exactly one file outside explorer/")
  assert string.contains(brief, "not docs/obstructions.md")
  assert string.contains(brief, "WebFetch")
  assert string.contains(brief, "every URL is recorded")
  // Absent.
  assert !string.contains(brief, "INDEX TEXT")
  assert !string.contains(brief, "CRYSTALS TEXT")
  assert !string.contains(brief, "PROOF NOTE")
  assert !string.contains(brief, "provers' own words")
  assert !string.contains(brief, "## The walls")
  assert !string.contains(brief, "leftDiagonal_onset_le")
  assert !string.contains(brief, "density_wall")
  assert !string.contains(brief, "NOTEBOOK OF Lodestar")
  assert !string.contains(brief, "NOTEBOOK OF Vesper")
  assert !string.contains(brief, "NOTEBOOK OF Scripted")
  // Order: who, task, problem and fence, obstructions, sources, definitions,
  // the document's sections.
  let assert Ok(#(_, after_who)) =
    string.split_once(brief, "NOTEBOOK OF Meridian")
  let assert Ok(#(_, after_task)) = string.split_once(after_who, "TASK TEXT")
  let assert Ok(#(_, after_problem)) =
    string.split_once(after_task, "RESIDUAL OF")
  let assert Ok(#(_, after_obs)) =
    string.split_once(after_problem, "OBSTRUCTIONS TEXT")
  let assert Ok(#(_, after_sources)) =
    string.split_once(after_obs, "SOURCES TEXT")
  let assert Ok(#(_, after_basic)) =
    string.split_once(after_sources, "BASIC LEAN TEXT")
  assert string.contains(after_basic, "## What the document must contain")
}

pub fn the_brief_says_which_files_are_absent_and_that_no_vantage_was_given_test() {
  let f = fixture("brief-absent", [], roster.Roster([]))
  let assert Ok(brief) =
    connector.brief(
      f.cfg,
      identity("Nova", connector.region),
      frontier(),
      None,
      f.repo <> "/docs/connections/2026-09-07-x.md",
    )
  assert string.contains(brief, "Your notebook is empty")
  assert string.contains(brief, "docs/connector-brief.md is absent")
  assert string.contains(brief, connector.fallback_task)
  assert string.contains(brief, "(no docs/obstructions.md in this checkout)")
  assert string.contains(brief, "(no docs/sources.md in this checkout)")
  assert string.contains(brief, "(no Rule30/Basic.lean in this checkout)")
  assert string.contains(brief, "Vantage: none given")
}

// --- session helpers ----------------------------------------------------------------

fn options(port: Int, vantage: String) -> connector.Options {
  connector.Options(
    model: "haiku",
    port:,
    vantage: Some(vantage),
    persona: None,
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

fn report_fields(outcome: String) -> List(#(String, json.Json)) {
  [
    #("outcome", json.string(outcome)),
    #("summary", json.string("scripted " <> outcome)),
    #("notebook", json.string("scripted connector notebook entry")),
    #("journal", json.string("scripted connector journal entry")),
    #(
      "next_vantage",
      json.string("Attack from automatic sequences next, because 2-adic."),
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

/// A result whose `structured_output` answers both a naming ceremony and a
/// connector's report: the shim plays the same script to every process.
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
      report_fields("sighted"),
    ),
  )
}

fn exists(path: String) -> Bool {
  simplifile.is_file(path) |> result.unwrap(False)
}

fn run_dir(f: Fixture) -> String {
  let assert Ok([run]) = simplifile.read_directory(f.cfg.runs_root)
  f.cfg.runs_root <> "/" <> run
}

/// POST one raw hook body to the session's guard, the way Claude Code's
/// hook does, and return what the hook would print back.
fn ask(g: guard.Guard, body: String) -> String {
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
        body,
        "http://127.0.0.1:" <> int.to_string(g.port) <> "/hook",
      ],
      ".",
      5000,
    )
  r.output
}

fn ask_to_write(g: guard.Guard, path: String) -> String {
  ask(
    g,
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\""
      <> string.replace(path, "\\", "/")
      <> "\"}}",
  )
}

fn ask_to_fetch(g: guard.Guard, url: String) -> String {
  ask(
    g,
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"WebFetch\",\"tool_input\":{\"url\":\""
      <> url
      <> "\",\"prompt\":\"quote it\"}}",
  )
}

// --- the verb -----------------------------------------------------------------------

pub fn connect_starts_one_fenced_session_and_reports_its_document_test() {
  // The document is written by the scripted session, mid-turn, the way a
  // connector writes it — a file already at the path at session start is a
  // first session's, and the fence moves to `-2`.
  let assert Ok(cwd) = simplifile.current_directory()
  let repo =
    string.replace(cwd, "\\", "/") <> "/build/test-runs/connector/sighted/repo"
  let sighting =
    connector.sighting_path(repo, theorist.today(), "ergodic theory")
  let f =
    fixture(
      "sighted",
      [
        [
          init_line("cn-s"),
          "__WRITE__ " <> sighting <> "\t# Sighting\n\ntwenty-two",
          result_line("cn-s", "sighted"),
        ],
      ],
      peopled(),
    )
  assert f.repo == repo
  put(
    f,
    "docs/connector-brief.md",
    "# The connector's task\n\nfixture task text",
  )
  let port = ports.span(1)
  let args_path = f.dir <> "/args.json"
  envoy.set("HARNESS_FAKE_ARGS", args_path)
  let started = connector.run(f.cfg, options(port, "ergodic theory"))
  envoy.unset("HARNESS_FAKE_ARGS")
  let assert Ok(session) = started
  assert session.problem == theorist.frontier_wall
  assert session.vantage == Some("ergodic theory")
  assert session.sighting_path == sighting
  // No `--as`: the eldest connector, never the theorist or the P1 prover.
  assert session.identity.name == "Meridian"

  // The record is `runs/<id>/connector-1/`.
  let cn_dir = run_dir(f) <> "/" <> connector.session_name
  assert session.dir == cn_dir
  assert exists(cn_dir <> "/events.jsonl")
  assert exists(cn_dir <> "/settings.json")
  let brief = read(cn_dir <> "/briefs/connector-1.md")
  assert string.contains(brief, "fixture task text")
  assert string.contains(brief, "Vantage: ergodic theory")
  assert string.contains(brief, sighting)
  assert string.contains(brief, "NOTEBOOK OF Meridian")
  assert !string.contains(brief, "NOTEBOOK OF Lodestar")
  assert !string.contains(brief, "NOTEBOOK OF Vesper")
  assert !string.contains(brief, "INDEX TEXT")

  // The dispatch row names the role, the persona, the port, the problem,
  // the vantage and the file; nothing was minted; the first message names
  // the problem and the vantage.
  let events = read(cn_dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"dispatch\"")
  assert string.contains(events, "\"role\":\"connector\"")
  assert string.contains(events, "\"identity\":\"Meridian\"")
  assert string.contains(events, "\"port\":" <> int.to_string(port))
  assert string.contains(
    events,
    "\"problem\":\"" <> theorist.frontier_wall <> "\"",
  )
  assert string.contains(events, "\"vantage\":\"ergodic theory\"")
  assert string.contains(events, "\"sighting\":\"" <> sighting <> "\"")
  assert !string.contains(events, "\"kind\":\"naming\"")
  assert string.contains(events, "\"kind\":\"sent\"")
  assert string.contains(events, "from the vantage `ergodic theory`")

  // The session ran under the connector's ceilings and with the two web
  // tools on the CLI allowlist — the shim saw both on its command line.
  assert string.contains(events, "\"max_turns\":600")
  assert string.contains(events, "\"max_budget_usd\":80.0")
  let args = read(args_path)
  assert string.contains(
    args,
    "\"--max-turns\",\"600\",\"--max-budget-usd\",\"80.0\"",
  )
  assert string.contains(
    args,
    "\"--allowedTools\",\"Read,Edit,Write,Grep,Glob,Bash,WebFetch,WebSearch\"",
  )
  assert !string.contains(args, "--bare")
  assert string.contains(session.summary, "ceilings   600 turns, $80.0")

  // The guard is a Connector guard on the port it was asked for: it allows
  // the sighting document and a script, refuses the obstructions file, the
  // proposal file and the notebook, allows an https fetch and logs it.
  assert session.guard.port == port
  assert ask_to_write(session.guard, sighting) == "{}"
  assert ask_to_write(session.guard, f.repo <> "/explorer/probe.mjs") == "{}"
  let refused = ask_to_write(session.guard, f.repo <> "/docs/obstructions.md")
  assert string.contains(refused, "deny")
  assert string.contains(refused, "sighting document")
  assert string.contains(
    ask_to_write(session.guard, f.repo <> "/blueprint/proposals/next.json"),
    "deny",
  )
  assert string.contains(
    ask_to_write(session.guard, f.repo <> "/agents/Meridian.md"),
    "deny",
  )
  assert ask_to_fetch(session.guard, "https://arxiv.org/abs/2001.00001") == "{}"
  let after = read(cn_dir <> "/events.jsonl")
  assert string.contains(after, "\"node\":\"connector-1\"")
  assert string.contains(after, "\"denial\":\"not_writable\"")
  assert string.contains(after, "\"kind\":\"web\"")
  assert string.contains(after, "\"url\":\"https://arxiv.org/abs/2001.00001\"")

  // The summary names who ran, the problem, the vantage and the document,
  // says it exists and how big it is, carries the next vantage, and never
  // calls anything proved.
  assert string.contains(session.summary, "connector  Meridian")
  assert string.contains(
    session.summary,
    "problem    " <> theorist.frontier_wall,
  )
  assert string.contains(session.summary, "vantage    ergodic theory")
  assert string.contains(session.summary, "sighting   " <> sighting)
  assert string.contains(session.summary, "document   exists, 22 bytes")
  assert string.contains(session.summary, "ended      finished")
  assert !string.contains(session.summary, "proved")
  assert string.contains(
    session.summary,
    "Attack from automatic sequences next",
  )
  assert string.contains(session.summary, "cost       $1.25")
  assert string.contains(session.summary, "session    cn-s")
  assert read(run_dir(f) <> "/summary.txt") == session.summary <> "\n"

  // The notebook and the journal were written from the report, verbatim,
  // by the harness: Meridian's notebook grew by one dated section headed
  // with the problem, the vantage and the ending; Lodestar's did not change.
  let notebook = read(f.cfg.agents_dir <> "/Meridian.md")
  assert string.contains(notebook, "NOTEBOOK OF Meridian")
  assert string.contains(
    notebook,
    "— " <> theorist.frontier_wall <> " from ergodic theory (haiku, sighted)",
  )
  assert string.contains(notebook, "scripted connector notebook entry")
  assert !string.contains(read(f.cfg.agents_dir <> "/Lodestar.md"), "scripted")
  let journal = read(run_dir(f) <> "/journal.md")
  assert string.contains(journal, "## Meridian on connector-1")
  assert string.contains(journal, "scripted connector journal entry")

  // The roster and the board are as they were.
  let assert Ok(r) = roster.load(f.cfg.roster_path)
  assert r == peopled()
  let assert Ok(d) = dag.load(f.cfg.dag_path)
  assert d == board()
}

/// `--as` with an idle connector starts that one; no vantage means the file
/// is named for the problem; a connector that reports `sighted` with no
/// document on disk is recorded as abandoned.
pub fn as_starts_the_named_connector_and_a_missing_document_is_abandoned_test() {
  let f =
    fixture(
      "no-document",
      [[init_line("cn-n"), result_line("cn-n", "sighted")]],
      peopled(),
    )
  let assert Ok(session) =
    connector.run(
      f.cfg,
      connector.Options(
        model: "haiku",
        port: ports.span(1),
        vantage: None,
        persona: Some("Lodestar"),
      ),
    )
  assert session.identity.name == "Lodestar"
  assert session.vantage == None
  assert session.sighting_path
    == connector.sighting_path(f.repo, theorist.today(), theorist.frontier_wall)
  assert string.contains(session.summary, "connector  Lodestar")
  assert string.contains(session.summary, "vantage    (none given")
  assert string.contains(session.summary, "document   MISSING")
  assert string.contains(session.summary, "ended      abandoned")
  assert string.contains(session.summary, "no document exists")
  let notebook = read(f.cfg.agents_dir <> "/Lodestar.md")
  assert string.contains(
    notebook,
    "— " <> theorist.frontier_wall <> " (haiku, abandoned)",
  )
  assert !string.contains(read(f.cfg.agents_dir <> "/Meridian.md"), "scripted")
}

/// `--as` with a name the roster lacks, or a name from another region, is
/// refused before anything is written: no run directory, no ceremony.
pub fn as_with_an_unknown_or_foreign_name_refuses_before_writing_test() {
  let f = fixture("as-unknown", [], peopled())
  let assert Error(unknown) =
    connector.run(
      f.cfg,
      connector.Options(
        model: "haiku",
        port: ports.span(1),
        vantage: Some("x"),
        persona: Some("Nobody"),
      ),
    )
  assert string.contains(unknown, "no connector named Nobody")
  let assert Error(foreign) =
    connector.run(
      f.cfg,
      connector.Options(
        model: "haiku",
        port: ports.span(1),
        vantage: Some("x"),
        persona: Some("Vesper"),
      ),
    )
  assert string.contains(foreign, "Vesper is on the roster for region theory")
  assert simplifile.is_directory(f.cfg.runs_root) == Ok(False)
}

/// No `--as` and no connector on the roster: the naming ceremony runs, the
/// newcomer joins the roster in the `connect` region, its notebook opens in
/// its own voice, and the session runs as it.
pub fn a_connector_is_minted_when_the_roster_has_none_test() {
  let f =
    fixture(
      "mint",
      [[init_line("cn-m"), naming_and_report_line("cn-m")]],
      roster.Roster([identity("Scripted", "P1"), identity("Vesper", "theory")]),
    )
  let assert Ok(session) = connector.run(f.cfg, options(ports.span(1), "x"))
  assert session.identity.name == "Minted"
  assert session.identity.region == connector.region
  let assert Ok(after) = roster.load(f.cfg.roster_path)
  assert list.map(roster.for_region(after, connector.region), fn(i) { i.name })
    == ["Minted"]
  let events = read(session.dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"naming\"")
  assert string.contains(events, "\"region\":\"connect\"")
  assert string.contains(events, "\"because\":\"region empty\"")
  let notebook = read(f.cfg.agents_dir <> "/Minted.md")
  assert string.starts_with(
    notebook,
    "# Minted\n\nI am Minted, a scripted opening.",
  )
  assert string.contains(notebook, "named for connect")
  assert string.contains(notebook, "scripted connector notebook entry")
  assert string.contains(session.summary, "connector  Minted")
}

/// The design's intended use — several sightings of one problem in a day —
/// and the collision it must not have: with a first document on disk, the
/// second session is fenced to `-2`, every record names that path, and the
/// guard denies the first session's file.
pub fn a_second_sighting_on_one_vantage_in_a_day_gets_its_own_file_test() {
  let assert Ok(cwd) = simplifile.current_directory()
  let repo =
    string.replace(cwd, "\\", "/") <> "/build/test-runs/connector/second/repo"
  let first = connector.sighting_path(repo, theorist.today(), "ergodic theory")
  let second =
    connector.numbered_sighting_path(
      repo,
      theorist.today(),
      "ergodic theory",
      2,
    )
  let f =
    fixture(
      "second",
      [
        [
          init_line("cn-2"),
          "__WRITE__ " <> second <> "\t# Second sighting",
          result_line("cn-2", "sighted"),
        ],
      ],
      peopled(),
    )
  assert f.repo == repo
  let assert Ok(_) =
    simplifile.create_directory_all(repo <> "/docs/connections")
  let assert Ok(_) = simplifile.write(first, "# First sighting, Meridian's")
  let assert Ok(session) =
    connector.run(f.cfg, options(ports.span(1), "ergodic theory"))
  assert session.sighting_path == second
  assert string.ends_with(second, "-ergodic-theory-2.md")
  let brief = read(session.dir <> "/briefs/connector-1.md")
  assert string.contains(brief, "Sighting document: " <> second)
  assert !string.contains(brief, first)
  let events = read(session.dir <> "/events.jsonl")
  assert string.contains(events, "\"sighting\":\"" <> second <> "\"")
  assert !string.contains(events, "\"sighting\":\"" <> first <> "\"")
  assert string.contains(session.summary, "sighting   " <> second)
  assert string.contains(session.summary, "document   exists, 17 bytes")
  assert ask_to_write(session.guard, second) == "{}"
  let refused = ask_to_write(session.guard, first)
  assert string.contains(refused, "deny")
  assert string.contains(refused, second)
  assert read(first) == "# First sighting, Meridian's"
}
