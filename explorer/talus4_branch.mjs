// Talus, 2026-09-09. What is special about the start 1?
//
// g_n(r) = (4r XOR (2r|r)) mod 2^n is homogeneous: g(2^m y) = 2^m g(y). So every
// start is 2^m times an odd one, and the odd starts carry the whole dynamics.
// Question: do all odd starts fall into the SAME cycle as 1 -- i.e. is the orbit
// of 1 distinguished at all in its eventual behaviour, or only in its transient?
//
// Also measures the all-starts preperiod at widths far beyond exhaustion, which is
// what the all-starts route (leftDiagonal_onset_le_of_stepMod_preperiod) needs to
// stay below 2k = 2(n-1).

const W = 32;
const P = 16; // the eventual period at these widths (staircase: 16 for 400 <= k <= 87866)

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
function hash(a, w) { let h = 2166136261 >>> 0; for (let i = 0; i < w; i++) { h ^= a[i]; h = Math.imul(h, 16777619) >>> 0; } return h; }

// run a start to time T, returning {preperiod, cycleStates} where preperiod is
// 1 + the last t <= T with r_t != r_{t-P}.
function run(n, seedWords, T) {
  const { words, step } = makeEngine(n);
  const ring = [];
  for (let i = 0; i <= P; i++) ring.push(new Uint32Array(words));
  ring[0].set(seedWords.subarray(0, words));
  let last = -1;
  for (let t = 1; t <= T; t++) {
    const cur = ring[t % (P + 1)];
    step(ring[(t - 1 + P + 1) % (P + 1)], cur);
    if (t >= P && !eq(ring[(t - P + P + 1) % (P + 1)], cur, words)) last = t;
  }
  const states = [];
  for (let i = 0; i < P; i++) states.push(Uint32Array.from(ring[(T - i + P + 1) % (P + 1)]));
  return { preperiod: last + 1, states, words, onCycle: last < T };
}

function mkOdd(n, rng) {
  const words = ((n + W - 1) / W) | 0;
  const a = new Uint32Array(words);
  for (let i = 0; i < words; i++) a[i] = (rng() * 4294967296) >>> 0;
  const topBits = n - (words - 1) * W;
  a[words - 1] &= topBits === 32 ? 0xffffffff : ((1 << topBits) >>> 0) - 1;
  a[0] |= 1;
  return a;
}
let s = 12345;
const rng = () => { s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; return s / 0x80000000; };

function report(n, nSamples) {
  const T = 2 * n;
  const words = ((n + W - 1) / W) | 0;
  const one = new Uint32Array(words); one[0] = 1;
  const base = run(n, one, T);
  if (!base.onCycle) { console.log(`n=${n}: the orbit of 1 has NOT settled with period ${P} by t=${T}`); return; }
  const baseHashes = new Map();
  for (const st of base.states) baseHashes.set(hash(st, words), st);
  let same = 0, diff = 0, notSettled = 0, maxPre = base.preperiod, argMax = "1";
  const otherCycles = new Set();
  for (let i = 0; i < nSamples; i++) {
    const x = mkOdd(n, rng);
    const r = run(n, x, T);
    if (!r.onCycle) { notSettled++; continue; }
    if (r.preperiod > maxPre) { maxPre = r.preperiod; argMax = `sample#${i}`; }
    const h = hash(r.states[0], words);
    const cand = baseHashes.get(h);
    if (cand && eq(cand, r.states[0], words)) same++;
    else { diff++; otherCycles.add(h); }
  }
  console.log(
    `n=${n}  2(n-1)=${2 * (n - 1)}  | orbit-of-1 preperiod ${base.preperiod} (${(base.preperiod / n).toFixed(3)} n) | ` +
      `${nSamples} random odd starts: ${same} on the SAME cycle as 1, ${diff} on another, ${notSettled} not settled by t=${T} | ` +
      `max preperiod ${maxPre} (${(maxPre / n).toFixed(3)} n, from ${argMax}) | max<=2(n-1)? ${maxPre <= 2 * (n - 1) ? "yes" : "NO"}`,
  );
}

for (const [n, m] of [[100, 400], [401, 300], [1000, 200], [4000, 60], [20000, 12]]) {
  const t0 = Date.now();
  report(n, m);
  console.log(`   (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
