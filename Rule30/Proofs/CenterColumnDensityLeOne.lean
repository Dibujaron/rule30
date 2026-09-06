import Rule30.Basic
import Rule30.Prize

theorem centerColumnDensity_le_one (N : ℕ) : centerColumnDensity N ≤ 1 := by
  unfold centerColumnDensity
  rcases Nat.eq_zero_or_pos N with hN | hN
  · simp [hN]
  · have hcard : ((Finset.range N).filter fun n => centerColumn n = true).card ≤ N := by
      simpa using Finset.card_filter_le (Finset.range N) (fun n => centerColumn n = true)
    have hNpos : (0 : ℝ) < (N : ℝ) := by exact_mod_cast hN
    rw [div_le_one hNpos]
    exact_mod_cast hcard
