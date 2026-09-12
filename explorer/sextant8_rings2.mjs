/**
 * Sextant, 2026-09-12. THE CEILING OF EVERY LOCAL-STATISTICS ARGUMENT.
 * Corrected rewrite of sextant8_rings.mjs, which had two defects:
 *
 *   (i)  ORIENTATION. Its `l` was `s >>> 1`, whose bit i is s(i+1) -- the
 *        RIGHT neighbour. So it ran `right XOR (centre OR left)`, which is
 *        rule 86, rule 30's mirror. Caught because rule 30's known period-3
 *        ring 010011111000 (Wolfram Table 6.2, and the witness of two earlier
 *        obstruction entries) has orbit-average density 19/36 = 0.5278 and
 *        did not appear in the N=12 output at all.
 *   (ii) THE PATH BUFFER. Cycle weights were read out of a 4096-entry array,
 *        so every cycle longer than that -- the N=17 minimum had period
 *        10846 -- was totalled from stale entries.
 *
 * Here the cycle is walked directly from its entry state, so no buffer is
 * involved, and the rule is rule 30: new(i) = s(i-1) XOR (s(i) OR s(i+1)).
 *
 * WHAT IT IS FOR. A bound on the row density derived from block frequencies of
 * row t and the one-step law is an inequality true of EVERY configuration,
 * hence of every spatially periodic one, hence of every rule 30 ring cycle. So
 *
 *     any local-statistics bound on the long-run row density
 *         >=  max over rule 30 cycles of their time-average density.
 *
 * The one-block bound proved in sextant8_rows.mjs is 3/5. If some cycle
 * ATTAINS 3/5 then the bound is exactly sharp and no refinement of the method,
 * at any block size, can do better -- and 3/5 is not 1/2, so row balance is
 * out of the method's reach. The two-sided version needs the minimum over
 * non-zero cycles as well.
 *
 * Cross-checks built in: Wolfram's Table 6.2 elements must come back as
 * cycles at N = 7 (period 4) and N = 12 (period 3), with his own periods.
 */

const NMAX = 24;

function popcount(x) {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

function stepper(N) {
  const mask = (N === 32 ? 0xffffffff : (1 << N) - 1) >>> 0;
  return (s) => {
    const l = (((s << 1) | (s >>> (N - 1))) & mask) >>> 0;   // bit i = s(i-1)
    const r = (((s >>> 1) | (s << (N - 1))) & mask) >>> 0;   // bit i = s(i+1)
    return ((l ^ (s | r)) & mask) >>> 0;
  };
}

// ---- cross-check against Wolfram Table 6.2 before trusting anything ----
console.log('cross-check, Wolfram 1986 Table 6.2 (period 3 at length 12, period 4 at length 7)');
for (const [word, want] of [['010011111000', 3], ['0000001', 4], ['0010011', 4], ['10011', 5]]) {
  const N = word.length, step = stepper(N);
  // bit i = word[i]
  let s0 = 0;
  for (let i = 0; i < N; i++) if (word[i] === '1') s0 |= (1 << i) >>> 0;
  let s = step(s0), p = 1, tot = popcount(s0);
  const states = [word];
  while (s !== s0) { states.push(s.toString(2).padStart(N, '0').split('').reverse().join('')); tot += popcount(s); s = step(s); p++; if (p > 1000) break; }
  console.log(`  ${word}: period ${p}${want ? ` (expected ${want})` : ''}, ` +
    `orbit-average density ${tot}/${p * N} = ${(tot / (p * N)).toFixed(6)}`);
  console.log(`    orbit: ${states.join(' -> ')}`);
}

console.log('');
console.log('N  cycles  maxAvgDensity (witness, period)                minAvgDensity over NON-ZERO cycles');
let bestAll = { d: 0, N: 0, word: '', per: 0 };
let worstAll = { d: 2, N: 0, word: '', per: 0 };

for (let N = 3; N <= NMAX; N++) {
  const size = 1 << N;
  const step = stepper(N);
  const colour = new Uint8Array(size);     // 0 unseen, 1 on path, 2 done
  let cycles = 0;
  let best = { d: -1, word: '', per: 0 }, worst = { d: 2, word: '', per: 0 };

  for (let start = 0; start < size; start++) {
    if (colour[start] !== 0) continue;
    let s = start;
    while (colour[s] === 0) { colour[s] = 1; s = step(s); }
    if (colour[s] === 1) {
      // s is on the cycle; walk it directly, no buffer
      cycles++;
      let q = step(s), cLen = 1, tot = popcount(s);
      while (q !== s) { tot += popcount(q); q = step(q); cLen++; }
      const d = tot / (cLen * N);
      const word = s.toString(2).padStart(N, '0').split('').reverse().join('');
      if (d > best.d) best = { d, word, per: cLen };
      if (tot > 0 && d < worst.d) worst = { d, word, per: cLen };
      if (d > bestAll.d) bestAll = { d, N, word, per: cLen };
      if (tot > 0 && d < worstAll.d) worstAll = { d, N, word, per: cLen };
    }
    for (let q = start; colour[q] === 1; q = step(q)) colour[q] = 2;
  }
  console.log(
    `${String(N).padStart(2)} ${String(cycles).padStart(6)}  ` +
    `${best.d.toFixed(6)} (${best.word}, p=${best.per})`.padEnd(46) +
    `  ${worst.d < 2 ? `${worst.d.toFixed(6)} (${worst.word}, p=${worst.per})` : 'none'}`);
}

console.log('');
console.log(`MAXIMUM over every cycle, N <= ${NMAX}: ${bestAll.d.toFixed(6)} ` +
  `at N=${bestAll.N}, word ${bestAll.word}, temporal period ${bestAll.per}`);
console.log(`MINIMUM over every non-zero cycle:    ${worstAll.d.toFixed(6)} ` +
  `at N=${worstAll.N}, word ${worstAll.word}, temporal period ${worstAll.per}`);
console.log(`  the one-block bound proved in sextant8_rows.mjs is 3/5 = 0.600000`);
console.log(`  row balance needs the single value 0.500000`);
