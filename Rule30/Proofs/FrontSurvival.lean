import Rule30.Basic

/-!
**What this says.** When two configurations agree left of a difference and disagree at it, their rule 30 evolution is determined by three cells: the disagreement at the current position, the background's next cell, and the pictures' agreement one cell right.

**Why it is true.** Rule 30 is a function of three neighbours, so applying it to two differing configurations gives a formula in the difference pattern.

**Where the work is.** Unfolding rule30_eq on both configurations and simplifying the Boolean algebra with the hypotheses.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.front_survival (c d : Config) (i : ℤ) (hl : c (i - 1) = d (i - 1)) (hc : c i = !d i) :
  (rule30 c i ^^ rule30 d i) = (!d (i + 1) ^^ d i && (c (i + 1) ^^ d (i + 1)))
```
-/

theorem front_survival (c d : Config) (i : ℤ)
    (hl : c (i - 1) = d (i - 1)) (hc : c i = ! d i) :
    xor (rule30 c i) (rule30 d i)
      = xor (! d (i + 1)) (d i && xor (c (i + 1)) (d (i + 1))) := by
  -- Unfold rule30
  rw [rule30_eq, rule30_eq]
  -- Rewrite with the hypotheses
  rw [hl, hc]
  -- Case analysis on all the boolean values
  generalize hd : d i = bd
  generalize hc1 : c (i + 1) = bc1
  generalize hd1 : d (i + 1) = bd1
  generalize hd_1 : d (i - 1) = bd_1
  -- Now we have only concrete booleans: bd, bc1, bd1, bd_1
  cases bd <;> cases bc1 <;> cases bd1 <;> cases bd_1 <;> decide
