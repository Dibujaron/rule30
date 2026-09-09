/**
 * Parallax / connect: the picture of a LINEAR elementary rule is a rational
 * two-variable series over F_2, and its columns are its diagonals.
 *
 * For a linear rule, one step is multiplication of the row's Laurent series by
 * a fixed Laurent polynomial P(X) over F_2:
 *
 *   rule  60: P = X + 1          rule  90: P = X + X^-1
 *   rule 102: P = 1 + X^-1       rule 150: P = X + 1 + X^-1
 *
 * so the whole space-time generating function of the single-seed picture is
 *
 *   F(X,Y) = sum_t P(X)^t Y^t = 1 / (1 + P(X) Y)   over F_2,
 *
 * a RATIONAL function, and cell(t,x) = [X^x] P(X)^t. Substituting X -> U,
 * Y -> UV turns column-x extraction into the diagonal of a rational function,
 * which Furstenberg-Deligne makes algebraic and Christol then makes automatic.
 *
 * This script checks the identity cell(t,x) = [X^x] P(X)^t against a real
 * simulation, and checks the two closed forms it gives for the centre column:
 * binom(t, t/2) mod 2 for rule 90 (so: black only at t = 0) and the central
 * trinomial coefficient mod 2 for rule 150 (so: black at every t).
 */

const T = 600, XMAX = 60;

/** cells of the seed's picture for one elementary rule */
function picture(rule, T, XMAX) {
  const W = 2 * T + 6, O = T + 2;
  let a = new Uint8Array(W), n = new Uint8Array(W);
  a[O] = 1;
  const rows = [];
  for (let t = 0; t < T; t++) {
    const r = new Uint8Array(2 * XMAX + 1);
    for (let x = -XMAX; x <= XMAX; x++) r[x + XMAX] = a[O + x];
    rows.push(r);
    for (let i = 1; i < W - 1; i++)
      n[i] = (rule >> (4 * a[i - 1] + 2 * a[i] + a[i + 1])) & 1;
    const tmp = a; a = n; n = tmp;
  }
  return rows;
}

/** P(X)^t over F_2, as a map from exponent to coefficient; P given as exponents */
function powLaurent(exps, t) {
  // represent a Laurent polynomial as a Set of exponents (coefficients in F_2)
  let cur = new Set([0]);
  for (let i = 0; i < t; i++) {
    const nxt = new Set();
    for (const e of cur) for (const p of exps) {
      const k = e + p;
      if (nxt.has(k)) nxt.delete(k); else nxt.add(k);
    }
    cur = nxt;
  }
  return cur;
}

const P = { 60: [1, 0], 90: [1, -1], 102: [0, -1], 150: [1, 0, -1] };

console.log('--- the rational space-time series of the linear rules ---');
for (const rule of [60, 90, 102, 150]) {
  const rows = picture(rule, T, XMAX);
  let bad = 0, tried = 0;
  for (let t = 0; t < T; t++) {
    const S = powLaurent(P[rule], t);
    for (let x = -XMAX; x <= XMAX; x++) {
      tried++;
      const pred = S.has(x) ? 1 : 0;
      if (pred !== rows[t][x + XMAX]) bad++;
    }
  }
  console.log(`  rule ${String(rule).padStart(3)}:  cell(t,x) = [X^x] P(X)^t  ` +
    `-> ${bad} mismatches over ${tried} cells`);
}

console.log('\n--- the closed forms the diagonal gives for the centre column ---');
{
  // binom(n, n/2) mod 2 by Kummer: odd iff no carries in n/2 + n/2, i.e. n = 0
  const rows90 = picture(90, T, 1);
  let bad = 0;
  for (let t = 0; t < T; t++) {
    const pred = (t % 2 === 0) ? (((t / 2) & (t / 2)) === 0 ? 1 : 0) : 0;
    if (pred !== rows90[t][1]) bad++;
  }
  console.log(`  rule 90 centre column = binom(t,t/2) mod 2 = [t = 0]: ${bad} mismatches / ${T}`);

  // central trinomial coefficient mod 2 = [U^t](1+U+U^2)^t
  const rows150 = picture(150, T, 1);
  let bad2 = 0, ones = 0;
  for (let t = 0; t < T; t++) {
    const S = powLaurent([2, 1, 0], t);
    const pred = S.has(t) ? 1 : 0;
    ones += pred;
    if (pred !== rows150[t][1]) bad2++;
  }
  console.log(`  rule 150 centre column = central trinomial coeff mod 2: ` +
    `${bad2} mismatches / ${T}; it is 1 at ${ones} of ${T} times`);
}
