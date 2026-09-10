import Rule30.Basic
import Rule30.Proofs.RowNatReturnSuccIff
import Mathlib.Tactic

theorem rowNat_return_succ_two (n T p : ℕ)
    (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1))
    (hb : (rowNat T).testBit n = true)
    (hc : (rowNat T).testBit (n + 1) = true)
    (hd : (rowNat (T + p)).testBit (n + 1) = true) :
    rowNat (T + 1) % 2 ^ (n + 3) = rowNat (T + p + 1) % 2 ^ (n + 3) := by
  have hstep : ∀ t : ℕ, rowNat (t + 1) = rowStep (rowNat t) := fun _ => rfl
  have hbits : ∀ r i : ℕ, (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
    intro r i
    have h4 : 4 * r = 2 ^ 2 * r := by norm_num
    have h2 : 2 * r = 2 ^ 1 * r := by norm_num
    unfold rowStep
    rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
      Nat.testBit_two_pow_mul]
  have hiff : ∀ a b m : ℕ, a % 2 ^ m = b % 2 ^ m ↔ ∀ i < m, a.testBit i = b.testBit i := by
    intro a b m
    constructor
    · intro hab i hi
      have := congrArg (fun x => x.testBit i) hab
      simpa [Nat.testBit_mod_two_pow, hi] using this
    · intro hab
      apply Nat.eq_of_testBit_eq
      intro i
      rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
      by_cases hi : i < m
      · simp [hi, hab i hi]
      · simp [hi]
  have h2 : rowNat (T + 1) % 2 ^ (n + 2) = rowNat (T + p + 1) % 2 ^ (n + 2) :=
    (rowNat_return_succ_iff n T p h).2 (Or.inl hb)
  have hlow := (hiff _ _ _).1 h
  have hlow2 := (hiff _ _ _).1 h2
  rw [hiff]
  intro i hi
  by_cases hi' : i < n + 2
  · exact hlow2 i hi'
  · have hi2 : i = n + 2 := by omega
    subst hi2
    rw [hstep, hstep, hbits, hbits,
      show n + 2 - 2 = n from by omega, show n + 2 - 1 = n + 1 from by omega,
      hlow n (by omega), hc, hd]
    simp

-- witness for the same statement, over the real rows, read through `rowNat`
#eval (List.range 200).all (fun T => (List.range 40).all (fun n =>
  !((decide (rowNat T % 2 ^ (n + 1) = rowNat (T + 16) % 2 ^ (n + 1)))
      && (rowNat T).testBit n && (rowNat T).testBit (n + 1)
      && (rowNat (T + 16)).testBit (n + 1))
  || decide (rowNat (T + 1) % 2 ^ (n + 3) = rowNat (T + 16 + 1) % 2 ^ (n + 3))))
