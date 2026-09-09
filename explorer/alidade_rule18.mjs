/**
 * The control the vantage needs: rule 18's defect gas really does thin, and
 * rule 30's band really does not.
 *
 *   node explorer/alidade_rule18.mjs
 *
 * Hanson & Crutchfield (Physica D 103 (1997) 169-189, fetched) say of the one
 * elementary rule where the filtered dynamics has been worked out
 * stochastically: "in the case of ECA 18 ... the filtered behavior is described
 * by a stochastic equation of motion for diffusive annihilating particles".
 * Annihilating diffusive particles in one dimension have density falling like
 * t^(-1/2). Rather than cite that, this script measures it, so the dictionary
 * row can be checked rather than believed.
 *
 * Rule 18's regular domain is (0 Sigma)*: the 1s sit on one sublattice, so the
 * block 11 never occurs inside the domain and its density is a defect count. The
 * script runs rule 18 on a ring from a random row and reports the 11-density
 * against t, then fits the exponent; and it prints, beside it, rule 30's own
 * band deviation density from explorer/alidade_survival.mjs, which does not
 * decay at all.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const N = 1 << 16;          // ring size, bits
const STEPS = 200000;
const MASK = (1n << BigInt(N)) - 1n;

/** rule 18: new = (left xor right) and not centre. */
function step18(x) {
  const l = ((x << 1n) | (x >> BigInt(N - 1))) & MASK;
  const r = ((x >> 1n) | ((x & 1n) << BigInt(N - 1))) & MASK;
  return ((l ^ r) & ~x) & MASK;
}

function popcount(x) {
  let n = 0;
  while (x) { const lo = x & 0xffffffffn; let v = Number(lo); v = v - ((v >> 1) & 0x55555555); v = (v & 0x33333333) + ((v >> 2) & 0x33333333); n += (((v + (v >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24; x >>= 32n; }
  return n;
}

// a random start, from a fixed seed so the run repeats
let s = 12345n;
let x = 0n;
for (let i = 0; i < N; i += 32) { s = (s * 6364136223846793005n + 1442695040888963407n) & ((1n << 64n) - 1n); x |= ((s >> 33n) & 0xffffffffn) << BigInt(i); }
x &= MASK;

const t0 = Date.now();
const samples = [];
const want = new Set();
for (let e = 0; e <= 5.4; e += 0.3) want.add(Math.round(10 ** e));
for (let t = 0; t <= STEPS; t++) {
  if (want.has(t)) {
    const d = popcount(x & ((x >> 1n) | ((x & 1n) << BigInt(N - 1)))) / N;
    samples.push([t, d]);
  }
  x = step18(x);
}
console.log(`rule 18 on a ring of ${N} cells from a random row, density of the block 11 (its domain (0 Sigma)* forbids it):`);
for (const [t, d] of samples) console.log(`   t = ${String(t).padStart(6)}: ${d.toExponential(4)}`);
// fit log d = a + b log t over the decade t in [1000, 100000]
const pts = samples.filter(([t, d]) => t >= 1000 && d > 0);
let sx = 0, sy = 0, sxx = 0, sxy = 0;
for (const [t, d] of pts) { const X = Math.log(t), Y = Math.log(d); sx += X; sy += Y; sxx += X * X; sxy += X * Y; }
const n = pts.length, b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
console.log(`   fitted exponent over t >= 1000 (${n} points): ${b.toFixed(4)}   (annihilating diffusive particles give -1/2)`);
console.log(`\nrule 30's band, for comparison: the deviation density E = picture xor settled is 0.50005 at every`);
console.log(`depth from 16 to 96 cells behind the front and 0.4999 at depth 3 (explorer/alidade_survival.mjs, 10^6 rows).`);
console.log(`It does not decay: fitted exponent 0. There is no dilute limit, so no gas.`);
console.log(`(${Date.now() - t0} ms)`);
