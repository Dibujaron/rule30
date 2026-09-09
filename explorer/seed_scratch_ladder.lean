import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack
import Rule30.Proofs.LeftDiagonalStepOnsetDichotomy
import Rule30.Proofs.PeriodicFromMul

namespace SeedLadder

theorem leftDiagonal_onset_le_of_black_ladder (N : ℕ → ℕ)
    (hmono : ∀ k, N k < N (k + 1))
    (hwitness : ∀ k, leftDiagonal (k + 1) (N (k + 1)) = true ∨
        ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
    (k : ℕ) : ∃ p > 0, PeriodicFrom (leftDiagonal k) p (N k) := by
  have d0 : ∀ j, leftDiagonal 0 j = true := by
    intro j; simpa [leftDiagonal] using evolve_left_edge j
  have d1 : ∀ j, leftDiagonal 1 j = true := by
    intro j; exact evolve_left_second_diagonal j
  have weaken : ∀ (f : ℕ → Bool) (p a b : ℕ), a ≤ b → PeriodicFrom f p a → PeriodicFrom f p b := by
    intro f p a b hab h n hn; exact h n (le_trans hab hn)
  have key : ∀ k, ∃ p, 0 < p ∧ PeriodicFrom (leftDiagonal k) p (N k) ∧
      PeriodicFrom (leftDiagonal (k + 1)) p (N k) := by
    intro k
    induction k with
    | zero =>
      exact ⟨1, one_pos, fun n _ => by rw [d0, d0], fun n _ => by rw [d1, d1]⟩
    | succ k ih =>
      obtain ⟨p, hp, ha, hb⟩ := ih
      have hlt := hmono k
      rcases hwitness k with hblack | hwhite
      · obtain ⟨j, hj⟩ : ∃ j, N (k + 1) = j + 1 ∧ N k ≤ j :=
          ⟨N (k + 1) - 1, by omega, by omega⟩
        rw [hj.1] at hblack ⊢
        have hstep := leftDiagonal_periodicFrom_step_of_black k p (N k) j hj.2 ha hb hblack
        exact ⟨p, hp, weaken _ _ _ _ (by omega) hb, hstep⟩
      · rcases leftDiagonal_step_onset_dichotomy k p (N k) ha hb with h | ⟨j, hj, hjb, -⟩
        · refine ⟨2 * p, by omega, ?_, ?_⟩
          · exact weaken _ _ _ _ (le_of_lt hlt) (periodicFrom_mul _ p (N k) hb 2)
          · exact weaken _ _ _ _ (by omega) h
        · exact absurd hjb (by rw [hwhite (j + 1) (by omega)]; exact Bool.noConfusion)
  obtain ⟨p, hp, ha, -⟩ := key k
  exact ⟨p, hp, ha⟩

end SeedLadder
