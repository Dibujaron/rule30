import Rule30.Basic
import Mathlib.Tactic.Ring

/-!
**What this says.** One step of rule 30 rewritten in diagonal coordinates:
an entry on a diagonal is fixed by the two shallower diagonals and by its
own previous entry, and by nothing deeper inside the cone.

**Why it is true.** It is the rule itself. Nothing is proved here that
`rule30_eq` does not already say; only the coordinates are renamed.

**Where the work is.** Nowhere, and that is the point. It costs one rewrite,
and every later diagonal proof cites it instead of re-deriving the
coordinate shift.
-/

theorem evolve_left_diagonal_recurrence (m i : ℕ) :
    evolve (i + m + 3) (-((i : ℤ) + 1))
      = xor (evolve (i + m + 2) (-((i : ℤ) + 2)))
          (evolve (i + m + 2) (-((i : ℤ) + 1)) || evolve (i + m + 2) (-(i : ℤ))) := by
  rw [show i + m + 3 = (i + m + 2) + 1 from by omega, evolve_succ, rule30_eq]
  simp only [show -(↑i + 1 : ℤ) - 1 = -(↑i + 2 : ℤ) from by ring,
             show -(↑i + 1 : ℤ) + 1 = -(↑i : ℤ) from by ring]
