import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.CenterColumnDensityTendstoHalfIffExcess
import Rule30.Proofs.CenterColumnCountSandwich
import Mathlib.Tactic

/-!
**What this says.** To know that black cells make up half of the centre column
in the long run, it is enough to check the tally at a thin scattering of cut
points, as long as every large window ends close behind one of them.

**Why it is true.** The tally can change by at most one per cell, so the stretch
between a cut and the end of the window can shift the count by no more than its
own length — and the hypothesis makes that length small next to the window.

**Where the work is.** Turning "small next to the window" into the limit: the
sharpness `d` is chosen from `ε` before the cut is, so every bound has to be
carried through a multiplication by `d` and divided back out at the end.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_density_tendsto_half_of_nearby_cuts
  (h :
    ∀ (d : ℕ),
      0 < d →
        ∃ N₀,
          ∀ N ≥ N₀,
            ∃ M ≤ N,
              d * (N - M) ≤ N ∧
                2 * d * {n ∈ Finset.range M | centerColumn n = true}.card ≤ d * M + M ∧
                  d * M ≤ 2 * d * {n ∈ Finset.range M | centerColumn n = true}.card + M) :
  Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2))
```
-/

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
  -- everything in ℝ, with d*a, d*b, d*g, d*M as atoms
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
  -- the two one-sided bounds, multiplied through by d
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
