import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
**What this says.** Given that two neighbouring diagonals already agree one cell back, they agree at the next cell exactly when either the driving cell between them is black and the two diagonals underneath agree, or the driving cell is white and the diagonal two shallower is white there.

**Why it is true.** One step of the rule, read in diagonal coordinates twice (once for each of the two diagonals), turns the agreement into a boolean identity once the shared driving cell is substituted using the one-cell-back hypothesis.

**Where the work is.** Lining up the index arithmetic so both instances of the recurrence land on the same three cells; once that is done the whole claim is eight cases of a decidable boolean fact.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_agree_succ_iff (m i : ℕ) (h : leftDiagonal (m + 2) (i + 2) = leftDiagonal (m + 3) (i + 1)) :
  leftDiagonal (m + 2) (i + 3) = leftDiagonal (m + 3) (i + 2) ↔
    leftDiagonal (m + 3) (i + 1) = true ∧ leftDiagonal m (i + 4) = leftDiagonal (m + 1) (i + 3) ∨
      leftDiagonal (m + 3) (i + 1) = false ∧ leftDiagonal m (i + 4) = false
```
-/

theorem leftDiagonal_agree_succ_iff (m i : ℕ)
    (h : leftDiagonal (m + 2) (i + 2) = leftDiagonal (m + 3) (i + 1)) :
    leftDiagonal (m + 2) (i + 3) = leftDiagonal (m + 3) (i + 2) ↔
      (leftDiagonal (m + 3) (i + 1) = true ∧
          leftDiagonal m (i + 4) = leftDiagonal (m + 1) (i + 3)) ∨
      (leftDiagonal (m + 3) (i + 1) = false ∧ leftDiagonal m (i + 4) = false) := by
  have R1 := leftDiagonal_recurrence m (i + 2)
  have R2 := leftDiagonal_recurrence (m + 1) (i + 1)
  rw [show i + 2 + 1 = i + 3 from by omega,
      show i + 2 + 2 = i + 4 from by omega] at R1
  rw [show m + 1 + 2 = m + 3 from by omega,
      show i + 1 + 1 = i + 2 from by omega,
      show i + 1 + 2 = i + 3 from by omega,
      show m + 1 + 1 = m + 2 from by omega] at R2
  rw [R1, R2, ← h]
  generalize leftDiagonal m (i + 4) = a
  generalize leftDiagonal (m + 1) (i + 3) = b
  generalize leftDiagonal (m + 2) (i + 2) = c
  cases a <;> cases b <;> cases c <;> decide
