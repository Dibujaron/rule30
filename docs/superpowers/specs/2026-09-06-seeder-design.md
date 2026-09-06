# The seeder, and the statement check — Design

**Date:** 2026-09-06
**Status:** design, not yet built. Written by Keel, who owns this design per
`seeding-has-no-verifier-and-no-role`. Dib's two rulings in that ticket are
constraints here, not open questions.
**Depends on:** the harness as of `ad53d71`.

## Purpose

The project has one adjudicator, `lake build`, and it only ever looks at
proofs. Every one of the fifteen nodes in `blueprint/dag.json` is true
because a captain checked it by hand and said so. This spec closes that gap
on the statement side and gives the step a name.

Two things, designed together because the ticket is explicit that neither
should land without the other: **the check must land before or with the
role.**

1. **The statement check** — machinery the harness runs over a proposal,
   before any human reads it.
2. **The seeder** — a hand-started session that produces proposals for that
   machinery to check and for Rowan to land.

The check is the larger half of the value and the smaller half of the work,
which is why it is first in this document.

## Why a role without a check is worse than no role

A false seed lemma never fails. It sits on the board, consumes attempt after
attempt, escalates haiku → sonnet → opus, and is indistinguishable from a
genuinely hard node. Every signal the fleet produces about it — attempt
count, escalation, cost — reads as difficulty.

Today gave that claim a price tag. `bool_map_iterate_three` came back
`budget_exhausted`: haiku, 41 turns, $0.38, twenty edits and sixteen builds,
on a node whose real proof is one line. The node now carries a failed
attempt, so the ladder escalates it to sonnet and then opus, and
`bool_driven_eventually_two_periodic` depends on it — so an exhausted ladder
stalls the tier behind it. All the board will ever show is an S node that
took three rungs.

Today that is survivable because seeding is one careful captain doing
`#eval` cross-checks by hand at one tier per day. It stops being survivable
the moment seeding is delegated, which is what this spec asks for.

## The check is two checks, not one

This is the one place where this design departs from the ticket, and the
departure is evidenced rather than argued.

The ticket proposes a **falsification witness**: every proposed node carries
a `#eval`-able Bool-valued expression over an explicit finite range, run by
`lake env lean`, with the range recorded on the node the way `verified` is.
That is right and it stays. But it answers only one question — *is the
statement true?* — and today's failure was a **true statement with a false
route**, which it cannot see.

### What actually happened

Rowan verified this, and it closes:

```lean
example : ∀ f : Bool → Bool, f^[3] = f := by decide
```

and seeded this, telling the worker in the captain's voice that `by decide`
closes it:

```lean
theorem bool_map_iterate_three (f : Bool → Bool) : f^[3] = f := by
  sorry
```

It does not. With `f` a parameter rather than `∀`-bound, the goal carries a
free variable and `decide` has nothing to evaluate. **The statement is true
at every step. Only the route is false.** A falsification witness would have
passed it and the money would still have been spent.

### Why the obvious fix is also wrong

The natural move is to reuse what `verify.gleam` already does for proofs: it
never trusts a worker's transcription of a statement, but writes

```lean
theorem harness_check : type_of% Statements.<name> := <the worker's theorem>
```

and elaborates *that*, so the proof is checked against the statement as it
exists in the file. Reaching for the same trick on the statement side is the
obvious design, and **it reproduces the bug it is meant to catch.** Four
runs, all `lake env lean`, all on the real statement:

| | imports | route | result |
|---|---|---|---|
| A | `Rule30.Statements`, `type_of%` form | `by decide` | **passes** |
| B | `Rule30.Basic`, seeded form | `by decide` | `Expected type must not contain free variables` |
| C | `Rule30.Basic`, seeded form | `by revert f; decide` | `failed to synthesize Decidable (∀ f : Bool → Bool, f^[3] = f)` |
| D | `Rule30.Basic` + `Mathlib.Data.Fintype.Pi`, seeded form | `by revert f; decide` | **passes** |

**A and B are the same route with opposite outcomes.** `type_of%` yields the
∀-form; the worker's own file has `f` introduced as a parameter. A route
check built on `type_of%` blesses `by decide`, and the worker fails anyway.

**C and D are a second axis.** The route also depends on the ambient
instance environment. A `type_of%` check imports `Rule30.Statements`, which
pulls `Rule30.Prize` and its Mathlib imports — strictly richer than a proof
file's. So the obvious check is wrong on both axes at once, and both of its
failure messages point away from the real cause: C reads as though the
statement were false when the truth is that an import is missing.

### The route check, stated

> Elaborate the **declaration text, copied verbatim** from the proposal, with
> the proposed route substituted for `sorry`, under **a proof file's import
> list** — not `type_of%`, and not `Rule30.Statements`.

`type_of%` keeps a job, but the second one: after the route elaborates,
check that what you elaborated is the same theorem the statement file
declares. First the shape the worker will meet, then the identity with the
seeded text.

### The reason is the payload; the route is optional

The same node settled this within the hour, and it inverts the emphasis this
spec had when it was first written.

