import Rule30.Basic
import Rule30.Proofs.EvolveLeftDiagonalRecurrence

/-!
**What this says.** A cell along the left-diagonal edge of the cone evolves by taking its own previous position, XOR'd with the logical-or of two cells one and two diagonals shallower.

**Why it is true.** The recurrence unfolds Rule 30's step at the left-boundary coordinates, expressing the cone's three-neighbor dependencies in diagonal coordinates.

**Where the work is.** Normalizing the position indices so that evolve_left_diagonal_recurrence applies directly to the three neighbors.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_recurrence (m i : ℕ) :
  leftDiagonal (m + 2) (i + 1) = (leftDiagonal m (i + 2) ^^ (leftDiagonal (m + 1) (i + 1) || leftDiagonal (m + 2) i))
```
-/

theorem leftDiagonal_recurrence (m i : ℕ) :
    leftDiagonal (m + 2) (i + 1)
      = xor (leftDiagonal m (i + 2))
          (leftDiagonal (m + 1) (i + 1) || leftDiagonal (m + 2) i) := by
  unfold leftDiagonal
  rw [show (i + 1 : ℕ) + (m + 2) = i + (m + 2) + 1 by omega]
  rw [evolve_succ, rule30_eq]
  simp only [show (-(↑(i + 1 : ℕ) : ℤ)) + 1 = -(↑i : ℤ) by push_cast; ring,
             show (-(↑(i + 1 : ℕ) : ℤ)) - 1 = -(↑(i + 2 : ℕ) : ℤ) by push_cast; ring,
             show (i + 1 : ℕ) + (m + 1) = i + (m + 2) by omega,
             show (i + 2 : ℕ) + m = i + (m + 2) by omega]
