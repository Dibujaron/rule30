import Rule30.Basic
import Rule30.Proofs.EvolveEqFalseOfOutsideCone
import Rule30.Proofs.CenterColumnZero
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

/-!
**What this says.** The rightmost cell that exists after `t` steps is always
black, as the leftmost one is.

**Why it is true.** Induction. A step earlier both its own position and its
right neighbour were outside the cone and white, and its left neighbour was
the previous right edge and black:
`true XOR (false OR false)` is `true`.

**Where the work is.** Two separate appeals to the cone lemma rather than
one, since positions `n + 1` and `n + 2` each have to be
shown outside. Symmetric to the left edge in position but not in argument --
there the black neighbour arrives from the right, here from the left.
-/

theorem evolve_right_edge (t : ℕ) : evolve t (t : ℤ) = true := by
  induction t with
  | zero =>
    simp only [Nat.cast_zero]
    exact centerColumn_zero
  | succ n ih =>
    have e1 : ((n : ℤ) + 1 - 1) = (n : ℤ) := by ring
    have e2 : ((n : ℤ) + 1 + 1) = (n : ℤ) + 2 := by ring
    have hfalse1 : evolve n ((n : ℤ) + 1) = false := by
      apply evolve_eq_false_of_outside_cone
      rw [abs_of_nonneg (by linarith [Nat.cast_nonneg (α := ℤ) n] : (0:ℤ) ≤ (n : ℤ) + 1)]
      linarith
    have hfalse2 : evolve n ((n : ℤ) + 2) = false := by
      apply evolve_eq_false_of_outside_cone
      rw [abs_of_nonneg (by linarith [Nat.cast_nonneg (α := ℤ) n] : (0:ℤ) ≤ (n : ℤ) + 2)]
      linarith
    push_cast
    rw [evolve_succ, rule30_eq, e1, e2, hfalse1, hfalse2, ih]
    simp
