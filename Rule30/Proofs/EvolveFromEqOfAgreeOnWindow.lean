import Rule30.Basic

/-!
**What this says.** If two starting rows agree everywhere from `-t` to `t`,
the pictures they grow after `t` steps agree at the centre.

**Why it is true.** Induction on the number of steps taken, with a
strengthened claim: after `s` steps the two pictures still agree on the
shrunken window `-(t-s) .. (t-s)`, because each cell there reads three
cells one step earlier that are still inside the previous window.

**Where the work is.** Stating the shrinking window with plain `≤`/`≥`
instead of absolute value, so the step case is three calls to `omega`
instead of a sign case-split like `evolve_eq_false_of_outside_cone` needs.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveFrom_eq_of_agree_on_window (c d : Config) (t : ℕ) (h : ∀ (j : ℤ), -↑t ≤ j → j ≤ ↑t → c j = d j) :
  evolveFrom c t 0 = evolveFrom d t 0
```
-/

private lemma agree_on_shrinking_window (c d : Config) (t : ℕ)
    (h : ∀ j : ℤ, -(t : ℤ) ≤ j → j ≤ t → c j = d j) :
    ∀ s : ℕ, ∀ i : ℤ, -((t : ℤ) - s) ≤ i → i ≤ (t : ℤ) - s →
      rule30^[s] c i = rule30^[s] d i := by
  intro s
  induction s with
  | zero =>
    intro i hlo hhi
    simp only [Function.iterate_zero, id_eq]
    exact h i (by simpa using hlo) (by simpa using hhi)
  | succ n ih =>
    intro i hlo hhi
    have e0 := ih i (by push_cast at hlo hhi; omega) (by push_cast at hlo hhi; omega)
    have e1 := ih (i - 1) (by push_cast at hlo hhi; omega) (by push_cast at hlo hhi; omega)
    have e2 := ih (i + 1) (by push_cast at hlo hhi; omega) (by push_cast at hlo hhi; omega)
    rw [Function.iterate_succ_apply', Function.iterate_succ_apply', rule30_eq, rule30_eq, e0, e1, e2]

theorem evolveFrom_eq_of_agree_on_window (c d : Config) (t : ℕ)
    (h : ∀ j : ℤ, -(t : ℤ) ≤ j → j ≤ t → c j = d j) :
    evolveFrom c t 0 = evolveFrom d t 0 := by
  show rule30^[t] c 0 = rule30^[t] d 0
  exact agree_on_shrinking_window c d t h t 0 (by omega) (by omega)
