import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
**What this says.** When a left diagonal is white forever from a certain point, and the next diagonal in is black at one cell, the diagonal beyond that is black from that same cell onward.
**Why it is true.** Each diagonal's value is determined by its two inner diagonals via the recurrence; an inner white diagonal forces the recurrence to simplify.
**Where the work is.** The induction step uses the recurrence at two index positions, one of which must re-normalize with omega.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_black_after_white (m N j : ℕ) (hNj : N ≤ j) (hw : ∀ i ≥ N, leftDiagonal (m + 1) i = false)
  (hb : leftDiagonal (m + 2) (j + 1) = true) (i : ℕ) : i ≥ j + 1 → leftDiagonal (m + 3) i = true
```
-/

theorem leftDiagonal_black_after_white (m N j : ℕ) (hNj : N ≤ j)
    (hw : ∀ i ≥ N, leftDiagonal (m + 1) i = false)
    (hb : leftDiagonal (m + 2) (j + 1) = true) :
    ∀ i ≥ j + 1, leftDiagonal (m + 3) i = true := by
  intro i hi
  induction i, hi using Nat.le_induction with
  | base =>
    have R := leftDiagonal_recurrence (m + 1) j
    rw [show m + 1 + 2 = m + 3 from by omega, show m + 1 + 1 = m + 2 from by omega] at R
    rw [R, hw (j + 2) (by omega), hb]
    generalize leftDiagonal (m + 3) j = x
    cases x <;> rfl
  | succ i hi ih =>
    have R := leftDiagonal_recurrence (m + 1) i
    rw [show m + 1 + 2 = m + 3 from by omega, show m + 1 + 1 = m + 2 from by omega] at R
    rw [R, hw (i + 2) (by omega), ih]
    generalize leftDiagonal (m + 2) (i + 1) = b
    cases b <;> rfl
