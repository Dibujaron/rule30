import Rule30.Basic

/-!
**What this says.** Before any step has been taken, the centre cell is
black.

**Why it is true.** `evolve 0` is the rule applied zero times, so it is
the starting row unchanged, and the starting row is a single black cell at
position 0.

**Where the work is.** Nowhere. Once the three definitions are unfolded the
claim is a concrete computation, and `decide` runs it.
-/

theorem centerColumn_zero : centerColumn 0 = true := by
  unfold centerColumn evolve initialConfig
  decide
