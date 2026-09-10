import Rule30.Basic
import Mathlib.Tactic

theorem rowStep_agree_succ_two_iff (n x y : ℕ)
    (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) (hb : x.testBit n = true) :
    rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3) ↔
      (x.testBit (n + 1) || x.testBit (n + 2)) = (y.testBit (n + 1) || y.testBit (n + 2)) := by
  sorry

theorem rowStep_agree_succ_iff (n x y : ℕ) (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) :
    rowStep x % 2 ^ (n + 2) = rowStep y % 2 ^ (n + 2) ↔
      (x.testBit n = true ∨ x % 2 ^ (n + 2) = y % 2 ^ (n + 2)) := by
  sorry

theorem rowStep_agree_forward (n t x y : ℕ) (h : x % 2 ^ n = y % 2 ^ n) :
    rowStep^[t] x % 2 ^ n = rowStep^[t] y % 2 ^ n := by
  sorry

theorem stepMod_iterate_eq_rowStep_mod (n t x : ℕ) :
    (stepMod n)^[t] (x % 2 ^ n) = rowStep^[t] x % 2 ^ n := by
  sorry

theorem periodicFrom_gcd (f : ℕ → Bool) (p q N : ℕ)
    (hpN : PeriodicFrom f p N) (hqN : PeriodicFrom f q N) :
    PeriodicFrom f (Nat.gcd p q) N := by
  sorry

theorem leftDiagonal_period_le_iff_rowNat_period :
    (∀ k : ℕ, ∃ p, 0 < p ∧ p ≤ k + 1 ∧ ∃ N, PeriodicFrom (leftDiagonal k) p N) ↔
      (∀ n : ℕ, 0 < n → ∃ p, 0 < p ∧ p ≤ n ∧
        ∃ T, rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) := by
  sorry
