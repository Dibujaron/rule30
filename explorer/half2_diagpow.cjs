/**
 * The constraint the project actually has is about LEFT DIAGONALS, not rings.
 *
 *   node explorer/half2_diagpow.cjs [maxN]
 *
 * `leftDiagonal_periodicFrom_pow` says every left diagonal of the settled
 * picture is eventually periodic with period dividing a power of two, and
 * Topic 2 would say none is identically white.  explorer/mmc_pow2.cjs enforces
 * that through a SUFFICIENT condition -- take the ring width N and the row
 * period T both powers of two, so every diagonal period divides lcm(N, T),
 * itself a power of two.  That condition is strictly stronger than the
 * constraint, because a diagonal's ACTUAL minimal period can be a power of two
 * on a ring where lcm(N, T) is not.
 *
 * So: for every ring of every width, compute each left diagonal's actual minimal
 * period, keep the rings where every one of them is a power of two and none is
 * identically white, and take the maximum DP speed over those.  That is the
 * honest version of the same family, and it contains the ring family as a subset.
 *
 * Nothing here is a proof.
 */
'use strict';
const L = require('./half2_lib.cjs');

const maxN = Number(process.argv[2] || 16);
const half = { num: 1, den: 2 };
const f = (r) => { const q = L.reduce(r); return `${r.num}/${r.den} = ${q.num}/${q.den} = ${(r.num / r.den).toFixed(6)}`; };

/** minimal period of the left diagonal d, and whether it is identically white */
function diagonalInfo(cyc, N, d) {
  const T = cyc.length, span = N * T;
  const seq = new Uint8Array(span);
  let white = true;
  for (let t = 0; t < span; t++) {
    const v = cyc[t % T][((d - t) % N + N) % N];
    seq[t] = v;
    if (v !== 0) white = false;
  }
  let per = span;
  for (let p = 1; p <= span; p++) {
    if (span % p) continue;
    let ok = true;
    for (let t = 0; t < span && ok; t++) if (seq[t] !== seq[(t + p) % span]) ok = false;
    if (ok) { per = p; break; }
  }
  return { period: per, white };
}

function classify(cyc, N) {
  let allPow2 = true, anyWhite = false;
  const pers = [];
  for (let d = 0; d < N; d++) {
    const info = diagonalInfo(cyc, N, d);
    pers.push(info.period);
    if (info.white) anyWhite = true;
    if (!L.isPow2(info.period)) allPow2 = false;
  }
  return { allPow2, anyWhite, pers };
}

function cheapKey(cyc) { const r = cyc.map((x) => L.rowKey(x)); r.sort(); return r.join(','); }

/** speed of the REAL damage front on a wide tiling of this background */
function realFront(row, steps) {
  const N0 = row.length, copies = Math.ceil((6 * steps + 400) / N0), N = N0 * copies;
  const bg0 = new Uint8Array(N);
  for (let i = 0; i < N; i++) bg0[i] = row[i % N0];
  let b = bg0;
  const flip = Math.floor(N * 0.6 / N0) * N0;
  let cur = Uint8Array.from(bg0); cur[flip] ^= 1;
  let F = flip, seen = 0;
  for (let t = 0; t < steps; t++) {
    let got = null;
    for (let x = flip - steps - 5; x <= flip + steps + 5; x++) {
      const i = ((x % N) + N) % N;
      if (cur[i] !== b[i]) { got = x; break; }
    }
    if (got === null) break;
    F = got; seen++;
    cur = L.step30(cur); b = L.step30(b);
  }
  return seen ? (flip - F) / seen : 0;
}

let globalBest = null;
for (let N = 2; N <= maxN; N++) {
  const total = 1 << N;
  const seen = new Map();
  for (let it = 0; it < total; it++) {
    const row0 = new Uint8Array(N);
    for (let i = 0; i < N; i++) row0[i] = (it >>> i) & 1;
    const cyc = L.attractor(row0);
    const ck = cheapKey(cyc);
    if (seen.has(ck)) continue;
    seen.set(ck, { cyc, seed0: Array.from(row0).join('') });
  }
  let kept = 0, best = null, aboveHalf = [];
  const ringPow2 = [];
  for (const v of seen.values()) {
    const c = classify(v.cyc, N);
    if (c.anyWhite || !c.allPow2) continue;
    kept++;
    const lo = L.dpSub(v.cyc, N, 8 * N + 64);
    const hi = L.dpSup(v.cyc, N, 12);
    if (!lo || !hi) continue;
    v.lo = lo; v.hi = hi; v.pers = c.pers;
    v.front = realFront(v.cyc[0], 1500);
    if (best === null || L.cmpRat(lo, best.lo) > 0) best = v;
    if (L.cmpRat(lo, half) > 0) aboveHalf.push(v);
    if (L.isPow2(N) && L.isPow2(v.cyc.length)) ringPow2.push(v);
  }
  const maxFront = [...seen.values()].filter(v=>v.front!==undefined).reduce((a,v)=>Math.max(a,v.front),-1);
  console.log(`N=${String(N).padStart(2)}  distinct attractors ${String(seen.size).padStart(4)}   all-diagonal-periods-pow2 & no-white ${String(kept).padStart(4)}   best ${best ? f(best.lo) : '-'}   above 1/2: ${aboveHalf.length}   [ring-pow2 subset: ${ringPow2.length}]   max REAL front speed over survivors ${maxFront < 0 ? "-" : maxFront.toFixed(6)}`);
  for (const v of aboveHalf) {
    console.log(`    *** ABOVE 1/2  N=${N} seed ${v.seed0} rowPeriod ${v.cyc.length} lower ${f(v.lo)} upper ${f(v.hi)}`);
    console.log(`        diagonal minimal periods: ${v.pers.join(' ')}`);
    for (const r of v.cyc.slice(0, 14)) console.log('        ' + Array.from(r).map((x) => (x ? '#' : '.')).join(''));
    if (v.cyc.length > 14) console.log('        ...');
  }
  if (best && (globalBest === null || L.cmpRat(best.lo, globalBest.lo) > 0)) globalBest = { ...best, N };
}
console.log(`\nBEST over every ring of width <= ${maxN} whose left diagonals all have power-of-two minimal period and none is white:`);
if (globalBest) console.log(`  N=${globalBest.N} seed ${globalBest.seed0} rowPeriod ${globalBest.cyc.length}  speed ${f(globalBest.lo)}`);
