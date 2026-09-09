/**
 * Rosetta / connect: the linear neighbours of rule 30.
 *
 * The vantage is algebraic and expansive subdynamics of Z^2 actions. The
 * founding example of that field, Ledrappier's "three dot" system, is the
 * space-time diagram of an ELEMENTARY CA: the set of x in F_2^(Z^2) with
 * x(t+1,i) = x(t,i) + x(t,i+1) is exactly the space-time subshift of rule 102.
 * Rule 30 is `left XOR (center OR right)`, and `a OR b = a + b + ab`, so
 *
 *     rule 30 = rule 150 + (center AND right),
 *
 * i.e. rule 30's space-time subshift is a Ledrappier-type Z^2 SFT with ONE
 * quadratic term added. Everything Kitchens-Schmidt/Ledrappier theory needs is
 * the group structure that the quadratic term destroys.
 *
 * So the question this script answers is: in the linear world where the whole
 * toolkit applies, is the residual TRUE? The residual is
 *
 *     "if the centre column is eventually periodic, some other column is."
 *
 * Sections:
 *   A  agreement of the BigInt engine with a naive per-cell run (all rules)
 *   B  for rules 30, 60, 90, 102, 150: which columns |x| <= XMAX are
 *      eventually periodic, searching periods p <= PMAX on the tail
 *   C  rule 90 in closed form (Kummer): the 1-positions of each column and
 *      their maximal gap, to depth 10^7, which decides eventual periodicity
 *      for a column with infinitely many black cells
 *
 * Nothing here proves anything.
 */

const T = 60000;        // rows simulated in section B
const XMAX = 64;        // columns tested
const PMAX = 4096;      // periods searched
const TAIL = 20000;     // the period must hold on [T - TAIL, T)
const DEEP = 10_000_000; // depth of the closed-form rule 90 scan

// --------------------------------------------------------------------------
// A generic BigInt engine for an arbitrary elementary rule.
//
// Bit i of the row is cell i. `left` of cell i is bit i-1, so the left plane is
// x << 1n; the right plane is x >> 1n. For each of the eight neighbourhoods we
// build the mask of positions in that neighbourhood and OR in the ones the rule
// sends to 1.
// --------------------------------------------------------------------------

function stepGeneric(x, rule, width) {
  const mask = (1n << BigInt(width)) - 1n;
  const l = (x << 1n) & mask;
  const c = x;
  const r = x >> 1n;
  let out = 0n;
  for (let n = 0; n < 8; n++) {
    if (((rule >> n) & 1) === 0) continue;
    const bl = (n >> 2) & 1, bc = (n >> 1) & 1, br = n & 1;
    let m = mask;
    m &= bl ? l : ~l & mask;
    m &= bc ? c : ~c & mask;
    m &= br ? r : ~r & mask;
    out |= m;
  }
  return out & mask;
}

/** Columns -XMAX..XMAX of the single-seed picture of `rule`, T rows. */
function columns(rule, T, xmax) {
  const width = 2 * T + 8;
  const centre = BigInt(T + 4);
  let x = 1n << centre;
  const cols = [];
  for (let j = -xmax; j <= xmax; j++) cols.push(new Uint8Array(T));
  for (let t = 0; t < T; t++) {
    for (let j = -xmax; j <= xmax; j++) {
      cols[j + xmax][t] = Number((x >> (centre + BigInt(j))) & 1n);
    }
    x = stepGeneric(x, rule, width);
  }
  return cols;
}

/** Naive per-cell reference, for the agreement check. */
function naiveColumns(rule, T, xmax) {
  const w = 2 * T + 8, c = T + 4;
  let a = new Uint8Array(w), b = new Uint8Array(w);
  a[c] = 1;
  const cols = [];
  for (let j = -xmax; j <= xmax; j++) cols.push(new Uint8Array(T));
  for (let t = 0; t < T; t++) {
    for (let j = -xmax; j <= xmax; j++) cols[j + xmax][t] = a[c + j];
    for (let i = 0; i < w; i++) {
      const l = i > 0 ? a[i - 1] : 0, m = a[i], r = i < w - 1 ? a[i + 1] : 0;
      b[i] = (rule >> ((l << 2) | (m << 1) | r)) & 1;
    }
    const s = a; a = b; b = s;
  }
  return cols;
}

/** The least p <= PMAX with col(t+p) = col(t) for all t in [from, to-p), or 0. */
function tailPeriod(col, from, to, pmax) {
  for (let p = 1; p <= pmax; p++) {
    let ok = true;
    for (let t = from; t + p < to; t++) {
      if (col[t + p] !== col[t]) { ok = false; break; }
    }
    if (ok) return p;
  }
  return 0;
}

