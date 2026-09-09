// One incremental pass: attractor by lifting (exact) + sampled maxTail, for
// n = 1..NMAX.  Same tail(r) test as collapse_bigcheck.cjs, but the attractor
// tower is built once instead of being recomputed per n.
// Sampled max is a LOWER bound on maxTail(n).
//
// usage: node collapse_sweep.cjs [nmax] [samples] > out.txt
const { makeStepBig, cyclicNodes } = require('./collapse_lib.cjs');

const nmax = Number(process.argv[2] || 400);
const S = Number(process.argv[3] || 200);
let A = [0n, 1n];
const rows = [];
console.log(`  n  |attractor|  L  sampMax  tail(1)  tail(9)  max-n   max/n   max/(n*log2 n)   sqrt(2^n)`);
for (let n = 2; n <= nmax; n++) {
  const step = makeStepBig(n);
  const hi = 1n << BigInt(n - 1);
  const cand = [];
  for (const a of A) { cand.push(a); cand.push(a + hi); }
  const { cyclic, spectrum } = cyclicNodes(cand, step, (x) => x.toString(16));
  A = cand.filter((x) => cyclic.has(x.toString(16)));
  const L = Math.max(...spectrum.keys());
  const tail = (r) => {
    let x = r, y = r;
    for (let i = 0; i < L; i++) y = step(y);
    let k = 0;
    while (x !== y) { x = step(x); y = step(y); k++; if (k > 200000) throw new Error('runaway'); }
    return k;
  };
  const NB = BigInt(n);
  const mask = (1n << NB) - 1n;
  const t1 = tail(1n), t9 = tail(9n);
  let best = Math.max(t1, t9);
  for (let i = 0; i < S; i++) {
    let r = 0n;
    for (let b = 0; b < n; b += 30) r |= BigInt((Math.random() * 2 ** 30) >>> 0) << BigInt(b);
    const t = tail(r & mask);
    if (t > best) best = t;
  }
  rows.push({ n, best, A: A.length, L, t1, t9 });
  console.log([String(n).padStart(3), String(A.length).padStart(11), String(L).padStart(3),
    String(best).padStart(8), String(t1).padStart(8), String(t9).padStart(8), String(best - n).padStart(6),
    (best / n).toFixed(4).padStart(8), (best / (n * Math.log2(n))).toFixed(4).padStart(16),
    (n < 60 ? Math.sqrt(2 ** n).toExponential(2) : '2^' + (n / 2).toFixed(1)).padStart(11)].join(' '));
}
function fit(pts) {
  const N = pts.length, sx = pts.reduce((a, r) => a + r.n, 0), sy = pts.reduce((a, r) => a + r.best, 0);
  const sxx = pts.reduce((a, r) => a + r.n * r.n, 0), sxy = pts.reduce((a, r) => a + r.n * r.best, 0);
  const slope = (N * sxy - sx * sy) / (N * sxx - sx * sx);
  return { slope, icpt: (sy - slope * sx) / N };
}
for (const [lo, hi2] of [[8, 32], [33, 64], [65, 128], [129, 256], [257, nmax], [Math.floor(nmax / 2), nmax]]) {
  const pts = rows.filter((r) => r.n >= lo && r.n <= hi2);
  if (pts.length < 4) continue;
  const f = fit(pts);
  const rat = pts.map((r) => r.best / r.n);
  console.log(`fit n=${lo}..${hi2}: maxTail ~ ${f.slope.toFixed(4)} n + ${f.icpt.toFixed(2)}   ratio min ${Math.min(...rat).toFixed(3)} max ${Math.max(...rat).toFixed(3)} last ${rat[rat.length - 1].toFixed(3)}`);
}
