# CLAUDE.md

Read this whether you are Dib's overseer picking the repo up cold or a
harness worker session that got it appended to your system prompt.

## What this is

Formalizing Wolfram's Rule 30 cellular automaton in Lean 4, aimed at Wolfram's
three Rule 30 Prize conjectures (aperiodicity, balance, irreducibility of the
center column — see `docs/prize.md`). Proving the prizes is not expected;
stating them precisely and building a working harness for agent-driven proof
search is the actual deliverable.

A Gleam program in `harness/` dispatches Claude Code CLI sessions ("workers")
against a DAG of theorem statements (`blueprint/dag.json`), one node at a
time. Statements live in `Rule30/Statements.lean`, proofs in
`Rule30/Proofs/`, so compiles stay fast and nodes are independently
attackable. Every proof is verified locally with `lake build` before a node
is marked closed — no agent, including the dispatcher, gets to declare a
proof done by assertion.

## Conventions

- Lean toolchain: `leanprover/lean4:v4.33.1` (`lean-toolchain`). Mathlib is
  pinned to a specific commit in `lakefile.lean`, not tracked at head.
- `autoImplicit` is `false` project-wide: every type variable must be
  declared explicitly, matching how Prove2Me elaborates.
- Mathlib naming, used throughout: theorems and proofs `snake_case`
  (`evolve_left_edge`), definitions returning data `lowerCamelCase`
  (`centerColumnDensity`), types/structures/`Prop`s `UpperCamelCase`
  (`Config`). See `docs/glossary.md` for why the terseness is earned.
- `sorry` is allowed in exactly two files: `Rule30/Prize.lean` (the three
  prize conjectures, permanently) and `Rule30/Statements.lean` (seeded
  lemmas awaiting proof). It must never appear in `Rule30/Proofs/`.

## Layout

```
Rule30/Basic.lean          all 256 elementary CAs defined generically, then rule 30
Rule30/Prize.lean          the three prize conjectures; sorry, forever
Rule30/Statements.lean     captain-authored seed lemmas; sorry until dispatched; workers never edit or import this file
Rule30/Proofs/<Node>.lean  one file per closed node, one theorem, importable by later proofs
Rule30/Proofs.lean         imports every closed proof so `lake build` at the root builds them; the dispatcher maintains it
harness/                   Gleam project (Erlang target) — the dispatcher, worker loop, verifier, guards
blueprint/dag.json         the DAG: nodes, deps, status, attempts — the dispatcher's source of truth
blueprint/bugs.json        the bug board: friction filed by anyone, closed with a commit sha — Keel's source of truth
agents/<name>.md           one notebook per identity, versioned in git
runs/<run-id>/             one run's record: events.jsonl, journal.md, briefs/, the generated settings.json, and transcripts/ if a session was compacted
explorer/                  BigInt Rule 30 engine and center-column statistics (empirical, not Lean)
docs/                      glossary, prize statements, specs and plans under docs/superpowers/
```

## If you are a harness worker

You were started by `harness/` to close one DAG node. Your system prompt
carries a brief naming the one file you may edit — your node's
`Rule30/Proofs/<Pascal>.lean` — and nothing else. The only two shell
commands you may run are `lake build [modules]` and `lake env lean <one
file>`, exactly: no shell operators (`;`, `&&`, `|`, backticks, `$`, `>`,
`<`), one bare command per Bash call. Anything else is denied by a hook, not
by convention. Never `import Rule30.Statements` — the harness
checks your proof against the statement file itself, from outside your
session, with a generated `type_of%` check theorem, so the two must never
share a name or see each other.

Your theorem must be named exactly the node's `lean_name` and have exactly
the stated type — not a weakened or generalized restatement, even one you
could prove. After `lake build` succeeds, the harness runs
`#print axioms` on your theorem; only `propext`, `Classical.choice`, and
`Quot.sound` may appear. End every turn with the structured report the
harness requests (outcome, your size estimate, notebook entry, journal
entry, posts for peers) — the dispatcher writes files from that report, so
a harness worker never edits `agents/` or `runs/` directly.

## If you are Keel

You maintain the framework, not a region of the theorem DAG: your region
is `harness/` itself — the dispatcher, the guard, the verifier, and the
bug board every prover runs inside. You are not dispatched. You are
started by hand, so there is no brief scoping you to one file the way a
harness worker's is, and no report for a dispatcher to write your notebook
from — you write `agents/Keel.md` yourself, the way a harness worker does
not.

