import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence
import Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack
import Rule30.Proofs.BoolDrivenPeriodicFromOfReset

/-!
**What this says.** A black cell at index j+1, on both diagonal m+1 and diagonal m+2, carries a
shared period q from diagonals m, m+1 two steps inward at once, to diagonals m+2 and m+3, both
starting right there at j+1.
**Why it is true.** The first diagonal is `leftDiagonal_periodicFrom_step_of_black` unchanged.
For the second, the same reset argument applies one step further in: diagonal m+3's driving
diagonal is m+2, and its own periodicity from j+1 (just established) is exactly what the reset
needs, read from index j instead of j+1 since the driver in this step is shifted by one.
**Where the work is.** Recognising that diagonal m+2's freshly-proved period, shifted by one
index, supplies the second application's driver hypothesis — no new idea beyond the one step.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_step_two_of_black (m q N j : ℕ) (hNj : N ≤ j)
  (h0 : PeriodicFrom (leftDiagonal m) q N) (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N)
  (hblack : leftDiagonal (m + 1) (j + 1) = true) (hblack2 : leftDiagonal (m + 2) (j + 1) = true) :
  PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) ∧ PeriodicFrom (leftDiagonal (m + 3)) q (j + 1)
```
-/

theorem leftDiagonal_periodicFrom_step_two_of_black (m q N j : ℕ) (hNj : N ≤ j)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N)
    (hblack : leftDiagonal (m + 1) (j + 1) = true)
    (hblack2 : leftDiagonal (m + 2) (j + 1) = true) :
    PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) ∧
      PeriodicFrom (leftDiagonal (m + 3)) q (j + 1) := by
  have part1 : PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) :=
    leftDiagonal_periodicFrom_step_of_black m q N j hNj h0 h1 hblack
  have part2 : PeriodicFrom (leftDiagonal (m + 3)) q (j + 1) := by
    refine bool_driven_periodicFrom_of_reset
        (fun i => leftDiagonal (m + 1) (i + 2)) (fun i => leftDiagonal (m + 2) (i + 1))
        (leftDiagonal (m + 3)) q j j ?_ ?_ ?_ (le_refl j) hblack2
    · intro i
      exact leftDiagonal_recurrence (m + 1) i
    · intro i hi
      dsimp only
      rw [show i + q + 2 = i + 2 + q from by omega]
      exact h1 (i + 2) (by omega)
    · intro i hi
      dsimp only
      rw [show i + q + 1 = i + 1 + q from by omega]
      exact part1 (i + 1) (by omega)
  exact ⟨part1, part2⟩
