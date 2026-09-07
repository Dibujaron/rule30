/**
 * What decides the branch at diagonal 53208.
 *
 *   node explorer/branch53208.mjs
 *
 * leftsides.mjs finds every configuration white far to the left on the seed's
 * side of Rowland's complement-type branch at 53208. This script looks at the
 * mechanism: for the seed and two other configurations it reads the four
 * diagonals 53205..53208 from the picture around the last black cell j* of
 * the eventually-white diagonal 53207, prints them against their settled
 * words, and reports each diagonal's onset (the last index where the actual
 * diagonal disagrees with its settled word, plus one). The recurrence
 *
 *     D_k(i+1) = D_{k-2}(i+2) xor (D_{k-1}(i+1) || D_k(i))
 *
 * says the settled word of 53208 is decided by the actual cells of 53206 and
 * 53207 at the time 53208 last resets, so the order in which the four
 * diagonals settle is the whole story.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { step } from './rule30.mjs';
import { F, at } from './settledwords.mjs';

const K0 = 53208;
const KS = [K0 - 3, K0 - 2, K0 - 1, K0];
const JMAX = 24000;
const T = K0 + JMAX + 2;
const SEED_BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0]]);

let xs = 88172645;
const rnd = () => { xs ^= xs << 13; xs >>>= 0; xs ^= xs >>> 17; xs ^= xs << 5; xs >>>= 0; return xs; };
const configs = [{ name: 'seed', cells: [0] }, { name: 'cells 0..2999 black', cells: Array.from({ length: 3000 }, (_, i) => i) }];
{ const cells = [0]; for (let x = 1; x < 3000; x++) if (rnd() & 1) cells.push(x); configs.push({ name: 'random right half (width 3000)', cells }); }

for (const cfg of configs) {
  const base = T + 2;
  let row = 0n;
  for (const x of cfg.cells) row |= 1n << BigInt(base + x);
  const D = new Map(KS.map((k) => [k, new Uint8Array(JMAX)]));
  for (let t = 0; t < T; t++) {
    for (const k of KS) if (t >= k && t - k < JMAX) D.get(k)[t - k] = Number((row >> BigInt(base - (t - k))) & 1n);
    row = step(row);
  }
  // settled words: the periodic word the tail agrees with (period 16 here), phase absolute
  const settled = (d) => {
    const p = 16; let lastBreak = -1;
    for (let i = p; i < d.length; i++) if (d[i] !== d[i - p]) lastBreak = i;
    const onset = lastBreak + 1 - p < 0 ? 0 : lastBreak - p + 1;
    const word = new Uint8Array(p);
    for (let r = 0; r < p; r++) word[r] = d[onset + (((r - onset) % p) + p) % p];
    return { p, onset, word };
  };
  const S = new Map(KS.map((k) => [k, settled(D.get(k))]));
  const e = D.get(K0 - 1);
  let jstar = -1;
  for (let j = JMAX - 1; j >= 0; j--) if (e[j] === 1) { jstar = j; break; }
  console.log(`\n${cfg.name}: j* (last black of 53207) = ${jstar}; onsets: ${KS.map((k) => `${k}:${S.get(k).onset}`).join(' ')}; settled words: ${KS.map((k) => `${k}:${Array.from(S.get(k).word).join('')}`).join(' ')}`);
  const lo = jstar - 24, hi = jstar + 56;
  console.log(`   index ${lo}..${hi} (j* marked ^ below)`);
  for (const k of KS) {
    const d = D.get(k), s = S.get(k);
    let act = '', set = '', dif = '';
    for (let j = lo; j <= hi; j++) { act += d[j]; set += at(s, j); dif += d[j] === at(s, j) ? '.' : 'X'; }
    console.log(`   D_${k} actual  ${act}\n   S_${k} settled ${set}\n   differ${''.padEnd(9)}${dif}`);
  }
  console.log(`   ${''.padEnd(19)}${''.padEnd(jstar - lo)}^ j*`);
  // the relation between the two candidates at 53208 and the transient: value at j*, and the first i > j* at which D_53206 = S_53206 for good
  const a = D.get(K0 - 2), sa = S.get(K0 - 2);
  let lastA = -1;
  for (let j = 0; j < JMAX; j++) if (a[j] !== at(sa, j)) lastA = j;
  console.log(`   diagonal 53206 (driver a) last disagrees with its settled word at index ${lastA}; j* - that = ${jstar - lastA}`);
}
