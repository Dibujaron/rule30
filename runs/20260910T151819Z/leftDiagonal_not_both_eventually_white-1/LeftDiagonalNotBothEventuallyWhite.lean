import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
**What this says.** No two adjacent left diagonals can both be eventually white.
**Why it is true.** A descent via the recurrence: if k and k+1 are white, the recurrence forces k-1 white too, descending to diagonals 0 and 1 which are always black.
**Where the work is.** The induction on k, which carries the descent down to the base cases where the constant diagonals contradict the white assumption.
-/

theorem leftDiagonal_not_both_eventually_white (k : ℕ) :
    ¬ ((∃ N, ∀ j ≥ N, leftDiagonal k j = false) ∧
        ∃ M, ∀ j ≥ M, leftDiagonal (k + 1) j = false) := by
  intro ⟨⟨N, hN⟩, ⟨M, hM⟩⟩
  induction k using Nat.strong_induction_on with
  | h k ih =>
    match k with
    | 0 =>
      have : leftDiagonal 0 N = true := evolve_left_edge N
      have : leftDiagonal 0 N = false := hN N (Nat.le_refl _)
      simp at *
    | 1 =>
      have : leftDiagonal 1 N = true := evolve_left_second_diagonal N
      have : leftDiagonal 1 N = false := hN N (Nat.le_refl _)
      simp at *
    | k + 2 =>
      sorry
