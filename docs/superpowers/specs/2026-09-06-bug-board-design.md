# Bug board, and Keel — Design

**Date:** 2026-09-06
**Status:** approved by Dib, not yet built.
**Depends on:** the harness as of `bde7ac4` (Gleam, `run --concurrency`).

## Purpose

Two things, designed together because neither is much use alone.

1. **`blueprint/bugs.json`** — a durable board of things wrong with the
   project's machinery, which every agent can file to and one agent works
   from.
2. **Keel** — the identity that works from it: the first agent whose region
   is the harness rather than a region of the DAG.

The provers hit friction constantly and it evaporates. Vesper's session ends
and whatever the guard refused, whatever the brief got wrong, whatever the
verifier said that nobody could act on, goes with it. Rowan's notebook is
full of these — a fixed guard port, a notebook heading printed twice, a
summary that only reached stdout — and each one was remembered by luck. The
board is the place they land instead.

## Keel

**Name.** A keel is the timber laid down first, that every frame is bolted
to, and that nobody looks at again once the ship is in the water. That is
`dispatch.gleam` and `guard.gleam`: what every prover's session floats on,
and what Vesper and Emmy should never have to think about. A word-turned-name
like Cairn and Vesper; not a job title (the job title is *bosun*, and the
ceremony forbids titles); not a living person.

**Where the analogy breaks,** and it matters: a keel is inert, laid once, and
the one thing you must never do is cut into it while the ship is under sail.
This role is precisely that — changing `guard.gleam` while three workers are
running inside it. The name describes what is protected, not how the agent
behaves, and the gap between those two is the risk of the job. See
*Boundaries*.

**Colour.** `#a97142`, bronze. Keel bolts are bronze because they fasten the
part nobody can inspect, so they are chosen not to fail unseen. In a log line
it is clear of Rowan's `#c8502e`: browner, duller, no alarm in it.

**Region.** `framework`. `roster.region_blurb` gains a case for it.

**Started by hand.** A framework agent is not dispatched. There is no `fix-one` command,
no second guard profile, no bug-attempt loop — those were considered and cut
as roughly the size of the original harness build, for a role that runs a
handful of times a week from Dib's own terminal. The harness gains the
ability to *file* bugs; it gains no ability to dispatch against them.

Consequence: no dispatcher writes a framework agent's files from a structured
report. They write `agents/<Name>.md` and the journal themselves. `CLAUDE.md`'s "the dispatcher
writes files from that report, you don't edit `agents/` or `runs/` yourself"
is scoped to harness workers, which is what it always meant.

## The board

`blueprint/bugs.json`, beside `dag.json`. Both are boards, `blueprint/` is
already where "what work exists" lives, and `config.Config` gains `bugs_path`
alongside `dag_path` (env override `HARNESS_BUGS_PATH`).

```json
{"bugs": [{
  "id": "guard-events-carry-no-node",
  "title": "Guard events don't say which worker was denied",
  "area": "guard",
  "severity": "friction",
  "body": "Under --concurrency 3 all three guards log to one events.jsonl and the rows carry only event/tool/decision, so a Deny cannot be attributed to a worker.",
  "reported_by": "Keel",
  "source": "hand",
  "node": null,
  "run": null,
  "session_id": null,
  "signature": null,
  "filed": "2026-09-06T02:10:00Z",
  "occurrences": 1,
  "status": "open",
  "resolution": null,
  "fixed": null
}]}
```

### Field rulings

**`status`** is `open | claimed | fixed | wontfix`. It deliberately borrows
`dag.json`'s vocabulary, `claimed` included, so the one board idiom in the
project transfers: an agent working a bug claims it exactly as a prover
claims a node, and a crashed session leaves the same recognisable mess.
`wontfix` requires a `resolution` line saying why, so a closed-without-work
bug is never indistinguishable from a fixed one.

**`area`** is a closed set: `guard | dispatch | verify | brief | board |
hooks | docs`. Closed rather than free text because an open string field
becomes twelve spellings of "the guard" within a week, and the filter on
`gleam run -- bugs` is the main way the board gets read. An unknown area
fails the decode rather than being coerced.

**`severity`** is `blocks | friction | papercut`. *Blocks* — a worker could
not finish. *Friction* — it cost turns or produced a wrong belief.
*Papercut* — merely ugly. Severity is the reporter's claim, not a verdict;
A framework agent may correct it when working the bug.

