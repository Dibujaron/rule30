import Rule30.Basic
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.RightDiagonalPeriodicFromPow

/-!
**What this says.** The centre column shows up again far from the origin:
cell `m * 2^k` of row `m * 2^k + k` always matches centre-column cell `k`.
**Why it is true.** That cell is diagonal `k`, counted in from the right
edge, read `m * 2^k` steps along; the diagonal repeats with period `2^k`
from its very first cell, so reading it `m` periods along lands back on
its value at the start, which is the centre column.
**Where the work is.** None past citing the two served lemmas: a multiple
of a period is a period, applied to the diagonal's own period.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_eq_evolve_mul_pow (k m : ℕ) : evolve (m * 2 ^ k + k) ↑(m * 2 ^ k) = centerColumn k
```
-/

theorem centerColumn_eq_evolve_mul_pow (k m : ℕ) :
    evolve (m * 2 ^ k + k) ((m * 2 ^ k : ℕ) : ℤ) = centerColumn k := by
  have hper : PeriodicFrom (rightDiagonal k) (m * 2 ^ k) 0 :=
    periodicFrom_mul (rightDiagonal k) (2 ^ k) 0 (rightDiagonal_periodicFrom_pow k) m
  have h : rightDiagonal k (0 + m * 2 ^ k) = rightDiagonal k 0 := hper 0 (Nat.zero_le 0)
  simpa [rightDiagonal, centerColumn] using h
