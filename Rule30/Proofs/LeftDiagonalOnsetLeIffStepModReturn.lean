import Rule30.Basic
import Rule30.Proofs.LeftDiagonalOnsetLeIffRowNatReturn
import Rule30.Proofs.RowNatModEqIterate

/-!
**What this says.** Every left diagonal settles by its own index if and only if, for
every `k`, the orbit of 1 under `r ↦ (4r XOR (2r OR r)) mod 2^(k+1)` takes the same
value at steps `2k` and `2k + 2^k`.

**Why it is true.** `leftDiagonal_onset_le_iff_rowNat_return` already says the wall is a
congruence between rows `2k` and `2k + 2^k`; `rowNat_mod_eq_iterate` says a row mod
`2^n` is exactly that many iterations of the truncated step from `1`. Substituting the
second into the first is the whole content.

**Where the work is.** Nowhere new: two rewrites in each direction, one per side of the
congruence, using `rowNat_mod_eq_iterate` at `n = k + 1`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_iff_stepMod_return :
  (∀ (k : ℕ), ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N) ↔
    ∀ (k : ℕ), (stepMod (k + 1))^[2 * k] (1 % 2 ^ (k + 1)) = (stepMod (k + 1))^[2 * k + 2 ^ k] (1 % 2 ^ (k + 1))
```
-/

theorem leftDiagonal_onset_le_iff_stepMod_return :
    (∀ k, ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N) ↔
    ∀ k : ℕ,
      (stepMod (k + 1))^[2 * k] (1 % 2 ^ (k + 1))
        = (stepMod (k + 1))^[2 * k + 2 ^ k]
            (1 % 2 ^ (k + 1)) := by
  rw [leftDiagonal_onset_le_iff_rowNat_return]
  constructor
  · intro h k
    rw [← rowNat_mod_eq_iterate, ← rowNat_mod_eq_iterate]
    exact h k
  · intro h k
    rw [rowNat_mod_eq_iterate (k + 1) (2 * k), rowNat_mod_eq_iterate (k + 1) (2 * k + 2 ^ k)]
    exact h k
