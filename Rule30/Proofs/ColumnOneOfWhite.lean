import Rule30.Basic
import Rule30.Proofs.SidewaysInverse

/-!
**What this says.** When the centre cell is white at time t, column 1 at time t is pinned exactly to the xor of the next centre cell and column -1 at time t.
**Why it is true.** sideways_inverse at i = 0 reads column -1 as the xor of the next centre cell and (centre or column 1); a white centre drops the "or" to column 1 alone, so it is one xor-cancellation from the goal.
**Where the work is.** Untangling which of the three cells sideways_inverse's xor is solved for from the one it gives; the rest is `rw` and a four-case `cases`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_one_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
  column X 1 t = (column X 0 (t + 1) ^^ column X (-1) t)
```
-/

theorem column_one_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
    column X 1 t = xor (column X 0 (t + 1)) (column X (-1) t) := by
  unfold column evolveFrom at h ⊢
  rw [Function.iterate_succ_apply']
  have si := sideways_inverse (rule30^[t] X) 0
  simp only [zero_sub, zero_add] at si
  rw [h, Bool.false_or] at si
  rw [si]
  cases (rule30 (rule30^[t] X) 0) <;> cases (rule30^[t] X 1) <;> rfl
