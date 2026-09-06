import Rule30.Basic
import Mathlib.Tactic.Ring

theorem evolve_left_diagonal_recurrence (m i : ℕ) :
    evolve (i + m + 3) (-((i : ℤ) + 1))
      = xor (evolve (i + m + 2) (-((i : ℤ) + 2)))
          (evolve (i + m + 2) (-((i : ℤ) + 1)) || evolve (i + m + 2) (-(i : ℤ))) := by
  rw [show i + m + 3 = (i + m + 2) + 1 from by omega, evolve_succ, rule30_eq]
  simp only [show -(↑i + 1 : ℤ) - 1 = -(↑i + 2 : ℤ) from by ring,
             show -(↑i + 1 : ℤ) + 1 = -(↑i : ℤ) from by ring]
