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
