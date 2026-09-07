import Rule30.Basic
import Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack

/-!
**What this says.** If diagonals m and m+1 share a period q from N, then either
diagonal m+2 also settles into period q somewhere, or diagonal m+1 is white at
every index past N — the only two ways the step can go.
**Why it is true.** Case on whether diagonal m+1 ever shows black at or past N:
a black cell resets diagonal m+2 to period q right there
(`leftDiagonal_periodicFrom_step_of_black`); no black cell at all is exactly
the second disjunct, after shifting the index by one.
**Where the work is.** Nowhere new — one `by_cases`, one served lemma, and an
index shift by `omega` in the all-white branch.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_step_period_dichotomy (m q N : ℕ) (h0 : PeriodicFrom (leftDiagonal m) q N)
  (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
  (∃ M, PeriodicFrom (leftDiagonal (m + 2)) q M) ∨ ∀ j ≥ N + 1, leftDiagonal (m + 1) j = false
```
-/

theorem leftDiagonal_step_period_dichotomy (m q N : ℕ)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
    (∃ M, PeriodicFrom (leftDiagonal (m + 2)) q M) ∨
      ∀ j ≥ N + 1, leftDiagonal (m + 1) j = false := by
  by_cases h : ∃ j ≥ N, leftDiagonal (m + 1) (j + 1) = true
  · obtain ⟨j, hjN, hblack⟩ := h
    left
    exact ⟨j + 1, leftDiagonal_periodicFrom_step_of_black m q N j hjN h0 h1 hblack⟩
  · right
    push_neg at h
    simp only [Bool.not_eq_true] at h
    intro j hj
    have h' := h (j - 1) (by omega)
    rw [show j - 1 + 1 = j from by omega] at h'
    exact h'
