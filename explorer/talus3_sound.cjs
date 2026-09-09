/**
 * Soundness check of the reachable-set DP, on the witness background.
 *
 * The DP is only useful if `min R` is a LOWER bound on the true leftmost
 * disagreement between two rule 30 evolutions sharing that background: the
 * wall's argument reads the DP's leftward speed as an upper bound on the real
 * front's.  explorer/talus3_witness.cjs part (f) reported a real front FASTER
 * than the DP, which would mean the DP is unsound -- so check it directly,
 * step by step, with the background read from its closed form rather than
 * re-evolved in a truncated array (which was that measurement's bug: edge
 * corruption reaches the front after about 1950 rows).
 *
 *   node explorer/talus3_sound.cjs
 *
 * Nothing here is a proof.
 */
'use strict';

const L = 4;
const U = 0b0001, V = 0b1110;
const bit = (w, i) => (w >> (((i % L) + L) % L)) & 1;
function nextWord(u, v) {
  let reset = -1;
  for (let i = 0; i < L; i++) if (bit(v, i + 1) === 1) { reset = i; break; }
  if (reset < 0) return null;
  const vals = new Map();
  let cur = bit(u, reset + 2) ^ 1;
  vals.set(((reset + 1) % L + L) % L, cur);
  for (let s = 1; s < L; s++) { const i = reset + s; cur = bit(u, i + 2) ^ (bit(v, i + 1) | cur); vals.set((((i + 1) % L) + L) % L, cur); }
  let w = 0; for (let i = 0; i < L; i++) w |= (vals.get(i) || 0) << i;
  for (let i = 0; i < L; i++) if (bit(w, i + 1) !== (bit(u, i + 2) ^ (bit(v, i + 1) | bit(w, i)))) return null;
  return w;
}
const S = [U, V];
for (let k = 0; k + 2 <= 60000; k++) S.push(nextWord(S[k], S[k + 1]));
const cell = (t, x) => bit(S[t + x], -x);

const T = 6000;
// the background only exists on the cone k = t + x >= 0, so the whole window
// must stay inside it: start deep enough that t0 + XL is comfortably positive.
const t0 = 9000;
const XL = -(T + 800), XR = 400;
const W = XR - XL + 1, off = -XL;

// picture = background with one flipped cell at x = 0
let pic = new Uint8Array(W);
for (let i = 0; i < W; i++) pic[i] = cell(t0, i + XL);
pic[off] ^= 1;

let dpM = 0, dpT = t0;
const H = 400;
let set = new Uint8Array(H); set.fill(1);

let violations = 0, firstViolation = null, adv = 0, rows = 0, front0 = 0, lastFront = 0;
let dpAdvances = 0;
for (let step = 0; step < T; step++) {
  const t = t0 + step;
  // real leftmost disagreement, computed against the exact background
  let f = null;
  for (let i = 0; i < W; i++) if (pic[i] !== cell(t, i + XL)) { f = i + XL; break; }
  if (f === null) { console.log(`the difference vanished at step ${step}`); break; }
  if (f <= XL + 100) { console.log(`front reached the window edge at step ${step}; stopping`); break; }
  if (step === 0) { front0 = f; lastFront = f; }
  else { if (f < lastFront) adv++; rows++; lastFront = f; }
  if (f < dpM) { violations++; if (firstViolation === null) firstViolation = { step, f, dpM }; }

  // one DP step
  const hits = [];
  for (let o = 0; o < H; o++) {
    if (!set[o]) continue;
    const x = dpM + o, Lc = cell(t, x - 1), C = cell(t, x), R = cell(t, x + 1);
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
  if (mNew < dpM) dpAdvances++;
  dpM = mNew; set = next; dpT = t + 1;

  // one real step, in the interior only
  const np = new Uint8Array(W);
  for (let i = 1; i < W - 1; i++) np[i] = pic[i - 1] ^ (pic[i] | pic[i + 1]);
  np[0] = cell(t + 1, XL); np[W - 1] = cell(t + 1, XR); // exact at the two edge cells
  pic = np;
}
console.log(`real front: ${adv} advances over ${rows} rows, speed ${(adv / rows).toFixed(6)}, from x=${front0} to x=${lastFront}`);
console.log(`DP min R : ${dpAdvances} advances over ${rows} rows, speed ${(dpAdvances / rows).toFixed(6)}, ending at ${dpM}`);
console.log(`soundness (real front never left of DP min R): ${violations} violations` + (firstViolation ? `  first at step ${firstViolation.step}: front ${firstViolation.f} < min R ${firstViolation.dpM}` : '  -> OK'));
