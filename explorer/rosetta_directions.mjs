/**
 * Rosetta / connect: directions in the picture.
 *
 * Two measurements, both in the language of expansive subdynamics of Z^2
 * actions.
 *
 * A. WHICH BANDS DETERMINE THE PICTURE. A line direction is *expansive* for a
 *    Z^2 subshift when a thickened band around it determines every cell. Rule 30
 *    gives exactly two local deduction rules, and only two:
 *
 *      forward   (t,x-1),(t,x),(t,x+1)  ->  (t+1,x)          the rule itself
 *      sideways  (t,x),(t,x+1),(t+1,x)  ->  (t,x-1)          left-permutivity
 *
 *    and a third that is not uniform, because it reads a value rather than a
 *    position:
 *
 *      right     (t,x-1),(t,x),(t+1,x)  ->  (t,x+1)   ONLY IF cell(t,x) = 0
 *
 *    With the first two, a band of velocity v determines a set of cells; this
 *    section computes that set by closure, for a range of v, and reports the
 *    fraction of an interior rectangle it covers. Turning the third rule on
 *    measures the same thing for THIS picture rather than for every diagram.
 *
 * B. BLOCK COMPLEXITY BY REGION. Nivat's conjecture and the Cyr-Kra theorems
 *    are about the number P(w,h) of distinct w-by-h blocks of a configuration.
 *    The picture is not homogeneous - a settled region on the left, a transient
 *    band, a right side with no transient at all - so P(w,h) is measured in
 *    three regions separately, which is the same thing as measuring how the
 *    complexity depends on direction.
 *
 * Nothing here proves anything.
 */

import { rows } from './rule30.mjs';

const N = 4200;                 // rows generated
const tri = [];
for (const r of rows(N)) tri.push(r);
const CENTRE = BigInt(N + 2);

/** cell(t,x) of the single-seed picture. */
function cell(t, x) {
  if (t < 0 || t >= N) throw new RangeError(`row ${t}`);
  const b = CENTRE + BigInt(x);
  if (b < 0n) return 0;
  return Number((tri[t] >> b) & 1n);
}

// A local sanity check against the rule, so the reader knows the array is real.
{
  let bad = 0, n = 0;
  for (let t = 0; t + 1 < 500; t++) {
    for (let x = -t - 1; x <= t + 1; x++) {
      n++;
      const v = cell(t, x - 1) ^ (cell(t, x) | cell(t, x + 1));
      if (v !== cell(t + 1, x)) bad++;
    }
  }
  console.log(`rule check: ${n} cells, ${bad} violations`);
}

// --------------------------------------------------------------------------
// A0. rule 30 is not right-closing.
//
// Sablik's theorem (Kurka's notes, Theorem 33) says the right expansivity
// direction set X+(F) is nonempty exactly when F is right-closing, so the claim
// that X+(rule 30) is empty rests on rule 30 NOT being right-closing: there must
// exist two configurations that agree on a left half-line, differ to the right,
// and have the same image everywhere.
//
// This builds two such rows greedily. They agree on positions <= 0, differ at
// position 1, and at each step the next pair of cells is chosen so that the two
// images agree at the position that has just become determined. If a choice
// always exists, rule 30 is not right-closing.
// --------------------------------------------------------------------------
{
  const N = 4000;
  // x[i], y[i] for i = 0..N; both extended by 0 to the left of 0.
  const x = new Uint8Array(N + 3), y = new Uint8Array(N + 3);
  x[0] = 1; y[0] = 1;             // the pivot: a black cell hides its right neighbour
  x[1] = 0; y[1] = 1;             // and here they differ
  const img = (a, i) => (i === 0 ? 0 : a[i - 1]) ^ (a[i] | a[i + 1]);
  let stuck = -1;
  for (let i = 1; i <= N; i++) {
    // choose x[i+1], y[i+1] so that img(x,i) === img(y,i)
    let done = false;
    for (let bx = 0; bx < 2 && !done; bx++) {
      for (let by = 0; by < 2 && !done; by++) {
        x[i + 1] = bx; y[i + 1] = by;
        if (img(x, i) === img(y, i)) done = true;
      }
    }
    if (!done) { stuck = i; break; }
  }
  let diffs = 0, imgbad = 0;
  for (let i = 0; i <= N; i++) if (x[i] !== y[i]) diffs++;
  for (let i = 0; i < N; i++) if (img(x, i) !== img(y, i)) imgbad++;
  console.log(`right-closing check: greedy build to ${N}, stuck at ${stuck} (-1 = never),`);
  console.log(`  ${diffs} positions where the two rows differ, ${imgbad} positions where their images differ`);
  console.log(`  x[0..24] = ${Array.from(x.slice(0, 25)).join('')}`);
  console.log(`  y[0..24] = ${Array.from(y.slice(0, 25)).join('')}`);
}

