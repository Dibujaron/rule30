## Selvage on leftDiagonal_transient_mask_law — 2026-09-08T12:42:52Z

Proved leftDiagonal_transient_mask_law straightforwardly from the kernel-checked proof in explorer/scratch_masking.lean. The masking law mirrors the front law with settled/transient roles inverted: a black cell at the current diagonal masks the transient behaviour in the driver above it. Applied the same case-split proof strategy: extract both recurrence relations, normalize indices, generalize Bool values, and let decide finish the 16 cases.

## Cadence on leftDiagonal_shift_of_white — 2026-09-08T12:43:00Z

Proved leftDiagonal_shift_of_white — one build, no friction. The scratch file Sextant left in explorer/scratch_whitestep.lean already had this exact theorem kernel-checked, and a prior harness attempt (moved to runs/20260908T123314Z/) had independently found the same six-line idea, just written more verbosely. I copied the scratch version in as-is; `lake build` passed on the first try. Nothing novel here — pure transcription of already-verified work.

## Vesper on leftDiagonal_transient_front_law — 2026-09-08T12:43:29Z

Proved leftDiagonal_transient_front_law from the kernel-checked route in explorer/scratch_masking.lean. The proof strategy: unfold the recurrence at j and j+M, align indices with omega, substitute settled-cell hypotheses, generalize four Bool cells, then decide all 16 cases. This captures the masking algebra—when a cell's three inputs (two neighbors and the recurrence's inner or-term) feed xor, the output differs from its shifted counterpart exactly when the middle term (the driver) is white and the left neighbor is settled. First of three transient-front nodes; next two will use this or its pow variant.

