// Talus, 2026-09-09. The wall in one number.
//
// leftDiagonal_onset_le  <=>  pre(n) <= 2(n-1) for every n, where pre(n) is the
// preperiod of the orbit of 1 under g_n(r) = (4r XOR (2r|r)) mod 2^n.
// leftDiagonal_period_le <=>  per(n) <= n for every n, per(n) the eventual period.
//
// This sweeps pre(n) exactly for every n up to NMAX and reports the worst ratio
// pre(n) / (2n-2) -- the margin the wall actually has -- and per(n).

const W = 32;
const NMAX = 3000;

function makeEngine(n) {
  const words = ((n + W - 1) / W) | 0;
  const topBits = n - (words - 1) * W;
  const topMask = topBits === 32 ? 0xffffffff : ((1 << topBits) >>> 0) - 1;
  function step(src, dst) {
    for (let i = words - 1; i >= 0; i--) {
      const a = src[i];
      const b = i >= 1 ? src[i - 1] : 0;
      dst[i] = (((a << 2) | (b >>> 30)) ^ (((a << 1) | (b >>> 31)) | a)) >>> 0;
    }
    dst[words - 1] = (dst[words - 1] & topMask) >>> 0;
  }
  return { words, step };
}
function eq(a, b, w) { for (let i = 0; i < w; i++) if (a[i] !== b[i]) return false; return true; }

const PS = [1, 2, 4, 8, 16, 32];
function preAndPer(n) {
  const { words, step } = makeEngine(n);
  const MAXP = 32;
  const ring = [];
  for (let i = 0; i <= MAXP; i++) ring.push(new Uint32Array(words));
  ring[0][0] = 1;
  const T = 2 * n + 4 * MAXP;
  const lastDiff = new Map(PS.map((p) => [p, -1]));
  for (let t = 1; t <= T; t++) {
    const cur = ring[t % (MAXP + 1)];
    step(ring[(t - 1 + MAXP + 1) % (MAXP + 1)], cur);
    for (const p of PS) if (t >= p && !eq(ring[(t - p + MAXP + 1) % (MAXP + 1)], cur, words)) lastDiff.set(p, t);
  }
  for (const p of PS) if (lastDiff.get(p) < T - 2 * MAXP) return { per: p, pre: lastDiff.get(p) + 1 };
  return null;
}

let worstRatio = 0, worstN = 0, worstPre = 0;
const perSteps = [];
let prevPer = null;
for (let n = 1; n <= NMAX; n++) {
  const r = preAndPer(n);
  if (!r) { console.log(`n=${n}: no period <= 32 found`); continue; }
  if (r.per !== prevPer) { perSteps.push([n, r.per]); prevPer = r.per; }
  const ratio = n < 10 ? 0 : r.pre / (2 * n - 2);
  if (ratio > worstRatio) { worstRatio = ratio; worstN = n; worstPre = r.pre; }
}
console.log(`swept n = 1..${NMAX}`);
console.log(`per(n) steps: ${perSteps.map(([n, p]) => `n=${n}: ${p}`).join("   ")}`);
console.log(`per(n) <= n at every n in range: ${perSteps.every(([n, p]) => p <= n)}`);
console.log(`worst pre(n)/(2n-2) = ${worstRatio.toFixed(4)} at n = ${worstN} (pre = ${worstPre}, budget = ${2 * worstN - 2})`);