// --------------------------------------------------------------------------
// A. determination closure from a band
// --------------------------------------------------------------------------

const T0 = 2000;        // first row of the rectangle
const H = 360;          // rows in the rectangle
const W = 300;          // columns either side of 0
const MARGIN = 30;      // cells this close to the edge are not scored

/**
 * Close the known set under the deduction rules, inside the rectangle
 * t in [T0, T0+H), x in [-W, W].
 *
 * @param {number} v velocity of the band, cells per row
 * @param {number} n half-thickness of the band
 * @param {boolean} useRight whether to use the value-dependent rightward rule
 */
function closure(v, n, useRight, H = 360) {
  const known = new Uint8Array(H * (2 * W + 1));
  const at = (t, x) => (t - T0) * (2 * W + 1) + (x + W);
  const inside = (t, x) => t >= T0 && t < T0 + H && x >= -W && x <= W;
  for (let t = T0; t < T0 + H; t++) {
    const c0 = Math.round(v * (t - T0 - H / 2));
    for (let x = c0 - n; x <= c0 + n; x++) if (inside(t, x)) known[at(t, x)] = 1;
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (let t = T0; t < T0 + H; t++) {
      for (let x = -W; x <= W; x++) {
        if (known[at(t, x)]) continue;
        // forward: needs (t-1, x-1..x+1)
        if (inside(t - 1, x - 1) && inside(t - 1, x + 1)
            && known[at(t - 1, x - 1)] && known[at(t - 1, x)] && known[at(t - 1, x + 1)]) {
          known[at(t, x)] = 1; changed = true; continue;
        }
        // sideways-left: (t,x) from (t,x+1),(t,x+2),(t+1,x+1)
        if (inside(t, x + 2) && inside(t + 1, x + 1)
            && known[at(t, x + 1)] && known[at(t, x + 2)] && known[at(t + 1, x + 1)]) {
          known[at(t, x)] = 1; changed = true; continue;
        }
        // rightward, only where the cell to the left of the pivot is white:
        // (t,x) from (t,x-2),(t,x-1),(t+1,x-1) when cell(t,x-1) = 0
        if (useRight && inside(t, x - 2) && inside(t + 1, x - 1)
            && known[at(t, x - 2)] && known[at(t, x - 1)] && known[at(t + 1, x - 1)]
            && cell(t, x - 1) === 0) {
          known[at(t, x)] = 1; changed = true; continue;
        }
      }
    }
  }
  let seen = 0, total = 0;
  for (let t = T0 + MARGIN; t < T0 + H - MARGIN; t++) {
    for (let x = -W + MARGIN; x <= W - MARGIN; x++) { total++; if (known[at(t, x)]) seen++; }
  }
  // the determined interval on the middle row, relative to the band's centre there
  const tm = T0 + Math.floor(H / 2);
  const cm = Math.round(v * (tm - T0 - H / 2));
  let lo = null, hi = null;
  for (let x = -W; x <= W; x++) if (known[at(tm, x)]) { if (lo === null) lo = x; hi = x; }
  return { frac: seen / total, left: lo === null ? 0 : cm - lo, right: hi === null ? 0 : hi - cm };
}

