import Rule30.Basic
import Rule30.Proofs.Rule30AlternatingStep
import Mathlib.Tactic

/-!
**What this says.** If the centre column's cells at 0, -1, ..., -L alternate
black-white at time t, then the centre column itself is black at every one
of the next L times, t, t+1, ..., t+L.
**Why it is true.** `rule30_alternating_step` says one step of the rule
shrinks such a block by one cell; iterating it s times still has an
alternating block of length L-s+1 sitting at the origin, whose first cell is
black by construction.
**Where the work is.** Threading the shrinking block through s steps: the
induction carries both "the run reaches this far" and "the remaining block
still alternates," since the second is what lets the next step apply.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_black_run_of_alternating (X : Config) (t L : ℕ)
  (h : ∀ j < L + 1, column X (-↑j) t = decide (j % 2 = 0)) (s : ℕ) (hs : s ≤ L) : column X 0 (t + s) = true
```
-/
theorem column_black_run_of_alternating (X : Config) (t L : ℕ)
    (h : ∀ j < L + 1, column X (-(j : ℤ)) t = decide (j % 2 = 0))
    (s : ℕ) (hs : s ≤ L) : column X 0 (t + s) = true := by
  have key : ∀ s, s ≤ L → ∀ j, j + s ≤ L → column X (-(j : ℤ)) (t + s) = decide (j % 2 = 0) := by
    intro s
    induction s with
    | zero => intro _ j hj; exact h j (by omega)
    | succ s' ih =>
      intro hs1 j hj
      obtain ⟨L', hL'⟩ := Nat.le.dest hs1
      have hIH : ∀ j' < L' + 2, evolveFrom X (t + s') (-(j' : ℤ)) = decide (j' % 2 = 0) := by
        intro j' hj'
        exact ih (by omega) j' (by omega)
      have hstep := rule30_alternating_step (evolveFrom X (t + s')) L' hIH j (by omega)
      have heq : column X (-(j : ℤ)) (t + s' + 1) = rule30 (evolveFrom X (t + s')) (-(j : ℤ)) := by
        show evolveFrom X (t + s' + 1) (-(j : ℤ)) = rule30 (evolveFrom X (t + s')) (-(j : ℤ))
        rw [evolveFrom_succ]
      rw [show t + (s' + 1) = t + s' + 1 from by omega, heq]
      exact hstep
  have hfin := key s hs 0 (by omega)
  simpa using hfin
