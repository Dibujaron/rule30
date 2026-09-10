// Talus, 2026-09-10.  The right-diagonal tower of rule 30.
//
// R_k(j) = evolve (j+k) j   (rightDiagonal k j).
// Recurrence (board: rightDiagonal_recurrence):
//   R_{k+2}(i+1) = R_{k+2}(i) XOR ( R_{k+1}(i+1) OR R_k(i+2) )
// so R_k is fixed by R_{k-1}, R_{k-2} and the single free bit R_k(0),
// and R_k(0) = evolve k 0 = centerColumn k.
//
// Every R_k is exactly periodic from index 0 with period dividing 2^k
// (rightDiagonal_periodicFrom_pow), so each is stored as one MINIMAL period.
//
// This script: builds the tower, VERIFIES it cell-by-cell against the real
// picture, prints the minimal periods P_k, the doubling depths, and tests
//   (a) no-drop:  P_k >= max(P_{k-1}, P_{k-2})
//   (b) the law:  P_k = 2L iff the driver has odd weight over one period L
//   (c) minper(g_k) vs L
//   (d) P_{m(p)} does not divide p, where m(p) is the distance from the right
//       edge of row p to the nearest black cell left of it
//       (this is rightDiagonal_first_failure with the witness kept).

const DEPTH = 48;         // build R_0 .. R_DEPTH
const VERIFY_ROWS = 600;  // verify tower against picture over this many rows
const MP_MAX = 65536;     // sweep m(p) for p <= MP_MAX

// ---------------- packed row engine ----------------
// row t as Uint32Array, bit i = cell at position (i - t).  bits 0..2t used.
function rowZero() { const a = new Uint32Array(1); a[0] = 1; return a; }

function shiftUp(r, k, words) {
  // returns new Uint32Array of length `words` holding r << k
  const out = new Uint32Array(words);
  const w = k >> 5, b = k & 31;
  if (b === 0) {
    for (let i = r.length - 1; i >= 0; i--) if (i + w < words) out[i + w] = r[i];
  } else {
    for (let i = r.length - 1; i >= 0; i--) {
      const v = r[i];
      if (i + w < words) out[i + w] |= (v << b) >>> 0;
      if (i + w + 1 < words) out[i + w + 1] |= (v >>> (32 - b));
    }
  }
  return out;
}

function rowStep(r, t) {
  // t = time index of r; result has bits 0..2(t+1)
  const words = ((2 * (t + 1)) >> 5) + 1;
  const a = shiftUp(r, 2, words);
  const b = shiftUp(r, 1, words);
  const c = new Uint32Array(words);
  for (let i = 0; i < r.length && i < words; i++) c[i] = r[i];
  const out = new Uint32Array(words);
  for (let i = 0; i < words; i++) out[i] = (a[i] ^ (b[i] | c[i])) >>> 0;
  return out;
}

function bit(r, i) { return (r[i >> 5] >>> (i & 31)) & 1; }

// ---------------- centre column ----------------
function centreColumn(n) {
  const c = new Uint8Array(n + 1);
  let r = rowZero();
  c[0] = bit(r, 0);
  for (let t = 0; t < n; t++) {
    r = rowStep(r, t);
    c[t + 1] = bit(r, t + 1);
  }
  return c;
}

// ---------------- minimal period of a cyclic word ----------------
// w has length N (a power of two) and is known to be N-periodic.
function minPeriod(w) {
  const N = w.length;
  for (let d = 1; d < N; d <<= 1) {
    let ok = true;
    for (let i = 0; i + d < N; i++) if (w[i] !== w[i + d]) { ok = false; break; }
    if (ok) return d;
  }
  return N;
}

// ---------------- build the tower ----------------
// Returns { R: [Uint8Array], P: [int], drivers: [{L, W, WL2, gmin}] }
function buildTower(depth, freeBit) {
  const R = [];
  const P = [];
  const info = [];
  // R_0: constant  evolve j j  -- for the seed this is 1^inf (evolve_right_edge)
  R[0] = Uint8Array.from([freeBit(0)]);
  P[0] = 1;
  info[0] = null;
  // R_1(j) = evolve (j+1) j.  R_1(j+1) = R_1(j) XOR R_0(j+1)  (see note below)
  // Derive it from the same recurrence family: on the right cone the cell left
  // of (t+1, t) is (t, t-1) = R_1(t-1), its own cell is R_0(t), its right
  // neighbour is outside the cone (white).  So R_1(j+1) = R_1(j) XOR R_0(j+1).
  {
    const L = P[0];
    const buf = new Uint8Array(2 * L);
    buf[0] = freeBit(1);
    for (let j = 0; j + 1 < 2 * L; j++) buf[j + 1] = buf[j] ^ R[0][(j + 1) % L];
    R[1] = buf.slice(0, minPeriod(buf));
    P[1] = R[1].length;
    info[1] = null;
  }
  for (let k = 2; k <= depth; k++) {
    const u = R[k - 2], v = R[k - 1];
    const L = Math.max(P[k - 2], P[k - 1]);
    // driver g(j) = v(j+1) OR u(j+2), period divides L
    const g = new Uint8Array(L);
    for (let j = 0; j < L; j++) g[j] = (v[(j + 1) % v.length] | u[(j + 2) % u.length]);
    const gmin = minPeriod(g);
    let W = 0; for (let j = 0; j < L; j++) W += g[j];
    let WL2 = 0; for (let j = 0; j < L / 2; j++) WL2 += g[j];
    const buf = new Uint8Array(2 * L);
    buf[0] = freeBit(k);
    for (let j = 0; j + 1 < 2 * L; j++) buf[j + 1] = buf[j] ^ g[j % L];
    const p = minPeriod(buf);
    R[k] = buf.slice(0, p);
    P[k] = p;
    info[k] = { L, W, WL2, gmin };
  }
  return { R, P, info };
}

