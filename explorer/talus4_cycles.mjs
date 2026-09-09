// Talus, 2026-09-09. How many cycles of g_n do the ODD starts reach?
//
// Exhaustively (talus4_allstarts.mjs) the answer is ONE for every n <= 24: every odd
// start ends on the seed's own cycle, so the start 1 is not distinguished in its tail.
// Obstruction 4 / crystal 49 say a configuration's settled region is the seed's up to a
// branch bit chosen at each eventually-white diagonal, so the count should eventually
// exceed one. This measures where.
//
// Method: run each random odd start to t = 2n (past every measured preperiod, which sits
// near 1.35n), check it has settled with the width's period, and compare its state to the
// seed's cycle. Also lists the eventually-white bits of the seed's cycle -- the diagonals
// where obstruction 4 says the branch lives.

const W = 32;

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
function periodFor(n) {
  const k = n - 1;
  if (k < 3) return 1; if (k < 8) return 2; if (k < 29) return 4;
  if (k < 400) return 8; if (k < 87867) return 16; return 32;
}

let s = 987654321;
const rng = () => { s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; return s / 0x80000000; };

function cycleOf(n, seedWords, p, T) {
  const { words, step } = makeEngine(n);
  const ring = [];
  for (let i = 0; i <= p; i++) ring.push(new Uint32Array(words));
  ring[0].set(seedWords.subarray(0, words));
  let last = -1;
  for (let t = 1; t <= T; t++) {
    const cur = ring[t % (p + 1)];
    step(ring[(t - 1 + p + 1) % (p + 1)], cur);
    if (t >= p && !eq(ring[(t - p + p + 1) % (p + 1)], cur, words)) last = t;
  }
  if (last >= T) return null;
  const states = [];
  for (let i = 0; i < p; i++) states.push(Uint32Array.from(ring[(T - i + p + 1) % (p + 1)]));
  return { states, pre: last + 1, words };
}

console.log("      n   period  samples   distinct cycles reached by odd starts   unsettled");
for (const [n, m] of [[100, 500], [1000, 300], [10000, 100], [40000, 60], [55000, 50], [60000, 50], [90000, 40]]) {
  const p = periodFor(n);
  const T = 2 * n;
  const words = ((n + W - 1) / W) | 0;
  const one = new Uint32Array(words); one[0] = 1;
  const base = cycleOf(n, one, p, T);
  const t0 = Date.now();
  // a cycle is identified by the multiset of its states; use the hash of every state
  const cycles = new Map(); // hash of the lexicographically-smallest-hash state -> [count, isSeed]
  const idOf = (c) => { const hs = c.states.map((st) => hash(st, words)); hs.sort((a, b) => a - b); return hs.join(":"); };
  const baseId = idOf(base);
  cycles.set(baseId, 1);
  let unsettled = 0;
  for (let i = 0; i < m; i++) {
    const x = new Uint32Array(words);
    for (let j = 0; j < words; j++) x[j] = (rng() * 4294967296) >>> 0;
    const topBits = n - (words - 1) * W;
    x[words - 1] &= topBits === 32 ? 0xffffffff : ((1 << topBits) >>> 0) - 1;
    x[0] |= 1;
    const c = cycleOf(n, x, p, T);
    if (!c) { unsettled++; continue; }
    const id = idOf(c);
    cycles.set(id, (cycles.get(id) ?? 0) + 1);
  }
  const counts = [...cycles.entries()].map(([id, c]) => `${c}${id === baseId ? "(seed)" : ""}`).join(" + ");
  console.log(`${String(n).padStart(7)} ${String(p).padStart(8)} ${String(m).padStart(8)}   ${String(cycles.size).padStart(3)}  [${counts}]   ${unsettled}   (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

// eventually-white bits of the seed's cycle
{
  const n = 90000, p = periodFor(n), T = 2 * n;
  const words = ((n + W - 1) / W) | 0;
  const one = new Uint32Array(words); one[0] = 1;
  const base = cycleOf(n, one, p, T);
  const whites = [];
  for (let j = 0; j < n; j++) {
    let all0 = true;
    for (const st of base.states) if ((st[(j / 32) | 0] >>> (j % 32)) & 1) { all0 = false; break; }
    if (all0) whites.push(j);
  }
  console.log("");
  console.log(`eventually-white bits (= left diagonals whose settled word is identically white) below ${n}: ${whites.join(", ")}`);
  console.log("obstruction 4 lists 2, 7, 28, 399, 53207, 58286, 87866 below 200000");
}
