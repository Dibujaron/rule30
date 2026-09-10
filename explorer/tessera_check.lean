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

theorem periodicFrom_gcd (f : ℕ → Bool) (p q N : ℕ)
    (hpN : PeriodicFrom f p N) (hqN : PeriodicFrom f q N) :
    PeriodicFrom f (Nat.gcd p q) N := by
  have hsub : ∀ a b : ℕ, b ≤ a → PeriodicFrom f a N → PeriodicFrom f b N →
      PeriodicFrom f (a - b) N := by
    intro a b hba ha hb n hn
    have h1 : f (n + (a - b) + b) = f (n + (a - b)) := hb _ (by omega)
    have h2 : n + (a - b) + b = n + a := by omega
    rw [h2] at h1
    rw [← h1]
    exact ha n hn
  have hmul : ∀ a : ℕ, PeriodicFrom f a N → ∀ m : ℕ, PeriodicFrom f (m * a) N := by
    intro a ha m
    induction m with
    | zero => intro n hn; simp
    | succ m ihm =>
      intro n hn
      have e : n + (m + 1) * a = n + m * a + a := by ring
      rw [e, ha _ (le_trans hn (Nat.le_add_right _ _)), ihm n hn]
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

