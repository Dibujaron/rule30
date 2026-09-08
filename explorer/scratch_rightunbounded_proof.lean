import Rule30.Basic
import Rule30.Proofs.RightmostDifferenceMovesRight
import Rule30.Proofs.EvolveEqFalseOfOutsideCone
import Rule30.Proofs.EvolveRightEdge
import Rule30.Proofs.EvolveLeftEdge

/-!
Scratch, Sextant 2026-09-08: the route of C1 in the attack document
`docs/attacks/2026-09-08-rightdiagonal-minimal-periods-...`, written out.
Not a node; checked with `lake env lean`.

`m` is the distance from the right edge of row `p` to the next black cell.
The claim is that the first `t` with `evolve (t + p) p ≠ evolve t 0` is
exactly `t = m` — so right diagonal `m` is not `p`-periodic, and every
shallower one is `p`-periodic at index `0`.

The picture: `B` is the row at time `p` slid left by `p`. It agrees with the
seed's initial row everywhere right of `-m` (white outside the cone at `x ≥ 1`,
black at the right edge for `x = 0`, white by the definition of `m` in
between) and differs at `-m`. A rightmost difference moves right at speed one,
so it reaches the origin at time exactly `m` and not before.
-/

/-- One step of rule 30 commutes with a spatial translation. -/
theorem rule30_translate (c : Config) (s i : ℤ) :
    rule30 (fun x => c (x + s)) i = rule30 c (i + s) := by
  simp only [rule30_eq]
  have h1 : i - 1 + s = i + s - 1 := by ring
  have h2 : i + 1 + s = i + s + 1 := by ring
  rw [h1, h2]

/-- So does the whole evolution. -/
theorem evolveFrom_translate (c : Config) (s : ℤ) (t : ℕ) (i : ℤ) :
    evolveFrom (fun x => c (x + s)) t i = evolveFrom c t (i + s) := by
  induction t generalizing i with
  | zero => rfl
  | succ n ih =>
      have hfun : evolveFrom (fun x => c (x + s)) n = fun j => evolveFrom c n (j + s) :=
        funext ih
      rw [evolveFrom_succ, hfun, rule30_translate, ← evolveFrom_succ]

/-- Growing from row `p` is the same as reading the picture `p` rows later. -/
theorem evolveFrom_evolve (p t : ℕ) : evolveFrom (evolve p) t = evolve (t + p) := by
  simp [evolveFrom, evolve, Function.iterate_add_apply]

