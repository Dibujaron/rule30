import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
**What this says.** Past an all-black diagonal, the next diagonal is the negation of the diagonal two steps back, shifted one position.
**Why it is true.** The diagonal recurrence, applied at m+2, XORs with a diagonal that is all-true (by hypothesis), and xor with true is negation.
**Where the work is.** Applying the recurrence relation once and simplifying xor with true via Bool.or_true.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_compl_after_black (m N : ℕ) (hb : ∀ i ≥ N, leftDiagonal (m + 3) i = true) (i : ℕ) :
  i ≥ N → leftDiagonal (m + 4) (i + 1) = !leftDiagonal (m + 2) (i + 2)
```
-/

theorem leftDiagonal_compl_after_black (m N : ℕ)
    (hb : ∀ i ≥ N, leftDiagonal (m + 3) i = true) :
    ∀ i ≥ N, leftDiagonal (m + 4) (i + 1) = !leftDiagonal (m + 2) (i + 2) := by
  intro i hi
  -- Apply leftDiagonal_recurrence at m+2 with position i
  have hrec := leftDiagonal_recurrence (m + 2) i
  have hb_succ : leftDiagonal (m + 3) (i + 1) = true := hb (i + 1) (by omega)
  rw [hrec, hb_succ, Bool.true_or, Bool.xor_true]
