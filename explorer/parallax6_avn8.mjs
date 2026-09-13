// Parallax, 2026-09-13.  Try to break the 5x7 claim.
//
// parallax6_avn7.mjs says: at height cap 5 and fixed block length, the least
// refuting window width for rule 30's rung-2 family is 7 at a = 3, 4, 5, 6, 7.
// Five equal values is five equal values.  f(a) = 17 for a = 8..12, so L = 18
// is past the first unsatisfiable length for all of them, and a = 8 is the
// first place the claim can break.
//
// This is the one run whose result I would most like to be negative, so it is
// worth saying what a negative looks like: a width above 7 at a = 8 kills the
// constant and puts the route back to "finite but growing".

import { ruleFn } from './parallax6_lib.mjs';

function newRow(nw) { return new Uint32Array(nw); }
function lead(row, nw) { for (let w = 0; w < nw; w++) if (row[w] !== 0) return w * 32 + (31 - Math.clz32(row[w] & -row[w])); return -1; }
function consistent(rows, n) {
  const nw = ((n + 1) + 31) >> 5; const piv = new Map();
  for (const r0 of rows) {
    const row = Uint32Array.from(r0);
    for (;;) { const l = lead(row, nw); if (l === -1) break; if (l === n) return false; const p = piv.get(l); if (!p) { piv.set(l, row); break; } for (let w = 0; w < nw; w++) row[w] ^= p[w]; }
  }
  return true;
}
function affineRelations(S, k) {
  const n = k + 1, nw = (n + 31) >> 5; const piv = new Map();
  for (const m of S) {
    const row = newRow(nw);
    for (let i = 0; i < k; i++) if ((m >> i) & 1) row[i >> 5] |= 1 << (i & 31);
    row[k >> 5] |= 1 << (k & 31);
    for (;;) { const l = lead(row, nw); if (l === -1) break; const p = piv.get(l); if (!p) { piv.set(l, row); break; } for (let w = 0; w < nw; w++) row[w] ^= p[w]; }
  }
  const cols = [...piv.keys()].sort((a, b) => b - a);
  for (const c of cols) { const row = piv.get(c); for (const d of cols) if (d > c && ((row[d >> 5] >> (d & 31)) & 1)) { const p = piv.get(d); for (let w = 0; w < nw; w++) row[w] ^= p[w]; } }
  const isPiv = new Uint8Array(n); for (const c of cols) isPiv[c] = 1;
  const out = [];
  for (let f = 0; f < n; f++) { if (isPiv[f]) continue; const v = new Uint8Array(n); v[f] = 1; for (const c of cols) v[c] = (piv.get(c)[f >> 5] >> (f & 31)) & 1; out.push(v); }
  return out;
}
function geometry({ rule, a, L, phase }) {
  const R = ruleFn(rule);
  const XL = (t) => -(a + t), XR = (t) => L - 1 - t;
  const idx = new Map(); const cells = [];
  for (let t = 0; t < L; t++) for (let x = XL(t); x <= XR(t); x++) { idx.set(`${t},${x}`, cells.length); cells.push([t, x]); }
  const pinned = new Map();
  for (let t = 0; t < L; t++) pinned.set(idx.get(`${t},0`), (t + phase) % 2);
  const cell = (t, x) => {
    if (t < 0 || t >= L || x > XR(t)) return null;
    if (x < XL(t)) return { k: 'C', v: 0 };
    const i = idx.get(`${t},${x}`);
    return pinned.has(i) ? { k: 'C', v: pinned.get(i) } : { k: 'V', i };
  };
  return { R, L, a, XL, XR, cell, pinned, nVars: cells.length };
}
function relationsOfSize(g, h, w, freeCap, sink) {
  for (let t0 = 0; t0 + h <= g.L; t0++)
    for (let x0 = g.XL(t0 + h - 1) - 1; x0 + w - 1 <= g.XR(t0); x0++) {
      const grid = new Map();
      for (let t = t0; t < t0 + h; t++) for (let x = x0; x < x0 + w; x++) { const c = g.cell(t, x); if (c !== null) grid.set(`${t},${x}`, c); }
      const clauses = []; const derivedKeys = new Set();
      for (let t = t0 + 1; t < t0 + h; t++) for (let x = x0; x < x0 + w; x++) {
        const k = `${t},${x}`; if (!grid.has(k)) continue;
        const pk = [`${t - 1},${x - 1}`, `${t - 1},${x}`, `${t - 1},${x + 1}`];
        if (!pk.every((p) => grid.has(p))) continue;
        clauses.push([k, ...pk, t]);
        if (grid.get(k).k === 'V') derivedKeys.add(k);
      }
      if (clauses.length === 0) continue;
      const scope = [...new Set([...grid.values()].filter((c) => c.k === 'V').map((c) => c.i))];
      if (scope.length === 0) continue;
      const freeKeys = [...grid.keys()].filter((k) => grid.get(k).k === 'V' && !derivedKeys.has(k));
      const uniqFree = [...new Set(freeKeys.map((k) => grid.get(k).i))];
      if (uniqFree.length > freeCap) { sink.skipped++; continue; }
      const fpos = new Map(uniqFree.map((v, i) => [v, i]));
      const spos = new Map(scope.map((v, i) => [v, i]));
      clauses.sort((p, q) => p[4] - q[4]);
      const S = new Set();
      for (let m = 0; m < (1 << uniqFree.length); m++) {
        const val = new Map(); let ok = true;
        for (const [k, c] of grid) if (c.k === 'C') val.set(k, c.v);
        for (const k of freeKeys) val.set(k, (m >> fpos.get(grid.get(k).i)) & 1);
        for (const [k, l, c, r] of clauses) if (!val.has(k) && val.has(l) && val.has(c) && val.has(r)) val.set(k, g.R(val.get(l), val.get(c), val.get(r)));
        for (const [k, l, c, r] of clauses) { if (!val.has(k)) { ok = false; break; } if (g.R(val.get(l), val.get(c), val.get(r)) !== val.get(k)) { ok = false; break; } }
        if (!ok) continue;
        let mask = 0;
        for (const [k, c] of grid) if (c.k === 'V' && val.get(k)) mask |= 1 << spos.get(c.i);
        S.add(mask);
      }
      if (S.size === 0) { sink.empty = true; return; }
      const nw = ((g.nVars + 1) + 31) >> 5;
      for (const v of affineRelations([...S], scope.length)) {
        const row = newRow(nw); let any = false;
        for (let i = 0; i < scope.length; i++) if (v[i]) { row[scope[i] >> 5] ^= 1 << (scope[i] & 31); any = true; }
        if (v[scope.length]) row[g.nVars >> 5] ^= 1 << (g.nVars & 31);
        if (any) sink.rows.push(row);
      }
    }
}
function leastWidth(g, hmax, wmax, freeCap = 18) {
  const nw = ((g.nVars + 1) + 31) >> 5;
  const sink = { rows: [], skipped: 0, empty: false };
  for (const [v, b] of g.pinned) { const row = newRow(nw); row[v >> 5] ^= 1 << (v & 31); if (b) row[g.nVars >> 5] ^= 1 << (g.nVars & 31); sink.rows.push(row); }
  for (let w = 3; w <= wmax; w++) {
    for (let h = 2; h <= hmax; h++) relationsOfSize(g, h, w, freeCap, sink);
    process.stderr.write(`        (width ${w}: ${sink.rows.length} equations)\n`);
    if (sink.empty) return { w, byEmpty: true, skipped: sink.skipped };
    if (!consistent(sink.rows, g.nVars)) return { w, byEmpty: false, skipped: sink.skipped };
  }
  return { w: null, skipped: sink.skipped };
}

const L = 18;   // f(a) = 17 for a = 8..12, so L = 18 is the first UNSAT length
for (const a of [8, 9, 10]) {
  for (const p of [0, 1]) {
    const g = geometry({ rule: 30, a, L, phase: p });
    const t0 = Date.now();
    const r = leastWidth(g, 5, 9);
    console.log(`rule 30  a=${a}  L=${L}  phase ${p}  height cap 5  ->  least width ` +
      `${r.w ?? '> 9'}${r.skipped ? ` (${r.skipped} windows over the cap)` : ''}` +
      `   [${((Date.now() - t0) / 1000).toFixed(0)}s]`);
  }
}
