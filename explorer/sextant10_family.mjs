// Sextant, 2026-09-12.  Does the backward extension behave for the WHOLE
// family, not just the seed?  And what does the cone condition exclude at
// finite depth?
//
// The family is crystal 40's: configurations white at every x >= 1.  For any
// such X with X(0) = true, R_0 is constant black and R_1 alternates, and
//     R_1(-1) = X(-1) = b_1 XOR b_0 = R_1(1),
// so period 2 already holds at the one negative index R_1 has -- which is the
// base case of the backward induction.  Tested here on
//   * the seed;
//   * random LEFT-FINITE members (a leftmost black cell, so the cone condition
//     holds from some k on);
//   * members with a periodic left tail, including the flat tower, where it
//     must fail infinitely often.
//
// Then: the finite-exclusion table.  Since the conditions determine b, a
// p-periodic centre column survives the conditions up to level K exactly when
// centerColumn(0..K) is p-periodic, so the depth at which the cone condition
// kills period p is computable in one line.

function mkPicture(leftWord, T) {
  // leftWord[i] is the cell at position -(leftWord.length-1-i) ... 0 ; white right
  const m = leftWord.length - 1;                 // support is [-m, 0]
  const W = 2 * (T + m) + 3;
  const OFF = T + m + 1;                         // array index of position 0
  const rowsX = [];
  let cur = new Uint8Array(W);
  for (let i = 0; i <= m; i++) cur[OFF - (m - i)] = leftWord[i];
  rowsX.push(cur);
  for (let t = 1; t <= T; t++) {
    const p = rowsX[t - 1], n = new Uint8Array(W);
    for (let i = 0; i < W; i++) {
      const l = i - 1 >= 0 ? p[i - 1] : 0, r = i + 1 < W ? p[i + 1] : 0;
      n[i] = l ^ (p[i] | r);
    }
    rowsX.push(n);
  }
  return (t, x) => (t < 0 || t > T || x + OFF < 0 || x + OFF >= W) ? null : rowsX[t][x + OFF];
}

// a picture whose left tail is periodic, given as a period word read leftward
function mkPeriodicLeft(period, T, M) {
  const W = 2 * M + 1, OFF = M;
  const at = (x) => x > 0 ? 0 : period[((-x) % period.length)];
  let cur = new Uint8Array(W);
  for (let x = -M; x <= M; x++) cur[x + OFF] = at(x);
  const rowsX = [cur];
  for (let t = 1; t <= T; t++) {
    const p = rowsX[t - 1], n = new Uint8Array(W);
    for (let i = 0; i < W; i++) {
      // the left neighbour of the stored window continues the period
      const l = i - 1 >= 0 ? p[i - 1] : at(-M - 1 + t);
      const r = i + 1 < W ? p[i + 1] : 0;
      n[i] = l ^ (p[i] | r);
    }
    rowsX.push(n);
  }
  return (t, x) => (t < 0 || t > T || x + OFF < 0 || x + OFF >= W) ? null : rowsX[t][x + OFF];
}

function buildTower(L, KMAX, freeBit, visit) {
  let prev2 = new Uint8Array(L), prev1 = new Uint8Array(L), spare = new Uint8Array(L);
  for (let k = 0; k <= KMAX; k++) {
    let cur = spare;
    if (k === 0) cur.fill(freeBit(0));
    else if (k === 1) {
      const a = freeBit(1), b = freeBit(1) ^ freeBit(0);
      for (let j = 0; j < L; j++) cur[j] = (j % 2 === 0) ? a : b;
    } else {
      cur[0] = freeBit(k);
      for (let i = 0; i + 2 < L; i++) cur[i + 1] = cur[i] ^ (prev1[i + 1] | prev2[i + 2]);
      cur[L - 1] = 0;
    }
    visit(k, cur);
    spare = prev2; prev2 = prev1; prev1 = cur;
  }
}

// ------------------------------------------------------- the sweep

const KMAX = 20;
const L = (1 << KMAX) + 8 * KMAX + 16;

