import Rule30.Basic

/-! The witness expressions for the proposed tier, each printed twice: once as
proposed (must be `true`), and once with one symbol deliberately wrong (must be
`false`). A witness that has never been seen to fail is not a witness. -/

-- (1) rowStep_agree_forward -----------------------------------------------
#eval (List.range 7).all fun n => (List.range 9).all fun t =>
  (List.range 60).all fun x => (List.range 60).all fun y =>
    !(decide (x % 2 ^ n = y % 2 ^ n)) ||
      decide (rowStep^[t] x % 2 ^ n = rowStep^[t] y % 2 ^ n)

-- broken: claim agreement one bit WIDER than the hypothesis gives
#eval (List.range 7).all fun n => (List.range 9).all fun t =>
  (List.range 60).all fun x => (List.range 60).all fun y =>
    !(decide (x % 2 ^ n = y % 2 ^ n)) ||
      decide (rowStep^[t] x % 2 ^ (n + 1) = rowStep^[t] y % 2 ^ (n + 1))

-- (2) rowStep_agree_succ_iff ----------------------------------------------
#eval (List.range 6).all fun n => (List.range 130).all fun x => (List.range 130).all fun y =>
  !(decide (x % 2 ^ (n + 1) = y % 2 ^ (n + 1))) ||
    decide ((rowStep x % 2 ^ (n + 2) = rowStep y % 2 ^ (n + 2)) ↔
      (x.testBit n = true ∨ x % 2 ^ (n + 2) = y % 2 ^ (n + 2)))

-- broken: read the control bit one place too high
#eval (List.range 6).all fun n => (List.range 130).all fun x => (List.range 130).all fun y =>
  !(decide (x % 2 ^ (n + 1) = y % 2 ^ (n + 1))) ||
    decide ((rowStep x % 2 ^ (n + 2) = rowStep y % 2 ^ (n + 2)) ↔
      (x.testBit (n + 1) = true ∨ x % 2 ^ (n + 2) = y % 2 ^ (n + 2)))

-- (3) rowStep_agree_succ_two_iff ------------------------------------------
#eval (List.range 6).all fun n => (List.range 130).all fun x => (List.range 130).all fun y =>
  !(decide (x % 2 ^ (n + 1) = y % 2 ^ (n + 1) ∧ x.testBit n = true)) ||
    decide ((rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3)) ↔
      ((x.testBit (n + 1) || x.testBit (n + 2)) = (y.testBit (n + 1) || y.testBit (n + 2))))

-- broken: xor in place of the or -- this is the OR-to-XOR filter, run on my own claim
#eval (List.range 6).all fun n => (List.range 130).all fun x => (List.range 130).all fun y =>
  !(decide (x % 2 ^ (n + 1) = y % 2 ^ (n + 1) ∧ x.testBit n = true)) ||
    decide ((rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3)) ↔
      ((x.testBit (n + 1) ^^ x.testBit (n + 2)) = (y.testBit (n + 1) ^^ y.testBit (n + 2))))

-- how many pairs actually satisfy the hypotheses of (3): not vacuous
#eval ((List.range 6).map fun n =>
  ((List.range 130).map fun x => ((List.range 130).filter fun y =>
    decide (x % 2 ^ (n + 1) = y % 2 ^ (n + 1) ∧ x.testBit n = true)).length).sum).sum

-- (4) stepMod_iterate_eq_rowStep_mod --------------------------------------
#eval (List.range 9).all fun n => (List.range 14).all fun t => (List.range 40).all fun x =>
  decide ((stepMod n)^[t] (x % 2 ^ n) = rowStep^[t] x % 2 ^ n)

-- broken: drop the truncation of the start
#eval (List.range 9).all fun n => (List.range 14).all fun t => (List.range 40).all fun x =>
  decide ((stepMod n)^[t] x = rowStep^[t] x % 2 ^ n)

-- (5) periodicFrom_gcd, on a concrete family: f n = (n % a < b) --------------
#eval (List.range 12).all fun a => (List.range 12).all fun b =>
  !(decide (0 < a ∧ 0 < b)) ||
    (let f : ℕ → Bool := fun n => decide (n % 6 < 3)
     !(decide ((List.range 40).all fun n => f (n + a) = f n)) ||
       !(decide ((List.range 40).all fun n => f (n + b) = f n)) ||
         decide ((List.range 40).all fun n => f (n + Nat.gcd a b) = f n))

-- broken: lcm in place of gcd (true only by accident here; check it fails)
#eval (List.range 12).all fun a => (List.range 12).all fun b =>
  !(decide (0 < a ∧ 0 < b)) ||
    (let f : ℕ → Bool := fun n => decide (n % 6 < 3)
     !(decide ((List.range 40).all fun n => f (n + a) = f n)) ||
       decide ((List.range 40).all fun n => f (n + a + 1) = f n))
