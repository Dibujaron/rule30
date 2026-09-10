import Rule30.Basic
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.RowNatAgreeForward

/-!
**What this says.** If rows `T` and `T+p` of the pattern agree on their low `k+1` bits, for
some `T` at or before `2k`, then left diagonal `k` repeats with period `p` from index `k` on.
**Why it is true.** Diagonal `k` at index `j` is bit `k` of row `j+k`; agreement of the low bits
is never lost going forward (`rowNat_agree_forward`), so it holds at every row `j+k` with `j ≥ k`.
**Where the work is.** Isolating bit `k` from the low-bits agreement, via `Nat.testBit_mod_two_pow`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_of_rowNat_agree (k p T : ℕ) (hT : T ≤ 2 * k)
  (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) : PeriodicFrom (leftDiagonal k) p k
```
-/

theorem leftDiagonal_periodicFrom_of_rowNat_agree (k p T : ℕ) (hT : T ≤ 2 * k)
    (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) :
    PeriodicFrom (leftDiagonal k) p k := by
  intro n hn
  rw [leftDiagonal_eq_rowNat_testBit k (n + p), leftDiagonal_eq_rowNat_testBit k n]
  have hmod : rowNat (n + k) % 2 ^ (k + 1) = rowNat (n + k + p) % 2 ^ (k + 1) :=
    rowNat_agree_forward (k + 1) T p (n + k) (by omega) h
  have hlt : k < k + 1 := Nat.lt_succ_self k
  have e1 : (rowNat (n + k) % 2 ^ (k + 1)).testBit k = (rowNat (n + k)).testBit k := by
    rw [Nat.testBit_mod_two_pow]; simp [hlt]
  have e2 : (rowNat (n + k + p) % 2 ^ (k + 1)).testBit k = (rowNat (n + k + p)).testBit k := by
    rw [Nat.testBit_mod_two_pow]; simp [hlt]
  have hbit : (rowNat (n + k)).testBit k = (rowNat (n + k + p)).testBit k := by
    rw [← e1, ← e2, hmod]
  rw [show n + p + k = n + k + p by omega]
  exact hbit.symm
