// Astrolabe, 2026-09-10.
//
// Calibration for the Prize-3 vantage: P3 is a claim about rule 30 in
// particular, and it is FALSE for a neighbouring elementary rule, with a
// two-line algorithm. Rule 90 is additive over F2, so its single-seed picture
// is Pascal's triangle mod 2, and cell (t, x) is a binomial coefficient
// parity, which Kummer/Lucas turn into one AND of two integers: O(log t) bit
// operations, i.e. O(m) in the *input length* m = log2 t, against rule 30's
// conjectured Omega(2^m).
//
// Rule 150 is additive too; its cell is a trinomial coefficient parity, which
// this script computes by Frobenius squaring of (1+x+x^2) over F2 -- O(log t)
// polynomial squarings, i.e. polylog(t) bit operations, again sublinear in t.
//
// Rule 30 gets the same treatment as a control: the script tries the same
// AND-test and reports how badly it fails, so that "rule 90 is easy" is not
// mistaken for "the test is vacuous".
//
// Everything here is a check of an ALGORITHM against direct simulation. It
// proves nothing about rule 30; it calibrates what P3 is asserting.

function simulate(ruleNum, depth) {
  // rows[t] is a Map-free array indexed x + depth, cells in [-depth, depth]
  const w = 2 * depth + 3;
  let cur = new Uint8Array(w);
  cur[depth + 1] = 1; // x = 0 sits at index depth+1
  const rows = [cur];
  for (let t = 1; t <= depth; t++) {
    const nxt = new Uint8Array(w);
    for (let i = 1; i < w - 1; i++) {
      const idx = 4 * cur[i - 1] + 2 * cur[i] + cur[i + 1];
      nxt[i] = (ruleNum >> idx) & 1;
    }
    rows.push(nxt);
    cur = nxt;
  }
  return { rows, off: depth + 1 };
}

// Rule 90: cell(t,x) = C(t, (t+x)/2) mod 2 when t+x is even, else 0.
// Lucas/Kummer: C(a+b, a) is odd iff (a & b) == 0.
function rule90Closed(t, x) {
  if (((t + x) & 1) !== 0) return 0;
  const a = (t + x) / 2;
  const b = (t - x) / 2;
  if (a < 0 || b < 0) return 0;
  return (a & b) === 0 ? 1 : 0;
}

// Rule 150: cell(t,x) = coefficient of x^(t+x) in (1+X+X^2)^t over F2.
// Computed by binary exponentiation with Frobenius: over F2, squaring a
// polynomial spreads its coefficients, so each squaring is O(deg).
function rule150Closed(t, x) {
  const k = t + x; // wanted coefficient index, in the shifted picture
  if (k < 0 || k > 2 * t) return 0;
  // polynomial as BigInt bitmask over F2
  const mulF2 = (p, q) => {
    let r = 0n;
    let qq = q;
    let shift = 0n;
    while (qq > 0n) {
      if (qq & 1n) r ^= p << shift;
      qq >>= 1n;
      shift += 1n;
    }
    return r;
  };
  let base = 0b111n; // 1 + X + X^2
  let acc = 1n;
  let e = t;
  while (e > 0) {
    if (e & 1) acc = mulF2(acc, base);
    base = mulF2(base, base);
    e >>= 1;
  }
  return Number((acc >> BigInt(k)) & 1n);
}

function check(ruleNum, closed, depth, label) {
  const { rows, off } = simulate(ruleNum, depth);
  let checked = 0, bad = 0, firstBad = null;
  for (let t = 0; t <= depth; t++) {
    for (let x = -t; x <= t; x++) {
      const got = rows[t][off + x];
      const want = closed(t, x);
      checked++;
      if (got !== want) { bad++; if (!firstBad) firstBad = [t, x, got, want]; }
    }
  }
  console.log(`${label}: ${checked - bad}/${checked} cells agree` +
    (firstBad ? `; first disagreement at (t,x)=(${firstBad[0]},${firstBad[1]}) picture=${firstBad[2]} formula=${firstBad[3]}` : ''));
  return bad;
}

const DEPTH = 400;

console.log(`--- closed forms vs direct simulation, depth ${DEPTH} ---`);
check(90, rule90Closed, DEPTH, 'rule 90  (Lucas AND-test)');
check(150, rule150Closed, DEPTH, 'rule 150 (Frobenius squaring)');
// Control: the same AND-test applied to rule 30 must fail badly.
check(30, rule90Closed, DEPTH, 'rule 30  (SAME AND-test, control)');

// Now push rule 90 far past any feasible simulation, to show the cost is in
// the number of BITS of t, not in t.
console.log('\n--- rule 90 centre-adjacent cells at large t, by AND-test only ---');
for (const t of [1e6, 1e9, 2 ** 40, 2 ** 52]) {
  const x = 0;
  const tt = Number(t);
  console.log(`  t=${tt} (${Math.ceil(Math.log2(tt + 1))} bits): cell(t,0)=${rule90Closed(tt, x)},` +
    ` cell(t,2)=${rule90Closed(tt, 2)}, cell(t,4)=${rule90Closed(tt, 4)}`);
}

// And the honest counterweight: for rule 30 the only known method is to run
// it. Report the actual cell-update count of the naive method at a few t, so
// the O(n^2) that Wolfram's Omega(n) sits a factor n below is a number.
console.log('\n--- naive cost of rule 30 cell (t,0): cell updates inside the cone ---');
for (const t of [10, 100, 1000, 1e6]) {
  const updates = t * t; // (2t+1)-wide diamond, ~t^2 updates
  const bits = Math.ceil(Math.log2(t + 1));
  console.log(`  t=${t}: input is ${bits} bits, naive work ~${updates.toExponential(2)} updates,` +
    ` Wolfram's target lower bound ~${t.toExponential(2)}`);
}
