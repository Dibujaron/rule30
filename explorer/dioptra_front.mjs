// dioptra_front.mjs
//
// The packed-row orbit's AGREEMENT FRONT, measured exactly.
//
// rowNat t is the row of rule 30 packed into a number: bit b of rowNat t is
// the cell at position x = b - t.  So
//     leftDiagonal k j = bit_k (rowNat (j+k))          -- FIXED bit index
//     centerColumn t   = bit_t (rowNat t)              -- bit index at SPEED 1
//     rightDiagonal k j = bit_(2j+k) (rowNat (j+k))    -- bit index at SPEED 2
//
// Define A(t) = the number of low bits on which rowNat t and rowNat (t+L)
// agree, for L a multiple of every left diagonal's eventual period.  L = 32
// is such a multiple for every bit index below 2,107,985,255 (NKS p. 871:
// the periods are 1,2,4,8,16,32 with 32 entered at diagonal 87867 and 64 not
// before 2.1e9).  Because the truncated orbit is a rho, the FIRST time
// state(t) = state(t+L) is exactly the preperiod, so
//     pre(n) = min { t : A(t) >= n }
// is the exact preperiod of the orbit of 1 under r -> (4r XOR (2r OR r)) mod 2^n.
//
// This one run therefore gives, exactly and for every n at once:
//   * pre(n), the constant crystal 69 calls "about 1.25 n";
//   * A(t)/t, the speed of the settling front in the (row, bit) plane;
//   * onset(k) = pre(k+1) - k, the transient of left diagonal k;
//   * the set { k : onset(k) <= 0 }, i.e. the centre-column cells that are
//     settled cells -- which is what a "second reading" would need.
//
// Parameters in the file, no arguments.

const WORDS = 1024;              // 32768 bits of row kept
const NBITS = WORDS * 32;
const LAG = 32;                  // multiple of every diagonal period below 2.1e9
const TMAX = 40000;

function zero() { return new Uint32Array(WORDS); }

// dst = (src << k), truncated to NBITS
function shl(dst, src, k) {
  if (k === 0) { dst.set(src); return; }
  for (let i = WORDS - 1; i >= 0; i--) {
    const lo = src[i] << k;
    const hi = i > 0 ? (src[i - 1] >>> (32 - k)) : 0;
    dst[i] = (lo | hi) >>> 0;
  }
}

const t1 = zero(), t2 = zero();
function step(dst, src) {
  shl(t1, src, 2);              // 4r
  shl(t2, src, 1);              // 2r
  for (let i = 0; i < WORDS; i++) dst[i] = (t1[i] ^ ((t2[i] | src[i]) >>> 0)) >>> 0;
}

function ctz32(v) {
  let c = 0;
  if ((v & 0xffff) === 0) { c += 16; v >>>= 16; }
  if ((v & 0xff) === 0) { c += 8; v >>>= 8; }
  if ((v & 0xf) === 0) { c += 4; v >>>= 4; }
  if ((v & 0x3) === 0) { c += 2; v >>>= 2; }
  if ((v & 0x1) === 0) { c += 1; }
  return c;
}

// number of agreeing low bits, scanning from word w0 (safe: A is nondecreasing)
function firstDiff(a, b, w0) {
  for (let i = w0; i < WORDS; i++) {
    const d = (a[i] ^ b[i]) >>> 0;
    if (d !== 0) return i * 32 + ctz32(d);
  }
  return NBITS;
}

// ---- control: an independent BigInt engine, for small t ----------------
function rowNatBig(t) {
  let r = 1n;
  for (let i = 0; i < t; i++) r = (4n * r) ^ ((2n * r) | r);
  return r;
}
function bitBig(r, b) { return (r >> BigInt(b)) & 1n; }

// ---- control: an independent cell-by-cell evolve, for small t ----------
function evolveArray(T) {
  // rows[t][x + T] for |x| <= T
  const W = 2 * T + 1;
  let cur = new Uint8Array(W + 4); cur[T + 2] = 1;   // pad 2 each side
  const out = [];
  for (let t = 0; t <= T; t++) {
    out.push(cur.slice());
    const nxt = new Uint8Array(W + 4);
    for (let i = 1; i < W + 3; i++) {
      const l = cur[i - 1], c = cur[i], r = cur[i + 1];
      nxt[i] = l ^ (c | r);
    }
    cur = nxt;
  }
  return out;   // out[t][x + T + 2]
}

