/**
 * Rule 30 engine.
 *
 * Two implementations of the same cellular automaton live here:
 *
 *   1. A BigInt engine that advances an entire row with three bitwise
 *      operations. This is the one used for real work.
 *   2. A naive per-cell implementation driven by the *rule number*, valid for
 *      any elementary rule 0-255. It exists only so the fast engine has
 *      something independent to be checked against.
 *
 * Nothing here proves anything. See explorer/README.md.
 */

// ---------------------------------------------------------------------------
// Conventions
// ---------------------------------------------------------------------------
//
// A row is a set of cells indexed by integer. Index increases to the RIGHT, so
// the left neighbour of cell i is cell i-1 and the right neighbour is cell i+1.
//
// In the BigInt representation, bit i of the BigInt is cell i. In the naive
// representation, array slot i is cell i. The two use the same indexing on
// purpose, so a row from one can be compared to a row from the other slot by
// slot with no coordinate translation.

/** The elementary rule this project is about. */
export const RULE_30 = 30;

/**
 * The first 41 terms of the Rule 30 center column, from OEIS A051023
 * ("middle column of rule 30, from a lone 1 cell"). Term 0 is the initial
 * single black cell, before any step has been taken.
 *
 * https://oeis.org/A051023
 */
export const A051023_PREFIX = Object.freeze([
  1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0,
  0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0,
]);

// ---------------------------------------------------------------------------
// The fast engine
// ---------------------------------------------------------------------------

/**
 * One step of Rule 30 applied to a whole row at once.
 *
 * Rule 30 is  new = left XOR (center OR right).  The only trick is getting the
 * two shifts the right way round, which is genuinely easy to invert, so here is
 * the reasoning spelled out:
 *
 *   Bit i of `x << 1n` is bit i-1 of `x`. Bit i-1 is cell i's LEFT neighbour.
 *   Therefore `x << 1n` is the whole "left neighbour" plane, aligned so that
 *   position i holds what cell i needs.
 *
 *   Bit i of `x >> 1n` is bit i+1 of `x`, which is cell i's RIGHT neighbour.
 *   Therefore `x >> 1n` is the "right neighbour" plane, likewise aligned.
 *
 * Read it as: shifting a value UP moves each cell's contents rightward into a
 * higher index, so what lands at index i is what used to sit at i-1, on the
 * left. The shift direction is opposite to the direction the data appears to
 * move when you draw the row with low indices on the left.
 *
 * With all three planes aligned at index i, the rule applies to every cell
 * simultaneously:
 *
 *     next = (x << 1n) ^ (x | (x >> 1n))
 *              left        center  right
 *
 * `x` must be non-negative. BigInt `>>` is an arithmetic shift, so a negative
 * row would sign-extend forever; every row produced here is non-negative.
 *
 * @param {bigint} x row as a bit-per-cell BigInt
 * @returns {bigint} the next row
 */
export function step(x) {
  return (x << 1n) ^ (x | (x >> 1n));
}

/**
 * Bit index of the center column for a run of `generations` generations.
 *
 * The pattern grows by exactly one cell in each direction per step, so after
 * `generations - 1` steps it occupies indices center +/- (generations - 1). The
 * center cell itself never moves. Bits below index 0 do not exist, so the
 * initial cell is placed high enough that the leftward growth never runs off
 * the bottom: `generations + 2` gives that headroom with two bits to spare.
 * Rightward growth needs no headroom at all, since a BigInt has no ceiling.
 *
 * @param {number} generations
 * @returns {number}
 */
export function centerBitIndex(generations) {
  return generations + 2;
}

/**
 * The initial configuration: a single black cell on a white background.
 *
 * @param {number} generations how many generations the run will cover
 * @returns {bigint}
 */
export function initialRow(generations) {
  return 1n << BigInt(centerBitIndex(generations));
}

/**
 * Every row of the evolution, starting from a single black cell.
 *
 * Yields `generations` rows. The first is the initial configuration, before any
 * step. Each row is a BigInt whose bit `centerBitIndex(generations)` is the
 * center column.
 *
 * @param {number} generations
 * @yields {bigint}
 */
export function* rows(generations) {
  assertGenerations(generations);
  let x = initialRow(generations);
  for (let g = 0; g < generations; g++) {
    yield x;
    x = step(x);
  }
}

