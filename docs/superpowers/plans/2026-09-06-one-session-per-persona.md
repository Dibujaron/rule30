# One Session Per Persona Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The scheduler never runs two sessions as one persona: it picks the eldest idle persona in a leaf's region and, when every persona there is busy, mints a new one through the existing naming ceremony.

**Architecture:** `schedule.gleam` stays pure and now returns an `Assignment` (node plus `Who`: an existing identity or a mint decision) from the DAG, the roster, and the names in flight. `dispatch.gleam` carries the decision out in `start` via `ensure_identity`, which already knows how to run a ceremony. `roster.gleam` gains list-valued region lookup, an idle filter, and a sibling sentence in the naming prompt.

**Tech Stack:** Gleam on the Erlang target, gleeunit, `simplifile`, the scripted `fake_shim.mjs` for end-to-end tests.

**Spec:** `docs/superpowers/specs/2026-09-06-one-session-per-persona-design.md`

## Global Constraints

- Work in a git worktree on branch `rowan/one-session-per-persona` created from commit `74ba8c4` (the spec commit, tip of `keel/bug-board`). Keel is editing `worker.gleam`, `brief.gleam`, `claude.gleam`, `harness.gleam`, `run_test.gleam` and `worker_test.gleam` uncommitted in the main checkout; do not touch that checkout's files.
- Run tests from the worktree's `harness/` directory with `HARNESS_REPO_ROOT` pointing at the main checkout (`C:/Users/dibuj/dev/rule30`), because `verify_test` needs a checkout with a built `.lake`, and the worktree has none. Never run tests while a live run is in flight there (`ls -t runs/ | head -1` and look for a `gleam`/`erl` process).
- `gleam format` before every commit. The formatter rewrites CRLF to LF; commit whatever it touches.
- Commit messages are prefixed `Rowan: ...` and end with the two attribution trailers this session uses.
- Every test is a `pub fn ..._test()` in gleeunit style with bare `assert` and `let assert`, matching the existing files.
- Guard ports in `run_test.gleam` fixtures are never reused between tests and are spaced by more than the attempt count, because a guard is never stopped once started.
- Do not touch `guard.gleam`, `worker/brief.gleam`, `claude.gleam`, or `harness.gleam` — Keel's territory this week.

**One deviation from the spec, deliberate:** the spec's `Mint(region)` carries only the region. Here `Mint` also carries the busy names the scheduler saw, so the dispatcher can write the `because` field on the `naming` event without recomputing what the scheduler already knew. Same behaviour, one fewer place to be wrong.

---

### Task 0: Worktree

**Files:** none edited.

- [ ] **Step 1: Create the worktree from the spec commit**

```bash
cd C:/Users/dibuj/dev/rule30
git worktree add .claude/worktrees/rowan-persona -b rowan/one-session-per-persona 74ba8c4
cd .claude/worktrees/rowan-persona/harness
```

- [ ] **Step 2: Confirm the baseline is green there**

```bash
HARNESS_REPO_ROOT=C:/Users/dibuj/dev/rule30 gleam test
```

Expected: every existing test passes. If `verify_test` fails because `Rule30/Proofs/HarnessProbe.lean` is missing in the main checkout, that file is written by the test itself; a failure there is a `lake` problem, not this plan's.

---

### Task 1: Region lookup as a list, and the idle filter

**Files:**
- Modify: `harness/src/harness/roster.gleam:73-79`
- Test: `harness/test/roster_test.gleam:78-84`

**Interfaces:**
- Produces: `roster.for_region(roster: Roster, region: String) -> List(Identity)` in roster order; `roster.idle_for_region(roster: Roster, region: String, busy: List(String)) -> Option(Identity)`, the first of those whose name is not in `busy`.
- Breaks: `dispatch.gleam:774` (`case roster.for_region(...)` matching `Some`/`None`). Task 4 rewrites that call; until then the project does not compile, which is fine inside one branch but means Tasks 1 to 3 are verified with `gleam test` only after Task 4, or by temporarily running `gleam check` on the touched modules. Do Tasks 1 to 4 as one sequence without pausing for a green build between them, committing each.

