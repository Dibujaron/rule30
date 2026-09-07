/**
 * The centre column of the settled configuration, s(k) = S_k(0), read three ways.
 *
 *   node explorer/settledcenter.mjs
 *
 * S_k is the settled word of left diagonal k (settledwords.mjs): the periodic
 * function on Z that leftDiagonal k agrees with from its onset on, in
 * absolute phase. The settled picture S(t, x) = S_{t+x}(-x) is the rule 30
 * evolution of Sigma(x) = S_x(-x) (settledpicture.mjs), and its centre column
 * is s(k) = S_k(0). Because leftDiagonal_periodicFrom_pow gives period 2^k
 * from an onset <= 2^k, s has a closed form in the board's vocabulary:
 *
 *     s k = leftDiagonal k (2^k) = evolve (2^k + k) (-(2^k)),
 *
 * and more generally s k = leftDiagonal k N for every N >= onset with the
 * period of diagonal k dividing N. This script computes s(k) for k <= K_MAX
 * from the recurrence alone (forbit.mjs: branch bits read from the engine at
 * the eventually-white diagonals) and checks it against
 *
 *   1. the seed's column x = -N1 read downward from the left edge, i.e.
 *      evolve (N1 + k) (-N1), with N1 = 2^17 (a multiple of every period below
 *      the first period-64 diagonal, and past every onset for k <= K_MAX);
 *   2. the column x = -N2 with N2 = 100000 = 32 * 3125, likewise;
 *   3. the closed form evolve (m 2^k + k) (-(m 2^k)) for k <= 17 and every
 *      m >= 1 the engine reaches.
 *
 * Then it scans s and Sigma for eventual periodicity (last disagreement at
 * every lag, as periodscan.mjs does for the centre column, with a positive
 * control), counts their distinct factors, and compares s with the real centre
 * column c. Nothing here is a proof. See explorer/README.md.
 */

import { centerBitIndex, rows } from './rule30.mjs';
import { F, at, key } from './settledwords.mjs';

const K_MAX = 240000;
const N1 = 1 << 17;              // 131072
const N2 = 100000;               // 32 * 3125
const WIN = 64;
const j0 = (k) => Math.ceil(0.55 * k) + 16;
const KREAD = K_MAX;
const T = Math.max(Math.ceil((KREAD + 2) * 1.55) + WIN + 32, N1 + K_MAX + 1);
const KSMALL = 17;               // closed form checked for k <= KSMALL

const t0 = Date.now();
const base = centerBitIndex(T);
const bit = (row, pos) => (pos >= 0 ? Number((row >> BigInt(pos)) & 1n) : 0);

// what to read at each row
const win = new Array(KREAD + 1);
for (let k = 0; k <= KREAD; k++) win[k] = new Uint8Array(WIN);
const c = new Uint8Array(T);            // centre column
const col1 = new Uint8Array(T);         // column -N1, indexed by row
const col2 = new Uint8Array(T);         // column -N2
const small = new Map();                // row -> [[k, m], ...] with row = m 2^k + k
for (let k = 0; k <= KSMALL; k++) for (let m = 1; m * (1 << k) + k < T; m++) {
  const r = m * (1 << k) + k;
  if (!small.has(r)) small.set(r, []);
  small.get(r).push([k, m]);
}
const smallVals = new Map();            // "k,m" -> bit

