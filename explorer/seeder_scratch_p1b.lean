import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent
import Rule30.Proofs.CenterColumnSuccOfBlack
import Rule30.Proofs.ColumnOneOfWhite
import Rule30.Proofs.ConfigEqOfRightAndColumn
import Rule30.Proofs.EvolveFromEvolve

/-! Seeder scratch part 2, 2026-09-10. -/

theorem column_one_succ_of_white' (X : Config) (t : ℕ) (h : column X 0 t = false) :
    column X 1 (t + 1) = (column X 1 t || column X 2 t) := by
  unfold column at h ⊢
  rw [evolveFrom_succ, rule30_eq]
  norm_num
  rw [h]
  simp

-- (2) the centre column is not eventually white
theorem centerColumn_not_eventually_white :
    ¬ ∃ N : ℕ, ∀ t ≥ N, centerColumn t = false := by
  rintro ⟨N, hN⟩
  have mono : ∀ t, N ≤ t → evolve t 1 = true → evolve (t + 1) 1 = true := by
    intro t ht hb
    have hw : column initialConfig 0 t = false := hN t ht
    have e : evolve (t + 1) 1 = (evolve t 1 || evolve t 2) :=
      column_one_succ_of_white' initialConfig t hw
    rw [e, hb]; rfl
  have key : ∃ M, N ≤ M ∧ ∀ n ≥ M, evolve (n + 1) 1 = evolve n 1 := by
    by_cases hex : ∃ t, N ≤ t ∧ evolve t 1 = true
    · obtain ⟨t0, ht0, hb⟩ := hex
      refine ⟨t0, ht0, ?_⟩
      have all : ∀ s, evolve (t0 + s) 1 = true := by
        intro s
        induction s with
        | zero => simpa using hb
        | succ k ih =>
            have := mono (t0 + k) (by omega) ih
            rw [show t0 + (k + 1) = t0 + k + 1 by ring]
            exact this
      intro n hn
      have e1 : evolve (n + 1) 1 = true := by
        rw [show n + 1 = t0 + (n + 1 - t0) by omega]; exact all _
      have e2 : evolve n 1 = true := by
        rw [show n = t0 + (n - t0) by omega]; exact all _
      rw [e1, e2]
    · push_neg at hex
      refine ⟨N, le_refl _, ?_⟩
      intro n hn
      have e1 : evolve (n + 1) 1 = false := Bool.not_eq_true _ |>.mp (hex (n + 1) (by omega))
      have e2 : evolve n 1 = false := Bool.not_eq_true _ |>.mp (hex n (by omega))
      rw [e1, e2]
  obtain ⟨M, hNM, hcol1⟩ := key
  refine not_isEventuallyPeriodic_adjacent 0 ⟨⟨1, one_pos, M, ?_⟩, ⟨1, one_pos, M, ?_⟩⟩
  · intro n hn
    show centerColumn (n + 1) = centerColumn n
    rw [hN (n + 1) (by omega), hN n (by omega)]
  · intro n hn
    show evolve (n + 1) ((0 : ℤ) + 1) = evolve n ((0 : ℤ) + 1)
    rw [show (0 : ℤ) + 1 = 1 by ring]
    exact hcol1 n hn

-- (4) the white-time sufficient condition
theorem centerColumn_not_isEventuallyPeriodic_of_white_times
    (h : ∀ p > 0, ∀ N : ℕ, (∀ t ≥ N, centerColumn (t + p) = centerColumn t) →
        ∀ t ≥ N, centerColumn t = false → evolve (t + p) 1 = evolve t 1) :
    ¬ IsEventuallyPeriodic centerColumn := by
  rintro ⟨p, hp, N, hN⟩
  have h1 := h p hp N hN
  refine not_isEventuallyPeriodic_adjacent (-1) ⟨⟨p, hp, N, ?_⟩, ⟨p, hp, N, ?_⟩⟩
  · intro n hn
    show evolve (n + p) (-1) = evolve n (-1)
    have e : centerColumn (n + p + 1) = centerColumn (n + 1) := by
      rw [show n + p + 1 = n + 1 + p by ring]; exact hN (n + 1) (by omega)
    cases hc : centerColumn n with
    | true =>
        have hcp : centerColumn (n + p) = true := by rw [hN n hn, hc]
        have a := centerColumn_succ_of_black n hc
        have b := centerColumn_succ_of_black (n + p) hcp
        rw [a, b] at e
        exact (Bool.not_inj e)
    | false =>
        have hcp : centerColumn (n + p) = false := by rw [hN n hn, hc]
        have a : evolve n 1 = xor (centerColumn (n + 1)) (evolve n (-1)) :=
          column_one_of_white initialConfig n hc
        have b : evolve (n + p) 1 = xor (centerColumn (n + p + 1)) (evolve (n + p) (-1)) :=
          column_one_of_white initialConfig (n + p) hcp
        rw [e, h1 n hn hc, a] at b
        revert b
        cases centerColumn (n + 1) <;> cases evolve n (-1) <;> cases evolve (n + p) (-1) <;> simp
  · intro n hn
    show evolve (n + p) ((-1 : ℤ) + 1) = evolve n ((-1 : ℤ) + 1)
    rw [show (-1 : ℤ) + 1 = 0 by ring]
    exact hN n hn

-- (5) the right-return sufficient condition
theorem centerColumn_not_isEventuallyPeriodic_of_right_return
    (h : ∀ p > 0, ∀ N : ℕ, (∀ t ≥ N, centerColumn (t + p) = centerColumn t) →
        ∀ k : ℕ, evolve N ((k : ℤ) + 1) = evolve (N + p) ((k : ℤ) + 1)) :
    ¬ IsEventuallyPeriodic centerColumn := by
  rintro ⟨p, hp, N, hN⟩
  have hrows : evolve N = evolve (N + p) := by
    refine config_eq_of_right_and_column (evolve N) (evolve (N + p)) (h p hp N hN) ?_
    intro t
    show evolveFrom (evolve N) t 0 = evolveFrom (evolve (N + p)) t 0
    rw [evolveFrom_evolve, evolveFrom_evolve]
    show centerColumn (t + N) = centerColumn (t + (N + p))
    rw [show t + (N + p) = t + N + p by ring]
    exact (hN (t + N) (by omega)).symm
  refine not_isEventuallyPeriodic_adjacent 0 ⟨⟨p, hp, N, ?_⟩, ⟨p, hp, N, ?_⟩⟩
  · intro n hn
    show evolve (n + p) 0 = evolve n 0
    exact hN n hn
  · intro n hn
    show evolve (n + p) ((0 : ℤ) + 1) = evolve n ((0 : ℤ) + 1)
    have e1 : evolve (n + p) = evolveFrom (evolve (N + p)) (n - N) := by
      rw [evolveFrom_evolve]; congr 1; omega
    have e2 : evolve n = evolveFrom (evolve N) (n - N) := by
      rw [evolveFrom_evolve]; congr 1; omega
    rw [e1, e2, hrows]
