/**
 * Exhaustive: over every ring of width N (N a power of two) whose row orbit has
 * power-of-two cycle length and no identically-white left diagonal, the exact
 * DP speed, bounded from BOTH sides.
 *
 *   node explorer/half2_enum.cjs [N ...]
 *
 * Reports, per N: how many seeds, how many admissible seeds, how many DISTINCT
 * admissible backgrounds (up to time shift and spatial rotation), the maximum
 * lower bound, the maximum upper bound, and every background attaining the max.
 *
 * If maxLower == maxUpper the number is the truth for that family, because the
 * two DPs sandwich it.
 *
 * Nothing here is a proof.
 */
'use strict';
const L = require('./half2_lib.cjs');

const NS = process.argv.slice(2).map(Number);
const NLIST = NS.length ? NS : [4, 8, 16];

for (const N of NLIST) {
  const total = 1 << N;
  let pow2Seeds = 0, admissibleSeeds = 0, failed = 0;
  const perBg = new Map();      // background key -> { lo, hi, cyc, seeds: n, seed0 }
  for (let it = 0; it < total; it++) {
    const row0 = new Uint8Array(N);
    for (let i = 0; i < N; i++) row0[i] = (it >>> i) & 1;
    const cyc = L.attractor(row0);
    if (!L.isPow2(cyc.length)) continue;
    pow2Seeds++;
    if (L.whiteDiagonals(cyc, N).length > 0) continue;
    admissibleSeeds++;
    const bk = L.backgroundKey(cyc, N);
    const hit = perBg.get(bk);
    if (hit) { hit.seeds++; continue; }
    const lo = L.dpSub(cyc, N, 8 * N + 64);
    const hi = L.dpSup(cyc, N, 12);
    if (!lo || !hi) { failed++; continue; }
    perBg.set(bk, { lo, hi, cyc, seeds: 1, seed0: Array.from(row0).join('') });
  }

  let bestLo = null, bestHi = null;
  for (const v of perBg.values()) {
    if (bestLo === null || L.cmpRat(v.lo, bestLo) > 0) bestLo = v.lo;
    if (bestHi === null || L.cmpRat(v.hi, bestHi) > 0) bestHi = v.hi;
  }
  // sandwich check per background: lower <= upper must hold everywhere
  let sandwichViolations = 0, disagreements = 0;
  for (const v of perBg.values()) {
    if (L.cmpRat(v.lo, v.hi) > 0) sandwichViolations++;
    if (L.cmpRat(v.lo, v.hi) !== 0) disagreements++;
  }

  const half = { num: 1, den: 2 };
  const aboveHalf = [...perBg.entries()].filter(([, v]) => L.cmpRat(v.lo, half) > 0);
  const upperAboveHalf = [...perBg.entries()].filter(([, v]) => L.cmpRat(v.hi, half) > 0);
  const atMax = [...perBg.entries()].filter(([, v]) => L.cmpRat(v.lo, bestLo) === 0);

  const f = (r) => { const q = L.reduce(r); return `${r.num}/${r.den} (= ${q.num}/${q.den} = ${(r.num / r.den).toFixed(6)})`; };
  console.log(`\n=== N = ${N} ===`);
  console.log(`  seeds enumerated            ${total}  (exhaustive)`);
  console.log(`  power-of-two row period     ${pow2Seeds} seeds`);
  console.log(`  ... and no white diagonal   ${admissibleSeeds} seeds`);
  console.log(`  DISTINCT backgrounds        ${perBg.size} (up to time shift + spatial rotation)`);
  console.log(`  DP failed to cycle          ${failed}`);
  console.log(`  max LOWER bound (subset DP, H=${8 * N + 64})   ${f(bestLo)}`);
  console.log(`  max UPPER bound (superset DP, P=12)  ${f(bestHi)}`);
  console.log(`  backgrounds where lower != upper     ${disagreements} of ${perBg.size}`);
  console.log(`  backgrounds where lower  >  upper    ${sandwichViolations}  (must be 0)`);
  console.log(`  backgrounds with LOWER bound > 1/2   ${aboveHalf.length}`);
  console.log(`  backgrounds with UPPER bound > 1/2   ${upperAboveHalf.length}`);
  console.log(`  backgrounds attaining the max        ${atMax.length}`);
  for (const [, v] of atMax.slice(0, 6)) {
    console.log(`    seed ${v.seed0}  rowPeriod ${v.cyc.length}  lower ${f(v.lo)}  upper ${f(v.hi)}  (${v.seeds} seeds map here)`);
    for (let i = 0; i < Math.min(v.cyc.length, 10); i++) {
      console.log('      ' + Array.from(v.cyc[i]).map((x) => (x ? '#' : '.')).join(''));
    }
  }
  // the whole distribution of exact speeds, so nothing is hidden behind a max
  const hist = new Map();
  for (const v of perBg.values()) {
    const q = L.reduce(v.lo);
    const k = `${q.num}/${q.den}`;
    hist.set(k, (hist.get(k) || 0) + 1);
  }
  const sorted = [...hist.entries()].sort((a, b) => {
    const [an, ad] = a[0].split('/').map(Number), [bn, bd] = b[0].split('/').map(Number);
    return bn * ad - an * bd;
  });
  console.log(`  exact-speed distribution over distinct backgrounds (top 12, descending):`);
  for (const [k, c] of sorted.slice(0, 12)) console.log(`    ${k.padStart(8)} = ${(eval(k)).toFixed(6)}   ${c} backgrounds`);
}
