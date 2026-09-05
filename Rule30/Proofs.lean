/-
# Rule30.Proofs

Every closed node's proof module, in one import list, so that `lake build`
from the repository root builds the proofs as well as the statements. Without
this file nothing imports `Rule30/Proofs/`, and a proof that stopped
compiling — because Mathlib moved, or because a statement was edited — would
go unnoticed until the next worker was dispatched at it.

**The dispatcher maintains this file.** `harness/src/harness/dispatch.gleam`
appends one `import` line here when a node closes, keeping the list sorted
and skipping a line that is already present. Edit it by hand only to remove a
module whose node has been retired.
-/
import Rule30.Proofs.CenterColumnZero
import Rule30.Proofs.EvolveEqFalseOfOutsideCone
