/**
 * Meridian B — the centre column as the interface between two spatially
 * periodic fixed points of rule 30.
 *
 * The board proves (sextant_scratch_shield_general.lean) that the chain of
 * finite configurations {0}, {0,2}, {0,2,4}, ... all have the seed's centre
 * column. The cone lemma makes the limit legal: for the centre cell at time t
 * only cells in [-t, t] matter, and past k > t/2 every chain member agrees with
 * the limit there. So the LIMIT configuration
 *
 *     E  =  ... 0 0 0 | 1 0 1 0 1 0 1 ...      (black at every even x >= 0)
 *
 * should have the seed's centre column too. E is white on the left and sits on
 * the period-2 background on the right, and BOTH of those are fixed points of
 * rule 30, so E is a wall between two repetitions.
 *
 * Tests:
 *   A. (10)^Z and 0^Z are fixed points of rule 30.
 *   B. E's centre column equals the seed's, to depth T.
 *   C. the finite chain members agree too (the board's own claim, re-measured).
 *   D. where E's picture differs from the (10) background: the two damage
 *      fronts, so that "wall between two repetitions" is a measured statement
 *      and not a picture.
 *   E. the same for the mirror candidates that should FAIL, as controls.
 *
 * Nothing here proves anything.
 */

const T = 60000;

/** BigInt row helpers. Bit i of the BigInt is position (i - OFF). */
const step = (x) => (x << 1n) ^ (x | (x >> 1n));

function centreColumnOf(rowBits, off, depth) {
  // rowBits: BigInt with bit (off + x) = cell at x. Cells outside are white.
  let x = rowBits;
  const out = new Uint8Array(depth + 1);
  const o = BigInt(off);
  for (let t = 0; t <= depth; t++) {
    out[t] = Number((x >> o) & 1n);
    x = step(x);
  }
  return out;
}

function seedColumn(depth) {
  const off = depth + 4;
  return centreColumnOf(1n << BigInt(off), off, depth);
}

function firstDiff(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return -1;
}

// ---- A: the two backgrounds are fixed points ---------------------------
{
  const W = 400;
  const stripes = new Uint8Array(W);
  for (let i = 0; i < W; i++) stripes[i] = (i % 2 === 0 ? 1 : 0);
  let bad = 0;
  for (let i = 1; i < W - 1; i++) {
    const v = stripes[i - 1] ^ (stripes[i] | stripes[i + 1]);
    if (v !== stripes[i]) bad++;
  }
  console.log(`A (10)^Z fixed point: mismatches ${bad} of ${W - 2}`);
  console.log(`A 0^Z fixed point: ${(0 ^ (0 | 0)) === 0 ? 'yes' : 'no'}`);
}

// ---- B: E's centre column ----------------------------------------------
{
  const seed = seedColumn(T);
  // E truncated to positions [0, T+2]; truncation is outside the origin's cone
  // for every t <= T, so the centre column to depth T is E's.
  const off = T + 4;
  let bits = 0n;
  for (let x = 0; x <= T + 2; x += 2) bits |= 1n << BigInt(off + x);
  const e = centreColumnOf(bits, off, T);
  const d = firstDiff(seed, e);
  console.log(
    `B E = 0^inf | (10)^inf : first disagreement with the seed's centre column ` +
      `at t = ${d} (depth ${T}; -1 means none)`,
  );
  console.log(`   seed[0..20] = ${Array.from(seed.slice(0, 21)).join('')}`);
  console.log(`   E   [0..20] = ${Array.from(e.slice(0, 21)).join('')}`);
}

// ---- C: the finite chain members ---------------------------------------
{
  const depth = 4000;
  const seed = seedColumn(depth);
  const off = depth + 4;
  for (const k of [1, 2, 3, 10, 100, 1000, 3000]) {
    let bits = 0n;
    for (let j = 0; j <= k; j++) bits |= 1n << BigInt(off + 2 * j);
    const c = centreColumnOf(bits, off, depth);
    console.log(`C chain {0,2,...,${2 * k}}: first disagreement at t = ${firstDiff(seed, c)}`);
  }
  // controls that should fail: an added cell that is NOT a shield move
  for (const extra of [3, 5, 7]) {
    const bits = (1n << BigInt(off)) | (1n << BigInt(off + extra));
    const c = centreColumnOf(bits, off, depth);
    console.log(`C control {0,${extra}}: first disagreement at t = ${firstDiff(seed, c)}`);
  }
}

// ---- D: E's picture against the (10) background -------------------------
{
  const depth = 3000;
  const W = 4 * depth + 40;
  const origin = 2 * depth + 20;
  const cells = new Uint8Array(W);
  for (let x = 0; origin + x < W; x += 2) cells[origin + x] = 1;
  const bg = new Uint8Array(W);
  for (let i = 0; i < W; i++) bg[i] = ((i - origin) % 2 === 0 ? 1 : 0);

  let cur = cells;
  const stepA = (c) => {
    const n = c.length;
    const o = new Uint8Array(n);
    for (let i = 1; i < n - 1; i++) o[i] = c[i - 1] ^ (c[i] | c[i + 1]);
    return o;
  };
  let leftFrontAt = [], rightFrontAt = [];
  for (let t = 0; t <= depth; t++) {
    if (t === 100 || t === 500 || t === 1000 || t === 2000 || t === 3000) {
      let lo = -1, hi = -1;
      for (let i = 4; i < W - 4; i++) if (cur[i] !== bg[i]) { lo = i - origin; break; }
      for (let i = W - 5; i >= 4; i--) if (cur[i] !== bg[i]) { hi = i - origin; break; }
      leftFrontAt.push([t, lo]);
      rightFrontAt.push([t, hi]);
    }
    cur = stepA(cur);
  }
  console.log('D leftmost difference from the (10) background (t, x):',
    JSON.stringify(leftFrontAt));
  console.log('D rightmost difference from the (10) background (t, x):',
    JSON.stringify(rightFrontAt));
}
