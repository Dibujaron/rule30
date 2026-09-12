## Vesper on rightDiagonal_cone — 2026-09-12T17:17:52Z

Proved `rightDiagonal_cone` — row 2^k is white at the k cells just left of its black right edge, which is Rowland's 2006 Theorem 1 for rule 30 in mirror orientation. This was pure retrieval: Sextant (theorist) had already worked out and kernel-checked the full route in `explorer/sextant10_scratch_cone.lean` earlier today, so I just pulled the four theorems this node actually needs out of that much larger scratch file (which also has follow-on machinery for a sharper "exact gap" node, not needed here) and built it clean. No new mathematics from me — the credit is Sextant's, and the brief was right that this closes cheaply once someone reads the scratch file.

Per CLAUDE.md's reporting bands: known as a statement (real literature fact about rule 30), project-internal as a proof (retires a mis-priced ingredient in crystal 11, doesn't advance any prize conjecture — the brief is explicit the region was fenced the same day).

## Vesper on rightDiagonal_edge_gap_eq — 2026-09-12T17:21:08Z

Closed `rightDiagonal_edge_gap_eq` first try. Band first, as the project asks: **known-adjacent, with a new proof — and the "new" part is not established.** Rowland proves the black-run sibling in his section 1 and asserts this two-way form in his introduction; nobody here has read his section 3, so this is a new phrasing carrying a proof rather than a new theorem. It bears on no prize conjecture and sits behind the same fence as `rightDiagonal_cone`.

What it says, in the picture: every row of rule 30 ends in a black cell at its far right, then a stretch of white, then black again. This pins the width of that white stretch exactly. Read the diagonals running down-and-right from the top — each one repeats with its own period, always a power of two. The gap in row `p` is exactly the depth of the first diagonal whose period does not divide `p`. So the eleven measured void widths Cairn recorded (0, 2, 3, 5, 6, 8, 14, 15, 23, 24, 26) stop being an observation and become a consequence.

This was retrieval rather than derivation, and I want to be plain about that: Sextant had already written and kernel-checked the whole route in `explorer/sextant10_scratch_cone.lean`. My work was the pruning — that file holds fourteen declarations serving several different nodes, and this one needs eleven of them; the cone-in-diagonal-coordinates half, Rowland's `a(n) ≥ n+1` corollary, and an entire backward-line section all drop out. Tracing which helpers are genuinely reached before deleting is the part that takes care: one of them (`rd_minimalPeriod_pow`) reads like decoration for a docstring and is in fact load-bearing in both branches of the final case split.

Two things I did rather than took on trust. I checked the axiom list myself with `#print axioms` instead of relaying Sextant's print of it — it came back `[propext, Classical.choice, Quot.sound]`, which is clean. And I left two `push_neg` deprecation warnings in place rather than "tidying" them: the build succeeds, and silently rewriting tactics in a proof I did not author to quiet a cosmetic warning is how a working proof becomes a broken one.

The one genuinely interesting step, if you want the shape of it without the Lean: the hypothesis is *negative* — some diagonal's period fails to divide the row number — and the conclusion needs something *positive*, that this diagonal is the exact colour-flip of itself `p` rows on. You get from one to the other by running a served lemma backwards twice: if a certain parity were even, the period *would* divide, contradiction, so the parity is odd, so the flip happens. Same move a second time at twice the period, to show the row number is an odd multiple. That double contrapositive is the whole content, and none of it is visible in the statement.</journal>
</invoke>


