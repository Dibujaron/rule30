import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** Packing a row of the rule 30 picture into the bits of a single
number gives exactly the same colours as growing the picture cell by cell.
**Why it is true.** One step of rule 30 is `left XOR (centre OR right)`, and shifting a
number up a bit or two is exactly what "look one or two cells to the side" means.
**Where the work is.** The two ends, where the row grows by a cell each step: a bit that
runs off the number and a cell that runs out of the cone have to be the same cell.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowCell_eq_evolve (t : ℕ) (x : ℤ) : rowCell t x = evolve t x
```
-/

/-- One step of the packed row, read one bit at a time. -/
private theorem testBit_rowNat_succ (t b : ℕ) :
    (rowNat (t + 1)).testBit b
      = xor (decide (2 ≤ b) && (rowNat t).testBit (b - 2))
          ((decide (1 ≤ b) && (rowNat t).testBit (b - 1)) || (rowNat t).testBit b) := by
  have h4 : 4 * rowNat t = 2 ^ 2 * rowNat t := by norm_num
  have h2 : 2 * rowNat t = 2 ^ 1 * rowNat t := by norm_num
  rw [show rowNat (t + 1) = (4 * rowNat t) ^^^ ((2 * rowNat t) ||| rowNat t) from rfl,
    h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
    Nat.testBit_two_pow_mul]

/-- The packed row has no bits above the cone. -/
private theorem testBit_rowNat_of_ge : ∀ (t b : ℕ), 2 * t + 1 ≤ b → (rowNat t).testBit b = false := by
  intro t
  induction t with
  | zero =>
    intro b hb
    rw [show rowNat 0 = 1 from rfl]
    apply Nat.testBit_lt_two_pow
    calc (1 : ℕ) < 2 ^ 1 := by norm_num
      _ ≤ 2 ^ b := Nat.pow_le_pow_right (by norm_num) (by omega)
  | succ t ih =>
    intro b hb
    rw [testBit_rowNat_succ, ih b (by omega), ih (b - 1) (by omega), ih (b - 2) (by omega)]
    simp

/-- The right-hand cone test in `rowCell` is redundant: past the right edge the
number has no bit there anyway. -/
private theorem rowCell_eq_testBit (t : ℕ) (x : ℤ) :
    rowCell t x = (decide (-(t : ℤ) ≤ x) && (rowNat t).testBit (x + (t : ℤ)).toNat) := by
  simp only [rowCell]
  by_cases h1 : -(t : ℤ) ≤ x
  · by_cases h2 : x ≤ (t : ℤ)
    · rw [if_pos ⟨h1, h2⟩, decide_eq_true h1, Bool.true_and]
    · rw [if_neg (by omega), testBit_rowNat_of_ge t (x + (t : ℤ)).toNat (by omega)]
      simp
  · rw [if_neg (by omega), decide_eq_false h1, Bool.false_and]

/-- One step of rule 30, entirely inside the row model. -/
private theorem rowCell_succ (t : ℕ) (x : ℤ) :
    rowCell (t + 1) x = xor (rowCell t (x - 1)) (rowCell t x || rowCell t (x + 1)) := by
  simp only [rowCell_eq_testBit, Nat.cast_add, Nat.cast_one]
  by_cases hx : -((t : ℤ) + 1) ≤ x
  · have e0 : (x - 1 + (t : ℤ)).toNat = (x + ((t : ℤ) + 1)).toNat - 2 := by omega
    have e1 : (x + (t : ℤ)).toNat = (x + ((t : ℤ) + 1)).toNat - 1 := by omega
    have e2 : (x + 1 + (t : ℤ)).toNat = (x + ((t : ℤ) + 1)).toNat := by omega
    have d0 : decide (-((t : ℤ) + 1) ≤ x) = true := decide_eq_true hx
    have d1 : decide (-(t : ℤ) ≤ x - 1)
        = decide (2 ≤ (x + ((t : ℤ) + 1)).toNat) := decide_eq_decide.mpr (by omega)
    have d2 : decide (-(t : ℤ) ≤ x)
        = decide (1 ≤ (x + ((t : ℤ) + 1)).toNat) := decide_eq_decide.mpr (by omega)
    have d3 : decide (-(t : ℤ) ≤ x + 1) = true := decide_eq_true (by omega)
    rw [e0, e1, e2, d0, d1, d2, d3, testBit_rowNat_succ]
    simp
  · have d0 : decide (-((t : ℤ) + 1) ≤ x) = false := decide_eq_false hx
    have d1 : decide (-(t : ℤ) ≤ x - 1) = false := decide_eq_false (by omega)
    have d2 : decide (-(t : ℤ) ≤ x) = false := decide_eq_false (by omega)
    have d3 : decide (-(t : ℤ) ≤ x + 1) = false := decide_eq_false (by omega)
    rw [d0, d1, d2, d3]
    simp

theorem rowCell_eq_evolve (t : ℕ) (x : ℤ) : rowCell t x = evolve t x := by
  induction t generalizing x with
  | zero =>
    have hE : evolve 0 x = decide (x = 0) := rfl
    rw [hE]
    by_cases hx : x = 0
    · subst hx; rfl
    · simp only [rowCell, Nat.cast_zero]
      rw [if_neg (by omega)]
      simp [hx]
  | succ t ih =>
    rw [rowCell_succ, ih (x - 1), ih x, ih (x + 1), evolve_succ, rule30_eq]
