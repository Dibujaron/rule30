// Astrolabe, 2026-09-13. Why the F_2 degree of the centre cell is exactly 2t-1
// and not 2t+1: the two cone-edge cells enter linearly.
//
// astrolabe2_degree.mjs measured the degree of cell(t,0), as a function of the
// 2t+1 free cells of row 0, at 2, 3, 5, 7, 9, 11, 13, 15, 17, 19 for t = 1..10 --
// that is n - 2 with n = 2t+1, at every t from 2 on, where a uniformly random
// function of n variables has degree n. A deficit of exactly 2 at every t is a
// mechanism, not a coincidence. The candidate mechanism: the cell at x = -t
// reaches the origin only along the single left cone edge, and the cell at x = +t
// only along the right one, so each enters the algebraic normal form linearly.
//
// Checked here: the degree of the function in each individual variable (its
// maximum ANF monomial degree restricted to monomials containing that variable is
// not the question -- the question is the per-variable degree, i.e. whether any
// monomial contains that variable together with many others).

function table(r) { const t = new Uint8Array(8); for (let i = 0; i < 8; i++) t[i] = (r >> i) & 1; return t; }

function centreCell(tab, t, bits) {
  const W = 4 * t + 3, off = t;
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  for (let j = 0; j < 2 * t + 1; j++) cur[j + off] = (bits >>> j) & 1;
  for (let s = 0; s < t; s++) {
    for (let i = 1; i < W - 1; i++) nxt[i] = tab[4 * cur[i - 1] + 2 * cur[i] + cur[i + 1]];
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return cur[t + off];
}

function anf(rule, t) {
  const tab = table(rule), n = 2 * t + 1, N = 1 << n;
  const a = new Uint8Array(N);
  for (let m = 0; m < N; m++) a[m] = centreCell(tab, t, m);
  for (let i = 0; i < n; i++) { const b = 1 << i; for (let m = 0; m < N; m++) if (m & b) a[m] ^= a[m ^ b]; }
  return { a, n, N };
}

console.log('# rule 30: for each variable (row-0 cell x = j - t), the largest monomial');
console.log('# containing it. Variable 0 is x = -t (left cone edge), variable 2t is x = +t.');
console.log('# t   per-variable max monomial size, left to right          overall degree');
for (let t = 2; t <= 10; t++) {
  const { a, n, N } = anf(30, t);
  const perVar = new Array(n).fill(0);
  let deg = 0, topMask = -1;
  for (let m = 0; m < N; m++) {
    if (!a[m]) continue;
    let pc = 0;
    for (let i = 0; i < n; i++) if (m & (1 << i)) pc++;
    if (pc > deg) { deg = pc; topMask = m; }
    for (let i = 0; i < n; i++) if (m & (1 << i)) if (pc > perVar[i]) perVar[i] = pc;
  }
  const topVars = [];
  for (let i = 0; i < n; i++) if (!((topMask >> i) & 1)) topVars.push(i - t);
  console.log(`${String(t).padStart(3)}   ${perVar.join(' ').padEnd(50)}  ${deg}   (a top monomial omits x = ${topVars.join(', ')})`);
}
console.log('');
console.log('# same for the affine controls, where every monomial is a single variable');
for (const rule of [90, 150]) {
  for (const t of [4, 8]) {
    const { a, n, N } = anf(rule, t);
    let deg = 0;
    for (let m = 0; m < N; m++) if (a[m]) { let pc = 0; for (let i = 0; i < n; i++) if (m & (1 << i)) pc++; if (pc > deg) deg = pc; }
    console.log(`   rule ${rule}  t=${t}  degree ${deg}`);
  }
}
