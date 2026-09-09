import Rule30.Basic
import Rule30.Proofs.RowCellEqEvolve
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.LeftDiagonalShiftOfWhite
import Rule30.Proofs.EvolveLeftEdge

namespace SeedRoutes

theorem centerColumn_eq_rowNat_testBit (t : ℕ) : centerColumn t = (rowNat t).testBit t := by
  have h := rowCell_eq_evolve t 0
  unfold rowCell at h
  rw [if_pos (by omega : -(t : ℤ) ≤ (0 : ℤ) ∧ (0 : ℤ) ≤ (t : ℤ))] at h
  simpa [centerColumn] using h.symm

theorem periodicFrom_trans_period (f : ℕ → Bool) (p q N M : ℕ) (hp : 0 < p)
    (hN : PeriodicFrom f p N) (hM : PeriodicFrom f q M) : PeriodicFrom f q N := by
  intro n hn
  have hMp : M ≤ M * p := Nat.le_mul_of_pos_right M hp
  have h1 := periodicFrom_mul f p N hN M (n + q) (by omega)
  have h2 := periodicFrom_mul f p N hN M n hn
  have h3 := hM (n + M * p) (by omega)
  rw [← h1, ← h2, ← h3]
  congr 1
  omega

theorem leftDiagonal_not_both_eventually_white (k : ℕ) :
    ¬ ((∃ N, ∀ j ≥ N, leftDiagonal k j = false) ∧
        ∃ M, ∀ j ≥ M, leftDiagonal (k + 1) j = false) := by
  induction k with
  | zero =>
    rintro ⟨⟨N, hN⟩, -⟩
    have := hN N le_rfl
    have hb : leftDiagonal 0 N = true := evolve_left_edge N
    rw [hb] at this
    exact Bool.noConfusion this
  | succ m ih =>
    rintro ⟨⟨N, hN⟩, ⟨M, hM⟩⟩
    -- diagonal m+2 is white from M on, so diagonal m tracks diagonal m+1, which is white
    have hshift := leftDiagonal_shift_of_white m M (fun i hi => hM i hi)
    refine ih ⟨⟨max N M + 2, ?_⟩, ⟨N, hN⟩⟩
    intro j hj
    have h1 : leftDiagonal m ((j - 2) + 2) = leftDiagonal (m + 1) ((j - 2) + 1) :=
      hshift (j - 2) (by omega)
    have h2 : leftDiagonal (m + 1) ((j - 2) + 1) = false := hN _ (by omega)
    rw [show j = (j - 2) + 2 by omega, h1, h2]

end SeedRoutes