**`body`** is verbatim and never summarised, for the same reason nothing an
agent writes is summarised anywhere in the harness: the words an agent chose
for its own obstacle are the observational product, and a paraphrase throws
away the part Dib is actually reading for.

**Provenance is written by the harness, never by the reporting agent.**
`reported_by`, `source`, `node`, `run`, `session_id`, `filed` are stamped by
`dispatch.gleam` from what it already knows. An agent supplies four fields
only: `title`, `area`, `severity`, `body`. An agent cannot claim to be
another identity, or to have hit a bug at a node it was not dispatched to,
because it is never asked.

**`source`** is `worker | harness | hand`, which is the provenance that
matters when reading the board: a bug a prover noticed under the guard, a bug
the machine detected, and a bug someone wrote directly are three different
kinds of evidence. `hand` covers Dib, Rowan and the framework agents alike — `reported_by`
is what says which, and `source` says only that no dispatcher stamped it.

**`id`** is a kebab-case slug derived from the title, uniquified with a
numeric suffix on collision. Slugs rather than counters so a bug can be
referred to in a commit message and stay legible.

### Why this board is durable

A run's record — its events, its journal — is per-run and never browsed by
agents. The bug board is the opposite on both counts: it persists across runs
and is read at the start of every framework session. This is not an
inconsistency. A journal entry is an account of one attempt, complete when
it is written; a bug is a work item, and a work item that evaporates when
the run ends is the exact failure the board exists to fix.

## Filing: four paths, one writer

1. **Worker report.** A prover names friction in its end-of-turn structured
   report; `dispatch.gleam` appends it with node, run, session and identity
   stamped in.
2. **Auto-filed by the harness** at attempt end, from signals the dispatcher
   already has in the run's events: a guard `Deny`; an attempt that crashed
   leaving a node `claimed`; a rate-limited stop; a verifier failure whose
   cause was a name or type mismatch rather than a proof that did not close.
3. **Rowan**, from the dispatcher's seat.
4. **Dib**, by hand or by telling a framework agent in a session.

**One writer.** Only the dispatcher process writes `bugs.json` during a run —
the same single-writer discipline `dag.json` already has. Under
`--concurrency 3` this holds without a lock, but *not* for the reason first
written here. Sharing one BEAM serializes nothing: each attempt is its own
spawned process. What serializes the board is that a spawned attempt only runs
`worker.attempt` and then sends its result back, and `write_channels` — which
files the bugs — is called from the dispatcher's own receive loop handling that
message. The loop handles one result at a time. Verified after a reviewer
correctly refused to take the original claim on trust.
A framework agent writes it only from a hand-started session, and the *no editing during a
live run* rule under *Boundaries* keeps those two writers apart.

### Dedupe

Every auto-filed bug carries a `signature`: `area` plus the denied tool name
or the failing verifier stage. If an **open** bug already carries that
signature, `append` bumps `occurrences` and refreshes `filed` instead of
adding a row. Without this, one bad guard rule files forty identical bugs in
a single run and the board is useless on its first live day.
Agent-reported and human bugs have a null signature and are never deduped —
two agents describing the same friction in their own words are two pieces of
evidence, not one.

A `fixed` bug whose signature recurs files a **new** bug rather than
reopening the old one, so a regression is visibly a regression.

## The report schema change

`brief.gleam`'s `report_schema()` gains a `bugs` array — required, empty
allowed — with objects of `{title, area, severity, body}`. This is the one
change that touches every prover, so `how_to_report()` gains a paragraph
drawing the line hard:

> A bug is the **harness** getting in your way: a command the guard refused
> that you needed, a brief that told you something untrue, a verifier message
> you could not act on, a lemma the brief said was served that was not. Lean
> being difficult is not a bug. A proof you could not find is not a bug. If
> the obstacle would still exist for a human doing this by hand in an editor,
> it is not the harness's.

Without that paragraph every abandoned node arrives as a bug and the board
becomes a second, worse journal.

## Module and CLI

`harness/src/harness/bugs.gleam`, built as `dag.gleam` is built:

- `pub type Bug`, `pub type Board`, `pub type Severity`, `pub type Area`,
  `pub type BugStatus`
- `decode` / `encode` / `load` / `save`
- `append(board, bug) -> Board` — dedupe folded in
- `open_bugs(board) -> List(Bug)`, `get`, `update`
- `severity_to_string` / `_from_string` and the same pair for area and
  status, matching `dag.gleam`'s existing style

