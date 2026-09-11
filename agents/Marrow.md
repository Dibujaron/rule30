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

## 2026-09-10T20:37:24Z — centerColumnCount_eq_stepMod_count (sonnet, proved)

`centerColumnCount_eq_stepMod_count` (Rule30/Proofs/CenterColumnCountEqStepModCount.lean) closed cleanly, first try, no build errors. Route: pointwise equality of the two centre-column predicates, lifted to equal filtered Finsets via `Finset.filter_congr`, then `congr 1` on the outer `.card = .card` goal to reduce it to Finset equality before applying `filter_congr`.

The pointwise fact itself is just gluing two already-served lemmas: `centerColumn_eq_rowNat_testBit n : centerColumn n = (rowNat n).testBit n` and `rowNat_mod_eq_iterate (n+1) n : rowNat n % 2^(n+1) = (stepMod (n+1))^[n] (1 % 2^(n+1))`. The only new step is showing `(rowNat n).testBit n = (rowNat n % 2^(n+1)).testBit n`, which is `Nat.testBit_mod_two_pow` applied backwards (bit n survives truncation to n+1 bits since n < n+1): `rw [← rowNat_mod_eq_iterate (n+1) n, Nat.testBit_mod_two_pow]; simp` closes it — the `simp` discharges the `decide (n < n+1) && _ = _` residue.

`Finset.filter_congr` takes `∀ x ∈ s, p x ↔ q x` (or here, since both predicates are `_ = true` on Bool-valued functions, a plain `rw` chain proving the equation directly also satisfies it) and gives `s.filter p = s.filter q`. `congr 1` on a goal `(s.filter p).card = (s.filter q).card` reduces it to `s.filter p = s.filter q` for free — worth remembering as a generic move whenever a node asks to compare cardinalities of two filters over the same base Finset rather than the filters themselves.

No cast arithmetic, no induction, no helper definitions needed — this was pure composition of the P2 dictionary the seeder built (`centerColumn_eq_rowNat_testBit`, `rowNat_mod_eq_iterate`), which is exactly what its own brief promised: "a change of vocabulary and nothing more."

## 2026-09-10T20:39:36Z — centerColumn_density_tendsto_half_of_nearby_cuts (opus, proved)

Closed first try from the seeder's own scratch. **Before writing anything on a P2 node, look for `explorer/tessera2_scratch_*.lean`** — the P2 seeder leaves fully elaborated routes there, and this node's was `explorer/tessera2_scratch_cuts.lean` verbatim, needing only the theorem renamed. Cost me two reads and one build. The same seeder left `tessera2_scratch_nat.lean`, `tessera2_scratch_p2.lean`, `tessera2_scratch_final.lean` and `tessera2_generated.lean`; check those first on any future P2 node.

Imports that this needed and `Rule30.Basic` does not give you: `Mathlib.Tactic` (for `nlinarith`, `positivity`, `push_cast` together), plus the two served proof modules. `import Rule30.Prize` is in the scratch and is harmless but I did not verify it is required.

The one structural move worth keeping. `centerColumnCount_sandwich M N hMN` states its upper half with the ℕ subtraction `N - M`, and ℕ subtraction truncates, so no cast lemma applies to it as written. The fix is to destructure `N` first: `obtain ⟨g, rfl⟩ := Nat.exists_eq_add_of_le hMN` turns every `N` into `M + g`, and then `rw [Nat.add_sub_cancel_left] at hgap hs2` clears the subtraction out of both hypotheses at once. After that every hypothesis is `exact_mod_cast`-able into ℝ. This is the general shape for any P2 node that compares a count at two window sizes.

Second move, and the reason `linarith` closes goals that look nonlinear: `d` is a ℕ chosen from ε, so `d * a`, `d * b`, `d * g`, `d * M` are all products of two variables. Do NOT hand those to `linarith` and hope. Instead pre-multiply each inequality by `d` by hand with `mul_le_mul_of_nonneg_left ... hpos.le`, then `rw` a `ring`-proved `expand` lemma to distribute, and from then on treat `d*a`, `d*b`, `d*g`, `d*M` as four atoms that `linarith` manipulates linearly. The dividing-back-out at the end is one helper, `key : ∀ z, d * z ≤ 3 * W → z ≤ ε * W`, closed by `le_of_mul_le_mul_left ... hpos` — note this is `mul_le_mul_left`'s cancel, multiplier on the LEFT, unlike `le_of_mul_le_mul_right` which I used in `centerColumn_density_tendsto_half_iff_excess` and which wants it on the right. Both exist; pick by where the `d` sits.

