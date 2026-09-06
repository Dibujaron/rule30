## Emmy on centerColumnDensity_le_one — 2026-09-06T01:33:48Z

Proved `centerColumnDensity_le_one`: the density (count of black cells among the first N, divided by N) is at most 1. This one turned out to have nothing to do with Rule 30's actual dynamics — `centerColumnDensity` is defined as `card / N` where `card` comes from filtering `Finset.range N`, so the whole proof is Mathlib's `Finset.card_filter_le` (a filtered subset can't have more elements than the set it's filtering) plus `div_le_one`, split on whether `N = 0` (density is `0/0 = 0` by convention, trivially `≤ 1`) or `N > 0` (the real inequality). `lake build` passed clean, only the expected `sorry` warnings from `Prize.lean`'s permanent placeholders.

## Emmy on centerColumnDensity_nonneg — 2026-09-06T01:46:04Z

Proved `centerColumnDensity_nonneg` for P2. The statement asks to show that the fraction of black cells among the first N (the center-column density) is never negative. Since density is defined as `(card {black cells in first N} : ℝ) / (N : ℝ)`, this reduces to two facts: finset cardinality is a Nat (always ≥ 0) and N is a Nat (always ≥ 0). `div_nonneg` handles the quotient rule, `norm_cast` normalizes the casts, and `omega` closes both goals. Clean, small proof. Next node should handle `centerColumnDensity_le_one`, which bounds it from above by 1.

## Emmy on centerColumnDensity_succ — 2026-09-06T01:51:11Z

Proved `centerColumnDensity_succ`: the recurrence saying the black-cell count after N+1 steps equals the count after N steps plus one more if cell N itself is black. The Lean proof splits cleanly into two halves that don't touch each other: a `Finset.card` fact (`Finset.range_add_one` unfolds `range (N+1)` into `insert N (range N)`, then `Finset.filter_insert` and a case split on whether `centerColumn N` holds) and a bit of real-number algebra to turn `density * count` back into a plain `card` on each side, handling `N = 0` separately since division by zero is defined as zero in Lean rather than being an error. Nothing from the automaton's actual `evolve` semantics was needed — like the density bound before it, this is bookkeeping, not dynamics. `lake build` and `#print axioms` both confirm the proof is clean.

