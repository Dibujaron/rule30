import Rule30.Basic
import Rule30.Proofs.ColumnAlternatingOfBlackRun
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal

/-! Seeder scratch. Two things are being checked here, neither is a node.

1. The route for the black-run bound, against the real board.
2. That the counting statement really does follow from the window statement,
   with the window statement taken in as a hypothesis rather than assumed
   available -- so the proposed public statement is what its consumer needs.
-/

theorem centerColumn_black_run_lt_start (a L : ℕ) (ha : 1 ≤ a)
    (h : ∀ s ≤ L, centerColumn (a + s) = true) : L < a := by
  by_contra hc
  have hc : a ≤ L := by omega
  have hcol : ∀ s ≤ L, column initialConfig 0 (a + s) = true := h
  have hedge := column_alternating_of_black_run initialConfig a L hcol a hc
  have hsec := column_alternating_of_black_run initialConfig a L hcol (a - 1) (by omega)
  rw [show column initialConfig (-(a : ℤ)) a = evolve a (-(a : ℤ)) from rfl,
    evolve_left_edge a] at hedge
  have h2 : evolve a (-((a - 1 : ℕ) : ℤ)) = true := by
    have hh := evolve_left_second_diagonal (a - 1)
    rwa [show a - 1 + 1 = a from by omega] at hh
  rw [show column initialConfig (-((a - 1 : ℕ) : ℤ)) a = evolve a (-((a - 1 : ℕ) : ℤ)) from rfl,
    h2] at hsec
  simp at hedge hsec
  omega

/-- One new witness inside a wider range raises the count by at least one. -/
private theorem count_step (M M' t : ℕ) (ht : M ≤ t) (ht' : t < M')
    (P : ℕ → Bool) (hP : P t = true) :
    ((Finset.range M).filter fun n => P n = true).card + 1
      ≤ ((Finset.range M').filter fun n => P n = true).card := by
  have hsub : insert t ((Finset.range M).filter fun n => P n = true)
      ⊆ (Finset.range M').filter fun n => P n = true := by
    intro x hx
    simp only [Finset.mem_insert, Finset.mem_filter, Finset.mem_range] at hx ⊢
    rcases hx with rfl | ⟨hx1, hx2⟩
    · exact ⟨ht', hP⟩
    · exact ⟨by omega, hx2⟩
  have hnot : t ∉ (Finset.range M).filter fun n => P n = true := by
    simp only [Finset.mem_filter, Finset.mem_range]
    omega
  calc ((Finset.range M).filter fun n => P n = true).card + 1
      = (insert t ((Finset.range M).filter fun n => P n = true)).card := by
        rw [Finset.card_insert_of_notMem hnot]
    _ ≤ _ := Finset.card_le_card hsub

theorem centerColumnCount_ge_of_pow
    (window : ∀ a : ℕ, 1 ≤ a →
      (∃ s ≤ 3 * a, centerColumn (a + s) = true) ∧
        (∃ s ≤ 3 * a, centerColumn (a + s) = false))
    (n : ℕ) :
    n ≤ ((Finset.range (5 ^ n)).filter fun t => centerColumn t = true).card ∧
      n ≤ ((Finset.range (5 ^ n)).filter fun t => centerColumn t = false).card := by
  induction n with
  | zero => simp
  | succ n ih =>
    obtain ⟨hb, hw⟩ := ih
    have ha : 1 ≤ 5 ^ n := Nat.one_le_pow _ _ (by norm_num)
    obtain ⟨⟨s, hs, hsb⟩, ⟨u, hu, huw⟩⟩ := window (5 ^ n) ha
    have hlt : ∀ v : ℕ, v ≤ 3 * 5 ^ n → 5 ^ n + v < 5 ^ (n + 1) := by
      intro v hv
      have : 5 ^ (n + 1) = 5 * 5 ^ n := by ring
      omega
    constructor
    · have := count_step (5 ^ n) (5 ^ (n + 1)) (5 ^ n + s) (by omega) (hlt s hs)
        (fun t => centerColumn t) hsb
      omega
    · have := count_step (5 ^ n) (5 ^ (n + 1)) (5 ^ n + u) (by omega) (hlt u hu)
        (fun t => !centerColumn t) (by simp [huw])
      simp only [Bool.not_eq_true'] at this
      omega
