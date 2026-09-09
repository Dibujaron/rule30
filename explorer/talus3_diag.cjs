/**
 * Diagnostic: why does the reachable-set DP run at 0.93 on the settled words
 * near diagonal 60, when Alidade measures 0.4531 near diagonal 10^5?
 *
 * Reports, along the DP's own minimum: the white fraction of the cell it reads
 * on its left, the advance/stay/retreat split, and the diagonal index k = t + m
 * it sits on, for several starting depths.  If the answer is that the DP is
 * riding shallow diagonals whose neighbouring settled word is mostly white,
 * then the 0.4531 is a statement about DEEP diagonals and the shallow ones are
 * where the wall's budget is actually spent.
 *
 *   node explorer/talus3_diag.cjs
 *
 * Nothing here is a proof.
 */
'use strict';

const KMAX = 30000, J0 = 200000, PMAX = 64;
const deep = new Map();
{
  let row = 1n;
  const need = J0 + 10 * PMAX + KMAX + 8;
  for (let t = 0; t <= need; t++) { if (t >= J0) deep.set(t, row); row = (row << 2n) ^ ((row << 1n) | row); }
}
const diagDeep = (k, j) => Number((deep.get(j + k) >> BigInt(k)) & 1n);
const S = [];
for (let k = 0; k <= KMAX; k++) {
  let p = 0;
  for (const cand of [1, 2, 4, 8, 16, 32, 64]) {
    let ok = true;
    for (let s = 0; s < 8 * PMAX && ok; s++) if (diagDeep(k, J0 + s) !== diagDeep(k, J0 + s + cand)) ok = false;
    if (ok) { p = cand; break; }
  }
  if (p === 0) { console.log(`!! no power-of-two period <= ${PMAX} at diagonal ${k}`); process.exit(1); }
  const w = new Uint8Array(p);
  for (let r = 0; r < p; r++) w[r] = diagDeep(k, J0 + ((r - J0) % p + p) % p);
  S.push(w);
}
const at = (w, j) => w[((j % w.length) + w.length) % w.length];
const settled = (t, x) => at(S[t + x], -x);
{
  const wl = []; for (let k = 0; k <= KMAX; k++) { let w = true; for (const b of S[k]) if (b) { w = false; break; } if (w) wl.push(k); }
  console.log(`identically white settled diagonals below ${KMAX}: ${wl.join(', ')}`);
  let ones = 0, n = 0;
  for (let k = 100; k < KMAX; k++) for (let j = 0; j < 64; j++) { n++; ones += at(S[k], j); }
  console.log(`black density of the settled words over k in [100, ${KMAX}): ${(ones / n).toFixed(5)}`);
}

function run(k0, rows, H) {
  // start with the front on diagonal k0 at x = 0, i.e. t = k0
  let t = k0, m = 0, adv = 0, stay = 0, ret = 0, whites = 0;
  let set = new Uint8Array(H); set.fill(1);
  for (let step = 0; step < rows; step++) {
    if (settled(t, m - 1) === 0) whites++;
    const hits = [];
    for (let o = 0; o < H; o++) {
      if (!set[o]) continue;
      const x = m + o, L = settled(t, x - 1), C = settled(t, x), R = settled(t, x + 1);
      if (L === 0) hits.push([x - 1, false]);
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
    if (mNew < m) adv++; else if (mNew > m) ret++; else stay++;
    m = mNew; set = next; t++;
  }
  return { net: -m / rows, adv: adv / rows, stay: stay / rows, ret: ret / rows, white: whites / rows, kEnd: t + m, k0 };
}

for (const [k0, rows] of [[60, 4000], [400, 4000], [2000, 4000], [8000, 8000], [20000, 8000]]) {
  const r = run(k0, rows, 300);
  console.log(`start diagonal k0 = ${String(k0).padStart(5)} : net speed ${r.net.toFixed(5)}  advance ${r.adv.toFixed(4)} stay ${r.stay.toFixed(4)} retreat ${r.ret.toFixed(4)}  left-cell white ${r.white.toFixed(5)}  ends on diagonal ${r.kEnd}`);
}

// the greedy walker (advance law alone), same starts, for comparison
for (const [k0, rows] of [[60, 4000], [400, 4000], [8000, 8000], [20000, 8000]]) {
  let t = k0, g = 0, adv = 0;
  for (let step = 0; step < rows; step++) { if (settled(t, g - 1) === 0) { g--; adv++; } t++; }
  console.log(`greedy walker from k0 = ${String(k0).padStart(5)} : speed ${(adv / rows).toFixed(5)}  ends on diagonal ${t + g}`);
}
