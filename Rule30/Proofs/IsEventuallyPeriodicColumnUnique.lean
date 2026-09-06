import Rule30.Basic
import Rule30.Proofs.NotIsEventuallyPeriodicPair

/-!
**What this says.** If two columns are eventually periodic, they are the same column.
**Why it is true.** Trichotomy on the column indices; each strict inequality contradicts not_isEventuallyPeriodic_pair.
**Where the work is.** Nowhere — the served lemma and ltOrGt exhaust all cases.
-/

theorem isEventuallyPeriodic_column_unique (i j : ℤ)
    (hi : IsEventuallyPeriodic fun t => evolve t i)
    (hj : IsEventuallyPeriodic fun t => evolve t j) : i = j := by
  by_contra hne
  rcases lt_or_gt_of_ne hne with h | h
  · exact not_isEventuallyPeriodic_pair i j h ⟨hi, hj⟩
  · exact not_isEventuallyPeriodic_pair j i h ⟨hj, hi⟩
