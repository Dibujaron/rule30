// Talus, 2026-09-09. The exhaustive run says the worst start of g_n is x = 9 at every
// width from 5 to 28, and that its preperiod exceeds the seed's by exactly 6 from n = 19 on.
// Two things to test past exhaustion:
//   (a) does preperiod(9) - preperiod(1) stay 6 at widths where the period is 16, not 4?
//   (b) is the orbit of 9 literally the orbit of 1 delayed -- g^[t](9) = g^[t-c](1)?
// (b) would explain (a) outright; if it fails, the constant 6 is a coincidence of small n
// until shown otherwise.

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

// preperiod of start x0 for the given period p: 1 + last t <= T with r_t != r_{t-p}
function preperiod(n, x0, p, T) {
  const { words, step } = makeEngine(n);
  const ring = [];
  for (let i = 0; i <= p; i++) ring.push(new Uint32Array(words));
  ring[0][0] = x0;
  let last = -1;
  for (let t = 1; t <= T; t++) {
    const cur = ring[t % (p + 1)];
    step(ring[(t - 1 + p + 1) % (p + 1)], cur);
    if (t >= p && !eq(ring[(t - p + p + 1) % (p + 1)], cur, words)) last = t;
  }
  return { pre: last + 1, settled: last < T };
}

// the staircase of eventual periods: 1 (k<3), 2 (3..7), 4 (8..28), 8 (29..399), 16 (400..87866)
function periodFor(n) {
  const k = n - 1;
  if (k < 3) return 1; if (k < 8) return 2; if (k < 29) return 4;
  if (k < 400) return 8; if (k < 87867) return 16; return 32;
}

console.log("(a) preperiod of the worst exhaustive start x=9 against the seed x=1");
console.log(" n      period  pre(1)   pre(9)   pre(9)-pre(1)   2(n-1)   pre(9)<=2(n-1)?");
for (const n of [19, 24, 28, 40, 60, 100, 200, 401, 600, 1000, 4000, 20000, 87868, 120000]) {
  const p = periodFor(n);
  const T = 2 * n + 4 * p + 8;
  const a = preperiod(n, 1, p, T);
  const b = preperiod(n, 9, p, T);
  console.log(
    `${String(n).padStart(6)} ${String(p).padStart(7)} ${String(a.pre).padStart(8)} ${String(b.pre).padStart(8)} ${String(b.pre - a.pre).padStart(14)} ${String(2 * (n - 1)).padStart(9)}   ${b.pre <= 2 * (n - 1) ? "yes" : "NO"}${a.settled && b.settled ? "" : "   (NOT SETTLED)"}`,
  );
}

console.log("");
console.log("(b) is the orbit of 9 the orbit of 1 delayed by some c? searching c in 0..40 at n=28 and n=401");
for (const n of [28, 401]) {
  const { words, step } = makeEngine(n);
  const T = 3 * n;
  const orb = (x0) => {
    const out = [];
    let cur = new Uint32Array(words); cur[0] = x0;
    let nxt = new Uint32Array(words);
    for (let t = 0; t <= T; t++) { out.push(Uint32Array.from(cur)); step(cur, nxt); const tmp = cur; cur = nxt; nxt = tmp; }
    return out;
  };
  const o1 = orb(1), o9 = orb(9);
  const hits = [];
  for (let c = -40; c <= 40; c++) {
    let ok = true;
    for (let t = Math.max(0, -c) + 2 * n; t <= T && t + c <= T; t++) if (!eq(o9[t], o1[t + c], words)) { ok = false; break; }
    if (ok) hits.push(c);
  }
  console.log(`  n=${n}: offsets c with orbit9(t) == orbit1(t+c) for all t >= 2n:  ${hits.length ? hits.join(", ") : "NONE"}`);
  // and where the two orbits first coincide at all
  let firstCoincide = null;
  for (let t = 0; t <= T && firstCoincide === null; t++)
    for (let s = 0; s <= T; s++) if (eq(o9[t], o1[s], words)) { firstCoincide = [t, s]; break; }
  console.log(`  n=${n}: first (t,s) with orbit9(t) == orbit1(s): ${firstCoincide ? firstCoincide.join(" , ") : "none in range"}`);
}
