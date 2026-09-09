/**
 * Reproduce Alidade's reachable-set DP against a rule-30 background, and
 * measure the DP state's shape (the ray offset rho and the point mask) so we
 * know how big a finite automaton has to be.
 *
 *   node explorer/mmc_dp_check.cjs
 *
 * The DP (see the connection document's 3.1, and explorer/alidade_dp2.mjs):
 *   R(t+1) = union over x in R(t) of N(x), where with
 *   L = S(t,x-1), C = S(t,x), R = S(t,x+1):
 *     L = 0            -> {x-1}          advance
 *     (1,0,0)          -> {x}            forced stay
 *     (1,0,1)          -> [x+1, inf)     forced retreat
 *     (1,1,*)          -> [x,   inf)     band decides
 * min R(t) is a background-only lower bound for the front F(t).
 *
 * Background: a random ring evolved under rule 30, which is Alidade's fourth
 * control (it reported 0.45292 there).
 *
 * Nothing here is a proof.
 */
'use strict';

// ---------------------------------------------------------------- background
function makeRing(n, seed) {
  let s = seed >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };
  const row = new Uint8Array(n);
  for (let i = 0; i < n; i++) row[i] = rnd() & 1;
  return row;
}
function step30(row) {
  const n = row.length, out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const l = row[(i - 1 + n) % n], c = row[i], r = row[(i + 1) % n];
    out[i] = l ^ (c | r);
  }
  return out;
}

// ---------------------------------------------------------------- the DP
// Reference implementation: points-plus-ray, mirroring alidade_dp2.mjs.
function runDP(rows, N, seed, WIN) {
  let row = makeRing(N, seed);
  for (let i = 0; i < 2000; i++) row = step30(row);        // warm up onto the attractor
  const S = (x) => row[((x % N) + N) % N];

  let m = 0;                       // absolute position of min R
  let pts = new Uint8Array(WIN);   // pts[o] = 1 means m+o in R (below the ray)
  let rayFrom = 0;                 // ray starts at offset rayFrom; start state R = [m, inf)
  let over = 0;
  const rhoHist = new Map();
  const shapeSeen = new Set();
  let maxRho = 0;
  const weights = { '-1': 0, '0': 0, '1': 0 };

  for (let step = 0; step < rows; step++) {
    const reachable = (o) => (o >= rayFrom) || pts[o] === 1;
    let rayNew = Infinity;
    const ptsNew = [];
    for (let o = 0; o < WIN; o++) {
      if (!reachable(o)) continue;
      const x = m + o;
      const L = S(x - 1), C = S(x), R = S(x + 1);
      if (L === 0) ptsNew.push(x - 1);
      else if (C === 0 && R === 0) ptsNew.push(x);
      else if (C === 0 && R === 1) { if (x + 1 < rayNew) rayNew = x + 1; }
      else { if (x < rayNew) rayNew = x; }
      if (rayNew < Infinity && x > rayNew + 1) break;
    }
    if (rayNew === Infinity) { over++; rayNew = m + WIN; }
    let mNew = rayNew;
    for (const v of ptsNew) if (v < mNew) mNew = v;
    const nextPts = new Uint8Array(WIN);
    for (const v of ptsNew) { if (v >= rayNew) continue; const o = v - mNew; if (o >= 0 && o < WIN) nextPts[o] = 1; }
    const nextRay = rayNew - mNew;
    if (nextRay >= WIN) over++;

    const w = m - mNew;                    // leftward displacement of min R
    weights[String(w)]++;
    const rho = Math.min(nextRay, WIN);
    rhoHist.set(rho, (rhoHist.get(rho) || 0) + 1);
    if (rho > maxRho) maxRho = rho;
    // shape id: rho plus the point mask below the ray (only meaningful when small)
    if (rho <= 24) {
      let mask = 0;
      for (let o = 0; o < rho; o++) if (nextPts[o]) mask |= (1 << o);
      shapeSeen.add(rho * (1 << 25) + mask);
    }

    m = mNew; pts = nextPts; rayFrom = Math.min(nextRay, WIN);
    row = step30(row);
  }
  return { speed: -m / rows, over, rhoHist, maxRho, shapeSeen, weights, m };
}

const ROWS = Number(process.argv[2] || 300000);
const N = 1 << 15;
for (const seed of [12345, 999331, 4242424]) {
  const r = runDP(ROWS, N, seed, 512);
  console.log(`seed ${seed}: rows ${ROWS}  min R moved ${r.m}  speed ${r.speed.toFixed(5)}  window overflows ${r.over}  max rho ${r.maxRho}`);
  console.log(`   weights: advance(+1) ${r.weights['1']}  stay(0) ${r.weights['0']}  retreat(-1) ${r.weights['-1']}`);
  const hist = [...r.rhoHist.entries()].sort((a, b) => a[0] - b[0]);
  console.log('   rho histogram (rho:count): ' + hist.slice(0, 20).map(([k, v]) => `${k}:${v}`).join(' '));
  const tail = hist.filter(([k]) => k >= 12).reduce((a, [, v]) => a + v, 0);
  console.log(`   rows with rho >= 12: ${tail} of ${ROWS} (${(tail / ROWS * 100).toFixed(3)}%);  distinct shapes seen: ${r.shapeSeen.size}`);
}
