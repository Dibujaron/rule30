import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.CenterColumnDensityTendstoHalfIffExcess

/-!
**What this says.** Balance holds exactly when, for every whole number `d`,
the black count among the first `N` cells is eventually within `N / d` of
half of `N` -- the real-valued excess bound with no cast or absolute value
on the counting side.
**Why it is true.** `ε := 1 / d` and, conversely, `d` large enough that
`1 / d ≤ ε` translate between the two quantifiers; multiplying the real
bound `|2 * count - N| ≤ ε * N` through by `d` turns it into the stated
pair of natural-number inequalities, and back.
**Where the work is.** Clearing the division by `d` in both directions
without losing the sign of `2 * count - N`, a subtraction that can go
negative and only the real side may see it.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_density_tendsto_half_iff_excess_nat :
  Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2)) ↔
    ∀ (d : ℕ),
      0 < d →
        ∃ N₀,
          ∀ N ≥ N₀,
            2 * d * {n ∈ Finset.range N | centerColumn n = true}.card ≤ d * N + N ∧
              d * N ≤ 2 * d * {n ∈ Finset.range N | centerColumn n = true}.card + N
```
-/

theorem centerColumn_density_tendsto_half_iff_excess_nat :
    Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2 : ℝ)) ↔
      ∀ d : ℕ, 0 < d → ∃ N₀ : ℕ, ∀ N ≥ N₀,
        2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card ≤ d * N + N ∧
          d * N ≤ 2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card + N := by
  rw [centerColumn_density_tendsto_half_iff_excess]
  constructor
  · intro hR d hd
    have hdR : (0 : ℝ) < (d : ℝ) := by exact_mod_cast hd
    have hdne : (d : ℝ) ≠ 0 := hdR.ne'
    obtain ⟨N₀, hN₀⟩ := hR (1 / (d : ℝ)) (by positivity)
    refine ⟨N₀, fun N hN => ?_⟩
    have h := hN₀ N hN
    rw [abs_le] at h
    obtain ⟨hlo, hhi⟩ := h
    set c : ℝ := (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) with hc
    have e1 : (d : ℝ) * (1 / (d : ℝ) * (N : ℝ)) = (N : ℝ) := by field_simp
    have keyhi : (d : ℝ) * (2 * c - (N : ℝ)) ≤ (N : ℝ) := by
      have step := mul_le_mul_of_nonneg_left hhi hdR.le
      rwa [e1] at step
    have keylo : -(N : ℝ) ≤ (d : ℝ) * (2 * c - (N : ℝ)) := by
      have step := mul_le_mul_of_nonneg_left hlo hdR.le
      rw [mul_neg, e1] at step
      linarith
    have expand : (d : ℝ) * (2 * c - (N : ℝ)) = 2 * (d : ℝ) * c - (d : ℝ) * (N : ℝ) := by ring
    rw [expand] at keyhi keylo
    constructor
    · have goalR : (2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card : ℝ)
          ≤ (d * N + N : ℝ) := by rw [← hc]; linarith
      exact_mod_cast goalR
    · have goalR : (d * N : ℝ)
          ≤ (2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card + N : ℝ) := by
        rw [← hc]; linarith
      exact_mod_cast goalR
  · intro hexcess ε hε
    obtain ⟨d, hd⟩ := exists_nat_gt (1 / ε)
    have hd0 : 0 < d := by
      rcases Nat.eq_zero_or_pos d with h0 | h0
      · exfalso
        subst h0
        simp only [Nat.cast_zero] at hd
        have hpos : (0:ℝ) < 1/ε := by positivity
        linarith
      · exact h0
    obtain ⟨N₀, hN₀⟩ := hexcess d hd0
    refine ⟨N₀, fun N hN => ?_⟩
    obtain ⟨hlo, hhi⟩ := hN₀ N hN
    -- hlo : 2 * d * count ≤ d * N + N        hhi : d * N ≤ 2 * d * count + N
    have hdR : (0 : ℝ) < (d : ℝ) := by exact_mod_cast hd0
    set c : ℝ := (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) with hc
    have hloR : 2 * (d : ℝ) * c ≤ (d : ℝ) * (N : ℝ) + (N : ℝ) := by
      have hcast : (2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card : ℝ)
          ≤ (d * N + N : ℝ) := by exact_mod_cast hlo
      rw [← hc] at hcast
      linarith
    have hhiR : (d : ℝ) * (N : ℝ) ≤ 2 * (d : ℝ) * c + (N : ℝ) := by
      have hcast : (d * N : ℝ)
          ≤ (2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card + N : ℝ) := by
        exact_mod_cast hhi
      rw [← hc] at hcast
      linarith
    have hexpand1 : (d : ℝ) * (2 * c - (N : ℝ)) ≤ (N : ℝ) := by nlinarith [hloR]
    have hexpand2 : -(N : ℝ) ≤ (d : ℝ) * (2 * c - (N : ℝ)) := by nlinarith [hhiR]
    have habsdN : |(d : ℝ) * (2 * c - (N : ℝ))| ≤ (N : ℝ) := abs_le.mpr ⟨hexpand2, hexpand1⟩
    rw [abs_mul, abs_of_nonneg hdR.le] at habsdN
    -- habsdN : d * |2 * c - N| ≤ N
    have hNR : (0 : ℝ) ≤ (N : ℝ) := N.cast_nonneg
    have hεne : ε ≠ 0 := hε.ne'
    have hde : (1 : ℝ) ≤ (d : ℝ) * ε := by
      have h1 : (1 / ε) * ε < (d : ℝ) * ε := mul_lt_mul_of_pos_right hd hε
      rw [show (1 / ε) * ε = 1 by field_simp] at h1
      linarith
    have hNle : (N : ℝ) ≤ (d : ℝ) * (ε * (N : ℝ)) := by
      have h2 := mul_le_mul_of_nonneg_right hde hNR
      rw [one_mul, mul_assoc] at h2
      exact h2
    have hstep : (d : ℝ) * |2 * c - (N : ℝ)| ≤ (d : ℝ) * (ε * (N : ℝ)) := le_trans habsdN hNle
    exact le_of_mul_le_mul_left hstep hdR
