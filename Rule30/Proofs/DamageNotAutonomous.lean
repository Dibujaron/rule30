import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** Two configurations whose XOR difference is identical everywhere can have different XOR differences one step later — the difference pattern does not evolve autonomously.
**Why it is true.** Construct four explicit configurations: two all-white or single-bit patterns that agree on their pairwise XOR, then use rule30_eq to show their successors' XOR differs at one position.
**Where the work is.** The case split proving the difference is uniform, then norm_num to verify the rule30_eq calculation at one position.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.damage_not_autonomous :
  ∃ X Y X' Y',
    (∀ (i : ℤ), (X i ^^ Y i) = (X' i ^^ Y' i)) ∧ ∃ i, (rule30 X i ^^ rule30 Y i) ≠ (rule30 X' i ^^ rule30 Y' i)
```
-/

theorem damage_not_autonomous :
    ∃ X Y X' Y' : Config, (∀ i, xor (X i) (Y i) = xor (X' i) (Y' i)) ∧
      ∃ i, xor (rule30 X i) (rule30 Y i) ≠ xor (rule30 X' i) (rule30 Y' i) := by
  refine ⟨fun _ => false, fun i => decide (i = 0), fun i => decide (i = 1),
    fun i => decide (i = 0) || decide (i = 1), ?_, 0, ?_⟩
  · intro i
    by_cases h0 : i = 0
    · subst h0; simp
    · by_cases h1 : i = 1
      · subst h1; simp
      · simp [h0, h1]
  · simp only [rule30_eq]
    norm_num
