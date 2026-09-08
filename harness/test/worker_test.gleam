import gleam/dynamic/decode
import gleam/json
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import harness/claude
import harness/config
import harness/dag.{Attempt, Dag, Node}
import harness/guard
import harness/roster.{type Identity, Identity}
import harness/worker
import harness/worker/brief
import simplifile

fn cfg() -> config.Config {
  let assert Ok(c) = config.load()
  c
}

fn statements() -> String {
  let assert Ok(source) =
    simplifile.read(cfg().repo_root <> "/Rule30/Statements.lean")
  source
}

fn node(id: String, size: dag.Size, attempts: List(dag.Attempt)) -> dag.Node {
  Node(
    id:,
    region: "P2",
    lean_name: id,
    description: "the centre column starts black",
    deps: [],
    status: dag.Open,
    size:,
    proof_file: None,
    attempts:,
    verified: None,
    claimed_by: None,
    claimed_at: None,
    claimed_run: None,
    object: None,
    under: None,
    research: False,
  )
}

fn ravel() -> Identity {
  Identity(
    name: "Ravel",
    region: "P2",
    created: "2026-09-05T21:20:00Z",
    naming_reason: "Counting is unravelling.",
    opening: "I count black cells and bound their ratios.",
    color: None,
  )
}

// --- the report schema --------------------------------------------------------

pub fn report_schema_is_valid_json_with_the_agreed_shape_test() {
  let schema = brief.report_schema()
  // It parses, which is the only thing the CLI actually requires of it.
  let assert Ok(_) = json.parse(schema, decode.dynamic)

  assert string.contains(
    schema,
    "\"enum\":[\"in_progress\",\"proved\",\"abandoned\"]",
  )
  assert string.contains(schema, "\"enum\":[\"S\",\"M\",\"L\",\"wall\"]")
  assert string.contains(
    schema,
    "\"required\":[\"outcome\",\"estimate\",\"summary\",\"notebook\",\"journal\"]",
  )
  // The two channels an agent writes in its own words are both described.
  assert string.contains(schema, "what your future self should know")
  assert string.contains(schema, "a short written update for Dib")
}

// --- decoding a report --------------------------------------------------------

pub fn a_full_report_decodes_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"proved\",\"estimate\":\"M\",\"summary\":\"done\",\"notebook\":\"simp [centerColumn] closed it.\",\"journal\":\"Short and clean.\",\"bugs\":[]}",
      decode.dynamic,
    )
  assert worker.report_from_dynamic(dyn)
    == Ok(
      worker.Report(
        outcome: "proved",
        estimate: dag.M,
        notebook: "simp [centerColumn] closed it.",
        journal: "Short and clean.",
        bugs: [],
        proposals: [],
        summary: "done",
        discarded: [],
      ),
    )
}

pub fn a_minimal_in_progress_report_decodes_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"in_progress\",\"estimate\":\"wall\",\"summary\":\"stuck\",\"notebook\":\"\",\"journal\":\"\"}",
      decode.dynamic,
    )
  let assert Ok(r) = worker.report_from_dynamic(dyn)
  assert r.outcome == "in_progress"
  assert r.estimate == dag.Wall
  assert r.bugs == []
}

pub fn a_report_with_an_unknown_size_is_rejected_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"proved\",\"estimate\":\"XL\",\"summary\":\"\",\"notebook\":\"\",\"journal\":\"\"}",
      decode.dynamic,
    )
  let assert Error(_) = worker.report_from_dynamic(dyn)
}

// --- the signature ------------------------------------------------------------

pub fn signature_copies_a_one_line_statement_test() {
  assert brief.signature(statements(), "centerColumn_zero")
    == Ok("theorem centerColumn_zero : centerColumn 0 = true :=")
}

pub fn signature_copies_a_multi_line_statement_test() {
  let assert Ok(sig) = brief.signature(statements(), "centerColumnDensity_succ")
  assert string.starts_with(sig, "theorem centerColumnDensity_succ (N : ℕ) :")
  assert string.ends_with(sig, ":=")
  assert !string.contains(sig, ":= by")
  assert !string.contains(sig, "sorry")
  assert string.contains(sig, "centerColumnDensity N * (N : ℝ)")
}

pub fn signature_does_not_match_a_longer_name_test() {
  let source =
    "theorem foo_bar (n : ℕ) : n = n := by\n  rfl\n\ntheorem foo : True := by\n  trivial\n"
  assert brief.signature(source, "foo") == Ok("theorem foo : True :=")
}

pub fn signature_of_an_absent_name_is_an_error_test() {
  let assert Error(reason) = brief.signature(statements(), "not_a_theorem")
  assert string.contains(reason, "not_a_theorem")
  assert string.contains(reason, "Rule30/Statements.lean")
}

// --- the task message ---------------------------------------------------------

pub fn task_message_of_an_absent_statement_is_an_error_test() {
  let n = node("no_such_lemma", dag.S, [])
  let assert Error(reason) = brief.task_message_from(n, statements(), None)
  assert string.contains(reason, "no_such_lemma")
}

