/-
Ephemeris / connect, 2026-09-12.  Scratch check for the section 5 handoff of
docs/connections/2026-09-12-the-theory-of-automatic-sequences-...

The only method in Allouche-Shallit-Yassawi's non-automaticity survey whose
input is the sequence itself is their Theorem 1 (infinite q-kernel).  At
r_k = 0 its hypothesis is that the decimations  n |-> c(2^k n)  are pairwise
distinct.  This file checks the claim made in the document that the resulting
sufficient condition for Prize 1 needs NO automatic-sequence theory: it is
pigeonhole on the powers of 2 modulo p.

Not a proposal and not a node; a scratch file, run with `lake env lean`.
-/
import Rule30.Basic
import Rule30.Prize

/-- If no two distinct power-of-two decimations of the centre column agree
identically, the centre column is not eventually periodic. -/
theorem centerColumn_not_isEventuallyPeriodic_of_dilations
    (h : ∀ i j : ℕ, i < j → ∃ n : ℕ,
      centerColumn (2 ^ i * n) ≠ centerColumn (2 ^ j * n)) :
    ¬ IsEventuallyPeriodic centerColumn := by
  rintro ⟨p, hp, N, hper⟩
  -- the column is constant on residues mod p, past the onset
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
  -- pigeonhole: two powers of two, both past the onset, agree mod p
  obtain ⟨k₁, k₂, hne, heq⟩ :=
    Finite.exists_ne_map_eq_of_infinite
      (fun k : ℕ => (⟨2 ^ (N + k) % p, Nat.mod_lt _ hp⟩ : Fin p))
  have hmodk : 2 ^ (N + k₁) % p = 2 ^ (N + k₂) % p := congrArg Fin.val heq
  obtain ⟨i, j, hij, hNi, hijmod⟩ :
      ∃ i j : ℕ, i < j ∧ N ≤ i ∧ 2 ^ i % p = 2 ^ j % p := by
    rcases Nat.lt_or_ge k₁ k₂ with hlt | hge
    · exact ⟨N + k₁, N + k₂, by omega, by omega, hmodk⟩
    · have : k₂ < k₁ := by omega
      exact ⟨N + k₂, N + k₁, by omega, by omega, hmodk.symm⟩
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

#print axioms centerColumn_not_isEventuallyPeriodic_of_dilations
