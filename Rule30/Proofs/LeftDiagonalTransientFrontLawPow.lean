import Rule30.Basic
import Rule30.Proofs.LeftDiagonalTransientFrontLaw
import Rule30.Proofs.LeftDiagonalPeriodicFromPow
import Rule30.Proofs.PeriodicFromMul

/-!
**What this says.** The transient cell moves forward iff its driver is false, when all periodicities are the power-of-two shifts proper to those diagonals.
**Why it is true.** Specializes leftDiagonal_transient_front_law to M = 2^(k+2), using the periodicFrom lemmas to extend the given periods.
**Where the work is.** None — one lemma application with hypotheses extended via periodicity.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_transient_front_law_pow (k j : ℕ)
  (hT : leftDiagonal (k + 2) j ≠ leftDiagonal (k + 2) (j + 2 ^ (k + 2)))
  (h1 : leftDiagonal (k + 1) (j + 1) = leftDiagonal (k + 1) (j + 1 + 2 ^ (k + 1)))
  (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + 2 ^ k)) :
  leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + 2 ^ (k + 2)) ↔ leftDiagonal (k + 1) (j + 1) = false
```
-/

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