- [ ] **Step 1: Replace the `for_region` test and add an idle test**

In `harness/test/roster_test.gleam` replace `for_region_finds_the_specialist_test` with:

```gleam
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
```

Add `import gleam/list` at the top of the test file if it is not already there. Check `thessaly()`'s name is `"Thessaly"` (line 8) and adjust the literal if not.

- [ ] **Step 2: Run the roster tests to see them fail**

```bash
HARNESS_REPO_ROOT=C:/Users/dibuj/dev/rule30 gleam test
```

Expected: compile error, `for_region` returns `Option`, and `idle_for_region` is unknown.

- [ ] **Step 3: Implement**

Replace `for_region` in `harness/src/harness/roster.gleam` with:

```gleam
/// Every identity that specialises in `region`, in roster order — which is
/// creation order, so the eldest comes first.
pub fn for_region(roster: Roster, region: String) -> List(Identity) {
  list.filter(roster.identities, fn(i) { i.region == region })
}

/// The eldest identity for `region` whose name is not in `busy`: a persona
/// is a resource with capacity one, and this is the free one. `None` when
/// every persona for the region is busy, or the region has none.
pub fn idle_for_region(
  roster: Roster,
  region: String,
  busy busy: List(String),
) -> Option(Identity) {
  for_region(roster, region)
  |> list.find(fn(i) { !list.contains(busy, i.name) })
  |> option.from_result
}
```

- [ ] **Step 4: Commit**

```bash
gleam format
git add src/harness/roster.gleam test/roster_test.gleam
git commit -m "Rowan: for_region lists, idle_for_region picks the eldest free persona"
```

(The build is red at `dispatch.gleam` until Task 4; that is expected on this branch.)

---

### Task 2: The naming prompt names the siblings

**Files:**
- Modify: `harness/src/harness/roster.gleam:249-256` (`naming_prompt`)
- Modify: `harness/src/harness/worker.gleam:146` (the call in `name_identity`)
- Test: `harness/test/roster_test.gleam:112-126`

**Interfaces:**
- Produces: `roster.naming_prompt(region: String, region_description: String, siblings: List(String)) -> String`.
- Consumes: `roster.for_region` from Task 1.

- [ ] **Step 1: Update the two prompt tests and add the sibling test**

In `harness/test/roster_test.gleam`, change the two existing calls `roster.naming_prompt("P1", roster.region_description("P1"))` to pass a third argument `[]`. Then add:

```gleam
pub fn naming_prompt_names_the_siblings_when_the_region_has_them_test() {
  let alone = roster.naming_prompt("P2", roster.region_description("P2"), [])
  assert !string.contains(alone, "already")
  let joined =
    roster.naming_prompt("P2", roster.region_description("P2"), [
      "Emmy",
      "Ravel",
    ])
  assert string.contains(
    joined,
    "This region already has provers named Emmy and Ravel.",
  )
  assert string.contains(joined, "a name none of them has")
  assert string.contains(joined, "- \"name\": the name you choose")
}
```

- [ ] **Step 2: Run to see the failure**

```bash
HARNESS_REPO_ROOT=C:/Users/dibuj/dev/rule30 gleam test
```

Expected: compile error, `naming_prompt` takes two arguments.

- [ ] **Step 3: Implement**

Replace `naming_prompt` in `roster.gleam` with:

