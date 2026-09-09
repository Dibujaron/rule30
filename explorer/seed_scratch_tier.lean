import Rule30.Basic
import Rule30.Prize
import Rule30.Strip

namespace SeedScratch

theorem leftDiagonal_period_le_of_white_count (m q N n : ℕ) (hq : 0 < q) (w : ℕ → ℕ)
    (hw0 : w 0 = 0) (hmono : ∀ i, w i ≤ w (i + 1))
    (hstep : ∀ i < n, (∀ J, ∃ j ≥ J, leftDiagonal (m + 1 + i) j = true) ∨ w i < w (i + 1))
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
    ∃ M, PeriodicFrom (leftDiagonal (m + n)) (2 ^ w n * q) M ∧
      PeriodicFrom (leftDiagonal (m + n + 1)) (2 ^ w n * q) M := by
  sorry

theorem leftDiagonal_step_of_white_parity (m q N : ℕ) (hq : 0 < q)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (hwhite : ∀ j ≥ N + 1, leftDiagonal (m + 1) j = false) :
    (Even (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
        PeriodicFrom (leftDiagonal (m + 2)) q N) ∧
      (Odd (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
        ∀ n ≥ N, leftDiagonal (m + 2) (n + q) = !leftDiagonal (m + 2) n) := by
  sorry

theorem leftDiagonal_onset_le_of_black_ladder (N : ℕ → ℕ) (hN0 : N 0 = 0)
    (hmono : ∀ k, N k < N (k + 1))
    (hwitness : ∀ k, leftDiagonal (k + 1) (N (k + 1)) = true ∨
        ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
    (k : ℕ) : ∃ p > 0, PeriodicFrom (leftDiagonal k) p (N k) := by
  sorry

end SeedScratch
