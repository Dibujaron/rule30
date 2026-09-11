/**
 * Chorobates, connector, 2026-09-11.
 *
 * Testing one row of the Gilbreath dictionary. Odlyzko's reduction of
 * Gilbreath's conjecture works like this: the entries of the difference
 * triangle eventually lie in {0, 2}, that set is CLOSED under the rule
 * a(i+1,j) = |a(i,j) - a(i,j+1)|, and a leading 1 with n such entries to its
 * right keeps the left column at 1 for n more rows -- a finite window of a
 * closed sub-alphabet SHIELDS the boundary column, losing one cell per row.
 *
 * The board's `column_alternating_shrink` is the same shape for rule 30: an
 * alternating block of depth L left of the origin gives depth L-1 at the next
 * row, and holds the centre column black for L rows. So the question here is
 * whether the alternating block is the SMALLEST member of a family of rule 30
 * shields (as {0,2} is one of many sub-alphabets over there) or the ONLY one.
 *
 * Three measurements:
 *
 *  (A) the one-sided shield: at every row t, the maximal depth of alternation
 *      running leftward from the origin, cross-checked against the maximal
 *      black run of the centre column starting at t (they must be equal, by
 *      `column_alternating_of_black_run` and `column_black_run_of_alternating`).
 *
 *  (B) the two-sided shield: at every row t, the longest window AROUND the
 *      origin that is spatially p-periodic for some p <= PMAX with the induced
 *      p-ring temporally periodic under rule 30. Such a window is a patch of a
 *      genuine space-time periodic rule 30 picture, so the cone alone makes it
 *      determine the centre column for min(left extent, right extent) rows --
 *      the exact analogue of Odlyzko's window. Does it ever beat (A)?
 *
 *  (C) exhaustive: over ALL 2^L words on cells 0, -1, ..., -(L-1), which force
 *      the centre column for more than one row against EVERY completion of the
 *      cells 1 .. L-1 (the only other cells the origin's cone reads in L-1
 *      steps)? If the alternating word is alone, rule 30 has exactly one
 *      one-sided shield and the family does not exist.
 */

const T = 20000;          // rows for (A) and (B)
const PMAX = 14;          // ring widths for (B)
const LMAX = 14;          // window depth for (C)

// ---------------------------------------------------------------- the picture
// cell(t, x) = row[x + OFF]. The cone is -t .. t.
const OFF = T + 2;
const W = 2 * T + 5;
let row = new Uint8Array(W);
let next = new Uint8Array(W);
row[OFF] = 1;

// ------------------------------------------------- (B) which p-rings are cyclic
function ringStep(state, p) {
  let out = 0;
  for (let i = 0; i < p; i++) {
    const l = (state >> ((i + p - 1) % p)) & 1;
    const c = (state >> i) & 1;
    const r = (state >> ((i + 1) % p)) & 1;
    if (l ^ (c | r)) out |= 1 << i;
  }
  return out;
}
const cyclic = [];
const cyclicCounts = [];
for (let p = 1; p <= PMAX; p++) {
  const n = 1 << p;
  const nextOf = new Int32Array(n);
  for (let s = 0; s < n; s++) nextOf[s] = ringStep(s, p);
  const mark = new Uint8Array(n);
  const state = new Int32Array(n).fill(0);   // 0 unvisited, 1 on stack, 2 done
  for (let s = 0; s < n; s++) {
    if (state[s] !== 0) continue;
    const path = [];
    let x = s;
    while (state[x] === 0) { state[x] = 1; path.push(x); x = nextOf[x]; }
    if (state[x] === 1) {                    // a fresh cycle through x
      let y = x;
      do { mark[y] = 1; y = nextOf[y]; } while (y !== x);
    }
    for (const z of path) state[z] = 2;
  }
  cyclic[p] = mark;
  let c = 0;
  for (let s = 0; s < n; s++) if (mark[s]) c++;
  cyclicCounts.push(`${p}:${c}`);
}
console.log('cyclic ring states by ring width  ' + cyclicCounts.join(' '));

// --------------------------------------------------------------------- sweep
const altAt = new Int32Array(T + 1);
const centre = new Uint8Array(T + 1);

let bestAlt = 0, bestAltT = -1;
let bestTwo = 0, bestTwoT = -1, bestTwoP = -1;
let twoBeatsAlt = 0, twoNonTrivial = 0;

