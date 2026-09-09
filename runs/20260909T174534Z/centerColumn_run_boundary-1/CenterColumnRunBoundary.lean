import Rule30.Basic

/-!
**What this says.** The center column becomes black exactly when a run begins or ends at the origin in the previous row.
**Why it is true.** The rule 30 output at the origin is an XOR of the left cell with the OR of center and right; this XOR is true exactly in the three run-boundary patterns.
**Where the work is.** Unfolding the definition and rule30_eq, then verifying the XOR against all eight boolean triples to confirm the three patterns.
-/

private lemma not_eq_true_of_bool (b : Bool) : ¬(b = true) → b = false := by
  cases b <;> simp

theorem centerColumn_run_boundary (t : ℕ) :
    centerColumn (t + 1) = true ↔
      (evolve t 0 = true ∧ evolve t (-1) = false) ∨
      (evolve t 0 = false ∧ evolve t (-1) = true ∧ evolve t 1 = false) ∨
      (evolve t 0 = false ∧ evolve t 1 = true ∧ evolve t (-1) = false) := by
  unfold centerColumn
  rw [evolve_succ, rule30_eq]
  -- Now goal is: xor (evolve t (-1)) (evolve t 0 || evolve t 1) = true ↔ ...
  constructor
  · intro h
    -- Forward: if xor is true, one of the patterns holds
    by_cases h0 : evolve t 0 = true
    · by_cases hleft : evolve t (-1) = true
      · -- both true, so xor true true = false, contradicts h
        simp [h0, hleft] at h
      · -- evolve t 0 = true, evolve t (-1) ≠ true
        left
        exact ⟨h0, not_eq_true_of_bool (evolve t (-1)) hleft⟩
    · by_cases hleft : evolve t (-1) = true
      · by_cases hright : evolve t 1 = true
        · -- hleft true, hright true: xor true true = false, contradicts h
          simp [h0, hleft, hright] at h
        · -- hleft = true, h0 = false, hright = false: pattern 2
          right; left
          exact ⟨not_eq_true_of_bool (evolve t 0) h0, hleft, not_eq_true_of_bool (evolve t 1) hright⟩
      · by_cases hright : evolve t 1 = true
        · -- hleft = false, h0 = false, hright = true: pattern 3
          right; right
          exact ⟨not_eq_true_of_bool (evolve t 0) h0, hright, not_eq_true_of_bool (evolve t (-1)) hleft⟩
        · -- all false, xor false false = false, contradicts h
          simp [h0, hleft, hright] at h
  · intro h
    -- Backward: one of the patterns holds, so xor is true
    rcases h with ⟨h0, hleft⟩ | ⟨h0, hleft, hright⟩ | ⟨h0, hright, hleft⟩
    · simp [h0, hleft]
    · simp [h0, hleft, hright]
    · simp [h0, hleft, hright]
