/**
 * Sextant, 2026-09-12. The row marginal: rho(t), G1(t), G2(t), and how far the
 * one-block bound can be pushed.
 *
 * Row t is 2t+1 cells, both edges black. Write
 *   b(t)   blacks
 *   w(t)   whites = 2t+1-b(t)
 *   rho(t) maximal black runs
 *   G1(t)  interior white gaps of length exactly 1
 *   G2(t)  interior white gaps of length >= 2      (G1+G2 = rho-1)
 *
 * Checked here:
 *   ID1 (Talus C4) b(t+1) = rho + 2*G2 + 2
 *   ID2            b(t+1) = 3*rho - 2*G1            (ID1 with G2 = rho-1-G1)
 *   IN1 (Talus C3) b(t+1) + 2*b(t) <= 4t+5
 *   IN2 (new)      2*b(t+1) + 3*b(t) <= 6t+9
 *
 * IN2 is the exact optimum of the one-block linear programme: maximise
 * rho + 2*G2 + 2 subject to G2 <= rho-1, rho-1+G2 <= w (gaps fit in the
 * whites), rho <= b. It is strictly sharper than IN1 at every row that is not
 * all black, and it gives triangle density <= 3/5 where IN1 gives 2/3.
 *
 * All bit scanning is word-parallel:
 *   bit i of the array is cell x = i - t, so "shift left by one index" is *2
 *   and the step is r -> 4r XOR (2r OR r), exactly rowStep.
 *   rho    = popcount(r & ~(r<<1))
 *   b-rho  = popcount(r & (r<<1))          (adjacent black pairs; a check)
 *   G1     = popcount((r<<1) & ~r & (r>>1))  -- white with black both sides
 *   longest black run: iterate r &= (r<<1) until empty.
 */

const N = 200_000;
const WORDS = ((2 * N + 160) >> 5) + 4;

const r = new Uint32Array(WORDS);
const sl1 = new Uint32Array(WORDS);   // bit i = bit i-1 of r
const sr1 = new Uint32Array(WORDS);   // bit i = bit i+1 of r
const tmp = new Uint32Array(WORDS);
r[0] = 1;

