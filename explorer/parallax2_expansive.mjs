/**
 * Is rule 30 LEFT EXPANSIVE AT WIDTH 1?
 *
 * Kopra 2022 (sources/kopra-2022-natural-class.txt) proves: a "rapidly left
 * expansive" CA has no eventually periodic trace of width w, for any
 * number-like configuration. Rule 30 qualifies with w = 2 (left permutivity
 * gives dimensions (h,d,w) = (0,1,2)), which is his Theorem 3.5 and the
 * strongest published statement near Prize 1. Width w = 1 would BE Prize 1.
 *
 * The definition: F is left expansive with dimensions (h,d,w) when the cells
 * at spatial positions [i, i+w-1] and times [t-h, t+d] determine the cell at
 * (i-1, t), for every pair of space-time diagrams. The preperiod grows by h
 * per cell leftward (his Lemma 3.2), and his hypothesis is s < 1/h where s is
 * the spreading speed. Rule 30 has s = 1 exactly (an elementary CA that is
 * left spreading has spreading speed 1, his Section 3), so the ONLY usable
 * height is h = 0.
 *
 * So the one question that would upgrade Kopra's theorem to Prize 1 is:
 *
 *     is there a d such that the cells (i,t), (i,t+1), ..., (i,t+d)
 *     determine the cell (i-1,t), over all space-time diagrams?
 *
 * This script decides that question EXHAUSTIVELY for each d, with no sampling.
 * The reason it can: the cell at (0,t) depends only on cells [-t,t] of row 0,
 * so the whole column word (t = 0..d) depends only on the 2d+1 cells
 * [-d,d] of row 0 -- and the cell to be determined, (-1,0), is one of them.
 * Enumerating all 2^(2d+1) windows therefore covers every configuration in
 * the universe, not a sample of them.
 *
 * Zero-padding the window is sound for exactly the same cone reason: an error
 * injected at position +-d travels inward one cell per step, so position 0 is
 * still correct at every time t <= d.
 *
 * Output per d: whether the map (column word) -> (cell at -1) is well defined,
 * how many column words are ambiguous, and the smallest witness pair.
 */

const D_EXHAUSTIVE = 12;
const D_SAMPLED = 14;
const SAMPLES = 4_000_000;

/** One rule 30 step on an n-bit window, cells outside the window read 0. */
function step(x, mask) {
  return ((x << 1) ^ (x | (x >>> 1))) & mask;
}

/**
 * Column word of the window `w` (2d+1 cells, position p at bit p+d),
 * read at position 0 for times 0..d. Returns a (d+1)-bit integer, time t
 * at bit t.
 */
function columnWord(w, d, mask) {
  let x = w;
  let out = 0;
  for (let t = 0; t <= d; t++) {
    out |= ((x >>> d) & 1) << t;
    x = step(x, mask);
  }
  return out;
}

function render(w, d) {
  let s = '';
  for (let p = -d; p <= d; p++) s += (w >>> (p + d)) & 1 ? '1' : '0';
  return s;
}

console.log('rule 30 left expansivity at width 1, height h = 0');
console.log('exhaustive over all 2^(2d+1) windows: every configuration, not a sample\n');
console.log(' d   windows      column words   ambiguous   determined?');

for (let d = 1; d <= D_EXHAUSTIVE; d++) {
  const n = 2 * d + 1;
  const mask = n === 32 ? -1 : (1 << n) - 1;
  const total = 2 ** n;
  // seen[word]: bit 1 = saw left cell 0, bit 2 = saw left cell 1
  const seen = new Uint8Array(2 ** (d + 1));
  const witness0 = new Int32Array(2 ** (d + 1)).fill(-1);
  let ambiguous = 0;
  let firstWord = -1;
  let firstA = -1;
  let firstB = -1;

  for (let w = 0; w < total; w++) {
    const word = columnWord(w, d, mask);
    const left = (w >>> (d - 1)) & 1; // cell at position -1
    const before = seen[word];
    const after = before | (1 << left);
    if (after === 3 && before !== 3) {
      ambiguous++;
      if (firstWord < 0) {
        firstWord = word;
        firstA = witness0[word];
        firstB = w;
      }
    }
    if (before === 0) witness0[word] = w;
    seen[word] = after;
  }

  let words = 0;
  for (let i = 0; i < seen.length; i++) if (seen[i] !== 0) words++;

  console.log(
    ` ${String(d).padStart(2)}  ${String(total).padStart(11)}  ${String(words).padStart(12)}  ${String(ambiguous).padStart(9)}   ${ambiguous === 0 ? 'YES' : 'NO'}`,
  );
  if (d <= 4 && firstWord >= 0) {
    let cw = '';
    for (let t = 0; t <= d; t++) cw += (firstWord >>> t) & 1 ? '1' : '0';
    console.log(
      `      witness: column word ${cw} (times 0..${d} at position 0) from both`,
    );
    console.log(`        ${render(firstA, d)}   cell(-1,0) = ${(firstA >>> (d - 1)) & 1}`);
    console.log(`        ${render(firstB, d)}   cell(-1,0) = ${(firstB >>> (d - 1)) & 1}`);
    console.log(`        (cells at positions -${d}..${d}, position -1 is the ${d}th)`);
  }
}

console.log('\nsampled, for d beyond the exhaustive range:');
console.log(' d   samples    distinct words   ambiguous words found');
for (let d = D_EXHAUSTIVE + 1; d <= D_SAMPLED; d++) {
  const n = 2 * d + 1;
  if (n > 30) break;
  const mask = (1 << n) - 1;
  const seen = new Map();
  let ambiguous = 0;
  for (let s = 0; s < SAMPLES; s++) {
    const w = (Math.random() * (mask + 1)) >>> 0 & mask;
    const word = columnWord(w, d, mask);
    const left = (w >>> (d - 1)) & 1;
    const before = seen.get(word) ?? 0;
    const after = before | (1 << left);
    if (after === 3 && before !== 3) ambiguous++;
    if (after !== before) seen.set(word, after);
  }
  console.log(
    ` ${String(d).padStart(2)}  ${String(SAMPLES).padStart(9)}  ${String(seen.size).padStart(14)}  ${String(ambiguous).padStart(21)}`,
  );
}
