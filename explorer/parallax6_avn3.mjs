// STUB - DEFECTIVE, kept for the record.  Superseded by parallax6_avn4.mjs.
// Shares parallax6_avn2.mjs's fault: a cell whose clause lies inside the
// window but one of whose parents is a constant is treated as free and its
// clause is never enforced, so the supports are too large and every answer is
// conservative in the direction that flatters rule 30.
//
// Parallax, 2026-09-13.  Part [B] of the AvN hierarchy, trimmed so it finishes.
// Same code as parallax6_avn2.mjs, restricted to the real one-sided rung-2
// family, width capped at 6x7, and with a per-width timer printed so the
// reader can see where the cost is.

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
function windowsOfSize(g, h, w, freeCap) {
  const out = []; let skipped = 0;
  for (let t0 = 0; t0 + h <= g.L; t0++)
    for (let x0 = g.XL(t0 + h - 1) - 1; x0 + w - 1 <= g.XR(t0); x0++) {
      const grid = new Map();
      for (let t = t0; t < t0 + h; t++) for (let x = x0; x < x0 + w; x++) { const c = g.cell(t, x); if (c !== null) grid.set(`${t},${x}`, c); }
      const derived = []; const determined = new Set();
      for (let x = x0; x < x0 + w; x++) if (grid.has(`${t0},${x}`)) determined.add(`${t0},${x}`);
      for (let t = t0 + 1; t < t0 + h; t++) for (let x = x0; x < x0 + w; x++) {
        const k = `${t},${x}`; if (!grid.has(k)) continue;
        const pk = [`${t - 1},${x - 1}`, `${t - 1},${x}`, `${t - 1},${x + 1}`];
        if (pk.every((p) => grid.has(p) && determined.has(p))) { derived.push([k, ...pk]); determined.add(k); }
      }
      if (derived.length === 0) continue;
      const derivedKeys = new Set(derived.map((d) => d[0]));
      const freeKeys = [...grid.keys()].filter((k) => grid.get(k).k === 'V' && !derivedKeys.has(k));
      const scope = [...new Set([...grid.values()].filter((c) => c.k === 'V').map((c) => c.i))];
      if (scope.length === 0) continue;
      const uniqFree = [...new Set(freeKeys.map((k) => grid.get(k).i))];
      if (uniqFree.length > freeCap) { skipped++; continue; }
      const fpos = new Map(uniqFree.map((v, i) => [v, i]));
      const spos = new Map(scope.map((v, i) => [v, i]));
      const S = new Set();
      for (let m = 0; m < (1 << uniqFree.length); m++) {
        const val = new Map(); let ok = true;
        for (const [k, c] of grid) if (c.k === 'C') val.set(k, c.v);
        for (const k of freeKeys) val.set(k, (m >> fpos.get(grid.get(k).i)) & 1);
        for (const [k, l, c, r] of derived) {
          const v = g.R(val.get(l), val.get(c), val.get(r));
          const cl = grid.get(k);
          if (cl.k === 'C') { if (cl.v !== v) { ok = false; break; } val.set(k, v); } else val.set(k, v);
        }
        if (!ok) continue;
        let mask = 0;
        for (const [k, c] of grid) if (c.k === 'V' && val.get(k)) mask |= 1 << spos.get(c.i);
        S.add(mask);
      }
      if (S.size === 0) return { windows: null, unsatLocal: true, skipped };
      out.push({ scope, S: [...S] });
    }
  return { windows: out, unsatLocal: false, skipped };
}
function avnAtWidth(g, hmax, wmax, freeCap = 20) {
  const nw = ((g.nVars + 1) + 31) >> 5; const rows = []; let skipped = 0;
  for (const [v, b] of g.pinned) { const row = newRow(nw); row[v >> 5] ^= 1 << (v & 31); if (b) row[g.nVars >> 5] ^= 1 << (g.nVars & 31); rows.push(row); }
  for (let h = 2; h <= hmax; h++) for (let w = 3; w <= wmax; w++) {
    const res = windowsOfSize(g, h, w, freeCap);
    if (res.unsatLocal) return { avn: true, byEmpty: true, skipped };
    skipped += res.skipped;
    for (const c of res.windows) for (const v of affineRelations(c.S, c.scope.length)) {
      const row = newRow(nw); let any = false;
      for (let i = 0; i < c.scope.length; i++) if (v[i]) { row[c.scope[i] >> 5] ^= 1 << (c.scope[i] & 31); any = true; }
      if (v[c.scope.length]) row[g.nVars >> 5] ^= 1 << (g.nVars & 31);
      if (any || v[c.scope.length]) rows.push(row);
    }
  }
  return { avn: !consistent(rows, g.nVars), byEmpty: false, skipped, nEq: rows.length };
}

console.log('the rung-2 family (one-sided cone) at its first UNSAT length');
console.log('a linear-algebra (F_2) refutation from windows of size <= (h,w)?');
console.log('rule  a   L    2x3   3x4   4x5   5x6   6x7      seconds');
for (const rule of [30, 120]) {
  for (let a = 1; a <= 5; a++) {
    let L = null, phase = 0;
    for (const p of [0, 1]) { let k = 1; while (k <= 24 && satisfiable(rule, a, k, p)) k++; if (k <= 24 && (L === null || k > L)) { L = k; phase = p; } }
    if (L === null) { console.log(`${rule}    ${a}   -    no UNSAT length <= 24`); continue; }
    const g = geometry({ rule, a, L, phase });
    const out = []; const t0 = Date.now();
    for (let d = 2; d <= 6; d++) {
      const r = avnAtWidth(g, d, d + 1);
      out.push(`${r.avn ? 'YES' : 'no '}${r.skipped ? '*' : ' '}`);
      if (r.avn) { while (out.length < 5) out.push('  - '); break; }
    }
    console.log(`${rule}    ${a}   ${String(L).padStart(2)}   ${out.join('   ')}    ${((Date.now() - t0) / 1000).toFixed(1)}`);
  }
}
console.log('(* = some window exceeded the 20-free-cell enumeration cap and was dropped,');
console.log(' so a "no" at that width is a lower bound on what the width could prove)');
