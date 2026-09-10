import Rule30.Basic
import Rule30.Proofs.ColumnOneSuccOfWhite

/-!
**What this says.** Inside a white run of the centre column, column 1 never goes back: centre white at t and column 1 black at t gives column 1 black at t+1.
**Why it is true.** Rule 30 at position 1 with a white centre gives column 1 at t+1 equals column 1 OR column 2 at t. Since column 1 is true, the OR is true.
**Where the work is.** One application of `column_one_succ_of_white` and simplifying true OR anything.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.white_run_monotone (X : Config) (t : ℕ) (h : column X 0 t = false) (h1 : column X 1 t = true) :
  column X 1 (t + 1) = true
```
-/

theorem white_run_monotone (X : Config) (t : ℕ) (h : column X 0 t = false)
    (h1 : column X 1 t = true) : column X 1 (t + 1) = true := by
  rw [column_one_succ_of_white X t h, h1]
  simp
