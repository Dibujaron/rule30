// Independent check of two of Sextant's claims, with no shared code.
// Rows as BigInt: bit b of row t = cell at position b - t (so bit 0 is the left edge -t).
const T = 24000;
function grow(init /* BigInt, bit i = cell at position i, i>=0 */, T) {
  const rows = [];
  let r = init; // row 0 aligned so that bit (x) = cell x for x>=0; left of 0 is white
  // we keep alignment: at time t, bit b = cell (b - t): shift left by 1 each step to make room
  for (let t = 0; t <= T; t++) {
    rows.push(r);
    const rr = r << 1n;                                           // make room: the new edge cell is one further left
    r = (rr << 1n) ^ (rr | (rr >> 1n));                           // left XOR (centre OR right), bit b of the new row = cell (b - t - 1)
  }
  return rows;
}
const bit = (r, i) => (i < 0 ? 0n : ((r >> BigInt(i)) & 1n));
// C1: leftDiagonal k (m*2^k) is independent of m >= 1, for k <= 11
const seed = grow(1n, T);
const D = (rows, k, j) => { const t = j + k, x = -j; return Number(bit(rows[t], x + t)); };
let c1ok = true, cnt = 0;
for (let k = 0; k <= 11; k++) { const p = 2 ** k; const v = D(seed, k, p); for (let m = 2; m * p + k <= T; m++) { cnt++; if (D(seed, k, m * p) !== v) { c1ok = false; console.log('C1 fails', k, m); } } }
if ([...Array(11).keys()].map(k => D(seed, k, 2 ** k)).join('') !== '11011100110') { console.log('ENGINE GUARD FAILED: s(0..10) differs from the kernel-checked values'); process.exit(1); }
console.log('engine guard: s(0..10) matches the kernel'); console.log('C1 leftDiagonal k (m 2^k) constant in m, k<=11:', c1ok, 'checks', cnt, ' s(0..10)=', [...Array(11).keys()].map(k => D(seed, k, 2 ** k)).join(''));
// C4: seed plus a cell at position 7 (and a random block) versus the seed translated by N along the edge.
// leftmost differing cell between X's row t and seed's row t+N shifted so edges align, as a fraction of t
function leftmostDiff(a, b) { let d = a ^ b; if (d === 0n) return Infinity; let i = 0; while ((d & 1n) === 0n) { d >>= 1n; i++; } return i; }
function check(name, init) {
  const X = grow(init, T);
  // find N in [-200,200] maximising agreement at row 12000 over the leftmost 3000 bits
  let bestN = 0, best = -1;
  for (let N = -200; N <= 200; N++) { const tt = 12000, ts = tt + N; if (ts < 0 || ts > T) continue;
    const mask = (1n << 3000n) - 1n; const agree = 3000 - (( (X[tt] ^ seed[ts]) & mask ).toString(2).split('1').length - 1);
    if (agree > best) { best = agree; bestN = N; } }
  const out = [];
  for (const t of [4000, 8000, 12000, 16000, 20000]) { const ts = t + bestN; const lm = leftmostDiff(X[t], seed[ts]); out.push(`t=${t}: front at ${(lm / t).toFixed(3)}t from the edge`); }
  console.log(`${name}: N=${bestN} (agreement ${best}/3000 at row 12000); ` + out.join('; '));
}
check('seed + cell at 7', 1n | (1n << 7n));
check('seed + block 100..199', 1n | (((1n << 100n) - 1n) << 100n));
let rnd = 1n; let s = 123456789; for (let i = 1; i < 3000; i++) { s = (s ^ (s << 13)) >>> 0; s = (s ^ (s >>> 17)) >>> 0; s = (s ^ (s << 5)) >>> 0; if (s & 1) rnd |= (1n << BigInt(i)); }
check('seed + random 3000 right half', rnd);
// where is the seed's own seam? onset of diagonal k as last index j<0.6k+64 where D_k(j) != D_k(j+2^k), for k in a few values
for (const k of [2000, 4000, 8000]) { const p = 2 ** Math.ceil(Math.log2(k)); let last = 0; for (let j = 0; j + p + k <= T && j < 0.6 * k + 64; j++) { if (D(seed, k, j) !== D(seed, k, j + 16)) last = j; } console.log(`diagonal ${k}: last disagreement at lag 16 before 0.6k: j=${last} = ${(last / k).toFixed(3)}k`); }

// Sextant's C4 proper: is there ONE integer N for which X's row equals the seed's row t+N past the seam?
function exactN(name, init) {
  const X = grow(init, T);
  const t0 = 16000; let bestN = null, bestLm = -1; const byN = [];
  for (let N = -400; N <= 400; N++) { const ts = t0 + N; if (ts < 0 || ts > T) continue; const lm = leftmostDiff(X[t0], seed[ts]); byN.push([N, lm]); if (lm > bestLm) { bestLm = lm; bestN = N; } }
  const runnersUp = byN.filter(([N, lm]) => N !== bestN).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([N, lm]) => `N=${N}:${(lm / t0).toFixed(3)}t`);
  const fronts = [4000, 8000, 12000, 16000, 20000].map(t => `${(leftmostDiff(X[t], seed[t + bestN]) / t).toFixed(3)}t`);
  console.log(`${name}: best N=${bestN}, front at row 16000 = ${(bestLm / t0).toFixed(3)}t from the edge; runners-up ${runnersUp.join(', ')}; front with best N at t=4k..20k: ${fronts.join(' ')}`);
}
exactN('seed + cell at 7', 1n | (1n << 7n));
exactN('seed + block 100..199', 1n | (((1n << 100n) - 1n) << 100n));
exactN('seed + random 3000 right half', rnd);
console.log('seam reference: onsets measured above put the seam near 0.75t from the edge; Sextant claims the damage front at 0.757t and the seam at 0.748t');
