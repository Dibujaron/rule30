/**
 * Q1: does a worst-case front speed of EXACTLY 1/2 close the onset induction?
 *
 * The onset wall in diagonal coordinates is `onset(k) <= k`: the seam's index
 * grows by at most one per diagonal.  In cell coordinates that is
 * `2 F(t) + t >= 0`, the front moving left at speed at most 1/2.
 *
 * A max-mean-cycle bound of exactly 1/2 is an AVERAGE over a cycle.  Written
 * pathwise it reads
 *
 *     advances(t) <= (t - t0)/2 + E
 *
 * with E the worst excursion above the line -- the amplitude.  The wall then
 * needs `2 E <= (2 F(t0) + t0)`, the margin at the anchor.  So the whole
 * question is the size of E, and whether it stays bounded as the background's
 * period grows.  This script measures E.
 *
 * The ring family and the DP transition are Alidade's, copied verbatim from
 * explorer/mmc_pow2.cjs so that the object measured is the one the obstruction
 * entry describes.  Instrumentation added: cumulative advances, the excess
 * over the half-speed line, and the same quantities from a SINGLETON start
 * (the state a real anchor row would give, where the front is known exactly)
 * as well as the all-ones start (front unknown).
 *
 *   node explorer/talus3_amp.cjs
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

/**
 * Run the reachable-set DP on a periodic background, from a given start set.
 * Returns the exact cycle speed (num/den advances per row) and the amplitude
 * E = max over t of (advances(t) - t/2), measured over transient + cycles.
 */
function runDP(cyc, N, H, startSingleton, steps) {
  const T = cyc.length;
  let m = 0, phase = 0;
  const set0 = new Uint8Array(H);
  if (startSingleton) set0[0] = 1; else set0.fill(1);
  let set = set0;
  const seen = new Map();
  let maxE = 0, argmaxE = 0;
  let cycle = null;
  for (let step = 0; step < steps; step++) {
    // excess above the half-speed line, in units of cells
    const E2 = (-m) * 2 - step; // 2*advances - step ; E = E2/2
    if (E2 > maxE) { maxE = E2; argmaxE = step; }
    const st = `${phase}|${((m % N) + N) % N}|${set.join('')}`;
    if (cycle === null && seen.has(st)) {
      const [s0, m0] = seen.get(st);
      cycle = { num: m0 - m, den: step - s0, at: step };
    }
    if (!seen.has(st)) seen.set(st, [step, m]);
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
  return { cycle, maxE2: maxE, argmaxE };
}

const SIZES = [4, 8, 16];
const STEPS = 4000;

for (const N of SIZES) {
  const H = 6 * N + 40;
  let kept = 0;
  let bestSpeed = null;          // max exact speed
  let worstAmpAll = null;        // max amplitude, all-ones start
  let worstAmpSing = null;       // max amplitude, singleton start
  let ampAmongHalf = null;       // max amplitude among rings whose speed is exactly 1/2
  let nHalf = 0, nAbove = 0;
  for (let it = 0; it < (1 << N); it++) {
    const row0 = new Uint8Array(N);
    for (let i = 0; i < N; i++) row0[i] = (it >> i) & 1;
    const { rows, start } = orbit(row0);
    const cyc = rows.slice(start);
    if (!isPow2(cyc.length)) continue;
    if (whiteDiagonals(cyc, N).length > 0) continue;
    kept++;
    const a = runDP(cyc, N, H, false, STEPS);
    const s = runDP(cyc, N, H, true, STEPS);
    if (!a.cycle) continue;
    const sp = a.cycle.num / a.cycle.den;
    if (bestSpeed === null || sp > bestSpeed.sp) bestSpeed = { sp, ...a.cycle, row0: Array.from(row0), T: cyc.length };
    if (Math.abs(sp - 0.5) < 1e-12) nHalf++;
    if (sp > 0.5 + 1e-12) nAbove++;
    const recA = { E2: a.maxE2, at: a.argmaxE, row0: Array.from(row0), T: cyc.length, sp };
    const recS = { E2: s.maxE2, at: s.argmaxE, row0: Array.from(row0), T: cyc.length, sp };
    if (worstAmpAll === null || recA.E2 > worstAmpAll.E2) worstAmpAll = recA;
    if (worstAmpSing === null || recS.E2 > worstAmpSing.E2) worstAmpSing = recS;
    if (Math.abs(sp - 0.5) < 1e-12) {
      if (ampAmongHalf === null || recA.E2 > ampAmongHalf.E2) ampAmongHalf = recA;
    }
  }
  console.log(`N = ${N}: ${kept} admissible rings (power-of-two row period, no white diagonal)`);
  console.log(`  max exact speed  ${bestSpeed.num}/${bestSpeed.den} = ${bestSpeed.sp.toFixed(6)}  seed ${bestSpeed.row0.join('')} rowperiod ${bestSpeed.T}`);
  console.log(`  rings at exactly 1/2: ${nHalf}   rings above 1/2: ${nAbove}`);
  console.log(`  amplitude (2E = 2*advances - rows), all-ones start:  max 2E = ${worstAmpAll.E2} at step ${worstAmpAll.at}  seed ${worstAmpAll.row0.join('')} speed ${worstAmpAll.sp.toFixed(4)}`);
  console.log(`  amplitude, singleton start:                          max 2E = ${worstAmpSing.E2} at step ${worstAmpSing.at}  seed ${worstAmpSing.row0.join('')} speed ${worstAmpSing.sp.toFixed(4)}`);
  if (ampAmongHalf) console.log(`  amplitude among the speed-1/2 rings:                 max 2E = ${ampAmongHalf.E2} at step ${ampAmongHalf.at}  seed ${ampAmongHalf.row0.join('')}`);
}
