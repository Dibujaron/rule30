/**
 * Check the induction that would prove every left diagonal eventually periodic.
 *
 *   node explorer/diagonalinduction.mjs [N] [--depth=K] [--trials=T]
 *
 * ## The claim being checked
 *
 * `evolve_left_diagonal_recurrence` is already proved. Rewritten in the
 * diagonal coordinates `d k j = evolve (j + k) (-j)` it reads
 *
 *     d (m+2) (i+1) = d m (i+2) XOR (d (m+1) (i+1) OR d (m+2) i)
 *
 * so diagonal `m+2` is a one-bit state machine driven by the two diagonals
 * below it. Write `a i = d m (i+2)`, `b i = d (m+1) (i+1)`, `x i = d (m+2) i`:
 *
 *     x (i+1) = a i XOR (b i OR x i)
 *
 * If `a` and `b` are both `p`-periodic from `N`, then for each `i` the map
 * `x -> a i XOR (b i OR x)` is one of the four maps `Bool -> Bool`, the
 * composite across a whole period is again one of those four, and every map on
 * a two-element set satisfies `f (f (f x)) = f x`. So the composite `P` across
 * one period obeys `P^3 = P`, giving `x (i + 3p) = x (i + p)` — that is, `x` is
 * `2p`-periodic from `N + p`. Periodicity of the two shallower diagonals
 * therefore carries to the next one, and induction on `k` covers the whole
 * left side.
 *
 * That argument is a proof, not a conjecture; this script exists to catch the
 * ways it could be *misstated* rather than to supply evidence for it. It
 * checks four things:
 *
 *   1. the recurrence really does hold in these coordinates at these indices
 *      (an off-by-one in the shift would invalidate everything above);
 *   2. `f (f (f x)) = f x` for all four maps `Bool -> Bool`;
 *   3. the driven-sequence claim itself, brute-forced on random periodic
 *      drivers: `x (i + 2p) = x i` for every `i >= N + p`, and not in general
 *      at `i = N`, which is what pins the onset bound to `N + p` rather than
 *      to `N`;
 *   4. that the measured periods and onsets of the real diagonals obey the
 *      bounds the induction predicts — `p_k` divides `2 * lcm(p_{k-2}, p_{k-1})`
 *      and `onset_k <= max(onset_{k-2}, onset_{k-1}) + lcm(p_{k-2}, p_{k-1})`.
 *
 * Check 4 is the one that explains the growing onsets measured by
 * `diagonalscan.mjs`: each diagonal needs a full period of its drivers before
 * its own state is forced, so the onset accumulates one period per step down
 * the family rather than staying at zero.
 *
 * Nothing here is evidence about the prize questions. The left edge is the
 * region where periodicity is provable; the conjectures are about the centre
 * column, which this file does not touch.
 */

import { centerBitIndex, rows } from './rule30.mjs';

function cellAt(row, generations, offset) {
  return Number((row >> BigInt(centerBitIndex(generations) + offset)) & 1n);
}

/** `out[k][j] = d k j = evolve (j + k) (-j)`, for `k < depth`. */
function leftDiagonals(generations, depth) {
  const out = [];
  for (let k = 0; k < depth; k++) out.push(new Uint8Array(generations - k));
  let t = 0;
  for (const row of rows(generations)) {
    for (let k = 0; k < depth && k <= t; k++) out[k][t - k] = cellAt(row, generations, -(t - k));
    t++;
  }
  return out;
}

/** Smallest period holding over a long enough tail; see diagonalscan.mjs. */
function smallestPeriod(a, { maxPeriod, minCycles = 6, minTail = 24 }) {
  const L = a.length;
  for (let p = 1; p <= maxPeriod; p++) {
    let lastBreak = -1;
    for (let i = p; i < L; i++) if (a[i] !== a[i - p]) lastBreak = i;
    const onset = lastBreak < 0 ? 0 : lastBreak - p + 1;
    const tail = L - onset;
    if (tail >= minTail && tail >= minCycles * p) return { period: p, onset, tail };
  }
  return null;
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a / gcd(a, b)) * b;

const flag = (name, fallback) => {
  const hit = process.argv.slice(2).find((s) => s.startsWith(`--${name}=`));
  return hit === undefined ? fallback : Number(hit.slice(name.length + 3));
};

const N = Number(process.argv.slice(2).find((s) => !s.startsWith('--')) ?? 4000);
const depth = flag('depth', 44);
const trials = flag('trials', 400);
const coin = () => (Math.random() < 0.5 ? 1 : 0);

let failures = 0;
const fail = (msg) => {
  console.error(`FAIL ${msg}`);
  failures++;
};

const d = leftDiagonals(N, depth);

