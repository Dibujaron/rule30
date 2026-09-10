/- Seeder scratch, 2026-09-10: the four P2 statements exactly as proposed,
   each with the route exactly as proposed. -/
import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.CenterColumnDensityTendstoHalfIffExcess
import Rule30.Proofs.CenterColumnCountSandwich
import Rule30.Proofs.CenterColumnEqRowNatTestBit
import Rule30.Proofs.RowNatModEqIterate
import Mathlib.Tactic

theorem centerColumnCount_block (M k : ℕ) :
    ((Finset.range (M + k)).filter fun n => centerColumn n = true).card =
      ((Finset.range M).filter fun n => centerColumn n = true).card
        + ((Finset.range k).filter fun j => centerColumn (M + j) = true).card := by
  have key : ∀ (f : ℕ → Bool) (m : ℕ),
      ((Finset.range (m + 1)).filter fun j => f j = true).card
        = ((Finset.range m).filter fun j => f j = true).card
          + (if f m = true then 1 else 0) := by
    intro f m
    rw [Finset.range_add_one, Finset.filter_insert]
    by_cases h : f m = true
    · rw [if_pos h, Finset.card_insert_of_notMem (by simp), if_pos h]
    · rw [if_neg h, if_neg h]
      omega
  induction k with
  | zero => simp
  | succ k ih =>
      have e : M + (k + 1) = (M + k) + 1 := by omega
      rw [e, key centerColumn (M + k), ih, key (fun j => centerColumn (M + j)) k]
      omega

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

