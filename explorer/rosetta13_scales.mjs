/**
 * Rosetta, 2026-09-12 — Hochman/Shmerkin vantage, the scale side.
 *
 * Three blocks, each aimed at one row of the dictionary.
 *
 * A. THE SCALE STRUCTURE. The brief says the board's period-doubling depths
 *    3, 8, 29, 400, 87867, 2107985255 are "exactly the scale structure those
 *    theorems eat". Check the arithmetic: how do they grow, and how many of
 *    them lie below a given depth?
 *
 * B. CRYSTAL 67, the ensemble's column law. For each word v of length n+1,
 *    how many of the 2^(2n+1) windows of width 2n+1 produce it as the centre
 *    column word? Crystal 67 says exactly 2^n, i.e. the ensemble's block
 *    measure at scale n+1 has entropy EXACTLY n+1 bits. That is Hochman's
 *    non-concentration hypothesis satisfied with deficit zero, for the only
 *    measure this problem has.
 *
 * C. HOCHMAN'S Delta_n IN A 2-ADIC TOWER. Delta_n is the minimal distance
 *    between two distinct level-n objects. In R that can be anything. Here
 *    the level-n object is rowNat t mod 2^n — the first n left diagonals of
 *    row t — and two distinct residues mod 2^n are at 2-adic distance at
 *    least 2^-(n-1) by definition. So exponential separation is free. This
 *    block only checks that the trivial bound is ATTAINED, so that "free"
 *    means "vacuous" rather than "strong".
 *
 * Nothing here proves anything.
 */

// ---------------------------------------------------------------------------
// A. the scale structure
// ---------------------------------------------------------------------------

console.log('## A. the period-doubling depths as "scales"');
// NKS p.871, reproduced by this board in explorer/orbit32.mjs and talus4_big.mjs
const DOUBLINGS = [3, 8, 29, 400, 87867, 2107985255];
// the eventually-white left diagonals, obstruction 4
const WHITES = [2, 7, 28, 399, 53207, 58286, 87866, 1420878968];

function report(name, ks) {
  console.log(`\n${name}: ${ks.join(', ')}`);
  console.log('   n |         k_n |    log k_n | log k_n / log k_{n-1} | k_n / k_{n-1}^2');
  for (let i = 0; i < ks.length; i++) {
    const l = Math.log(ks[i]);
    const ratio = i > 0 ? l / Math.log(ks[i - 1]) : NaN;
    const sq = i > 0 ? ks[i] / (ks[i - 1] * ks[i - 1]) : NaN;
    console.log(
      `  ${String(i).padStart(2)} | ${String(ks[i]).padStart(11)} | ${l.toFixed(4).padStart(10)} | ${(Number.isNaN(ratio) ? '-' : ratio.toFixed(4)).padStart(21)} | ${Number.isNaN(sq) ? '-' : sq.toFixed(4)}`,
    );
  }
}
report('period-doubling depths (NKS p.871)', DOUBLINGS);
report('eventually-white left diagonals', WHITES);

console.log('\n# how many scales below depth K, if log k_n grows geometrically with ratio r?');
console.log('#   n(K) = log_r( log K / log k_0 ) + 1  -- i.e. Theta(log log K).');
for (const K of [1e3, 1e6, 1e9, 1e12, 1e30, 1e100]) {
  let n = 0;
  for (const k of DOUBLINGS) if (k <= K) n++;
  // extrapolate with the measured ratio
  const r = 1.8;
  const pred = Math.log(Math.log(K) / Math.log(DOUBLINGS[0])) / Math.log(r) + 1;
  console.log(`  K = ${K.toExponential(0).padStart(8)} : known scales below K = ${n}, extrapolated ~ ${pred.toFixed(1)}`);
}

console.log('\n# by contrast, a multiscale argument in Hochman\'s sense wants Theta(n) scales');
console.log('# below scale 2^-n, and the dyadic scales of the column supply exactly n of them.');

// ---------------------------------------------------------------------------
// B. crystal 67: the ensemble's column law, verified by enumeration
// ---------------------------------------------------------------------------

console.log('\n## B. crystal 67 by enumeration: window of width 2n+1 -> column word of length n+1');
console.log('  n | windows 2^(2n+1) | words 2^(n+1) | min count | max count | expected 2^n');

/**
 * Evolve a window of width w (bits 0..w-1, bit i = cell i) n steps under rule
 * 30 with white outside, reading the centre cell each step. The centre of the
 * width-(2n+1) window is index n.
 */
function columnWord(win, w, n) {
  let x = win;
  let word = 0;
  const mask = (1 << w) - 1;
  for (let t = 0; t <= n; t++) {
    word = (word << 1) | ((x >> n) & 1);
    // rule 30 on the window; cells outside are white, which the mask enforces
    x = (((x << 1) ^ (x | (x >>> 1))) & mask) >>> 0;
  }
  return word;
}

for (let n = 0; n <= 9; n++) {
  const w = 2 * n + 1;
  const nwin = 1 << w;
  const counts = new Int32Array(1 << (n + 1));
  for (let win = 0; win < nwin; win++) counts[columnWord(win, w, n)]++;
  let mn = Infinity, mx = 0;
  for (let k = 0; k < counts.length; k++) { if (counts[k] < mn) mn = counts[k]; if (counts[k] > mx) mx = counts[k]; }
  console.log(
    `  ${String(n).padStart(1)} | ${String(nwin).padStart(16)} | ${String(1 << (n + 1)).padStart(13)} | ${String(mn).padStart(9)} | ${String(mx).padStart(9)} | ${String(1 << n).padStart(12)}`,
  );
}

