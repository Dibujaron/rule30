/**
 * Relaxation-free witnesses: run the reachable-set DP on genuine rule 30
 * backgrounds and get the EXACT rational speed of min R.
 *
 *   node explorer/mmc_ring.cjs [maxN]
 *
 * A spatially periodic configuration is a perfectly good bi-infinite rule 30
 * picture, and once its orbit reaches its cycle the picture is a rule 30
 * evolution with an infinite past too.  On such a background the DP's state
 * (shape, position mod N, row phase) lives in a finite set, so the trajectory of
 * min R is eventually periodic and its speed is an exact rational -- no
 * automaton, no truncation, no free bits, nothing to relax.  Anything found here
 * is a lower bound on the maximum mean cycle over rule-30 backgrounds that no
 * modelling choice can be blamed for.
 *
 * Reported separately: the best over all rings, and the best over rings with no
 * identically-white left diagonal (the document's Seam 2 -- a white diagonal is
 * an infinite white channel and the front rides it at speed 1).
 *
 * Nothing here is a proof.
 */
'use strict';

function step30(row) {
  const n = row.length, out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = row[(i - 1 + n) % n] ^ (row[i] | row[(i + 1) % n]);
  return out;
}
const key = (r) => r.join('');

// the orbit of a ring: pre-period and cycle of rows
function orbit(row0) {
  const seen = new Map();
  const rows = [];
  let r = row0;
  for (;;) {
    const k = key(r);
    if (seen.has(k)) return { rows, start: seen.get(k) };
    seen.set(k, rows.length);
    rows.push(r);
    r = step30(r);
  }
}

// exact DP speed on a periodic background, starting on the cycle
// P is the ray cap (P = null means exact, using a generous window)
function dpSpeed(rows, start, N, P) {
  const cyc = rows.slice(start);
  const T = cyc.length;
  const WIN = P === null ? 4 * N + 64 : P + 4;
  let m = 0, phase = 0;
  let rho = 0, mask = 0n;          // R = points below the ray, ray at offset rho
  const seen = new Map();
  for (let step = 0; step < 200000; step++) {
    const st = `${phase}|${((m % N) + N) % N}|${rho}|${mask}`;
    if (seen.has(st)) {
      const [s0, m0] = seen.get(st);
      return { num: m0 - m, den: step - s0, speed: (m0 - m) / (step - s0), steps: step };
    }
    seen.set(st, [step, m]);
    const row = cyc[phase];
    const S = (x) => row[((x % N) + N) % N];
    let ray = -1;
    const pts = [];
    const OMAX = P === null ? WIN - 3 : P + 1;
    for (let o = 0; o <= OMAX; o++) {
      const inR = (o >= rho) || ((mask >> BigInt(o)) & 1n) === 1n;
      if (!inR) continue;
      const x = m + o, L = S(x - 1), C = S(x), R = S(x + 1);
      if (L === 0) pts.push(o - 1);
      else if (C === 0 && R === 0) pts.push(o);
      else if (C === 0 && R === 1) { if (ray < 0 || o + 1 < ray) ray = o + 1; }
      else { if (ray < 0 || o < ray) ray = o; }
      if (ray >= 0 && o > ray + 1) break;
    }
    if (ray < 0) ray = OMAX + 1;
    let mo = ray;
    for (const v of pts) if (v < mo) mo = v;
    let rhoN = ray - mo;
    const capv = P === null ? WIN - 2 : P;
    if (rhoN > capv) rhoN = capv;
    let maskN = 0n;
    for (const v of pts) { const o = v - mo; if (o >= 0 && o < rhoN) maskN |= 1n << BigInt(o); }
    m += mo; rho = rhoN; mask = maskN; phase = (phase + 1) % T;
  }
  return null;
}

// does the cyclic background have an identically-white left diagonal?
// diagonal d is the cells (t, d - t); on a ring of width N with row cycle length T
// the diagonal index matters mod gcd-ish, so just test every d mod lcm(N, ...) via
// N * T rows, which covers every (position, phase) pair.
function hasWhiteDiagonal(cyc, N) {
  const T = cyc.length;
  const L = N * T / gcd(N, T) * gcd(N, T);   // N*T is a safe common period
  const total = N * T;
  for (let d = 0; d < total; d++) {
    let white = true;
    for (let t = 0; t < total && white; t++) {
      const row = cyc[t % T];
      const x = ((d - t) % N + N) % N;
      if (row[x] !== 0) white = false;
    }
    if (white) return true;
  }
  return false;
}
function gcd(a, b) { while (b) { const t = a % b; a = b; b = t; } return a; }

const MAXN = Number(process.argv[2] || 18);
let bestAll = null, bestNoWhite = null;
for (let N = 2; N <= MAXN; N++) {
  const lim = 1 << N;
  const enumerate = lim <= (1 << 20);
  const trials = enumerate ? lim : 300000;
  let s = 123456789 >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };
  for (let it = 0; it < trials; it++) {
    const row0 = new Uint8Array(N);
    if (enumerate) { for (let i = 0; i < N; i++) row0[i] = (it >> i) & 1; }
    else { for (let i = 0; i < N; i++) row0[i] = rnd() & 1; }
    const { rows, start } = orbit(row0);
    const cyc = rows.slice(start);
    const r = dpSpeed(rows, start, N, null);
    if (!r) continue;
    const sp = r.speed;
    if (bestAll === null || sp > bestAll.speed) bestAll = { ...r, N, row0: Array.from(row0), cycLen: cyc.length };
    if (sp > 0.4 && (bestNoWhite === null || sp > bestNoWhite.speed)) {
      if (!hasWhiteDiagonal(cyc, N)) bestNoWhite = { ...r, N, row0: Array.from(row0), cycLen: cyc.length };
    }
  }
  const fa = bestAll ? bestAll.speed.toFixed(5) : '-';
  const fb = bestNoWhite ? `${bestNoWhite.num}/${bestNoWhite.den} = ${bestNoWhite.speed.toFixed(5)}` : '-';
  console.log(`N <= ${N}: best over all rings ${fa};  best with NO white left diagonal ${fb}`);
}
console.log('\nbest overall:', JSON.stringify(bestAll));
console.log('best with no white left diagonal:', JSON.stringify(bestNoWhite));
