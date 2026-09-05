# The three Rule 30 Prize questions, in plain English

[Wolfram's Rule 30 Prizes](https://writings.stephenwolfram.com/2019/10/announcing-the-rule-30-prizes/)
(2019) offer $10,000 each for three questions. All three are open.

All three are about the **center column**: start from a single black cell on an
infinite white background, run rule 30, and read off the colour of the origin
cell at each step. That gives an infinite sequence of bits:

```
1,1,0,1,1,1,0,0,1,1,0,0,0,1,0,1,1,0,0,1,0,0,1,1,1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1,0, …
```

It is [OEIS A051023](https://oeis.org/A051023). Every question below asks
something about that one sequence.

The formal Lean statements live in [`Rule30/Prize.lean`](../Rule30/Prize.lean).
This file is the version you can read without Lean.

---

## P1 — Does it ever start repeating?

**The question.** The sequence looks random. Does it stay that way forever, or
does it eventually settle into a repeating cycle?

Note "eventually". Nobody thinks it repeats from the start. The question is
whether there is *any* point after which it cycles forever — a repeating tail
after any finite amount of mess. P1 is the claim that there is no such point.

**Why it is plausible but unproven.** Nobody has found a repeat, and the
sequence passes statistical randomness tests. But "we looked and didn't find
one" is not a proof, and there is no pigeonhole argument available: the
configuration is infinite, so the automaton never has to revisit a state.

**Status in this repo.** Stated, unproven. `explorer/periodscan.mjs` searches
for periods empirically and is explicit that finding none only rules out small
periods.

---

## P2 — Are there as many 1s as 0s?

**The question.** In the long run, does each colour occur equally often? That
is, does the fraction of 1s in the first *N* terms approach exactly 1/2?

**Status in this repo.** Stated, unproven. Empirically it looks true and
converges fast — at 200,000 generations the density is 0.500360. That is
consistent with the answer being yes and is *not* evidence that it is.

One judgement call worth knowing: this is sometimes read as the stronger claim
that the sequence is *statistically random* (every block of *k* bits appearing
with frequency 2⁻ᵏ). The formalization here states only the literal reading —
single-cell density tending to 1/2 — and says so in its docstring.

---

## P3 — Is there a shortcut?

**The question.** To learn the *n*th bit you can always just run the automaton
for *n* steps. Is there anything better? Any cleverer method that jumps ahead
without simulating?

Wolfram conjectures there is not: rule 30 is **computationally irreducible**,
and the only way to find out what it does is to do it.

**This is not a vacuous claim, because shortcuts do exist for other rules.**
Rule 90 — XOR of the two neighbours — draws Pascal's triangle mod 2 from a
single cell. Any cell of it is a binomial coefficient mod 2, computable
directly from the binary digits of the coordinates without simulating anything
at all. Same three-cell neighbourhood, same one-byte rule, and it simply falls
open. (`explorer/verify.mjs` checks the Pascal correspondence.) Rule 30 has
resisted every comparable attempt for forty years.

### Why P3 is much harder to *state* than P1 and P2

P1 and P2 are statements **about a sequence**. Lean already knows what
sequences, periodicity and limits are.

P3 is a statement **about every program that could ever be written**. Lean does
not hand you "algorithm" and "cost" for free — you have to build them, and
every choice changes what you have said.

### Two traps, both of which produce a statement that looks fine and is not

**1. Cost with nothing attached to it.** The obvious formalization is an
interface with a `run` and a `cost`, like:

```ts
interface CostModel {
  run(program: P, n: number): boolean   // what it computes
  cost(program: P, n: number): number   // what it costs
}
```

Nothing ties `cost` to `run`. So implement `cost: () => 0` and the conjecture
"every correct program costs at least *n*" is satisfied while proving nothing.
Moving the honesty requirement into the interface does not help either — that
field can be satisfied with `True`.

This makes the naive statement **false rather than approximate**, and false in
a way that looks authoritative. A solver would close it in ten minutes.

**2. How the input arrives.** If *n* is handed over as *n* tally marks, then
merely *reading the input* costs *n* steps and the bound holds automatically —
proven, meaningless. So *n* must arrive in binary, as about log *n* digits,
which means P3 asserts a running time **exponential in the size of its input**.
Same *n*, wildly different input size: the difference between a function taking
a list of *n* items and one taking the number *n*.

Two concrete consequences we hit:

- Mathlib's `Nat.Partrec.Code.evaln` cannot be used — its `evaln_bound` forces
  `n < k`, so cost ≥ *n* holds by construction and the conjecture is trivially
  true.
- Circuit size cannot be used either, and fails in the *opposite* direction: a
  circuit on log *n* input bits computes any such function in size
  O(*n* / log *n*), which is *below* linear, making the circuit-size analogue
  outright **false**. Only a uniform, time-based model says what Wolfram means.

### Status in this repo

`Prize.lean` states P3 against a hole that **nobody can fill**. Nobody can
prove it, and equally nobody can game it. That is deliberate: a placeholder
that cannot mislead beats a statement that can be trivially satisfied.

> **P3 is not a task. Do not put it in the DAG as a solver goal.**

Making it real means committing to a concrete uniform machine model with binary
input encoding and step-counted cost — plausibly on Mathlib's `Turing.TM0` /
`TM1`. That is a research question for someone who knows complexity theory, not
a formalization chore, and it needs expert review before any mission built on
it is published.

---

## What would actually count as progress

Not proving these. Realistic near-term contributions:

- Faithful, reviewed statements of P1 and P2 that a mathematician signs off on.
- A concrete machine model that makes P3 sayable at all.
- Named lemmas *around* the questions — properties of the evolution, the
  light cone, symmetry, or the relationship to rule 30's algebraic structure —
  that a real attack would eventually need.
