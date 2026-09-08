# Connector Session Kind Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the `connect` verb: a hand-started session, shaped after the theorist, whose one deliverable is a sighting document under `docs/connections/`, fenced by a new `guard.Connector` rule set that adds read-only `WebFetch`/`WebSearch` with every URL logged, briefed thinly (task text, notebook, the residual paragraph, obstructions, sources, `Rule30/Basic.lean`), and recorded under `runs/<run-id>/connector-1/`.

**Architecture:** A new module `harness/src/harness/connector.gleam` mirrors `theorist.gleam` function for function (flags, who, paths, brief, report, run, summary) and reuses `theorist.slug`, `theorist.today` and `theorist.default_topic` rather than copying them. The guard gains a fourth `Role` constructor and two hook-input fields (`url`, `query`); the CLI allowlist gains the two web tools for this role only through a new `worker.launch_with_tools`. Config, roster and the CLI get one arm each; nothing in the prover, seeder or theorist paths changes behaviour.

**Tech Stack:** Gleam 1.17 on the Erlang target, gleeunit 1.11 (no per-module filter: `gleam test` always runs the whole suite), simplifile, envoy, the existing harness modules `config`, `guard`, `guard_event`, `roster`, `schedule`, `worker`, `theorist`, `seed`, `dag`, `log`, `lock`, `writes`.

**Spec:** docs/superpowers/specs/2026-09-07-connector-design.md (and docs/connector-brief.md)

## Global Constraints

- Verb: `cd harness && gleam run -- connect [<vantage>] [--as <Name>] [--model M]`; `--model` defaults to `fable`, like `theorise`.
- Record: `runs/<run-id>/connector-1/` (`session_name = "connector-1"`); the summary goes to `runs/<run-id>/summary.txt`, the journal to `runs/<run-id>/journal.md`.
- Guard port: `cfg.guard_port + 300` (run base 4130 → 4430; seeder is +100, theorist is +200).
- Ceilings: `HARNESS_CONNECTOR_MAX_TURNS` / `HARNESS_CONNECTOR_MAX_BUDGET_USD`, each defaulting to the theorist's resolved value (`HARNESS_THEORIST_MAX_TURNS` 600 / `HARNESS_THEORIST_MAX_BUDGET_USD` 80.0).
- Roster region: `connect`; minted through the naming ceremony as a "connector"; one live session per persona is the captain's restraint, as for a theorist.
- Deliverable path: `<repo_root>/docs/connections/<date>-<slug(vantage)>.md`; with no vantage, `<slug(problem wall id)>`; a second sighting on one slug in a day gets `-2.md`, then `-3.md` (the theorist's `free_attack_path` rule, mirrored).
- No append to `docs/obstructions.md`: the guard denies it; dead ends go in the document's section 4.
- Fence otherwise = the theorist's: anything under `explorer/` writable, `node <one script under explorer/>`, `lake build [modules]`, `lake env lean <file>`, no shell operators, `SendMessage` denied.
- Web: `WebFetch` allowed only for `http://` / `https://` URLs, `WebSearch` allowed, **for the connector role only — a prover, seeder or theorist gets `Deny(NotPermitted, ..)` from the guard for either tool**; both appear in the CLI `--allowedTools` for this role only; the guard logs every call as a `guard` row (`attempted` = URL or query) plus a `web` row (`event`, `url`, `query`, `urls`) in the attempt's `events.jsonl`, at `PreToolUse` for both tools and **also at `PostToolUse` and `PostToolUseFailure` for `WebFetch`**, so a captain can tell an attempted fetch from one that completed (Rowan, 2026-09-07: the brief's rule is "cite by fetching", and a failed attempt followed by a quote is the fabrication the rule exists to catch).
- Brief = `docs/connector-brief.md` + the persona's notebook + the problem wall rendered by `seed.open_section` (the same text the theorist's brief carries for that wall) + `docs/obstructions.md` + `docs/sources.md` + `Rule30/Basic.lean`; never `blueprint/index.md`, never the proof notes, never `blueprint/crystals.md`, never another persona's notebook.
- The problem is always `theorist.default_topic` (the P1 frontier wall as the board has it today); the vantage is free text and never changes which wall.
- Never started by the scheduler; `--bare` is never passed (`worker.launch_with_tools` keeps the same args as `worker.launch` plus the tool list).
- **Reuse, not a third copy.** `connector.gleam` imports `harness/theorist` and calls its generic functions rather than re-implementing them: the naming ceremony (`who`), the document path rule (`attack_path` and kin), the report schema's shape, and the "who you are" preamble are shared, each parameterised by the one word or directory that differs per role; a handful of theorist functions that were private become `pub` for this alone, with no change to their behaviour. What differs by role — `Options`, `Flags`, `Report` (a shared field would lie: `topic` is not `vantage`), `brief`, `render`, `run` — is `connector.gleam`'s own. This is the cheap half of the fix Dib asked for when the plan first costed the role at 1864 lines; extracting a shared spine module that neither `theorist.gleam` nor `connector.gleam` owns is `each-new-session-kind-copies-the-last-ones-spine` on the bug board, filed from this build, and stays out of scope here.
- Tests never touch the live checkout: every fixture is under `harness/build/test-runs/connector/` with its own `repo_root`; guard ports come from `ports.span(1)`.
- Work in the worktree `C:/Users/dibuj/dev/rule30-keel-connector` (branch `keel/connector`, base `origin/main` f0e2360); never in `C:/Users/dibuj/dev/rule30`.
- Doc comments state the current contract, not history; new terms go in `docs/glossary.md` (Task 9); `CLAUDE.md` is edited only with Dib's yes (Task 10).
- Commit messages begin `Keel: ` and end with the attribution trailer the session was given.

## File Structure

| Path | Change | Responsibility |
|---|---|---|
| `harness/src/harness/config.gleam` | modify | two connector ceiling fields, `for_connector` |
| `harness/src/harness/roster.gleam` | modify | `region_description("connect")`, `role("connect") -> "connector"` |
| `harness/src/harness/guard.gleam` | modify | `Connector(sighting_path)` role; `url`/`query` hook fields; `decide_web`; `web` row; wider PreToolUse matcher |
| `harness/hooks/settings.template.json` | modify | PreToolUse matcher gains `WebFetch|WebSearch` (held equal to the generated file by a test) |
| `harness/src/harness/worker.gleam` | modify | `default_tools`, `launch_with_tools`; `launch` delegates |
| `harness/src/harness/theorist.gleam` | modify | seven private functions made `pub` — `ensure_identity`, `inlined`, `document_size`, `ceilings` unchanged otherwise; `who_you_are`, `end_word`, `ended_words` also gain a parameter — plus five already-`pub` functions parameterised in place (`who`, `attack_path`, `numbered_attack_path`, `free_attack_path`, `report_schema`) and the private `free_from` given a parameter too; the theorist's own call sites pass what each used to hardcode |
| `harness/test/theorist_test.gleam` | modify | call sites of the six parameterised functions updated to the new signatures; asserts nothing about the theorist's behaviour changes |
| `harness/src/harness/connector.gleam` | create | only the role-specific half: `Options`, `Flags`, `parse_flags`, `default_port`, `Report`, `role`, `task_message`, `brief`, `render`, `Session`, `run` and the summary; the naming ceremony, the document path rule, the report schema's shape and the "who you are" preamble are `theorist.*` calls, not reimplementations |
| `harness/src/harness.gleam` | modify | `connect` CLI arm and usage string |
| `harness/src/harness/writes.gleam` | modify | `agents/<Name>.md` risk line names `connect` as a writer |
| `harness/test/config_test.gleam` | modify | connector ceiling tests |
| `harness/test/roster_test.gleam` | modify | `connect` region tests |
| `harness/test/guard_connector_test.gleam` | create | the fence, pure and over the wire |
| `harness/test/guard_test.gleam` | modify | matcher test names the two web tools |
| `harness/test/worker_test.gleam` | modify | `launch_with_tools` test |
| `harness/test/connector_test.gleam` | create | the verb offline against the fake shim |
| `docs/glossary.md` | modify | rows for connector, sighting, vantage, dictionary |
| `CLAUDE.md` | modify (ASK DIB) | one `connect` line under "Running the harness" |

Test modules are discovered by gleeunit and counted by `suite_size.announce` off disk, so a new `*_test.gleam` needs no registration; the announced total rises by the number of `pub fn ..._test()` functions added.

---

### Task 1: Connector ceilings in config

**Files:**
- Modify: `harness/src/harness/config.gleam` (doc comment lines 47-54; type fields after line 74; `load` lines 127-128; new fn after line 207)
- Test: `harness/test/config_test.gleam` (append after line 234)

**Interfaces:**
- Consumes: `config.load() -> Result(Config, String)`, `env_int`, `env_float` (private, existing).
- Produces: fields `Config.connector_max_turns: Int`, `Config.connector_max_budget_usd: Float`; `pub fn for_connector(cfg: Config) -> Config`.

- [ ] **Step 1: Write the failing tests**

Append to `harness/test/config_test.gleam` after `for_theorist_and_for_seeder_swap_in_their_own_ceilings_test` (line 234):

```gleam
/// A connector runs under the theorist's ceilings unless given its own:
/// with no `HARNESS_CONNECTOR_*` set the pair equals the theorist's, and
/// follows it when the theorist's is overridden.
pub fn connector_ceilings_default_to_the_theorists_test() {
  let assert Ok(cfg) = config.load()
  assert cfg.connector_max_turns == cfg.theorist_max_turns
  assert cfg.connector_max_budget_usd == cfg.theorist_max_budget_usd
  envoy.set("HARNESS_THEORIST_MAX_TURNS", "9")
  envoy.set("HARNESS_THEORIST_MAX_BUDGET_USD", "2.5")
  let loaded = config.load()
  envoy.unset("HARNESS_THEORIST_MAX_TURNS")
  envoy.unset("HARNESS_THEORIST_MAX_BUDGET_USD")
  let assert Ok(cfg) = loaded
  assert cfg.connector_max_turns == 9
  assert cfg.connector_max_budget_usd == 2.5
}

/// Given its own pair, the connector takes it and the theorist's is untouched.
pub fn connector_ceilings_come_from_their_own_environment_when_given_test() {
  envoy.set("HARNESS_CONNECTOR_MAX_TURNS", "7")
  envoy.set("HARNESS_CONNECTOR_MAX_BUDGET_USD", "3")
  let loaded = config.load()
  envoy.unset("HARNESS_CONNECTOR_MAX_TURNS")
  envoy.unset("HARNESS_CONNECTOR_MAX_BUDGET_USD")
  let assert Ok(cfg) = loaded
  assert cfg.connector_max_turns == 7
  assert cfg.connector_max_budget_usd == 3.0
  assert cfg.theorist_max_turns == 600
  assert cfg.theorist_max_budget_usd == 80.0
}

/// `for_connector` swaps in its pair and changes nothing else, the way
/// `for_theorist` does.
pub fn for_connector_swaps_in_the_connector_ceilings_test() {
  let assert Ok(base) = config.load()
  let cfg =
    config.Config(
      ..base,
      max_turns: 40,
      max_budget_usd: 4.0,
      connector_max_turns: 500,
      connector_max_budget_usd: 70.0,
    )
  let connector = config.for_connector(cfg)
  assert connector.max_turns == 500
  assert connector.max_budget_usd == 70.0
  assert config.Config(..connector, max_turns: 40, max_budget_usd: 4.0) == cfg
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: a compile error naming `connector_max_turns` as an unknown field of `Config` (the suite does not run until the test module compiles).

- [ ] **Step 3: Write the minimal implementation**

In `harness/src/harness/config.gleam`, replace the doc comment lines 47-54 with:

```gleam
/// `theorist_max_turns`, `theorist_max_budget_usd`, `seeder_max_turns`,
/// `seeder_max_budget_usd`, `connector_max_turns` and
/// `connector_max_budget_usd` are the ceilings for the three hand-started
/// session kinds (`for_theorist`, `for_seeder`, `for_connector`). They
/// replace the ordinary pair the same way the research pair does, because
/// `worker.launch` reads `max_turns` and `max_budget_usd` and nothing else:
/// a hand-started session started under the run's config unchanged runs
/// under a prover's ceilings, which is how the first theorist ended at $4
/// with its document half written. The spec's line for a theorist and for
/// a connector is hours, not turns; a connector's pair defaults to the
/// theorist's resolved pair and only `HARNESS_CONNECTOR_*` moves it.
```

Add two fields to `Config` directly after `theorist_max_budget_usd: Float,` (line 74):

```gleam
    connector_max_turns: Int,
    connector_max_budget_usd: Float,
```

In `load`, replace lines 127-128 (`theorist_max_turns: env_int(...)`, `theorist_max_budget_usd: env_float(...)`) with:

```gleam
    theorist_max_turns:,
    theorist_max_budget_usd:,
    connector_max_turns: env_int("HARNESS_CONNECTOR_MAX_TURNS", theorist_max_turns),
    connector_max_budget_usd: env_float(
      "HARNESS_CONNECTOR_MAX_BUDGET_USD",
      theorist_max_budget_usd,
    ),
