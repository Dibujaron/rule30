// The attractor (set of cyclic states) of T mod 2^n, computed EXACTLY for
// arbitrarily large n, without touching the 2^n state space.
//
// Why this is exact.  T is triangular (bit i of T(r) depends only on bits
// <= i of r), so reduction mod 2^(n-1) commutes with T.  Hence if a is on a
// cycle mod 2^n then a mod 2^(n-1) is on a cycle mod 2^(n-1).  So
//     attractor(n)  subset of  C := { a, a + 2^(n-1) : a in attractor(n-1) },
// and C is closed under T mod 2^n (because attractor(n-1) is T-invariant).
// So the whole attractor at level n lives inside a set of size
// 2*|attractor(n-1)| and can be found by ordinary cycle detection there.
//
// Validated against the exhaustive enumeration in collapse_brute.cjs.
//
// usage: node collapse_lift.cjs [nmax]   (default 400)
const { makeStepBig, cyclicNodes, fmtSpectrum } = require('./collapse_lib.cjs');

const nmax = Number(process.argv[2] || 400);
let A = [0n, 1n]; // attractor mod 2^1: T mod 2 is the identity
const rows = [];
console.log(' n  |attractor|  4n-18  diff  maxCycle  spectrum');
console.log(` 1  ${String(A.length).padStart(11)}`);
for (let n = 2; n <= nmax; n++) {
  const step = makeStepBig(n);
  const hi = 1n << BigInt(n - 1);
  const cand = [];
  for (const a of A) { cand.push(a); cand.push(a + hi); }
  const { cyclic, spectrum } = cyclicNodes(cand, step, (x) => x.toString(16));
  const next = cand.filter((x) => cyclic.has(x.toString(16)));
  const maxCycle = Math.max(...spectrum.keys());
  const diff = next.length - A.length;
  rows.push({ n, size: next.length, diff, maxCycle, spectrum });
  if (n <= 64 || n % 25 === 0 || n === nmax) {
    console.log(
      `${String(n).padStart(2)}  ${String(next.length).padStart(11)}  ${String(4 * n - 18).padStart(5)}  ${String(diff).padStart(4)}  ${String(maxCycle).padStart(8)}  ${fmtSpectrum(spectrum)}`
    );
  }
  A = next;
}
// growth-law check: |A(n)| - |A(n-1)| == maxCycle(n) ?
let bad = 0;
for (const r of rows) if (r.diff !== r.maxCycle) { bad++; if (bad <= 10) console.log(`  growth-law EXCEPTION at n=${r.n}: diff=${r.diff} maxCycle=${r.maxCycle}`); }
console.log(`growth law |A(n)|-|A(n-1)| == maxCycle(n): ${bad} exceptions over n=2..${nmax}`);
// linear fit of |A| over the tail half
const fitFrom = Math.max(8, Math.floor(nmax / 2));
const pts = rows.filter((r) => r.n >= fitFrom);
const N = pts.length;
const sx = pts.reduce((a, r) => a + r.n, 0), sy = pts.reduce((a, r) => a + r.size, 0);
const sxx = pts.reduce((a, r) => a + r.n * r.n, 0), sxy = pts.reduce((a, r) => a + r.n * r.size, 0);
const slope = (N * sxy - sx * sy) / (N * sxx - sx * sx);
const icpt = (sy - slope * sx) / N;
console.log(`least-squares |attractor(n)| over n=${fitFrom}..${nmax}:  ${slope.toFixed(4)} n + ${icpt.toFixed(3)}`);
