/-
Portage (connector, 2026-09-08): a type-check only. This file states the two
lemmas the sighting document hands over, with `sorry` for the proofs, purely
to confirm they elaborate against `Rule30/Basic.lean`. It is not a proof, it
is not on the board, and nothing imports it.

  lake env lean explorer/portage_scratch_evendriver.lean
-/
import Rule30.Basic
import Mathlib.Algebra.BigOperators.Group.Finset.Defs
import Mathlib.Algebra.Group.Even

/-- The even-driver mirror of `rightDiagonal_antiperiodic_of_odd_driver`:
the period stays at `L` rather than doubling. -/
theorem portage_rightDiagonal_periodicFrom_step_of_even_driver (k L : ℕ)
    (hL0 : PeriodicFrom (rightDiagonal k) L 0)
    (hL1 : PeriodicFrom (rightDiagonal (k + 1)) L 0)
    (heven : Even ((Finset.range L).sum
      (fun j => if rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2) then 1 else 0))) :
    PeriodicFrom (rightDiagonal (k + 2)) L 0 := by
  sorry

/-- If some column is cohomologous to the centre column — their XOR is
eventually periodic — then a periodic centre column forces that column
periodic too. The enabling half of the sighting's topic 2. -/
theorem portage_centerColumn_other_of_cohomologous_column (x : ℤ) (j : ℕ) (hx : x ≠ 0)
    (hd : ∃ p > 0, ∃ N, PeriodicFrom (fun t => xor (centerColumn t) (evolve (t + j) x)) p N)
    (hc : ∃ p > 0, ∃ N, PeriodicFrom centerColumn p N) :
    ∃ p > 0, ∃ N, PeriodicFrom (fun t => evolve t x) p N := by
  sorry
