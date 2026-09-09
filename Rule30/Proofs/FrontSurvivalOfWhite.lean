import Rule30.Basic

/-!
**What this says.** When the background is white (false) at the damage front, the front simply advances: the disagreement at i propagates to i+1 as the negation of the background's next cell.
**Why it is true.** Applying rule30_eq to both configurations, the white cell at d i makes its local rule trivial, and comparing the two outputs reduces to comparing cells at i-1 where they agree and i+1 where we want the result.
**Where the work is.** Unfolding rule30_eq and cancelling the XOR of complementary cells (c i and d i) in the symmetric part.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.front_survival_of_white (c d : Config) (i : ℤ) (hl : c (i - 1) = d (i - 1)) (hc : c i = !d i)
  (h0 : d i = false) : (rule30 c i ^^ rule30 d i) = !d (i + 1)
```
-/

theorem front_survival_of_white (c d : Config) (i : ℤ)
    (hl : c (i - 1) = d (i - 1)) (hc : c i = ! d i) (h0 : d i = false) :
    xor (rule30 c i) (rule30 d i) = ! d (i + 1) := by
  rw [rule30_eq, rule30_eq]
  rw [h0]
  rw [hl]
  simp [hc, h0]
