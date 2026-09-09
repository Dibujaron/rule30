import Rule30.Basic
import Rule30.Proofs.RightmostDifferenceMovesRight
import Rule30.Proofs.EvolveEqFalseOfOutsideCone
import Rule30.Proofs.EvolveRightEdge
import Rule30.Proofs.EvolveFromTranslate
import Rule30.Proofs.EvolveFromEvolve

/-!
**What this says.** Slide row `p` left by `p` cells; call `m` the distance
from its right edge to the next black cell. The slid row agrees with the
seed's own row at every earlier time and disagrees for the first time at
time exactly `m` — not just eventually, but at that exact step.
**Why it is true.** The slid row and the seed's row agree everywhere right
of `-m` (white outside the cone, black at the shared right edge, white by
the choice of `m` in between) and differ at `-m`; a difference that starts
there moves right by exactly one cell per step (`rightmost_difference_moves_right`).
**Where the work is.** Showing the slid row agrees with the seed's row on
that whole window is three cases (negative, zero, positive) rewritten
through `evolveFrom_translate` and `evolveFrom_evolve`; the rest is reading
`rightmost_difference_moves_right` off at the right time and place.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_first_failure (p m : ℕ) (hm : 0 < m)
  (hwhite : ∀ (d : ℕ), 0 < d → d < m → evolve p (↑p - ↑d) = false) (hblack : evolve p (↑p - ↑m) = true) :
  (∀ t < m, evolve (t + p) ↑p = evolve t 0) ∧ evolve (m + p) ↑p ≠ evolve m 0
```
-/

theorem rightDiagonal_first_failure (p m : ℕ) (hm : 0 < m)
    (hwhite : ∀ d : ℕ, 0 < d → d < m → evolve p ((p : ℤ) - (d : ℤ)) = false)
    (hblack : evolve p ((p : ℤ) - (m : ℤ)) = true) :
    (∀ t, t < m → evolve (t + p) (p : ℤ) = evolve t 0)
      ∧ evolve (m + p) (p : ℤ) ≠ evolve m 0 := by
  let B : Config := fun x => evolve p (x + (p : ℤ))
  have hkey : ∀ (t : ℕ) (i : ℤ), evolveFrom B t i = evolve (t + p) (i + (p : ℤ)) := by
    intro t i
    show evolveFrom (fun x => evolve p (x + (p : ℤ))) t i = _
    rw [evolveFrom_translate (evolve p) (p : ℤ) t i, evolveFrom_evolve]
  have hagree : ∀ j : ℤ, -(m : ℤ) < j → B j = initialConfig j := by
    intro j hj
    rcases lt_trichotomy j 0 with hneg | hzero | hpos
    · have hd : ∃ d : ℕ, 0 < d ∧ d < m ∧ j = -(d : ℤ) := by
        refine ⟨(-j).toNat, ?_, ?_, ?_⟩ <;> omega
      obtain ⟨d, hd0, hdm, rfl⟩ := hd
      have : B (-(d : ℤ)) = evolve p ((p : ℤ) - (d : ℤ)) := by
        show evolve p (-(d : ℤ) + (p : ℤ)) = _
        congr 1
        ring
      rw [this, hwhite d hd0 hdm]
      simp [initialConfig]
      omega
    · subst hzero
      have : B 0 = evolve p (p : ℤ) := by
        show evolve p (0 + (p : ℤ)) = _
        congr 1
        ring
      rw [this, evolve_right_edge]
      simp [initialConfig]
    · have hcone : evolve p (j + (p : ℤ)) = false := by
        refine evolve_eq_false_of_outside_cone p (j + (p : ℤ)) ?_
        rw [abs_of_pos (by omega)]
        omega
      show evolve p (j + (p : ℤ)) = initialConfig j
      rw [hcone]
      simp [initialConfig]
      omega
  have hdiff : B (-(m : ℤ)) ≠ initialConfig (-(m : ℤ)) := by
    have : B (-(m : ℤ)) = evolve p ((p : ℤ) - (m : ℤ)) := by
      show evolve p (-(m : ℤ) + (p : ℤ)) = _
      congr 1
      ring
    rw [this, hblack]
    simp [initialConfig]
    omega
  constructor
  · intro t ht
    have h := (rightmost_difference_moves_right B initialConfig (-(m : ℤ)) t hagree hdiff).2 0
      (by omega)
    rw [hkey t 0] at h
    have h0 : (0 : ℤ) + (p : ℤ) = (p : ℤ) := by ring
    rw [h0] at h
    exact h
  · have h := (rightmost_difference_moves_right B initialConfig (-(m : ℤ)) m hagree hdiff).1
    have hzero : -(m : ℤ) + (m : ℕ) = 0 := by omega
    rw [hzero, hkey m 0] at h
    have h0 : (0 : ℤ) + (p : ℤ) = (p : ℤ) := by ring
    rw [h0] at h
    exact h
