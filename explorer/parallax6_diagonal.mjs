// Parallax, 2026-09-13.  The brief's control: a family built along a LEFT
// DIAGONAL does glue (diagonal eventual periodicity is proved on this board),
// so if the contextuality invariants are nonzero there they are reading the
// encoding rather than the mathematics.
//
// Matched design: one triangle, one cone, one machinery; the only thing that
// changes is WHICH line of the picture is asked to have period 2.
//   line = column 0        -> this is rung 2 itself, and it is unsatisfiable
//   line = left diagonal k -> satisfiable, because the real picture does it
// The period-2 demand is imposed RELATIONALLY, as contexts { u, v } with
// support { 00, 11 } on pairs of cells two apart along the line, so the two
// cases differ in nothing but geometry.

import { ruleFn } from './parallax6_lib.mjs';

// The class must exclude the all-white configuration, or every period-2 demand
// is met by it for free - obstruction 30's trap.  evolve_left_edge makes the
// cone edge black, so pinning cell(0, -a) = 1 is legitimate and is class A2.
function build({ rule, a, L, line, k }) {
  const R = ruleFn(rule);
  const XL = (t) => -(a + t), XR = (t) => L - 1 - t;
  const idx = new Map(); const cells = [];
  for (let t = 0; t < L; t++) for (let x = XL(t); x <= XR(t); x++) { idx.set(`${t},${x}`, cells.length); cells.push([t, x]); }
  const V = (t, x) => (t < 0 || t >= L || x > XR(t)) ? null : (x < XL(t) ? 'W' : idx.get(`${t},${x}`));
  const contexts = [];
  contexts.push({ scope: [V(0, -a)], S: [1] });   // the cone edge is black
  for (let t = 0; t + 1 < L; t++)
    for (let x = XL(t + 1); x <= XR(t + 1); x++) {
      const o = V(t + 1, x), l = V(t, x - 1), c = V(t, x), r = V(t, x + 1);
      if (o === null || l === null || c === null || r === null) continue;
      const slots = [l, c, r, o];
      const scope = [...new Set(slots.filter((v) => v !== 'W'))].sort((p, q) => p - q);
      const pos = new Map(scope.map((v, i) => [v, i]));
      const S = [];
      for (let m = 0; m < (1 << scope.length); m++) {
        const val = (v) => (v === 'W' ? 0 : (m >> pos.get(v)) & 1);
        if (R(val(l), val(c), val(r)) === val(o)) S.push(m);
      }
      contexts.push({ scope, S });
    }
  // the line: column 0 is (j, 0); left diagonal k is (j + k, -j)
  const pt = (j) => (line === 'column' ? V(j, 0) : V(j + k, -j));
  const pts = [];
  for (let j = 0; ; j++) { const v = pt(j); if (v === null || v === 'W') break; pts.push(v); }
  for (let j = 0; j + 2 < pts.length; j++) {
    const u = pts[j], v = pts[j + 2];
    if (u === v) continue;
    const scope = [u, v].sort((p, q) => p - q);
    contexts.push({ scope, S: [0, 3] });
  }
  return { contexts, nVars: cells.length, nLine: pts.length, R, a, L, XL, XR, line, k };
}