/**
 * The center column, as a sequence of 0s and 1s.
 *
 * Yields `generations` terms; term 0 is the initial lone black cell, so the
 * sequence starts 1, 1, 0, 1, 1, 1, 0, 0, ... (A051023).
 *
 * ## Two things this does that `rows` does not
 *
 * Both are about keeping the BigInt no bigger than the live pattern, because
 * every bitwise operation costs time proportional to the *whole* BigInt — dead
 * zero bits included.
 *
 * **1. It slides the window instead of reserving space up front.**
 * `rows` parks the initial cell at a fixed high bit so leftward growth never
 * runs off bit 0. That means the row carries a block of zeros below the
 * pattern for the entire run, and those zeros are stored and processed like any
 * other bits. Here the initial cell sits just `PAD` bits above the bottom
 * instead, and every `PAD` generations — when the pattern has eaten through the
 * padding — the row is shifted up to restore it. One shift per `PAD` steps is
 * nothing; carrying N dead bits for N steps is most of the run.
 *
 * The step itself does not drift: the cell at bit i stays at bit i, so shifting
 * up is bookkeeping about where bit 0 is, not a correction.
 *
 * **2. It discards cells that can no longer reach the center (`trim`).**
 * Information travels one cell per step, so the center cell at generation N-1
 * can only be affected by cells within distance N-1-g at generation g.
 * Anything further out never arrives in time. Past the halfway mark that light
 * cone is narrower than the pattern, and the row can be masked down to it — and
 * then shifted back down, since the mask leaves a fresh block of dead low bits
 * behind. Together with the sliding window this takes the total bit-work from
 * about 1.5*N^2 to about 0.5*N^2.
 *
 * The mask is rebuilt only every `TRIM_INTERVAL` generations, because building
 * it costs a pass over the row too. Between rebuilds the row regrows a little
 * garbage outside the cone, which is harmless precisely because it is outside
 * the cone: the correct region shrinks by one cell per step, and so does the
 * region we still need.
 *
 * Set `trim: false` to keep every cell. The two modes must agree on every term,
 * and explorer/verify.mjs checks that they do.
 *
 * @param {number} generations
 * @param {{trim?: boolean}} [options]
 * @yields {0|1}
 */
export function* centerColumn(generations, { trim = true } = {}) {
  assertGenerations(generations);

  const last = generations - 1;

  // `pad` is how many zero bits sit below the pattern's leftmost cell; it drops
  // by one per step. `center` is the bit index of the center cell right now.
  let pad = PAD;
  let center = BigInt(PAD);
  let x = 1n << center;

  for (let g = 0; g < generations; g++) {
    yield Number((x >> center) & 1n);

    if (g === last) return;
    x = step(x);

    if (--pad === 0) {
      // The pattern's leftmost cell is now at bit 0. One more step would need
      // bit -1, which does not exist, so make room.
      x <<= PAD_BIG;
      center += PAD_BIG;
      pad = PAD;
    }

    const gen = g + 1;
    if (trim && gen % TRIM_INTERVAL === 0) {
      const radius = last - gen;
      // Only worth doing once the light cone is narrower than the pattern's own
      // half-width, which is `gen`.
      if (radius < gen) {
        x &= lightConeMask(center, radius);
        // Masking left `center - radius` dead bits at the bottom. Drop all but
        // PAD of them, and move the center index down to match.
        const shift = Number(center) - radius - PAD;
        if (shift > 0) {
          x >>= BigInt(shift);
          center -= BigInt(shift);
          pad = PAD;
        }
      }
    }
  }
}

/** Zero bits kept below the pattern, and how often they are replenished. */
const PAD = 512;
const PAD_BIG = BigInt(PAD);

/** How often `centerColumn` rebuilds the light-cone mask. */
const TRIM_INTERVAL = 4096;

/**
 * A run of `2 * radius + 1` set bits centered on bit `center`.
 *
 * @param {bigint} center
 * @param {number} radius
 * @returns {bigint}
 */
function lightConeMask(center, radius) {
  const r = BigInt(radius);
  return ((1n << (2n * r + 1n)) - 1n) << (center - r);
}

/**
 * The center column as a packed byte array, one byte per term.
 *
 * Convenient for the period scan, which needs random access to the whole
 * sequence rather than a stream.
 *
 * @param {number} generations
 * @param {{trim?: boolean}} [options]
 * @returns {Uint8Array}
 */
