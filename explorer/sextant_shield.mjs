/**
 * The black right edge as a shield: which differences between two finite
 * configurations never reach the centre column.
 *
 * sextant_colsep.mjs found collisions -- distinct finite configurations whose
 * centre columns agree to the full depth read -- and every colliding pair
 * differed only at or beyond its own RIGHTMOST black cell. This script isolates
 * the mechanism and measures how deep it holds.
 *
 * The mechanism, in one line: rule30_left_local_law (crystals A2) says a
 * difference at position i spreads to i-1 only when the cell at i-1 is WHITE.
 * A difference sitting immediately right of the picture's right edge has a
 * black cell on its left at every row (evolve_right_edge), so it can never
 * step left; it rides the edge instead.
 *
 * Measured here, for each of several second configurations B against the seed
 * A = a single black cell at the origin:
 *
 *   - the first row at which the difference pattern E = A xor B reaches
 *     position <= 0 (the centre column) or position <= -MARGIN;
 *   - the leftmost position the difference ever reaches, as a fraction of t;
 *   - the distinct difference patterns seen in the window riding the right
 *     edge, which is what a finite-state invariant would need to be small.
 *
 * Nothing here is a proof. See explorer/README.md.
 *
 *   node explorer/sextant_shield.mjs
 */

const T = 60000;               // rows
const PAD = T + 8;             // bit index of position 0
const PADB = BigInt(PAD);
const EDGEWIN = 6;             // width of the window riding the right edge

const step = (x) => (x << 1n) ^ (x | (x >> 1n));

/** cells listed by position -> BigInt row. */
const cfg = (positions) => positions.reduce((a, p) => a | (1n << BigInt(PAD + p)), 0n);

function run(label, bCells) {
  const t0 = Date.now();
  let a = cfg([0]);
  let b = cfg(bCells);
  let firstAtOrigin = -1;      // first t with a difference at position 0
  let leftmost = Infinity;     // leftmost position any difference ever reached
  let leftmostAt = -1;
  let bestLow = 1n << PADB;    // current lowest set bit strictly left of 0
  const patterns = new Set();
  for (let t = 0; t < T; t++) {
    const e = a ^ b;
    if (e !== 0n) {
      // difference at the origin?
      if (((e >> PADB) & 1n) === 1n && firstAtOrigin < 0) firstAtOrigin = t;
      // leftmost difference: only look below the edge window when something is
      // there, and find it by a binary walk over the low part
      const low = e & ((1n << PADB) - 1n);          // strictly left of position 0
      // a smaller value can only mean a lower lowest-set-bit, so this test is a
      // cheap filter on the expensive bit-index computation
      if (low !== 0n && low < bestLow) {
        bestLow = low & -low;
        leftmost = bestLow.toString(2).length - 1 - PAD;
        leftmostAt = t;
      }
      // the pattern riding the right edge: cells t-EDGEWIN+2 .. t+2
      const shift = BigInt(PAD + t - EDGEWIN + 2);
      const pat = Number((e >> shift) & ((1n << BigInt(EDGEWIN + 1)) - 1n));
      const rest = e & ((1n << shift) - 1n);
      patterns.add(rest === 0n ? pat : -1);          // -1 marks "escaped the window"
    }
    a = step(a); b = step(b);
  }
  const escaped = patterns.has(-1);
  console.log(
    `${label}: first difference at the origin: ${firstAtOrigin < 0 ? 'never (to t=' + T + ')' : 'row ' + firstAtOrigin}` +
    `; leftmost difference ever: ${leftmost === Infinity ? 'none left of 0' : leftmost + ' at row ' + leftmostAt}` +
    `; edge-window patterns: ${escaped ? 'ESCAPED the window' : patterns.size + ' distinct, ' + [...patterns].sort((p, q) => p - q).join(',')}` +
    `  [${((Date.now() - t0) / 1000).toFixed(1)}s]`,
  );
}

// A difference immediately right of the seed's own cell: rides the right edge.
run('B = {0,1}       ', [0, 1]);
run('B = {0,2}       ', [0, 2]);
run('B = {0,1,2}     ', [0, 1, 2]);
run('B = {0,5}       ', [0, 5]);
run('B = {0,20}      ', [0, 20]);
run('B = {0,1,3,7,12}', [0, 1, 3, 7, 12]);
// Controls: a difference to the LEFT of the seed's cell, which has no shield.
run('B = {-1,0}      ', [-1, 0]);
run('B = {0} shifted ', [1]);
