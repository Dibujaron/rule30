import Rule30.Basic
import Rule30.Proofs.EvolveEqFalseOfOutsideCone
import Rule30.Proofs.CenterColumnZero
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

theorem evolve_left_edge (t : ℕ) : evolve t (-(t : ℤ)) = true := by
  induction t with
  | zero =>
    simp only [Nat.cast_zero, neg_zero]
    exact centerColumn_zero
  | succ n ih =>
    push_cast
    have e1 : (-((n : ℤ) + 1) - 1) = -((n : ℤ) + 2) := by ring
    have e2 : (-((n : ℤ) + 1) + 1) = -(n : ℤ) := by ring
    have hfalse : evolve n (-((n : ℤ) + 2)) = false := by
      apply evolve_eq_false_of_outside_cone
      have habs : |(-((n : ℤ) + 2))| = (n : ℤ) + 2 := by
        rw [abs_of_nonpos (by linarith [Nat.cast_nonneg (α := ℤ) n] : -((n : ℤ) + 2) ≤ 0)]
        ring
      rw [habs]
      linarith
    rw [evolve_succ, rule30_eq, e1, e2, hfalse, ih]
    simp
