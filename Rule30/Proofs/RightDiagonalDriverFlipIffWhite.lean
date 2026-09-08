import Rule30.Basic

/-!
**What this says.** When diagonal k has period q and diagonal k+1 is antiperiodic at that period, the OR of the k+1 driver and k-boundary differs from its q-shifted version exactly where diagonal k is white.

**Why it is true.** Periodicity and antiperiodicity transform the two ORs to (a || b) vs (!a || b) where a and b are the fixed cells; these differ exactly when b is false.

**Where the work is.** Pure Bool algebra: the four cases of a and b with cases and decide.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_driver_flip_iff_white (k q : ℕ) (hq : PeriodicFrom (rightDiagonal k) q 0)
  (hanti : ∀ (j : ℕ), rightDiagonal (k + 1) (j + q) = !rightDiagonal (k + 1) j) (j : ℕ) :
  (rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2)) ≠
      (rightDiagonal (k + 1) (j + q + 1) || rightDiagonal k (j + q + 2)) ↔
    rightDiagonal k (j + 2) = false
```
-/

theorem rightDiagonal_driver_flip_iff_white (k q : ℕ)
    (hq : PeriodicFrom (rightDiagonal k) q 0)
    (hanti : ∀ j, rightDiagonal (k + 1) (j + q) = ! rightDiagonal (k + 1) j) (j : ℕ) :
    ((rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2))
        ≠ (rightDiagonal (k + 1) (j + q + 1) || rightDiagonal k (j + q + 2)))
      ↔ rightDiagonal k (j + 2) = false := by
  set a := rightDiagonal (k + 1) (j + 1)
  set b := rightDiagonal k (j + 2)
  have hb : rightDiagonal k (j + q + 2) = b := by
    rw [show j + q + 2 = j + 2 + q by omega]
    exact hq (j + 2) (by omega)
  have ha : rightDiagonal (k + 1) (j + q + 1) = !a := by
    rw [show j + q + 1 = j + 1 + q by omega]
    exact hanti (j + 1)
  rw [hb, ha]
  cases b <;> cases a <;> decide
