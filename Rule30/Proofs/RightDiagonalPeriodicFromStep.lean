import Rule30.Basic
import Rule30.Proofs.RightDiagonalRecurrence
import Rule30.Proofs.BoolXorDrivenPeriodicFrom

/-!
**What this says.** If two neighbouring right diagonals of the cone both repeat with the same
period from the same time on, the diagonal just inside them repeats too, with double the period
and no delay in when it starts.
**Why it is true.** rightDiagonal_recurrence writes the new diagonal as its own previous cell
XOR'd with an OR of the two shallower diagonals; that OR repeats with the same period the two
inputs share, so bool_xor_driven_periodicFrom applies directly.
**Where the work is.** Showing the OR term repeats: each side needs the period hypothesis read
one step later than it was given, and lining up `n + q + 1` with `n + 1 + q` (and the `+2`
analogue) is the only arithmetic here.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_periodicFrom_step (m q N : ℕ) (h0 : PeriodicFrom (rightDiagonal m) q N)
  (h1 : PeriodicFrom (rightDiagonal (m + 1)) q N) : PeriodicFrom (rightDiagonal (m + 2)) (2 * q) N
```
-/

theorem rightDiagonal_periodicFrom_step (m q N : ℕ)
    (h0 : PeriodicFrom (rightDiagonal m) q N)
    (h1 : PeriodicFrom (rightDiagonal (m + 1)) q N) :
    PeriodicFrom (rightDiagonal (m + 2)) (2 * q) N := by
  apply bool_xor_driven_periodicFrom
    (fun i => rightDiagonal (m + 1) (i + 1) || rightDiagonal m (i + 2))
    (rightDiagonal (m + 2)) q N
  · intro i
    exact rightDiagonal_recurrence m i
  · intro n hn
    show (rightDiagonal (m + 1) (n + q + 1) || rightDiagonal m (n + q + 2))
        = (rightDiagonal (m + 1) (n + 1) || rightDiagonal m (n + 2))
    have e1 : rightDiagonal (m + 1) (n + 1 + q) = rightDiagonal (m + 1) (n + 1) :=
      h1 (n + 1) (by omega)
    have e2 : rightDiagonal m (n + 2 + q) = rightDiagonal m (n + 2) :=
      h0 (n + 2) (by omega)
    rw [show n + q + 1 = n + 1 + q by omega, show n + q + 2 = n + 2 + q by omega, e1, e2]
