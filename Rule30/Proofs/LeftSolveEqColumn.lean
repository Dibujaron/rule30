import Rule30.Basic
import Rule30.Proofs.SidewaysInverse
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring

/-!
**What this says.** Rebuilding the picture leftward from columns 0 and 1
alone, one column per step, lands on the same picture the automaton itself
draws.
**Why it is true.** `sideways_inverse`, read at the row `evolveFrom X t` and
at the position the new column sits at, is exactly `leftSolve`'s own
recurrence, with `rule30 (evolveFrom X t)` renamed `evolveFrom X (t + 1)` by
`evolveFrom_succ`.
**Where the work is.** Two-step strong induction on `k`, carrying the goal
under `∀ t` since the `k + 2` case cites the `k + 1` hypothesis at both `t`
and `t + 1`; each case is one `sideways_inverse` instance plus a cast
rewrite lining its index up with the goal's.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftSolve_eq_column (X : Config) (k t : ℕ) : leftSolve (column X 0) (column X 1) k t = column X (-↑k) t
```
-/

theorem leftSolve_eq_column (X : Config) (k t : ℕ) :
    leftSolve (column X 0) (column X 1) k t = column X (-(k : ℤ)) t := by
  induction k using Nat.strong_induction_on generalizing t with
  | _ k ih =>
    match k, ih with
    | 0, _ =>
      rw [show -((0 : ℕ) : ℤ) = 0 from by norm_num]
      rfl
    | 1, _ =>
      show xor (column X 0 (t + 1)) (column X 0 t || column X 1 t)
          = column X (-((1 : ℕ) : ℤ)) t
      have h : evolveFrom X t (-((1 : ℕ) : ℤ))
          = xor (evolveFrom X (t + 1) 0) (evolveFrom X t 0 || evolveFrom X t 1) := by
        have h0 := sideways_inverse (evolveFrom X t) 0
        rw [← evolveFrom_succ] at h0
        rw [show (0 : ℤ) - 1 = -((1 : ℕ) : ℤ) from by norm_num,
            show (0 : ℤ) + 1 = (1 : ℤ) from by norm_num] at h0
        exact h0
      exact h.symm
    | m + 2, ih =>
      have h0 := ih m (by omega) t
      have h1 := ih (m + 1) (by omega) t
      have h2 := ih (m + 1) (by omega) (t + 1)
      have hstep := sideways_inverse (evolveFrom X t) (-((m + 1 : ℕ) : ℤ))
      rw [← evolveFrom_succ] at hstep
      rw [show -((m + 1 : ℕ) : ℤ) - 1 = -((m + 2 : ℕ) : ℤ) from by push_cast; ring,
          show -((m + 1 : ℕ) : ℤ) + 1 = -(m : ℤ) from by push_cast; ring] at hstep
      show xor (leftSolve (column X 0) (column X 1) (m + 1) (t + 1))
          (leftSolve (column X 0) (column X 1) (m + 1) t
            || leftSolve (column X 0) (column X 1) m t)
          = column X (-((m + 2 : ℕ) : ℤ)) t
      rw [h0, h1, h2]
      exact hstep.symm
