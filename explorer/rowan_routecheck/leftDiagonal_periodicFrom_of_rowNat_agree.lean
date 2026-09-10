import Rule30.Basic
import Rule30.Proofs.RowNatModEqIterate
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit

theorem leftDiagonal_periodicFrom_of_rowNat_agree (k p T : ℕ) (hT : T ≤ 2 * k)
    (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) :
    PeriodicFrom (leftDiagonal k) p k := by
  have fwd : ∀ t, T ≤ t → rowNat t % 2 ^ (k + 1) = rowNat (t + p) % 2 ^ (k + 1) := by
    intro t hTt
    obtain ⟨d, hd⟩ := Nat.exists_eq_add_of_le hTt
    subst hd
    simp only [rowNat_mod_eq_iterate] at h ⊢
    have e1 : T + d = d + T := by omega
    have e2 : T + d + p = d + (T + p) := by omega
    rw [e2, e1, Function.iterate_add_apply, Function.iterate_add_apply, h]
  intro n hn
  rw [leftDiagonal_eq_rowNat_testBit, leftDiagonal_eq_rowNat_testBit]
  have hag := fwd (n + k) (by omega)
  have key : ∀ m : ℕ, (rowNat m).testBit k = (rowNat m % 2 ^ (k + 1)).testBit k := by
    intro m; rw [Nat.testBit_mod_two_pow]; simp
  rw [show n + p + k = n + k + p from by omega, key (n + k + p), key (n + k), hag]

#print axioms leftDiagonal_periodicFrom_of_rowNat_agree
