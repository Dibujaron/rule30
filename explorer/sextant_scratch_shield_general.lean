/-
Sextant, 2026-09-08. The right-edge shield for an arbitrary finite
configuration, generalising `explorer/sextant_scratch_shield.lean`.

Let `X` be a configuration whose rightmost black cell is at `r` and which is
white at `r - 1` (the rightmost black cell is ISOLATED). Let `Y = X` with one
extra black cell at `r + 1`. Then at every row `t` the two pictures agree at
every position `< r + t`: the difference never leaves the two-cell strip riding
the right edge, so `X` and `Y` have the same centre column, for ever.

Measured first (`explorer/sextant_shieldrule.mjs`): over all 16,384
configurations with cells in `[0, 15)` and a black cell at 0, "isolated" and
"the centre column is unchanged" agree 16,384 times out of 16,384, in both
directions, to depth 1,200.

  lake env lean explorer/sextant_scratch_shield_general.lean
-/
import Rule30.Proofs
import Rule30.Prize

section Shield

variable {X : Config} {r : ℤ}

/-- Nothing is black beyond the right edge of the cone from `r`. -/
theorem shieldGen_outside (hout : ∀ i : ℤ, r < i → X i = false) :
    ∀ (t : ℕ) (i : ℤ), r + t < i → evolveFrom X t i = false := by
  intro t
  induction t with
  | zero => intro i hi; simpa [evolveFrom] using hout i (by exact_mod_cast by push_cast at hi; omega)
  | succ n ih =>
      intro i hi
      rw [evolveFrom_succ, rule30_eq]
      have h1 : r + (n : ℤ) < i - 1 := by push_cast at hi; omega
      have h2 : r + (n : ℤ) < i := by push_cast at hi; omega
      have h3 : r + (n : ℤ) < i + 1 := by push_cast at hi; omega
      rw [ih (i - 1) (by exact_mod_cast h1), ih i (by exact_mod_cast h2),
        ih (i + 1) (by exact_mod_cast h3)]
      simp

/-- The right edge of the cone from `r` is black at every row. -/
theorem shieldGen_edge (hr : X r = true) (hout : ∀ i : ℤ, r < i → X i = false) :
    ∀ t : ℕ, evolveFrom X t (r + t) = true := by
  intro t
  induction t with
  | zero => simpa [evolveFrom] using hr
  | succ n ih =>
      rw [evolveFrom_succ, rule30_eq]
      have e0 : r + ((n : ℕ) + 1 : ℕ) - 1 = r + (n : ℕ) := by push_cast; ring
      have e1 : r + ((n : ℕ) + 1 : ℕ) = r + (n : ℕ) + 1 := by push_cast; ring
      rw [e0, e1, ih,
        shieldGen_outside hout n (r + (n : ℕ) + 1) (by omega),
        shieldGen_outside hout n (r + (n : ℕ) + 1 + 1) (by omega)]
      simp

/-- `X` with one extra black cell immediately right of its rightmost. -/
def addRight (X : Config) (r : ℤ) : Config := fun i => X i || decide (i = r + 1)

