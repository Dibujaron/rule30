import Rule30.Basic

/-! Seeder, 2026-09-12 — route check for `damage_front_advances`. -/

theorem damage_front_advances (X Y : Config) (t k : ℕ)
    (hagree : ∀ i ≤ k + 1, column X (-(i : ℤ)) t = column Y (-(i : ℤ)) t)
    (hdiff : column X (-((k : ℤ) + 2)) t ≠ column Y (-((k : ℤ) + 2)) t) :
    (∀ i, 1 ≤ i → i ≤ k → column X (-(i : ℤ)) (t + 1) = column Y (-(i : ℤ)) (t + 1))
      ∧ column X (-((k : ℤ) + 1)) (t + 1) ≠ column Y (-((k : ℤ) + 1)) (t + 1) := by
  have hstep : ∀ (Z : Config) (j : ℤ),
      column Z j (t + 1)
        = xor (column Z (j - 1) t) (column Z j t || column Z (j + 1) t) := by
    intro Z j
    show evolveFrom Z (t + 1) j = _
    rw [evolveFrom_succ, rule30_eq]
    rfl
  have bxor : ∀ a a' b : Bool, xor a b = xor a' b → a = a' := by decide
  refine ⟨?_, ?_⟩
  · intro i hi1 hik
    have h1 : column X (-(i : ℤ) - 1) t = column Y (-(i : ℤ) - 1) t := by
      have e : -(i : ℤ) - 1 = -((i + 1 : ℕ) : ℤ) := by omega
      rw [e]; exact hagree (i + 1) (by omega)
    have h2 : column X (-(i : ℤ)) t = column Y (-(i : ℤ)) t := hagree i (by omega)
    have h3 : column X (-(i : ℤ) + 1) t = column Y (-(i : ℤ) + 1) t := by
      have e : -(i : ℤ) + 1 = -((i - 1 : ℕ) : ℤ) := by omega
      rw [e]; exact hagree (i - 1) (by omega)
    rw [hstep X, hstep Y, h1, h2, h3]
  · have h1 : column X (-((k : ℤ) + 1) - 1) t ≠ column Y (-((k : ℤ) + 1) - 1) t := by
      have e : -((k : ℤ) + 1) - 1 = -((k : ℤ) + 2) := by omega
      rw [e]; exact hdiff
    have h2 : column X (-((k : ℤ) + 1)) t = column Y (-((k : ℤ) + 1)) t := by
      have e : -((k : ℤ) + 1) = -((k + 1 : ℕ) : ℤ) := by omega
      rw [e]; exact hagree (k + 1) (by omega)
    have h3 : column X (-((k : ℤ) + 1) + 1) t = column Y (-((k : ℤ) + 1) + 1) t := by
      have e : -((k : ℤ) + 1) + 1 = -((k : ℕ) : ℤ) := by omega
      rw [e]; exact hagree k (by omega)
    rw [hstep X, hstep Y, h2, h3]
    exact fun hEq => h1 (bxor _ _ _ hEq)
