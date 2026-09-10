import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.CenterColumnSuccOfBlack
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent
import Rule30.Proofs.ColumnOneOfWhite

theorem centerColumn_periodic_neg_one_black_times (p N : ℕ)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t)
    (t : ℕ) (ht : N ≤ t) (hb : centerColumn t = true) :
    evolve (t + p) (-1) = evolve t (-1) := by
  have hbp : centerColumn (t + p) = true := by rw [hc t ht, hb]
  have a := centerColumn_succ_of_black t hb
  have b := centerColumn_succ_of_black (t + p) hbp
  have e : centerColumn (t + p + 1) = centerColumn (t + 1) := by
    rw [show t + p + 1 = t + 1 + p by ring]; exact hc (t + 1) (by omega)
  rw [a, b] at e
  exact Bool.not_inj e

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

theorem centerColumn_black_infinitely_often (N : ℕ) :
    ∃ t ≥ N, centerColumn t = true := by
  by_contra hcon
  push_neg at hcon
  have hN : ∀ t ≥ N, centerColumn t = false := by
    intro t ht
    have := hcon t ht
    cases hx : centerColumn t with
    | false => rfl
    | true => exact absurd hx this
  have mono : ∀ t, N ≤ t → evolve t 1 = true → evolve (t + 1) 1 = true := by
    intro t ht hb
    have e : evolve (t + 1) 1 = (evolve t 1 || evolve t 2) := by
      rw [evolve_succ, rule30_eq]
      norm_num
      rw [show evolve t 0 = false from hN t ht]
      simp
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

theorem centerColumn_white_infinitely_often (N : ℕ) :
    ∃ t ≥ N, centerColumn t = false := by
  by_contra hcon
  push_neg at hcon
  have hN : ∀ t ≥ N, centerColumn t = true := by
    intro t ht
    have := hcon t ht
    cases hx : centerColumn t with
    | true => rfl
    | false => exact absurd hx this
  refine not_isEventuallyPeriodic_adjacent (-1) ⟨⟨1, one_pos, N, ?_⟩, ⟨1, one_pos, N, ?_⟩⟩
  · intro n hn
    show evolve (n + 1) (-1) = evolve n (-1)
    have h1 : ∀ m, N ≤ m → evolve m (-1) = false := by
      intro m hm
      have hb := centerColumn_succ_of_black m (hN m hm)
      rw [hN (m + 1) (by omega)] at hb
      cases hx : evolve m (-1) with
      | false => rfl
      | true => rw [hx] at hb; simp at hb
    rw [h1 (n + 1) (by omega), h1 n (by omega)]
  · intro n hn
    show evolve (n + 1) ((-1 : ℤ) + 1) = evolve n ((-1 : ℤ) + 1)
    rw [show (-1 : ℤ) + 1 = 0 by ring]
    show centerColumn (n + 1) = centerColumn n
    rw [hN (n + 1) (by omega), hN n hn]

theorem column_one_succ_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
    column X 1 (t + 1) = (column X 1 t || column X 2 t) := by
  unfold column at h ⊢
  rw [evolveFrom_succ, rule30_eq]
  norm_num
  rw [h]
  simp

#print axioms centerColumn_periodic_neg_one_black_times
#print axioms centerColumn_not_isEventuallyPeriodic_of_white_times
#print axioms centerColumn_black_infinitely_often
#print axioms centerColumn_white_infinitely_often
#print axioms column_one_succ_of_white
