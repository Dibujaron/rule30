// STUB - DEFECTIVE, kept for the record.  Superseded by parallax6_avn4.mjs.
// Two faults, both named in avn4's header and in section 4 of
// docs/connections/2026-09-13-sheaf-theoretic-contextuality-*.md:
//   (1) the width sweep is NOT accumulated, so a wider window loses the
//       constraints of a narrower one and the answer is non-monotone;
//   (2) it tests rule 105, which has R(0,0,0) = 1 and is therefore not
//       quiescent, so the cone geometry here is false for it - it reported
//       rule 105 as refuted on a system it also reported satisfiable, and
//       that contradiction is what exposed fault (1).
//
// Parallax, 2026-09-13.  The All-versus-Nothing test, over F_2, at every
// context width, for the rung-2 family and for matched linear controls.
//
// Abramsky-Barbosa-Kishida-Lal-Mansfield (arXiv:1502.03097) define an
// R-linear equation as a triple <C, a, b> with C a context, a : C -> R and
// b in R, satisfied by a section s when sum_{m in C} a(m) s(m) = b; a model
// is AvN_R when the set of ALL such equations satisfied by ALL sections of
// their context has no global solution.  Their Theorem 22 chains
//     AvN_R(S)  =>  SC(Aff S)  =>  CSC_R(S)  =>  CSC_Z(S)  =>  SC(S),
// so AvN is the strongest and most easily computable link, and it is exactly
// "a Gaussian-elimination refutation of the constraint system exists".
//
// The test is decidable: for each context, the equations satisfied by every
// section are the F_2-affine relations of S(C) (a nullspace); assemble them
// all and test the global linear system for consistency.
//
// Grading it by context WIDTH is the point.  A context here is a window of
// h rows by w columns of the causal triangle, with S(C) the assignments
// satisfying every rule clause that fits inside it plus the pinned cells.
// Wider windows have smaller supports and hence more affine relations, so
// AvN at width (h,w) is a hierarchy and w*(a) = the least width at which the
// refutation appears is a genuine invariant of the family.

import { ruleFn } from './parallax6_lib.mjs';

// ------------------------------------------------------------ F_2 linear algebra
function newRow(nw) { return new Uint32Array(nw); }
function lead(row, nw) {
  for (let w = 0; w < nw; w++) if (row[w] !== 0) return w * 32 + (31 - Math.clz32(row[w] & -row[w]));
  return -1;
}
// consistency of an augmented system: columns 0..n-1 are variables, column n is RHS
function consistent(rows, n) {
  const nw = ((n + 1) + 31) >> 5;
  const piv = new Map();
  for (const r0 of rows) {
    const row = Uint32Array.from(r0);
    for (;;) {
      const l = lead(row, nw);
      if (l === -1) break;
      if (l === n) return false;          // 0 = 1
      const p = piv.get(l);
      if (!p) { piv.set(l, row); break; }
      for (let w = 0; w < nw; w++) row[w] ^= p[w];
    }
  }
  return true;
}
// all (alpha,beta) with alpha.v = beta for every tuple v in S (S: array of bit-masks over k vars)
function affineRelations(S, k) {
  // right-nullspace of the |S| x (k+1) matrix with rows [v | 1]
  const n = k + 1, nw = (n + 31) >> 5;
  const piv = new Map();               // pivot col -> row
  for (const m of S) {
    const row = newRow(nw);
    for (let i = 0; i < k; i++) if ((m >> i) & 1) row[i >> 5] |= 1 << (i & 31);
    row[k >> 5] |= 1 << (k & 31);
    for (;;) {
      const l = lead(row, nw);
      if (l === -1) break;
      const p = piv.get(l);
      if (!p) { piv.set(l, row); break; }
      for (let w = 0; w < nw; w++) row[w] ^= p[w];
    }
  }
  const cols = [...piv.keys()].sort((a, b) => b - a);
  for (const c of cols) {              // back-substitute
    const row = piv.get(c);
    for (const d of cols) {
      if (d <= c) continue;
      if ((row[d >> 5] >> (d & 31)) & 1) { const p = piv.get(d); for (let w = 0; w < nw; w++) row[w] ^= p[w]; }
    }
  }
  const isPiv = new Uint8Array(n);
  for (const c of cols) isPiv[c] = 1;
  const out = [];
  for (let f = 0; f < n; f++) {
    if (isPiv[f]) continue;
    const v = new Uint8Array(n);
    v[f] = 1;
    for (const c of cols) v[c] = (piv.get(c)[f >> 5] >> (f & 31)) & 1;
    out.push(v);                        // v[0..k-1] = alpha, v[k] = beta
  }
  return out;
}

