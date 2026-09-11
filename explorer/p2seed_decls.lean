import Rule30.Basic

theorem centerColumn_black_run_lt_start (a L : ℕ) (ha : 1 ≤ a)
    (h : ∀ s ≤ L, centerColumn (a + s) = true) : L < a := by
  sorry

theorem centerColumn_white_run_lt_start (a L : ℕ) (ha : 1 ≤ a)
    (h : ∀ s ≤ L, centerColumn (a + s) = false) : L < 3 * a := by
  sorry

theorem centerColumn_window_not_constant (a : ℕ) (ha : 1 ≤ a) :
    (∃ s ≤ 3 * a, centerColumn (a + s) = true) ∧
      (∃ s ≤ 3 * a, centerColumn (a + s) = false) := by
  sorry

theorem centerColumnCount_ge_of_pow (n : ℕ) :
    n ≤ ((Finset.range (5 ^ n)).filter fun t => centerColumn t = true).card ∧
      n ≤ ((Finset.range (5 ^ n)).filter fun t => centerColumn t = false).card := by
  sorry

