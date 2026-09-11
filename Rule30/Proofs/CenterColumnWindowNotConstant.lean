import Rule30.Basic
import Rule30.Proofs.CenterColumnBlackRunLtStart
import Rule30.Proofs.CenterColumnWhiteRunLtStart

/-!
**What this says.** From time a onwards for 3a steps, the centre column contains both black and white cells.
**Why it is true.** A black run must be shorter than its start time, and a white run must be shorter than three times its start time; a constant window violates one of these bounds.
**Where the work is.** The proof splits into two contradiction cases and applies the run bounds.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_window_not_constant (a : ℕ) (ha : 1 ≤ a) :
  (∃ s ≤ 3 * a, centerColumn (a + s) = true) ∧ ∃ s ≤ 3 * a, centerColumn (a + s) = false
```
-/

theorem centerColumn_window_not_constant (a : ℕ) (ha : 1 ≤ a) :
    (∃ s ≤ 3 * a, centerColumn (a + s) = true) ∧
      (∃ s ≤ 3 * a, centerColumn (a + s) = false) := by
  by_contra h
  simp only [not_and_or] at h
  rcases h with hall_false | hall_true
  · -- Case: no true value exists, so all are false (white run)
    push Not at hall_false
    -- hall_false : ∀ s ≤ 3 * a, centerColumn (a + s) ≠ true
    have h_white_run : ∀ s ≤ 3 * a, centerColumn (a + s) = false := by
      intro s hs
      match h : centerColumn (a + s) with
      | false => rfl
      | true => exact absurd h (hall_false s hs)
    have h_contra := centerColumn_white_run_lt_start a (3 * a) ha h_white_run
    omega
  · -- Case: no false value exists, so all are true (black run)
    push Not at hall_true
    -- hall_true : ∀ s ≤ 3 * a, centerColumn (a + s) ≠ false
    have h_black_run : ∀ s ≤ 3 * a, centerColumn (a + s) = true := by
      intro s hs
      match h : centerColumn (a + s) with
      | false => exact absurd h (hall_true s hs)
      | true => rfl
    have h_contra := centerColumn_black_run_lt_start a (3 * a) ha h_black_run
    omega
