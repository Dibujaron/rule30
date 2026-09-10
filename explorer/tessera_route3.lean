import Rule30.Basic
import Mathlib.Tactic

/-! The two plumbing routes, with every helper inlined inside the tactic block,
so that what is verified here is exactly the script the proposal ships. -/

theorem rowStep_agree_forward (n t x y : ℕ) (h : x % 2 ^ n = y % 2 ^ n) :
    rowStep^[t] x % 2 ^ n = rowStep^[t] y % 2 ^ n := by
  have rs_mod : ∀ r m : ℕ, rowStep r % 2 ^ m = rowStep (r % 2 ^ m) % 2 ^ m := by
    intro r m
    have tb : ∀ s i : ℕ, (rowStep s).testBit i
        = xor (decide (2 ≤ i) && s.testBit (i - 2))
            ((decide (1 ≤ i) && s.testBit (i - 1)) || s.testBit i) := by
      intro s i
      have h4 : 4 * s = 2 ^ 2 * s := by norm_num
      have h2 : 2 * s = 2 ^ 1 * s := by norm_num
      unfold rowStep
      rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
        Nat.testBit_two_pow_mul]
    apply Nat.eq_of_testBit_eq
    intro i
    rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow, tb, tb]
    by_cases hi : i < m
    · have h1 : i - 1 < m := by omega
      have h2 : i - 2 < m := by omega
      simp [Nat.testBit_mod_two_pow, hi, h1, h2]
    · simp [hi]
  induction t generalizing x y with
  | zero => simpa using h
  | succ t ih =>
    rw [Function.iterate_succ_apply, Function.iterate_succ_apply]
    exact ih _ _ (by rw [rs_mod, h, ← rs_mod])

theorem stepMod_iterate_eq_rowStep_mod (n t x : ℕ) :
    (stepMod n)^[t] (x % 2 ^ n) = rowStep^[t] x % 2 ^ n := by
  have rs_mod : ∀ r m : ℕ, rowStep r % 2 ^ m = rowStep (r % 2 ^ m) % 2 ^ m := by
    intro r m
    have tb : ∀ s i : ℕ, (rowStep s).testBit i
        = xor (decide (2 ≤ i) && s.testBit (i - 2))
            ((decide (1 ≤ i) && s.testBit (i - 1)) || s.testBit i) := by
      intro s i
      have h4 : 4 * s = 2 ^ 2 * s := by norm_num
      have h2 : 2 * s = 2 ^ 1 * s := by norm_num
      unfold rowStep
      rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
        Nat.testBit_two_pow_mul]
    apply Nat.eq_of_testBit_eq
    intro i
    rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow, tb, tb]
    by_cases hi : i < m
    · have h1 : i - 1 < m := by omega
      have h2 : i - 2 < m := by omega
      simp [Nat.testBit_mod_two_pow, hi, h1, h2]
    · simp [hi]
  induction t generalizing x with
  | zero => simp
  | succ t ih =>
    rw [Function.iterate_succ_apply, Function.iterate_succ_apply]
    have hs : stepMod n (x % 2 ^ n) = rowStep x % 2 ^ n := by
      unfold stepMod; rw [← rs_mod]
    rw [hs, ih (rowStep x)]
