// STUB - DEFECTIVE, kept for the record.  Superseded by parallax6_avn4.mjs.
// It fixes the three faults listed below and carries a fourth of its own: a
// cell whose defining clause lies inside the window but one of whose parents
// is a CONSTANT (a cone-white or pinned cell) is classified free, and its own
// clause is then never enforced.  Supports come out too large, affine
// relations too few, and every answer is conservative in the direction that
// flatters rule 30.  avn4 enforces every clause wholly inside the window.
//
// Parallax, 2026-09-13.  The All-versus-Nothing hierarchy, done properly.
//
// Fixes three defects of parallax6_avn.mjs, all of which flattered the answer:
//  (i)  contexts are now ACCUMULATED - the system at width (h,w) contains every
//       window of size <= (h,w) - so the hierarchy is monotone by construction.
//  (ii) windows are enumerated over their FREE cells (top row plus the two
//       side columns) rather than over all their cells, so a 7x8 window costs
//       2^21 and not 2^56, and nothing is silently dropped.
//  (iii) only QUIESCENT rules are tested.  Rule 105 has R(0,0,0) = 1, so the
//       white background flips every step and the cone geometry below is
//       simply false for it - obstruction 27's trap, walked into once already.
//
// AvN at width (h,w) means: the F_2-affine relations satisfied by every local
// solution on every window of size <= (h,w), together with the pins, form an
// INCONSISTENT linear system.  That is a Gaussian-elimination refutation of
// the rung, and by ABKLM Theorem 22 it implies strong contextuality, i.e.
// unsatisfiability.  w*(a) = the least width at which it appears.

import { ruleFn } from './parallax6_lib.mjs';

function newRow(nw) { return new Uint32Array(nw); }
function lead(row, nw) {
  for (let w = 0; w < nw; w++) if (row[w] !== 0) return w * 32 + (31 - Math.clz32(row[w] & -row[w]));
  return -1;
}
function consistent(rows, n) {
  const nw = ((n + 1) + 31) >> 5;
  const piv = new Map();
  for (const r0 of rows) {
    const row = Uint32Array.from(r0);
    for (;;) {
      const l = lead(row, nw);
      if (l === -1) break;
      if (l === n) return false;
      const p = piv.get(l);
      if (!p) { piv.set(l, row); break; }
      for (let w = 0; w < nw; w++) row[w] ^= p[w];
    }
  }
  return true;
}
function affineRelations(S, k) {
  const n = k + 1, nw = (n + 31) >> 5;
  const piv = new Map();
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
  for (const c of cols) {
    const row = piv.get(c);
    for (const d of cols) if (d > c && ((row[d >> 5] >> (d & 31)) & 1)) {
      const p = piv.get(d); for (let w = 0; w < nw; w++) row[w] ^= p[w];
    }
  }
  const isPiv = new Uint8Array(n); for (const c of cols) isPiv[c] = 1;
  const out = [];
  for (let f = 0; f < n; f++) {
    if (isPiv[f]) continue;
    const v = new Uint8Array(n); v[f] = 1;
    for (const c of cols) v[c] = (piv.get(c)[f >> 5] >> (f & 31)) & 1;
    out.push(v);
  }
  return out;
}

function isQuiescent(rule) { return (rule & 1) === 0; }

function geometry({ rule, a, L, phase, rightBound = null }) {
  const R = ruleFn(rule);
  const XL = (t) => -(a + t), XR = (t) => L - 1 - t;
  const idx = new Map(); const cells = [];
  for (let t = 0; t < L; t++) for (let x = XL(t); x <= XR(t); x++) { idx.set(`${t},${x}`, cells.length); cells.push([t, x]); }
  const raw = (t, x) => (t < 0 || t >= L || x > XR(t)) ? null : (x < XL(t) ? { k: 'W', v: 0 } : { k: 'V', i: idx.get(`${t},${x}`) });
  const pinned = new Map();
  for (let t = 0; t < L; t++) pinned.set(idx.get(`${t},0`), (t + phase) % 2);
  if (rightBound !== null) for (let x = rightBound + 1; x <= XR(0); x++) if (x !== 0) pinned.set(idx.get(`0,${x}`), 0);
  // a cell is a CONSTANT if it is outside the cone or pinned
  const cell = (t, x) => {
    const r = raw(t, x);
    if (r === null) return null;
    if (r.k === 'W') return { k: 'C', v: 0 };
    if (pinned.has(r.i)) return { k: 'C', v: pinned.get(r.i) };
    return { k: 'V', i: r.i };
  };
  return { R, rule, L, a, XL, XR, cells, cell, pinned, nVars: cells.length };
}

