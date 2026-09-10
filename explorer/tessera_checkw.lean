import Rule30.Basic
import Mathlib.Tactic

-- rowStep_agree_succ_two_iff
#eval (List.range 6).all fun n => (List.range 130).all fun x => (List.range 130).all fun y =>
  !(decide (x % 2 ^ (n + 1) = y % 2 ^ (n + 1) ∧ x.testBit n = true)) ||
    decide ((rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3)) ↔
      ((x.testBit (n + 1) || x.testBit (n + 2)) = (y.testBit (n + 1) || y.testBit (n + 2))))

-- rowStep_agree_succ_iff
#eval (List.range 6).all fun n => (List.range 130).all fun x => (List.range 130).all fun y =>
  !(decide (x % 2 ^ (n + 1) = y % 2 ^ (n + 1))) ||
    decide ((rowStep x % 2 ^ (n + 2) = rowStep y % 2 ^ (n + 2)) ↔
      (x.testBit n = true ∨ x % 2 ^ (n + 2) = y % 2 ^ (n + 2)))

-- rowStep_agree_forward
#eval (List.range 7).all fun n => (List.range 9).all fun t =>
  (List.range 60).all fun x => (List.range 60).all fun y =>
    !(decide (x % 2 ^ n = y % 2 ^ n)) ||
      decide (rowStep^[t] x % 2 ^ n = rowStep^[t] y % 2 ^ n)

-- stepMod_iterate_eq_rowStep_mod
#eval (List.range 9).all fun n => (List.range 14).all fun t => (List.range 40).all fun x =>
  decide ((stepMod n)^[t] (x % 2 ^ n) = rowStep^[t] x % 2 ^ n)

-- periodicFrom_gcd
#eval (List.range 12).all fun a => (List.range 12).all fun b =>
  !(decide (0 < a ∧ 0 < b)) ||
    (let f : ℕ → Bool := fun n => decide (n % 6 < 3)
     !(decide ((List.range 40).all fun n => f (n + a) = f n)) ||
       !(decide ((List.range 40).all fun n => f (n + b) = f n)) ||
         decide ((List.range 40).all fun n => f (n + Nat.gcd a b) = f n))

