import Rule30.Basic

/-!
**What this says.** For any configuration, the left cell of any position equals the rule 30 update xor (the two right neighbors' or).
**Why it is true.** `rule30_eq` gives the forward direction; xor is self-inverse, so rearranging it gives the backward view.
**Where the work is.** Rewrite with rule30_eq and case-split on three booleans; reflexivity closes all eight cases.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.sideways_inverse (c : Config) (i : ℤ) : c (i - 1) = (rule30 c i ^^ (c i || c (i + 1)))
```
-/

theorem sideways_inverse (c : Config) (i : ℤ) :
    c (i - 1) = xor (rule30 c i) (c i || c (i + 1)) := by
  rw [rule30_eq]
  cases c (i - 1) <;> cases c i <;> cases c (i + 1) <;> simp