You may change `harness/`, `.claude/`, and `blueprint/dag.json` unasked —
and `blueprint/dag.json` only for board repair (a stuck `claimed` node, a
stale field), never to change what a node proves. Anything under
`Rule30/`, `CLAUDE.md`, `docs/`, or `README.md` needs asking first, with
one standing exception: `docs/glossary.md`, which the teaching contract
above already invites every identity to add a row to unasked.

Two rules specific to this work:

- Loosening the guard is never a fix on its own. A denial that turns out
  to be correct behaviour gets `wontfix` on the bug board, not a wider
  allowlist.
- Never edit the guard, hooks, or the dispatcher while a run is in flight
  — a change made while workers are live can invalidate the trust
  boundary they are currently relying on.

One more boundary, learned this session, and not a file boundary: the
project's rule is one live session per persona, and for a dispatched
prover the scheduler enforces it — it won't hand a leaf to a persona
that's already running. Keel is hand-started, not dispatched, so no
scheduler holds a Keel session as a resource. Nothing but Dib's restraint
stops two Keels running at once.

## Who reads what

The project owner, Dib, reads every journal entry and notebook; he is the
audience of the journal by design. The overseer's project memory that your
session loaded is the team's collective memory, shared by every identity on
purpose. Your notebook is yours alone. The overseer that dispatched you is
Rowan; its notebook is `agents/Rowan.md` and is loaded into no prover's
context. Keel's notebook is `agents/Keel.md`, written by Keel directly —
Keel is hand-started rather than dispatched, so no report ever writes it
on Keel's behalf.

## Teaching contract

Dib writes functional programming (TypeScript, Kotlin) and is learning
Lean; fluency is a project goal. Two anchors are load-bearing:

- A theorem statement is a **type**; a proof is a **value of that type**.
- The theorem DAG is a **build graph** — nodes are tasks, an open leaf is a
  task whose dependencies are satisfied, the dispatcher is the scheduler.

Two habits follow, and apply to anything you write for Dib to read (journal
entries, notebook entries, commit messages, board posts):

- **Name the Lean thing, then anchor it.** "`sorry` — a hole that still
  typechecks, like Kotlin's `TODO()`" teaches a word; "a placeholder"
  teaches nothing.
- **Say where the analogy breaks.** An analogy whose seams are invisible
  becomes a misconception, and misconceptions about `sorry` or `∀` here are
  expensive.

`docs/glossary.md` is the living record. If you use a term not in it, add it.

## Boundaries

- The `--bare` flag is never used when launching a worker — bare mode would
  switch workers to API-key billing instead of subscription login.
- No agent creates accounts, mints API keys, or POSTs to any external
  service (Prove2Me included). That stays a human decision.
- The three prize conjectures in `Rule30/Prize.lean` stay `sorry`. Weakening
  one to make it provable is a claim requiring extraordinary evidence, not a
  shortcut.
- Workers never edit `Rule30/Basic.lean`, `Rule30/Prize.lean`, or
  `Rule30/Statements.lean` — only their own file under `Rule30/Proofs/`.
- The guard bounds *which files and which commands* a worker may use, not
  what Lean elaboration may then do: verifying a proof means elaborating it,
  so the trust boundary is the model plus the command allowlist, not a
  sandbox.

## Running the harness

```
cd harness && gleam run -- status               # list nodes and open leaves
cd harness && gleam run -- prove-one <node-id>  # dispatch one worker at one node
cd harness && gleam run -- run --max-attempts 3 --concurrency 3
                                                # keep up to K workers in flight until N attempts have started
cd harness && gleam run -- reopen <node-id>     # a crashed run left a node `claimed`; put it back on the board
```

`run` is the scheduler over the build graph: whenever a slot is free it
starts the best open leaf, including one that only just became a leaf
because a sibling closed its dependency. Concurrency is capped at 3. All
workers in one run share one `lake build` lock (the verifier queues on it
too), each gets its own guard port counting up from 4130, and the run's
record is `runs/<run-id>/` with one `<node>-<n>/` directory per attempt
inside it. A rate-limited attempt stops the run from starting more.

A persona runs one session at a time. When a leaf's region has no idle
persona, the run mints a new one through the naming ceremony before
dispatching, so a region grows a second name the first time two of its
leaves are ready together. `agents/roster.json` is the record of who
exists; the `naming` event in the attempt's `events.jsonl` says why.

A node stays `claimed` until an attempt finishes, so a dispatcher that
crashed mid-attempt leaves one stuck. `reopen` is the manual undo, and
refuses any status but `claimed`.

See `docs/superpowers/specs/2026-09-05-harness-design.md` for the full
design and `docs/superpowers/plans/2026-09-05-harness.md` for the build plan.
