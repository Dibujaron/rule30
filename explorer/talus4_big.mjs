// Talus, 2026-09-09. THE DECISIVE TEST for "is 16 an artifact of k <= 5000?".
//
// Claim under test: the minimal p that closes the wall's instance at depth k is
// exactly the largest eventual period among left diagonals 0..k, which is
// 2^(number of period-doublings at or below k). NKS p. 871 puts the doublings at
// k = 3, 8, 29, 400, 87867. So the constant must be 16 for 400 <= k <= 87866 and
// 32 from k = 87867 on -- 16 is "5000 < 87867" and nothing else.
//
// Test: run the truncated orbit at width n = k+1 for k just below and just above
// 87867 and read off the largest t with r_t != r_{t-16} and with r_t != r_{t-32}.
// p works for the wall's instance at k iff that last difference is before 2k.
//
// Engine: bit-packed Uint32Array rows, r -> (4r XOR (2r|r)) mod 2^n, validated
// against the BigInt form at small n before any large run.

const W = 32;

function makeEngine(n) {
  const words = ((n + W - 1) / W) | 0;
  const topBits = n - (words - 1) * W; // 1..32 bits live in the top word
  const topMask = topBits === 32 ? 0xffffffff : ((1 << topBits) >>> 0) - 1;
  // out = (r<<2) ^ ((r<<1) | r), then mask to n bits
  function step(src, dst) {
    for (let i = words - 1; i >= 0; i--) {
      const a = src[i];
      const b = i >= 1 ? src[i - 1] : 0;
      const s1 = ((a << 1) | (b >>> 31)) >>> 0;
      const s2 = ((a << 2) | (b >>> 30)) >>> 0;
      dst[i] = (s2 ^ (s1 | a)) >>> 0;
    }
    dst[words - 1] = (dst[words - 1] & topMask) >>> 0;
  }
  return { words, step };
}

function eq(a, b, words) {
  for (let i = 0; i < words; i++) if (a[i] !== b[i]) return false;
  return true;
}

// ---- validation against BigInt ----
function bigOrbit(n, t) {
  const mask = (1n << BigInt(n)) - 1n;
  let r = 1n & mask;
  for (let i = 0; i < t; i++) r = ((4n * r) ^ ((2n * r) | r)) & mask;
  return r;
}
function packedOrbit(n, t) {
  const { words, step } = makeEngine(n);
  let cur = new Uint32Array(words);
  let nxt = new Uint32Array(words);
  cur[0] = 1;
  for (let i = 0; i < t; i++) {
    step(cur, nxt);
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  let v = 0n;
  for (let i = words - 1; i >= 0; i--) v = (v << 32n) | BigInt(cur[i] >>> 0);
  return v;
}
let bad = 0, checked = 0;
for (const n of [1, 2, 3, 5, 7, 8, 16, 31, 32, 33, 63, 64, 65, 100, 129]) {
  for (const t of [0, 1, 2, 3, 7, 20, 55, 200]) {
    checked++;
    if (bigOrbit(n, t) !== packedOrbit(n, t)) { bad++; console.log("MISMATCH", n, t); }
  }
}
console.log(`engine check: ${checked - bad}/${checked} agree with the BigInt form`);
if (bad) process.exit(1);

// ---- the run ----
const PS = [8, 16, 32, 64];
const MAXP = 64;

function scan(n, tmax) {
  const { words, step } = makeEngine(n);
  const ring = [];
  for (let i = 0; i <= MAXP; i++) ring.push(new Uint32Array(words));
  ring[0][0] = 1;
  const lastDiff = new Map(PS.map((p) => [p, -1]));
  for (let t = 1; t <= tmax; t++) {
    const cur = ring[t % (MAXP + 1)];
    step(ring[(t - 1 + MAXP + 1) % (MAXP + 1)], cur);
    for (const p of PS) {
      if (t >= p && !eq(ring[(t - p + MAXP + 1) % (MAXP + 1)], cur, words)) lastDiff.set(p, t);
    }
  }
  return lastDiff;
}

const KS = [5000, 87865, 87866, 87867, 87868, 90000];
console.log("");
console.log("k        n=k+1    2k        lastDiff(8)  lastDiff(16) lastDiff(32) lastDiff(64)  minimal p at 2k");
for (const k of KS) {
  const n = k + 1;
  const tmax = 2 * k + 2 * MAXP + 4;
  const t0 = Date.now();
  const ld = scan(n, tmax);
  let best = null;
  for (const p of PS) if (ld.get(p) < 2 * k) { best = p; break; }
  console.log(
    `${String(k).padStart(7)} ${String(n).padStart(7)} ${String(2 * k).padStart(8)}   ${String(ld.get(8)).padStart(10)} ${String(ld.get(16)).padStart(12)} ${String(ld.get(32)).padStart(12)} ${String(ld.get(64)).padStart(12)}  ${String(best).padStart(4)}   (${((Date.now() - t0) / 1000).toFixed(1)}s)`,
  );
}
