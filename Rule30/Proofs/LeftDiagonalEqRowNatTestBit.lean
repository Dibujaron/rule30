import Rule30.Basic
import Rule30.Proofs.RowCellEqEvolve

/-!
**What this says.** Diagonal k at index j is bit k of the packed row at time j + k.
**Why it is true.** A diagonal reads evolve, which unfolds to rowCell, which by definition reads testBit of rowNat.
**Where the work is.** Unfolding definitions and normalizing the index with omega.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_eq_rowNat_testBit (k j : ℕ) : leftDiagonal k j = (rowNat (j + k)).testBit k
```
-/

theorem leftDiagonal_eq_rowNat_testBit (k j : ℕ) :
    leftDiagonal k j = (rowNat (j + k)).testBit k := by
  unfold leftDiagonal
  rw [← rowCell_eq_evolve]
  unfold rowCell
  rw [if_pos (by constructor <;> omega)]
  congr 1
  omega