pub fn task_message_carries_the_exact_statement_and_the_file_to_write_test() {
  let n = node("centerColumn_zero", dag.S, [])
  let assert Ok(msg) = brief.task_message_from(n, statements(), None)
  assert string.starts_with(
    msg,
    "Prove `centerColumn_zero` in `Rule30/Proofs/CenterColumnZero.lean`.",
  )
  assert string.contains(msg, "The statement to prove, exactly:")
  assert string.contains(
    msg,
    "```lean\ntheorem centerColumn_zero : centerColumn 0 = true :=\n```",
  )
  assert string.contains(msg, "Description: the centre column starts black.")
  assert string.contains(msg, "Estimated size: S.")
  assert string.contains(msg, "lake build Rule30.Proofs.CenterColumnZero")
  assert string.contains(msg, "import Rule30.Basic")
  // A parked or crashed attempt leaves the file on disk; the next worker
  // must be told it is theirs to read, not to overwrite.
  assert string.contains(
    msg,
    "If `Rule30/Proofs/CenterColumnZero.lean` already exists it is a previous attempt's work on this node: read it first and keep whatever builds.",
  )
}

/// An unclosed attempt's file is moved into its attempt directory at attempt
/// end, so the sentence that pointed the next worker at the file's old
/// place is no longer enough on its own: the brief names where it went.
pub fn the_task_message_names_the_previous_attempts_parked_file_test() {
  let n = node("centerColumn_zero", dag.S, [])
  let assert Ok(msg) =
    brief.task_message_from(
      n,
      statements(),
      Some("runs/20260907T201514Z/centerColumn_zero-1/CenterColumnZero.lean"),
    )
  assert string.contains(
    msg,
    "The previous attempt's file was moved to `runs/20260907T201514Z/centerColumn_zero-1/CenterColumnZero.lean`: read it first and keep whatever builds.",
  )
  let assert Ok(fresh) = brief.task_message_from(n, statements(), None)
  assert !string.contains(fresh, "was moved to")
}

/// The parked file is found under `runs/` and not recorded on the board:
/// newest run first, highest attempt within it, and only when the file is
/// actually there. Relative to the repo root only when `runs/` is under it.
pub fn the_previous_attempts_file_is_the_newest_one_under_runs_test() {
  let dir = "build/test-runs/brief-previous"
  let _ = simplifile.delete(dir)
  let n = node("centerColumn_zero", dag.S, [])
  let file = "CenterColumnZero.lean"
  let put = fn(run: String, attempt: String, present: Bool) {
    let d = dir <> "/runs/" <> run <> "/" <> attempt
    let assert Ok(_) = simplifile.create_directory_all(d)
    case present {
      True -> {
        let assert Ok(_) =
          simplifile.write(
            d <> "/" <> file,
            "-- parked
",
          )
        Nil
      }
      False -> Nil
    }
  }
  put("20260906T000000Z", n.id <> "-1", True)
  put("20260907T000000Z", n.id <> "-2", True)
  put("20260907T000000Z", n.id <> "-10", True)
  put("20260908T000000Z", n.id <> "-3", False)
  put("20260908T000000Z", "other_node-1", True)
  let assert Ok(base) = config.load()
  let cfg = config.Config(..base, runs_root: dir <> "/runs")
  assert brief.previous_attempt_file(cfg, n)
    == Some(dir <> "/runs/20260907T000000Z/" <> n.id <> "-10/" <> file)
  let none = config.Config(..base, runs_root: dir <> "/nowhere")
  assert brief.previous_attempt_file(none, n) == None
}

// --- the brief ----------------------------------------------------------------

fn a_dag() -> dag.Dag {
  Dag([
    Node(
      id: "evolve_left_edge",
      region: "P1",
      lean_name: "evolve_left_edge",
      description: "The left edge is always black.",
      deps: [],
      status: dag.Proved,
      size: dag.M,
      proof_file: Some("Rule30/Proofs/EvolveLeftEdge.lean"),
      attempts: [],
      verified: Some("2026-09-05T20:00:00Z"),
      claimed_by: None,
      claimed_at: None,
      claimed_run: None,
      object: None,
      under: None,
      research: False,
    ),
    node("centerColumn_zero", dag.S, [
      Attempt(
        identity: "Ravel",
        session_id: "s1",
        model: "haiku",
        started: "t0",
        ended: "t1",
        outcome: dag.GaveUp,
        estimate: dag.M,
        reported: True,
        cost_usd: 0.2,
        turns: 6,
        notes: "Finset.filter_insert never fired; the coercion to ℝ was the wall.",
      ),
    ]),
  ])
}

