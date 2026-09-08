/**
 * Sextant (theorist, 2026-09-08): the right diagonals' minimal periods, and
 * the one place the doubling criterion is not a two-line argument.
 *
 *   node explorer/sextant_rightperiods.mjs
 *
 * The window. Write A(t) for the 64-bit word whose bit d is the cell
 * (t, t - d): the rightmost 64 cells of row t, indexed by depth. Rule 30 in
 * these coordinates is one word operation,
 *
 *     A(t+1) = A(t) ^ ((A(t) << 1) | (A(t) << 2)),
 *
 * because cell (t+1, t+1-d) reads cells (t, t-d), (t, t+1-d), (t, t+2-d),
 * which are depths d, d-1, d-2. Bits shifted in from below the edge are
 * white, and cells outside the cone are white and stay white, so A(0) = 1
 * is a correct start for every t.
 *
 * The right diagonal is R_k(j) = cell(j+k, j) = bit k of A(j+k). A shift of
 * the diagonal index j by p is a shift of t by p for every depth at once, so
 * one pass over t with a fixed lag p tests "p is a period" for all 64 depths
 * simultaneously: OR over t of (A(t) ^ A(t+p)) has bit k clear exactly when
 * p is a period of R_k.
 *
 * The driver is the same word: the recurrence is R_k(j+1) = R_k(j) ^ g_k(j)
 * with g_k(j) = R_{k-1}(j) | R_{k-2}(j+1), and in the window
 * g_k(j) = bit k of B(t-1), t = j+k, where B = (A << 1) | (A << 2).
 *
 * Reported, per depth k:
 *   P_k   the minimal period of R_k (a power of two: 2^k is a period, and
 *         the periods of a purely periodic sequence are the multiples of the
 *         minimal one, so the minimal period divides 2^k)
 *   m_k   the minimal period of the driver g_k
 *   L_k   max(P_{k-1}, P_{k-2}), the common period the criterion is read at
 *   wt    the weight of g_k over [0, L), mod 2
 *   marg  the number of j in [0, L/2) with g_k(j) != g_k(j + L/2): how far
 *         g_k is from having half the period, i.e. how far the diagonal is
 *         from a collapse
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const W = 64;                    // depths 0..63, one machine word
const LOGN = 24;
const N = 1 << LOGN;             // rows of the window kept
const CROSS = 400;               // rows of a real triangle for the cross-check

const t0 = Date.now();

// ---------------------------------------------------------------- the window
const lo = new Uint32Array(N), hi = new Uint32Array(N);
{
  let l = 1 >>> 0, h = 0 >>> 0;
  for (let t = 0; t < N; t++) {
    lo[t] = l; hi[t] = h;
    const l1 = (l << 1) >>> 0, h1 = ((h << 1) | (l >>> 31)) >>> 0;
    const l2 = (l << 2) >>> 0, h2 = ((h << 2) | (l >>> 30)) >>> 0;
    const nl = (l ^ (l1 | l2)) >>> 0, nh = (h ^ (h1 | h2)) >>> 0;
    l = nl; h = nh;
  }
}
console.log(`window: ${N} rows x ${W} depths (${Date.now() - t0} ms)`);

const bitOf = (t, d) => (d < 32 ? (lo[t] >>> d) & 1 : (hi[t] >>> (d - 32)) & 1);
const R = (k, j) => bitOf(j + k, k);

// ------------------------------------------------- cross-check: real triangle
{
  const off = CROSS + 2, w = 2 * CROSS + 5;
  let row = new Uint8Array(w), nr = new Uint8Array(w);
  row[off] = 1;
  let bad = 0, cells = 0;
  for (let t = 0; t < CROSS; t++) {
    for (let d = 0; d < W; d++) {
      const x = t - d;                       // cell (t, x)
      const v = x + off >= 0 ? row[x + off] : 0;
      if (bitOf(t, d) !== v) bad++;
      cells++;
    }
    for (let i = 1; i < w - 1; i++) nr[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    [row, nr] = [nr, row];
  }
  console.log(`cross-check against a real ${CROSS}-row triangle: ${bad} disagreements on ${cells} cells`);
}

// ------------------------------------------------ period masks, all depths at once
// failA[a] : bitmask of depths for which lag 2^a is NOT a period of R (t >= W)
// failB[a] : the same for the driver word B = (A<<1)|(A<<2)
const LAGS = LOGN - 1;                       // lags 2^0 .. 2^(LOGN-2)
const failA = [], failB = [];
for (let a = 0; a < LAGS; a++) {
  const p = 1 << a;
  let al = 0, ah = 0, bl = 0, bh = 0;
  for (let t = W; t + p < N; t++) {
    const l = lo[t], h = hi[t], l2 = lo[t + p], h2 = hi[t + p];
    al |= (l ^ l2); ah |= (h ^ h2);
    // B(t) = (A(t)<<1) | (A(t)<<2)
    const bl1 = ((l << 1) | (l << 2)) >>> 0;
    const bh1 = ((h << 1) | (l >>> 31) | (h << 2) | (l >>> 30)) >>> 0;
    const bl2 = ((l2 << 1) | (l2 << 2)) >>> 0;
    const bh2 = ((h2 << 1) | (l2 >>> 31) | (h2 << 2) | (l2 >>> 30)) >>> 0;
    bl |= (bl1 ^ bl2); bh |= (bh1 ^ bh2);
  }
  failA.push([al >>> 0, ah >>> 0]);
  failB.push([bl >>> 0, bh >>> 0]);
}
const failsAt = (fail, a, k) => (k < 32 ? (fail[a][0] >>> k) & 1 : (fail[a][1] >>> (k - 32)) & 1);

// minimal period, and the head check j = 0 .. W (the "no transient" claim)
const P = [], M = [];
for (let k = 0; k < W; k++) {
  let p = 0;
  for (let a = 0; a < LAGS; a++) if (!failsAt(failA, a, k)) { p = 1 << a; break; }
  P.push(p);
  let m = 0;
  for (let a = 0; a < LAGS; a++) if (!failsAt(failB, a, k)) { m = 1 << a; break; }
  M.push(m);
}
// the head: for j < W the mask pass did not cover it, so check directly
const headBad = [];
for (let k = 0; k < W; k++) {
  if (!P[k]) continue;
  for (let j = 0; j < W + 2; j++) if (R(k, j) !== R(k, j + P[k])) { headBad.push(`${k}@${j}`); break; }
}

console.log(`P_k (minimal period of R_k), k = 0..${W - 1}:`);
console.log(`   ${P.map((p, k) => `${k}:${p || '>2^' + (LAGS - 1)}`).join(' ')}`);
console.log(`m_k (minimal period of the driver g_k):`);
console.log(`   ${M.map((p, k) => `${k}:${p || '>2^' + (LAGS - 1)}`).join(' ')}`);
console.log(`right diagonals with a transient (not periodic from j = 0): ${headBad.length ? headBad.join(' ') : 'none'}`);

// how many depths are certified by at least two full periods inside N
const certified = P.filter((p, k) => p && 2 * p + k + W < N).length;
console.log(`depths whose minimal period is covered by >= 2 full periods in ${N} rows: ${certified} of ${W}`);

// ------------------------------------------------------------- the criterion
{
  let bad = 0, drop = 0, rows = [];
  for (let k = 2; k < W; k++) {
    if (!P[k] || !P[k - 1] || !P[k - 2] || !M[k]) continue;
    const L = Math.max(P[k - 1], P[k - 2]);
    if (2 * L + k + W >= N) break;
    // the driver of rightDiagonal_recurrence: R_k(j+1) = R_k(j) ^ g_k(j) with
    // g_k(j) = R_{k-1}(j+1) | R_{k-2}(j+2), both cells in row j+k.
    const g = (j) => R(k - 1, j + 1) | R(k - 2, j + 2);
    let wt = 0, zeros = 0, zLow = 0, zHigh = 0;
    for (let j = 0; j < L; j++) { wt ^= g(j); if (!g(j)) { zeros++; if (j < L / 2) zLow++; else zHigh++; } }
    const tel = R(k, 0) ^ R(k, L);           // telescoped parity: must equal wt
    let marg = 0;
    for (let j = 0; j < L / 2; j++) if (g(j) !== g(j + L / 2)) marg++;
    const predicted = wt ? 2 * L : L;
    const ok = P[k] === predicted;
    if (!ok) bad++;
    if (P[k] < L) drop++;
    if (tel !== wt) { console.log(`   TELESCOPE MISMATCH at k=${k}`); bad++; }
    rows.push(`${k}: P=${P[k]} L=${L} m=${M[k]} wt=${wt} zeros=${zeros} (${(zeros / L).toFixed(3)}) halves=${zLow}/${zHigh}${zLow === zHigh ? ' EQUAL' : ''} marg=${marg} (${(marg / L).toFixed(3)})${ok ? '' : ' <<< FAILS'}`);
  }
  console.log(`criterion "P_k = 2L if wt odd else L", k = 2..${W - 1}: ${bad} failures, ${drop} period collapses (P_k < L)`);
  console.log(rows.join('\n'));
}

// ---------------- the post-doubling mechanism (document C4)
// When the previous depth doubled, P_{k-2} divides L/2 and R_{k-1} is
// antiperiodic at q = L/2, so g_k(j) != g_k(j+q) should hold exactly when
// R_{k-2}(j+2) is white -- and a collapse would need R_{k-2} identically
// black. Test both halves on the picture.
{
  const out = [];
  for (let k = 2; k < W; k++) {
    if (!P[k] || !P[k - 1] || !P[k - 2]) continue;
    const L = Math.max(P[k - 1], P[k - 2]);
    if (2 * L + k + W >= N) break;
    if (!(P[k - 2] < P[k - 1])) continue;          // only the post-doubling depths
    const q = L / 2;
    let antiBad = 0, mechBad = 0, whiteCells = 0;
    for (let j = 0; j < q; j++) {
      if (R(k - 1, j + 1) === R(k - 1, j + 1 + q)) antiBad++;
      const differs = (R(k - 1, j + 1) | R(k - 2, j + 2)) !== (R(k - 1, j + 1 + q) | R(k - 2, j + 2 + q));
      const bWhite = R(k - 2, j + 2) === 0;
      if (differs !== bWhite) mechBad++;
      if (bWhite) whiteCells++;
    }
    out.push(`${k}: q=${q} antiperiodic-failures=${antiBad} mechanism-failures=${mechBad} white cells of R_${k - 2} in one q-window=${whiteCells}`);
  }
  console.log(`post-doubling depths (P_{k-2} < P_{k-1}), mechanism test:`);
  console.log(out.join('\n'));
}

// ---------------- the plateau case (document section 6): which of the three
// local conditions a collapse would need actually fails, and how often.
// a(j) = R_{k-1}(j+1), b(j) = R_{k-2}(j+2); alpha, beta their q-differences.
// A collapse needs: alpha=1,beta=0 -> b=1;  alpha=0,beta=1 -> a=1;
//                   alpha=1,beta=1 -> a != b.
{
  const out = [];
  for (let k = 2; k < W; k++) {
    if (!P[k] || !P[k - 1] || !P[k - 2]) continue;
    const L = Math.max(P[k - 1], P[k - 2]);
    if (2 * L + k + W >= N) break;
    if (P[k - 2] < P[k - 1]) continue;             // plateau depths only
    const q = L / 2;
    let c1 = 0, c2 = 0, c3 = 0, tot = 0;
    for (let j = 0; j < q; j++) {
      const a = R(k - 1, j + 1), a2 = R(k - 1, j + 1 + q);
      const b = R(k - 2, j + 2), b2 = R(k - 2, j + 2 + q);
      const al = a ^ a2, be = b ^ b2;
      if (al && !be && !b) { c1++; tot++; }
      else if (!al && be && !a) { c2++; tot++; }
      else if (al && be && a === b) { c3++; tot++; }
    }
    out.push(`${k}: q=${q} violations ${tot} (${(tot / q).toFixed(3)} of q) by class: a-only=${c1} b-only=${c2} both=${c3}`);
  }
  console.log(`plateau depths (P_{k-2} = P_{k-1}), which condition blocks the collapse:`);
  console.log(out.join('\n'));
}

// ------------------------- is m_k = L always?  (the whole content, see doc §1)
{
  const bad = [];
  for (let k = 2; k < W; k++) {
    if (!P[k] || !P[k - 1] || !P[k - 2] || !M[k]) continue;
    const L = Math.max(P[k - 1], P[k - 2]);
    if (2 * L + k + W >= N) break;
    if (M[k] !== L) bad.push(`${k}:m=${M[k]} L=${L}`);
  }
  console.log(`depths where the driver's minimal period is not L: ${bad.length ? bad.join(' ') : 'none'}`);
}

console.log(`(${Date.now() - t0} ms)`);
