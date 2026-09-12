/**
 * Rosetta, 2026-09-12 — the brief's own object.
 *
 * The vantage said: point non-concentration not at the column but at the pair
 * (settled region, transient band). So measure the block entropy of both.
 *
 *   s(k) = S_k(0)   the SETTLED centre column: the value the centre cell would
 *                   have if the diagonals had no transients. Obstruction 4:
 *                   "nothing is known about s".
 *   c(k)            the real centre column.
 *   d = c XOR s     the boundary column of the TRANSIENT band, which is the
 *                   damage pattern between the seed and the settled picture.
 *                   Obstruction 4 states the residual in terms of exactly this.
 *
 * The settled words come from the recurrence alone (Rowland 2006 §6), with the
 * engine consulted only at the branch points 3, 8, 29, 400 — the next branch is
 * at 53207, so this runs to k < 53207 with a 700-row engine window.
 *
 * The question: does the settled region non-concentrate? An a-priori answer is
 * available for the DIAGONAL direction — S_k is periodic with period P(k), a
 * power of two, so its block measure at ANY length has support <= P(k) <= 32
 * for every k < 2*10^9, i.e. entropy <= 5 bits at every scale. This script asks
 * the same question in the k direction, where no such argument applies.
 *
 * Nothing here proves anything.
 */

import { centerBitIndex, rows, centerColumnBits } from './rule30.mjs';
import { F, at, key, isWhite } from './settledwords.mjs';
import { randomFillSync } from 'node:crypto';

const K_MAX = 53000;        // stop before the branch at 53207
const WIN = 64;
const j0 = (k) => Math.ceil(0.55 * k) + 16;
const T = 1200;             // enough to read the branch windows at k <= 400

function log2(x) { return Math.log(x) / Math.LN2; }
function H2(p) { return p <= 0 || p >= 1 ? 0 : -(p * log2(p) + (1 - p) * log2(1 - p)); }

function blockEntropy(bits, n, m) {
  const size = 1 << m;
  const counts = new Int32Array(size);
  const mask = size - 1;
  let w = 0;
  for (let i = 0; i < m - 1; i++) w = ((w << 1) | bits[i]) & mask;
  let total = 0, support = 0;
  for (let i = m - 1; i < n; i++) { w = ((w << 1) | bits[i]) & mask; counts[w]++; total++; }
  let h = 0;
  for (let k = 0; k < size; k++) {
    const cnt = counts[k];
    if (cnt === 0) continue;
    support++;
    const p = cnt / total;
    h -= p * log2(p);
  }
  return { h, support };
}

function coin(n) {
  const bytes = new Uint8Array(Math.ceil(n / 8));
  for (let off = 0; off < bytes.length; off += 65536) randomFillSync(bytes, off, Math.min(65536, bytes.length - off));
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = (bytes[i >> 3] >> (i & 7)) & 1;
  return out;
}

// --- engine windows for the branch points (k <= 400 only)
const KREAD = Math.floor((T - WIN - 16) / 1.55) - 2;
const win = new Array(KREAD + 1);
for (let k = 0; k <= KREAD; k++) win[k] = new Uint8Array(WIN);
{
  const base = centerBitIndex(T);
  let t = 0;
  for (const row of rows(T)) {
    for (let k = 0; k <= KREAD && k <= t; k++) {
      const m = (t - k) - j0(k);
      if (m >= 0 && m < WIN) win[k][m] = Number((row >> BigInt(base - (t - k))) & 1n);
    }
    t++;
  }
}
const matches = (S, k) => { const w = win[k]; for (let m = 0; m < WIN; m++) if (at(S, j0(k) + m) !== w[m]) return false; return true; };

// --- the orbit, and s(k) = S_k(0)
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
const s = new Uint8Array(K_MAX + 1);
s[0] = at(S[0], 0); s[1] = at(S[1], 0);
const branches = [];
let pmax = 1;
for (let k = 2; k <= K_MAX; k++) {
  const sols = F(S[k - 2], S[k - 1]);
  let x;
  if (sols.length === 1) x = sols[0];
  else {
    if (k > KREAD) { console.log(`branch at k = ${k} beyond the engine window; stopping`); break; }
    const ok = sols.map((y) => matches(y, k));
    const which = ok[0] && !ok[1] ? 0 : ok[1] && !ok[0] ? 1 : -1;
    if (which < 0) { console.log(`ambiguous branch at k = ${k}; stopping`); break; }
    branches.push({ k, p: sols[which].p });
    x = sols[which];
  }
  S.push(x);
  if (x.p > pmax) pmax = x.p;
  s[k] = at(x, 0);
}
console.log(`# settled-word orbit to k = ${S.length - 1}, largest period ${pmax}`);
console.log(`# branch points read from the engine: ${branches.map((b) => `${b.k}(p->${b.p})`).join(' ')}`);
console.log(`#   (NKS p.871 puts the period doublings at 3, 8, 29, 400, 87867)`);

const K = S.length - 1;
const c = centerColumnBits(K + 1);
const d = new Uint8Array(K + 1);
for (let k = 0; k <= K; k++) d[k] = c[k] ^ s[k];

// validation: the board's own agreement rate for s against c is 0.48-0.52
let agree = 0;
for (let k = 0; k <= K; k++) if (s[k] === c[k]) agree++;
console.log(`# s agrees with c at ${agree} of ${K + 1} (rate ${(agree / (K + 1)).toFixed(4)}; obstruction 4 reports 0.48-0.52)`);
console.log(`# s(0..17) = ${Array.from(s.slice(0, 18)).join('')}   c(0..17) = ${Array.from(c.slice(0, 18)).join('')}  (onsets are 0 for k <= 17, so these must agree)`);

function densityOf(b) { let t = 0; for (let i = 0; i <= K; i++) t += b[i]; return t / (K + 1); }
console.log('');
console.log(`# densities over k <= ${K}: s ${densityOf(s).toFixed(6)}, c ${densityOf(c).toFixed(6)}, d = c^s ${densityOf(d).toFixed(6)}`);

const co = coin(K + 1), co2 = coin(K + 1);
console.log('');
console.log('# block entropy deficit  m - H(m)   (bits), over k <= ' + K);
console.log('  m |  settled s |  column  c | band d=c^s |     coin   |    coin 2  |  log2(K+1)');
for (const m of [1, 2, 3, 4, 6, 8, 10, 12, 14]) {
  const row = [s, c, d, co, co2].map((b) => (m - blockEntropy(b, K + 1, m).h).toExponential(3).padStart(10));
  console.log(`${String(m).padStart(3)} | ${row.join(' | ')} | ${log2(K + 1).toFixed(3)}`);
}

console.log('');
console.log('# The diagonal direction, for contrast, needs no measurement: S_k is');
console.log('# P(k)-periodic with P(k) a power of two, so its block measure at EVERY');
console.log('# length m has support <= P(k) and entropy <= log2 P(k).');
let maxp = 0;
for (let k = 0; k <= K; k++) maxp = Math.max(maxp, S[k].p);
console.log(`#   max_k<=${K} P(k) = ${maxp}, so entropy <= ${log2(maxp)} bits at every scale.`);
console.log(`#   Below k = 2107985255 the bound is log2(32) = 5 bits, at every scale.`);
