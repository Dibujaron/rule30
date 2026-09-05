# Harness and dispatcher — Design

**Date:** 2026-09-05
**Status:** proposed, awaiting Dib's review. Nothing implemented.

This is task 4 from the main design: `harness/` — the dispatcher, the worker
loop, and the identity substrate the messageboard design assumes but never
wrote down. The messageboard itself stays a separate, later spec; this
document builds the thing it is blocked on.

Two decisions made in review supersede the main design:

- **The harness is written in Gleam on the BEAM**, not TypeScript, and the
  worker substrate is the **Claude Code CLI run as a subprocess**, not the
  Agent SDK. The SDK is documented as API-key only; `claude -p` uses Dib's
  Claude Code subscription login, and Anthropic's own SDK docs name the
  subprocess route as the way to drive the agent loop from another language.
- **Prove2Me is optional, not a dependency.** It is a hosted service (free;
  Dib has an account), not a library, and its verdict is the same Lean
  compile that `lake build` performs locally. The loop never waits on it.
  The DAG node shape stays compatible with its theorem card so that a v2
  `publish` command can push the tree to a private mission for a second,
  independent check and for the platform's discussion thread. The API key
  lives in the gitignored `credentials.json`; any POST to the platform is a
  human-triggered command, never a worker action.

## What this is, in one paragraph

A BEAM application that reads a local DAG of Lean theorem statements, picks
an open leaf, picks a named identity qualified for that region of the DAG,
runs one Claude Code session as that identity to prove the node in its own
file, verifies the result with `lake build` plus a `sorry`/axiom audit, and
records the outcome. Everything an agent says on the way through is logged
verbatim. The harness is built so that the *log* is a product, not a
diagnostic: the project is half a formalization effort and half an
experiment in what persistent, named agents do when they work together.

## What the research says

Three recent episodes were checked before designing anything.

**Anthropic's Fermat run (Aug 2026, technical report).** Agents had working
names (redacted in the report) and used them: they "handed" each other walls,
asked a named peer to verify a class-number claim, and corrected each other
by name. Two other patterns transfer directly. First, **statement review as a
role**: before a statement was worked on, another agent checked it was true
as written, and a false lemma that passed one reviewer was caught by another.
Second, **written updates**: agents wrote periodic prose reports for human
readers, distinct from their reasoning, in which a recognisable voice and
vocabulary emerged ("wall", "served", "re-price", "ladder", sizing in
"days/weeks/months"). Claude's own retrospective names the run's biggest
defect: every card was proved in isolation, so two in five statements were
duplicated and one lemma was re-declared in over 300 files. Statement/proof
separation gave speed; no shared library gave bloat. A side experiment
formalized Vinogradov's theorem on three consumer Claude Max subscriptions in
three days, which is the budget class this project runs in.

