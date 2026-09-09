/**
 * Verify (or kill) the candidate witness found by explorer/talus3_orbit.cjs:
 * a settled-word background of diagonal period 4, no white diagonal, on which
 * the reachable-set DP's leftward speed exceeds 1/2.
 *
 * Everything the wall's constraint set claims about the settled picture is
 * checked directly on the generated picture rather than assumed:
 *   (a) it is a genuine rule 30 evolution, cell by cell;
 *   (b) every left diagonal is periodic with period dividing a power of two;
 *   (c) no left diagonal is identically white;
 *   (d) the DP speed, as an exact rational from a properly detected cycle,
 *       and its sensitivity to the reachable-set horizon H;
 *   (e) what the picture's ROW period is -- the extra condition mmc_pow2.cjs
 *       imposes and the settled region does not have;
 *   (f) whether a REAL damage front on this background reaches the same speed,
 *       or whether the DP is merely loose here.
 *
 *   node explorer/talus3_witness.cjs
 *
 * Nothing here is a proof.
 */
'use strict';

const L = 4;
const U = 0b0001, V = 0b1110; // bit i of the word is (w >> i) & 1
const bit = (w, i) => (w >> (((i % L) + L) % L)) & 1;

function nextWord(u, v) {
  let reset = -1;
  for (let i = 0; i < L; i++) if (bit(v, i + 1) === 1) { reset = i; break; }
  if (reset < 0) return null;
  const vals = new Map();
  let cur = bit(u, reset + 2) ^ 1;
  vals.set(((reset + 1) % L + L) % L, cur);
  for (let s = 1; s < L; s++) {
    const i = reset + s;
    cur = bit(u, i + 2) ^ (bit(v, i + 1) | cur);
    vals.set((((i + 1) % L) + L) % L, cur);
  }
  let w = 0;
  for (let i = 0; i < L; i++) w |= (vals.get(i) || 0) << i;
  for (let i = 0; i < L; i++) if (bit(w, i + 1) !== (bit(u, i + 2) ^ (bit(v, i + 1) | bit(w, i)))) return null;
  return w;
}

const KMAX = 40000;
const S = [U, V];
for (let k = 0; k + 2 <= KMAX; k++) {
  const w = nextWord(S[k], S[k + 1]);
  if (w === null) { console.log(`white diagonal reached at k = ${k + 2} -- witness is NOT admissible`); process.exit(0); }
  S.push(w);
}
const cell = (t, x) => bit(S[t + x], -x);

// (a) rule 30, cell by cell
{
  let bad = 0, n = 0;
  for (let t = 5; t < 2000; t++) for (let x = -t + 6; x <= 400; x++) {
    if (t + x - 1 < 0 || t + x + 2 >= S.length) continue;
    if (cell(t + 1, x) !== (cell(t, x - 1) ^ (cell(t, x) | cell(t, x + 1)))) bad++;
    n++;
  }
  console.log(`(a) rule 30 holds on ${n - bad}/${n} cells of the window  ->  ${bad === 0 ? 'OK' : 'FAILS'}`);
}

// (b),(c) diagonal periods and whiteness, read off the picture not the words
{
  let worstPeriod = 0, whites = 0, nonPow2 = 0;
  for (let k = 0; k < 20000; k++) {
    let p = 0;
    for (const cand of [1, 2, 4, 8, 16, 32]) {
      let ok = true;
      for (let j = 0; j < 200 && ok; j++) if (cell(j + k, -j) !== cell(j + cand + k, -(j + cand))) ok = false;
      if (ok) { p = cand; break; }
    }
    if (p === 0) { nonPow2++; continue; }
    if (p > worstPeriod) worstPeriod = p;
    let white = true;
    for (let j = 0; j < 64 && white; j++) if (cell(j + k, -j) !== 0) white = false;
    if (white) whites++;
  }
  console.log(`(b) largest diagonal period over k < 20000: ${worstPeriod}   diagonals with no power-of-two period <= 32: ${nonPow2}`);
  console.log(`(c) identically white diagonals over k < 20000: ${whites}`);
}

// (e) row period: is this picture spatially periodic, and what is its row period?
{
  const rowOf = (t, w) => { let s = ''; for (let x = -w; x <= w; x++) s += cell(t, x); return s; };
  let rowPeriod = 0;
  for (let p = 1; p <= 64; p++) {
    let ok = true;
    for (let t = 200; t < 260 && ok; t++) if (rowOf(t, 60) !== rowOf(t + p, 60)) ok = false;
    if (ok) { rowPeriod = p; break; }
  }
  let spatial = 0;
  for (let s = 1; s <= 64; s++) {
    let ok = true;
    for (let t = 200; t < 260 && ok; t++) for (let x = -60; x <= 60 && ok; x++) if (cell(t, x) !== cell(t, x + s)) ok = false;
    if (ok) { spatial = s; break; }
  }
  let shear = 0;
  for (const p of [1, 2, 4, 8, 16, 32]) {
    let ok = true;
    for (let t = 200; t < 260 && ok; t++) for (let x = -60; x <= 60 && ok; x++) if (cell(t, x) !== cell(t + p, x - p)) ok = false;
    if (ok) { shear = p; break; }
  }
  console.log(`(e) row period ${rowPeriod || '> 64 (none)'} ; spatial period ${spatial || '> 64 (none)'} ; shear period (t,x)->(t+p,x-p): ${shear || 'none <= 32'}`);
  console.log('    rows 200..211, x in [-24, 4] (time down, left is left):');
  for (let t = 200; t < 212; t++) { let s = ''; for (let x = -24; x <= 4; x++) s += cell(t, x) ? '#' : '.'; console.log('      ' + s); }
}