```

and add, before the `Ok(Config(` at line 100:

```gleam
  let theorist_max_turns = env_int("HARNESS_THEORIST_MAX_TURNS", 600)
  let theorist_max_budget_usd =
    env_float("HARNESS_THEORIST_MAX_BUDGET_USD", 80.0)
```

After `for_theorist` (line 207) add:

```gleam
/// The configuration a connector session runs under: `cfg` with the
/// connector ceilings in place of the ordinary ones, and nothing else
/// changed. Applied in `connector.run` before `worker.launch_with_tools`.
pub fn for_connector(cfg: Config) -> Config {
  Config(
    ..cfg,
    max_turns: cfg.connector_max_turns,
    max_budget_usd: cfg.connector_max_budget_usd,
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: the announced total is the previous total + 3, the summary line reads `<total> passed, no failures`, and passed equals the announced total.

- [ ] **Step 5: Commit**

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add harness/src/harness/config.gleam harness/test/config_test.gleam
git commit -m "Keel: connector ceilings, defaulting to the theorist's pair

The connector runs under HARNESS_THEORIST_MAX_TURNS / _BUDGET_USD unless
HARNESS_CONNECTOR_* is given, as the spec says; for_connector swaps the
pair in the way for_theorist does. Base f0e2360."
```
(append the session's attribution trailer to every commit message in this plan.)

---

### Task 2: The `connect` roster region

**Files:**
- Modify: `harness/src/harness/roster.gleam` (`region_description` lines 279-291; `role` lines 324-333 and its doc comment; `naming_prompt` doc line 295)
- Test: `harness/test/roster_test.gleam` (append after line 176)

**Interfaces:**
- Consumes: `roster.naming_prompt(region: String, region_description: String, siblings: List(String)) -> String` (existing).
- Produces: `roster.region_description("connect")` wording; a mint in `connect` is asked to name itself as a connector.

- [ ] **Step 1: Write the failing tests**

Append to `harness/test/roster_test.gleam` after `region_descriptions_are_the_spec_wording_test` (line 176):

```gleam
/// A mint in the `connect` region is asked to name itself as a connector,
/// alone or beside a sibling, and never as a prover or a theorist.
pub fn naming_prompt_asks_a_connect_mint_to_name_itself_as_a_connector_test() {
  let alone =
    roster.naming_prompt("connect", roster.region_description("connect"), [])
  assert string.contains(alone, "a small team of connectors")
  assert !string.contains(alone, "prover")
  assert !string.contains(alone, "theorist")
  let joined =
    roster.naming_prompt("connect", roster.region_description("connect"), [
      "Lodestar",
    ])
  assert string.contains(
    joined,
    "This region already has a connector named Lodestar.",
  )
}

pub fn the_connect_region_description_says_dictionary_and_never_proof_test() {
  let text = roster.region_description("connect")
  assert text != "connect"
  assert string.contains(text, "dictionary")
  assert string.contains(text, "another field")
  assert string.contains(text, "never a proof")
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: two failures in `roster_test` — `region_description("connect")` returns `"connect"` (the `other -> other` arm) and the prompt says "a small team of provers".

- [ ] **Step 3: Write the minimal implementation**

In `harness/src/harness/roster.gleam`, add an arm to `region_description` before `other -> other` (line 290):

```gleam
    "connect" ->
      "one open problem seen from every field of mathematics where an object like it has been studied: a dictionary between this project's objects and another field's, row by row, with the seams where it breaks — a sighting, never a proof"
```

Replace the doc comment and body of `role` (lines 324-333) with:

```gleam
/// The word a newcomer is asked to name itself as. A mint in the `theory`
/// region is a theorist and one in `connect` is a connector (`theorist.gleam`
/// and `connector.gleam` run the same ceremony the dispatcher does for a
/// prover); every other region's mint is a prover.
fn role(region: String) -> String {
  case region {
    "theory" -> "theorist"
    "connect" -> "connector"
    _ -> "prover"
  }
}
```

Amend the doc comment of `naming_prompt` (line 295) so the parenthesis reads: "as a prover, as a theorist when the region is `theory`, or as a connector when it is `connect`".

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: announced total = previous + 2; `<total> passed, no failures`; passed equals the announced total.

- [ ] **Step 5: Commit**

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add harness/src/harness/roster.gleam harness/test/roster_test.gleam
git commit -m "Keel: the connect roster region, minted as a connector

region_description and the naming ceremony know the region, so
connector.run can mint through worker.name_identity unchanged."
```

---

### Task 3: `guard.Connector` — the write, bash and message fence

**Files:**
- Modify: `harness/src/harness/guard.gleam` (`Role` lines 65-104; `decide_message` lines 241-246; `decide_write` lines 251-296; `decide_bash_for` lines 359-380; `role_word` lines 384-390)
- Test: `harness/test/guard_connector_test.gleam` (create)

**Interfaces:**
- Consumes: `guard.decide(rules: Rules, hook_input: String) -> Decision`, `guard.Rules(repo_root: String, role: Role, holder: String)`, `guard.message_deny_reason`.
- Produces: `guard.Connector(sighting_path: String)` constructor of `guard.Role`.

- [ ] **Step 1: Write the failing tests**

Create `harness/test/guard_connector_test.gleam`:

```gleam
//// The connector's rule set: the theorist's with three changes, separate
//// from the prover's, the seeder's and the theorist's.
////
//// A connector writes one sighting document under `docs/connections/`; like
//// a theorist it writes and runs scripts under `explorer/` and keeps the
//// `lake` grammar; unlike a theorist it cannot add to `docs/obstructions.md`
//// — its dead ends go in the document's own section 4 — and it may reach
//// the web, read-only, through `WebFetch` and `WebSearch`. The tests that
//// matter are the negative ones: the obstructions file, the attack
//// directory, the proposal file, the statement file.

import gleam/string
import harness/guard.{Rules}

const connector = Rules(
  repo_root: "C:\\r",
  role: guard.Connector(
    sighting_path: "C:\\r\\docs\\connections\\2026-09-07-ergodic-theory.md",
  ),
  holder: "connector-1",
)

fn write(path: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\""
  <> path
  <> "\"}}"
}

fn edit(path: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\""
  <> path
  <> "\"}}"
}

fn bash(command: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\""
  <> command
  <> "\"}}"
}

// --- what a connector may do --------------------------------------------------

pub fn connector_may_write_its_sighting_document_test() {
  assert guard.decide(
      connector,
      write("c:/r/docs/connections/2026-09-07-ergodic-theory.md"),
    )
    == guard.Allow
  assert guard.decide(
      connector,
      edit("C:\\\\r\\\\docs\\\\connections\\\\2026-09-07-ergodic-theory.md"),
    )
    == guard.Allow
}

pub fn connector_may_write_and_run_scripts_under_explorer_test() {
  assert guard.decide(connector, write("c:/r/explorer/probe.mjs"))
    == guard.Allow
  assert guard.decide(connector, edit("explorer/sub/scan.mjs")) == guard.Allow
  assert guard.decide(connector, bash("node explorer/probe.mjs")) == guard.Allow
}

pub fn connector_keeps_the_lake_grammar_test() {
  assert guard.decide(connector, bash("lake build Rule30.Basic"))
    == guard.AcquireBuild
  assert guard.decide(connector, bash("lake env lean explorer/probe.lean"))
    == guard.Allow
}

// --- the fence ----------------------------------------------------------------

/// The one file the design takes away from this role relative to a
/// theorist: a connector's dead ends go in its own section 4, and a captain
/// moves any that is a real obstruction.
pub fn connector_cannot_write_the_obstructions_file_test() {
  let assert guard.Deny(reason:, ..) =
    guard.decide(connector, edit("c:/r/docs/obstructions.md"))
  assert string.contains(reason, "sighting document")
  assert string.contains(reason, "explorer")
  assert string.contains(reason, "section 4")
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/docs/obstructions.md"))
}

pub fn connector_cannot_write_an_attack_document_or_another_sighting_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/docs/attacks/2026-09-07-x.md"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/docs/connections/2026-09-07-other.md"))
  let assert guard.Deny(..) =
    guard.decide(
      connector,
      write("c:/r/docs/connections/2026-09-07-ergodic-theory-2.md"),
    )
}

pub fn connector_cannot_write_the_proposal_the_statements_or_the_dag_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/blueprint/proposals/next.json"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/Rule30/Statements.lean"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/blueprint/dag.json"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/agents/Keel.md"))
}

pub fn connector_cannot_escape_explorer_with_dot_dot_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/explorer/../Rule30/Statements.lean"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/explorer_evil/probe.mjs"))
  let assert guard.Deny(..) =
    guard.decide(connector, bash("node explorer/../evil.mjs"))
}

pub fn connector_cannot_pass_node_an_argument_or_use_shell_operators_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, bash("node explorer/probe.mjs 4000"))
  let assert guard.Deny(..) =
    guard.decide(connector, bash("node explorer/a.mjs | tee out.txt"))
  let assert guard.Deny(..) =
    guard.decide(connector, bash("curl https://arxiv.org/abs/1"))
}

// --- no role may message a session ---------------------------------------------

pub fn a_connector_cannot_send_a_message_either_test() {
  let send =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"SendMessage\",\"tool_input\":{\"to\":\"Rowan\",\"message\":\"hi\"}}"
  let assert guard.Deny(reason:, ..) = guard.decide(connector, send)
  assert reason == guard.message_deny_reason
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: compile error — `guard.Connector` is not a constructor of `Role`.

- [ ] **Step 3: Write the minimal implementation**

In `harness/src/harness/guard.gleam`, add a constructor to `Role` after `Theorist(attack_path: String, obstructions_path: String)` (line 103):

```gleam
  /// The theorist's guard with three changes, as the connector design's
  /// fence paragraph says. `sighting_path` — the one sighting document the
  /// session exists to write, `docs/connections/<date>-<vantage>.md` — in
  /// place of the attack document; no obstructions file at all, because a
  /// connector's dead ends belong in its own section 4 and a captain moves
  /// any that is a real obstruction; and the two web tools, `WebFetch` and
  /// `WebSearch`, allowed read-only and logged (`decide_web`). Everything
  /// else is the theorist's: anything under `explorer/` writable, `node
  /// <script>` under `explorer/`, and the `lake` grammar.
  Connector(sighting_path: String)
```

In `decide_message` (line 243) widen the arm to `Prover(..) | Seeder(..) | Theorist(..) | Connector(..) ->`.

In `decide_write`, add an arm after the `Theorist` arm (before the closing `}` at line 295):

```gleam
    Connector(sighting_path:) ->
      case
        normalise_path(file_path) == normalise_path(sighting_path)
        || under_explorer(rules.repo_root, file_path)
      {
        True -> Allow
        False ->
          Deny(
            NotWritable,
            "harness guard: a connector may only write its sighting document "
              <> sighting_path
              <> " or scripts under "
              <> explorer_dir(rules.repo_root)
              <> "; dead ends go in the document's section 4, not in the obstructions file",
          )
      }
```

In `decide_bash_for` replace the `case rules.role, node_script(trimmed)` block (lines 364-378) with:

```gleam
      case rules.role, node_script(trimmed) {
        Seeder(..), Ok(script)
        | Theorist(..), Ok(script)
        | Connector(..), Ok(script)
        ->
          case under_explorer(rules.repo_root, script) {
            True -> Allow
            False ->
              Deny(
                NotPermitted,
                "harness guard: "
                  <> role_word(rules.role)
                  <> " may only run scripts under explorer/",
              )
          }
        Prover(..), _
        | Seeder(..), Error(Nil)
        | Theorist(..), Error(Nil)
        | Connector(..), Error(Nil)
        -> match_bash_grammar(trimmed)
      }
```

and change the comment above it to: "The `node` arm is reachable ONLY under `Seeder`, `Theorist` and `Connector`, each named here rather than matched by `_`, so a fifth role has to say which side of this line it is on before it compiles."

In `role_word` add the arm `Connector(..) -> "a connector"`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: announced total = previous + 9 (one new module, nine tests); `<total> passed, no failures`; passed equals the announced total.

- [ ] **Step 5: Commit**

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add harness/src/harness/guard.gleam harness/test/guard_connector_test.gleam
git commit -m "Keel: guard.Connector, the theorist's fence minus the obstructions file

One sighting document under docs/connections/, explorer/ and the lake
grammar as for a theorist, docs/obstructions.md denied, SendMessage
denied. The web tools come in the next commit."
```

---

### Task 4: `WebFetch` and `WebSearch` in the guard, every URL logged

