// Independent BigInt re-implementation of tail(r) for T mod 2^n, used to
// cross-check the two-word 32-bit arithmetic in collapse_sample.cjs, and to
// push tail(1) / tail(9) / a small random sample far past n = 64.
//
// r = 9 attains maxTail at every n in 4..32 except n = 11 (exhaustive census,
// collapse_tails.cjs), so tail_n(9) is a sharp lower bound on maxTail(n).
//
// usage: node collapse_bigcheck.cjs [nmax] [nmin] [samples]
const { makeStepBig, cyclicNodes } = require('./collapse_lib.cjs');

function attractorAndL(n) {
  let A = [0n, 1n], spec = new Map([[1, 2]]);
  for (let m = 2; m <= n; m++) {
    const step = makeStepBig(m);
    const hi = 1n << BigInt(m - 1);
    const cand = [];
    for (const a of A) { cand.push(a); cand.push(a + hi); }
    const { cyclic, spectrum } = cyclicNodes(cand, step, (x) => x.toString(16));
    A = cand.filter((x) => cyclic.has(x.toString(16)));
    spec = spectrum;
  }
  return { L: Math.max(...spec.keys()), size: A.length, spec };
}

function tailBig(r, n, L) {
  const step = makeStepBig(n);
  let x = r, y = r;
  for (let i = 0; i < L; i++) y = step(y);
  let k = 0;
  while (x !== y) { x = step(x); y = step(y); k++; if (k > 100000) throw new Error('runaway'); }
  return k;
}

const nmax = Number(process.argv[2] || 200);
const nmin = Number(process.argv[3] || 8);
const S = Number(process.argv[4] || 400);
console.log(`BigInt arithmetic (independent of the 32-bit path).  ${S} random starts per n, plus r=1, r=9.`);
console.log(' n   tail(1)  tail(9)  sampMax  best-n   best/n   L   |A|');
const rows = [];
for (let n = nmin; n <= nmax; n++) {
  const { L, size } = attractorAndL(n);
  const t1 = tailBig(1n, n, L);
  const t9 = tailBig(9n, n, L);
  let best = Math.max(t1, t9);
  const NB = BigInt(n);
  for (let i = 0; i < S; i++) {
    let r = 0n;
    for (let b = 0; b < n; b += 30) r |= BigInt((Math.random() * 2 ** 30) >>> 0) << BigInt(b);
    r &= (1n << NB) - 1n;
    const t = tailBig(r, n, L);
    if (t > best) best = t;
  }
  rows.push({ n, best, t1, t9 });
  console.log([String(n).padStart(3), String(t1).padStart(8), String(t9).padStart(8), String(best).padStart(8),
    String(best - n).padStart(7), (best / n).toFixed(4).padStart(8), String(L).padStart(3), String(size).padStart(5)].join(' '));
}
const half = rows.filter((r) => r.n > (nmin + nmax) / 2);
const N = half.length, sx = half.reduce((a, r) => a + r.n, 0), sy = half.reduce((a, r) => a + r.best, 0);
const sxx = half.reduce((a, r) => a + r.n * r.n, 0), sxy = half.reduce((a, r) => a + r.n * r.best, 0);
const slope = (N * sxy - sx * sy) / (N * sxx - sx * sx);
console.log(`least-squares over upper half n=${half[0].n}..${nmax}: ${slope.toFixed(4)} n + ${((sy - slope * sx) / N).toFixed(2)}`);
// also fit best ~ a*n*log2(n)/?? and best/n trend
console.log('best/n at the last five n: ' + rows.slice(-5).map((r) => `${r.n}:${(r.best / r.n).toFixed(3)}`).join('  '));
