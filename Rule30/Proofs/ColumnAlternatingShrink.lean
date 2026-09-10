import Rule30.Basic

/-!
**What this says.** If a column looking left from the origin alternates
black/white for L+1 cells and then breaks the alternation at the next cell,
then one row later it alternates for only L cells and breaks exactly at L:
the block shrinks by one and its broken edge stays sharp.
**Why it is true.** Each new cell is rule 30's XOR of the cell above it with
the OR of its two neighbours, so cell -j one row later depends only on
cells -(j-1), -j, -(j+1) the row before; inside the block those already
alternate, and the one broken cell at -(L+1) supplies exactly the value
that keeps the new edge broken rather than extending the pattern.
**Where the work is.** The two edge positions (0 and the new edge L) read
one neighbour outside the alternating block and need separate treatment
from the interior; each case then needs a parity split on the relevant
index to reduce the resulting xor/or expression to a concrete value.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_alternating_shrink (X : Config) (t L : ℕ) (h : ∀ j < L + 1, column X (-↑j) t = decide (j % 2 = 0))
  (hmax : column X (-(↑L + 1)) t ≠ decide ((L + 1) % 2 = 0)) :
  (∀ j < L, column X (-↑j) (t + 1) = decide (j % 2 = 0)) ∧ column X (-↑L) (t + 1) ≠ decide (L % 2 = 0)
```
-/

theorem column_alternating_shrink (X : Config) (t L : ℕ)
    (h : ∀ j < L + 1, column X (-(j : ℤ)) t = decide (j % 2 = 0))
    (hmax : column X (-((L : ℕ) + 1 : ℤ)) t ≠ decide ((L + 1) % 2 = 0)) :
    (∀ j < L, column X (-(j : ℤ)) (t + 1) = decide (j % 2 = 0))
      ∧ column X (-(L : ℤ)) (t + 1) ≠ decide (L % 2 = 0) := by
  have step : ∀ i : ℤ, column X i (t + 1)
      = xor (column X (i - 1) t) (column X i t || column X (i + 1) t) := by
    intro i
    show evolveFrom X (t + 1) i
        = xor (evolveFrom X t (i - 1)) (evolveFrom X t i || evolveFrom X t (i + 1))
    rw [evolveFrom_succ, rule30_eq]
  refine ⟨?_, ?_⟩
  · intro j hj
    rcases j with _ | m
    · -- j = 0: reads column 1, whose value is absorbed since column 0 is black.
      have e0 : column X (0 : ℤ) t = true := by simpa using h 0 (by omega)
      have e1 : column X (-1 : ℤ) t = false := by simpa using h 1 (by omega)
      have hs := step (0 : ℤ)
      simp only [zero_sub, zero_add] at hs
      rw [e0, e1] at hs
      simpa using hs
    · -- j = m + 1: an interior cell, all three neighbours inside the block.
      have e0 : column X (-(m : ℤ)) t = decide (m % 2 = 0) := by
        simpa using h m (by omega)
      have e1 : column X (-((m + 1 : ℕ) : ℤ)) t = decide ((m + 1) % 2 = 0) := by
        simpa using h (m + 1) (by omega)
      have e2 : column X (-((m + 2 : ℕ) : ℤ)) t = decide ((m + 2) % 2 = 0) := by
        simpa using h (m + 2) (by omega)
      have hs := step (-((m + 1 : ℕ) : ℤ))
      have eiL : (-((m + 1 : ℕ) : ℤ) - 1) = -((m + 2 : ℕ) : ℤ) := by push_cast; omega
      have eiR : (-((m + 1 : ℕ) : ℤ) + 1) = -((m : ℕ) : ℤ) := by push_cast; omega
      rw [eiL, eiR, e2, e0, e1] at hs
      rcases Nat.mod_two_eq_zero_or_one m with hm | hm
      · have hm1 : (m + 1) % 2 = 1 := by omega
        have hm2 : (m + 2) % 2 = 0 := by omega
        simpa [hm, hm1, hm2] using hs
      · have hm1 : (m + 1) % 2 = 0 := by omega
        have hm2 : (m + 2) % 2 = 1 := by omega
        simpa [hm, hm1, hm2] using hs
  · rcases L with _ | M
    · -- L = 0: reads column 1 at time t, absorbed since column 0 is black.
      have e0 : column X (0 : ℤ) t = true := by simpa using h 0 (by omega)
      have e1 : column X (-1 : ℤ) t = true := by
        have hpos : (-(((0 : ℕ) : ℤ) + 1)) = (-1 : ℤ) := by omega
        rw [hpos] at hmax
        have hd : decide ((0 + 1) % 2 = 0) = false := by decide
        rw [hd] at hmax
        cases hc : column X (-1 : ℤ) t
        · exact absurd hc hmax
        · rfl
      have hs := step (0 : ℤ)
      simp only [zero_sub, zero_add] at hs
      rw [e0, e1] at hs
      simpa using hs
    · -- L = M + 1: the new broken cell reads the old broken cell directly.
      have e0 : column X (-((M + 1 : ℕ) : ℤ)) t = decide ((M + 1) % 2 = 0) := by
        simpa using h (M + 1) (by omega)
      have e1 : column X (-((M : ℕ) : ℤ)) t = decide (M % 2 = 0) := by
        simpa using h M (by omega)
      have hs := step (-((M + 1 : ℕ) : ℤ))
      have eiL : (-((M + 1 : ℕ) : ℤ) - 1) = -(((M + 1 : ℕ) : ℤ) + 1) := by omega
      have eiR : (-((M + 1 : ℕ) : ℤ) + 1) = -((M : ℕ) : ℤ) := by push_cast; omega
      rw [eiL, eiR, e1, e0] at hs
      rcases Nat.mod_two_eq_zero_or_one M with hm | hm
      · have hM1 : (M + 1) % 2 = 1 := by omega
        have e2 : column X (-(((M + 1 : ℕ) : ℤ) + 1)) t = false := by
          have hMd : decide ((M + 1 + 1) % 2 = 0) = true := by
            have hval : (M + 1 + 1) % 2 = 0 := by omega
            simp [hval]
          rw [hMd] at hmax
          cases hc : column X (-(((M + 1 : ℕ) : ℤ) + 1)) t
          · rfl
          · exact absurd hc hmax
        rw [e2] at hs
        simpa [hm, hM1] using hs
      · have hM1 : (M + 1) % 2 = 0 := by omega
        have e2 : column X (-(((M + 1 : ℕ) : ℤ) + 1)) t = true := by
          have hMd : decide ((M + 1 + 1) % 2 = 0) = false := by
            have hval : (M + 1 + 1) % 2 = 1 := by omega
            simp [hval]
          rw [hMd] at hmax
          cases hc : column X (-(((M + 1 : ℕ) : ℤ) + 1)) t
          · exact absurd hc hmax
          · rfl
        rw [e2] at hs
        simpa [hm, hM1] using hs
