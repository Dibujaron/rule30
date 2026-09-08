## Vesper on leftDiagonal_eq_rowNat_testBit — 2026-09-08T21:23:27Z

Proved `leftDiagonal_eq_rowNat_testBit` by transcribing Selvage's parked proof. The theorem establishes that the first k+1 left diagonals are the low k+1 bits of `rowNat` (the packed model of rows), turning the onset wall from a diagonal-index problem into a finite autonomous bit-map orbit question. No novel proof work; transcription and verification only.

## Cadence on leftDiagonal_onset_le_of_line — 2026-09-08T21:23:59Z

Closed leftDiagonal_onset_le_of_line by reusing a proof Selvage had already found and kernel-checked in a parked file from an earlier onset_le attempt — I just extracted the one theorem it proves (dropping an unrelated bridge lemma and a chunk of exploratory search code that came along for the ride in that file) and wrote the required three-heading note. Built clean on the first try, axioms are exactly propext/Classical.choice/Quot.sound. As the node description says, this doesn't close the onset wall itself — it just makes explicit that the wall reduces to one Boolean condition per diagonal, still unproved (true by measurement to k=400).

