/**
 * Sextant (theorist, 2026-09-08): are the right-diagonal minimal periods
 * unbounded, and what property of the seed forces it?
 *
 *   node explorer/sextant_rightunbounded.mjs
 *
 * The claim under test. A common period p of *every* right diagonal is the
 * same thing as
 *
 *     evolve (t + p) p = evolve t 0            for every t,
 *
 * because rightDiagonal k p = evolve (p + k) p and rightDiagonal k 0 =
 * evolve k 0 = centerColumn k. In the picture: column p, read from row p
 * downward, would be the centre column read from row 0 downward. So
 * "the periods are bounded" is "the centre column reappears, undelayed along
 * a diagonal, as some other column".
 *
 * Test A is the falsification of that: for every p, find the first t where it
 * fails, and compare with m(p), the distance from the right edge of row p to
 * the next black cell going left. The argument in the document predicts
 * tau(p) <= m(p), and predicts more: the diagonal m(p) itself is not
 * p-periodic.
 *
 * Test B reads the minimal periods P_k off the picture and checks the
 * corollary P_{m(2^a)} > 2^a, which is the quantitative form of
 * unboundedness.
 *
 * Test C is the control. The argument must NOT work for a configuration whose
 * right diagonals really are bounded, and the alternating fixed point (01)^Z
 * is one: every one of its right diagonals has period 2. Test C checks that
 * its hypothesis "column p delayed = column 0" holds there, so the weight of
 * the argument is carried by the OTHER hypothesis, the white cone.
 *
 * Test D re-derives everything for the first 400 rows from a per-cell engine
 * driven by the rule *number*, with no depth coordinates at all, because a
 * coordinate convention that is wrong in the same way on both sides of a
 * comparison reports zero disagreements.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const t0 = Date.now();

// ---------------------------------------------------------------------------
// The picture, indexed by depth from the right edge.
//
// bit d of row t is the cell (t, t - d): d = 0 is the right edge, d = t is the
// centre column. In these coordinates one rule 30 step is
//     new = old ^ ((old << 1) | (old << 2))
// and the right diagonal k is simply bit k, read down the rows.
// ---------------------------------------------------------------------------

const WORDS = 16;            // 512 bits of depth
const WBITS = WORDS * 32;
const NROW = (1 << 20) + WBITS + 4;

const pic = new Uint32Array(NROW * WORDS);

{
  const cur = new Uint32Array(WORDS);
  const s1 = new Uint32Array(WORDS);
  const s2 = new Uint32Array(WORDS);
  cur[0] = 1;
  for (let t = 0; t < NROW; t++) {
    const base = t * WORDS;
    for (let w = 0; w < WORDS; w++) pic[base + w] = cur[w];
    // s1 = cur << 1, s2 = cur << 2
    for (let w = WORDS - 1; w >= 0; w--) {
      s1[w] = ((cur[w] << 1) | (w > 0 ? cur[w - 1] >>> 31 : 0)) >>> 0;
      s2[w] = ((cur[w] << 2) | (w > 0 ? cur[w - 1] >>> 30 : 0)) >>> 0;
    }
    for (let w = 0; w < WORDS; w++) cur[w] = (cur[w] ^ (s1[w] | s2[w])) >>> 0;
  }
}

/** cell (t, t - d), for 0 <= d < WBITS. */
const bit = (t, d) => (pic[t * WORDS + (d >>> 5)] >>> (d & 31)) & 1;
/** rightDiagonal k j = evolve (j + k) j. */
const R = (k, j) => bit(j + k, k);
/** centerColumn t = evolve t 0. */
const cc = (t) => bit(t, t);

