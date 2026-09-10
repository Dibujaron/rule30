// sextant7_forced.mjs   (Sextant, 2026-09-10)
//
// Question (2) of the topic: do rowStep_agree_forward, rowStep_agree_succ_iff,
// rowStep_agree_succ_two_iff and stepMod_iterate_eq_rowStep_mod say anything
// about a MOVING index?
//
// They do.  The index they move is the agreement front A(t) (see
// sextant7_front.mjs).  This file measures how fast they can FORCE it forward,
// against the centre column's own speed of exactly 1 bit per row.
//
// From bit b of rowStep r = r_(b-2) XOR (r_(b-1) OR r_b), with the first
// difference between x and y at bit A:
//   * out bits < A always agree                              (agree_forward)
//   * out bit A   agrees iff x_(A-1) = 1                     (agree_succ_iff)
//   * out bit A+1 agrees iff (x_A|x_(A+1)) = (y_A|y_(A+1))   (agree_succ_two_iff)
//        -- mentions y; but x_A = 0 forces y_A = 1 and it collapses to
//           x_(A+1) = 1, a condition on x alone.  So the triple (1,0,1) at
//           bits (A-1, A, A+1) forces a TWO-bit advance from x alone.
//   * out bit A+2 needs y in every case: nothing forces +3.
// So forced(t) = 0 if x_(A-1)=0; 2 if (x_(A-1),x_A,x_(A+1)) = (1,0,1); else 1.
//
// Parameters in the file, no arguments.

const WORDS = 512, NBITS = WORDS * 32, LAG = 32, TMAX = 20000;
function zero() { return new Uint32Array(WORDS); }
const s1 = zero(), s2 = zero();
function shl(dst, src, k) { for (let i = WORDS - 1; i >= 0; i--) dst[i] = ((src[i] << k) | (i > 0 ? (src[i - 1] >>> (32 - k)) : 0)) >>> 0; }
function step(dst, src) { shl(s1, src, 2); shl(s2, src, 1); for (let i = 0; i < WORDS; i++) dst[i] = (s1[i] ^ ((s2[i] | src[i]) >>> 0)) >>> 0; }
function bit(a, b) { return b < 0 || b >= NBITS ? 0 : (a[b >>> 5] >>> (b & 31)) & 1; }
function ctz32(v) { let c = 0; if (!(v & 0xffff)) { c += 16; v >>>= 16; } if (!(v & 0xff)) { c += 8; v >>>= 8; } if (!(v & 0xf)) { c += 4; v >>>= 4; } if (!(v & 3)) { c += 2; v >>>= 2; } if (!(v & 1)) c += 1; return c; }
function firstDiff(a, b, w0) { for (let i = w0; i < WORDS; i++) { const d = (a[i] ^ b[i]) >>> 0; if (d) return i * 32 + ctz32(d); } return NBITS; }

console.log('=== control: pre(n) by lag-32 first agreement vs brute-force rho ===');
{
  let bad = 0;
  for (let n = 1; n <= 18; n++) {
    const M = 2 ** n, seen = new Map();
    let r = 1 % M, t = 0;
    while (!seen.has(r)) { seen.set(r, t); r = (((4 * r) ^ ((2 * r) | r)) >>> 0) % M; t++; }
    const brute = seen.get(r);
    let a = 1 % M, b = 1 % M;
    for (let i = 0; i < 32; i++) b = (((4 * b) ^ ((2 * b) | b)) >>> 0) % M;
    let s = 0;
    while (a !== b && s < 100000) { a = (((4 * a) ^ ((2 * a) | a)) >>> 0) % M; b = (((4 * b) ^ ((2 * b) | b)) >>> 0) % M; s++; }
    if (s !== brute) { bad++; console.log(`  MISMATCH n=${n}: brute ${brute}, lag32 ${s}`); }
  }
  console.log(`  n = 1..18: ${bad} mismatches`);
}

