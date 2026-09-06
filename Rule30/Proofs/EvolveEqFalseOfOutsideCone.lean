import Rule30.Basic
import Mathlib.Algebra.Order.Ring.Int

/-!
**What this says.** After `t` steps nothing is black further than `t` cells
from the centre. Information moves one cell per step, so that is as far as
it can have got.

**Why it is true.** Induction on `t`. A cell beyond the cone has all three
of its neighbours beyond the previous step's cone, so all three were white,
and rule 30 on three white cells gives white.

**Where the work is.** Almost all of it is the arithmetic of `|i|`. Showing
the three neighbours are still outside means case-splitting on the sign of
`i`, because absolute value behaves differently either side of zero.
-/

theorem evolve_eq_false_of_outside_cone (t : ℕ) (i : ℤ) (h : (t : ℤ) < |i|) :
    evolve t i = false := by
  induction t generalizing i with
  | zero =>
    show initialConfig i = false
    have hi : i ≠ 0 := by
      intro hi0
      rw [hi0] at h
      simp at h
    simp [initialConfig, hi]
  | succ n ih =>
    rw [evolve_succ, rule30_eq]
    have hn : (n : ℤ) < |i| := by
      have : ((n : ℤ) + 1) < |i| := by exact_mod_cast h
      omega
    have h1 : (n : ℤ) < |i - 1| := by
      rcases le_total 0 i with hpos | hneg
      · have : ((n : ℤ) + 1) < |i| := by exact_mod_cast h
        rw [abs_of_nonneg hpos] at this
        rcases le_total 1 i with h1' | h1'
        · rw [abs_of_nonneg (by omega : (0:ℤ) ≤ i - 1)]
          omega
        · rw [abs_of_nonpos (by omega : i - 1 ≤ 0)]
          omega
      · have : ((n : ℤ) + 1) < |i| := by exact_mod_cast h
        rw [abs_of_nonpos hneg] at this
        rw [abs_of_nonpos (by omega : i - 1 ≤ 0)]
        omega
    have h3 : (n : ℤ) < |i + 1| := by
      rcases le_total 0 i with hpos | hneg
      · have : ((n : ℤ) + 1) < |i| := by exact_mod_cast h
        rw [abs_of_nonneg hpos] at this
        rw [abs_of_nonneg (by omega : (0:ℤ) ≤ i + 1)]
        omega
      · have : ((n : ℤ) + 1) < |i| := by exact_mod_cast h
        rw [abs_of_nonpos hneg] at this
        rcases le_total i (-1) with h1' | h1'
        · rw [abs_of_nonpos (by omega : i + 1 ≤ 0)]
          omega
        · rw [abs_of_nonneg (by omega : (0:ℤ) ≤ i + 1)]
          omega
    rw [ih i hn, ih (i - 1) h1, ih (i + 1) h3]
    simp