/-- The first failure of `evolve (t + p) p = evolve t 0` is at `t = m`. -/
theorem rightDiagonal_first_failure (p m : ℕ) (hm : 0 < m)
    (hwhite : ∀ d : ℕ, 0 < d → d < m → evolve p ((p : ℤ) - (d : ℤ)) = false)
    (hblack : evolve p ((p : ℤ) - (m : ℤ)) = true) :
    (∀ t, t < m → evolve (t + p) (p : ℤ) = evolve t 0)
      ∧ evolve (m + p) (p : ℤ) ≠ evolve m 0 := by
  -- `B` is the row at time `p`, slid left by `p`.
  let B : Config := fun x => evolve p (x + (p : ℤ))
  -- growing `B` reads the picture `p` rows down and `p` cells right
  have hkey : ∀ (t : ℕ) (i : ℤ), evolveFrom B t i = evolve (t + p) (i + (p : ℤ)) := by
    intro t i
    show evolveFrom (fun x => evolve p (x + (p : ℤ))) t i = _
    rw [evolveFrom_translate (evolve p) (p : ℤ) t i, evolveFrom_evolve]
  -- `B` agrees with the seed's row everywhere right of `-m`
  have hagree : ∀ j : ℤ, -(m : ℤ) < j → B j = initialConfig j := by
    intro j hj
    rcases lt_trichotomy j 0 with hneg | hzero | hpos
    · -- `-m < j < 0`: white by the definition of `m`
      have hd : ∃ d : ℕ, 0 < d ∧ d < m ∧ j = -(d : ℤ) := by
        refine ⟨(-j).toNat, ?_, ?_, ?_⟩ <;> omega
      obtain ⟨d, hd0, hdm, rfl⟩ := hd
      have : B (-(d : ℤ)) = evolve p ((p : ℤ) - (d : ℤ)) := by
        show evolve p (-(d : ℤ) + (p : ℤ)) = _
        congr 1
        ring
      rw [this, hwhite d hd0 hdm]
      simp [initialConfig]
      omega
    · -- the origin: the right edge of row `p`
      subst hzero
      have : B 0 = evolve p (p : ℤ) := by
        show evolve p (0 + (p : ℤ)) = _
        congr 1
        ring
      rw [this, evolve_right_edge]
      simp [initialConfig]
    · -- `j ≥ 1`: outside the cone at time `p`
      have hcone : evolve p (j + (p : ℤ)) = false := by
        refine evolve_eq_false_of_outside_cone p (j + (p : ℤ)) ?_
        rw [abs_of_pos (by omega)]
        omega
      show evolve p (j + (p : ℤ)) = initialConfig j
      rw [hcone]
      simp [initialConfig]
      omega
  -- and differs at `-m`
  have hdiff : B (-(m : ℤ)) ≠ initialConfig (-(m : ℤ)) := by
    have : B (-(m : ℤ)) = evolve p ((p : ℤ) - (m : ℤ)) := by
      show evolve p (-(m : ℤ) + (p : ℤ)) = _
      congr 1
      ring
    rw [this, hblack]
    simp [initialConfig]
    omega
  constructor
  · intro t ht
    have h := (rightmost_difference_moves_right B initialConfig (-(m : ℤ)) t hagree hdiff).2 0
      (by omega)
    rw [hkey t 0] at h
    have h0 : (0 : ℤ) + (p : ℤ) = (p : ℤ) := by ring
    rw [h0] at h
    exact h
  · have h := (rightmost_difference_moves_right B initialConfig (-(m : ℤ)) m hagree hdiff).1
    have hzero : -(m : ℤ) + (m : ℕ) = 0 := by omega
    rw [hzero, hkey m 0] at h
    have h0 : (0 : ℤ) + (p : ℤ) = (p : ℤ) := by ring
    rw [h0] at h
    exact h

/-- Such an `m` exists, and is at most `2 p`: row `p` is black at its left
edge, position `-p`. -/
theorem exists_agreement_length (p : ℕ) (hp : 0 < p) :
    ∃ m, 0 < m ∧ (∀ d : ℕ, 0 < d → d < m → evolve p ((p : ℤ) - (d : ℤ)) = false)
      ∧ evolve p ((p : ℤ) - (m : ℤ)) = true := by
  classical
  have hex : ∃ d : ℕ, 0 < d ∧ evolve p ((p : ℤ) - (d : ℤ)) = true := by
    refine ⟨2 * p, by omega, ?_⟩
    have : (p : ℤ) - ((2 * p : ℕ) : ℤ) = -(p : ℤ) := by push_cast; ring
    rw [this, evolve_left_edge]
  classical
  refine ⟨Nat.find hex, (Nat.find_spec hex).1, ?_, (Nat.find_spec hex).2⟩
  intro d hd0 hdm
  have := Nat.find_min hex hdm
  simp only [not_and] at this
  cases h : evolve p ((p : ℤ) - (d : ℤ)) with
  | false => rfl
  | true => exact absurd h (this hd0)

/-- **The right-diagonal periods are unbounded.** No `p > 0` is a period of
every right diagonal: the counterexample is the diagonal at depth `m`. -/
theorem rightDiagonal_period_unbounded (p : ℕ) (hp : 0 < p) :
    ∃ k, ¬ PeriodicFrom (rightDiagonal k) p 0 := by
  obtain ⟨m, hm, hwhite, hblack⟩ := exists_agreement_length p hp
  refine ⟨m, ?_⟩
  intro hper
  have h0 := hper 0 (Nat.zero_le 0)
  have hne := (rightDiagonal_first_failure p m hm hwhite hblack).2
  apply hne
  have hL : rightDiagonal m (0 + p) = evolve (m + p) (p : ℤ) := by
    show evolve ((0 + p) + m) ((0 + p : ℕ) : ℤ) = _
    congr 1
    · omega
    · push_cast; ring
  have hR : rightDiagonal m 0 = evolve m 0 := by
    show evolve (0 + m) ((0 : ℕ) : ℤ) = _
    congr 1
    omega
  rw [hL, hR] at h0
  exact h0

#print axioms rightDiagonal_first_failure
#print axioms rightDiagonal_period_unbounded
