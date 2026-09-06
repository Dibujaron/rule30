import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.IsEventuallyPeriodicCommonPeriod
import Rule30.Proofs.NotEvolvePeriodAdjacent

/-!
**What this says.** No two adjacent columns of the automaton are both eventually periodic.
**Why it is true.** If they shared a period, evolve_period_sub would propagate it left to the boundary, contradicting not_evolve_period_adjacent.
**Where the work is.** Just threading together the two served lemmas.
-/

theorem not_isEventuallyPeriodic_adjacent (i : ℤ) :
    ¬ (IsEventuallyPeriodic (fun t => evolve t i) ∧
        IsEventuallyPeriodic (fun t => evolve t (i + 1))) := by
  rintro ⟨hf, hg⟩
  obtain ⟨p, hp, N, h0, h1⟩ := isEventuallyPeriodic_common_period (fun t => evolve t i) (fun t => evolve t (i + 1)) hf hg
  exact not_evolve_period_adjacent i p N hp h0 h1
