import Rule30.Basic
import Rule30.Proofs.EvolveLeftDiagonalRecurrence
import Rule30.Proofs.BoolDrivenEventuallyTwoPeriodic
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring

/-!
**What this says.** If two diagonals next to each other, both counted in from
the left edge, repeat with the same period from the same time on, then the
next diagonal in from them repeats too, with twice the period and starting
one period later.

**Why it is true.** `evolve_left_diagonal_recurrence` says each entry of that
third diagonal is fixed by one entry from each of the settled diagonals and
by its own previous entry -- exactly the one-bit machine
`bool_driven_eventually_two_periodic` already handles, and that lemma's
conclusion is this statement's period and onset verbatim, not just an
existential.

**Where the work is.** The recurrence and the two periodicity hypotheses each
number the diagonals with a slightly different offset (an extra `+1` or `+2`
tucked inside a cast to `ℤ`), so most of the proof is `omega`/`push_cast`
bookkeeping showing they are all talking about the same three sequences.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_step (m q N : ℕ) (hq : 0 < q) (h0 : PeriodicFrom (leftDiagonal m) q N)
  (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) : PeriodicFrom (leftDiagonal (m + 2)) (2 * q) (N + q)
```
-/

theorem leftDiagonal_periodicFrom_step (m q N : ℕ) (hq : 0 < q)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
    PeriodicFrom (leftDiagonal (m + 2)) (2 * q) (N + q) := by
  have hrec : ∀ i, leftDiagonal (m + 2) (i + 1)
      = xor (leftDiagonal m (i + 2))
          (leftDiagonal (m + 1) (i + 1) || leftDiagonal (m + 2) i) := by
    intro i
    show evolve (i + 1 + (m + 2)) (-((i + 1 : ℕ) : ℤ))
        = xor (evolve (i + 2 + m) (-((i + 2 : ℕ) : ℤ)))
            (evolve (i + 1 + (m + 1)) (-((i + 1 : ℕ) : ℤ)) || evolve (i + (m + 2)) (-(i : ℤ)))
    rw [show i + 1 + (m + 2) = i + m + 3 from by omega,
        show ((i + 1 : ℕ) : ℤ) = (i : ℤ) + 1 from by push_cast; ring,
        show i + 2 + m = i + m + 2 from by omega,
        show ((i + 2 : ℕ) : ℤ) = (i : ℤ) + 2 from by push_cast; ring,
        show i + 1 + (m + 1) = i + m + 2 from by omega,
        show i + (m + 2) = i + m + 2 from by omega]
    exact evolve_left_diagonal_recurrence m i
  have ha : ∀ i ≥ N, leftDiagonal m (i + q + 2) = leftDiagonal m (i + 2) := by
    intro i hi
    rw [show i + q + 2 = i + 2 + q from by omega]
    exact h0 (i + 2) (by omega)
  have hb : ∀ i ≥ N, leftDiagonal (m + 1) (i + q + 1) = leftDiagonal (m + 1) (i + 1) := by
    intro i hi
    rw [show i + q + 1 = i + 1 + q from by omega]
    exact h1 (i + 1) (by omega)
  exact bool_driven_eventually_two_periodic
    (fun i => leftDiagonal m (i + 2))
    (fun i => leftDiagonal (m + 1) (i + 1))
    (leftDiagonal (m + 2))
    q N hq hrec ha hb
