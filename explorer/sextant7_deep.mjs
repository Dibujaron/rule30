// sextant7_deep.mjs   (Sextant, 2026-09-10)
//
// The agreement front of sextant7_front.mjs, run deep, for two purposes:
//   * to settle the constant crystal 69 states as "about 1.25 n" -- pre(n) is
//     the exact preperiod of the orbit of 1 under r -> (4r XOR (2r OR r)) mod 2^n
//     (sextant7_forced.mjs checks the lag-32 method against a brute-force rho
//     for n <= 18, 0 mismatches);
//   * to test whether the centre column's separation from the settled region is
//     a CONSTANT FACTOR or merely a positive gap: the closest approach
//     max A(t)/t over large t, equivalently min pre(n)/n.
//
// Parameters in the file, no arguments.

const WORDS = 3072;              // 98304 bits
const NBITS = WORDS * 32;
const LAG = 32;
const TMAX = 132000;

function zero() { return new Uint32Array(WORDS); }
const s1 = zero(), s2 = zero();
function shl(dst, src, k) { for (let i = WORDS - 1; i >= 0; i--) dst[i] = ((src[i] << k) | (i > 0 ? (src[i - 1] >>> (32 - k)) : 0)) >>> 0; }
function step(dst, src) { shl(s1, src, 2); shl(s2, src, 1); for (let i = 0; i < WORDS; i++) dst[i] = (s1[i] ^ ((s2[i] | src[i]) >>> 0)) >>> 0; }
function ctz32(v) { let c = 0; if (!(v & 0xffff)) { c += 16; v >>>= 16; } if (!(v & 0xff)) { c += 8; v >>>= 8; } if (!(v & 0xf)) { c += 4; v >>>= 4; } if (!(v & 3)) { c += 2; v >>>= 2; } if (!(v & 1)) c += 1; return c; }
function firstDiff(a, b, w0) { for (let i = w0; i < WORDS; i++) { const d = (a[i] ^ b[i]) >>> 0; if (d) return i * 32 + ctz32(d); } return NBITS; }

let A = zero(); A[0] = 1;
let B = zero(); B[0] = 1;
{ const t = zero(); for (let i = 0; i < LAG; i++) { step(t, B); B.set(t); } }
const front = new Int32Array(TMAX + 1);
const tA = zero(), tB = zero();
let w0 = 0, prev = -1, viol = 0, tReached = TMAX;
for (let t = 0; t <= TMAX; t++) {
  const f = firstDiff(A, B, w0);
  if (f >= NBITS - 64) { tReached = t - 1; break; }
  front[t] = f; if (f < prev) viol++; prev = f; w0 = f >>> 5;
  step(tA, A); A.set(tA); step(tB, B); B.set(tB);
}
console.log(`rows 0..${tReached}, front ends at bit ${front[tReached]};  monotonicity violations: ${viol}`);

const NMAX = front[tReached];
const pre = new Int32Array(NMAX + 1).fill(-1);
{ let n = 0; for (let t = 0; t <= tReached; t++) { while (n <= front[t] && n <= NMAX) { pre[n] = t; n++; } } }

console.log('\n--- pre(n) / n ---');
for (const n of [19, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 40000, 60000, 80000, 90000].filter(x => x <= NMAX))
  console.log(`  pre(${String(n).padStart(6)}) = ${String(pre[n]).padStart(7)}   ratio ${(pre[n] / n).toFixed(5)}`);
{
  let maxR = 0, maxN = 0, minR = 1e9, minN = 0;
  for (let n = 19; n <= NMAX; n++) { const r = pre[n] / n; if (r > maxR) { maxR = r; maxN = n; } if (r < minR) { minR = r; minN = n; } }
  console.log(`\n  over n in [19, ${NMAX}]:  max ${maxR.toFixed(5)} at n=${maxN};  MIN ${minR.toFixed(5)} at n=${minN}`);
  let below = 0, firstBelow = -1;
  for (let n = 19; n <= NMAX; n++) if (pre[n] < n) { below++; if (firstBelow < 0) firstBelow = n; }
  console.log(`  n >= 19 with pre(n) < n (a SETTLED centre-column cell): ${below}${firstBelow >= 0 ? ` first at n=${firstBelow}` : ''}`);
  // the closest approach on decade windows: is the separation a constant factor?
  console.log('\n  closest approach (min pre(n)/n, equivalently max A(t)/t) by decade:');
  for (let lo = 10; lo <= NMAX; lo *= 10) {
    const hi = Math.min(lo * 10, NMAX);
    let m = 1e9, at = 0;
    for (let n = Math.max(lo, 19); n <= hi; n++) { const r = pre[n] / n; if (r < m) { m = r; at = n; } }
    console.log(`    n in [${lo}, ${hi}]: min ratio ${m.toFixed(5)} at n=${at}`);
  }
}
console.log('\n--- local slope of pre(n), by octave ---');
for (let lo = 128; 2 * lo <= NMAX; lo *= 2) {
  const hi = Math.min(2 * lo, NMAX);
  console.log(`  n in [${lo}, ${hi}]: slope ${((pre[hi] - pre[lo]) / (hi - lo)).toFixed(5)}`);
}
{
  const lo = Math.floor(NMAX / 2), hi = NMAX;
  let sx = 0, sy = 0, sxx = 0, sxy = 0, m = 0;
  for (let n = lo; n <= hi; n++) { sx += n; sy += pre[n]; sxx += n * n; sxy += n * pre[n]; m++; }
  console.log(`  least squares over n in [${lo}, ${hi}]: slope ${(((m * sxy - sx * sy) / (m * sxx - sx * sx))).toFixed(5)}`);
}
console.log(`\n  net front speed A(t)/t at t=${tReached}: ${(front[tReached] / tReached).toFixed(5)}`);
console.log(`  1 / that = ${(tReached / front[tReached]).toFixed(5)}   <- the constant crystal 69 calls 1.25`);
console.log('\n--- onset(k) = pre(k+1) - k ---');
{
  let lastZero = -1;
  for (let k = 0; k + 1 <= NMAX; k++) if (pre[k + 1] - k <= 0) lastZero = k;
  console.log(`  largest k <= ${NMAX - 1} with onset(k) <= 0: ${lastZero}`);
  let minOn = 1e9, minAt = 0;
  for (let k = 18; k + 1 <= NMAX; k++) { const o = pre[k + 1] - k; if (o < minOn) { minOn = o; minAt = k; } }
  console.log(`  min onset(k) over k in [18, ${NMAX - 1}]: ${minOn} at k=${minAt}`);
  for (const lo of [100, 1000, 10000]) {
    let m2 = 1e9, at = 0;
    for (let k = lo; k + 1 <= NMAX; k++) { const r = (pre[k + 1] - k) / k; if (r < m2) { m2 = r; at = k; } }
    console.log(`  min onset(k)/k over k >= ${lo}: ${m2.toFixed(5)} at k=${at}`);
  }
  console.log(`  onset(${NMAX - 1}) / ${NMAX - 1} = ${((pre[NMAX] - (NMAX - 1)) / (NMAX - 1)).toFixed(5)}`);
}