pub fn brief_has_every_section_in_order_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let text = brief.text(cfg(), d, n, ravel(), "")
  let assert Ok(#(_, rest)) = string.split_once(text, "## Who you are")
  let assert Ok(#(_, rest)) = string.split_once(rest, "## The project")
  let assert Ok(#(_, rest)) = string.split_once(rest, "## Your constraints")
  let assert Ok(#(_, rest)) =
    string.split_once(rest, "## Casts and names, checked against this pin")
  let assert Ok(#(_, rest)) = string.split_once(rest, "## Served lemmas")
  let assert Ok(#(_, rest)) =
    string.split_once(rest, "## Prior attempts on this node")
  let assert Ok(_) = string.split_once(rest, "## How to report")
}

pub fn brief_carries_the_notebook_verbatim_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let notebook =
    "# Ravel\n\nI count black cells.\n\n## an entry\n\n`Nat.cast_le` was the bridge to ℝ; `push_cast` alone was not."
  let text = brief.text(cfg(), d, n, ravel(), notebook)
  assert string.contains(text, notebook)
}

pub fn brief_names_the_identity_and_its_region_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let text = brief.text(cfg(), d, n, ravel(), "")
  assert string.contains(text, "You are Ravel, the specialist for region P2")
  assert string.contains(
    text,
    "the density bookkeeping behind the balance conjecture",
  )
}

pub fn brief_includes_claude_md_whole_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let text = brief.text(cfg(), d, n, ravel(), "")
  let assert Ok(claude_md) = simplifile.read(cfg().repo_root <> "/CLAUDE.md")
  assert string.contains(text, claude_md)
}

// --- the cast cookbook ------------------------------------------------------------

const cookbook_heading = "## Casts and names, checked against this pin"

/// The checkout this suite runs against carries `docs/prover-cookbook.md`,
/// so the brief must carry it whole: the heading, then the file's own first
/// line, then the rest.
pub fn brief_inlines_the_cookbook_when_present_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let assert Ok(cookbook) =
    simplifile.read(cfg().repo_root <> "/docs/prover-cookbook.md")
  let assert Ok(first_line) =
    cookbook
    |> string.split(
      "
",
    )
    |> list.first
  assert first_line != ""
  let text = brief.text(cfg(), d, n, ravel(), "")
  assert string.contains(text, cookbook_heading)
  assert string.contains(text, first_line)
  assert string.contains(text, cookbook)
  assert !string.contains(text, "(no docs/prover-cookbook.md in this checkout)")
}

/// A checkout without the cookbook — a repo root that is an empty scratch
/// directory — renders the same heading over one line saying so, rather
/// than failing to render the brief at all.
pub fn brief_says_the_cookbook_is_absent_when_it_is_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let root = "build/test-runs/brief-without-cookbook"
  let assert Ok(_) = simplifile.create_directory_all(root)
  let _ = simplifile.delete(root <> "/docs")
  let text =
    brief.text(config.Config(..cfg(), repo_root: root), d, n, ravel(), "")
  let assert Ok(#(_, rest)) = string.split_once(text, cookbook_heading)
  let assert Ok(#(_, rest)) =
    string.split_once(rest, "(no docs/prover-cookbook.md in this checkout)")
  // The absence line is the whole section: the next thing is the next heading.
  assert string.starts_with(
    rest,
    "

## Served lemmas",
  )
}

/// The cookbook is what a worker needs while writing tactics, so it sits
/// right after the constraints and before everything about the task.
pub fn brief_places_the_cookbook_after_the_constraints_and_before_the_task_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let text = brief.text(cfg(), d, n, ravel(), "")
  let assert Ok(#(before, after)) = string.split_once(text, cookbook_heading)
  assert string.contains(before, "## Your constraints")
  assert !string.contains(before, "## Served lemmas")
  assert !string.contains(before, "## Prior attempts on this node")
  assert string.contains(after, "## Served lemmas")
  assert string.contains(after, "## Prior attempts on this node")
  assert !string.contains(after, "## Your constraints")
}

pub fn brief_lists_the_served_lemmas_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let text = brief.text(cfg(), d, n, ravel(), "")
  assert string.contains(
    text,
    "- `evolve_left_edge` in `Rule30.Proofs.EvolveLeftEdge` — The left edge is always black.",
  )
  // The open node is not served.
  assert !string.contains(text, "`centerColumn_zero` in `Rule30.Proofs.")
}

pub fn brief_says_nothing_is_served_when_nothing_is_proved_test() {
  let n = node("centerColumn_zero", dag.S, [])
  let text = brief.text(cfg(), Dag([n]), n, ravel(), "")
  assert string.contains(text, "Nothing is proved yet")
}

pub fn brief_states_the_constraints_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let text = brief.text(cfg(), d, n, ravel(), "")
  assert string.contains(
    text,
    "The only file you may edit is `Rule30/Proofs/CenterColumnZero.lean`",
  )
  assert string.contains(text, "lake build Rule30.Proofs.CenterColumnZero")
  assert string.contains(text, "Never `import Rule30.Statements`")
  assert string.contains(text, "No `sorry`")
  assert string.contains(text, "type_of% Statements.centerColumn_zero")
  assert string.contains(text, "must be named exactly `centerColumn_zero`")
}

/// The worker is told the ceilings its session was actually launched with:
/// the research ones at the top rung of a research node, the ordinary
/// ones everywhere else.
pub fn brief_states_the_attempts_own_turn_and_dollar_ceilings_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let base =
    config.Config(
      ..cfg(),
      max_turns: 40,
      max_budget_usd: 4.0,
      research_max_turns: 120,
      research_max_budget_usd: 20.0,
    )
  let ordinary = brief.text(base, d, n, ravel(), "")
  assert string.contains(
    ordinary,
    "This attempt has at most 40 turns and a budget of $4.00",
  )
  // The same node marked research, its four rungs spent: the attempt runs
  // under the research config, and the brief says so.
  let spent =
    Node(..n, research: True, attempts: [
      Attempt(..gave_up(), model: "haiku"),
      Attempt(..gave_up(), model: "sonnet"),
      Attempt(..gave_up(), model: "opus"),
      Attempt(..gave_up(), model: "fable"),
    ])
  let research =
    brief.text(config.for_attempt(base, spent), d, spent, ravel(), "")
  assert string.contains(
    research,
    "This attempt has at most 120 turns and a budget of $20.00",
  )
}

