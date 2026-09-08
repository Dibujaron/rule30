import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence
import Rule30.Proofs.LeftDiagonalPeriodicFromPow
import Rule30.Proofs.PeriodicFromMul

/-!
Scratch, Sextant 2026-09-08: the two masking laws of the transient band in
diagonal coordinates (attack document C1). A cell is *transient* when it
differs from the same diagonal read one shift `M` later; with `M = 2 ^ k`
that is the settled word. Not a node; checked with `lake env lean`.

(a) The front's law: a transient on diagonal `k + 2` at `j`, with the two
    cells to its left at the same time settled, continues to `j + 1` iff the
    driver cell `D_{k+1}(j+1)` is white.
(b) The masking law: a settled cell on diagonal `k + 2` at `j`, under a
    transient driver `D_{k+1}(j+1)`, with `D_k(j+2)` settled, stays settled
    at `j + 1` iff `D_{k+2}(j)` is black.
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

theorem leftDiagonal_transient_mask_law (k j M : ℕ)
    (hc : leftDiagonal (k + 2) j = leftDiagonal (k + 2) (j + M))
    (hT : leftDiagonal (k + 1) (j + 1) ≠ leftDiagonal (k + 1) (j + 1 + M))
    (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + M)) :
    (leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + M))
      ↔ leftDiagonal (k + 2) j = false := by
  have R1 := leftDiagonal_recurrence k j
  have R2 := leftDiagonal_recurrence k (j + M)
  rw [show j + M + 1 = j + 1 + M from by omega,
    show j + M + 2 = j + 2 + M from by omega] at R2
  rw [R1, R2, ← hc, ← h0]
  revert hT
  generalize leftDiagonal k (j + 2) = a
  generalize leftDiagonal (k + 1) (j + 1) = b
  generalize leftDiagonal (k + 1) (j + 1 + M) = b'
  generalize leftDiagonal (k + 2) j = c
  cases a <;> cases b <;> cases b' <;> cases c <;> decide

/-- (a) with the settled words read at their own shifts `2 ^ k`: the hypotheses
are the transient predicate of the attack document. -/
theorem leftDiagonal_transient_front_law_pow (k j : ℕ)
    (hT : leftDiagonal (k + 2) j ≠ leftDiagonal (k + 2) (j + 2 ^ (k + 2)))
    (h1 : leftDiagonal (k + 1) (j + 1) = leftDiagonal (k + 1) (j + 1 + 2 ^ (k + 1)))
    (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + 2 ^ k)) :
    (leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + 2 ^ (k + 2)))
      ↔ leftDiagonal (k + 1) (j + 1) = false := by
  apply leftDiagonal_transient_front_law k j (2 ^ (k + 2)) hT
  · obtain ⟨N, hN, hp⟩ := leftDiagonal_periodicFrom_pow (k + 1)
    have h := hp (j + 1 + 2 ^ (k + 1)) (by omega)
    rw [show j + 1 + 2 ^ (k + 1) + 2 ^ (k + 1) = j + 1 + 2 ^ (k + 2) from by
      rw [pow_succ 2 (k + 1)]; omega] at h
    exact h1.trans h.symm
  · obtain ⟨N, hN, hp⟩ := leftDiagonal_periodicFrom_pow k
    have hp3 := periodicFrom_mul _ _ _ hp 3
    have h := hp3 (j + 2 + 2 ^ k) (by omega)
    rw [show j + 2 + 2 ^ k + 3 * 2 ^ k = j + 2 + 2 ^ (k + 2) from by
      rw [pow_succ 2 (k + 1), pow_succ 2 k]; omega] at h
    exact h0.trans h.symm

#print axioms leftDiagonal_transient_front_law
#print axioms leftDiagonal_transient_mask_law
#print axioms leftDiagonal_transient_front_law_pow