console.log(`picture: ${NROW} rows x ${WBITS} depths  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);

// ---------------------------------------------------------------------------
// Test A. The centre column is never a delayed copy of column p.
// ---------------------------------------------------------------------------

const P = 1 << 20;

/** first t with evolve (t+p) p != evolve t 0, or -1 if none below WBITS. */
function tau(p) {
  for (let t = 0; t < WBITS; t++) if (bit(t + p, t) !== bit(t, t)) return t;
  return -1;
}

/** least d >= 1 with cell (p, p - d) black: the second-rightmost black of row p. */
function secondBlack(p) {
  for (let d = 1; d < WBITS; d++) if (bit(p, d)) return d;
  return -1;
}

{
  let maxTau = -1, argMaxTau = -1, maxM = -1, argMaxM = -1;
  let bad = 0, tauGtM = 0, tauEqM = 0, missing = 0;
  const hist = new Map();
  for (let p = 1; p <= P; p++) {
    const t = tau(p);
    if (t < 0) { missing++; continue; }
    const m = secondBlack(p);
    if (m < 0) { bad++; continue; }
    if (t > m) tauGtM++;
    if (t === m) tauEqM++;
    // the sharper prediction: diagonal m(p) itself is not p-periodic
    if (R(m, p) === R(m, 0)) bad++;
    if (t > maxTau) { maxTau = t; argMaxTau = p; }
    if (m > maxM) { maxM = m; argMaxM = p; }
    hist.set(t, (hist.get(t) ?? 0) + 1);
  }
  console.log('\n=== A. no p is a period of every right diagonal ===');
  console.log(`p = 1..${P}: every p has a failing t (missing: ${missing})`);
  console.log(`max tau(p) = ${maxTau} at p = ${argMaxTau};  max m(p) = ${maxM} at p = ${argMaxM}`);
  console.log(`tau(p) > m(p): ${tauGtM} times;  tau(p) = m(p): ${tauEqM} times`);
  console.log(`predicted failures at diagonal m(p) that did not happen: ${bad}`);
  const top = [...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('most common tau: ' + top.map(([k, v]) => `${k}:${v}`).join(' '));
  console.log('tau(p) for p = 1..24: ' + Array.from({ length: 24 }, (_, i) => tau(i + 1)).join(','));
  console.log('m(p)   for p = 1..24: ' + Array.from({ length: 24 }, (_, i) => secondBlack(i + 1)).join(','));
  const pw = [];
  for (let a = 1; a <= 20; a++) pw.push(`2^${a}:tau=${tau(1 << a)},m=${secondBlack(1 << a)}`);
  console.log('powers of two: ' + pw.join(' '));
}

// ---------------------------------------------------------------------------
// Test B. The minimal periods, and the quantitative corollary.
// ---------------------------------------------------------------------------

const KMAX = 40;
const period = new Array(KMAX + 1).fill(0);
{
  // minimal period of j -> R(k, j) is a power of two dividing 2^k; test lags
  // 2^a over a stretch of SPAN terms.
  const SPAN = 1 << 20;
  for (let k = 0; k <= KMAX; k++) {
    let p = 0;
    for (let a = 0; a <= k; a++) {
      const lag = 2 ** a;
      if (lag > SPAN / 2) { p = -1; break; }
      let ok = true;
      for (let j = 0; j + lag < SPAN; j++) {
        if (R(k, j) !== R(k, j + lag)) { ok = false; break; }
      }
      if (ok) { p = lag; break; }
    }
    period[k] = p;
  }
  console.log('\n=== B. minimal periods of the right diagonals ===');
  console.log('P_k, k = 0..' + KMAX + ': ' + period.join(','));
  const doublings = [];
  for (let k = 1; k <= KMAX; k++) if (period[k] > period[k - 1]) doublings.push(k);
  console.log('doubling depths: ' + doublings.join(','));
  console.log('\ncorollary  P_{m(2^a)} > 2^a  (a, m, P_m, 2^a, ok):');
  for (let a = 1; a <= 20; a++) {
    const m = secondBlack(1 << a);
    const pm = m <= KMAX ? period[m] : null;
    const ok = pm === null ? '(P_m not measured)' : (pm > 2 ** a ? 'ok' : 'FAIL');
    console.log(`  a=${a}  m=${m}  P_m=${pm}  2^a=${2 ** a}  ${ok}`);
  }
}

// ---------------------------------------------------------------------------
// Test C. Controls: pictures whose right diagonals ARE bounded.
// ---------------------------------------------------------------------------

{
  console.log('\n=== C. controls ===');
  // C1. the alternating fixed point (01)^Z: X(x) = [x even], rule 30 fixes it.
  const cellAlt = (t, x) => (((x % 2) + 2) % 2 === 0 ? 1 : 0);
  // check it really is a fixed point of rule 30, cell by cell over a window
  let fixFail = 0;
  for (let x = -50; x <= 50; x++) {
    const nxt = cellAlt(0, x - 1) ^ (cellAlt(0, x) | cellAlt(0, x + 1));
    if (nxt !== cellAlt(1, x)) fixFail++;
  }
  // all right diagonals period 2, and hcol holds for every even p
  let diagFail = 0, hcolFail = 0;
  for (let k = 0; k <= 60; k++) for (let j = 0; j < 200; j++)
    if (cellAlt(j + k, j) !== cellAlt(j + 2 + k, j + 2)) diagFail++;
  for (const p of [2, 4, 8, 16, 1024]) for (let t = 0; t < 500; t++)
    if (cellAlt(t + p, p) !== cellAlt(t, 0)) hcolFail++;
  console.log(`(01)^Z: fixed-point failures ${fixFail}, period-2 diagonal failures ${diagFail}, ` +
    `"column p delayed = column 0" failures ${hcolFail} (p in 2,4,8,16,1024)`);
  console.log(`  its row 0 right of the origin: ${[1, 2, 3, 4, 5].map((x) => cellAlt(0, x)).join('')}` +
    ' — not white, which is the hypothesis the seed has and this does not.');

  // C2. white on x >= 1, black at 0, but no leftmost black cell: alternating
  // tail to the left. Does tau still exist? (The argument does NOT cover this.)
  const runConfig = (leftOf, T, W) => {
    // cells indexed 0..W-1 with the origin at OFF; leftOf(j) gives X(-j) for j>=1
    const OFF = W - T - 4;
    let a = new Uint8Array(W), b = new Uint8Array(W);
    a[OFF] = 1;
    for (let j = 1; j <= OFF; j++) a[OFF - j] = leftOf(j);
    const rows = [];
    for (let t = 0; t < T; t++) {
      rows.push(a.slice());
      for (let i = 1; i < W - 1; i++) b[i] = a[i - 1] ^ (a[i] | a[i + 1]);
      const tmp = a; a = b; b = tmp;
    }
    return { rows, OFF };
  };
  const tauOf = ({ rows, OFF }, p, T) => {
    for (let t = 0; t + p < T; t++) {
      if (rows[t + p][OFF + p] !== rows[t][OFF]) return t;
    }
    return -1;
  };
  const T = 900, W = 2600;
  const cases = [
    ['single seed', () => 0],
    ['alternating tail (no leftmost black)', (j) => (j % 2 === 0 ? 1 : 0)],
    ['all black to the left', () => 1],
    ['sparse tail 1 in 7', (j) => (j % 7 === 0 ? 1 : 0)],
    ['finite: black at 0 and -5', (j) => (j === 5 ? 1 : 0)],
    ['finite: block -9..0', (j) => (j <= 9 ? 1 : 0)],
  ];
  for (const [name, f] of cases) {
    const pic2 = runConfig(f, T, W);
    let worst = -1, argp = -1, none = 0;
    for (let p = 1; p <= 200; p++) {
      const t = tauOf(pic2, p, T);
      if (t < 0) { none++; continue; }
      if (t > worst) { worst = t; argp = p; }
    }
    console.log(`  ${name}: p=1..200, max tau = ${worst} (at p=${argp}), p with no failure below row ${T}: ${none}`);
  }
}

// ---------------------------------------------------------------------------
// Test D. Coordinate control: a per-cell engine driven by the rule number.
// ---------------------------------------------------------------------------

{
  const T = 400, W = 2 * T + 9, OFF = T + 4;
  const table = new Uint8Array(8);
  for (let i = 0; i < 8; i++) table[i] = (30 >> i) & 1;
  let a = new Uint8Array(W), b = new Uint8Array(W);
  a[OFF] = 1;
  const rows = [];
  for (let t = 0; t < T; t++) {
    rows.push(a.slice());
    for (let i = 1; i < W - 1; i++) b[i] = table[(a[i - 1] << 2) | (a[i] << 1) | a[i + 1]];
    const tmp = a; a = b; b = tmp;
  }
  const naive = (t, x) => rows[t][OFF + x];
  let cellFail = 0, tauFail = 0, mFail = 0;
  for (let t = 0; t < T; t++) for (let d = 0; d <= t && d < WBITS; d++)
    if (naive(t, t - d) !== bit(t, d)) cellFail++;
  for (let p = 1; p <= 150; p++) {
    let t = -1;
    for (let s = 0; s + p < T; s++) if (naive(s + p, p) !== naive(s, 0)) { t = s; break; }
    if (t !== tau(p)) tauFail++;
    let m = -1;
    for (let d = 1; d <= p; d++) if (naive(p, p - d)) { m = d; break; }
    if (m !== secondBlack(p)) mFail++;
  }
  console.log('\n=== D. coordinate control (per-cell engine, rule number 30) ===');
  console.log(`cell disagreements over ${T} rows: ${cellFail}; tau disagreements: ${tauFail}; m disagreements: ${mFail}`);
}

console.log(`\ndone in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
