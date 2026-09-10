import Rule30.Basic
import Rule30.Proofs.CenterColumnNotIsEventuallyPeriodicOfLongBlackRuns
import Rule30.Proofs.ColumnBlackRunOfAlternating

/-!
**What this says.** If arbitrarily late, deep alternating blocks of cells
sit just left of the origin, the centre column never settles into a
repeating pattern.
**Why it is true.** `column_black_run_of_alternating` turns each such block
into a long run of black centre cells, and
`centerColumn_not_isEventuallyPeriodic_of_long_black_runs` already rules out
a repeating column with runs of every length.
**Where the work is.** Nowhere new: this is those two closed lemmas
composed, reading the alternating hypothesis at length `k+1` so it covers
every `j < k+1` that `column_black_run_of_alternating` asks for.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_not_isEventuallyPeriodic_of_deep_alternating
  (h : ∀ (k N : ℕ), ∃ t, N ≤ t ∧ ∀ j < k, evolve t (-↑j) = decide (j % 2 = 0)) : ¬IsEventuallyPeriodic centerColumn
```
-/

theorem centerColumn_not_isEventuallyPeriodic_of_deep_alternating
    (h : ∀ k N : ℕ, ∃ t, N ≤ t ∧ ∀ j < k, evolve t (-(j : ℤ)) = decide (j % 2 = 0)) :
    ¬ IsEventuallyPeriodic centerColumn := by
  apply centerColumn_not_isEventuallyPeriodic_of_long_black_runs
  intro k N
  obtain ⟨t, ht, hrun⟩ := h (k + 1) N
  refine ⟨t, ht, fun s hs => ?_⟩
  exact column_black_run_of_alternating initialConfig t k hrun s (by omega)