for (let t = 0; t <= T; t++) {
  centre[t] = row[OFF];

  // (A) alternating depth leftward from the origin
  let alt = 0;
  while (alt <= t && row[OFF - alt] === (alt % 2 === 0 ? 1 : 0)) alt++;
  altAt[t] = row[OFF] === 1 ? alt : 0;
  if (row[OFF] === 1 && alt > bestAlt) { bestAlt = alt; bestAltT = t; }

  // (B) best two-sided periodic patch around the origin.
  // Reference window: cells 0 .. p-1. p-periodicity means
  //   cell(x) = cell(x mod p) for every x in the patch.
  let two = 0, twoP = -1;
  for (let p = 1; p <= PMAX; p++) {
    if (p - 1 > t) continue;
    let st = 0;
    for (let i = 0; i < p; i++) if (row[OFF + i] === 1) st |= 1 << i;
    if (!cyclic[p][st]) continue;
    let b = p - 1;
    while (b + 1 <= t && row[OFF + b + 1] === row[OFF + ((b + 1) % p)]) b++;
    let a = 0;
    while (a + 1 <= t && row[OFF - (a + 1)] === row[OFF + ((p - ((a + 1) % p)) % p)]) a++;
    const shield = Math.min(a, b);
    if (shield > two) { two = shield; twoP = p; }
  }
  if (two > bestTwo) { bestTwo = two; bestTwoT = t; bestTwoP = twoP; }
  if (two > 2) twoNonTrivial++;
  if (row[OFF] === 1 && two > altAt[t]) twoBeatsAlt++;

  for (let x = 1; x < W - 1; x++) next[x] = row[x - 1] ^ (row[x] | row[x + 1]);
  const tmp = row; row = next; next = tmp;
}

console.log(`(A) longest one-sided alternating block, rows 0..${T}: ${bestAlt} at t=${bestAltT}`);
console.log(`(B) longest two-sided cyclic-ring patch: ${bestTwo} at t=${bestTwoT}, p=${bestTwoP}`);
console.log(`(B) rows with a two-sided patch of extent > 2: ${twoNonTrivial} of ${T + 1}`);
console.log(`(B) rows where the two-sided patch beat the alternating block: ${twoBeatsAlt}`);

// (A') cross-check against the maximal black runs
let mism = 0, checked = 0, maxRun = 0, maxRunT = -1;
for (let t = 0; t <= T; t++) {
  if (centre[t] !== 1) continue;
  if (t > 0 && centre[t - 1] === 1) continue;
  let L = 0;
  while (t + L <= T && centre[t + L] === 1) L++;
  checked++;
  if (L > maxRun) { maxRun = L; maxRunT = t; }
  if (altAt[t] !== L) mism++;
}
console.log(`(A') maximal black runs checked: ${checked}; alt-depth != run-length in ${mism};` +
  ` longest run ${maxRun} starting at t=${maxRunT}`);

// ------------------------------------------------------------------ (C) forcing
// Cells -(L-1) .. (L-1) packed into an int: bit i = cell (i - (L-1)).
// The word fixes bits 0 .. L-1 (cells -(L-1) .. 0); bits L .. 2L-2 (cells
// 1 .. L-1) are the free completion. After k steps the origin (bit L-1) is
// still valid for every k <= L-1.
function forcedRows(word, L) {
  const free = L - 1;
  const mask = (1 << (2 * L - 1)) - 1;
  let minDepth = L;
  let ref = null;
  for (let f = 0; f < (1 << free); f++) {
    let r = word | (f << L);
    const col = [];
    for (let k = 0; k < L; k++) {
      col.push((r >> (L - 1)) & 1);
      r = ((r << 1) ^ (r | (r >> 1))) & mask;
    }
    if (ref === null) { ref = col; continue; }
    let d = L;
    for (let k = 0; k < L; k++) if (col[k] !== ref[k]) { d = k; break; }
    if (d < minDepth) minDepth = d;
    if (minDepth <= 1) return 1;
  }
  return minDepth;
}

console.log('');
console.log('(C) one-sided shields. Words on cells 0..-(L-1), bit j = cell -j.');
console.log('    "forced rows" = how many rows of the centre column the word pins');
console.log('    against every one of the 2^(L-1) completions of cells 1..L-1.');
const asWord = (w, L) => { let s = ''; for (let j = L - 1; j >= 0; j--) s += (w >> j) & 1; return s; };
for (let L = 2; L <= LMAX; L++) {
  let best = 0; let winners = [];
  for (let w = 0; w < (1 << L); w++) {
    const d = forcedRows(w, L);
    if (d > best) { best = d; winners = []; }
    if (d === best) winners.push(w);
  }
  console.log(`  L=${String(L).padStart(2)}  max forced rows = ${best}  by ${winners.length} word(s): ` +
    winners.slice(0, 4).map((w) => asWord(w, L)).join(' ') + (winners.length > 4 ? ' ...' : '') +
    `   (cell 0 is the rightmost digit)`);
}
