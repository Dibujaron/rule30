import Rule30.Basic

/-! Seeder scratch: do the four proposed statements elaborate as written? -/

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

-- The witnesses, run here so a timeout or a typo shows up now rather than
-- in the seed check.
#eval (List.range 9).all fun a => (List.range 9).all fun L =>
  decide (a < 1) || decide (L < a) ||
    !((List.range (L + 1)).all fun s => centerColumn (a + s))

#eval (List.range 6).all fun a => (List.range 16).all fun L =>
  decide (a < 1) || decide (L < 3 * a) ||
    !((List.range (L + 1)).all fun s => !centerColumn (a + s))

#eval (List.range 5).all fun a =>
  decide (a < 1) ||
    (((List.range (3 * a + 1)).any fun s => centerColumn (a + s)) &&
      ((List.range (3 * a + 1)).any fun s => !centerColumn (a + s)))

#eval (List.range 2).all fun n =>
  decide (n ≤ ((Finset.range (5 ^ n)).filter fun t => centerColumn t = true).card) &&
    decide (n ≤ ((Finset.range (5 ^ n)).filter fun t => centerColumn t = false).card)
