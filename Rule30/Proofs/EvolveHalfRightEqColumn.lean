import Rule30.Basic
import Mathlib.Tactic.Ring

/-!
**What this says.** The right half-line, built only from the centre column and
row 0 of the right side, reproduces the picture's own columns at every
position `k + 1` and every time `t`.
**Why it is true.** Induction on `t`: `evolveFrom_succ` and `rule30_eq` unfold
one real step of the picture at position `k + 2` into the same three
neighbours the half-line's own recursion reads.
**Where the work is.** The `k = 0` branch reads the boundary `column X 0`
directly, where the `k + 1` branch reads three earlier half-line cells; both
land on `rule30_eq`'s three neighbours once the `ℕ`-to-`ℤ` casts line up.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveHalfRight_eq_column (X : Config) (t k : ℕ) :
  evolveHalfRight (column X 0) (fun k => X (↑k + 1)) t k = column X (↑k + 1) t
```
-/

theorem evolveHalfRight_eq_column (X : Config) (t k : ℕ) :
    evolveHalfRight (column X 0) (fun k => X ((k : ℤ) + 1)) t k
      = column X ((k : ℤ) + 1) t := by
  induction t generalizing k with
  | zero => simp only [evolveHalfRight, column, evolveFrom, Function.iterate_zero_apply]
  | succ t ih =>
    rcases k with _ | k
    · have hRHS : column X (((0 : ℕ) : ℤ) + 1) (t + 1)
          = xor (column X (((0 : ℕ) : ℤ) + 1 - 1) t)
              (column X (((0 : ℕ) : ℤ) + 1) t || column X (((0 : ℕ) : ℤ) + 1 + 1) t) := by
        unfold column
        rw [evolveFrom_succ, rule30_eq]
      simp only [evolveHalfRight, ih 0, ih 1, hRHS]
      rw [show ((0 : ℕ) : ℤ) + 1 - 1 = (0 : ℤ) from by push_cast,
          show ((1 : ℕ) : ℤ) + 1 = ((0 : ℕ) : ℤ) + 1 + 1 from by push_cast]
    · have hRHS : column X (((k + 1 : ℕ) : ℤ) + 1) (t + 1)
          = xor (column X (((k + 1 : ℕ) : ℤ) + 1 - 1) t)
              (column X (((k + 1 : ℕ) : ℤ) + 1) t
                || column X (((k + 1 : ℕ) : ℤ) + 1 + 1) t) := by
        unfold column
        rw [evolveFrom_succ, rule30_eq]
      simp only [evolveHalfRight, ih k, ih (k + 1), ih (k + 2), hRHS]
      rw [show (((k + 1 : ℕ) : ℤ) + 1 - 1 : ℤ) = ((k : ℕ) : ℤ) + 1 from by push_cast; ring,
          show (((k + 2 : ℕ) : ℤ) + 1 : ℤ) = (((k + 1 : ℕ) : ℤ) + 1 + 1) from by
            push_cast; ring]
