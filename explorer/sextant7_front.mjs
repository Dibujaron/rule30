// sextant7_front.mjs   (Sextant, 2026-09-10)
//
// The packed-row orbit's AGREEMENT FRONT, measured exactly, with controls.
//
// Bit b of rowNat t is the cell at position x = b - t, so
//     leftDiagonal k j  = bit_k        (rowNat (j+k))   -- bit index FIXED
//     centerColumn t    = bit_t        (rowNat t)       -- bit index at SPEED 1
//     rightDiagonal k j = bit_(2j+k)   (rowNat (j+k))   -- bit index at SPEED 2
//
// A(t) = number of low bits on which rowNat t and rowNat (t+32) agree.  32 is a
// multiple of every left diagonal's eventual period below bit 2,107,985,255
// (NKS p. 871).  The truncated orbit is a rho, so the FIRST lag-32 agreement is
// exactly the preperiod:  pre(n) = min { t : A(t) >= n }.
// One run therefore gives pre(n) for every n at once, the front speed A(t)/t,
// onset(k) = pre(k+1) - k, and the set { k : onset(k) <= 0 } -- the centre
// column cells that are settled cells.
//
// Parameters in the file, no arguments.  Deep version: sextant7_deep.mjs.

const WORDS = 1024;              // 32768 bits of row kept
const NBITS = WORDS * 32;
const LAG = 32;
const TMAX = 40000;

function zero() { return new Uint32Array(WORDS); }
const t1 = zero(), t2 = zero();
function shl(dst, src, k) {
  for (let i = WORDS - 1; i >= 0; i--)
    dst[i] = ((src[i] << k) | (i > 0 ? (src[i - 1] >>> (32 - k)) : 0)) >>> 0;
}
function step(dst, src) {
  shl(t1, src, 2); shl(t2, src, 1);
  for (let i = 0; i < WORDS; i++) dst[i] = (t1[i] ^ ((t2[i] | src[i]) >>> 0)) >>> 0;
}
function ctz32(v) { let c = 0; if (!(v & 0xffff)) { c += 16; v >>>= 16; } if (!(v & 0xff)) { c += 8; v >>>= 8; } if (!(v & 0xf)) { c += 4; v >>>= 4; } if (!(v & 3)) { c += 2; v >>>= 2; } if (!(v & 1)) c += 1; return c; }
function firstDiff(a, b, w0) {
  for (let i = w0; i < WORDS; i++) { const d = (a[i] ^ b[i]) >>> 0; if (d) return i * 32 + ctz32(d); }
  return NBITS;
}

// ---- controls ----------------------------------------------------------
function rowNatBig(t) { let r = 1n; for (let i = 0; i < t; i++) r = (4n * r) ^ ((2n * r) | r); return r; }
function bitBig(r, b) { return (r >> BigInt(b)) & 1n; }
function evolveArray(T) {          // an independent cell-by-cell rule 30
  const W = 2 * T + 1;
  let cur = new Uint8Array(W + 4); cur[T + 2] = 1;
  const out = [];
  for (let t = 0; t <= T; t++) {
    out.push(cur.slice());
    const nxt = new Uint8Array(W + 4);
    for (let i = 1; i < W + 3; i++) nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
    cur = nxt;
  }
  return out;
}

console.log('=== controls ===');
{
  let a = zero(); a[0] = 1; const tmp = zero(); let ok = true;
  for (let t = 0; t <= 200 && ok; t++) {
    const big = rowNatBig(t);
    for (let b = 0; b < Math.min(NBITS, 2 * t + 3); b++)
      if (BigInt((a[b >>> 5] >>> (b & 31)) & 1) !== bitBig(big, b)) { ok = false; console.log('MISMATCH', t, b); break; }
    step(tmp, a); a.set(tmp);
  }
  console.log('packed engine vs BigInt, rows 0..200:', ok ? 'OK (0 mismatches)' : 'FAILED');
}
{
  const T = 60, pic = evolveArray(T); let bad = 0, checked = 0;
  for (let t = 0; t <= T; t++) {
    const big = rowNatBig(t);
    for (let x = -t; x <= t; x++) { checked++; if (Number(bitBig(big, x + t)) !== pic[t][x + T + 2]) bad++; }
    for (let b = 2 * t + 1; b <= 2 * t + 4; b++) { checked++; if (bitBig(big, b) !== 0n) bad++; }
  }
  console.log(`rowNat bits vs cell-by-cell picture: ${bad} mismatches of ${checked} cells`);
}

// ---- the run -----------------------------------------------------------
console.log('\n=== the agreement front ===');
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
console.log(`rows measured: 0..${tReached};  monotonicity violations of A(t): ${viol}`);

