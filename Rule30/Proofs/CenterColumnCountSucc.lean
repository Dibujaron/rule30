import Rule30.Basic

/-!
**What this says.** The count of black cells in the center column up to index N+1
equals the count up to N, plus one if cell N is black.

**Why it is true.** Adding one index to a range adds that one cell to the
tally and disturbs nothing already counted.

**Where the work is.** Finset.range_add_one rewrites the new range as an insert,
Finset.filter_insert handles the insert in the filter, and the two cases
split cleanly: if the new cell is black it contributes 1, else 0.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumnCount_succ (N : ℕ) :
  {n ∈ Finset.range (N + 1) | centerColumn n = true}.card =
    {n ∈ Finset.range N | centerColumn n = true}.card + if centerColumn N = true then 1 else 0
```
-/

theorem centerColumnCount_succ (N : ℕ) :
    ((Finset.range (N + 1)).filter fun n => centerColumn n = true).card =
      ((Finset.range N).filter fun n => centerColumn n = true).card
        + (if centerColumn N then 1 else 0) := by
  rw [Finset.range_add_one, Finset.filter_insert]
  by_cases h : centerColumn N
  · rw [if_pos h, if_pos h,
      Finset.card_insert_of_notMem
        (fun hmem => Finset.notMem_range_self (Finset.mem_of_mem_filter N hmem))]
  · rw [if_neg h, if_neg h, add_zero]