```gleam
/// The single message the naming ceremony sends. Names are self-chosen: the
/// first instance of an identity is told its region and asked to name
/// itself, and both the name and its stated reason go in the log. When the
/// region already has provers, the newcomer is told their names, so it can
/// place itself beside them and cannot pick one of them.
pub fn naming_prompt(
  region: String,
  region_description: String,
  siblings: List(String),
) -> String {
  "You are about to join a small team of provers formalizing Wolfram's Rule 30 in Lean 4. You will be "
  <> case siblings {
    [] -> "the specialist"
    _ -> "a specialist"
  }
  <> " for the region \""
  <> region
  <> "\": "
  <> region_description
  <> ". "
  <> sibling_sentence(siblings)
  <> "Your work on this region will persist across many sessions through a notebook that only you write. Choose a name for yourself. It must be a name, not a job title, and not the name of a living person"
  <> case siblings {
    [] -> ""
    _ -> ", and a name none of them has"
  }
  <> ". Then write the opening paragraph of your notebook: who you are, in your own words. Reply with a JSON object with exactly these five fields, all required:\n- \"name\": the name you choose (a single capitalised word, letters only)\n- \"reason\": one paragraph on why\n- \"opening\": the opening paragraph of your notebook — who you are, in your own words, three to six sentences\n- \"color\": a hex colour that is yours, written #rrggbb\n- \"color_reason\": one sentence on why"
}

fn sibling_sentence(siblings: List(String)) -> String {
  case siblings {
    [] -> ""
    [one] -> "This region already has a prover named " <> one <> ". They keep a notebook of their own, as you will; you are joining them, not replacing them. "
    many -> {
      let assert Ok(last) = list.last(many)
      let init = list.take(many, list.length(many) - 1)
      "This region already has provers named "
      <> string.join(init, ", ")
      <> " and "
      <> last
      <> ". Each keeps a notebook of their own, as you will; you are joining them, not replacing them. "
    }
  }
}
```

In `harness/src/harness/worker.gleam` inside `name_identity`, change

```gleam
  let prompt = roster.naming_prompt(region, roster.region_description(region))
```

to

```gleam
  let siblings =
    roster.for_region(roster_, region) |> list.map(fn(i) { i.name })
  let prompt =
    roster.naming_prompt(region, roster.region_description(region), siblings)
```

(`gleam/list` is already imported in `worker.gleam`; check the import block if the compiler disagrees.)

- [ ] **Step 4: Commit**

```bash
gleam format
git add src/harness/roster.gleam src/harness/worker.gleam test/roster_test.gleam
git commit -m "Rowan: the naming prompt tells a newcomer who already holds the region"
```

---

### Task 3: The scheduler decides who

**Files:**
- Modify: `harness/src/harness/schedule.gleam:78-95` (`next_to_start`)
- Test: `harness/test/schedule_test.gleam`

**Interfaces:**
- Produces:

```gleam
pub type Who {
  Existing(roster.Identity)
  Mint(region: String, busy: List(String))
}

pub type Assignment {
  Assignment(node: dag.Node, who: Who)
}

pub fn who_for(roster_: roster.Roster, region: String, busy busy: List(String)) -> Who

pub fn next_to_start(
  d: dag.Dag,
  roster_: roster.Roster,
  plan: Plan,
  running running: Int,
  busy busy: List(String),
  dispatched dispatched: Int,
  skip skip: List(String),
) -> Option(Assignment)
```

- Consumes: `roster.idle_for_region` from Task 1.

- [ ] **Step 1: Rewrite the "what starts next" tests**

In `harness/test/schedule_test.gleam` add the imports and fixtures:

```gleam
import gleam/option.{None, Some}
import harness/roster.{Identity, Roster}
import harness/schedule.{Assignment, Existing, Mint, Plan}
```

```gleam
fn persona(name: String, region: String) -> Identity {
  Identity(
    name:,
    region:,
    created: "2026-09-05T00:00:00Z",
    naming_reason: "a fixture",
    opening: "",
    color: Some("#123456"),
  )
}

/// One P2 persona, Ada; the board's nodes are all P2.
fn one_persona() -> Roster {
  Roster([persona("Ada", "P2")])
}

fn two_personas() -> Roster {
  Roster([persona("Ada", "P2"), persona("Bea", "P2")])
}
```

Then replace the five existing `next_to_start` tests with these, keeping the flag tests above them untouched:

