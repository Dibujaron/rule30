import Rule30.Basic
import Rule30.Proofs.CenterColumnWindowNotConstant

/-!
**What this says.** Among the first 5^n rows, the centre column shows at least n black cells and at least n white cells.
**Why it is true.** Each of the n windows [5^k, 4*5^k] for k < n lies inside [0, 5^n) and, by centerColumn_window_not_constant, contains one cell of each colour; the windows are disjoint because 4*5^k < 5^(k+1).
**Where the work is.** Turning n disjoint witnessing windows into a card bound: the induction step inserts one fresh witness into each filtered set and shows it was not already counted there.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumnCount_ge_of_pow (n : ℕ) :
  n ≤ {t ∈ Finset.range (5 ^ n) | centerColumn t = true}.card ∧
    n ≤ {t ∈ Finset.range (5 ^ n) | centerColumn t = false}.card
```
-/

theorem centerColumnCount_ge_of_pow (n : ℕ) :
    n ≤ ((Finset.range (5 ^ n)).filter fun t => centerColumn t = true).card ∧
      n ≤ ((Finset.range (5 ^ n)).filter fun t => centerColumn t = false).card := by
  induction n with
  | zero => simp
  | succ n ih =>
    obtain ⟨ihT, ihF⟩ := ih
    have ha : 1 ≤ (5 : ℕ) ^ n := Nat.one_le_pow n 5 (by norm_num)
    obtain ⟨⟨s1, hs1, ht1⟩, ⟨s2, hs2, ht2⟩⟩ := centerColumn_window_not_constant (5 ^ n) ha
    have hp : (5 : ℕ) ^ (n + 1) = 5 * 5 ^ n := by rw [pow_succ]; ring
    have hsub : (Finset.range ((5 : ℕ) ^ n)) ⊆ Finset.range (5 ^ (n + 1)) := by
      intro x hx
      rw [Finset.mem_range] at hx ⊢
      rw [hp]
      omega
    constructor
    · set A := (Finset.range ((5 : ℕ) ^ n)).filter fun t => centerColumn t = true with hA
      set B := (Finset.range ((5 : ℕ) ^ (n + 1))).filter fun t => centerColumn t = true with hB
      have hAB : A ⊆ B := Finset.filter_subset_filter _ hsub
      have hmemB : (5 ^ n + s1) ∈ B := by
        simp only [hB, Finset.mem_filter, Finset.mem_range]
        exact ⟨by rw [hp]; omega, ht1⟩
      have hnotA : (5 ^ n + s1) ∉ A := by
        simp only [hA, Finset.mem_filter, Finset.mem_range]
        intro h
        exact absurd h.1 (by omega)
      have hins : insert (5 ^ n + s1) A ⊆ B := Finset.insert_subset_iff.mpr ⟨hmemB, hAB⟩
      have hcard : (insert (5 ^ n + s1) A).card ≤ B.card := Finset.card_le_card hins
      rw [Finset.card_insert_of_notMem hnotA] at hcard
      omega
    · set A := (Finset.range ((5 : ℕ) ^ n)).filter fun t => centerColumn t = false with hA
      set B := (Finset.range ((5 : ℕ) ^ (n + 1))).filter fun t => centerColumn t = false with hB
      have hAB : A ⊆ B := Finset.filter_subset_filter _ hsub
      have hmemB : (5 ^ n + s2) ∈ B := by
        simp only [hB, Finset.mem_filter, Finset.mem_range]
        exact ⟨by rw [hp]; omega, ht2⟩
      have hnotA : (5 ^ n + s2) ∉ A := by
        simp only [hA, Finset.mem_filter, Finset.mem_range]
        intro h
        exact absurd h.1 (by omega)
      have hins : insert (5 ^ n + s2) A ⊆ B := Finset.insert_subset_iff.mpr ⟨hmemB, hAB⟩
      have hcard : (insert (5 ^ n + s2) A).card ≤ B.card := Finset.card_le_card hins
      rw [Finset.card_insert_of_notMem hnotA] at hcard
      omega
