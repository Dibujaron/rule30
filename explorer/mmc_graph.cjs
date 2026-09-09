/**
 * The reachable-set machine as a finite weighted automaton, and its exact
 * maximum mean cycle.
 *
 *   node explorer/mmc_graph.cjs [P] [W] [Amax]
 *
 * STATE.  The DP of the connection document's 3.1 carries R(t) = (finite points)
 * union (upward ray).  Written relative to its own minimum m = min R(t), the
 * state is (rho, mask): the ray sits at offset rho and mask says which offsets
 * below rho are points.  rho is NOT bounded on a real background (measured max
 * 49 over 3e5 rows), so we CAP it at P: pulling the ray in replaces R by a
 * SUPERSET, the transition is monotone in R, so min R can only get smaller and
 * the speed can only get larger.  The cap is therefore sound for an upper bound,
 * and measured (explorer/mmc_cap_cost.cjs) it costs nothing at all from P = 2 up.
 *
 * LETTER.  The DP reads the background row at absolute positions
 * [m-1, m+P+2].  We carry a window b[0..W-1] with b[j] = S(t, m-1+j), W >= P+4.
 *
 * TWO CONSTRAINT LEVELS.
 *   free    - every row's window is chosen afresh with no constraint.
 *   rule30  - consecutive windows must satisfy rule 30 wherever both are known.
 *             Exactly two bits per step are unconstrained; which two depends on
 *             whether min R moved left, stayed, or moved right.  For a left move
 *             both are on the LEFT edge and they are genuinely free (rule 30 is
 *             left-permutive, so the background's continuation to the left can
 *             realise any value).  For a stay or a right move one or two are on
 *             the RIGHT edge, where a real background would have them determined
 *             by cells outside the window: allowing them freely only ADDS
 *             backgrounds, so this stays an upper bound.
 *
 * OPTIONAL EXTRA CONSTRAINT.  --A=k forbids more than k consecutive advances.
 * min R moves left exactly when S(t, m-1) = 0, and after an advance the front
 * reads the SAME left diagonal again, so k consecutive advances is k consecutive
 * white cells on one left diagonal.  A = infinity permits an all-white diagonal,
 * which is the document's Seam 2.
 *
 * WEIGHT.  m - m' in {1, 0, -1}: leftward displacement of min R.  The maximum
 * mean cycle is the worst-case leftward speed.
 *
 * Nothing here is a proof.
 */
'use strict';

const P = Number(process.env.P || 6);      // ray cap
const W = Number(process.env.W || 10);     // window width, needs W >= P + 4
const MODE = process.env.MODE || 'rule30'; // 'free' | 'rule30'
const AMAX = process.env.A === undefined ? Infinity : Number(process.env.A);
if (W < P + 4) throw new Error('need W >= P + 4');

// ---------------------------------------------------------------- shapes
const shapes = [];                       // [rho, mask]
const shapeIndex = new Int32Array((P + 1) << P).fill(-1);
for (let rho = 0; rho <= P; rho++) {
  const lim = rho === 0 ? 1 : 1 << rho;
  for (let mask = 0; mask < lim; mask++) {
    if (rho > 0 && !(mask & 1)) continue;
    shapeIndex[(rho << P) | mask] = shapes.length;
    shapes.push([rho, mask]);
  }
}
const NS = shapes.length;

// ---------------------------------------------------------------- DP step
// b is the window as an integer, bit j = S(t, m-1+j).
function dpStep(rho, mask, b) {
  let ray = -1;                    // offset from m, -1 = not yet found
  const pts = [];
  const OMAX = P + 1;
  for (let o = 0; o <= OMAX; o++) {
    const inR = (o >= rho) || ((mask >> o) & 1);
    if (!inR) continue;
    const L = (b >> o) & 1, C = (b >> (o + 1)) & 1, R = (b >> (o + 2)) & 1;
    if (L === 0) pts.push(o - 1);
    else if (C === 0 && R === 0) pts.push(o);
    else if (C === 0 && R === 1) { if (ray < 0 || o + 1 < ray) ray = o + 1; }
    else { if (ray < 0 || o < ray) ray = o; }
    if (ray >= 0 && o > ray + 1) break;
  }
  if (ray < 0) ray = OMAX + 1;                  // cap: pull the ray in
  let mo = ray;
  for (const v of pts) if (v < mo) mo = v;
  let rhoN = ray - mo;
  if (rhoN > P) rhoN = P;
  let maskN = 0;
  for (const v of pts) { const o = v - mo; if (o >= 0 && o < rhoN) maskN |= 1 << o; }
  return [mo, shapeIndex[(rhoN << P) | maskN]];  // mo = delta in {-1,0,1}
}

