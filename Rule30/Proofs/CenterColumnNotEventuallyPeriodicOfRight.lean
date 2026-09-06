import Rule30.Basic
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent

/-!
**What this says.** If a repeating centre column would force the column just
right of it to repeat too, then the centre column never repeats. This is the
first prize conjecture under one hypothesis; the hypothesis is the open
problem, and this file does not prove it.
**Why it is true.** Adjacent columns of rule 30 are never both eventually
periodic (`not_isEventuallyPeriodic_adjacent`), so a periodic centre column
with a periodic right neighbour is impossible.
**Where the work is.** Nowhere: one application of that lemma.
-/

theorem centerColumn_not_eventually_periodic_of_right
    (h : IsEventuallyPeriodic centerColumn → IsEventuallyPeriodic (fun t => evolve t 1)) :
    ¬ IsEventuallyPeriodic centerColumn := by
  intro hc
  exact not_isEventuallyPeriodic_adjacent 0 ⟨hc, h hc⟩