> **Rulings applied to this task (Keel, with Rowan's answers of 2026-09-07 ~20:50Z). These supersede the code blocks below where they differ; the reviewer holds you to these.**
>
> **R1 — the other three roles are denied, not allowed.** `decide_web` answers `Deny(NotPermitted, web_other_role_deny_reason)` for `Prover(..)`, `Seeder(..)` and `Theorist(..)` on both `WebFetch` and `WebSearch`. The guard is the trust boundary the project names; the CLI allowlist is not. Replace the `Prover(..), _ | Seeder(..), _ | Theorist(..), _ -> Allow` arm with `Prover(..), _ | Seeder(..), _ | Theorist(..), _ -> Deny(NotPermitted, web_other_role_deny_reason)`, add
>
> ```gleam
> /// What any role but the connector is told when it reaches for the web:
> /// the grant is the connector's alone.
> pub const web_other_role_deny_reason = "harness guard: the web is available to a connector session only; this session has no WebFetch or WebSearch"
> ```
>
> and rewrite the `decide_web` doc comment's last four sentences to say that: the other three roles are refused here as well as by the CLI allowlist, so the grant stays this role's whichever layer is loosened later. Add to `harness/test/guard_connector_test.gleam` a `const theorist = Rules(..)` copied from `harness/test/guard_theorist_test.gleam` lines 15-23 (same `repo_root` style as the file's `connector`) and this test:
>
> ```gleam
> /// The web is the connector's alone: the guard refuses it to every other
> /// role even though the CLI allowlist already leaves the tools off theirs.
> pub fn the_other_roles_cannot_reach_the_web_test() {
>   let refused = guard.Deny(guard.NotPermitted, guard.web_other_role_deny_reason)
>   assert guard.decide(theorist, fetch("https://arxiv.org/abs/2001.00001")) == refused
>   assert guard.decide(theorist, search("rule 30 expansivity")) == refused
> }
> ```
>
> **R2 — a fetch's completion is recorded too.** The `web` row is written at `PreToolUse` for `WebFetch` and `WebSearch` (as below) AND at `PostToolUse` and `PostToolUseFailure` for `WebFetch`, and carries one more key, `event` (the hook event name), so a row `{"kind":"web","event":"PostToolUseFailure",...,"url":"https://..."}` tells a captain that fetch never completed. Change `web_row`'s match to `"PreToolUse", "WebFetch" | "PreToolUse", "WebSearch" | "PostToolUse", "WebFetch" | "PostToolUseFailure", "WebFetch" ->` and add `#("event", json.string(hi.event))` as the first field. The guard's decision for a `PostToolUse`/`PostToolUseFailure` `WebFetch` is whatever the post arm (guard.gleam line 206) returns for a non-`Bash` tool today — do not change that arm's behaviour for `Bash`. In `harness/hooks/settings.template.json` and `settings_json` the `PostToolUse` and `PostToolUseFailure` matchers become `"Bash|WebFetch"`; the tests in `harness/test/guard_test.gleam` that pin those two matchers to `Bash` (around lines 222-240) now assert the matcher splits on `|` into a list containing both `Bash` and `WebFetch`. Add one wire test in `guard_connector_test.gleam`, beside the PreToolUse wire test below, that posts `{"hook_event_name":"PostToolUseFailure","tool_name":"WebFetch","tool_input":{"url":"https://example.org/x"},"error":"timeout"}` to a running connector guard and asserts `events.jsonl` gained a `web` row with `"event":"PostToolUseFailure"` and `"url":"https://example.org/x"`.
>
> **R3 — the no-vantage file name** is the slug of the problem wall id (Task 6), confirmed by Rowan; nothing to change here.


**Files:**
- Modify: `harness/src/harness/guard.gleam` (`HookInput` lines 131-176; `decide_pre` lines 220-228; new `decide_web` after `decide_message`; `respond_to_hook` lines 680-698; `attempted_of` lines 751-758; `settings_json` matcher line 925)
- Modify: `harness/hooks/settings.template.json` (line 4, the PreToolUse matcher)
- Modify: `harness/test/guard_test.gleam` (`the_pretooluse_matcher_names_send_message_test`, lines 278-283)
- Test: `harness/test/guard_connector_test.gleam` (append)

**Interfaces:**
- Consumes: `guard.start_with(rules, lock, log, port, build_lock_wait_ms) -> Result(Guard, String)`, `guard_event.read(l: log.Log, node: String) -> List(GuardEvent)`, `log.event(log, kind, fields)`, `ports.span(1)`, `shell.which`, `shell.run`.
- Produces: `pub const web_kind = "web"`; `pub const web_deny_reason: String`; `pub fn urls_in(text: String) -> List(String)`; the PreToolUse matcher `Edit|Write|MultiEdit|NotebookEdit|Bash|SendMessage|WebFetch|WebSearch`.

Payload shapes, from Claude Code's PreToolUse hook: `{"hook_event_name":"PreToolUse","tool_name":"WebFetch","tool_input":{"url":"https://...","prompt":"..."}}` and `{"hook_event_name":"PreToolUse","tool_name":"WebSearch","tool_input":{"query":"...","allowed_domains":[...]}}`. The guard reads `tool_input.url` and `tool_input.query` exactly as it reads `tool_input.file_path` and `tool_input.command` today (`decode.optionally_at`).

- [ ] **Step 1: Write the failing tests**

Change `the_pretooluse_matcher_names_send_message_test` in `harness/test/guard_test.gleam` (lines 278-283) to:

```gleam
pub fn the_pretooluse_matcher_names_send_message_and_the_web_tools_test() {
  let assert Ok(template) = simplifile.read("hooks/settings.template.json")
  let assert [#(matcher, _, _)] = registered_hooks(template, "PreToolUse")
  let tools = string.split(matcher, "|")
  assert list.contains(tools, "SendMessage")
  assert list.contains(tools, "Bash")
  // A URL is only logged if the hook fires, and it only fires if the
  // matcher names the tool.
  assert list.contains(tools, "WebFetch")
  assert list.contains(tools, "WebSearch")
}
```

Append to `harness/test/guard_connector_test.gleam` (add these imports at the top of the file: `import gleam/dynamic/decode`, `import gleam/erlang/process.{type Subject}`, `import gleam/json`, `import gleam/list`, `import gleam/option.{None, Some}`, `import gleam/result`, `import harness/guard_event`, `import harness/lock`, `import harness/log`, `import harness/shell`, `import ports`, `import simplifile`):

```gleam
// --- the web, read-only, and every URL on the record ------------------------------

fn fetch(url: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"WebFetch\",\"tool_input\":{\"url\":\""
  <> url
  <> "\",\"prompt\":\"quote the abstract\"}}"
}

fn search(query: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"WebSearch\",\"tool_input\":{\"query\":\""
  <> query
  <> "\"}}"
}

pub fn connector_may_fetch_over_http_and_https_and_may_search_test() {
  assert guard.decide(connector, fetch("https://arxiv.org/abs/2001.00001"))
    == guard.Allow
  assert guard.decide(connector, fetch("http://example.org/paper.pdf"))
    == guard.Allow
  assert guard.decide(connector, search("rule 30 expansivity Kopra"))
    == guard.Allow
}

/// The grant is a GET to the web and nothing wider: a `file:` or `ftp:` URL,
/// or one with no scheme, is refused with a reason that says what is allowed.
pub fn connector_cannot_fetch_anything_but_http_test() {
  let assert guard.Deny(kind: guard_event.NotPermitted, reason:) =
    guard.decide(connector, fetch("file:///C:/r/Rule30/Statements.lean"))
  assert reason == guard.web_deny_reason
  let assert guard.Deny(..) = guard.decide(connector, fetch("ftp://x.org/a"))
  let assert guard.Deny(..) = guard.decide(connector, fetch("arxiv.org/abs/1"))
  let assert guard.Deny(..) = guard.decide(connector, fetch(""))
}

/// Every `http://` or `https://` token in a hook body, once each, trailing
/// punctuation dropped, JSON quoting ignored.
pub fn urls_in_finds_every_http_token_once_test() {
  assert guard.urls_in(
      "{\"url\":\"https://a.org/x\",\"prompt\":\"see https://a.org/x, and http://b.org/y).\"}",
    )
    == ["https://a.org/x", "http://b.org/y"]
  assert guard.urls_in("no links here") == []
  assert guard.urls_in("ftp://x.org and mailto:a@b.c") == []
}

/// `start_on_free_port_as` and `post_hook` as `guard_test` has them; private
/// there, so copied here.
fn start_as(
  as_rules: Rules,
  lock_actor: Subject(lock.Msg),
  run_log: log.Log,
  attempts: Int,
) -> guard.Guard {
  case
    guard.start_with(
      as_rules,
      lock_actor,
      run_log,
      ports.span(1),
      guard.build_lock_wait_ms,
    ),
    attempts
  {
    Ok(started), _ -> started
    Error(_), n if n > 1 -> start_as(as_rules, lock_actor, run_log, n - 1)
    Error(e), _ ->
      panic as { "guard.start found no free port in 8 attempts: " <> e }
  }
}

fn post_hook(started: guard.Guard, body: String) -> String {
  let assert Ok(curl) = shell.which("curl")
  let assert Ok(r) =
    shell.run(
      curl,
      [
        "-s",
        "-X",
        "POST",
        "-H",
        "x-harness-token: " <> started.token,
        "--data",
        body,
        "http://127.0.0.1:" <> string.inspect(started.port) <> "/hook",
      ],
      ".",
      5000,
    )
  r.output
}

fn row_kind(line: String) -> Result(String, Nil) {
  json.parse(line, decode.at([log.kind_key], decode.string))
  |> result.replace_error(Nil)
}

/// Over the wire: a fetch and a search each leave a `guard` row whose
/// `attempted` is the URL or the query, and a `web` row carrying the URL,
/// the query and every URL in the body — so a citation in the sighting can
/// be matched against a fetch that actually happened. A refused fetch is
/// still on the record, because it is still a URL the session reached for.
pub fn every_web_call_is_logged_over_the_wire_test() {
  let dir = "build/test-runs/connector-web"
  let _ = simplifile.delete(dir)
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open(dir, "run")
  let started = start_as(connector, lock_actor, run_log, 8)

  assert post_hook(started, fetch("https://arxiv.org/abs/2001.00001")) == "{}"
  assert post_hook(started, search("Mahler powers of rational rule 30")) == "{}"
  let refused = post_hook(started, fetch("file:///C:/r/secret"))
  assert string.contains(refused, "\"permissionDecision\":\"deny\"")

  let rows = guard_event.read(run_log, "connector-1")
  assert list.map(rows, fn(r) { #(r.tool, r.attempted, r.denial) })
    == [
      #("WebFetch", "https://arxiv.org/abs/2001.00001", None),
      #("WebSearch", "Mahler powers of rational rule 30", None),
      #("WebFetch", "file:///C:/r/secret", Some(guard_event.NotPermitted)),
    ]

  let assert Ok(events) = simplifile.read(run_log.dir <> "/events.jsonl")
  let web =
    string.split(events, "\n")
    |> list.filter(fn(line) { row_kind(line) == Ok(guard.web_kind) })
  assert list.length(web) == 3
  let assert [first, second, third] = web
  assert string.contains(first, "\"tool\":\"WebFetch\"")
  assert string.contains(first, "\"url\":\"https://arxiv.org/abs/2001.00001\"")
  assert string.contains(first, "\"urls\":[\"https://arxiv.org/abs/2001.00001\"]")
  assert string.contains(first, "\"node\":\"connector-1\"")
  assert string.contains(second, "\"tool\":\"WebSearch\"")
  assert string.contains(second, "\"query\":\"Mahler powers of rational rule 30\"")
  assert string.contains(second, "\"urls\":[]")
  assert string.contains(third, "\"url\":\"file:///C:/r/secret\"")
  let assert Ok(_) = simplifile.delete(dir)
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: compile error — `guard.urls_in`, `guard.web_kind` and `guard.web_deny_reason` do not exist.

- [ ] **Step 3: Write the minimal implementation**

In `harness/src/harness/guard.gleam`:

(a) `HookInput` gains two fields and the decoder two reads. Replace lines 131-176 with:

```gleam
/// The handful of fields `decide` cares about, pulled out of a hook's JSON.
/// `url` is a `WebFetch` call's target and `query` a `WebSearch` call's
/// text; both are empty for every other tool.
type HookInput {
  HookInput(
    event: String,
    tool_name: String,
    file_path: String,
    command: String,
    to: String,
    url: String,
    query: String,
    session_id: String,
    transcript_path: String,
  )
}

fn hook_input_decoder() -> decode.Decoder(HookInput) {
  use event <- decode.field("hook_event_name", decode.string)
  use tool_name <- decode.optional_field("tool_name", "", decode.string)
  use session_id <- decode.optional_field("session_id", "", decode.string)
  use transcript_path <- decode.optional_field(
    "transcript_path",
    "",
    decode.string,
  )
  use file_path <- decode.then(decode.optionally_at(
    ["tool_input", "file_path"],
    "",
    decode.string,
  ))
  use command <- decode.then(decode.optionally_at(
    ["tool_input", "command"],
    "",
    decode.string,
  ))
  use to <- decode.then(decode.optionally_at(
    ["tool_input", "to"],
    "",
    decode.string,
  ))
  use url <- decode.then(decode.optionally_at(
    ["tool_input", "url"],
    "",
    decode.string,
  ))
  use query <- decode.then(decode.optionally_at(
    ["tool_input", "query"],
    "",
    decode.string,
  ))
  decode.success(HookInput(
    event:,
    tool_name:,
    file_path:,
    command:,
    to:,
    url:,
    query:,
    session_id:,
    transcript_path:,
  ))
}
```

(b) In `decide_pre` add an arm before `_ -> Allow`:

```gleam
    "WebFetch" | "WebSearch" -> decide_web(rules, hi)
```

(c) After `message_deny_reason` (line 249) add:

```gleam
/// The two web tools. A connector may fetch over `http://` or `https://`
/// and may search; anything else it hands `WebFetch` is refused, since the
/// grant is a read-only GET to the web and nothing wider — no login, no
/// form, no POST, in keeping with the boundary that no agent posts to an
/// external service. The other three roles never reach this arm in
/// practice: `worker.launch` leaves both tools off their `--allowedTools`,
/// so the CLI refuses the call before any hook fires. They are allowed here
/// rather than denied so that this guard's decision for them is the same as
/// it was when the hook did not cover the tools — the prover's, seeder's and
/// theorist's guards do not change — with the call now on the record.
fn decide_web(rules: Rules, hi: HookInput) -> Decision {
  case rules.role, hi.tool_name {
    Connector(..), "WebFetch" ->
      case is_http_url(hi.url) {
        True -> Allow
        False -> Deny(NotPermitted, web_deny_reason)
      }
    Connector(..), _ -> Allow
    Prover(..), _ | Seeder(..), _ | Theorist(..), _ -> Allow
  }
}

/// What a connector is told when it hands `WebFetch` something that is not
/// a web URL.
pub const web_deny_reason = "harness guard: a connector may fetch http:// and https:// URLs only — read-only, no login, no form, no POST; anything else is not available to it"

fn is_http_url(url: String) -> Bool {
  let trimmed = string.trim(url)
  string.starts_with(trimmed, "http://")
  || string.starts_with(trimmed, "https://")
}

/// The `kind` of the second row written for every web call, beside the
/// guard row: `{"kind":"web","node":..,"tool":..,"url":..,"query":..,"urls":[..]}`.
pub const web_kind = "web"

/// A second row beside the guard row for every `WebFetch` or `WebSearch`
/// `PreToolUse`, whatever the decision — a refused fetch is still a URL the
/// session reached for. `url` is the fetch's target, `query` the search's
/// text, and `urls` every `http://` or `https://` token anywhere in the hook
/// body: the URL itself for a fetch, and whatever a search's payload
/// carried. The guard row's `attempted` is capped at 400 characters and a
/// citation is matched by exact URL, so the URL is repeated here uncapped.
fn web_row(l: log.Log, rules: Rules, hi: HookInput, body: String) -> Nil {
  case hi.event, hi.tool_name {
    "PreToolUse", "WebFetch" | "PreToolUse", "WebSearch" ->
      log.event(l, web_kind, [
        #("node", json.string(rules.holder)),
        #("tool", json.string(hi.tool_name)),
        #("url", json.string(hi.url)),
        #("query", json.string(hi.query)),
        #("urls", json.array(urls_in(body), json.string)),
      ])
    _, _ -> Nil
  }
}

/// Every `http://` or `https://` token in `text`, in order, once each. A
/// token runs to the next space, newline, tab, double quote or backslash —
/// the things that end a URL inside a JSON string — with trailing `,` `.`
/// `;` `)` `]` `}` dropped, since those are punctuation around a URL more
/// often than part of one.
pub fn urls_in(text: String) -> List(String) {
  text
  |> string.replace("\\", " ")
  |> string.replace("\"", " ")
  |> string.replace("\n", " ")
  |> string.replace("\t", " ")
  |> string.split(" ")
  |> list.filter(fn(t) {
    string.starts_with(t, "http://") || string.starts_with(t, "https://")
  })
  |> list.map(trim_trailing_punctuation)
  |> list.unique
}

fn trim_trailing_punctuation(t: String) -> String {
  case list.any([",", ".", ";", ")", "]", "}"], string.ends_with(t, _)) {
    True -> trim_trailing_punctuation(string.drop_end(t, 1))
    False -> t
  }
}
```

(d) In `respond_to_hook` (lines 680-698), keep the parsed input and write the web row after the guard row:

```gleam
fn respond_to_hook(
  body: String,
  rules: Rules,
  build: BuildLock,
  log: log.Log,
) -> Response(mist.ResponseData) {
  let parsed = parse_hook_input(body)
  let #(event_name, tool_name, attempted) = case parsed {
    Ok(hi) -> #(hi.event, hi.tool_name, attempted_of(hi))
    Error(_) -> #("", "", "")
  }
  let decided = decide(rules, body)
  release_stale_hold(event_name, tool_name, decided, rules, build, log)
  let decision = apply_side_effects(decided, rules, build, log)
  guard_event.write(
    log,
    event(rules, event_name, tool_name, attempted, decision),
  )
  case parsed {
    Ok(hi) -> web_row(log, rules, hi, body)
    Error(_) -> Nil
  }
  json_response(200, decision_json(decision, event_name))
}
```

(e) In `attempted_of` add two arms before `_ -> ""`:

```gleam
    "WebFetch" -> hi.url
    "WebSearch" -> hi.query
```

and extend its doc comment: "the URL for a `WebFetch`, the query for a `WebSearch`".

(f) In `settings_json` change the PreToolUse matcher (line 925) to `"Edit|Write|MultiEdit|NotebookEdit|Bash|SendMessage|WebFetch|WebSearch"`, and in `harness/hooks/settings.template.json` line 4 change `"matcher": "Edit|Write|MultiEdit|NotebookEdit|Bash|SendMessage"` to `"matcher": "Edit|Write|MultiEdit|NotebookEdit|Bash|SendMessage|WebFetch|WebSearch"`. (`the_generated_settings_match_the_template_test` holds the two equal; `every_generated_hook_carries_the_failure_branch_test` still counts four hooks.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: announced total = previous + 4; `<total> passed, no failures`; passed equals the announced total. In particular `the_generated_settings_match_the_template_test` and `a_failed_bash_call_is_hooked_the_same_as_a_successful_one_test` still pass (only the PreToolUse matcher changed).

- [ ] **Step 5: Commit**

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add harness/src/harness/guard.gleam harness/hooks/settings.template.json harness/test/guard_test.gleam harness/test/guard_connector_test.gleam
git commit -m "Keel: WebFetch and WebSearch under the guard, every URL on the record

A connector may fetch http(s) and search; the PreToolUse matcher now names
both tools so the hook fires; each call leaves a guard row (attempted =
URL or query) and a web row with the URL, the query and every URL in the
body, so a citation can be matched against a fetch that happened."
```

---

### Task 5: `worker.launch_with_tools` — the two web tools on the CLI allowlist for this role only

**Files:**
- Modify: `harness/src/harness/worker.gleam` (`launch` lines 939-985)
- Test: `harness/test/worker_test.gleam` (append at the end)

**Interfaces:**
- Consumes: `claude.Launch(node, shim, exe, args: List(String), env)`, `guard.Guard(port, token, settings_path)`.
- Produces: `pub const default_tools: List(String)` = `["Read", "Edit", "Write", "Grep", "Glob", "Bash"]`; `pub fn launch_with_tools(cfg: config.Config, model: String, guard_: guard.Guard, brief_path: String, schema: String, tools: List(String)) -> claude.Launch`; `launch` unchanged in signature and output.

Why: `launch` passes `--allowedTools Read,Edit,Write,Grep,Glob,Bash` with `--permission-mode dontAsk`, so the CLI refuses `WebFetch` and `WebSearch` to every current role before any hook fires. The connector's launch must name them, and no other role's does — which is what makes the grant "to this role only".

- [ ] **Step 1: Write the failing test**

Append to `harness/test/worker_test.gleam` (it already imports `gleam/list`, `gleam/string`, `harness/config` and `harness/worker`; add `import harness/guard` to its import block):

```gleam
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
  assert list.contains(wide.args, "Read,Edit,Write,Grep,Glob,Bash,WebFetch,WebSearch")
  assert !list.contains(plain.args, "--bare")
  assert !list.contains(wide.args, "--bare")
  assert list.filter(wide.args, fn(a) { !string.contains(a, "WebFetch") })
    == list.filter(plain.args, fn(a) { !string.contains(a, "Glob,Bash") })
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: compile error — `worker.launch_with_tools` and `worker.default_tools` do not exist.

- [ ] **Step 3: Write the minimal implementation**

In `harness/src/harness/worker.gleam` replace `launch` (lines 939-985) with:

```gleam
/// The tools every dispatched session may call, as `--allowedTools` names
/// them. What each role may do with them is the guard's decision, not the
/// command line's; a role that needs a tool this list omits — the connector's
/// two web tools — says so through `launch_with_tools`.
pub const default_tools = ["Read", "Edit", "Write", "Grep", "Glob", "Bash"]

/// A session's command line on `default_tools`. `--bare` is deliberately
/// absent: it would switch the session to API-key billing, and this run is
/// on a subscription. `schema` is the `--json-schema` every turn is held
/// to, and is the role's: a prover reports an outcome and a size estimate,
/// a seeder an outcome and a journal entry.
pub fn launch(
  cfg: config.Config,
  model: String,
  guard_: guard.Guard,
  brief_path: String,
  schema: String,
) -> claude.Launch {
  launch_with_tools(cfg, model, guard_, brief_path, schema, default_tools)
}

/// `launch` with the tool list given. The CLI refuses a tool that is not
/// on this list before any hook fires (`--permission-mode dontAsk`), so a
/// tool is granted to a role by naming it here and nowhere else; the guard
/// then decides what the role may do with it.
pub fn launch_with_tools(
  cfg: config.Config,
  model: String,
  guard_: guard.Guard,
  brief_path: String,
  schema: String,
  tools: List(String),
) -> claude.Launch {
  claude.Launch(
    node: cfg.node_exe,
    shim: cfg.shim,
    exe: cfg.claude_exe,
    args: [
      "-p",
      "--input-format",
      "stream-json",
      "--output-format",
      "stream-json",
      "--verbose",
      "--model",
      model,
      "--max-turns",
      int.to_string(cfg.max_turns),
      "--max-budget-usd",
      float.to_string(cfg.max_budget_usd),
      "--allowedTools",
      string.join(tools, ","),
      "--permission-mode",
      "dontAsk",
      "--permission-prompts",
      "none",
      "--settings",
      guard_.settings_path,
      "--append-system-prompt-file",
      brief_path,
      "--json-schema",
      schema,
    ],
    env: [],
  )
}
```

(`gleam/string` is already imported in `worker.gleam`; if the compiler says otherwise, add `import gleam/string`.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: announced total = previous + 1; `<total> passed, no failures`; passed equals the announced total. The theorist and seeder tests that read `args.json` through `HARNESS_FAKE_ARGS` still see `"--allowedTools","Read,Edit,Write,Grep,Glob,Bash"`.

- [ ] **Step 5: Commit**

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add harness/src/harness/worker.gleam harness/test/worker_test.gleam
git commit -m "Keel: worker.launch_with_tools, so one role can name a tool the default list omits

launch is unchanged on the default list. The CLI's --allowedTools is
where a tool is granted to a role; the connector adds WebFetch and
WebSearch there and nowhere else."
```

---

### Task 6: theorist reuse, and `connector.gleam`'s pure half — flags, who, the problem, the sighting path, the report, the brief

Five of the theorist's functions (counting the attack-path family — `attack_path`,
`numbered_attack_path`, `free_attack_path`, `free_from` — as one) do
everything this task needs except say "theorist": they hardcode one word
or one directory and are otherwise the naming ceremony, the document path
rule, the report schema and the "who you are" preamble, unconditionally.
This task parameterises four of them (`who`, the attack-path family,
`report_schema`, `who_you_are`), makes the fifth, `inlined`, `pub` with no
other change, updates the theorist's own call sites to pass what they used
to hardcode, and only then writes `connector.gleam` — which is thin,
because it calls them.

**Files:**
- Modify: `harness/src/harness/theorist.gleam` (`who` lines 138-187; the
  attack-path family lines 316-372; `report_schema` lines 405-458;
  `who_you_are` lines 669-686; `inlined` lines 688-694; call sites at line
  598 in `render`, and lines 746-747 and 797 in `run`)
- Modify: `harness/test/theorist_test.gleam` (`who` lines 553-562; the
  attack-path tests lines 587-651; the `report_schema` assertions lines
  845-848)
- Create: `harness/src/harness/connector.gleam` (everything except `Session`,
  `run`, `write_channels`, `document_size`, `summary`, which are Task 7 —
  and Task 7 also finishes parameterising the theorist: `ensure_identity`,
  `document_size`, `ceilings`, `end_word`, `ended_words`)
- Test: `harness/test/connector_test.gleam` (create; fixture helpers here are
  reused by Task 7)

**Interfaces:**
- Consumes (from `theorist.gleam`, after this task's Step 1):
  `theorist.who(roster_: roster.Roster, region: String, role_word: String, persona: Option(String)) -> Result(schedule.Who, String)`,
  `theorist.who_you_are(identity: roster.Identity, notebook: String, region: String, role_word: String) -> String`,
  `theorist.attack_path(repo_root: String, date: String, topic: String, dir: String) -> String`,
  `theorist.numbered_attack_path(repo_root: String, date: String, topic: String, dir: String, n: Int) -> String`,
  `theorist.free_attack_path(repo_root: String, date: String, topic: String, dir: String) -> String`,
  `theorist.report_schema(finished_word: String, notebook_description: String, journal_description: String, next_field_name: String, next_field_description: String) -> String`,
  `theorist.inlined(file: Result(String, Nil), relative: String) -> String`,
  `theorist.default_topic(d: dag.Dag) -> Result(String, String)` (already
  `pub`, unchanged), `theorist.slug`, `theorist.today`, `theorist.frontier_wall`
  (already `pub`, unchanged), `seed.open_section(open: List(dag.Node)) -> String`,
  `roster.read_notebook`, `schedule.who_for`, `schedule.Existing`,
  `schedule.Mint`, `worker.Role(decode:, act:, park:)`, `worker.nudge`,
  `worker.parked`, `worker.Ending(end, notes, report, gone)`,
  `worker.Finished`, `worker.Abandoned`, `dag.load`, `dag.Node`, `dag.Wall`,
  `dag.Open`.
- Produces (all `pub`, in `connector.gleam`): `region = "connect"`,
  `session_name = "connector-1"`, `default_model = "fable"`,
  `type Options(model, port, vantage: Option(String), persona: Option(String))`,
  `type Flags(model, vantage: Option(String), persona: Option(String))`,
  `parse_flags(List(String)) -> Result(Flags, String)`,
  `default_port(config.Config) -> Int`,
  `who(roster.Roster, Option(String)) -> Result(schedule.Who, String)`,
  `problem(dag.Dag) -> Result(dag.Node, String)`,
  `named_for(problem_id: String, vantage: Option(String)) -> String`,
  `sighting_path(repo_root, date, named) -> String`,
  `numbered_sighting_path(repo_root, date, named, n: Int) -> String`,
  `free_sighting_path(repo_root, date, named) -> String`,
  `type Report(outcome, summary, notebook, journal, next_vantage)`,
  `report_schema() -> String`, `report_from_dynamic(Dynamic) -> Result(Report, String)`,
  `role() -> worker.Role(Report)`,
  `task_message(problem_id, vantage: Option(String), sighting_path) -> String`,
  `fallback_task: String`,
  `brief(cfg, identity, problem: dag.Node, vantage: Option(String), sighting_path) -> Result(String, String)`,
  `render(...) -> String` (labelled arguments as below).

Why `who`, the attack-path family, `report_schema`, `who_you_are` and
`inlined` and not the rest: everything else the theorist has is either
type-forced apart (`Flags`, `Options`, `Report`, `parse_flags`,
`report_from_dynamic`, `role` — a connector's `Report` has `next_vantage`,
not `next_topic`, so no function that touches the concrete `Report` record
can be shared without generics Gleam doesn't have here) or genuinely a
different brief (`task_message`, `brief`, `render`, and `run` in Task 7).
These five are the ones with no such excuse: same roster shape, same
path arithmetic, same JSON schema shape, same preamble paragraph, one word
or one directory apart.

- [ ] **Step 1: Parameterise the five theorist functions this role reuses**

This is a refactor, not new behaviour: no new test is added, and the
existing suite must still report the same total, all green, after it. In
`harness/src/harness/theorist.gleam`:

(a) Replace `who`'s doc comment and signature, lines 138-155 (up to the
`) -> Result(schedule.Who, String) {` line):

```gleam
// --- who runs -------------------------------------------------------------------

/// Who the session runs as. With a name: that persona, if it is on the
/// roster in `region` — a name in another region is refused, not borrowed,
/// because a prover's notebook in this role's brief would be a
/// differently-briefed agent wearing the name. Without one: the eldest
/// identity of `region` on the roster, or the decision to mint one.
///
/// `busy` is empty on purpose. A dispatched prover is held busy by the
/// scheduler's in-flight list; a hand-started session has no scheduler, and
/// nothing outside this process records which of `region`'s identities are
/// live, so this cannot tell an idle persona from one whose session is
/// running in another window. The captain who starts two at once names the
/// second with `--as`. `role_word` names the role in the two error messages
/// below (`"theorist"`, `"connector"`) — it says nothing to the caller,
/// only to whoever reads a refusal, and it is also used, naively pluralised
/// with a trailing `s`, to list who is on the roster.
pub fn who(
  roster_: roster.Roster,
  region: String,
  role_word: String,
  persona: Option(String),
) -> Result(schedule.Who, String) {
```

and its body, lines 156-187 (the rest of the function):

```gleam
  let prefix = "harness/" <> role_word <> ": "
  case persona {
    None -> Ok(schedule.who_for(roster_, region, busy: []))
    Some(name) ->
      case list.find(roster_.identities, fn(i) { i.name == name }) {
        Ok(identity) if identity.region == region ->
          Ok(schedule.Existing(identity))
        Ok(identity) ->
          Error(
            prefix
            <> name
            <> " is on the roster for region "
            <> identity.region
            <> ", not "
            <> region
            <> "; a "
            <> role_word
            <> " runs only as a "
            <> role_word,
          )
        Error(Nil) ->
          Error(
            prefix
            <> "no "
            <> role_word
            <> " named "
            <> name
            <> " on the roster"
            <> case roster.for_region(roster_, region) {
              [] ->
                "; the "
                <> region
                <> " region is empty, so leave --as off to mint one"
              some ->
                "; the "
                <> role_word
                <> "s are "
                <> string.join(list.map(some, fn(i) { i.name }), ", ")
            },
          )
      }
  }
}
```

(b) In `run` (the theorist's own call site), replace line 746:

```gleam
  use who_ <- result.try(who(roster_, options.persona))
```

with:

```gleam
  use who_ <- result.try(who(roster_, region, "theorist", options.persona))
```

(c) Replace the attack-path family, lines 316-372, with:

```gleam
/// Where a session's document goes when nothing is there yet:
/// `docs/<dir>/<date>-<slug>.md` under the repository root, `date` as
/// `YYYY-MM-DD`. Pure; `free_attack_path` is what a session is actually
/// fenced to, because this path is taken by the first session of the day
/// on a topic and a second must not be fenced to a file that exists.
/// `dir` is the role's directory under `docs/` — `"attacks"` for a
/// theorist, `"connections"` for a connector — so the two never collide
/// even sharing a date and a slug.
pub fn attack_path(
  repo_root: String,
  date: String,
  topic: String,
  dir: String,
) -> String {
  numbered_attack_path(repo_root, date, topic, dir, 1)
}

/// `attack_path` with an ordinal: `1` is the bare path, `2` and up carry
/// `-2`, `-3`, ... before `.md`. So the second session on `the transients`
/// on 2026-09-07 writes `2026-09-07-the-transients-2.md`.
pub fn numbered_attack_path(
  repo_root: String,
  date: String,
  topic: String,
  dir: String,
  n: Int,
) -> String {
  let ordinal = case n {
    1 -> ""
    _ -> "-" <> int.to_string(n)
  }
  repo_root
  <> "/docs/"
  <> dir
  <> "/"
  <> date
  <> "-"
  <> slug(topic)
  <> ordinal
  <> ".md"
}

/// The first path for `topic` today that nothing is at: the bare path,
/// else `-2`, else `-3`, and so on. Read off the disk at session start,
/// once, and then fixed for the session's life — the guard, the brief, the
/// first message, the dispatch row and the summary all name the one path
/// this returns.
///
/// Two sessions on one topic in one day are the design's intended use
/// (several independent attacks, then a comparison), and before this they
/// resolved to the same path: the second was fenced to the file the first
/// had written, and its Write overwrote it. Anything at the path counts as
/// taken, a directory included, since a Write there would fail anyway.
pub fn free_attack_path(
  repo_root: String,
  date: String,
  topic: String,
  dir: String,
) -> String {
  free_from(repo_root, date, topic, dir, 1)
}

fn free_from(
  repo_root: String,
  date: String,
  topic: String,
  dir: String,
  n: Int,
) -> String {
  let path = numbered_attack_path(repo_root, date, topic, dir, n)
  case simplifile.file_info(path) {
    Ok(_) -> free_from(repo_root, date, topic, dir, n + 1)
    Error(_) -> path
  }
}
```

(d) In `run`, replace line 747:

```gleam
  let attack = free_attack_path(cfg.repo_root, today(), topic)
```

with:

```gleam
  let attack = free_attack_path(cfg.repo_root, today(), topic, "attacks")
```

(e) Replace `report_schema`'s signature and its `outcome`/`notebook`/
`journal`/`next_topic` fields (lines 406-456, i.e. everything from
`pub fn report_schema() -> String {` to the closing `])` of the
`properties` object) with:

```gleam
pub fn report_schema(
  finished_word: String,
  notebook_description: String,
  journal_description: String,
  next_field_name: String,
  next_field_description: String,
) -> String {
  let string_field = fn(description: String) {
    json.object([
      #("type", json.string("string")),
      #("description", json.string(description)),
    ])
  }
  json.object([
    #("type", json.string("object")),
    #(
      "properties",
      json.object([
        #(
          "outcome",
          json.object([
            #("type", json.string("string")),
            #(
              "enum",
              json.array(
                ["in_progress", finished_word, "abandoned"],
                json.string,
              ),
            ),
          ]),
        ),
        #("summary", string_field("one sentence on the state of the document")),
        #("notebook", string_field(notebook_description)),
        #("journal", string_field(journal_description)),
        #(next_field_name, string_field(next_field_description)),
      ]),
    ),
```

(the `required` array and the closing `|> json.to_string` at the end of the
function, lines 449-458, change only their last name, `next_topic`, which
is no longer a literal: replace them with)

```gleam
    #(
      "required",
      json.array(
        ["outcome", "summary", "notebook", "journal", next_field_name],
        json.string,
      ),
    ),
  ])
  |> json.to_string
}
```

(f) In `run`, replace the `worker.launch` call inside `worker.drive` (part
of lines 793-800):

```gleam
      worker.launch(session_cfg, options.model, g, brief_path, report_schema()),
```

with:

```gleam
      worker.launch(
        session_cfg,
        options.model,
        g,
        brief_path,
        report_schema(
          "attacked",
          "what you tried on this topic, what died and at what depth, which sources you searched, what you would try next. Empty until the end.",
          "what you attacked, what died, what survived and to what depth. Empty until the end.",
          "next_topic",
          "the Next topic paragraph of your document, verbatim: at least one sentence naming what should be attacked next and why. Empty until the end.",
        ),
      ),
```

(g) Replace `who_you_are`, lines 669-686, with:

```gleam
/// The section a prover's brief opens with, in the role's terms: the name,
/// the region, and the notebook verbatim. The same shape whatever the role
/// — an identity is a notebook, and the notebook is what spans sessions —
/// so `region` and `role_word` are the only two things that vary.
pub fn who_you_are(
  identity: roster.Identity,
  notebook: String,
  region: String,
  role_word: String,
) -> String {
  let book = case string.trim(notebook) {
    "" -> "Your notebook is empty: this is its first entry-worthy session."
    _ -> notebook
  }
  "## Who you are\n\nYou are "
  <> identity.name
  <> ", a "
  <> role_word
  <> " for region "
  <> region
  <> ": "
  <> roster.region_description(region)
  <> ".\n\nYour notebook, verbatim — you wrote all of it, and nothing else has:\n\n"
  <> book
}
```

(h) In `render`, replace line 598:

```gleam
      who_you_are(identity, notebook),
```

with:

```gleam
      who_you_are(identity, notebook, region, "theorist"),
```

(i) Add `pub` to `inlined`, line 689 (no other change):

```gleam
pub fn inlined(file: Result(String, Nil), relative: String) -> String {
```

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: the announced total is unchanged from before this step, and
`<total> passed, no failures` — the theorist's own tests (`who`, the
attack-path tests, the `report_schema` assertions, all the `render`/brief
tests) fail to compile until their call sites are updated too, which is
the next step.

Update `harness/test/theorist_test.gleam`:

Replace lines 553-562 (the `who` test) with:

```gleam
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
```

Replace lines 587-632 (the two attack-path tests — each `attack_path` and
`numbered_attack_path` call gains `"attacks"` as its last argument before
the ordinal, if any) with:

```gleam
pub fn the_attack_path_is_dated_and_slugged_test() {
  assert theorist.slug(theorist.frontier_wall)
    == "centercolumn-other-iseventuallyperiodic-of-center"
  assert theorist.slug("  The transients of the left diagonals! ")
    == "the-transients-of-the-left-diagonals"
  assert theorist.attack_path("C:/r", "2026-09-07", "Onset & period", "attacks")
    == "C:/r/docs/attacks/2026-09-07-onset-period.md"
  assert theorist.numbered_attack_path(
      "C:/r",
      "2026-09-07",
      "Onset & period",
      "attacks",
      1,
    )
    == "C:/r/docs/attacks/2026-09-07-onset-period.md"
  assert theorist.numbered_attack_path(
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
pub fn the_free_attack_path_is_the_first_not_taken_test() {
  let f = fixture("free-path", [], roster.Roster([]))
  let bare = theorist.attack_path(f.repo, "2026-09-07", "the seam", "attacks")
  let second =
    theorist.numbered_attack_path(f.repo, "2026-09-07", "the seam", "attacks", 2)
  let third =
    theorist.numbered_attack_path(f.repo, "2026-09-07", "the seam", "attacks", 3)
  assert theorist.free_attack_path(f.repo, "2026-09-07", "the seam", "attacks")
    == bare
  let assert Ok(_) = simplifile.create_directory_all(f.repo <> "/docs/attacks")
  let assert Ok(_) = simplifile.write(bare, "first")
  assert theorist.free_attack_path(f.repo, "2026-09-07", "the seam", "attacks")
    == second
  let assert Ok(_) = simplifile.create_directory(second)
  assert theorist.free_attack_path(f.repo, "2026-09-07", "the seam", "attacks")
    == third
  // Another topic, or another day, is untouched by the seam's files.
  assert theorist.free_attack_path(f.repo, "2026-09-07", "the onset", "attacks")
    == theorist.attack_path(f.repo, "2026-09-07", "the onset", "attacks")
  assert theorist.free_attack_path(f.repo, "2026-09-08", "the seam", "attacks")
    == theorist.attack_path(f.repo, "2026-09-08", "the seam", "attacks")
}
```

In `a_second_attack_on_one_topic_in_a_day_gets_its_own_file_test` (starting
line 639), replace its two path calls with:

```gleam
  let first =
    theorist.attack_path(repo, theorist.today(), "the transients", "attacks")
  let second =
    theorist.numbered_attack_path(
      repo,
      theorist.today(),
      "the transients",
      "attacks",
      2,
    )
```

Replace lines 845-848 (the four `report_schema` assertions) with:

```gleam
  let schema =
    theorist.report_schema(
      "attacked",
      "notebook description",
      "journal description",
      "next_topic",
      "next topic description",
    )
  assert !string.contains(schema, "estimate")
  assert string.contains(schema, "\"attacked\"")
  assert string.contains(schema, "next_topic")
  assert string.contains(schema, "notebook")
```

- [ ] **Step 2: Run the tests to verify the theorist is unchanged, then commit alone**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: the announced total is exactly what it was before Step 1 (no
test added or removed, only signatures); `<total> passed, no failures`;
passed equals the announced total.

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add harness/src/harness/theorist.gleam harness/test/theorist_test.gleam
git commit -m "Keel: parameterise five theorist functions the connector will reuse

who, the attack-path family, report_schema and who_you_are hardcoded one
word or one directory each; inlined hardcoded nothing and was only
private. All five stay behind theorist's own call sites unchanged in
behaviour — the suite's total and every assertion are the same as before
this commit — and connector.gleam, next commit, calls them instead of
copying them. Base f0e2360."
```

- [ ] **Step 3: Write the failing tests for `connector.gleam`'s pure half**

Create `harness/test/connector_test.gleam`:

```gleam
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
    simplifile.write(repo <> "/blueprint/index.md", "INDEX TEXT MUST NOT APPEAR")
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
  assert connector.default_port(config.Config(..base, guard_port: 4130))
    == 4430
  assert connector.default_port(config.Config(..base, guard_port: 5000))
    == 5300
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
  assert connector.free_sighting_path(f.repo, "2026-09-07", "the seam")
    == third
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
    "Sight the problem `" <> theorist.frontier_wall <> "` from the vantage `ergodic theory`",
  )
  assert string.contains(with, "sighting document to `C:/r/docs/connections/2026-09-07-ergodic-theory.md`")
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
  assert string.contains(brief, "You are Meridian, a connector for region connect")
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
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: a compile error — module `harness/connector` does not exist.

- [ ] **Step 5: Write the minimal implementation, calling `theorist.*` instead of copying it**

Create `harness/src/harness/connector.gleam`:

```gleam
//// One connector session, hand-started:
//// `gleam run -- connect [<vantage>] [--as <Name>] [--model M]`.
////
//// A connector is a persona whose deliverable is a sighting — one document
//// that looks at one open problem from every field of mathematics where an
//// object like it has been studied, and says, dictionary by dictionary,
//// what carries over. It lives in the roster's `connect` region and is
//// minted through the naming ceremony a prover is, on first use; its
//// notebook is `agents/<Name>.md`, carried in its brief verbatim and
//// written from its report by the harness, never by the session.
////
//// Briefed thinly on purpose (`brief`): the task text from
//// `docs/connector-brief.md`, its own notebook, the problem's residual
//// paragraph as the board carries it, `docs/obstructions.md`,
//// `docs/sources.md` and the definitions in `Rule30/Basic.lean` — and not
//// the index, the proof notes or the crystals, because the theorist has
//// those and the theorist reaches outside them about twice a session; a
//// connector's whole job is the outside. Driven by the same turn loop a
//// prover runs in (`worker.drive`), fenced by `guard.Connector`: its
//// sighting document under `docs/connections/`, scripts under `explorer/`
//// to write and to run with `node <script>`, the `lake` grammar, and the
//// web read-only through `WebFetch` and `WebSearch`, every URL logged.
////
//// What it never does: write a statement, a proposal, a node, an entry in
//// the obstructions file, or its own notebook. Nothing it writes reaches
//// the board directly: a captain reads its section 5, hands one or two
//// connections to a theorist as topics, and the theorist's falsification
//// and the seed check are the filter.
////
//// Never started by the scheduler, and, like the theorist, nothing in this
//// process knows which connectors are live: `who` treats every connector
//// on the roster as idle, and one live session per persona is the
//// captain's restraint here rather than the harness's check.
////
//// **This module imports `theorist` and calls it, on purpose.** A
//// connector differs from a theorist in its brief, its fence and its
//// report's words, and nowhere else: the naming ceremony (`who`,
//// delegating to `theorist.who`), the document path rule (`sighting_path`
//// and kin, delegating to `theorist.attack_path` and kin with `"connections"`
//// where the theorist passes `"attacks"`), the report schema's shape
//// (`report_schema`, delegating to `theorist.report_schema`), and the "who
//// you are" preamble in `render` (`theorist.who_you_are`) are reused
//// rather than copied; `theorist.inlined` likewise. What genuinely differs
//// — `Options`, `Flags`, `Report` (a shared field would lie: `topic` is
//// not `vantage`), `task_message`, `brief`, `render`, and `run` in the
//// next task — is this module's own. The deeper fix, a shared spine module
//// neither kind owns, is `each-new-session-kind-copies-the-last-ones-spine`
//// on the bug board and is not this module's job.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import harness/config
import harness/dag
import harness/roster
import harness/schedule
import harness/seed
import harness/theorist
import harness/worker
import simplifile

/// The roster region every connector lives in. Not a region of the DAG —
/// no node carries it — but a region of the roster, so the naming ceremony,
/// `roster.for_region` and the one-persona-per-session rule all work
/// unchanged.
pub const region = "connect"

/// The one session's name, and the guard's lock holder: the directory under
/// `runs/<run-id>/` is `connector-1` the way a theorist's is `theorist-1`.
pub const session_name = "connector-1"

/// What the verb is told beyond the config: the model to spend, the guard's
/// port, the vantage — a field to attack from, or `None`, meaning the
/// connector chooses — and the persona to run as, or `None` to take the
/// eldest connector on the roster or mint one. Not `theorist.Options`: the
/// `vantage` field would be a lie under `topic`'s name.
pub type Options {
  Options(
    model: String,
    port: Int,
    vantage: Option(String),
    persona: Option(String),
  )
}

/// The `connect` verb's arguments, parsed: an optional bare vantage,
/// `--as <Name>` and `--model M`, in any order. The model defaults to the
/// strongest the CLI offers, as a theorist's does: hours of a session's
/// time on one problem is the pass worth spending on. Not
/// `theorist.Flags`, for the same reason as `Options`.
pub type Flags {
  Flags(model: String, vantage: Option(String), persona: Option(String))
}

pub const default_model = "fable"

const usage = "connect [<vantage>] [--as <Name>] [--model M]"

/// Parse the arguments after `connect`. A bare argument is the vantage —
/// one word, or a quoted phrase the shell passes as one argument — and a
/// second bare argument is refused rather than joined, because a vantage
/// meant as one phrase and arrived as two words would silently attack from
/// the first word alone. An unknown flag is refused for the same reason a
/// theorist's is: a misspelt `--model` would spend hours on the wrong
/// model. The shape is `theorist.parse_flags`'s exactly, but it is not
/// reused: it is built on `Flags`, which is this module's own type.
pub fn parse_flags(flags: List(String)) -> Result(Flags, String) {
  parse_flags_into(
    flags,
    Flags(model: default_model, vantage: None, persona: None),
  )
}

fn parse_flags_into(flags: List(String), acc: Flags) -> Result(Flags, String) {
  case flags {
    [] -> Ok(acc)
    ["--model", model, ..rest] -> parse_flags_into(rest, Flags(..acc, model:))
    ["--as", name, ..rest] ->
      parse_flags_into(rest, Flags(..acc, persona: Some(name)))
    [flag] if flag == "--model" || flag == "--as" ->
      Error(flag <> " needs a value")
    [arg, ..rest] ->
      case string.starts_with(arg, "--"), acc.vantage {
        True, _ -> Error("connect does not take `" <> arg <> "`: " <> usage)
        False, None -> parse_flags_into(rest, Flags(..acc, vantage: Some(arg)))
        False, Some(first) ->
          Error(
            "connect takes one vantage, and got `"
            <> first
            <> "` and `"
            <> arg
            <> "`: quote a phrase so the shell passes it as one argument",
          )
      }
  }
}

