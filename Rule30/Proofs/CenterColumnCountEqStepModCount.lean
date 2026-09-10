import Rule30.Basic
import Rule30.Proofs.CenterColumnEqRowNatTestBit
import Rule30.Proofs.RowNatModEqIterate

/-!
**What this says.** Counting the black cells below N in the centre column, and counting
them by running the truncated row map instead, give the same number.
**Why it is true.** Bit n of a row is unaffected by truncating that row to its low n+1
bits, so `centerColumn n` and the truncated-orbit bit agree for every n, and equal
predicates filter to equal sets.
**Where the work is.** None beyond composing the two served dictionary lemmas: the rest is
`Nat.testBit_mod_two_pow` picking off the one bit that survives truncation.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumnCount_eq_stepMod_count (N : ℕ) :
  {n ∈ Finset.range N | centerColumn n = true}.card =
    {n ∈ Finset.range N | ((stepMod (n + 1))^[n] (1 % 2 ^ (n + 1))).testBit n = true}.card
```
-/

theorem centerColumnCount_eq_stepMod_count (N : ℕ) :
    ((Finset.range N).filter fun n => centerColumn n = true).card =
      ((Finset.range N).filter fun n =>
        ((stepMod (n + 1))^[n] (1 % 2 ^ (n + 1))).testBit n = true).card := by
  congr 1
  apply Finset.filter_congr
  intro n _
  have h1 : centerColumn n = (rowNat n).testBit n := centerColumn_eq_rowNat_testBit n
  have h2 : (rowNat n).testBit n = ((stepMod (n + 1))^[n] (1 % 2 ^ (n + 1))).testBit n := by
    rw [← rowNat_mod_eq_iterate (n + 1) n, Nat.testBit_mod_two_pow]
    simp
  rw [h1, h2]
