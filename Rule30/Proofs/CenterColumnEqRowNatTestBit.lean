import Rule30.Basic
import Rule30.Proofs.RowCellEqEvolve

/-!
**What this says.** The centre cell of row t is the t-th bit of the packed row.
**Why it is true.** rowCell computes the t-th bit of rowNat by definition, and centerColumn is rowCell at position 0.
**Where the work is.** Connecting rowCell's cone condition to centerColumn via the universal rowCell_eq_evolve lemma.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_eq_rowNat_testBit (t : ℕ) : centerColumn t = (rowNat t).testBit t
```
-/

theorem centerColumn_eq_rowNat_testBit (t : ℕ) : centerColumn t = (rowNat t).testBit t := by
  have h := rowCell_eq_evolve t 0
  unfold rowCell at h
  rw [if_pos (by omega : -(t : ℤ) ≤ (0 : ℤ) ∧ (0 : ℤ) ≤ (t : ℤ))] at h
  simpa [centerColumn] using h.symm
