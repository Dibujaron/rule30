import Rule30.Basic

/-!
**What this says.** At a white centre cell, column 1 is determined entirely by
its two temporal and spatial neighbours: the complement of the centre next step
and the cell to the left.
**Why it is true.** Rule 30 reads three cells, left-centre-right. When the
centre is white, the rule simplifies to xor (left) (right), which reads the
left as the complement of the next centre and leaves column 1 as the xor.
**Where the work is.** One unfold of rule30_eq, three rewrites, and a bool
simplification.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.col_one_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
  column X 1 t = (column X 0 (t + 1) ^^ column X (-1) t)
```
-/

theorem col_one_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
    column X 1 t = xor (column X 0 (t + 1)) (column X (-1) t) := by
  unfold column at h ⊢
  rw [evolveFrom_succ, rule30_eq]
  rw [h]
  -- After the rewrites, goal has arithmetic on integers that needs simplification
  simp only [Bool.false_or, show (0 : ℤ) - 1 = -1 by decide, show (0 : ℤ) + 1 = 1 by decide]
  -- Goal is now: evolveFrom X t 1 = evolveFrom X t (-1) ^^ evolveFrom X t 1 ^^ evolveFrom X t (-1)
  cases evolveFrom X t 1 <;> cases evolveFrom X t (-1) <;> rfl
