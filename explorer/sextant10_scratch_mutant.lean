import Rule30.Basic
import Rule30.Proofs.RowCellEqEvolve

/-!
Sextant, 2026-09-12.  The demonstration that `sextant10_scratch_cone.lean`'s
check can fail.

`cone_row_pow` carries the hypothesis `d ≤ n`, and the whole content of the
proof is that `2 ^ n` is a period of right diagonal `d` *only when* `d ≤ n`.
Drop that hypothesis and the statement is not merely unproved, it is FALSE:
row `2 ^ 3 = 8` is black at position `2 = 8 - 6`, so `d = 6 > 3` violates it.
(Rowland's `a(3) = 6` is exactly that distance.)

This file is ACCEPTED and proves the mutated statement false, which shows more
than a rejection would: the hypothesis is load-bearing, not decoration.  It
also pins the slack — `cone_row_pow` gives `d ≥ n + 1 = 4` and the truth is
`d ≥ 6`, so the bound is real and not tight.

The second example below is also the mutant for `edge_gap_eq`'s other
hypothesis.  Dropping `hhi` (that `P_D` fails to divide `p`) would let one take
`n = 3`, `D = 4`: the low half holds, since `P_0..P_3 = 1, 2, 2, 4` all divide
`8`.  Its conclusion would make row 8 BLACK at distance 4, and row 8 is white
there.  So both hypotheses of the identity are load-bearing, each refuted by a
cell of the same row.
-/

namespace SextantTenMutant

set_option maxRecDepth 100000 in
/-- The mutated statement, with `d ≤ n` deleted, is false. -/
theorem mutant_false :
    ¬ (∀ n d : ℕ, 1 ≤ d → evolve (2 ^ n) (((2 ^ n : ℕ) : ℤ) - (d : ℤ)) = false) := by
  intro h
  have hb : evolve 8 (2 : ℤ) = true := by
    rw [← rowCell_eq_evolve]
    decide
  have := h 3 6 (by norm_num)
  norm_num at this
  rw [this] at hb
  exact Bool.false_ne_true hb

set_option maxRecDepth 100000 in
/-- And the bound is not tight: positions `8 - 4` and `8 - 5` of row 8 are
white, so the true first black cell is at distance 6 where `cone_row_pow`
guarantees only that it is past 3. -/
example : rowCell 8 ((8 : ℤ) - 4) = false ∧ rowCell 8 ((8 : ℤ) - 5) = false
    ∧ rowCell 8 ((8 : ℤ) - 6) = true := by
  decide

#print axioms mutant_false

end SextantTenMutant
