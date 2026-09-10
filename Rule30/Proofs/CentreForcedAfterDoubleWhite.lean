import Rule30.Basic

/-!
**What this says.** Two white centre cells in a row, with a black cell just left of the first one, force the centre cell after them: it must be the complement of whatever sits just left of the middle cell.
**Why it is true.** The white-time twin of `column_succ_of_black`: one step of the rule at the origin, fed the hypotheses, pins column 1 to black at both the first and the second time, and a black column 1 turns the next centre update into a plain negation.
**Where the work is.** Chasing column 1 forward through two consecutive steps before the final negation appears; each step is one unfolding of `rule30_eq` and a Bool case split.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centre_forced_after_double_white (X : Config) (t : ℕ) (h0 : column X 0 t = false)
  (h1 : column X 0 (t + 1) = false) (hm : column X (-1) t = true) : column X 0 (t + 2) = !column X (-1) (t + 1)
```
-/

theorem centre_forced_after_double_white (X : Config) (t : ℕ)
    (h0 : column X 0 t = false) (h1 : column X 0 (t + 1) = false)
    (hm : column X (-1) t = true) :
    column X 0 (t + 2) = !(column X (-1) (t + 1)) := by
  have step : ∀ (s : ℕ) (i : ℤ), column X i (s + 1) =
      xor (column X (i - 1) s) (column X i s || column X (i + 1) s) := by
    intro s i
    unfold column
    rw [evolveFrom_succ, rule30_eq]
  have e0 := step t 0
  rw [show (0 : ℤ) - 1 = -1 from by omega, show (0 : ℤ) + 1 = 1 from by omega] at e0
  rw [h0, h1, hm] at e0
  have h1t : column X 1 t = true := by
    revert e0; cases column X 1 t <;> decide
  have e1 := step t 1
  rw [show (1 : ℤ) - 1 = 0 from by omega, show (1 : ℤ) + 1 = 2 from by omega] at e1
  rw [h0, h1t] at e1
  have hor1 : (true || column X 2 t) = true := by
    cases column X 2 t <;> rfl
  rw [hor1] at e1
  have h1t1 : column X 1 (t + 1) = true := by rw [e1]; decide
  have e2 := step (t + 1) 0
  rw [show (0 : ℤ) - 1 = -1 from by omega, show (0 : ℤ) + 1 = 1 from by omega] at e2
  rw [h1, h1t1, show t + 1 + 1 = t + 2 from by omega] at e2
  rw [e2]
  cases column X (-1) (t + 1) <;> decide
