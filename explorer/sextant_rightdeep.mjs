/**
 * Sextant (theorist, 2026-09-08): the right-diagonal period tower, deeper.
 *
 *   node explorer/sextant_rightdeep.mjs
 *
 * Same window as explorer/sextant_rightperiods.mjs (A(t) = the rightmost 128
 * cells of row t indexed by depth; A(t+1) = A ^ ((A<<1)|(A<<2))), but with no
 * storage at all: to test the lag p, two windows are run in lockstep p rows
 * apart and the XOR of the two states is accumulated. Bit k of the
 * accumulator stays clear exactly while p is a period of R_k. So memory is
 * four machine words and the depth reach is set by time alone.
 *
 * Phase 1 predicts the periods from the criterion under test, using the
 * telescoped form of the parity: the weight of g_k over [0, L) is odd iff
 * R_k(L) != R_k(0), because R_k is the running XOR of g_k. Both cells are
 * single bits of the window, at rows k and k + L.
 *
 * Phase 2 measures the minimal period independently, by the lag masks, and
 * compares. For lag 2^a it runs 8 * 2^a rows: a depth whose minimal period is
 * 2^a is then covered by eight full periods, and a depth with a longer period
 * has to produce a witness inside that window, whose index is reported (a
 * late witness would mean the run is too short to see the truth).
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const W = 128;                 // depths 0..127, four 32-bit lanes
const AMAX = 27;               // lags 2^0 .. 2^27
const SPAN = 8;                // rows per lag = SPAN * lag
const t0 = Date.now();

// ------------------------------------------------------------ window machinery
const mkState = () => new Uint32Array(4);
const step = (s) => {
  const a0 = s[0], a1 = s[1], a2 = s[2], a3 = s[3];
  const p0 = ((a0 << 1) | (a0 << 2)) >>> 0;
  const p1 = ((a1 << 1) | (a0 >>> 31) | (a1 << 2) | (a0 >>> 30)) >>> 0;
  const p2 = ((a2 << 1) | (a1 >>> 31) | (a2 << 2) | (a1 >>> 30)) >>> 0;
  const p3 = ((a3 << 1) | (a2 >>> 31) | (a3 << 2) | (a2 >>> 30)) >>> 0;
  s[0] = (a0 ^ p0) >>> 0; s[1] = (a1 ^ p1) >>> 0;
  s[2] = (a2 ^ p2) >>> 0; s[3] = (a3 ^ p3) >>> 0;
};
const bit = (s, d) => (s[d >>> 5] >>> (d & 31)) & 1;
const start = () => { const s = mkState(); s[0] = 1; return s; };

// --------------------------------------------- phase 1: the predicted periods
// P[k] predicted from the criterion; base[k] = R_k(0) = centre column at k.
const Ppred = new Array(W).fill(0);
const base = new Array(W).fill(-1);
const second = new Array(W).fill(-1);
const Lof = new Array(W).fill(0);
{
  const s = start();
  let t = 0;
  let kBase = 0;                 // next depth whose R_k(0) we still need (row k)
  let kSec = 2;                  // next depth whose R_k(L) we still need
  Ppred[0] = 1; Ppred[1] = 2;    // R_0 = all black, R_1 alternates (on the board)
  let targetRow = -1;
  const advanceTarget = () => {
    while (kSec < W) {
      if (Ppred[kSec - 1] && Ppred[kSec - 2]) {
        Lof[kSec] = Math.max(Ppred[kSec - 1], Ppred[kSec - 2]);
        targetRow = kSec + Lof[kSec];
        return;
      }
      return;                     // cannot know yet
    }
    targetRow = -1;
  };
  advanceTarget();
  const TMAX = SPAN * (1 << AMAX);
  for (t = 0; t < TMAX; t++) {
    if (kBase < W && t === kBase) { base[kBase] = bit(s, kBase); kBase++; }
    while (targetRow === t && kSec < W) {
      second[kSec] = bit(s, kSec);
      if (base[kSec] < 0) throw new Error(`base ${kSec} unknown at row ${t}`);
      const odd = base[kSec] ^ second[kSec];
      Ppred[kSec] = odd ? 2 * Lof[kSec] : Lof[kSec];
      kSec++;
      if (kSec < W && Ppred[kSec - 1] && Ppred[kSec - 2]) {
        Lof[kSec] = Math.max(Ppred[kSec - 1], Ppred[kSec - 2]);
        targetRow = kSec + Lof[kSec];
      } else targetRow = -1;
    }
    if (kSec >= W) break;
    step(s);
  }
  console.log(`phase 1: predicted periods for ${kSec} depths (${Date.now() - t0} ms)`);
}

// ------------------------------------------- phase 2: measured minimal periods
// failAt[a] = mask of depths for which lag 2^a is not a period; first[a][k] =
// index of the first witness.
const KDONE = Ppred.findIndex((p) => !p) < 0 ? W : Ppred.findIndex((p) => !p);
const measured = new Array(W).fill(0);
const firstWitness = Array.from({ length: AMAX + 1 }, () => new Array(W).fill(-1));
for (let a = 0; a <= AMAX; a++) {
  const p = 2 ** a;
  // + W so that even the deepest depth, whose diagonal index is j = t - k, is
  // read over SPAN full periods; without it a short pass sees deep depths
  // still outside the cone, all white, and calls every lag a period.
  const rows = SPAN * p + W;
  const x = start(), y = start();
  for (let i = 0; i < p; i++) step(y);          // y is p rows ahead of x
  const acc = mkState();
  let t = 0;
  for (; t < rows; t++) {
    // depth k is only on the diagonal from row t = k on (j = t - k >= 0), so
    // for t < W keep only the bits at or below t; a cell at j < 0 is a cell of
    // the left half of the picture and is not part of rightDiagonal k.
    let m0 = 0xffffffff, m1 = 0xffffffff, m2 = 0xffffffff, m3 = 0xffffffff;
    if (t < W) {
      const full = t >>> 5, rest = t & 31;
      const part = rest === 31 ? 0xffffffff : ((1 << (rest + 1)) - 1) >>> 0;
      m0 = full > 0 ? 0xffffffff : part;
      m1 = full > 1 ? 0xffffffff : full === 1 ? part : 0;
      m2 = full > 2 ? 0xffffffff : full === 2 ? part : 0;
      m3 = full === 3 ? part : 0;
    }
    const d0 = ((x[0] ^ y[0]) & m0) >>> 0, d1 = ((x[1] ^ y[1]) & m1) >>> 0;
    const d2 = ((x[2] ^ y[2]) & m2) >>> 0, d3 = ((x[3] ^ y[3]) & m3) >>> 0;
    const n0 = (acc[0] | d0) >>> 0, n1 = (acc[1] | d1) >>> 0;
    const n2 = (acc[2] | d2) >>> 0, n3 = (acc[3] | d3) >>> 0;
    if (n0 !== acc[0] || n1 !== acc[1] || n2 !== acc[2] || n3 !== acc[3]) {
      for (let k = 0; k < W; k++) {
        if (firstWitness[a][k] < 0 && bit([n0, n1, n2, n3], k) && !bit(acc, k)) firstWitness[a][k] = t;
      }
      acc[0] = n0; acc[1] = n1; acc[2] = n2; acc[3] = n3;
    }
    step(x); step(y);
  }
  for (let k = 0; k < W; k++) if (!measured[k] && !bit(acc, k)) measured[k] = p;
  process.stdout.write(`  lag 2^${a}: ${rows} rows, ${Date.now() - t0} ms\n`);
}

// ------------------------------------------------------------------- report
const shown = [];
let bad = 0, drop = 0, deepest = 0;
for (let k = 0; k < W; k++) {
  if (!Ppred[k] || !measured[k]) continue;
  if (measured[k] * SPAN > SPAN * 2 ** AMAX) continue;
  deepest = k;
  const ok = measured[k] === Ppred[k];
  if (!ok) bad++;
  if (k >= 2 && Lof[k] && measured[k] < Lof[k]) drop++;
  shown.push(`${k}:${measured[k]}${ok ? '' : ' PRED ' + Ppred[k]}`);
}
console.log(`measured minimal periods, k = 0..${deepest}:`);
console.log(`   ${shown.join(' ')}`);
console.log(`criterion failures: ${bad}; period collapses (P_k < L): ${drop}`);
// which depths the document's C1 (a doubling) and C4 (the depth after one)
// settle, and which are left open (the interior of a plateau)
{
  const isDoubling = (k) => k >= 1 && measured[k] && measured[k - 1] && measured[k] > measured[k - 1];
  let nDouble = 0, nAfter = 0, nBoth = 0, open = [];
  for (let k = 2; k <= deepest; k++) {
    const d = isDoubling(k), a = isDoubling(k - 1);
    if (d) nDouble++;
    if (a) nAfter++;
    if (d && a) nBoth++;
    if (!d && !a) open.push(k);
  }
  console.log(`depths 2..${deepest}: ${nDouble} doublings (C1), ${nAfter} after a doubling (C4), ${nBoth} both;`);
  console.log(`  settled by C1 or C4: ${nDouble + nAfter - nBoth} of ${deepest - 1}; open (plateau interiors): ${open.length}`);
  console.log(`  open depths: ${open.join(', ')}`);
}
// how late the witnesses are: a witness near the end of a run means the run is
// too short to be trusted for that depth.
{
  const late = [];
  for (let k = 0; k <= deepest; k++) {
    for (let a = 0; a <= AMAX; a++) {
      const w = firstWitness[a][k];
      if (w >= 0 && w > 2 ** a) late.push(`${k}@2^${a}:${w}`);
    }
  }
  console.log(`witnesses later than one lag (a run this long only just sees them): ${late.length ? late.join(' ') : 'none'}`);
}
console.log(`(${Date.now() - t0} ms)`);