`harness.gleam` gains one clause: `gleam run -- bugs [--area A] [--severity S]
[--all]`, listing open bugs newest-first with severity, area, occurrence count
and reporter. `--all` includes fixed and wontfix. The usage line grows.

**The teaching point, which is the same one the DAG runs on:** `Decoder(Bug)`
is a **type**, and a successfully parsed board is a **value** of that type.
The decoder refuses a malformed board from outside, the way the harness's
generated `type_of%` check refuses a prover's theorem whose type does not
match its statement. *Where it breaks:* Gleam decodes at runtime, when the
harness reads the file, whereas Lean checks at elaboration. A hand-edit that
breaks the board is not caught when you save it, only the next time something
loads it. Hence `save` re-encodes from a decoded value rather than patching
text.

## Boundaries

A new `CLAUDE.md` section, needed because the framework role is the first
with no guard around it. Writing that section is part of implementing this
design, and is the one `CLAUDE.md` edit a framework agent makes without
asking again afterwards.

**A framework agent may change, unasked:**

- `harness/` — Gleam source and tests
- `.claude/` — hooks, generated settings, permission config
- `blueprint/dag.json` — **board repair only**: a node stuck `claimed` past
  what `reopen` will touch, a half-written attempt record. Never a node's
  statement, deps, size, or `lean_name`.

**A framework agent may not change without asking:**

- `Rule30/` — any of it. Not `Basic.lean`, not `Statements.lean`, and above
  all not `Prize.lean`. The three prize conjectures stay `sorry`.
- `CLAUDE.md`, `docs/`, `README.md` — the written contract is Rowan's and
  Dib's. One standing exception, which `CLAUDE.md` already imposes on
  everyone: a term a framework agent introduces gets a `docs/glossary.md` row. This design
  introduces *bug board*, *severity*, and *signature*; Cairn may rewrite those
  rows.

**Two rules specific to the role:**

1. **Loosening the guard is never a fix on its own.** A bug reporting that the
   guard refused something is fixed by naming the command and why a prover
   needs it. A widened rule with no named need is the exact failure this role
   exists to prevent, and a reviewer already caught one prefix-match bypass in
   the original plan.
2. **No edit to `guard.gleam`, `.claude/` hooks, or `dispatch.gleam` while a
   run is in flight.** The guard's rules are read at session start, so an edit
   lands under running workers. Check `runs/` for a live run first.

## Testing

`harness/test/bugs_test.gleam` under gleeunit, matching `dag_test.gleam`:

- encode/decode round-trip preserves every field
- an unknown `area`, `severity` or `status` fails the decode loudly
- `append` with a matching signature on an open bug bumps `occurrences` and
  writes no new row
- `append` with a matching signature on a **fixed** bug adds a new row
- agent-reported bugs (null signature) never dedupe
- id slugging, including collision suffixing
- `open_bugs` and the filters

Schema: a test asserting `bugs` is present and required in `report_schema()`.
Auto-filing is exercised against the fake shim in the existing offline run
harness, so none of it costs a subscription turn.

## Deliberately not included

- **No `fix-one` dispatch, no second guard profile.** Cut in design; see
  *Keel*.
- **No priority field.** Severity plus filed order is enough for a board one
  agent works. A priority nobody sorts by is a field that lies.
- **No assignee.** Severity plus filed order is how the framework agents
  pick work; who is on which item is settled between them in session, not
  in a field. (Written when the framework had one agent; with two it is a
  choice rather than a tautology.)
- **No agent-visible board.** Provers file into it and never read it. A prover
  reading the bug list is a prover spending context on someone else's job, and
  it invites the failure where an agent excuses its own abandoned node by
  pointing at an open bug.

## First entries

Found while designing this, and they go on the board as its first rows:

- **`guard-events-carry-no-node`** (`guard`, friction). `guard.gleam:386` logs
  `event`/`tool`/`decision` with no node or attempt id. Under
  `--concurrency 3` a `Deny` cannot be attributed to a worker. Auto-filing
  from guard denials **depends on this**, so it is a prerequisite, not a
  nice-to-have.
- **`messageboard-spec-names-dispatch-ts`** (`docs`, papercut).
  `2026-09-05-messageboard-design.md` is blocked on `harness/dispatch.ts`,
  which was superseded by the Gleam harness. The spec's status line is now
  wrong. Filed rather than fixed, since `docs/` needs asking.

---

## As built — where the design drifted, and why

Written after implementation, from the plan's ledger. The sections above are
the design as approved; this section is what actually shipped. Where they
disagree, this section is the truth.

