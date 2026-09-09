import Rule30.Basic

/-!
**What this says.** Starting from row p and evolving t more steps gives row t+p overall.
**Why it is true.** Iteration composition: applying rule30 t times to (applying it p times) equals applying it t+p times.
**Where the work is.** Unfolding evolveFrom and using Function.iterate_add_apply to compose the iterations.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveFrom_evolve (p t : ℕ) : evolveFrom (evolve p) t = evolve (t + p)
```
-/

theorem evolveFrom_evolve (p t : ℕ) : evolveFrom (evolve p) t = evolve (t + p) := by
  unfold evolveFrom evolve
  rw [Function.iterate_add_apply]
