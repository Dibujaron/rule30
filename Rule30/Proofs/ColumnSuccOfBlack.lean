import Rule30.Basic
import Rule30.Proofs.SidewaysInverse

/-!
**What this says.** When the center cell is black at time t, the center cell at time t+1 equals the negation of the left-edge cell at time t.
**Why it is true.** The rule at position 0 reads: new center = left XOR (true OR right). Since true OR right = true, this simplifies to new center = NOT left.
**Where the work is.** Applying sideways_inverse at i=0 and rewriting with the blackness hypothesis.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_succ_of_black (X : Config) (t : ℕ) (h : column X 0 t = true) : column X 0 (t + 1) = !column X (-1) t
```
-/

theorem column_succ_of_black (X : Config) (t : ℕ) (h : column X 0 t = true) :
    column X 0 (t + 1) = !(column X (-1) t) := by
  unfold column at h ⊢
  rw [evolveFrom_succ]
  have inv := sideways_inverse (evolveFrom X t) 0
  simp only [Int.zero_sub, Int.zero_add] at inv
  rw [inv]
  rw [h]
  simp
