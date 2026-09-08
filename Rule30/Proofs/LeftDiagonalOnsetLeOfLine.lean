import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.LeftDiagonalRecurrence
import Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack
import Rule30.Proofs.BoolDrivenPeriodicFromOfReturn
import Mathlib.Tactic.Ring

/-!
**What this says.** If at every diagonal either the boundary cell one step in is
black, or the new diagonal already matches itself one period past that boundary,
then every left diagonal has settled into a repeating pattern by its own index.
**Why it is true.** Each Boolean case is exactly the hypothesis of a closed lemma:
a black boundary cell resets the diagonal with its period unchanged
(`leftDiagonal_periodicFrom_step_of_black`), and an early match lets the one-bit
machine's period stay unchanged too (`bool_driven_periodicFrom_of_return`).
**Where the work is.** Lining up the induction's two periods (`2^m`, `2^(m+1)`)
onto one common period `2^(m+1)` via `periodicFrom_mul` before either branch fires.
-/

theorem leftDiagonal_onset_le_of_line
    (h : ∀ m, leftDiagonal (m + 1) (m + 2) = true ∨
      leftDiagonal (m + 2) (m + 1 + 2 ^ (m + 2)) = leftDiagonal (m + 2) (m + 1))
    (k : ℕ) : ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  suffices hs : ∀ k, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) (2 ^ k) N by
    obtain ⟨N, hN, hp⟩ := hs k
    exact ⟨2 ^ k, Nat.two_pow_pos k, N, hN, hp⟩
  intro k
  induction k using Nat.strong_induction_on with
  | _ k ih =>
    match k, ih with
    | 0, _ =>
      refine ⟨0, Nat.zero_le _, ?_⟩
      have hconst : ∀ j, leftDiagonal 0 j = true := by
        intro j
        show evolve (j + 0) (-(j : ℤ)) = true
        rw [show j + 0 = j from by omega]
        exact evolve_left_edge j
      intro n _
      rw [hconst (n + 2 ^ 0), hconst n]
    | 1, _ =>
      refine ⟨0, Nat.zero_le _, ?_⟩
      have hconst : ∀ j, leftDiagonal 1 j = true := by
        intro j
        exact evolve_left_second_diagonal j
      intro n _
      rw [hconst (n + 2 ^ 1), hconst n]
    | m + 2, ih =>
      obtain ⟨N0, hN0, h0⟩ := ih m (by omega)
      obtain ⟨N1, hN1, h1⟩ := ih (m + 1) (by omega)
      have hpow1 : 2 ^ (m + 1) = 2 * 2 ^ m := by ring
      have hpow2 : 2 ^ (m + 2) = 2 * 2 ^ (m + 1) := by ring
      -- both drivers with period 2^(m+1) from index m+1
      have h0' : PeriodicFrom (leftDiagonal m) (2 ^ (m + 1)) (m + 1) := by
        intro n hn
        rw [hpow1]
        exact periodicFrom_mul (leftDiagonal m) (2 ^ m) N0 h0 2 n (by omega)
      have h1' : PeriodicFrom (leftDiagonal (m + 1)) (2 ^ (m + 1)) (m + 1) := by
        intro n hn
        exact h1 n (by omega)
      rcases h m with hb | hs
      · -- black on the line: reset, period unchanged, onset m+2
        have hstep := leftDiagonal_periodicFrom_step_of_black m (2 ^ (m + 1)) (m + 1) (m + 1)
          le_rfl h0' h1' hb
        refine ⟨m + 2, le_rfl, ?_⟩
        rw [hpow2]
        exact periodicFrom_mul (leftDiagonal (m + 2)) (2 ^ (m + 1)) (m + 2) hstep 2
      · -- settled one cell outside the line: return, period doubled, onset m+1
        refine ⟨m + 1, by omega, ?_⟩
        refine bool_driven_periodicFrom_of_return
          (fun i => leftDiagonal m (i + 2)) (fun i => leftDiagonal (m + 1) (i + 1))
          (leftDiagonal (m + 2)) (2 ^ (m + 2)) (m + 1) (m + 1) ?_ ?_ ?_ le_rfl hs
        · intro i
          exact leftDiagonal_recurrence m i
        · intro i hi
          have hh := periodicFrom_mul (leftDiagonal m) (2 ^ (m + 1)) (m + 1) h0' 2 (i + 2)
            (by omega)
          dsimp only
          rw [hpow2, show i + 2 * 2 ^ (m + 1) + 2 = i + 2 + 2 * 2 ^ (m + 1) from by omega]
          exact hh
        · intro i hi
          have hh := periodicFrom_mul (leftDiagonal (m + 1)) (2 ^ (m + 1)) (m + 1) h1' 2 (i + 1)
            (by omega)
          dsimp only
          rw [hpow2, show i + 2 * 2 ^ (m + 1) + 1 = i + 1 + 2 * 2 ^ (m + 1) from by omega]
          exact hh