/// The port a hand-started connector's guard listens on: three hundred
/// above the run base, clear of any run (which counts up from the base), of
/// a seeder started beside it (a hundred above) and of a theorist (two
/// hundred above).
pub fn default_port(cfg: config.Config) -> Int {
  cfg.guard_port + 300
}

// --- who runs -------------------------------------------------------------------

/// Who the session runs as: `theorist.who`, told this region and this
/// role's word. See `theorist.who` for the rule (a name in another region
/// is refused, not borrowed; `busy` is empty on purpose).
pub fn who(
  roster_: roster.Roster,
  persona: Option(String),
) -> Result(schedule.Who, String) {
  theorist.who(roster_, region, "connector", persona)
}

// --- the problem and the file -----------------------------------------------------

/// The problem: always the current P1 frontier as the board has it, the
/// same wall `theorist.default_topic` names — reused as-is, since it hard-
/// codes nothing role-specific — returned whole because the brief carries
/// its description verbatim. A captain who wants a different wall names it
/// inside the vantage text; the vantage never changes which node this is.
pub fn problem(d: dag.Dag) -> Result(dag.Node, String) {
  use id <- result.try(
    theorist.default_topic(d)
    |> result.replace_error(
      "harness/connector: no open wall in P1 to be the problem; the connector sights the P1 frontier and the board has none",
    ),
  )
  list.find(d.nodes, fn(n) { n.id == id })
  |> result.replace_error("harness/connector: the board has no node " <> id)
}

