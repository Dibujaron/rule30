import Rule30.Basic
import Rule30.Proofs.EvolveLeftThirdDiagonal
import Rule30.Proofs.EvolveLeftDiagonalRecurrence
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring

theorem evolve_left_fifth_diagonal (t : ℕ) : evolve (t + 4) (-(t : ℤ)) = true := by
  induction t with
  | zero => decide
  | succ n ih =>
    have hrec := evolve_left_diagonal_recurrence 2 n
    have a : evolve (n + 2 + 2) (-((n : ℤ) + 2)) = false := by
      have hn : n + 2 + 2 = (n + 2) + 2 := by omega
      rw [hn]
      have e : (-((n : ℤ) + 2)) = -(((n + 2 : ℕ) : ℤ)) := by push_cast; ring
      rw [e]
      exact evolve_left_third_diagonal (n + 2)
    have c : evolve (n + 2 + 2) (-(n : ℤ)) = true := by
      have hn : n + 2 + 2 = n + 4 := by omega
      rw [hn]
      exact ih
    rw [a, c, Bool.or_true, Bool.false_xor] at hrec
    have epos : (-(((n + 1 : ℕ) : ℤ))) = -((n : ℤ) + 1) := by push_cast; ring
    have hn2 : n + 1 + 4 = n + 2 + 3 := by omega
    rw [hn2, epos]
    exact hrec
