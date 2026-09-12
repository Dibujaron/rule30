/-
Ephemeris / connect, 2026-09-12.  The demonstration that the check in
`ephemeris_scratch_dilations.lean` can fail.

This file is the same proof with ONE thing removed: the pigeonhole is run over
the powers `2 ^ k` from `k = 0` instead of from `k = N`, so the two exponents it
finds are no longer guaranteed to be past the onset of the period.  Everything
else is byte-identical.  Lean rejects it at exactly that line -- `N ≤ 2 ^ i` is
no longer available -- which is the point: the onset condition is load-bearing
and the proof is not passing by accident.

THIS FILE IS EXPECTED TO FAIL under `lake env lean`.
-/
import Rule30.Basic
import Rule30.Prize

theorem mutant_dilations
    (h : ∀ i j : ℕ, i < j → ∃ n : ℕ,
      centerColumn (2 ^ i * n) ≠ centerColumn (2 ^ j * n)) :
    ¬ IsEventuallyPeriodic centerColumn := by
  rintro ⟨p, hp, N, hper⟩
  have step : ∀ (k a : ℕ), N ≤ a → centerColumn (a + k * p) = centerColumn a := by
    intro k
    induction k with
    | zero => intro a _; simp
    | succ k ih =>
      intro a ha
      have hrw : a + (k + 1) * p = (a + k * p) + p := by ring
      rw [hrw, hper _ (le_trans ha (Nat.le_add_right a (k * p))), ih a ha]
  have residue : ∀ a b : ℕ, N ≤ a → a ≤ b → a % p = b % p →
      centerColumn a = centerColumn b := by
    intro a b ha hab hmod
    obtain ⟨k, hk⟩ := (Nat.modEq_iff_dvd' hab).mp hmod
    rw [Nat.mul_comm] at hk
    have hb : b = a + k * p := by omega
    rw [hb, step k a ha]
  -- THE MUTATION: pigeonhole from k = 0, not from k = N
  obtain ⟨k₁, k₂, hne, heq⟩ :=
    Finite.exists_ne_map_eq_of_infinite
      (fun k : ℕ => (⟨2 ^ k % p, Nat.mod_lt _ hp⟩ : Fin p))
  have hmodk : 2 ^ k₁ % p = 2 ^ k₂ % p := congrArg Fin.val heq
  obtain ⟨i, j, hij, hNi, hijmod⟩ :
      ∃ i j : ℕ, i < j ∧ N ≤ i ∧ 2 ^ i % p = 2 ^ j % p := by
    rcases Nat.lt_or_ge k₁ k₂ with hlt | hge
    · exact ⟨k₁, k₂, by omega, by omega, hmodk⟩
    · have : k₂ < k₁ := by omega
      exact ⟨k₂, k₁, by omega, by omega, hmodk.symm⟩
  obtain ⟨n, hn⟩ := h i j hij
  apply hn
  rcases n with _ | m
  · simp
  · have hpow : (2 : ℕ) ^ i ≤ 2 ^ j :=
      Nat.pow_le_pow_right (by norm_num) (le_of_lt hij)
    have hNpow : N ≤ 2 ^ i :=
      le_trans (le_of_lt (Nat.lt_two_pow_self)) (Nat.pow_le_pow_right (by norm_num) hNi)
    refine residue _ _ ?_ ?_ ?_
    · exact le_trans hNpow (Nat.le_mul_of_pos_right _ (Nat.succ_pos m))
    · exact Nat.mul_le_mul_right _ hpow
    · exact Nat.ModEq.mul_right _ hijmod
