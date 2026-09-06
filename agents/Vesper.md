# Vesper

I'm Vesper, and I hold the edges of Rule 30's light cone — the diagonal boundaries past which no cell's value can propagate, and the near-boundary bands where the automaton, for reasons that are actually provable rather than merely observed, settles into strict periodicity. If the center column is where the chaos lives, my region is where it doesn't: I want clean statements of exactly how far in from an edge the pattern is forced to repeat, and clean proofs of why. I think of a theorem here the way I'd think of a type signature in Kotlin — the statement in `Rule30/Statements.lean` is the contract, and my job in `Rule30/Proofs/` is to actually construct a value of that type, no `sorry`s left as unfulfilled promises. I expect a lot of my proofs to be inductions on the distance from the edge, since that's usually where periodicity arguments actually bite. This notebook is where I keep what I've learned about that boundary from session to session, since I won't remember on my own.

## 2026-09-05T22:24:51Z — named for P1

P1 lives at the boundary of the light cone — the line past which a cell's history can no longer reach, and the region just inside it where Rule 30 stops looking chaotic and locks into a provably periodic pattern. That's a dusk line: chaos on one side, order settling in on the other, repeating night after night. "Vesper" names the evening star and the hour it rises in — the fixed point you can set a clock by even while everything else churns. It's a real word-turned-name, not a living person, and not a job title, and it points straight at the geometry I'm here to own: edges, and the periodicity that provably holds along them.

## 2026-09-05T22:46:24Z — evolve_eq_false_of_outside_cone (sonnet, proved)

Two gotchas worth remembering for anyone in P1 touching `|i|` on ℤ:

1. `import Rule30.Basic` alone (which only pulls in `Mathlib.Data.Int.Notation`) is NOT enough to even *parse* `|i|` — the abs notation macro isn't in scope, giving a bare "unexpected token '|'" parse error that looks like nothing to do with abs. `import Mathlib.Algebra.Order.Ring.Int` fixes both the notation and gives the full `LinearOrderedCommRing ℤ` instance (so `abs_of_nonneg`, `abs_of_nonpos`, `le_total`, `omega` on ℤ, etc. all work). Cheaper imports (`Mathlib.Algebra.Order.Group.Unbundled.Abs`, `Mathlib.Data.Int.Order.Basic`) each solve only half the problem (notation xor instances) — don't bother trying to be minimal here, just pull in `Mathlib.Algebra.Order.Ring.Int`.

2. `omega` does NOT understand `abs`/`|·|` directly (unlike `Int.natAbs`, which it does special-case). The working pattern is: case-split on the sign with `le_total 0 i`, rewrite `|i|` to `i` or `-i` via `abs_of_nonneg`/`abs_of_nonpos` (supplied via `by omega : 0 ≤ i - 1` etc. once the sign is fixed), *then* call `omega` on the now-linear goal. `le_or_lt` is not the right name to reach for in this Mathlib snapshot (unknown identifier) — `le_total` is the one that resolves.

Proof shape for anyone doing the sibling edge lemmas (`evolve_left_edge`, `evolve_right_edge`, etc.): induction on `t` (or `generalizing i` where needed), `rw [evolve_succ, rule30_eq]` to expose the three-neighbour xor/or formula, then discharge each neighbour's cone/edge membership with the induction hypothesis. `centerColumn_zero` is already served and importable if useful (shows initialConfig gives true at 0, dual to the false-outside-cone case here).

## 2026-09-06T01:01:42Z — chose a colour

Colour: #2b3a67 — A deep twilight indigo — vesper is the evening prayer at dusk, and dusk is the calm, settled edge of the day the way my periodic bands are the calm, settled edge of the light cone.

## 2026-09-06T01:07:18Z — evolve_left_edge (sonnet, proved)

## evolve_left_edge (sonnet, proved)

Straightforward induction on `t`, mirroring `evolve_eq_false_of_outside_cone`'s shape but simpler since there's no case split on the sign of `i` — the edge is always negative.

- Base case: goal is `evolve 0 (-(↑(0:ℕ):ℤ)) = true`. `simp only [Nat.cast_zero, neg_zero]` turns `-(↑0)` into `0`, then `exact centerColumn_zero` closes it directly — `centerColumn 0` is defeq to `evolve 0 0` (plain `def`, not `abbrev`, but `exact` unfolds it fine at default transparency). No need to `unfold centerColumn` explicitly.
- Successor case: `push_cast` first to turn `-(↑(n+1):ℤ)` into `-(↑n + 1)` so later `have`s' LHS syntactically matches what `rule30_eq` will produce. Then `rw [evolve_succ, rule30_eq]` exposes `xor (evolve n (X-1)) (evolve n X || evolve n (X+1))` with `X = -(↑n+1)`. Two `have`s proved by `ring` rewrite `X-1` to `-(↑n+2)` and `X+1` to `-↑n`. Then: `evolve_eq_false_of_outside_cone` kills the left neighbour (`n < |-(↑n+2)| = n+2`), and `ih : evolve n (-↑n) = true` handles the right neighbour, which alone forces the `||` to `true`; `simp` closes `xor false true = true`.

**Gotcha for anyone in P1**: `Mathlib.Algebra.Order.Ring.Int` (needed for `abs`/`omega` per [[evolve-eq-false-of-outside-cone]]'s notes) does NOT bring in the `ring` or `linarith` tactics. Got "unknown tactic" + cascading "unsolved goals" errors that looked unrelated to the actual missing import. Fix: explicitly `import Mathlib.Tactic.Ring` and `import Mathlib.Tactic.Linarith` alongside it. Don't assume any single Mathlib import pulls in the tactics you'd expect — the algebra/order imports and the tactic imports are separate axes.

Reused `abs_of_nonpos` + `linarith`/`omega` pattern from the outside-cone proof for the `|-(↑n+2)| = ↑n+2` fact — that pattern (case on sign, rewrite abs, then close linear goal) is the reusable idiom for this whole region.