theorem shieldGen_invariant (hr : X r = true) (hiso : X (r - 1) = false)
    (hout : ∀ i : ℤ, r < i → X i = false) (t : ℕ) :
    (∀ i : ℤ, i < r + t → evolveFrom (addRight X r) t i = evolveFrom X t i) ∧
      evolveFrom (addRight X r) t (r + t) = !(evolveFrom X t (r + t - 1)) ∧
      evolveFrom (addRight X r) t (r + t + 1) = true ∧
      (∀ i : ℤ, r + t + 1 < i → evolveFrom (addRight X r) t i = false) := by
  induction t with
  | zero =>
      refine ⟨?_, ?_, ?_, ?_⟩
      · intro i hi
        have : i ≠ r + 1 := by push_cast at hi; omega
        simp [evolveFrom, addRight, this]
      · have h1 : r + ((0 : ℕ) : ℤ) = r := by push_cast; ring
        rw [h1]
        have : r ≠ r + 1 := by omega
        simp [evolveFrom, addRight, this, hr, hiso]
      · have h1 : r + ((0 : ℕ) : ℤ) + 1 = r + 1 := by push_cast; ring
        rw [h1]
        simp [evolveFrom, addRight]
      · intro i hi
        push_cast at hi
        have h1 : i ≠ r + 1 := by omega
        have h2 : X i = false := hout i (by omega)
        simp [evolveFrom, addRight, h1, h2]
  | succ n ih =>
      obtain ⟨ha, hb, hc, hd⟩ := ih
      set Y := addRight X r with hY
      have hBY : ∀ i : ℤ, evolveFrom Y (n + 1) i
          = xor (evolveFrom Y n (i - 1)) (evolveFrom Y n i || evolveFrom Y n (i + 1)) := by
        intro i; rw [evolveFrom_succ, rule30_eq]
      have hAX : ∀ i : ℤ, evolveFrom X (n + 1) i
          = xor (evolveFrom X n (i - 1)) (evolveFrom X n i || evolveFrom X n (i + 1)) := by
        intro i; rw [evolveFrom_succ, rule30_eq]
      have edge : evolveFrom X n (r + n) = true := shieldGen_edge hr hout n
      have out : ∀ i : ℤ, r + (n : ℤ) < i → evolveFrom X n i = false := by
        intro i hi; exact shieldGen_outside hout n i (by exact_mod_cast hi)
      have cast1 : ((n : ℕ) + 1 : ℕ) = ((n : ℤ) + 1) := by push_cast; ring
      refine ⟨?_, ?_, ?_, ?_⟩
      · intro i hi
        rw [cast1] at hi
        rw [hBY i, hAX i]
        rcases lt_trichotomy i (r + (n : ℤ)) with h | h | h
        · rcases lt_trichotomy i (r + (n : ℤ) - 1) with h' | h' | h'
          · rw [ha (i - 1) (by omega), ha i (by omega), ha (i + 1) (by omega)]
          · -- i = r + n - 1: the right neighbour is the shield cell
            subst h'
            rw [ha (r + (n : ℤ) - 1 - 1) (by omega), ha (r + (n : ℤ) - 1) (by omega),
              show r + (n : ℤ) - 1 + 1 = r + (n : ℤ) from by ring, hb, edge]
            cases hv : evolveFrom X n (r + (n : ℤ) - 1) <;> simp
          · omega
        · -- i = r + n: reads (a) at r+n-1, (b) at r+n, (c) at r+n+1
          subst h
          rw [ha (r + (n : ℤ) - 1) (by omega), hb, hc, edge,
            out (r + (n : ℤ) + 1) (by omega)]
          cases hv : evolveFrom X n (r + (n : ℤ) - 1) <;> simp
        · omega
      · rw [cast1, show r + ((n : ℤ) + 1) = r + (n : ℤ) + 1 from by ring,
          show r + (n : ℤ) + 1 - 1 = r + (n : ℤ) from by ring,
          hBY (r + (n : ℤ) + 1), hAX (r + (n : ℤ)),
          show r + (n : ℤ) + 1 - 1 = r + (n : ℤ) from by ring, hb, hc,
          hd (r + (n : ℤ) + 1 + 1) (by omega), edge, out (r + (n : ℤ) + 1) (by omega)]
        cases hv : evolveFrom X n (r + (n : ℤ) - 1) <;> simp
      · rw [cast1, show r + ((n : ℤ) + 1) + 1 = r + (n : ℤ) + 1 + 1 from by ring,
          hBY (r + (n : ℤ) + 1 + 1),
          show r + (n : ℤ) + 1 + 1 - 1 = r + (n : ℤ) + 1 from by ring, hc,
          hd (r + (n : ℤ) + 1 + 1) (by omega), hd (r + (n : ℤ) + 1 + 1 + 1) (by omega)]
        simp
      · intro i hi
        rw [cast1] at hi
        rw [hBY i, hd (i - 1) (by omega), hd i (by omega), hd (i + 1) (by omega)]
        simp

/-- **The shield.** A finite configuration whose rightmost black cell is
isolated shares its centre column, for ever, with the configuration that has
one more black cell immediately to the right of it. -/
theorem shieldGen_same_column (hr : X r = true) (hiso : X (r - 1) = false)
    (hout : ∀ i : ℤ, r < i → X i = false) (x : ℤ) (t : ℕ) (hx : x < r + t) :
    column (addRight X r) x t = column X x t :=
  (shieldGen_invariant hr hiso hout t).1 x hx

/-! ### The same shield two cells out, and the infinite chain it generates -/

/-- `X` with one extra black cell two places right of its rightmost. -/
def addRight2 (X : Config) (r : ℤ) : Config := fun i => X i || decide (i = r + 2)

