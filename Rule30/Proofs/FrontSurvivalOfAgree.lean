import Rule30.Basic

/-!
**What this says.** When two configurations agree on either side of a single disagreement, their rule 30 outputs differ by the negation of the right background cell.

**Why it is true.** One step of the rule at position i: the left and right neighbors agree, so the rule output depends only on whether the center is flipped, determining the XOR difference.

**Where the work is.** Case analysis on two Boolean values: the background's right cell, and whether it's true or false in the negated configuration.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.front_survival_of_agree (c d : Config) (i : ℤ) (hl : c (i - 1) = d (i - 1)) (hc : c i = !d i)
  (h1 : c (i + 1) = d (i + 1)) : (rule30 c i ^^ rule30 d i) = !d (i + 1)
```
-/

theorem front_survival_of_agree (c d : Config) (i : ℤ)
    (hl : c (i - 1) = d (i - 1)) (hc : c i = ! d i) (h1 : c (i + 1) = d (i + 1)) :
    xor (rule30 c i) (rule30 d i) = ! d (i + 1) := by
  rw [rule30_eq, rule30_eq]
  rw [hl, h1, hc]
  -- Now we have: xor (xor (d(i-1)) (!d i || d(i+1))) (xor (d(i-1)) (d i || d(i+1))) = !d(i+1)
  -- Case on d(i-1), d i, and d(i+1) to verify Boolean identity
  cases hd_prev : d (i - 1) <;> cases hd : d i <;> cases h1' : d (i + 1) <;> decide
