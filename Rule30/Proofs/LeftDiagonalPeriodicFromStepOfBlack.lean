import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence
import Rule30.Proofs.BoolDrivenPeriodicFromOfReset

/-!
**What this says.** If diagonal m+1 shows a black cell at index j+1 (at or past where
diagonals m and m+1 share a period q), then diagonal m+2 also repeats with that same
period q, starting right there at j+1 — no doubling, no delay.
**Why it is true.** In diagonal coordinates the step recurrence reads diagonal m+2 as a
one-bit machine driven by diagonals m and m+1; a black driver bit resets that machine's
state to a function of the drivers alone, so `bool_driven_periodicFrom_of_reset` applies.
**Where the work is.** Matching the recurrence's driver functions to shifted reads of
diagonals m and m+1, so their periodicity at index i+2 / i+1 restates as periodicity of
the drivers at i — pure index bookkeeping, no new idea.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_step_of_black (m q N j : ℕ) (hNj : N ≤ j) (h0 : PeriodicFrom (leftDiagonal m) q N)
  (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) (hblack : leftDiagonal (m + 1) (j + 1) = true) :
  PeriodicFrom (leftDiagonal (m + 2)) q (j + 1)
```
-/

theorem leftDiagonal_periodicFrom_step_of_black (m q N j : ℕ) (hNj : N ≤ j)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N)
    (hblack : leftDiagonal (m + 1) (j + 1) = true) :
    PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) := by
  refine bool_driven_periodicFrom_of_reset
      (fun i => leftDiagonal m (i + 2)) (fun i => leftDiagonal (m + 1) (i + 1))
      (leftDiagonal (m + 2)) q N j ?_ ?_ ?_ hNj hblack
  · intro i
    exact leftDiagonal_recurrence m i
  · intro i hi
    have h := h0 (i + 2) (by omega)
    dsimp only
    rw [show i + q + 2 = i + 2 + q from by omega]
    exact h
  · intro i hi
    have h := h1 (i + 1) (by omega)
    dsimp only
    rw [show i + q + 1 = i + 1 + q from by omega]
    exact h
