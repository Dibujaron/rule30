import Rule30.Basic
import Mathlib.Tactic.Ring

/-!
**What this says.** One step of Rule 30 commutes with a spatial translation: applying the rule to a shifted configuration and then reading at one position gives the same result as applying the rule first and reading at a shifted position.

**Why it is true.** The rule's definition depends only on three consecutive cell values in order, with no reference to the origin. Shifting the configuration left or right by *s* shifts the inputs to the rule by the same amount, and shifting the output position by *s* compensates.

**Where the work is.** None — unfold `rule30_eq` to expose the three-cell dependence, then two `ring` rewrites align the index arithmetic.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rule30_translate (c : Config) (s i : ℤ) : rule30 (fun x => c (x + s)) i = rule30 c (i + s)
```
-/

theorem rule30_translate (c : Config) (s i : ℤ) :
    rule30 (fun x => c (x + s)) i = rule30 c (i + s) := by
  simp only [rule30_eq]
  have h1 : i - 1 + s = i + s - 1 := by ring
  have h2 : i + 1 + s = i + s + 1 := by ring
  rw [h1, h2]
