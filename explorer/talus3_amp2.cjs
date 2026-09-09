/**
 * Two loose ends on the amplitude, which is the additive constant the onset
 * induction has to pay for a bound that is an AVERAGE of 1/2 rather than a
 * per-step 1/2.
 *
 *   (a) does the amplitude stay flat as the background's period grows?  The
 *       settled words' periods are unbounded (leftDiagonal_period_unbounded),
 *       so a constant that grows with the period is fatal even though it is
 *       finite at every size.  Rings sampled at N = 32 and 64 as well as
 *       enumerated at 4, 8, 16.
 *   (b) what is the amplitude on the seed's OWN settled words, inside a window
 *       that contains no identically-white diagonal -- which is the only kind
 *       of window in which the DP's 0.4531 is a statement at all?
 *
 *   node explorer/talus3_amp2.cjs
 *
 * Nothing here is a proof.
 */
'use strict';

function step30(row) { const n = row.length, out = new Uint8Array(n); for (let i = 0; i < n; i++) out[i] = row[(i - 1 + n) % n] ^ (row[i] | row[(i + 1) % n]); return out; }
const key = (r) => r.join('');
function orbit(row0) { const seen = new Map(); const rows = []; let r = row0; for (;;) { const k = key(r); if (seen.has(k)) return { rows, start: seen.get(k) }; seen.set(k, rows.length); rows.push(r); r = step30(r); } }
function whiteDiagonals(cyc, N) { const T = cyc.length, total = N * T, out = []; for (let d = 0; d < N; d++) { let w = true; for (let t = 0; t < total && w; t++) if (cyc[t % T][((d - t) % N + N) % N] !== 0) w = false; if (w) out.push(d); } return out; }
const isPow2 = (n) => n > 0 && (n & (n - 1)) === 0;

function dp(cellOf, H, steps) {
  let m = 0, maxE2 = 0, argmax = 0, adv = 0, ret = 0;
  let set = new Uint8Array(H); set.fill(1);
  for (let step = 0; step < steps; step++) {
    const e2 = (-m) * 2 - step;
    if (e2 > maxE2) { maxE2 = e2; argmax = step; }
    const hits = [];
    for (let o = 0; o < H; o++) {
      if (!set[o]) continue;
      const x = m + o, L = cellOf(step, x - 1), C = cellOf(step, x), R = cellOf(step, x + 1);
      if (L === 0) hits.push([x - 1, false]);
      else if (C === 0 && R === 0) hits.push([x, false]);
      else if (C === 0 && R === 1) hits.push([x + 1, true]);
      else hits.push([x, true]);
    }
    let mNew = Infinity;
    for (const [v] of hits) if (v < mNew) mNew = v;
    const next = new Uint8Array(H);
    for (const [v, isRay] of hits) { if (!isRay) { const o = v - mNew; if (o >= 0 && o < H) next[o] = 1; } else { for (let o = Math.max(0, v - mNew); o < H; o++) next[o] = 1; } }
    if (mNew < m) adv++; else if (mNew > m) ret++;
    m = mNew; set = next;
  }
  return { net: -m / steps, maxE2, argmax, adv: adv / steps, ret: ret / steps };
}

// ---- (a) rings ------------------------------------------------------------
let s = 20260909 >>> 0;
const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };
for (const N of [4, 8, 16, 32, 64]) {
  const H = 6 * N + 60, STEPS = 6000;
  const enumerate = N <= 16, count = enumerate ? (1 << N) : 300000;
  let kept = 0, bestSp = null, worstAmp = null, maxRowPeriod = 0;
  for (let it = 0; it < count; it++) {
    const row0 = new Uint8Array(N);
    if (enumerate) { for (let i = 0; i < N; i++) row0[i] = (it >> i) & 1; }
    else { for (let i = 0; i < N; i++) row0[i] = rnd() & 1; }
    const { rows, start } = orbit(row0);
    const cyc = rows.slice(start);
    if (!isPow2(cyc.length)) continue;
    if (whiteDiagonals(cyc, N).length > 0) continue;
    kept++;
    if (cyc.length > maxRowPeriod) maxRowPeriod = cyc.length;
    const T = cyc.length;
    const cellOf = (t, x) => cyc[t % T][((x % N) + N) % N];
    const r = dp(cellOf, H, STEPS);
    if (bestSp === null || r.net > bestSp.net) bestSp = { ...r, row0: Array.from(row0), T };
    if (worstAmp === null || r.maxE2 > worstAmp.maxE2) worstAmp = { ...r, row0: Array.from(row0), T };
  }
  if (!kept) { console.log(`N = ${N}: no admissible ring found in ${count} ${enumerate ? 'words' : 'samples'}`); continue; }
  console.log(`N = ${String(N).padStart(2)}: ${kept} admissible ${enumerate ? `of ${1 << N} (exhaustive)` : `of ${count} samples`}, largest row period ${maxRowPeriod}`);
  console.log(`      max net speed ${bestSp.net.toFixed(6)} (seed ${bestSp.row0.join('')}, row period ${bestSp.T})`);
  console.log(`      max amplitude 2E = ${worstAmp.maxE2} at step ${worstAmp.argmax} (seed ${worstAmp.row0.join('')}, row period ${worstAmp.T}, speed ${worstAmp.net.toFixed(6)})`);
}

// ---- (b) the seed's settled words, in a white-diagonal-free window ---------
{
  const KMAX = 40000, J0 = 300000, PMAX = 64;
  const deep = new Map();
  let row = 1n;
  const need = J0 + 10 * PMAX + KMAX + 8;
  for (let t = 0; t <= need; t++) { if (t >= J0) deep.set(t, row); row = (row << 2n) ^ ((row << 1n) | row); }
  const diagDeep = (k, j) => Number((deep.get(j + k) >> BigInt(k)) & 1n);
  const S = [];
  for (let k = 0; k <= KMAX; k++) {
    let p = 0;
    for (const cand of [1, 2, 4, 8, 16, 32, 64]) { let ok = true; for (let q = 0; q < 8 * PMAX && ok; q++) if (diagDeep(k, J0 + q) !== diagDeep(k, J0 + q + cand)) ok = false; if (ok) { p = cand; break; } }
    const w = new Uint8Array(p);
    for (let r = 0; r < p; r++) w[r] = diagDeep(k, J0 + ((r - J0) % p + p) % p);
    S.push(w);
  }
  const at = (w, j) => w[((j % w.length) + w.length) % w.length];
  const settled = (t, x) => at(S[t + x], -x);
  const whites = []; for (let k = 0; k <= KMAX; k++) { let w = true; for (const b of S[k]) if (b) { w = false; break; } if (w) whites.push(k); }
  console.log(`\nseed's settled words: identically white diagonals below ${KMAX}: ${whites.join(', ')}`);
  for (const [k0, steps] of [[500, 20000], [2000, 20000], [10000, 20000]]) {
    const r = dp((step, x) => settled(k0 + step, x), 300, steps);
    console.log(`  DP from diagonal ${String(k0).padStart(5)}, ${steps} rows: net speed ${r.net.toFixed(6)}, advance ${r.adv.toFixed(4)} retreat ${r.ret.toFixed(4)}, amplitude 2E = ${r.maxE2} at step ${r.argmax}`);
  }
}
