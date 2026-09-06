import Rule30.Basic
import Rule30.Proofs.IsEventuallyPeriodicColumnUnique

/-!
**What this says.** If a repeating centre column would force some other
column to repeat too, then the centre column never repeats. This is
conditional: the hypothesis is the open problem, it is believed true, and
this file does not prove it. It does not say the hypothesis is impossible.
**Why it is true.** No two distinct columns of rule 30 are both eventually
periodic (`isEventuallyPeriodic_column_unique`), so a repeating centre
column with a repeating other column cannot happen.
**Where the work is.** Nowhere: one application of that lemma, after
unfolding `centerColumn` to column `0`.
-/

theorem centerColumn_not_eventually_periodic_of_any_other
    (h : IsEventuallyPeriodic centerColumn →
      ∃ j : ℤ, j ≠ 0 ∧ IsEventuallyPeriodic (fun t => evolve t j)) :
    ¬ IsEventuallyPeriodic centerColumn := by
  intro hc
  obtain ⟨j, hj, hpj⟩ := h hc
  have hc0 : IsEventuallyPeriodic fun t => evolve t 0 := hc
  exact hj (isEventuallyPeriodic_column_unique j 0 hpj hc0)
