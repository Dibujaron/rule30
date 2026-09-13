// Astrolabe, 2026-09-13. Proof-complexity vantage on the rule 30 triangle.
//
// The object: fix row 0 free on the 2t+1 cells [-t, t] and white outside. Then
// cell(t, 0) is a Boolean function F_t of 2t+1 variables. Two hardness measures
// of F_t are exactly the measures that resolution width and polynomial-calculus
// degree lower bounds are about:
//
//   * how many of the 2t+1 variables are INFLUENTIAL (appear in some ANF monomial),
//   * the F_2 (algebraic normal form) DEGREE of F_t.
//
// Computed exactly by a Moebius transform over all 2^(2t+1) inputs, for rule 30
// and for the controls named in the brief: rules 90 and 150 (linear, polylog
// columns), plus rule 45 (the only other rule that climbs the occurrence ladder)
// and rule 86 (rule 30's mirror).
//
// Crystal 66's filter, the project's standard control: any statement whose
// reasoning survives OR -> XOR is about the proof system / the cone shape, not
// about rule 30.

const RULES = [30, 90, 150, 45, 86, 110];

function ruleTable(r) {
  // neighbourhoodIndex: 4*left + 2*centre + right, matching Rule30/Basic.lean.
  const tab = new Uint8Array(8);
  for (let i = 0; i < 8; i++) tab[i] = (r >> i) & 1;
  return tab;
}

// Evaluate cell(t,0) for one input window, packed in `bits` (bit j = cell at x = j - t).
function centreCell(tab, t, bits) {
  // row array of width 2t+1 + 2t padding each side (white outside the free window)
  const W = 4 * t + 3;
  let cur = new Uint8Array(W);
  let nxt = new Uint8Array(W);
  const off = t; // cell x maps to index x + t + off
  for (let j = 0; j < 2 * t + 1; j++) cur[j + off] = (bits >>> j) & 1;
  for (let s = 0; s < t; s++) {
    for (let i = 1; i < W - 1; i++) {
      nxt[i] = tab[4 * cur[i - 1] + 2 * cur[i] + cur[i + 1]];
    }
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return cur[t + off];
}

function analyse(rule, t) {
  const tab = ruleTable(rule);
  const n = 2 * t + 1;
  const N = 1 << n;
  const f = new Uint8Array(N);
  for (let m = 0; m < N; m++) f[m] = centreCell(tab, t, m);
  // count of black outputs, as a sanity figure (window_count_half says exactly half for rule 30)
  let ones = 0;
  for (let m = 0; m < N; m++) ones += f[m];
  // Moebius / zeta transform over F_2: in place, f becomes the ANF coefficients
  const a = f;
  for (let i = 0; i < n; i++) {
    const bit = 1 << i;
    for (let m = 0; m < N; m++) if (m & bit) a[m] ^= a[m ^ bit];
  }
  let deg = 0, support = 0;
  const usedVar = new Uint8Array(n);
  for (let m = 0; m < N; m++) {
    if (!a[m]) continue;
    support++;
    let pc = 0;
    for (let i = 0; i < n; i++) if (m & (1 << i)) { pc++; usedVar[i] = 1; }
    if (pc > deg) deg = pc;
  }
  let infl = 0;
  for (let i = 0; i < n; i++) infl += usedVar[i];
  return { n, ones, deg, support, infl };
}

const TMAX = Number(process.argv[2] ?? 10);

console.log('# cell(t,0) as a Boolean function of the 2t+1 free cells of row 0');
console.log('# rule  t   nvars  influential  F2-degree  #ANF-monomials  black-outputs/2^n');
for (const rule of RULES) {
  for (let t = 1; t <= TMAX; t++) {
    const r = analyse(rule, t);
    console.log(
      `${String(rule).padStart(5)} ${String(t).padStart(3)} ${String(r.n).padStart(6)} ` +
      `${String(r.infl).padStart(12)} ${String(r.deg).padStart(10)} ${String(r.support).padStart(15)} ` +
      `  ${(r.ones / (1 << r.n)).toFixed(6)}`
    );
  }
  console.log('');
}
