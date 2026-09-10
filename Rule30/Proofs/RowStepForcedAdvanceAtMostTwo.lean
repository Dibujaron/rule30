import Rule30.Basic

/-!
**What this says.** The agreement front advances at most two bits per row, never three:
two numbers agreeing mod 4 with the right bits can propagate their agreement through
rowStep to mod 16, but not mod 32.
**Why it is true.** A concrete witness: 11 and 15 agree mod 4, satisfy the +2 advance
condition (a 1 0 1 pattern), their images agree mod 16, and disagree mod 32.
**Where the work is.** Verifying six concrete Boolean equalities and one inequality
by kernel computation.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowStep_forced_advance_at_most_two :
  11 % 2 ^ 2 = 15 % 2 ^ 2 ∧
    Nat.testBit 11 1 = true ∧
      Nat.testBit 11 2 = false ∧
        Nat.testBit 15 2 = true ∧
          Nat.testBit 11 3 = true ∧ rowStep 11 % 2 ^ 4 = rowStep 15 % 2 ^ 4 ∧ rowStep 11 % 2 ^ 5 ≠ rowStep 15 % 2 ^ 5
```
-/

theorem rowStep_forced_advance_at_most_two :
    (11 : ℕ) % 2 ^ 2 = (15 : ℕ) % 2 ^ 2 ∧
    (11 : ℕ).testBit 1 = true ∧ (11 : ℕ).testBit 2 = false ∧
    (15 : ℕ).testBit 2 = true ∧ (11 : ℕ).testBit 3 = true ∧
    rowStep 11 % 2 ^ 4 = rowStep 15 % 2 ^ 4 ∧
    rowStep 11 % 2 ^ 5 ≠ rowStep 15 % 2 ^ 5 := by
  decide
