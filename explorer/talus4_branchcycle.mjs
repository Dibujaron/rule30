// Talus, 2026-09-09. Does a SECOND cycle of g_n exist at all?
//
// On the seed's cycle an eventually-white diagonal w has bit w identically 0, so
// bit w+1 obeys  x' = bit(w-1) XOR (0 | x) = bit(w-1) XOR x : a running XOR whose
// complement is also a solution. Flip bit w+1 in a cycle state and the flip persists
// for ever; the bits above re-solve themselves. Run that flipped state to its own cycle
// and compare with the seed's.
//
//  - w = 399, 87866 are DOUBLING whites: the complement should be the seed's own cycle
//    read at a different phase (a complement is a shift by half the new period).
//  - w = 53207, 58286 are Rowland's complement-type whites, where the period does NOT
//    double, so the complement has nowhere to be a shift of the original.
// Prediction: same cycle for the first kind, a genuinely different cycle for the second.

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
function periodFor(n) {
  const k = n - 1;
  if (k < 3) return 1; if (k < 8) return 2; if (k < 29) return 4;
  if (k < 400) return 8; if (k < 87867) return 16; return 32;
}

function cycleFrom(n, start, p, T) {
  const { words, step } = makeEngine(n);
  const ring = [];
  for (let i = 0; i <= p; i++) ring.push(new Uint32Array(words));
  ring[0].set(start.subarray(0, words));
  let last = -1;
  for (let t = 1; t <= T; t++) {
    const cur = ring[t % (p + 1)];
    step(ring[(t - 1 + p + 1) % (p + 1)], cur);
    if (t >= p && !eq(ring[(t - p + p + 1) % (p + 1)], cur, words)) last = t;
  }
  const states = [];
  for (let i = 0; i < p; i++) states.push(Uint32Array.from(ring[(T - i + p + 1) % (p + 1)]));
  return { states, pre: last + 1, settled: last < T, words };
}

for (const [n, w, kind] of [[1000, 399, "doubling"], [55000, 53207, "complement-type"], [60000, 58286, "complement-type"], [90000, 87866, "doubling"]]) {
  const p = periodFor(n);
  const T = 2 * n;
  const words = ((n + W - 1) / W) | 0;
  const one = new Uint32Array(words); one[0] = 1;
  const base = cycleFrom(n, one, p, T);
  if (!base.settled) { console.log(`n=${n}: seed not settled by ${T}`); continue; }
  // flip bit w+1 in a cycle state
  const flipped = Uint32Array.from(base.states[0]);
  const b = w + 1;
  flipped[(b / 32) | 0] ^= (1 << (b % 32)) >>> 0;
  const alt = cycleFrom(n, flipped, p, T);
  let same = false;
  if (alt.settled) for (const st of base.states) if (eq(st, alt.states[0], words)) same = true;
  // did the flip survive at all, i.e. is bit b different on the two cycles?
  const bitOf = (st) => (st[(b / 32) | 0] >>> (b % 32)) & 1;
  const baseBits = base.states.map(bitOf).join("");
  const altBits = alt.settled ? alt.states.map(bitOf).join("") : "?";
  console.log(
    `n=${n} w=${w} (${kind}) period=${p}: flipped state settles=${alt.settled} pre=${alt.pre} | ` +
      `same cycle as seed? ${same ? "YES" : "NO -- a second cycle"} | bit ${b} over one period: seed ${baseBits} vs flipped ${altBits}`,
  );
}