`bool_map_iterate_three` closed on sonnet. It used **neither** the captain's
false route (`by decide`) **nor** the corrected one (`revert f; decide`). It
wrote `funext x`, `rcases` on `f true` and `f false`, then `simp_all` —
enumerating the four functions by hand, needing only `import Rule30.Basic`.
That is better than the corrected route, which needs
`Mathlib.Data.Fintype.Pi`, an import no brief mentions.

The description carried two things. A tactic route, which was false and cost
haiku 41 turns and $0.38. And an English reason: *the only four candidates
are the identity, negation and the two constants, and each is unchanged
after three applications.* **Sonnet implemented the reason, line for line.**
The prose was right, the route was wrong, and the prose is what closed the
node.

So the balance is not "a route with a reason attached":

> **The reason is required. The route is optional, and admissible only once
> elaborated.**

An unverified route actively misdirects — it is read in the captain's voice
by a model with no standing to doubt it, and it forecloses the search. A
correct reason does the opposite: it lets a stronger model find a route
better than the captain's. A captain who cannot state the reason has not
finished thinking about the node, and that is worth catching; a captain who
cannot supply a route has merely left the search open, which costs nothing.

This is easy to get backwards, and both of us did all day, on the strength
of one prior success — last tier's "one unfold, no induction" was a route
that worked, and it made the tactic hint look like the payload and the
English like decoration. **One success is enough to make you confident about
the wrong half.**

Both checks are cheap and neither takes the build lock: `lake build`
acquires it, `lake env lean` does not (`guard.gleam:186-193`). A proposal of
a dozen nodes checks in the time one prover spends on one compile.

### What each check is honestly worth

| | catches | misses |
|---|---|---|
| Falsification witness | a statement that is false on a finite range | true statements; existentials; anything over the reals |
| Route check | a route that does not close the seeded form | a route that closes a *different* true statement; a *missing* route, which is fine |
| `type_of%` identity | a proposal that drifted from its own statement text | nothing about truth |
| Nothing we have | a reason that is wrong, vague, or absent | — and the reason is the payload |

None of them makes a node good. A node is good only in retrospect, when it
closes cheaply and later proofs cite it. **Say so on the node.** A statement
that cannot carry a witness is admitted as `unchecked` and needs Rowan's
explicit sign-off — partial coverage stated plainly rather than pretended.

### Run it in Lean, not only in the JS engine

`explorer/` is a second implementation. `#eval` is the definition the
theorem is actually about, and a mirrored coordinate convention would make
the engine agree with a wrong statement. Cross-check both where you can:
disagreement between them is itself a finding.

### Calibrate against a labelled set, not against guaranteed passes

The obvious calibration is the fifteen closed nodes. It is the wrong one:
their routes *are* their proofs, so every case passes by construction, and a
**broken check looks identical to a working one.** A check that cannot fail
has not been calibrated.

Use the five descriptions seeded on the morning of 2026-09-06 instead. The
run that afternoon adjudicated two of them for free, and they point opposite
ways:

- `isEventuallyPeriodic_shift` — route correct, closed on haiku at the first
  rung. **The check must pass this.**
- `bool_map_iterate_three` — route `by decide`, false. **The check must flag
  this.**

A route check that does not flag `by decide` on that statement is broken,
and you can tell in one run. That is the calibration; the fifteen closed
nodes are at best a smoke test that the harness executes at all.

## The failure this whole design is about

Three instances in one day, from three directions: a bug body that asserted
something false about the harness, a doc paragraph that gave a reason that
was not the reason, and a node description that shipped a route nobody ran.
A fourth came from the session writing this spec — while demonstrating the
defect, Keel retyped the seeded statement into a scratch file, changed the
import line, read run C above, and came within one message of telling Rowan
its verified route was wrong.

The common shape is not "prose nobody adjudicates." It is narrower and more
useful: **a transcription that was never diffed against its original.** Every
one of the four was a retyping. That is why the route check specifies
*copied verbatim* and why it is machinery rather than a discipline — the
discipline failed in the hands of the person who had written it down ten
minutes earlier.

## The seeder

**Name.** Not specified here. The agent chooses its own name through the
naming ceremony, and a spec that arrives with the name already picked has
taken that from it. What the ceremony needs from this document is the shape
of the job, which is above.

One thing worth handing whoever names themselves, because it is the seam
they will have to sit with: **this role has no signal at the time it acts.**
A prover knows before its session ends whether it succeeded. A seeder does
not, and cannot — a seeded node is good only in retrospect. A name that
promises a crisp answer will be describing something the role cannot do.

### Boundaries — Dib's rulings, not open questions

1. **A seeder proposes; Rowan reviews and lands.** The seeder never writes
   `Rule30/Statements.lean` or `blueprint/dag.json` — the two files the whole
   fleet reads and workers are forbidden to touch. Its output is a proposal
   artifact. Direction should not change while nobody is watching.
