import Rule30.Basic
import Rule30.Proofs.IsEventuallyPeriodicCommonPeriod

/-!
**What this says.** If some column, xored cell-by-cell with the centre column, settles into a
repeating pattern, and the centre column itself does too, then that column repeats on its own.
**Why it is true.** Put both eventually-periodic facts on one shared period; then at each time the
centre column's repeat cancels out of the xor equation, leaving the column itself repeating.
**Where the work is.** The cancellation is the whole idea; the rest is bookkeeping to shift the
time index by `j` so the growing-column and the read-off-the-xor sequence line up.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_other_of_cohomologous_column (x : ℤ) (j : ℕ) (hx : x ≠ 0)
  (hd : ∃ p > 0, ∃ N, PeriodicFrom (fun t => centerColumn t ^^ evolve (t + j) x) p N)
  (hc : ∃ p > 0, ∃ N, PeriodicFrom centerColumn p N) : ∃ p > 0, ∃ N, PeriodicFrom (fun t => evolve t x) p N
```
-/

private lemma xor_cancel_left {a b c : Bool} (h : xor a b = xor a c) : b = c := by
  cases a <;> cases b <;> cases c <;> simp_all

theorem centerColumn_other_of_cohomologous_column (x : ℤ) (j : ℕ) (hx : x ≠ 0)
    (hd : ∃ p > 0, ∃ N, PeriodicFrom (fun t => xor (centerColumn t) (evolve (t + j) x)) p N)
    (hc : ∃ p > 0, ∃ N, PeriodicFrom centerColumn p N) :
    ∃ p > 0, ∃ N, PeriodicFrom (fun t => evolve t x) p N := by
  obtain ⟨p, hp, N, h0, h1⟩ :=
    isEventuallyPeriodic_common_period centerColumn
      (fun t => xor (centerColumn t) (evolve (t + j) x)) hc hd
  refine ⟨p, hp, N + j, ?_⟩
  intro m hm
  have hnN : m - j ≥ N := by omega
  have e0 := h0 (m - j) hnN
  have e1 := h1 (m - j) hnN
  rw [e0] at e1
  have key : evolve (m - j + p + j) x = evolve (m - j + j) x := xor_cancel_left e1
  rw [show m - j + j = m from by omega, show m - j + p + j = m + p from by omega] at key
  exact key
