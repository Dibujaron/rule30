import Rule30.Basic
import Mathlib.Tactic

theorem rowStep_agree_succ_two_iff (n x y : ℕ)
    (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) (hb : x.testBit n = true) :
    rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3) ↔
      (x.testBit (n + 1) || x.testBit (n + 2)) = (y.testBit (n + 1) || y.testBit (n + 2)) := by
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
  have hby : y.testBit n = true := by rw [← hlow n (by omega)]; exact hb
  -- bits below n + 2 of the two successors agree
  have hlow2 : ∀ i < n + 2, (rowStep x).testBit i = (rowStep y).testBit i := by
    intro i hi
    rcases Nat.lt_or_ge i (n + 1) with hi' | hi'
    · rw [tb, tb, hlow (i - 2) (by omega), hlow (i - 1) (by omega), hlow i (by omega)]
    · have hin : i = n + 1 := by omega
      subst hin
      have h1 : decide (1 ≤ n + 1) = true := by simp
      rw [tb, tb, show n + 1 - 1 = n by omega, hlow (n + 1 - 2) (by omega), h1,
        Bool.true_and, hb, hby]
      simp
  -- bit n + 2 is the negation of the or, on both sides
  have htop : ((rowStep x).testBit (n + 2) = (rowStep y).testBit (n + 2)) ↔
      ((x.testBit (n + 1) || x.testBit (n + 2)) = (y.testBit (n + 1) || y.testBit (n + 2))) := by
    have h1 : decide (1 ≤ n + 2) = true := by simp
    have h2 : decide (2 ≤ n + 2) = true := by simp
    rw [tb, tb, show n + 2 - 1 = n + 1 by omega, show n + 2 - 2 = n by omega, h1, h2,
      Bool.true_and, Bool.true_and, Bool.true_and, Bool.true_and, hb, hby]
    generalize (x.testBit (n + 1) || x.testBit (n + 2)) = a
    generalize (y.testBit (n + 1) || y.testBit (n + 2)) = b
    cases a <;> cases b <;> decide
  rw [miff]
  constructor
  · intro hall
    exact htop.1 (hall (n + 2) (by omega))
  · intro hor i hi
    rcases Nat.lt_or_ge i (n + 2) with hi' | hi'
    · exact hlow2 i hi'
    · have : i = n + 2 := by omega
      subst this
      exact htop.2 hor
