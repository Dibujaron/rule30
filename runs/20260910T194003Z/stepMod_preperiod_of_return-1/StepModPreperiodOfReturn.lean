import Rule30.Basic

/-!
**What this says.** If the orbit of x returns to its time-N value after p steps, then it repeats with period p from time N onwards.
**Why it is true.** Iteration is deterministic; if position N repeats after p steps, so does every later position.
**Where the work is.** Induction on the time offset past N.
-/

theorem stepMod_preperiod_of_return (n N p x : ℕ)
    (h : (stepMod n)^[N + p] x = (stepMod n)^[N] x) :
    ∀ t ≥ N, (stepMod n)^[t + p] x = (stepMod n)^[t] x := by
  intro t ht
  obtain ⟨k, rfl⟩ := Nat.exists_eq_add_of_le ht
  clear ht
  -- Induction on k where t = N + k
  induction k generalizing N with
  | zero =>
    exact h
  | succ k' ih =>
    -- ih : ∀ (N : ℕ), (stepMod n)^[N + p] x = (stepMod n)^[N] x → (stepMod n)^[N + k' + p] x = (stepMod n)^[N + k'] x
    -- We need to show: (stepMod n)^[N + (k' + 1) + p] x = (stepMod n)^[N + (k' + 1)] x
    -- Strategy: show that the periodicity holds at N + 1, then use IH
    have h_next : (stepMod n)^[(N + 1) + p] x = (stepMod n)^[N + 1] x := by
      have : (N + 1) + p = (N + p) + 1 := by omega
      simp only [this, Function.iterate_succ_apply]
      rw [h]
    have := ih (N + 1) h_next
    simp only [show N + (k' + 1) + p = (N + 1) + (k' + p) by omega] at this ⊢
    simp only [show N + (k' + 1) = (N + 1) + k' by omega] at this ⊢
    exact this
