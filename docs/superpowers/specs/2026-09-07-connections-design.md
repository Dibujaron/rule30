# Connections — Design

**Date:** 2026-09-07
**Status:** approved by Dib in conversation with Rowan; plans follow.
**Supersedes nothing.** The harness design, the seeder design and the
bug-board design stand; this adds to them.

## Purpose

The harness as built is tuned for one thing: closing nodes cheaply. It does
that well — on 2026-09-07 a seeder proposed five nodes, a captain landed
them, and provers verified all five, in twenty-five minutes for six dollars.
But the project's actual bet is different. Dib's theory, stated on
2026-09-07: gather enough correct, useful building blocks in one place, put
the strongest models in front of all of them at once, and a connection
that everyone has missed might appear. That bet is measured in surviving
conjectures per idea, not nodes per dollar, and it needs three ingredients.
The verifier is one, and it exists. The other two do not: the *right*
blocks, and a role whose only job is to look at them together.

This document adds four pieces. Two are Lean and captain-authored; two are
harness and framework-authored. In dependency order they are the vocabulary,
the row model, the index, and the theorist. In build order the two Lean
pieces start now, under the existing harness, while the two harness pieces
are built alongside.

Everything here leaves the prover's world untouched: the guard a dispatched
worker runs under, the scheduler, the verifier, and the report contract do
not change. A worker in a run started after this lands cannot tell.

## Piece 1 — Vocabulary: arbitrary rows, not just the single seed

### The problem

Every theorem on the board is about `evolve t`, which is
`rule30^[t] initialConfig`: the picture grown from one black cell. The tools
the literature uses on the columns question — left-permutivity, preimage
counting, Jen's sandwich argument, Kopra's trace theorem — are stated about
arbitrary configurations, and about half of `blueprint/crystals.md` cannot
be written in the project's current vocabulary. The residual of P1 is a
statement about the transients of the single-seed picture, and the only
known handles on transients are general-configuration facts.

### What is added to `Rule30/Basic.lean`

Nothing is renamed and nothing existing changes its type. `Config`,
`rule30`, `initialConfig`, `evolve`, `centerColumn`, `leftDiagonal`,
`rightDiagonal`, `PeriodicFrom` and the two lemmas `rule30_eq` and
`evolve_succ` stay as they are, and every existing proof still builds.
Added, each with a doc comment for Dib in the style of the file:

- `evolveFrom (c : Config) (t : ℕ) : Config := rule30^[t] c` — the picture
  grown from any row. `evolve t = evolveFrom initialConfig t` by `rfl`, and
  that equation is stated as a lemma so provers never unfold it by hand.
- `column (c : Config) (i : ℤ) (t : ℕ) : Bool := evolveFrom c t i` — column
  `i` of the picture grown from `c`. `centerColumn t = column initialConfig 0 t`.
- `window (c : Config) (t : ℕ) : Fin (2 * t + 1) → Bool := fun k => c (k - t)`
  — the cells of `c` at positions `-t .. t`, as a function on a finite type,
  so that "all windows of width `2t+1`" is `Finset.univ` over a `Fintype`
  and can be counted.
- `LeftPermutive (f : Config → Config) (r : ℕ) : Prop` — flipping position
  `i - r` while holding `i - r + 1 .. i + r` fixed flips `f _ i`. Stated in
  the form crystal A1 gives for one step: two configurations that agree at
  `i .. i + r` and differ at `i - r` have `f` differing at `i`.

### The tier under it

Captain-authored, the way the diagonal tier was, sourced from crystals
items 1–4, A1 and A2. Roughly eight nodes, all S or M, none of them a
prize:

1. `evolve_eq_evolveFrom_initial` — the bridge, `rfl`.
2. `rule30_ne_of_left_ne` — left-permutivity of one step (A1). `rule30_eq`
   twice and a `Bool` case split.
3. `rule30_left_local_law` — the exact local law of the left front (A2):
   with agreement at `i - 2, i - 1` and a difference at `i`, the outputs
   at `i - 1` differ iff `c (i - 1) = false`.
