import Rule30.Basic
import Rule30.Proofs.CenterColumnSuccOfBlack

/-!
**What this says.** If the centre column repeated with period p from N, then at every
late time the centre is black, the cell one place left of the origin repeats too.
**Why it is true.** A black centre cell forces the next centre cell to be the negation
of the cell to its left (`centerColumn_succ_of_black`), applied at t and at t + p.
**Where the work is.** Lining up `centerColumn (t + 1 + p)` with `centerColumn (t + p + 1)`
so the periodicity hypothesis at t + 1 can be compared against the two black-time steps.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_periodic_neg_one_black_times (p N : ℕ) (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t)
  (t : ℕ) (ht : N ≤ t) (hb : centerColumn t = true) : evolve (t + p) (-1) = evolve t (-1)
```
-/

theorem centerColumn_periodic_neg_one_black_times (p N : ℕ)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t)
    (t : ℕ) (ht : N ≤ t) (hb : centerColumn t = true) :
    evolve (t + p) (-1) = evolve t (-1) := by
  have hbp : centerColumn (t + p) = true := (hc t ht).trans hb
  have h1 : centerColumn (t + 1) = !evolve t (-1) := centerColumn_succ_of_black t hb
  have h2 : centerColumn (t + p + 1) = !evolve (t + p) (-1) :=
    centerColumn_succ_of_black (t + p) hbp
  have h3 : centerColumn (t + 1 + p) = centerColumn (t + 1) := hc (t + 1) (by omega)
  rw [show t + 1 + p = t + p + 1 from by omega, h2, h1] at h3
  revert h3
  cases evolve (t + p) (-1) <;> cases evolve t (-1) <;> simp
