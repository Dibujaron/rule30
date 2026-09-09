/-
Sextant, 2026-09-08. Kernel checks for the attack document on the free
companion of `centerColumn_other_of_cohomologous_column`.

Three statements, none of them a proposal; they are here so that the document
reports what the kernel accepted rather than what I believed.

  1. `sextant_center_aperiodic_of_cohomologous` -- if one difference sequence
     is eventually periodic then the centre column is NOT eventually periodic.
     So the topic's statement is implied by the negation of the prize
     conjecture, and a proof of it may assume the centre column is aperiodic.

  2. `sextant_damage_not_autonomous` -- Portage's measured "the transient part
     is not a cocycle", as a theorem in its strongest form: two pairs of
     configurations whose difference is the same at EVERY position, whose
     differences one step later are not the same. So no map of any radius,
     not even a global one, sends a difference row to the next difference row.

  3. `sextant_adjacent_difference_not_eventually_one` -- one unconditional
     instance of the topic's statement: two adjacent columns of the seed's
     picture cannot disagree at every time from some row on.

  lake env lean explorer/sextant_scratch_coboundary.lean
-/
import Rule30.Proofs
import Rule30.Prize

set_option maxRecDepth 4000

/-! ## 0. Axiom report at the end of the file -/

/-! ## 1. The free hypothesis -/

theorem sextant_center_aperiodic_of_cohomologous (x : ℤ) (j : ℕ) (hx : x ≠ 0)
    (hd : ∃ p > 0, ∃ N, PeriodicFrom (fun t => xor (centerColumn t) (evolve (t + j) x)) p N) :
    ¬ (∃ p > 0, ∃ N, PeriodicFrom centerColumn p N) := by
  intro hc
  have hcol := centerColumn_other_of_cohomologous_column x j hx hd hc
  exact hx (isEventuallyPeriodic_column_unique x 0 hcol hc)

/-! ## 2. The difference of two pictures is not a dynamical object -/

theorem sextant_damage_not_autonomous :
    ∃ X Y X' Y' : Config, (∀ i, xor (X i) (Y i) = xor (X' i) (Y' i)) ∧
      ∃ i, xor (rule30 X i) (rule30 Y i) ≠ xor (rule30 X' i) (rule30 Y' i) := by
  refine ⟨fun _ => false, fun i => decide (i = 0), fun i => decide (i = 1),
    fun i => decide (i = 0) || decide (i = 1), ?_, 0, ?_⟩
  · intro i
    by_cases h0 : i = 0
    · subst h0; simp
    · by_cases h1 : i = 1
      · subst h1; simp
      · simp [h0, h1]
  · simp only [rule30_eq]
    norm_num

/-! ## 3. Adjacent columns cannot disagree for ever -/

theorem sextant_adjacent_difference_not_eventually_one (i : ℤ) :
    ¬ ∃ N, ∀ t ≥ N, evolve t i ≠ evolve t (i + 1) := by
  rintro ⟨N, h⟩
  have step : ∀ t : ℕ, evolve (t + 1) (i + 1)
      = xor (evolve t i) (evolve t (i + 1) || evolve t (i + 2)) := by
    intro t
    have hr := rule30_eq (evolve t) (i + 1)
    rw [show i + 1 - 1 = i from by ring, show i + 1 + 1 = i + 2 from by ring] at hr
    rw [evolve_succ]
    exact hr
  -- from any row where column `i` is white, both columns are constant for ever
  have absorb : ∀ t, N ≤ t → evolve t i = false →
      ∀ s, evolve (t + s) i = false ∧ evolve (t + s) (i + 1) = true := by
    intro t htN ht s
    induction s with
    | zero =>
        refine ⟨ht, ?_⟩
        have hne := h t htN
        cases hb : evolve t (i + 1)
        · rw [ht, hb] at hne; exact absurd rfl hne
        · rfl
    | succ n ih =>
        obtain ⟨h0, h1⟩ := ih
        have hb1 : evolve (t + n + 1) (i + 1) = true := by
          rw [step, h0, h1]; simp
        have hne := h (t + n + 1) (by omega)
        refine ⟨?_, by rw [show t + (n + 1) = t + n + 1 from by omega]; exact hb1⟩
        rw [show t + (n + 1) = t + n + 1 from by omega]
        cases ha : evolve (t + n + 1) i
        · rfl
        · rw [ha, hb1] at hne; exact absurd rfl hne
  apply not_isEventuallyPeriodic_adjacent i
  by_cases hcase : ∃ t, N ≤ t ∧ evolve t i = false
  · obtain ⟨t, htN, ht⟩ := hcase
    have hA : ∀ n, t ≤ n → evolve n i = false := by
      intro n hn
      have := (absorb t htN ht (n - t)).1
      rwa [show t + (n - t) = n from by omega] at this
    have hB : ∀ n, t ≤ n → evolve n (i + 1) = true := by
      intro n hn
      have := (absorb t htN ht (n - t)).2
      rwa [show t + (n - t) = n from by omega] at this
    exact ⟨⟨1, one_pos, t, fun n hn => by
             show evolve (n + 1) i = evolve n i
             rw [hA (n + 1) (by omega), hA n hn]⟩,
           ⟨1, one_pos, t, fun n hn => by
             show evolve (n + 1) (i + 1) = evolve n (i + 1)
             rw [hB (n + 1) (by omega), hB n hn]⟩⟩
  · push_neg at hcase
    have hA : ∀ n, N ≤ n → evolve n i = true := by
      intro n hn
      cases hv : evolve n i
      · exact absurd hv (hcase n hn)
      · rfl
    have hB : ∀ n, N ≤ n → evolve n (i + 1) = false := by
      intro n hn
      have hne := h n hn
      cases hv : evolve n (i + 1)
      · rfl
      · rw [hA n hn, hv] at hne; exact absurd rfl hne
    exact ⟨⟨1, one_pos, N, fun n hn => by
             show evolve (n + 1) i = evolve n i
             rw [hA (n + 1) (by omega), hA n hn]⟩,
           ⟨1, one_pos, N, fun n hn => by
             show evolve (n + 1) (i + 1) = evolve n (i + 1)
             rw [hB (n + 1) (by omega), hB n hn]⟩⟩

#print axioms sextant_center_aperiodic_of_cohomologous
#print axioms sextant_damage_not_autonomous
#print axioms sextant_adjacent_difference_not_eventually_one