// generic AvN test over abstract contexts { scope:[varIds], S:[masks] }
function avn(ctxs, nVars, extraRows = []) {
  const nw = ((nVars + 1) + 31) >> 5;
  const rows = extraRows.slice();
  for (const c of ctxs) {
    for (const v of affineRelations(c.S, c.scope.length)) {
      const row = newRow(nw);
      let any = false;
      for (let i = 0; i < c.scope.length; i++) if (v[i]) { row[c.scope[i] >> 5] ^= 1 << (c.scope[i] & 31); any = true; }
      if (v[c.scope.length]) row[nVars >> 5] ^= 1 << (nVars & 31);
      if (any || v[c.scope.length]) rows.push(row);
    }
  }
  return { avn: !consistent(rows, nVars), nEq: rows.length };
}

// ---------------------------------------------------------------- CA geometry
function geometry({ rule, a, L, phase, rightBound = null }) {
  const R = ruleFn(rule);
  const XL = (t) => -(a + t);
  const XR = (t) => L - 1 - t;
  const idx = new Map(); const cells = [];
  for (let t = 0; t < L; t++) for (let x = XL(t); x <= XR(t); x++) { idx.set(`${t},${x}`, cells.length); cells.push([t, x]); }
  const V = (t, x) => (t < 0 || t >= L || x > XR(t)) ? null : (x < XL(t) ? 'W' : idx.get(`${t},${x}`));
  const pin = new Map();
  for (let t = 0; t < L; t++) pin.set(V(t, 0), (t + phase) % 2);
  if (rightBound !== null) for (let x = rightBound + 1; x <= XR(0); x++) if (x !== 0) pin.set(V(0, x), 0);
  return { R, L, a, XL, XR, cells, V, pin, nVars: cells.length };
}

function satisfiable(g, { rule, a, L, phase, rightBound }) {
  const R = ruleFn(rule);
  const hi = rightBound === null ? L - 1 : Math.min(rightBound, L - 1);
  const nFree = a + hi + 1;             // x = -a .. hi, with x = 0 pinned
  for (let m = 0; m < (1 << nFree); m++) {
    const lo = -(a + L), top = L;
    let cur = new Uint8Array(top - lo + 1);
    let bit = 0, ok = true;
    for (let x = -a; x <= hi; x++) {
      const v = (x === 0) ? phase % 2 : (m >> bit) & 1;
      if (x !== 0) bit++;
      cur[x - lo] = v;
    }
    for (let t = 0; t < L && ok; t++) {
      if (cur[0 - lo] !== (t + phase) % 2) ok = false;
      if (!ok) break;
      const next = new Uint8Array(cur.length);
      for (let x = lo + 1; x < top; x++) next[x - lo] = R(cur[x - 1 - lo], cur[x - lo], cur[x + 1 - lo]);
      cur = next;
    }
    if (ok) return true;
  }
  return false;
}

// contexts = h x w windows of the triangle
function windowContexts(g, h, w, freeCap = 22) {
  const { L, XL, XR, V, pin } = g;
  const ctxs = []; let skipped = 0;
  for (let t0 = 0; t0 + h <= L; t0++) {
    for (let x0 = XL(t0 + h - 1); x0 + w - 1 <= XR(t0); x0++) {
      // cells of the window that are real variables
      const vars = [];
      const inWin = new Map();
      for (let t = t0; t < t0 + h; t++)
        for (let x = x0; x < x0 + w; x++) {
          const v = V(t, x);
          if (v === null) continue;
          if (v === 'W') { inWin.set(`${t},${x}`, 'W'); continue; }
          inWin.set(`${t},${x}`, v); vars.push(v);
        }
      if (vars.length === 0) continue;
      const uniq = [...new Set(vars)];
      const pos = new Map(uniq.map((v, i) => [v, i]));
      // clauses fully inside
      const clauses = [];
      for (let t = t0; t + 1 < t0 + h; t++)
        for (let x = x0; x < x0 + w; x++) {
          const o = inWin.get(`${t + 1},${x}`);
          const l = inWin.get(`${t},${x - 1}`), c = inWin.get(`${t},${x}`), r = inWin.get(`${t},${x + 1}`);
          if (o === undefined || l === undefined || c === undefined || r === undefined) continue;
          clauses.push([l, c, r, o]);
        }
      if (clauses.length === 0) continue;
      if (uniq.length > freeCap) { skipped++; continue; }
      const S = [];
      for (let m = 0; m < (1 << uniq.length); m++) {
        const val = (v) => (v === 'W' ? 0 : (m >> pos.get(v)) & 1);
        let ok = true;
        for (const [l, c, r, o] of clauses) if (g.R(val(l), val(c), val(r)) !== val(o)) { ok = false; break; }
        if (ok) for (const v of uniq) if (pin.has(v) && val(v) !== pin.get(v)) { ok = false; break; }
        if (ok) S.push(m);
      }
      ctxs.push({ scope: uniq, S });
    }
  }
  return { ctxs, skipped };
}

