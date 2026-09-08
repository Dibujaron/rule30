import Rule30.Basic
import Rule30.Proofs.LeftDiagonalPeriodicFromPow

/-!
**What this says.** The settled word of a diagonal is the same at every multiple of the diagonal's period.
**Why it is true.** Periodicity: after 2^k steps, each diagonal k repeats, so 1 * 2^k and m * 2^k read the same cell.
**Where the work is.** Induction on m starting from 1, threading the periodicity; ring handles index arithmetic.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_mul_pow_eq_settledCenter (k m : ℕ) (hm : 1 ≤ m) : leftDiagonal k (m * 2 ^ k) = settledCenter k
```
-/

theorem leftDiagonal_mul_pow_eq_settledCenter (k m : ℕ) (hm : 1 ≤ m) :
    leftDiagonal k (m * 2 ^ k) = settledCenter k := by
  obtain ⟨N, hNle, hper⟩ := leftDiagonal_periodicFrom_pow k
  unfold settledCenter
  -- Convert m ≥ 1 to m = m' + 1
  obtain ⟨m', rfl⟩ := Nat.exists_eq_succ_of_ne_zero (by omega : m ≠ 0)
  clear hm
  -- Induction on m'
  induction m' with
  | zero =>
    -- Base: (0 + 1) * 2^k = 2^k
    norm_num
  | succ m' ih =>
    -- Step: ((m' + 1) + 1) * 2^k = (m' + 1) * 2^k + 2^k, use periodicity
    have step_eq : ((m' + 1) + 1) * 2 ^ k = (m' + 1) * 2 ^ k + 2 ^ k := by ring
    rw [step_eq]
    -- Apply periodicity at (m' + 1) * 2^k, which is ≥ N
    have h_ge : (m' + 1) * 2 ^ k ≥ N := by
      have : (m' + 1) * 2 ^ k ≥ 1 * 2 ^ k := by apply Nat.mul_le_mul_right; omega
      simp only [Nat.one_mul] at this
      omega
    have : leftDiagonal k ((m' + 1) * 2 ^ k + 2 ^ k) = leftDiagonal k ((m' + 1) * 2 ^ k) :=
      hper ((m' + 1) * 2 ^ k) h_ge
    rw [this]
    exact ih
