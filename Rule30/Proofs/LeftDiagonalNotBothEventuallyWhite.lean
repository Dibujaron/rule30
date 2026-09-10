import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
**What this says.** No two neighbouring left diagonals can both be white for ever.
**Why it is true.** The recurrence forces whiteness one diagonal further in each
time, descending until it reaches diagonals 0 and 1, which are always black.
**Where the work is.** Strong induction on the diagonal index, with two uses of the
recurrence per step to push the white tail inward before citing the induction
hypothesis one diagonal shallower.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_not_both_eventually_white (k : ℕ) :
  ¬((∃ N, ∀ j ≥ N, leftDiagonal k j = false) ∧ ∃ M, ∀ j ≥ M, leftDiagonal (k + 1) j = false)
```
-/

theorem leftDiagonal_not_both_eventually_white (k : ℕ) :
    ¬ ((∃ N, ∀ j ≥ N, leftDiagonal k j = false) ∧
        ∃ M, ∀ j ≥ M, leftDiagonal (k + 1) j = false) := by
  induction k using Nat.strong_induction_on with
  | _ k ih =>
    intro ⟨⟨N, hN⟩, ⟨M, hM⟩⟩
    match k, ih with
    | 0, _ =>
      have h1 : leftDiagonal 0 N = true := evolve_left_edge N
      have h2 : leftDiagonal 0 N = false := hN N (le_refl _)
      rw [h1] at h2
      exact absurd h2 (by decide)
    | 1, _ =>
      have h1 : leftDiagonal 1 N = true := evolve_left_second_diagonal N
      have h2 : leftDiagonal 1 N = false := hN N (le_refl _)
      rw [h1] at h2
      exact absurd h2 (by decide)
    | m + 2, ih =>
      have hW1 : ∀ i ≥ N + M, leftDiagonal (m + 1) (i + 2) = false := by
        intro i hi
        have e := leftDiagonal_recurrence (m + 1) i
        have hlhs : leftDiagonal (m + 3) (i + 1) = false := hM (i + 1) (by omega)
        have hmid : leftDiagonal (m + 2) (i + 1) = false := hN (i + 1) (by omega)
        have hright : leftDiagonal (m + 3) i = false := hM i (by omega)
        rw [hlhs, hmid, hright] at e
        generalize hA : leftDiagonal (m + 1) (i + 2) = A at e ⊢
        cases A <;> first | rfl | exact absurd e (by decide)
      have hW0 : ∀ i ≥ N + M + 1, leftDiagonal m (i + 2) = false := by
        intro i hi
        have e := leftDiagonal_recurrence m i
        have hlhs : leftDiagonal (m + 2) (i + 1) = false := hN (i + 1) (by omega)
        have hmid : leftDiagonal (m + 1) (i + 1) = false := by
          have h := hW1 (i - 1) (by omega)
          rwa [show i - 1 + 2 = i + 1 by omega] at h
        have hright : leftDiagonal (m + 2) i = false := hN i (by omega)
        rw [hlhs, hmid, hright] at e
        generalize hA : leftDiagonal m (i + 2) = A at e ⊢
        cases A <;> first | rfl | exact absurd e (by decide)
      apply ih m (by omega)
      constructor
      · refine ⟨N + M + 3, fun j hj => ?_⟩
        have h := hW0 (j - 2) (by omega)
        rwa [show j - 2 + 2 = j by omega] at h
      · refine ⟨N + M + 3, fun j hj => ?_⟩
        have h := hW1 (j - 2) (by omega)
        rwa [show j - 2 + 2 = j by omega] at h