function pinRows(g) {
  const nw = ((g.nVars + 1) + 31) >> 5;
  const rows = [];
  for (const [v, b] of g.pin) {
    const row = newRow(nw);
    row[v >> 5] ^= 1 << (v & 31);
    if (b) row[g.nVars >> 5] ^= 1 << (g.nVars & 31);
    rows.push(row);
  }
  return rows;
}

// ------------------------------------------------------------------- controls
console.log('[A] instrument check on the literature examples');
{
  const t = (name, ctxs, n) => { const r = avn(ctxs, n); console.log(`  ${name.padEnd(40)} AvN: ${r.avn}  (${r.nEq} equations)`); };
  const mk = (scope, tuples) => ({ scope, S: tuples.map((x) => x.reduce((m, b, i) => m | (b << i), 0)) });
  t('parity system, inconsistent', [mk([0, 1], [[0, 0], [1, 1]]), mk([1, 2], [[0, 0], [1, 1]]), mk([0, 2], [[0, 1], [1, 0]])], 3);
  t('parity system, consistent', [mk([0, 1], [[0, 0], [1, 1]]), mk([1, 2], [[0, 0], [1, 1]]), mk([0, 2], [[0, 0], [1, 1]])], 3);
  t('PR box', [mk([0, 2], [[0, 0], [1, 1]]), mk([0, 3], [[0, 0], [1, 1]]), mk([1, 2], [[0, 0], [1, 1]]), mk([1, 3], [[0, 1], [1, 0]])], 4);
  t('unconstrained model', [mk([0, 1], [[0, 0], [0, 1], [1, 0], [1, 1]])], 2);
}

console.log('');
console.log('[B] matched CA control: the SAME two-sided bounded family, four rules');
console.log('    row 0 white outside [-a, b]; column 0 alternating for L rows;');
console.log('    L chosen as the first UNSATISFIABLE length.  AvN = a linear-algebra refutation exists.');
for (const rule of [90, 150, 30, 120, 60, 105]) {
  const a = 3, b = 3;
  let L = 1;
  while (L < 40) {
    const g = geometry({ rule, a, L, phase: 0, rightBound: b });
    if (!satisfiable(g, { rule, a, L, phase: 0, rightBound: b })) break;
    L++;
  }
  const g = geometry({ rule, a, L, phase: 0, rightBound: b });
  const out = [];
  for (const [h, w] of [[2, 3], [3, 4], [4, 5], [5, 6]]) {
    const { ctxs } = windowContexts(g, h, w);
    const r = avn(ctxs, g.nVars, pinRows(g));
    out.push(`${h}x${w}:${r.avn ? 'YES' : 'no '}`);
  }
  console.log(`  rule ${String(rule).padStart(3)}  first UNSAT L = ${String(L).padStart(2)}   AvN at window  ${out.join('  ')}`);
}

console.log('');
console.log('[C] the real rung-2 family (one-sided cone), rule 30 and rule 120');
console.log('    a   L    window 2x3   3x4    4x5    5x6    6x7');
for (const rule of [30, 120]) {
  for (let a = 1; a <= 6; a++) {
    // first UNSAT length, max over phases
    let L = 1, phases = [];
    for (const phase of [0, 1]) {
      let k = 1;
      while (k < 40) { const g = geometry({ rule, a, L: k, phase, rightBound: null }); if (!satisfiable(g, { rule, a, L: k, phase, rightBound: null })) break; k++; }
      phases.push(k);
    }
    L = Math.max(...phases);
    const phase = phases.indexOf(L);
    const g = geometry({ rule, a, L, phase, rightBound: null });
    const out = [];
    for (const [h, w] of [[2, 3], [3, 4], [4, 5], [5, 6], [6, 7]]) {
      const { ctxs, skipped } = windowContexts(g, h, w);
      const r = avn(ctxs, g.nVars, pinRows(g));
      out.push(`${r.avn ? 'YES' : 'no '}${skipped ? '*' : ' '}`);
    }
    console.log(`  rule ${rule}  a=${a}  L=${L} p${phase}   ${out.join('    ')}`);
  }
}
console.log('    (* = some windows exceeded the enumeration cap and were dropped)');
