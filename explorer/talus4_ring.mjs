// Talus, 2026-09-09. Exact preperiod of the orbit of 1 under g_n at large n,
// with no storage: keep the last P values in a ring and record the last time
// r_t != r_{t-p} for each candidate period p.
//
// For each n we report, for p in {1,2,4,8,16,32,64}:
//   lastDiff(p) = the largest t <= TMAX with r_t != r_{t-p}
// so the preperiod for period p is lastDiff(p)+1 (or "none in range" if the
// orbit never settles with that p inside TMAX).
//
// The wall reads the orbit at time 2k = 2(n-1). So p works for the wall's
// instance at k iff lastDiff(p) < 2k.

const PS = [1, 2, 4, 8, 16, 32, 64];
const MAXP = 64;

function run(n, tmax) {
  const mask = (1n << BigInt(n)) - 1n;
  const buf = new Array(MAXP + 1).fill(0n);
  let r = 1n & mask;
  buf[0] = r;
  const lastDiff = new Map(PS.map((p) => [p, -1]));
  for (let t = 1; t <= tmax; t++) {
    r = ((4n * r) ^ ((2n * r) | r)) & mask;
    buf[t % (MAXP + 1)] = r;
    for (const p of PS) {
      if (t >= p && buf[(t - p) % (MAXP + 1)] !== r) lastDiff.set(p, t);
    }
  }
  return lastDiff;
}

const NS = [
  4, 9, 10, 30, 31, 100, 200, 300, 400, 401, 402, 500, 1000, 2000, 3000, 4000, 5000, 5001,
];

console.log("n     k=n-1   2k      minimal p working at 2k   preperiod(that p)   ratio pre/n");
for (const n of NS) {
  const k = n - 1;
  const tmax = 2 * k + 2 * MAXP + 4;
  const ld = run(n, tmax);
  let best = null;
  for (const p of PS) {
    if (ld.get(p) >= 0 && ld.get(p) < 2 * k) { best = p; break; }
    if (ld.get(p) === -1 && 2 * k >= p) { best = p; break; }
  }
  const pre = best === null ? NaN : ld.get(best) + 1;
  console.log(
    `${String(n).padStart(5)} ${String(k).padStart(6)} ${String(2 * k).padStart(7)}   ${String(best).padStart(6)}                 ${String(pre).padStart(8)}          ${(pre / n).toFixed(4)}`,
  );
}
