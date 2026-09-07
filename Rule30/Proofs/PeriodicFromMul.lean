import Rule30.Basic

/-!
**What this says.** A multiple of a period is itself a period, from the same starting time.
**Why it is true.** Induction on the multiplier: the base case is trivial, and each step chains one more period onto the sequence.
**Where the work is.** None—it is pure arithmetic with two lemmas threaded in sequence.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.periodicFrom_mul (f : ℕ → Bool) (p N : ℕ) (h : PeriodicFrom f p N) (m : ℕ) : PeriodicFrom f (m * p) N
```
-/

theorem periodicFrom_mul (f : ℕ → Bool) (p N : ℕ) (h : PeriodicFrom f p N) (m : ℕ) :
    PeriodicFrom f (m * p) N := by
  induction m with
  | zero =>
    intro n _
    simp only [Nat.zero_mul, Nat.add_zero]
  | succ m ih =>
    intro n hn
    have heq : n + (m + 1) * p = n + m * p + p := by
      rw [Nat.succ_mul, Nat.add_assoc]
    have hnm : n + m * p ≥ N := by
      calc n + m * p ≥ N + m * p := by omega
        _ ≥ N := by omega
    rw [heq, h (n + m * p) hnm, ih n hn]
