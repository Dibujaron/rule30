// Talus, 2026-09-09. Rowland 2006 section 5, lines 930-946: the first place the left
// side of rule 30 could branch is his column 53209 (our bit 53208), where column 53208
// is eventually white and the period of column 53207 has EVEN weight, so the period of
// 53209 is not invariant under negation. He gives two candidate periods there and says
// "each of these periods leads to two other possible periods (at columns 58288 and
// 72577 respectively)" -- the seed takes 58288, and 72577 belongs to the OTHER branch.
// He does not establish that the other branch occurs for any initial condition.
//
// talus4_branchcycle.mjs exhibits the other branch as an explicit periodic point of the
// truncated row map. This reads its eventually-white bits and checks Rowland's 72577.

const W = 32;
const N = 80000;   // wide enough to see 72576/72577 and past 58286
const P = 16;      // eventual period for k = N-1 < 87867

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

function cycleFrom(start) {
  const { words, step } = makeEngine(N);
  const T = 3 * N;
  const ring = [];
  for (let i = 0; i <= P; i++) ring.push(new Uint32Array(words));
  ring[0].set(start.subarray(0, words));
  let last = -1;
  for (let t = 1; t <= T; t++) {
    const cur = ring[t % (P + 1)];
    step(ring[(t - 1 + P + 1) % (P + 1)], cur);
    if (t >= P && !eq(ring[(t - P + P + 1) % (P + 1)], cur, words)) last = t;
  }
  const states = [];
  for (let i = 0; i < P; i++) states.push(Uint32Array.from(ring[(T - i + P + 1) % (P + 1)]));
  return { states, pre: last + 1, settled: last < T, words };
}
function whitesOf(cyc) {
  const out = [];
  for (let j = 0; j < N; j++) {
    let all0 = true;
    for (const st of cyc.states) if ((st[(j / 32) | 0] >>> (j % 32)) & 1) { all0 = false; break; }
    if (all0) out.push(j);
  }
  return out;
}
function weightAt(cyc, j) {
  let c = 0;
  for (const st of cyc.states) c += (st[(j / 32) | 0] >>> (j % 32)) & 1;
  return c;
}

const words = ((N + W - 1) / W) | 0;
const one = new Uint32Array(words); one[0] = 1;
const seed = cycleFrom(one);
console.log(`seed cycle: settled=${seed.settled} pre=${seed.pre}`);
const wSeed = whitesOf(seed);
console.log(`seed's eventually-white bits below ${N}: ${wSeed.join(", ")}`);

const flipped = Uint32Array.from(seed.states[0]);
const b = 53208;
flipped[(b / 32) | 0] ^= (1 << (b % 32)) >>> 0;
const alt = cycleFrom(flipped);
console.log(`other branch: settled=${alt.settled} pre=${alt.pre}`);
const wAlt = whitesOf(alt);
console.log(`other branch's eventually-white bits below ${N}: ${wAlt.join(", ")}`);
console.log("");
console.log(`Rowland: the seed's branch splits next at his column 58288 (our bit 58287, white at 58286);`);
console.log(`         the other branch at his column 72577 (our bit 72576, white at 72575).`);
console.log(`  seed  has a white at 58286? ${wSeed.includes(58286)}   at 72575? ${wSeed.includes(72575)}`);
console.log(`  other has a white at 58286? ${wAlt.includes(58286)}   at 72575? ${wAlt.includes(72575)}`);
console.log("");
for (const w of wAlt) {
  if (w < 100) continue;
  console.log(`  other branch white at bit ${w}: weight of bit ${w - 1} over one period = ${weightAt(alt, w - 1)} (${weightAt(alt, w - 1) % 2 ? "odd -> period doubles" : "even -> period stays, branch"})`);
}
for (const w of wSeed) {
  if (w < 100) continue;
  console.log(`  seed         white at bit ${w}: weight of bit ${w - 1} over one period = ${weightAt(seed, w - 1)} (${weightAt(seed, w - 1) % 2 ? "odd -> period doubles" : "even -> period stays, branch"})`);
}
