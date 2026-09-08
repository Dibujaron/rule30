import Rule30.Basic
import Rule30.Proofs.LeftDiagonalStepPeriodDichotomy

/-!
**What this says.** A period shared by two neighbouring left diagonals carries
inwards, unchanged, across every diagonal that keeps showing black cells for ever.
**Why it is true.** `leftDiagonal_step_period_dichotomy` says one step inwards
either keeps the period or leaves the middle diagonal white for ever; a diagonal
with black cells arbitrarily far out rules the second case out, so the period
survives, and the pair is back in its starting shape one diagonal further in.
**Where the work is.** Nowhere deep — the induction carries a *pair* of diagonals
rather than one, and the two onsets it collects are merged by taking their max.

NOTE: this file does **not** contain `leftDiagonal_period_le`, the node it was
written for; that statement is a wall and this attempt did not close it. What is
here is the reduction the wall needs: with it, bounding the period of diagonal `k`
by `k + 1` becomes the (still open) claim that at most `log₂ (k + 1)` of the first
`k` left diagonals are eventually white.
-/

/-- A period shared by diagonals `m` and `m + 1` survives `n` steps inwards,
provided each diagonal passed on the way has black cells arbitrarily far out. -/
theorem leftDiagonal_period_le_of_black_between (m q N n : ℕ)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N)
    (hb : ∀ i < n, ∀ J : ℕ, ∃ j ≥ J, leftDiagonal (m + 1 + i) j = true) :
    ∃ M, PeriodicFrom (leftDiagonal (m + n)) q M ∧
      PeriodicFrom (leftDiagonal (m + n + 1)) q M := by
  revert hb
  induction n with
  | zero => exact fun _ => ⟨N, h0, h1⟩
  | succ n ih =>
    intro hb
    obtain ⟨M, hM0, hM1⟩ := ih (fun i hi => hb i (by omega))
    rcases leftDiagonal_step_period_dichotomy (m + n) q M hM0 hM1 with ⟨M', hM'⟩ | hwhite
    · rw [show m + (n + 1) = m + n + 1 from by omega,
        show m + n + 1 + 1 = m + n + 2 from by omega]
      exact ⟨max M M', fun j hj => hM1 j (le_trans (le_max_left M M') hj),
        fun j hj => hM' j (le_trans (le_max_right M M') hj)⟩
    · obtain ⟨j, hj, hblack⟩ := hb n (by omega) (M + 1)
      rw [show m + 1 + n = m + n + 1 from by omega] at hblack
      rw [hwhite j hj] at hblack
      exact absurd hblack (by simp)
