import Rule30.Basic
import Rule30.Proofs.Rule30NeOfLeftNe

/-!
**What this says.** Rule 30 is left-permutive: changing only the left neighbour while keeping the centre and right fixed changes the output.
**Why it is true.** The rule depends on all three inputs in a way that makes the left neighbour distinguishable from the other two.
**Where the work is.** Unfolding the definition of LeftPermutive and applying the one-step lemma rule30_ne_of_left_ne to the window facts.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rule30_leftPermutive : LeftPermutive rule30 1
```
-/

theorem rule30_leftPermutive : LeftPermutive rule30 1 := by
  unfold LeftPermutive
  intro c d i hwnd hl
  exact rule30_ne_of_left_ne c d i hl (hwnd i (by omega) (by omega)) (hwnd (i + 1) (by omega) (by omega))
