// Parallax, 2026-09-09. The firing potential, its pressure function, and a
// second-order genericity test of the seed's picture.
//
// Rule 30 is rule 150 (l XOR c XOR r) plus the single quadratic monomial c*r.
// Take the potential phi(x) = -1[x_0 = x_1 = 1] on the full 2-shift: the
// indicator that the monomial "fires". Its Gibbs measure at inverse temperature
// beta is the nearest-neighbour Markov chain with transfer matrix
//     M(a,b) = exp(-beta * 1[a=b=1]),   M = [[1,1],[1,e^-beta]],
// and the pressure is P(beta) = log(largest eigenvalue). Then
//     -P'(0)  = density of firings under the ensemble  = 1/4
//     P''(0)  = variance per site of the firing count  = the susceptibility.
// So the board's measured 1/4 is exactly a first derivative of an explicit
// analytic function, and the SECOND derivative is a prediction the seed's own
// picture can be tested against. That is a genericity test one order beyond
// "the density is right".
//
// Also measured: the picture is NOT homogeneous. The left ~37% of the cone is
// the settled region (periodic words, zero entropy) and the rest is the
// chaotic bulk; block entropies are reported separately for each, because the
// empirical measure of the whole cone is a mixture and not the uniform measure.

const T = 20000;                 // rows
const W = 2 * T + 3;             // array width, position x sits at index x + T + 1

// ---------- the explicit pressure function ----------
function pressure(beta) {
  const u = Math.exp(-beta);
  const lam = (1 + u + Math.sqrt((1 - u) * (1 - u) + 4)) / 2;
  return Math.log(lam);
}
const h = 1e-5;
const P0 = pressure(0), Pp = (pressure(h) - pressure(-h)) / (2 * h);
const Ppp = (pressure(h) - 2 * P0 + pressure(-h)) / (h * h);
console.log('=== the firing potential phi = -1[11], as a lattice gas ===');
console.log(`P(0)      = ${P0.toFixed(10)}   (log 2 = ${Math.log(2).toFixed(10)})`);
console.log(`-P'(0)    = ${(-Pp).toFixed(10)}   ensemble firing density, exact value 1/4`);
console.log(`P''(0)    = ${Ppp.toFixed(10)}   susceptibility, exact value 5/16 = 0.3125`);
console.log(`P(inf)    = ${Math.log((1 + Math.sqrt(5)) / 2).toFixed(10)}   golden-mean shift (11 forbidden)`);
console.log();

// ---------- grow the seed ----------
let row = new Uint8Array(W);
row[T + 1] = 1;
let next = new Uint8Array(W);

// accumulators
let colBits = new Uint8Array(T);
// firing counts per row, in three regions
const rows = [];
// block counting in two regions, at the last SAMPLE rows
const KMAX = 12;
const blocksLeft = new Map(), blocksBulk = new Map();
const SAMPLE_FROM = Math.floor(T * 0.75);

for (let t = 0; t < T; t++) {
  colBits[t] = row[T + 1];

  if (t > 200) {
    const lo = T + 1 - t, hi = T + 1 + t;              // cone, inclusive
    const seam = T + 1 - Math.round(0.30 * t);         // left of this: settled
    const bulkLo = T + 1 - Math.round(0.20 * t);       // right of this: chaotic bulk
    let fAll = 0, fLeft = 0, fBulk = 0;
    for (let i = lo; i < hi; i++) if (row[i] && row[i + 1]) fAll++;
    for (let i = lo; i < seam; i++) if (row[i] && row[i + 1]) fLeft++;
    for (let i = bulkLo; i < hi; i++) if (row[i] && row[i + 1]) fBulk++;
    rows.push([t, hi - lo, fAll, seam - lo, fLeft, hi - bulkLo, fBulk]);

    if (t >= SAMPLE_FROM && t % 7 === 0) {
      for (let i = lo; i < seam - KMAX; i++) {
        let v = 0; for (let k = 0; k < KMAX; k++) v = v * 2 + row[i + k];
        blocksLeft.set(v, (blocksLeft.get(v) || 0) + 1);
      }
      for (let i = bulkLo; i < hi - KMAX; i++) {
        let v = 0; for (let k = 0; k < KMAX; k++) v = v * 2 + row[i + k];
        blocksBulk.set(v, (blocksBulk.get(v) || 0) + 1);
      }
    }
  }

  next.fill(0);
  for (let i = 1; i < W - 1; i++) next[i] = row[i - 1] ^ (row[i] | row[i + 1]);
  const tmp = row; row = next; next = tmp;
}

// ---------- firing density and its fluctuation ----------
console.log('=== firing density 1[11] in the seed\'s own picture ===');
console.log('region                          mean density   (ensemble: 0.25)');
function meanDensity(idxCount, idxFire) {
  let n = 0, f = 0;
  for (const r of rows) { n += r[idxCount]; f += r[idxFire]; }
  return f / n;
}
console.log('whole cone [-t, t]             ', meanDensity(1, 2).toFixed(6));
console.log('settled left  [-t, -0.30t]     ', meanDensity(3, 4).toFixed(6));
console.log('chaotic bulk  [-0.20t, t]      ', meanDensity(5, 6).toFixed(6));
console.log();

// standardised fluctuation of the firing count per row, in the bulk
let sum = 0, sumsq = 0, m = 0;
for (const r of rows) {
  const n = r[5], f = r[6];
  if (n < 1000) continue;
  const z = (f - n / 4) / Math.sqrt(n);
  sum += z; sumsq += z * z; m++;
}
console.log('=== second-order test: fluctuation of the bulk firing count ===');
console.log(`rows used                    ${m}`);
console.log(`mean of (N - n/4)/sqrt(n)    ${(sum / m).toFixed(6)}    (0 if the density is exact)`);
console.log(`var  of (N - n/4)/sqrt(n)    ${(sumsq / m - (sum / m) ** 2).toFixed(6)}    (P''(0) = 0.3125 if the`);
console.log(`                                        picture's rows are ensemble-typical)`);
console.log();

// ---------- block entropies ----------
function blockEntropy(map, k) {
  let tot = 0; for (const c of map.values()) tot += c;
  let H = 0;
  for (const c of map.values()) { const p = c / tot; H -= p * Math.log2(p); }
  return [H / k, map.size, tot];
}
console.log(`=== block statistics, blocks of length ${KMAX} ===`);
for (const [name, map] of [['settled left', blocksLeft], ['chaotic bulk', blocksBulk]]) {
  const [hk, distinct, tot] = blockEntropy(map, KMAX);
  console.log(`${name.padEnd(14)} distinct blocks ${String(distinct).padStart(5)} / ${1 << KMAX}   ` +
    `entropy/site ${hk.toFixed(4)} bits   (samples ${tot})`);
}
console.log();

// ---------- the centre column itself ----------
let ones = 0; for (let t = 0; t < T; t++) ones += colBits[t];
console.log('=== the centre column ===');
console.log(`density of 1s over ${T} terms   ${(ones / T).toFixed(6)}`);
console.log('L    distinct factors of length L   2^L      all distinct?');
for (let L = 1; L <= 20; L++) {
  const seen = new Set();
  for (let i = 0; i + L <= T; i++) {
    let s = 0n; for (let k = 0; k < L; k++) s = s * 2n + BigInt(colBits[i + k]);
    seen.add(s);
  }
  console.log(String(L).padEnd(4), String(seen.size).padEnd(30),
    String(Math.min(2 ** L, T - L + 1)).padEnd(8),
    seen.size === Math.min(2 ** L, T - L + 1) ? 'yes (maximal)' : 'no');
}
