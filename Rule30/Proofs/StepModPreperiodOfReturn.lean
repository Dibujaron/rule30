import Rule30.Basic

/-!
**What this says.** If the orbit of x returns to its time-N value after p steps, then it repeats with period p from time N onwards.
**Why it is true.** Iteration is deterministic; if position N repeats after p steps, so does every later position.
**Where the work is.** Induction on the time offset past N.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.stepMod_preperiod_of_return (n N p x : ℕ) (h : (stepMod n)^[N + p] x = (stepMod n)^[N] x) (t : ℕ) :
  t ≥ N → (stepMod n)^[t + p] x = (stepMod n)^[t] x
```
-/

theorem stepMod_preperiod_of_return (n N p x : ℕ)
    (h : (stepMod n)^[N + p] x = (stepMod n)^[N] x) :
    ∀ t ≥ N, (stepMod n)^[t + p] x = (stepMod n)^[t] x := by
  intro t ht
  obtain ⟨k, rfl⟩ := Nat.exists_eq_add_of_le ht
  have hh := congrArg (stepMod n)^[k] h
  rw [← Function.iterate_add_apply, ← Function.iterate_add_apply] at hh
  rw [show k + (N + p) = N + k + p from by omega, show k + N = N + k from by omega] at hh
  exact hh
