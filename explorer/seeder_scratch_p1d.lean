import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent
import Rule30.Proofs.CenterColumnSuccOfBlack

/-! Seeder scratch part 4: the black-times lemma, and the check that it really
unblocks the open node `centerColumn_periodic_damage_white`. -/

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

-- the open board node, proved from the lemma above
example (p N : ℕ) (hp : 0 < p)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t) (M : ℕ) :
    ∃ t ≥ M, centerColumn t = false ∧ evolve (t + p) (-1) ≠ evolve t (-1) := by
  by_contra hcon
  push_neg at hcon
  refine not_isEventuallyPeriodic_adjacent (-1)
    ⟨⟨p, hp, max M N, ?_⟩, ⟨p, hp, max M N, ?_⟩⟩
  · intro n hn
    show evolve (n + p) (-1) = evolve n (-1)
    cases hb : centerColumn n with
    | true => exact centerColumn_periodic_neg_one_black_times p N hc n (le_of_max_le_right hn) hb
    | false => exact hcon n (le_of_max_le_left hn) hb
  · intro n hn
    show evolve (n + p) ((-1 : ℤ) + 1) = evolve n ((-1 : ℤ) + 1)
    rw [show (-1 : ℤ) + 1 = 0 by ring]
    exact hc n (le_of_max_le_right hn)

#print axioms centerColumn_periodic_neg_one_black_times
