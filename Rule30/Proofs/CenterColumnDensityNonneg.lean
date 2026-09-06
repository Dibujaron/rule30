import Rule30.Basic
import Rule30.Prize

theorem centerColumnDensity_nonneg (N : ℕ) : 0 ≤ centerColumnDensity N := by
  unfold centerColumnDensity
  apply div_nonneg
  · norm_cast
    omega
  · norm_cast
    omega
