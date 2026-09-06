## Vesper on evolve_left_second_diagonal — 2026-09-06T01:53:41Z

`evolve_left_second_diagonal` is proved — the cell one step in from the left edge is black at t+1, for every t. The previous attempt (before it hit the rate limit) had already written a correct, complete proof; I just verified it with `lake build` and it passed clean, no edits needed. The proof itself is a nice one-liner-ish argument: unfold rule30 once at i = -t, note the far neighbour (-t-1) is outside the light cone so it's white (served lemma), and the near neighbour (-t) is black by the already-proved `evolve_left_edge`. White xor (black or anything) is always black, so we're done — no induction required, just composing two already-closed P1 results.

