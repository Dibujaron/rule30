import Rule30.Basic
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.EvolveLeftThirdDiagonal
import Rule30.Proofs.EvolveLeftDiagonalRecurrence
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring

/-!
**What this says.** Three steps in from the left edge the colour alternates:
black at even `t`, white at odd `t`. The first diagonal that is not a
constant.

**Why it is true.** The recurrence, with two of its three inputs already
known constants -- the second diagonal is always black, the third always
white. That collapses it to
`this entry is the opposite of the previous one`,
and induction carries it from there.

**Where the work is.** The parity bookkeeping at the end. Turning
`the opposite of n being even` into
`n + 1 is even` needs a case split on which `n` actually
is.
-/

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
