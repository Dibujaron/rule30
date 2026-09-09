/**
 * Independent re-implementation of the reachable-set DP, for verification of the
 * "maximum speed is exactly 1/2 over power-of-two rings" claim.
 *
 * Written from the DP definition in docs/connections/2026-09-09-computational-
 * mechanics-*.md section 3.1, not by copying explorer/mmc_*.cjs.
 *
 * The DP.  R(t+1) = union over x in R(t) of N(x), with L = S(t,x-1),
 * C = S(t,x), Rr = S(t,x+1):
 *     L = 0        -> {x-1}
 *     (1,0,0)      -> {x}
 *     (1,0,1)      -> [x+1, inf)
 *     (1,1,*)      -> [x,   inf)
 * The quantity of interest is the leftward drift of min R.
 *
 * TWO DP VARIANTS, IN OPPOSITE DIRECTIONS.  The transition is monotone in R
 * (each x contributes independently, and the union of images is monotone), so:
 *   - dpSub  truncates R to a finite window: a SUBSET, so min R can only rise,
 *            so the measured speed is a LOWER bound on the true speed.
 *   - dpSup  pulls the ray in to offset <= P and invents a ray when none is
 *            found: a SUPERSET, so min R can only fall, so the measured speed
 *            is an UPPER bound on the true speed.
 * Both have a finite state set, so both are cycle-detected and return an EXACT
 * rational, not a long-run average.
 *
 * Nothing here is a proof.
 */
'use strict';

function step30(row) {
  const n = row.length, out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const l = row[(i + n - 1) % n], c = row[i], r = row[(i + 1) % n];
    out[i] = (l ^ (c | r)) & 1;
  }
  return out;
}

const rowKey = (r) => Array.prototype.join.call(r, '');

/** The eventual cycle of a ring's orbit, as an array of rows. */
function attractor(row0) {
  const seen = new Map();
  const rows = [];
  let r = Uint8Array.from(row0);
  for (;;) {
    const k = rowKey(r);
    if (seen.has(k)) return rows.slice(seen.get(k));
    seen.set(k, rows.length);
    rows.push(r);
    r = step30(r);
  }
}

/**
 * Left diagonals of a spatially-N-periodic, temporally-T-periodic picture.
 * Diagonal d holds the cells (t, d - t).  Position is taken mod N and phase
 * mod T, so the pair (phase, position) cycles with period dividing N*T; scanning
 * t in [0, N*T) therefore sees every cell of the diagonal.  Only d mod N is
 * distinct.  Returns the list of d that are identically white.
 */
function whiteDiagonals(cyc, N) {
  const T = cyc.length, span = N * T, out = [];
  for (let d = 0; d < N; d++) {
    let allWhite = true;
    for (let t = 0; t < span; t++) {
      const x = ((d - t) % N + N) % N;
      if (cyc[t % T][x] !== 0) { allWhite = false; break; }
    }
    if (allWhite) out.push(d);
  }
  return out;
}

const isPow2 = (n) => n > 0 && (n & (n - 1)) === 0;

/** Classify one cell of the DP.  Returns [target offset, isRay]. */
function localMove(L, C, R, o) {
  if (L === 0) return [o - 1, false];
  if (C === 0 && R === 0) return [o, false];
  if (C === 0 && R === 1) return [o + 1, true];
  return [o, true];
}

/**
 * SUBSET DP: R held as a plain bit window [m, m+H).  Truncation drops
 * reachable positions, so min R is >= the truth and the speed is a LOWER bound.
 * Returns { num, den } with num/den = leftward cells per row, exactly, read off
 * the machine's own state cycle.  Also returns the state cycle length.
 */
