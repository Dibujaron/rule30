import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** Two natural numbers can agree on their low n bits but have rowStep images that disagree on bit n.

**Why it is true.** The row map carries information upward through the bits, so no fixed prefix is closed: x = 0 and y = 2^n agree mod 2^n, but rowStep(0) = 0 has bit n unset while rowStep(2^n) has it set.

**Where the work is.** Computing rowStep on powers of two and checking the bit pattern in the result.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowStep_prefix_minimal (n : ℕ) :
  ∃ x y, x % 2 ^ n = y % 2 ^ n ∧ rowStep x % 2 ^ (n + 1) ≠ rowStep y % 2 ^ (n + 1)
```
-/

theorem rowStep_prefix_minimal (n : ℕ) :
    ∃ x y : ℕ, x % 2 ^ n = y % 2 ^ n ∧
      rowStep x % 2 ^ (n + 1) ≠ rowStep y % 2 ^ (n + 1) := by
  refine ⟨0, 2 ^ n, by simp, ?_⟩
  have h0 : rowStep 0 = 0 := by simp [rowStep]
  have hy : rowStep (2 ^ n) = 2 ^ (n + 2) ^^^ (2 ^ (n + 1) ||| 2 ^ n) := by
    show 4 * 2 ^ n ^^^ (2 * 2 ^ n ||| 2 ^ n) = _
    ring_nf
  rw [h0, hy]
  simp only [Nat.zero_mod, ne_eq]
  intro hcon
  have hbit : ((2 ^ (n + 2) ^^^ (2 ^ (n + 1) ||| 2 ^ n) : ℕ) % 2 ^ (n + 1)).testBit n = true := by
    rw [Nat.testBit_mod_two_pow]
    simp [Nat.testBit_xor, Nat.testBit_or]
  rw [← hcon] at hbit
  simp at hbit
