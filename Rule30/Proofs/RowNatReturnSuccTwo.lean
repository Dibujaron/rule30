import Rule30.Basic
import Rule30.Proofs.RowNatReturnSuccIff
import Mathlib.Tactic

/-!
**What this says.** Say rows `T` and `T + p`, as binary numbers, agree on their low
`n + 1` bits, with bits `n` and `n + 1` of row `T` black and bit `n + 1` of row `T + p`
black too. Then the very next rows agree two bits further out, on their low `n + 3` bits.
**Why it is true.** Two black bits in a row force the bit two places up in the next row to
be white regardless of anything else, and that happens on both rows, so the extra bit of
agreement is not a coincidence of the data but a forced zero on each side.
**Where the work is.** Showing that forced-zero fact: unfold one step of the row map at
that one bit and let the two black hypotheses collapse the expression on each side.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowNat_return_succ_two (n T p : ℕ) (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1))
  (hb : (rowNat T).testBit n = true) (hc : (rowNat T).testBit (n + 1) = true)
  (hd : (rowNat (T + p)).testBit (n + 1) = true) : rowNat (T + 1) % 2 ^ (n + 3) = rowNat (T + p + 1) % 2 ^ (n + 3)
```
-/

private theorem rowNat_succ_eq (t : ℕ) : rowNat (t + 1) = rowStep (rowNat t) := rfl

private theorem testBit_rowStep (r i : ℕ) :
    (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
  have h4 : 4 * r = 2 ^ 2 * r := by norm_num
  have h2 : 2 * r = 2 ^ 1 * r := by norm_num
  unfold rowStep
  rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
    Nat.testBit_two_pow_mul]

private theorem testBit_of_mod_eq (a b m i : ℕ) (hi : i < m) (h : a % 2 ^ m = b % 2 ^ m) :
    a.testBit i = b.testBit i := by
  have e := congrArg (fun x => x.testBit i) h
  simpa [Nat.testBit_mod_two_pow, hi] using e

theorem rowNat_return_succ_two (n T p : ℕ)
    (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1))
    (hb : (rowNat T).testBit n = true)
    (hc : (rowNat T).testBit (n + 1) = true)
    (hd : (rowNat (T + p)).testBit (n + 1) = true) :
    rowNat (T + 1) % 2 ^ (n + 3) = rowNat (T + p + 1) % 2 ^ (n + 3) := by
  have hstep : rowNat (T + 1) % 2 ^ (n + 2) = rowNat (T + p + 1) % 2 ^ (n + 2) :=
    (rowNat_return_succ_iff n T p h).mpr (Or.inl hb)
  have hbn : (rowNat (T + p)).testBit n = true := by
    have e := testBit_of_mod_eq (rowNat T) (rowNat (T + p)) (n + 1) n (by omega) h
    rw [← e]; exact hb
  have hL : (rowNat (T + 1)).testBit (n + 2) = false := by
    rw [rowNat_succ_eq, testBit_rowStep, show n + 2 - 1 = n + 1 by omega,
      show n + 2 - 2 = n by omega, hb, hc]
    simp
  have hR : (rowNat (T + p + 1)).testBit (n + 2) = false := by
    rw [rowNat_succ_eq, testBit_rowStep, show n + 2 - 1 = n + 1 by omega,
      show n + 2 - 2 = n by omega, hbn, hd]
    simp
  have hbit2 : (rowNat (T + 1)).testBit (n + 2) = (rowNat (T + p + 1)).testBit (n + 2) :=
    hL.trans hR.symm
  apply Nat.eq_of_testBit_eq
  intro i
  rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
  by_cases hi : i < n + 3
  · by_cases hi' : i < n + 2
    · have e := testBit_of_mod_eq (rowNat (T + 1)) (rowNat (T + p + 1)) (n + 2) i hi' hstep
      simp [hi, e]
    · have hieq : i = n + 2 := by omega
      subst hieq
      simp [hi, hbit2]
  · simp [hi]
