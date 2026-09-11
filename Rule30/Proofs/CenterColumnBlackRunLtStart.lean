import Rule30.Basic
import Rule30.Proofs.ColumnAlternatingOfBlackRun
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal

/-!
**What this says.** A run of black centre cells starting at time `a >= 1` cannot be `a` steps long or longer.
**Why it is true.** `column_alternating_of_black_run` forces the cells at depth `a-1` and `a` left of the origin, at time `a`, to have opposite colours; but `evolve_left_edge` and `evolve_left_second_diagonal` say both are black.
**Where the work is.** Nowhere new: it is those three served lemmas fed the depths `a-1, a`, then `omega` on the parity contradiction.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_black_run_lt_start (a L : ℕ) (ha : 1 ≤ a) (h : ∀ s ≤ L, centerColumn (a + s) = true) : L < a
```
-/

theorem centerColumn_black_run_lt_start (a L : ℕ) (ha : 1 ≤ a)
    (h : ∀ s ≤ L, centerColumn (a + s) = true) : L < a := by
  by_contra hL
  have hL : a ≤ L := by omega
  have h' : ∀ s ≤ L, column initialConfig 0 (a + s) = true := h
  have e1 : evolve a (-(a : ℤ)) = decide (a % 2 = 0) :=
    column_alternating_of_black_run initialConfig a L h' a hL
  have e2 : evolve a (-((a - 1 : ℕ) : ℤ)) = decide ((a - 1) % 2 = 0) :=
    column_alternating_of_black_run initialConfig a L h' (a - 1) (by omega)
  have t1 : evolve a (-(a : ℤ)) = true := evolve_left_edge a
  have t2 : evolve a (-((a - 1 : ℕ) : ℤ)) = true := by
    have h2 := evolve_left_second_diagonal (a - 1)
    rwa [show a - 1 + 1 = a from by omega] at h2
  rw [t1] at e1
  rw [t2] at e2
  have p1 : a % 2 = 0 := of_decide_eq_true e1.symm
  have p2 : (a - 1) % 2 = 0 := of_decide_eq_true e2.symm
  omega