fn gave_up() -> dag.Attempt {
  Attempt(
    identity: "Ravel",
    session_id: "s",
    model: "opus",
    started: "t0",
    ended: "t1",
    outcome: dag.GaveUp,
    estimate: dag.S,
    reported: True,
    cost_usd: 0.0,
    turns: 1,
    notes: "",
  )
}

/// The row family `guard-denied-bash-not-permitted-*` /
/// `guard-denied-edit-not-writable-*`: every denial in run 20260907T024158Z
/// was correct — `cat`, `grep -rn`, `find`, `... 2>&1 | head -50`, a
/// `--run` heredoc, an Edit of `Rule30/Proofs.lean` — and every one was a
/// worker that had not been told what to do instead. The fix is in the
/// brief, and these are the phrases a Claude Code session acts on.
pub fn brief_says_how_to_read_and_what_bash_is_for_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let text = brief.text(cfg(), d, n, ravel(), "")
  // Reading and searching go through tools, not Bash.
  assert string.contains(text, "use the Read tool")
  assert string.contains(text, "use Grep or Glob")
  assert string.contains(
    text,
    "Bash `cat`, `grep`, `find`, `head` and `ls` are denied",
  )
  // The two commands, verbatim, for this node.
  assert string.contains(text, "`lake build Rule30.Proofs.CenterColumnZero`")
  assert string.contains(
    text,
    "`lake env lean Rule30/Proofs/CenterColumnZero.lean`",
  )
  assert string.contains(text, "One bare command per Bash call")
  assert string.contains(text, "`2>&1`")
  assert string.contains(text, "rather than piping to `head`")
  // The index is the dispatcher's, and there is no `--run`.
  assert string.contains(text, "never edit `Rule30/Proofs.lean`")
  assert string.contains(text, "There is no `--run`")
}

pub fn brief_carries_prior_attempt_notes_verbatim_test() {
  let d = a_dag()
  let assert Ok(n) = dag.get(d, "centerColumn_zero")
  let text = brief.text(cfg(), d, n, ravel(), "")
  assert string.contains(text, "### Attempt 1 — haiku, abandoned")
  assert string.contains(
    text,
    "Finset.filter_insert never fired; the coercion to ℝ was the wall.",
  )
}

pub fn brief_says_none_when_there_are_no_prior_attempts_test() {
  let n = node("centerColumn_zero", dag.S, [])
  let text = brief.text(cfg(), Dag([n]), n, ravel(), "")
  assert string.contains(text, "## Prior attempts on this node\n\nnone")
}

pub fn brief_explains_the_report_test() {
  let n = node("centerColumn_zero", dag.S, [])
  let text = brief.text(cfg(), Dag([n]), n, ravel(), "")
  assert string.contains(
    text,
    "Set `outcome` to `proved` only after `lake build` of your own module has actually succeeded",
  )
  assert string.contains(
    text,
    "set `outcome` to `abandoned` and fill in `notebook` and `journal`",
  )
  assert string.contains(text, "verbatim")
}

// --- the two blockers ---------------------------------------------------------

pub fn schema_has_no_posts_field_test() {
  // The messageboard's write side is gone: a report has no `posts`, neither
  // offered nor required. `outcome` is still the one thing that is.
  let schema = brief.report_schema()
  assert !string.contains(does: schema, contain: "\"posts\"")
  let assert Ok(required) =
    json.parse(schema, decode.at(["required"], decode.list(decode.string)))
  assert list.contains(required, "outcome")
}

pub fn an_allowed_warning_is_not_a_closed_window_test() {
  let warning =
    claude.RateLimit(
      five_hour_utilization: 0.94,
      resets_at: 1_788_659_400,
      status: "allowed_warning",
      raw: "",
    )
  assert worker.hit_ceiling([warning], 0.9) == False
}

pub fn a_refusal_above_the_ceiling_is_a_closed_window_test() {
  let refused =
    claude.RateLimit(
      five_hour_utilization: 0.94,
      resets_at: 1_788_659_400,
      status: "rejected",
      raw: "",
    )
  assert worker.hit_ceiling([refused], 0.9) == True
}

pub fn a_refusal_below_the_ceiling_is_a_closed_window_test() {
  // The API's verdict outranks the utilization figure. A refusing status at
  // half the window is still a refusal; the old predicate's `>=. ceiling`
  // conjunct read it as open and let the attempt run into the wall.
  let refused =
    claude.RateLimit(
      five_hour_utilization: 0.5,
      resets_at: 1_788_659_400,
      status: "rejected",
      raw: "",
    )
  assert worker.hit_ceiling([refused], 0.9) == True
}

pub fn an_allowed_status_above_the_ceiling_is_not_a_closed_window_test() {
  // The contract `an_allowed_warning_is_not_a_closed_window_test` states,
  // pinned from the other side: `allowed` outranks utilization the same way
  // a refusal does, so a plain `allowed` at 0.99 is still an open window.
  let allowed =
    claude.RateLimit(
      five_hour_utilization: 0.99,
      resets_at: 1_788_659_400,
      status: "allowed",
      raw: "",
    )
  assert worker.hit_ceiling([allowed], 0.9) == False
}