export function centerColumnBits(generations, options) {
  const out = new Uint8Array(generations);
  let i = 0;
  for (const bit of centerColumn(generations, options)) out[i++] = bit;
  return out;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/**
 * Render one row as text, `radius` cells either side of the center.
 *
 * @param {bigint} row
 * @param {number} generations the value passed to `rows`, which fixes the center
 * @param {number} radius
 * @param {[string, string]} [glyphs] characters for 0 and 1
 * @returns {string}
 */
export function renderRow(row, generations, radius, glyphs = [' ', '#']) {
  const center = centerBitIndex(generations);
  let s = '';
  for (let i = center - radius; i <= center + radius; i++) {
    s += i < 0 ? glyphs[0] : glyphs[Number((row >> BigInt(i)) & 1n)];
  }
  return s;
}

// ---------------------------------------------------------------------------
// The naive reference implementation
// ---------------------------------------------------------------------------

/**
 * A rule number *is* its lookup table.
 *
 * An elementary cellular automaton looks at three cells — left, center, right.
 * Three binary cells give 2^3 = 8 possible neighbourhoods. The rule has to say
 * what each of those 8 produces, and each answer is a single bit. Eight bits is
 * one byte, so the complete specification of an elementary rule is exactly one
 * number in 0..255, and there are exactly 256 such automata.
 *
 * Wolfram's numbering reads the neighbourhood as a 3-bit binary number with the
 * left cell most significant:
 *
 *     index = 4*left + 2*center + 1*right
 *
 * and the rule's output for that neighbourhood is bit `index` of the rule byte.
 * So rule 30 = 0b00011110:
 *
 *     neighbourhood  index  bit of 30  output
 *     111            7      0          0
 *     110            6      0          0
 *     101            5      0          0
 *     100            4      1          1
 *     011            3      1          1
 *     010            2      1          1
 *     001            1      1          1
 *     000            0      0          0
 *
 * which is the same function as `left XOR (center OR right)` — check the 100
 * and 011 lines against it. The BigInt engine hard-codes that XOR/OR form; this
 * side derives the table from the number instead, so the two agree only if both
 * are right.
 *
 * @param {number} rule 0..255
 * @returns {Uint8Array} 8 entries, indexed by 4*left + 2*center + 1*right
 */
export function ruleTable(rule) {
  if (!Number.isInteger(rule) || rule < 0 || rule > 255) {
    throw new RangeError(`rule must be an integer in 0..255, got ${rule}`);
  }
  const table = new Uint8Array(8);
  for (let index = 0; index < 8; index++) {
    table[index] = (rule >> index) & 1;
  }
  return table;
}

/**
 * One naive step: read three cells, look the neighbourhood up, write one cell.
 *
 * Cells outside the array are treated as 0, which is the white background.
 *
 * @param {Uint8Array} cells
 * @param {Uint8Array} table from `ruleTable`
 * @param {Uint8Array} [out] scratch buffer of the same length
 * @returns {Uint8Array}
 */
export function naiveStep(cells, table, out = new Uint8Array(cells.length)) {
  const n = cells.length;
  for (let i = 0; i < n; i++) {
    const left = i > 0 ? cells[i - 1] : 0;
    const center = cells[i];
    const right = i < n - 1 ? cells[i + 1] : 0;
    out[i] = table[(left << 2) | (center << 1) | right];
  }
  return out;
}

/**
 * The center column of any elementary rule, computed cell by cell.
 *
 * Deliberately slow and deliberately unclever: this is the control, so it must
 * not share any reasoning with the BigInt engine. Cost is O(generations^2).
 *
 * The buffer uses the same indexing as the BigInt row — slot i is cell i, with
 * the initial cell at `centerBitIndex(generations)` — so rows from the two
 * implementations line up without translation.
 *
 * @param {number} rule 0..255
 * @param {number} generations
 * @returns {Uint8Array} `generations` terms, 0 or 1
 */
export function naiveCenterColumn(rule, generations) {
  assertGenerations(generations);
  const table = ruleTable(rule);
  const center = centerBitIndex(generations);
  const width = center + generations + 2;

  let cells = new Uint8Array(width);
  let scratch = new Uint8Array(width);
  cells[center] = 1;

  const out = new Uint8Array(generations);
  for (let g = 0; g < generations; g++) {
    out[g] = cells[center];
    const next = naiveStep(cells, table, scratch);
    scratch = cells;
    cells = next;
  }
  return out;
}

/**
 * Full rows from the naive implementation, as BigInts using the same bit
 * layout as `rows`. Used by verify.mjs to compare entire rows rather than only
 * the center column.
 *
 * @param {number} rule 0..255
 * @param {number} generations
 * @yields {bigint}
 */
export function* naiveRows(rule, generations) {
  assertGenerations(generations);
  const table = ruleTable(rule);
  const center = centerBitIndex(generations);
  const width = center + generations + 2;

  let cells = new Uint8Array(width);
  let scratch = new Uint8Array(width);
  cells[center] = 1;

  for (let g = 0; g < generations; g++) {
    let row = 0n;
    for (let i = width - 1; i >= 0; i--) row = (row << 1n) | BigInt(cells[i]);
    yield row;
    const next = naiveStep(cells, table, scratch);
    scratch = cells;
    cells = next;
  }
}

// ---------------------------------------------------------------------------

function assertGenerations(generations) {
  if (!Number.isInteger(generations) || generations < 1) {
    throw new RangeError(
      `generations must be a positive integer, got ${generations}`,
    );
  }
}
