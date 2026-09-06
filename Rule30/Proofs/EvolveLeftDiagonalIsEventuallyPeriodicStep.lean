import Rule30.Basic
import Rule30.Proofs.EvolveLeftDiagonalRecurrence
import Rule30.Proofs.IsEventuallyPeriodicShift
import Rule30.Proofs.IsEventuallyPeriodicCommonPeriod
import Rule30.Proofs.BoolDrivenEventuallyTwoPeriodic
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring

/-!
**What this says.** If two diagonals next to each other, both counted in from
the left edge, eventually settle into a repeating pattern, then the next
diagonal in from them does too.

**Why it is true.** `evolve_left_diagonal_recurrence` says each entry of that
third diagonal is fixed by one entry from each of the settled diagonals and
by its own previous entry -- exactly the one-bit machine
`bool_driven_eventually_two_periodic` already handles.

**Where the work is.** The recurrence and the two periodicity hypotheses each
number the diagonals with a slightly different offset (an extra `+1` or `+2`
tucked inside a cast to `ℤ`), so most of the proof is `omega`/`push_cast`
bookkeeping showing they are all talking about the same three sequences.
-/

theorem evolve_left_diagonal_isEventuallyPeriodic_step (m : ℕ)
    (h0 : IsEventuallyPeriodic fun j => evolve (j + m) (-(j : ℤ)))
    (h1 : IsEventuallyPeriodic fun j => evolve (j + (m + 1)) (-(j : ℤ))) :
    IsEventuallyPeriodic fun j => evolve (j + (m + 2)) (-(j : ℤ)) := by
  have ha : IsEventuallyPeriodic (fun i => evolve (i + 2 + m) (-((i + 2 : ℕ) : ℤ))) :=
    isEventuallyPeriodic_shift (fun j => evolve (j + m) (-(j : ℤ))) 2 h0
  have hb : IsEventuallyPeriodic (fun i => evolve (i + 1 + (m + 1)) (-((i + 1 : ℕ) : ℤ))) :=
    isEventuallyPeriodic_shift (fun j => evolve (j + (m + 1)) (-(j : ℤ))) 1 h1
  obtain ⟨p, hp, N, hNa, hNb⟩ := isEventuallyPeriodic_common_period _ _ ha hb
  have hrec : ∀ i, evolve (i + 1 + (m + 2)) (-((i + 1 : ℕ) : ℤ))
      = xor (evolve (i + 2 + m) (-((i + 2 : ℕ) : ℤ)))
          (evolve (i + 1 + (m + 1)) (-((i + 1 : ℕ) : ℤ)) ||
            evolve (i + (m + 2)) (-(i : ℤ))) := by
    intro i
    rw [show i + 1 + (m + 2) = i + m + 3 from by omega,
        show ((i + 1 : ℕ) : ℤ) = (i : ℤ) + 1 from by push_cast; ring,
        show i + 2 + m = i + m + 2 from by omega,
        show ((i + 2 : ℕ) : ℤ) = (i : ℤ) + 2 from by push_cast; ring,
        show i + 1 + (m + 1) = i + m + 2 from by omega,
        show i + (m + 2) = i + m + 2 from by omega]
    exact evolve_left_diagonal_recurrence m i
  have hstep := bool_driven_eventually_two_periodic
    (fun i => evolve (i + 2 + m) (-((i + 2 : ℕ) : ℤ)))
    (fun i => evolve (i + 1 + (m + 1)) (-((i + 1 : ℕ) : ℤ)))
    (fun i => evolve (i + (m + 2)) (-(i : ℤ)))
    p N hp hrec hNa hNb
  exact ⟨2 * p, by omega, N + p, hstep⟩
