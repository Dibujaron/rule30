/**
 * Chorobates, connector, 2026-09-11. Second pass, fixing two faults in
 * chorobates_shields.mjs that made its numbers mean less than they looked.
 *
 * Fault 1: it compared the two-sided patch extent against the alternating
 * depth at EVERY row, including the rows where the centre is white and the
 * alternating depth is 0 by definition. "3738 rows where the patch beat the
 * block" was mostly that. Fixed: compare only at rows where the centre is
 * black, and report a null -- the same sweep on a fair-coin picture -- because
 * a window of 25 cells matching a period-13 ring happens by chance at a rate
 * this sweep can reach.
 *
 * Fault 2: its forcing test (C) fixed cells 0 .. -(L-1) and left everything
 * else unspecified, then measured forcing for at most L rows. The cap was
 * binding: "max forced rows = L" at every L is the cap, not a measurement, and
 * the winner count rising 2,2,...,2,4,8,16,32 from L=11 is the model running
 * out of left cells rather than a second family of shields. Fixed: free cells
 * on BOTH sides of the fixed word, margin E, and measure forcing up to L+E
 * rows so the cap is not binding.
 *
 * What (C) is asking, in the Gilbreath vocabulary: Odlyzko's shield is a
 * finite window of a CLOSED SUB-ALPHABET, and {0,2} is one of several closed
 * sets over there. Rule 30's alphabet is {0,1} with no room for a
 * sub-alphabet, so the analogue is a window of a fixed WORD. (C) enumerates
 * every such word and asks which ones shield.
 */

const T = 20000;
const PMAX = 12;
const LMAX = 10;
const E = 6;            // free margin each side in (C); L-1+E <= 15 keeps the
                        // packed row inside JavaScript's 32-bit bitwise ops
const SAMPLES = 4000;   // random completions in (C)

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0);
  };
}

// ------------------------------------------------- which p-rings are cyclic
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
for (let p = 1; p <= PMAX; p++) {
  const n = 1 << p;
  const nextOf = new Int32Array(n);
  for (let s = 0; s < n; s++) nextOf[s] = ringStep(s, p);
  const mark = new Uint8Array(n), st = new Int32Array(n);
  for (let s = 0; s < n; s++) {
    if (st[s] !== 0) continue;
    const path = []; let x = s;
    while (st[x] === 0) { st[x] = 1; path.push(x); x = nextOf[x]; }
    if (st[x] === 1) { let y = x; do { mark[y] = 1; y = nextOf[y]; } while (y !== x); }
    for (const z of path) st[z] = 2;
  }
  cyclic[p] = mark;
}

// ------------------------------------------------------------------- sweep
// `rows` is a generator of rows; `label` names the source.
function sweep(label, rows, n) {
  let bestAlt = 0, bestAltT = -1;
  let bestTwo = 0, bestTwoT = -1, bestTwoP = -1;
  let blackRows = 0, twoBeat = 0;
  for (let t = 0; t < n; t++) {
    const { row, OFF, reach } = rows(t);
    let alt = 0;
    while (alt <= reach && row[OFF - alt] === (alt % 2 === 0 ? 1 : 0)) alt++;
    const black = row[OFF] === 1;
    if (black && alt > bestAlt) { bestAlt = alt; bestAltT = t; }
    let two = 0, twoP = -1;
    for (let p = 1; p <= PMAX; p++) {
      if (p - 1 > reach) continue;
      let s = 0;
      for (let i = 0; i < p; i++) if (row[OFF + i] === 1) s |= 1 << i;
      if (!cyclic[p][s]) continue;
      let b = p - 1;
      while (b + 1 <= reach && row[OFF + b + 1] === row[OFF + ((b + 1) % p)]) b++;
      let a = 0;
      while (a + 1 <= reach && row[OFF - (a + 1)] === row[OFF + ((p - ((a + 1) % p)) % p)]) a++;
      const sh = Math.min(a, b);
      if (sh > two) { two = sh; twoP = p; }
    }
    if (two > bestTwo) { bestTwo = two; bestTwoT = t; bestTwoP = twoP; }
    if (black) { blackRows++; if (two > alt) twoBeat++; }
  }
  console.log(`${label}: longest one-sided alternating block ${bestAlt} (t=${bestAltT});` +
    ` longest two-sided cyclic-ring patch ${bestTwo} (t=${bestTwoT}, p=${bestTwoP});` +
    ` two-sided beat one-sided at ${twoBeat} of ${blackRows} black rows`);
}

