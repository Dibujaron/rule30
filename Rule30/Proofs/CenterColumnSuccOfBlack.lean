import Rule30.Basic
import Rule30.Proofs.ColumnSuccOfBlack

/-!
**What this says.** When the center cell is black at time t, the center cell at time t+1 equals the negation of the cell at position -1 at time t.
**Why it is true.** This is the special case of column_succ_of_black for the single-seed initial row, obtained by unfolding centerColumn to column initialConfig 0.
**Where the work is.** Applying column_succ_of_black with initialConfig and unfolding the equivalences.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_succ_of_black (t : ℕ) (h : centerColumn t = true) : centerColumn (t + 1) = !evolve t (-1)
```
-/

theorem centerColumn_succ_of_black (t : ℕ) (h : centerColumn t = true) :
    centerColumn (t + 1) = !(evolve t (-1)) := by
  unfold centerColumn at h ⊢
  exact column_succ_of_black initialConfig t h
