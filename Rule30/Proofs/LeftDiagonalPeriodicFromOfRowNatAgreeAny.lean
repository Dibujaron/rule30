import Rule30.Basic
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.RowNatAgreeForward

/-!
**What this says.** Rows that agree on their low bits make that diagonal periodic from any time.
**Why it is true.** If rows T and T+p match mod 2^(k+1), diagonal k's bit k matches at times n+k and n+p+k for all n ≥ T.
**Where the work is.** Applying rowNat_agree_forward to extend the bit agreement to arbitrary times past T.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_of_rowNat_agree_any (k p T : ℕ)
  (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) : PeriodicFrom (leftDiagonal k) p T
```
-/

theorem leftDiagonal_periodicFrom_of_rowNat_agree_any (k p T : ℕ)
    (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) :
    PeriodicFrom (leftDiagonal k) p T := by
  intro n hn
  simp only [leftDiagonal_eq_rowNat_testBit]
  have hmod : rowNat (n + k) % 2 ^ (k + 1) = rowNat (n + p + k) % 2 ^ (k + 1) := by
    have h' := rowNat_agree_forward (k + 1) T p (n + k) (by omega) h
    rwa [show n + k + p = n + p + k by ring] at h'
  -- Two mod-equal numbers have equal bits
  -- If a ≡ b (mod 2^(k+1)), then all bits below k+1 match, including bit k
  have key : (rowNat (n + p + k)).testBit k = (rowNat (n + k)).testBit k := by
    have h1 : (rowNat (n + p + k) % 2 ^ (k + 1)).testBit k = (rowNat (n + k) % 2 ^ (k + 1)).testBit k :=
      by rw [hmod]
    rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow] at h1
    norm_num at h1
    exact h1
  exact key
