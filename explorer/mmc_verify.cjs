/**
 * Verify the relaxation-free witnesses found by explorer/mmc_ring.cjs.
 *
 *   node explorer/mmc_verify.cjs
 *
 * For each witness ring this prints the space-time cycle, re-checks rule 30
 * row by row from scratch, re-checks that no left diagonal is identically
 * white, and then re-runs the reachable set with a DELIBERATELY STUPID second
 * implementation -- a plain boolean array over a wide horizon, no ray, no early
 * exit, no cycle detection -- and reports the speed it measures over many rows.
 * Truncating the set at the horizon can only REMOVE reachable positions, which
 * can only RAISE the minimum, so if the naive run still reports a speed at or
 * above 1/2 the witness is real.
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

// naive reachable set: plain boolean array over [m, m + H), no ray, no early exit
function naiveDP(cyc, N, rows, H) {
  const T = cyc.length;
  let m = 0;
  let set = new Uint8Array(H).fill(1);          // R = [m, inf) truncated at H
  let adv = 0, stay = 0, ret = 0, runNow = 0, runMax = 0;
  for (let t = 0; t < rows; t++) {
    const row = cyc[t % T];
    const S = (x) => row[((x % N) + N) % N];
    const next = new Uint8Array(H + 4);
    let mNew = Infinity;
    const hits = [];
    for (let o = 0; o < H; o++) {
      if (!set[o]) continue;
      const x = m + o, L = S(x - 1), C = S(x), R = S(x + 1);
      if (L === 0) hits.push([x - 1, false]);
      else if (C === 0 && R === 0) hits.push([x, false]);
      else if (C === 0 && R === 1) hits.push([x + 1, true]);
      else hits.push([x, true]);
    }
    for (const [v] of hits) if (v < mNew) mNew = v;
    for (const [v, isRay] of hits) {
      if (!isRay) { const o = v - mNew; if (o >= 0 && o < H) next[o] = 1; }
      else { for (let o = Math.max(0, v - mNew); o < H; o++) next[o] = 1; }
    }
    const d = mNew - m;
    if (d === -1) { adv++; runNow++; if (runNow > runMax) runMax = runNow; } else { runNow = 0; if (d === 0) stay++; else ret++; }
    m = mNew; set = next.slice(0, H);
  }
  return { speed: -m / rows, m, adv, stay, ret, runMax };
}

const WITNESSES = [];
// rediscover the best witness at each small N, with no white left diagonal
for (let N = 3; N <= 12; N++) {
  let best = null;
  for (let it = 0; it < (1 << N); it++) {
    const row0 = new Uint8Array(N);
    for (let i = 0; i < N; i++) row0[i] = (it >> i) & 1;
    const { rows, start } = orbit(row0);
    const cyc = rows.slice(start);
    if (whiteDiagonals(cyc, N).length > 0) continue;
    const r = naiveDP(cyc, N, 600, 240);
    if (best === null || r.speed > best.r.speed) best = { row0: Array.from(row0), cyc, r };
  }
  if (best) WITNESSES.push({ N, ...best });
}

for (const w of WITNESSES) {
  const { N, row0, cyc, r } = w;
  console.log(`\n=== ring N = ${N}, seed row ${row0.join('')} ===`);
  console.log(`  cycle length ${cyc.length}; white left diagonals: ${JSON.stringify(whiteDiagonals(cyc, N))} (must be empty)`);
  // re-check rule 30 from scratch around the cycle
  let ok = true;
  for (let i = 0; i < cyc.length; i++) {
    const a = cyc[i], b = cyc[(i + 1) % cyc.length], c = step30(a);
    for (let j = 0; j < N; j++) if (c[j] !== b[j]) ok = false;
  }
  console.log(`  rule 30 holds on every row of the cycle: ${ok}`);
  console.log('  the picture (one period, time down):');
  for (let i = 0; i < Math.min(cyc.length, 24); i++) console.log('    ' + Array.from(cyc[i]).map((v) => (v ? '#' : '.')).join(''));
  const long = naiveDP(cyc, N, 20000, 400);
  console.log(`  naive DP over 20000 rows: min R moved ${long.m}, speed ${long.speed.toFixed(6)}` +
    `   advances ${long.adv} stays ${long.stay} retreats ${long.ret}  longest advance run ${long.runMax}`);
  console.log(`  ${long.speed >= 0.5 ? '*** AT OR ABOVE 1/2 ***' : 'below 1/2'}`);
}
