import Rule30.Basic
import Mathlib.Tactic

theorem periodicFrom_gcd (f : ℕ → Bool) (p q N : ℕ)
    (hpN : PeriodicFrom f p N) (hqN : PeriodicFrom f q N) :
    PeriodicFrom f (Nat.gcd p q) N := by
  -- the periods from `N` are closed under subtraction ...
  have hsub : ∀ a b : ℕ, b ≤ a → PeriodicFrom f a N → PeriodicFrom f b N →
      PeriodicFrom f (a - b) N := by
    intro a b hba ha hb n hn
    have h1 : f (n + (a - b) + b) = f (n + (a - b)) := hb _ (by omega)
    have h2 : n + (a - b) + b = n + a := by omega
    rw [h2] at h1
    rw [← h1]
    exact ha n hn
  -- ... and under multiples
  have hmul : ∀ a : ℕ, PeriodicFrom f a N → ∀ m : ℕ, PeriodicFrom f (m * a) N := by
    intro a ha m
    induction m with
    | zero => intro n hn; simp
    | succ m ihm =>
      intro n hn
      have e : n + (m + 1) * a = n + m * a + a := by ring
      rw [e, ha _ (le_trans hn (Nat.le_add_right _ _)), ihm n hn]
  -- Euclid's algorithm, one step at a time
  have key : ∀ a b : ℕ, PeriodicFrom f a N → PeriodicFrom f b N →
      PeriodicFrom f (Nat.gcd a b) N := by
    intro a
    induction a using Nat.strong_induction_on with
    | _ a ih =>
      intro b ha hb
      rcases Nat.eq_zero_or_pos a with rfl | hpos
      · simpa using hb
      · have hdm : a * (b / a) + b % a = b := Nat.div_add_mod b a
        have hle : a * (b / a) ≤ b := by omega
        have hbmod : PeriodicFrom f (b % a) N := by
          have hstep := hsub b (a * (b / a)) hle hb
            (by rw [Nat.mul_comm]; exact hmul a ha (b / a))
          have : b - a * (b / a) = b % a := by omega
          rwa [this] at hstep
        rw [Nat.gcd_rec]
        exact ih (b % a) (Nat.mod_lt _ hpos) a hbmod ha
  exact key p q hpN hqN
