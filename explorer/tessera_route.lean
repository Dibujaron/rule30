import Rule30.Basic
import Mathlib.Tactic

/-! Candidate routes, each proved against the exact statement text proposed. -/

theorem rowStep_agree_succ_iff (n x y : ℕ) (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) :
    rowStep x % 2 ^ (n + 2) = rowStep y % 2 ^ (n + 2) ↔
      (x.testBit n = true ∨ x % 2 ^ (n + 2) = y % 2 ^ (n + 2)) := by
  have tb : ∀ r i : ℕ, (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
    intro r i
    have h4 : 4 * r = 2 ^ 2 * r := by norm_num
    have h2 : 2 * r = 2 ^ 1 * r := by norm_num
    unfold rowStep
    rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
      Nat.testBit_two_pow_mul]
  have miff : ∀ a b m : ℕ, a % 2 ^ m = b % 2 ^ m ↔ ∀ i < m, a.testBit i = b.testBit i := by
    intro a b m
    constructor
    · intro hh i hi
      have := congrArg (fun z => z.testBit i) hh
      simpa [Nat.testBit_mod_two_pow, hi] using this
    · intro hh
      apply Nat.eq_of_testBit_eq
      intro i
      rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
      by_cases hi : i < m
      · simp [hi, hh i hi]
      · simp [hi]
  have hlow := (miff _ _ _).1 h
  have hbit : ((rowStep x).testBit (n + 1) = (rowStep y).testBit (n + 1)) ↔
      (x.testBit n = true ∨ x.testBit (n + 1) = y.testBit (n + 1)) := by
    have h1 : decide (1 ≤ n + 1) = true := by simp
    rw [tb, tb, show n + 1 - 1 = n by omega, hlow (n + 1 - 2) (by omega),
      hlow n (by omega), h1, Bool.true_and]
    generalize (decide (2 ≤ n + 1) && y.testBit (n + 1 - 2)) = a
    generalize y.testBit n = b
    generalize x.testBit (n + 1) = c
    generalize y.testBit (n + 1) = d
    cases a <;> cases b <;> cases c <;> cases d <;> decide
  have hlow1 : ∀ i < n + 1, (rowStep x).testBit i = (rowStep y).testBit i := by
    intro i hi
    rw [tb, tb, hlow (i - 2) (by omega), hlow (i - 1) (by omega), hlow i (by omega)]
  rw [miff, miff]
  constructor
  · intro hall
    rcases (hbit.1 (hall (n + 1) (by omega))) with h1 | h1
    · exact Or.inl h1
    · refine Or.inr fun i hi => ?_
      by_cases hi' : i < n + 1
      · exact hlow i hi'
      · have : i = n + 1 := by omega
        subst this; exact h1
  · intro hor i hi
    by_cases hi' : i < n + 1
    · exact hlow1 i hi'
    · have : i = n + 1 := by omega
      subst this
      rw [hbit]
      rcases hor with h1 | h1
      · exact Or.inl h1
      · exact Or.inr (h1 (n + 1) (by omega))