console.log();
console.log('=== A. what a band of velocity v determines ===');
console.log('  `left`/`right` are how far the determined region reaches on the middle row,');
console.log('  measured from the band there, for two rectangle heights. A number that grows');
console.log('  with the height is a direction in which determination is unbounded; a number');
console.log('  that does not is a direction in which it stops. Deductions are the uniform');
console.log('  ones (forward + left-permutive), valid for every space-time diagram of rule 30.');
console.log('  band thickness n=3, rectangle half-width 300.');
console.log('     v      H=180 left/right     H=360 left/right     frac(H=360)');
for (const v of [-3, -2, -1.5, -1, -0.5, 0, 0.5, 1, 2, 3]) {
  const a = closure(v, 3, false, 180);
  const b = closure(v, 3, false, 360);
  console.log(`  ${String(v).padStart(5)}    ${String(a.left).padStart(6)} / ${String(a.right).padEnd(6)}      ${String(b.left).padStart(6)} / ${String(b.right).padEnd(6)}      ${b.frac.toFixed(3)}`);
}
console.log();
console.log('  does the rightward reach keep growing? (the test of expansiveness)');
console.log('     v       H=180   H=360   H=540   H=720   right-reach');
for (const v of [-2.5, -2, -1.5, -1, 0]) {
  const r = [180, 360, 540, 720].map((h) => closure(v, 3, false, h).right);
  console.log(`  ${String(v).padStart(5)}    ${r.map((x) => String(x).padStart(5)).join('   ')}`);
}
console.log();
console.log('  the same with the value-dependent rightward rule switched on (this picture only):');
console.log('     v      H=360 left/right   frac');
for (const v of [-1, 0, 1]) {
  const b = closure(v, 3, true, 360);
  console.log(`  ${String(v).padStart(5)}    ${String(b.left).padStart(6)} / ${String(b.right).padEnd(6)}    ${b.frac.toFixed(3)}`);
}

// --------------------------------------------------------------------------
// A3. the same measurement for rule 90, where the answer is known.
//
// Rule 90 is `left XOR right`, permutive in BOTH end coordinates, so it has
// three uniform deductions instead of two:
//     forward   (t,x-1),(t,x+1)  -> (t+1,x)
//     left      (t,x+1),(t+1,x)  -> (t,x-1)
//     right     (t,x-1),(t+1,x)  -> (t,x+1)
// Its space-time subshift is the algebraic Z^2 subshift annihilated by the
// polynomial XY + 1 + X^2 over F_2, whose Newton polygon has vertices (0,0),
// (2,0), (1,1); the three edge directions of that triangle are the horizontal,
// velocity +1 and velocity -1. If the deduction-rate reading of expansiveness
// is right, exactly those three directions should fail here, and every other
// velocity should reach unboundedly both ways.
// --------------------------------------------------------------------------

function closure90(v, n, H = 360) {
  const known = new Uint8Array(H * (2 * W + 1));
  const at = (t, x) => (t - T0) * (2 * W + 1) + (x + W);
  const inside = (t, x) => t >= T0 && t < T0 + H && x >= -W && x <= W;
  for (let t = T0; t < T0 + H; t++) {
    const c0 = Math.round(v * (t - T0 - H / 2));
    for (let x = c0 - n; x <= c0 + n; x++) if (inside(t, x)) known[at(t, x)] = 1;
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (let t = T0; t < T0 + H; t++) {
      for (let x = -W; x <= W; x++) {
        if (known[at(t, x)]) continue;
        if (inside(t - 1, x - 1) && inside(t - 1, x + 1)
            && known[at(t - 1, x - 1)] && known[at(t - 1, x + 1)]) { known[at(t, x)] = 1; changed = true; continue; }
        if (inside(t, x + 2) && inside(t + 1, x + 1)
            && known[at(t, x + 2)] && known[at(t + 1, x + 1)]) { known[at(t, x)] = 1; changed = true; continue; }
        if (inside(t, x - 2) && inside(t + 1, x - 1)
            && known[at(t, x - 2)] && known[at(t + 1, x - 1)]) { known[at(t, x)] = 1; changed = true; continue; }
      }
    }
  }
  const tm = T0 + Math.floor(H / 2);
  const cm = Math.round(v * (tm - T0 - H / 2));
  let lo = null, hi = null;
  for (let x = -W; x <= W; x++) if (known[at(tm, x)]) { if (lo === null) lo = x; hi = x; }
  return { left: lo === null ? 0 : cm - lo, right: hi === null ? 0 : hi - cm };
}

