/**
 * Meridian A — rule 30 stated as a rule about maximal repetitions (runs).
 *
 * The claim under test, derived by hand from `new(i) = l XOR (c OR r)`:
 *
 *   new(i) = 1  <=>  i is the LEFT end of a maximal black run,
 *                    or i is EITHER end of a maximal white run of length >= 2.
 *
 * Equivalently: rule 30 marks the boundaries of maximal repeated blocks, with
 * black blocks marked only on their left and singleton white blocks not marked
 * at all. Nothing else. If that identity holds cell for cell then rule 30's
 * local rule *is* a statement about repetition, which is what the vantage was
 * sent to look for.
 *
 * Three tests:
 *   A. the identity on every cell of the seed's rows, to depth T
 *   B. the identity on random rows (so it is not a fact about the seed)
 *   C. the centre-column reading: c(t+1) is the indicator that the ORIGIN sits
 *      at such a boundary in row t; plus the statistics of where the origin
 *      sits inside its run, which is the object a repetition-reading proof
 *      would have to control.
 *
 * Nothing here proves anything.
 */

const T = 4000;
const MARGIN = 8;

/** Row as Uint8Array over positions [lo, hi]; index k is position lo+k. */
function stepArr(cells) {
  const n = cells.length;
  const out = new Uint8Array(n);
  for (let i = 1; i < n - 1; i++) {
    out[i] = cells[i - 1] ^ (cells[i] | cells[i + 1]);
  }
  return out;
}

/**
 * The run-boundary predicate, evaluated on `cells` at index i.
 * Needs the whole maximal run containing i to be inside the array.
 * Returns -1 when it cannot be decided from this window.
 */
function runBoundary(cells, i) {
  const n = cells.length;
  const v = cells[i];
  let a = i;
  while (a > 0 && cells[a - 1] === v) a--;
  let b = i;
  while (b < n - 1 && cells[b + 1] === v) b++;
  if (a === 0 || b === n - 1) return -1; // run touches the window edge
  const len = b - a + 1;
  if (v === 1) return i === a ? 1 : 0;
  return len >= 2 && (i === a || i === b) ? 1 : 0;
}

function runTest(label, initial, rows) {
  let checked = 0;
  let bad = 0;
  let cells = initial;
  for (let t = 0; t < rows; t++) {
    const next = stepArr(cells);
    for (let i = MARGIN; i < cells.length - MARGIN; i++) {
      const p = runBoundary(cells, i);
      if (p < 0) continue;
      checked++;
      if (p !== next[i]) bad++;
    }
    cells = next;
  }
  console.log(`${label}: cells checked ${checked}, mismatches ${bad}`);
  return bad;
}

// ---- A: the seed --------------------------------------------------------
{
  const W = 2 * T + 40;
  const init = new Uint8Array(W);
  const origin = T + 20;
  init[origin] = 1;
  runTest('A seed rows (T=' + T + ')', init, T);
}

// ---- B: random rows -----------------------------------------------------
{
  let s = 0x2f6e2b1 >>> 0;
  const rnd = () => ((s ^= s << 13), (s ^= s >>> 17), (s ^= s << 5), (s >>> 0) & 1);
  const W = 4000;
  const init = new Uint8Array(W);
  for (let i = 0; i < W; i++) init[i] = rnd();
  runTest('B random rows (200)', init, 200);

  // and a few degenerate ones
  const stripes = new Uint8Array(W);
  for (let i = 0; i < W; i++) stripes[i] = i % 2;
  runTest('B (10)^inf rows (50)', stripes, 50);
  const blocks = new Uint8Array(W);
  for (let i = 0; i < W; i++) blocks[i] = Math.floor(i / 7) % 2;
  runTest('B (1^7 0^7)^inf rows (50)', blocks, 50);
}

// ---- C: the centre column as a boundary indicator -----------------------
{
  const W = 2 * T + 40;
  const origin = T + 20;
  let cells = new Uint8Array(W);
  cells[origin] = 1;

  const col = [];
  const rel = []; // where the origin sits in its run: 'L','R','LR','I'
  let bad = 0;
  for (let t = 0; t <= T; t++) {
    col.push(cells[origin]);
    const next = stepArr(cells);
    const p = runBoundary(cells, origin);
    if (p >= 0 && p !== next[origin]) bad++;
    // record the origin's position inside its maximal run
    const v = cells[origin];
    let a = origin;
    while (a > 0 && cells[a - 1] === v) a--;
    let b = origin;
    while (b < W - 1 && cells[b + 1] === v) b++;
    rel.push({ v, len: b - a + 1, off: origin - a });
    cells = next;
  }
  console.log(`C centre-column boundary identity: mismatches ${bad} over ${T} steps`);

  // statistics of the origin's run coordinate
  const lens = rel.map((r) => r.len);
  const meanLen = lens.reduce((x, y) => x + y, 0) / lens.length;
  const maxLen = Math.max(...lens);
  let atLeft = 0, atRight = 0, interior = 0, single = 0;
  for (const r of rel) {
    if (r.len === 1) single++;
    else if (r.off === 0) atLeft++;
    else if (r.off === r.len - 1) atRight++;
    else interior++;
  }
  console.log(
    `C origin's run: mean length ${meanLen.toFixed(3)}, max ${maxLen}; ` +
      `singleton ${single}, at-left ${atLeft}, at-right ${atRight}, interior ${interior}`,
  );

  // does the run-coordinate sequence look periodic anywhere? cheapest check:
  // distinct factors of the coded sequence (colour, min(off,3), min(len,4))
  const coded = rel.map((r) => `${r.v}${Math.min(r.off, 3)}${Math.min(r.len, 4)}`);
  for (const L of [4, 8, 16]) {
    const set = new Set();
    for (let i = 0; i + L <= coded.length; i++) set.add(coded.slice(i, i + L).join(''));
    console.log(`C coded run-coordinate: distinct factors of length ${L}: ${set.size}`);
  }
}
