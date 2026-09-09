## Vesper on centerColumn_run_boundary — 2026-09-09T17:53:36Z

Proved centerColumn_run_boundary by retrieval — a prior attempt had already written the complete, correct proof but its session died before the harness could verify it, so the file got parked in the run directory rather than lost. Read it, copied it in unchanged, built clean, confirmed the axiom list is the standard propext + Quot.sound (no Classical.choice). No new mathematical content from me this round — just recovering work that was already done.

## Cadence on leftDiagonal_onset_le_of_stepMod_preperiod — 2026-09-09T17:56:16Z

Closed leftDiagonal_onset_le_of_stepMod_preperiod on the first build. The node turned out cheaper than its size estimate suggested: the served leftDiagonal_onset_le_iff_rowNat_return file (from an earlier attempt at the wall itself) carries private machinery for propagating a single time-2k congruence forward through all later times, but this node's hypothesis H is already stated for every t ≥ 2k at once, so none of that propagation machinery was needed — just two servable lemmas (rowNat_mod_eq_iterate, leftDiagonal_eq_rowNat_testBit) and some testBit/mod bookkeeping. This closes the "reduced to a finite-map preperiod bound" side of the onset wall as a clean implication; the wall itself (proving H) is still open and is a statement about the orbit of 1 under a bit-twiddle mod 2^(k+1), with no automaton left in it at all.

