import Rule30.Basic
import Rule30.Strip
import Rule30.Proofs.IsEventuallyPeriodicOfPeriodicStep
import Rule30.Proofs.StripSucc

/-!
**What this says.** A strip of cells is eventually periodic if its boundary cells are.
**Why it is true.** The update rule for the strip depends only on the two boundary cells; when both repeat with period p from time N, their schedule repeats, so the strip repeats.
**Where the work is.** Threading `isEventuallyPeriodic_of_periodic_step` with the two boundary periodicities and `strip_succ`; no proof needed.
-/

theorem strip_eventuallyPeriodic (i : ℤ) (w p N : ℕ) (hp : 0 < p)
    (ha : ∀ t ≥ N, evolve (t + p) (i - 1) = evolve t (i - 1))
    (hc : ∀ t ≥ N, evolve (t + p) (i + w + 1) = evolve t (i + w + 1)) :
    ∃ q > 0, ∃ M, ∀ t ≥ M, strip i w (t + q) = strip i w t := by
  refine isEventuallyPeriodic_of_periodic_step (fun t => stripStep w (evolve t (i - 1)) (evolve t (i + w + 1))) (strip i w) p N hp ?_ ?_
  · intro t ht
    simp only [ha t ht, hc t ht]
  · intro t
    exact strip_succ i w t