// --------------------------------------------------------------------------
console.log('=== A. engine agreement (rule, cells compared, disagreements) ===');
for (const rule of [30, 60, 90, 102, 150]) {
  const fast = columns(rule, 400, 20);
  const slow = naiveColumns(rule, 400, 20);
  let bad = 0, n = 0;
  for (let j = 0; j < fast.length; j++) {
    for (let t = 0; t < 400; t++) { n++; if (fast[j][t] !== slow[j][t]) bad++; }
  }
  console.log(`  rule ${rule}: ${n} cells, ${bad} disagreements`);
}

console.log();
console.log(`=== B. eventually periodic columns (T=${T}, period <= ${PMAX} holding on the last ${TAIL} rows) ===`);
console.log('  WARNING built into the report: a column whose black cells are exponentially');
console.log('  sparse looks period-1 on any finite tail window, because the window is all');
console.log('  white. So every "periodic" verdict below is printed with the last black cell');
console.log('  and the largest gap between black cells over the WHOLE run. A verdict of');
console.log('  p=1 with lastblack near T/2 and maxgap near T/4 is the artifact, not a period.');
for (const rule of [30, 60, 90, 102, 150]) {
  const cols = columns(rule, T, XMAX);
  const rows = [];
  for (let j = -XMAX; j <= XMAX; j++) {
    const col = cols[j + XMAX];
    const p = tailPeriod(col, T - TAIL, T, PMAX);
    let n = 0, last = -1, gap = 0;
    for (let t = 0; t < T; t++) {
      if (col[t]) { n++; if (last >= 0 && t - last > gap) gap = t - last; last = t; }
    }
    rows.push({ j, p, n, last, gap });
  }
  const per = rows.filter((r) => r.p);
  console.log(`  rule ${rule}: ${per.length} of ${2 * XMAX + 1} columns pass the naive tail test`);
  for (const r of rows.filter((r) => r.j >= -4 && r.j <= 8)) {
    console.log(`    x=${String(r.j).padStart(3)}  tailperiod=${String(r.p).padStart(4)}  black=${String(r.n).padStart(6)}  lastblack=${String(r.last).padStart(6)}  maxgap=${String(r.gap).padStart(6)}`);
  }
}

// --------------------------------------------------------------------------
// C. Rule 90 in closed form.
//
// From a single seed, rule 90 gives Pascal's triangle mod 2:
//     cell(t, x) = C(t, (t+x)/2) mod 2   when t = x (mod 2) and |x| <= t,
//     0 otherwise,
// and by Kummer's theorem C(n, k) is odd iff k AND (n-k) = 0. With
// k = (t+x)/2 and n-k = (t-x)/2 this is
//     cell(t, x) = 1  iff  ((t+x)/2) AND ((t-x)/2) = 0.
// The script checks that against the simulation before using it.
// --------------------------------------------------------------------------

console.log();
console.log('=== C. rule 90 in closed form ===');
{
  const T0 = 3000, X0 = 40;
  const cols = columns(90, T0, X0);
  let bad = 0, n = 0;
  for (let x = -X0; x <= X0; x++) {
    for (let t = 0; t < T0; t++) {
      let v = 0;
      if (Math.abs(x) <= t && ((t + x) % 2 === 0)) {
        const a = (t + x) / 2, b = (t - x) / 2;
        v = (a & b) === 0 ? 1 : 0;
      }
      n++;
      if (v !== cols[x + X0][t]) bad++;
    }
  }
  console.log(`  closed form vs simulation: ${n} cells, ${bad} disagreements`);

  console.log(`  column x: #black cells with t < ${DEEP}, largest gap between consecutive black cells`);
  for (const x of [0, 1, 2, 3, 4, 5, 7, 8, 15, 16, 17, 32, 33]) {
    let count = 0, last = -1, gap = 0, first = -1;
    for (let t = Math.abs(x); t < DEEP; t++) {
      if ((t + x) % 2 !== 0) continue;
      const a = (t + x) / 2, b = (t - x) / 2;
      if ((a & b) === 0) {
        count++;
        if (first < 0) first = t;
        if (last >= 0 && t - last > gap) gap = t - last;
        last = t;
      }
    }
    console.log(`    x=${String(x).padStart(3)}  black=${String(count).padStart(6)}  first=${String(first).padStart(3)}  last=${String(last).padStart(8)}  maxgap=${gap}`);
  }
}

