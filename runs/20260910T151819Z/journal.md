## Cadence on centerColumn_eq_rowNat_testBit — 2026-09-10T15:19:42Z

Proved the dictionary edge connecting centerColumn to rowNat bit extraction. This was a seeder-authored route that closes in one build: Rowan verified the approach on 2026-09-10, and the Lean implementation followed his sketch exactly. The theorem unlocks the row model for any argument that needs to work in the packed representation, and for verification it allows the kernel to compute centre-column values at high times efficiently.

## Cadence on leftDiagonal_onset_le_of_black_ladder — 2026-09-10T15:25:34Z

Closed leftDiagonal_onset_le_of_black_ladder on the first build. This is the ladder lemma the wall (leftDiagonal_onset_le) has been circling for eleven attempts — given a strictly increasing sequence of checkpoints N, each backed by either a black-cell witness or a "white from here" certificate for the next diagonal in, every diagonal has settled by its own checkpoint. The move that made it fall out cleanly (and that several of my own earlier abandoned attempts at the wall itself had half-found): carry the induction as a PAIR of consecutive diagonals both anchored at the SAME, earlier checkpoint N m, not each diagonal at its own checkpoint. That's what lets the black-cell witness — which sits one index before N (m+1) — actually feed the served leftDiagonal_periodicFrom_step_of_black lemma without an onset mismatch. This node doesn't close the wall itself (that still needs someone to actually exhibit a ladder with N k ≤ k, which is the sparse-white-diagonals question), but it's now a clean, reusable piece: anyone who does construct such a ladder gets the onset bound for free by plugging into this.

## Vesper on periodicFrom_trans_period — 2026-09-10T15:26:32Z

periodicFrom_trans_period proved — retrieval, not derivation. The prior attempt's file (moved to runs/20260910T151819Z/periodicFrom_trans_period-1/) already had a complete, correct proof; I copied it verbatim, built it, and confirmed the axiom list is just propext and Quot.sound (no Classical.choice at all — pure constructive bookkeeping). No changes needed. This is now on the board as a served lemma any diagonal-ladder argument can cite instead of re-deriving the "two periods, different onsets, same footing" argument privately, which the brief says has happened at least three times already.

