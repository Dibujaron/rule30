import Rule30.Strip
import Mathlib.Tactic.SplitIfs

/-!
**What this says.** A strip of columns advances by one rule-30 step, driven by
its current snapshot plus the two cells just outside its left and right ends.
**Why it is true.** Every cell of `strip` is `evolve` at some column, so one
step of `strip` is one step of `evolve`, which is `rule30_eq`; the boundary
cells of `stripStep` read those same outside columns by construction.
**Where the work is.** Matching `stripStep`'s dependent-`if` boundary reads
(a `Fin` index shifted by one, cast back to `ℤ`) against the plain integer
shift `i + k ± 1` that `evolve_succ`/`rule30_eq` produce for that same cell.
-/

theorem strip_succ (i : ℤ) (w t : ℕ) :
    strip i w (t + 1) = stripStep w (evolve t (i - 1)) (evolve t (i + w + 1)) (strip i w t) := by
  funext k
  simp only [strip, stripStep, evolve_succ, rule30_eq]
  have hleft :
      (if h : (k : ℕ) = 0 then evolve t (i - 1)
        else evolve t (i + (((k : ℕ) - 1 : ℕ) : ℤ))) = evolve t (i + (k : ℕ) - 1) := by
    split_ifs with h <;> congr 1 <;> omega
  have hright :
      (if h : (k : ℕ) = w then evolve t (i + w + 1)
        else evolve t (i + (((k : ℕ) + 1 : ℕ) : ℤ))) = evolve t (i + (k : ℕ) + 1) := by
    split_ifs with h <;> congr 1 <;> omega
  rw [hleft, hright]
