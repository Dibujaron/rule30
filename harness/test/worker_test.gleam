import gleam/dynamic/decode
import gleam/json
import gleam/option.{None, Some}
import gleam/string
import harness/config
import harness/dag.{Attempt, Dag, Node}
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
  )
}

fn ravel() -> Identity {
  Identity(
    name: "Ravel",
    region: "P2",
    created: "2026-09-05T21:20:00Z",
    naming_reason: "Counting is unravelling.",
    opening: "I count black cells and bound their ratios.",
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
    "\"required\":[\"outcome\",\"estimate\",\"summary\",\"notebook\",\"journal\",\"posts\"]",
  )
  // The two channels an agent writes in its own words are both described.
  assert string.contains(schema, "what your future self should know")
  assert string.contains(schema, "a short written update for Dib")
}

// --- decoding a report --------------------------------------------------------

pub fn a_full_report_decodes_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"proved\",\"estimate\":\"M\",\"summary\":\"done\",\"notebook\":\"simp [centerColumn] closed it.\",\"journal\":\"Short and clean.\",\"posts\":[\"Thessaly: the cone lemma helped\"]}",
      decode.dynamic,
    )
  assert worker.report_from_dynamic(dyn)
    == Ok(worker.Report(
      outcome: "proved",
      estimate: dag.M,
      notebook: "simp [centerColumn] closed it.",
      journal: "Short and clean.",
      posts: ["Thessaly: the cone lemma helped"],
      summary: "done",
    ))
}

pub fn a_minimal_in_progress_report_decodes_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"in_progress\",\"estimate\":\"wall\",\"summary\":\"stuck\",\"notebook\":\"\",\"journal\":\"\",\"posts\":[]}",
      decode.dynamic,
    )
  let assert Ok(r) = worker.report_from_dynamic(dyn)
  assert r.outcome == "in_progress"
  assert r.estimate == dag.Wall
  assert r.posts == []
}

pub fn a_report_with_an_unknown_size_is_rejected_test() {
  let assert Ok(dyn) =
    json.parse(
      "{\"outcome\":\"proved\",\"estimate\":\"XL\",\"summary\":\"\",\"notebook\":\"\",\"journal\":\"\",\"posts\":[]}",
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
  let assert Error(reason) = brief.task_message_from(n, statements())
  assert string.contains(reason, "no_such_lemma")
}

pub fn task_message_carries_the_exact_statement_and_the_file_to_write_test() {
  let n = node("centerColumn_zero", dag.S, [])
  let assert Ok(msg) = brief.task_message_from(n, statements())
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
