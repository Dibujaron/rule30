/-
Seeder scratch, 2026-09-10. Route verification for the proposed tier.
Not a proof file: it lives under explorer/ and imports only closed proofs.
-/
import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.RowNatModEqIterate
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.EvolveLeftFourthDiagonal
import Mathlib.Tactic

-- 1 -------------------------------------------------------------------------
theorem rowNat_agree_forward (n T p t : ℕ) (hTt : T ≤ t)
    (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
    rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n := by
  obtain ⟨d, hd⟩ := Nat.exists_eq_add_of_le hTt
  subst hd
  simp only [rowNat_mod_eq_iterate] at h ⊢
  have e1 : T + d = d + T := by omega
  have e2 : T + d + p = d + (T + p) := by omega
  rw [e2, e1, Function.iterate_add_apply, Function.iterate_add_apply, h]

-- 2 -------------------------------------------------------------------------
theorem leftDiagonal_periodicFrom_of_rowNat_agree (k p T : ℕ) (hT : T ≤ 2 * k)
    (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) :
    PeriodicFrom (leftDiagonal k) p k := by
  intro n hn
  rw [leftDiagonal_eq_rowNat_testBit, leftDiagonal_eq_rowNat_testBit]
  have hag : rowNat (n + k) % 2 ^ (k + 1) = rowNat (n + k + p) % 2 ^ (k + 1) :=
    rowNat_agree_forward (k + 1) T p (n + k) (by omega) h
  have key : ∀ m : ℕ, (rowNat m).testBit k = (rowNat m % 2 ^ (k + 1)).testBit k := by
    intro m; rw [Nat.testBit_mod_two_pow]; simp
  rw [show n + p + k = n + k + p from by omega, key (n + k + p), key (n + k), hag]

-- 2b: the wall follows by choosing T and p per k (three lines, so not its own node)
example
    (H : ∀ k, ∃ p > 0, ∃ T ≤ 2 * k, rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) :
    ∀ k, ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  intro k
  obtain ⟨p, hp, T, hT, h⟩ := H k
  exact ⟨p, hp, k, le_rfl, leftDiagonal_periodicFrom_of_rowNat_agree k p T hT h⟩

-- 3 -------------------------------------------------------------------------
theorem leftDiagonal_onset_le_not_of_black_ladder :
    ¬ ∃ N : ℕ → ℕ, (∀ k, N k < N (k + 1)) ∧ (∀ k, N k ≤ k) ∧
      (∀ k, leftDiagonal (k + 1) (N (k + 1)) = true ∨
        (∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)) := by
  rintro ⟨N, hmono, hle, hwit⟩
  have hge : ∀ k, k ≤ N k := by
    intro k
    induction k with
    | zero => exact Nat.zero_le _
    | succ k ih => have := hmono k; omega
  have hEq : ∀ k, N k = k := fun k => le_antisymm (hle k) (hge k)
  have h3 : leftDiagonal 3 3 = false := by
    have := evolve_left_fourth_diagonal 3
    simpa [leftDiagonal] using this
  have h4 : leftDiagonal 3 4 = true := by
    have := evolve_left_fourth_diagonal 4
    simpa [leftDiagonal] using this
  rcases hwit 2 with h | h
  · rw [hEq 3, h3] at h
    exact absurd h (by simp)
  · have h5 := h 4 (by rw [hEq 2]; omega)
    rw [h4] at h5
    exact absurd h5 (by simp)

-- 4 -------------------------------------------------------------------------
theorem rowNat_testBit_zero (t : ℕ) : (rowNat t).testBit 0 = true := by
  have h : leftDiagonal 0 t = true := evolve_left_edge t
  rw [leftDiagonal_eq_rowNat_testBit] at h
  simpa using h

#print axioms rowNat_agree_forward
#print axioms leftDiagonal_periodicFrom_of_rowNat_agree
#print axioms leftDiagonal_onset_le_not_of_black_ladder
#print axioms rowNat_testBit_zero
