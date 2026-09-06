import gleam/list
import gleam/option.{None, Some}
import gleam/string
import harness/dag.{Attempt, Dag, Node}
import harness/roster.{type Identity, Identity, Roster}
import simplifile

fn thessaly() -> Identity {
  Identity(
    name: "Thessaly",
    region: "P1",
    created: "2026-09-05T21:15:00Z",
    naming_reason: "A plain of long horizons; the cone is a plain seen edge on.",
    opening: "I work the edges of the cone.",
    color: None,
  )
}

fn ravel() -> Identity {
  Identity(
    name: "Ravel",
    region: "P2",
    created: "2026-09-05T21:20:00Z",
    naming_reason: "Counting is unravelling.",
    opening: "I count black cells and bound their ratios.",
    color: Some("#7b2d8e"),
  )
}

pub fn round_trip_json_test() {
  let r = Roster([thessaly(), ravel()])
  assert roster.decode(roster.encode(r)) == Ok(r)
}

pub fn round_trip_json_without_a_colour_test() {
  let r = Roster([thessaly()])
  assert roster.decode(roster.encode(r)) == Ok(r)
  assert thessaly().color == None
}

pub fn round_trip_json_with_a_colour_test() {
  let r = Roster([ravel()])
  assert roster.decode(roster.encode(r)) == Ok(r)
  assert ravel().color == Some("#7b2d8e")
}

pub fn a_legacy_roster_with_no_color_field_at_all_still_loads_test() {
  let text =
    "{\"identities\":[{\"name\":\"Emmy\",\"region\":\"P2\",\"created\":\"2026-09-05T21:33:04Z\",\"naming_reason\":\"r\",\"opening\":\"o\"}]}"
  let assert Ok(r) = roster.decode(text)
  assert r.identities
    == [
      Identity(
        name: "Emmy",
        region: "P2",
        created: "2026-09-05T21:33:04Z",
        naming_reason: "r",
        opening: "o",
        color: None,
      ),
    ]
}

pub fn load_of_a_missing_file_is_an_empty_roster_test() {
  assert roster.load("./test/tmp/definitely-not-here.json") == Ok(Roster([]))
}

pub fn save_then_load_round_trips_through_disk_test() {
  let dir = "./test/tmp/roster_save"
  let _ = simplifile.create_directory_all(dir)
  let path = dir <> "/roster.json"
  let r = Roster([thessaly()])
  assert roster.save(r, path) == Ok(Nil)
  assert roster.load(path) == Ok(r)
  let _ = simplifile.delete(dir)
}

pub fn for_region_lists_the_specialists_in_roster_order_test() {
  let r = Roster([thessaly(), ravel(), Identity(..thessaly(), name: "Tarn")])
  assert list.map(roster.for_region(r, "P1"), fn(i) { i.name })
    == ["Thessaly", "Tarn"]
  assert roster.for_region(r, "P2") == [ravel()]
  assert roster.for_region(r, "P3") == []
}

pub fn idle_for_region_skips_busy_names_and_prefers_the_eldest_test() {
  let tarn = Identity(..thessaly(), name: "Tarn")
  let r = Roster([thessaly(), ravel(), tarn])
  assert roster.idle_for_region(r, "P1", busy: []) == Some(thessaly())
  assert roster.idle_for_region(r, "P1", busy: ["Thessaly"]) == Some(tarn)
  assert roster.idle_for_region(r, "P1", busy: ["Thessaly", "Tarn"]) == None
  assert roster.idle_for_region(r, "P3", busy: []) == None
}

pub fn add_appends_test() {
  let r = roster.add(Roster([thessaly()]), ravel())
  assert r.identities == [thessaly(), ravel()]
}

// --- names ------------------------------------------------------------------

pub fn check_name_accepts_a_name_test() {
  assert roster.check_name(Roster([]), "Thessaly") == Ok(Nil)
  assert roster.check_name(Roster([]), "Io") == Ok(Nil)
}

