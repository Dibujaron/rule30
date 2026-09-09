/**
 * What does truncating the reachable set's ray cost?
 *
 *   node explorer/mmc_cap_cost.cjs [rows] [ringBits]
 *
 * The DP state is (points, ray offset rho). Measured, rho has a fat tail
 * (max 49 over 3e5 rows), so the state set is NOT finite as it stands. Pulling
 * the ray in to offset at most P replaces R by a SUPERSET, and the transition
 * is monotone in R, so min R only ever gets smaller: the capped DP is a sound
 * over-approximation of the speed. This script measures the price of the cap,
 * against a random ring evolved under rule 30. All caps run in lockstep on the
 * same background so the comparison is exact and the ring is evolved once.
 *
 * Nothing here is a proof.
 */
'use strict';

function makeRing(n, seed) {
  let s = seed >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };
  const row = new Uint8Array(n);
  for (let i = 0; i < n; i++) row[i] = rnd() & 1;
  return row;
}
function step30Into(row, out) {
  const n = row.length;
  let l = row[n - 1], c = row[0];
  for (let i = 0; i < n; i++) {
    const r = row[i + 1 === n ? 0 : i + 1];
    out[i] = l ^ (c | r);
    l = c; c = r;
  }
}

class CappedDP {
  constructor(P) {
    this.P = P;
    this.W = (Number.isFinite(P) ? P : 512) + 6;
    this.m = 0;
    this.pts = new Uint8Array(this.W);
    this.rayFrom = 0;           // start state R = [m, inf)
    this.over = 0;
  }
  step(S) {
    const { P, W } = this;
    const pts = this.pts, m = this.m, rayFrom = this.rayFrom;
    let rayNew = Infinity;
    const ptsNew = [];
    const OMAX = Number.isFinite(P) ? P + 1 : W - 2;
    for (let o = 0; o <= OMAX; o++) {
      if (!(o >= rayFrom || pts[o] === 1)) continue;
      const x = m + o;
      const L = S(x - 1), C = S(x), R = S(x + 1);
      if (L === 0) ptsNew.push(x - 1);
      else if (C === 0 && R === 0) ptsNew.push(x);
      else if (C === 0 && R === 1) { if (x + 1 < rayNew) rayNew = x + 1; }
      else { if (x < rayNew) rayNew = x; }
      if (rayNew < Infinity && x > rayNew + 1) break;
    }
    if (!Number.isFinite(rayNew)) { this.over++; rayNew = m + OMAX + 1; }
    let mNew = rayNew;
    for (const v of ptsNew) if (v < mNew) mNew = v;
    let rho = rayNew - mNew;
    if (Number.isFinite(P) && rho > P) rho = P;
    if (rho > W - 2) rho = W - 2;
    const nextPts = new Uint8Array(W);
    for (const v of ptsNew) { const o = v - mNew; if (o >= 0 && o < rho) nextPts[o] = 1; }
    this.m = mNew; this.pts = nextPts; this.rayFrom = rho;
  }
}

const ROWS = Number(process.argv[2] || 100000);
const N = 1 << Number(process.argv[3] || 13);
const CAPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24, 32, Infinity];
console.log(`rows ${ROWS}, random ring of ${N} evolved under rule 30 (2000-row warmup)`);
const results = new Map(CAPS.map((P) => [P, []]));
for (const seed of [12345, 999331, 4242424]) {
  let row = makeRing(N, seed), tmp = new Uint8Array(N);
  for (let i = 0; i < 2000; i++) { step30Into(row, tmp); const t = row; row = tmp; tmp = t; }
  const dps = CAPS.map((P) => new CappedDP(P));
  const S = (x) => row[((x % N) + N) % N];
  for (let step = 0; step < ROWS; step++) {
    for (const d of dps) d.step(S);
    step30Into(row, tmp); const t = row; row = tmp; tmp = t;
  }
  dps.forEach((d, i) => results.get(CAPS[i]).push(-d.m / ROWS));
}
console.log('   P      seed 12345   seed 999331   seed 4242424');
for (const P of CAPS) {
  const v = results.get(P);
  const flag = Math.max(...v) < 0.5 ? '' : '   <- at or above 1/2';
  console.log(`${String(P).padStart(5)}    ${v.map((x) => x.toFixed(5)).join('      ')}${flag}`);
}
