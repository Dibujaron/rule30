import Rule30.Basic
import Rule30.Strip
import Rule30.Proofs.IsEventuallyPeriodicCommonPeriod
import Rule30.Proofs.StripEventuallyPeriodic

/-!
**What this says.** A column strictly between two eventually periodic columns is eventually periodic.
**Why it is true.** The boundary columns share a common period, so the strip containing the target column is eventually periodic.
**Where the work is.** Reading the strip at index 0 to extract the periodicity of the interior column.
-/

theorem evolve_isEventuallyPeriodic_of_between (i : ℤ) (w : ℕ)
    (ha : IsEventuallyPeriodic fun t => evolve t (i - 1))
    (hc : IsEventuallyPeriodic fun t => evolve t (i + w + 1)) :
    IsEventuallyPeriodic fun t => evolve t i := by
  obtain ⟨p, hp, N, h0, h1⟩ := isEventuallyPeriodic_common_period (fun t => evolve t (i - 1)) (fun t => evolve t (i + w + 1)) ha hc
  obtain ⟨q, hq, M, hM⟩ := strip_eventuallyPeriodic i w p N hp h0 h1
  refine ⟨q, hq, M, fun t ht => ?_⟩
  have := congrFun (hM t ht) ⟨0, by omega⟩
  simpa [strip] using this
