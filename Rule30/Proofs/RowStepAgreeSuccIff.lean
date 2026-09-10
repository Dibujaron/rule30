import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** Two rows agreeing on their low `n + 1` bits have successor rows
agreeing on the low `n + 2` bits exactly when either bit `n` of the first row is
black, or the two rows already agreed that far out.
**Why it is true.** Rule 30 packed into a number masks bit `n + 1` with bit `n`: if
bit `n` is black the new bit `n + 1` is forced regardless of the old one, and if it
is white the new bit is the xor of two bits both rows already agreed on.
**Where the work is.** Bit `n + 1` of the successor is a fixed Boolean expression in
four bits; `cases ... <;> decide` over all sixteen settles it once the low-bit
agreement is rewritten in.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowStep_agree_succ_iff (n x y : ℕ) (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) :
  rowStep x % 2 ^ (n + 2) = rowStep y % 2 ^ (n + 2) ↔ x.testBit n = true ∨ x % 2 ^ (n + 2) = y % 2 ^ (n + 2)
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

private theorem mod_two_pow_eq_iff (a b m : ℕ) :
    a % 2 ^ m = b % 2 ^ m ↔ ∀ i < m, a.testBit i = b.testBit i := by
  constructor
  · intro h i hi
    have := congrArg (fun x => x.testBit i) h
    simpa [Nat.testBit_mod_two_pow, hi] using this
  · intro h
    apply Nat.eq_of_testBit_eq
    intro i
    rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
    by_cases hi : i < m
    · simp [hi, h i hi]
    · simp [hi]

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

theorem rowStep_agree_succ_iff (n x y : ℕ) (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) :
    rowStep x % 2 ^ (n + 2) = rowStep y % 2 ^ (n + 2) ↔
      (x.testBit n = true ∨ x % 2 ^ (n + 2) = y % 2 ^ (n + 2)) := by
  have hlow := (mod_two_pow_eq_iff x y (n + 1)).1 h
  have hlow1 := (mod_two_pow_eq_iff (rowStep x) (rowStep y) (n + 1)).1
    (by rw [rowStep_mod_two_pow x (n + 1), h, ← rowStep_mod_two_pow y (n + 1)])
  have hbit : ((rowStep x).testBit (n + 1) = (rowStep y).testBit (n + 1)) ↔
      (x.testBit n = true ∨ x.testBit (n + 1) = y.testBit (n + 1)) := by
    have h1 : decide (1 ≤ n + 1) = true := by simp
    rw [testBit_rowStep, testBit_rowStep,
      show n + 1 - 1 = n by omega, hlow (n + 1 - 2) (by omega), hlow n (by omega), h1,
      Bool.true_and]
    generalize (decide (2 ≤ n + 1) && y.testBit (n + 1 - 2)) = a
    generalize y.testBit n = b
    generalize x.testBit (n + 1) = c
    generalize y.testBit (n + 1) = d
    cases a <;> cases b <;> cases c <;> cases d <;> decide
  rw [mod_two_pow_eq_iff, mod_two_pow_eq_iff]
  constructor
  · intro hall
    have hn1 := hall (n + 1) (by omega)
    rw [hbit] at hn1
    rcases hn1 with h1 | h1
    · exact Or.inl h1
    · right
      intro i hi
      by_cases hi' : i < n + 1
      · exact hlow i hi'
      · have : i = n + 1 := by omega
        subst this
        exact h1
  · intro hor i hi
    by_cases hi' : i < n + 1
    · exact hlow1 i hi'
    · have : i = n + 1 := by omega
      subst this
      rw [hbit]
      rcases hor with h1 | h1
      · exact Or.inl h1
      · exact Or.inr (h1 (n + 1) (by omega))
