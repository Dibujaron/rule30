import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.CenterColumnNotEventuallyConstant

/-!
**What this says.** If the centre column has black runs of every length,
arbitrarily late, then it never settles into a repeating pattern.
**Why it is true.** A run at least as long as a hypothetical period forces
every later cell black by that period, which is exactly staying black
forever — ruled out by `centerColumn_not_eventually_constant`.
**Where the work is.** Showing "a run of length `p` inside a period-`p` tail
forces the whole tail black", by strong induction on how far past the run's
start a cell sits.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_not_isEventuallyPeriodic_of_long_black_runs
  (h : ∀ (k N : ℕ), ∃ t, N ≤ t ∧ ∀ s < k, centerColumn (t + s) = true) : ¬IsEventuallyPeriodic centerColumn
```
-/

theorem centerColumn_not_isEventuallyPeriodic_of_long_black_runs
    (h : ∀ k N : ℕ, ∃ t, N ≤ t ∧ ∀ s < k, centerColumn (t + s) = true) :
    ¬ IsEventuallyPeriodic centerColumn := by
  rintro ⟨p, hp, N0, hper⟩
  obtain ⟨t, ht, hrun⟩ := h p N0
  have hall : ∀ n : ℕ, centerColumn (t + n) = true := by
    intro n
    induction n using Nat.strong_induction_on with
    | _ n ih =>
      by_cases hlt : n < p
      · exact hrun n hlt
      · push_neg at hlt
        have heq : t + n = (t + (n - p)) + p := by omega
        have hge : N0 ≤ t + (n - p) := by omega
        rw [heq, hper (t + (n - p)) hge]
        exact ih (n - p) (by omega)
  obtain ⟨M, hM, hMfalse⟩ := centerColumn_not_eventually_constant.2 t
  have hMtrue : centerColumn M = true := by
    have hn := hall (M - t)
    rwa [show t + (M - t) = M from by omega] at hn
  rw [hMtrue] at hMfalse
  exact Bool.noConfusion hMfalse
