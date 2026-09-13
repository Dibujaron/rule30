import Rule30.Basic

/-!
Talus, 2026-09-13.  The demonstration that `talus14_scratch_and.lean` can fail.

That file's load-bearing claim is `or_and_differ_exactly`: rule 30 and rule 120
differ at exactly the neighbourhoods with `c ≠ r`.  This file states the two
nearby claims a reader might assume instead, and the kernel REFUTES both of them
outright rather than merely failing to prove them.

`mutant_all_entries` : "the two rules differ at every neighbourhood" — false.
`mutant_cr_11`       : "they differ when c = r = 1"                — false.

If the accepted file's iff were vacuous, these would be provable.  They are not:
each is proved FALSE by `decide`, with a witness the kernel computes.
-/

namespace TalusMutant

/-- FALSE: they agree at `(0,1,1)`, so "differ everywhere" is refuted. -/
theorem mutant_all_entries :
    ¬ (∀ l c r : Bool, xor l (c || r) ≠ xor l (c && r)) := by decide

/-- FALSE: at `c = r = true` both rules return `xor l true`. -/
theorem mutant_cr_11 :
    ¬ (xor false (true || true) ≠ xor false (true && true)) := by decide

/-- And the shape that matters: the difference set is `{c ≠ r}` and nothing
wider.  Stating it as `c ∨ r` instead of `c ≠ r` is refuted. -/
theorem mutant_or_not_xor :
    ¬ (∀ l c r : Bool, (xor l (c || r) ≠ xor l (c && r)) ↔ (c || r) = true) := by decide

#print axioms mutant_all_entries
#print axioms mutant_cr_11
#print axioms mutant_or_not_xor

end TalusMutant
