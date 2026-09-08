import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
**What this says.** If diagonal m+2 is white from index N onward, then diagonal m read two cells later equals diagonal m+1 read one cell later, from N on.
**Why it is true.** The recurrence at diagonal m+2 xors together three terms; two of the three vanish once both white readings are substituted in, forcing the remaining two to agree.
**Where the work is.** None — one rewrite of `leftDiagonal_recurrence` at the two white cells, then a four-way Bool case split.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_shift_of_white (m N : ℕ) (hw : ∀ i ≥ N, leftDiagonal (m + 2) i = false) (i : ℕ) :
  i ≥ N → leftDiagonal m (i + 2) = leftDiagonal (m + 1) (i + 1)
```
-/

theorem leftDiagonal_shift_of_white (m N : ℕ)
    (hw : ∀ i ≥ N, leftDiagonal (m + 2) i = false) :
    ∀ i ≥ N, leftDiagonal m (i + 2) = leftDiagonal (m + 1) (i + 1) := by
  intro i hi
  have R := leftDiagonal_recurrence m i
  rw [hw (i + 1) (by omega), hw i hi] at R
  revert R
  generalize leftDiagonal m (i + 2) = a
  generalize leftDiagonal (m + 1) (i + 1) = b
  cases a <;> cases b <;> decide
