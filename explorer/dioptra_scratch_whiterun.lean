/-
Dioptra, 2026-09-10.  Scratch check, not a seeded node.

The Meier-Staffelbach "0*1*" observation, in the project's vocabulary.

`white_run_monotone`   : across a white centre cell, column 1 cannot go back
                         from black to white.  This is the whole content of
                         "where the temporal sequence is a sequence of 0s, the
                         right-adjacent sequence must match 0*1*".

`centre_forced_after_double_white` : the companion of the board's
                         `column_succ_of_black`.  The black-time law reads the
                         next centre cell off column -1 whenever the centre is
                         black.  This one reads the centre cell TWO steps ahead
                         off column -1 whenever the centre is white twice in a
                         row and column -1 is black at the first of them.

`white_run_forbidden`  : the corollary as a forbidden block in the pair of
                         columns (0, -1), read down time.
-/
import Rule30.Basic

/-- One step at an arbitrary position, in terms of `column`. -/
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

/-- **At a white centre cell, column 1 equals column -1 xor the next centre
cell.**  (The board's `column_one_of_white`, re-derived here so this file
stands alone.) -/
theorem col_one_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
    column X 1 t = xor (column X 0 (t + 1)) (column X (-1) t) := by
  have h0 := col0_succ X t
  rw [h] at h0
  rw [h0]
  cases hA : column X (-1) t <;> cases hB : column X 1 t <;> simp [hA, hB]

/-- **A white centre cell makes column 1 non-decreasing.**  `col1(t+1) =
col1(t) || col2(t)`, so black at `t` forces black at `t + 1`.  This is the
`0*1*` law: on a run of white centre cells column 1 reads `0…01…1`. -/
theorem white_run_monotone (X : Config) (t : ℕ) (h : column X 0 t = false)
    (h1 : column X 1 t = true) : column X 1 (t + 1) = true := by
  have hs := col1_succ X t
  rw [h, h1] at hs
  rw [hs]
  simp

/-- **The white-time companion of the black-time law.**  If the centre is white
at `t` and at `t + 1`, and column `-1` is black at `t`, then the centre cell at
`t + 2` is the complement of column `-1` at `t + 1`.

Compare `column_succ_of_black`: at a *black* centre, `col0(t+1) = !col(-1)(t)`.
Together the two pin the centre column from column `-1` on strictly more times
than the black law alone. -/
theorem centre_forced_after_double_white (X : Config) (t : ℕ)
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

/-- **A forbidden block in the pair of columns `(0, -1)`, read down time.**
Three white centre cells in a row forbid column `-1` from going black then
white.  Immediate from the theorem above. -/
theorem white_run_forbidden (X : Config) (t : ℕ)
    (h0 : column X 0 t = false) (h1 : column X 0 (t + 1) = false)
    (h2 : column X 0 (t + 2) = false) (hm : column X (-1) t = true) :
    column X (-1) (t + 1) = true := by
  have hf := centre_forced_after_double_white X t h0 h1 hm
  rw [h2] at hf
  cases hx : column X (-1) (t + 1) <;> simp [hx] at hf ⊢

#print axioms centre_forced_after_double_white
#print axioms white_run_forbidden
#print axioms white_run_monotone
#print axioms col_one_of_white