```gleam
pub fn next_is_the_first_open_leaf_with_its_idle_persona_test() {
  let assert Some(Assignment(node: n, who: Existing(who))) =
    schedule.next_to_start(
      board(),
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: [],
    )
  // `a` unblocks `c`, so it ranks first.
  assert n.id == "a"
  assert who.name == "Ada"
}

pub fn the_younger_persona_goes_when_the_eldest_is_busy_test() {
  let assert Some(Assignment(who: Existing(who), ..)) =
    schedule.next_to_start(
      board(),
      two_personas(),
      Plan(3, 2),
      running: 1,
      busy: ["Ada"],
      dispatched: 1,
      skip: [],
    )
  assert who.name == "Bea"
}

pub fn a_mint_is_decided_when_every_persona_is_busy_test() {
  let assert Some(Assignment(who: Mint(region:, busy:), ..)) =
    schedule.next_to_start(
      board(),
      one_persona(),
      Plan(3, 2),
      running: 1,
      busy: ["Ada"],
      dispatched: 1,
      skip: [],
    )
  assert region == "P2"
  assert busy == ["Ada"]
}

pub fn a_mint_is_decided_for_an_empty_region_test() {
  let assert Some(Assignment(who: Mint(region: "P2", busy: []), ..)) =
    schedule.next_to_start(
      board(),
      Roster([]),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: [],
    )
}

pub fn nothing_starts_while_every_slot_is_busy_test() {
  assert schedule.next_to_start(
      board(),
      two_personas(),
      Plan(3, 2),
      running: 2,
      busy: ["Ada", "Bea"],
      dispatched: 2,
      skip: [],
    )
    == None
}

pub fn nothing_starts_past_the_attempt_budget_test() {
  assert schedule.next_to_start(
      board(),
      one_persona(),
      Plan(2, 3),
      running: 0,
      busy: [],
      dispatched: 2,
      skip: [],
    )
    == None
}

pub fn a_claimed_node_is_not_a_candidate_test() {
  let d = dag.update(board(), node("a", dag.Claimed, []))
  let assert Some(Assignment(node: n, ..)) =
    schedule.next_to_start(
      d,
      two_personas(),
      Plan(3, 2),
      running: 1,
      busy: ["Ada"],
      dispatched: 1,
      skip: [],
    )
  assert n.id == "b"
}

pub fn a_skipped_node_is_passed_over_test() {
  let assert Some(Assignment(node: n, ..)) =
    schedule.next_to_start(
      board(),
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: ["a"],
    )
  assert n.id == "b"
  assert schedule.next_to_start(
      board(),
      one_persona(),
      Plan(3, 2),
      running: 0,
      busy: [],
      dispatched: 0,
      skip: ["a", "b"],
    )
    == None
}

pub fn who_for_is_the_same_rule_on_its_own_test() {
  assert schedule.who_for(two_personas(), "P2", busy: ["Ada"])
    == Existing(persona("Bea", "P2"))
  assert schedule.who_for(two_personas(), "P1", busy: [])
    == Mint(region: "P1", busy: [])
}
```

- [ ] **Step 2: Run to see the failure**

```bash
HARNESS_REPO_ROOT=C:/Users/dibuj/dev/rule30 gleam test
```

Expected: compile error, `Assignment`, `Existing`, `Mint`, `who_for` unknown.

- [ ] **Step 3: Implement**

In `harness/src/harness/schedule.gleam`, add `import harness/roster` and replace `next_to_start` with:

