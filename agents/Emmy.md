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

## 2026-09-07T16:41:59Z — centerColumnCount_succ (haiku, proved)

**centerColumnCount_succ (proved)**: extracted from the anonymous `hcard` inside CenterColumnDensitySucc.lean. The proof is pure Finset.card bookkeeping: Finset.range_add_one rewrites the successor range as insert, filter_insert splits the insert in the filter, and the two cases (new cell black or white) close with card_insert_of_notMem and add_zero respectively. No evolution semantics needed — this is the reusable count lemma every density argument rests on. The bridge to centered count arguments: everything on the count side uses this recurrence to compute or bound the tally.

## 2026-09-07T16:49:56Z — centerColumnCount_sandwich (sonnet, proved)

centerColumnCount_sandwich (proved). Inherited a near-complete proof from a prior (haiku, budget-exhausted) attempt and fixed two bugs rather than rewriting:

1. In the `step_bound` helper (∀ n, count(n+1) ≤ count(n) + 1), the black-cell branch did `rw [Finset.card_insert_of_notMem hn_not_mem]` which turns the goal into `card + 1 ≤ card + 1` — `rw` closes this itself via `Eq.mpr`/rfl-matching since the goal becomes trivially true after the rewrite, so a trailing `omega` errors "no goals to be solved". Lesson: after a `rw` that could land exactly on the goal shape, check whether the goal is already closed before appending a closer tactic — don't reflexively append `omega`/`simp` after every `rw`.

2. The `induction N with | succ N ih => by_cases hM : M = N+1 · ... · ...` block had a second, verbatim-duplicate `calc` proof pasted directly after the `by_cases` at the same indentation as the tactic itself (not inside either bullet). Since `by_cases` already closes both goals, the dangling calc after it errors "no goals to be solved". This looks like an artifact of an edit that appended a fix without deleting the old attempt underneath it — worth grep-checking for duplicate `calc`/tactic blocks whenever inheriting a partially-worked file with a nonzero prior attempt.

Structural approach used (kept from the original): split the conjunction; left half is `Finset.card_le_card` on the obvious subset inclusion (range M ⊆ range N when M ≤ N, filter is monotone under subset); right half proves a single-step growth bound `step_bound` via `Finset.range_add_one` + `Finset.filter_insert` + `Finset.card_insert_of_notMem`, then chains it via `induction N` (relying on Lean auto-generalizing `h : M ≤ N` since it mentions the induction target N) with a `by_cases hM : M = N + 1` in the succ case to split "just reached M" from "M ≤ N already", closing with a 3-step `calc` and `omega` for the arithmetic glue.

Pattern for future P2 nodes: when a served/inherited proof file already exists from a failed prior attempt, `lake build` first before reading closely — the compiler's line-numbered errors localize the actual bugs far faster than manually re-deriving the proof from scratch.

## 2026-09-07T16:55:57Z — centerColumn_excess_interpolate (opus, proved)

**centerColumn_excess_interpolate** (opus, proved). Inherited a COMPLETE, COMPILING proof from attempt 1 (sonnet, budget_exhausted). `lake build` succeeded on the very first call, before I had read the proof body at all. I only rewrote the three-heading note, which was nine lines against the six-line ceiling and named `omega` in prose meant for Dib.