function dpSub(cyc, N, H, budget = 400000) {
  const T = cyc.length;
  let m = 0, phase = 0;
  let set = new Uint8Array(H).fill(1);          // R(0) = [0, inf) truncated
  const seen = new Map();
  for (let step = 0; step < budget; step++) {
    const k = phase + '|' + (((m % N) + N) % N) + '|' + set.join('');
    const prev = seen.get(k);
    if (prev !== undefined) return { num: prev[1] - m, den: step - prev[0], cycLen: step - prev[0] };
    seen.set(k, [step, m]);
    const row = cyc[phase];
    const S = (x) => row[((x % N) + N) % N];
    const targets = [];
    let lo = Infinity;
    for (let o = 0; o < H; o++) {
      if (!set[o]) continue;
      const x = m + o;
      const [v, isRay] = localMove(S(x - 1), S(x), S(x + 1), o);
      targets.push([v, isRay]);
      if (v < lo) lo = v;
    }
    if (lo === Infinity) return null;           // R went empty: impossible, but guard
    const next = new Uint8Array(H);
    for (const [v, isRay] of targets) {
      const o = v - lo;
      if (isRay) { for (let j = Math.max(0, o); j < H; j++) next[j] = 1; }
      else if (o >= 0 && o < H) next[o] = 1;
    }
    m += lo;                                    // lo is relative to m
    set = next;
    phase = (phase + 1) % T;
  }
  return null;
}

/**
 * SUPERSET DP: R held as (point mask below rho) union [rho, inf), with the ray
 * offset capped at P.  Two over-approximations, both adding positions:
 *   - if the scan finds no ray-producing cell, a ray is invented at offset K;
 *   - if the true ray sits beyond P it is pulled in to P.
 * Adding positions can only lower min R, so the speed is an UPPER bound.
 * The scan runs to K = P + 3; every offset above K maps to at least K - 1 + 1
 * = K >= the ray offset, so the unscanned tail is already inside the ray.
 */
function dpSup(cyc, N, P, budget = 400000) {
  const T = cyc.length;
  const K = P + 3;
  let m = 0, phase = 0;
  let rho = 0, mask = 0;                        // R(0) = [0, inf)
  const seen = new Map();
  for (let step = 0; step < budget; step++) {
    const k = phase + '|' + (((m % N) + N) % N) + '|' + rho + '|' + mask;
    const prev = seen.get(k);
    if (prev !== undefined) return { num: prev[1] - m, den: step - prev[0], cycLen: step - prev[0] };
    seen.set(k, [step, m]);
    const row = cyc[phase];
    const S = (x) => row[((x % N) + N) % N];
    let ray = Infinity;
    const pts = [];
    for (let o = 0; o <= K; o++) {
      const inR = (o >= rho) || ((mask >>> o) & 1) === 1;
      if (!inR) continue;
      const x = m + o;
      const [v, isRay] = localMove(S(x - 1), S(x), S(x + 1), o);
      if (isRay) { if (v < ray) ray = v; }
      else pts.push(v);
    }
    if (ray === Infinity) ray = K;              // invented ray: a superset
    let lo = ray;
    for (const v of pts) if (v < lo) lo = v;
    let rhoN = ray - lo;
    if (rhoN > P) rhoN = P;                     // pull the ray in: a superset
    let maskN = 0;
    for (const v of pts) { const o = v - lo; if (o >= 0 && o < rhoN) maskN |= 1 << o; }
    m += lo;
    rho = rhoN; mask = maskN;
    phase = (phase + 1) % T;
  }
  return null;
}

/** Compare two exact rationals a, b as num/den (den > 0). */
const cmpRat = (a, b) => a.num * b.den - b.num * a.den;
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
const reduce = (r) => { const g = gcd(r.num, r.den); return { num: r.num / g, den: r.den / g }; };

/** A key identifying the background up to time shift and spatial rotation. */
function backgroundKey(cyc, N) {
  const T = cyc.length;
  let best = null;
  for (let s = 0; s < N; s++) {
    const rows = [];
    for (let t = 0; t < T; t++) {
      let str = '';
      for (let i = 0; i < N; i++) str += cyc[t][(i + s) % N];
      rows.push(str);
    }
    rows.sort();
    const cand = rows.join(',');
    if (best === null || cand < best) best = cand;
  }
  return T + ':' + best;
}

module.exports = { step30, attractor, whiteDiagonals, isPow2, dpSub, dpSup, cmpRat, reduce, gcd, backgroundKey, rowKey };
