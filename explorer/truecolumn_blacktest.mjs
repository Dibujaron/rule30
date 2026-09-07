/**
 * The black-time identity on the true centre column, to depth N.
 *
 *   node explorer/truecolumn_blacktest.mjs
 *
 * The identity a configuration white far to the left must satisfy at every
 * black time t of its column 0 -- c(t+1) = not L(t), with L column -1 of the
 * half-line x <= -1 driven by c from the left word -- is run here on the
 * single seed's own centre column with a white left word. It must pass at
 * every black time, because it is `sideways_inverse` at position 0 with the
 * centre black; a failure would mean the half-line model here or the engine
 * is wrong, not the automaton. The half-line is the BigInt of
 * sparseleft.mjs; the centre column comes from the engine independently.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { centerColumnBits } from './rule30.mjs';

const N = 200000;

const c = centerColumnBits(N + 1);
let x = c[0] ? 1n : 0n;
let black = 0, failures = 0, firstFail = -1;
for (let t = 0; t < N; t++) {
  if (c[t] === 1) {
    black++;
    const L = Number((x >> 1n) & 1n);
    if (c[t + 1] !== 1 - L) { failures++; if (firstFail < 0) firstFail = t; }
  }
  x = ((x >> 1n) ^ (x | (x << 1n))) & ~1n;
  if (c[t + 1]) x |= 1n;
}
console.log(`true centre column, ${N} rows: ${black} black times, ${failures} failures of c(t+1) = not L(t)${firstFail >= 0 ? ', first at t=' + firstFail : ''}`);
