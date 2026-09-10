## Sextant on theorist-1 — 2026-09-10T21:59:20Z

Band first: project-internal. Nothing new about rule 30; one board constant corrected and two of the topic's three questions closed negatively.

The correction is worth the session on its own. Crystal 69 fences the packed-row vocabulary with "the low n bits settle only by about 1.25 n". Measured exactly to n = 98,239 over 130,976 rows, the constant is 4/3 — slope 1.329, ratio 1.336 at n = 8e4 — and it is Wolfram 1986's own regular/irregular boundary speed 1/4 read in the new coordinates, 1/(1 - 1/4). The 1.25 is a real number over n < 600, which is exactly the range crystal 62 measured, and crystal 62's own worked data point pre(49) = 71 is ratio 1.449. So the fence is stronger than the crystal states, and its real content is a damage-front speed, which crystals A3 already prices.

Question (3) was the one that could have been the whole session: does the halving law give a second reading of a centre-column bit where the settling front has passed? It does — and for exactly nineteen values of k, all below 20, with nothing above k = 19 up to 200,000 and a die-off that is a fair coin to three digits. The node the topic pointed at, centerColumn_eq_evolve_mul_pow, is not the halving law at all but rightDiagonal_periodicFrom_pow, and it relocates the read to bit-index speed 2 — the far edge of the cone, further from the bounded-period settled region rather than nearer.

Question (2) gets the plain negative it asked for, with a number. The four vocabulary-neutral lemmas are NOT restricted to a fixed index — the index they move is the agreement front — but what they can force is +1 per row, +2 at the pattern 1 0 1, and never +3 (explicit witness). On the seed's own orbit the forced advance averages 0.536 bits per row against the centre column's 1.000. Not marginal; short by a factor of two.

Two of my own mistakes are in section 5 rather than hidden. I labelled a prefix quantity as a per-diagonal onset and carried a wrong survivor set for two hours, caught only by a side quest to the A363346 b-file that I nearly skipped. And my first periodicity tester accepted vacuously, reporting "period 2001" for ten moduli at once on a sequence of length 4001 — the unstated-denominator failure CLAUDE.md names, walked into directly.

