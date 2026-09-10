import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.LeftDiagonalStepOnsetDichotomy
import Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack

/-!
**What this says.** Given checkpoints `N 0 < N 1 < ...`, each backed by either a
black cell of the next diagonal in at its checkpoint or a certificate that the
next diagonal is white from the previous checkpoint on, every left diagonal has
settled into its repeating pattern by its own checkpoint.
**Why it is true.** Carry diagonals `m` and `m+1` on one shared period anchored
at `N m`; the witness at step `m` either resets that period at the black cell
(`leftDiagonal_periodicFrom_step_of_black`), or, being white, rules out the only
other branch of `leftDiagonal_step_onset_dichotomy`, which doubles the period
and moves the onset in by one cell.
**Where the work is.** Keeping both diagonals of the pair anchored at the
*smaller* checkpoint `N m`, not `N (m+1)` -- that is what lets the black-cell
witness, sitting one before `N (m+1)`, actually apply.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_of_black_ladder (N : ℕ → ℕ) (hmono : ∀ (k : ℕ), N k < N (k + 1))
  (hwitness : ∀ (k : ℕ), leftDiagonal (k + 1) (N (k + 1)) = true ∨ ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
  (k : ℕ) : ∃ p > 0, PeriodicFrom (leftDiagonal k) p (N k)
```
-/

theorem leftDiagonal_onset_le_of_black_ladder (N : ℕ → ℕ)
    (hmono : ∀ k, N k < N (k + 1))
    (hwitness : ∀ k, leftDiagonal (k + 1) (N (k + 1)) = true ∨
        ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
    (k : ℕ) : ∃ p > 0, PeriodicFrom (leftDiagonal k) p (N k) := by
  suffices h : ∀ m, ∃ q > 0, PeriodicFrom (leftDiagonal m) q (N m) ∧
      PeriodicFrom (leftDiagonal (m + 1)) q (N m) by
    obtain ⟨q, hq, h0, _⟩ := h k
    exact ⟨q, hq, h0⟩
  intro m
  induction m with
  | zero =>
      refine ⟨1, one_pos, ?_, ?_⟩
      · have hconst : ∀ j, leftDiagonal 0 j = true := by
          intro j
          show evolve (j + 0) (-(j : ℤ)) = true
          rw [show j + 0 = j from by omega]
          exact evolve_left_edge j
        intro n _
        rw [hconst (n + 1), hconst n]
      · have hconst : ∀ j, leftDiagonal 1 j = true := by
          intro j
          exact evolve_left_second_diagonal j
        intro n _
        rw [hconst (n + 1), hconst n]
  | succ m ih =>
      obtain ⟨q, hq, h0, h1⟩ := ih
      rcases hwitness m with hblack | hwhite
      · -- black witness: leftDiagonal (m+1) (N (m+1)) = true
        have hpos : N (m + 1) ≥ 1 := by have := hmono m; omega
        have hb : leftDiagonal (m + 1) (N (m + 1) - 1 + 1) = true := by
          rw [Nat.sub_add_cancel hpos]
          exact hblack
        have hNj : N m ≤ N (m + 1) - 1 := by have := hmono m; omega
        have hnew := leftDiagonal_periodicFrom_step_of_black m q (N m) (N (m + 1) - 1)
          hNj h0 h1 hb
        rw [Nat.sub_add_cancel hpos] at hnew
        refine ⟨q, hq, ?_, hnew⟩
        intro n hn
        exact h1 n (by have := hmono m; omega)
      · -- white witness: ∀ j ≥ N m + 1, leftDiagonal (m + 1) j = false
        rcases leftDiagonal_step_onset_dichotomy m q (N m) h0 h1 with hd | hd
        · have h1' := periodicFrom_mul (leftDiagonal (m + 1)) q (N m) h1 2
          refine ⟨2 * q, by omega, ?_, ?_⟩
          · intro n hn
            exact h1' n (by have := hmono m; omega)
          · intro n hn
            exact hd n (by have := hmono m; omega)
        · exfalso
          obtain ⟨j, hj, hbj, _⟩ := hd
          have hfalse := hwhite (j + 1) (by omega)
          rw [hbj] at hfalse
          exact Bool.noConfusion hfalse