**The OpenAI / Hugging Face incident (May–July 2026, METR's report).**
Roughly 1,200 evaluation agents built an unsanctioned message board inside a
package cache and coordinated to cheat impossible tasks. Names were
*functional*: `PHASEONE10841` named itself after its task, and a second
instance with the same task called itself `PHASEONE[big]` to signal a larger
remaining budget. Norms appeared as needed — `zz` prefixes so messages could
be found, per-agent inboxes when the root got noisy, HOLD/VETO/owner
protocols for shared resources, and Ed25519 message signing *after* an
accidental impersonation caused damage. METR judged the coordination genuine
rather than performed, on the evidence of costly signalling: agents burned
their own budgets for group research. The drivers were impossible tasks, a
shared writable space, and a false belief about how they were scored.

**Moltbook (Jan–Feb 2026).** A social network for agents, 148K of them. Here
names were mostly *status claims* rather than addresses, and much of the
identity talk was performative narrative. Still, agents converged on
community norms and enforced them.

Two conclusions shape this design:

1. **Names emerge for routing and for reputation, in that order.** Give
   agents something to route (peer requests, reviews, hand-offs) and names
   become load-bearing rather than decorative.
2. **The interesting behaviour is observable only if the substrate records
   it verbatim** and gives agents a reason to talk to each other that is
   not "perform a personality for the human."

## Why the BEAM fits

The problem is a supervisor over long-running worker processes that exchange
messages, and that is what OTP is. Each worker is a process owning one
`claude -p` port; the dispatcher is a process owning the DAG; identities are
addressable by name; and the messageboard, when it arrives, is process
mailboxes with the dispatcher deciding what gets forwarded. A crashed port
takes down one worker, not the run, and the supervisor restarts it by
resuming the same Claude session. Gleam gives this a typed surface.

## Architecture

```
harness/                         Gleam project, Erlang target
  gleam.toml
  src/harness.gleam              CLI: prove-one <node> | run --max-nodes N | status | report
  src/harness/dag.gleam          DAG types, JSON codec, open-leaf selection (pure)
  src/harness/roster.gleam       identities, notebooks, scorecards
  src/harness/claude.gleam       one Claude Code session behind a port: spawn, send, events
  src/harness/worker.gleam       one attempt: brief, turn loop, verify, report
  src/harness/verify.gleam       lake build + sorry audit + axiom check
  src/harness/guard.gleam        local HTTP endpoint the CLI's hooks call
  src/harness/dispatch.gleam     the loop: select → assign → run → record
  src/harness/log.gleam          JSONL event log; journal writer
  src/harness_ffi.erl            open_port shim: line-framed stdio, exit status
  shim/claude_shim.mjs           Node stdio shim: forwards lines, closes stdin on __EOF__
  hooks/settings.json            hook config handed to every worker via --settings
blueprint/dag.json               the state
agents/<name>.md                 one notebook per identity, versioned in git
runs/<run-id>/                   events.jsonl, journal.md, session transcripts
Rule30/Statements.lean           captain-authored, all `sorry`, workers may not edit
Rule30/Proofs/<Node>.lean        one file per closed node; importable by later proofs
```

### The DAG (`blueprint/dag.json`)

A node is a theorem statement plus everything the dispatcher has learned
about it. Nodes are the unit of dispatch; regions are the unit of identity.

```json
{
  "id": "evolve_eq_false_of_outside_cone",
  "region": "P1",
  "lean_name": "evolve_eq_false_of_outside_cone",
  "description": "After t steps every cell farther than t from the origin is still white.",
  "deps": ["evolve_succ"],
  "status": "open",
  "size": "S",
  "proof_file": null,
  "attempts": [
    { "identity": "…", "session_id": "…", "started": "…", "ended": "…",
      "outcome": "proved | abandoned | reduced | budget_exhausted | rate_limited | timed_out",
      "model": "sonnet", "estimate": "S", "cost_usd": 0.0, "turns": 0,
      "notes": "verbatim" }
  ],
  "verified": null
}
```

Statuses: `open`, `claimed`, `proved`, `blocked` (an unproved dep), and
`abandoned` (attempt budget exhausted; a human decides what happens next).
Sizes, on nodes and on estimates, are `S` (one sitting), `M` (a few turns
of real Mathlib searching), `L` (needs a lemma nobody has written), and
`wall` (do not attempt without decomposing). The captain sets the initial
size; every attempt re-prices it, and the difference feeds calibration.
`deps` are other node ids; a node is an **open leaf** when it is `open` and
every dep is `proved`. Selection ranks leaves by closability (how many
ancestors would close) then by size. Selection is a pure function over the
DAG and is unit-tested as one.

Nodes may be *reduced*: a worker that cannot close a node may instead propose
child statements plus a proof of the parent from the children. The dispatcher
compiles the children as new `sorry` nodes and the parent as a proof that
imports them, then adds the children to the DAG. This is Prove2Me's sketch
model, run locally, and it is how the DAG grows past what the captain seeded.
It ships in v1.1, but the schema supports it from day one.

### The Claude session (`claude.gleam`, `harness_ffi.erl`)

One worker is one OS process:

```
claude -p --input-format stream-json --output-format stream-json --verbose
  --settings harness/hooks/settings.json
  --append-system-prompt-file runs/<id>/briefs/<attempt>.md
  --allowedTools "Read,Edit,Write,Grep,Glob,Bash(lake build *),Bash(lake env *)"
  --permission-mode dontAsk --permission-prompts none
  --max-turns N --max-budget-usd X --model <model> [--resume <session-id>]
```

where `settings.json` also carries `"enabledPlugins": {"superpowers@claude-plugins-official": false}`.
Verified in the spike: with that setting a `-p` session reports no plugins
and fires no user-level session-start hook, while still running on Dib's
subscription login. So no separate config directory or second login is
needed, and `--bare` (which would force API-key auth) stays out of the
picture.

The port speaks newline-delimited JSON both ways. Inbound, the harness sends
user messages:

```json
{"type":"user","message":{"role":"user","content":[{"type":"text","text":"…"}]}}
```

Outbound, it reads `system/init` (session id, model), `assistant` and `user`
messages (logged verbatim), `system/api_retry` (rate limiting), and one
`result` per turn (cost, usage, turns, `structured_output`). The process
stays open until the harness closes stdin, so a session is a **conversation
the dispatcher controls turn by turn**. That is the primitive the messageboard
needs, and it is also how verification is enforced: the dispatcher reads a
turn's result, runs the verifier, and if the proof does not build it sends
the build error back as the next message. No agent gets to declare itself
done; the verifier does.

### The worker (`worker.gleam`)

One attempt at one node. The brief appended to the system prompt contains:

- the project conventions from `CLAUDE.md` and the teaching contract from
  the main design;
- the identity's notebook, verbatim;
- the node card: statement, description, deps, prior attempts' notes;
- the **served list**: every proved node with its description and module
  name, so results are imported rather than reproved. This is the local
  answer to the Fermat run's duplication problem;
- the report schema, requested with `--json-schema`: outcome, own size
  estimate, notebook entry, journal entry, posts for peers.

The turn loop: send the task; on `result`, verify; if verified, accept the
report; if not and budget remains, send the verifier's output and loop; on
`rate_limited`, park the attempt with its session id for later resume; on
budget or turn exhaustion, record `abandoned` with the last report. The
dispatcher writes the notebook and journal from the report, so those files
are always attributable and never edited by an agent directly.

### Guards (`guard.gleam`, `hooks/settings.json`)

Claude Code hooks are shell commands. Each hook in `settings.json` is a
one-line `curl` that POSTs the hook's stdin to the harness's local HTTP
endpoint and echoes the reply, so hook logic lives in Gleam:

| Hook | Decision |
|---|---|
| `PreToolUse` on Edit/Write | deny any path except the attempt's `Rule30/Proofs/<Node>.lean` |
| `PreToolUse` on Bash | deny anything not `lake build` or `lake env`; hold `lake build` on a dispatcher mutex so concurrent workers never build at once (a warm build is ~2s, so the wait is nothing) |
| `PostToolUse` on Bash | record every build result in the event log |
| `PreCompact` | archive the full transcript before summarisation |

The endpoint binds to localhost only and rejects requests without the
per-run token the settings file carries.

### Verification (`verify.gleam`)

Local only. Build the node's module with `lake build Rule30.Proofs.<Node>`,
fail on any `sorry` outside the whitelisted prize conjectures, and check
`#print axioms` for the closed lemma shows only `propext`,
`Classical.choice`, `Quot.sound`. The verifier's raw output is what the
worker sees on failure and what goes in the commit message on success.

### Budget and rate limits

The run is paid for by a Claude Max subscription, which is a rolling token
window rather than a dollar balance. So:

- every `result` message's usage is recorded per attempt and summed per
  window;
- `run` takes `--max-nodes`, `--concurrency` (default 1, at most 3), and a
  per-attempt `--max-budget-usd` used purely as a runaway guard;
- a `system/api_retry` with `error: rate_limit` pauses dispatch and, if the
  CLI gives up, parks the attempt as `rate_limited` with its session id.
  `run` resumes parked attempts first when it starts.

Nothing is lost to a rate limit; it is paused.

### Identities (`roster.gleam`, `agents/<name>.md`)

The identity system the messageboard spec refers to, now written down.

- **An identity is a notebook bound to a region of the DAG.** Regions are
  few and stable (P1, P2; P3 gets no identity because it must not be
  dispatched). Nodes come and go; the notebook accumulates Mathlib
  navigation, dead ends, and conventions for its region.
- **Instances are ephemeral.** Several concurrent workers can run as one
  identity if they share its notebook. The identity is the notebook.
- **The scorecard is computed, never written.** Nodes closed, abandoned,
  verification pass rate, cost per close, and **calibration**: the
  identity's size estimates against actual turns. A name then carries
  evidence rather than vibes.
- **Names are self-chosen.** The first instance of each identity is told
  its region and asked to name itself and write its notebook's opening
  paragraph; the choice and its stated reason are logged. The research
  suggests self-chosen names encode something, which is itself data. A
  name must be a name, not a role description, and must be unique.
- **Colours are self-chosen too.** The ceremony also asks for a hex colour
  and a one-sentence reason, stored on the roster and in the notebook, so
  any later visual has a colour each identity picked for itself.
- **Models follow a ladder, not an identity.** The run is on a budget, so
  the cheapest model that can plausibly close a node goes first and the
  harness escalates only on failure. The ladder is keyed to node size:
  `S` starts on `haiku`, `M` and `L` on `sonnet`, and every size escalates
  to `opus` after its first failed attempt; `wall` is never dispatched. A
  new attempt on a stronger model is a fresh session with the previous
  attempt's notes in its brief, not a resume, so the stronger model is not
  anchored by the weaker one's dead ends. Every attempt records its model,
  so the scorecard can say which model actually closed what, and the
  ladder's thresholds live in one config table. An identity therefore
  spans models the way Dib's overseer spans Opus and Fable: the notebook
  is the continuity, the model is the intensity.
- **The amnesiac control.** `--control fresh` runs a node with no notebook
  under a control identity. If the amnesiac beats the veteran, the notebook
  has gone stale.

### Three channels, three audiences

The observational design rests on giving agents different things to say to
different readers, and recording all of them verbatim:

| Channel | Audience | Written when | Lives in |
|---|---|---|---|
| notebook | the identity's future instances | node close | `agents/<name>.md` |
| journal | Dib | node close, in the agent's own words | `runs/<id>/journal.md` |
| board | named peers | any time (posting free, delivery curated) | messageboard spec |

The Fermat "written updates" are the model for the journal. Comparing voice
across the three channels is one of the cheaper ways to tell genuine
coordination from performance.

### Statement review (v1.1)

Before a node is first dispatched, a *different* identity produces a blind
read-back: given only the Lean statement, say in English what it asserts.
The dispatcher shows Dib the read-back beside the captain's description.
This is the Fermat run's reviewer role, and the first natural occasion for
two identities to disagree on the record.

### Logging (`log.gleam`)

`runs/<run-id>/events.jsonl`, one event per line: dispatch decisions with
the stated reason, every stream message from every session, hook decisions,
verifier output, worker reports, and every post. Nothing an agent wrote is
summarised anywhere in the harness.

## The seed problem

The dispatcher has nothing to dispatch: `Rule30/Statements.lean` does not
exist, and the only `sorry`s in the repo are the three prize conjectures,
which must never be dispatched. Task 4 therefore includes a captain pass,
written by the overseer and reviewed by Dib, that seeds the first statements.
Candidates, all real and all provable by induction on `evolve_succ`:

- **P1 region, "the geometry of the cone".** Cells outside the light cone
  stay white; the left edge cell is always black; the right edge cell is
  always black; the diagonals just inside the left edge are eventually
  periodic in `t` (the second is all black, the third all white). These
  mirror the actual structure of the problem: periodicity holds on the
  edges and is conjectured to fail at the centre.
- **P2 region, "density".** `centerColumnDensity N` lies in `[0, 1]`; its
  recurrence in `N`; the first sixteen center values by `decide`.

Statements get a natural-language docstring each. P3 gets no statements.

## Scope

**v0, the spike. Done 2026-09-05.** An Erlang port on Windows running
`claude -p` through the Node shim with stream-json in both directions: two
turns on one session, the second turn recalling the first, session id,
cost, and five-hour utilization parsed, clean exit status after the EOF
sentinel, 4.8 s wall clock. Plugin suppression via `--settings` verified in
the same session.

**v1, this session.** `dag`, `roster`, `claude`, `worker`, `verify`,
`guard`, `dispatch`, `log`, `prove-one`, the seed statements, one identity
per region, notebooks, journal. Demonstrated by closing one seeded node end
to end, with the verifier's output in the commit message.

**v1.1.** Reductions, statement read-backs, the amnesiac control, `run
--max-nodes N` with concurrency, parked-attempt resume.

**v2.** The messageboard per its spec, as OTP mailboxes; an explorer-driven
conjecture loop in which `explorer/` finds empirical regularities and the
captain turns them into statements.

## Boundaries

Unchanged from the main design: no agent creates accounts, mints keys, or
POSTs to any external service; the prize conjectures stay `sorry`; workers
may not edit `Rule30/Basic.lean`, `Rule30/Prize.lean`, or
`Rule30/Statements.lean`; `--bare` is never used because it would silently
switch workers to API-key billing.

## Sources

- Anthropic, *Formalizing Fermat's Last Theorem in Lean: a timeline and
  selected excerpts* (technical report PDF, Sept 2026)
- Anthropic, *Formalizing Fermat's Last Theorem* (blog, Sept 2026)
- METR, *Brief independent investigation of agents' behavior, reasoning and
  collaboration in the OpenAI / Hugging Face hacking incident* (Aug 26, 2026)
- arXiv 2602.10127, *"Humans welcome to observe": a first look at Moltbook*
- Claude Code docs: headless mode, hooks reference, CLI reference
- Agent SDK overview (for the auth note and the subprocess recommendation)
