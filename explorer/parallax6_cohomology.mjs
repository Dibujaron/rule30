// Parallax, 2026-09-13.  The Abramsky-Mansfield cohomological obstruction,
// computed over F_p, for the rung-2 alternation family and for controls.
//
// Recipe (Abramsky-Mansfield, arXiv:1111.3620, Prop 4.3 as fetched):
// gamma(s_0) in H^1 vanishes  iff  s_0 extends to a COMPATIBLE FAMILY of the
// R-linear-combination presheaf F_S:  a choice, for every context C, of a
// formal R-combination r_C of the sections in S(C), such that
//     r_C |_{C n C'}  =  r_C' |_{C n C'}   for every pair,
// and r_{C_0} = s_0 (the single basis element).
//
// Restriction of a formal combination is push-forward along restriction of
// sections, so over F_p the whole thing is one sparse linear system:
//   variables  x_{C,s}  for every context C and section s in S(C);
//   equations  sum_{s in S(C), s|D = u} x_{C,s}  =  sum_{s' in S(C'), s'|D = u} x_{C',s'}
//              for every pair C, C' with D = C n C' nonempty and every u.
// gamma(s_0) = 0  iff  that system has a solution with x_{C_0,.} = e_{s_0}.
//
// Equivalently: let V be the solution space of the homogeneous system and
// pi_C its projection onto the block of C.  gamma(s) = 0 iff e_s is in pi_C(V).
//
// The model is COHOMOLOGICALLY STRONGLY CONTEXTUAL over F_p when gamma(s) != 0
// for every context and every section; that implies strong contextuality.

import { buildScenario, longestAlternating, enforceCompatibility } from './parallax6_lib.mjs';

// ------------------------------------------------------------------ F_2 core
function popIdx(row, W) { // index of lowest set bit, or -1
  for (let w = 0; w < W; w++) if (row[w] !== 0) return w * 32 + (31 - Math.clz32(row[w] & -row[w]));
  return -1;
}

function obstructionF2(ctxs) {
  // variable layout: block start per context
  const start = []; let N = 0;
  for (const c of ctxs) { start.push(N); N += c.S.length; }
  const W = (N + 31) >> 5;
  const setb = (r, i) => { r[i >> 5] |= (1 << (i & 31)); };

  // --- equations
  const byVar = new Map();
  ctxs.forEach((c, i) => c.scope.forEach((v) => {
    if (!byVar.has(v)) byVar.set(v, []);
    byVar.get(v).push(i);
  }));
  const pairs = new Set();
  for (const list of byVar.values())
    for (let p = 0; p < list.length; p++)
      for (let q = p + 1; q < list.length; q++) pairs.add(list[p] * 100000 + list[q]);

  const proj = (c, mask, shared) => {
    let out = 0;
    shared.forEach((v, j) => { if ((mask >> c.scope.indexOf(v)) & 1) out |= 1 << j; });
    return out;
  };

  // --- RREF, streaming
  const pivotRow = new Map(); // col -> Uint32Array
  const addEquation = (cols) => {
    const row = new Uint32Array(W);
    for (const c of cols) row[c >> 5] ^= (1 << (c & 31));
    for (;;) {
      const lead = popIdx(row, W);
      if (lead === -1) return;
      const pr = pivotRow.get(lead);
      if (!pr) { pivotRow.set(lead, row); return; }
      for (let w = 0; w < W; w++) row[w] ^= pr[w];
    }
  };

  let nEq = 0;
  for (const key of pairs) {
    const i = Math.floor(key / 100000), j = key % 100000;
    const ci = ctxs[i], cj = ctxs[j];
    const shared = ci.scope.filter((v) => cj.scope.includes(v));
    if (shared.length === 0) continue;
    const fib = new Map();
    ci.S.forEach((m, k) => {
      const u = proj(ci, m, shared);
      if (!fib.has(u)) fib.set(u, []);
      fib.get(u).push(start[i] + k);
    });
    cj.S.forEach((m, k) => {
      const u = proj(cj, m, shared);
      if (!fib.has(u)) fib.set(u, []);
      fib.get(u).push(start[j] + k);
    });
    for (const cols of fib.values()) { addEquation(cols); nEq++; }
  }

  // --- back-substitute so each pivot row is clean on the other pivot columns
  const pivCols = [...pivotRow.keys()].sort((a, b) => b - a);
  for (const c of pivCols) {
    const row = pivotRow.get(c);
    for (const d of pivCols) {
      if (d <= c) continue;
      if ((row[d >> 5] >> (d & 31)) & 1) {
        const pr = pivotRow.get(d);
        for (let w = 0; w < W; w++) row[w] ^= pr[w];
      }
    }
  }
  const isPivot = new Uint8Array(N);
  for (const c of pivCols) isPivot[c] = 1;
  const freeCols = []; for (let c = 0; c < N; c++) if (!isPivot[c]) freeCols.push(c);

  // --- for each context, the projection of the nullspace onto its block
  const report = [];
  for (let i = 0; i < ctxs.length; i++) {
    const n = ctxs[i].S.length, s0 = start[i];
    // basis of pi_i(V): for each free column f, the block coords of v_f
    const basis = [];
    const push = (vec) => {
      let v = vec;
      for (const b of basis) { const hb = 31 - Math.clz32(b); if ((v >> hb) & 1) v ^= b; }
      if (v !== 0) { basis.push(v); basis.sort((p, q) => q - p); }
    };
    for (const f of freeCols) {
      let vec = 0;
      for (let k = 0; k < n; k++) {
        const c = s0 + k;
        let val;
        if (c === f) val = 1;
        else if (isPivot[c]) val = (pivotRow.get(c)[f >> 5] >> (f & 31)) & 1;
        else val = 0;
        if (val) vec |= 1 << k;
      }
      if (vec) push(vec);
    }
    let nonvanishing = 0;
    for (let k = 0; k < n; k++) {
      let v = 1 << k;
      for (const b of basis) { const hb = 31 - Math.clz32(b); if ((v >> hb) & 1) v ^= b; }
      if (v !== 0) nonvanishing++;
    }
    report.push({ i, n, nonvanishing });
  }
  const total = report.reduce((s, r) => s + r.n, 0);
  const nz = report.reduce((s, r) => s + r.nonvanishing, 0);
  return { N, nEq, rank: pivCols.length, total, nz,
           allNonvanishing: nz === total, anyNonvanishing: nz > 0 };
}

