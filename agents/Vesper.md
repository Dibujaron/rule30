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

## 2026-09-06T01:53:41Z — evolve_left_second_diagonal (sonnet, proved)

This one was already fully written by attempt 1 before it hit the 5-hour rate limit; I just re-ran `lake build Rule30.Proofs.EvolveLeftSecondDiagonal` against the untouched file and it built clean on the first try. No changes needed. Worth noting for future P1 work: the harness's Bash guard rejects `cd <dir> && lake build ...` as a shell-operator violation — just run the bare `lake build <module>` command directly; the working directory is already correct.

Proof shape, one level shallower than `evolve_left_edge`'s induction — no induction needed here, just one `rw [evolve_succ, rule30_eq]` at `i = -(t:ℤ)` to expose `xor (evolve t (-(t:ℤ)-1)) (evolve t (-(t:ℤ)) || evolve t (-(t:ℤ)+1))`, then:
- `h1 : evolve t (-(t:ℤ) - 1) = false` via `evolve_eq_false_of_outside_cone`, using `abs_of_nonpos` + `linarith` to show `|-(t:ℤ)-1| = t+1 > t` (same case-on-sign-then-linarith idiom as the other P1 lemmas).
- `h2 : evolve t (-(t:ℤ)) = true` is exactly `evolve_left_edge t`, served — no need to reprove the edge fact.
- `rw [h1, h2]; simp` closes `xor false (true || _) = true` — simp knows `true || x = true` and `xor false true = true` without any hints.

This confirms the reusable P1 idiom is now three-deep: outside-cone (induction), left-edge (induction using outside-cone), second-diagonal (no induction, just one unfold using both served lemmas). The next diagonal out (third diagonal, distance 2 from edge) will likely need an actual induction again since the direct neighbour argument won't fully collapse — worth checking whether it needs a two-step unfold or an induction on t with a stronger IH.

## 2026-09-06T14:49:46Z — evolve_left_third_diagonal (sonnet, proved)

One-step unfold, no induction — same shallow shape as second-diagonal, one level further out.

Key insight: `t + 2` is not syntactically `?n + 1`, so `rw [evolve_succ]` won't match it directly — first rewrite with `have heq : t + 2 = t + 1 + 1 := by omega; rw [heq, ...]`. (Defeq might actually let `show`/`rw` see through numeral `2` vs `1+1` for `Nat`, but I didn't risk it — the explicit `heq` via `omega` is cheap and unambiguous, worth doing by default whenever a served lemma's `+1` shape needs to line up with a `+2` or higher goal.)

