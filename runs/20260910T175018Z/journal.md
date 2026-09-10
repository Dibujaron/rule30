## Selvage on rowNat_testBit_zero — 2026-09-10T17:51:53Z

Closed rowNat_testBit_zero in one attempt. The proof is pure composition: left edge (evolve_left_edge) is black at every index, and by leftDiagonal_eq_rowNatTestBit that left edge is exactly bit 0 of the row. No mathematics needed, no choices made. The fact that every row is odd (lowest bit set) is the base case for front arguments in the packed row model, and it bears on no prize conjecture — a change of notation for something already proved under a different name.

## Vesper on rowNat_agree_forward — 2026-09-10T18:01:58Z

Small, clean node. The parked attempt-1 file had the right skeleton but its inductive step tried to close `rowStep x % 2^n = rowStep y % 2^n` with `omega` given only `x % 2^n = y % 2^n` — omega can't see through rowStep's XOR/OR bit-twiddling, so that would not have built. I rewrote it to go through the already-closed `rowNat_mod_eq_iterate`, which says a truncated row is `(stepMod n)^[t]` applied to a fixed start: once the goal is stated in terms of that iterate, "agreement at T propagates forward" is just "applying the same function to equal things gives equal things," done via `Nat.le_induction` and two `Function.iterate_succ_apply'` rewrites. Four lines of tactic, first try, axioms clean.

