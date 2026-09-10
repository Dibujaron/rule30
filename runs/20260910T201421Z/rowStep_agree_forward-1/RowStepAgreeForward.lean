import Rule30.Basic

/-!
**What this says.** Two natural numbers agreeing on their low n bits stay in agreement on those bits after any number of rowStep iterations.
**Why it is true.** The rowStep operation on each bit depends only on the bits near it; low bits cannot influence bits far above, so truncating doesn't lose congruence information.
**Where the work is.** None—induction on t, the base case is trivial, and the inductive step follows because iterating a function preserves equality.
-/

theorem rowStep_agree_forward (n t x y : ℕ) (h : x % 2 ^ n = y % 2 ^ n) :
    rowStep^[t] x % 2 ^ n = rowStep^[t] y % 2 ^ n := by
  -- The key lemma: rowStep preserves modular congruence
  -- If a ≡ b (mod 2^n) then rowStep(a) ≡ rowStep(b) (mod 2^n)
  have rowStep_cong : ∀ a b : ℕ, a % 2 ^ n = b % 2 ^ n →
                      (rowStep a) % 2 ^ n = (rowStep b) % 2 ^ n := by
    intro a b hab
    -- rowStep r = (4*r) XOR ((2*r) OR r)
    -- If a and b agree mod 2^n, their bitwise operations will too
    -- since only bits 0..n-1 affect bits 0..n-1 in these operations
    apply Nat.eq_of_testBit_eq
    intro i
    rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
    by_cases hi : i < n
    · -- For bits in the range, rowStep operates on the low bits
      -- rowStep r = (4*r) XOR ((2*r) OR r)
      -- testBit (rowStep r) i depends on bits i-2, i-1, i of r
      -- Since a % 2^n = b % 2^n, bits 0..(n-1) agree
      -- So bits i-2, i-1, i all agree (when i < n)
      unfold rowStep
      simp only [Nat.testBit_xor, Nat.testBit_or, Nat.testBit_mul_pow_left, Nat.testBit_mul_pow_left]
      -- After unfolding, the bits depend only on positions < n
      -- Use the congruence hypothesis
      have hab_bits : ∀ j < n, a.testBit j = b.testBit j := by
        intro j hj
        have : a % 2 ^ n = b % 2 ^ n := hab
        rw [← Nat.testBit_mod_two_pow a hj, ← Nat.testBit_mod_two_pow b hj, this]
      by_cases h2 : i ≥ 2
      · by_cases h1 : i ≥ 1
        · simp [hab_bits (i-2) (by omega), hab_bits (i-1) (by omega), hab_bits i hi]
        · omega
      · by_cases h1 : i ≥ 1
        · simp [hab_bits (i-1) (by omega), hab_bits i hi]
        · simp [hab_bits i hi]
    · -- For bits outside the range, mod clears them
      simp [hi]
  induction t generalizing x y with
  | zero => exact h
  | succ t ih =>
    rw [Function.iterate_succ_apply, Function.iterate_succ_apply]
    -- Now goal is: rowStep^[t] (rowStep x) % 2^n = rowStep^[t] (rowStep y) % 2^n
    -- First, show rowStep x % 2^n = rowStep y % 2^n using rowStep_cong
    have h' : rowStep x % 2 ^ n = rowStep y % 2 ^ n := rowStep_cong x y h
    -- Then apply ih to rowStep x and rowStep y
    exact ih (rowStep x) (rowStep y) h'
