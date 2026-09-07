import Rule30.Basic

/-!
**What this says.** Feeding the left half-line model its own true boundary — the centre column, and the true row of cells at `x ≤ -1` at time `0` — reproduces exactly the left half of the same picture, at every position and every time.
**Why it is true.** Both sides satisfy the same rule-30 recurrence step for step; matching them is `rule30_eq` unfolded once per step of `t`, with the base case being that a row at time `0` is itself.
**Where the work is.** Lining up `evolveHalfLeft`'s own two-cell-ahead recursion in `k` against the `-1, 0, +1` neighbours `rule30_eq` produces is a handful of `omega`-closed position identities, not a new idea.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveHalfLeft_eq_column (X : Config) (t k : ℕ) :
  evolveHalfLeft (column X 0) (fun k => X (-(↑k + 1))) t k = column X (-(↑k + 1)) t
```
-/

theorem evolveHalfLeft_eq_column (X : Config) (t k : ℕ) :
    evolveHalfLeft (column X 0) (fun k => X (-((k : ℤ) + 1))) t k
      = column X (-((k : ℤ) + 1)) t := by
  induction t generalizing k with
  | zero => rfl
  | succ t ih =>
    have hstep : ∀ i : ℤ, column X i (t + 1)
        = xor (column X (i - 1) t) (column X i t || column X (i + 1) t) := by
      intro i
      show evolveFrom X (t + 1) i = _
      rw [evolveFrom_succ, rule30_eq]
      rfl
    cases k with
    | zero =>
      simp only [evolveHalfLeft]
      rw [ih, ih, hstep]
      have h0 : (-(((0 : ℕ) : ℤ) + 1) - 1 : ℤ) = -(((1 : ℕ) : ℤ) + 1) := by omega
      have h1 : (-(((0 : ℕ) : ℤ) + 1) + 1 : ℤ) = 0 := by omega
      rw [h0, h1]
    | succ k =>
      simp only [evolveHalfLeft]
      rw [ih, ih, ih, hstep]
      have h0 : (-(((k + 1 : ℕ) : ℤ) + 1) - 1 : ℤ) = -(((k + 2 : ℕ) : ℤ) + 1) := by omega
      have h1 : (-(((k + 1 : ℕ) : ℤ) + 1) + 1 : ℤ) = -(((k : ℕ) : ℤ) + 1) := by omega
      rw [h0, h1]