pub fn check_name_rejects_malformed_names_test() {
  let empty = Roster([])
  // lowercase first letter, one letter, digits, spaces, too long
  assert roster.check_name(empty, "thessaly") != Ok(Nil)
  assert roster.check_name(empty, "T") != Ok(Nil)
  assert roster.check_name(empty, "Prover7") != Ok(Nil)
  assert roster.check_name(empty, "Cone Specialist") != Ok(Nil)
  assert roster.check_name(empty, "Abcdefghijklmnopqrstuvwxyz") != Ok(Nil)
}

pub fn check_name_rejects_a_collision_test() {
  let assert Error(reason) = roster.check_name(Roster([thessaly()]), "Thessaly")
  assert string.contains(reason, "already taken")
}

pub fn naming_prompt_carries_the_region_and_its_description_test() {
  let p = roster.naming_prompt("P1", roster.region_description("P1"))
  assert string.contains(p, "\"P1\"")
  assert string.contains(p, "the geometry of the light cone")
  assert string.contains(p, "It must be a name, not a job title")
  assert string.contains(p, "- \"name\": the name you choose")
}

pub fn naming_prompt_asks_for_a_colour_and_its_reason_test() {
  let p = roster.naming_prompt("P1", roster.region_description("P1"))
  assert string.contains(p, "\"color\"")
  assert string.contains(p, "\"color_reason\"")
  assert string.contains(p, "#rrggbb")
}

pub fn region_descriptions_are_the_spec_wording_test() {
  assert roster.region_description("P1")
    == "the geometry of the light cone and its edges, where periodicity provably holds"
  assert roster.region_description("P2")
    == "the density bookkeeping behind the balance conjecture: counting black cells and bounding ratios in ℝ"
}

pub fn naming_schema_requires_all_five_fields_test() {
  let s = roster.naming_schema()
  assert string.contains(
    s,
    "\"required\":[\"name\",\"reason\",\"opening\",\"color\",\"color_reason\"]",
  )
}

// --- colours ------------------------------------------------------------------

pub fn valid_color_accepts_hex_case_insensitively_test() {
  assert roster.valid_color("#7B2D8E") == True
  assert roster.valid_color("#7b2d8e") == True
}

pub fn valid_color_rejects_malformed_colours_test() {
  assert roster.valid_color("7b2d8e") == False
  assert roster.valid_color("#7b2d8") == False
  assert roster.valid_color("#ggggggg") == False
}

// --- notebooks --------------------------------------------------------------

pub fn append_notebook_writes_the_opening_on_the_first_write_test() {
  let dir = "./test/tmp/notebooks_first"
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let who = thessaly()

  assert roster.read_notebook(dir, who) == ""
  assert roster.append_notebook(
      dir,
      who,
      "2026-09-05T21:30:00Z — a (haiku, proved)",
      "Nat.rec did it.",
    )
    == Ok(Nil)

  let text = roster.read_notebook(dir, who)
  assert string.starts_with(
    text,
    "# Thessaly\n\nI work the edges of the cone.\n",
  )
  assert string.contains(text, "## 2026-09-05T21:30:00Z — a (haiku, proved)")
  assert string.contains(text, "Nat.rec did it.")

  // A second entry appends, and does not repeat the header.
  assert roster.append_notebook(dir, who, "later", "Second entry.") == Ok(Nil)
  let text = roster.read_notebook(dir, who)
  assert string.contains(text, "Second entry.")
  assert count_occurrences(text, "# Thessaly") == 1

  let _ = simplifile.delete(dir)
}

pub fn append_notebook_drops_a_heading_the_entry_brought_of_its_own_test() {
  let dir = "./test/tmp/notebooks_heading"
  let _ = simplifile.delete(dir)
  let assert Ok(_) = simplifile.create_directory_all(dir)
  let who = thessaly()

  // A prover that opens its report with a title of its own would otherwise
  // leave the notebook with the section heading twice.
  let assert Ok(Nil) =
    roster.append_notebook(
      dir,
      who,
      "2026-09-06T01:07:18Z — a (sonnet, proved)",
      "## a (sonnet, proved)

Induction on t.",
    )
  let text = roster.read_notebook(dir, who)
  assert count_occurrences(text, "(sonnet, proved)") == 1
  assert string.contains(text, "## 2026-09-06T01:07:18Z — a (sonnet, proved)")
  assert string.contains(text, "Induction on t.")

  let _ = simplifile.delete(dir)
}

