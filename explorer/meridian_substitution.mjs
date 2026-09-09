/**
 * Meridian F — rule 30 as an in-place rewriting of maximal runs.
 *
 * Meridian A gave the boundary form. This is the same statement written as a
 * substitution, which is the form the Kolakoski precedent uses:
 *
 *     a maximal BLACK run of length k   ->   1 0^(k-1)
 *     a maximal WHITE run of length 1   ->   0
 *     a maximal WHITE run of length m>=2 ->  1 0^(m-2) 1
 *
 * applied to every maximal run of a row at once, in place (each image has the
 * same length as its run, so nothing shifts), and the results concatenated.
 * If that reproduces rule 30 cell for cell then rule 30 IS a rule about runs:
 * its input is the run-length encoding and its output is a word in the run
 * lengths, and nothing else about the row is read.
 *
 * Nothing here proves anything.
 */

const stepA = (c) => {
  const n = c.length;
  const o = new Uint8Array(n);
  for (let i = 1; i < n - 1; i++) o[i] = c[i - 1] ^ (c[i] | c[i + 1]);
  return o;
};

/** The substitution, applied to the maximal runs of `cells` that lie strictly
 *  inside the window (runs touching an edge are skipped and reported). */
function substitute(cells) {
  const n = cells.length;
  const out = new Int8Array(n).fill(-1); // -1 = not decided
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && cells[j + 1] === cells[i]) j++;
    const touchesEdge = i === 0 || j === n - 1;
    if (!touchesEdge) {
      const len = j - i + 1;
      if (cells[i] === 1) {
        out[i] = 1;
        for (let x = i + 1; x <= j; x++) out[x] = 0;
      } else if (len === 1) {
        out[i] = 0;
      } else {
        out[i] = 1;
        for (let x = i + 1; x < j; x++) out[x] = 0;
        out[j] = 1;
      }
    }
    i = j + 1;
  }
  return out;
}

function check(label, initial, rows) {
  let cells = initial;
  let decided = 0, bad = 0;
  for (let t = 0; t < rows; t++) {
    const next = stepA(cells);
    const sub = substitute(cells);
    for (let i = 2; i < cells.length - 2; i++) {
      if (sub[i] < 0) continue;
      decided++;
      if (sub[i] !== next[i]) bad++;
    }
    cells = next;
  }
  console.log(`${label}: cells decided ${decided}, mismatches ${bad}`);
}

// the seed
{
  const T = 3000, W = 2 * T + 40, o = T + 20;
  const init = new Uint8Array(W);
  init[o] = 1;
  check(`seed, ${T} rows`, init, T);
}

// random rows
{
  let s = 0x51f0c3 >>> 0;
  const rnd = () => ((s ^= s << 13), (s ^= s >>> 17), (s ^= s << 5), (s >>> 0) & 1);
  const W = 5000;
  const init = new Uint8Array(W);
  for (let i = 0; i < W; i++) init[i] = rnd();
  check('random rows, 300', init, 300);
}

// the two spatially periodic fixed points and a long-run row
{
  const W = 5000;
  const stripes = new Uint8Array(W);
  for (let i = 0; i < W; i++) stripes[i] = i % 2;
  check('(10)^inf rows, 50', stripes, 50);

  const long = new Uint8Array(W);
  for (let i = 0; i < W; i++) long[i] = Math.floor(i / 23) % 2;
  check('(1^23 0^23)^inf rows, 50', long, 50);
}
