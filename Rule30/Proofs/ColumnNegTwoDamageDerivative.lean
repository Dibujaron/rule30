import Rule30.Basic

/-!
**What this says.** If two pictures agree at the origin at times t and t+1,
their column -2 disagreement at time t is the xor of their column -1
disagreement read at t and at t+1 — a discrete derivative.
**Why it is true.** Rule 30 at -1 gives column -2 in terms of column -1 one
step later and column 0; substituting turns the goal into a pure Boolean
identity that holds outright when the shared origin cell is white, and needs
the t+1 agreement to force the two column -1 cells equal when it is black.
**Where the work is.** The case split on the shared origin cell's colour: only
the black case actually consumes h1, via rule30 at the origin.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_neg_two_damage_derivative (X Y : Config) (t : ℕ) (h0 : column X 0 t = column Y 0 t)
  (h1 : column X 0 (t + 1) = column Y 0 (t + 1)) :
  (column X (-2) t ^^ column Y (-2) t) =
    (column X (-1) t ^^ column Y (-1) t ^^ (column X (-1) (t + 1) ^^ column Y (-1) (t + 1)))
```
-/

theorem column_neg_two_damage_derivative (X Y : Config) (t : ℕ)
    (h0 : column X 0 t = column Y 0 t)
    (h1 : column X 0 (t + 1) = column Y 0 (t + 1)) :
    xor (column X (-2) t) (column Y (-2) t)
      = xor (xor (column X (-1) t) (column Y (-1) t))
          (xor (column X (-1) (t + 1)) (column Y (-1) (t + 1))) := by
  have stepX0 : column X 0 (t + 1) = xor (column X (-1) t) (column X 0 t || column X 1 t) := by
    unfold column
    rw [evolveFrom_succ]
    have heq := rule30_eq (evolveFrom X t) 0
    simp only [Int.zero_sub, Int.zero_add] at heq
    exact heq
  have stepY0 : column Y 0 (t + 1) = xor (column Y (-1) t) (column Y 0 t || column Y 1 t) := by
    unfold column
    rw [evolveFrom_succ]
    have heq := rule30_eq (evolveFrom Y t) 0
    simp only [Int.zero_sub, Int.zero_add] at heq
    exact heq
  have stepXm1 : column X (-1) (t + 1) = xor (column X (-2) t) (column X (-1) t || column X 0 t) := by
    unfold column
    rw [evolveFrom_succ]
    have heq := rule30_eq (evolveFrom X t) (-1)
    have e1 : (-1 - 1 : ℤ) = -2 := by decide
    have e2 : (-1 + 1 : ℤ) = 0 := by decide
    rw [e1, e2] at heq
    exact heq
  have stepYm1 : column Y (-1) (t + 1) = xor (column Y (-2) t) (column Y (-1) t || column Y 0 t) := by
    unfold column
    rw [evolveFrom_succ]
    have heq := rule30_eq (evolveFrom Y t) (-1)
    have e1 : (-1 - 1 : ℤ) = -2 := by decide
    have e2 : (-1 + 1 : ℤ) = 0 := by decide
    rw [e1, e2] at heq
    exact heq
  rw [h0] at stepX0 stepXm1
  rw [stepX0, stepY0] at h1
  have keyX : column X (-2) t = xor (column X (-1) (t + 1)) (column X (-1) t || column Y 0 t) := by
    have h := stepXm1
    revert h
    generalize column X (-1) (t + 1) = p
    generalize column X (-2) t = P
    generalize (column X (-1) t || column Y 0 t) = C
    intro h
    cases p <;> cases P <;> cases C <;> revert h <;> decide
  have keyY : column Y (-2) t = xor (column Y (-1) (t + 1)) (column Y (-1) t || column Y 0 t) := by
    have h := stepYm1
    revert h
    generalize column Y (-1) (t + 1) = p
    generalize column Y (-2) t = P
    generalize (column Y (-1) t || column Y 0 t) = C
    intro h
    cases p <;> cases P <;> cases C <;> revert h <;> decide
  rw [keyX, keyY]
  cases hcase : column Y 0 t with
  | true =>
      have hab : column X (-1) t = column Y (-1) t := by
        rw [hcase] at h1
        revert h1
        generalize column X (-1) t = a
        generalize column Y (-1) t = a'
        generalize column X 1 t = c1
        generalize column Y 1 t = c1'
        intro h1
        cases a <;> cases a' <;> cases c1 <;> cases c1' <;> revert h1 <;> decide
      rw [hab]
      generalize column Y (-1) t = a
      generalize column X (-1) (t + 1) = p
      generalize column Y (-1) (t + 1) = p'
      cases a <;> cases p <;> cases p' <;> decide
  | false =>
      generalize column X (-1) t = a
      generalize column Y (-1) t = a'
      generalize column X (-1) (t + 1) = p
      generalize column Y (-1) (t + 1) = p'
      cases a <;> cases a' <;> cases p <;> cases p' <;> decide