function popcount(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

// t = -2, not -1: at t = 0 a predecessor of -1 makes every check fire against
// an uninitialised row and report one phantom failure. Talus's own run has
// exactly that artifact (his section 5 records it).
let prev = { b: 0, rho: 0, G1: 0, G2: 0, t: -2 };
let id1Fail = 0, id1First = -1, id2Fail = 0, id2First = -1;
let in1Fail = 0, in2Fail = 0, in1First = -1, in2First = -1;
let in1Tight = Infinity, in1TightAt = 0, in2Tight = Infinity, in2TightAt = 0;
let in3Fail = 0;                       // b(t+1) <= 3*rho(t)
let S = 0, TRI = 0;
let maxRun = 0, maxRunAt = 0, maxGap = 0, maxGapAt = 0;
let maxDens = 0, maxDensAt = 0, minDens = 1, minDensAt = 0;
const samples = [];
const slackTrack = [];

for (let t = 0; t < N; t++) {
  const hi = Math.min(WORDS - 2, ((2 * t) >> 5) + 1);

  // shifted copies
  let carry = 0;
  for (let m = 0; m <= hi + 1; m++) {
    const cur = r[m];
    sl1[m] = ((cur << 1) | carry) >>> 0;
    carry = cur >>> 31;
  }
  for (let m = hi + 1; m >= 0; m--) {
    const nxt = m + 1 <= hi + 1 ? r[m + 1] : 0;
    sr1[m] = ((r[m] >>> 1) | (nxt << 31)) >>> 0;
  }

  let b = 0, rho = 0, adj = 0, G1 = 0;
  for (let m = 0; m <= hi + 1; m++) {
    const c = r[m], l = sl1[m], rr = sr1[m];
    b += popcount(c);
    rho += popcount((c & ~l) >>> 0);
    adj += popcount((c & l) >>> 0);
    G1 += popcount((l & ~c & rr) >>> 0);
  }
  const G2 = rho - 1 - G1;
  const w = 2 * t + 1 - b;

  if (adj !== b - rho) { console.log(`adjacency check failed at t=${t}`); break; }

  // longest black run and longest white gap, word-parallel
  {
    tmp.set(r.subarray(0, hi + 2));
    let L = 0, live = true;
    while (live) {
      L++;
      let c2 = 0, any = 0;
      for (let m = 0; m <= hi + 1; m++) {
        const cur = tmp[m];
        const s = ((cur << 1) | c2) >>> 0;
        c2 = cur >>> 31;
        tmp[m] = (cur & s) >>> 0;
        any |= tmp[m];
      }
      live = any !== 0;
    }
    if (L > maxRun) { maxRun = L; maxRunAt = t; }
  }

  if (prev.t === t - 1) {
    if (b !== prev.rho + 2 * prev.G2 + 2) { id1Fail++; if (id1First < 0) id1First = t; }
    if (b !== 3 * prev.rho - 2 * prev.G1) { id2Fail++; if (id2First < 0) id2First = t; }
    if (b > 3 * prev.rho) in3Fail++;
    const tt = t - 1;
    const s1 = (4 * tt + 5) - (b + 2 * prev.b);
    const s2 = (6 * tt + 9) - (2 * b + 3 * prev.b);
    if (s1 < 0) { in1Fail++; if (in1First < 0) in1First = tt; }
    if (s2 < 0) { in2Fail++; if (in2First < 0) in2First = tt; }
    if (s1 < in1Tight) { in1Tight = s1; in1TightAt = tt; }
    if (s2 < in2Tight) { in2Tight = s2; in2TightAt = tt; }
    if (tt === 10 || tt === 100 || tt === 1000 || tt === 10000 || tt === 100000) {
      slackTrack.push(`t=${tt}: IN1 slack ${s1} (${(s1 / (4 * tt + 5) * 100).toFixed(1)}% of RHS), ` +
        `IN2 slack ${s2} (${(s2 / (6 * tt + 9) * 100).toFixed(1)}%)`);
    }
  }

  const d = b / (2 * t + 1);
  if (t > 10) {
    if (d > maxDens) { maxDens = d; maxDensAt = t; }
    if (d < minDens) { minDens = d; minDensAt = t; }
  }
  S += b; TRI += 2 * t + 1;

  if (t === 1 || t === 2 || t === 3 || t === 10 || t === 1000 || t === 100000 || t === N - 1) {
    samples.push(`t=${t}: b=${b} w=${w} rho=${rho} G1=${G1} G2=${G2} ` +
      `d=${d.toFixed(5)} rho/(2t+1)=${(rho / (2 * t + 1)).toFixed(5)} ` +
      `G2/(rho-1)=${t > 1 ? (G2 / (rho - 1)).toFixed(5) : '-'}`);
  }

  prev = { b, rho, G1, G2, t };

  // step
  let p = 0;
  for (let m = 0; m <= hi + 1; m++) {
    const cur = r[m];
    const s2 = ((cur << 2) | (p >>> 30)) >>> 0;
    const s1 = ((cur << 1) | (p >>> 31)) >>> 0;
    r[m] = (s2 ^ (s1 | cur)) >>> 0;
    p = cur;
  }
}

console.log(`rows 0..${N - 1}`);
console.log(`ID1  b(t+1) = rho+2G2+2      : ${id1Fail} failures${id1First >= 0 ? ` first t=${id1First}` : ''}`);
console.log(`ID2  b(t+1) = 3rho-2G1       : ${id2Fail} failures${id2First >= 0 ? ` first t=${id2First}` : ''}`);
console.log(`IN3  b(t+1) <= 3 rho(t)      : ${in3Fail} failures`);
console.log(`IN1  b(t+1)+2b(t) <= 4t+5    : ${in1Fail} failures; min slack ${in1Tight} at t=${in1TightAt}`);
console.log(`IN2  2b(t+1)+3b(t) <= 6t+9   : ${in2Fail} failures; min slack ${in2Tight} at t=${in2TightAt}`);
console.log(`row density: max ${maxDens.toFixed(5)} at t=${maxDensAt}, min ${minDens.toFixed(5)} at t=${minDensAt}`);
console.log(`longest black run in any row: ${maxRun} at t=${maxRunAt}`);
console.log(`triangle density S/T^2 = ${(S / TRI).toFixed(6)}   (IN1 bound 0.66667, IN2 bound 0.60000)`);
for (const s of samples) console.log(`  ${s}`);
console.log(`  how much slack the method is wasting:`);
for (const s of slackTrack) console.log(`    ${s}`);
