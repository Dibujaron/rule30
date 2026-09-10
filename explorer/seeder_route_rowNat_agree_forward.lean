import Rule30.Basic
import Rule30.Proofs.RowNatModEqIterate
import Mathlib.Tactic

theorem rowNat_agree_forward (n T p t : ℕ) (hTt : T ≤ t)
    (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
    rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n := by
  obtain ⟨d, hd⟩ := Nat.exists_eq_add_of_le hTt
  subst hd
  simp only [rowNat_mod_eq_iterate] at h ⊢
  have e1 : T + d = d + T := by omega
  have e2 : T + d + p = d + (T + p) := by omega
  rw [e2, e1, Function.iterate_add_apply, Function.iterate_add_apply, h]

#print axioms rowNat_agree_forward
