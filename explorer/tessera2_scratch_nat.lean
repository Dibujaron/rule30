/- Seeder scratch, 2026-09-10: the route for the cast-free ℕ form of the
   prize, composed with the closed ℝ form. -/
import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.CenterColumnDensityTendstoHalfIffExcess
import Mathlib.Tactic

theorem centerColumn_density_tendsto_half_iff_excess_nat :
    Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2 : ℝ)) ↔
      ∀ d : ℕ, 0 < d → ∃ N₀ : ℕ, ∀ N ≥ N₀,
        2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card ≤ d * N + N ∧
          d * N ≤ 2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card + N := by
  have main : ∀ c N d : ℕ, 0 < d →
      ((2 * d * c ≤ d * N + N ∧ d * N ≤ 2 * d * c + N) ↔
        |2 * (c : ℝ) - (N : ℝ)| ≤ (1 / (d : ℝ)) * (N : ℝ)) := by
    intro c N d hd
    have hd' : (0 : ℝ) < d := by exact_mod_cast hd
    have cancel : (d : ℝ) * (1 / (d : ℝ) * (N : ℝ)) = (N : ℝ) := by field_simp
    rw [abs_le]
    constructor
    · rintro ⟨k1, k2⟩
      have k1' : 2 * (d : ℝ) * (c : ℝ) ≤ (d : ℝ) * (N : ℝ) + (N : ℝ) := by exact_mod_cast k1
      have k2' : (d : ℝ) * (N : ℝ) ≤ 2 * (d : ℝ) * (c : ℝ) + (N : ℝ) := by exact_mod_cast k2
      constructor
      · have t : (d : ℝ) * ((N : ℝ) - 2 * (c : ℝ)) ≤ (d : ℝ) * (1 / (d : ℝ) * (N : ℝ)) := by
          rw [cancel]; nlinarith
        have := le_of_mul_le_mul_left t hd'
        linarith
      · have t : (d : ℝ) * (2 * (c : ℝ) - (N : ℝ)) ≤ (d : ℝ) * (1 / (d : ℝ) * (N : ℝ)) := by
          rw [cancel]; nlinarith
        have := le_of_mul_le_mul_left t hd'
        linarith
    · rintro ⟨k1, k2⟩
      constructor
      · have t := mul_le_mul_of_nonneg_left k2 hd'.le
        rw [cancel] at t
        have : 2 * (d : ℝ) * (c : ℝ) ≤ (d : ℝ) * (N : ℝ) + (N : ℝ) := by nlinarith
        exact_mod_cast this
      · have k1' : -(2 * (c : ℝ) - (N : ℝ)) ≤ 1 / (d : ℝ) * (N : ℝ) := by linarith
        have t := mul_le_mul_of_nonneg_left k1' hd'.le
        rw [cancel] at t
        have : (d : ℝ) * (N : ℝ) ≤ 2 * (d : ℝ) * (c : ℝ) + (N : ℝ) := by nlinarith
        exact_mod_cast this
  rw [centerColumn_density_tendsto_half_iff_excess]
  constructor
  · intro h d hd
    have hd' : (0 : ℝ) < d := by exact_mod_cast hd
    obtain ⟨N₀, hN₀⟩ := h (1 / (d : ℝ)) (by positivity)
    exact ⟨N₀, fun N hN => (main _ N d hd).mpr (hN₀ N hN)⟩
  · intro h ε hε
    obtain ⟨d, hdgt⟩ := exists_nat_gt (1 / ε)
    have hpos : (0 : ℝ) < (d : ℝ) := lt_trans (by positivity) hdgt
    have hdpos : 0 < d := by exact_mod_cast hpos
    obtain ⟨N₀, hN₀⟩ := h d hdpos
    refine ⟨N₀, fun N hN => ?_⟩
    have hb := (main _ N d hdpos).mp (hN₀ N hN)
    have hinv : 1 / (d : ℝ) ≤ ε := by
      rw [div_le_iff₀ hpos]
      rw [div_lt_iff₀ hε] at hdgt
      nlinarith
    have hN0 : (0 : ℝ) ≤ (N : ℝ) := Nat.cast_nonneg N
    calc |2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) - (N : ℝ)|
        ≤ (1 / (d : ℝ)) * (N : ℝ) := hb
      _ ≤ ε * (N : ℝ) := by nlinarith
