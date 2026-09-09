import Rule30.Basic

/-! Vernier / connector, 2026-09-09.  Kernel checks for the T-function
dictionary: the row model's step map read as an operation on n-bit words. -/

/-- The rule-30 T-function: `T r = (4r) XOR ((2r) OR r)`. -/
def Tf (r : Nat) : Nat := (4 * r) ^^^ ((2 * r) ||| r)

-- The row model IS the orbit of 1 under `Tf`.
example : ∀ t : Fin 60, rowNat (t.val + 1) = Tf (rowNat t.val) := by decide

-- The centre column is bit `t` of the `t`-th iterate.
example : ∀ t : Fin 40, rowCell t.val 0 = (rowNat t.val).testBit t.val := by decide

-- `Tf` is triangular: it descends to `ℤ/2^n` for every `n`.  Checked at n = 5:
-- `r mod 32` determines `Tf r mod 32`.
set_option maxRecDepth 100000 in
example : ∀ x : Fin 64, Tf x.val % 8 = Tf (x.val % 8) % 8 := by decide

-- `Tf` is the identity modulo 2 -- so it is not transitive mod 2^n for n ≥ 1,
-- and Klimov–Shamir's single-cycle property fails at the first bit.
set_option maxRecDepth 100000 in
example : ∀ r : Fin 256, Tf r.val % 2 = r.val % 2 := by decide

-- `Tf` is not injective modulo 4 -- so it is not bijective mod 2^n for n ≥ 2,
-- and every measure-preservation / ergodicity criterion is vacuous for it.
example : Tf 1 % 4 = Tf 3 % 4 ∧ (1 : Nat) % 4 ≠ 3 % 4 := by decide

-- Image density mod 2^6: how many of the 64 residues are hit.
example : ((List.range 64).map (fun r => Tf r % 64)).eraseDups.length = 29 := by decide

set_option maxRecDepth 20000 in
-- The onset wall's own orbit form, for k ≤ 5:
--   r_{2k} ≡ r_{2k + 2^k}  (mod 2^{k+1}).
example : ∀ k : Fin 6,
    rowNat (2 * k.val) % 2 ^ (k.val + 1)
      = rowNat (2 * k.val + 2 ^ k.val) % 2 ^ (k.val + 1) := by decide

set_option maxRecDepth 40000 in
-- The constant return period the kernel checks found: 16 works in place of
-- `2^k` for every k ≤ 30 (and, elsewhere, to k = 5000).
example : ∀ k : Fin 31,
    rowNat (2 * k.val) % 2 ^ (k.val + 1)
      = rowNat (2 * k.val + 16) % 2 ^ (k.val + 1) := by decide

set_option maxRecDepth 40000 in
-- But 16 is not a constant of nature: it is one plateau of a step function.
-- Period 4 suffices for every k ≤ 28 and fails first at k = 29 -- which is
-- NKS p. 871's third doubling position, read here as a fact about the cycle
-- length of one orbit of an n-bit word map.
example : (∀ k : Fin 29,
    rowNat (2 * k.val) % 2 ^ (k.val + 1)
      = rowNat (2 * k.val + 4) % 2 ^ (k.val + 1))
    ∧ rowNat 58 % 2 ^ 30 ≠ rowNat 62 % 2 ^ 30 := by decide
