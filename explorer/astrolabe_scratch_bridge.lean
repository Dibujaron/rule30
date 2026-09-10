/-
Astrolabe, 2026-09-10, scratch. An elaboration-and-proof check, not a board node.

Claim under test: **P3 implies P1**, in any cost model that can look up a
finite table cheaply — and the proof is two lines, because all the content sits
in the closure hypothesis, which is a statement about the model and not about
rule 30. This file is here to make that visible rather than to be believed.
-/
import Rule30.Prize

/-- **The bridge.** If the model contains, for an eventually periodic centre
column, *some* correct program that is not at-least-linear, then P3 for that
model forces P1.

The hypothesis is the honest one: an eventually periodic sequence with period
`p` and onset `N` is computed by "reduce `n` mod `p`, index a hardwired table
of `p` bits". Whether that program is in the model, and whether its cost is
sub-linear, are facts about the model — with `n` in binary the reduction costs
`O(log² n)`, with `n` in unary it costs `Θ(n)` and the hypothesis is false. -/
theorem p1_of_p3_of_lookup (M : CostModel)
    (hlookup : IsEventuallyPeriodic centerColumn →
      ∃ q : M.Program, M.ComputesCenterColumn q ∧ ¬ M.IsAtLeastLinear q)
    (hP3 : ∀ p : M.Program, M.ComputesCenterColumn p → M.IsAtLeastLinear p) :
    ¬ IsEventuallyPeriodic centerColumn := by
  intro hper
  obtain ⟨q, hq, hqlin⟩ := hlookup hper
  exact hqlin (hP3 q hq)

/-- The converse direction, for the record: P1 gives nothing back. There is no
hypothesis of this shape that turns `¬ IsEventuallyPeriodic centerColumn` into
a lower bound, because aperiodicity is compatible with every sub-linear cost —
the Thue–Morse sequence is aperiodic and its `n`th bit is the parity of the
popcount of `n`, computable in `O(log n)`. Stated, not proved, deliberately. -/
def P1DoesNotGiveP3 : Prop :=
  ∀ M : CostModel, ¬ IsEventuallyPeriodic centerColumn →
    ∀ p : M.Program, M.ComputesCenterColumn p → M.IsAtLeastLinear p

#print axioms p1_of_p3_of_lookup