let X = zero(); X[0] = 1;
let Y = zero(); Y[0] = 1;
{ const t = zero(); for (let i = 0; i < LAG; i++) { step(t, Y); Y.set(t); } }
const tX = zero(), tY = zero();
let A = firstDiff(X, Y, 0), sumF = 0, sumA = 0, n = 0, unsound = 0, iffBad = 0;
const hist = new Map();
for (let t = 0; t <= TMAX; t++) {
  if (A >= NBITS - 64) break;
  const u = bit(X, A - 1), v = bit(X, A), w = bit(X, A + 1);
  const forced = (u === 0) ? 0 : ((v === 0 && w === 1) ? 2 : 1);
  step(tX, X); X.set(tX); step(tY, Y); Y.set(tY);
  const A2 = firstDiff(X, Y, A >>> 5), actual = A2 - A;
  if (actual < forced) unsound++;
  if ((actual >= 1) !== (u === 1)) iffBad++;
  sumF += forced; sumA += actual; n++; hist.set(forced, (hist.get(forced) || 0) + 1);
  A = A2;
}
console.log('\n=== forced advance of the agreement front, at the true front ===');
console.log(`rows: 0..${n - 1}`);
console.log(`soundness violations (forced > actual): ${unsound}`);
console.log(`agree_succ_iff as an iff on the orbit (actual>=1 <=> bit A-1 black): ${iffBad} violations`);
for (const k of [...hist.keys()].sort()) console.log(`  forced ${k}: ${hist.get(k)} (${(100 * hist.get(k) / n).toFixed(2)}%)`);
console.log(`mean FORCED advance = ${(sumF / n).toFixed(5)} bits/row  <- what the four lemmas guarantee`);
console.log(`mean ACTUAL advance = ${(sumA / n).toFixed(5)} bits/row  <- the true settling front`);
console.log(`the centre column's own speed = 1.00000;  the onset wall needs 0.50000`);

console.log('\n=== a forced-only walker (NOT sound as an argument; see the document) ===');
{
  const T0 = 2000, T1 = 200000;
  let R = zero(); R[0] = 1; const tmp = zero();
  for (let i = 0; i < T0; i++) { step(tmp, R); R.set(tmp); }
  let S = zero(); S[0] = 1;
  { const q = zero(); for (let i = 0; i < T0 + LAG; i++) { step(q, S); S.set(q); } }
  // true front alongside, to check the walker never overtakes it
  let F = zero(); F[0] = 1; let G2 = zero(); G2[0] = 1;
  { const q = zero(); for (let i = 0; i < T0; i++) { step(q, F); F.set(q); } }
  { const q = zero(); for (let i = 0; i < T0 + LAG; i++) { step(q, G2); G2.set(q); } }
  let g = firstDiff(R, S, 0); const g0 = g;
  const h = new Map(); let tEnd = T1, over = 0;
  const tF = zero(), tG = zero();
  for (let t = T0; t < T1; t++) {
    if (g >= NBITS - 64) { tEnd = t; break; }
    if (g > firstDiff(F, G2, 0)) over++;
    const u = bit(R, g - 1), v = bit(R, g), w = bit(R, g + 1);
    const f = (u === 0) ? 0 : ((v === 0 && w === 1) ? 2 : 1);
    h.set(f, (h.get(f) || 0) + 1); g += f;
    step(tmp, R); R.set(tmp);
    step(tF, F); F.set(tF); step(tG, G2); G2.set(tG);
  }
  console.log(`  start bit ${g0} at t=${T0}; end bit ${g} at t=${tEnd} (${tEnd - T0} rows)`);
  console.log(`  forced-only walker speed = ${((g - g0) / (tEnd - T0)).toFixed(5)} bits/row`);
  console.log(`  rows where the walker was AHEAD of the true front: ${over}`);
  const tot = [...h.values()].reduce((a, b) => a + b, 0);
  for (const k of [...h.keys()].sort()) console.log(`    step ${k}: ${(100 * h.get(k) / tot).toFixed(2)}%`);
}
