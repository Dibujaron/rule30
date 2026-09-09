// maxTail(n) beyond exhaustive reach, by sampling -- with the sampler
// validated against the exhaustive answer wherever the exhaustive answer
// exists (n <= 32, from collapse_brute.cjs / collapse_tails.cjs).
//
// tail(r) is computed WITHOUT a membership set: every cycle length of
// T mod 2^n is a power of two dividing L = maxCycle(n) (checked in
// collapse_lift.cjs), so x is on a cycle iff T^L(x) = x.  Advance x and
// y = T^L(x) together; the first k with x_k == y_k is tail(r).
//
// A sampled max is a LOWER bound on maxTail.  The exhaustive census shows
// 3-6% of all states attain the max, so a 10^6 sample misses it with
// probability < 10^-13000 -- but the validation rows are what settle it.
//
// usage: node collapse_sample.cjs [nmax] [nmin] [samples]
const { makeStepBig, cyclicNodes } = require('./collapse_lib.cjs');

const EXHAUSTIVE = { // from collapse_brute.cjs, all 2^n starts
  4: 2, 5: 4, 6: 5, 7: 6, 8: 8, 9: 8, 10: 11, 11: 12, 12: 14, 13: 14, 14: 16,
  15: 17, 16: 19, 17: 22, 18: 22, 19: 26, 20: 26, 21: 29, 22: 29, 23: 31,
  24: 31, 25: 33, 26: 34, 27: 35, 28: 36, 29: 37, 30: 37, 31: 39, 32: 40,
};

function maxCycleOf(n) { // exact, by lifting; see collapse_lift.cjs
  let A = [0n, 1n];
  for (let m = 2; m <= n; m++) {
    const step = makeStepBig(m);
    const hi = 1n << BigInt(m - 1);
    const cand = [];
    for (const a of A) { cand.push(a); cand.push(a + hi); }
    const { cyclic, spectrum } = cyclicNodes(cand, step, (x) => x.toString(16));
    A = cand.filter((x) => cyclic.has(x.toString(16)));
    if (m === n) return { L: Math.max(...spectrum.keys()), size: A.length };
  }
  return { L: 1, size: A.length };
}

// two-word step for n <= 64, operating on (lo,hi) unsigned 32-bit halves
function tailFactory(n) {
  const hiMask = n <= 32 ? 0 : (n === 64 ? -1 : ((2 ** (n - 32)) - 1));
  const loMask = n >= 32 ? -1 : (2 ** n - 1);
  return function tail(lo0, hi0, L) {
    let xl = lo0 >>> 0, xh = hi0 >>> 0, yl = xl, yh = xh;
    for (let i = 0; i < L; i++) {
      const a = (yl << 2) >>> 0, ah = (((yh << 2) | (yl >>> 30)) >>> 0);
      const b = (yl << 1) >>> 0, bh = (((yh << 1) | (yl >>> 31)) >>> 0);
      const nl = ((a ^ (b | yl)) & loMask) >>> 0, nh = ((ah ^ (bh | yh)) & hiMask) >>> 0;
      yl = nl; yh = nh;
    }
    let k = 0;
    while (xl !== yl || xh !== yh) {
      let a = (xl << 2) >>> 0, ah = (((xh << 2) | (xl >>> 30)) >>> 0);
      let b = (xl << 1) >>> 0, bh = (((xh << 1) | (xl >>> 31)) >>> 0);
      const nxl = ((a ^ (b | xl)) & loMask) >>> 0, nxh = ((ah ^ (bh | xh)) & hiMask) >>> 0;
      a = (yl << 2) >>> 0; ah = (((yh << 2) | (yl >>> 30)) >>> 0);
      b = (yl << 1) >>> 0; bh = (((yh << 1) | (yl >>> 31)) >>> 0);
      const nyl = ((a ^ (b | yl)) & loMask) >>> 0, nyh = ((ah ^ (bh | yh)) & hiMask) >>> 0;
      xl = nxl; xh = nxh; yl = nyl; yh = nyh;
      k++;
      if (k > 1000) throw new Error('tail runaway at n=' + n);
    }
    return k;
  };
}

const nmax = Math.min(64, Number(process.argv[2] || 64));
const nmin = Number(process.argv[3] || 8);
const S = Number(process.argv[4] || 1e6);
console.log(`sampled maxTail: ${S.toExponential(0)} uniform random starts per n, plus r=1 and r=9`);
console.log(' n  sampledMax  exhaustive  agree  maxTail-n   ratio/n   tail(1)  tail(9)  L=maxCycle  |A|');
const rows = [];
for (let n = nmin; n <= nmax; n++) {
  const { L, size } = maxCycleOf(n);
  const tail = tailFactory(n);
  const loBits = Math.min(n, 32), hiBits = Math.max(0, n - 32);
  let best = 0;
  const t1 = tail(1, 0, L);
  const t9 = tail(9, 0, L);
  best = Math.max(t1, t9);
  for (let i = 0; i < S; i++) {
    const lo = (Math.random() * 2 ** loBits) >>> 0;
    const hi = hiBits ? (Math.random() * 2 ** hiBits) >>> 0 : 0;
    const t = tail(lo, hi, L);
    if (t > best) best = t;
  }
  const ex = EXHAUSTIVE[n];
  rows.push({ n, best });
  console.log(
    [String(n).padStart(2), String(best).padStart(11), (ex === undefined ? '-' : String(ex)).padStart(11),
     (ex === undefined ? '-' : (ex === best ? 'YES' : '*** NO ***')).padStart(6),
     String(best - n).padStart(10), (best / n).toFixed(4).padStart(9),
     String(t1).padStart(8), String(t9).padStart(8), String(L).padStart(11), String(size).padStart(5)].join(' ')
  );
}
// slope of maxTail over the last third
const from = rows[Math.floor(rows.length * 2 / 3)].n;
const pts = rows.filter((r) => r.n >= from);
const N = pts.length, sx = pts.reduce((a, r) => a + r.n, 0), sy = pts.reduce((a, r) => a + r.best, 0);
const sxx = pts.reduce((a, r) => a + r.n * r.n, 0), sxy = pts.reduce((a, r) => a + r.n * r.best, 0);
const slope = (N * sxy - sx * sy) / (N * sxx - sx * sx);
console.log(`least-squares maxTail over n=${from}..${nmax}:  ${slope.toFixed(4)} n + ${((sy - slope * sx) / N).toFixed(3)}`);
