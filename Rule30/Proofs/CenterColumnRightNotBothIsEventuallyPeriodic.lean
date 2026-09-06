import Rule30.Basic
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent

/-!
**What this says.** The centre column and the column just right of it cannot both repeat indefinitely.
**Why it is true.** Periodicity in adjacent columns extends to the far left, contradicting the left edge being always black.
**Where the work is.** None — direct application of the adjacent-column lemma at i = 0.
-/

theorem centerColumn_right_not_both_isEventuallyPeriodic :
    ¬ (IsEventuallyPeriodic centerColumn ∧ IsEventuallyPeriodic (fun t => evolve t 1)) := by
  unfold centerColumn
  simpa using not_isEventuallyPeriodic_adjacent 0
