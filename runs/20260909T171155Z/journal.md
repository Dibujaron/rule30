## Cadence on leftDiagonal_onset_le_iff_rowNat_return — 2026-09-09T17:13:47Z

Closed the node in one build, and almost none of the credit is mine — the proof was sitting in Vesper's parked file from yesterday's fourth run at the onset wall, which failed to close that wall but produced this equivalence along the way. My job was to work out which two-thirds of that file the theorem actually depends on, cut the rest, and check it still stood up. It did.

What's worth your attention is what the theorem now says. The onset wall used to be a claim about diagonals: does the k-th diagonal of the picture fall into its repeating pattern by index k? That's a dynamical question and four sessions have now failed on it. This node proves it is *identical* — an iff, not a reduction, so nothing was given up in the trade — to an arithmetic question: read each row of the picture as a binary number, and ask whether row 2k and row 2k + 2^k agree in their lowest k+1 digits, for every k.

The reason those are the same question is that the low end of a row is self-contained. Cell b of the next row reads only cells b-2, b-1 and b of this one, so the low k+1 cells evolve without ever consulting anything further right — like a pure function over a fixed-width slice, where the rest of the row is out of scope. So if two rows ever agree on that slice, they agree on it for ever after. That's the backward half. The forward half needed one small piece of bookkeeping I'd hit before: the wall hands you *some* repetition length at an early index, and you need the specific length 2^k at that same early index, which takes a short argument walking forward a whole number of the known lengths and back.

The wall itself still stands. But it now stands in a different room — it is a statement about one orbit of one arithmetic map, where an arithmetic argument might reach it, rather than a statement about a cellular automaton, where four dynamical arguments have not.

## Vesper on leftDiagonal_agree_succ_iff — 2026-09-09T17:14:17Z

Proved `leftDiagonal_agree_succ_iff` — first try, no build failures. Found the exact recurrence lemma (`leftDiagonal_recurrence`) already served, applied it twice at the right offsets, and the whole agreement condition collapsed to an 8-case decidable Bool check. Axioms confirmed as just `propext, Quot.sound` per the brief. Nothing unusual to report.

## Cadence on leftDiagonal_onset_le — 2026-09-09T17:24:45Z

Cadence here, on the onset wall for the sixth time this project has tried it. I did not prove it and did not expect to; what I did was cheap and, I think, the right cheap thing.

The board has moved under this node. The three pieces earlier attempts left parked — the bridge from diagonals to the bits of a row read as a number, the "wall is exactly a congruence per depth" equivalence, and the agreement-run lemma — are all closed nodes now, so the file rebuilds on imports rather than copies, and keeps the kernel check to depth 5000 as its evidence.

The one new theorem is the law of the settled boundary, read along rows. Picture a row of the triangle with time running down and the settled, repeating cells at its left end. Where the settled cells stop, there is a boundary. The theorem says the boundary moves one cell inward on a step exactly when the settled cell just inside it is black, and stands perfectly still when that cell is white — not "may fail to move", but frozen. Both directions are proved, so the wall now has an exact shape: the boundary must be frozen on fewer than half of the steps. That is the same sentence Vesper wrote as a particle picture; it is now a theorem about two rows of the picture read as binary numbers rather than a reading.

In TypeScript terms: the previous attempts gave the wall a type (an iff with a concrete congruence), and this one gives the induction step its exact type (an iff again). What nobody has is the value — a reason the white freezes cannot add up to half the steps. The freeze at a boundary lasts as long as the white run on the diagonal just inside, and the two agreement lemmas say what a white run is made of; the pieces at the bottom of the picture (the first five diagonals are constant or alternating) kill the simple kind of long run, and the other kind is unbounded by anything on the board. I stopped there rather than spend the budget on a fourth conditional restatement.

Two proposals go out with this report: the boundary law itself as a node, with a self-contained proof that builds, and the period-transfer lemma that two closed files now carry privately.

