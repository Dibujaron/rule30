import Rule30.Basic

/-!
**What this says.** The count of black cells splits additively at any boundary: the count over M+k cells is the count over the first M plus the count over the k that follow.
**Why it is true.** The range M+k partitions into range M and the shifted range k, and filtering and counting respects this partition.
**Where the work is.** Expressing the partition as a Finset union and using cardinality additivity; nothing about the automaton.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumnCount_block (M k : ℕ) :
  {n ∈ Finset.range (M + k) | centerColumn n = true}.card =
    {n ∈ Finset.range M | centerColumn n = true}.card + {j ∈ Finset.range k | centerColumn (M + j) = true}.card
```
-/

theorem centerColumnCount_block (M k : ℕ) :
    ((Finset.range (M + k)).filter fun n => centerColumn n = true).card =
      ((Finset.range M).filter fun n => centerColumn n = true).card
        + ((Finset.range k).filter fun j => centerColumn (M + j) = true).card := by
  induction k with
  | zero =>
    simp
  | succ k ih =>
    rw [show M + (k + 1) = M + k + 1 by omega, Finset.range_add_one, Finset.filter_insert]
    by_cases h : centerColumn (M + k) = true
    · simp only [if_pos h]
      have key : M + k ∉ Finset.range (M + k) := by simp
      have notInFilter : M + k ∉ (Finset.range (M + k)).filter fun n => centerColumn n = true := by
        simp [key]
      rw [Finset.card_insert_of_notMem notInFilter, ih]
      rw [Finset.range_add_one, Finset.filter_insert, if_pos h]
      have : k ∉ Finset.range k := by simp
      have : k ∉ (Finset.range k).filter fun j => centerColumn (M + j) = true := by simp [this]
      rw [Finset.card_insert_of_notMem this]
      omega
    · simp only [if_neg h]
      rw [ih]
      simp [Finset.range_add_one, Finset.filter_insert, h]
