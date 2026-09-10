import Rule30.Basic
import Mathlib.Tactic.Ring

/-!
**What this says.** If a sequence is periodic with one period from some time, it remains periodic with any other of its periods from an earlier time too.

**Why it is true.** The two periods can be unified: walk forward using one period until reaching the later onset, then the other period applies retroactively.

**Where the work is.** The arithmetic: finding a common distance divisible by the first period that reaches the second onset.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.periodicFrom_trans_period (f : ℕ → Bool) (p q N M : ℕ) (hp : 0 < p) (hN : PeriodicFrom f p N)
  (hM : PeriodicFrom f q M) : PeriodicFrom f q N
```
-/

theorem periodicFrom_trans_period (f : ℕ → Bool) (p q N M : ℕ) (hp : 0 < p)
    (hN : PeriodicFrom f p N) (hM : PeriodicFrom f q M) : PeriodicFrom f q N := by
  intro n hn
  by_cases h : n ≥ M
  · exact hM n h
  · have h_n_lt_M : n < M := by omega
    have hp_pos : 0 < p := hp
    have hp_ge_1 : p ≥ 1 := hp_pos
    -- Key fact: M > 0 (since n < M and n >= 0)
    have hM_pos : M > 0 := by omega
    -- Therefore: M * p >= M (since M >= 1 and p >= 1, so M*p >= M*1 = M)
    have h_Mp_ge_M : M * p ≥ M := by
      have : M * 1 ≤ M * p := Nat.mul_le_mul_left M hp_ge_1
      simp at this
      exact this
    -- Therefore: n + M*p >= M
    have h_base : n + M * p ≥ M := by
      calc n + M * p ≥ 0 + M * p := by omega
        _ ≥ M := by omega
    -- Helper: apply hN repeatedly
    have apply_hN_k : ∀ k, f (n + k * p) = f n := by
      intro k
      induction k with
      | zero => simp
      | succ k ih =>
        have eq : n + (k + 1) * p = n + k * p + p := by ring
        rw [eq, hN (n + k * p) (by omega : n + k * p ≥ N)]
        exact ih
    have apply_hN_q_k : ∀ k, f (n + q + k * p) = f (n + q) := by
      intro k
      induction k with
      | zero => simp
      | succ k ih =>
        have eq : n + q + (k + 1) * p = n + q + k * p + p := by ring
        rw [eq, hN (n + q + k * p) (by omega : n + q + k * p ≥ N)]
        exact ih
    -- Chain of equalities
    calc f (n + q) = f (n + q + M * p) := (apply_hN_q_k M).symm
      _ = f (n + M * p + q) := by congr 1; ring
      _ = f (n + M * p) := hM (n + M * p) h_base
      _ = f n := apply_hN_k M
