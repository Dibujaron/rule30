import Rule30.Basic
import Rule30.Proofs.EvolveRightEdge
import Rule30.Proofs.EvolveRightSecondDiagonal
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.RightDiagonalPeriodicFromStep
import Mathlib.Tactic.Ring

/-!
**What this says.** Every diagonal counted in from the right edge repeats
outright, from its very first cell, with period exactly a power of two.
**Why it is true.** Strong induction on the depth. The edge itself is
constantly black (period 1) and the next diagonal in alternates (period 2);
each diagonal two further in inherits double the period of the one two
diagonals back, via `rightDiagonal_periodicFrom_step`.
**Where the work is.** The step lemma needs its two feeding diagonals on
one shared period, but the induction hands them 2^m and 2^(m+1) — so the
shallower one is stretched to 2^(m+1) with `periodicFrom_mul` before the
step lemma can combine them.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_periodicFrom_pow (k : ℕ) : PeriodicFrom (rightDiagonal k) (2 ^ k) 0
```
-/

theorem rightDiagonal_periodicFrom_pow (k : ℕ) :
    PeriodicFrom (rightDiagonal k) (2 ^ k) 0 := by
  induction k using Nat.strong_induction_on with
  | _ k ih =>
    match k, ih with
    | 0, _ =>
      intro n _
      simp only [rightDiagonal, pow_zero, Nat.add_zero]
      rw [evolve_right_edge (n + 1), evolve_right_edge n]
    | 1, _ =>
      intro n _
      simp only [rightDiagonal, pow_one]
      have hmod : (n + 2) % 2 = n % 2 := by omega
      rw [evolve_right_second_diagonal (n + 2), evolve_right_second_diagonal n, hmod]
    | m + 2, ih =>
      have ihm : PeriodicFrom (rightDiagonal m) (2 ^ m) 0 := ih m (by omega)
      have ihm1 : PeriodicFrom (rightDiagonal (m + 1)) (2 ^ (m + 1)) 0 := ih (m + 1) (by omega)
      have hm2 : PeriodicFrom (rightDiagonal m) (2 * 2 ^ m) 0 :=
        periodicFrom_mul (rightDiagonal m) (2 ^ m) 0 ihm 2
      have hq : 2 * 2 ^ m = 2 ^ (m + 1) := by rw [pow_succ]; ring
      rw [hq] at hm2
      have hq2 : 2 * 2 ^ (m + 1) = 2 ^ (m + 2) := by rw [pow_succ]; ring
      rw [← hq2]
      exact rightDiagonal_periodicFrom_step m (2 ^ (m + 1)) 0 hm2 ihm1
