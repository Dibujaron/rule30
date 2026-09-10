import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent

/-! Seeder scratch part 5: `centerColumn_black_infinitely_often` with the
one-step white law inlined, so the route needs no other new node. -/

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

#print axioms centerColumn_black_infinitely_often