// (d) DP with a correctly-bounded state key, exact cycle, horizon sweep
function runDP(H, steps, cycLen) {
  let m = 0, t = 6;
  let set = new Uint8Array(H); set.fill(1);
  const seen = new Map();
  let cycle = null, maxE2 = 0, argmax = 0;
  for (let step = 0; step < steps; step++) {
    const E2 = (-m) * 2 - step;
    if (E2 > maxE2) { maxE2 = E2; argmax = step; }
    const st = `${((t + m) % cycLen + cycLen) % cycLen}|${((m % L) + L) % L}|${set.join('')}`;
    if (cycle === null && seen.has(st)) { const [s0, m0] = seen.get(st); cycle = { num: m0 - m, den: step - s0, at: step }; }
    if (!seen.has(st)) seen.set(st, [step, m]);
    const hits = [];
    for (let o = 0; o < H; o++) {
      if (!set[o]) continue;
      const x = m + o, Lc = cell(t, x - 1), C = cell(t, x), R = cell(t, x + 1);
      if (Lc === 0) hits.push([x - 1, false]);
      else if (C === 0 && R === 0) hits.push([x, false]);
      else if (C === 0 && R === 1) hits.push([x + 1, true]);
      else hits.push([x, true]);
    }
    let mNew = Infinity;
    for (const [v] of hits) if (v < mNew) mNew = v;
    const next = new Uint8Array(H);
    for (const [v, isRay] of hits) {
      if (!isRay) { const o = v - mNew; if (o >= 0 && o < H) next[o] = 1; }
      else { for (let o = Math.max(0, v - mNew); o < H; o++) next[o] = 1; }
    }
    m = mNew; set = next; t++;
  }
  return { cycle, maxE2, argmax, avg: (-m) / steps };
}
// find the cycle length of the settled-word sequence
let cycLen = 0;
{
  const seen = new Map();
  for (let k = 0; k + 1 < 20000; k++) {
    const key = `${S[k]},${S[k + 1]}`;
    if (seen.has(key)) { cycLen = k - seen.get(key); break; }
    seen.set(key, k);
  }
}
console.log(`(d) settled-word pair sequence is periodic in k with cycle length ${cycLen}`);
for (const H of [64, 128, 256]) {
  for (const steps of [4000, 20000]) {
    const r = runDP(H, steps, cycLen || 1);
    const c = r.cycle ? `${r.cycle.num}/${r.cycle.den} = ${(r.cycle.num / r.cycle.den).toFixed(6)} (found at step ${r.cycle.at})` : 'no cycle found';
    console.log(`    H=${H} steps=${steps}: exact ${c} ; running average ${r.avg.toFixed(6)} ; max 2E = ${r.maxE2} at ${r.argmax}`);
  }
}

// (f) a REAL front: pick a real rule 30 picture differing from the background,
//     and track the leftmost disagreement.  The background here is the whole
//     bi-infinite picture; perturb one cell far to the right of the origin and
//     follow the leftmost difference.
{
  const W = 3000, T = 4000, off = W; // x index = i - off, i in [0, 2W]
  let bg = new Uint8Array(2 * W + 1), pic = new Uint8Array(2 * W + 1);
  const t0 = 6;
  for (let i = 0; i <= 2 * W; i++) bg[i] = cell(t0, i - off);
  pic.set(bg);
  pic[off + 60] ^= 1; // one flipped cell, 60 to the right of the origin
  let front = null, adv = 0, rows = 0, minF = 60, maxE2 = 0;
  for (let t = 0; t < T; t++) {
    // leftmost difference, keeping clear of the array edges
    let f = null;
    for (let i = 200; i <= 2 * W - 200; i++) if (bg[i] !== pic[i]) { f = i - off; break; }
    if (f === null) { console.log('(f) the difference died out'); break; }
    if (front !== null) { if (f < front) adv++; rows++; const e = 2 * (minF - f) - rows; if (e > maxE2) maxE2 = e; }
    else { minF = f; }
    front = f;
    const nb = new Uint8Array(2 * W + 1), np = new Uint8Array(2 * W + 1);
    for (let i = 1; i < 2 * W; i++) { nb[i] = bg[i - 1] ^ (bg[i] | bg[i + 1]); np[i] = pic[i - 1] ^ (pic[i] | pic[i + 1]); }
    bg = nb; pic = np;
    if (t > T - 5) break;
  }
  console.log(`(f) real front over ${rows} rows: ${adv} advances, speed ${(adv / rows).toFixed(6)} ; max 2E = ${maxE2}`);
}
