import Rule30.Basic
import Rule30.Proofs.EvolveEqFalseOfOutsideCone
import Rule30.Proofs.EvolveRightEdge
import Rule30.Proofs.CenterColumnZero
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

theorem evolve_right_second_diagonal (t : ℕ) :
    evolve (t + 1) (t : ℤ) = decide (t % 2 = 0) := by
  induction t with
  | zero =>
    simp only [Nat.cast_zero]
    rw [evolve_succ, rule30_eq]
    have h1 : evolve 0 ((0 : ℤ) - 1) = false := by
      apply evolve_eq_false_of_outside_cone
      norm_num
    have h2 : evolve 0 (0 : ℤ) = true := centerColumn_zero
    have h3 : evolve 0 ((0 : ℤ) + 1) = false := by
      apply evolve_eq_false_of_outside_cone
      norm_num
    rw [h1, h2, h3]
    simp
  | succ n ih =>
    have e1 : ((n : ℤ) + 1) - 1 = (n : ℤ) := by ring
    have e2 : ((n : ℤ) + 1) + 1 = (n : ℤ) + 2 := by ring
    have hright : evolve (n + 1) ((n : ℤ) + 1) = true := evolve_right_edge (n + 1)
    have hout : evolve (n + 1) ((n : ℤ) + 2) = false := by
      apply evolve_eq_false_of_outside_cone
      push_cast
      rw [abs_of_nonneg (by linarith [Nat.cast_nonneg (α := ℤ) n] : (0 : ℤ) ≤ (n : ℤ) + 2)]
      linarith
    push_cast
    rw [evolve_succ, rule30_eq, e1, e2, hright, hout, ih]
    rcases Nat.mod_two_eq_zero_or_one n with h | h
    · have h' : (n + 1) % 2 = 1 := by omega
      simp [h, h']
    · have h' : (n + 1) % 2 = 0 := by omega
      simp [h, h']