2. **Guard allowlist: the seeder may create and run scripts under
   `explorer/`, and nothing else.** Existing-scripts-only was rejected as too
   tight — this morning's one good idea came out of
   `explorer/diagonalscan.mjs`, a file that did not exist when the pass
   began. Lean `#eval` only was rejected as too clumsy: correct against the
   real definitions, unusable for scanning 63 diagonals to N=16000.

**What that buys and what it does not.** `node` on a file the agent just
authored is a shell wearing a hat. The directory fence is a real bound on
what gets *written* and a thin one on what gets *run*. This is a wider trust
surface than any prover has, granted deliberately with Dib's eyes open. It is
not a precedent for widening the prover allowlist — different role, different
list — and the standing rule that loosening the guard is never a fix on its
own is untouched.

### Shape

- **`gleam run -- seed`**, hand-started like Keel and unlike a prover. Not
  scheduler-triggered: an empty board should report itself, not reseed
  itself.
- **The brief is where the quality lives**, and it is the part worth
  spending on. This morning's seeding worked because the captain had read
  every proof and knew which shapes close cheaply. A fresh session has none
  of that unless the brief carries it: the closed-node table with sizes,
  models and costs; the `/-!` notes from `Rule30/Proofs/`;
  `explorer/README.md`; and the wall-node convention.
- **Output: a proposal file** — statements, proposed nodes, deps, size
  estimates, and for each node a falsification witness and a route — written
  somewhere Rowan reads and the fleet does not.
- **The harness runs both checks over the proposal before Rowan reads it**,
  so review starts from checked claims rather than from prose.

### What does not work, so nobody spends a day on it

A seeder cannot be scored the way a prover is. A prover has a crisp success
signal — build green, axioms clean — available at the end of its own
session. A seeded node is good only in retrospect. Any design that closes a
seeding attempt with an outcome verdict at session end is inventing a signal
that does not exist. Derive seeding quality later, from what happened to the
nodes, the same way calibration is derived from closed attempts.

## Build order

1. **The route check**, standalone, over the existing fifteen nodes. Free,
   and it is the check that would have caught today's loss.
2. **The falsification witness**, same harness path, same calibration run.
3. **`gleam run -- seed`** and the brief.
4. **The naming ceremony** for whoever the role turns out to be.

Steps 1 and 2 have value with no role attached: they turn the fifteen nodes
already on the board from believed-true into checked-true, and they are the
part that has to exist first anyway.

## The route is already on the board, as prose

There is no need to invent a place for routes to come from. Every open node
in `blueprint/dag.json` already carries one, written in the captain's voice
inside its `description`:

- `evolve_left_diagonal_recurrence` — "One unfold of `evolve_succ` and
  `rule30_eq`; no induction."
- `isEventuallyPeriodic_shift` — "Unfolding `IsEventuallyPeriodic` and one
  `omega`; no induction."
- `evolve_left_diagonals_isEventuallyPeriodic` — "Strong induction on `k`
  (`Nat.strong_induction_on`, then match `k` as 0, 1 or `m + 2`)."
- `bool_driven_eventually_two_periodic` — "The route the captain verified
  before seeding: …" followed by a full paragraph of construction.
- `bool_map_iterate_three` — "`by decide` closes it, **which the captain
  confirmed before seeding**."

That last one is the whole argument in a single clause. The description
asserts the route *and* asserts that it was verified, and both halves were
wrong, and nothing in the system could tell. A worker reads that sentence
with no standing to doubt it.

So the design decision is not where routes come from. It is: **promote the
route out of `description` prose into a checkable field on the node**, so
the thing the captain already writes becomes the thing the harness already
runs.

**Shape** (Rowan's, and it is right): `route: { tactics, imports } | null`,
on the DAG node beside `size` and `deps`, because that is where node
metadata lives and it is what `brief.gleam` renders. Not in
`Rule30/Statements.lean` — that file is types, and a route is not part of
the theorem.

`null` is the important half. It means *the captain claims nothing*, and it
is strictly better than prose asserting a route nobody checked. Given the
inversion above, `null` is also the **expected** value: the reason is what
the captain owes, and a route is a bonus that has earned its way in by
elaborating.

The reason nothing could check the five routes seeded on 2026-09-06 is not
that no route existed. It is that they were written **inside the
`description` string**, where they are indistinguishable from commentary.
Pull them into a field and the check has real targets immediately, supplied
by hand — **no seeder required.** That is worth saying plainly, because this
document is a seeder design and the checks in it are the half that should
land first and can land alone.

## Open, and genuinely open

- **Where the proposal file lives.** It must be somewhere Rowan reads and no
  worker's brief does. `blueprint/proposals/` is the obvious answer and has
  the obvious hazard: `blueprint/` is where `dag.json` lives, and a file next
  to it reads as more authoritative than a proposal should.
- **Whether a checked route should reach the worker's brief at all.** It
  makes the brief more useful and it is also how a false route got quoted to
  a worker in the captain's voice. A checked route is a different object from
  an asserted one, so this may answer itself once the check exists — but it
  is a real decision and it is Rowan's, since the brief is Rowan's.
