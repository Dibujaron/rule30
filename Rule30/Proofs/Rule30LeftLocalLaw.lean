import Rule30.Basic

/-!
**What this says.** With agreement at i-2 and i-1 but a difference at i, the rule 30 outputs at i-1 differ if and only if the cell at i-1 is white.
**Why it is true.** The OR of c(i-1) and the right cell c i decides whether the third argument to rule30_eq changes when c and d swap at position i. When c(i-1) is true, the OR is always true; when false, it takes the right cell's value.
**Where the work is.** Applying rule30_eq at position i-1 to both rows, and using that c (i-1) || c i differs from c (i-1) || d i exactly when c(i-1) is false (given that c i ≠ d i).

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rule30_left_local_law (c d : Config) (i : ℤ) (h2 : c (i - 2) = d (i - 2)) (h1 : c (i - 1) = d (i - 1))
  (h0 : c i ≠ d i) : rule30 c (i - 1) ≠ rule30 d (i - 1) ↔ c (i - 1) = false
```
-/

theorem rule30_left_local_law (c d : Config) (i : ℤ)
    (h2 : c (i - 2) = d (i - 2)) (h1 : c (i - 1) = d (i - 1)) (h0 : c i ≠ d i) :
    (rule30 c (i - 1) ≠ rule30 d (i - 1)) ↔ c (i - 1) = false := by
  have e2 : i - 1 - 1 = i - 2 := by omega
  have e1 : i - 1 + 1 = i := by omega
  rw [rule30_eq, rule30_eq, e2, e1, ← h2, ← h1]
  cases hci : c i <;> cases hdi : d i <;> cases hc1 : c (i - 1) <;> cases hc2 : c (i - 2) <;>
    simp_all
