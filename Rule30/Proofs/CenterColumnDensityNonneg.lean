import Rule30.Basic
import Rule30.Prize

/-!
**What this says.** The fraction of the first `N` centre-column cells that
are black is never negative.

**Why it is true.** It is one count divided by another, and neither can be
below zero.

**Where the work is.** Nowhere. It needs no special case for
`N = 0`: in Lean `x / 0 = 0`, which is not
negative either, so one argument covers every `N`.
-/

theorem centerColumnDensity_nonneg (N : ℕ) : 0 ≤ centerColumnDensity N := by
  unfold centerColumnDensity
  apply div_nonneg
  · norm_cast
    omega
  · norm_cast
    omega
