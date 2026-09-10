// Does a black run of the centre column measure the depth of the alternating
// fixed-point background (10)^k to the left of the origin?
//
// Claim under test, for any configuration X and any t, L:
//   centre black at t, t+1, ..., t+L-1
//     <->  row_t(-j) = (j even)  for every j < L
//
// Checked on the seed and on random windows.

const STEPS = Number(process.argv[2] ?? 4000);

// --- naive per-cell engine over a finite window with white padding ---------
function stepRow(row) {
  // row: Uint8Array, index i is cell (i - offset). Pad by one each side.
  const n = row.length;
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const l = i - 1 >= 0 ? row[i - 1] : 0;
    const c = row[i];
    const r = i + 1 < n ? row[i + 1] : 0;
    out[i] = l ^ (c | r);
  }
  return out;
}

function runPicture(row0, offset, steps) {
  // returns array of rows; cell x of row t is rows[t][x + offset]
  const rows = [row0];
  let cur = row0;
  for (let t = 0; t < steps; t++) {
    cur = stepRow(cur);
    rows.push(cur);
  }
  return rows;
}

function altDepth(rows, t, offset, maxJ) {
  // largest L such that row_t(-j) = (j even) for all j < L
  let L = 0;
  while (L < maxJ) {
    const idx = offset - L;
    if (idx < 0) break;
    const want = L % 2 === 0 ? 1 : 0;
    if (rows[t][idx] !== want) break;
    L++;
  }
  return L;
}

function blackRun(rows, t, offset, maxS) {
  let L = 0;
  while (L < maxS && t + L < rows.length) {
    if (rows[t + L][offset] !== 1) break;
    L++;
  }
  return L;
}

function check(row0, offset, steps, label) {
  const rows = runPicture(row0, offset, steps);
  let bad = 0;
  let maxRun = 0;
  const hist = new Map();
  // stay well inside: only test t where the window still has room both ways
  const margin = 40;
  for (let t = 0; t < steps - margin; t++) {
    const a = altDepth(rows, t, offset, margin);
    const b = blackRun(rows, t, offset, margin);
    if (a !== b) {
      if (bad < 5) {
        console.log(`  MISMATCH ${label} t=${t} altDepth=${a} blackRun=${b}`);
      }
      bad++;
    }
    if (b > maxRun) maxRun = b;
    hist.set(b, (hist.get(b) ?? 0) + 1);
  }
  const dist = [...hist.entries()].sort((x, y) => x[0] - y[0])
    .map(([k, v]) => `${k}:${v}`).join(' ');
  console.log(`${label}: ${bad} mismatches over ${steps - margin} rows, max black run ${maxRun}`);
  console.log(`  black-run-length-at-t histogram  ${dist}`);
  return bad;
}

// --- the seed -------------------------------------------------------------
const W = 2 * STEPS + 200;
const OFF = STEPS + 100;
const seed = new Uint8Array(W);
seed[OFF] = 1;
let total = check(seed, OFF, STEPS, 'seed');

// --- random windows -------------------------------------------------------
let s = 12345;
function rnd() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x80000000; }
for (let trial = 0; trial < 6; trial++) {
  const w = 1200, off = 600;
  const r0 = new Uint8Array(w);
  for (let i = 200; i < w - 200; i++) r0[i] = rnd() < 0.5 ? 1 : 0;
  total += check(r0, off, 400, `random-${trial}`);
}

// --- longest black run of the seed's centre column, deeper ----------------
console.log('\ntotal mismatches:', total);