After `rw [heq, evolve_succ, rule30_eq]` at `i = -(t:ℤ)`, goal is `xor (evolve (t+1) (-(t:ℤ)-1)) (evolve (t+1) (-(t:ℤ)) || evolve (t+1) (-(t:ℤ)+1)) = false`. The trick: you never need the right-neighbour term at all.
- Left neighbour: `-(t:ℤ) - 1 = -((t+1:ℕ):ℤ)` (via `push_cast; ring`), so it's exactly `evolve_left_edge (t+1)` = `true`.
- Centre: exactly `evolve_left_second_diagonal t` = `true` (that lemma's statement is literally `evolve (t+1) (-(t:ℤ)) = true`, no massaging needed).
- `true || x = true` regardless of the right neighbour, and `xor true true = false` — `simp` closes it after `rw [h1, h2]` with zero hints.

So the pattern for the *next* diagonal out (4th, distance 3) is probably: the two innermost neighbours (left-edge-shifted and second-diagonal-shifted) will likely both resolve via served lemmas, but check whether `true || _` is still enough to collapse the `xor`, or whether the right-neighbour term (now one step further from the edge, possibly not `false` yet) actually needs pinning down. Worth checking `evolve_eq_false_of_outside_cone` doesn't apply that far in yet — distance from edge matters more than distance from origin here.

General reusable fact for P1: whenever a goal's Nat step-count is `t + k` for `k ≥ 2`, do `have heq : t + k = t + (k-1) + 1 := by omega; rw [heq, ...]` before `evolve_succ` — don't rely on defeq matching numerals through `rw`.

## 2026-09-06T15:18:09Z — evolve_left_diagonal_recurrence (haiku, proved)

Simplest possible proof shape: rewrite the Nat sum, then unfold the rule, then let `ring` handle the integer arithmetic inside function arguments.

The one gotcha: `Mathlib.Tactic.Ring` is a separate import from `Mathlib.Algebra.Order.Ring.Int` — the algebra imports don't bring in the tactic, so a bare `ring` or `ring_nf` gave "unknown tactic" until I added it. (Learned this again the hard way on `evolve_left_edge`, but forgot to save it before this proof — important to repeat: the algebra/order and tactic import axes are orthogonal in this version of Mathlib.)

The proof structure should anchor later diagonal lemmas: instead of re-deriving `-(i+1) - 1 = -(i+2)` each time, cite this lemma's arithmetic verification via `show ... from by ring`. This is the coordinate-shift dictionary.

Goal after `rw [show i+m+3 = (i+m+2)+1 from by omega, evolve_succ, rule30_eq]`:
```
(evolve (i + m + 2) (-(↑i + 1) - 1) ^^ (evolve (i + m + 2) (-(↑i + 1)) || evolve (i + m + 2) (-(↑i + 1) + 1))) =
  (evolve (i + m + 2) (-(↑i + 2)) ^^ (evolve (i + m + 2) (-(↑i + 1)) || evolve (i + m + 2) (-↑i)))
```

After `simp only [show -(↑i + 1 : ℤ) - 1 = -(↑i + 2 : ℤ) from by ring, show -(↑i + 1 : ℤ) + 1 = -(↑i : ℤ) from by ring]`, Lean sees both sides are syntactically identical and closes.

## 2026-09-06T15:22:05Z — evolve_left_fourth_diagonal (sonnet, proved)

First genuine induction in P1's diagonal series — the recurrence lemma `evolve_left_diagonal_recurrence` finally earns its keep as the "coordinate-shift dictionary" it was built to be.

**Finding the right (m, i) instantiation is the whole trick.** The recurrence's shape is `evolve (i+m+3) (-(i+1)) = xor (evolve (i+m+2) (-(i+2))) (evolve (i+m+2) (-(i+1)) || evolve (i+m+2) (-i))`. To land on the successor goal `evolve ((n+1)+3) (-(n+1))`, solve `i+1 = n+1` and `i+m+3 = (n+1)+3` simultaneously: i = n, m = 1. Once you plug that in, the three RHS terms are *exactly* the second diagonal (at n+2), third diagonal (at n+1), and fourth diagonal (at n, i.e. the induction hypothesis) — no residual arithmetic needed beyond `omega`-provable Nat reassociations (`n+1+2 = (n+2)+1` etc.) to align each served lemma's own `+1`/`+2` shape with the recurrence's `i+m+2` form, plus one `push_cast; ring` cast lemma per side to convert `-((k:ℕ):ℤ)` into `-((n:ℤ)+k)` form so `rw` can match syntactically. Same idiom as the third-diagonal proof, just three copies of it instead of one.

**Base case (t=0) used `decide` directly** on the raw, un-simplified goal `evolve (0+3) (-(↑(0:ℕ))) = decide (0 % 2 = 0)` — no `simp`/`norm_num` preprocessing needed. `decide` doesn't care about surface syntax (`0+3` vs `3`, `↑0` vs `0`); it just needs a `Decidable` instance for the whole equality (trivial: both sides are `Bool`), then the kernel evaluates everything by computation. Worth remembering as a shortcut for any base case that's a small concrete numeral — building the 7-cell-wide light cone for `evolve 3 0` by hand (nested `xor`/`||` over `initialConfig` at -3..3) is tedious and unnecessary when the numbers are this small; `decide` reduces it in under a second and adds no axioms (verified no `Native.decide` — it's ordinary kernel reduction, safe under the propext/Classical.choice/Quot.sound axiom cap).

**Closing the parity arithmetic**: after the recurrence collapses to `xor true (false || decide (n % 2 = 0)) = decide ((n+1) % 2 = 0)`, don't hand-simplify `xor`/`||` yourself — `rcases Nat.mod_two_eq_zero_or_one n with h | h <;> simp [h, Nat.add_mod]` closes both branches in one shot. `simp` uses `h : n % 2 = 0` (or `= 1`) as a rewrite rule wherever `n % 2` appears (including inside `decide (n % 2 = 0)` and, via `Nat.add_mod`, inside `(n+1) % 2`), then its built-in numeral simprocs finish the arithmetic and the `decide` reduction. `Nat.mod_two_eq_zero_or_one : ∀ n, n % 2 = 0 ∨ n % 2 = 1` resolved fine in this Mathlib snapshot — no import beyond what's already pulled in by `Rule30.Basic` + the diagonal lemma files was needed.

No new import gotchas this round — the combination of imports from `EvolveLeftThirdDiagonal` + `EvolveLeftDiagonalRecurrence` (`Rule30.Basic`, the three diagonal proof files, `Mathlib.Algebra.Order.Ring.Int`, `Mathlib.Tactic.Ring`) was sufficient; `omega` on ℕ and `Nat.mod_two_eq_zero_or_one` both came along for free, confirming [[evolve-left-edge]]'s note that `omega` itself doesn't need a separate import (core Lean), only the ℤ-specific instances/notation do.

This closes the "first non-constant diagonal" node. Next diagonal out (fifth, distance 4) will likely need the recurrence again but should reuse *this* lemma as one of its three RHS terms instead of `ih` directly on the third diagonal — worth checking whether the parity pattern continues or breaks into a longer period once a fourth distinct diagonal value enters the mix.

## 2026-09-06T15:35:17Z — evolve_left_fourth_diagonal_isEventuallyPeriodic (haiku, proved)

`IsEventuallyPeriodic` is the **first inhabited instance** of the aperiodicity predicate that Rule30/Prize defines for the conjecture. It does not touch the center column; it proves the *predicate itself* is satisfiable by a sequence in the project — in this case, the fourth left diagonal, which provably alternates with period 2.

The definition: `∃ p > 0, ∃ N, ∀ n ≥ N, f (n + p) = f n` — three existentials, all of which must be provided.

**Proof shape**: straight instantiation.
- `use 2` for period, then `omega` to discharge `2 > 0`.
- `use 0` for the starting point (the pattern holds from n=0 onward, no prefix needed).
- For each n ≥ 0, show `f(n+2) = f(n)` via:
  - `have h1 : evolve ((n + 2) + 3) (-(↑(n + 2) : ℤ)) = decide ((n + 2) % 2 = 0) := evolve_left_fourth_diagonal (n + 2)`
  - `have h2 : evolve (n + 3) (-(↑n : ℤ)) = decide (n % 2 = 0) := evolve_left_fourth_diagonal n`
  - Rewrite both sides via these lemmas, then `omega` closes `(n + 2) % 2 = n % 2`.

**Reusable fact for P1**: When the goal is two function applications with shifted indices, avoid trying to rewrite the function head directly — instead `have` the closed form at each index, `rw` both sides, then the parity/arithmetic goal becomes independent and lightweight. This is cleaner than exposing the three-cell rule or nested `evolve_succ`/`rule30_eq` unfolding.

Imports: `Rule30.Prize` for `IsEventuallyPeriodic`, `Rule30.Proofs.EvolveLeftFourthDiagonal` for the closed form. Axioms: propext, Classical.choice, Quot.sound (all inherited).
