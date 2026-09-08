import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
**What this says.** A settled cell on diagonal k+2 at j, under a transient driver on k+1, with the cell below settled, stays settled at j+1 iff its own cell is black.
**Why it is true.** The recurrence at k gives the XOR relationship; when the driver diagonal is transient and this diagonal is settled at j, the difference at j+1 comes solely from whether this diagonal's cell is black.
**Where the work is.** The same case-split on the recurrence values: with this diagonal settled at j and the driver transient, the four Bool values determine the outcome by calculation.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_transient_mask_law (k j M : ℕ) (hc : leftDiagonal (k + 2) j = leftDiagonal (k + 2) (j + M))
  (hT : leftDiagonal (k + 1) (j + 1) ≠ leftDiagonal (k + 1) (j + 1 + M))
  (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + M)) :
  leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + M) ↔ leftDiagonal (k + 2) j = false
```
-/

theorem leftDiagonal_transient_mask_law (k j M : ℕ)
    (hc : leftDiagonal (k + 2) j = leftDiagonal (k + 2) (j + M))
    (hT : leftDiagonal (k + 1) (j + 1) ≠ leftDiagonal (k + 1) (j + 1 + M))
    (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + M)) :
    (leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + M))
      ↔ leftDiagonal (k + 2) j = false := by
  have R1 := leftDiagonal_recurrence k j
  have R2 := leftDiagonal_recurrence k (j + M)
  rw [show j + M + 1 = j + 1 + M from by omega,
    show j + M + 2 = j + 2 + M from by omega] at R2
  rw [R1, R2, ← hc, ← h0]
  revert hT
  generalize leftDiagonal k (j + 2) = a
  generalize leftDiagonal (k + 1) (j + 1) = b
  generalize leftDiagonal (k + 1) (j + 1 + M) = b'
  generalize leftDiagonal (k + 2) j = c
  cases a <;> cases b <;> cases b' <;> cases c <;> decide
