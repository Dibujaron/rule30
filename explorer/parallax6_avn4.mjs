// Parallax, 2026-09-13.  The AvN width hierarchy, third version and the one
// whose numbers the sighting document carries.
//
// parallax6_avn2.mjs and parallax6_avn3.mjs are kept in the tree with this
// defect named: they required a cell's three parents to be already in a
// "determined" set that was seeded only from the window's top row, so a cell
// whose parent was a CONSTANT (a cone-white cell, or a pinned column-0 cell)
// was classified free and ITS OWN CLAUSE WAS THEN NEVER CHECKED.  The supports
// came out too large, the affine relations too few, and every answer was
// conservative in the direction that flatters rule 30.  The tell was that the
// non-accumulated first version found a refutation at 4x5 where the
// accumulated version - which has strictly more constraints - found none.
//
// The fix: every in-grid cell is determined (constant, free, or derived), so a
// cell is derived exactly when its three parents lie in the window, and every
// clause wholly inside the window is enforced, whatever its output cell is.

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

function geometry({ rule, a, L, phase, rightBound = null }) {
  const R = ruleFn(rule);
  const XL = (t) => -(a + t), XR = (t) => L - 1 - t;
  const idx = new Map(); const cells = [];
  for (let t = 0; t < L; t++) for (let x = XL(t); x <= XR(t); x++) { idx.set(`${t},${x}`, cells.length); cells.push([t, x]); }
  const pinned = new Map();
  for (let t = 0; t < L; t++) pinned.set(idx.get(`${t},0`), (t + phase) % 2);
  if (rightBound !== null) for (let x = rightBound + 1; x <= XR(0); x++) if (x !== 0) pinned.set(idx.get(`0,${x}`), 0);
  const cell = (t, x) => {
    if (t < 0 || t >= L || x > XR(t)) return null;
    if (x < XL(t)) return { k: 'C', v: 0 };
    const i = idx.get(`${t},${x}`);
    return pinned.has(i) ? { k: 'C', v: pinned.get(i) } : { k: 'V', i };
  };
  return { R, rule, L, a, XL, XR, cell, pinned, nVars: cells.length };
}

function satisfiable(rule, a, L, phase, rightBound = null) {
  const R = ruleFn(rule); const lo = -(a + L), top = L;
  const hi = rightBound === null ? L - 1 : Math.min(rightBound, L - 1);
  const nFree = a + hi;
  for (let m = 0; m < (1 << nFree); m++) {
    let cur = new Uint8Array(top - lo + 1); let bit = 0;
    for (let x = -a; x <= hi; x++) { const v = (x === 0) ? phase % 2 : (m >> bit) & 1; if (x !== 0) bit++; cur[x - lo] = v; }
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
      // every in-grid cell is determined; a cell is DERIVED when its three
      // parents are in the window, and every clause inside is then enforced
      const clauses = [];
      const derivedKeys = new Set();
      for (let t = t0 + 1; t < t0 + h; t++) for (let x = x0; x < x0 + w; x++) {
        const k = `${t},${x}`; if (!grid.has(k)) continue;
        const pk = [`${t - 1},${x - 1}`, `${t - 1},${x}`, `${t - 1},${x + 1}`];
        if (!pk.every((p) => grid.has(p))) continue;
        clauses.push([k, ...pk]);
        if (grid.get(k).k === 'V') derivedKeys.add(k);
      }
      if (clauses.length === 0) continue;
      const scope = [...new Set([...grid.values()].filter((c) => c.k === 'V').map((c) => c.i))];
      if (scope.length === 0) continue;
      const freeKeys = [...grid.keys()].filter((k) => grid.get(k).k === 'V' && !derivedKeys.has(k));
      const uniqFree = [...new Set(freeKeys.map((k) => grid.get(k).i))];
      if (uniqFree.length > freeCap) { skipped++; continue; }
      const fpos = new Map(uniqFree.map((v, i) => [v, i]));
      const spos = new Map(scope.map((v, i) => [v, i]));
      const S = new Set();
      const rows = [...new Set([...grid.keys()].map((k) => +k.split(',')[0]))].sort((p, q) => p - q);
      for (let m = 0; m < (1 << uniqFree.length); m++) {
        const val = new Map(); let ok = true;
        for (const [k, c] of grid) if (c.k === 'C') val.set(k, c.v);
        for (const k of freeKeys) val.set(k, (m >> fpos.get(grid.get(k).i)) & 1);
        // fill derived row by row, then verify every clause
        for (const t of rows) for (const [k, l, c, r] of clauses) {
          if (+k.split(',')[0] !== t) continue;
          if (!val.has(k) && val.has(l) && val.has(c) && val.has(r)) val.set(k, g.R(val.get(l), val.get(c), val.get(r)));
        }
        for (const [k, l, c, r] of clauses) {
          if (!val.has(k) || !val.has(l) || !val.has(c) || !val.has(r)) { ok = false; break; }
          if (g.R(val.get(l), val.get(c), val.get(r)) !== val.get(k)) { ok = false; break; }
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
  return { avn: !consistent(rows, g.nVars), byEmpty: false, skipped };
}

function sweep(g, maxD) {
  for (let d = 2; d <= maxD; d++) {
    const r = avnAtWidth(g, d, d + 1);
    if (r.avn) return { width: `${d}x${d + 1}`, byEmpty: r.byEmpty, skipped: r.skipped };
  }
  return { width: null };
}

console.log('[A] matched two-sided control: row 0 white outside [-3, 3], column 0');
console.log('    alternating for L rows, L the first UNSAT length.  Quiescent rules only.');
console.log('    rule  affine?  first UNSAT L   least refuting window');
for (const rule of [90, 150, 60, 30, 120]) {
  let L = null;
  for (let k = 1; k <= 24; k++) if (!satisfiable(rule, 3, k, 0, 3)) { L = k; break; }
  if (L === null) { console.log(`    ${String(rule).padStart(4)}   -        none <= 24      -`); continue; }
  const g = geometry({ rule, a: 3, L, phase: 0, rightBound: 3 });
  const t0 = Date.now();
  const r = sweep(g, 6);
  const aff = [90, 150, 60].includes(rule) ? 'yes' : 'no ';
  console.log(`    ${String(rule).padStart(4)}   ${aff}      ${String(L).padStart(2)}              ` +
    `${r.width ?? 'none up to 6x7'}${r.byEmpty ? ' (a window had no local solution)' : ''}` +
    `   [${((Date.now() - t0) / 1000).toFixed(0)}s]`);
}

console.log('');
console.log('[B] the real rung-2 family (one-sided cone)');
console.log('    rule  a   L    least refuting window');
for (const rule of [30, 120]) {
  for (let a = 1; a <= 4; a++) {
    let L = null, phase = 0;
    for (const p of [0, 1]) { let k = 1; while (k <= 24 && satisfiable(rule, a, k, p)) k++; if (k <= 24 && (L === null || k > L)) { L = k; phase = p; } }
    if (L === null) { console.log(`    ${rule}    ${a}   -    no UNSAT length <= 24`); continue; }
    const g = geometry({ rule, a, L, phase });
    const t0 = Date.now();
    const r = sweep(g, 6);
    console.log(`    ${rule}    ${a}   ${String(L).padStart(2)}   ${r.width ?? 'none up to 6x7'}` +
      `${r.byEmpty ? ' (a window had no local solution)' : ''}   [${((Date.now() - t0) / 1000).toFixed(0)}s]`);
  }
}
