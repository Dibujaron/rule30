// Parallax, 2026-09-13. Shared machinery for the contextuality sighting.
//
// Builds the rung-2 alternation family as a MEASUREMENT SCENARIO in the sense
// of Abramsky-Brandenburger: a set X of variables ("measurements"), each with
// outcome set {0,1}; a cover M of X by contexts (the scopes of the local rule
// clauses); and for each context C a set S(C) of allowed local assignments
// ("the support of the empirical model").
//
// Geometry.  Cone distance a, block length L, phase p.  Row 0 is white at
// every x < -a, so row t is white at every x < -(a+t).  Only the causal
// triangle that can reach column 0 within L rows is kept: at row t the cells
// run x = -(a+t) .. L-1-t.  Column 0 is pinned to the alternating word
// c(t) = (t + p) mod 2.

export function ruleFn(rule) {
  return (l, c, r) => (rule >> (4 * l + 2 * c + r)) & 1;
}

export const WHITE = -1; // a cell outside the cone: constant 0

// ---------------------------------------------------------------- scenario
export function buildScenario({ rule, a, L, phase, pinEdge = false }) {
  const R = ruleFn(rule);
  const idx = new Map();
  const cells = [];
  const key = (t, x) => `${t},${x}`;
  const XL = (t) => -(a + t);
  const XR = (t) => L - 1 - t;
  for (let t = 0; t < L; t++)
    for (let x = XL(t); x <= XR(t); x++) {
      idx.set(key(t, x), cells.length);
      cells.push([t, x]);
    }
  const varOf = (t, x) => {
    if (t < 0 || t >= L) return null;
    if (x < XL(t)) return WHITE;       // outside the cone: constant white
    if (x > XR(t)) return null;         // outside the kept triangle
    return idx.get(key(t, x));
  };

  // pins: column 0 alternating; optionally the cone edge black at row 0
  const pin = new Map();
  for (let t = 0; t < L; t++) pin.set(varOf(t, 0), (t + phase) % 2);
  if (pinEdge) pin.set(varOf(0, -a), 1);

  // contexts: one per rule clause
  const contexts = [];
  for (let t = 0; t + 1 < L; t++)
    for (let x = XL(t + 1); x <= XR(t + 1); x++) {
      const o = varOf(t + 1, x);
      const l = varOf(t, x - 1), c = varOf(t, x), r = varOf(t, x + 1);
      if (o === null || l === null || c === null || r === null) continue;
      const slots = [l, c, r, o];
      // distinct real variables in this scope, in a canonical order
      const scope = [...new Set(slots.filter((v) => v !== WHITE))].sort((p, q) => p - q);
      const pos = new Map(scope.map((v, i) => [v, i]));
      const S = [];
      for (let m = 0; m < (1 << scope.length); m++) {
        const val = (v) => (v === WHITE ? 0 : (m >> pos.get(v)) & 1);
        if (R(val(l), val(c), val(r)) !== val(o)) continue;
        let ok = true;
        for (const v of scope) if (pin.has(v) && ((m >> pos.get(v)) & 1) !== pin.get(v)) { ok = false; break; }
        if (ok) S.push(m);
      }
      contexts.push({ scope, S, cell: [t + 1, x] });
    }
  return { rule, a, L, phase, cells, nVars: cells.length, contexts, pin, varOf, XL, XR };
}

// ------------------------------------------------------------ satisfiability
// DFS over row 0.  Fixing row 0 on [-a, k] determines column 0 down to t = k,
// so the alternation target prunes one row per cell fixed.
export function longestAlternating({ rule, a, phase, cap = 200, pinEdge = false }) {
  const R = ruleFn(rule);
  // state: row 0 cells at x = -a .. k, stored as array indexed from -a
  let best = 0;
  const row0 = [];
  // evolve the finite row [-a .. k] (white outside) and read column 0 down to t = k
  const check = (k) => {
    // cells -a .. k, plus enough white on the left: the cone reaches -(a+t)
    // build an array covering -(a+k) .. k
    const lo = -(a + k), hi = k;
    let cur = new Uint8Array(hi - lo + 1);
    for (let x = -a; x <= k; x++) cur[x - lo] = row0[x + a];
    let t = 0, want = phase % 2;
    if (cur[0 - lo] !== want) return { ok: false, depth: 0 };
    let depth = 1;
    for (t = 1; t <= k; t++) {
      const next = new Uint8Array(cur.length);
      for (let x = lo + 1; x <= hi - t; x++) {
        const li = x - 1 - lo, ci = x - lo, ri = x + 1 - lo;
        next[ci] = R(cur[li], cur[ci], cur[ri]);
      }
      cur = next;
      const want2 = (t + phase) % 2;
      if (cur[0 - lo] !== want2) return { ok: false, depth };
      depth++;
    }
    return { ok: true, depth };
  };
  // enumerate x = -a .. -1 freely (2^a), then x = 0 pinned, then extend right
  const nLeft = a;
  for (let m = 0; m < (1 << nLeft); m++) {
    if (pinEdge && a >= 1 && ((m >> 0) & 1) !== 1) continue; // bit 0 is x = -a
    row0.length = 0;
    for (let i = 0; i < nLeft; i++) row0.push((m >> i) & 1);
    row0.push(phase % 2); // x = 0
    // depth-first extension to the right
    const stack = [0];
    const rec = (k) => {
      const res = check(k);
      if (!res.ok) return;
      if (k + 1 > best) best = k + 1; // alternation verified for rows 0..k
      if (k + 1 >= cap) return;
      for (const b of [0, 1]) { row0.push(b); rec(k + 1); row0.pop(); }
    };
    rec(0);
  }
  return best;
}

// ------------------------------------------------- local (arc/pairwise) consistency
// Sheaf-theoretically: force the family { S(C) } to be a COMPATIBLE family,
// i.e. S(C)|_{C n C'} = S(C')|_{C n C'} for every pair.  This is exactly
// pairwise (arc) consistency.  If a context empties, the inconsistency has a
// bounded-width witness.
export function enforceCompatibility(sc, { verbose = false } = {}) {
  const ctxs = sc.contexts.map((c) => ({ ...c, S: c.S.slice() }));
  // index contexts by variable
  const byVar = new Map();
  ctxs.forEach((c, i) => c.scope.forEach((v) => {
    if (!byVar.has(v)) byVar.set(v, []);
    byVar.get(v).push(i);
  }));
  const project = (c, mask, vars) => {
    let out = 0;
    vars.forEach((v, j) => { if ((mask >> c.scope.indexOf(v)) & 1) out |= 1 << j; });
    return out;
  };
  let changed = true, rounds = 0;
  while (changed) {
    changed = false; rounds++;
    for (let i = 0; i < ctxs.length; i++) {
      const ci = ctxs[i];
      const neigh = new Set();
      ci.scope.forEach((v) => byVar.get(v).forEach((j) => { if (j !== i) neigh.add(j); }));
      for (const j of neigh) {
        const cj = ctxs[j];
        const shared = ci.scope.filter((v) => cj.scope.includes(v));
        if (shared.length === 0) continue;
        const allowed = new Set(cj.S.map((m) => project(cj, m, shared)));
        const kept = ci.S.filter((m) => allowed.has(project(ci, m, shared)));
        if (kept.length !== ci.S.length) { ci.S = kept; changed = true; }
        if (ci.S.length === 0) return { ctxs, empty: true, rounds };
      }
    }
    if (rounds > 200) break;
  }
  return { ctxs, empty: false, rounds };
}
