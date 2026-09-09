/**
 * Is the left damage front in the KPZ class? The wandering exponent of F(t).
 *
 *   node explorer/rosetta_kpz.mjs
 *
 * F(t) is the leftmost cell where the seed's picture differs from the settled
 * picture S. It runs at a measured 0.2497 cells per row. A growth front in the
 * KPZ class wanders about its mean like t^(1/3); a front driven by an
 * effectively independent environment wanders like t^(1/2); a front pinned by
 * a periodic environment wanders like t^0.
 *
 * This script tracks F to T rows, fits the drift over the second half, and
 * measures the structure function of the deviation D(t) = F(t) + lambda t,
 *
 *   sigma(s) = ( mean over t of ( D(t+s) - D(t) )^2 ) ^ (1/2),
 *
 * over dyadic scales s, and reports the log-log slope, which is the wandering
 * exponent chi: 1/3 for KPZ, 1/2 for diffusive, 0 for pinned. It also reports
 * the retreat-size tail, which is what any random-walk model of the front has
 * to reproduce.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F as solveF, at } from './settledwords.mjs';

const T = 400000;
const SMALL = 40;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= T + 2 * SMALL; k++) {
  const sols = solveF(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const sat = (k, j) => at(S[k], j);

const base = centerBitIndex(T);
const NONE = 0x7fffffff;
const Ft = new Int32Array(T).fill(NONE);
const retreat = new Map();
let Fp = NONE, t = 0;
for (const row of rows(T)) {
  let lo, hi;
  if (t < SMALL) { lo = -t; hi = t + SMALL; } else { lo = Math.max(-t, Fp - 2); hi = 0; }
  const width = hi - lo + 1;
  const str = ((row >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
  let Fn = NONE;
  for (let x = lo; x <= hi; x++) {
    const bit = str.charCodeAt(width - 1 - (x - lo)) === 49 ? 1 : 0;
    if (bit !== sat(t + x, -x)) { Fn = x; break; }
  }
  if (Fn !== NONE && Fp !== NONE && Fn > Fp) retreat.set(Fn - Fp, (retreat.get(Fn - Fp) || 0) + 1);
  Ft[t] = Fn; Fp = Fn; t++;
}
console.log(`front tracked to t = ${T - 1} (${Date.now() - t0} ms); F(${T - 1}) = ${Ft[T - 1]} (${(-Ft[T - 1] / (T - 1)).toFixed(5)} t), kappa = ${T - 1 + Ft[T - 1]}`);

const A = Math.floor(T / 2);
const lambda = -(Ft[T - 1] - Ft[A]) / (T - 1 - A);
console.log(`drift over the second half: lambda = ${lambda.toFixed(5)}; over the whole run ${(-Ft[T - 1] / (T - 1)).toFixed(5)}`);

const D = new Float64Array(T);
for (let i = A; i < T; i++) D[i] = Ft[i] + lambda * i;
const out = [];
for (let j = 3; (1 << j) < (T - A) / 8; j++) {
  const s = 1 << j;
  // the VARIANCE of the increments, not the second moment: a residual error in the
  // drift fit adds a constant to every increment and would otherwise fake slope 1
  let sum = 0, sq = 0, n = 0;
  for (let i = A; i + s < T; i += Math.max(1, s >> 3)) { const d = D[i + s] - D[i]; sum += d; sq += d * d; n++; }
  out.push({ s, sigma: Math.sqrt(sq / n - (sum / n) ** 2), bias: sum / n });
}
console.log('structure function of D(t) = F(t) + lambda t:');
for (let i = 0; i < out.length; i++) {
  const slope = i > 0 ? Math.log(out[i].sigma / out[i - 1].sigma) / Math.log(out[i].s / out[i - 1].s) : NaN;
  console.log(`   s = ${String(out[i].s).padStart(6)}: sigma = ${out[i].sigma.toFixed(3)}, residual drift per step ${(out[i].bias / out[i].s).toExponential(2)}${i > 0 ? `, local slope ${slope.toFixed(3)}` : ''}`);
}
const first = out[Math.max(0, out.length - 6)], last = out[out.length - 1];
console.log(`wandering exponent over the top scales: ${(Math.log(last.sigma / first.sigma) / Math.log(last.s / first.s)).toFixed(3)} (1/3 = KPZ, 1/2 = diffusive, 0 = pinned)`);
console.log(`retreat sizes: ${[...retreat.entries()].sort((a, b) => a[0] - b[0]).map(([r, n]) => `${r}:${n}`).join(' ')}`);
console.log(`(${Date.now() - t0} ms)`);
