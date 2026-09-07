import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.LeftDiagonalPeriodicFromStep
import Mathlib.Tactic.Ring

/-!
**What this says.** The `k`-th diagonal counted in from the left edge repeats
every `2^k` steps, and the repetition is already underway by step `2^k`.

**Why it is true.** Strong induction on `k`. The first two diagonals are
constantly black, so they repeat with any period from the very start.
Each later diagonal is built from the two before it by
`leftDiagonal_periodicFrom_step`, which turns two diagonals repeating with
period `q` into the next one repeating with period `2q`; running that once
per step doubles the period each time, which is exactly `2^k`.

**Where the work is.** The step lemma wants both inputs on the *same*
period, but the induction hands back `2^m` for one and `2^(m+1)` for the
other -- `periodicFrom_mul` stretches the shorter one by a factor of `2` to
match, and the two onsets then get raised to their common maximum before the
step lemma applies.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_pow (k : ℕ) : ∃ N ≤ 2 ^ k, PeriodicFrom (leftDiagonal k) (2 ^ k) N
```
-/

theorem leftDiagonal_periodicFrom_pow (k : ℕ) :
    ∃ N ≤ 2 ^ k, PeriodicFrom (leftDiagonal k) (2 ^ k) N := by
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
      obtain ⟨N0, hN0le, h0⟩ := ih m (by omega)
      obtain ⟨N1, hN1le, h1⟩ := ih (m + 1) (by omega)
      have hpow1 : 2 ^ (m + 1) = 2 * 2 ^ m := by ring
      have hpow2 : 2 ^ (m + 2) = 2 * 2 ^ (m + 1) := by ring
      have h0' : PeriodicFrom (leftDiagonal m) (2 ^ (m + 1)) N0 := by
        rw [hpow1]
        exact periodicFrom_mul (leftDiagonal m) (2 ^ m) N0 h0 2
      have hle0 : N0 ≤ 2 ^ (m + 1) := by omega
      have hMle : max N0 N1 ≤ 2 ^ (m + 1) := Nat.max_le.mpr ⟨hle0, hN1le⟩
      have h0'' : PeriodicFrom (leftDiagonal m) (2 ^ (m + 1)) (max N0 N1) := by
        intro n hn
        exact h0' n (le_trans (le_max_left N0 N1) hn)
      have h1'' : PeriodicFrom (leftDiagonal (m + 1)) (2 ^ (m + 1)) (max N0 N1) := by
        intro n hn
        exact h1 n (le_trans (le_max_right N0 N1) hn)
      have hq : 0 < 2 ^ (m + 1) := by positivity
      refine ⟨max N0 N1 + 2 ^ (m + 1), by omega, ?_⟩
      rw [hpow2]
      exact leftDiagonal_periodicFrom_step m (2 ^ (m + 1)) (max N0 N1) hq h0'' h1''
