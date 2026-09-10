import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** Iterating the truncated row map on truncated data equals iterating the full map and truncating.
**Why it is true.** Bitwise operations on a number only depend on its low bits, so truncating before or after iteration gives the same result.
**Where the work is.** The induction step requires that rowStep respects truncation: applying rowStep to a truncated value and truncating again gives the same result as applying rowStep to the untruncated value and truncating.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.stepMod_iterate_eq_rowStep_mod (n t x : ℕ) : (stepMod n)^[t] (x % 2 ^ n) = rowStep^[t] x % 2 ^ n
```
-/

private theorem testBit_rowStep (r i : ℕ) :
    (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
  unfold rowStep
  conv_lhs => rw [show (4 : ℕ) * r = 2 ^ 2 * r by ring, show (2 : ℕ) * r = 2 ^ 1 * r by ring]
  rw [Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
    Nat.testBit_two_pow_mul]

private theorem rowStep_mod_two_pow (r n : ℕ) :
    rowStep r % 2 ^ n = rowStep (r % 2 ^ n) % 2 ^ n := by
  apply Nat.eq_of_testBit_eq
  intro i
  rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow, testBit_rowStep, testBit_rowStep]
  by_cases hi : i < n
  · have h1 : i - 1 < n := by omega
    have h2 : i - 2 < n := by omega
    simp [Nat.testBit_mod_two_pow, hi, h1, h2]
  · simp [hi]

theorem stepMod_iterate_eq_rowStep_mod (n t x : ℕ) :
    (stepMod n)^[t] (x % 2 ^ n) = rowStep^[t] x % 2 ^ n := by
  induction t with
  | zero => rfl
  | succ t ih =>
    show (stepMod n)^[t + 1] (x % 2 ^ n) = rowStep^[t + 1] x % 2 ^ n
    rw [Function.iterate_succ_apply', ih]
    unfold stepMod
    rw [← rowStep_mod_two_pow (rowStep^[t] x) n]
    rw [Function.iterate_succ_apply']
