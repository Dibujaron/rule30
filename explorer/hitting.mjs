/**
 * Hitting times of the recurrence orbit: from an eventually-white diagonal
 * to the next one, for every possible settled word, not only the seed's.
 *
 *   node explorer/hitting.mjs
 *
 * The settled words obey S_k(i+1) = S_{k-2}(i+2) xor (S_{k-1}(i+1) || S_k(i))
 * for every index, so S_k is the unique periodic solution driven by
 * (S_{k-2}, S_{k-1}) whenever S_{k-1} has a black cell. An eventually-white
 * diagonal at m puts the orbit in the state (S_{m-1}, S_m) = (0, w) and the
 * next eventually-white diagonal is the first m' > m with S_{m'} = 0, i.e.
 * with S_{m'-1} = shift of S_{m'-2}. Here every word w with period dividing
 * L is started from (0, w) and run until the first white word; h(w) is the
 * number of diagonals to it (S_{m+h} = 0). The seed's own h are 5, 21, 371
 * (from 2, 7, 28) and 52808, 5079, 29580 (from 399, 53207, 58286).
 *
 * Reports, per L: the minimum h over words of exact period L and over all
 * nonconstant words, with the minimising words; the count of words with
 * h <= L (a universal lower bound of L on the gap would need it to be 0);
 * the mean and median of h against 2^L (the heuristic: the white states are
 * 2^L pairs among 4^L, so the gap should be geometric with mean 2^L).
 *
 * Words are L-bit integers, bit i = value at index i (mod L). L <= 16 is
 * exhaustive; L = 32 is sampled.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const bit = (x, i, L) => (x >>> (((i % L) + L) % L)) & 1;

/** The unique L-periodic solution c of c(i+1) = a(i+2) xor (b(i+1) || c(i)); b != 0. */
export function stepF(a, b, L) {
  let i0 = -1;
  for (let i = 0; i < L; i++) if (bit(b, i + 1, L)) { i0 = i; break; }
  if (i0 < 0) throw new Error('stepF: b is white');
  let c = 0, prev = 0;
  for (let m = 0; m < L; m++) {
    const i = i0 + 1 + m;
    const v = m === 0 ? bit(a, i + 1, L) ^ 1 : bit(a, i + 1, L) ^ (bit(b, i, L) | prev);
    c = (c | (v << (i % L))) >>> 0;
    prev = v;
  }
  return c;
}

/** Steps from (0, w) to the first white word; returns { h, u } with u the word two before the white one. Capped. */
export function hitting(w, L, cap) {
  let a = 0, b = w >>> 0;
  for (let j = 1; j <= cap; j++) {
    const c = stepF(a, b, L);
    if (c === 0) return { h: j + 1, u: a };   // S_{m+j+1} = 0 with (S_{m+j-1}, S_{m+j}) = (a, b) = (u, shift u)
    a = b; b = c;
  }
  return { h: Infinity, u: -1 };
}

export function exactPeriod(w, L) {
  for (let p = 1; p < L; p *= 2) {
    const rot = ((w >>> p) | (w << (L - p))) >>> 0;
    if ((rot & ((2 ** L) - 1)) >>> 0 === w) return p;
  }
  return L;
}

const popcount = (x) => { let n = 0; while (x) { n += x & 1; x >>>= 1; } return n; };
const str = (w, L) => { let s = ''; for (let i = 0; i < L; i++) s += bit(w, i, L); return s; };

