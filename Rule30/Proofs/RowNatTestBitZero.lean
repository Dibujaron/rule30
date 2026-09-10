import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit

/-!
**What this says.** The lowest bit of every row is set; read as a binary number, every row of the pattern is odd.

**Why it is true.** The left edge is always black, and the left edge is bit 0 of the row by definition.

**Where the work is.** None; it is composition of two closed lemmas.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowNat_testBit_zero (t : ℕ) : (rowNat t).testBit 0 = true
```
-/

theorem rowNat_testBit_zero (t : ℕ) : (rowNat t).testBit 0 = true := by
  have h : leftDiagonal 0 t = true := evolve_left_edge t
  rw [leftDiagonal_eq_rowNat_testBit] at h
  simpa using h