pub fn a_status_less_event_falls_back_to_the_utilization_test() {
  // `claude.parse_event` gives a missing status as `""`. That is the one
  // case where the number decides: at or above the ceiling closes, below
  // stays open. Neither side of that may be lost to the status-first rule.
  let above =
    claude.RateLimit(
      five_hour_utilization: 0.95,
      resets_at: 1_788_659_400,
      status: "",
      raw: "",
    )
  let below =
    claude.RateLimit(
      five_hour_utilization: 0.5,
      resets_at: 1_788_659_400,
      status: "",
      raw: "",
    )
  assert worker.hit_ceiling([above], 0.9) == True
  assert worker.hit_ceiling([below], 0.9) == False
}

pub fn a_rate_limit_api_retry_is_a_closed_window_test() {
  let retry = claude.ApiRetry(error: "rate_limit", attempt: 1, raw: "")
  assert worker.hit_ceiling([retry], 0.9) == True
}

pub fn a_rate_limit_event_decodes_its_status_test() {
  let line =
    "{\"type\":\"rate_limit_event\",\"rate_limit_info\":{\"status\":\"allowed_warning\",\"resetsAt\":1788659400,\"rateLimitType\":\"five_hour\",\"utilization\":0.94,\"isUsingOverage\":false,\"surpassedThreshold\":0.9,\"unifiedWindows\":{\"five_hour\":{\"utilization\":0.94,\"resetsAt\":1788659400}}}}"
  let assert claude.RateLimit(five_hour_utilization:, status:, ..) =
    claude.parse_event(line)
  assert five_hour_utilization == 0.94
  assert status == "allowed_warning"
}

pub fn a_rate_limit_event_with_no_status_still_decodes_test() {
  // The regression this guards: `status` must be read with a default, not
  // required. A hard requirement here means a status-less event (an older
  // CLI, a seven-day-only event, a shape change) fails the whole decode and
  // falls back to `Other` in `parse_event` — the rate-limit signal vanishes
  // rather than merely being misread, and `hit_ceiling` never sees it.
  let line =
    "{\"type\":\"rate_limit_event\",\"rate_limit_info\":{\"resetsAt\":1788659400,\"rateLimitType\":\"five_hour\",\"utilization\":0.97,\"unifiedWindows\":{\"five_hour\":{\"utilization\":0.97,\"resetsAt\":1788659400}}}}"
  let assert claude.RateLimit(five_hour_utilization:, ..) =
    claude.parse_event(line)
  assert five_hour_utilization == 0.97
}

// --- the result's subtype -------------------------------------------------------

/// The last line of run 20260907T175146Z's `theorist-1/events.jsonl`, less
/// the usage: the CLI ending Sextant's first session at its dollar ceiling
/// after thirteen turns. `subtype` is the only field that says which
/// ceiling, and it must reach the loop as itself, not folded into
/// `is_error`.
pub fn a_result_decodes_its_subtype_test() {
  let dollars =
    "{\"type\":\"result\",\"subtype\":\"error_max_budget_usd\",\"is_error\":true,\"duration_ms\":1,\"num_turns\":13,\"errors\":[\"Reached maximum budget ($4)\"],\"total_cost_usd\":4.27,\"session_id\":\"c3d9b446\"}"
  let assert claude.TurnResult(subtype:, is_error:, num_turns:, ..) =
    claude.parse_event(dollars)
  assert subtype == Some("error_max_budget_usd")
  assert is_error
  assert num_turns == 13
  let turns =
    "{\"type\":\"result\",\"subtype\":\"error_max_turns\",\"is_error\":true,\"num_turns\":40,\"total_cost_usd\":1.0,\"session_id\":\"s\"}"
  let assert claude.TurnResult(subtype:, ..) = claude.parse_event(turns)
  assert subtype == Some("error_max_turns")
  let success =
    "{\"type\":\"result\",\"subtype\":\"success\",\"is_error\":false,\"num_turns\":3,\"total_cost_usd\":0.25,\"session_id\":\"s\"}"
  let assert claude.TurnResult(subtype:, ..) = claude.parse_event(success)
  assert subtype == Some("success")
}

/// A result with no subtype at all is still a result: the field is read
/// with a default, never required, so a shape change in the CLI cannot
/// turn the line that ends a session into `Other` and leave the loop
/// waiting for a result that already came.
pub fn a_result_without_a_subtype_still_decodes_test() {
  let line =
    "{\"type\":\"result\",\"is_error\":true,\"num_turns\":2,\"total_cost_usd\":0.1,\"session_id\":\"s\"}"
  let assert claude.TurnResult(subtype:, is_error:, ..) =
    claude.parse_event(line)
  assert subtype == None
  assert is_error
}

/// The subtype names the ceiling; anything else is carried verbatim rather
/// than guessed at, and a missing one is `Unknown("")`.
pub fn the_ceiling_is_read_off_the_subtype_test() {
  assert worker.ceiling_of(Some("error_max_turns")) == worker.Turns
  assert worker.ceiling_of(Some("error_max_budget_usd")) == worker.Dollars
  assert worker.ceiling_of(Some("error_during_execution"))
    == worker.Unknown("error_during_execution")
  assert worker.ceiling_of(None) == worker.Unknown("")
}

// --- the StructuredOutput call ------------------------------------------------

