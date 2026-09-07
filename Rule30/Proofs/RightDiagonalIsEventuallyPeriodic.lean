import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.RightDiagonalPeriodicFromPow

/-!
**What this says.** Every right diagonal repeats with period 2^k starting from the first cell.
**Why it is true.** The quantitative periodicity lemma rightDiagonal_periodicFrom_pow directly yields the existence of a period.
**Where the work is.** None; unfolding IsEventuallyPeriodic and providing the witnesses.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_isEventuallyPeriodic (k : ℕ) : IsEventuallyPeriodic (rightDiagonal k)
```
-/

theorem rightDiagonal_isEventuallyPeriodic (k : ℕ) :
    IsEventuallyPeriodic (rightDiagonal k) := by
  unfold IsEventuallyPeriodic
  refine ⟨2 ^ k, by positivity, 0, rightDiagonal_periodicFrom_pow k⟩