/// What the sighting file is named for: the vantage when one was given,
/// else the problem's id — so two connectors on the frontier with no
/// vantage today are `<date>-<problem>.md` and `<date>-<problem>-2.md`.
pub fn named_for(problem_id: String, vantage: Option(String)) -> String {
  case vantage {
    Some(v) -> v
    None -> problem_id
  }
}

/// This role's directory under `docs/`, the one thing that distinguishes
/// its documents from a theorist's `attack_path` family in
/// `theorist.attack_path` and kin.
const sighting_dir = "connections"

/// Where the sighting goes when nothing is there yet:
/// `docs/connections/<date>-<slug>.md` under the repository root — delegates
/// to `theorist.attack_path` with this role's directory. Pure;
/// `free_sighting_path` is what a session is actually fenced to.
pub fn sighting_path(repo_root: String, date: String, named: String) -> String {
  theorist.attack_path(repo_root, date, named, sighting_dir)
}

/// `sighting_path` with an ordinal — delegates to `theorist.numbered_attack_path`.
pub fn numbered_sighting_path(
  repo_root: String,
  date: String,
  named: String,
  n: Int,
) -> String {
  theorist.numbered_attack_path(repo_root, date, named, sighting_dir, n)
}

/// The first sighting path for `named` today that nothing is at — delegates
/// to `theorist.free_attack_path`. Read off the disk at session start,
/// once, and then fixed for the session's life — the guard, the brief, the
/// first message, the dispatch row and the summary all name the one path
/// this returns.
pub fn free_sighting_path(
  repo_root: String,
  date: String,
  named: String,
) -> String {
  theorist.free_attack_path(repo_root, date, named, sighting_dir)
}