// sanity: the seed's first steps. From (0, 01) with L = 2: 01 -> 11 -> 10 -> 10 -> 00, h = 5.
{
  const r = hitting(0b10, 2, 100);
  if (r.h !== 5) throw new Error(`sanity: h from (0,01) at L=2 is ${r.h}, expected 5`);
  const r4 = hitting(0b1100, 4, 1000);
  if (r4.h !== 21) throw new Error(`sanity: h from (0,0011) at L=4 is ${r4.h}, expected 21`);
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('hitting.mjs');
const t0 = Date.now();
if (isMain) for (const L of [2, 4, 8, 16]) {
  const N = 2 ** L;
  const CAP = 4 * L;
  let minExact = Infinity, minAll = Infinity, exactCount = 0, leL = 0, leLexact = 0;
  const minimisers = [];
  const hist = new Map();
  const fullH = [];
  const doFull = L <= 8 || true;
  for (let w = 1; w < N - 1; w++) {
    const p = exactPeriod(w, L);
    if (p === L) exactCount++;
    const { h, u } = hitting(w, L, CAP);
    if (h <= L) { leL++; if (p === L) leLexact++; }
    if (h < minAll) minAll = h;
    if (p === L && h < minExact) { minExact = h; minimisers.length = 0; }
    if (p === L && h === minExact) minimisers.push({ w, u, h });
    hist.set(h, (hist.get(h) || 0) + 1);
  }
  console.log(`L = ${L}: ${N - 2} nonconstant words, ${exactCount} of exact period ${L}; cap ${CAP}`);
  console.log(`   min h over exact-period words: ${minExact}; over all nonconstant words: ${minAll}`);
  console.log(`   words with h <= L: ${leL} (of exact period: ${leLexact})`);
  const shown = new Set();
  for (const m of minimisers) {
    // one representative per shift class
    let canon = m.w; for (let s = 1; s < L; s++) { const r = ((m.w >>> s) | (m.w << (L - s))) >>> 0 & (N - 1); if (r < canon) canon = r; }
    if (shown.has(canon)) continue; shown.add(canon);
    console.log(`   minimiser w = ${str(m.w, L)} (h = ${m.h}), white preceded by u = ${str(m.u, L)} of ${popcount(m.u) % 2 ? 'odd' : 'even'} parity`);
  }
  const keys = [...hist.keys()].filter((k) => k !== Infinity).sort((a, b) => a - b);
  console.log(`   histogram of h <= ${CAP}: ${keys.map((k) => `${k}:${hist.get(k)}`).join(' ')}; beyond cap: ${hist.get(Infinity) || 0}`);
  // full hitting times, exhaustive for L <= 8, sampled for 16
  const sample = [];
  if (L <= 8) for (let w = 1; w < N - 1; w++) sample.push(w);
  else { let x = 2463534242; for (let n = 0; n < 400; n++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; const w = x % (N - 2) + 1; sample.push(w); } }
  const hs = [];
  let odd = 0;
  for (const w of sample) { const { h, u } = hitting(w, L, 50 * N); if (h !== Infinity) { hs.push(h); if (popcount(u) % 2) odd++; } }
  hs.sort((a, b) => a - b);
  const mean = hs.reduce((a, b) => a + b, 0) / hs.length;
  console.log(`   full h on ${hs.length} words: mean ${mean.toFixed(1)} (2^L = ${N}, mean/2^L = ${(mean / N).toFixed(3)}), median ${hs[hs.length >> 1]} (median/mean = ${(hs[hs.length >> 1] / mean).toFixed(3)}, ln 2 = 0.693), max ${hs[hs.length - 1]}; next white of odd parity (a doubling) in ${odd} of ${hs.length}`);
}

// L = 32: sampled words, capped at 4L; and full hitting times on a few words to see the scale
if (isMain) {
  const L = 32, CAP = 128;
  let x = 88172645, leL = 0, minH = Infinity;
  const SAMPLES = 200000;
  for (let n = 0; n < SAMPLES; n++) {
    x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    const w = x >>> 0; if (w === 0 || w === 0xffffffff) continue;
    const { h } = hitting(w, L, CAP);
    if (h <= L) leL++;
    if (h < minH) minH = h;
  }
  console.log(`L = 32: ${SAMPLES} random words, cap ${CAP}: min h ${minH}, words with h <= 32: ${leL} (heuristic expectation ${(SAMPLES * 32 / 2 ** 32).toExponential(1)})`);
}
if (isMain) console.log(`(${Date.now() - t0} ms)`);
