import Rule30.Basic
import Rule30.Proofs.EvolveLeftDiagonalRecurrence

/-!
**What this says.** A cell along the right-diagonal edge of the cone evolves by taking its own previous position, XOR'd with the logical-or of two cells one and two diagonals shallower.

**Why it is true.** The recurrence unfolds Rule 30's step at the right-boundary coordinates, expressing the cone's three-neighbor dependencies in diagonal coordinates.

**Where the work is.** Normalizing the time indices and position casts so that evolve_succ and rule30_eq apply directly to the three neighbors.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_recurrence (m i : ℕ) :
  rightDiagonal (m + 2) (i + 1) =
    (rightDiagonal (m + 2) i ^^ (rightDiagonal (m + 1) (i + 1) || rightDiagonal m (i + 2)))
```
-/

theorem rightDiagonal_recurrence (m i : ℕ) :
    rightDiagonal (m + 2) (i + 1)
      = xor (rightDiagonal (m + 2) i)
          (rightDiagonal (m + 1) (i + 1) || rightDiagonal m (i + 2)) := by
  unfold rightDiagonal
  rw [show (i + 1 : ℕ) + (m + 2) = i + (m + 2) + 1 by omega]
  rw [evolve_succ, rule30_eq]
  simp only [show (↑(i + 1 : ℕ) : ℤ) - 1 = ↑i by push_cast; omega,
             show (↑(i + 1 : ℕ) : ℤ) + 1 = ↑(i + 2 : ℕ) by push_cast; omega,
             show (i + 1 : ℕ) + (m + 1) = i + (m + 2) by omega,
             show (i + 2 : ℕ) + m = i + (m + 2) by omega]