// next window under rule 30, given delta; free bit positions returned too
function nextWindow(b, delta) {
  let out = 0;
  const free = [];
  for (let j = 0; j < W; j++) {
    const i0 = delta + j - 1, i1 = delta + j, i2 = delta + j + 1;
    if (i0 >= 0 && i2 <= W - 1) {
      const v = ((b >> i0) & 1) ^ (((b >> i1) & 1) | ((b >> i2) & 1));
      out |= v << j;
    } else free.push(j);
  }
  return [out, free];
}

// ---------------------------------------------------------------- graph
const NW = 1 << W;
const AC = Number.isFinite(AMAX) ? AMAX + 1 : 1;   // advance-counter values
const nodeCount = MODE === 'free' ? NS * AC : NS * NW * AC;
const nodeId = MODE === 'free'
  ? (s, w, c) => s * AC + c
  : (s, w, c) => (s * NW + w) * AC + c;

// adjacency in CSR form
const outStart = new Int32Array(nodeCount + 1);
let edgeTotal = 0;
const weightOf = new Int8Array(nodeCount).fill(-2);   // -2 = dead / unset

// precompute the DP step for every (shape, window)
const stepDelta = new Int8Array(NS * NW);
const stepShape = new Int32Array(NS * NW);
for (let s = 0; s < NS; s++) {
  const [rho, mask] = shapes[s];
  for (let b = 0; b < NW; b++) {
    const [d, sn] = dpStep(rho, mask, b);
    stepDelta[s * NW + b] = d;
    stepShape[s * NW + b] = sn;
  }
}

function successors(s, w, c) {
  // returns [weight, [nodeIds]]; weight -2 means dead (no admissible continuation)
  if (MODE === 'free') {
    // the letter is the whole read window, free every step
    const outs = [];
    let wt = null;
    // one node per (shape, counter); its successors are over all letters,
    // and different letters have different weights, so 'free' needs edges to
    // carry the weight.  Handled by the caller via freeEdges below.
    return null;
  }
  const d = stepDelta[s * NW + w];
  const sn = stepShape[s * NW + w];
  const cn = d === -1 ? c + 1 : 0;
  if (Number.isFinite(AMAX) && cn > AMAX) return [-2, []];
  const c2 = Number.isFinite(AMAX) ? cn : 0;
  const [base, free] = nextWindow(w, d);
  const outs = [];
  for (let k = 0; k < (1 << free.length); k++) {
    let nb = base;
    for (let i = 0; i < free.length; i++) if ((k >> i) & 1) nb |= 1 << free[i];
    outs.push(nodeId(sn, nb, c2));
  }
  return [-d, outs];
}

// 'free' mode: edges carry weights, so build an explicit edge list
let edgeTo, edgeW;
if (MODE === 'free') {
  const heads = [];
  for (let s = 0; s < NS; s++) {
    for (let c = 0; c < AC; c++) {
      const list = [];
      for (let b = 0; b < NW; b++) {
        const d = stepDelta[s * NW + b];
        const sn = stepShape[s * NW + b];
        const cn = d === -1 ? c + 1 : 0;
        if (Number.isFinite(AMAX) && cn > AMAX) continue;
        list.push([nodeId(sn, 0, Number.isFinite(AMAX) ? cn : 0), -d]);
      }
      heads.push([nodeId(s, 0, c), list]);
    }
  }
  const tmp = new Map(heads.map(([n, l]) => [n, l]));
  outStart[0] = 0;
  const to = [], ws = [];
  for (let n = 0; n < nodeCount; n++) {
    const l = tmp.get(n) || [];
    for (const [u, wt] of l) { to.push(u); ws.push(wt); }
    outStart[n + 1] = to.length;
  }
  edgeTo = Int32Array.from(to); edgeW = Int8Array.from(ws);
} else {
  const to = [];
  outStart[0] = 0;
  for (let s = 0; s < NS; s++) for (let b = 0; b < NW; b++) for (let c = 0; c < AC; c++) {
    const n = nodeId(s, b, c);
    const [wt, outs] = successors(s, b, c);
    weightOf[n] = wt;
    // fill in order; nodes are enumerated in exactly nodeId order
  }
  // second pass to build CSR in node order
  let cursor = 0;
  const toArr = [];
  for (let n = 0; n < nodeCount; n++) {
    // decode
    const c = AC === 1 ? 0 : n % AC;
    const rest = AC === 1 ? n : (n - c) / AC;
    const b = rest % NW, s = (rest - b) / NW;
    const [wt, outs] = successors(s, b, c);
    for (const u of outs) toArr.push(u);
    outStart[n + 1] = toArr.length;
  }
  edgeTo = Int32Array.from(toArr);
  edgeW = null;   // weight is a node label
}
edgeTotal = edgeTo.length;

console.log(`mode=${MODE} P=${P} W=${W} A=${Number.isFinite(AMAX) ? AMAX : 'inf'}  shapes=${NS} nodes=${nodeCount} edges=${edgeTotal}`);

// ---------------------------------------------------------------- max cycle mean
const NEG = -1e18;
function edgeWeight(n, e) { return edgeW ? edgeW[e] : weightOf[n]; }

