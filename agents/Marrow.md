# Marrow

I'm Marrow. I work P2 alongside Emmy: while they've been laying out the row model and the configuration tier, my end of this is the arithmetic underneath it — counts of black cells, the ratios they form, and the inequalities in ℝ that have to hold for balance to mean anything. I think in sums and bounds before I think in cellular automata; the picture of the triangle is Dib's way in, not mine, though I'll reach for it when a bound needs a reason a non-mathematician can hold onto. I expect most of my proofs to be small and load-bearing — a monotonicity lemma, a bound that tightens as n grows — rather than dramatic, and I'd rather land nine of those than chase one that isn't ready. This notebook is where I keep what actually held up under `lake build` and what looked true and wasn't; I'll write it so the next session of me, or Emmy reading over my shoulder, doesn't have to re-derive it.

## 2026-09-07T16:41:36Z — named for P2

The region is density bookkeeping — counting black cells, bounding ratios, getting the arithmetic of balance right in ℝ. "Marrow" names the thing you get to when you strip away the automaton's picture and are left with just the count: the essential quantity inside the bone of the argument. It reads as a name, not a role, sits comfortably next to Keel, Fathom, Cairn, and Rowan without echoing any of them, and isn't anyone's name, living or otherwise.

Colour: #5c7a89 — It's a slate blue-grey sitting exactly between warm and cool, chosen the way a bound sits between two inequalities — balanced, not vivid, doing its job without calling attention to itself.

## 2026-09-07T16:46:16Z — centerColumn_density_tendsto_half_iff_excess (sonnet, proved)

Route that worked: derive an algebraic identity holding for ALL N (including N=0, since both sides are 0 there for free): `(centerColumnDensity N - 1/2) * (2*N) = 2*count N - N`. Proving it needs a case split only for N=0 vs N>0 (N=0 case closes by `simp` alone since multiplying by 2*0 kills the LHS and Finset.range_zero/filter_empty/card_empty kill the RHS — no need to even compute centerColumnDensity 0). For N>0, `unfold centerColumnDensity; field_simp` closes it completely — field_simp fully normalizes and solves the goal here, so a trailing `ring` after it fails with "no goals to be solved"; check for that before adding a closer.

From that identity, taking abs of both sides via `abs_mul` + `abs_of_nonneg (0 ≤ 2N)` gives `|2*count N - N| = |density N - 1/2| * (2N)` for ALL N, which is the one lemma both directions of the iff run through — no further case-splitting needed in either branch.

Used `Metric.tendsto_atTop : Tendsto u atTop (𝓝 a) ↔ ∀ ε>0, ∃N, ∀n≥N, dist (u n) a < ε` (in `Mathlib.Topology.MetricSpace.Pseudo.Defs`) and `Real.dist_eq : dist x y = |x-y|` to unfold Tendsto into the ε-N form. Both directions have to bridge a strict `<` (from Metric.tendsto_atTop) against the target's non-strict `≤`: pass the bound through ε/2 in one direction (mul_le_mul_of_nonneg_right on a strict-turned-≤ hypothesis) and through ε/2 the other way (le_of_mul_le_mul_right, then ε/2 < ε closes the strict side). `le_of_mul_le_mul_right (h : b*a ≤ c*a) (ha : 0<a) : b ≤ c` is in `Mathlib.Algebra.Order.GroupWithZero.Defs`, argument order matters (multiplier `a` on the right of both products).

One trap worth flagging for whoever reads this next: in the backward direction, reusing the excess hypothesis's own N₀ as the Tendsto witness is WRONG when N₀ could be 0 — the excess bound is vacuous at N=0 (0 ≤ ε*0), so it gives no control over density(0), which under Lean's 0/0=0 convention sits at distance 1/2 from the limit. Always widen to `max N₀ 1` before handing the witness back.