// 0. The self-check diagonalscan.mjs makes: k = 0, 1, 2 against closed theorems.
for (const [name, k, expected] of [
  ['evolve_left_edge', 0, 1],
  ['evolve_left_second_diagonal', 1, 1],
  ['evolve_left_third_diagonal', 2, 0],
]) {
  const bad = d[k].findIndex((v) => v !== expected);
  if (bad !== -1) fail(`self-check: ${name} expects ${expected} at k=${k}, got ${d[k][bad]} at j=${bad}`);
}
if (failures) {
  console.error('coordinate convention is wrong; nothing below would be trustworthy');
  process.exit(1);
}
console.log(`self-check ok: k=0,1,2 match the three closed theorems over ${N} generations`);

// 1. The recurrence, in the diagonal coordinates the induction uses.
let checked = 0;
for (let m = 0; m + 2 < depth; m++) {
  const len = Math.min(d[m].length - 2, d[m + 1].length - 1, d[m + 2].length - 1);
  for (let i = 0; i < len; i++) {
    const lhs = d[m + 2][i + 1];
    const rhs = d[m][i + 2] ^ (d[m + 1][i + 1] | d[m + 2][i]);
    if (lhs !== rhs) fail(`recurrence at m=${m} i=${i}: ${lhs} != ${rhs}`);
    checked++;
  }
}
console.log(`recurrence in diagonal coordinates: ${checked} instances, ${failures} mismatches`);

// 2. Every map on a two-element set is its own cube.
for (let bits = 0; bits < 4; bits++) {
  const f = (x) => (bits >> x) & 1;
  for (const x of [0, 1]) if (f(f(f(x))) !== f(x)) fail(`f^3 != f for map ${bits} at ${x}`);
}
console.log('f (f (f x)) = f x for all 4 maps Bool -> Bool: ok');

// 3. The driven-sequence claim, brute-forced on random periodic drivers.
let onsetMattered = 0;
for (let t = 0; t < trials; t++) {
  const p = 1 + Math.floor(Math.random() * 6);
  const N0 = Math.floor(Math.random() * 5);
  const L = N0 + 12 * p + 4;
  const a = new Uint8Array(L);
  const b = new Uint8Array(L);
  for (let i = 0; i < L; i++) {
    a[i] = i >= N0 + p ? a[i - p] : coin();
    b[i] = i >= N0 + p ? b[i - p] : coin();
  }
  const x = new Uint8Array(L);
  x[0] = coin();
  for (let i = 0; i + 1 < L; i++) x[i + 1] = a[i] ^ (b[i] | x[i]);
  for (let i = N0 + p; i + 2 * p < L; i++) {
    if (x[i + 2 * p] !== x[i]) fail(`driven lemma: p=${p} N=${N0} i=${i}`);
  }
  for (let i = N0; i < N0 + p && i + 2 * p < L; i++) if (x[i + 2 * p] !== x[i]) onsetMattered++;
}
console.log(
  `driven lemma x(i+2p) = x(i) for i >= N+p: ${trials} random drivers, ${failures} counterexamples; ` +
    `${onsetMattered} cases where it fails below N+p, which is why the bound is not N`,
);

// 4. The real diagonals obey the bounds the induction predicts.
const meas = d.map((a) => smallestPeriod(a, { maxPeriod: Math.floor(a.length / 8) }));
console.log('\n   k  period  onset   predicted: period divides | onset at most');
for (let k = 0; k < depth; k++) {
  const m = meas[k];
  if (!m) {
    console.log(`  ${String(k).padStart(2)}    none      -`);
    continue;
  }
  let pred = '';
  if (k >= 2 && meas[k - 1] && meas[k - 2]) {
    const P = lcm(meas[k - 2].period, meas[k - 1].period);
    const onsetBound = Math.max(meas[k - 2].onset, meas[k - 1].onset) + P;
    const okP = (2 * P) % m.period === 0;
    const okO = m.onset <= onsetBound;
    if (!okP) fail(`period bound at k=${k}: ${m.period} does not divide 2*${P}`);
    if (!okO) fail(`onset bound at k=${k}: ${m.onset} > ${onsetBound}`);
    pred = `${String(2 * P).padStart(15)} | ${String(onsetBound).padStart(13)}${okP && okO ? '' : '   <-- VIOLATED'}`;
  }
  console.log(`  ${String(k).padStart(2)}${String(m.period).padStart(7)}${String(m.onset).padStart(7)}   ${pred}`);
}

console.log(
  failures === 0
    ? '\nall checks passed. 1-3 are algebra and hold as stated; 4 is a finite prefix.'
    : `\n${failures} FAILURES`,
);
process.exit(failures === 0 ? 0 : 1);
