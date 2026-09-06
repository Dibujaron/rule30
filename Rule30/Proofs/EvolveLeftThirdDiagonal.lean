import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring

theorem evolve_left_third_diagonal (t : ℕ) : evolve (t + 2) (-(t : ℤ)) = false := by
  have heq : t + 2 = t + 1 + 1 := by omega
  rw [heq, evolve_succ, rule30_eq]
  have e : -(t : ℤ) - 1 = -((t + 1 : ℕ) : ℤ) := by push_cast; ring
  have h1 : evolve (t + 1) (-(t : ℤ) - 1) = true := by
    rw [e]
    exact evolve_left_edge (t + 1)
  have h2 : evolve (t + 1) (-(t : ℤ)) = true := evolve_left_second_diagonal t
  rw [h1, h2]
  simp
