import Rule30.Basic
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.LeftDiagonalPeriodicFromPow
import Rule30.Proofs.LeftDiagonalPeriodicFromOfRowNatAgreeAny
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.PeriodicFromGcd
import Rule30.Proofs.PeriodicFromTransPeriod
import Mathlib.Tactic
import Mathlib.Data.Nat.Log
import Mathlib.Data.Nat.Prime.Basic

/-!
**What this says.** Every left diagonal repeating with a period no bigger than its
own depth is the same claim as: reading each row of the pattern as a binary number,
the low `n` bits come back to a value they already had within `n` rows.
**Why it is true.** Diagonal `k` is bit `k` of the rows (`leftDiagonal_eq_rowNat_testBit`),
so one congruence of rows covers all the diagonals at once; going the other way, the
periods of the first `n` diagonals are all powers of two no bigger than `n`
(`leftDiagonal_periodicFrom_pow` cuts each one down by a gcd), so the largest of them
is a period for every one of them.
**Where the work is.** Turning "each diagonal has some small period" into ONE period
small enough: separate periods would combine to their least common multiple, which is
far bigger than `n`. Only the fact that each is a power of two keeps the combination
equal to the largest.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_period_le_iff_rowNat_period :
  (∀ (k : ℕ), ∃ p, 0 < p ∧ p ≤ k + 1 ∧ ∃ N, PeriodicFrom (leftDiagonal k) p N) ↔
    ∀ (n : ℕ), 0 < n → ∃ p, 0 < p ∧ p ≤ n ∧ ∃ T, rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n
```
-/

theorem leftDiagonal_period_le_iff_rowNat_period :
    (∀ k : ℕ, ∃ p, 0 < p ∧ p ≤ k + 1 ∧ ∃ N, PeriodicFrom (leftDiagonal k) p N) ↔
      (∀ n : ℕ, 0 < n → ∃ p, 0 < p ∧ p ≤ n ∧
        ∃ T, rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) := by
  constructor
  · intro h n hn
    obtain ⟨L, hPn, hlt⟩ : ∃ L, 2 ^ L ≤ n ∧ n < 2 ^ (L + 1) :=
      ⟨Nat.log 2 n, Nat.pow_log_le_self 2 (by omega), Nat.lt_pow_succ_log_self (by norm_num) n⟩
    have hPpos : 0 < 2 ^ L := by positivity
    have key : ∀ i : ℕ, ∃ M, i < n → PeriodicFrom (leftDiagonal i) (2 ^ L) M := by
      intro i
      by_cases hi : i < n
      · obtain ⟨p, hp0, hple, N, hN⟩ := h i
        obtain ⟨M0, _, hM0⟩ := leftDiagonal_periodicFrom_pow i
        have h2 : PeriodicFrom (leftDiagonal i) (2 ^ i) N :=
          periodicFrom_trans_period (leftDiagonal i) p (2 ^ i) N M0 hp0 hN hM0
        have hg : PeriodicFrom (leftDiagonal i) (Nat.gcd p (2 ^ i)) N :=
          periodicFrom_gcd (leftDiagonal i) p (2 ^ i) N hN h2
        obtain ⟨a, _, hga⟩ := (Nat.dvd_prime_pow Nat.prime_two).mp (Nat.gcd_dvd_right p (2 ^ i))
        rw [hga] at hg
        have hdvd : Nat.gcd p (2 ^ i) ≤ p := Nat.le_of_dvd hp0 (Nat.gcd_dvd_left _ _)
        have hle : (2 : ℕ) ^ a ≤ n := by omega
        have haL : a ≤ L := by
          by_contra hc
          have hstep : (2 : ℕ) ^ (L + 1) ≤ 2 ^ a := Nat.pow_le_pow_right (by norm_num) (by omega)
          omega
        refine ⟨N, fun _ => ?_⟩
        have hsplit : (2 : ℕ) ^ L = 2 ^ (L - a) * 2 ^ a := by
          rw [← pow_add]
          congr 1
          omega
        rw [hsplit]
        exact periodicFrom_mul (leftDiagonal i) (2 ^ a) N hg (2 ^ (L - a))
      · exact ⟨0, fun hc => absurd hc hi⟩
    choose M hM using key
    refine ⟨2 ^ L, hPpos, hPn, (Finset.range n).sup M + n, ?_⟩
    apply Nat.eq_of_testBit_eq
    intro i
    rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
    by_cases hi : i < n
    · have hMi : M i ≤ (Finset.range n).sup M := Finset.le_sup (Finset.mem_range.mpr hi)
      set T := (Finset.range n).sup M + n with hT
      have e1 : (rowNat T).testBit i = leftDiagonal i (T - i) := by
        rw [leftDiagonal_eq_rowNat_testBit, Nat.sub_add_cancel (by omega : i ≤ T)]
      have e2 : (rowNat (T + 2 ^ L)).testBit i = leftDiagonal i (T - i + 2 ^ L) := by
        rw [leftDiagonal_eq_rowNat_testBit, show T - i + 2 ^ L + i = T + 2 ^ L from by omega]
      have e3 : leftDiagonal i (T - i + 2 ^ L) = leftDiagonal i (T - i) :=
        hM i hi (T - i) (by omega)
      rw [e1, e2, e3]
    · simp [hi]
  · intro h k
    obtain ⟨p, hp0, hple, T, hT⟩ := h (k + 1) (by omega)
    exact ⟨p, hp0, hple, T, leftDiagonal_periodicFrom_of_rowNat_agree_any k p T hT⟩
