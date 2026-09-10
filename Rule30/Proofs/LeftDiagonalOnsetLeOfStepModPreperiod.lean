import Rule30.Basic
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.RowNatModEqIterate
import Mathlib.Tactic

/-!
**What this says.** If, for every width `k+1`, the orbit of `1` under the row bit-twiddle
truncated to `k+1` bits is repeating by step `2k`, then every left diagonal `k` has settled
into its own repetition by index `k`.
**Why it is true.** `rowNat_mod_eq_iterate` says the truncated rows are exactly that orbit,
and `leftDiagonal_eq_rowNat_testBit` reads diagonal `k` off bit `k` of a row; bit `k` of a
number only depends on the number mod `2^(k+1)`.
**Where the work is.** None of it is diagonal reasoning: it is matching `rowNat (n+p+k)` to
the truncated orbit at `n+k`, taken from the hypothesis at `t = n+k ≥ 2k`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_of_stepMod_preperiod
  (H : ∀ (k x : ℕ), x < 2 ^ (k + 1) → ∃ p > 0, ∀ t ≥ 2 * k, (stepMod (k + 1))^[t + p] x = (stepMod (k + 1))^[t] x)
  (k : ℕ) : ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N
```
-/

theorem leftDiagonal_onset_le_of_stepMod_preperiod
    (H : ∀ k x : ℕ, x < 2 ^ (k + 1) → ∃ p > 0, ∀ t ≥ 2 * k,
      (stepMod (k + 1))^[t + p] x
        = (stepMod (k + 1))^[t] x) :
    ∀ k, ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  intro k
  have h1 : (1 : ℕ) < 2 ^ (k + 1) := by
    have hpos : 0 < (2 : ℕ) ^ k := pow_pos (by norm_num) k
    rw [pow_succ]
    omega
  obtain ⟨p, hp, hper⟩ := H k 1 h1
  refine ⟨p, hp, k, le_rfl, ?_⟩
  intro n hn
  have hmod1 : (1 : ℕ) % 2 ^ (k + 1) = 1 := Nat.mod_eq_of_lt h1
  have e1 := rowNat_mod_eq_iterate (k + 1) (n + k)
  have e2 := rowNat_mod_eq_iterate (k + 1) (n + k + p)
  rw [hmod1] at e1 e2
  have key : rowNat (n + k + p) % 2 ^ (k + 1) = rowNat (n + k) % 2 ^ (k + 1) := by
    rw [e2, hper (n + k) (by omega), ← e1]
  have hlt : k < k + 1 := Nat.lt_succ_self k
  have hb1 : (rowNat (n + k + p) % 2 ^ (k + 1)).testBit k
      = (rowNat (n + k + p)).testBit k := by
    rw [Nat.testBit_mod_two_pow]
    simp [hlt]
  have hb2 : (rowNat (n + k) % 2 ^ (k + 1)).testBit k
      = (rowNat (n + k)).testBit k := by
    rw [Nat.testBit_mod_two_pow]
    simp [hlt]
  rw [leftDiagonal_eq_rowNat_testBit k (n + p), leftDiagonal_eq_rowNat_testBit k n,
    show n + p + k = n + k + p from by omega, ← hb1, ← hb2, key]