`div_le_iff₀` and `div_lt_iff₀` (with the zero subscript) are the names that work under this pin for moving a division across an inequality; the unsubscripted forms are deprecated or gone.

Third: `push_cast` immediately before `rw [abs_le]` at the end. The goal arrives with `↑(M + g)` and the ℝ hypotheses all speak of `↑M + ↑g`; `push_cast` is what makes those the same term, and `abs_le` then splits the absolute value into the two one-sided goals that the two `key` applications close.

## 2026-09-11T02:08:15Z — centerColumn_white_run_lt_start (opus, proved)

Built on the second attempt at the file; only one tactic needed fixing. About 110 lines.

**The mathematics, because the seeder's sketch describes it as two arguments and it is one.** The description says "splits on the colour of column -1 ... before it turns black, an all-white triangle ... after, the checkerboard in the opposite phase". Those are the SAME induction. With the centre white across a window and column -1 holding a constant bit `v` across it, every cell left of the origin is `v && decide (j % 2 = 1)` at position `-j`. `v = false` is the all-white triangle, `v = true` is the checkerboard. Stating it with the free `v` cost one `cases v` in the step and saved an entire second induction. I expect this generalises: any "the neighbour is constant, so the region is forced" argument on this board is one lemma with a Bool parameter, not two.

The step is `evolve_sub_one_eq_xor` at `i = -(n+1)`, which needs the IH at BOTH `n` and `n+1` (and at `n+1` twice, once at time `t` and once at `t+1`). Two-step induction: I did NOT reach for `Nat.twoStepInduction` — I proved `∀ j, Q j ∧ Q (j+1)` by ordinary `induction j`, with `refine ⟨ih.2, ?_⟩` as the step's first move. Clean, no recursor name to guess, and worth copying.

**The arithmetic, which is where the constant 3 actually comes from.** Pivot at `T = 2*a - 1` and `by_cases` on `evolve T (-1) = true`.
- Black at T: propagate forward with `white_run_forbidden` (needs the centre white at t, t+1, t+2, so it reaches only to `a+L-1`), then the checkerboard says `evolve T (-(j:ℤ)) = decide (j % 2 = 1)` for `j ≤ L - a`. Both `j = T` (left edge, black) and `j = T-1` (second diagonal, black) are in range once `L ≥ 3a - 1`, and they have opposite parities. Contradiction.
- White at T: propagate BACKWARD to `[a, T]` by a separate induction on the distance `d` with `t` generalised (`∀ d t, t + d = T → a ≤ t → ...`), taking `white_run_forbidden`'s contrapositive one step at a time. Then the all-white triangle says `evolve a (-((a-1 : ℕ) : ℤ)) = false`, against `evolve_left_second_diagonal (a-1)`. Contradiction, and this branch does not need the left edge at all.

I first got `L ≤ 3a` rather than `L < 3a` and had to find the missing cell: it is the SECOND DIAGONAL in the white branch. Using only the left edge there gives `t0 ≤ 2a` and the bound comes out non-strict. Using the second diagonal too gives `t0 ≤ 2a - 1`, which is exactly the pivot and exactly the strictness. If a future node here is off by one, look for a diagonal you are not using before you look for an error.

**Two small things that cost a build.** `rw [show (n+1) % 2 = 0 from by omega, ...]` does not touch `n % 2` inside `decide (n % 2 = 1)`, so `simp` left `n % 2 = 1` as a side goal in the odd branch — put `hn` in the `rw` list too, not just in the `simp` set. And `push_neg` is deprecated under this pin (it prints a migration note suggesting `push Not`); after `by_contra hcon` on a `<` goal, `have hcon : 3 * a ≤ L := by omega` is shorter and warning-free, since `omega` reads `¬ L < 3 * a` directly.

**Defeq I relied on and did not have to fight.** `column initialConfig i t`, `evolveFrom initialConfig t i` and `evolve t i` are all `rule30^[t] initialConfig i`, so `white_run_forbidden` (stated over an arbitrary `Config`) applies to the seed with a bare `exact` and no rewriting — I wrapped it once as a `private theorem wrf` in seed vocabulary and never thought about `column` again. Same for `centerColumn t = evolve t 0`. Do this wrapping first; it makes every later `omega`-heavy line readable.

The black twin's route sits at `explorer/p2seed_route_centerColumn_black_run_lt_start.lean` and there is NO seeder route for this white one — I checked `explorer/p2seed_*` first, as my own notebook told me to, and the check was worth the two reads even though it came up empty.
