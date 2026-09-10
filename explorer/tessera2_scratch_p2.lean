/- Seeder scratch, 2026-09-10, P2 tier: do the four proposed statements
   elaborate, and do the two cheap routes actually close? -/
import Rule30.Basic
import Rule30.Proofs.CenterColumnCountSucc
import Rule30.Proofs.CenterColumnEqRowNatTestBit
import Rule30.Proofs.RowNatModEqIterate
import Mathlib.Analysis.SpecificLimits.Basic
import Mathlib.Tactic

noncomputable def centerColumnDensity' (N : ℕ) : ℝ :=
  (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) / (N : ℝ)

/- Node 1 -/
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

/- Node 4 -/
theorem centerColumnCount_eq_rowNat_count (N : ℕ) :
    ((Finset.range N).filter fun n => centerColumn n = true).card =
      ((Finset.range N).filter fun n => (rowNat n).testBit n = true).card := by
  simp only [centerColumn_eq_rowNat_testBit]

/- Node 4, strong form: no automaton anywhere on the right -/
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

/- Node 2 -/
theorem centerColumn_density_tendsto_half_iff_excess_nat :
    Filter.Tendsto centerColumnDensity' Filter.atTop (nhds (1 / 2 : ℝ)) ↔
      ∀ d : ℕ, 0 < d → ∃ N₀ : ℕ, ∀ N ≥ N₀,
        2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card ≤ d * N + N ∧
          d * N ≤ 2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card + N := by
  sorry

/- Node 3 -/
theorem centerColumn_density_tendsto_half_of_cuts (n : ℕ → ℕ)
    (hmono : ∀ k, n k < n (k + 1))
    (h : ∀ d : ℕ, 0 < d → ∃ K : ℕ, ∀ k ≥ K,
      d * (n (k + 1) - n k) ≤ n k ∧
        2 * d * ((Finset.range (n k)).filter fun m => centerColumn m = true).card
            ≤ d * n k + n k ∧
          d * n k
            ≤ 2 * d * ((Finset.range (n k)).filter fun m => centerColumn m = true).card
              + n k) :
    Filter.Tendsto centerColumnDensity' Filter.atTop (nhds (1 / 2 : ℝ)) := by
  sorry
