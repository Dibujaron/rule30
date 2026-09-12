import Rule30.Basic

/-!
Seeder, 2026-09-12 — elaboration check only for the proposed P1 damage tier.
Every statement below is exactly the bytes proposed in
`blueprint/proposals/next.json`; the `sorry`s are deliberate.
-/

theorem damage_front_advances (X Y : Config) (t k : ℕ)
    (hagree : ∀ i ≤ k + 1, column X (-(i : ℤ)) t = column Y (-(i : ℤ)) t)
    (hdiff : column X (-((k : ℤ) + 2)) t ≠ column Y (-((k : ℤ) + 2)) t) :
    (∀ i, 1 ≤ i → i ≤ k → column X (-(i : ℤ)) (t + 1) = column Y (-(i : ℤ)) (t + 1))
      ∧ column X (-((k : ℤ) + 1)) (t + 1) ≠ column Y (-((k : ℤ) + 1)) (t + 1) := by
  sorry

theorem centerColumn_damage_front_exists (p t : ℕ) (hp : 0 < p)
    (h0 : evolve t 0 = evolve (t + p) 0) :
    ∃ k, (∀ i ≤ k, evolve t (-(i : ℤ)) = evolve (t + p) (-(i : ℤ)))
      ∧ evolve t (-((k : ℤ) + 1)) ≠ evolve (t + p) (-((k : ℤ) + 1)) := by
  sorry

theorem centerColumn_periodic_damage_mask (p N : ℕ)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t) (t : ℕ) (ht : N ≤ t) :
    xor (evolve t (-1)) (evolve (t + p) (-1))
      = ((! centerColumn t) && xor (evolve t 1) (evolve (t + p) 1)) := by
  sorry

theorem centerColumn_periodic_damage_arrival (p N : ℕ)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t) (t k : ℕ) (ht : N ≤ t)
    (hagree : ∀ i ≤ k, evolve t (-(i : ℤ)) = evolve (t + p) (-(i : ℤ)))
    (hdiff : evolve t (-((k : ℤ) + 1)) ≠ evolve (t + p) (-((k : ℤ) + 1))) :
    centerColumn (t + k) = false ∧ evolve (t + k) 1 ≠ evolve (t + k + p) 1 := by
  sorry

theorem centerColumn_black_run_le_period (p N : ℕ) (hp : 0 < p)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t)
    (t : ℕ) (ht : N ≤ t) (hrun : ∀ s < p, centerColumn (t + s) = true) :
    False := by
  sorry

theorem centerColumn_periodic_two_alternating (N : ℕ)
    (hc : ∀ t ≥ N, centerColumn (t + 2) = centerColumn t) (t : ℕ) (ht : N ≤ t) :
    centerColumn (t + 1) = ! centerColumn t := by
  sorry