console.log('\n# If min = max = 2^n at every n, the ensemble block measure at length n+1 is');
console.log('# uniform on all 2^(n+1) words: entropy exactly n+1 bits, deficit ZERO.');

// a control that must fail: the same enumeration for a rule that is not left-permutive
console.log('\n# control — the same enumeration for rule 90 (left XOR right, also permutive)');
console.log('# and for rule 4 (which is not permutive at all, so the counts must be unequal):');
function columnWordRule(win, w, n, table) {
  let cells = [];
  for (let i = 0; i < w; i++) cells.push((win >> i) & 1);
  let word = 0;
  for (let t = 0; t <= n; t++) {
    word = (word << 1) | cells[n];
    const next = new Array(w);
    for (let i = 0; i < w; i++) {
      const l = i > 0 ? cells[i - 1] : 0;
      const c = cells[i];
      const r = i < w - 1 ? cells[i + 1] : 0;
      next[i] = (table >> ((l << 2) | (c << 1) | r)) & 1;
    }
    cells = next;
  }
  return word;
}
for (const rule of [30, 90, 4, 110]) {
  const n = 5, w = 2 * n + 1, nwin = 1 << w;
  const counts = new Int32Array(1 << (n + 1));
  for (let win = 0; win < nwin; win++) counts[columnWordRule(win, w, n, rule)]++;
  let mn = Infinity, mx = 0, nz = 0;
  for (let k = 0; k < counts.length; k++) { if (counts[k] < mn) mn = counts[k]; if (counts[k] > mx) mx = counts[k]; if (counts[k] > 0) nz++; }
  console.log(`  rule ${String(rule).padStart(3)}, n = 5: min ${mn}, max ${mx}, words hit ${nz} of ${1 << (n + 1)} (expected 2^n = ${1 << n})`);
}

// ---------------------------------------------------------------------------
// C. Delta_n in the 2-adic tower
// ---------------------------------------------------------------------------

console.log('\n## C. Hochman\'s Delta_n for the level-n objects rowNat t mod 2^n');
console.log('# Two distinct residues mod 2^n differ in some bit < n, so their 2-adic');
console.log('# distance is at least 2^-(n-1): Delta_n >= 2^-(n-1) by definition, and the');
console.log('# level-n scale is 2^-n. Exponential separation is therefore FREE.');
console.log('# The only question is whether the bound is attained (so that "free" means');
console.log('# "vacuous"). It is attained iff two distinct rows agree on their low n-1 bits.');

const T = 20000;
let row = 1n;
const rows = [];
for (let t = 0; t < T; t++) { rows.push(row); row = (row << 2n) ^ ((row << 1n) | row); }

console.log('\n  n | first pair t<s<T with rowNat t == rowNat s mod 2^(n-1) | Delta_n attained?');
for (const n of [4, 8, 16, 24, 32, 48, 64]) {
  const k = n - 1;
  const mod = 1n << BigInt(k);
  const seen = new Map();
  let found = null;
  for (let t = 0; t < T && !found; t++) {
    const r = rows[t] % mod;
    const key = r.toString(36);
    if (seen.has(key)) found = [seen.get(key), t];
    else seen.set(key, t);
  }
  console.log(`  ${String(n).padStart(2)} | ${found ? `t = ${found[0]}, s = ${found[1]}` : `none below T = ${T}`} | ${found ? 'yes' : 'not seen'}`);
}

// ---------------------------------------------------------------------------
// D. how many DISTINCT level-n objects are there?
// ---------------------------------------------------------------------------

console.log('\n## D. the size of level n: distinct values of rowNat t mod 2^n over all t');
console.log('# Hochman\'s level n has |Lambda^n| = 2^n objects, matching the 2^n cells at');
console.log('# scale 2^-n, which is what makes the similarity dimension 1. Here the tower is');
console.log('# indexed by TIME, so level n has preperiod(n) + P(n) objects, and that is O(n).');
console.log('#   If so, s-dim = lim log(count)/(n log 2) = 0, and Hochman\'s conclusion');
console.log('#   dim = min(1, s-dim) reads 0 -- which is correct, and empty.');
console.log('\n   n | distinct level-n states | count / n |     2^n | preperiod+period model');
for (const n of [8, 16, 32, 64, 128, 256, 512, 1024, 2048]) {
  const mod = 1n << BigInt(n);
  const seen = new Set();
  let r = 1n;
  // the orbit is eventually periodic; run until a repeat, capped
  const CAP = 20000;
  let steps = 0;
  for (; steps < CAP; steps++) {
    const k = (r % mod).toString(36);
    if (seen.has(k)) break;
    seen.add(k);
    r = (r << 2n) ^ ((r << 1n) | r);
  }
  const closed = steps < CAP;
  console.log(
    `  ${String(n).padStart(4)} | ${String(seen.size).padStart(23)} | ${(seen.size / n).toFixed(3).padStart(9)} | ${(n <= 50 ? String(2 ** n) : '2^' + n).padStart(7)} | ${closed ? 'orbit closed' : 'CAP hit, lower bound'}`,
  );
}