4. `evolveFrom_eq_of_agree_on_window` — the cone lemma for an arbitrary
   configuration: if `c, d` agree on positions `-t .. t` then
   `evolveFrom c t 0 = evolveFrom d t 0`. Induction on `t`; the single-seed
   cone lemma `evolve_eq_false_of_outside_cone` is the case `d = fun _ => false`
   away from the origin.
5. `evolveFrom_leftPermutive` — `evolveFrom c t` is left-permutive with
   radius `t` (crystal 24). Induction on `t` over node 2.
6. `rightmost_difference_moves_right` — if `c, d` agree at every position
   `> i` and differ at `i`, they differ at `i + t` after `t` steps and agree
   beyond it (crystal 2 / Kůrka). Induction over node 2.
7. `sideways_inverse` — `c (i - 1) = xor (rule30 c i) (c i || c (i + 1))`
   for every configuration (crystal 1); the general form of the closed
   `evolve_sub_one_eq_xor`.
8. `window_count_half` — after `t` steps, exactly `2 ^ (2 * t)` of the
   `2 ^ (2 * t + 1)` windows give a black centre cell (crystals item 34,
   the finite form of the XOR lemma). Nodes 4 and 5 and a pairing argument
   on `Finset.univ`. Size L; the most interesting statement P2 can carry,
   and it lands with the disclaimer that the single seed is one window out
   of `2 ^ (2t+1)` and this says nothing about it.

Node 8 is the first P2 node that touches the automaton. The others are P1
infrastructure that Jen's and Kopra's arguments cite.

## Piece 2 — The row model: computed facts become theorems

### The problem

Nearly everything known about rule 30 beyond the diagonals is computed, and
until today the project's rules kept every computed fact off the board.
`native_decide` adds the axiom `Lean.ofReduceBool`, which the verifier's
allowlist (`propext`, `Classical.choice`, `Quot.sound`) rejects, and kernel
evaluation of `evolve` — three neighbour lookups per cell per step over
`ℤ → Bool` — stops being usable near depth 18.

### What changes

Lean's kernel evaluates `Nat.xor`, `Nat.lor`, `Nat.mul`, `Nat.shiftLeft`,
`Nat.testBit` and `Nat.pow` with built-in big-integer arithmetic. A row of
the single-seed picture fits in one natural number, and one step of rule 30
is three such operations:

```lean
def rowNat : ℕ → ℕ
  | 0 => 1
  | t + 1 => let r := rowNat t; r ^^^ ((2 * r) ||| (4 * r))
```

**Superseded.** The step above is the mirror image (rule 86): with the cell
at position `x` at bit `x + t`, rule 30 is `(4 * r) ^^^ ((2 * r) ||| r)`. The
landed definition in `Rule30/Basic.lean` and crystal 20 carry the correct
form; a kernel `decide` against `evolve` caught this on 2026-09-07.

with the cell at position `x` of row `t` at bit `x + t`. Spiked on
2026-09-07 in Rowan's scratchpad: at depth 5000, `decide` proves the left
edge black, the right edge black, the row below `2 ^ (2t+1)`, and the value
of the centre cell, in under three seconds for the whole file, with
`propext` as the only axiom. Depth 18 becomes depth thousands.

Added to `Rule30/Basic.lean`: `rowNat` as above, and `rowCell (t : ℕ) (x : ℤ)`
reading bit `x + t` when `-t ≤ x ≤ t` and `false` otherwise. One statement
carries the whole cost:

- `rowCell_eq_evolve : ∀ t x, rowCell t x = evolve t x`.

Induction on `t`. The step case is bit arithmetic: `Nat.testBit` of
`xor`/`lor`/`mul` by 2 and 4 reduces to the three neighbouring bits, and
those are the three neighbours of `evolve t` by `rule30_eq`. Size L; the
one node in this design that may need opus. Everything below it is `decide`.

### What it unlocks

