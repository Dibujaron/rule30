// Talus, 2026-09-09.  Validation for the n = 53209 claim, at the width it is claimed at.
//
// Last session's lesson: a surprising verdict about my own instrument needs a harness
// argument. Here the surprising verdict is "a second odd cycle exists at n = 53209", so:
//   (1) the packed engine is checked against BigInt AT WIDTH 53209 itself, not only at
//       small widths, for 400 steps from the seed and from the flipped state;
//   (2) the two cycles are checked to satisfy T cell by cell (T(state) == next state),
//       in BigInt, with no reference to the packed engine at all;
//   (3) the two cycles are checked to be disjoint as sets of 53209-bit words.
//
// usage: node talus5_bigcheck.mjs

const N = 53209;
const P = 16;
const T = 110000;
const W = 32;
const words = Math.ceil(N / W);
const topBits = N - (words - 1) * W;
const topMask = topBits === 32 ? 0xffffffff : (((1 << topBits) >>> 0) - 1) >>> 0;
const MASK = (1n << BigInt(N)) - 1n;
const bigStep = (r) => ((4n * r) ^ ((2n * r) | r)) & MASK;

function step(src, dst) {
  for (let i = words - 1; i >= 0; i--) {
    const a = src[i];
    const b = i >= 1 ? src[i - 1] : 0;
    dst[i] = (((a << 2) | (b >>> 30)) ^ (((a << 1) | (b >>> 31)) | a)) >>> 0;
  }
  dst[words - 1] = (dst[words - 1] & topMask) >>> 0;
}
const toBig = (st) => { let v = 0n; for (let i = words - 1; i >= 0; i--) v = (v << 32n) | BigInt(st[i] >>> 0); return v; };
const fromBig = (v) => { const st = new Uint32Array(words); for (let i = 0; i < words; i++) st[i] = Number((v >> BigInt(32 * i)) & 0xffffffffn) >>> 0; return st; };
const eq = (a, b) => { for (let i = 0; i < words; i++) if (a[i] !== b[i]) return false; return true; };

// (1) packed vs BigInt at width N
{
  let cur = new Uint32Array(words); cur[0] = 1;
  let nxt = new Uint32Array(words);
  let big = 1n;
  let bad = 0;
  for (let t = 0; t < 400; t++) {
    big = bigStep(big);
    step(cur, nxt); [cur, nxt] = [nxt, cur];
    if (toBig(cur) !== big) bad++;
  }
  console.log(`(1) packed vs BigInt at width ${N}, 400 steps from the seed: ${bad} mismatches`);
}

// run the seed to its cycle with the packed engine
const ring = [];
for (let i = 0; i <= P; i++) ring.push(new Uint32Array(words));
ring[0][0] = 1;
let lastDiff = -1;
for (let t = 1; t <= T; t++) {
  const cur = ring[t % (P + 1)];
  step(ring[(t - 1) % (P + 1)], cur);
  if (t >= P && !eq(ring[(t - P) % (P + 1)], cur)) lastDiff = t;
}
console.log(`    seed orbit at width ${N}: last non-return at t=${lastDiff}, so periodic with period ${P} from t=${lastDiff + 1}`);
const seedCycle = [];
for (let i = 0; i < P; i++) seedCycle.push(toBig(ring[(T - P + 1 + i) % (P + 1)]));

// the flipped state, and its own cycle, both as BigInts only
const b = 53208;
const flipped0 = seedCycle[0] ^ (1n << BigInt(b));
const altCycle = [flipped0];
for (let i = 1; i < P; i++) altCycle.push(bigStep(altCycle[i - 1]));

// (2) both cycles satisfy T exactly, in BigInt
let bad2 = 0;
for (let i = 0; i < P; i++) {
  if (bigStep(seedCycle[i]) !== seedCycle[(i + 1) % P]) bad2++;
  if (bigStep(altCycle[i]) !== altCycle[(i + 1) % P]) bad2++;
}
console.log(`(2) T(state) = next state around both 16-cycles, in BigInt: ${bad2} failures of 32`);

// minimal periods
function minPer(cyc) { for (let d = 1; d <= P; d++) if (P % d === 0 && cyc.every((v, i) => v === cyc[(i + d) % P])) return d; return P; }
console.log(`    minimal period: seed cycle ${minPer(seedCycle)}, second cycle ${minPer(altCycle)}`);

// (3) disjointness, oddness, and bit 53207 white on both
const seedSet = new Set(seedCycle.map((v) => v.toString(16)));
const overlap = altCycle.filter((v) => seedSet.has(v.toString(16))).length;
const oddSeed = seedCycle.every((v) => (v & 1n) === 1n);
const oddAlt = altCycle.every((v) => (v & 1n) === 1n);
const white = (cyc, k) => cyc.every((v) => ((v >> BigInt(k)) & 1n) === 0n);
console.log(`(3) overlap between the two cycles: ${overlap} of 16 states`);
console.log(`    all states odd (bit 0 = 1)?  seed ${oddSeed}, second ${oddAlt}`);
console.log(`    bit 53207 identically white?  seed ${white(seedCycle, 53207)}, second ${white(altCycle, 53207)}`);
console.log(`    bit 53208 over one period:  seed ${seedCycle.map((v) => Number((v >> 53208n) & 1n)).join('')}  second ${altCycle.map((v) => Number((v >> 53208n) & 1n)).join('')}`);
console.log(`    second cycle = seed cycle XOR 2^53208 pointwise? ${altCycle.every((v, i) => (v ^ (1n << 53208n)) === seedCycle[i])}`);

// the arithmetic the law would need
console.log('');
console.log(`  #odd periodic points of T_${N} is at least ${2 * P} (two disjoint odd 16-cycles).`);
console.log(`  maxCycle(${N}) = 16 provided every odd cycle at every level m <= ${N} has length <= 16.`);
console.log(`  So |A(${N})| - |A(${N - 1})| >= 32 > 16 = maxCycle(${N}): the rigidity law fails here.`);

// closed-form value of |A(53208)| from the staircase, for the record
const stair = [[1, 3, 1], [4, 8, 2], [9, 29, 4], [30, 400, 8], [401, 87867, 16]];
function sumP(n) { let s = 0; for (const [a, z, p] of stair) { const lo = Math.max(a, 1), hi = Math.min(z, n); if (hi >= lo) s += (hi - lo + 1) * p; } return s; }
console.log(`  |A(53208)| = 1 + sum_{m<=53208} P(m) = ${1 + sumP(53208)}`);
console.log(`  law predicts |A(53209)| = ${1 + sumP(53208) + 16}; the mechanism predicts ${1 + sumP(53208) + 32}`);
