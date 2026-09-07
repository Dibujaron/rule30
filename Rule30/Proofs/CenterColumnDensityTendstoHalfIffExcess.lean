import Rule30.Basic
import Rule30.Prize

/-!
**What this says.** The prize's density limit and a purely arithmetic statement
about how far the black count sits from half of `N` say exactly the same thing.

**Why it is true.** Multiplying out the division, `centerColumnDensity N - 1/2`
times `2N` equals the excess `2 * count N - N`, so bounding the density's gap
from `1/2` by some `ε` is the same fact as bounding the excess by `ε * N`,
after halving one `ε` or the other to line the two statements up.

**Where the work is.** Mathlib's `Metric.tendsto_atTop` hands back a strict
`<` at each `ε`, while the target wants a non-strict `≤`; each direction of
the `iff` passes the bound through an extra `ε / 2` to absorb that mismatch.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_density_tendsto_half_iff_excess :
  Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2)) ↔
    ∀ (ε : ℝ), 0 < ε → ∃ N₀, ∀ N ≥ N₀, |2 * ↑{n ∈ Finset.range N | centerColumn n = true}.card - ↑N| ≤ ε * ↑N
```
-/

theorem centerColumn_density_tendsto_half_iff_excess :
    Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2 : ℝ)) ↔
      ∀ ε : ℝ, 0 < ε → ∃ N₀ : ℕ, ∀ N ≥ N₀,
        |2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) - (N : ℝ)|
          ≤ ε * (N : ℝ) := by
  have hkey : ∀ N : ℕ, (centerColumnDensity N - 1 / 2) * (2 * (N : ℝ)) =
      2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) - (N : ℝ) := by
    intro N
    rcases Nat.eq_zero_or_pos N with hN | hN
    · subst hN
      simp
    · unfold centerColumnDensity
      have hNreal : (N : ℝ) ≠ 0 := by exact_mod_cast hN.ne'
      field_simp
  have habs : ∀ N : ℕ,
      |2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) - (N : ℝ)| =
        |centerColumnDensity N - 1 / 2| * (2 * (N : ℝ)) := by
    intro N
    rw [← hkey N, abs_mul, abs_of_nonneg (by positivity : (0 : ℝ) ≤ 2 * (N : ℝ))]
  constructor
  · intro htendsto ε hε
    rw [Metric.tendsto_atTop] at htendsto
    obtain ⟨N₁, hN₁⟩ := htendsto (ε / 2) (by linarith)
    refine ⟨N₁, fun N hN => ?_⟩
    have hd := hN₁ N hN
    rw [Real.dist_eq] at hd
    rw [habs N]
    calc |centerColumnDensity N - 1 / 2| * (2 * (N : ℝ))
        ≤ (ε / 2) * (2 * (N : ℝ)) :=
          mul_le_mul_of_nonneg_right (le_of_lt hd) (by positivity)
      _ = ε * (N : ℝ) := by ring
  · intro hexcess
    rw [Metric.tendsto_atTop]
    intro ε hε
    obtain ⟨N₀, hN₀⟩ := hexcess ε hε
    refine ⟨max N₀ 1, fun N hN => ?_⟩
    have hN0 : N ≥ N₀ := le_trans (le_max_left N₀ 1) hN
    have hNpos : 1 ≤ N := le_trans (le_max_right N₀ 1) hN
    have he := hN₀ N hN0
    rw [habs N] at he
    have hNpos0 : 0 < N := by omega
    have hNrealpos : (0 : ℝ) < (N : ℝ) := by exact_mod_cast hNpos0
    have h2N : (0 : ℝ) < 2 * (N : ℝ) := by linarith
    have heq : ε * (N : ℝ) = (ε / 2) * (2 * (N : ℝ)) := by ring
    rw [heq] at he
    have hle : |centerColumnDensity N - 1 / 2| ≤ ε / 2 :=
      le_of_mul_le_mul_right he h2N
    rw [Real.dist_eq]
    linarith
