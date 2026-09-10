import Rule30.Basic

/-!
**What this says.** When the centre cell is white at time t, column 1 at time t+1 equals column 1 OR column 2 at time t.
**Why it is true.** Rule 30 at position 1 reads: column 1 at t+1 = centre at t XOR (column 1 at t OR column 2 at t). A white centre (false) makes the xor transparent.
**Where the work is.** Unfolding and applying rule30_eq at position 1, then simplifying false XOR with the whiteness hypothesis.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_one_succ_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
  column X 1 (t + 1) = (column X 1 t || column X 2 t)
```
-/

theorem column_one_succ_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
    column X 1 (t + 1) = (column X 1 t || column X 2 t) := by
  unfold column at h ⊢
  rw [evolveFrom_succ]
  have rule := rule30_eq (evolveFrom X t) 1
  rw [rule]
  show (evolveFrom X t (1 - 1) ^^ (evolveFrom X t 1 || evolveFrom X t (1 + 1))) = (evolveFrom X t 1 || evolveFrom X t 2)
  have h0 : evolveFrom X t (1 - 1) = false := by simp; exact h
  rw [h0]
  have h2 : evolveFrom X t (1 + 1) = evolveFrom X t 2 := by simp
  rw [h2]
  cases (evolveFrom X t 1) <;> cases (evolveFrom X t 2) <;> rfl
