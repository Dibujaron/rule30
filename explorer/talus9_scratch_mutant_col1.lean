/-
Talus, 2026-09-12.  Mutant beside `talus9_scratch_rule90.lean`.

The real claim is `E t 1 = true ↔ ∃ j, 1 ≤ j ∧ t + 1 = 2 ^ j`.  The obvious
simplification is to drop `1 ≤ j` -- "t + 1 is a power of two" reads better and
is what the script's `isPowerOfTwo(t + 1)` looks like at a glance.  This file is
the demonstration that the bound is load-bearing, and it is deliberately an
ACCEPTED file proving the mutant statement FALSE rather than a rejected one: a
rejected theorem shows only that one proof did not go through.

At `t = 0` the cell one place right of the origin is white (nothing has moved
yet) while `0 + 1 = 2 ^ 0`.  So the mutant's `iff` fails, at the very first row.

Run with `lake env lean explorer/talus9_scratch_mutant_col1.lean`.
-/
import Rule30.Basic
import Mathlib.Tactic

namespace Talus9Mut

def rule90 : Config → Config := ElementaryCA.step 90

def E (t : ℕ) : Config := rule90^[t] initialConfig

/-- The kernel reads the cell: white. -/
theorem E_zero_one : E 0 1 = false := by decide

/-- And `0 + 1` is a power of two, with exponent `0`. -/
theorem pow_witness : ∃ j, 0 + 1 = 2 ^ j := ⟨0, rfl⟩

/-- So the closed form **without** `1 ≤ j` is false, at `t = 0`. -/
theorem mutant_false : ¬ (E 0 1 = true ↔ ∃ j, 0 + 1 = 2 ^ j) := by
  intro h
  have := h.2 pow_witness
  rw [E_zero_one] at this
  exact Bool.false_ne_true this

/-- For contrast, the true statement's right-hand side really does fail at `t = 0`:
no power of two with exponent at least one equals `1`. -/
theorem real_rhs_false_at_zero : ¬ ∃ j, 1 ≤ j ∧ 0 + 1 = 2 ^ j := by
  rintro ⟨j, hj, hje⟩
  have : (2 : ℕ) ∣ 2 ^ j := dvd_pow_self 2 (by omega)
  omega

#print axioms mutant_false

end Talus9Mut
