import Rule30.Basic
import Rule30.Prize

/-!
**What this says.** Widening the window by one term: the black count over
`N + 1` terms is the count over `N` terms, plus one more if the
newest cell is black.

**Why it is true.** Adding one index to a range adds that one cell to the
tally and disturbs nothing already counted.

**Where the work is.** Two places. The counting step has to know the new
index is genuinely new and not already inside the old range. And
`N = 0` has to be handled separately, because in Lean
`x / 0 = 0`, so at zero terms the density is 0 rather
than a ratio. The statement is deliberately multiplied through by `N` rather
than left as a ratio, so the recurrence never has to divide.
-/

theorem centerColumnDensity_succ (N : ℕ) :
    centerColumnDensity (N + 1) * ((N + 1 : ℕ) : ℝ) =
      centerColumnDensity N * (N : ℝ) + (if centerColumn N then 1 else 0) := by
  unfold centerColumnDensity
  have hcard : ((Finset.range (N + 1)).filter fun n => centerColumn n = true).card =
      ((Finset.range N).filter fun n => centerColumn n = true).card +
        (if centerColumn N then 1 else 0) := by
    rw [Finset.range_add_one, Finset.filter_insert]
    by_cases h : centerColumn N
    · rw [if_pos h, if_pos h,
        Finset.card_insert_of_notMem
          (fun hmem => Finset.notMem_range_self (Finset.mem_of_mem_filter N hmem))]
    · rw [if_neg h, if_neg h, add_zero]
  rcases Nat.eq_zero_or_pos N with hN | hN
  · subst hN
    simp only [zero_add, Nat.cast_zero, div_zero, zero_mul, Nat.cast_one, div_one, mul_one]
    exact_mod_cast hcard
  · have hNsucc : ((N + 1 : ℕ) : ℝ) ≠ 0 := by positivity
    have hNreal : (N : ℝ) ≠ 0 := by exact_mod_cast hN.ne'
    rw [div_mul_cancel₀ _ hNsucc, div_mul_cancel₀ _ hNreal]
    exact_mod_cast hcard
