import Rule30.Basic

/-!
**What this says.** Three white centre cells forbid the left neighbour from going
black-then-white: with centre white at t, t+1, t+2 and column -1 black at t, it
must remain black at t+1.

**Why it is true.** A double-white rule 30 step determines the next centre cell
from column -1: when the centre is white at both t and t+1, the value at t+2 is
the negation of the next value of column -1. Since we are given the centre is
white at t+2, column -1 at t+1 must be black.

**Where the work is.** Establishing the double-white determining rule and then
reducing the system to a case split on the colour of column -1 at t+1.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.white_run_forbidden (X : Config) (t : ℕ) (h0 : column X 0 t = false) (h1 : column X 0 (t + 1) = false)
  (h2 : column X 0 (t + 2) = false) (hm : column X (-1) t = true) : column X (-1) (t + 1) = true
```
-/

private theorem col_succ_at (X : Config) (i : ℤ) (t : ℕ) :
    column X i (t + 1) = xor (column X (i - 1) t) (column X i t || column X (i + 1) t) := by
  show evolveFrom X (t + 1) i = _
  rw [evolveFrom_succ, rule30_eq]
  rfl

private theorem col0_succ (X : Config) (t : ℕ) :
    column X 0 (t + 1) = xor (column X (-1) t) (column X 0 t || column X 1 t) := by
  have h := col_succ_at X 0 t
  rw [show ((0 : ℤ) - 1) = -1 from by decide, show ((0 : ℤ) + 1) = 1 from by decide] at h
  exact h

private theorem col1_succ (X : Config) (t : ℕ) :
    column X 1 (t + 1) = xor (column X 0 t) (column X 1 t || column X 2 t) := by
  have h := col_succ_at X 1 t
  rw [show ((1 : ℤ) - 1) = 0 from by decide, show ((1 : ℤ) + 1) = 2 from by decide] at h
  exact h

private theorem col_one_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
    column X 1 t = xor (column X 0 (t + 1)) (column X (-1) t) := by
  have h0 := col0_succ X t
  rw [h] at h0
  rw [h0]
  cases hA : column X (-1) t <;> cases hB : column X 1 t <;> simp [hA, hB]

private theorem white_run_monotone (X : Config) (t : ℕ) (h : column X 0 t = false)
    (h1 : column X 1 t = true) : column X 1 (t + 1) = true := by
  have hs := col1_succ X t
  rw [h, h1] at hs
  rw [hs]
  simp

private theorem centre_forced_after_double_white (X : Config) (t : ℕ)
    (h0 : column X 0 t = false) (h1 : column X 0 (t + 1) = false)
    (hm : column X (-1) t = true) :
    column X 0 (t + 2) = !(column X (-1) (t + 1)) := by
  have e1 : column X 1 t = true := by
    rw [col_one_of_white X t h0, h1, hm]; rfl
  have e2 : column X 1 (t + 1) = true := white_run_monotone X t h0 e1
  have hs := col0_succ X (t + 1)
  rw [h1, e2] at hs
  show column X 0 (t + 1 + 1) = _
  rw [hs]
  cases hD : column X (-1) (t + 1) <;> simp [hD]

theorem white_run_forbidden (X : Config) (t : ℕ)
    (h0 : column X 0 t = false) (h1 : column X 0 (t + 1) = false)
    (h2 : column X 0 (t + 2) = false) (hm : column X (-1) t = true) :
    column X (-1) (t + 1) = true := by
  have hf := centre_forced_after_double_white X t h0 h1 hm
  rw [h2] at hf
  cases hx : column X (-1) (t + 1) <;> simp [hx] at hf ⊢
