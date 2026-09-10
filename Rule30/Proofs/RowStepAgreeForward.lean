import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** Two numbers agreeing on their low `n` bits keep agreeing there after
any number of `rowStep` iterations.
**Why it is true.** `rowStep` truncated to `n` bits is a fixed function of the input
truncated to `n` bits, so iterating it preserves equality of two starting points that
already agree mod `2^n`.
**Where the work is.** Showing truncation commutes with one step of `rowStep`: read off
bit `i` of the output from bits `i`, `i-1`, `i-2` of the input, matching
`Rule30.Proofs.RowNatModEqIterate`'s private `rowStep_mod_two_pow`, which cannot be
imported since it is private there.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowStep_agree_forward (n t x y : ℕ) (h : x % 2 ^ n = y % 2 ^ n) :
  rowStep^[t] x % 2 ^ n = rowStep^[t] y % 2 ^ n
```
-/

private theorem testBit_rowStep (r i : ℕ) :
    (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
  have h4 : 4 * r = 2 ^ 2 * r := by norm_num
  have h2 : 2 * r = 2 ^ 1 * r := by norm_num
  unfold rowStep
  rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
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

theorem rowStep_agree_forward (n t x y : ℕ) (h : x % 2 ^ n = y % 2 ^ n) :
    rowStep^[t] x % 2 ^ n = rowStep^[t] y % 2 ^ n := by
  induction t generalizing x y with
  | zero => exact h
  | succ t ih =>
    rw [Function.iterate_succ_apply, Function.iterate_succ_apply]
    apply ih
    rw [rowStep_mod_two_pow x n, h, ← rowStep_mod_two_pow y n]
