/**
 * Sextant, 2026-09-12. DOES THE CONE ESCAPE THE FENCE?
 *
 * The ring 10011 has time-average density exactly 3/5 under rule 30, which is
 * the exact optimum of the one-block programme -- so no local-statistics
 * argument can prove a row-density bound below 3/5. The obvious objection is
 * that the ring is bi-infinite and rule 30's seed lives in a cone, so perhaps
 * a cone-aware argument does better.
 *
 * It does not, and this measures why. Plant (10011)^k as a FINITE
 * configuration of span n and evolve it. The light cone
 * (evolveFrom_eq_of_agree_on_window) makes every cell of row t at position
 * [t, n-1-t] agree with the bi-infinite ring's picture, so the planted region
 * holds density 3/5 for n/2 rows while the row grows by only 2 cells a row.
 * Hence: for every T and every eps there is a FINITE configuration whose
 * triangle density over its first T rows exceeds 3/5 - eps. A bound proved for
 * all finite configurations therefore cannot be below 3/5 either, and the only
 * thing left that could beat it is an argument specific to the single seed.
 *
 * Reported: row density at several times, and the triangle density over the
 * first T rows, as n grows with T fixed.
 */

function popcount(x) {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

// Plant `pattern` repeated to span >= n, evolve T rows, return statistics.
// bit i of row t is cell (i - t); step is r -> 4r XOR (2r OR r).
function run(pattern, n, T, label) {
  const span = Math.ceil(n / pattern.length) * pattern.length;
  const WORDS = ((span + 2 * T + 96) >> 5) + 4;
  const r = new Uint32Array(WORDS);
  for (let i = 0; i < span; i++) {
    if (pattern[i % pattern.length] === '1') r[i >> 5] |= (1 << (i & 31)) >>> 0;
  }
  // trim to a genuine span: force the two end cells black so the "span" is exact
  let S = 0, CELLS = 0;
  const marks = [];
  for (let t = 0; t < T; t++) {
    const hi = Math.min(WORDS - 2, ((span + 2 * t) >> 5) + 1);
    let b = 0;
    for (let m = 0; m <= hi + 1; m++) b += popcount(r[m]);
    const len = span + 2 * t;
    S += b; CELLS += len;
    if (t === 0 || t === (T >> 2) || t === (T >> 1) || t === T - 1) {
      marks.push(`t=${t}: b/len = ${(b / len).toFixed(6)}`);
    }
    let p = 0;
    for (let m = 0; m <= hi + 1; m++) {
      const cur = r[m];
      const s2 = ((cur << 2) | (p >>> 30)) >>> 0;
      const s1 = ((cur << 1) | (p >>> 31)) >>> 0;
      r[m] = (s2 ^ (s1 | cur)) >>> 0;
      p = cur;
    }
  }
  console.log(`${label}  span=${span} T=${T}`);
  for (const m of marks) console.log(`    ${m}`);
  console.log(`    TRIANGLE DENSITY over rows 0..${T - 1} = ${(S / CELLS).toFixed(6)}`);
  return S / CELLS;
}

console.log('A. the 3/5 ring planted in a cone: triangle density as the span grows, T fixed');
const T = 2000;
for (const n of [4000, 20000, 100000, 1000000, 4000000]) {
  run('10011', n, T, `  (10011)^k`);
}

console.log('');
console.log('B. controls');
run('1', 1, T, '  the seed itself (single black cell)');
run('100', 30000, 500, '  (100)^k, the one-step extremal word');
run('10', 30000, 500, '  (10)^k, the checkerboard fixed point');
run('1101100', 21000, 500, '  1101100 (N=7 ring, time-average 11/21)');

console.log('');
console.log('C. how long one planted ring holds 3/5: row density far into the run');
run('10011', 200000, 100000, '  (10011)^k, span 200000, T=100000 (past the light cone at t=n/2)');
