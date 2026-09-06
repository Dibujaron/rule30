import Rule30.Basic
import Rule30.Prize

/-!
**What this says.** The fraction of the first `N` centre-column cells that
are black never exceeds one.

**Why it is true.** The black cells among the first `N` are some of those
`N` cells, so the count on top is at most the count underneath.

**Where the work is.** `N = 0` has to be split off. In Lean
`x / 0 = 0`, so at zero terms the density is 0 rather
than a ratio, and the main argument -- multiply both sides by `N` -- is only
allowed once `N` is known to be positive.
-/

theorem centerColumnDensity_le_one (N : ℕ) : centerColumnDensity N ≤ 1 := by
  unfold centerColumnDensity
  rcases Nat.eq_zero_or_pos N with hN | hN
  · simp [hN]
  · have hcard : ((Finset.range N).filter fun n => centerColumn n = true).card ≤ N := by
      simpa using Finset.card_filter_le (Finset.range N) (fun n => centerColumn n = true)
    have hNpos : (0 : ℝ) < (N : ℝ) := by exact_mod_cast hN
    rw [div_le_one hNpos]
    exact_mod_cast hcard
