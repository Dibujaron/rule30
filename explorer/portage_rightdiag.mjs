/**
 * Portage (connector, 2026-09-08): the right diagonals as antiderivatives.
 *
 *   node explorer/portage_rightdiag.mjs
 *
 * The rightmost W cells of a row, indexed by depth d (cell (t, t-d)), are a
 * closed system: depth d at time t+1 reads depths d, d-1, d-2 at time t. So
 * the right edge can be run for millions of rows in a window of width W, and
 * the right diagonal R_k(j) = cell(j+k, j) is depth k read against j = t - k.
 *
 * Reported:
 *
 *  1. The minimal period of R_k, and whether R_k is exactly periodic from
 *     j = 0 (no transient at all) -- the property the left diagonals lack.
 *  2. The doubling law. R_k(j) = R_k(j-1) XOR g_k(j) with
 *     g_k(j) = R_{k-1}(j) OR R_{k-2}(j+1); g_k has period L = the period of
 *     R_{k-1} and R_{k-2} together, and integrating a period-L word gives a
 *     period-L answer when its weight is even and a period-2L, antiperiodic
 *     answer when its weight is odd. In F_2[Z/L] = F_2[T]/(T^L) that is:
 *     the period doubles exactly when g_k is a unit.
 *  3. The positions k where the period doubles, as a sequence.
 *  4. The onset check: the first j from which R_k is periodic.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const W = 40;                 // depths kept
const N = 4_000_000;          // rows

// R_k(j) for k < W, j = 0 .. N-1  (j = t - k, so t = j + k). The first W rows
// come from a real triangle, because depth d at time t < d has no cell in the
// window yet; from t = W on the window is closed and runs alone.
const t0 = Date.now();
let dep = new Uint8Array(W), nxt = new Uint8Array(W);
const R = Array.from({ length: W }, () => new Uint8Array(N));
{
  let t = 0;
  const put = () => { for (let d = 0; d < W; d++) { const j = t - d; if (j >= 0 && j < N) R[d][j] = dep[d]; } };
  const w = 2 * W + 3, off = W + 1;
  let row = new Uint8Array(w), nr = new Uint8Array(w);
  row[off] = 1;
  for (t = 0; t <= W; t++) {
    for (let d = 0; d < W; d++) dep[d] = t - d >= -t ? row[off + t - d] : 0;
    put();
    for (let i = off - t - 1; i <= off + t + 1; i++) nr[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    [row, nr] = [nr, row];
  }
  t = W;
  while (t < N + W) {
    // depth d at t+1 = depth d at t XOR (depth d-1 at t OR depth d-2 at t)
    nxt[0] = dep[0];                                  // cell (t+1, t+1) = cell (t, t)
    nxt[1] = dep[1] ^ (dep[0] | 0);
    for (let d = 2; d < W; d++) nxt[d] = dep[d] ^ (dep[d - 1] | dep[d - 2]);
    [dep, nxt] = [nxt, dep];
    t++;
    put();
  }
}
console.log(`edge: ${N} values at each of ${W} depths (${Date.now() - t0} ms)`);

// Cross-check the window against a real triangle for the first rows.
{
  const T = 300, off = T + 1, w = 2 * T + 3;
  let row = new Uint8Array(w), nr = new Uint8Array(w);
  row[off] = 1;
  let bad = 0;
  for (let t = 0; t < T; t++) {
    for (let d = 0; d < W && d <= t; d++) { const j = t - d; if (j < N && R[d][j] !== row[off + t - d]) bad++; }
    for (let i = off - t - 1; i <= off + t + 1; i++) nr[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    [row, nr] = [nr, row];
  }
  console.log(`cross-check of the edge window against a full ${T}-row triangle: ${bad} disagreements`);
}

const minPeriod = (a, n, cap) => {
  for (let p = 1; p <= cap; p *= 2) {
    let ok = true;
    for (let j = 0; j + p < n; j++) if (a[j] !== a[j + p]) { ok = false; break; }
    if (ok) return p;
  }
  return 0;
};

const per = [];
for (let k = 0; k < W; k++) {
  const n = Math.min(N, N);
  const p = minPeriod(R[k], n, 1 << 20);
  per.push(p);
}
console.log(`1  minimal period of right diagonal k, k = 0..${W - 1}:`);
console.log(`   ${per.map((p, k) => `${k}:${p || '>2^20'}`).join(' ')}`);
console.log(`   as exponents: ${per.map((p) => (p ? Math.log2(p) : NaN)).join(',')}`);
const doublings = [];
for (let k = 1; k < W; k++) if (per[k] && per[k - 1] && per[k] > per[k - 1]) doublings.push(k);
console.log(`3  k where the period doubles: ${doublings.join(', ')}`);

// 4. onsets: is R_k periodic from j = 0, with no transient?
{
  const bad = [];
  for (let k = 0; k < W; k++) {
    if (!per[k]) continue;
    let last = -1;
    for (let j = per[k]; j < N; j++) if (R[k][j] !== R[k][j - per[k]]) last = j;
    if (last >= 0) bad.push(`${k}@${last}`);
  }
  console.log(`4  right diagonals not periodic from j = 0: ${bad.length ? bad.join(' ') : 'none -- every one is exactly periodic with no transient'}`);
}

// 2. the doubling law: period doubles iff g_k has odd weight over one period L
{
  const out = [];
  let bad = 0;
  for (let k = 2; k < W; k++) {
    if (!per[k] || !per[k - 1] || !per[k - 2]) continue;
    const L = Math.max(per[k - 1], per[k - 2]);
    if (L + 2 >= N) break;
    let wt = 0;
    for (let j = 0; j < L; j++) wt ^= R[k - 1][j] | R[k - 2][j + 1];
    const doubled = per[k] === 2 * L;
    if (!doubled && per[k] !== L) { out.push(`${k}:PERIOD ${per[k]} vs L=${L}`); bad++; continue; }
    if (doubled !== (wt === 1)) { out.push(`${k}:MISMATCH wt=${wt} per=${per[k]} L=${L}`); bad++; }
  }
  console.log(`2  doubling law "period doubles iff g_k is a unit (odd weight over one period)": ${bad} failures for k = 2..${W - 1}${bad ? ' -- ' + out.join(' ') : ''}`);
}

// 5. antiperiodicity: right after a doubling, is R_k antiperiodic (shift by
//    L complements it)? That is v_T(R_k) = L - 1 in F_2[T]/(T^(2L)).
{
  const out = [];
  for (const k of doublings) {
    const L = per[k] / 2;
    let anti = true;
    for (let j = 0; j < L; j++) if (R[k][j] === R[k][j + L]) { anti = false; break; }
    out.push(`${k}:${anti ? 'anti' : 'NOT-anti'}`);
  }
  console.log(`5  antiperiodicity of R_k at each doubling: ${out.join(' ')}`);
}

// 6. the in-cone length of the telescoped centre-column parity
{
  const rows = [];
  for (const k of [100, 1000, 10000, 100000, 1000000]) {
    if (k >= N) break;
    // g_k(j) = cell(j+k-1, j) OR cell(j+k-1, j+1); in the cone iff |j| <= j+k-1
    // In edge coordinates: cell(t, x) with t = j+k-1, x = j is depth t - x = k-1,
    // read at index j, i.e. R_{k-1}(j) with j <= 0 -- outside the stored range.
    rows.push(`${k}:in-cone j from ${-Math.floor((k - 1) / 2)} to 0, ${Math.floor((k - 1) / 2) + 1} terms`);
  }
  console.log(`6  ${rows.join('  ')}`);
}
console.log(`(${Date.now() - t0} ms)`);
