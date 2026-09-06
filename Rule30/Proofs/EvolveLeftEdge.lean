import Rule30.Basic
import Rule30.Proofs.EvolveEqFalseOfOutsideCone
import Rule30.Proofs.CenterColumnZero
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

/-!
**What this says.** The leftmost cell that exists at all after `t` steps is
always black.

**Why it is true.** Induction. A step earlier, the new edge's left neighbour
was outside the cone and so white, and its right neighbour was the previous
edge and so black. Rule 30 is
`left XOR (centre OR right)`, and
`false XOR (_ OR true)` is `true` whatever the centre
held -- so the middle cell never matters.

**Where the work is.** Proving the left neighbour really is outside the
cone, which means showing the position `-(n+2)` has absolute value
`n + 2`, and that exceeds `n`.
-/

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
