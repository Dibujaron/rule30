import Rule30.Basic
import Rule30.Proofs.SidewaysInverse
import Rule30.Proofs.ColumnSuccOfBlack
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring

/-!
**What this says.** A run of L+1 consecutive black centre cells starting at time t forces the L+1 cells to its left at that same time to alternate colour by parity.
**Why it is true.** Rule 30 read backward (`sideways_inverse`) gives cell -(j+2) at time t from cell -(j+1) one step later and cells -(j+1), -j at time t itself; iterating that one column deeper per extra black step is `column_succ_of_black`'s own recursion, run further.
**Where the work is.** A strong induction on the depth j, where the deep case needs the same fact one column shallower read at time t + 1, i.e. this theorem applied to a run shortened by one.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_alternating_of_black_run (X : Config) (t L : ℕ) (h : ∀ s ≤ L, column X 0 (t + s) = true) (j : ℕ)
  (hj : j ≤ L) : column X (-↑j) t = decide (j % 2 = 0)
```
-/

private theorem column_alternating_of_black_run_aux (X : Config) (j : ℕ) :
    ∀ t L : ℕ, (∀ s ≤ L, column X 0 (t + s) = true) → j ≤ L →
      column X (-(j : ℤ)) t = decide (j % 2 = 0) := by
  induction j using Nat.strong_induction_on with
  | _ j ih =>
    intro t L h hjL
    match j, ih with
    | 0, _ =>
      simpa using h 0 (by omega)
    | 1, _ =>
      have h0 := h 0 (by omega)
      have h1 := h 1 (by omega)
      have hcsb := column_succ_of_black X t h0
      rw [h1] at hcsb
      have hval : column X (-1 : ℤ) t = false := by
        cases hc : column X (-1 : ℤ) t with
        | false => rfl
        | true => rw [hc] at hcsb; simp at hcsb
      simpa [show -((1 : ℕ) : ℤ) = (-1 : ℤ) from by norm_num] using hval
    | m + 2, ih =>
      have hA := ih (m + 1) (by omega) t L h (by omega)
      have hB := ih m (by omega) t L h (by omega)
      have h' : ∀ s ≤ L - 1, column X 0 (t + 1 + s) = true := by
        intro s hs
        have hh := h (s + 1) (by omega)
        have e : t + (s + 1) = t + 1 + s := by omega
        rwa [e] at hh
      have hC := ih (m + 1) (by omega) (t + 1) (L - 1) h' (by omega)
      have hstep := sideways_inverse (evolveFrom X t) (-((m + 1 : ℕ) : ℤ))
      rw [← evolveFrom_succ] at hstep
      rw [show -((m + 1 : ℕ) : ℤ) - 1 = -((m + 2 : ℕ) : ℤ) from by push_cast; ring,
          show -((m + 1 : ℕ) : ℤ) + 1 = -(m : ℤ) from by push_cast; ring] at hstep
      have keyeq : column X (-((m + 2 : ℕ) : ℤ)) t
          = xor (column X (-((m + 1 : ℕ) : ℤ)) (t + 1))
              (column X (-((m + 1 : ℕ) : ℤ)) t || column X (-(m : ℤ)) t) := hstep
      rw [keyeq, hC, hA, hB]
      rcases (by omega : m % 2 = 0 ∨ m % 2 = 1) with hm | hm
      · have e1 : (m + 1) % 2 = 1 := by omega
        have e2 : (m + 2) % 2 = 0 := by omega
        simp [hm, e1, e2]
      · have e1 : (m + 1) % 2 = 0 := by omega
        have e2 : (m + 2) % 2 = 1 := by omega
        simp [hm, e1, e2]

theorem column_alternating_of_black_run (X : Config) (t L : ℕ)
    (h : ∀ s ≤ L, column X 0 (t + s) = true)
    (j : ℕ) (hj : j ≤ L) : column X (-(j : ℤ)) t = decide (j % 2 = 0) :=
  column_alternating_of_black_run_aux X j t L h hj
