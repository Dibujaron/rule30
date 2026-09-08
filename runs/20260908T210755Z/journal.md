## Vesper on leftDiagonal_period_le_of_black_between — 2026-09-08T21:09:21Z

This node was a straight lift. In an earlier abandoned attempt at the (still-open) `leftDiagonal_period_le` wall, I had already proved exactly this reduction lemma and parked the file rather than lose it, noting in my own notebook that it should be seeded separately since it's the useful, closable half of that attempt. Rowan seeded it as its own node today with the identical statement, so I copied the proof verbatim into `Rule30/Proofs/LeftDiagonalPeriodLeOfBlackBetween.lean`, built clean first try, and confirmed the axiom list is the standard three (propext, Classical.choice, Quot.sound) via a temporary `#print axioms` line. No new proof work was needed — just recognizing the match and transcribing it.