pub fn an_assistant_event_yields_its_structured_output_call_test() {
  // Line 256 of runs/20260907T175146Z/theorist-1/events.jsonl, with the
  // report's long fields cut down. The `result` two lines later carried no
  // `structured_output`, so this call is the only copy of that report.
  let line =
    "{\"type\":\"assistant\",\"message\":{\"model\":\"claude-fable-5-1\",\"id\":\"msg_011CepWjdZZAR73snELbkfn7\",\"type\":\"message\",\"role\":\"assistant\",\"content\":[{\"type\":\"tool_use\",\"id\":\"toolu_0142nmxxVsVvq1HZdpjGUktP\",\"name\":\"StructuredOutput\",\"input\":{\"outcome\":\"attacked\",\"summary\":\"Document written with all six sections\",\"notebook\":\"## 2026-09-07\",\"journal\":\"j\",\"next_topic\":\"\"}}],\"stop_reason\":null},\"parent_tool_use_id\":null,\"session_id\":\"c3d9b446-6d98-4484-88e9-053f32deea64\",\"uuid\":\"1\"}"
  let assert Some(dyn) = claude.structured_output_call(line)
  let assert Ok(outcome) =
    decode.run(dyn, decode.at(["outcome"], decode.string))
  assert outcome == "attacked"
}

pub fn an_assistant_event_without_the_call_yields_none_test() {
  let text =
    "{\"type\":\"assistant\",\"message\":{\"role\":\"assistant\",\"content\":[{\"type\":\"text\",\"text\":\"Done.\"}]}}"
  let other_tool =
    "{\"type\":\"assistant\",\"message\":{\"role\":\"assistant\",\"content\":[{\"type\":\"tool_use\",\"id\":\"t\",\"name\":\"Write\",\"input\":{\"outcome\":\"proved\"}}]}}"
  assert claude.structured_output_call(text) == None
  assert claude.structured_output_call(other_tool) == None
}

// --- reported bugs --------------------------------------------------------

pub fn report_decodes_bugs_test() {
  let json_text =
    "{\"outcome\":\"proved\",\"estimate\":\"M\",\"summary\":\"s\",\"notebook\":\"n\",\"journal\":\"j\",\"bugs\":[{\"title\":\"Guard refused lake env lean\",\"area\":\"guard\",\"severity\":\"blocks\",\"body\":\"I needed it to check one file.\"}]}"
  let assert Ok(dyn) = json.parse(json_text, decode.dynamic)
  let assert Ok(report) = worker.report_from_dynamic(dyn)
  assert report.bugs
    == [
      worker.ReportedBug(
        title: "Guard refused lake env lean",
        area: "guard",
        severity: "blocks",
        body: "I needed it to check one file.",
      ),
    ]
}

pub fn a_dropped_bug_entry_is_recorded_as_discarded_test() {
  // The `bugs` array holds two well-formed entries around one with no
  // `title`. The good two survive, the bad one does not, and — the point of
  // this test — the report says so: one line, naming the position, so the
  // attempt record can tell "nothing to report" from "one report lost".
  let json_text =
    "{\"outcome\":\"proved\",\"estimate\":\"M\",\"summary\":\"s\",\"notebook\":\"n\",\"journal\":\"j\",\"bugs\":[{\"title\":\"first\"},{\"area\":\"guard\",\"body\":\"no title here\"},{\"title\":\"third\"}]}"
  let assert Ok(dyn) = json.parse(json_text, decode.dynamic)
  let assert Ok(report) = worker.report_from_dynamic(dyn)
  assert list.map(report.bugs, fn(b) { b.title }) == ["first", "third"]
  let assert [reason] = report.discarded
  assert string.starts_with(reason, "bugs[1]: ")
  assert string.contains(reason, "title")
}

pub fn a_non_array_bugs_field_is_recorded_as_discarded_test() {
  // The per-field route. `bugs` written as a bare string degrades to no
  // bugs, as before, but no longer to *silently* no bugs.
  let json_text =
    "{\"outcome\":\"proved\",\"estimate\":\"M\",\"summary\":\"s\",\"notebook\":\"n\",\"journal\":\"j\",\"bugs\":\"the guard refused lake env lean\"}"
  let assert Ok(dyn) = json.parse(json_text, decode.dynamic)
  let assert Ok(report) = worker.report_from_dynamic(dyn)
  assert report.bugs == []
  assert report.discarded == ["bugs: not an array"]
}

pub fn a_clean_report_records_no_discards_test() {
  // The optional field present and well-formed, one entry: the confession
  // is empty, so the dispatcher writes no `report_discarded` row. An absent
  // field counts as clean too, not as discarded.
  let json_text =
    "{\"outcome\":\"proved\",\"estimate\":\"M\",\"summary\":\"s\",\"notebook\":\"n\",\"journal\":\"j\",\"bugs\":[{\"title\":\"Guard refused lake env lean\"}]}"
  let assert Ok(dyn) = json.parse(json_text, decode.dynamic)
  let assert Ok(report) = worker.report_from_dynamic(dyn)
  assert report.discarded == []
  let assert Ok(absent) =
    json.parse(
      "{\"outcome\":\"proved\",\"estimate\":\"M\",\"summary\":\"s\",\"notebook\":\"n\",\"journal\":\"j\"}",
      decode.dynamic,
    )
  let assert Ok(report) = worker.report_from_dynamic(absent)
  assert report.discarded == []
}

