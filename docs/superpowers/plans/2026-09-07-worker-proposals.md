# Worker proposals — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give a dispatched prover a channel to hand back a decomposition — proposed sub-lemmas, each a seedable Lean statement — so a failed attempt on a hard node can grow the DAG instead of only escalating the ladder.

**Architecture:** The worker's structured end-of-turn report gains an optional `proposals` array. The decoder reads it the way it reads `bugs`: one entry at a time, a bad entry costs that entry and is named in `discarded`, and nothing in it can cost the turn's outcome. When an attempt ends with proposals, the dispatcher writes them to the attempt directory as `proposals.json` in exactly the seeder's `next.json` shape (so Rowan's landing script and the seeder path are one path), runs the existing `seed.check_file_in` over it, writes the check's report beside it as `proposals-check.txt`, and records both as events in the attempt's `events.jsonl`. A worker still never writes `Rule30/Statements.lean` or `blueprint/dag.json`; the captain lands by hand from the checked file, exactly as for a seeder.

**Tech Stack:** Gleam on the Erlang target, `gleam/dynamic/decode`, `gleam/json`, `simplifile`, gleeunit. Reuses `seed.check_file_in`, `seed.decode_proposals`, `seed.proposal_shape`, `worker.survivors`, `log.event`.

**Bug row:** `a-worker-report-has-no-sub-lemma-section` in `blueprint/bugs.json`, claimed by Fathom (session f3b0fa). Rowan's design answers, 2026-09-07 by message: run `seed check` automatically when the attempt ends; record the outcome as an event in the attempt's `events.jsonl` with the report printed into the attempt directory; keep the file in exactly the `next.json` shape; name it `<attempt-dir>/proposals.json`.

## Global Constraints

