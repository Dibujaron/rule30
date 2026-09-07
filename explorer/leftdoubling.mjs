/**
 * Rowland's period-doubling criterion for the left diagonals, measured.
 *
 * The left-diagonal recurrence (Rule30/Statements.lean,
 * `evolve_left_diagonal_recurrence`) reads, with `d k j = evolve (j+k) (-j)`:
 *
 *     d (m+2) (i+1) = d m (i+2) XOR (d (m+1) (i+1) OR d (m+2) i)
 *
 * so diagonal m+2 is a one-bit machine with drivers
 *
 *     a i = d m (i+2)        b i = d (m+1) (i+1)
 *
 * and update  x (i+1) = a i XOR (b i OR x i).  When `b i = true` the update
 * forgets `x i` entirely — the state is reset. So:
 *
 *   CLAIM R (reset): if the drivers repeat with period q from N, and
 *   b j = true for some j >= N, then x repeats with period q — NOT 2q —
 *   from index j+1 on.
 *
 * This script measures the true period and onset of every left diagonal, and
 * checks CLAIM R's two predictions against them:
 *
 *   period(m+2) <= max(period m, period (m+1))      when a reset exists
 *   onset(m+2)  <= (first reset index) + 1          likewise
 *
 * It also reports which left diagonals are eventually white, since those are
 * exactly the ones for which no reset exists and doubling is possible.
 *
 * Nothing here proves anything. See explorer/README.md.
 *
 *   node explorer/leftdoubling.mjs [generations] [maxDiagonal]
 */

import { rows, centerBitIndex } from './rule30.mjs';

const GENERATIONS = Number(process.argv[2] ?? 1500);
const MAX_K = Number(process.argv[3] ?? 430);

// ---------------------------------------------------------------------------
// Build the left diagonals.
// ---------------------------------------------------------------------------
//
// d k j = evolve (j + k) (-j)  =  bit (center - j) of row (j + k).

const center = centerBitIndex(GENERATIONS);
const diag = Array.from({ length: MAX_K + 1 }, () => []);

{
  let g = 0;
  for (const row of rows(GENERATIONS)) {
    // row g holds d k j for every k+j = g, i.e. k = g - j.
    for (let j = 0; j <= g; j++) {
      const k = g - j;
      if (k > MAX_K) continue;
      const bit = Number((row >> BigInt(center - j)) & 1n);
      diag[k][j] = bit;
    }
    g++;
  }
}

// ---------------------------------------------------------------------------
// Period and onset of a finite 0/1 sequence.
// ---------------------------------------------------------------------------
//
// For each candidate p, walk back from the end while s[i] === s[i-p]; the first
// failure is the last disagreement at lag p, so onset = that index + 1. We only
// accept p when the tail past the onset covers at least `repeats` whole periods,
// so a spurious p that "fits" only at the very end is rejected.

function periodAndOnset(s, maxP, repeats = 4) {
  const n = s.length;
  for (let p = 1; p <= maxP; p++) {
    let i = n - 1;
    while (i >= p && s[i] === s[i - p]) i--;
    const onset = i >= p ? i - p + 1 : 0; // last index where the lag-p test failed
    if (n - onset >= repeats * p && n - onset >= 8) return { p, onset };
  }
  return null;
}

// ---------------------------------------------------------------------------

const info = [];
for (let k = 0; k <= MAX_K; k++) {
  const s = diag[k];
  const r = periodAndOnset(s, 64);
  info[k] = r;
}

const unresolved = info.map((r, k) => (r ? null : k)).filter((k) => k !== null);
if (unresolved.length) {
  console.log(`no period found (within 64) for k = ${unresolved.join(', ')}`);
}

// Which diagonals are eventually white — i.e. period 1 with value 0?
const white = [];
for (let k = 0; k <= MAX_K; k++) {
  const r = info[k];
  if (!r) continue;
  const s = diag[k];
  let allWhite = true;
  for (let j = r.onset; j < s.length; j++) if (s[j]) { allWhite = false; break; }
  if (allWhite) white.push(k);
}

console.log(`generations = ${GENERATIONS}, diagonals k = 0..${MAX_K}`);
console.log(`periods k=0..24: ${info.slice(0, 25).map((r) => (r ? r.p : '?')).join(' ')}`);
console.log(`onsets  k=0..24: ${info.slice(0, 25).map((r) => (r ? r.onset : '?')).join(' ')}`);
console.log(`max period = ${Math.max(...info.filter(Boolean).map((r) => r.p))}`);
console.log(`eventually-white left diagonals: ${white.join(', ') || '(none)'}`);

// ---------------------------------------------------------------------------
// CLAIM R, checked at every m.
// ---------------------------------------------------------------------------

let resets = 0;
let noReset = 0;
let periodViolations = 0;
let onsetViolations = 0;
let doubledWithReset = 0;
let worstResetOffset = -1;
let worstResetM = -1;

for (let m = 0; m + 2 <= MAX_K; m++) {
  const r0 = info[m], r1 = info[m + 1], r2 = info[m + 2];
  if (!r0 || !r1 || !r2) continue;

  // Put diagonals m and m+1 on a common period q from a common onset N.
  const q = lcm(r0.p, r1.p);
  const N = Math.max(r0.onset, r1.onset);

  // a i = d m (i+2), b i = d (m+1) (i+1); both repeat with period q from N.
  // A reset is a j >= N with b j = true, i.e. d (m+1) (j+1) = true.
  const b = diag[m + 1];
  let j = -1;
  for (let i = N; i + 1 < b.length && i < N + q + 4; i++) {
    if (b[i + 1]) { j = i; break; }
  }

  if (j < 0) { noReset++; continue; }
  resets++;
  if (j - N > worstResetOffset) { worstResetOffset = j - N; worstResetM = m; }

  // Prediction 1: period does not double.
  if (r2.p > q) { periodViolations++; if (periodViolations < 6) console.log(`  period violation at m=${m}: q=${q} but period(${m + 2})=${r2.p}`); }
  if (r2.p > Math.max(r0.p, r1.p)) doubledWithReset++;

  // Prediction 2: onset <= j + 1. The measured onset is the SMALLEST onset for
  // the measured (smallest) period, so compare against the onset for period q.
  const onsetForQ = onsetAt(diag[m + 2], q);
  if (onsetForQ > j + 1) {
    onsetViolations++;
    if (onsetViolations < 6) console.log(`  onset violation at m=${m}: reset at j=${j} but onset_q(${m + 2})=${onsetForQ}`);
  }
}

console.log(`\nfirst reset offset j - N, worst over m: ${worstResetOffset} (at m = ${worstResetM})`);
console.log(`largest measured onset over k: ${Math.max(...info.filter(Boolean).map((r) => r.onset))}`);
console.log(`\nCLAIM R over m = 0..${MAX_K - 2}:`);
console.log(`  with a reset in [N, N+q):   ${resets}`);
console.log(`  no reset found:             ${noReset}`);
console.log(`  period exceeded q:          ${periodViolations}`);
console.log(`  period doubled anyway:      ${doubledWithReset}`);
console.log(`  onset exceeded j+1:         ${onsetViolations}`);

function onsetAt(s, p) {
  const n = s.length;
  let i = n - 1;
  while (i >= p && s[i] === s[i - p]) i--;
  return i >= p ? i - p + 1 : 0;
}

function lcm(a, b) {
  const g = (x, y) => (y ? g(y, x % y) : x);
  return (a / g(a, b)) * b;
}