function satisfiable(g, { rule, a, L, phase, rightBound }) {
  const R = ruleFn(rule);
  const hi = rightBound === null ? L - 1 : Math.min(rightBound, L - 1);
  const nFree = a + hi;                 // x in [-a, hi] minus the pinned x = 0
  for (let m = 0; m < (1 << nFree); m++) {
    const lo = -(a + L), top = L;
    let cur = new Uint8Array(top - lo + 1);
    let bit = 0;
    for (let x = -a; x <= hi; x++) {
      const v = (x === 0) ? phase % 2 : (m >> bit) & 1;
      if (x !== 0) bit++;
      cur[x - lo] = v;
    }
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

// all windows of exactly h x w; free cells = those whose defining clause is not
// wholly inside the window with already-determined parents
function windowsOfSize(g, h, w, freeCap) {
  const out = []; let skipped = 0;
  for (let t0 = 0; t0 + h <= g.L; t0++) {
    for (let x0 = g.XL(t0 + h - 1) - 1; x0 + w - 1 <= g.XR(t0); x0++) {
      const grid = new Map();           // "t,x" -> {k:'C',v} | {k:'V',i} | undefined (absent)
      for (let t = t0; t < t0 + h; t++) for (let x = x0; x < x0 + w; x++) {
        const c = g.cell(t, x);
        if (c !== null) grid.set(`${t},${x}`, c);
      }
      // derived cells, in row order
      const derived = [];               // [key, lKey, cKey, rKey]
      const determined = new Set();
      for (let x = x0; x < x0 + w; x++) if (grid.has(`${t0},${x}`)) determined.add(`${t0},${x}`);
      for (let t = t0 + 1; t < t0 + h; t++)
        for (let x = x0; x < x0 + w; x++) {
          const k = `${t},${x}`;
          if (!grid.has(k)) continue;
          const pk = [`${t - 1},${x - 1}`, `${t - 1},${x}`, `${t - 1},${x + 1}`];
          if (pk.every((p) => grid.has(p) && determined.has(p))) { derived.push([k, ...pk]); determined.add(k); }
        }
      if (derived.length === 0) continue;
      const freeKeys = [...grid.keys()].filter((k) => !derived.some((d) => d[0] === k) || false)
        .filter((k) => grid.get(k).k === 'V' && !derived.some((d) => d[0] === k));
      // variables of the context = every non-constant cell in the window
      const scope = [...new Set([...grid.values()].filter((c) => c.k === 'V').map((c) => c.i))];
      if (scope.length === 0) continue;
      const freeVars = freeKeys.map((k) => grid.get(k).i);
      const uniqFree = [...new Set(freeVars)];
      if (uniqFree.length > freeCap) { skipped++; continue; }
      const fpos = new Map(uniqFree.map((v, i) => [v, i]));
      const spos = new Map(scope.map((v, i) => [v, i]));
      const S = [];
      for (let m = 0; m < (1 << uniqFree.length); m++) {
        const val = new Map();
        let ok = true;
        for (const [k, c] of grid) if (c.k === 'C') val.set(k, c.v);
        for (const k of freeKeys) val.set(k, (m >> fpos.get(grid.get(k).i)) & 1);
        for (const [k, l, c, r] of derived) {
          const v = g.R(val.get(l), val.get(c), val.get(r));
          const cell = grid.get(k);
          if (cell.k === 'C') { if (cell.v !== v) { ok = false; break; } val.set(k, v); }
          else val.set(k, v);
        }
        if (!ok) continue;
        let mask = 0;
        for (const [k, c] of grid) if (c.k === 'V') { if (val.get(k)) mask |= 1 << spos.get(c.i); }
        S.push(mask);
      }
      if (S.length === 0) return { windows: null, unsatLocal: true, skipped };
      out.push({ scope, S: [...new Set(S)] });
    }
  }
  return { windows: out, unsatLocal: false, skipped };
}

function avnAtWidth(g, hmax, wmax, freeCap = 21) {
  const nw = ((g.nVars + 1) + 31) >> 5;
  const rows = [];
  for (const [v, b] of g.pinned) {
    const row = newRow(nw); row[v >> 5] ^= 1 << (v & 31);
    if (b) row[g.nVars >> 5] ^= 1 << (g.nVars & 31);
    rows.push(row);
  }
  let skipped = 0;
  for (let h = 2; h <= hmax; h++) for (let w = 3; w <= wmax; w++) {
    const res = windowsOfSize(g, h, w, freeCap);
    if (res.unsatLocal) return { avn: true, byEmptyContext: true, skipped };
    skipped += res.skipped;
    for (const c of res.windows)
      for (const v of affineRelations(c.S, c.scope.length)) {
        const row = newRow(nw); let any = false;
        for (let i = 0; i < c.scope.length; i++) if (v[i]) { row[c.scope[i] >> 5] ^= 1 << (c.scope[i] & 31); any = true; }
        if (v[c.scope.length]) row[g.nVars >> 5] ^= 1 << (g.nVars & 31);
        if (any || v[c.scope.length]) rows.push(row);
      }
  }
  return { avn: !consistent(rows, g.nVars), byEmptyContext: false, skipped, nEq: rows.length };
}

function firstUnsat(rule, a, phase, rightBound, cap = 30) {
  for (let L = 1; L <= cap; L++) {
    const g = geometry({ rule, a, L, phase, rightBound });
    if (!satisfiable(g, { rule, a, L, phase, rightBound })) return L;
  }
  return null;
}

console.log('[A] matched two-sided control, a = 3, b = 3, quiescent rules only');
console.log('    row 0 white outside [-3, 3]; column 0 alternating for L rows.');
console.log('    rule  linear?  first UNSAT L   least window (h,w) with an F_2 refutation');
for (const rule of [90, 150, 60, 30, 120, 110, 45]) {
  if (!isQuiescent(rule)) { console.log(`    rule ${rule}: NOT quiescent, cone geometry does not apply - skipped`); continue; }
  const L = firstUnsat(rule, 3, 0, 3);
  if (L === null) { console.log(`    ${String(rule).padStart(4)}   -        none <= 30      -`); continue; }
  const g = geometry({ rule, a: 3, L, phase: 0, rightBound: 3 });
  let found = null;
  outer: for (let d = 2; d <= 7; d++) {
    const r = avnAtWidth(g, d, d + 1);
    if (r.avn) { found = `${d}x${d + 1}` + (r.byEmptyContext ? ' (a window had no local solution)' : ''); break outer; }
  }
  const lin = [90, 150, 60].includes(rule) ? 'yes' : 'no ';
  console.log(`    ${String(rule).padStart(4)}   ${lin}      ${String(L).padStart(2)}              ${found ?? 'none up to 7x8'}`);
}

console.log('');
console.log('[B] the rung-2 family itself (one-sided cone), least refuting window');
console.log('    rule  a   L    least window (h,w) with an F_2 refutation');
for (const rule of [30, 120]) {
  for (let a = 1; a <= 6; a++) {
    let L = null, phase = 0;
    for (const p of [0, 1]) { const k = firstUnsat(rule, a, p, null, 26); if (k !== null && (L === null || k > L)) { L = k; phase = p; } }
    if (L === null) { console.log(`    ${rule}   ${a}   -    no UNSAT length <= 26`); continue; }
    const g = geometry({ rule, a, L, phase, rightBound: null });
    let found = null;
    for (let d = 2; d <= 7; d++) {
      const r = avnAtWidth(g, d, d + 1);
      if (r.avn) { found = `${d}x${d + 1}` + (r.byEmptyContext ? ' (empty context)' : ''); break; }
    }
    console.log(`    ${rule}   ${a}   ${String(L).padStart(2)}   ${found ?? 'none up to 7x8'}`);
  }
}