pub fn report_without_bugs_decodes_to_empty_test() {
  let json_text =
    "{\"outcome\":\"proved\",\"estimate\":\"M\",\"summary\":\"s\",\"notebook\":\"\",\"journal\":\"\"}"
  let assert Ok(dyn) = json.parse(json_text, decode.dynamic)
  let assert Ok(report) = worker.report_from_dynamic(dyn)
  assert report.bugs == []
}

pub fn schema_offers_bugs_without_requiring_it_test() {
  let schema = brief.report_schema()
  assert string.contains(does: schema, contain: "\"bugs\"")
  let assert Ok(required) =
    json.parse(schema, decode.at(["required"], decode.list(decode.string)))
  assert !list.contains(required, "bugs")
}

pub fn a_bug_items_required_matches_what_the_decoder_actually_requires_test() {
  // Only `title` is `decode.field` in `reported_bug_decoder`; `area`,
  // `severity` and `body` are all `optional_field`. The item-level
  // `required` must say the same thing, or this is the schema-disagrees-
  // with-the-decoder defect again, one level down.
  let schema = brief.report_schema()
  let assert Ok(required) =
    json.parse(
      schema,
      decode.at(
        ["properties", "bugs", "items", "required"],
        decode.list(decode.string),
      ),
    )
  assert required == ["title"]
}

pub fn schema_offers_proposals_without_requiring_them_test() {
  let schema = brief.report_schema()
  assert string.contains(schema, "\"proposals\"")
  let assert Ok(required) =
    json.parse(
      schema,
      decode.at(
        ["properties", "proposals", "items", "required"],
        decode.list(decode.string),
      ),
    )
  assert required == ["name", "statement", "reason"]
  // Top-level required is unchanged: the turn's work, not its extras.
  assert string.contains(
    schema,
    "\"required\":[\"outcome\",\"estimate\",\"summary\",\"notebook\",\"journal\"]",
  )
}

pub fn the_brief_explains_proposals_test() {
  let text = brief.how_to_report_text()
  assert string.contains(text, "proposals")
  assert string.contains(text, "exactly as it would be seeded")
  assert string.contains(text, "not a claim that the node is hard")
  assert string.contains(text, "restates")
  assert string.contains(text, "report that ends your attempt")
}

pub fn a_malformed_bug_does_not_poison_the_whole_report_test() {
  // Four bug objects in one array: well-formed; `title` present but not a
  // string; a well-formed title with `body` present but not a string; and
  // missing `title` outright. Each is decoded independently of the others
  // (see `report_decoder`'s `decode.dynamic` plus `list.filter_map`), so a
  // malformed one is simply dropped rather than failing the whole `Report`
  // decode — the regression this guards is `outcome`, `notebook` and
  // `journal` surviving regardless, the same blast radius as
  // `posts-required-in-schema-not-in-decoder` reached by a different route.
  let json_text =
    "{\"outcome\":\"proved\",\"estimate\":\"M\",\"summary\":\"s\",\"notebook\":\"n\",\"journal\":\"j\",\"bugs\":[{\"title\":\"Guard refused lake env lean\",\"area\":\"guard\",\"severity\":\"blocks\",\"body\":\"I needed it to check one file.\"},{\"title\":123,\"area\":\"guard\"},{\"title\":\"body is a number\",\"body\":7},{\"area\":\"guard\"}]}"
  let assert Ok(dyn) = json.parse(json_text, decode.dynamic)
  let assert Ok(report) = worker.report_from_dynamic(dyn)
  // The promise: nothing in `bugs`, malformed or not, touches the rest of
  // the report.
  assert report.outcome == "proved"
  assert report.notebook == "n"
  assert report.journal == "j"
  // The mechanism: only the one well-formed bug survives. A non-string
  // `title` and a missing `title` are both discarded outright; a well-formed
  // title with a non-string `body` is discarded too, since `body`'s own
  // decode fails the same way — this implementation drops the whole entry
  // rather than filing it with an empty body.
  assert report.bugs
    == [
      worker.ReportedBug(
        title: "Guard refused lake env lean",
        area: "guard",
        severity: "blocks",
        body: "I needed it to check one file.",
      ),
    ]
}

pub fn a_non_array_bugs_field_does_not_poison_the_report_test() {
  // The route `a_malformed_bug_does_not_poison_the_whole_report_test` leaves
  // open. That test fixes the per-*element* route: each entry is decoded on
  // its own, so one bad object costs one bug. This is the per-*field* route.
  // If `bugs` is not an array at all, the array decode itself fails, and
  // that failure is not per-element — it threads up through
  // `optional_field` and fails the entire `Report`, discarding `outcome`.
  // A worker that proved a theorem and wrote a string where an array was
  // expected loses the proof.
  let json_text =
    "{\"outcome\":\"proved\",\"estimate\":\"M\",\"summary\":\"s\",\"notebook\":\"n\",\"journal\":\"j\",\"bugs\":\"the guard refused lake env lean\"}"
  let assert Ok(dyn) = json.parse(json_text, decode.dynamic)
  let assert Ok(report) = worker.report_from_dynamic(dyn)
  assert report.outcome == "proved"
  assert report.notebook == "n"
  assert report.journal == "j"
  // Degrades to absent, which is the treatment the field already gets when
  // it is not there at all. A bug reported in the wrong shape is lost; that
  // is the deliberate trade, and it is strictly better than losing a proof.
  assert report.bugs == []
}

