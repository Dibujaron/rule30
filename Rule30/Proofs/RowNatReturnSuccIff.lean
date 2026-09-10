import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** Say row `T` and row `T + p`, read as binary numbers, already agree on
their low `n + 1` bits. Their successor rows agree on the low `n + 2` bits exactly when
either bit `n` of row `T` is set, or the two rows already agreed that far out.
**Why it is true.** Rule 30 packed into a number masks bit `n + 1` with bit `n`: if bit `n`
is black the new bit `n + 1` is forced regardless of the old one, and if it is white the new
bit is the xor of two bits both rows already agreed on.
**Where the work is.** Bit `n + 1` of the successor is a fixed Boolean expression in four
bits of the two rows; `cases ... <;> decide` over all sixteen settles it once the low bits'
agreement (`h`) is rewritten in.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowNat_return_succ_iff (n T p : ℕ) (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1)) :
  rowNat (T + 1) % 2 ^ (n + 2) = rowNat (T + p + 1) % 2 ^ (n + 2) ↔
    (rowNat T).testBit n = true ∨ rowNat T % 2 ^ (n + 2) = rowNat (T + p) % 2 ^ (n + 2)
```
-/

private theorem rowNat_succ_eq (t : ℕ) : rowNat (t + 1) = rowStep (rowNat t) := rfl

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

private theorem rowNat_succ_mod_two_pow_congr (s t n : ℕ)
    (h : rowNat s % 2 ^ n = rowNat t % 2 ^ n) :
    rowNat (s + 1) % 2 ^ n = rowNat (t + 1) % 2 ^ n := by
  rw [rowNat_succ_eq, rowNat_succ_eq, rowStep_mod_two_pow, h]
  exact (rowStep_mod_two_pow _ _).symm

theorem rowNat_return_succ_iff (n T p : ℕ)
    (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1)) :
    rowNat (T + 1) % 2 ^ (n + 2) = rowNat (T + p + 1) % 2 ^ (n + 2) ↔
      ((rowNat T).testBit n = true ∨
        rowNat T % 2 ^ (n + 2) = rowNat (T + p) % 2 ^ (n + 2)) := by
  have hlow := (mod_two_pow_eq_iff _ _ _).1 h
  have hlow1 := (mod_two_pow_eq_iff _ _ _).1
    (rowNat_succ_mod_two_pow_congr T (T + p) (n + 1) h)
  have hbit : ((rowNat (T + 1)).testBit (n + 1) = (rowNat (T + p + 1)).testBit (n + 1)) ↔
      ((rowNat T).testBit n = true ∨
        (rowNat T).testBit (n + 1) = (rowNat (T + p)).testBit (n + 1)) := by
    have h1 : decide (1 ≤ n + 1) = true := by simp
    rw [rowNat_succ_eq, rowNat_succ_eq, testBit_rowStep, testBit_rowStep,
      show n + 1 - 1 = n by omega, hlow (n + 1 - 2) (by omega), hlow n (by omega), h1,
      Bool.true_and]
    generalize (decide (2 ≤ n + 1) && (rowNat (T + p)).testBit (n + 1 - 2)) = a
    generalize (rowNat (T + p)).testBit n = b
    generalize (rowNat T).testBit (n + 1) = c
    generalize (rowNat (T + p)).testBit (n + 1) = d
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
