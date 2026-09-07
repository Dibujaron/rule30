import Rule30.Basic

/-!
**What this says.** Black count is monotone in time and grows by at most one per step.
**Why it is true.** Extending from M to N adds N-M cells; each adds 0 or 1 to the count.
**Where the work is.** Induction on N-M: both bounds follow from accumulating single-step growth.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumnCount_sandwich (M N : ℕ) (h : M ≤ N) :
  {n ∈ Finset.range M | centerColumn n = true}.card ≤ {n ∈ Finset.range N | centerColumn n = true}.card ∧
    {n ∈ Finset.range N | centerColumn n = true}.card ≤ {n ∈ Finset.range M | centerColumn n = true}.card + (N - M)
```
-/

theorem centerColumnCount_sandwich (M N : ℕ) (h : M ≤ N) :
    ((Finset.range M).filter fun n => centerColumn n = true).card ≤
        ((Finset.range N).filter fun n => centerColumn n = true).card ∧
      ((Finset.range N).filter fun n => centerColumn n = true).card ≤
        ((Finset.range M).filter fun n => centerColumn n = true).card + (N - M) := by
  constructor
  · -- Left: monotonicity via subset
    apply Finset.card_le_card
    intro x hx
    simp only [Finset.mem_filter, Finset.mem_range] at hx ⊢
    exact ⟨Nat.lt_of_lt_of_le hx.1 h, hx.2⟩
  · -- Right: bounded growth
    -- Show that each step increases count by at most 1, so N - M steps increase by at most N - M
    have step_bound : ∀ n,
      ((Finset.range (n + 1)).filter fun k => centerColumn k = true).card ≤
      ((Finset.range n).filter fun k => centerColumn k = true).card + 1 := by
      intro n
      rw [Finset.range_add_one, Finset.filter_insert]
      by_cases hc : centerColumn n = true
      · rw [if_pos hc]
        have hn_not_mem : n ∉ (Finset.range n).filter fun k => centerColumn k = true := by
          simp [Finset.mem_filter, Finset.mem_range]
        rw [Finset.card_insert_of_notMem hn_not_mem]
      · rw [if_neg hc]
        omega

    -- Now use this step bound repeatedly via induction on N
    induction N with
    | zero =>
      simp only [Nat.le_zero] at h
      subst h
      simp [Finset.range_zero, Finset.filter_empty]
    | succ N ih =>
      by_cases hM : M = N + 1
      · -- Case: M = N + 1, so the two ranges are the same
        subst hM
        simp [Nat.sub_self]
      · -- Case: M < N + 1 and M ≠ N + 1, so M ≤ N
        have hM_le : M ≤ N := by omega
        specialize ih hM_le
        calc ((Finset.range (N + 1)).filter fun k => centerColumn k = true).card
            ≤ ((Finset.range N).filter fun k => centerColumn k = true).card + 1 := step_bound N
          _ ≤ ((Finset.range M).filter fun k => centerColumn k = true).card + (N - M) + 1 := by omega
          _ = ((Finset.range M).filter fun k => centerColumn k = true).card + ((N + 1) - M) := by omega
