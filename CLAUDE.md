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
  (`ElementaryCA`). See `docs/glossary.md` for why the terseness is earned.
- `sorry` is allowed in exactly two files: `Rule30/Prize.lean` (the three
  prize conjectures, permanently) and `Rule30/Statements.lean` (seeded
  lemmas awaiting proof). It must never appear in `Rule30/Proofs/`.

## Layout

```
Rule30/Basic.lean          all 256 elementary CAs defined generically, then rule 30
Rule30/Prize.lean          the three prize conjectures; sorry, forever
Rule30/Statements.lean     captain-authored seed lemmas; sorry until dispatched; workers never edit or import this file
Rule30/Proofs/<Node>.lean  one file per closed node, one theorem, importable by later proofs
harness/                   Gleam project (Erlang target) — the dispatcher, worker loop, verifier, guards
blueprint/dag.json         the DAG: nodes, deps, status, attempts — the dispatcher's source of truth
agents/<name>.md           one notebook per identity, versioned in git
runs/<run-id>/             events.jsonl, journal.md, session transcripts for one run
explorer/                  BigInt Rule 30 engine and center-column statistics (empirical, not Lean)
docs/                      glossary, prize statements, specs and plans under docs/superpowers/
```

## If you are a harness worker

You were started by `harness/` to close one DAG node. Your system prompt
carries a brief naming the one file you may edit — your node's
`Rule30/Proofs/<Pascal>.lean` — and nothing else. You may run only
`lake build …` and `lake env …`; any other shell command is denied by a
hook, not by convention. Never `import Rule30.Statements` — the harness
checks your proof against the statement file itself, from outside your
session, with a generated `type_of%` check theorem, so the two must never
share a name or see each other.

Your theorem must be named exactly the node's `lean_name` and have exactly
the stated type — not a weakened or generalized restatement, even one you
could prove. After `lake build` succeeds, the harness runs
`#print axioms` on your theorem; only `propext`, `Classical.choice`, and
`Quot.sound` may appear. End every turn with the structured report the
harness requests (outcome, your size estimate, notebook entry, journal
entry) — the dispatcher writes files from that report, you don't edit
`agents/` or `runs/` yourself.

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

- No agent creates accounts, mints API keys, or POSTs to any external
  service (Prove2Me included). That stays a human decision.
- The three prize conjectures in `Rule30/Prize.lean` stay `sorry`. Weakening
  one to make it provable is a claim requiring extraordinary evidence, not a
  shortcut.
- Workers never edit `Rule30/Basic.lean`, `Rule30/Prize.lean`, or
  `Rule30/Statements.lean` — only their own file under `Rule30/Proofs/`.

## Running the harness

```
cd harness && gleam run -- status              # list nodes and open leaves
cd harness && gleam run -- prove-one <node-id>  # dispatch one worker at one node
```

See `docs/superpowers/specs/2026-09-05-harness-design.md` for the full
design and `docs/superpowers/plans/2026-09-05-harness.md` for the build plan.