pub fn notebook_path_is_agents_slash_name_md_test() {
  assert roster.notebook_path("agents", thessaly()) == "agents/Thessaly.md"
}

fn count_occurrences(haystack: String, needle: String) -> Int {
  list.length(string.split(haystack, needle)) - 1
}

// --- scorecard --------------------------------------------------------------

fn attempt(
  who: String,
  outcome: dag.Outcome,
  estimate: dag.Size,
  cost: Float,
) -> dag.Attempt {
  Attempt(
    identity: who,
    session_id: "s",
    model: "sonnet",
    started: "t0",
    ended: "t1",
    outcome:,
    estimate:,
    reported: True,
    cost_usd: cost,
    turns: 3,
    notes: "",
  )
}

fn node_with(
  id: String,
  size: dag.Size,
  attempts: List(dag.Attempt),
) -> dag.Node {
  Node(
    id:,
    region: "P1",
    lean_name: id,
    description: "d",
    deps: [],
    status: dag.Open,
    size:,
    proof_file: None,
    attempts:,
    verified: None,
  )
}

pub fn scorecard_counts_only_this_identitys_attempts_test() {
  let d =
    Dag([
      node_with("a", dag.S, [
        attempt("Thessaly", dag.Closed, dag.S, 0.5),
        attempt("Ravel", dag.Closed, dag.L, 9.0),
      ]),
      node_with("b", dag.M, [
        // estimate M matches the node's size: a calibration hit
        attempt("Thessaly", dag.Closed, dag.M, 1.0),
        // estimate L against an M node: a miss, and abandoned
        attempt("Thessaly", dag.GaveUp, dag.L, 0.6),
      ]),
      node_with("c", dag.L, [
        // rate-limited counts as neither closed nor abandoned
        attempt("Thessaly", dag.RateLimited, dag.L, 0.0),
      ]),
    ])
  let s = roster.scorecard(d, "Thessaly")
  assert s.closed == 2
  assert s.abandoned == 1
  assert s.calibration_hits == 3
  assert s.calibration_total == 4
  assert roster.scorecard_text(s, None)
    == "Thessaly: closed 2, abandoned 1, $2.10, calibration 3/4"
}

pub fn an_attempt_with_no_report_is_not_calibration_evidence_test() {
  // A session that died before reporting has its node's own size copied in
  // as `estimate`. Counting that as a hit would score the identity for
  // agreeing with a number it never saw.
  let unreported =
    dag.Attempt(
      ..attempt("Thessaly", dag.TimedOut, dag.M, 0.0),
      reported: False,
    )
  let d = Dag([node_with("b", dag.M, [unreported])])
  let s = roster.scorecard(d, "Thessaly")
  assert s.calibration_hits == 0
  assert s.calibration_total == 0
}

pub fn scorecard_text_includes_the_colour_when_present_test() {
  let d =
    Dag([node_with("a", dag.S, [attempt("Emmy", dag.Closed, dag.S, 0.18)])])
  let s = roster.scorecard(d, "Emmy")
  assert roster.scorecard_text(s, Some("#7b2d8e"))
    == "Emmy (#7b2d8e): closed 1, abandoned 0, $0.18, calibration 1/1"
  assert roster.scorecard_text(s, None)
    == "Emmy: closed 1, abandoned 0, $0.18, calibration 1/1"
}

pub fn budget_exhausted_counts_as_abandoned_test() {
  let d =
    Dag([
      node_with("a", dag.S, [attempt("Ravel", dag.BudgetExhausted, dag.S, 4.0)]),
    ])
  let s = roster.scorecard(d, "Ravel")
  assert s.abandoned == 1
  assert s.closed == 0
}

pub fn scorecard_of_an_unknown_name_is_empty_test() {
  let d =
    Dag([node_with("a", dag.S, [attempt("Ravel", dag.Closed, dag.S, 1.0)])])
  let s = roster.scorecard(d, "Nobody")
  assert s == roster.Scorecard("Nobody", 0, 0, 0.0, 0, 0)
}
