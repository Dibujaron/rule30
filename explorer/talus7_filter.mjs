/**
 * Talus, 2026-09-10. Crystal 66's OR-to-XOR filter, run rather than asserted.
 *
 * Crystal 66: any argument whose reasoning survives replacing OR with XOR is
 * refuted, because rule 150's centre column is constantly black and rule 90's
 * is eventually white while rule 30's is the prize. So both candidates that
 * claim rule-30 content -- C1 (a black run of the centre column forces the
 * checkerboard to its left) and C3 (b(t+1) + 2b(t) <= 4t+5, from the forbidden
 * adjacent black pair) -- have to FAIL for 150 and 90 or they are worthless.
 *
 * Rule 86 is rule 30's mirror and is included as the check that this test can
 * fail in the other direction: a claim that holds for 86 too is a claim about
 * the reflection as well, which is fine, but a claim that holds for 150 is not.
 */

const T = 2000;
const RULES = [30, 150, 90, 86, 110, 60];

function table(rule) {
  const t = new Uint8Array(8);
  for (let i = 0; i < 8; i++) t[i] = (rule >> i) & 1;
  return t;
}

function picture(rule, T) {
  const tab = table(rule);
  const W = 2 * T + 3;
  const C = T + 1;
  let a = new Uint8Array(W);
  let b = new Uint8Array(W);
  a[C] = 1;
  const rows = [];
  for (let t = 0; t < T; t++) {
    rows.push(a.slice());
    for (let i = 1; i < W - 1; i++) b[i] = tab[(a[i - 1] << 2) | (a[i] << 1) | a[i + 1]];
    b[0] = 0; b[W - 1] = 0;
    const tmp = a; a = b; b = tmp;
  }
  return { rows, C };
}

for (const rule of RULES) {
  const { rows, C } = picture(rule, T);
  const c = rows.map((r) => r[C]);

  // (C1) a black run of the centre column at [a, a+L): does row a alternate
  // leftward for L cells?
  let altTested = 0, altBad = 0, runs = 0, longest = 0;
  let i = 0;
  while (i < T) {
    const col = c[i];
    let j = i;
    while (j < T && c[j] === col) j++;
    if (col === 1 && j < T && i >= 1) {
      runs++;
      const L = j - i;
      if (L > longest) longest = L;
      for (let k = 0; k < Math.min(L, i); k++) {
        altTested++;
        if (rows[i][C - k] !== (k % 2 === 0 ? 1 : 0)) altBad++;
      }
    }
    i = j;
  }

  // (C3) the row inequality
  let ineqBad = 0, tight = Infinity;
  const bcount = rows.map((r) => r.reduce((s, x) => s + x, 0));
  for (let t = 1; t + 1 < T; t++) {
    const lhs = bcount[t + 1] + 2 * bcount[t];
    const rhs = 4 * t + 5;
    if (lhs > rhs) ineqBad++;
    tight = Math.min(tight, rhs - lhs);
  }
  const dens = bcount.reduce((s, x) => s + x, 0) / rows.reduce((s, _, t) => s + 2 * t + 1, 0);

  console.log(
    `rule ${String(rule).padStart(3)}: centre-column black runs ${runs} (longest ${longest}) | ` +
    `alternation fails ${altBad}/${altTested} | ` +
    `b(t+1)+2b(t) <= 4t+5 fails ${ineqBad}/${T - 2} (tightest ${tight === Infinity ? '-' : tight}) | ` +
    `triangle density ${dens.toFixed(4)}`,
  );
}
