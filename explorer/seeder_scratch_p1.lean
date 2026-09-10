import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent
import Rule30.Proofs.CenterColumnSuccOfBlack
import Rule30.Proofs.ColumnOneOfWhite
import Rule30.Proofs.ConfigEqOfRightAndColumn
import Rule30.Proofs.EvolveFromEvolve

/-! Seeder scratch, 2026-09-10. Candidate statements for the next tier. -/

-- (3) the forward white-time law at column 1
theorem column_one_succ_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
    column X 1 (t + 1) = (column X 1 t || column X 2 t) := by
  unfold column at h ⊢
  rw [evolveFrom_succ, rule30_eq]
  norm_num
  rw [h]
  simp

-- (1) the centre column is not eventually black
theorem centerColumn_not_eventually_black :
    ¬ ∃ N : ℕ, ∀ t ≥ N, centerColumn t = true := by
  rintro ⟨N, hN⟩
  refine not_isEventuallyPeriodic_adjacent (-1) ⟨⟨1, one_pos, N, ?_⟩, ⟨1, one_pos, N, ?_⟩⟩
  · intro n hn
    have h1 : evolve n (-1) = false := by
      have := centerColumn_succ_of_black n (hN n hn)
      rw [hN (n + 1) (by omega)] at this
      cases hx : evolve n (-1) with
      | false => rfl
      | true => rw [hx] at this; simp at this
    have h2 : evolve (n + 1) (-1) = false := by
      have := centerColumn_succ_of_black (n + 1) (hN (n + 1) (by omega))
      rw [hN (n + 1 + 1) (by omega)] at this
      cases hx : evolve (n + 1) (-1) with
      | false => rfl
      | true => rw [hx] at this; simp at this
    simp [h1, h2]
  · intro n hn
    have : ((-1 : ℤ) + 1) = 0 := by ring
    rw [this]
    exact (hN (n + 1) (by omega)).trans (hN n hn).symm
