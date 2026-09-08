import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
**What this says.** A cell on a left diagonal differs from its shifted counterpart exactly when its driver cell on the shallower diagonal is white, given the two neighbors are settled.
**Why it is true.** The recurrence relation xor-ing three terms shows the difference propagates when the driver (the middle term in the or) is white.
**Where the work is.** The xor-or algebra: sixteen Bool cases, each decided by reflexivity.
-/

theorem leftDiagonal_transient_front_law (k j M : ℕ)
    (hT : leftDiagonal (k + 2) j ≠ leftDiagonal (k + 2) (j + M))
    (h1 : leftDiagonal (k + 1) (j + 1) = leftDiagonal (k + 1) (j + 1 + M))
    (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + M)) :
    (leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + M))
      ↔ leftDiagonal (k + 1) (j + 1) = false := by
  have R1 := leftDiagonal_recurrence k j
  have R2 := leftDiagonal_recurrence k (j + M)
  rw [show j + M + 1 = j + 1 + M from by omega,
    show j + M + 2 = j + 2 + M from by omega] at R2
  rw [R1, R2, ← h1, ← h0]
  revert hT
  generalize leftDiagonal k (j + 2) = a
  generalize leftDiagonal (k + 1) (j + 1) = b
  generalize leftDiagonal (k + 2) j = c
  generalize leftDiagonal (k + 2) (j + M) = c'
  cases a <;> cases b <;> cases c <;> cases c' <;> decide
