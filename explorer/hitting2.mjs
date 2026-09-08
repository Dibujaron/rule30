/**
 * Hitting times from the words a doubling can actually produce, and the
 * eight-step family.
 *
 *   node explorer/hitting2.mjs
 *
 * hitting.mjs showed that over all words of period L the next white diagonal
 * can be 8 steps away for every L >= 8. But the word the orbit holds right
 * after a doubling is not arbitrary: it is a running xor of a word with odd
 * parity, so it is antiperiodic, w(i + L/2) = not w(i). This script asks
 *
 *   W(L) = min over antiperiodic w of the distance from (0, w) to the first
 *          white diagonal of any kind;
 *   T(L) = min over antiperiodic w, and over every branch choice at the
 *          even-parity (complement-type) whites on the way, of the distance
 *          to the first odd-parity white, i.e. to the next doubling.
 *
 * The wall leftDiagonal_period_le would follow from T(2^n) >= 2^n for all n
 * (with k_1 = 3): the n-th doubling would then sit at k_n >= 2^n - 1.
 * Exhaustive for L = 2..32 (antiperiodic words are 2^(L/2)); L = 64 sampled.
 * Then the family w = 1^(L-5) 0 0 1 0 0 for every L from 8 to 32, which
 * hitting.mjs found at h = 8 for L = 8, 16, 32.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { stepF, hitting, exactPeriod } from './hitting.mjs';

const popcount = (x) => { let n = 0; while (x) { n += x & 1; x >>>= 1; } return n; };
const bits = (x, L) => { let s = ''; for (let i = 0; i < L; i++) s += (x >>> i) & 1; return s; };
const mask = (L) => (L === 32 ? 0xffffffff : (2 ** L) - 1) >>> 0;
const isAnti = (w, L) => { const h = L / 2; const rot = ((w >>> h) | (w << h)) >>> 0 & mask(L); return ((rot ^ w) >>> 0) === mask(L); };

/** Running xor of shift(u): the two continuations after a white preceded by u; returns [w0, w1] (period L each; parity of u must be even). */
function continuations(u, L) {
  let w0 = 0, prev = 0;
  for (let i = 0; i < L; i++) { w0 = (w0 | (prev << i)) >>> 0; prev ^= (u >>> ((i + 2) % L)) & 1; }
  return [w0, (~w0 & mask(L)) >>> 0];
}

/** Distance from (0, w) to the first odd-parity white, minimised over branches, capped. */
function toDoubling(w, L, cap) {
  let best = Infinity;
  const stack = [{ w, d: 0 }];
  while (stack.length) {
    const { w: x, d } = stack.pop();
    if (d >= best) continue;
    const { h, u } = hitting(x, L, cap - d);
    if (h === Infinity) continue;
    if (popcount(u) & 1) { if (d + h < best) best = d + h; continue; }
    for (const y of continuations(u, L)) stack.push({ w: y, d: d + h });
  }
  return best;
}

const t0 = Date.now();
for (const L of [2, 4, 8, 16, 32]) {
  const CAP = 2 * L + 8;
  const half = L / 2, H = 2 ** half;
  let Wmin = Infinity, Tmin = Infinity, count = 0;
  const Wwords = [], Twords = [];
  const hist = new Map();
  for (let lo = 0; lo < H; lo++) {
    const w = ((lo | (((~lo) & (H - 1)) << half)) >>> 0);   // upper half is the complement of the lower half
    if (!isAnti(w, L)) throw new Error('not antiperiodic');
    count++;
    const { h } = hitting(w, L, CAP);
    hist.set(h, (hist.get(h) || 0) + 1);
    if (h < Wmin) { Wmin = h; Wwords.length = 0; }
    if (h === Wmin) Wwords.push(w);
    const t = toDoubling(w, L, CAP);
    if (t < Tmin) { Tmin = t; Twords.length = 0; }
    if (t === Tmin) Twords.push(w);
  }
  const keys = [...hist.keys()].filter((k) => k !== Infinity).sort((a, b) => a - b);
  console.log(`L = ${L}: ${count} antiperiodic words, cap ${CAP}`);
  console.log(`   W(L) = ${Wmin} (first white of any kind), e.g. w = ${Wwords.length ? bits(Wwords[0], L) : '-'}; words at W: ${Wwords.length}`);
  console.log(`   T(L) = ${Tmin} (first doubling over all branches), e.g. w = ${Twords.length ? bits(Twords[0], L) : '-'}; words at T: ${Twords.length}; T(L) >= L: ${Tmin >= L}`);
  console.log(`   histogram of first-white distance <= ${CAP}: ${keys.map((k) => `${k}:${hist.get(k)}`).join(' ')}; beyond: ${hist.get(Infinity) || 0}`);
}
// L = 64 needs 64-bit words; sample with BigInt-free two-limb arithmetic is not worth it here: skipped.

// the eight-step family for even L from 34 to 128, with array words (no 32-bit limit)
{
  const stepArr = (a, b, L) => {
    let i0 = -1; for (let i = 0; i < L; i++) if (b[(i + 1) % L]) { i0 = i; break; }
    if (i0 < 0) return null;
    const c = new Uint8Array(L); let prev = 0;
    for (let m = 0; m < L; m++) { const i = i0 + 1 + m; const v = m === 0 ? a[(i + 1) % L] ^ 1 : a[(i + 1) % L] ^ (b[i % L] | prev); c[i % L] = v; prev = v; }
    return c;
  };
  const res = [];
  for (let L = 34; L <= 128; L += 2) {
    const w = new Uint8Array(L).fill(1); w[L - 5] = 0; w[L - 4] = 0; w[L - 2] = 0; w[L - 1] = 0;
    let a = new Uint8Array(L), b = w, h = Infinity;
    for (let j = 1; j <= 64; j++) { const c = stepArr(a, b, L); if (c.every((v) => v === 0)) { h = j + 1; break; } a = b; b = c; }
    res.push(`${L}:${h}`);
  }
  console.log(`the family for even L = 34..128, h = ${res.join(' ')}`);
}

// the eight-step family for every L from 8 to 32
{
  const out = [];
  for (let L = 8; L <= 32; L++) {
    // w(i) = 1 except w(L-5) = w(L-4) = 0, w(L-3) = 1, w(L-2) = w(L-1) = 0 : written as bit string with index 0 first that is 1^(L-5) 00100
    let w = mask(L);
    for (const i of [L - 5, L - 4, L - 2, L - 1]) w = (w & ~(1 << i)) >>> 0;
    const { h, u } = hitting(w, L, 64);
    out.push(`L=${L}: h=${h} exact period ${exactPeriod(w, L)} u=${bits(u, L)} ${popcount(u) & 1 ? 'odd' : 'even'}`);
  }
  console.log('the family w = 1^(L-5) 00100:');
  for (const s of out) console.log('   ' + s);
  // the orbit itself at L = 16
  const L = 16; let w = mask(L); for (const i of [L - 5, L - 4, L - 2, L - 1]) w = (w & ~(1 << i)) >>> 0;
  let a = 0, b = w; const words = [bits(a, L), bits(b, L)];
  for (let j = 0; j < 8; j++) { const c = stepF(a, b, L); words.push(bits(c, L)); if (c === 0) break; a = b; b = c; }
  console.log(`   orbit at L = 16 from (0, w): ${words.join(' -> ')}`);
}
console.log(`(${Date.now() - t0} ms)`);
