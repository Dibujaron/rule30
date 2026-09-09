import Rule30.Basic
import Rule30.Proofs.CenterColumnOtherOfCohomologousColumn
import Rule30.Proofs.IsEventuallyPeriodicColumnUnique

/-!
**What this says.** If the XOR of the centre column with any nonzero column is eventually periodic, then the centre column is not eventually periodic.
**Why it is true.** Any cohomologous column would force another column to be periodic via their shared XOR, and Jen's theorem forbids two distinct periodic columns.
**Where the work is.** None — applying the two served lemmas and a contradiction.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_not_isEventuallyPeriodic_of_cohomologous (x : ℤ) (j : ℕ) (hx : x ≠ 0)
  (hd : ∃ p > 0, ∃ N, PeriodicFrom (fun t => centerColumn t ^^ evolve (t + j) x) p N) :
  ¬∃ p > 0, ∃ N, PeriodicFrom centerColumn p N
```
-/

theorem centerColumn_not_isEventuallyPeriodic_of_cohomologous (x : ℤ) (j : ℕ)
    (hx : x ≠ 0)
    (hd : ∃ p > 0, ∃ N, PeriodicFrom (fun t => xor (centerColumn t) (evolve (t + j) x)) p N) :
    ¬ (∃ p > 0, ∃ N, PeriodicFrom centerColumn p N) := by
  intro hc
  have col_periodic : IsEventuallyPeriodic fun t => evolve t x :=
    centerColumn_other_of_cohomologous_column x j hx hd hc
  have eq_zero := isEventuallyPeriodic_column_unique 0 x hc col_periodic
  exact hx eq_zero.symm