**`area` gained an eighth value, `other`.** The design fixed a closed set of
seven. A prover's reported area is a string typed by a model, and dropping a
real bug report because it wrote something outside the enum is worse than one
loosely-filed row. `other` is the ingest escape hatch only: the harness always
knows its own area, so nothing auto-filed ever uses it.

**The report's `bugs` field is NOT in the schema's `required` array**, though
the design said "required, empty allowed". That phrasing was written before
Rowan diagnosed the `posts` incident. A field in `required` that a worker may
reasonably omit gets the whole structured-output tool call rejected by the CLI
before the decoder's default can apply — which turned a finished proof into an
error turn and halted a run. An empty `bugs` array is the common case, so
requiring it would fire constantly. The intent that a worker *consider*
whether it hit friction is carried by the field's description and the
`how_to_report` paragraph, not by the schema.

The general rule, which is the durable part: **any field in a `required` list
that a worker may reasonably omit is that same bug.**

**The single-writer justification was wrong.** The design said attempts share
one BEAM "so this holds without a lock". Sharing a BEAM serializes nothing —
each attempt is its own spawned process. What actually serializes board writes
is that a spawned attempt only runs `worker.attempt` and sends its result
back, and `write_channels` runs in the dispatcher's own receive loop handling
that message, one result at a time. Right conclusion, wrong reason; corrected
in place above after a reviewer refused to take the claim on trust.

**Task 4 did not need the field it was designed around.** The plan added a
`node` to `guard.Rules` and threaded it through both construction sites.
Unnecessary: `Rules.holder` is already the node id, because the dispatcher
passes `node_id` into it. The guard always knew which node it guarded and
merely failed to log it. What hid this was the field's own doc comment, which
claimed `holder` was an identity. A wrong comment cost more than a missing one
would have.

**The decoder's isolation took three rounds and is not finished.** The design
said nothing about what happens when a worker's `bugs` entry is malformed. It
matters more than it looks: a failing element threads its error up through
`decode.list` and fails the *whole* `Report`, discarding that turn's
`outcome`, `notebook` and `journal` — the same blast radius as the incident
this channel exists to prevent, by a different route. The shipped decoder
reads the array as `decode.dynamic` and runs the item decoder per element,
keeping successes. One route remains open and is on the board as
`a-non-array-bugs-field-still-poisons-the-report`: a `bugs` field that is not
an array at all fails `decode.list` itself, which is not per-element.

The promise to hold the design to, more precisely than the design stated it:
**nothing a worker puts in `bugs` may ever cost the turn's proof outcome.**

**`claimed` should not have been borrowed.** The design took `dag.json`'s
status vocabulary deliberately, `claimed` included, "so the one board idiom
transfers". It transferred the hazard too. The DAG answers a crashed attempt
with an explicit `reopen`; the board has no equivalent, so a session that
claims a bug and then dies leaves it claimed forever. Filed as
`a-claimed-bug-has-no-reopen`, and the intended fix is to remove `claimed`
rather than build a `reopen` for it — with one maintainer it conveys nothing
that `open` plus git history does not, and deleting the state removes the
hazard instead of managing it.

Rowan's statement of the class, arrived at independently while fixing the same
shape in `agents/sessions.json`: **where state must survive a session that
dies without warning, either derive it from outside the process, or make the
stale value inert rather than dangerous.** Trusting a cleanup step at the end
of an agent session is fiction — sessions are killed, time out, and exhaust
their context far more often than they exit gracefully.

**One file per bug is the intended storage, not one JSON array.** The design
put the whole board in `blueprint/bugs.json` and justified single-writer
access during a run. That is true during a run and false the rest of the time:
the real writers are the dispatcher, the overseer between runs, the
framework agents, and task
implementers, all doing read-modify-write on one file. It clobbered twice in
one hour. The repo had already solved this shape — proofs live at
`Rule30/Proofs/<Node>.lean`, one per node, *so nodes are independently
attackable* — and the board reintroduced the coupling the project had already
rejected.

Target is `blueprint/bugs/<id>.json`. Dib's ruling on method: do not cut over.
Phase 1, the reader unions both stores and the writer writes only new-style
files, leaving the legacy file readable because other agents still write to
it. Phase 2, wait until those writers have moved — a coordination step, not a
code step. Phase 3, migrate the remainder and delete the legacy file. During
the overlap the directory wins on an id collision, and dedupe must scan both
stores.
