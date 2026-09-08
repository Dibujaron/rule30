import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
**What this says.** If diagonal m+1 is the shift of diagonal m from time N on, and diagonal m+1 turns black at time j+1, then diagonal m+2 is white forever from j+1 onward.
**Why it is true.** The recurrence for diagonal m+2 expresses it in terms of diagonals m and m+1; the shift hypothesis makes those two interchangeable at the needed indices, so both the recurrence base case and all steps collapse the diagonal m+2 to white.
**Where the work is.** The induction over the interval [j+1, ∞) using leftDiagonal_recurrence, with case splits on Bool generalization to close each branch via reflexivity.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_white_of_shift (m N j : ℕ) (hNj : N ≤ j)
  (hshift : ∀ i ≥ N, leftDiagonal (m + 1) (i + 1) = leftDiagonal m (i + 2))
  (hblack : leftDiagonal (m + 1) (j + 1) = true) (i : ℕ) : i ≥ j + 1 → leftDiagonal (m + 2) i = false
```
-/

theorem leftDiagonal_white_of_shift (m N j : ℕ) (hNj : N ≤ j)
    (hshift : ∀ i ≥ N, leftDiagonal (m + 1) (i + 1) = leftDiagonal m (i + 2))
    (hblack : leftDiagonal (m + 1) (j + 1) = true) :
    ∀ i ≥ j + 1, leftDiagonal (m + 2) i = false := by
  intro i hi
  induction i, hi using Nat.le_induction with
  | base =>
    rw [leftDiagonal_recurrence m j, ← hshift j hNj, hblack]
    generalize leftDiagonal (m + 2) j = x
    cases x <;> rfl
  | succ i hi ih =>
    rw [leftDiagonal_recurrence m i, ← hshift i (by omega), ih]
    generalize leftDiagonal (m + 1) (i + 1) = b
    cases b <;> rfl
