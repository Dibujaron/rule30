// Rowan, 2026-09-12. Extend Vernier's effective-cone measurement from two points
// to a trend.
//
// SETUP (Vernier's, vernier2_influence.mjs): fix the configuration white at every
// x < 0, black at x = 0, and FREE at cells 1..t. Then `centerColumn t` is a Boolean
// function of those t free bits. The light cone says every one of cells 1..t can
// reach the origin by time t. Vernier measured that the far ones do not: at t = 22
// cells 17..22 have influence EXACTLY ZERO, effective radius 16, ratio 0.73, against
// radius 13 and ratio 0.87 at t = 15.
//
// Two points falling is not a trend, so this computes the effective radius over a
// range. Exact enumeration is 2^t and dies past t ~ 24, so this uses SAMPLING, which
// is one-sided on purpose: finding one input whose flip changes the output PROVES
// influence > 0. Failing to find one in N samples does not prove influence = 0 --
// it bounds it above by roughly 1/N. So the radius printed is an UPPER bound on the
// true effective radius at the sampled confidence, and the honest reading is "no
// dependence detected beyond here", not "no dependence".
//
// Exact mode (--exact) enumerates all 2^t and is the control: it must reproduce
// Vernier's 13 at t = 15 and 16 at t = 22 exactly, and the sampled run must agree
// with it wherever both are available. If they disagree, the sampler is wrong.

function centreCell(t, freeBits) {
  const W = 2 * t + 3;
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  cur[t] = 1;
  for (let k = 1; k <= t; k++) cur[t + k] = (freeBits >> BigInt(k - 1)) & 1n ? 1 : 0;
  for (let s = 0; s < t; s++) {
    for (let i = 0; i < W; i++) {
      const l = i > 0 ? cur[i - 1] : 0, c = cur[i], r = i < W - 1 ? cur[i + 1] : 0;
      nxt[i] = (30 >> (4 * l + 2 * c + r)) & 1;
    }
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return cur[t];
}

function effectiveRadiusSampled(t, samples, rng) {
  let maxDep = 0;
  for (let j = 1; j <= t; j++) {
    let dep = false;
    for (let s = 0; s < samples && !dep; s++) {
      let u = 0n;
      for (let b = 0; b < t; b++) if (rng() < 0.5) u |= 1n << BigInt(b);
      const a = centreCell(t, u);
      const b2 = centreCell(t, u ^ (1n << BigInt(j - 1)));
      if (a !== b2) dep = true;
    }
    if (dep) maxDep = j;
  }
  return maxDep;
}

function effectiveRadiusExact(t) {
  const size = 1 << t;
  const tt = new Uint8Array(size);
  for (let u = 0; u < size; u++) tt[u] = centreCell(t, BigInt(u));
  let maxDep = 0;
  for (let j = 1; j <= t; j++) {
    const bit = 1 << (j - 1);
    let dep = false;
    for (let u = 0; u < size && !dep; u++) if (tt[u] !== tt[u ^ bit]) dep = true;
    if (dep) maxDep = j;
  }
  return maxDep;
}

let seed = 12345;
const rng = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

const exact = process.argv.includes('--exact');
const TMAX = parseInt(process.argv.find(a => /^\d+$/.test(a)) || '34', 10);
const SAMPLES = 4000;

console.log(exact ? 'EXACT (all 2^t inputs)' : `SAMPLED (${SAMPLES} per cell; one-sided -- an upper bound on the radius)`);
console.log('  t   radius   ratio r/t   dead cells');
for (let t = 6; t <= TMAX; t++) {
  const r = exact ? effectiveRadiusExact(t) : effectiveRadiusSampled(t, SAMPLES, rng);
  console.log(`  ${String(t).padStart(2)}   ${String(r).padStart(6)}   ${(r / t).toFixed(4).padStart(9)}   ${String(t - r).padStart(10)}`);
}