// ------------------------------------------------------------------ controls
function fromRelations(rels) {
  // rels: [{ scope:[vars], tuples:[[v,...]] }] -> ctxs in the lib's shape
  return rels.map((r) => ({
    scope: r.scope,
    S: r.tuples.map((t) => t.reduce((m, b, i) => m | (b << i), 0)),
  }));
}

function show(name, ctxs) {
  const r = obstructionF2(ctxs);
  console.log(`  ${name.padEnd(46)} vars ${String(r.N).padStart(5)}  eqs ${String(r.nEq).padStart(6)}` +
    `  rank ${String(r.rank).padStart(5)}  gamma!=0 for ${r.nz}/${r.total} sections` +
    `   CSC: ${r.allNonvanishing}`);
  return r;
}

console.log('[A] controls: the invariant must fire where the literature says it fires');
// parity system x1+x2=0, x2+x3=0, x1+x3=1  (AvN over F_2, strongly contextual)
show('parity system (AvN, inconsistent)', fromRelations([
  { scope: [0, 1], tuples: [[0, 0], [1, 1]] },
  { scope: [1, 2], tuples: [[0, 0], [1, 1]] },
  { scope: [0, 2], tuples: [[0, 1], [1, 0]] },
]));
// same but consistent
show('parity system (consistent)', fromRelations([
  { scope: [0, 1], tuples: [[0, 0], [1, 1]] },
  { scope: [1, 2], tuples: [[0, 0], [1, 1]] },
  { scope: [0, 2], tuples: [[0, 0], [1, 1]] },
]));
// PR box: vars a0=0,a1=1,b0=2,b1=3
show('PR box (strongly contextual)', fromRelations([
  { scope: [0, 2], tuples: [[0, 0], [1, 1]] },
  { scope: [0, 3], tuples: [[0, 0], [1, 1]] },
  { scope: [1, 2], tuples: [[0, 0], [1, 1]] },
  { scope: [1, 3], tuples: [[0, 1], [1, 0]] },
]));
// a model with a global section
show('no-constraint model (global section exists)', fromRelations([
  { scope: [0, 1], tuples: [[0, 0], [0, 1], [1, 0], [1, 1]] },
  { scope: [1, 2], tuples: [[0, 0], [0, 1], [1, 0], [1, 1]] },
]));
// GHZ-style: three parity equations on 4 variables summing to a contradiction
show('4-variable parity contradiction', fromRelations([
  { scope: [0, 1], tuples: [[0, 0], [1, 1]] },
  { scope: [1, 2], tuples: [[0, 0], [1, 1]] },
  { scope: [2, 3], tuples: [[0, 0], [1, 1]] },
  { scope: [0, 3], tuples: [[0, 1], [1, 0]] },
]));

console.log('');
console.log('[B] the rung-2 family, at the first UNSATISFIABLE length L = f(a)+1');
for (const rule of [30, 120]) {
  for (let a = 1; a <= 7; a++) {
    const f = Math.max(longestAlternating({ rule, a, phase: 0, cap: 60 }),
                       longestAlternating({ rule, a, phase: 1, cap: 60 }));
    if (f >= 60) { console.log(`  rule ${rule} a=${a}: unbounded, no UNSAT length`); continue; }
    const L = f + 1;
    for (const phase of [0, 1]) {
      const sc = buildScenario({ rule, a, L, phase });
      const { ctxs, empty } = enforceCompatibility(sc);
      if (empty) { console.log(`  rule ${rule} a=${a} L=${L} p${phase}: local consistency alone refutes it`); continue; }
      show(`rule ${rule}  a=${a}  L=${L}  phase ${phase}  (UNSAT)`, ctxs);
    }
  }
}

console.log('');
console.log('[C] sanity: the same family at a SATISFIABLE length L = f(a)');
for (const a of [3, 5, 6]) {
  const f = Math.max(longestAlternating({ rule: 30, a, phase: 0, cap: 60 }),
                     longestAlternating({ rule: 30, a, phase: 1, cap: 60 }));
  const sc = buildScenario({ rule: 30, a, L: f, phase: 0 });
  const { ctxs, empty } = enforceCompatibility(sc);
  if (empty) { console.log(`  a=${a} L=${f}: emptied (unexpected)`); continue; }
  show(`rule 30  a=${a}  L=${f}  phase 0  (SAT)`, ctxs);
}