console.log('=== controls ===');
{
  // 1. the packed engine against BigInt, low NBITS bits
  let a = zero(); a[0] = 1;
  let ok = true;
  const tmp = zero();
  for (let t = 0; t <= 200; t++) {
    const big = rowNatBig(t);
    for (let b = 0; b < Math.min(NBITS, 2 * t + 3); b++) {
      const mine = (a[b >>> 5] >>> (b & 31)) & 1;
      if (BigInt(mine) !== bitBig(big, b)) { ok = false; console.log('MISMATCH packed vs BigInt', t, b); break; }
    }
    if (!ok) break;
    step(tmp, a); a.set(tmp);
  }
  console.log('packed engine vs BigInt, rows 0..200:', ok ? 'OK (0 mismatches)' : 'FAILED');
}
{
  // 2. BigInt bits against a cell-by-cell rule 30 picture
  const T = 60;
  const pic = evolveArray(T);
  let bad = 0, checked = 0;
  for (let t = 0; t <= T; t++) {
    const big = rowNatBig(t);
    for (let x = -t; x <= t; x++) {
      const b = x + t;
      const fromBits = Number(bitBig(big, b));
      const fromPic = pic[t][x + T + 2];
      checked++;
      if (fromBits !== fromPic) bad++;
    }
    // and outside the cone
    for (let b = 2 * t + 1; b <= 2 * t + 4; b++) { checked++; if (bitBig(big, b) !== 0n) bad++; }
  }
  console.log(`rowNat bits vs cell-by-cell picture: ${bad} mismatches of ${checked} cells`);
}

console.log('\n=== the agreement front ===');
// stream A at time t, stream B at time t + LAG
let A = zero(); A[0] = 1;
let B = zero(); B[0] = 1;
{
  const tmp = zero();
  for (let i = 0; i < LAG; i++) { step(tmp, B); B.set(tmp); }
}

const front = new Int32Array(TMAX + 1);
const tmpA = zero(), tmpB = zero();
let w0 = 0;
let monotoneViolations = 0;
let prev = -1;
let tReached = TMAX;
for (let t = 0; t <= TMAX; t++) {
  const f = firstDiff(A, B, w0);
  if (f >= NBITS - 64) { tReached = t - 1; console.log(`front reached the window edge at t=${t}; stopping`); break; }
  front[t] = f;
  if (f < prev) monotoneViolations++;
  prev = f;
  w0 = (f >>> 5);
  step(tmpA, A); A.set(tmpA);
  step(tmpB, B); B.set(tmpB);
}
console.log(`rows measured: 0..${tReached}`);
console.log(`monotonicity violations of A(t): ${monotoneViolations}`);

// pre(n) = min { t : A(t) >= n }
const NMAX = front[tReached];
const pre = new Int32Array(NMAX + 1).fill(-1);
{
  let n = 0;
  for (let t = 0; t <= tReached; t++) {
    while (n <= front[t] && n <= NMAX) { pre[n] = t; n++; }
  }
}
console.log(`pre(n) known for n = 0..${NMAX}`);

// --- the constant ---
console.log('\n--- pre(n)/n : the constant crystal 69 calls "about 1.25" ---');
let maxR = 0, maxRn = 0, minR = 1e9, minRn = 0;
for (let n = 100; n <= NMAX; n++) {
  const r = pre[n] / n;
  if (r > maxR) { maxR = r; maxRn = n; }
  if (r < minR) { minR = r; minRn = n; }
}
console.log(`n in [100, ${NMAX}]:  max pre(n)/n = ${maxR.toFixed(4)} at n=${maxRn};  min = ${minR.toFixed(4)} at n=${minRn}`);
for (const n of [49, 100, 500, 1000, 2000, 5000, 10000, 20000, 30000].filter(x => x <= NMAX)) {
  console.log(`  pre(${n}) = ${pre[n]}   ratio ${(pre[n] / n).toFixed(4)}`);
}
// least-squares slope over the top decade
{
  const lo = Math.floor(NMAX / 10), hi = NMAX;
  let sx = 0, sy = 0, sxx = 0, sxy = 0, m = 0;
  for (let n = lo; n <= hi; n++) { sx += n; sy += pre[n]; sxx += n * n; sxy += n * pre[n]; m++; }
  const slope = (m * sxy - sx * sy) / (m * sxx - sx * sx);
  console.log(`least-squares slope of pre(n) over n in [${lo}, ${hi}]: ${slope.toFixed(5)}`);
}

// --- the front speed ---
console.log('\n--- A(t)/t : the settling front in the (row, bit) plane ---');
for (const t of [1000, 5000, 10000, 20000, 30000, 40000].filter(x => x <= tReached)) {
  console.log(`  A(${t}) = ${front[t]}   A/t = ${(front[t] / t).toFixed(5)}`);
}
{
  const nb = 8, w = Math.floor(tReached / nb);
  const speeds = [];
  for (let i = 0; i < nb; i++) {
    const a = i * w, b = (i + 1) * w;
    speeds.push(((front[b] - front[a]) / (b - a)));
  }
  console.log(`  windowed speeds (${nb} blocks of ${w} rows): ${speeds.map(s => s.toFixed(4)).join(', ')}`);
  console.log(`  net speed A(${tReached})/${tReached} = ${(front[tReached] / tReached).toFixed(5)}`);
  console.log(`  implied damage-front speed 1 - A/t = ${(1 - front[tReached] / tReached).toFixed(5)}`);
}