theorem shieldGen2_invariant (hr : X r = true) (hiso : X (r - 1) = false)
    (hout : ∀ i : ℤ, r < i → X i = false) (t : ℕ) :
    (∀ i : ℤ, i < r + t → evolveFrom (addRight2 X r) t i = evolveFrom X t i) ∧
      evolveFrom (addRight2 X r) t (r + t) = !(evolveFrom X t (r + t - 1)) ∧
      evolveFrom (addRight2 X r) t (r + t + 1) = evolveFrom X t (r + t - 1) ∧
      evolveFrom (addRight2 X r) t (r + t + 2) = true ∧
      (∀ i : ℤ, r + t + 2 < i → evolveFrom (addRight2 X r) t i = false) := by
  induction t with
  | zero =>
      have h1 : r + ((0 : ℕ) : ℤ) = r := by push_cast; ring
      refine ⟨?_, ?_, ?_, ?_, ?_⟩
      · intro i hi
        have : i ≠ r + 2 := by push_cast at hi; omega
        simp [evolveFrom, addRight2, this]
      · rw [h1]
        have e1 : r ≠ r + 2 := by omega
        simp [evolveFrom, addRight2, e1, hr, hiso]
      · rw [h1]
        have e2 : r + 1 ≠ r + 2 := by omega
        have e3 : X (r + 1) = false := hout (r + 1) (by omega)
        simp [evolveFrom, addRight2, e2, e3, hiso]
      · rw [h1]
        simp [evolveFrom, addRight2]
      · intro i hi
        rw [h1] at hi
        have h2 : i ≠ r + 2 := by omega
        have h3 : X i = false := hout i (by omega)
        simp [evolveFrom, addRight2, h2, h3]
  | succ n ih =>
      obtain ⟨ha, hb, hc, hd, he⟩ := ih
      set Y := addRight2 X r with hY
      have hBY : ∀ i : ℤ, evolveFrom Y (n + 1) i
          = xor (evolveFrom Y n (i - 1)) (evolveFrom Y n i || evolveFrom Y n (i + 1)) := by
        intro i; rw [evolveFrom_succ, rule30_eq]
      have hAX : ∀ i : ℤ, evolveFrom X (n + 1) i
          = xor (evolveFrom X n (i - 1)) (evolveFrom X n i || evolveFrom X n (i + 1)) := by
        intro i; rw [evolveFrom_succ, rule30_eq]
      have edge : evolveFrom X n (r + n) = true := shieldGen_edge hr hout n
      have out : ∀ i : ℤ, r + (n : ℤ) < i → evolveFrom X n i = false := by
        intro i hi; exact shieldGen_outside hout n i (by exact_mod_cast hi)
      have cast1 : ((n : ℕ) + 1 : ℕ) = ((n : ℤ) + 1) := by push_cast; ring
      -- the new second-from-edge cell of X, in terms of the old one
      have hnew : evolveFrom X (n + 1) (r + (n : ℤ))
          = !(evolveFrom X n (r + (n : ℤ) - 1)) := by
        rw [hAX (r + (n : ℤ)), edge]
        cases hv : evolveFrom X n (r + (n : ℤ) - 1) <;> simp
      refine ⟨?_, ?_, ?_, ?_, ?_⟩
      · intro i hi
        rw [cast1] at hi
        rw [hBY i, hAX i]
        rcases lt_trichotomy i (r + (n : ℤ)) with h | h | h
        · rcases lt_trichotomy i (r + (n : ℤ) - 1) with h' | h' | h'
          · rw [ha (i - 1) (by omega), ha i (by omega), ha (i + 1) (by omega)]
          · subst h'
            rw [ha (r + (n : ℤ) - 1 - 1) (by omega), ha (r + (n : ℤ) - 1) (by omega),
              show r + (n : ℤ) - 1 + 1 = r + (n : ℤ) from by ring, hb, edge]
            cases hv : evolveFrom X n (r + (n : ℤ) - 1) <;> simp
          · omega
        · subst h
          rw [ha (r + (n : ℤ) - 1) (by omega), hb, hc, edge,
            out (r + (n : ℤ) + 1) (by omega)]
          cases hv : evolveFrom X n (r + (n : ℤ) - 1) <;> simp
        · omega
      · rw [cast1, show r + ((n : ℤ) + 1) = r + (n : ℤ) + 1 from by ring,
          show r + (n : ℤ) + 1 - 1 = r + (n : ℤ) from by ring,
          hBY (r + (n : ℤ) + 1), hnew,
          show r + (n : ℤ) + 1 - 1 = r + (n : ℤ) from by ring, hb, hc,
          show r + (n : ℤ) + 1 + 1 = r + (n : ℤ) + 2 from by ring, hd]
        cases hv : evolveFrom X n (r + (n : ℤ) - 1) <;> simp
      · rw [cast1, show r + ((n : ℤ) + 1) + 1 = r + (n : ℤ) + 2 from by ring,
          show r + ((n : ℤ) + 1) - 1 = r + (n : ℤ) from by ring,
          hBY (r + (n : ℤ) + 2), hnew,
          show r + (n : ℤ) + 2 - 1 = r + (n : ℤ) + 1 from by ring, hc, hd,
          he (r + (n : ℤ) + 2 + 1) (by omega)]
        cases hv : evolveFrom X n (r + (n : ℤ) - 1) <;> simp
      · rw [cast1, show r + ((n : ℤ) + 1) + 2 = r + (n : ℤ) + 2 + 1 from by ring,
          hBY (r + (n : ℤ) + 2 + 1),
          show r + (n : ℤ) + 2 + 1 - 1 = r + (n : ℤ) + 2 from by ring, hd,
          he (r + (n : ℤ) + 2 + 1) (by omega), he (r + (n : ℤ) + 2 + 1 + 1) (by omega)]
        simp
      · intro i hi
        rw [cast1] at hi
        rw [hBY i, he (i - 1) (by omega), he i (by omega), he (i + 1) (by omega)]
        simp

