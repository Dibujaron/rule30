import Rule30.Basic

/-!
**What this says.** For every width up to 12 bits and every starting number below that
width, four extra steps of the truncated packed-row map from step `2k` land back where
it was — checked for every start, not merely the seed's.
**Why it is true.** It is a finite computation: at each of these small widths the map is
a function on a finite set, so its whole orbit structure can be decided outright.
**Where the work is.** Nowhere in Lean — the kernel decides the statement directly; the
`set_option` lines only raise its recursion and heartbeat limits enough to let it finish.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.stepMod_preperiod_le_of_le_11 (k : ℕ) :
  k ≤ 11 → ∀ x < 2 ^ (k + 1), (stepMod (k + 1))^[2 * k + 4] x = (stepMod (k + 1))^[2 * k] x
```
-/

set_option maxRecDepth 100000 in
set_option maxHeartbeats 4000000 in
theorem stepMod_preperiod_le_of_le_11 : ∀ k ≤ 11, ∀ x < 2 ^ (k + 1),
    (stepMod (k + 1))^[2 * k + 4] x
      = (stepMod (k + 1))^[2 * k] x := by
  decide +kernel