// --- the report -----------------------------------------------------------------

/// What a connector reports at the end of every turn. `outcome` is the
/// connector's claim about its document — `sighted` once it is written —
/// and never a verdict on the problem. `notebook` is for its future self
/// and `journal` for Dib; the harness writes both to disk verbatim, which is
/// why the session has no write access to `agents/`. `next_vantage` is the
/// document's section 6, repeated here so a captain's next round can be read
/// off the summaries. No size estimate and no bugs: a connector has no node.
/// Not `theorist.Report`: `next_vantage` would lie under `next_topic`'s
/// name, and the two `outcome` enums differ (`sighted` vs `attacked`).
pub type Report {
  Report(
    outcome: String,
    summary: String,
    notebook: String,
    journal: String,
    next_vantage: String,
  )
}

/// The `--json-schema` every connector turn is held to: `theorist.report_schema`
/// with this role's outcome word and field wording.
pub fn report_schema() -> String {
  theorist.report_schema(
    "sighted",
    "an entry for your own notebook, for your future self: what you were wrong about, which field you should have looked at sooner, which resemblances died and at which seam. Empty until the end.",
    "a short written update for Dib, in your own words: which fields you sighted, which dictionaries survived to section 5 and which died in section 4. Empty until the end.",
    "next_vantage",
    "the Next vantage paragraph of your document, verbatim: which field the next connector should attack from and why. Empty until the end.",
  )
}

/// Decode a `Report` out of a turn's `structured_output`.
pub fn report_from_dynamic(dyn: Dynamic) -> Result(Report, String) {
  decode.run(dyn, report_decoder())
  |> result.map_error(string.inspect)
}

fn report_decoder() -> decode.Decoder(Report) {
  use outcome <- decode.field("outcome", decode.string)
  use summary <- decode.optional_field("summary", "", decode.string)
  use notebook <- decode.optional_field("notebook", "", decode.string)
  use journal <- decode.optional_field("journal", "", decode.string)
  use next_vantage <- decode.optional_field("next_vantage", "", decode.string)
  decode.success(Report(outcome:, summary:, notebook:, journal:, next_vantage:))
}

/// The connector's role in the turn loop. `sighted` finishes the session
/// and `abandoned` ends it; anything else is a turn that ended early and
/// gets sent back round. Whether the document exists is checked in `run`,
/// after the session, because it is a fact about the file and not about
/// the turn. Not reused from `theorist.role`: both pattern-match their own
/// concrete `Report` type, which Gleam cannot make generic over here.
pub fn role() -> worker.Role(Report) {
  worker.Role(
    decode: report_from_dynamic,
    act: fn(t, report) {
      case report {
        None ->
          worker.nudge(
            t,
            report,
            "Your turn carried no structured report. End every turn with the report the harness asked for.",
            "the connector stopped reporting",
          )
        Some(r) ->
          case r.outcome {
            "sighted" -> #(
              t.tally,
              worker.Ending(worker.Finished, r.summary, Some(r), False),
            )
            "abandoned" -> #(
              t.tally,
              worker.Ending(worker.Abandoned, r.summary, Some(r), False),
            )
            _ ->
              worker.nudge(
                t,
                report,
                "Continue.",
                "still in progress when the round budget ran out: " <> r.summary,
              )
          }
      }
    },
    park: fn(t, report) { worker.parked(t, report, "") },
  )
}

/// The first user turn. The brief in the system prompt carries the
/// knowledge and the task; this names the problem, the vantage and the file
/// again, because the first message is what a session reads last before
/// acting.
pub fn task_message(
  problem_id: String,
  vantage: Option(String),
  sighting_path: String,
) -> String {
  "Sight the problem `"
  <> problem_id
  <> "`"
  <> case vantage {
    Some(v) -> " from the vantage `" <> v <> "`"
    None -> ", choosing your own vantage"
  }
  <> ". Your brief is in your system prompt: read the task text near its top before anything else, then the residual, the obstructions, the sources and the definitions.\n\n"
  <> "Write your sighting document to `"
  <> sighting_path
  <> "`, with the six sections the brief lists, in that order. You may write scripts under explorer/ and run them with `node <script>`, and `lake env lean <file>` where a claim needs checking. You may read the web with WebFetch and WebSearch — GET only, no login, no form — and every URL you fetch is recorded, so cite by fetching or mark the claim UNVERIFIED. You may not add to docs/obstructions.md: dead ends go in your section 4.\n\n"
  <> "End every turn with the structured report. Set `outcome` to `sighted` only once the document is written and you are done, `in_progress` while you are still working, and `abandoned` if you give up; fill in `notebook`, `journal` and `next_vantage` at the end. The harness writes your notebook from the report — you cannot write agents/ yourself."
}

// --- the brief ------------------------------------------------------------------

/// The sentences a session is briefed with when `docs/connector-brief.md`
/// is not in the checkout: the task as the connector design states it. The
/// full text belongs in that file, not here.
pub const fallback_task = "Look at this problem from every region of mathematics where an object like it has been studied and say what carries over. Write one sighting document with six sections: the problem seen from outside, the fields sighted, three to seven connections each with a dictionary mapping this project's objects to the other field's row by row with its seams, what each leans on with a fetched quote and URL or UNVERIFIED, one test that would kill it, and what it would give; what died in translation; what to hand the theorist; and the next vantage. Nine in ten connections are expected to die. Cite by fetching, or mark it."

/// The brief, assembled from the repository as it stands right now, for
/// `identity` on `problem` from `vantage`, fenced to `sighting_path`.
/// Everything is read from disk at render time. Only this identity's
/// notebook is read: another connector's is not this one's memory, and a
/// theorist's would make the connector think in the theorist's vocabulary.
/// The index, the crystals and the proof notes are not read at all — that
/// is the whole point of this role, and it is why `brief`/`render` are not
/// shared with the theorist's, which reads all three.
pub fn brief(
  cfg: config.Config,
  identity: roster.Identity,
  problem: dag.Node,
  vantage: Option(String),
  sighting_path: String,
) -> Result(String, String) {
  let read = fn(relative: String) {
    simplifile.read(cfg.repo_root <> "/" <> relative)
    |> result.replace_error(Nil)
  }
  Ok(render(
    identity: identity,
    notebook: roster.read_notebook(cfg.agents_dir, identity),
    task: read("docs/connector-brief.md"),
    problem: problem,
    vantage: vantage,
    sighting_path: sighting_path,
    obstructions: read("docs/obstructions.md"),
    sources: read("docs/sources.md"),
    basic: read("Rule30/Basic.lean"),
  ))
}