pub fn an_object_valued_bugs_field_does_not_poison_the_report_test() {
  // The other shape of the same mistake, and the likelier one: a single bug
  // written bare instead of wrapped in an array.
  let json_text =
    "{\"outcome\":\"proved\",\"estimate\":\"M\",\"summary\":\"s\",\"notebook\":\"n\",\"journal\":\"j\",\"bugs\":{\"title\":\"Guard refused lake env lean\",\"area\":\"guard\"}}"
  let assert Ok(dyn) = json.parse(json_text, decode.dynamic)
  let assert Ok(report) = worker.report_from_dynamic(dyn)
  assert report.outcome == "proved"
  assert report.bugs == []
}

// --- decoding proposals --------------------------------------------------------

pub fn a_report_with_no_proposals_field_has_none_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"in_progress\",\"estimate\":\"M\",\"summary\":\"\",\"notebook\":\"\",\"journal\":\"\"}",
      decode.dynamic,
    )
  let assert Ok(r) = worker.report_from_dynamic(dyn)
  assert r.proposals == []
  assert r.discarded == []
}

pub fn a_proposal_decodes_with_its_optional_parts_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"abandoned\",\"estimate\":\"L\",\"summary\":\"\",\"notebook\":\"\",\"journal\":\"\",\"proposals\":[{\"name\":\"evolve_left_sixth_diagonal\",\"statement\":\"theorem evolve_left_sixth_diagonal (t : ℕ) : evolve (t + 5) (-(t : ℤ)) = false := by\\n  sorry\",\"reason\":\"the recurrence needs the sixth diagonal before it can close the seventh\",\"size\":\"S\",\"witness\":{\"expression\":\"evolve (t + 5) (-(t : ℤ)) = false\",\"range\":\"t < 12\"}},{\"name\":\"bare\",\"statement\":\"theorem bare : True := by\\n  sorry\",\"reason\":\"a minimal proposal\"}]}",
      decode.dynamic,
    )
  let assert Ok(r) = worker.report_from_dynamic(dyn)
  let assert [first, second] = r.proposals
  assert first.name == "evolve_left_sixth_diagonal"
  assert first.size == dag.S
  assert first.witness
    == Some(#("evolve (t + 5) (-(t : ℤ)) = false", [], "t < 12"))
  assert first.route == None
  assert first.disclaims == ""
  // `size` defaults to M, like the ladder's own default, when the worker
  // leaves it out; `route`, `witness` and `disclaims` default to nothing.
  assert second.size == dag.M
  assert second.witness == None
  assert r.discarded == []
}

pub fn a_proposal_without_a_reason_is_dropped_and_named_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"abandoned\",\"estimate\":\"L\",\"summary\":\"\",\"notebook\":\"\",\"journal\":\"\",\"proposals\":[{\"name\":\"kept\",\"statement\":\"theorem kept : True := by\\n  sorry\",\"reason\":\"r\"},{\"name\":\"no_reason\",\"statement\":\"theorem no_reason : True := by\\n  sorry\"}]}",
      decode.dynamic,
    )
  let assert Ok(r) = worker.report_from_dynamic(dyn)
  let assert [kept] = r.proposals
  assert kept.name == "kept"
  let assert [reason] = r.discarded
  assert string.starts_with(reason, "proposals[1]")
}

pub fn a_proposals_field_that_is_not_an_array_costs_nothing_but_is_named_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"proved\",\"estimate\":\"S\",\"summary\":\"\",\"notebook\":\"\",\"journal\":\"\",\"proposals\":\"none\"}",
      decode.dynamic,
    )
  let assert Ok(r) = worker.report_from_dynamic(dyn)
  assert r.outcome == "proved"
  assert r.proposals == []
  assert r.discarded == ["proposals: not an array"]
}

/// `launch` is `launch_with_tools` on the default list; a role that needs a
/// tool the default omits names it, and the rest of the command line — no
/// `--bare`, the ceilings, the settings, the brief, the schema — is the same.
pub fn launch_with_tools_adds_to_the_allowlist_and_changes_nothing_else_test() {
  let assert Ok(cfg) = config.load()
  let g = guard.Guard(port: 4430, token: "t", settings_path: "s.json")
  let plain = worker.launch(cfg, "fable", g, "brief.md", "{}")
  let wide =
    worker.launch_with_tools(
      cfg,
      "fable",
      g,
      "brief.md",
      "{}",
      list.append(worker.default_tools, ["WebFetch", "WebSearch"]),
    )
  assert plain
    == worker.launch_with_tools(
      cfg,
      "fable",
      g,
      "brief.md",
      "{}",
      worker.default_tools,
    )
  assert list.contains(plain.args, "Read,Edit,Write,Grep,Glob,Bash")
  assert list.contains(
    wide.args,
    "Read,Edit,Write,Grep,Glob,Bash,WebFetch,WebSearch",
  )
  assert !list.contains(plain.args, "--bare")
  assert !list.contains(wide.args, "--bare")
  assert list.filter(wide.args, fn(a) { !string.contains(a, "WebFetch") })
    == list.filter(plain.args, fn(a) { !string.contains(a, "Glob,Bash") })
}
