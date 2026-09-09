/**
 * The anchor, and the amplitude on rule 30's own settled words.
 *
 * The onset wall `leftDiagonal_onset_le` is, in cell coordinates,
 * `2 F(t) + t >= 1` where F(t) is the leftmost cell at which the seed's
 * picture differs from the settled picture (crystal 51).  A worst-case speed
 * bound of exactly 1/2 is an average, so pathwise it reads
 * `advances(t) <= (t - t0)/2 + c`, and the wall then needs `2c <= 2F(t0)+t0 - 1`.
 * This measures both sides of that budget.
 *
 * The settled words are read OFF THE PICTURE, far down each diagonal, rather
 * than generated from the recurrence: the recurrence fixes them only up to the
 * branch taken at each identically-white diagonal (k = 2, 7, 28, 399, ...), and
 * guessing those branches puts the words in the wrong phase, which shows up as
 * a front at speed 1.  The recurrence is then used as a CHECK on the result.
 *
 *   node explorer/talus3_anchor.cjs
 *
 * Independent of crystal 51 and of explorer/maskfront.mjs; nothing is proved here.
 */
'use strict';

const KMAX = 4000;      // diagonals whose settled word we need
const TFRONT = 4000;    // rows over which the front is followed
const J0 = 20000;       // index, far past every onset, at which words are read
const PMAX = 64;

// ---- the seed's picture ----------------------------------------------------
// cell(t, x) = bit (t + x) of rowNat t   (leftDiagonal_eq_rowNat_testBit)
const early = new Array(TFRONT + 2);
const deep = new Map();
{
  let row = 1n;
  const need = J0 + 10 * PMAX + KMAX + 8;
  for (let t = 0; t <= need; t++) {
    if (t <= TFRONT + 1) early[t] = row;
    if (t >= J0 && t <= need) deep.set(t, row);
    row = (row << 2n) ^ ((row << 1n) | row);
  }
}
const cellAt = (store, t, x) => Number((store.get ? store.get(t) : store[t]) >> BigInt(t + x) & 1n);
const seedEarly = (t, x) => Number((early[t] >> BigInt(t + x)) & 1n);
const seedDeep = (t, x) => Number((deep.get(t) >> BigInt(t + x)) & 1n);
const diagDeep = (k, j) => seedDeep(j + k, -j);   // leftDiagonal k j, for j near J0

// ---- settled words, read off the picture -----------------------------------
const S = [];
for (let k = 0; k <= KMAX; k++) {
  let p = 0;
  for (const cand of [1, 2, 4, 8, 16, 32, 64]) {
    let ok = true;
    // test every candidate over the SAME generous window: 6 samples of a short
    // candidate is not evidence, and accepting p = 1 on six equal cells is what
    // manufactured 33 spurious "identically white" diagonals on the first run.
    for (let s = 0; s < 8 * PMAX && ok; s++) if (diagDeep(k, J0 + s) !== diagDeep(k, J0 + s + cand)) ok = false;
    if (ok) { p = cand; break; }
  }
  if (p === 0) { console.log(`!! diagonal ${k} has no power-of-two period <= ${PMAX} at index ${J0}`); process.exit(1); }
  const w = new Uint8Array(p);
  for (let r = 0; r < p; r++) { const j = J0 + ((r - J0) % p + p) % p; w[r] = diagDeep(k, j); }
  S.push(w);
}
const at = (w, j) => w[((j % w.length) + w.length) % w.length];
const settled = (t, x) => at(S[t + x], -x);

// checks on the settled words
{
  const marks = []; let cur = 0;
  for (let k = 0; k <= KMAX; k++) if (S[k].length > cur) { cur = S[k].length; marks.push(`${cur}@${k}`); }
  console.log(`settled-word periods first reach ${marks.join(', ')}   (NKS p.871: 2@3, 4@8, 8@29, 16@400)`);
  let bad = 0, n = 0;
  for (let k = 2; k <= KMAX; k++) { const p = Math.max(S[k].length, S[k - 1].length, S[k - 2].length); for (let i = 0; i < p; i++) { n++; if (at(S[k], i + 1) !== (at(S[k - 2], i + 2) ^ (at(S[k - 1], i + 1) | at(S[k], i)))) bad++; } }
  console.log(`the diagonal recurrence holds on the settled words: ${n - bad}/${n}  ->  ${bad === 0 ? 'OK' : 'FAILS'}`);
  let b2 = 0, n2 = 0;
  for (let t = 100; t < 600; t++) for (let x = -t + 2; x <= 0; x++) { n2++; if (settled(t + 1, x) !== (settled(t, x - 1) ^ (settled(t, x) | settled(t, x + 1)))) b2++; }
  console.log(`the settled picture obeys rule 30: ${n2 - b2}/${n2}  ->  ${b2 === 0 ? 'OK' : 'FAILS'}`);
  const wl = []; for (let k = 0; k <= KMAX; k++) { let w = true; for (const b of S[k]) if (b) { w = false; break; } if (w) wl.push(k); }
  console.log(`identically white settled diagonals below ${KMAX}: ${wl.join(', ')}  (obstruction 4 gives 2, 7, 28, 399, ...)`);
}

// ---- the front -------------------------------------------------------------
let first = null, minVal = null, minAt = null, F = null, adv = 0, ret = 0, rowsSeen = 0, maxE2 = null, maxE2At = null, F0 = 0, t0 = 0;
for (let t = 0; t <= TFRONT; t++) {
  let f = null;
  for (let x = -t; x <= 0; x++) if (seedEarly(t, x) !== settled(t, x)) { f = x; break; }
  if (f === null) continue;
  if (first === null) { first = { t, x: f }; F0 = f; t0 = t; }
  const v = 2 * f + t;
  if (minVal === null || v < minVal) { minVal = v; minAt = t; }
  if (F !== null) { if (f < F) adv += F - f; else if (f > F) ret += f - F; rowsSeen++; }
  F = f;
  const e2 = 2 * (F0 - f) - (t - t0);
  if (maxE2 === null || e2 > maxE2) { maxE2 = e2; maxE2At = t; }
}
console.log(`first transient cell (t=${first.t}, x=${first.x});  2F+t there = ${2 * first.x + first.t}`);
console.log(`min (2F(t)+t) over t <= ${TFRONT}: ${minVal} at t = ${minAt}`);
console.log(`front: ${adv} cells advance, ${ret} retreat over ${rowsSeen} rows; net speed ${((adv - ret) / rowsSeen).toFixed(6)}`);
console.log(`front amplitude 2E = max_t (2*(F0-F(t)) - (t-t0)) = ${maxE2} at t = ${maxE2At}`);

// ---- the DP on the seed's own settled background ---------------------------
{
  const H = 260, START = 60, STEPS = TFRONT - START - 40;
  let m = 0, maxE = 0, argmax = 0, a = 0;
  let set = new Uint8Array(H); set.fill(1);
  for (let step = 0; step < STEPS; step++) {
    const e2 = (-m) * 2 - step;
    if (e2 > maxE) { maxE = e2; argmax = step; }
    const t = START + step;
    const hits = [];
    for (let o = 0; o < H; o++) {
      if (!set[o]) continue;
      const x = m + o, Lc = settled(t, x - 1), C = settled(t, x), R = settled(t, x + 1);
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
    if (mNew < m) a += m - mNew;
    m = mNew; set = next;
  }
  console.log(`DP on the seed's settled background, ${STEPS} rows from t=${START}: speed ${(a / STEPS).toFixed(6)}, amplitude 2E = ${maxE} at step ${argmax}`);
}