/// The brief from its parts. The pure half, so it can be tested without a
/// checkout. Section order is the order a session should read in: who it is
/// and what it remembers (`theorist.who_you_are`, told this role's word),
/// the task, the problem with its residual and the fence, the three files
/// that say what is dead, what is held and what the words mean (each
/// inlined with `theorist.inlined`), and last the shape of the document it
/// owes.
pub fn render(
  identity identity: roster.Identity,
  notebook notebook: String,
  task task: Result(String, Nil),
  problem problem: dag.Node,
  vantage vantage: Option(String),
  sighting_path sighting_path: String,
  obstructions obstructions: Result(String, Nil),
  sources sources: Result(String, Nil),
  basic basic: Result(String, Nil),
) -> String {
  string.join(
    [
      theorist.who_you_are(identity, notebook, region, "connector"),
      "",
      "## The task (docs/connector-brief.md)",
      case task {
        Ok(text) -> text
        Error(Nil) ->
          "(docs/connector-brief.md is absent from this checkout)\n\n"
          <> fallback_task
      },
      "",
      "## The problem, your vantage, your file and your fence",
      "Problem: " <> problem.id,
      "",
      case vantage {
        Some(v) -> "Vantage: " <> v
        None ->
          "Vantage: none given — choose one, name it in section 1, and say in section 6 why you chose it"
      },
      "",
      "Sighting document: " <> sighting_path,
      "",
      "You may write exactly one file outside explorer/: the sighting document",
      "above, and not docs/obstructions.md — your dead ends go in section 4, and",
      "a captain moves any that is a real obstruction. Under explorer/ you may",
      "write and edit scripts freely, and run one with `node <one path under",
      "explorer/>`; `lake build [modules]` and `lake env lean <file>` are",
      "permitted, one bare command per call with no shell operators. You may",
      "read the web with WebFetch and WebSearch — GET only, no login, no form,",
      "no POST — and every URL is recorded in the run's log, so a citation in",
      "your document is checked against a fetch that happened. Every other",
      "write is denied by a hook, not by convention: no proposal, no statement,",
      "no node, and not your own notebook — the harness writes that from your",
      "report.",
      "",
      "The residual paragraph, as the board carries it:",
      "",
      seed.open_section([problem]),
      "",
      "## The obstructions (docs/obstructions.md)",
      theorist.inlined(obstructions, "docs/obstructions.md"),
      "",
      "## The sources (docs/sources.md)",
      theorist.inlined(sources, "docs/sources.md"),
      "",
      "## The definitions (Rule30/Basic.lean)",
      theorist.inlined(basic, "Rule30/Basic.lean"),
      "",
      "## What the document must contain",
      "In this order, each under its own heading, a section with nothing in",
      "it still present with one sentence saying so:",
      "",
      "1. The problem, seen from outside.",
      "2. Fields sighted.",
      "3. Connections — three to seven, each with the claim, the dictionary",
      "   and its seams, what it leans on (fetched quote and URL, or",
      "   UNVERIFIED), the test, and what it would give.",
      "4. Died in translation.",
      "5. What to hand the theorist.",
      "6. Next vantage.",
      "",
      "Nine in ten connections are expected to die. A dictionary a theorist",
      "can attack is the deliverable. The document is read by a captain,",
      "beside sightings of the same problem from other vantages.",
    ],
    "\n",
  )
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: announced total = previous + 10 (one new module, ten tests);
`<total> passed, no failures`; passed equals the announced total.

- [ ] **Step 7: Commit**

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add harness/src/harness/connector.gleam harness/test/connector_test.gleam
git commit -m "Keel: connector module, the pure half, calling theorist instead of copying it

who, sighting_path and kin, and report_schema delegate to theorist's
newly-parameterised functions; render calls theorist.who_you_are and
theorist.inlined. Options, Flags, Report, task_message, brief and render
are this module's own, because their meaning or their inputs genuinely
differ. The test puts the index, the crystals and a proof note on disk
to show they stay out of the brief."
```

---

### Task 7: `connector.run` — the session, its record, the channels and the summary

Five more theorist functions are reused here the same way: `ensure_identity`
is already fully generic and only needs `pub`; `document_size` and
`ceilings` are the same; `end_word` and `ended_words` hardcode one or two
words each and are parameterised like Task 6's five. `Session`, `run`,
`write_channels` and `summary` stay the connector's own, because each is
built around the concrete `Report` type or names its own record directory,
guard rules and tool list.

**Files:**
- Modify: `harness/src/harness/theorist.gleam` (`ensure_identity` line 194;
  `document_size` line 879; `ceilings` line 985; `end_word` lines 945-957;
  `ended_words` lines 966-982; call sites at lines 854 and 926)
- Modify: `harness/test/theorist_test.gleam` — no change: none of these
  five is called directly by a test (each is exercised only through `run`
  and `summary`, whose output text is unchanged because the theorist's own
  call sites pass the same words as before)
- Modify: `harness/src/harness/connector.gleam` (append after `render`)
- Test: `harness/test/connector_test.gleam` (append; the fixture from
  Task 6 is reused)

**Interfaces:**
- Consumes (from `theorist.gleam`, after this task's Step 1):
  `theorist.ensure_identity(cfg, roster_, who_: schedule.Who, model, g: guard.Guard, l: log.Log) -> Result(roster.Identity, String)`,
  `theorist.document_size(path: String) -> Option(Int)`,
  `theorist.ceilings(cfg: config.Config) -> String`,
  `theorist.end_word(end: worker.End, size: Option(Int), finished_word: String) -> String`,
  `theorist.ended_words(cfg: config.Config, end: worker.End, size: Option(Int), role_word: String, doc_word: String) -> String`;
  and from Task 6: `theorist.who`, `theorist.free_attack_path`,
  `theorist.report_schema`, `connector.who`, `connector.problem`,
  `connector.free_sighting_path`, `connector.named_for`, `connector.role`,
  `connector.report_schema`, `connector.task_message`, `connector.brief`;
  `log.open`, `log.new_run_id`, `log.event`, `log.journal`, `log.summary`,
  `log.now_iso`, `lock.start`, `guard.start`, `guard.write_settings`,
  `guard.Rules`, `guard.Connector(sighting_path:)`, `worker.write_brief`,
  `worker.launch_with_tools`, `worker.default_tools`, `worker.drive`,
  `config.for_connector`, `roster.append_notebook`, `roster.usd`,
  `theorist.today`.
- Produces: `pub type Session(summary, guard, dir, identity, problem: String, vantage: Option(String), sighting_path)`, `pub fn run(cfg: config.Config, options: Options) -> Result(Session, String)`, `pub const web_tools = ["WebFetch", "WebSearch"]`.

- [ ] **Step 1: Make five more theorist functions reusable**

Another pure refactor: no test added, the suite's total is unchanged. In
`harness/src/harness/theorist.gleam`:

(a) Add `pub` to `ensure_identity`'s signature, line 194 (no other change
— the function hardcodes nothing role-specific):

```gleam
pub fn ensure_identity(
```

(b) Add `pub` to `document_size`, line 879 (no other change):

```gleam
pub fn document_size(path: String) -> Option(Int) {
```

(c) Add `pub` to `ceilings`, line 985 (no other change):

```gleam
pub fn ceilings(cfg: config.Config) -> String {
```

(d) Replace `end_word`, lines 945-957, with:

```gleam
/// How the session ended, in a word, for the notebook heading. A ceiling
/// gets a second word saying which, because a session reading its own
/// heading next time should know whether it ran out of money or of things
/// to say. `finished_word` is what `Finished` becomes when the document
/// exists (`"attacked"`, `"sighted"`) — the one thing that varies by role.
pub fn end_word(end: worker.End, size: Option(Int), finished_word: String) -> String {
  case end, size {
    worker.Finished, Some(_) -> finished_word
    worker.Finished, None -> "abandoned"
    worker.Abandoned, _ -> "abandoned"
    worker.TimedOut, _ -> "timed_out"
    worker.BudgetExhausted(worker.Turns), _ -> "budget_exhausted: turns"
    worker.BudgetExhausted(worker.Dollars), _ -> "budget_exhausted: dollars"
    worker.BudgetExhausted(worker.Rounds), _ -> "budget_exhausted: rounds"
    worker.BudgetExhausted(worker.Unknown(_)), _ -> "budget_exhausted: cli"
    worker.RateLimited, _ -> "rate_limited"
  }
}
```

(e) In `write_channels`, replace line 854:

```gleam
            <> end_word(ending.end, size)
```

with:

```gleam
            <> end_word(ending.end, size, "attacked")
```

(f) Replace `ended_words`, lines 966-982, with:

```gleam
/// How the session ended, for the summary. `Finished` is the role's claim
/// that its document is written, and it is believed exactly as far as the
/// file on disk supports it: with no document there the line says
/// abandoned, because a report about a file that does not exist is not a
/// report about the topic. A ceiling is named with its value from the
/// config the session ran under. `role_word` (`"theorist"`, `"connector"`)
/// and `doc_word` (`"attack"`, `"sighting"`) are the only two things that
/// vary by role.
pub fn ended_words(
  cfg: config.Config,
  end: worker.End,
  size: Option(Int),
  role_word: String,
  doc_word: String,
) -> String {
  case end, size {
    worker.Finished, Some(_) ->
      "finished — the "
      <> role_word
      <> " reported its "
      <> doc_word
      <> " written; that is its claim about the document, and a captain's reading is the only adjudication"
    worker.Finished, None ->
      "abandoned — the "
      <> role_word
      <> " reported its "
      <> doc_word
      <> " written, but no document exists at the "
      <> doc_word
      <> " path, so the claim is recorded as abandoned"
    worker.Abandoned, _ -> "abandoned by the " <> role_word
    worker.TimedOut, _ -> "timed out"
    worker.BudgetExhausted(ceiling), _ ->
      "stopped at " <> worker.ceiling_words(cfg, ceiling)
    worker.RateLimited, _ -> "rate limited"
  }
}
```

(g) In `summary`, replace line 926:

```gleam
      "ended     " <> ended_words(cfg, ending.end, size),
```

with:

```gleam
      "ended     " <> ended_words(cfg, ending.end, size, "theorist", "attack"),
```

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: the announced total is exactly what it was after Task 6's Step 2
(no test added or removed); `<total> passed, no failures`; every theorist
summary/notebook assertion still holds, because `"attacked"` and
`"theorist"`/`"attack"` are exactly what these call sites hardcoded before.

- [ ] **Step 2: Commit the theorist change alone**

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add harness/src/harness/theorist.gleam
git commit -m "Keel: five more theorist functions made pub, two parameterised, for the connector to reuse

ensure_identity, document_size and ceilings hardcoded nothing and were
only private. end_word and ended_words hardcode the finished word and
the role/document words; the theorist's own call sites (write_channels,
summary) now pass 'attacked' / 'theorist' / 'attack' explicitly, which
is what they meant all along. No behaviour change: same suite total,
same summary text."
```

- [ ] **Step 3: Write the failing tests for `connector.run`**

Append to `harness/test/connector_test.gleam` (the helpers first, then the
tests):

```gleam
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
  put(f, "docs/connector-brief.md", "# The connector's task\n\nfixture task text")
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
  assert string.contains(events, "\"problem\":\"" <> theorist.frontier_wall <> "\"")
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
  assert string.contains(session.summary, "problem    " <> theorist.frontier_wall)
  assert string.contains(session.summary, "vantage    ergodic theory")
  assert string.contains(session.summary, "sighting   " <> sighting)
  assert string.contains(session.summary, "document   exists, 22 bytes")
  assert string.contains(session.summary, "ended      finished")
  assert !string.contains(session.summary, "proved")
  assert string.contains(session.summary, "Attack from automatic sequences next")
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
  assert string.starts_with(notebook, "# Minted\n\nI am Minted, a scripted opening.")
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
    connector.numbered_sighting_path(repo, theorist.today(), "ergodic theory", 2)
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
  let assert Ok(_) = simplifile.create_directory_all(repo <> "/docs/connections")
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
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: compile error — `connector.run`, `connector.Session` do not exist.

- [ ] **Step 5: Write the minimal implementation**

Append to `harness/src/harness/connector.gleam` (add
`import gleam/int`, `import gleam/io`, `import gleam/json`,
`import harness/guard`, `import harness/lock`, `import harness/log` to the
import block at the top of the file — no `gleam/float`: `theorist.ceilings`
carries the one `float.to_string` this module would otherwise have needed):

```gleam
// --- the session ----------------------------------------------------------------

/// The two tools a connector has that no other role does, added to
/// `worker.default_tools` on its command line. Granted here and fenced in
/// the guard (`guard.decide_web`): the CLI refuses a tool that is not on
/// its allowlist before any hook fires, so this list is where the grant
/// lives and the guard is where its limits do.
pub const web_tools = ["WebFetch", "WebSearch"]

/// What one connector session left behind: the summary a captain reads,
/// the guard it ran under, its record directory, who ran it, the problem,
/// the vantage and the sighting path it was fenced to. Not `theorist.Session`:
/// `problem`/`vantage`/`sighting_path` would lie under `topic`/`attack_path`'s
/// names.
pub type Session {
  Session(
    summary: String,
    guard: guard.Guard,
    dir: String,
    identity: roster.Identity,
    problem: String,
    vantage: Option(String),
    sighting_path: String,
  )
}

/// Start one connector session, wait for it to end, then look at what it
/// left. The order mirrors `theorist.run`'s, because the contract is the
/// same contract: the problem and who runs are settled before anything is
/// written, so a bad `--as` costs nothing; then the sighting path, chosen
/// once as the first free `<date>-<slug>[-n].md`; then the record
/// directory, the guard and its settings — fenced to that path; then the
/// ceremony if a persona is being minted (`theorist.ensure_identity`); then
/// the brief (no brief, no session) and the session, launched with the two
/// web tools on its allowlist — and only once the session is closed, the
/// notebook and journal from its report and the look at the file it was
/// fenced to write. A session that reported `sighted` with no document on
/// disk is recorded as abandoned, whatever it claimed.
pub fn run(cfg: config.Config, options: Options) -> Result(Session, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  use wall <- result.try(problem(d))
  use roster_ <- result.try(roster.load(cfg.roster_path))
  use who_ <- result.try(who(roster_, options.persona))
  let sighting =
    free_sighting_path(
      cfg.repo_root,
      theorist.today(),
      named_for(wall.id, options.vantage),
    )
  use run_log <- result.try(log.open(cfg.runs_root, log.new_run_id()))
  use l <- result.try(log.open(run_log.dir, session_name))
  use lock_actor <- result.try(
    lock.start(240_000)
    |> result.map_error(fn(e) {
      "could not start the build lock: " <> string.inspect(e)
    }),
  )
  use g <- result.try(guard.start(
    guard.Rules(
      repo_root: cfg.repo_root,
      role: guard.Connector(sighting_path: sighting),
      holder: session_name,
    ),
    lock_actor,
    l,
    options.port,
  ))
  use _ <- result.try(guard.write_settings(g, g.settings_path))
  use identity <- result.try(theorist.ensure_identity(
    cfg,
    roster_,
    who_,
    options.model,
    g,
    l,
  ))
  use brief_text <- result.try(brief(
    cfg,
    identity,
    wall,
    options.vantage,
    sighting,
  ))
  use brief_path <- result.try(worker.write_brief(l, session_name, brief_text))
  // The connector's ceilings, not the prover's: `worker.launch_with_tools`
  // reads `max_turns` and `max_budget_usd` from whatever config it is handed.
  let session_cfg = config.for_connector(cfg)
  log.event(l, "dispatch", [
    #("role", json.string("connector")),
    #("identity", json.string(identity.name)),
    #("model", json.string(options.model)),
    #("port", json.int(options.port)),
    #("problem", json.string(wall.id)),
    #("vantage", json.string(option.unwrap(options.vantage, ""))),
    #("sighting", json.string(sighting)),
    #("max_turns", json.int(session_cfg.max_turns)),
    #("max_budget_usd", json.float(session_cfg.max_budget_usd)),
    #("log", json.string(l.dir)),
  ])

  let #(tally, ending) =
    worker.drive(
      session_cfg,
      l,
      worker.launch_with_tools(
        session_cfg,
        options.model,
        g,
        brief_path,
        report_schema(),
        list.append(worker.default_tools, web_tools),
      ),
      task_message(wall.id, options.vantage, sighting),
      role(),
    )

  let size = theorist.document_size(sighting)
  write_channels(
    cfg,
    run_log,
    identity,
    wall.id,
    options.vantage,
    options.model,
    ending,
    size,
  )
  let summary_text =
    summary(
      options,
      session_cfg,
      identity,
      wall.id,
      sighting,
      l,
      tally,
      ending,
      size,
    )
  log.summary(run_log, summary_text)
  Ok(Session(
    summary: summary_text,
    guard: g,
    dir: l.dir,
    identity:,
    problem: wall.id,
    vantage: options.vantage,
    sighting_path: sighting,
  ))
}

/// The connector's two channels, each written from the report exactly as
/// the connector wrote it: the notebook under `agents/<Name>.md`, headed
/// with the time, the problem, the vantage, the model and how the session
/// ended; and the journal under the run. A failed notebook write is
/// printed, not fatal — the session happened and its summary must still be
/// written. Not reused from `theorist.write_channels`: the heading text
/// carries the vantage, which a theorist's has no field for, and the two
/// functions close over their own `Report` type.
fn write_channels(
  cfg: config.Config,
  run_log: log.Log,
  identity: roster.Identity,
  problem_id: String,
  vantage: Option(String),
  model: String,
  ending: worker.Ending(Report),
  size: Option(Int),
) -> Nil {
  case ending.report {
    None -> Nil
    Some(r) -> {
      case string.trim(r.notebook) {
        "" -> Nil
        _ -> {
          let heading =
            log.now_iso()
            <> " — "
            <> problem_id
            <> case vantage {
              Some(v) -> " from " <> v
              None -> ""
            }
            <> " ("
            <> model
            <> ", "
            <> theorist.end_word(ending.end, size, "sighted")
            <> ")"
          case
            roster.append_notebook(
              cfg.agents_dir,
              identity,
              heading,
              r.notebook,
            )
          {
            Ok(Nil) -> Nil
            Error(reason) -> io.println_error("harness/connector: " <> reason)
          }
        }
      }
      case string.trim(r.journal) {
        "" -> Nil
        text -> log.journal(run_log, identity.name, session_name, text)
      }
    }
  }
}

/// The summary a captain reads: who ran, the problem, the vantage, where
/// the document is, whether it exists, how the session ended in words that
/// never call a connection proved, the ceilings it ran under, what it cost,
/// and the next vantage the connector named. Not reused from
/// `theorist.summary`: the table has an extra `vantage` line and closes
/// over the connector's own `Report`, but `theorist.ceilings` and
/// `theorist.ended_words` do the two lines that are genuinely shared.
fn summary(
  options: Options,
  cfg: config.Config,
  identity: roster.Identity,
  problem_id: String,
  sighting: String,
  l: log.Log,
  tally: worker.Tally,
  ending: worker.Ending(Report),
  size: Option(Int),
) -> String {
  let next_vantage = case ending.report {
    Some(r) ->
      case string.trim(r.next_vantage) {
        "" -> "(no next vantage reported)"
        text -> text
      }
    None -> "(no report, so no next vantage)"
  }
  string.join(
    [
      "",
      "connector  " <> identity.name,
      "model      " <> options.model,
      "problem    " <> problem_id,
      "vantage    "
        <> case options.vantage {
        Some(v) -> v
        None -> "(none given; the connector chose its own, see section 1)"
      },
      "sighting   " <> sighting,
      "document   "
        <> case size {
        Some(bytes) -> "exists, " <> int.to_string(bytes) <> " bytes"
        None -> "MISSING — nothing is at that path"
      },
      "ended      "
        <> theorist.ended_words(cfg, ending.end, size, "connector", "sighting"),
      "ceilings   " <> theorist.ceilings(cfg),
      "cost       $" <> roster.usd(tally.cost_usd),
      "turns      " <> int.to_string(tally.turns),
      "session    " <> tally.session_id,
      "log        " <> l.dir,
      "",
      ending.notes,
      "",
      "next vantage, in the connector's words:",
      next_vantage,
    ],
    "\n",
  )
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: announced total = previous + 5; `<total> passed, no failures`;
passed equals the announced total. The five session tests each take a few
seconds (a fake shim process and a guard on a free port each).

- [ ] **Step 7: Commit**

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add harness/src/harness/connector.gleam harness/test/connector_test.gleam
git commit -m "Keel: connector.run — the connector-1 record, the web tools on the allowlist, the summary

Problem settled from the board, who from the roster (theorist.who), the
sighting path chosen once as the first free <date>-<slug>[-n].md, a
Connector guard on the given port, the ceremony via
theorist.ensure_identity if minting, then worker.drive under the
connector ceilings; notebook and journal from the report; a sighted
claim with no file on disk recorded as abandoned. Session, run,
write_channels and summary are this module's own; ceilings and
ended_words are theorist's, parameterised."
```

---

### Task 8: The `connect` CLI arm, the usage string, and the writers inventory

**Files:**
- Modify: `harness/src/harness.gleam` (imports line 26; the `case` arms after line 111; usage line 114; new fn after `theorist_session` line 136)
- Modify: `harness/src/harness/writes.gleam` (line 80, the `agents/<Name>.md` risk)
- Test: `harness/test/harness_test.gleam` (append)

**Interfaces:**
- Consumes: `connector.parse_flags`, `connector.run`, `connector.Options`, `connector.default_port`, `print_outcome` (private, existing).
- Produces: `["connect", ..flags]` arm; `pub fn usage() -> String` (extracted so the test can read it without running `main`).

- [ ] **Step 1: Write the failing test**

Append to `harness/test/harness_test.gleam` (add `import gleam/string` at the top):

```gleam
/// The usage line names every verb a captain can type, `connect` among
/// them, in the shape the spec gives it.
pub fn usage_names_the_connect_verb_test() {
  assert string.contains(
    harness.usage(),
    "connect [<vantage>] [--as <Name>] [--model M]",
  )
  assert string.contains(
    harness.usage(),
    "theorise [<topic>] [--as <Name>] [--model M]",
  )
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: compile error — `harness.usage` does not exist.

- [ ] **Step 3: Write the minimal implementation**

In `harness/src/harness.gleam`:

(a) add `import harness/connector` after `import harness/config` (line 18), keeping imports alphabetical.

(b) after the `theorise` arm (line 111) and before the `_ ->` arm, add:

```gleam
    // `connect` starts one connector session — hand-started, never by the
    // scheduler — on the P1 frontier from a vantage, or from one the
    // connector chooses when none is given, as the named connector or the
    // eldest one (minting one when the roster has none), and reports where
    // its sighting document is once it ends.
    ["connect", ..flags] ->
      print_outcome(
        connector.parse_flags(flags)
        |> result.try(fn(parsed) { connector_session(cfg, parsed) }),
      )
```

(c) replace the `_ -> io.println("usage: ...")` arm with `_ -> io.println(usage())` and add, after `run`:

```gleam
/// What `gleam run --` prints for an argument list it does not recognise:
/// every verb, in the shape a captain types it.
pub fn usage() -> String {
  "usage: gleam run -- status | prove-one <node-id> | run [--max-attempts N] [--concurrency K] | reopen <node-id> | bugs [--area A] [--severity S] [--all] | bugs file <path-to-row.json> | bugs claim <id> --as <Identity> [--session <ref>] | bugs reopen <id> | bugs close <id> fixed|wontfix --resolution <text> | writes | index | seed [--model M] [--region R] | seed brief [--region R] | seed check [path] | theorise [<topic>] [--as <Name>] [--model M] | connect [<vantage>] [--as <Name>] [--model M] | spike"
}
```

(d) after `theorist_session` (line 136) add:

```gleam
/// One connector session on the parsed flags' model, vantage and persona,
/// on the connector's own guard port; the summary it returns names who
/// ran, the sighting document and whether it exists.
fn connector_session(
  cfg: config.Config,
  flags: connector.Flags,
) -> Result(String, String) {
  connector.run(
    cfg,
    connector.Options(
      model: flags.model,
      port: connector.default_port(cfg),
      vantage: flags.vantage,
      persona: flags.persona,
    ),
  )
  |> result.map(fn(session) { session.summary })
}
```

(e) In `harness/src/harness/writes.gleam` line 80 change the risk to:

```gleam
      risk: "the dispatcher appends a notebook entry from a worker's report, `theorise` from a theorist's and `connect` from a connector's; an identity's notebook is not exclusively its own during a run",
```

`docs/connections/<file>` is written by the session, not the harness, exactly as `docs/attacks/` is, so it is not an entry in `declared`; and `connector.gleam` makes no raw `simplifile` write (`file_info` is a read), so `the_real_source_has_no_undeclared_writers_test` stays green without adding it to `implementations`.

- [ ] **Step 4: Run the tests to verify they pass, then try the verb's refusal path by hand**

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam test`
Expected: announced total = previous + 1; `<total> passed, no failures`; passed equals the announced total.

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam run -- connect --modle opus`
Expected: `harness: connect does not take `--modle`: connect [<vantage>] [--as <Name>] [--model M]` on stderr and no session started (no new directory under `runs/`). Do NOT run `gleam run -- connect` with valid flags: that starts a real session on the subscription.

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector/harness && gleam run -- writes`
Expected: the `agents/<Name>.md` block lists `roster.append_notebook` call sites in `harness/connector.gleam` as well as `harness/theorist.gleam`, and the tail reads `No undeclared writers`.

- [ ] **Step 5: Commit**

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add harness/src/harness.gleam harness/src/harness/writes.gleam harness/test/harness_test.gleam
git commit -m "Keel: the connect verb

connect [<vantage>] [--as <Name>] [--model M], shaped as theorise is, on
the connector's port; the writers inventory names connect as a
notebook writer."
```

---

### Task 9: Glossary rows

**Files:**
- Modify: `docs/glossary.md` (the Vocabulary table, append after line 61, the `wall` row)

**Interfaces:** none (prose). The teaching contract invites every identity to add rows unasked.

- [ ] **Step 1: Read the table's last three rows** (`docs/glossary.md` lines 59-61) so the new rows match their voice: Lean thing named, TypeScript anchor, then the seam.

- [ ] **Step 2: Append four rows** directly after line 61:

```markdown
| connector (session kind) | A second kind of hand-started agent beside the theorist, like a second `bin` script in the same package sharing the same libraries: `connect` reuses the theorist's slug, date and default problem, the prover's turn loop and the roster's naming ceremony, and differs in its brief (thin: six inputs), its fence (`docs/connections/`, no obstructions file, the web read-only) and its report (`sighted`, `next_vantage`) | It is the one role whose `--allowedTools` differs from the others' — `WebFetch` and `WebSearch` are granted on the command line, not in the guard — so "the guard bounds what a worker may do" has a seam here: the CLI refuses the two tools to every other role before any hook fires, and the guard only ever sees a connector's calls to them. |
| sighting | The connector's one deliverable, a document with six fixed sections; think of a design review written by an outsider to the codebase — same template every time so several can be read side by side | Nothing in it is checked by a machine. `connector.run` reports whether the file exists and how big it is, and that is all; a sighting's claims reach the board only through a captain, a theorist's falsification and the seed check, the way a design review reaches `main` only through someone writing the code. |
| vantage | The optional argument to `connect`: a field to attack the problem from ("ergodic theory and damage spreading"). It names the file (`<date>-<slug(vantage)>.md`) the way a branch name names a worktree | It never changes the problem. The problem is always the P1 frontier wall as the board has it (`theorist.default_topic`), and a captain who wants a different wall names it *inside* the vantage text; with no vantage the file is named for the problem and the connector chooses a field itself. |
| dictionary (in a sighting) | A table mapping this project's objects to another field's, row by row — the row of cells, the picture, the centre column, the left diagonals, the seam, the damage front — ending with the rows where the correspondence breaks. An adapter interface between two libraries, written out method by method, with the methods that have no counterpart listed too | A resemblance is not a dictionary. The brief's rule is that a connection without a table cannot be tested and is not a connection; the seams are the deliverable as much as the matches, because a seam is what a theorist attacks first. |
```

- [ ] **Step 3: Check the table still renders** — every new row has exactly three `|`-separated cells and no unescaped `|` inside a cell (the rows above use none).

Run: `cd C:/Users/dibuj/dev/rule30-keel-connector && grep -c "^| " docs/glossary.md`
Expected: the count printed is four more than it was before the edit (count before the edit first: it is the number of rows in the Vocabulary table plus its header row).

- [ ] **Step 4: Commit**

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add docs/glossary.md
git commit -m "Keel: glossary rows for connector, sighting, vantage and dictionary"
```

---

### Task 10: The `connect` line in CLAUDE.md — ASK DIB FIRST, do not execute without his yes

**Files:**
- Modify: `CLAUDE.md` (the "Running the harness" block, after line 380)

`CLAUDE.md` is outside what a framework agent may change unasked. Before this task, tell Dib the exact line below and wait for a yes. Every other task in this plan is independent of this one; if the answer is no or slow, the branch lands without it.

- [ ] **Step 1: Ask Dib** — quote the two lines to be inserted after line 380 (`# one theorist session on a topic, ...`):

```
cd harness && gleam run -- connect [<vantage>] [--as <Name>] [--model M]
                                                # one connector session on the P1 frontier from a vantage, as a named or minted connect persona; never started by the scheduler; its guard port is the run base + 300, its record runs/<run-id>/connector-1/, its one file docs/connections/<date>-<slug>.md, and it may read the web (every URL logged)
```

- [ ] **Step 2: On a yes, insert them** at that spot, keeping the block's column alignment.

- [ ] **Step 3: Commit**

```
cd C:/Users/dibuj/dev/rule30-keel-connector
git add CLAUDE.md
git commit -m "Keel: CLAUDE.md names the connect verb, with Dib's yes"
```

---

## Self-review

Spec sentences mapped to the task that implements them.

**The session kind**
- "`cd harness && gleam run -- connect [<vantage>] [--as <Name>] [--model M]`, never started by the scheduler" — Task 8 (the arm; nothing in `schedule`/`dispatch` knows the verb); Task 6 (`parse_flags`).
- "Its record is `runs/<run-id>/connector-1/`" — Task 7 (`session_name`, `log.open(run_log.dir, session_name)`; asserted in `connect_starts_one_fenced_session_and_reports_its_document_test`).
- "Its guard port is the run port base plus 300" — Task 6 (`default_port`), Task 8 (passed from the CLI).
- "runs under the theorist's ceilings … unless given its own" — Task 1 (`connector_max_*` default to the theorist's resolved pair; `HARNESS_CONNECTOR_*` override), Task 7 (`config.for_connector` before launch; asserted through `args.json`).
- **Vantage**: optional; "With none, the connector chooses" — Task 6 (`Options.vantage: Option(String)`, the "Vantage: none given — choose one" brief line, "choosing your own vantage" first message). "The problem is always the current P1 frontier, as the theorist's default is" — Task 6 (`problem` = `theorist.default_topic`). "a captain may name a different wall as the problem inside the vantage text" — nothing to implement; the vantage is carried verbatim into the brief.

**Fence**
- "Write access to exactly one new file, `docs/connections/<date>-<slug(vantage)>.md`, instead of `docs/attacks/`" — Task 3 (`Connector(sighting_path)`; attack directory denied), Task 6 (`sighting_path`).
- "a second sighting on one vantage in a day gets `-2.md`" — Task 6 (`free_sighting_path`), Task 7 (`a_second_sighting_on_one_vantage_in_a_day_gets_its_own_file_test`).
- "No append access to `docs/obstructions.md`" — Task 3 (`connector_cannot_write_the_obstructions_file_test`).
- "two more tools, `WebSearch` and `WebFetch`, read-only: GET only, no login, no form, no POST" — Task 4 (`decide_web`: http/https only; `WebFetch` is a GET by construction), Task 5 + Task 7 (on the allowlist for this role only).
- "the guard allows both and records every URL in the attempt's `events.jsonl`, so a citation … can be matched against a fetch that actually happened" — Task 4 (guard row with `attempted` = URL; `web` row with `url`/`query`/`urls`; the PreToolUse matcher widened so the hook fires).
- "Scripts under `explorer/` and `node <script>` as for the theorist; `lake env lean` as for the theorist" — Task 3.

**Brief**
- task text, own notebook, residual paragraph ("the same text the theorist's brief carries"), obstructions, sources, `Rule30/Basic.lean` — Task 6 (`brief`/`render`; the residual is `seed.open_section([problem])`, which is exactly the block the theorist's brief renders for that wall).
- "Not the index, not the proof notes, not the crystals list" — Task 6 (`the_brief_carries_the_six_inputs_and_nothing_else_test` puts all three on disk and asserts their absence).

**Persona**
- region `connect`, minted through the naming ceremony on first use — Task 2 (region wording, "connector" in the prompt), Task 6 (`who`, delegating to `theorist.who(roster_, region, "connector", persona)`), Task 7 (`ensure_identity`, reused from `theorist.gleam` and made `pub` there; `a_connector_is_minted_when_the_roster_has_none_test`).
- "one live session per persona" — captain's restraint, as for the theorist (`who` passes `busy: []`); documented in the module note.
- "notebook `agents/<Name>.md` inlined at render time and written from the report; no other connector's notebook and no theorist's" — Task 6 (`render` calling `theorist.who_you_are`, parameterised by region and role word; the brief test asserts Lodestar's and Vesper's are absent), Task 7 (`write_channels`, this module's own).

**Deliverable**
- "The sighting document, and nothing else … six sections" — Task 6 (the brief's closing section lists the six), Task 7 (`theorist.document_size`, reused and made `pub`; the summary's `document` line; a `sighted` claim with no file is recorded as abandoned).
- "Nothing in it reaches the board directly" — Task 3 (statements, DAG, proposals, crystals all denied).

**Order of work, item 2 (Keel)**
- the `connect` verb — Task 8; the fence with the two web tools and their logging — Tasks 3, 4, 5; the `connect` roster region — Task 2; the `-2.md` collision rule — Task 6/7; the `connector-1` record — Task 7; "tests in the suite's existing shape for the theorist" — `guard_connector_test.gleam` mirrors `guard_theorist_test.gleam`, `connector_test.gleam` mirrors `theorist_test.gleam` (same fixture, fake shim, `ports.span(1)`, `__WRITE__` mid-turn).

**What does not change**
- `guard.decide` for `Prover`, `Seeder` and `Theorist` returns what it did on every input it saw before; the only new input they can see is a `WebFetch`/`WebSearch` hook (now matched), answered `Allow` — and the CLI never lets those roles make the call. `worker.launch` is byte-for-byte the old command line. No scheduler, verifier, report-contract or axiom change.

## Open questions for Rowan

**Resolved by Rowan on 2026-09-07 before execution:** (1) Deny for the other roles — Keel's ruling, Rowan agreed; (2) completion logging required, folded into Task 4 as R2; (3) default name confirmed; (4) and (5) stand as the defaults below. Kept for the record.

Each has a default the plan executes; ask Rowan before Task 4 / Task 6 respectively if there is time, otherwise land the default and say so in the notebook.

1. **Other roles and the web tools.** The spec says web access "is granted to this role only". Today that is true because `worker.launch` omits `WebFetch`/`WebSearch` from `--allowedTools`, and the plan keeps it that way; but the guard's own answer for a prover/seeder/theorist `WebFetch` (which can now reach it, since the matcher names the tools) is `Allow`, preserving the pre-hook behaviour, not `Deny`. **Default: Allow (unchanged prover guard, as "What does not change" requires), logged.** Alternative: `Deny(NotPermitted)` for the three roles, which tightens three guards the spec says do not change.
2. **Logging a fetch's completion.** The plan logs every web call at `PreToolUse` (the attempt). Registering `WebFetch` under `PostToolUse`/`PostToolUseFailure` too would record whether the fetch *succeeded*, which is closer to "a fetch that actually happened", but changes the `Bash`-only matchers two existing tests pin. **Default: PreToolUse only.**
3. **The file name with no vantage.** The spec gives `<date>-<slug(vantage)>.md` and says nothing for the no-vantage case. **Default: slug of the problem wall's id** (so two vantage-less runs today are `<problem>.md` and `<problem>-2.md`).
4. **The `web` row's shape.** A second row kind (`web`) beside the guard row, rather than new fields on `guard_event.GuardEvent`, because that record's shape is a contract shared with `dispatch.guard_denials`. **Default: the separate row, keys `node`, `tool`, `url`, `query`, `urls`.**
5. **The `named_for` slug source.** `theorist.slug` is reused rather than copied; if Rowan would rather the two modules not depend on each other, move `slug`/`today` into a small shared module — not in this plan.