// --------------------------------------------------------------------------
// D. Rule 150 in closed form.
//
// Rule 150 is `left XOR center XOR right`, so writing row t as the polynomial
// P_t(u) = sum_x cell(t,x) u^(x+t) over F_2 gives P_t = (1 + u + u^2)^t, and by
// Frobenius (1+u+u^2)^t = prod over set bits i of t of (1 + u^(2^i) + u^(2^(i+1))).
// So cell(t, x) = [u^(x+t)] of that product = the number of ways to write
// x + t = sum over set bits i of t of e_i * 2^i with each e_i in {0,1,2},
// counted mod 2. That is a digit DP with a carry in {0,1,2}.
// --------------------------------------------------------------------------

/** cell(t, x) for rule 150 from a single seed, by the digit DP. */
function cell150(t, x) {
  const m = x + t;
  if (m < 0 || m > 2 * t) return 0;
  // dp[c] = number of ways (mod 2) so far with carry c into the next bit.
  let dp = [1, 0, 0];
  for (let j = 0; j < 48; j++) {
    const inS = (t >> j) & 1;           // is bit j of t set (only then is e_j free)
    const bm = (m >> j) & 1;            // required bit of the target
    const next = [0, 0, 0];
    for (let c = 0; c < 3; c++) {
      if (!dp[c]) continue;
      const dmax = inS ? 2 : 0;
      for (let d = 0; d <= dmax; d++) {
        const total = d + c;
        if ((total & 1) !== bm) continue;
        const carry = (total - bm) / 2;
        if (carry > 2) continue;
        next[carry] ^= dp[c];
      }
    }
    dp = next;
    if (!dp[0] && !dp[1] && !dp[2]) return 0;
  }
  return dp[0];
}

console.log();
console.log('=== D. rule 150 in closed form ===');
{
  const T0 = 3000, X0 = 40;
  const cols = columns(150, T0, X0);
  let bad = 0, n = 0;
  for (let x = -X0; x <= X0; x++) {
    for (let t = 0; t < T0; t++) { n++; if (cell150(t, x) !== cols[x + X0][t]) bad++; }
  }
  console.log(`  digit DP vs simulation: ${n} cells, ${bad} disagreements`);
  console.log(`  column x: #black cells with t < ${DEEP}, largest gap`);
  for (const x of [0, 1, 2, 3, 4, 5, 8, 16, 17]) {
    let count = 0, last = -1, gap = 0;
    for (let t = Math.abs(x); t < DEEP; t++) {
      if (cell150(t, x)) {
        count++;
        if (last >= 0 && t - last > gap) gap = t - last;
        last = t;
      }
    }
    console.log(`    x=${String(x).padStart(3)}  black=${String(count).padStart(7)}  last=${String(last).padStart(8)}  maxgap=${gap}`);
  }
}

// --------------------------------------------------------------------------
// E. the two rule 150 identities the argument in the document rests on.
//
//   (i)  cell(t, 0) = 1 for every t
//   (ii) a(2t) = 0 and a(2t+1) = 1 XOR a(t), where a(t) = cell(t, 1)
//
// (ii) makes column 1 provably not eventually periodic: an eventual period p
// must be even (an odd p would force a to be 1 on a whole tail, contradicting
// a(2t)=0), and if p = 2p' then p' is an eventual period too, so descend.
// --------------------------------------------------------------------------

console.log();
console.log('=== E. the rule 150 identities ===');
{
  const M = 2_000_000;
  let bad0 = 0, bad1 = 0, bad2 = 0;
  for (let t = 0; t < M; t++) if (cell150(t, 0) !== 1) bad0++;
  for (let t = 0; t < M / 2; t++) {
    if (cell150(2 * t, 1) !== 0) bad1++;
    if (cell150(2 * t + 1, 1) !== (1 ^ cell150(t, 1))) bad2++;
  }
  console.log(`  cell(t,0) = 1 for t < ${M}: ${bad0} failures`);
  console.log(`  a(2t) = 0 for 2t < ${M}: ${bad1} failures`);
  console.log(`  a(2t+1) = 1 XOR a(t) for 2t+1 < ${M}: ${bad2} failures`);
  // and the density those identities force: d = (1-d)/2, i.e. d = 1/3
  let ones = 0;
  for (let t = 0; t < M; t++) ones += cell150(t, 1);
  console.log(`  density of column 1 = ${(ones / M).toFixed(6)} (the identities force exactly 1/3)`);
}
