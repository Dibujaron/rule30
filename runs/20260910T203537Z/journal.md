## Marrow on centerColumnCount_eq_stepMod_count — 2026-09-10T20:37:24Z

Closed `centerColumnCount_eq_stepMod_count` — the count of black centre cells below N now provably equals the count computed by running the truncated row map, which is the piece that makes any count about the centre column actually computable past row ~18. No real proof work: it's the two P2 dictionary lemmas (`centerColumn_eq_rowNat_testBit`, `rowNat_mod_eq_iterate`) glued together with one `Nat.testBit_mod_two_pow` fact (a bit index below the truncation width survives truncation), then `Finset.filter_congr` to lift the pointwise agreement to equal filtered sets. First `lake build` attempt succeeded, no bugs to report.

## Emmy on centerColumnCount_block — 2026-09-10T20:38:24Z

Proved `centerColumnCount_block`, which splits the count of black cells in a range additively at any boundary. This is the localisation lemma P2's balance-at-cut-points arguments need before they can work with sparse windows. The proof is straightforward induction over k, splitting the range step-by-step and using Finset cardinality lemmas to handle the partition. No rule 30 content required—it's a general property of any Bool sequence.

## Marrow on centerColumn_density_tendsto_half_of_nearby_cuts — 2026-09-10T20:39:36Z

Closed the localisation node for P2 — the one that says balance only has to be checked at a thin scattering of window sizes, not at every one. The picture: you want to know that black cells are half of the centre column in the long run, and the theorem says you may check the tally only at scattered cut points, provided every large window ends close behind one. That works because the tally moves by at most one per cell, so the stretch from the cut to the end of the window can shift the count by no more than its own length, and the hypothesis makes that length small next to the window.

The route was already written out in explorer/tessera2_scratch_cuts.lean by the seeder that proposed the node, and it built for me first try — my job was to check it against the real served lemmas rather than to find it. That is worth saying plainly: this closed in one build, and the reason is that someone had elaborated it before it was seeded. The one substantive thing I checked was that centerColumnCount_sandwich's conclusion is stated with the ℕ subtraction N - M, which is exactly what makes the `obtain ⟨g, rfl⟩ := Nat.exists_eq_add_of_le` step necessary — without rewriting N as M + g, ℕ subtraction truncates and the cast lemmas have nothing to bite on.

What it does not do, and the node's own description says so: it proves nothing about rule 30. It is true of any sequence of bits whatsoever, and the hypothesis — that balanced cuts exist arbitrarily late — is exactly as open as the prize itself. What it buys is that a future proof gets to pick where to look.

## Tally on centerColumn_density_tendsto_half_iff_excess_nat — 2026-09-10T20:41:47Z

Closed `centerColumn_density_tendsto_half_iff_excess_nat` — the nat-only, division-free restatement of the excess bridge. Nothing new here mathematically: it's a direct corollary of the already-proved `centerColumn_density_tendsto_half_iff_excess`, obtained by swapping `ε` for `1/d` in one direction and picking `d` via `exists_nat_gt (1/ε)` in the other, then clearing every division before it can touch a natural-number cast. Built clean on the first working draft after fixing a couple of swapped hypothesis names and two unknown Mathlib lemma names (`le_div_iff`/`div_le_iff` aren't in this pin under those names) by routing around division entirely with `le_of_mul_le_mul_left`. No axioms concerns expected — nothing beyond `linarith`/`nlinarith`/`field_simp`/standard order lemmas was used.

