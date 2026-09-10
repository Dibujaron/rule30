import Rule30.Basic

/-! Seeder scratch, 2026-09-10: do the six proposed P1 statements elaborate?
Only `Rule30.Basic` is imported, so nothing here depends on a seeded statement. -/

namespace SeederScratch

theorem centerColumn_not_eventually_constant :
    (∀ N : ℕ, ∃ t ≥ N, centerColumn t = true) ∧
      (∀ N : ℕ, ∃ t ≥ N, centerColumn t = false) := by
  sorry

theorem column_neg_one_damage_mask (X Y : Config) (t : ℕ)
    (h0 : column X 0 t = column Y 0 t)
    (h1 : column X 0 (t + 1) = column Y 0 (t + 1)) :
    xor (column X (-1) t) (column Y (-1) t)
      = ((! column X 0 t) && xor (column X 1 t) (column Y 1 t)) := by
  sorry

theorem column_neg_two_damage_derivative (X Y : Config) (t : ℕ)
    (h0 : column X 0 t = column Y 0 t)
    (h1 : column X 0 (t + 1) = column Y 0 (t + 1)) :
    xor (column X (-2) t) (column Y (-2) t)
      = xor (xor (column X (-1) t) (column Y (-1) t))
          (xor (column X (-1) (t + 1)) (column Y (-1) (t + 1))) := by
  sorry

theorem column_damage_zero_of_black_run (X Y : Config) (t j : ℕ)
    (hagree : ∀ s ≤ j, column X 0 (t + s) = column Y 0 (t + s))
    (hblack : ∀ s < j, column X 0 (t + s) = true)
    (i : ℕ) (hi : i ≤ j) :
    column X (-(i : ℤ)) t = column Y (-(i : ℤ)) t := by
  sorry

theorem centerColumn_periodic_damage_white (p N : ℕ) (hp : 0 < p)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t) (M : ℕ) :
    ∃ t ≥ M, centerColumn t = false ∧ evolve (t + p) (-1) ≠ evolve t (-1) := by
  sorry

theorem centerColumn_eq_evolve_mul_pow (k m : ℕ) :
    evolve (m * 2 ^ k + k) ((m * 2 ^ k : ℕ) : ℤ) = centerColumn k := by
  sorry

end SeederScratch
