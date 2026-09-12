/**
 * Sextant, 2026-09-12. Two controls the topic asked for by name.
 *
 * A. THE ROW EXCESS IS NOT ANOMALOUS -- compute the null model's maximum
 *    before reporting any extreme. Erow(t) = 2*b(t) - (2t+1). The topic
 *    quotes |Erow| = 3061 at t = 285762, which is 4.05*sqrt(2t+1). Against
 *    what? The row length grows, so the right null is one binomial draw per
 *    row: b ~ Bin(2t+1, 1/2), independent across t. The maximum of
 *    N = 3*10^5 such draws of |Erow|/sqrt(2t+1) is what has to be beaten.
 *    Also reported: the same statistic for rule 30 to T rows, and the
 *    autocorrelation of Erow between consecutive rows, because the rows are
 *    NOT independent and a reader should see how far off the null's
 *    independence assumption is.
 *
 * B. THE LOWER SIDE OF THE FENCE. sextant8_rings.mjs reports min density 0 at
 *    every N -- that is the all-white fixed point, which is degenerate. Here
 *    the minimum is taken over NON-ZERO cycles, because a cone picture always
 *    has b(t) >= 3 and the honest question is whether a non-trivial rule 30
 *    orbit can be arbitrarily sparse.
 */

function popcount(x) {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

// ---------------- A ----------------
const T = 300_000;
const WORDS = ((2 * T + 160) >> 5) + 4;
const r = new Uint32Array(WORDS);
r[0] = 1;
let maxNorm = 0, maxNormAt = 0, maxAbs = 0, maxAbsAt = 0;
let prevE = null, sxy = 0, sxx = 0, n = 0;
for (let t = 0; t < T; t++) {
  const hi = Math.min(WORDS - 2, ((2 * t) >> 5) + 1);
  let b = 0;
  for (let m = 0; m <= hi + 1; m++) b += popcount(r[m]);
  const E = 2 * b - (2 * t + 1);
  const norm = Math.abs(E) / Math.sqrt(2 * t + 1);
  if (t > 100) {
    if (norm > maxNorm) { maxNorm = norm; maxNormAt = t; }
    if (Math.abs(E) > maxAbs) { maxAbs = Math.abs(E); maxAbsAt = t; }
    if (prevE !== null) { sxy += prevE * E / (2 * t + 1); sxx += E * E / (2 * t + 1); n++; }
    prevE = E;
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
console.log(`A. rule 30, rows 100..${T - 1}`);
console.log(`   max |Erow| = ${maxAbs} at t=${maxAbsAt}`);
console.log(`   max |Erow|/sqrt(2t+1) = ${maxNorm.toFixed(4)} at t=${maxNormAt}`);
console.log(`   lag-1 autocorrelation of Erow/sqrt(2t+1) = ${(sxy / sxx).toFixed(4)} over ${n} rows`);

// null: independent binomials, same lengths, several draws
function gauss(rngState) {
  // Box-Muller on xorshift32
  let x = rngState.s;
  const nxt = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; rngState.s = x; return x / 4294967296; };
  const u = Math.max(nxt(), 1e-12), v = nxt();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
console.log(`   null: b(t) ~ Bin(2t+1, 1/2) independent, so Erow/sqrt(2t+1) ~ N(0,1)`);
const draws = [];
for (let d = 0; d < 20; d++) {
  const st = { s: (0x9e3779b9 ^ (d * 2654435761)) >>> 0 || 1 };
  let mx = 0;
  for (let t = 101; t < T; t++) { const z = Math.abs(gauss(st)); if (z > mx) mx = z; }
  draws.push(mx);
}
draws.sort((a, b) => a - b);
console.log(`   null max |z| over ${T - 101} rows, 20 draws: min ${draws[0].toFixed(4)}, ` +
  `median ${draws[10].toFixed(4)}, max ${draws[19].toFixed(4)}`);
console.log(`   draws at least as extreme as rule 30's ${maxNorm.toFixed(4)}: ` +
  `${draws.filter((x) => x >= maxNorm).length} of 20`);

// ---------------- B ----------------
// MOVED. Part B of this script enumerated ring cycles and had the same two
// defects as sextant8_rings.mjs -- the mirrored rule and the 4096-entry path
// buffer -- so its minimum of 0.374521 at N=17 was garbage (the true value is
// 0.492647). The corrected enumeration, with a cross-check against Wolfram
// 1986 Table 6.2, is sextant8_rings2.mjs. Nothing is computed here now.
console.log('');
console.log('B. moved to sextant8_rings2.mjs (this script\'s ring code was mirrored and buffer-limited)');
