import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** If the cells at 0, -1, ..., -(L+1) alternate
black-white-black... starting black, then after one step of rule 30 the
cells at 0, -1, ..., -L still alternate the same way: the block shrinks by
one cell per step.
**Why it is true.** Away from the origin this is `rule30_eq`'s three-cell
formula with each neighbour read off the hypothesis. At the origin itself
the centre cell is black, so the `OR` in the formula is forced true no
matter what sits at position 1 -- which the hypothesis says nothing about.
**Where the work is.** Splitting `j = 0` from `j = k + 1`: only the shifted
case needs real bookkeeping, and it collapses to one parity split on `k`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rule30_alternating_step (X : Config) (L : ℕ) (h : ∀ j < L + 2, X (-↑j) = decide (j % 2 = 0)) (j : ℕ) :
  j < L + 1 → rule30 X (-↑j) = decide (j % 2 = 0)
```
-/
theorem rule30_alternating_step (X : Config) (L : ℕ)
    (h : ∀ j < L + 2, X (-(j : ℤ)) = decide (j % 2 = 0)) :
    ∀ j < L + 1, rule30 X (-(j : ℤ)) = decide (j % 2 = 0) := by
  intro j hj
  match j, hj with
  | 0, _ =>
    have h0 : X (0 : ℤ) = true := by
      have h0' := h 0 (by omega)
      simpa using h0'
    have h1 : X (-1 : ℤ) = false := by
      have h1' := h 1 (by omega)
      simpa using h1'
    have e : (-(((0 : ℕ) : ℕ) : ℤ)) = (0 : ℤ) := by norm_num
    rw [e, rule30_eq]
    have em1 : (0 : ℤ) - 1 = (-1 : ℤ) := by norm_num
    have ep1 : (0 : ℤ) + 1 = (1 : ℤ) := by norm_num
    rw [em1, ep1, h0, h1]
    simp
  | k + 1, hj =>
    have ha := h (k + 2) (by omega)
    have hb := h (k + 1) (by omega)
    have hc := h k (by omega)
    have e1 : (-(((k + 1 : ℕ)) : ℤ)) - 1 = -(((k + 2 : ℕ)) : ℤ) := by push_cast; ring
    have e2 : (-(((k + 1 : ℕ)) : ℤ)) + 1 = -(((k : ℕ)) : ℤ) := by push_cast; ring
    rw [rule30_eq, e1, e2, ha, hb, hc]
    rcases Nat.mod_two_eq_zero_or_one k with hk | hk <;> simp [hk, Nat.add_mod]
