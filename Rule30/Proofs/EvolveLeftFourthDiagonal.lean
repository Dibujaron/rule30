import Rule30.Basic
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.EvolveLeftThirdDiagonal
import Rule30.Proofs.EvolveLeftDiagonalRecurrence
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring

theorem evolve_left_fourth_diagonal (t : ℕ) :
    evolve (t + 3) (-(t : ℤ)) = decide (t % 2 = 0) := by
  induction t with
  | zero => decide
  | succ n ih =>
    have hrec := evolve_left_diagonal_recurrence 1 n
    have a : evolve (n + 1 + 2) (-((n : ℤ) + 2)) = true := by
      have hn : n + 1 + 2 = (n + 2) + 1 := by omega
      rw [hn]
      have e : (-((n : ℤ) + 2)) = -(((n + 2 : ℕ) : ℤ)) := by push_cast; ring
      rw [e]
      exact evolve_left_second_diagonal (n + 2)
    have b : evolve (n + 1 + 2) (-((n : ℤ) + 1)) = false := by
      have hn : n + 1 + 2 = (n + 1) + 2 := by omega
      rw [hn]
      have e : (-((n : ℤ) + 1)) = -(((n + 1 : ℕ) : ℤ)) := by push_cast; ring
      rw [e]
      exact evolve_left_third_diagonal (n + 1)
    have c : evolve (n + 1 + 2) (-(n : ℤ)) = decide (n % 2 = 0) := by
      have hn : n + 1 + 2 = n + 3 := by omega
      rw [hn]
      exact ih
    rw [a, b, c] at hrec
    have epos : (-(((n + 1 : ℕ) : ℤ))) = -((n : ℤ) + 1) := by push_cast; ring
    rw [epos, hrec]
    rcases Nat.mod_two_eq_zero_or_one n with h | h <;> simp [h, Nat.add_mod]