```gleam
/// Who an attempt runs as. A persona is a resource with capacity one, so
/// when every persona for a region is in flight the scheduler does not
/// wait: it decides to mint a new one, and carries the names it found busy
/// so the log can say why.
pub type Who {
  Existing(roster.Identity)
  Mint(region: String, busy: List(String))
}

/// A node to start, and who starts it.
pub type Assignment {
  Assignment(node: dag.Node, who: Who)
}

/// The eldest idle persona for `region`, or the decision to mint one.
pub fn who_for(
  roster_: roster.Roster,
  region: String,
  busy busy: List(String),
) -> Who {
  case roster.idle_for_region(roster_, region, busy:) {
    Some(identity) -> Existing(identity)
    None ->
      Mint(
        region:,
        busy: roster.for_region(roster_, region)
          |> list.map(fn(i) { i.name })
          |> list.filter(fn(name) { list.contains(busy, name) }),
      )
  }
}

/// The assignment to start next, or `None` if nothing should start: every
/// slot is busy, the attempt budget is spent, or no open leaf is left that
/// is not in `skip`. Claimed nodes are never open leaves, so a node already
/// in flight is excluded by the DAG itself; `skip` is for nodes this run has
/// decided not to touch again, such as one whose attempt crashed. `busy`
/// is the names in flight; persona availability never changes which node
/// is chosen, only who runs it.
pub fn next_to_start(
  d: dag.Dag,
  roster_: roster.Roster,
  plan: Plan,
  running running: Int,
  busy busy: List(String),
  dispatched dispatched: Int,
  skip skip: List(String),
) -> Option(Assignment) {
  case running < plan.concurrency && dispatched < plan.max_attempts {
    False -> None
    True ->
      dag.open_leaves(d)
      |> list.find(fn(n) { !list.contains(skip, n.id) })
      |> option.from_result
      |> option.map(fn(node) {
        Assignment(node:, who: who_for(roster_, node.region, busy:))
      })
  }
}
```

Change the module's option import to `import gleam/option.{type Option, None, Some}`.

Note `Mint.busy` lists only this region's busy names, in roster order, so `because` reads "all busy: Emmy" and not every name in flight across regions.

- [ ] **Step 4: Commit**

```bash
gleam format
git add src/harness/schedule.gleam test/schedule_test.gleam
git commit -m "Rowan: the scheduler assigns a persona or decides to mint one"
```

---

### Task 4: The dispatcher carries the decision out

**Files:**
- Modify: `harness/src/harness/dispatch.gleam:32-75` (`prove_one`), `:319-343` (`fill`), `:344-450` (`start`), `:761-806` (`ensure_identity`)
- Test: `harness/test/run_test.gleam` (fixture helper and one assertion)

**Interfaces:**
- Consumes: `schedule.Assignment`, `schedule.Who`, `schedule.who_for`, `schedule.next_to_start` from Task 3; `roster.for_region` from Task 1.
- Produces: `naming` events on the attempt log carry `"because"`: `"region empty"` or `"all busy: <names joined by ', '>"`.

- [ ] **Step 1: Give the run test a second persona so today's scenarios keep their meaning**

The existing scenarios run two P2 attempts at once against one P2 persona. Under the new rule that would mint, and the scripted shim has no naming answer, so the ceremony would fail. Seed a second persona instead. In `harness/test/run_test.gleam`:

Add after `scripted_identity()`:

```gleam
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
```

Change `fixture` to delegate:

```gleam
fn fixture(name: String, script: List(List(String)), port: Int) -> Fixture {
  fixture_with_roster(
    name,
    script,
    port,
    roster.Roster([scripted_identity(), understudy()]),
  )
}

fn fixture_with_roster(
  name: String,
  script: List(List(String)),
  port: Int,
  roster_: roster.Roster,
) -> Fixture {
  // ... the former body of `fixture`, with
  //   roster.save(roster.Roster([scripted_identity()]), dir <> "/roster.json")
  // replaced by
  //   roster.save(roster_, dir <> "/roster.json")
}
```

Write the body out in full; the comment above marks the single line that changes.

In `two_slots_take_both_leaves_and_a_close_opens_the_next_test`, `probe_three` runs as whichever persona is idle when `probe_one` closes, so replace

```gleam
  assert string.contains(journal, "Scripted on probe_three")
```

with

```gleam
  assert string.contains(journal, "Understudy on probe_two")
  assert string.contains(journal, " on probe_three")
```

Leave `"Scripted on probe_one"` as it is: the eldest goes first.

- [ ] **Step 2: Run the tests to see the compile failure**

```bash
HARNESS_REPO_ROOT=C:/Users/dibuj/dev/rule30 gleam test
```

Expected: compile error in `dispatch.gleam` at `roster.for_region` and `schedule.next_to_start`.

