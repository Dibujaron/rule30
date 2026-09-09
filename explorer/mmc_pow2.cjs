/**
 * The strongest constraint level: rule 30 backgrounds whose left diagonals are
 * eventually periodic with period a POWER OF TWO and none identically white.
 *
 *   node explorer/mmc_pow2.cjs [maxN] [trials]
 *
 * The project knows more about the settled picture than "it is a rule 30
 * evolution" (crystal 47): it also knows leftDiagonal_periodicFrom_pow -- every
 * left diagonal is eventually periodic with period dividing 2^k -- and Rosetta's
 * Topic 2 would give that no diagonal the front rides is identically white.
 * A ring of width N whose row orbit has cycle length T has every left diagonal
 * periodic with period dividing lcm(N, T), so taking both N and T powers of two
 * gives a background satisfying all three conditions at once.
 *
 * Speeds here are exact rationals read off the DP's own state cycle.
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
function orbit(row0) {
  const seen = new Map(); const rows = []; let r = row0;
  for (;;) { const k = key(r); if (seen.has(k)) return { rows, start: seen.get(k) }; seen.set(k, rows.length); rows.push(r); r = step30(r); }
}
function whiteDiagonals(cyc, N) {
  const T = cyc.length, total = N * T, out = [];
  for (let d = 0; d < N; d++) {
    let white = true;
    for (let t = 0; t < total && white; t++) if (cyc[t % T][((d - t) % N + N) % N] !== 0) white = false;
    if (white) out.push(d);
  }
  return out;
}
const isPow2 = (n) => n > 0 && (n & (n - 1)) === 0;

// exact speed of min R on a periodic background, by detecting the DP's own cycle
function exactSpeed(cyc, N, H) {
  const T = cyc.length;
  let m = 0, phase = 0;
  let set = new Uint8Array(H).fill(1);
  const seen = new Map();
  for (let step = 0; step < 300000; step++) {
    const st = `${phase}|${((m % N) + N) % N}|${set.join('')}`;
    if (seen.has(st)) { const [s0, m0] = seen.get(st); return { num: m0 - m, den: step - s0 }; }
    seen.set(st, [step, m]);
    const row = cyc[phase];
    const S = (x) => row[((x % N) + N) % N];
    const hits = [];
    for (let o = 0; o < H; o++) {
      if (!set[o]) continue;
      const x = m + o, L = S(x - 1), C = S(x), R = S(x + 1);
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
    m = mNew; set = next; phase = (phase + 1) % T;
  }
  return null;
}

const MAXN = Number(process.argv[2] || 16);
const TRIALS = Number(process.argv[3] || 400000);
let s = 20260909 >>> 0;
const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };

for (const N of [4, 8, 16, 32].filter((n) => n <= MAXN)) {
  let best = null, seenPow2 = 0, kept = 0;
  const enumerate = N <= 16;
  const count = enumerate ? (1 << N) : TRIALS;
  for (let it = 0; it < count; it++) {
    const row0 = new Uint8Array(N);
    if (enumerate) { for (let i = 0; i < N; i++) row0[i] = (it >> i) & 1; }
    else { for (let i = 0; i < N; i++) row0[i] = rnd() & 1; }
    const { rows, start } = orbit(row0);
    const cyc = rows.slice(start);
    if (!isPow2(cyc.length)) continue;
    seenPow2++;
    if (whiteDiagonals(cyc, N).length > 0) continue;
    kept++;
    const r = exactSpeed(cyc, N, 6 * N + 40);
    if (!r) continue;
    if (best === null || r.num * best.den > best.num * r.den) best = { ...r, row0: Array.from(row0), T: cyc.length, cyc };
  }
  const f = best ? `${best.num}/${best.den} = ${(best.num / best.den).toFixed(6)}` : 'none';
  console.log(`N = ${N}: ${seenPow2} rings with power-of-two row period, ${kept} of them with no white left diagonal; best exact speed ${f}` +
    (best ? `  (seed ${best.row0.join('')}, row period ${best.T}, diagonal period divides ${N > best.T ? N : best.T})` : ''));
  if (best) {
    console.log('   picture (one period, time down):');
    for (let i = 0; i < Math.min(best.cyc.length, 16); i++) console.log('     ' + Array.from(best.cyc[i]).map((v) => (v ? '#' : '.')).join(''));
  }
}
