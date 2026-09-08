/**
 * Portage (connector, 2026-09-08): the odometer / Iwasawa reading of the
 * picture, and the tests the sighting document rests on.
 *
 *   node explorer/portage_odometer.mjs
 *
 * Conventions match Rule30/Basic.lean: cell(t, x), x increasing rightward,
 * right diagonal R_k(j) = cell(j + k, j), left diagonal L_k(j) = cell(j+k, -j).
 *
 * The tests, in order:
 *
 *  A. Right diagonals: the minimal period of R_k in j. Rowland 2006 Lemma 2
 *     gives a period DIVIDING 2^k from j = 0; the minimal one is much smaller
 *     (OEIS A094605). explorer/portage_rightdiag.mjs takes this much further.
 *
 *  B. The right recurrence R_k(j) = R_k(j-1) XOR (R_{k-1}(j) OR R_{k-2}(j+1)),
 *     i.e. the rule read along a right diagonal. In the group ring this is
 *     T * R_k = g_k with T = 1 + shift: every right diagonal is an
 *     antiderivative of the one-and-two above it.
 *
 *  C. The telescoped centre column. Integrating B leftward from outside the
 *     cone (where every cell is white) fixes the constant, so
 *         c(k) = XOR over j <= 0 of ( cell(j+k-1, j) OR cell(j+k-1, j+1) ).
 *     That is a parity over the segment of right diagonal k-1 running from
 *     the left edge of the cone up to the origin, about k/2 cells long.
 *
 *  D. The split of C at the seam. A cell (t, x) with x < -0.25 t is in the
 *     settled region; along the segment of C that is j < -0.2 (k-1). Report
 *     how many terms of the parity are settled, how many are not, and whether
 *     the settled half alone predicts c.
 *
 *  E. Odometer injectivity: does the word of the rightmost m+1 cells of row t
 *     determine t mod 2^m? If yes for every m, the edge system is conjugate
 *     to the dyadic odometer, not merely a factor of it.
 *
 *  F. The unit claim, stated over the WRONG period on purpose: summing g_k
 *     over 2^(k-1) rather than over its own minimal period L doubles the sum
 *     and always gives "even". Kept as the trap it was; the corrected test,
 *     over L, is in explorer/portage_rightdiag.mjs and passes with 0 failures.
 *
 *  G. Is c 2-adically continuous? Agreement rate of c(t) and c(t + 2^n).
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const t0 = Date.now();

// ---------------------------------------------------------------------------
// Pass 1: the full triangle, for B, C, D.
// ---------------------------------------------------------------------------

const T1 = 3000;
const OFF = T1 + 1;
const W = 2 * T1 + 3;

const P = new Uint8Array(T1 * W);
P[0 * W + OFF] = 1;
for (let t = 0; t + 1 < T1; t++) {
  const a = t * W, b = (t + 1) * W;
  const lo = OFF - t - 1, hi = OFF + t + 1;
  for (let i = lo; i <= hi; i++) P[b + i] = P[a + i - 1] ^ (P[a + i] | P[a + i + 1]);
}
const cell = (t, x) => (t >= 0 && t < T1 && x >= -t && x <= t ? P[t * W + OFF + x] : 0);
const c = Array.from({ length: T1 }, (_, t) => cell(t, 0));

console.log(`triangle: ${T1} rows (${Date.now() - t0} ms)`);
console.log(`c(0..40) = ${c.slice(0, 41).join('')}`);

// --- B: the right recurrence, over every cell of the triangle
{
  let bad = 0, tot = 0;
  for (let k = 2; k < T1; k++) {
    for (let j = -k; j + k < T1; j++) {
      const lhs = cell(j + k, j);
      const rhs = cell(j + k - 1, j - 1) ^ (cell(j + k - 1, j) | cell(j + k - 1, j + 1));
      tot++;
      if (lhs !== rhs) bad++;
    }
  }
  console.log(`B  right recurrence R_k(j) = R_k(j-1) xor (R_{k-1}(j) or R_{k-2}(j+1)): ${tot} cells, ${bad} failures`);
}

// --- C: the telescoped centre column
{
  let bad = 0, firstBad = -1;
  const lens = [];
  for (let k = 1; k < T1; k++) {
    let acc = 0, n = 0;
    for (let j = 0; j >= -k; j--) {
      const g = cell(j + k - 1, j) | cell(j + k - 1, j + 1);
      if (g) n++;
      acc ^= g;
    }
    if (acc !== c[k]) { bad++; if (firstBad < 0) firstBad = k; }
    lens.push(n);
  }
  console.log(`C  c(k) = xor_{j<=0} (cell(j+k-1,j) or cell(j+k-1,j+1)): ${T1 - 1} values, ${bad} failures${bad ? ` (first k = ${firstBad})` : ''}`);
}

// --- D: the split at the seam x = -0.25 t
{
  let agreeSettled = 0, tot = 0, sumSettled = 0, sumTrans = 0;
  const A = [];
  for (let k = 200; k < T1; k++) {
    const cut = -0.2 * (k - 1);   // j < cut  <=>  x < -0.25 t on this segment
    let aS = 0, aT = 0, nS = 0, nT = 0;
    for (let j = 0; j >= -k; j--) {
      if (-j > j + k - 1) continue;             // outside the cone: the cell is white
      const g = cell(j + k - 1, j) | cell(j + k - 1, j + 1);
      if (j < cut) { aS ^= g; nS++; } else { aT ^= g; nT++; }
    }
    A.push(aS);
    sumSettled += nS; sumTrans += nT; tot++;
    if (aS === c[k]) agreeSettled++;
  }
  console.log(`D  parity split at the seam, k in [200, ${T1}): settled terms ${(sumSettled / tot).toFixed(1)} per k, transient terms ${(sumTrans / tot).toFixed(1)} per k; settled parity alone predicts c(k) ${agreeSettled}/${tot} = ${(agreeSettled / tot).toFixed(3)}`);
  const ones = A.reduce((a, b) => a + b, 0);
  console.log(`D  the settled parity A(k) itself: density ${(ones / A.length).toFixed(3)}; A(200..259) = ${A.slice(0, 60).join('')}`);
}

// ---------------------------------------------------------------------------
// Pass 2: rows only, for A, E, F, G.
// ---------------------------------------------------------------------------

const T2 = 40000;
const KMAX = 16;                 // right diagonals kept
const EDGE = 24;                 // rightmost cells kept per row
const rd = Array.from({ length: KMAX + 1 }, () => new Uint8Array(T2));
const edge = new Int32Array(T2);
const c2 = new Uint8Array(T2);
{
  const w = 2 * T2 + 3, off = T2 + 1;
  let row = new Uint8Array(w), nxt = new Uint8Array(w);
  row[off] = 1;
  for (let t = 0; t < T2; t++) {
    c2[t] = row[off];
    for (let k = 0; k <= KMAX && k <= t; k++) rd[k][t - k] = row[off + t - k];
    let e = 0;
    for (let d = 0; d < EDGE; d++) e |= (t - d >= -t ? row[off + t - d] : 0) << d;
    edge[t] = e;
    const lo = off - t - 1, hi = off + t + 1;
    for (let i = lo; i <= hi; i++) nxt[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    nxt[lo - 1] = 0; nxt[hi + 1] = 0;
    [row, nxt] = [nxt, row];
  }
}
console.log(`rows: ${T2} (${Date.now() - t0} ms)`);

// --- A: exact period 2^k of the right diagonals
{
  const out = [];
  for (let k = 0; k <= KMAX; k++) {
    const n = T2 - k;
    let p = 0;
    for (let q = 1; q <= 1 << k && q <= n >> 2; q *= 2) {
      let ok = true;
      for (let j = 0; j + q < n; j++) if (rd[k][j] !== rd[k][j + q]) { ok = false; break; }
      if (ok) { p = q; break; }
    }
    out.push(`${k}:${p === 1 << k ? '2^' + k : p === 0 ? '>2^' + k : p}`);
  }
  console.log(`A  minimal period of right diagonal k over ${T2} terms: ${out.join(' ')}`);
}

// --- E: does the rightmost m+1 cells of row t determine t mod 2^m?
{
  const out = [];
  for (let m = 1; m <= EDGE - 1; m++) {
    const mask = (1 << (m + 1)) - 1, mod = 1 << m;
    const seen = new Map();
    let injective = true, collision = null;
    for (let t = m; t < Math.min(T2, mod + m + 4 * mod); t++) {
      const key = edge[t] & mask, r = t % mod;
      if (seen.has(key)) { if (seen.get(key) !== r) { injective = false; collision = [t, key]; break; } }
      else seen.set(key, r);
    }
    out.push(`${m}:${injective ? `1-1 (${seen.size}/${mod} residues hit)` : 'COLLIDES'}`);
    if (!injective) break;
  }
  console.log(`E  rightmost m+1 cells of row t vs t mod 2^m: ${out.join(' ')}`);
}

// --- F: g_k = R_{k-1} OR shift(R_{k-2}) has odd weight over one period 2^(k-1)
{
  const out = [];
  for (let k = 2; k <= KMAX; k++) {
    const L = 1 << (k - 1);
    if (L + 2 >= T2) break;
    let s = 0;
    for (let j = 0; j < L; j++) s ^= rd[k - 1][j] | rd[k - 2][j + 1];
    out.push(`${k}:${s ? 'odd' : 'EVEN'}`);
  }
  console.log(`F  weight of g_k over one period 2^(k-1) (odd = unit = period doubles): ${out.join(' ')}`);
}

// --- G: is c 2-adically continuous?
{
  const out = [];
  for (let n = 0; n <= 15; n++) {
    const s = 1 << n;
    let agree = 0, tot = 0;
    for (let t = 0; t + s < T2; t++) { tot++; if (c2[t] === c2[t + s]) agree++; }
    out.push(`2^${n}:${(agree / tot).toFixed(4)}`);
  }
  console.log(`G  agreement rate of c(t) and c(t + 2^n) over ${T2} terms: ${out.join(' ')}`);
  // a control: shifts that are not powers of two
  const ctl = [];
  for (const s of [3, 5, 7, 11, 1000, 12345]) {
    let agree = 0, tot = 0;
    for (let t = 0; t + s < T2; t++) { tot++; if (c2[t] === c2[t + s]) agree++; }
    ctl.push(`${s}:${(agree / tot).toFixed(4)}`);
  }
  console.log(`G  control, non-power-of-two shifts: ${ctl.join(' ')}`);
}

console.log(`(${Date.now() - t0} ms)`);
