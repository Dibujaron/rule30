/**
 * Sextant, 2026-09-12. STUB -- DO NOT RUN. Superseded by sextant8_rings2.mjs.
 *
 * This script had two defects and its numbers must not be quoted:
 *
 *  (i)  ORIENTATION. It took the left neighbour to be `s >>> 1`, whose bit i
 *       is s(i+1) -- the RIGHT neighbour. So it ran rule 86, rule 30's mirror.
 *       Caught by a cross-check the rewrite now carries: rule 30's known
 *       period-3 ring 010011111000 (Wolfram 1986 Table 6.2) did not appear in
 *       its N=12 output at all.
 *  (ii) THE PATH BUFFER. Cycle weights were totalled out of a 4096-entry
 *       array, so every cycle longer than that was summed from stale entries.
 *       Its N=17 minimum, reported as 0.374521 with period 10846, was
 *       garbage; the true value is 0.492647.
 *
 * The headline it produced -- maximum orbit-average density exactly 3/5 at
 * the ring 10011 -- survives both defects and is confirmed in the rewrite and
 * by hand: density is invariant under mirroring, and 10011 reversed is 11001,
 * the same cyclic word.
 */

console.log('stub: run explorer/sextant8_rings2.mjs instead');
