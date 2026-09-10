import Rule30.Basic

/-! Elaboration check for the proposed tier. Every declaration below is the
statement text exactly as it would land in `Rule30/Statements.lean`, with the
namespace stripped. Nothing here is proved; the only warnings should be the
`sorry`s. -/

theorem rowStep_agree_forward (n t x y : ℕ) (h : x % 2 ^ n = y % 2 ^ n) :
    rowStep^[t] x % 2 ^ n = rowStep^[t] y % 2 ^ n := by
  sorry

theorem rowStep_agree_succ_iff (n x y : ℕ) (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) :
    rowStep x % 2 ^ (n + 2) = rowStep y % 2 ^ (n + 2) ↔
      (x.testBit n = true ∨ x % 2 ^ (n + 2) = y % 2 ^ (n + 2)) := by
  sorry

theorem rowStep_agree_succ_two_iff (n x y : ℕ)
    (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) (hb : x.testBit n = true) :
    rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3) ↔
      (x.testBit (n + 1) || x.testBit (n + 2)) = (y.testBit (n + 1) || y.testBit (n + 2)) := by
  sorry

theorem stepMod_iterate_eq_rowStep_mod (n t x : ℕ) :
    (stepMod n)^[t] (x % 2 ^ n) = rowStep^[t] x % 2 ^ n := by
  sorry

theorem periodicFrom_gcd (f : ℕ → Bool) (p q N : ℕ) (hp : 0 < p) (hq : 0 < q)
    (hpN : PeriodicFrom f p N) (hqN : PeriodicFrom f q N) :
    PeriodicFrom f (Nat.gcd p q) N := by
  sorry

theorem leftDiagonal_period_le_iff_rowNat_period :
    (∀ k : ℕ, ∃ p, 0 < p ∧ p ≤ k + 1 ∧ ∃ N, PeriodicFrom (leftDiagonal k) p N) ↔
      (∀ n : ℕ, 0 < n → ∃ p, 0 < p ∧ p ≤ n ∧
        ∃ T, rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) := by
  sorry

/-! Witness sanity: the two Boolean laws, evaluated on real numbers. These are
the same expressions the proposals carry as witnesses. -/

#eval (List.range 6).all fun n =>
  (List.range 40).all fun a =>
    (List.range 40).all fun b =>
      let x := a % 2 ^ (n + 1) + b * 2 ^ (n + 1)
      let y := a % 2 ^ (n + 1) + (b + 7) * 2 ^ (n + 1)
      decide ((rowStep x % 2 ^ (n + 2) = rowStep y % 2 ^ (n + 2)) ↔
        (x.testBit n = true ∨ x % 2 ^ (n + 2) = y % 2 ^ (n + 2)))

#eval (List.range 6).all fun n =>
  (List.range 40).all fun a =>
    (List.range 40).all fun b =>
      let x := (a % 2 ^ (n + 1)) ||| 2 ^ n + b * 2 ^ (n + 1)
      let y := (a % 2 ^ (n + 1)) ||| 2 ^ n + (b + 7) * 2 ^ (n + 1)
      !x.testBit n ||
        decide ((rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3)) ↔
          ((x.testBit (n + 1) || x.testBit (n + 2)) = (y.testBit (n + 1) || y.testBit (n + 2))))

#eval (List.range 8).all fun n =>
  (List.range 12).all fun t =>
    (List.range 30).all fun x =>
      decide ((stepMod n)^[t] (x % 2 ^ n) = rowStep^[t] x % 2 ^ n)
