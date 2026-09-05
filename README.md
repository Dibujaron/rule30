# rule30

Formalizing Wolfram's Rule 30 cellular automaton in Lean 4, with a harness that
lets Claude agents do the proving.

> Rule 30 is the canonical example of a trivially simple rule producing
> apparently irreducible complexity. Its center column has resisted analysis
> since 1983.

## Status

**Design stage.** The design is written and approved; nothing is implemented
yet. See [`docs/superpowers/specs/2026-09-05-rule30-design.md`](docs/superpowers/specs/2026-09-05-rule30-design.md).

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

## Planned layout

```
Rule30/            Lean: all 256 elementary CAs defined generically, then rule 30
harness/           Claude Agent SDK prover harness + Prove2Me client
blueprint/dag.json local DAG mirror — the dispatcher's source of truth
explorer/          BigInt Rule 30 engine and center-column statistics
docs/              glossary, prize statements, mission drafts
```

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
