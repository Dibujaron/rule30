import Rule30.Basic

/-!
**What this says.** If two pictures agree in the centre column at times t and
t+1, the disagreement one cell left of the origin at time t can only be
non-white when the centre cell there is white, and then it exactly tracks the
disagreement one cell right of the origin.
**Why it is true.** Rule 30 at the origin reads the new centre cell from the
three cells left, centre and right at time t; a black centre swallows the
"or" and pins both pictures' next centre cells to the negation of their
column -1 cells, forcing those to agree, while a white centre exposes column
1 as the other free input, so the two disagreements must match exactly.
**Where the work is.** Turning the one XOR identity at the origin into this
shape is a sixteen-case Boolean check once both pictures' identities are laid
side by side; nothing here needs induction.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_neg_one_damage_mask (X Y : Config) (t : ℕ) (h0 : column X 0 t = column Y 0 t)
  (h1 : column X 0 (t + 1) = column Y 0 (t + 1)) :
  (column X (-1) t ^^ column Y (-1) t) = (!column X 0 t && (column X 1 t ^^ column Y 1 t))
```
-/

theorem column_neg_one_damage_mask (X Y : Config) (t : ℕ)
    (h0 : column X 0 t = column Y 0 t)
    (h1 : column X 0 (t + 1) = column Y 0 (t + 1)) :
    xor (column X (-1) t) (column Y (-1) t)
      = ((! column X 0 t) && xor (column X 1 t) (column Y 1 t)) := by
  have stepX : column X 0 (t + 1) = xor (column X (-1) t) (column X 0 t || column X 1 t) := by
    unfold column
    rw [evolveFrom_succ]
    have heq := rule30_eq (evolveFrom X t) 0
    simp only [Int.zero_sub, Int.zero_add] at heq
    exact heq
  have stepY : column Y 0 (t + 1) = xor (column Y (-1) t) (column Y 0 t || column Y 1 t) := by
    unfold column
    rw [evolveFrom_succ]
    have heq := rule30_eq (evolveFrom Y t) 0
    simp only [Int.zero_sub, Int.zero_add] at heq
    exact heq
  rw [stepX, stepY, h0] at h1
  rw [h0]
  revert h1
  generalize column X (-1) t = A
  generalize column Y (-1) t = A'
  generalize column Y 0 t = B
  generalize column X 1 t = C
  generalize column Y 1 t = C'
  intro h1
  cases A <;> cases A' <;> cases B <;> cases C <;> cases C' <;> revert h1 <;> decide
