import Rule30.Basic
import Rule30.Proofs.CenterColumnCountSandwich
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Linarith

/-!
**What this says.** How far the centre column's black count strays from half the window cannot
move faster than the window itself: widening from M to N shifts it by at most N - M.
**Why it is true.** `centerColumnCount_sandwich` says the cells added between M and N contribute
somewhere between none of them and all of them, and either extreme moves the stray by N - M.
**Where the work is.** Nowhere deep: the one manual step is opening the absolute value by hand on
the sign of the stray at M, after which it is integer arithmetic.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_excess_interpolate (M N : ℕ) (h : M ≤ N) :
  |2 * ↑{n ∈ Finset.range N | centerColumn n = true}.card - ↑N| ≤
    |2 * ↑{n ∈ Finset.range M | centerColumn n = true}.card - ↑M| + (↑N - ↑M)
```
-/

theorem centerColumn_excess_interpolate (M N : ℕ) (h : M ≤ N) :
    |2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℤ) - (N : ℤ)| ≤
      |2 * (((Finset.range M).filter fun n => centerColumn n = true).card : ℤ) - (M : ℤ)|
        + ((N : ℤ) - (M : ℤ)) := by
  obtain ⟨hmono, hgrow⟩ := centerColumnCount_sandwich M N h
  set a := ((Finset.range M).filter fun n => centerColumn n = true).card with ha
  set b := ((Finset.range N).filter fun n => centerColumn n = true).card with hb
  have h1 : (a : ℤ) ≤ (b : ℤ) := by exact_mod_cast hmono
  have h2 : (b : ℤ) ≤ (a : ℤ) + ((N : ℤ) - (M : ℤ)) := by
    have hb' : (b : ℤ) ≤ (a : ℤ) + ((N - M : ℕ) : ℤ) := by exact_mod_cast hgrow
    rwa [Nat.cast_sub h] at hb'
  by_cases hs : (M : ℤ) ≤ 2 * (a : ℤ)
  · rw [abs_of_nonneg (by omega : (0 : ℤ) ≤ 2 * (a : ℤ) - (M : ℤ)), abs_le]
    constructor <;> omega
  · rw [abs_of_neg (by omega : 2 * (a : ℤ) - (M : ℤ) < 0), abs_le]
    constructor <;> omega
