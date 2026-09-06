# rule30

Formalizing Wolfram's Rule 30 cellular automaton in Lean 4, with a harness that
lets Claude agents do the proving.

> Rule 30 is the canonical example of a trivially simple rule producing
> apparently irreducible complexity. Its center column has resisted analysis
> since 1983.

## Status

**Harness v1.** `prove-one` closes seeded nodes: given a node id from
`blueprint/dag.json`, the dispatcher runs one Claude Code worker session
against it, verifies the result with `lake build` and an axiom check, and
records the outcome. See
[`docs/superpowers/specs/2026-09-05-harness-design.md`](docs/superpowers/specs/2026-09-05-harness-design.md)
for the design and
[`docs/superpowers/plans/2026-09-05-harness.md`](docs/superpowers/plans/2026-09-05-harness.md)
for the build plan. The Rule 30 formalization itself is designed in
[`docs/superpowers/specs/2026-09-05-rule30-design.md`](docs/superpowers/specs/2026-09-05-rule30-design.md).

## The ambition

[Wolfram's Rule 30 Prizes](https://writings.stephenwolfram.com/2019/10/announcing-the-rule-30-prizes/)
offer $10,000 each for three questions about the center column, all open:

1. **Aperiodicity** — does it ever become periodic?
2. **Balance** — does each color occur with equal asymptotic frequency?
3. **Irreducibility** — is there a shortcut, or must you simulate?

[`docs/prize.md`](docs/prize.md) explains all three in plain English, including
why P3 is far harder to *state* than the other two and must not be dispatched
as a solver goal.

Stating these precisely in Lean is the near-term deliverable. Proving them is
not expected. The realistic goal is a working harness, and fluency with the
tools.

## Approach

Cribbed from Anthropic's [Fermat's Last Theorem formalization](https://www.anthropic.com/research/formalizing-fermats-last-theorem)
(September 2026), whose load-bearing lesson was that their first attempt failed
for *harness* reasons rather than mathematical ones — agents lost track of
project state. [Prove2Me](https://arxiv.org/abs/2608.28433) fixed that. Three of
its ideas are adopted here:

- a **DAG of theorem statements** drives what to attempt next, so no agent has
  to hold global project state in context;
- **statements live in different files from proofs**, keeping compiles fast and
  nodes independently attackable;
- **every theorem carries a natural-language description**, so results get
  reused instead of silently reproved.

## Layout

```
Rule30/            Lean: all 256 elementary CAs defined generically, then rule 30
Rule30/Statements.lean  captain-authored seed lemmas, sorry until dispatched
Rule30/Proofs/     one file per closed node, one theorem each
Rule30/Proofs.lean imports every closed proof, so `lake build` at the root builds
                   them too; the dispatcher maintains the list
harness/ (Gleam)   the dispatcher, worker loop, verifier, guards — drives the
                   Claude Code CLI as a subprocess, not the Agent SDK
blueprint/dag.json the DAG: nodes, deps, status, attempts — dispatcher's source of truth
agents/            one notebook per identity, versioned in git
runs/              one directory per run: events.jsonl, journal.md, briefs/, the
                   generated settings.json, and transcripts/ if a session compacted
explorer/          BigInt Rule 30 engine and center-column statistics
docs/              glossary, prize statements, specs and plans
```

## Running the harness

```
cd harness && gleam run -- status               # list DAG nodes and open leaves
cd harness && gleam run -- prove-one <node-id>  # dispatch one worker at one node
cd harness && gleam run -- reopen <node-id>     # release a node a crashed run left `claimed`
cd harness && gleam run -- bugs                 # the harness's own bug board
cd harness && gleam run -- run --max-attempts 3 --concurrency 3
                                                # keep up to K workers in flight
```

`prove-one` runs a Claude Code session as one worker, restricted to editing
its node's `Rule30/Proofs/<Pascal>.lean` and running exactly
`lake build [modules]` or `lake env lean <one file>`, then verifies the
result locally and records it in `blueprint/dag.json`, `agents/<name>.md`,
`Rule30/Proofs.lean` and `runs/<run-id>/`. See `CLAUDE.md` for the worker
contract and conventions.

The guard behind those restrictions bounds which files and commands a worker
may use, not what Lean elaboration may do once it runs: verifying a proof
means elaborating it, so the trust boundary is the model plus the allowlist.

## Working in this repo

After cloning, enable the commit hook once:

```
git config core.hooksPath .githooks
```

`core.hooksPath` is local config rather than something git carries with the
repository, so every clone needs that line. The hook pushes each commit to
its own branch on `origin` and prints how far `main` has fallen behind. It
never pushes `main`: publishing there is a deliberate merge, so a branch can
be reviewed as a unit before it ships. Skip it for one commit with
`git commit --no-verify`, for a session with `HARNESS_NO_AUTOPUSH=1`, or
entirely with `git config --unset core.hooksPath`.

Several agent identities commit into one checkout, so two things are worth
knowing before you work in it. `agents/sessions.json` maps the opaque session
names to identities, which is how one session addresses another. And a live
`run` must not share the checkout with `gleam test`: the guard binds fixed
ports, and the test fixtures write into `Rule30/Proofs/`, where workers are
writing proofs. Point `HARNESS_REPO_ROOT` at this checkout from a git
worktree if you need to build or test while a run is in flight.

## Learning Lean from an FP background

[`docs/glossary.md`](docs/glossary.md) anchors Lean vocabulary to TypeScript
and Kotlin concepts, and marks where each analogy breaks down. The short
version: a theorem statement is a **type**, a proof is a **value of that
type**, and `sorry` is Kotlin's `TODO()` — which means **a build full of
`sorry` still passes**.

## Verification

The explorer's Rule 30 step is one line, and it reproduces
[OEIS A051023](https://oeis.org/A051023):

```js
next = (x << 1n) ^ (x | (x >> 1n))
```