- [ ] **Step 3: Rewrite `ensure_identity`**

Replace the whole function (its doc comment included) with:

```gleam
/// The identity an attempt runs as, given the scheduler's decision. An
/// existing identity that never chose a colour — the roster predates the
/// ceremony asking for one — gets a short backfill ceremony first. A mint
/// runs the naming ceremony: the newcomer is saved to the roster, its
/// notebook is opened with the paragraph it wrote about itself, and the
/// `naming` event says whether it was named because the region was empty
/// or because every persona there was busy.
fn ensure_identity(
  cfg: config.Config,
  roster_: roster.Roster,
  who: schedule.Who,
  model: String,
  g: guard.Guard,
  l: log.Log,
) -> Result(roster.Identity, String) {
  case who {
    schedule.Existing(identity) ->
      case identity.color {
        Some(_) -> Ok(identity)
        None -> Ok(backfill_color(cfg, roster_, identity, model, g, l))
      }
    schedule.Mint(region:, busy:) -> {
      use #(identity, color_reason) <- result.try(worker.name_identity(
        cfg,
        roster_,
        region,
        model,
        g.settings_path,
        l,
      ))
      let roster_ = roster.add(roster_, identity)
      use _ <- result.try(roster.save(roster_, cfg.roster_path))
      use _ <- result.try(roster.append_notebook(
        cfg.agents_dir,
        identity,
        identity.created <> " — named for " <> region,
        naming_entry(identity, color_reason),
      ))
      let because = case busy {
        [] -> "region empty"
        names -> "all busy: " <> string.join(names, ", ")
      }
      log.event(l, "naming", [
        #("name", json.string(identity.name)),
        #("region", json.string(identity.region)),
        #("reason", json.string(identity.naming_reason)),
        #("because", json.string(because)),
      ])
      Ok(identity)
    }
  }
}
```

- [ ] **Step 4: Thread the decision through `fill` and `start`**

In `fill`, replace the `schedule.next_to_start(...)` call and the `case candidate` with:

```gleam
  let candidate = case state.halted {
    Some(_) -> None
    None ->
      schedule.next_to_start(
        state.d,
        state.roster_,
        run_.plan,
        running: list.length(state.running),
        busy: list.map(state.running, fn(r) { r.identity.name }),
        dispatched: state.dispatched,
        skip: state.skip,
      )
  }
  case candidate {
    None -> Ok(state)
    Some(schedule.Assignment(node:, who:)) -> {
      use state <- result.try(start(run_, state, node, who))
      fill(run_, state)
    }
  }
```

Change `start`'s signature to

```gleam
fn start(
  run_: Run,
  state: RunState,
  node: dag.Node,
  who: schedule.Who,
) -> Result(RunState, String) {
```

and its `ensure_identity` call to

```gleam
      use identity <- result.try(ensure_identity(
        cfg,
        state.roster_,
        who,
        model,
        g,
        attempt_log,
      ))
```

Update `start`'s doc comment: "the identity the scheduler assigned (named or coloured first, inline, if it has to be)".

In `prove_one`, change

```gleam
  use identity <- result.try(ensure_identity(cfg, roster_, node, model, g, l))
```

to

```gleam
  let who = schedule.who_for(roster_, node.region, busy: [])
  use identity <- result.try(ensure_identity(cfg, roster_, who, model, g, l))
```

`prove_one` runs alone, so `busy` is empty and it gets the eldest persona, or mints for an empty region, as before.

- [ ] **Step 5: Run every test**

```bash
HARNESS_REPO_ROOT=C:/Users/dibuj/dev/rule30 gleam test
```

Expected: all green, including the three existing run scenarios with the two-persona fixture.

- [ ] **Step 6: Commit**

```bash
gleam format
git add src/harness/dispatch.gleam test/run_test.gleam
git commit -m "Rowan: dispatch runs each attempt as the persona the scheduler assigned"
```

---

### Task 5: End to end, a persona is minted mid-run

**Files:**
- Test: `harness/test/run_test.gleam`