const NMAX = front[tReached];
const pre = new Int32Array(NMAX + 1).fill(-1);
{ let n = 0; for (let t = 0; t <= tReached; t++) { while (n <= front[t] && n <= NMAX) { pre[n] = t; n++; } } }

console.log('\n--- pre(n)/n : the constant crystal 69 calls "about 1.25" ---');
{
  let maxR = 0, maxN = 0, minR = 1e9, minN = 0;
  for (let n = 100; n <= NMAX; n++) { const r = pre[n] / n; if (r > maxR) { maxR = r; maxN = n; } if (r < minR) { minR = r; minN = n; } }
  console.log(`n in [100, ${NMAX}]:  max ${maxR.toFixed(4)} at n=${maxN};  min ${minR.toFixed(4)} at n=${minN}`);
}
for (const n of [49, 100, 500, 1000, 5000, 10000, 20000].filter(x => x <= NMAX))
  console.log(`  pre(${n}) = ${pre[n]}   ratio ${(pre[n] / n).toFixed(4)}`);
{
  const lo = Math.floor(NMAX / 10), hi = NMAX;
  let sx = 0, sy = 0, sxx = 0, sxy = 0, m = 0;
  for (let n = lo; n <= hi; n++) { sx += n; sy += pre[n]; sxx += n * n; sxy += n * pre[n]; m++; }
  console.log(`least-squares slope over n in [${lo}, ${hi}]: ${(((m * sxy - sx * sy) / (m * sxx - sx * sx))).toFixed(5)}`);
}

console.log('\n--- A(t)/t : the settling front in the (row, bit) plane ---');
for (const t of [1000, 10000, 20000, 40000].filter(x => x <= tReached))
  console.log(`  A(${t}) = ${front[t]}   A/t = ${(front[t] / t).toFixed(5)}`);
console.log(`  net ${(front[tReached] / tReached).toFixed(5)};  implied damage-front speed ${(1 - front[tReached] / tReached).toFixed(5)}`);

console.log('\n--- increments A(t+1) - A(t) ---');
{
  const hist = new Map();
  for (let t = 0; t < tReached; t++) { const d = front[t + 1] - front[t]; hist.set(d, (hist.get(d) || 0) + 1); }
  for (const k of [...hist.keys()].sort((a, b) => a - b))
    console.log(`  ${k}: ${hist.get(k)}  (${(100 * hist.get(k) / tReached).toFixed(2)}%)`);
  const ge2 = [...hist.keys()].filter(k => k >= 2).reduce((s, k) => s + hist.get(k), 0);
  console.log(`  >=2: ${(100 * ge2 / tReached).toFixed(2)}%  -- crystal 51's front RETREATING in position`);
}

console.log('\n--- A(t) against the three thresholds ---');
{
  let wallMin = 1e9, wallAt = 0, ccMax = -1e9, ccAt = 0;
  for (let t = 18; t <= tReached; t++) {
    const m = 2 * (front[t] - t) + t; if (m < wallMin) { wallMin = m; wallAt = t; }
    const g = front[t] - t; if (g > ccMax) { ccMax = g; ccAt = t; }
  }
  console.log(`  min 2*(A(t)-t)+t = ${wallMin} at t=${wallAt}   (the onset wall needs >= 1)`);
  console.log(`  max  A(t)-t      = ${ccMax} at t=${ccAt}   (a settled centre column needs >= 1)`);
}

console.log('\n--- onset(k) = pre(k+1) - k ---');
{
  const zeros = []; let lastZero = -1;
  for (let k = 0; k + 1 <= NMAX; k++) if (pre[k + 1] - k <= 0) { if (zeros.length < 60) zeros.push(k); lastZero = k; }
  console.log(`  { k : onset(k) <= 0 } = ${JSON.stringify(zeros)}`);
  console.log(`  largest such k below ${NMAX}: ${lastZero}`);
  for (const k of [20, 100, 1000, 10000].filter(k => k + 1 <= NMAX))
    console.log(`  onset(${k}) = ${pre[k + 1] - k}   onset/k = ${((pre[k + 1] - k) / k).toFixed(4)}`);
}

console.log('\n--- centerColumn_eq_evolve_mul_pow as a bit read ---');
console.log('   k   m        row t      bit b     b/t     pre(b+1)   settled at t?');
for (const k of [1, 2, 3, 5, 8, 12]) for (const m of [1, 2, 3]) {
  const t = m * 2 ** k + k, b = 2 * m * 2 ** k + k;
  if (b + 1 > NMAX) continue;
  console.log(`  ${String(k).padStart(2)}  ${String(m).padStart(2)}  ${String(t).padStart(10)}  ${String(b).padStart(9)}   ${(b / t).toFixed(3)}   ${String(pre[b + 1]).padStart(8)}     ${pre[b + 1] <= t ? 'YES' : 'no'}`);
}
