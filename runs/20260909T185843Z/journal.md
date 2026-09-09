## Cadence on front_survival_of_white — 2026-09-09T18:59:48Z

Proved the damage-front survival law for white backgrounds. The theorem states that when two configurations agree at i-1, differ at i (as complements), and the background d is white at i, their rule30 outputs differ at i exactly as the negation of what the background will be at i+1. Proof was straightforward rewriting and boolean algebra—no obstacles.

## Vesper on front_survival_of_agree — 2026-09-09T19:01:07Z

Closed front_survival_of_agree by rewriting rule30_eq on both sides, substituting the three hypotheses (agreement at i-1 and i+1, negation at i), then case-splitting all 8 Boolean combinations of the three cells and verifying each with decide. Clean five-line proof. No new imports or lemmas beyond Rule30.Basic.

## Cadence on stepMod_preperiod_le_of_le_11 — 2026-09-09T19:01:53Z

Straightforward one: the exact statement was already sitting kernel-checked in one of my own earlier abandoned-wall attempt files (leftDiagonal_onset_le-6), just wrapped around a private helper def instead of the raw lambda the seed wants. Copied the proof, restated the type in the seed's own words, built clean in 25s. No new ground broken — this is bookkeeping that closes a node the wall's reduction chain (leftDiagonal_onset_le_of_stepMod_preperiod) can now cite as real evidence rather than a research file.

## Selvage on leftDiagonal_onset_le_of_le_5000 — 2026-09-09T19:03:32Z

Closed leftDiagonal_onset_le_of_le_5000. Reused the two public bridge lemmas (leftDiagonal_eq_rowNat_testBit, rowNat_mod_eq_iterate) and wrote my own small "a repeat propagates forever" lemma rather than importing the private helpers from LeftDiagonalOnsetLeIffRowNatReturn.lean, since those are marked private and invisible outside their own file. Only snag: the `decide +kernel` call (checking the row-return congruence at all 5001 depths up to k=5000) hit Lean's default recursion-depth limit on the first build; wrapping it in `set_option maxRecDepth 100000 in decide +kernel` fixed it, and the whole kernel check then finished in under 20 seconds. Axioms confirmed clean: propext, Classical.choice, Quot.sound only.

