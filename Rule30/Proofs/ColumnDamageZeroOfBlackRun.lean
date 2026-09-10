import Rule30.Basic
import Rule30.Proofs.SidewaysInverse
import Rule30.Proofs.ColumnSuccOfBlack
import Mathlib.Tactic.Ring

/-!
**What this says.** If two pictures agree at the centre for j steps and the
centre stays black for the first j-1 of them, they agree everywhere from
position 0 back to -j, at the starting time.
**Why it is true.** A black centre lets `column_succ_of_black` read column
-1 off the centre alone, with no need for column 1; every column further
left then follows the same sideways-inverse recurrence `leftSolve_eq_column`
uses, needing only the column one step right, already agreed by induction.
**Where the work is.** Two induction variables at once: the position out to
j, and the window of times each position must still agree over, since the
recurrence at position k+2 reads position k+1 both now and one step later.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_damage_zero_of_black_run (X Y : Config) (t j : ℕ)
  (hagree : ∀ s ≤ j, column X 0 (t + s) = column Y 0 (t + s)) (hblack : ∀ s < j, column X 0 (t + s) = true) (i : ℕ)
  (hi : i ≤ j) : column X (-↑i) t = column Y (-↑i) t
```
-/

private lemma column_step_recurrence (Z : Config) (m t' : ℕ) :
    column Z (-((m + 2 : ℕ) : ℤ)) t'
      = xor (column Z (-((m + 1 : ℕ) : ℤ)) (t' + 1))
            (column Z (-((m + 1 : ℕ) : ℤ)) t' || column Z (-(m : ℤ)) t') := by
  unfold column
  have hstep := sideways_inverse (evolveFrom Z t') (-((m + 1 : ℕ) : ℤ))
  rw [← evolveFrom_succ] at hstep
  rw [show -((m + 1 : ℕ) : ℤ) - 1 = -((m + 2 : ℕ) : ℤ) from by push_cast; ring,
      show -((m + 1 : ℕ) : ℤ) + 1 = -(m : ℤ) from by push_cast; ring] at hstep
  exact hstep

theorem column_damage_zero_of_black_run (X Y : Config) (t j : ℕ)
    (hagree : ∀ s ≤ j, column X 0 (t + s) = column Y 0 (t + s))
    (hblack : ∀ s < j, column X 0 (t + s) = true)
    (i : ℕ) (hi : i ≤ j) :
    column X (-(i : ℤ)) t = column Y (-(i : ℤ)) t := by
  suffices h : ∀ k, k ≤ j → ∀ s, s + k ≤ j →
      column X (-(k : ℤ)) (t + s) = column Y (-(k : ℤ)) (t + s) by
    have hh := h i hi 0 (by omega)
    simpa using hh
  intro k
  induction k using Nat.strong_induction_on with
  | _ k ih =>
    match k, ih with
    | 0, _ =>
      intro _ s hs
      rw [show -((0 : ℕ) : ℤ) = 0 from by norm_num]
      exact hagree s (by omega)
    | 1, _ =>
      intro _ s hs
      have hbX : column X 0 (t + s) = true := hblack s (by omega)
      have hbY : column Y 0 (t + s) = true := by
        rw [← hagree s (by omega)]; exact hbX
      have hcX := column_succ_of_black X (t + s) hbX
      have hcY := column_succ_of_black Y (t + s) hbY
      have hag1 : column X 0 (t + s + 1) = column Y 0 (t + s + 1) := by
        have h' := hagree (s + 1) (by omega)
        rwa [show t + (s + 1) = t + s + 1 from by omega] at h'
      rw [hag1] at hcX
      have heq : column X (-1) (t + s) = column Y (-1) (t + s) := by
        have hnn := hcX.symm.trans hcY
        simpa using congrArg not hnn
      rw [show -((1 : ℕ) : ℤ) = (-1 : ℤ) from by norm_num]
      exact heq
    | m + 2, ih =>
      intro _ s hs
      have h0 := ih m (by omega) (by omega) s (by omega)
      have h1a := ih (m + 1) (by omega) (by omega) s (by omega)
      have h1b := ih (m + 1) (by omega) (by omega) (s + 1) (by omega)
      rw [show t + (s + 1) = t + s + 1 from by omega] at h1b
      have hX := column_step_recurrence X m (t + s)
      have hY := column_step_recurrence Y m (t + s)
      rw [h0, h1a, h1b] at hX
      exact hX.trans hY.symm