**Interfaces:**
- Consumes: `fixture_with_roster` from Task 4; the `naming` event's `because` field from Task 4.

- [ ] **Step 1: Write the scenario**

Add a result-line builder whose structured output satisfies both the naming decoder and the report decoder, and the test:

```gleam
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
      4261,
      roster.Roster([scripted_identity()]),
    )
  let assert Ok(text) =
    dispatch.run_with(
      f.cfg,
      Plan(max_attempts: 2, concurrency: 2),
      env(f, verify.Verified(["propext"], "'harness_check' depends on axioms")),
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
```

Check `dag.Attempt` has a field named `identity` (it does in `dag.json`; confirm the Gleam record's field name in `dag.gleam` around line 395 and adjust).

- [ ] **Step 2: Run the new test**

```bash
HARNESS_REPO_ROOT=C:/Users/dibuj/dev/rule30 gleam test
```

Expected: PASS. If the ceremony fails with "naming ceremony: ..." in the run's stderr, the shim's first turn is being consumed by the ceremony's `say` and the worker's task message alike — that is intended; check the structured output decodes for both (`naming_from_dynamic` needs all five fields; the report decoder needs `outcome`, `estimate`, `summary`, `notebook`, `journal`).

- [ ] **Step 3: Commit**

```bash
gleam format
git add test/run_test.gleam
git commit -m "Rowan: end to end, a busy region mints a second persona"
```

---

### Task 6: Docs and the glossary

**Files:**
- Modify: `CLAUDE.md` ("Running the harness" section)
- Modify: `docs/glossary.md` (one new row)
- Modify: `docs/superpowers/specs/2026-09-05-harness-design.md:275-280` (the identity paragraph)

- [ ] **Step 1: CLAUDE.md**

After the sentence "Concurrency is capped at 3." in "Running the harness", add:

```
A persona runs one session at a time. When a leaf's region has no idle
persona, the run mints a new one through the naming ceremony before
dispatching, so a region grows a second name the first time two of its
leaves are ready together. `agents/roster.json` is the record of who
exists; the `naming` event in the attempt's `events.jsonl` says why.
```

- [ ] **Step 2: Glossary row**

Open `docs/glossary.md`, find the table's format, and add a row in the same shape for **mint**: the run creating a new persona through the naming ceremony because every persona for a region is busy. Anchor: a build system's scheduler assigns tasks to a fixed pool of workers; here the pool grows on demand. Where it breaks: a new worker in a build system is interchangeable, while a minted persona starts with an empty notebook and is not.

- [ ] **Step 3: The old spec's identity paragraph**

In `docs/superpowers/specs/2026-09-05-harness-design.md` the bullet beginning "**An identity is a notebook bound to a region of the DAG.**" says regions are the unit of identity. Append one sentence: "Since 2026-09-06 a region may hold several identities, one per concurrent session; see `2026-09-06-one-session-per-persona-design.md`."

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/glossary.md docs/superpowers/specs/2026-09-05-harness-design.md
git commit -m "Rowan: docs for one session per persona"
```

---

### Task 7: Merge

- [ ] **Step 1: Check Keel's state in the main checkout**

```bash
cd C:/Users/dibuj/dev/rule30
git status --short
git log --oneline -3 main keel/bug-board
```

If Keel has uncommitted edits, do not merge into that checkout. Leave the branch `rowan/one-session-per-persona` for Dib or for a later session to merge once Keel commits, and say so in the report.

- [ ] **Step 2: When the checkout is clean, merge**

```bash
git checkout main
git merge --no-ff rowan/one-session-per-persona
cd harness && HARNESS_REPO_ROOT=C:/Users/dibuj/dev/rule30 gleam test
git worktree remove .claude/worktrees/rowan-persona
```

If `keel/bug-board` has been merged first and conflicts appear in `dispatch.gleam` or `run_test.gleam`, resolve by keeping both changes: Keel's touch `write_channels` and the report schema; this branch touches `fill`, `start`, `ensure_identity`, `prove_one`, and the fixture helper.
