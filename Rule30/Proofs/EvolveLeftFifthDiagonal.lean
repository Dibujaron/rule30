import Rule30.Basic
import Rule30.Proofs.EvolveLeftThirdDiagonal
import Rule30.Proofs.EvolveLeftDiagonalRecurrence
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring

/-!
**What this says.** Four steps in from the left edge, always black. It sits
one step past `evolve_left_fourth_diagonal`, which alternates, so the family
does not settle into a pattern that can be extrapolated.

**Why it is true.** `evolve_left_diagonal_recurrence`, which expresses one
step of rule 30 in diagonal coordinates. Its shallower input is the third
diagonal, always white, and its own previous entry is black by induction:
`false XOR (_ OR true)` is `true`, so the middle input
never matters.

**Where the work is.** Nothing conceptual. The length is index arithmetic --
rewriting sums and casting between naturals and integers until the three
positions match what the recurrence expects.
-/

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
