import Rule30.Basic
import Rule30.Proofs.EvolveLeftFourthDiagonal

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

#print axioms leftDiagonal_onset_le_not_of_black_ladder
