import Rule30.Basic
import Rule30.Proofs.EvolveEqFalseOfOutsideCone
import Rule30.Proofs.EvolveLeftEdge
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

/-!
**What this says.** The cell one step in from the left edge is always black
too.

**Why it is true.** One unfolding of the rule, with no induction. A step
earlier the cell to its left was outside the cone and white, and its own
position held the left edge and was black:
`false XOR (true OR _)` is `true`.

**Where the work is.** Nowhere. The only fiddle is showing
`|-t - 1| = t + 1` so the cone lemma applies.
-/

theorem evolve_left_second_diagonal (t : ℕ) : evolve (t + 1) (-(t : ℤ)) = true := by
  rw [evolve_succ, rule30_eq]
  have h1 : evolve t (-(t : ℤ) - 1) = false := by
    apply evolve_eq_false_of_outside_cone
    have habs : |(-(t : ℤ) - 1)| = (t : ℤ) + 1 := by
      rw [abs_of_nonpos (by linarith [Nat.cast_nonneg (α := ℤ) t] : -(t : ℤ) - 1 ≤ 0)]
      ring
    rw [habs]
    linarith
  have h2 : evolve t (-(t : ℤ)) = true := evolve_left_edge t
  rw [h1, h2]
  simp
