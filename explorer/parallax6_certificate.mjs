// Parallax, 2026-09-13.  Read the refutation.
//
// The AvN width hierarchy says the rung-2 family has an F_2 Gaussian-
// elimination refutation from windows of size 4x5 at a = 1, 5x6 at a = 2,
// 6x7 at a = 3.  A refutation over F_2 is an explicit subset of the emitted
// affine relations summing to 0 = 1.  This script extracts one, greedily
// minimises it, and prints where in the causal triangle its windows sit -
// because if the certificate is a recognisable object (a parity along the
// cone edge, say) the family is writable by hand for every a and the route
// closes, and if it is a different shapeless subset at every a the route is
// the board's "the core is the whole triangle" in a fifth vocabulary.

import { ruleFn } from './parallax6_lib.mjs';

function newRow(nw) { return new Uint32Array(nw); }
function lead(row, nw) { for (let w = 0; w < nw; w++) if (row[w] !== 0) return w * 32 + (31 - Math.clz32(row[w] & -row[w])); return -1; }
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
  return { R, L, a, XL, XR, cell, cells, pinned, nVars: cells.length };
}
function windowsOfSize(g, h, w, freeCap) {
  const out = [];
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
      if (uniqFree.length > freeCap) continue;
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
      out.push({ scope, S: [...S], h, w, t0, x0 });
    }
  return out;
}

function buildEquations(g, dmax, freeCap = 20) {
  const nw = ((g.nVars + 1) + 31) >> 5;
  const eqs = [];
  for (const [v, b] of g.pinned) {
    const row = newRow(nw); row[v >> 5] ^= 1 << (v & 31);
    if (b) row[g.nVars >> 5] ^= 1 << (g.nVars & 31);
    eqs.push({ row, tag: `pin ${JSON.stringify(g.cells[v])}` });
  }
  for (let h = 2; h <= dmax; h++) for (let w = 3; w <= dmax + 1; w++)
    for (const c of windowsOfSize(g, h, w, freeCap))
      for (const v of affineRelations(c.S, c.scope.length)) {
        const row = newRow(nw); let any = false;
        for (let i = 0; i < c.scope.length; i++) if (v[i]) { row[c.scope[i] >> 5] ^= 1 << (c.scope[i] & 31); any = true; }
        if (v[c.scope.length]) row[g.nVars >> 5] ^= 1 << (g.nVars & 31);
        if (any) eqs.push({ row, tag: `win ${h}x${w} @ t=${c.t0} x=${c.x0}`, h, w, t0: c.t0, x0: c.x0, scope: c.scope });
      }
  return eqs;
}

// Gaussian elimination over F_2 tracking which source equations were combined
function findCertificate(eqs, n) {
  const nw = ((n + 1) + 31) >> 5, cw = (eqs.length + 31) >> 5;
  const piv = new Map();
  for (let i = 0; i < eqs.length; i++) {
    const row = Uint32Array.from(eqs[i].row);
    const comb = new Uint32Array(cw); comb[i >> 5] ^= 1 << (i & 31);
    for (;;) {
      const l = lead(row, nw);
      if (l === -1) break;
      if (l === n) {                    // 0 = 1
        const support = [];
        for (let j = 0; j < eqs.length; j++) if ((comb[j >> 5] >> (j & 31)) & 1) support.push(j);
        return support;
      }
      const p = piv.get(l);
      if (!p) { piv.set(l, { row, comb }); break; }
      for (let w = 0; w < nw; w++) row[w] ^= p.row[w];
      for (let w = 0; w < cw; w++) comb[w] ^= p.comb[w];
    }
  }
  return null;
}
function inconsistent(eqs, idxs, n) {
  const nw = ((n + 1) + 31) >> 5; const piv = new Map();
  for (const i of idxs) {
    const row = Uint32Array.from(eqs[i].row);
    for (;;) { const l = lead(row, nw); if (l === -1) break; if (l === n) return true; const p = piv.get(l); if (!p) { piv.set(l, row); break; } for (let w = 0; w < nw; w++) row[w] ^= p[w]; }
  }
  return false;
}

for (const [a, d] of [[1, 4], [2, 5], [3, 6]]) {
  const L = 9, phase = 0;
  const g = geometry({ rule: 30, a, L, phase });
  const eqs = buildEquations(g, d);
  const cert = findCertificate(eqs, g.nVars);
  if (!cert) { console.log(`a=${a}: no refutation found at width ${d}`); continue; }
  // greedy minimisation
  let cur = cert.slice();
  let changed = true;
  while (changed) {
    changed = false;
    for (const j of cur.slice()) {
      const trial = cur.filter((x) => x !== j);
      if (inconsistent(eqs, trial, g.nVars)) { cur = trial; changed = true; }
    }
  }
  const pins = cur.filter((i) => eqs[i].tag.startsWith('pin'));
  const wins = cur.filter((i) => eqs[i].tag.startsWith('win'));
  const shapes = {};
  for (const i of wins) { const k = `${eqs[i].h}x${eqs[i].w}`; shapes[k] = (shapes[k] || 0) + 1; }
  const spots = wins.map((i) => `(t=${eqs[i].t0},x=${eqs[i].x0})`);
  console.log(`a=${a}  L=${L}  width ${d}x${d + 1}  |  ${eqs.length} equations emitted`);
  console.log(`   raw certificate ${cert.length} equations -> minimised ${cur.length}`);
  console.log(`   of which pins: ${pins.length}   window relations: ${wins.length}`);
  console.log(`   pinned cells used: ${pins.map((i) => eqs[i].tag.replace('pin ', '')).join(' ')}`);
  console.log(`   window shapes: ${JSON.stringify(shapes)}`);
  console.log(`   window positions: ${spots.join(' ')}`);
  console.log('');
}