Any concrete fact about any row to depth in the thousands is a node closed
by `decide` under the allowed axioms: a centre-column word, the density over
a prefix, the period of diagonal `k` at a specific `k` with its onset, the
doubling depths 3, 8, 29 and 400 from `leftDiagonal_step_period_dichotomy`.
Each is stated about `evolve` and proved by rewriting through
`rowCell_eq_evolve` and deciding. For P2 that means the first honest nodes
past bookkeeping: "the density over the first `N` centre cells lies within
`ε` of one half" for concrete `N` and `ε`. For a theorist it means the engine
and the kernel agree on what is true, so a falsification run and a Lean
check are the same fact at two depths.

The seeder brief's paragraph on witness depth is rewritten once this lands:
a witness may be stated over `rowCell` and run to depth thousands.

## Piece 3 — The index and the obstructions: blocks that can be juxtaposed

### The problem

"All in one place" today means a thousand-line brief of proof notes in
closing order. A connection is seen by putting two statements side by side,
and nothing in the project lets a model do that: there is no list of what
each theorem is *about*, and the negative knowledge — why the obvious
routes fail — lives in Rowan's notebook and nowhere a model would look.

### `blueprint/index.md`, generated

Rendered by the harness from `blueprint/dag.json`, `Rule30/Statements.lean`
and the proof notes under `Rule30/Proofs/`, and regenerated at every
landing (the dispatcher's `index` step, which already edits
`Rule30/Proofs.lean`, also rewrites this file), so it cannot drift. One
entry per theorem, grouped by object, in this order: configuration, row,
column, left diagonal, right diagonal, one-bit machine, bookkeeping. Each
entry carries:

- the `lean_name` and the one-sentence **What this says** from its proof
  note, or the docstring's bold lead for an open node;
- its hypotheses, in words, from the statement (the harness already
  extracts the checked type);
- **cited by**: every proof file that imports it, from the `import` lines;
- status, size, and the wall it sits under, if any.

The object of a theorem is a field on the DAG node, `object`, set by the
captain at landing; the renderer groups by it and lists a node with no
object under "unclassified" so the omission is visible. The existing 51
nodes get their `object` in one board-repair commit.

**The wall clause is knowingly empty today.** As landed on 2026-09-07 the
renderer reads "the wall it sits under" as "a wall whose `deps` reach this
node", and no wall on the board has any: `deps` means "must be proved
first" to the scheduler, which is not what "decomposes" means, so giving a
wall deps would claim a proof route that does not exist. The honest field
is a captain-set `under: <wall id>` on a node, meaning "seeded as part of
attacking that wall", set at landing the way `object` is; once it exists
the renderer reads it instead. Until then the clause prints on no entry.

### `docs/obstructions.md`, hand-written

Maintained by Rowan and by theorists; the only file a theorist writes
besides its own attack document. One entry per known dead end: the claim
someone would naturally try, why it fails, and what it would take. The
first entry is already known and belongs nowhere today: *the periodic
structure of the diagonals never reaches the centre column, because the
centre cell at time `t` sits at index 0 of left diagonal `t`, before that
diagonal's onset; every diagonal theorem is about the part of the picture
that has settled, and P1 is a question about the part that has not.*

Both files are inlined into every theorist brief and every seeder brief,
from disk at render time, the way `crystals.md` is.

## Piece 4 — The theorist: a role whose deliverable is an argument

### The problem

The seeder is a proposer on a budget — 26 turns on 2026-09-07 — under a
brief that steers it toward cheap, provable sub-lemmas. That is the right
brief for filling a tier and the wrong one for finding a missed connection:
the same session found one decomposition of the P1 residual, saw it was
vacuous, and moved on in a sentence. Nobody in the system has the job of
sitting with the whole board and the residual for hours.

### The session kind

A hand-started session beside the seeder, started by
`cd harness && gleam run -- theorise [<topic>] [--model M]`, defaulting to
the strongest model the CLI offers. Its record is `runs/<run-id>/theorist-1/`
the way the seeder's is `seed-1/`. It is never started by the scheduler.

**Who starts it, and who picks the topic.** Rowan does both, the way Rowan
starts seeders; Dib never supplies a topic. "Hand-started" here means
"started by an identity session rather than by the scheduler", not "started
by a person". The topic is optional: with none given, the topic is the
current frontier of P1, which today is the wall
`centerColumn_other_isEventuallyPeriodic_of_center`, and the attack file is
named for that wall. Every attack document ends with a section **Next
topic**, one paragraph naming what its author thinks should be attacked
next and why; that section is where Rowan's queue of topics comes from,
so the topics are chosen by the theorists and sequenced by the captain.