// --- increments ---
console.log('\n--- increments A(t+1) - A(t) ---');
{
  const hist = new Map();
  for (let t = 0; t < tReached; t++) {
    const d = front[t + 1] - front[t];
    hist.set(d, (hist.get(d) || 0) + 1);
  }
  const keys = [...hist.keys()].sort((a, b) => a - b);
  for (const k of keys) {
    const c = hist.get(k);
    if (c > tReached / 20000 || k > 2 || k < 0) console.log(`  ${k >= 0 ? '+' : ''}${k}: ${c}  (${(100 * c / tReached).toFixed(2)}%)`);
  }
  console.log(`  min increment ${keys[0]}, max increment ${keys[keys.length - 1]}`);
  const ge2 = keys.filter(k => k >= 2).reduce((s, k) => s + hist.get(k), 0);
  console.log(`  increments >= 2: ${ge2} (${(100 * ge2 / tReached).toFixed(2)}%)  -- these are the ones rowStep_agree_succ_iff alone cannot produce`);
}

// --- the wall, the centre column, and the gap between them ---
console.log('\n--- A(t) against the three thresholds ---');
{
  // onset wall  <=>  2 F(t) + t >= 1  with F(t) = A(t) - t   <=>  A(t) >= (t+1)/2
  let wallMin = 1e9, wallAt = 0;
  let ccMin = 1e9, ccAt = 0;
  for (let t = 18; t <= tReached; t++) {
    const m = 2 * (front[t] - t) + t;           // crystal 51's 2F+t
    if (m < wallMin) { wallMin = m; wallAt = t; }
    const g = front[t] - t;                      // >= 0 would put the centre column inside the settled region
    if (g < ccMin) { ccMin = g; ccAt = t; }
  }
  console.log(`  min over t>=18 of 2*(A(t)-t)+t  = ${wallMin} at t=${wallAt}   (the onset wall needs >= 1)`);
  console.log(`  max over t>=18 of A(t)-t        = ${-ccMin === -ccMin ? '' : ''}${(() => { let mx = -1e9, at = 0; for (let t = 18; t <= tReached; t++) { if (front[t] - t > mx) { mx = front[t] - t; at = t; } } return `${mx} at t=${at}`; })()}   (a settled centre column needs >= 1)`);
}

// --- the second reading: which centre-column cells are settled cells? ---
console.log('\n--- onset(k) = pre(k+1) - k : is the centre column ever a settled cell? ---');
{
  const zeros = [];
  let lastZero = -1;
  for (let k = 0; k + 1 <= NMAX; k++) {
    const on = pre[k + 1] - k;
    if (on <= 0) { if (zeros.length < 60) zeros.push(k); lastZero = k; }
  }
  console.log(`  { k : onset(k) <= 0 } = ${JSON.stringify(zeros)}${zeros.length >= 60 ? ' ...' : ''}`);
  console.log(`  largest k with onset(k) <= 0 below ${NMAX}: ${lastZero}`);
  const sample = [20, 50, 100, 1000, 10000, 30000].filter(k => k + 1 <= NMAX);
  for (const k of sample) console.log(`  onset(${k}) = ${pre[k + 1] - k}   onset/k = ${((pre[k + 1] - k) / k).toFixed(4)}`);
}

// --- the second reading, question (3): the right-diagonal re-read ---
console.log('\n--- centerColumn_eq_evolve_mul_pow as a bit read ---');
{
  // centerColumn k = evolve (m*2^k + k) (m*2^k) = bit_(2m*2^k + k) (rowNat (m*2^k + k))
  console.log('   k   m        row t      bit b     b/t     pre(b+1)   settled at t?');
  for (const k of [1, 2, 3, 5, 8, 12]) {
    for (const m of [1, 2, 3]) {
      const t = m * 2 ** k + k;
      const b = 2 * m * 2 ** k + k;
      if (b + 1 > NMAX) continue;
      const p = pre[b + 1];
      console.log(`  ${String(k).padStart(2)}  ${String(m).padStart(2)}  ${String(t).padStart(10)}  ${String(b).padStart(9)}   ${(b / t).toFixed(3)}   ${String(p).padStart(8)}     ${p <= t ? 'YES' : 'no'}`);
    }
  }
}