// (1) float value iteration to get a policy and an estimate
function floatVI(iters) {
  let v = new Float64Array(nodeCount);
  let nv = new Float64Array(nodeCount);
  const pol = new Int32Array(nodeCount).fill(-1);
  for (let k = 0; k < iters; k++) {
    for (let n = 0; n < nodeCount; n++) {
      const a = outStart[n], z = outStart[n + 1];
      if (a === z) { nv[n] = NEG; continue; }
      let best = NEG, bi = -1;
      for (let e = a; e < z; e++) {
        const cand = edgeWeight(n, e) + v[edgeTo[e]];
        if (cand > best) { best = cand; bi = e; }
      }
      nv[n] = best; pol[n] = bi;
    }
    // renormalise to keep numbers small
    let mx = NEG;
    for (let n = 0; n < nodeCount; n++) if (nv[n] > mx) mx = nv[n];
    if (mx > NEG / 2) for (let n = 0; n < nodeCount; n++) if (nv[n] > NEG / 2) nv[n] -= mx;
    const t = v; v = nv; nv = t;
  }
  return pol;
}

// (2) follow the policy from every node, collect the best exact cycle mean
function bestPolicyCycle(pol) {
  const state = new Int32Array(nodeCount);   // 0 unseen, else run id
  const order = new Int32Array(nodeCount).fill(-1);
  let best = null;
  let run = 0;
  for (let start = 0; start < nodeCount; start++) {
    if (state[start] !== 0 || pol[start] < 0) continue;
    run++;
    let n = start, k = 0;
    const path = [];
    while (n >= 0 && state[n] === 0) {
      state[n] = run; order[n] = k++; path.push(n);
      const e = pol[n];
      if (e < 0) { n = -1; break; }
      n = edgeTo[e];
    }
    if (n >= 0 && state[n] === run) {
      // cycle from order[n] to end of path
      const s0 = order[n];
      let sum = 0, len = 0;
      for (let i = s0; i < path.length; i++) { sum += edgeWeight(path[i], pol[path[i]]); len++; }
      if (best === null || sum * best[1] > best[0] * len) best = [sum, len];
    }
  }
  return best;
}

// (3) exact certificate: with w' = q*w - p, look for a potential phi with
//     phi(x) >= w'(x,u) + phi(u) for every edge.  Its existence proves no cycle
//     has mean > p/q.  Found by value iteration over paths of length <= k.
function certifyUpper(p, q, cap) {
  const BOUND = 4e15;
  let phi = new Float64Array(nodeCount);   // integers, held exactly (< 2^53)
  let nphi = new Float64Array(nodeCount);
  for (let k = 0; k < cap; k++) {
    let changed = false;
    for (let n = 0; n < nodeCount; n++) {
      let best = 0;                                  // the empty path
      const a = outStart[n], z = outStart[n + 1];
      for (let e = a; e < z; e++) {
        const cand = q * edgeWeight(n, e) - p + phi[edgeTo[e]];
        if (cand > best) best = cand;
      }
      if (best > BOUND) return { ok: false, reason: 'diverged' };
      nphi[n] = best;
      if (best !== phi[n]) changed = true;
    }
    const t = phi; phi = nphi; nphi = t;
    if (!changed) {
      // verify exactly
      for (let n = 0; n < nodeCount; n++) {
        const a = outStart[n], z = outStart[n + 1];
        for (let e = a; e < z; e++) {
          if (phi[n] < q * edgeWeight(n, e) - p + phi[edgeTo[e]]) return { ok: false, reason: 'verify failed' };
        }
      }
      return { ok: true, iters: k + 1 };
    }
  }
  return { ok: false, reason: 'cap reached' };
}

const pol = floatVI(Number(process.env.VI || 400));
const cyc = bestPolicyCycle(pol);
if (!cyc) { console.log('no cycle found by the policy'); process.exit(0); }
const [sum, len] = cyc;
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
const g = gcd(sum, len), p = sum / g, q = len / g;
console.log(`  best policy cycle: sum ${sum} over length ${len}  ->  mean ${p}/${q} = ${(p / q).toFixed(6)}`);
const cert = certifyUpper(p, q, Number(process.env.CAP || 4000));
if (cert.ok) {
  console.log(`  CERTIFIED: no cycle has mean > ${p}/${q}   (potential found in ${cert.iters} sweeps, verified on every edge)`);
  console.log(`  MAX MEAN CYCLE = ${p}/${q} = ${(p / q).toFixed(6)}   ${p / q < 0.5 ? '*** BELOW 1/2 ***' : (p === 1 && q === 2 ? '=== EXACTLY 1/2 ===' : '(at or above 1/2)')}`);
} else {
  console.log(`  certificate FAILED (${cert.reason}) - the cycle found is only a lower bound ${p}/${q}`);
}