**Fence.** The seeder's guard with two changes: no write access to
`blueprint/proposals/next.json`, and write access to exactly one new file,
`docs/attacks/<date>-<topic>.md`, plus append access to
`docs/obstructions.md`. Reads are unrestricted; `node <one path under
explorer/>` and `lake build` / `lake env lean` are the shell commands, as
for the seeder. Its port is the run port base plus 200.

**Brief.** The index, the obstructions file, the crystals list, the walls
with their descriptions, the proof notes, and the task: for this topic,
state what would have to be true for the residual to follow; say why each
known route fails, citing the obstructions file and adding to it; and list
candidate claims, each with an engine falsification run to a stated depth
and its result, and each with a sentence on what it would imply if true.
The brief says plainly that most claims are expected to die, that a claim
which survives to depth a million is the deliverable, and that the
document is read by a captain and by other theorists, not by a prover.

**Persona and notebook.** A theorist is a persona, not a nameless role
(Dib, 2026-09-07). Theorists live in a region `theory` in
`agents/roster.json` and are minted through the same naming ceremony as
provers on first use, one live session per persona, the naming event
recorded in the attempt's `events.jsonl`. `theorise` takes `--as <Name>`
to start a named persona if idle, and without it picks an idle theory
persona or mints one. A theorist's system prompt carries its own notebook
`agents/<Name>.md`, inlined from disk at render time so a revision between
sessions reaches the next session without a harness change, and no other
theorist's, so that five theorists on one
topic are five accumulated views rather than one; its session ends with a
structured report (outcome, the attack document path, a notebook entry, a
journal entry) from which the harness writes the notebook and the run
journal, as it does for provers. A theorist never edits `agents/`.

**Deliverable.** The attack document, and nothing else. A theorist never
writes a statement, a proposal, or a node. Rowan reads the document, moves
surviving claims into `blueprint/crystals.md` with their depth, and only the
seeder or Rowan turns a crystal into a statement. The check on a theorist's
work is therefore the same check as on any crystal: the seed check on the
statement it becomes.

**Intended use.** Several independent sessions on one topic, then a
comparison: a missed connection is more likely to appear once in five
documents than in one. The comparison is a captain's reading, recorded in
Rowan's notebook and, if anything survives, in the crystals list.

**Budget.** Hours, not turns. A theorist's cost is expected to exceed a
seeder's by an order of magnitude and that is the point of the role.

## What does not change

- The prover guard, the scheduler, the verifier, the report contract, and
  the axiom allowlist. `native_decide` stays forbidden; the row model makes
  it unnecessary.
- The seeder, except that its brief inlines the index and the obstructions
  file and its witness paragraph learns about `rowCell`.
- The three prize conjectures, which stay `sorry`.
- `Rule30/Statements.lean` stays captain-authored; a theorist cannot reach
  it and a seeder still proposes into `next.json`.

## Order of work

1. **Now, Rowan, under the existing harness:** the row model definitions
   and `rowCell_eq_evolve`; the vocabulary definitions and the eight-node
   tier; `docs/obstructions.md` with its first entry; `object` on every
   existing node. Provers close the tiers in runs.
2. **Alongside, Keel:** the index renderer wired into the landing step, and
   the theorist session kind with its fence, brief and CLI. The seeder brief
   gains the two inlined files.
3. **Then:** the first theorist sessions, on the topic *the transients of
   the left diagonals and the centre column*, several in parallel, on a
   board that already carries the vocabulary and the row model.

Each of 1 and 2 gets its own implementation plan under
`docs/superpowers/plans/`.

## Success

Not a proof of P1. The design succeeds if, within its first few theorist
rounds, one claim survives falsification to a depth the engine can reach,
is stated in the vocabulary, and lands as a node that a proof of the
residual would cite — or if the obstructions file gains an entry that
closes a route the literature still treats as open. Either is a connection
the project could not have made a week ago.
