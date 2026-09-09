import Rule30.Basic

/-!
**What this says.** A cell turns black next step exactly when it sits at a run
boundary — one of three local edge patterns in the current row.
**Why it is true.** Rule 30's definition as XOR of left-neighbor with (center OR
right-neighbor) reduces to these three cases by Bool case analysis.
**Where the work is.** Unpacking the XOR equivalence into run-boundary form; the
eight possible inputs make sixteen one-bit checks.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rule30_run_boundary (c : Config) (i : ℤ) :
  rule30 c i = true ↔
    c i = true ∧ c (i - 1) = false ∨
      c i = false ∧ c (i - 1) = true ∧ c (i + 1) = false ∨ c i = false ∧ c (i + 1) = true ∧ c (i - 1) = false
```
-/

theorem rule30_run_boundary (c : Config) (i : ℤ) :
    rule30 c i = true ↔
      (c i = true ∧ c (i - 1) = false) ∨
      (c i = false ∧ c (i - 1) = true ∧ c (i + 1) = false) ∨
      (c i = false ∧ c (i + 1) = true ∧ c (i - 1) = false) := by
  rw [rule30_eq]
  cases c (i - 1) <;> cases c i <;> cases c (i + 1) <;> decide
