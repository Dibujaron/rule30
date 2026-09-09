import Rule30.Basic
import Rule30.Prize
import Rule30.Strip
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack
import Rule30.Proofs.LeftDiagonalStepOnsetDichotomy
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.LeftDiagonalShiftOfWhite
import Rule30.Proofs.RowCellEqEvolve

namespace SeedReemit

theorem leftDiagonal_period_le_of_white_count (m q N n : ℕ) (hq : 0 < q) (w : ℕ → ℕ)
    (hw0 : w 0 = 0) (hmono : ∀ i, w i ≤ w (i + 1))
    (hstep : ∀ i < n, (∀ J, ∃ j ≥ J, leftDiagonal (m + 1 + i) j = true) ∨ w i < w (i + 1))
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
    ∃ M, PeriodicFrom (leftDiagonal (m + n)) (2 ^ w n * q) M ∧
      PeriodicFrom (leftDiagonal (m + n + 1)) (2 ^ w n * q) M := by
  sorry

theorem leftDiagonal_step_of_white_parity (m q N : ℕ) (hq : 0 < q)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (hwhite : ∀ j ≥ N + 1, leftDiagonal (m + 1) j = false) :
    (Even (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
        PeriodicFrom (leftDiagonal (m + 2)) q N) ∧
      (Odd (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
        ∀ n ≥ N, leftDiagonal (m + 2) (n + q) = !leftDiagonal (m + 2) n) := by
  sorry

theorem leftDiagonal_onset_le_of_black_ladder (N : ℕ → ℕ)
    (hmono : ∀ k, N k < N (k + 1))
    (hwitness : ∀ k, leftDiagonal (k + 1) (N (k + 1)) = true ∨
        ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
    (k : ℕ) : ∃ p > 0, PeriodicFrom (leftDiagonal k) p (N k) := by
  have d0 : ∀ j, leftDiagonal 0 j = true := by
    intro j; simpa [leftDiagonal] using evolve_left_edge j
  have d1 : ∀ j, leftDiagonal 1 j = true := by
    intro j; exact evolve_left_second_diagonal j
  have weaken : ∀ (f : ℕ → Bool) (p a b : ℕ), a ≤ b → PeriodicFrom f p a → PeriodicFrom f p b := by
    intro f p a b hab h n hn; exact h n (le_trans hab hn)
  have key : ∀ k, ∃ p, 0 < p ∧ PeriodicFrom (leftDiagonal k) p (N k) ∧
      PeriodicFrom (leftDiagonal (k + 1)) p (N k) := by
    intro k
    induction k with
    | zero =>
      exact ⟨1, one_pos, fun n _ => by rw [d0, d0], fun n _ => by rw [d1, d1]⟩
    | succ k ih =>
      obtain ⟨p, hp, ha, hb⟩ := ih
      have hlt := hmono k
      rcases hwitness k with hblack | hwhite
      · obtain ⟨j, hj⟩ : ∃ j, N (k + 1) = j + 1 ∧ N k ≤ j :=
          ⟨N (k + 1) - 1, by omega, by omega⟩
        rw [hj.1] at hblack ⊢
        have hstep := leftDiagonal_periodicFrom_step_of_black k p (N k) j hj.2 ha hb hblack
        exact ⟨p, hp, weaken _ _ _ _ (by omega) hb, hstep⟩
      · rcases leftDiagonal_step_onset_dichotomy k p (N k) ha hb with h | ⟨j, hj, hjb, -⟩
        · refine ⟨2 * p, by omega, ?_, ?_⟩
          · exact weaken _ _ _ _ (le_of_lt hlt) (periodicFrom_mul _ p (N k) hb 2)
          · exact weaken _ _ _ _ (by omega) h
        · exact absurd hjb (by rw [hwhite (j + 1) (by omega)]; exact Bool.noConfusion)
  obtain ⟨p, hp, ha, -⟩ := key k
  exact ⟨p, hp, ha⟩

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
    have hshift := leftDiagonal_shift_of_white m M (fun i hi => hM i hi)
    refine ih ⟨⟨max N M + 2, ?_⟩, ⟨N, hN⟩⟩
    intro j hj
    have h1 : leftDiagonal m ((j - 2) + 2) = leftDiagonal (m + 1) ((j - 2) + 1) :=
      hshift (j - 2) (by omega)
    have h2 : leftDiagonal (m + 1) ((j - 2) + 1) = false := hN _ (by omega)
    rw [show j = (j - 2) + 2 by omega, h1, h2]

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

theorem centerColumn_eq_rowNat_testBit (t : ℕ) : centerColumn t = (rowNat t).testBit t := by
  have h := rowCell_eq_evolve t 0
  unfold rowCell at h
  rw [if_pos (by omega : -(t : ℤ) ≤ (0 : ℤ) ∧ (0 : ℤ) ≤ (t : ℤ))] at h
  simpa [centerColumn] using h.symm

end SeedReemit