console.log();
console.log('=== A3. the same, for rule 90 (Ledrappier-type, three known directions) ===');
console.log('     v      H=180 left/right     H=360 left/right');
for (const v of [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3]) {
  const a = closure90(v, 3, 180), b = closure90(v, 3, 360);
  console.log(`  ${String(v).padStart(5)}    ${String(a.left).padStart(6)} / ${String(a.right).padEnd(6)}      ${String(b.left).padStart(6)} / ${String(b.right).padEnd(6)}`);
}

// --------------------------------------------------------------------------
// B. block complexity by region
// --------------------------------------------------------------------------

/**
 * The number of distinct w-by-h blocks of the picture whose top-left corner
 * (t, x) satisfies x in [lo(t), hi(t)], for t in [tlo, thi).
 */
function complexity(w, h, tlo, thi, lo, hi) {
  const seen = new Set();
  let positions = 0;
  for (let t = tlo; t < thi; t++) {
    const a = Math.ceil(lo(t)), b = Math.floor(hi(t));
    for (let x = a; x <= b; x++) {
      let key = 0;
      for (let dt = 0; dt < h; dt++) {
        for (let dx = 0; dx < w; dx++) key = key * 2 + cell(t + dt, x + dx);
      }
      seen.add(key);
      positions++;
    }
  }
  return { n: seen.size, positions };
}

console.log();
console.log('=== B. block complexity P(w,h) of the picture, by region ===');
console.log('  regions, at row t: settled  x in [-0.60t, -0.40t]');
console.log('                     band     x in [-0.15t,  0.00t]');
console.log('                     right    x in [ 0.40t,  0.60t]');
const regions = {
  settled: [(t) => -0.60 * t, (t) => -0.40 * t],
  band: [(t) => -0.15 * t, (t) => 0.0 * t],
  right: [(t) => 0.40 * t, (t) => 0.60 * t],
};
const TLO = 2000, THI = 4000 - 20;
for (const [name, [lo, hi]] of Object.entries(regions)) {
  const line = [];
  for (const [w, h] of [[1, 8], [2, 8], [3, 8], [4, 8], [1, 16], [2, 10], [5, 4], [8, 2], [10, 2]]) {
    const { n, positions } = complexity(w, h, TLO, THI, lo, hi);
    line.push(`P(${w},${h})=${n}/2^${w * h}${n === positions ? '*' : ''}`);
  }
  console.log(`  ${name.padEnd(8)} ${line.join('  ')}`);
}
console.log('  (* means the count equals the number of sampled positions, so it is');
console.log('   limited by the sample and is a lower bound only)');
console.log();
console.log('  For comparison: the number of w-by-h blocks admissible in the rule 30');
console.log('  SPACE-TIME SFT (every interior cell satisfying the rule) is 2^(w + 2(h-1)):');
for (const [w, h] of [[1, 8], [2, 8], [4, 8], [8, 2]]) {
  console.log(`    w=${w} h=${h}: 2^${w + 2 * (h - 1)} admissible, out of 2^${w * h} words`);
}