function satisfiable(g) {
  const { R, a, L } = g;
  const lo = -(a + L), top = L;
  const nFree = a + L;                  // row 0 at x in [-a, L-1]
  for (let m = 0; m < (1 << nFree); m++) {
    if ((m & 1) !== 1) continue;        // bit 0 is x = -a: the cone edge is black
    let cur = new Uint8Array(top - lo + 1);
    for (let x = -a; x <= L - 1; x++) cur[x - lo] = (m >> (x + a)) & 1;
    const rows = [cur];
    for (let t = 1; t < L; t++) {
      const prev = rows[t - 1], next = new Uint8Array(prev.length);
      for (let x = lo + 1; x < top; x++) next[x - lo] = R(prev[x - 1 - lo], prev[x - lo], prev[x + 1 - lo]);
      rows.push(next);
    }
    const val = (j) => (g.line === 'column' ? rows[j][0 - lo] : rows[j + g.k][-j - lo]);
    let ok = true;
    for (let j = 0; j + 2 < g.nLine; j++) if (val(j) !== val(j + 2)) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

// ---- reuse the compatibility + obstruction code, inlined and minimal
function compat(ctxs0) {
  const ctxs = ctxs0.map((c) => ({ scope: c.scope, S: c.S.slice() }));
  const byVar = new Map();
  ctxs.forEach((c, i) => c.scope.forEach((v) => { if (!byVar.has(v)) byVar.set(v, []); byVar.get(v).push(i); }));
  const proj = (c, m, shared) => { let o = 0; shared.forEach((v, j) => { if ((m >> c.scope.indexOf(v)) & 1) o |= 1 << j; }); return o; };
  let changed = true, rounds = 0;
  while (changed && rounds < 200) {
    changed = false; rounds++;
    for (let i = 0; i < ctxs.length; i++) {
      const ci = ctxs[i];
      const neigh = new Set(); ci.scope.forEach((v) => byVar.get(v).forEach((j) => { if (j !== i) neigh.add(j); }));
      for (const j of neigh) {
        const cj = ctxs[j];
        const shared = ci.scope.filter((v) => cj.scope.includes(v));
        if (!shared.length) continue;
        const allowed = new Set(cj.S.map((m) => proj(cj, m, shared)));
        const kept = ci.S.filter((m) => allowed.has(proj(ci, m, shared)));
        if (kept.length !== ci.S.length) { ci.S = kept; changed = true; }
        if (!ci.S.length) return { ctxs, empty: true };
      }
    }
  }
  return { ctxs, empty: false };
}

function gamma(ctxs) {
  const start = []; let N = 0;
  for (const c of ctxs) { start.push(N); N += c.S.length; }
  const W = (N + 31) >> 5;
  const byVar = new Map();
  ctxs.forEach((c, i) => c.scope.forEach((v) => { if (!byVar.has(v)) byVar.set(v, []); byVar.get(v).push(i); }));
  const pairs = new Set();
  for (const list of byVar.values()) for (let p = 0; p < list.length; p++) for (let q = p + 1; q < list.length; q++) pairs.add(list[p] * 100000 + list[q]);
  const proj = (c, m, shared) => { let o = 0; shared.forEach((v, j) => { if ((m >> c.scope.indexOf(v)) & 1) o |= 1 << j; }); return o; };
  const lead = (row) => { for (let w = 0; w < W; w++) if (row[w]) return w * 32 + (31 - Math.clz32(row[w] & -row[w])); return -1; };
  const piv = new Map();
  const add = (cols) => {
    const row = new Uint32Array(W);
    for (const c of cols) row[c >> 5] ^= 1 << (c & 31);
    for (;;) { const l = lead(row); if (l === -1) return; const p = piv.get(l); if (!p) { piv.set(l, row); return; } for (let w = 0; w < W; w++) row[w] ^= p[w]; }
  };
  for (const key of pairs) {
    const i = Math.floor(key / 100000), j = key % 100000;
    const ci = ctxs[i], cj = ctxs[j];
    const shared = ci.scope.filter((v) => cj.scope.includes(v));
    if (!shared.length) continue;
    const fib = new Map();
    ci.S.forEach((m, k) => { const u = proj(ci, m, shared); if (!fib.has(u)) fib.set(u, []); fib.get(u).push(start[i] + k); });
    cj.S.forEach((m, k) => { const u = proj(cj, m, shared); if (!fib.has(u)) fib.set(u, []); fib.get(u).push(start[j] + k); });
    for (const cols of fib.values()) add(cols);
  }
  const cols = [...piv.keys()].sort((a, b) => b - a);
  for (const c of cols) { const row = piv.get(c); for (const d of cols) if (d > c && ((row[d >> 5] >> (d & 31)) & 1)) { const p = piv.get(d); for (let w = 0; w < W; w++) row[w] ^= p[w]; } }
  const isPiv = new Uint8Array(N); for (const c of cols) isPiv[c] = 1;
  const free = []; for (let c = 0; c < N; c++) if (!isPiv[c]) free.push(c);
  let nz = 0, total = 0;
  for (let i = 0; i < ctxs.length; i++) {
    const n = ctxs[i].S.length, s0 = start[i]; total += n;
    const basis = [];
    const push = (v0) => { let v = v0; for (const b of basis) { const hb = 31 - Math.clz32(b); if ((v >> hb) & 1) v ^= b; } if (v) { basis.push(v); basis.sort((p, q) => q - p); } };
    for (const f of free) {
      let vec = 0;
      for (let k2 = 0; k2 < n; k2++) { const c = s0 + k2; const val = c === f ? 1 : (isPiv[c] ? (piv.get(c)[f >> 5] >> (f & 31)) & 1 : 0); if (val) vec |= 1 << k2; }
      if (vec) push(vec);
    }
    for (let k2 = 0; k2 < n; k2++) { let v = 1 << k2; for (const b of basis) { const hb = 31 - Math.clz32(b); if ((v >> hb) & 1) v ^= b; } if (v) nz++; }
  }
  return { N, nz, total, allNZ: nz === total };
}

console.log('rule 30, cone distance a, block length L; period-2 demanded on one line');
console.log('line             a   L    SAT?    local consistency    gamma != 0 for');
for (const spec of [{ line: 'column', k: 0 }, { line: 'diag', k: 1 }, { line: 'diag', k: 2 }, { line: 'diag', k: 3 }, { line: 'diag', k: 4 }]) {
  for (const a of [3, 4]) {
    for (const L of [6, 8, 10, 12]) {
      const g = build({ rule: 30, a, L, line: spec.line, k: spec.k });
      const s = satisfiable(g);
      const { ctxs, empty } = compat(g.contexts);
      const r = empty ? null : gamma(ctxs);
      const name = spec.line === 'column' ? 'column 0' : `left diagonal ${spec.k}`;
      console.log(`${name.padEnd(17)}${a}   ${String(L).padStart(2)}   ${s ? 'SAT ' : 'UNSAT'}   ` +
        `${empty ? 'refutes it     ' : 'survives       '}     ` +
        `${r ? `${r.nz}/${r.total}  all: ${r.allNZ}` : '-'}`);
    }
  }
}
