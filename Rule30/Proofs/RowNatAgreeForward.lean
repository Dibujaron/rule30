import Rule30.Basic
import Rule30.Proofs.RowNatModEqIterate

/-!
**What this says.** Agreement between two rows' low `n` bits is never lost: if rows `T`
and `T+p` agree there, then rows `t` and `t+p` agree there for every later `t`.
**Why it is true.** `rowNat_mod_eq_iterate` reads a truncated row as `(stepMod n)^[t]`
applied to a fixed start; iterating one fixed function keeps two equal points equal.
**Where the work is.** Nowhere new: an induction on `t` above `T`, each step applying
`stepMod n` to both sides of the previous step's equality.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowNat_agree_forward (n T p t : ℕ) (hTt : T ≤ t) (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
  rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n
```
-/

theorem rowNat_agree_forward (n T p t : ℕ) (hTt : T ≤ t)
    (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
    rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n := by
  rw [rowNat_mod_eq_iterate, rowNat_mod_eq_iterate] at h ⊢
  induction t, hTt using Nat.le_induction with
  | base => exact h
  | succ t _ ih =>
    rw [show t + 1 + p = (t + p) + 1 by omega, Function.iterate_succ_apply',
      Function.iterate_succ_apply', ih]