// ---------------- run ----------------
const c = centreColumn(DEPTH);
console.log('centre column c(0..20) =', Array.from(c.slice(0, 21)).join(''));

const tower = buildTower(DEPTH, (k) => c[k]);
const { R, P, info } = tower;

// --- verification against the real picture ---
{
  let checked = 0, bad = 0, firstBad = null;
  let r = rowZero();
  const rows = [r];
  for (let t = 0; t < VERIFY_ROWS; t++) { r = rowStep(r, t); rows.push(r); }
  for (let k = 0; k <= DEPTH; k++) {
    for (let j = 0; j + k <= VERIFY_ROWS; j++) {
      const truth = bit(rows[j + k], 2 * j + k);   // evolve (j+k) j
      const mine = R[k][j % P[k]];
      checked++;
      if (truth !== mine) { bad++; if (!firstBad) firstBad = { k, j, truth, mine }; }
    }
  }
  console.log(`VERIFY tower vs picture: ${checked} cells, ${bad} mismatches`,
    firstBad ? JSON.stringify(firstBad) : '');
  if (bad) process.exit(1);
}

// --- periods, doublings, law ---
console.log('\nk  P_k  L  W  W(L/2)  minper(g)  law?  drop?');
const doublings = [];
let lawFails = 0, drops = 0, gLess = 0;
for (let k = 0; k <= DEPTH; k++) {
  if (k < 2) { console.log(`${k}  ${P[k]}  -`); continue; }
  const { L, W, WL2, gmin } = info[k];
  const predicted = (W % 2 === 1) ? 2 * L : L;
  const law = predicted === P[k];
  const drop = P[k] < L;
  if (!law) lawFails++;
  if (drop) drops++;
  if (gmin < L) gLess++;
  if (P[k] > Math.max(P[k - 1], P[k - 2])) doublings.push(k);
  if (k <= 40 || !law || drop || gmin < L)
    console.log(`${k}  ${P[k]}  ${L}  ${W}  ${WL2}  ${gmin}  ${law ? 'ok' : 'FAIL'}  ${drop ? 'DROP' : ''}`);
}
console.log(`\nlaw failures: ${lawFails} / ${DEPTH - 1}`);
console.log(`period drops: ${drops}`);
console.log(`minper(g) < L: ${gLess}`);
console.log('P_k =', P.join(','));
console.log('doubling depths k (P_k > max(P_{k-1},P_{k-2})):', doublings.join(','));
console.log("Rowland a(n) 0..40: 1,3,4,6,7,9,15,16,24,25,27,29,34,36,37,39,41,43,48,49,51,54,55,58,60,63,64,66,69,70,72,74,77,79,80,82,84,86,90,91,93");

// --- m(p) and the first-failure witness ---
{
  // m(p): row p, right edge at bit 2p (black); m = 2p - (largest set bit < 2p)
  const m = new Int32Array(MP_MAX + 1);
  let r = rowZero();
  for (let t = 1; t <= MP_MAX; t++) {
    r = rowStep(r, t - 1);
    let b = 2 * t - 1;
    while (b >= 0 && !bit(r, b)) b--;
    m[t] = 2 * t - b;
  }
  console.log('\nm(p) for p=1..20:', Array.from(m.slice(1, 21)).join(','));
  console.log('m(2^n) for n=0..16:',
    Array.from({ length: 17 }, (_, n) => m[1 << n] ?? '-').join(','));
  // check: P_{m(p)} does not divide p, for every p with m(p) <= DEPTH
  let tested = 0, viol = 0, firstViol = null;
  for (let p = 1; p <= MP_MAX; p++) {
    if (m[p] > DEPTH) continue;
    tested++;
    if (p % P[m[p]] === 0) { viol++; if (!firstViol) firstViol = { p, m: m[p], P: P[m[p]] }; }
  }
  console.log(`first-failure witness: for ${tested} values of p with m(p)<=${DEPTH}, ` +
    `P_{m(p)} divides p in ${viol} cases`, firstViol ? JSON.stringify(firstViol) : '');
  // and: is m(p) the FIRST such depth?
  let tight = 0, loose = 0, worst = null;
  for (let p = 1; p <= MP_MAX; p++) {
    if (m[p] > DEPTH) continue;
    let d = 0; while (p % P[d] === 0) d++;
    if (d === m[p]) tight++; else { loose++; if (!worst || m[p] - d > worst.gap) worst = { p, m: m[p], first: d, gap: m[p] - d }; }
  }
  console.log(`m(p) equals the first depth whose period fails to divide p: ${tight} tight, ${loose} loose`,
    worst ? JSON.stringify(worst) : '');
}
