/**
 * Can the reachable-set DP be repaired against absorption?
 *
 * On rule 30's own settled background the DP is absorbed onto diagonal 400 and
 * then advances at speed exactly 1 (explorer/talus3_diag.cjs), because the
 * settled word of diagonal 399 is identically white.  The real front never goes
 * there, and that is PROVABLE rather than merely measured: if the front sat on
 * diagonal k with diagonal k-1 white and settled, then `rule30_left_local_law`
 * makes it advance every row for ever, so diagonal k would be transient at every
 * later index, contradicting `leftDiagonal_periodicFrom_pow`.
 *
 * So the DP can legitimately be told to delete any reachable position lying on
 * an absorbing diagonal.  This script measures whether that repair restores a
 * speed below 1/2 from a SHALLOW start -- which is what the wall needs, since
 * the wall's budget is fixed once, at the anchor t = 18.
 *
 *   node explorer/talus3_augment.cjs
 *
 * Nothing here is a proof.
 */
'use strict';

const KMAX = 24000, J0 = 200000, PMAX = 64, TFRONT = 6000;
const early = new Array(TFRONT + 2);
const deep = new Map();
{
  let row = 1n;
  const need = J0 + 10 * PMAX + KMAX + 8;
  for (let t = 0; t <= need; t++) { if (t <= TFRONT + 1) early[t] = row; if (t >= J0) deep.set(t, row); row = (row << 2n) ^ ((row << 1n) | row); }
}
const seed = (t, x) => Number((early[t] >> BigInt(t + x)) & 1n);
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
const isWhiteWord = new Uint8Array(KMAX + 1);
for (let k = 0; k <= KMAX; k++) { let w = 1; for (const b of S[k]) if (b) { w = 0; break; } isWhiteWord[k] = w; }
const absorbing = (k) => k >= 1 && k <= KMAX && isWhiteWord[k - 1] === 1;
const abs = []; for (let k = 0; k <= KMAX; k++) if (absorbing(k)) abs.push(k);
console.log(`absorbing diagonals below ${KMAX} (left neighbour's settled word identically white): ${abs.join(', ')}`);

function run(t0, m0, steps, H, exclude) {
  let m = m0, t = t0, maxE2 = null, argmax = 0, adv = 0, ret = 0, worstMargin = null, worstAt = 0;
  let set = new Uint8Array(H); set.fill(1);
  if (exclude) for (let o = 0; o < H; o++) if (absorbing(t + m + o)) set[o] = 0;
  const m00 = m;
  for (let step = 0; step < steps; step++) {
    const e2 = 2 * (m00 - m) - step;
    if (maxE2 === null || e2 > maxE2) { maxE2 = e2; argmax = step; }
    const margin = 2 * m + t;                 // the wall needs this >= 1
    if (worstMargin === null || margin < worstMargin) { worstMargin = margin; worstAt = t; }
    const hits = [];
    for (let o = 0; o < H; o++) {
      if (!set[o]) continue;
      const x = m + o, L = settled(t, x - 1), C = settled(t, x), R = settled(t, x + 1);
      if (L === 0) hits.push([x - 1, false]);
      else if (C === 0 && R === 0) hits.push([x, false]);
      else if (C === 0 && R === 1) hits.push([x + 1, true]);
      else hits.push([x, true]);
    }
    const tn = t + 1;
    const keep = (v) => !exclude || !absorbing(tn + v);
    let mNew = Infinity;
    for (const [v, isRay] of hits) {
      if (!isRay) { if (keep(v) && v < mNew) mNew = v; }
      else { let w = v; while (!keep(w)) w++; if (w < mNew) mNew = w; }
    }
    if (mNew === Infinity) { console.log(`  every branch excluded at step ${step}`); break; }
    const next = new Uint8Array(H);
    for (const [v, isRay] of hits) {
      if (!isRay) { if (!keep(v)) continue; const o = v - mNew; if (o >= 0 && o < H) next[o] = 1; }
      else { for (let o = Math.max(0, v - mNew); o < H; o++) if (keep(mNew + o)) next[o] = 1; }
    }
    if (mNew < m) adv++; else if (mNew > m) ret++;
    m = mNew; set = next; t = tn;
  }
  return { net: (m00 - m) / steps, maxE2, argmax, adv: adv / steps, ret: ret / steps, worstMargin, worstAt, endK: t + m };
}

console.log('\nplain DP (the reachable-set machine as Alidade built it):');
for (const [t0, steps] of [[18, 6000], [500, 6000], [2000, 6000]]) {
  const r = run(t0, 0, steps, 300, false);
  console.log(`  from t=${String(t0).padStart(4)}, front at x=0 (diagonal ${t0}): speed ${r.net.toFixed(6)}  amplitude 2E = ${r.maxE2}  min(2F+t) = ${r.worstMargin} at t=${r.worstAt}  ends on diagonal ${r.endK}`);
}
console.log('\nDP with absorbing diagonals excluded (justified by leftDiagonal_periodicFrom_pow + rule30_left_local_law):');
for (const [t0, steps] of [[18, 6000], [500, 6000], [2000, 6000]]) {
  const r = run(t0, 0, steps, 300, true);
  console.log(`  from t=${String(t0).padStart(4)}, front at x=0 (diagonal ${t0}): speed ${r.net.toFixed(6)}  amplitude 2E = ${r.maxE2}  min(2F+t) = ${r.worstMargin} at t=${r.worstAt}  ends on diagonal ${r.endK}`);
}

// the real front, for comparison, over the same rows
{
  let F = null, first = null, worst = null, worstAt = 0, adv = 0, ret = 0, rows = 0;
  for (let t = 0; t <= TFRONT; t++) {
    let f = null;
    for (let x = -t; x <= 0; x++) if (seed(t, x) !== settled(t, x)) { f = x; break; }
    if (f === null) continue;
    if (first === null) first = t;
    const margin = 2 * f + t;
    if (worst === null || margin < worst) { worst = margin; worstAt = t; }
    if (F !== null) { if (f < F) adv++; else if (f > F) ret++; rows++; }
    F = f;
  }
  console.log(`\nthe real front over t <= ${TFRONT}: first at t=${first}, net speed ${((adv - ret) / rows).toFixed(6)}, min(2F+t) = ${worst} at t=${worstAt}`);
}
