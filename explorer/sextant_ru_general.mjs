/**
 * Sextant (theorist, 2026-09-08): which property of the seed forces the
 * right-diagonal periods to be unbounded?
 *
 *   node explorer/sextant_ru_general.mjs
 *
 * The argument in the attack document uses exactly two things about the seed:
 *
 *   (R) row 0 is white at every x >= 1 and black at 0, so the row at time p,
 *       slid left by p, agrees with row 0 on every x >= 0;
 *   (L) row 0 has a LEFTMOST black cell, so the slid row does not agree with
 *       row 0 everywhere — its leftmost black cell has moved 2p further left.
 *
 * (R) alone is not enough, and this script is the witness. For a
 * configuration with (R) but not (L) — white on x >= 1, black at 0,
 * alternating forever to the left — the whole conclusion fails: its right
 * diagonals have bounded minimal periods, and the identity
 * `cell(t+p, p) = cell(t, 0)` that the argument contradicts holds for every
 * even p, for as many rows as one cares to compute.
 *
 * Test 1: right-diagonal minimal periods of five configurations, all with (R).
 * Test 2: the identity `cell(t+p,p) = cell(t,0)` for each of them.
 * Test 3: the general theorem — for 200 random FINITE configurations, is
 *   tau(p) = m(p) at every p, as the argument says it must be?
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const t0 = Date.now();

/** Grow a configuration white on x >= 1, black at 0, with the given left tail. */
function grow(leftTail, T, LEFT) {
  // index i holds cell x = i - OFF; the array is wide enough that the left
  // boundary never influences the region reported on.
  const OFF = LEFT + 4;
  const W = OFF + T + 8;
  let a = new Uint8Array(W), b = new Uint8Array(W);
  a[OFF] = 1;
  for (let j = 1; j <= LEFT; j++) a[OFF - j] = leftTail(j);
  const rows = [];
  for (let t = 0; t < T; t++) {
    rows.push(a.slice());
    for (let i = 1; i < W - 1; i++) b[i] = a[i - 1] ^ (a[i] | a[i + 1]);
    const tmp = a; a = b; b = tmp;
  }
  // a cell is trustworthy at (t, x) only if the left boundary at -LEFT-4 has
  // not reached it: it has travelled t cells right by time t.
  return { rows, OFF, T, LEFT, cell: (t, x) => rows[t][OFF + x] };
}

/** minimal period of right diagonal k, tested over `span` terms; -1 if > cap. */
function diagPeriod(pic, k, span, cap) {
  for (let lag = 1; lag <= cap; lag *= 2) {
    let ok = true;
    for (let j = 0; j + lag + k < pic.T && j < span; j++) {
      if (pic.cell(j + k, j) !== pic.cell(j + lag + k, j + lag)) { ok = false; break; }
    }
    if (ok) return lag;
  }
  return -1;
}

const cases = [
  ['single seed (finite)', () => 0],
  ['alternating tail (10)^inf', (j) => (j % 2 === 0 ? 1 : 0)],
  ['all-black tail', () => 1],
  ['period-3 tail 100', (j) => (j % 3 === 0 ? 1 : 0)],
  ['finite: block -9..0', (j) => (j <= 9 ? 1 : 0)],
];

const T = 4000, LEFT = 6000;
console.log('=== 1. right-diagonal minimal periods, five configurations white on x >= 1 ===');
for (const [name, f] of cases) {
  const pic = grow(f, T, LEFT);
  const per = [];
  for (let k = 0; k <= 24; k++) per.push(diagPeriod(pic, k, 1500, 4096));
  console.log(`  ${name}\n    P_k, k=0..24: ${per.join(',')}`);
}

console.log('\n=== 2. does the centre column reappear as a delayed column? ===');
console.log('   (tau(p) = first t with cell(t+p, p) != cell(t, 0); "-" = none below the depth run)');
for (const [name, f] of cases) {
  const pic = grow(f, T, LEFT);
  const out = [];
  let none = 0, worst = -1;
  for (let p = 1; p <= 64; p++) {
    let t = -1;
    for (let s = 0; s + p < T; s++) if (pic.cell(s + p, p) !== pic.cell(s, 0)) { t = s; break; }
    if (t < 0) none++; else if (t > worst) worst = t;
    if (p <= 16) out.push(t < 0 ? '-' : String(t));
  }
  // Delta(p): least d >= 1 with cell(p, p-d) != X(-d)
  const del = [];
  for (let p = 1; p <= 16; p++) {
    let d = 1;
    for (; d <= 3 * p + 40; d++) if (pic.cell(p, p - d) !== f(d)) break;
    del.push(d > 3 * p + 40 ? '-' : String(d));
  }
  console.log(`  ${name}: tau(1..16) = ${out.join(',')};  p<=64 with NO failure in ${T} rows: ${none}; max tau ${worst}`);
  console.log(`  ${' '.repeat(name.length)}  Delta(1..16) = ${del.join(',')}`);
}

// ---------------------------------------------------------------------------
// 3. The general claim: for any configuration white on x >= 1 with a black
//    cell at 0 and a leftmost black cell, tau(p) = m(p) for every p, where
//    m(p) is the distance from the right edge of row p to the next black cell.
// ---------------------------------------------------------------------------

// The right object for a general configuration is not "the first black cell of
// row p" but "the first place where row p, slid left by p, disagrees with row
// 0" — Rowland's agreement functional Delta_R(t). For the single seed, which
// is white at every x <= -1, the two coincide.
console.log('\n=== 3. tau(p) = Delta(p) for random finite configurations ===');
{
  let rng = 2463534242 >>> 0;
  const rnd = () => {
    rng ^= rng << 13; rng >>>= 0; rng ^= rng >>> 17; rng ^= rng << 5; rng >>>= 0;
    return rng;
  };
  const T2 = 600, PMAX = 120;
  let tested = 0, mismatch = 0, noTau = 0, noM = 0;
  const bad = [];
  for (let trial = 0; trial < 200; trial++) {
    const len = 1 + (rnd() % 30);
    const bits = [];
    for (let j = 1; j <= len; j++) bits.push(j === len ? 1 : rnd() & 1);
    const pic = grow((j) => (j <= len ? bits[j - 1] : 0), T2, 900);
    for (let p = 1; p <= PMAX; p++) {
      // Delta(p): least d >= 1 with cell(p, p-d) != X(-d)
      let m = -1;
      for (let d = 1; d <= 2 * p + len + 4; d++) {
        const x0 = d <= len ? bits[d - 1] : 0;
        if (pic.cell(p, p - d) !== x0) { m = d; break; }
      }
      let tau = -1;
      for (let s = 0; s + p < T2; s++) if (pic.cell(s + p, p) !== pic.cell(s, 0)) { tau = s; break; }
      tested++;
      if (m < 0) { noM++; continue; }
      if (tau < 0) { noTau++; continue; }
      if (tau !== m) { mismatch++; if (bad.length < 5) bad.push({ trial, p, tau, m, bits: bits.join('') }); }
    }
  }
  console.log(`  200 random finite configurations x p=1..${PMAX}: ${tested} pairs`);
  console.log(`  tau != m: ${mismatch};  no tau found: ${noTau};  no m found: ${noM}`);
  if (bad.length) console.log('  ' + JSON.stringify(bad));
}

console.log(`\ndone in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