// the seed's picture
{
  const OFF = T + 2, W = 2 * T + 5;
  let row = new Uint8Array(W), next = new Uint8Array(W);
  row[OFF] = 1;
  let cur = 0;
  sweep('seed   ', (t) => {
    while (cur < t) {
      for (let x = 1; x < W - 1; x++) next[x] = row[x - 1] ^ (row[x] | row[x + 1]);
      const tmp = row; row = next; next = tmp; cur++;
    }
    return { row, OFF, reach: Math.min(t, T) };
  }, T + 1);
}

// null: independent fair-coin rows of the same width. The alternating block
// and the periodic patch are both properties of ONE row, so a coin row is the
// right null for "how long a coincidence does this sweep reach".
{
  const OFF = T + 2, W = 2 * T + 5;
  const row = new Uint8Array(W);
  const rng = mulberry32(99991);
  sweep('coin   ', (t) => {
    const reach = Math.min(t, T);
    for (let i = -reach - 1; i <= reach + 1; i++) row[OFF + i] = rng() & 1;
    return { row, OFF, reach };
  }, T + 1);
}

// ---------------------------------------------------------------- (C) forcing
// Cells -(L-1)-E .. (L-1)+E packed into an int. Bit i = cell (i - (L-1) - E).
// The word fixes the L cells -(L-1) .. 0, i.e. bits E .. E+L-1.
// The origin is bit E+L-1 and stays valid for k <= L-1+E steps.
function forcedRows(word, L, samples, rng) {
  const width = 2 * (L - 1 + E) + 1;
  const mask = (1 << width) - 1;
  const org = E + L - 1;
  const maxK = L - 1 + E;
  const wordMask = ((1 << L) - 1) << E;
  const wordBits = (word << E) & wordMask;
  let minDepth = maxK + 1, ref = null;
  for (let s = 0; s < samples; s++) {
    let r = (s === 0 ? 0 : (s === 1 ? mask : (rng() & mask)));
    r = (r & ~wordMask) | wordBits;
    const col = [];
    for (let k = 0; k <= maxK; k++) {
      col.push((r >> org) & 1);
      r = ((r << 1) ^ (r | (r >> 1))) & mask;
    }
    if (ref === null) { ref = col; continue; }
    for (let k = 0; k <= maxK; k++) {
      if (col[k] !== ref[k]) { if (k < minDepth) minDepth = k; break; }
    }
    if (minDepth <= 1) return 1;
  }
  return minDepth;
}

console.log('');
console.log(`(C) which words on cells 0 .. -(L-1) pin the centre column, with ${E} free`);
console.log(`    cells of margin on each side and ${SAMPLES} random completions.`);
console.log('    Words printed with cell 0 LEFTMOST, cell -(L-1) rightmost.');
const asWord = (w, L) => { let s = ''; for (let j = L - 1; j >= 0; j--) s += (w >> j) & 1; return s; };
for (let L = 1; L <= LMAX; L++) {
  const rng = mulberry32(2024 + L);
  let best = 0, winners = [];
  for (let w = 0; w < (1 << L); w++) {
    // bit j of `w` is cell -(L-1-j); build so that bit L-1 is cell 0
    const d = forcedRows(w, L, SAMPLES, rng);
    if (d > best) { best = d; winners = []; }
    if (d === best) winners.push(w);
  }
  console.log(`  L=${String(L).padStart(2)}  max pinned rows = ${best}  by ${winners.length} word(s): ` +
    winners.slice(0, 3).map((w) => asWord(w, L)).join(' ') + (winners.length > 3 ? ' ...' : ''));
}