- Worktree `C:/Users/dibuj/dev/rule30-fathom-sublemmas`, branch `fathom/sub-lemmas`, branched from `origin/main` at `32c281d`. Every command runs there. The shared checkout is not touched until the landing.
- `gleam test` from the worktree needs no `HARNESS_REPO_ROOT`; tests write only under `harness/build/`, `harness/test/tmp/` or `harness/test/fixture-project/`.
- `gleam format` in `harness/` before every commit. Commit messages prefixed `Fathom: `, ending with the two trailer lines:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HFHRvQpVtAbQBL1dwUTVs2
  ```
  Stage explicit paths only.
- **Nothing a worker writes in `proposals` may cost the turn's proof outcome.** Same promise as `bugs` (`worker.gleam:78-120`): decode per entry, keep survivors, name every drop in `discarded`.
- **The written file is byte-compatible with `seed.decode_proposals`.** Its `proposals` array carries exactly the seeder fields: `id`, `lean_name`, `statement`, `reason`, optional `disclaims`, optional `route {tactics, imports}`, optional `witness {expression, imports, range}`. Provenance (`node`, `identity`, `run`, `attempt`, `filed`) goes in top-level keys beside `proposals`, which `decode.at(["proposals"], ...)` ignores. `seed.proposal_shape()` is the reference for field names.
- **A proposal is not a claim the node is hard.** Nothing here reads the rung or the outcome before writing the file. A `proved` attempt with proposals writes them too.
- **A proposal that restates its own node is refused before the check.** The one mechanical guard: a proposal whose `name` equals the node's `lean_name` is dropped and named in a `proposals_discarded` event. A restatement under another name is what the check's report and Rowan's reading are for; `type_of%`-style comparison is out of scope and said so in the brief text.
- Regions Keel holds and this plan must not touch: `dispatch.gleam` `model_for`, `failed_attempts`, the scheduler ordering, the claim sites; `worker/brief.gleam` `your_constraints` and the cast-cookbook section. This plan touches `brief.gleam`'s `report_schema` and `how_to_report`, `worker.gleam`'s `Report`/decoder, and `dispatch.gleam`'s `write_channels` plus one new private function beside it.
- `CLAUDE.md`'s harness-worker report list and the harness-design spec's report contract are Dib's to change; this plan does not edit them. The final message asks.

---

### Task 1: The report carries proposals

**Files:**
- Modify: `harness/src/harness/worker.gleam` (`Report`, `report_decoder`, new type and decoder beside `ReportedBug`)
- Test: `harness/test/worker_test.gleam` (append)

**Interfaces:**
- Produces:
  ```gleam
  pub type ProposedLemma {
    ProposedLemma(
      name: String,
      statement: String,
      reason: String,
      size: dag.Size,
      disclaims: String,
      route: Option(#(String, List(String))),      // tactics, imports
      witness: Option(#(String, List(String), String)),  // expression, imports, range
    )
  }
  ```
  and `Report` gains `proposals: List(ProposedLemma)` (after `bugs`). `discarded` entries for proposals read `proposals[i]: ...` / `proposals: not an array`, produced by the existing `survivors`.

- [ ] **Step 1: Append the tests**

```gleam
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
```

Check the test module's imports (`gleam/json`, `gleam/dynamic/decode`, `gleam/option.{None, Some}`, `gleam/string`, `harness/dag`) and add what is missing. Every existing constructor call `worker.Report(...)` in the test files (`grep -n "Report(" harness/test/*.gleam`) must gain `proposals: []`.

- [ ] **Step 2: Run the tests to see them fail**

Run: `cd harness && gleam test 2>&1 | tail -20`
Expected: compile error, `Report` has no field `proposals`.

- [ ] **Step 3: Implement**

In `worker.gleam`, beside `ReportedBug`:

```gleam
/// One sub-lemma a worker proposes, exactly as it would be seeded: the
/// statement is the full `theorem <name> ... := by\n  sorry` text. `reason`
/// is required, as it is for a seeder's proposal — a proposal without one is
/// not a proposal. `route` and `witness` are the seeder's optional claims,
/// passed through untouched so `seed check` can adjudicate them; a worker in
/// a Lean session can supply both, and one that supplies neither gets the
/// verdict "none claimed / no witness supplied", which is a report and not a
/// pass.
pub type ProposedLemma {
  ProposedLemma(
    name: String,
    statement: String,
    reason: String,
    size: dag.Size,
    disclaims: String,
    route: Option(#(String, List(String))),
    witness: Option(#(String, List(String), String)),
  )
}
```

`Report` gains `proposals: List(ProposedLemma)`. In `report_decoder`, after `bugs`:

```gleam
  use raw_proposals <- decode.optional_field(
    "proposals",
    Ok([]),
    dynamic_list(),
  )
  let #(proposals, dropped_proposals) =
    survivors("proposals", raw_proposals, proposed_lemma_decoder())
```

and `discarded: list.append(discarded, dropped_proposals)`. The decoder:

```gleam
fn proposed_lemma_decoder() -> decode.Decoder(ProposedLemma) {
  use name <- decode.field("name", decode.string)
  use statement <- decode.field("statement", decode.string)
  use reason <- decode.field("reason", decode.string)
  use size <- decode.optional_field("size", dag.M, size_decoder())
  use disclaims <- decode.optional_field("disclaims", "", decode.string)
  use route <- decode.optional_field("route", None, {
    use tactics <- decode.field("tactics", decode.string)
    use imports <- decode.optional_field("imports", [], decode.list(decode.string))
    decode.success(Some(#(tactics, imports)))
  })
  use witness <- decode.optional_field("witness", None, {
    use expression <- decode.field("expression", decode.string)
    use imports <- decode.optional_field("imports", [], decode.list(decode.string))
    use range <- decode.field("range", decode.string)
    decode.success(Some(#(expression, imports, range)))
  })
  decode.success(ProposedLemma(
    name:,
    statement:,
    reason:,
    size:,
    disclaims:,
    route:,
    witness:,
  ))
}
```

Update the `Report` doc comment: `proposals` is the worker's decomposition, optional, and — like `bugs` — never able to cost the outcome. Fix every `Report(` constructor in `src/` and `test/`.

- [ ] **Step 4: Run the tests to see them pass**

Run: `cd harness && gleam test 2>&1 | tail -20`
Expected: all pass; announced total up by 4; passed equals announced.

- [ ] **Step 5: Format and commit**

```bash
cd harness && gleam format
git add harness/src/harness/worker.gleam harness/test/worker_test.gleam <any other test file whose Report( call changed> docs/superpowers/plans/2026-09-07-worker-proposals.md
git commit -m "Fathom: the worker report carries proposed sub-lemmas (branched from 32c281d)"
```

---

### Task 2: The schema offers proposals and the brief says what they are for

**Files:**
- Modify: `harness/src/harness/worker/brief.gleam` (`report_schema`, `how_to_report`)
- Test: `harness/test/worker_test.gleam` (append)

**Interfaces:**
- Consumes: nothing from Task 1 (the schema is JSON text).
- Produces: the schema's `proposals` property; the brief paragraph. Task 3's brief text for the check refers to `proposals.json`.

- [ ] **Step 1: Append the tests**

```gleam
pub fn schema_offers_proposals_without_requiring_them_test() {
  let schema = brief.report_schema()
  assert string.contains(schema, "\"proposals\"")
  assert string.contains(schema, "\"required\":[\"name\",\"statement\",\"reason\"]")
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
}
```

`how_to_report` is private today; expose the text through a `pub fn how_to_report_text() -> String` that returns it (one line), so the brief's wording is testable the way the seeder's is. Confirm `report_schema_is_valid_json_with_the_agreed_shape_test` (`worker_test.gleam:58`) still passes; read it and extend its shape assertion if it enumerates properties.

- [ ] **Step 2: Run to see them fail**

Run: `cd harness && gleam test 2>&1 | tail -20`
Expected: `the_brief_explains_proposals_test` fails to compile (no `how_to_report_text`), then the schema test fails on the missing property.

- [ ] **Step 3: Implement**

In `report_schema`, after the `bugs` property:

```gleam
        #(
          "proposals",
          json.object([
            #("type", json.string("array")),
            #(
              "items",
              json.object([
                #("type", json.string("object")),
                #(
                  "properties",
                  json.object([
                    #("name", string_field("the theorem's Lean name, snake_case, unique on the board")),
                    #("statement", string_field("the full declaration exactly as it would be seeded: `theorem <name> ... := by\\n  sorry`, in the vocabulary of Rule30.Basic")),
                    #("reason", string_field("one sentence on why a proof of THIS node would cite it")),
                    #(
                      "size",
                      json.object([
                        #("type", json.string("string")),
                        #("enum", json.array(["S", "M", "L"], json.string)),
                      ]),
                    ),
                    #("disclaims", string_field("what this does NOT prove; omit when nothing")),
                    #(
                      "route",
                      json.object([
                        #("type", json.string("object")),
                        #("properties", json.object([
                          #("tactics", string_field("a tactic script that closes the statement, if you have one")),
                          #("imports", json.object([#("type", json.string("array")), #("items", json.object([#("type", json.string("string"))]))])),
                        ])),
                        #("required", json.array(["tactics"], json.string)),
                      ]),
                    ),
                    #(
                      "witness",
                      json.object([
                        #("type", json.string("object")),
                        #("properties", json.object([
                          #("expression", string_field("a Bool-valued Lean expression over the range that names the statement's own terms")),
                          #("range", string_field("the bound to check, e.g. `t < 12`")),
                          #("imports", json.object([#("type", json.string("array")), #("items", json.object([#("type", json.string("string"))]))])),
                        ])),
                        #("required", json.array(["expression", "range"], json.string)),
                      ]),
                    ),
                  ]),
                ),
                #("required", json.array(["name", "statement", "reason"], json.string)),
              ]),
            ),
            #(
              "description",
              json.string("sub-lemmas you would want seeded so this node could be closed; empty until you have one"),
            ),
          ]),
        ),
```

In `how_to_report`, append one paragraph after the bugs paragraph:

```gleam
  <> "\n\n`proposals` is your decomposition. When you can see a lemma that would let this node close but that is not on the board, propose it: a Lean name, the full declaration exactly as it would be seeded (`theorem <name> ... := by` and a `sorry` line, in the vocabulary of `Rule30.Basic` — a seeded statement cannot import a proof file), one sentence on why a proof of this node would cite it, and a size. Add a `route` if you have tactics that close it and a `witness` (a Bool-valued expression over a range that names the statement's own terms) if it can be checked by computation; both are checked by the harness after your attempt ends and reported to the captain, who lands what survives. A proposal is not a claim that the node is hard, and it is weighed by the check and not by which model made it — propose from any rung. A proposal that restates this node under another name, or weakens it, is the one thing the check cannot catch and the captain will; do not send one. Leave the array empty when you have nothing to propose."
```

- [ ] **Step 4: Run to see them pass**

Run: `cd harness && gleam test 2>&1 | tail -20`
Expected: all pass; announced up by 2; passed equals announced.

- [ ] **Step 5: Format and commit**

```bash
cd harness && gleam format
git add harness/src/harness/worker/brief.gleam harness/test/worker_test.gleam
git commit -m "Fathom: the report schema offers proposals and the brief says what they are for"
```

---

### Task 3: The dispatcher writes the file, runs the check, and records both

**Files:**
- Modify: `harness/src/harness/dispatch.gleam` (`write_channels` and its two callers; one new private function `write_proposals`)
- Test: `harness/test/dispatch_test.gleam` (append)

**Interfaces:**
- Consumes: `worker.Report.proposals`, `worker.ProposedLemma`; `seed.check_file_in(repo_root, path) -> Result(String, String)`; `seed.decode_proposals(text)` (used by the test to prove byte-compatibility); `log.Log(dir:, run_id:)`, `log.event`, `log.now_iso`.
- Produces: `<attempt-dir>/proposals.json`, `<attempt-dir>/proposals-check.txt`; events `proposals` (`node`, `from`, `file`, `count`), `proposals_discarded` (`node`, `names`), `proposals_checked` (`node`, `file`, `outcome: written | failed`, `reason` on failure).

Where the attempt directory is: `prove_one` has one log `l` that is both run and attempt (`dispatch.gleam:88`); `returned` has `flight.attempt_log` for the attempt and `run_.run_log` for the run. `write_channels` today receives only the run log. It gains a parameter `attempt_log: log.Log`; `prove_one` passes `l` twice, `returned` passes `run_.run_log` and `flight.attempt_log`. The proposals file and its events go to the attempt log.

- [ ] **Step 1: Append the test**

Read `harness/test/dispatch_test.gleam:819-880` first — the `write_index` test and the `events.jsonl` read-back pattern — and follow it. `write_channels` is private; the seam is a new `pub fn write_proposals_for_test`? No: expose the real function as `pub fn write_proposals(cfg, attempt_log, identity, node_id, report) -> Nil` (it is a leaf, has no run state, and `writes.gleam`'s audit will want it named anyway), and call it from `write_channels`.

```gleam
pub fn write_proposals_writes_the_seeder_shape_and_records_the_check_test() {
  let root = "build/test-runs/write-proposals"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/runs")
  let assert Ok(l) = log.open(root <> "/runs", "run-1")
  let cfg = config.Config(..test_config(root), repo_root: root)
  let identity = roster.Identity(name: "Vesper", region: "P1", ..)  // build the way other dispatch tests build one
  let report =
    worker.Report(
      outcome: "abandoned",
      estimate: dag.L,
      notebook: "",
      journal: "",
      bugs: [],
      summary: "",
      discarded: [],
      proposals: [
        worker.ProposedLemma(
          name: "evolve_left_sixth_diagonal",
          statement: "theorem evolve_left_sixth_diagonal (t : ℕ) : evolve (t + 5) (-(t : ℤ)) = false := by\n  sorry",
          reason: "the seventh needs it",
          size: dag.S,
          disclaims: "",
          route: None,
          witness: Some(#("evolve (t + 5) (-(t : ℤ)) = false", [], "t < 12")),
        ),
        // Restates the node under the node's own name: refused, named.
        worker.ProposedLemma(
          name: "evolve_left_seventh_diagonal",
          statement: "theorem evolve_left_seventh_diagonal : True := by\n  sorry",
          reason: "r",
          size: dag.M,
          disclaims: "",
          route: None,
          witness: None,
        ),
      ],
    )
  dispatch.write_proposals(cfg, l, identity, "evolve_left_seventh_diagonal", report)
  let assert Ok(text) = simplifile.read(l.dir <> "/proposals.json")
  // Byte-compatible with the seeder's decoder, and carrying only the survivor.
  let assert Ok([p]) = seed.decode_proposals(text)
  assert p.id == "evolve_left_sixth_diagonal"
  assert p.lean_name == "evolve_left_sixth_diagonal"
  assert p.reason == "the seventh needs it"
  assert p.witness == seed.Claims(seed.Witness(expression: "evolve (t + 5) (-(t : ℤ)) = false", imports: [], range: "t < 12"))
  // Provenance beside the array, which the decoder ignores.
  assert string.contains(text, "\"node\": \"evolve_left_seventh_diagonal\"") || string.contains(text, "\"node\":\"evolve_left_seventh_diagonal\"")
  let assert Ok(events) = simplifile.read(l.dir <> "/events.jsonl")
  assert string.contains(events, "\"kind\":\"proposals\"")
  assert string.contains(events, "\"count\":1")
  assert string.contains(events, "\"kind\":\"proposals_discarded\"")
  assert string.contains(events, "evolve_left_seventh_diagonal")
  // The check ran and failed honestly: this root has no `.lake`, and the
  // failure is an event with a reason, not a crash and not a silence.
  assert string.contains(events, "\"kind\":\"proposals_checked\"")
  assert string.contains(events, "\"outcome\":\"failed\"")
  assert string.contains(events, ".lake")
  assert simplifile.is_file(l.dir <> "/proposals-check.txt") == Ok(False)
}

pub fn write_proposals_with_none_writes_nothing_test() {
  let root = "build/test-runs/write-proposals-none"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/runs")
  let assert Ok(l) = log.open(root <> "/runs", "run-1")
  let cfg = config.Config(..test_config(root), repo_root: root)
  let report = worker.Report(outcome: "proved", estimate: dag.S, notebook: "", journal: "", bugs: [], summary: "", discarded: [], proposals: [])
  dispatch.write_proposals(cfg, l, <identity>, "n", report)
  assert simplifile.is_file(l.dir <> "/proposals.json") == Ok(False)
  let assert Ok(events) = simplifile.read(l.dir <> "/events.jsonl")
  assert !string.contains(events, "proposals")
}
```

`test_config` and the identity constructor: use whatever helper the existing dispatch tests use to build a `config.Config` and a `roster.Identity` (read the top of `dispatch_test.gleam`); the names above are placeholders for those helpers and must be replaced by the real ones. The event key name for the kind field: read `log.event`'s JSON (`log.gleam`) and match the actual key.

A third, cheaper assertion about a successful check is possible against `harness/test/fixture-project/` (it has a built `.lake` after `lean_fixture.built()`): write a proposal for `harness_probe`-style statement with no route and no witness and assert `proposals-check.txt` exists and contains `none claimed` and `no witness supplied`. Add it as `write_proposals_records_a_check_that_ran_test` using `lean_fixture.built()` as `repo_root`, writing the attempt log under `build/test-runs/`. If `seed.check_file_in` writes scratch files under `repo_root/harness/build/checks/seed`, that lands inside the fixture project and is gitignored there (`lean_fixture.gleam` header); confirm with `git status` after the run and say so in the report.

- [ ] **Step 2: Run to see them fail**

Run: `cd harness && gleam test 2>&1 | tail -20`
Expected: compile error, no `dispatch.write_proposals`.

- [ ] **Step 3: Implement**

In `dispatch.gleam`, beside `file_reported_bugs`:

```gleam
/// Where a worker's proposed sub-lemmas go, relative to the attempt
/// directory: the seeder's `next.json` shape under a name that cannot be
/// mistaken for the seeder's, so Rowan's landing script and the seeder path
/// are one path. The check's report sits beside it.
pub const proposals_file = "proposals.json"

pub const proposals_check_file = "proposals-check.txt"

/// A worker's proposed sub-lemmas: written to the attempt directory in the
/// seeder's shape, checked by `seed.check_file_in` exactly as a seeder's
/// would be, and both steps recorded as events in the attempt's
/// `events.jsonl`. A proposal file nobody has checked is a hope; the check
/// is what makes a failed attempt's output usable by the DAG.
///
/// Nothing here reads the rung or the outcome: a `proved` attempt with
/// proposals writes them too, and a proposal is weighed by the check, not by
/// which model made it.
///
/// One guard before the check, the only mechanical one: a proposal whose
/// name is the node's own is a restatement and is dropped, named in a
/// `proposals_discarded` event. A restatement under another name is what the
/// check's report and the captain's reading are for.
///
/// The check's failure to RUN (no `.lake` under `repo_root`, an unwritable
/// file) is an event with a reason, never a crash: the attempt's record is
/// already written and a derived artifact does not get to suppress it.
pub fn write_proposals(
  cfg: config.Config,
  attempt_log: log.Log,
  identity: roster.Identity,
  node_id: String,
  report: worker.Report,
) -> Nil {
  case report.proposals {
    [] -> Nil
    proposals -> {
      let #(restating, kept) =
        list.partition(proposals, fn(p) { p.name == node_id })
      case restating {
        [] -> Nil
        rs ->
          log.event(attempt_log, "proposals_discarded", [
            #("node", json.string(node_id)),
            #("reason", json.string("restates the node under its own name")),
            #("names", json.array(list.map(rs, fn(p) { p.name }), json.string)),
          ])
      }
      case kept {
        [] -> Nil
        kept -> {
          let path = attempt_log.dir <> "/" <> proposals_file
          let text = proposals_json(node_id, identity, attempt_log, kept)
          log.event(attempt_log, "proposals", [
            #("node", json.string(node_id)),
            #("from", json.string(identity.name)),
            #("file", json.string(path)),
            #("count", json.int(list.length(kept))),
          ])
          case simplifile.write(path, text) {
            Error(e) ->
              log.event(attempt_log, "proposals_checked", [
                #("node", json.string(node_id)),
                #("outcome", json.string("failed")),
                #("reason", json.string("could not write " <> path <> ": " <> simplifile.describe_error(e))),
              ])
            Ok(Nil) -> check_proposals(cfg, attempt_log, node_id, path)
          }
        }
      }
    }
  }
}

fn check_proposals(cfg: config.Config, attempt_log: log.Log, node_id: String, path: String) -> Nil {
  let out = attempt_log.dir <> "/" <> proposals_check_file
  case seed.check_file_in(cfg.repo_root, path) {
    Error(reason) ->
      log.event(attempt_log, "proposals_checked", [
        #("node", json.string(node_id)),
        #("outcome", json.string("failed")),
        #("reason", json.string(reason)),
      ])
    Ok(report_text) ->
      case simplifile.write(out, report_text) {
        Ok(Nil) ->
          log.event(attempt_log, "proposals_checked", [
            #("node", json.string(node_id)),
            #("outcome", json.string("written")),
            #("file", json.string(out)),
          ])
        Error(e) ->
          log.event(attempt_log, "proposals_checked", [
            #("node", json.string(node_id)),
            #("outcome", json.string("failed")),
            #("reason", json.string("could not write " <> out <> ": " <> simplifile.describe_error(e))),
          ])
      }
  }
}

/// The seeder's `next.json` shape, with provenance beside the array. The
/// array's fields are exactly `seed.proposal_shape`'s so `seed.decode_proposals`
/// reads this file unchanged; the top-level keys beside `proposals` are
/// ignored by that decoder and are for the captain.
fn proposals_json(
  node_id: String,
  identity: roster.Identity,
  attempt_log: log.Log,
  proposals: List(worker.ProposedLemma),
) -> String {
  let entry = fn(p: worker.ProposedLemma) {
    let base = [
      #("id", json.string(p.name)),
      #("lean_name", json.string(p.name)),
      #("statement", json.string(p.statement)),
      #("reason", json.string(p.reason)),
      #("size", json.string(dag.size_to_string(p.size))),
    ]
    let disclaims = case p.disclaims {
      "" -> []
      d -> [#("disclaims", json.string(d))]
    }
    let route = case p.route {
      None -> []
      Some(#(tactics, imports)) -> [
        #("route", json.object([
          #("tactics", json.string(tactics)),
          #("imports", json.array(imports, json.string)),
        ])),
      ]
    }
    let witness = case p.witness {
      None -> []
      Some(#(expression, imports, range)) -> [
        #("witness", json.object([
          #("expression", json.string(expression)),
          #("imports", json.array(imports, json.string)),
          #("range", json.string(range)),
        ])),
      ]
    }
    json.object(list.flatten([base, disclaims, route, witness]))
  }
  json.object([
    #("node", json.string(node_id)),
    #("identity", json.string(identity.name)),
    #("run", json.string(attempt_log.run_id)),
    #("attempt_dir", json.string(attempt_log.dir)),
    #("filed", json.string(log.now_iso())),
    #("proposals", json.array(proposals, entry)),
  ])
  |> json.to_string
}
```

`size` is an extra field inside the array entry; `seed.proposal_decoder` ignores unknown fields (confirm by reading it — `decode.field` on named keys only). If it does not, drop `size` into the top-level provenance as a parallel array instead, and say so.

`write_channels` gains `attempt_log: log.Log` as its second log parameter and calls `write_proposals(cfg, attempt_log, identity, node_id, r)` after `file_reported_bugs`. Update the doc comment on `write_channels` ("notebook, journal, bugs, proposals"). Callers: `prove_one` (`dispatch.gleam:~142`) passes `l, l`; `returned` (`:~606`) passes `run_.run_log, flight.attempt_log`. Add `import harness/seed` if absent.

`writes.gleam`'s audit will flag the new raw `simplifile.write` calls in `dispatch.gleam` if that module is already a declared implementation with an enumerated writer list: read `writes.gleam`'s `declared()` and add `Written` rows for `proposals.json` and `proposals-check.txt` with writer `write_proposals` and `check_proposals`, in the style of the existing rows, with a truthful risk line.

- [ ] **Step 4: Run to see them pass**

Run: `cd harness && gleam test 2>&1 | tail -20`
Expected: all pass; announced up by 2 or 3; passed equals announced; `writes_test` still green.

- [ ] **Step 5: Format and commit**

```bash
cd harness && gleam format
git add harness/src/harness/dispatch.gleam harness/src/harness/writes.gleam harness/test/dispatch_test.gleam
git commit -m "Fathom: a worker's proposals are written in the seeder's shape, checked, and recorded"
```

---

## Self-review against the bug row

- *A proposed-sub-lemmas section in the structured report; each a Lean statement exactly as seeded, with a name, one sentence why, a size* — Task 1 type and decoder; Task 2 schema and brief wording.
- *The dispatcher writes them to the attempt directory as a proposal file in the shape the seeder check consumes* — Task 3 `proposals_json`, proven byte-compatible by `seed.decode_proposals` in the test.
- *Same statement check and same review-and-land step as a seeder's* — Task 3 runs `seed.check_file_in`; landing stays Rowan's.
- *A proposal is not a claim the node is hard; a haiku attempt may propose freely* — nothing reads rung or outcome; brief says so.
- *A restatement or weakening needs the treatment `type_of%` gives* — same-name restatement refused mechanically; other-name restatement named in the brief as the captain's read, stated as out of scope for the harness.
- *Rowan's answers* — auto-check, events in the attempt's `events.jsonl`, report into the attempt dir, exact `next.json` shape, file named `proposals.json`.
