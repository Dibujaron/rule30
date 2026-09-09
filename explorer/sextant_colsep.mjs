/**
 * Does the centre column separate finite configurations?
 *
 * Why this is the right question for the coboundary topic. Suppose the
 * difference d_{j,x}(t) = c(t) XOR cell(t + j, x) is eventually ZERO, from row
 * N on. Put A = row N of the seed's picture, and B = row (N + j) slid x cells
 * sideways: B(i) = cell(N + j, i + x). Both are finite configurations, and by
 * construction the centre column of A's picture equals the centre column of
 * B's picture at every time. They are distinct whenever (j, x) != (0, 0): A's
 * leftmost black cell is at -N and B's at -(N + j) - x, and its rightmost at N
 * against N + j - x, so A = B forces x = -j and then j = 0.
 *
 * So the p = 1 case of the topic's statement follows from: *two distinct
 * finite configurations never have the same centre column for ever.* This
 * script asks the engine whether that is even true, by enumerating every
 * configuration supported in a window and sorting the centre columns: the
 * longest common prefix between two distinct ones is the depth at which the
 * centre column has separated them all.
 *
 * Nothing here is a proof. See explorer/README.md.
 *
 *   node explorer/sextant_colsep.mjs
 */

const T = 320;                 // depth of the centre column read
const PAD = T + 8;             // bit index of position 0

const PADB = BigInt(PAD);

/** The centre column of the picture grown from `cells` (bit p = position p). */
function columnOf(cells, depth) {
  let x = cells;
  const out = new Uint8Array(depth);
  for (let t = 0; t < depth; t++) {
    out[t] = Number((x >> PADB) & 1n);
    x = (x << 1n) ^ (x | (x >> 1n));
  }
  return out;
}

// sanity: the single black cell at position 0 is the seed
{
  const c = columnOf(1n << PADB, 21);
  const head = Array.from(c).join('');
  const want = '110111001100010110010';
  console.log(`seed column head ${head} ${head === want ? 'OK (A051023)' : 'MISMATCH want ' + want}`);
}

/**
 * Enumerate every configuration supported in [lo, hi) and report how deep the
 * centre column has to be read before all of them are distinguished.
 */
function scan(lo, hi, depth) {
  const t0 = Date.now();
  const n = hi - lo;
  const count = 1 << n;
  const keys = new Array(count);
  for (let m = 0; m < count; m++) {
    let cells = 0n;
    for (let b = 0; b < n; b++) if ((m >> b) & 1) cells |= 1n << BigInt(PAD + lo + b);
    const col = columnOf(cells, depth);
    keys[m] = Array.from(col).join('') + '|' + m;
  }
  keys.sort();
  let best = -1, bestPair = null;
  for (let i = 1; i < count; i++) {
    const a = keys[i - 1], b = keys[i];
    let k = 0;
    while (k < depth && a.charCodeAt(k) === b.charCodeAt(k)) k++;
    if (k > best) {
      best = k;
      bestPair = [a.slice(depth + 1), b.slice(depth + 1)];
    }
  }
  const collisions = best >= depth ? 'YES' : 'no';
  console.log(
    `support [${lo}, ${hi}): ${count} configurations, depth ${depth}` +
    ` -> longest shared centre-column prefix ${best}` +
    ` (configs ${bestPair[0]} and ${bestPair[1]}), collision at full depth: ${collisions}` +
    `  [${((Date.now() - t0) / 1000).toFixed(1)}s]`,
  );
  return best;
}

// The window is placed at the origin and to either side of it; a difference
// far to the right of the origin takes about four rows per cell to reach the
// centre column, so the depth must be several times the window width.
scan(0, 12, 120);
scan(0, 14, 200);
scan(0, 16, T);
scan(-8, 8, T);
scan(-16, 0, T);
scan(-4, 12, T);
