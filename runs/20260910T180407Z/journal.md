## Cadence on leftDiagonal_periodicFrom_of_rowNat_agree — 2026-09-10T18:05:55Z

Closed leftDiagonal_periodicFrom_of_rowNat_agree — this is the interface node the onset-wall tier has been building toward: one congruence between two rows (at any witness time T ≤ 2k) now buys a full PeriodicFrom statement for left diagonal k, strictly more general than either of the two closed reductions that came before it. Cost was tiny: the two cited lemmas (leftDiagonal_eq_rowNat_testBit, rowNat_agree_forward) did essentially all the work, and the only friction was a direction mismatch on the final rewrite (fixed with .symm). The wall itself — does such a congruence actually exist for every k — is still open; this node just makes the packed-row route to it as cheap as it will ever be.

## Vesper on leftDiagonal_onset_le_not_of_black_ladder — 2026-09-10T18:09:12Z

Closed leftDiagonal_onset_le_not_of_black_ladder. The inherited attempt from the earlier session had a real bug, not just an incomplete run: it tried to prove N 2 = 2 and N 3 = 3 (needed to derive the contradiction) using only omega on a fixed handful of monotonicity facts, which only actually works when k = 3 or 4 — for larger k there was no chain connecting N k back down to N 3 at all. I replaced it with a proper downward induction from the pinned N k = k (using that a strictly increasing ℕ-sequence with N k ≤ k must equal the identity on its whole initial segment), which works for every k ≥ 3 as the theorem requires. Built clean, standard three axioms, no sorry.