theorem centerColumn_density_tendsto_half_of_nearby_cuts
    (h : ∀ d : ℕ, 0 < d → ∃ N₀ : ℕ, ∀ N ≥ N₀, ∃ M ≤ N,
      d * (N - M) ≤ N ∧
        2 * d * ((Finset.range M).filter fun n => centerColumn n = true).card
            ≤ d * M + M ∧
          d * M
            ≤ 2 * d * ((Finset.range M).filter fun n => centerColumn n = true).card + M) :
    Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2 : ℝ)) := by
  rw [centerColumn_density_tendsto_half_iff_excess]
  intro ε hε
  obtain ⟨d, hdgt⟩ := exists_nat_gt (3 / ε)
  have hpos : (0 : ℝ) < (d : ℝ) := lt_trans (by positivity) hdgt
  have hdpos : 0 < d := by exact_mod_cast hpos
  obtain ⟨N₀, hN₀⟩ := h d hdpos
  refine ⟨N₀, fun N hN => ?_⟩
  obtain ⟨M, hMN, hgap, he1, he2⟩ := hN₀ N hN
  obtain ⟨hs1, hs2⟩ := centerColumnCount_sandwich M N hMN
  obtain ⟨g, rfl⟩ := Nat.exists_eq_add_of_le hMN
  rw [Nat.add_sub_cancel_left] at hgap hs2
  set a := ((Finset.range M).filter fun n => centerColumn n = true).card with ha
  set b := ((Finset.range (M + g)).filter fun n => centerColumn n = true).card with hb
  have ca : (0 : ℝ) ≤ (a : ℝ) := Nat.cast_nonneg a
  have cg : (0 : ℝ) ≤ (g : ℝ) := Nat.cast_nonneg g
  have cM : (0 : ℝ) ≤ (M : ℝ) := Nat.cast_nonneg M
  have r1 : 2 * (d : ℝ) * (a : ℝ) ≤ (d : ℝ) * (M : ℝ) + (M : ℝ) := by exact_mod_cast he1
  have r2 : (d : ℝ) * (M : ℝ) ≤ 2 * (d : ℝ) * (a : ℝ) + (M : ℝ) := by exact_mod_cast he2
  have r3 : (d : ℝ) * (g : ℝ) ≤ (M : ℝ) + (g : ℝ) := by exact_mod_cast hgap
  have r4 : (a : ℝ) ≤ (b : ℝ) := by exact_mod_cast hs1
  have r5 : (b : ℝ) ≤ (a : ℝ) + (g : ℝ) := by exact_mod_cast hs2
  have hdg : (0 : ℝ) ≤ (d : ℝ) * (g : ℝ) := by positivity
  have hmul1 : (d : ℝ) * (b : ℝ) ≤ (d : ℝ) * ((a : ℝ) + (g : ℝ)) :=
    mul_le_mul_of_nonneg_left r5 hpos.le
  have hmul2 : (d : ℝ) * (a : ℝ) ≤ (d : ℝ) * (b : ℝ) :=
    mul_le_mul_of_nonneg_left r4 hpos.le
  have expand : (d : ℝ) * ((a : ℝ) + (g : ℝ)) = (d : ℝ) * (a : ℝ) + (d : ℝ) * (g : ℝ) := by ring
  rw [expand] at hmul1
  have u1 : (d : ℝ) * (2 * (b : ℝ) - ((M : ℝ) + (g : ℝ))) ≤ 3 * ((M : ℝ) + (g : ℝ)) := by
    have : (d : ℝ) * (2 * (b : ℝ) - ((M : ℝ) + (g : ℝ)))
        = 2 * ((d : ℝ) * (b : ℝ)) - (d : ℝ) * (M : ℝ) - (d : ℝ) * (g : ℝ) := by ring
    rw [this]; linarith
  have u2 : (d : ℝ) * (((M : ℝ) + (g : ℝ)) - 2 * (b : ℝ)) ≤ 3 * ((M : ℝ) + (g : ℝ)) := by
    have : (d : ℝ) * (((M : ℝ) + (g : ℝ)) - 2 * (b : ℝ))
        = (d : ℝ) * (M : ℝ) + (d : ℝ) * (g : ℝ) - 2 * ((d : ℝ) * (b : ℝ)) := by ring
    rw [this]; linarith
  have hinv : 3 / (d : ℝ) ≤ ε := by
    rw [div_le_iff₀ hpos]
    rw [div_lt_iff₀ hε] at hdgt
    nlinarith
  have key : ∀ z : ℝ, (d : ℝ) * z ≤ 3 * ((M : ℝ) + (g : ℝ)) → z ≤ ε * ((M : ℝ) + (g : ℝ)) := by
    intro z hz
    have hz' : (d : ℝ) * z ≤ (d : ℝ) * (ε * ((M : ℝ) + (g : ℝ))) := by
      have h3 : 3 * ((M : ℝ) + (g : ℝ)) ≤ (d : ℝ) * (ε * ((M : ℝ) + (g : ℝ))) := by
        rw [div_le_iff₀ hpos] at hinv
        nlinarith
      linarith
    exact le_of_mul_le_mul_left hz' hpos
  push_cast
  rw [abs_le]
  constructor
  · have := key _ u2
    linarith
  · have := key _ u1
    linarith

theorem centerColumnCount_eq_stepMod_count (N : ℕ) :
    ((Finset.range N).filter fun n => centerColumn n = true).card =
      ((Finset.range N).filter fun n =>
        ((stepMod (n + 1))^[n] (1 % 2 ^ (n + 1))).testBit n = true).card := by
  have key : ∀ n : ℕ,
      centerColumn n = ((stepMod (n + 1))^[n] (1 % 2 ^ (n + 1))).testBit n := by
    intro n
    rw [centerColumn_eq_rowNat_testBit, ← rowNat_mod_eq_iterate, Nat.testBit_mod_two_pow]
    simp
  simp only [key]

-- witnesses
#eval (List.range 6).all fun M => (List.range 5).all fun k =>
  decide (((Finset.range (M + k)).filter fun n => centerColumn n = true).card =
    ((Finset.range M).filter fun n => centerColumn n = true).card
      + ((Finset.range k).filter fun j => centerColumn (M + j) = true).card)

#eval (List.range 10).all fun n =>
  decide (centerColumn n = ((stepMod (n + 1))^[n] (1 % 2 ^ (n + 1))).testBit n)
