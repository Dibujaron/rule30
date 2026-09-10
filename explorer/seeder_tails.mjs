// Preperiod ("tail") structure of the truncated rule 30 row map.
//
//   rowStep r = (4r) XOR ((2r) OR r),  stepMod n r = rowStep r mod 2^n
//
// Crystal 61 asks: for every n and EVERY start r < 2^n, is the orbit repeating
// by step 2(n-1) with period 2^(n-1)?  This script measures the max tail over
// all starts, over ODD starts only, and over EVEN starts only, plus the max
// cycle length, for each width n.  The point of the odd/even split is
// `stepMod_iterate_two_mul`: even states are a scaled copy of width n-1, so an
// induction on n gets them free and the residual is the odd states.
//
//   node explorer/seeder_tails.mjs [maxN]

const maxN = Number(process.argv[2] ?? 20);

function tailsAndCycles(n) {
  const N = 1 << n;
  const mask = N - 1;
  const f = new Int32Array(N);
  for (let r = 0; r < N; r++) f[r] = ((4 * r) ^ ((2 * r) | r)) & mask;

  const tail = new Int32Array(N).fill(-1);
  const cyclen = new Int32Array(N).fill(-1); // length of the cycle x lands on
  const mark = new Int32Array(N).fill(0);
  const path = new Int32Array(N + 8);

  let stamp = 0;
  for (let start = 0; start < N; start++) {
    if (tail[start] >= 0) continue;
    stamp++;
    let len = 0;
    let x = start;
    while (tail[x] < 0 && mark[x] !== stamp) {
      mark[x] = stamp;
      path[len++] = x;
      x = f[x];
    }
    let base, baseCyc;
    if (tail[x] >= 0) {
      base = tail[x];
      baseCyc = cyclen[x];
    } else {
      // found a fresh cycle: x is on it, and it appears in path
      let i = len - 1;
      let c = 1;
      while (path[i] !== x) { i--; c++; }
      for (let j = i; j < len; j++) { tail[path[j]] = 0; cyclen[path[j]] = c; }
      len = i;
      base = 0;
      baseCyc = c;
    }
    for (let j = len - 1; j >= 0; j--) {
      base += 1;
      tail[path[j]] = base;
      cyclen[path[j]] = baseCyc;
    }
  }

  let maxAll = 0, maxOdd = 0, maxEven = 0, maxCyc = 0;
  let argAll = 0, argOdd = 0;
  for (let x = 0; x < N; x++) {
    if (tail[x] > maxAll) { maxAll = tail[x]; argAll = x; }
    if (x & 1) { if (tail[x] > maxOdd) { maxOdd = tail[x]; argOdd = x; } }
    else if (tail[x] > maxEven) maxEven = tail[x];
    if (cyclen[x] > maxCyc) maxCyc = cyclen[x];
  }
  return { maxAll, maxOdd, maxEven, maxCyc, argAll, argOdd, seedTail: tail[1 & mask], seedCyc: cyclen[1 & mask] };
}

console.log('n  maxTail(all)  maxTail(odd)  maxTail(even)  maxCycle  budget=2(n-1)  seedTail seedCyc');
for (let n = 1; n <= maxN; n++) {
  const r = tailsAndCycles(n);
  const budget = 2 * (n - 1);
  const ok = r.maxAll <= budget ? 'ok ' : 'OVER';
  console.log(
    String(n).padStart(2), String(r.maxAll).padStart(12), String(r.maxOdd).padStart(13),
    String(r.maxEven).padStart(14), String(r.maxCyc).padStart(9), String(budget).padStart(14),
    ok, String(r.seedTail).padStart(6), String(r.seedCyc).padStart(5));
}
