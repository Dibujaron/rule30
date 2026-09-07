import Rule30.Basic
import Rule30.Prize

theorem centerColumn_density_tendsto_half_iff_excess :
    Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2 : ℝ)) ↔
      ∀ ε : ℝ, 0 < ε → ∃ N₀ : ℕ, ∀ N ≥ N₀,
        |2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) - (N : ℝ)|
          ≤ ε * (N : ℝ) := by
  have key : ∀ N : ℕ, 0 < N →
      |2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) - (N : ℝ)|
        = |centerColumnDensity N - 1 / 2| * (2 * (N : ℝ)) := by
    intro N hN
    have hNR : (0 : ℝ) < (N : ℝ) := by exact_mod_cast hN
    have hd : centerColumnDensity N - 1 / 2
        = (2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) - (N : ℝ))
            / (2 * (N : ℝ)) := by
      unfold centerColumnDensity
      field_simp
    rw [hd, abs_div, abs_of_pos (by linarith : (0:ℝ) < 2 * (N:ℝ))]
    field_simp
  rw [Metric.tendsto_atTop]
  constructor
  · intro hT ε hε
    obtain ⟨N₀, hN₀⟩ := hT (ε / 2) (by linarith)
    refine ⟨max N₀ 1, fun N hN => ?_⟩
    have hN1 : 0 < N := by omega
    have hNR : (0 : ℝ) < (N : ℝ) := by exact_mod_cast hN1
    have hb := hN₀ N (le_trans (le_max_left _ _) hN)
    rw [Real.dist_eq] at hb
    rw [key N hN1]
    nlinarith [abs_nonneg (centerColumnDensity N - 1 / 2)]
  · intro hE ε hε
    obtain ⟨N₀, hN₀⟩ := hE (ε / 2) (by linarith)
    refine ⟨max N₀ 1, fun N hN => ?_⟩
    have hN1 : 0 < N := by omega
    have hNR : (0 : ℝ) < (N : ℝ) := by exact_mod_cast hN1
    have hb := hN₀ N (le_trans (le_max_left _ _) hN)
    rw [key N hN1] at hb
    rw [Real.dist_eq]
    nlinarith [abs_nonneg (centerColumnDensity N - 1 / 2)]

theorem centerColumnCount_succ (N : ℕ) :
    ((Finset.range (N + 1)).filter fun n => centerColumn n = true).card =
      ((Finset.range N).filter fun n => centerColumn n = true).card
        + (if centerColumn N then 1 else 0) := by
  rw [Finset.range_add_one, Finset.filter_insert]
  by_cases h : centerColumn N = true
  · rw [if_pos h, Finset.card_insert_of_notMem (by simp)]
    simp [h]
  · rw [if_neg h]
    simp [h]

theorem centerColumnCount_sandwich (M N : ℕ) (h : M ≤ N) :
    ((Finset.range M).filter fun n => centerColumn n = true).card ≤
        ((Finset.range N).filter fun n => centerColumn n = true).card ∧
      ((Finset.range N).filter fun n => centerColumn n = true).card ≤
        ((Finset.range M).filter fun n => centerColumn n = true).card + (N - M) := by
  induction N with
  | zero =>
    obtain rfl : M = 0 := Nat.le_zero.mp h
    simp
  | succ n ih =>
    rcases Nat.lt_or_ge M (n + 1) with hlt | hge
    · have hMn : M ≤ n := Nat.lt_succ_iff.mp hlt
      obtain ⟨h1, h2⟩ := ih hMn
      rw [centerColumnCount_succ]
      constructor
      · omega
      · have : n + 1 - M = (n - M) + 1 := by omega
        rw [this]
        split <;> omega
    · obtain rfl : M = n + 1 := Nat.le_antisymm h hge
      simp

theorem centerColumn_excess_interpolate (M N : ℕ) (h : M ≤ N) :
    |2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℤ) - (N : ℤ)| ≤
      |2 * (((Finset.range M).filter fun n => centerColumn n = true).card : ℤ) - (M : ℤ)|
        + ((N : ℤ) - (M : ℤ)) := by
  obtain ⟨h1, h2⟩ := centerColumnCount_sandwich M N h
  rcases abs_cases (2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℤ)
      - (N : ℤ)) with ⟨e1, _⟩ | ⟨e1, _⟩ <;>
    rcases abs_cases (2 * (((Finset.range M).filter fun n => centerColumn n = true).card : ℤ)
      - (M : ℤ)) with ⟨e2, _⟩ | ⟨e2, _⟩ <;>
    rw [e1, e2] <;> omega

