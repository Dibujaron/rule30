import Rule30.Basic
import Rule30.Proofs.LeftDiagonalStepPeriodDichotomy
import Rule30.Proofs.LeftDiagonalPeriodicFromStep
import Rule30.Proofs.PeriodicFromMul
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Positivity

/-!
**What this says.** Carrying a period shared by two neighbouring left diagonals
inwards costs a doubling only at a diagonal that eventually goes white, so after
`n` steps the period is the one you started with doubled once per white diagonal.
**Why it is true.** One step inwards is `leftDiagonal_step_period_dichotomy`: it
either keeps the period or leaves the middle diagonal white for ever, and in the
white case `leftDiagonal_periodicFrom_step` still pays only a factor of two.
**Where the work is.** Nowhere deep; the bookkeeping is that the tally `w` may
jump by more than one, so each step lifts both diagonals onto the larger period
with `periodicFrom_mul` rather than assuming they arrive already matching.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_period_le_of_white_count (m q N n : ℕ) (hq : 0 < q) (w : ℕ → ℕ) (hw0 : w 0 = 0)
  (hmono : ∀ (i : ℕ), w i ≤ w (i + 1))
  (hstep : ∀ i < n, (∀ (J : ℕ), ∃ j ≥ J, leftDiagonal (m + 1 + i) j = true) ∨ w i < w (i + 1))
  (h0 : PeriodicFrom (leftDiagonal m) q N) (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
  ∃ M, PeriodicFrom (leftDiagonal (m + n)) (2 ^ w n * q) M ∧ PeriodicFrom (leftDiagonal (m + n + 1)) (2 ^ w n * q) M
```
-/

theorem leftDiagonal_period_le_of_white_count (m q N n : ℕ) (hq : 0 < q) (w : ℕ → ℕ)
    (hw0 : w 0 = 0) (hmono : ∀ i, w i ≤ w (i + 1))
    (hstep : ∀ i < n, (∀ J, ∃ j ≥ J, leftDiagonal (m + 1 + i) j = true) ∨ w i < w (i + 1))
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
    ∃ M, PeriodicFrom (leftDiagonal (m + n)) (2 ^ w n * q) M ∧
      PeriodicFrom (leftDiagonal (m + n + 1)) (2 ^ w n * q) M := by
  have hpow : ∀ a b : ℕ, a ≤ b → (2 : ℕ) ^ b * q = 2 ^ (b - a) * (2 ^ a * q) := by
    intro a b hab
    have h : b - a + a = b := by omega
    rw [← mul_assoc, ← pow_add, h]
  have hpow2 : ∀ a b : ℕ, a + 1 ≤ b → (2 : ℕ) ^ b * q = 2 ^ (b - a - 1) * (2 * (2 ^ a * q)) := by
    intro a b hab
    have h : b - a - 1 + 1 + a = b := by omega
    calc (2 : ℕ) ^ b * q = 2 ^ (b - a - 1 + 1 + a) * q := by rw [h]
      _ = 2 ^ (b - a - 1) * (2 * (2 ^ a * q)) := by rw [pow_add, pow_add, pow_one]; ring
  revert hstep
  induction n with
  | zero =>
    intro _
    rw [hw0, pow_zero, one_mul]
    exact ⟨N, h0, h1⟩
  | succ n ih =>
    intro hstep
    obtain ⟨M, hM0, hM1⟩ := ih (fun i hi => hstep i (by omega))
    have hPpos : 0 < 2 ^ w n * q := Nat.mul_pos (by positivity) hq
    have hwle : w n ≤ w (n + 1) := hmono n
    rcases hstep n (by omega) with hblack | hwhite
    · rcases leftDiagonal_step_period_dichotomy (m + n) (2 ^ w n * q) M hM0 hM1 with
        ⟨M', hM'⟩ | hwt
      · refine ⟨max M M', ?_, ?_⟩
        · rw [show m + (n + 1) = m + n + 1 from by omega, hpow (w n) (w (n + 1)) hwle]
          exact periodicFrom_mul _ _ _
            (fun j hj => hM1 j (le_trans (le_max_left M M') hj)) _
        · rw [show m + (n + 1) + 1 = m + n + 2 from by omega, hpow (w n) (w (n + 1)) hwle]
          exact periodicFrom_mul _ _ _
            (fun j hj => hM' j (le_trans (le_max_right M M') hj)) _
      · obtain ⟨j, hj, hb⟩ := hblack (M + 1)
        rw [show m + 1 + n = m + n + 1 from by omega] at hb
        rw [hwt j hj] at hb
        exact absurd hb (by simp)
    · have hstep2 := leftDiagonal_periodicFrom_step (m + n) (2 ^ w n * q) M hPpos hM0 hM1
      refine ⟨M + 2 ^ w n * q, ?_, ?_⟩
      · rw [show m + (n + 1) = m + n + 1 from by omega, hpow (w n) (w (n + 1)) hwle]
        exact periodicFrom_mul _ _ _ (fun j hj => hM1 j (by omega)) _
      · rw [show m + (n + 1) + 1 = m + n + 2 from by omega,
          hpow2 (w n) (w (n + 1)) hwhite]
        exact periodicFrom_mul _ _ _ hstep2 _