This is the second time in a row that "build the inherited file before reading it" was the right first move (see centerColumnCount_sandwich, where the compiler's line numbers localized two bugs instantly). Promote it to a rule: **on any node with a nonzero prior attempt, the first tool call is `lake build`, not `Read`.** The budget_exhausted outcome says nothing about whether the file is finished — a session can die with a working proof on disk and no way to report it, which is exactly what happened here. Do not assume a failed attempt left broken work.

The proof, for the record, since it is short and the shape recurs across P2: `obtain ⟨hmono, hgrow⟩ := centerColumnCount_sandwich M N h`, `set a := ...card` / `set b := ...card` (set rewrites the already-obtained hypotheses too, which is why the obtain comes first), then two casts into ℤ. The monotonicity cast is plain `exact_mod_cast`. The growth cast is the only subtle line: `hgrow` is `b ≤ a + (N - M)` with TRUNCATED ℕ subtraction, and the goal wants honest ℤ subtraction, so you cast to `(↑(N - M) : ℤ)` first and then `rwa [Nat.cast_sub h]` — going straight for `exact_mod_cast` against `(N : ℤ) - (M : ℤ)` will not bridge that, because the two are not equal without `h : M ≤ N` in hand. Then `by_cases hs : (M : ℤ) ≤ 2 * (a : ℤ)` to fix the sign of the stray at M, `rw [abs_of_nonneg ..., abs_le]` in one branch and `abs_of_neg` in the other, `constructor <;> omega` closes each. `omega` handles ℤ linear arithmetic with the cast atoms fine, but it does NOT know `|·|`: every absolute value has to be eliminated by hand (`abs_of_nonneg` / `abs_of_neg` on the right, `abs_le` on the left) before omega sees the goal. That is the whole difficulty of the node.

P2 pattern confirmed again, now on the ℤ side: the region's nodes are `unfold`/`obtain` down to Finset.card facts and then pure linear arithmetic, with the served count lemma doing all the automaton work. Nothing here touches `evolve`. `import Mathlib.Tactic.Linarith` is in the file and unused (omega does everything) — harmless, left alone rather than risk a rebuild for tidiness.

## 2026-09-10T20:38:24Z — centerColumnCount_block (haiku, proved)

**centerColumnCount_block (proved, S, induction)**

The proof splits a filtered range count at any boundary using induction on the right endpoint k. Structure:
- **Base** (k=0): `simp` closes directly when range(0) is empty
- **Step** (k → k+1): Rewrite range(M + (k+1)) = range(M+k) ∪ {M+k} using `Finset.range_add_one`, split the filter with `Finset.filter_insert`, then case-split on whether centerColumn(M+k) = true
  - **True case**: Use `Finset.card_insert_of_notMem` to count the inserted element (since M+k ∉ range(M+k)), apply IH, rewrite the target similarly, and close with `omega`
  - **False case**: The insert doesn't add to the count, so IH plus simp closes it

Key lemmas: `Finset.range_add_one`, `Finset.filter_insert`, `Finset.card_insert_of_notMem`, `omega`.

Pattern: For Finset cardinality arguments over ranges, induction on one dimension and `range_add_one` to express the range split, then `filter_insert` to handle the predicate on the boundary element.

No automaton semantics needed—pure Finset.card bookkeeping.

## 2026-09-11T02:04:23Z — centerColumn_black_run_lt_start (sonnet, proved)

**centerColumn_black_run_lt_start (proved, M).** The brief's own route was exact and needed no deviation: the served `column_alternating_of_black_run initialConfig` (for a Config X, `column X i t := evolveFrom X t i`) is defeq to `evolve` at `X = initialConfig` — `evolve t = rule30^[t] initialConfig = evolveFrom initialConfig t`, and `centerColumn t = evolve t 0`. So a hypothesis of type `∀ s ≤ L, centerColumn (a+s) = true` can be handed directly to a `have` of type `∀ s ≤ L, column initialConfig 0 (a+s) = true` with no cast, and the alternating conclusion `column initialConfig (-(j:ℤ)) t = decide (j%2=0)` can likewise be assigned straight into a `have` typed `evolve a (-(j:ℤ)) = decide (...)` — Lean unifies both by defeq unfold, no `show`/`change` needed.

The whole proof: by_contra to get `a ≤ L`, instantiate the alternating lemma at depths `j = a` and `j = a - 1` (both ≤ L since a ≤ L, a ≥ 1), pull the two actual values from `evolve_left_edge a` and `evolve_left_second_diagonal (a-1)` (the latter needs `a - 1 + 1 = a` rewritten in, from `ha : 1 ≤ a`, by omega), then `of_decide_eq_true` turns each `true = decide (_ % 2 = 0)` into the arithmetic fact, and `omega` closes the parity contradiction (a and a-1 can't both be even) directly, using `ha` from context.

One papercut: `push_neg` is deprecated in this Mathlib pin (suggests `push Not` or a macro shim) — for a simple `¬(L < a) → a ≤ L` it's just as easy to `have hL : a ≤ L := by omega` right after `by_contra hL`, shadowing the by_contra hypothesis; omega still sees the shadowed one during its own elaboration. Cheaper than fighting the deprecation.

Verified `#print axioms` locally before final report (temporarily appended the line, confirmed exactly propext/Classical.choice/Quot.sound, then removed it) — not required by the brief but cheap insurance given the harness's own check is the one that counts.

## 2026-09-11T02:17:50Z — centerColumnCount_ge_of_pow (sonnet, proved)

**centerColumnCount_ge_of_pow (proved, M).** Band: Project-internal/Nothing — the node's own note is explicit that this is a fence, not progress toward Prize 2 (gives N - 2*log_5(N), where the prize needs o(N), and Talus's 2026-09-10 result caps every run-bound route below that anyway).

Route, simpler than the brief's own sketch: rather than constructing n pairwise-disjoint windows up front and taking an injective map, induct directly on n carrying the conjunction. At the step, `centerColumn_window_not_constant (5^n) ha` (ha : 1 ≤ 5^n, from `Nat.one_le_pow n 5 (by norm_num)`) hands back one true-witness s1 ≤ 3*5^n and one false-witness s2 ≤ 3*5^n in the window [5^n, 4*5^n]. Since 4*5^n < 5^(n+1) = 5*5^n, each witness t = 5^n + s_i lands in `range (5^(n+1))` but not in `range (5^n)` (t ≥ 5^n). So `insert t A ⊆ B` where A = filter(range 5^n), B = filter(range 5^(n+1)), giving `B.card ≥ A.card + 1 ≥ n + 1` via `Finset.card_insert_of_notMem` + `Finset.card_le_card`. No global injective-map construction needed — the induction does the disjointness bookkeeping window-by-window automatically.

**omega/`Finset.range_subset` trap, cost two failed builds:** `apply Finset.range_subset.mpr` followed by `rw [hp]; omega` (hp : 5^(n+1) = 5*5^n) silently left omega staring at a goal still containing an unrelated atom it displayed as `x` — no error from `apply` or `rw`, just a baffling omega counterexample dump with an atom that traced to nothing in the visible context. Never diagnosed the root cause (didn't have budget to bisect further); the fix was to abandon `Finset.range_subset` entirely and prove the range-subset goal by hand: `intro x hx; rw [Finset.mem_range] at hx ⊢; rw [hp]; omega`. This is now the pattern I'd reach for first rather than the iff lemma when `range (a^n) ⊆ range (a^(n+1)))`-shaped subset goals come up with a pow rewrite needed — cheaper than debugging the mystery.

`exact ⟨by rw [hp]; omega, ht1⟩` inside an already-simp'd membership goal worked fine with no such issue — the trap seems specific to composing `apply <iff>.mpr` with a later `rw` inside the same tactic block, not to `rw [hp]; omega` in general.
