// Parallax, 2026-09-13.  The decisive run: IS THE WIDTH BOUNDED IN a?
//
// parallax6_avn6.mjs used, for each phase, that phase's own first
// unsatisfiable length L - which varies with a and with the phase, so the
// widths it reports mix two effects.  At height cap 5 it gave rule 30
// 5, 6, 7, 7, 8, 8, 7 over a = 1..7, non-monotone, with phase 0 sitting at
// exactly 7 from a = 3 and phase 1 wandering; phase 1 is the one whose L is
// smaller, and fewer rows means fewer windows to build relations from.
//
// So: hold L FIXED at 12, which is past the first unsatisfiable length for
// every phase at every a <= 7, and sweep a.  Any remaining dependence on a is
// a real dependence.

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
function satisfiable(rule, a, L, phase) {
  const R = ruleFn(rule); const lo = -(a + L), top = L; const nFree = a + L - 1;
  for (let m = 0; m < (1 << nFree); m++) {
    let cur = new Uint8Array(top - lo + 1); let bit = 0;
    for (let x = -a; x <= L - 1; x++) { const v = (x === 0) ? phase % 2 : (m >> bit) & 1; if (x !== 0) bit++; cur[x - lo] = v; }
    let ok = true;
    for (let t = 0; t < L; t++) {
      if (cur[0 - lo] !== (t + phase) % 2) { ok = false; break; }
      const next = new Uint8Array(cur.length);
      for (let x = lo + 1; x < top; x++) next[x - lo] = R(cur[x - 1 - lo], cur[x - lo], cur[x + 1 - lo]);
      cur = next;
    }
    if (ok) return true;
  }
  return false;
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
function leastWidth(g, hmax, wmax, freeCap = 19) {
  const nw = ((g.nVars + 1) + 31) >> 5;
  const sink = { rows: [], skipped: 0, empty: false };
  for (const [v, b] of g.pinned) { const row = newRow(nw); row[v >> 5] ^= 1 << (v & 31); if (b) row[g.nVars >> 5] ^= 1 << (g.nVars & 31); sink.rows.push(row); }
  for (let w = 3; w <= wmax; w++) {
    for (let h = 2; h <= hmax; h++) relationsOfSize(g, h, w, freeCap, sink);
    if (sink.empty) return { w, byEmpty: true };
    if (!consistent(sink.rows, g.nVars)) return { w, byEmpty: false };
  }
  return { w: null };
}

const L = 12;   // past the first UNSAT length for every phase at every a <= 7
console.log(`block length held FIXED at L = ${L}; least refuting window width`);
for (const hmax of [4, 5]) {
  console.log(`  height cap ${hmax}`);
  console.log('    rule  a   phase 0   phase 1');
  for (const rule of [30, 120]) {
    for (let a = 1; a <= 7; a++) {
      const out = [];
      for (const p of [0, 1]) {
        if (satisfiable(rule, a, L, p)) { out.push('SAT'); continue; }
        const g = geometry({ rule, a, L, phase: p });
        const t0 = Date.now();
        const r = leastWidth(g, hmax, 14);
        out.push(`${r.w ?? '>14'}`);
        process.stderr.write(`      [rule ${rule} a=${a} p=${p} h<=${hmax} -> ${r.w ?? '-'} in ${((Date.now() - t0) / 1000).toFixed(0)}s]\n`);
      }
      console.log(`    ${String(rule).padStart(4)}  ${a}   ${out[0].padStart(5)}   ${out[1].padStart(5)}`);
    }
  }
}
