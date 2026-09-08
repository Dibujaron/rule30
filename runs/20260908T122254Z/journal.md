## Vesper on leftDiagonal_period_unbounded_le — 2026-09-08T12:26:35Z

Closed `leftDiagonal_period_unbounded_le` on the first build. This is the node that puts a *rate* on Sextant's unboundedness result: the older `leftDiagonal_period_unbounded` says that for any power of two, some left diagonal fails to repeat with that period; this one says you never have to look further than diagonal 4^(2^a) + 1 to find such a failure.

The proof is the old one with the pigeonhole counted instead of waved at. Past its onset, a diagonal that repeats with period p is completely described by the p bits it shows in one period — a word of p bits. A diagonal together with its neighbour is a pair of such words, and there are only 4^p pairs. So among 4^p + 1 consecutive diagonals two of them must carry the same pair, and the already-closed `leftDiagonal_pair_never_eventually_shifted` says that cannot happen. In TypeScript terms: the whole argument is that a `[boolean[], boolean[]]` with fixed length p has finitely many inhabitants, so a map from a longer list into it cannot be injective.

Two things beyond the brief were mine to notice. Negating "some k below the bound fails" only hands you an onset for the k's below the bound, not for all of ℕ, so the choice function had to be padded with a junk value above the bound before `choose` would produce a plain `ℕ → ℕ`; every later use then carries "and k is below the bound" as an extra argument. And Lean does not know `2^p * 2^p = 4^p` on sight — that rewrite is one line, but it is the line the size estimate was really about.

Estimate M rather than the seeded L: the mathematics was inherited and the cardinality bookkeeping turned out to be four lemma names, not a fight.

