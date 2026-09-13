// Parallax, 2026-09-13.  A referee for the AvN width machinery, written to a
// different convention rather than as a second implementation - my notebook
// says a referee written by the same head shares its assumptions.
//
// Two one-sided checks that cannot both pass if the support computation is
// wrong in either direction:
//
//   SOUNDNESS.  If the instance is SATISFIABLE, a global section satisfies
//   every equation the machinery can ever emit, so AvN must come back FALSE.
//   An AvN "yes" on a satisfiable instance is a proof of a bug.
//
//   COMPLETENESS ON THE LINEAR RULES.  For rules 90 and 150 every clause IS
//   one F_2 equation, so at the minimum window 2x3 the emitted system is
//   exactly the automaton's own linear system, and AvN must agree with
//   unsatisfiability EXACTLY, at every L, in both directions.
//
// Satisfiability is decided here by brute-force forward evolution, which
// shares no code with the window enumeration.

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
  return { R, L, a, XL, XR, cell, pinned, nVars: cells.length };
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
      const clauses = []; const derivedKeys = new Set();
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
      const rows = [...new Set([...grid.keys()].map((k) => +k.split(',')[0]))].sort((p, q) => p - q);
      const S = new Set();
      for (let m = 0; m < (1 << uniqFree.length); m++) {
        const val = new Map(); let ok = true;
        for (const [k, c] of grid) if (c.k === 'C') val.set(k, c.v);
        for (const k of freeKeys) val.set(k, (m >> fpos.get(grid.get(k).i)) & 1);
        for (const t of rows) for (const [k, l, c, r] of clauses) {
          if (+k.split(',')[0] !== t) continue;
          if (!val.has(k) && val.has(l) && val.has(c) && val.has(r)) val.set(k, g.R(val.get(l), val.get(c), val.get(r)));
        }
        for (const [k, l, c, r] of clauses) {
          if (!val.has(k)) { ok = false; break; }
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
  const nw = ((g.nVars + 1) + 31) >> 5; const rows = [];
  for (const [v, b] of g.pinned) { const row = newRow(nw); row[v >> 5] ^= 1 << (v & 31); if (b) row[g.nVars >> 5] ^= 1 << (g.nVars & 31); rows.push(row); }
  for (let h = 2; h <= hmax; h++) for (let w = 3; w <= wmax; w++) {
    const res = windowsOfSize(g, h, w, freeCap);
    if (res.unsatLocal) return true;
    for (const c of res.windows) for (const v of affineRelations(c.S, c.scope.length)) {
      const row = newRow(nw); let any = false;
      for (let i = 0; i < c.scope.length; i++) if (v[i]) { row[c.scope[i] >> 5] ^= 1 << (c.scope[i] & 31); any = true; }
      if (v[c.scope.length]) row[g.nVars >> 5] ^= 1 << (g.nVars & 31);
      if (any || v[c.scope.length]) rows.push(row);
    }
  }
  return !consistent(rows, g.nVars);
}

console.log('[R1] SOUNDNESS: AvN must never fire on a satisfiable instance');
let checked = 0, bad = 0;
for (const rule of [30, 120, 90, 150, 60]) {
  for (const a of [1, 2, 3]) for (const phase of [0, 1]) for (let L = 2; L <= 9; L++) {
    if (!satisfiable(rule, a, L, phase)) continue;
    const g = geometry({ rule, a, L, phase });
    const fired = avnAtWidth(g, 4, 5);
    checked++;
    if (fired) { bad++; console.log(`     VIOLATION rule ${rule} a=${a} L=${L} p${phase}: AvN fired on a SAT instance`); }
  }
}
console.log(`     ${checked} satisfiable instances tested, ${bad} violations`);

console.log('');
console.log('[R2] COMPLETENESS on the linear rules: at window 2x3, AvN must equal UNSAT');
let c2 = 0, b2 = 0;
for (const rule of [90, 150, 60]) {
  for (const a of [1, 2, 3, 4]) for (const phase of [0, 1]) for (let L = 2; L <= 11; L++) {
    const sat = satisfiable(rule, a, L, phase);
    const g = geometry({ rule, a, L, phase });
    const fired = avnAtWidth(g, 2, 3);
    c2++;
    if (fired === sat) { b2++; console.log(`     VIOLATION rule ${rule} a=${a} L=${L} p${phase}: SAT=${sat}, AvN=${fired}`); }
  }
}
console.log(`     ${c2} instances tested, ${b2} disagreements`);

console.log('');
console.log('[R3] the same, two-sided, where the linear system is genuinely overdetermined');
let c3 = 0, b3 = 0;
for (const rule of [90, 150]) {
  for (const a of [2, 3]) for (const b of [2, 3]) for (const phase of [0, 1]) for (let L = 2; L <= 12; L++) {
    const sat = satisfiable(rule, a, L, phase, b);
    const g = geometry({ rule, a, L, phase, rightBound: b });
    const fired = avnAtWidth(g, 2, 3);
    c3++;
    if (fired === sat) { b3++; console.log(`     VIOLATION rule ${rule} a=${a} b=${b} L=${L} p${phase}: SAT=${sat}, AvN=${fired}`); }
  }
}
console.log(`     ${c3} instances tested, ${b3} disagreements`);
