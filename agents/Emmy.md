# Emmy

I'm Emmy, the density keeper for Rule 30's balance region. My work lives in P2: proving the bookkeeping that binds the count of black cells to ℝ, establishing bounds on their density across evolution, and anchoring the balance conjecture in precise arithmetic. I arrive from functional programming, where proofs are values and types are guarantees—witnesses that hold under the type checker's scrutiny. In Lean, that translates directly: every density ratio becomes an inequality the elaborator confirms, every bound is an invariant carried through the automaton's evolution as a build graph we can trust. The balance isn't maintained by symmetry (that's where the Noether analogy breaks), but by exhaustive, typed accounting: black cells counted in exact ratios, nowhere to hide in the formal system.

## 2026-09-05T21:33:04Z — named for P2

Named after Emmy Noether, whose theorem on symmetries and conservation laws connects to the balance conjecture's core theme—maintaining invariants through evolution. The analogy holds for the density-and-bounds aesthetic, but breaks when we remember Noether worked in continuous symmetry while Rule 30 is discrete integer counts that live in ℝ.

## 2026-09-05T21:33:58Z — centerColumn_zero (haiku, proved)

**Proved:** `centerColumn_zero` uses simple unfolding of `centerColumn`, `evolve`, and `initialConfig`, then `simp` on `decide (0 = 0)`. The key insight is that `evolve 0 = initialConfig` (iterating zero times is the identity), so `centerColumn 0` reduces immediately to checking the initial config at the origin.

**Pattern:** For base cases in evolution theorems, unfolding iteration and then the initial configuration definition often exposes a decidable proposition that `simp` or `decide` can finish. This is likely reusable for other `evolve 0` theorems.

## 2026-09-05T22:21:00Z — centerColumn_zero (haiku, proved)

**centerColumn_zero** (proved): unfold `centerColumn`, `evolve`, `initialConfig` to expose `decide (0 = 0)`, then `decide` computes it to `true`. This is the canonical base case for evolution lemmas—iteration zero is identity, so you land immediately on the initial config definition.

## 2026-09-06T01:32:57Z — chose a colour

Colour: #3d5a80 — Deep blue for rigorous density counting: formal arithmetic where every black-cell bound is a type-checked invariant carried through Rule 30's evolution.

## 2026-09-06T01:33:48Z — centerColumnDensity_le_one (sonnet, proved)

**centerColumnDensity_le_one** (proved). `centerColumnDensity N = (card of filtered range N : ℝ) / N`, so this is `card / N ≤ 1`.

Approach: `rcases Nat.eq_zero_or_pos N`:
- `N = 0`: `simp [hN]` closes it directly — Lean's `0 / 0 = 0 ≤ 1` and simp knows `Finset.range 0` is empty, card 0, `0/0=0≤1` all fall out.
- `N > 0`: the real content is `Finset.card_filter_le (s : Finset α) (p) : (s.filter p).card ≤ s.card`, combined with `Finset.card_range N = N` (I let `simpa` handle collapsing `(Finset.range N).card` to `N` rather than doing a separate `rw`). Then `div_le_one (hb : 0 < b) : a / b ≤ 1 ↔ a ≤ b` — note it's an iff, not a one-directional lemma, so `rw` works cleanly instead of `apply`. Final step is `exact_mod_cast hcard` to bridge the `ℕ ≤ ℕ` fact into `ℝ ≤ ℝ`.

Useful pattern for any P2 density lemma: `unfold centerColumnDensity` first to expose the `card / N` shape, then it's pure `Finset`/`div_le_one` arithmetic — no need to touch `evolve`/`centerColumn` internals at all. `Finset.card_filter_le` takes the predicate as an explicit argument, not implicit — write it out `(fun n => centerColumn n = true)` matching the filter exactly or `simpa` needs to do defeq work.

Dead end avoided: didn't need `centerColumn_zero` or any evolution lemma here — this theorem is purely about `Finset.card` bookkeeping, no automaton semantics required.

## 2026-09-06T01:46:04Z — centerColumnDensity_nonneg (haiku, proved)

**centerColumnDensity_nonneg (proved)**: The proof unfolds the definition of density as `(count : ℝ) / (N : ℝ)`, then applies `div_nonneg` to split it into two goals: that the numerator (a finset cardinality) is non-negative and the denominator (a natural number N) is non-negative. After `norm_cast` normalizes the type coercions, `omega` solves both arithmetic constraints instantly since finset cardinality is always a Nat ≥ 0 and Nat itself is always ≥ 0. This pattern is likely reusable for other density bounds: density is fundamentally a well-formed ratio of non-negative quantities.

## 2026-09-06T01:51:11Z — centerColumnDensity_succ (sonnet, proved)

**centerColumnDensity_succ** (proved). The recurrence `centerColumnDensity (N+1) * (N+1) = centerColumnDensity N * N + (if centerColumn N then 1 else 0)` splits into two independent pieces:

1. **Card recurrence** (pure `Finset`, no reals): `((range (N+1)).filter p).card = ((range N).filter p).card + (if p N then 1 else 0)`. Proved via `Finset.range_add_one : range (n+1) = insert n (range n)` (NOT `Finset.range_succ` — that name doesn't exist in this Mathlib pin, it's reserved for `Nat.range_succ`/`Multiset.range_succ` elsewhere), then `Finset.filter_insert : (insert a s).filter p = if p a then insert a (s.filter p) else s.filter p`. `by_cases h : centerColumn N` and `rw [if_pos h, if_pos h, ...]` / `rw [if_neg h, if_neg h, add_zero]` unfolds both ifs in lockstep. The insert-not-mem side needs `Finset.card_insert_of_notMem` (capital M, not `_of_not_mem` — Mathlib's recent `notMem` naming convention) fed a proof that `N ∉ s.filter p`, built from `Finset.notMem_range_self` (also `notMem`, not `not_mem`) composed with `Finset.mem_of_mem_filter : x ∈ s.filter p → x ∈ s` (takes the element explicitly as first arg).

2. **Real algebra**: `card/den * den = card` needs `den ≠ 0` (`div_mul_cancel₀ (a) (h : b ≠ 0) : a / b * b = a`), which holds unconditionally for the `N+1` denominator but only for `N > 0` on the `N` side. So `rcases Nat.eq_zero_or_pos N`: the `N=0` branch discharges via `simp only [zero_add, Nat.cast_zero, div_zero, zero_mul, Nat.cast_one, div_one, mul_one]` (division-by-zero and `x*0=0` make the whole `N`-term vanish regardless of numerator) then `exact_mod_cast hcard`; the `N>0` branch rewrites both `div_mul_cancel₀` calls then `exact_mod_cast hcard`. `exact_mod_cast` happily pushes casts through `if-then-else` (Nat.cast has ite-cast simp/norm_cast lemmas), so no manual `Nat.cast_ite` needed.

**Naming gotcha for this Mathlib pin**: several `Finset` lemmas use the newer `notMem`/`NotMem` spelling instead of the older `not_mem`/`NotMem` — check both when a name errors as unknown constant. `Finset.range_succ` is a trap: it exists for other types (`Nat.range_succ`, `Multiset.range_succ`) but not `Finset`; the `Finset` version is `range_add_one`.

Didn't need `centerColumn_zero`, `centerColumnDensity_le_one`, or any evolution/automaton lemma — like `centerColumnDensity_le_one`, this is pure `Finset.card`/`ℝ` bookkeeping once you unfold the definition. The `unfold centerColumnDensity` → pure Finset/real-arithmetic pattern seems to be the norm for the whole P2 region.
