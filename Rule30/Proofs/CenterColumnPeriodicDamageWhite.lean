import Rule30.Basic
import Rule30.Proofs.CenterColumnSuccOfBlack
import Rule30.Proofs.NotEvolvePeriodAdjacent
import Mathlib.Tactic

/-!
**What this says.** If the centre column ever started repeating, then however
late you look there is still a white centre cell whose left-hand neighbour
column fails to repeat with it.
**Why it is true.** At a *black* centre cell the rule forces the next centre
cell to be the opposite of the cell just left of centre
(`centerColumn_succ_of_black`), so a repeating centre column drags the column
to its left into repeating too. If the white cells never broke that, both
columns would repeat, and `not_evolve_period_adjacent` says no two neighbouring
columns ever do.
**Where the work is.** Nowhere hard: reading the black-cell law twice, once at
`t` and once a period later, and cancelling the two negations.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_periodic_damage_white (p N : ℕ) (hp : 0 < p)
  (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t) (M : ℕ) :
  ∃ t ≥ M, centerColumn t = false ∧ evolve (t + p) (-1) ≠ evolve t (-1)
```
-/

theorem centerColumn_periodic_damage_white (p N : ℕ) (hp : 0 < p)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t) (M : ℕ) :
    ∃ t ≥ M, centerColumn t = false ∧ evolve (t + p) (-1) ≠ evolve t (-1) := by
  by_contra hcon
  push_neg at hcon
  -- From here on the two columns 0 and -1 would both repeat with period p.
  have hkey : ∀ t ≥ max M N, evolve (t + p) (-1) = evolve t (-1) := by
    intro t ht
    cases hb : centerColumn t with
    | false => exact hcon t (by omega) hb
    | true =>
        have hblackp : centerColumn (t + p) = true := by
          rw [hc t (by omega)]; exact hb
        have h1 := centerColumn_succ_of_black t hb
        have h2 := centerColumn_succ_of_black (t + p) hblackp
        rw [show t + p + 1 = t + 1 + p from by omega] at h2
        rw [hc (t + 1) (by omega), h1] at h2
        exact (Bool.not_inj h2).symm
  have hcol : ∀ t ≥ max M N, evolve (t + p) ((-1 : ℤ) + 1) = evolve t ((-1 : ℤ) + 1) := by
    intro t ht
    have h := hc t (by omega)
    unfold centerColumn at h
    simpa using h
  exact not_evolve_period_adjacent (-1) p (max M N) hp hkey hcol