theorem shieldGen2_same_column (hr : X r = true) (hiso : X (r - 1) = false)
    (hout : ∀ i : ℤ, r < i → X i = false) (x : ℤ) (t : ℕ) (hx : x < r + t) :
    column (addRight2 X r) x t = column X x t :=
  (shieldGen2_invariant hr hiso hout t).1 x hx

end Shield

/-! ### Infinitely many finite configurations with the seed's centre column -/

/-- `chainCfg k` is the seed with black cells added at 2, 4, ..., 2k. -/
def chainCfg : ℕ → Config
  | 0 => initialConfig
  | k + 1 => addRight2 (chainCfg k) (2 * k)

theorem chainCfg_shape (k : ℕ) :
    chainCfg k (2 * k) = true ∧ chainCfg k (2 * k - 1) = false ∧
      ∀ i : ℤ, (2 * k : ℤ) < i → chainCfg k i = false := by
  induction k with
  | zero =>
      refine ⟨by simp [chainCfg, initialConfig], by simp [chainCfg, initialConfig], ?_⟩
      intro i hi
      have : i ≠ 0 := by push_cast at hi; omega
      simp [chainCfg, initialConfig, this]
  | succ n ih =>
      obtain ⟨h1, h2, h3⟩ := ih
      refine ⟨?_, ?_, ?_⟩
      · push_cast
        rw [show 2 * ((n : ℤ) + 1) = 2 * (n : ℤ) + 2 from by ring]
        simp [chainCfg, addRight2]
      · push_cast
        rw [show 2 * ((n : ℤ) + 1) - 1 = 2 * (n : ℤ) + 1 from by ring]
        have hne : (2 * (n : ℤ)) + 1 ≠ 2 * (n : ℤ) + 2 := by omega
        simp [chainCfg, addRight2, hne, h3 ((2 * (n : ℤ)) + 1) (by omega)]
      · intro i hi
        push_cast at hi
        have hne : i ≠ 2 * (n : ℤ) + 2 := by omega
        simp [chainCfg, addRight2, hne, h3 i (by omega)]

/-- Every member of the chain has the seed's centre column, from row 1 on. -/
theorem chainCfg_center_column (k : ℕ) (t : ℕ) (ht : 1 ≤ t) :
    column (chainCfg k) 0 t = centerColumn t := by
  induction k with
  | zero => rfl
  | succ n ih =>
      obtain ⟨h1, h2, h3⟩ := chainCfg_shape n
      have := shieldGen2_same_column h1 h2 h3 0 t (by push_cast; omega)
      rw [show chainCfg (n + 1) = addRight2 (chainCfg n) (2 * n) from rfl, this, ih]

/-- The chain is infinite: distinct indices give distinct configurations. -/
theorem chainCfg_injective (k m : ℕ) (h : k < m) : chainCfg k ≠ chainCfg m := by
  intro hEq
  have hk := (chainCfg_shape m).1
  have hout := (chainCfg_shape k).2.2 (2 * m : ℤ) (by push_cast; omega)
  rw [hEq] at hout
  rw [hout] at hk
  exact Bool.noConfusion hk

#print axioms shieldGen_invariant
#print axioms shieldGen_same_column
#print axioms shieldGen2_same_column
#print axioms chainCfg_center_column
#print axioms chainCfg_injective
