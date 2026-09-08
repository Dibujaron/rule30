## Selvage on leftDiagonal_transient_mask_law — 2026-09-08T12:42:52Z

Proved leftDiagonal_transient_mask_law straightforwardly from the kernel-checked proof in explorer/scratch_masking.lean. The masking law mirrors the front law with settled/transient roles inverted: a black cell at the current diagonal masks the transient behaviour in the driver above it. Applied the same case-split proof strategy: extract both recurrence relations, normalize indices, generalize Bool values, and let decide finish the 16 cases.

## Cadence on leftDiagonal_shift_of_white — 2026-09-08T12:43:00Z

Proved leftDiagonal_shift_of_white — one build, no friction. The scratch file Sextant left in explorer/scratch_whitestep.lean already had this exact theorem kernel-checked, and a prior harness attempt (moved to runs/20260908T123314Z/) had independently found the same six-line idea, just written more verbosely. I copied the scratch version in as-is; `lake build` passed on the first try. Nothing novel here — pure transcription of already-verified work.

## Vesper on leftDiagonal_transient_front_law — 2026-09-08T12:43:29Z

Proved leftDiagonal_transient_front_law from the kernel-checked route in explorer/scratch_masking.lean. The proof strategy: unfold the recurrence at j and j+M, align indices with omega, substitute settled-cell hypotheses, generalize four Bool cells, then decide all 16 cases. This captures the masking algebra—when a cell's three inputs (two neighbors and the recurrence's inner or-term) feed xor, the output differs from its shifted counterpart exactly when the middle term (the driver) is white and the left neighbor is settled. First of three transient-front nodes; next two will use this or its pow variant.

## Selvage on leftDiagonal_onset_le — 2026-09-08T13:11:25Z

I did not prove the wall, and I now think its shape is exactly what Rowan and Sextant wrote down: a bound on how fast a front moves, not a property the induction can see one diagonal at a time. What I could do was make the residual small and concrete, and test whether the seed is special.

Two theorems are in the file and both build. One is a dictionary line: the k-th diagonal, read along its index, is just bit k of the packed row numbers, so the first k+1 diagonals are the low k+1 bits of `rowNat` — a finite state machine on 2^(k+1) states, like a reducer over a fixed-width bitfield. The wall says that machine, started from 1, hits its cycle within 2k steps. The other theorem is the wall with its induction step laid bare: if at every step the settled cell sitting on the half-speed line is black, or the new diagonal is already settled one cell to the right of that line, then every diagonal settles by index k. Everything in that proof is served lemmas; the hypothesis is the whole difficulty, one Bool per diagonal, and it holds for the seed only because the transient band never gets near the line.

The computation is the part I would want Dib to see. I asked the onset question not just of the seed but of every possible boundary column driving the left half — 4096 of them exhaustively to k = 12, a beam search to k = 60, and rows with extra black cells to k = 400. The bound never breaks; the worst ratio anyone reaches is about 0.65, and the adversary's best trick is to reproduce the seed's own left side shifted 8 cells along the edge. So the slow front is a property of the rule, not of the single seed, which is mildly good news for a theorist and no news for a prover: the reason is still unwritten.