function sweep(name, cellX, expectCone) {
  const c = (k) => cellX(k, 0);
  let towerBad = 0, backBad = 0, tested = 0;
  const cone = [];
  buildTower(L, KMAX, c, (k, cur) => {
    for (let j = 0; j <= 200; j++) { const v = cellX(j + k, j); if (v !== null && v !== cur[j]) towerBad++; }
    for (let i = 1; i <= k; i++) {
      const lhs = cellX(k - i, -i);
      tested++;
      if (lhs === null || lhs !== cur[(1 << k) - i]) backBad++;
    }
    if (k >= 1) cone.push(cur[(1 << k) - k]);
  });
  const firstFail = cone.indexOf(1);
  const nFail = cone.reduce((a, v) => a + v, 0);
  console.log(`  ${name.padEnd(34)} tower-vs-picture ${towerBad}, backward-periodicity ${backBad}/${tested}, ` +
    `cone violations ${nFail}/${KMAX}${firstFail >= 0 ? ` first at k=${firstFail + 1}` : ''} ` +
    `${(nFail === 0) === expectCone ? '' : ' <-- UNEXPECTED'}`);
  return cone;
}

console.log(`backward periodicity R_k(-i) = R_k(2^k - i) and the cone condition, k <= ${KMAX}:`);

// the seed
sweep('the seed (1 at the origin)', mkPicture([1], 4000), true);

// random left-finite members: white at x >= 1, X(0) = 1, random on [-m, -1]
{
  let s = 0x12345677;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };
  for (let trial = 0; trial < 4; trial++) {
    const m = 6 + trial * 5;
    const w = new Uint8Array(m + 1);
    w[m] = 1;                                     // X(0) = 1
    for (let i = 0; i < m; i++) w[i] = rnd() & 1;
    w[0] = 1;                                     // leftmost black cell at -m
    sweep(`finite, leftmost black at -${m}`, mkPicture(Array.from(w), 4000), false);
  }
}

// periodic left tails: the cone condition must fail infinitely often
sweep('flat tower  ...10101|000', mkPeriodicLeft([1, 0], 4000, 9000), false);
sweep('left tail (100)^inf', mkPeriodicLeft([1, 0, 0], 4000, 9000), false);
sweep('left tail (11010)^inf', mkPeriodicLeft([1, 1, 0, 1, 0], 4000, 9000), false);

console.log(`\n  (a left-finite member violates the cone condition only at k <= its own`);
console.log(`   leftmost black cell, and satisfies it for every larger k -- "eventually")`);

// ------------------------------------------------------- finite exclusions

{
  const T = 300000;
  // centre column by the packed-row engine
  let r = 1n, cc = [];
  for (let t = 0; t <= T; t++) { cc.push(Number((r >> BigInt(t)) & 1n)); r = (r << 2n) ^ ((r << 1n) | r); }
  console.log(`\nfinite exclusions in tower vocabulary: the least K such that the cone`);
  console.log(`conditions at levels 1..K admit no centre column of period p from 0:`);
  const out = [];
  for (let p = 1; p <= 40; p++) {
    let K = -1;
    for (let t = p; t <= T; t++) if (cc[t] !== cc[t - p]) { K = t; break; }
    out.push(`p=${p}:${K}`);
  }
  console.log('  ' + out.join('  '));
  // the real statistic is the OVERSHOOT K(p) - p, not K(p) itself: K(p) grows
  // with p for trivial reasons.  My first version of this line reported the
  // largest K and so reported the largest p.
  let worst = 0, wp = 0, sum = 0;
  const P = 4096;
  for (let p = 1; p <= P; p++) {
    let K = -1;
    for (let t = p; t <= T; t++) if (cc[t] !== cc[t - p]) { K = t; break; }
    const over = K - p;
    sum += over;
    if (over > worst) { worst = over; wp = p; }
  }
  console.log(`  overshoot K(p) - p over p <= ${P}: mean ${(sum / P).toFixed(3)}, max ${worst} at p = ${wp}`);
  // P(overshoot = j) = 2^-(j+1) for a coin, so the mean is 1 and not 2; I
  // wrote 2 here first and the measurement 0.995 looked like a deviation.
  console.log(`  a coin's overshoot has P(j) = 2^-(j+1): mean 1, max over ${P} draws about 12`);
}
