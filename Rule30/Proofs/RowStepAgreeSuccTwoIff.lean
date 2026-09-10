import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** Say `x` and `y`, read as binary numbers, agree on their low `n + 1`
bits, with bit `n` of `x` set. Then one step of the row map agrees two bits further out
exactly when the OR of bits `n + 1` and `n + 2` of `x` matches that of `y`.
**Why it is true.** A set control bit forces the next bit regardless of what came before, so
bits `0..n+1` of `rowStep x` and `rowStep y` agree unconditionally; the one further bit,
`n + 2`, is the XOR of that same set control bit with the OR of bits `n + 1` and `n + 2`,
so agreement there is exactly agreement of that OR.
**Where the work is.** Isolating bit `n + 2` as a bare Boolean expression in `x` and `y`'s
own bits and reducing `xor true a = xor true b ↔ a = b` to four cases by `decide`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowStep_agree_succ_two_iff (n x y : ℕ) (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) (hb : x.testBit n = true) :
  rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3) ↔
    (x.testBit (n + 1) || x.testBit (n + 2)) = (y.testBit (n + 1) || y.testBit (n + 2))
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

theorem rowStep_agree_succ_two_iff (n x y : ℕ)
    (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) (hb : x.testBit n = true) :
    rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3) ↔
      (x.testBit (n + 1) || x.testBit (n + 2)) = (y.testBit (n + 1) || y.testBit (n + 2)) := by
  have hlow := (mod_two_pow_eq_iff _ _ _).1 h
  have hbn : y.testBit n = true := by rw [← hlow n (by omega)]; exact hb
  have hlt : ∀ i < n + 1, (rowStep x).testBit i = (rowStep y).testBit i := by
    intro i hi
    rw [testBit_rowStep, testBit_rowStep]
    have e0 : x.testBit i = y.testBit i := hlow i hi
    by_cases h2 : 2 ≤ i
    · have e1 : x.testBit (i - 1) = y.testBit (i - 1) := hlow (i - 1) (by omega)
      have e2 : x.testBit (i - 2) = y.testBit (i - 2) := hlow (i - 2) (by omega)
      simp [e0, e1, e2]
    · by_cases h1 : 1 ≤ i
      · have e1 : x.testBit (i - 1) = y.testBit (i - 1) := hlow (i - 1) (by omega)
        simp [h2, e0, e1]
      · simp [h1, h2, e0]
  have hbitn1 : (rowStep x).testBit (n + 1) = (rowStep y).testBit (n + 1) := by
    have e2 : x.testBit (n - 1) = y.testBit (n - 1) := hlow (n - 1) (by omega)
    rw [testBit_rowStep, testBit_rowStep, show n + 1 - 1 = n by omega,
      show n + 1 - 2 = n - 1 by omega]
    simp [hb, hbn, e2]
  have hle : ∀ i < n + 2, (rowStep x).testBit i = (rowStep y).testBit i := by
    intro i hi
    by_cases hi' : i < n + 1
    · exact hlt i hi'
    · have hi2 : i = n + 1 := by omega
      subst hi2
      exact hbitn1
  have hbit2 : (rowStep x).testBit (n + 2) = (rowStep y).testBit (n + 2) ↔
      (x.testBit (n + 1) || x.testBit (n + 2)) = (y.testBit (n + 1) || y.testBit (n + 2)) := by
    have hc2 : decide (2 ≤ n + 2) = true := by simp
    have hc1 : decide (1 ≤ n + 2) = true := by simp
    rw [testBit_rowStep, testBit_rowStep, show n + 2 - 2 = n by omega,
      show n + 2 - 1 = n + 1 by omega]
    simp only [hb, hbn, hc2, hc1, Bool.true_and, Bool.and_true]
    generalize (x.testBit (n + 1) || x.testBit (n + 2)) = a
    generalize (y.testBit (n + 1) || y.testBit (n + 2)) = b
    cases a <;> cases b <;> decide
  rw [mod_two_pow_eq_iff, ← hbit2]
  constructor
  · intro hall
    exact hall (n + 2) (by omega)
  · intro heq i hi
    by_cases hi' : i < n + 2
    · exact hle i hi'
    · have hi2 : i = n + 2 := by omega
      subst hi2
      exact heq
