/-
Sextant, 2026-09-08. The right-edge shield, as a theorem.

`sextant_colsep.mjs` found distinct finite configurations whose centre columns
agree to every depth read, and `sextant_shield.mjs` isolated the mechanism: the
difference between the seed's picture and the picture of "the seed plus a black
cell at 1" never leaves a two-cell strip riding the right edge, so the two
pictures agree at every position `<= t - 1` at row `t`, and in particular have
the SAME centre column for ever.

That kills the reduction the p = 1 case of the coboundary statement wants: "the
centre column separates finite configurations" is false.

The invariant, with `A = evolve` (the seed) and `B = evolveFrom shieldConfig`:

  (a) B_t i = A_t i         for every i <= t - 1
  (b) B_t t = !(A_t (t-1))
  (c) B_t (t+1) = true
  (d) B_t i = false         for every i > t + 1

Everything it needs about the seed is `evolve_right_edge` and
`evolve_eq_false_of_outside_cone`; the parity of the second right diagonal is
not needed, because (b) carries the complement relation instead.

  lake env lean explorer/sextant_scratch_shield.lean
-/
import Rule30.Proofs
import Rule30.Prize

/-- The seed with one extra black cell immediately to its right. -/
def shieldConfig : Config := fun i => decide (i = 0) || decide (i = 1)

theorem shield_invariant (t : ℕ) :
    (∀ i : ℤ, i ≤ (t : ℤ) - 1 → evolveFrom shieldConfig t i = evolve t i) ∧
      evolveFrom shieldConfig t (t : ℤ) = !(evolve t ((t : ℤ) - 1)) ∧
      evolveFrom shieldConfig t ((t : ℤ) + 1) = true ∧
      (∀ i : ℤ, (t : ℤ) + 1 < i → evolveFrom shieldConfig t i = false) := by
  induction t with
  | zero =>
      refine ⟨?_, ?_, ?_, ?_⟩
      · intro i hi
        have h0 : i ≠ 0 := by omega
        have h1 : i ≠ 1 := by omega
        simp [evolveFrom, evolve, shieldConfig, initialConfig, h0, h1]
      · have : ((0 : ℤ) - 1) ≠ 0 := by omega
        simp [evolveFrom, evolve, shieldConfig, initialConfig, this]
      · simp [evolveFrom, shieldConfig]
      · intro i hi
        have h0 : i ≠ 0 := by omega
        have h1 : i ≠ 1 := by omega
        simp [evolveFrom, shieldConfig, h0, h1]
  | succ n ih =>
      obtain ⟨ha, hb, hc, hd⟩ := ih
      have hB : ∀ i : ℤ, evolveFrom shieldConfig (n + 1) i
          = xor (evolveFrom shieldConfig n (i - 1))
              (evolveFrom shieldConfig n i || evolveFrom shieldConfig n (i + 1)) := by
        intro i; rw [evolveFrom_succ, rule30_eq]
      have hA : ∀ i : ℤ, evolve (n + 1) i
          = xor (evolve n (i - 1)) (evolve n i || evolve n (i + 1)) := by
        intro i; rw [evolve_succ, rule30_eq]
      have edge : evolve n (n : ℤ) = true := evolve_right_edge n
      have out : ∀ i : ℤ, (n : ℤ) < i → evolve n i = false := by
        intro i hi
        refine evolve_eq_false_of_outside_cone n i ?_
        rw [abs_of_pos (by omega : (0 : ℤ) < i)]
        exact hi
      have cast1 : ((n : ℕ) + 1 : ℕ) = ((n : ℤ) + 1 : ℤ) := by push_cast; ring
      refine ⟨?_, ?_, ?_, ?_⟩
      -- (a) agreement at every position <= n
      · intro i hi
        rw [Nat.cast_add, Nat.cast_one] at hi
        rw [hB i, hA i]
        rcases lt_trichotomy i ((n : ℤ) - 1) with h | h | h
        · -- i <= n - 2: all three neighbours are covered by (a)
          rw [ha (i - 1) (by omega), ha i (by omega), ha (i + 1) (by omega)]
        · -- i = n - 1: the right neighbour is the shield cell
          subst h
          rw [ha ((n : ℤ) - 1 - 1) (by omega), ha ((n : ℤ) - 1) (by omega),
            show (n : ℤ) - 1 + 1 = (n : ℤ) from by ring, hb]
          cases hv : evolve n ((n : ℤ) - 1) <;> simp [edge]
        · -- i = n: reads (a) at n-1, (b) at n, (c) at n+1
          have hin : i = (n : ℤ) := by omega
          subst hin
          rw [ha ((n : ℤ) - 1) (by omega), hb, hc, edge, out ((n : ℤ) + 1) (by omega)]
          cases hv : evolve n ((n : ℤ) - 1) <;> simp
      -- (b) the shield cell one row down
      · rw [cast1, show (n : ℤ) + 1 - 1 = (n : ℤ) from by ring, hB ((n : ℤ) + 1),
          hA (n : ℤ), show (n : ℤ) + 1 - 1 = (n : ℤ) from by ring, hb, hc,
          hd ((n : ℤ) + 1 + 1) (by omega), edge, out ((n : ℤ) + 1) (by omega)]
        cases hv : evolve n ((n : ℤ) - 1) <;> simp
      -- (c) the new right edge of the shifted picture
      · rw [cast1, hB ((n : ℤ) + 1 + 1),
          show (n : ℤ) + 1 + 1 - 1 = (n : ℤ) + 1 from by ring, hc,
          hd ((n : ℤ) + 1 + 1) (by omega), hd ((n : ℤ) + 1 + 1 + 1) (by omega)]
        simp
      -- (d) nothing beyond
      · intro i hi
        rw [cast1] at hi
        rw [hB i, hd (i - 1) (by omega), hd i (by omega), hd (i + 1) (by omega)]
        simp

/-- Two distinct finite configurations with the same centre column at every
time: the seed, and the seed with one extra black cell at position 1. -/
theorem shield_same_center_column (t : ℕ) (ht : 1 ≤ t) :
    column shieldConfig 0 t = centerColumn t := by
  have h := (shield_invariant t).1 0 (by exact_mod_cast by omega)
  simpa [column, centerColumn] using h

theorem shield_config_ne : shieldConfig ≠ initialConfig := by
  intro h
  have := congrFun h 1
  simp [shieldConfig, initialConfig] at this

#print axioms shield_invariant
#print axioms shield_same_center_column
#print axioms shield_config_ne