{
  let t = 0;
  for (const row of rows(T)) {
    c[t] = bit(row, base);
    if (t >= N1) col1[t] = bit(row, base - N1);
    if (t >= N2) col2[t] = bit(row, base - N2);
    const sm = small.get(t);
    if (sm) for (const [k, m] of sm) smallVals.set(`${k},${m}`, bit(row, base - m * (1 << k)));
    const kLo = Math.max(0, Math.floor((t - WIN - 16) / 1.55) - 2), kHi = Math.min(KREAD, Math.ceil(t / 1.55) + 2);
    if (kLo <= kHi) {
      const posLo = base - (t - kLo);
      const width = kHi - kLo + 1;
      const slice = ((row >> BigInt(posLo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
      for (let k = kLo; k <= kHi; k++) {
        const j = t - k, m = j - j0(k);
        if (m >= 0 && m < WIN) win[k][m] = slice.charCodeAt(width - 1 - (k - kLo)) === 49 ? 1 : 0;
      }
    }
    t++;
  }
}
console.log(`engine: ${T} rows (${Date.now() - t0} ms)`);

// --- the orbit of settled words, branch bits from the picture
const matches = (S, k) => { const w = win[k]; for (let m = 0; m < WIN; m++) if (at(S, j0(k) + m) !== w[m]) return false; return true; };
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
const branches = [];
for (let k = 2; k <= K_MAX; k++) {
  const sols = F(S[k - 2], S[k - 1]);
  let s;
  if (sols.length === 1) s = sols[0];
  else {
    const ok = sols.map((x) => matches(x, k));
    const which = ok[0] && !ok[1] ? 0 : ok[1] && !ok[0] ? 1 : -1;
    branches.push({ k, type: sols[0].p > S[k - 2].p ? 'shift' : 'complement', which });
    if (which < 0) throw new Error(`branch at k = ${k}: engine window matches ${ok.filter(Boolean).length} candidates`);
    s = sols[which];
  }
  S.push(s);
}
console.log(`orbit to k = ${K_MAX}; branch points at k = ${branches.map((b) => b.k + '(' + b.type + ',' + b.which + ')').join(' ')}`);

const s = new Uint8Array(K_MAX + 1);
for (let k = 0; k <= K_MAX; k++) s[k] = at(S[k], 0);
const sigma = new Uint8Array(K_MAX + 1);
for (let x = 0; x <= K_MAX; x++) sigma[x] = at(S[x], -x);

// --- 1, 2: the seed's columns -N1 and -N2 read from the edge
for (const [N, col, name] of [[N1, col1, 'N1 = 2^17'], [N2, col2, 'N2 = 100000']]) {
  let mism = 0, first = -1, tested = 0;
  for (let k = 0; k <= K_MAX && N + k < T; k++) { tested++; if (s[k] !== col[N + k]) { mism++; if (first < 0) first = k; } }
  console.log(`s(k) vs evolve (N + k) (-N), ${name}: ${tested} values of k, ${mism} mismatches${first >= 0 ? ' (first at k = ' + first + ')' : ''}`);
}
// --- 3: the closed form at small k
{
  let mism = 0, tested = 0; const detail = [];
  for (let k = 0; k <= KSMALL; k++) {
    let ms = 0;
    for (let m = 1; m * (1 << k) + k < T; m++) { tested++; ms++; if (smallVals.get(`${k},${m}`) !== s[k]) mism++; }
    detail.push(`${k}:${ms}`);
  }
  console.log(`s(k) vs evolve (m 2^k + k) (-(m 2^k)), k <= ${KSMALL}: ${tested} cells, ${mism} mismatches (values of m per k: ${detail.join(' ')})`);
}
console.log(`s(0..119)     = ${Array.from(s.slice(0, 120)).join('')}`);
console.log(`c(0..119)     = ${Array.from(c.slice(0, 120)).join('')}`);
console.log(`Sigma(0..119) = ${Array.from(sigma.slice(0, 120)).join('')}`);
console.log(`for the kernel: s(0..12) = [${Array.from(s.slice(0, 13)).join(',')}], Sigma(0..12) = [${Array.from(sigma.slice(0, 13)).join(',')}]`);

// --- the black-time identity on the settled picture: s(t) = 1 -> s(t+1) = not S_{t-1}(1)
{
  let bad = 0;
  for (let t = 1; t < K_MAX; t++) if (s[t] === 1 && s[t + 1] !== (1 ^ at(S[t - 1], 1))) bad++;
  console.log(`black-time identity on s (t < ${K_MAX}): ${bad} violations`);
}

// --- periodicity scans
function scan(a, P, label) {
  const last = a.length - 1;
  let best = [];
  let maxTail = 0, maxP = 0;
  for (let p = 1; p <= P; p++) {
    let i = last;
    while (i - p >= 0 && a[i] === a[i - p]) i--;
    const tail = last - i;
    if (tail > maxTail) { maxTail = tail; maxP = p; }
    best.push([tail / p, p, tail]);
  }
  best.sort((u, v) => v[0] - u[0]);
  console.log(`${label}: lags 1..${P} over ${a.length} terms; longest agreeing tail ${maxTail} at lag ${maxP}; best repeats ${best.slice(0, 3).map(([r, p, tl]) => `${r.toFixed(3)} (lag ${p}, tail ${tl})`).join('; ')}`);
  return maxTail;
}
scan(s, Math.floor(K_MAX / 2), 's');
scan(sigma, Math.floor(K_MAX / 2), 'Sigma');
scan(c.subarray(0, K_MAX + 1), Math.floor(K_MAX / 2), 'c (same scan, for comparison)');
{ // positive control: period 977 from index 50000, random before
  let x = 2463534242; const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x & 1; };
  const ctl = new Uint8Array(K_MAX + 1);
  for (let i = 0; i <= K_MAX; i++) ctl[i] = i < 50000 ? rnd() : i < 50977 ? rnd() : ctl[i - 977];
  scan(ctl, Math.floor(K_MAX / 2), 'control (period 977 from 50000)');
}

// --- factor counts and statistics
function factors(a, nmax) {
  const out = [];
  for (let n = 1; n <= nmax; n++) {
    const seen = new Set(); let w = 0; const mask = (2 ** n) - 1;
    for (let i = 0; i < a.length; i++) { w = ((w * 2) + a[i]) & mask; if (i >= n - 1) seen.add(w); }
    out.push(seen.size);
  }
  return out;
}
const NF = 22;
console.log(`distinct factors of length n = 1..${NF}:`);
console.log(`   s:     ${factors(s, NF).join(' ')}`);
console.log(`   c:     ${factors(c.subarray(0, K_MAX + 1), NF).join(' ')}`);
console.log(`   Sigma: ${factors(sigma, NF).join(' ')}`);
console.log(`   2^n:   ${Array.from({ length: NF }, (_, i) => 2 ** (i + 1)).join(' ')}`);
const dens = (a) => (a.reduce((u, v) => u + v, 0) / a.length).toFixed(4);
const e = s.map((v, k) => v ^ c[k]);
console.log(`density: s ${dens(s)}, c ${dens(c.subarray(0, K_MAX + 1))}, e = c xor s ${dens(e)}, Sigma ${dens(sigma)}`);
const corr = (a, d) => { let eq = 0; for (let i = 0; i + d < a.length; i++) if (a[i] === a[i + d]) eq++; return (eq / (a.length - d)).toFixed(3); };
console.log(`P(s(t) = s(t+d)), d = 1..12: ${Array.from({ length: 12 }, (_, i) => corr(s, i + 1)).join(' ')}`);
console.log(`P(c(t) = c(t+d)), d = 1..12: ${Array.from({ length: 12 }, (_, i) => corr(c.subarray(0, K_MAX + 1), i + 1)).join(' ')}`);
console.log(`P(s(t) = c(t+d)), d = -3..3: ${[-3, -2, -1, 0, 1, 2, 3].map((d) => { let eq = 0, n = 0; for (let t = 3; t + 3 <= K_MAX; t++) { n++; if (s[t] === c[t + d]) eq++; } return (eq / n).toFixed(3); }).join(' ')}`);
// agreement of s with c as a function of k: where the onset of diagonal k is 0 they agree by definition
{
  const blocks = [];
  for (let b = 0; b < 6; b++) { const lo = b * 40000, hi = lo + 40000; let eq = 0; for (let k = lo; k < hi; k++) if (s[k] === c[k]) eq++; blocks.push((eq / 40000).toFixed(3)); }
  console.log(`P(s = c) in blocks of 40000: ${blocks.join(' ')}`);
}
console.log(`(${Date.now() - t0} ms)`);
