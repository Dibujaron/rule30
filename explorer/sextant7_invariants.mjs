// sextant7_invariants.mjs   (Sextant, 2026-09-10)
//
// Question (1) of the topic: is there any quantity along the orbit that is
// monotone or conserved and that a DIAGONAL READ can see -- something whose
// value at bit t of row t is constrained even though bit t has not settled?
//
// Four batteries, all on the seed's own orbit:
//
//  A. RATIONAL-SPEED READS.  A read along bit b(s) = p*s + c of row
//     t(s) = q*s + d has "speed" v = p/q in the (row, bit) plane.  v = 0 is a
//     left diagonal (eventually periodic, proved), v = 2 a right diagonal
//     (exactly periodic, proved), v = 1 a column (the prize).  Are any other
//     speeds periodic?  If some v < 1 were, a read could be dragged toward the
//     centre column; if none is, the three integer speeds are the whole story.
//
//  B. ARITHMETIC RESIDUES.  rowNat t mod m for small m: conserved? periodic?
//
//  C. ROW POPCOUNT and its parity: any law?
//
//  D. LOCAL CONSERVATION LAWS.  Every 2-row x w-column block of the picture
//     that never occurs, for w = 1, 2, 3, found exhaustively over a large
//     region.  These are the only candidates for a law a moving read could be
//     constrained by, and the point is what they constrain: a PAIR of adjacent
//     cells, never a single one.
//
// Parameters in the file, no arguments.

const T = 60000;                  // rows for the read batteries
const W = 2 * T + 64;             // bits needed
const WORDS = (W >>> 5) + 2;
const NB = WORDS * 32;

function zero() { return new Uint32Array(WORDS); }
const s1 = zero(), s2 = zero();
function shl(dst, src, k) { for (let i = WORDS - 1; i >= 0; i--) dst[i] = ((src[i] << k) | (i > 0 ? (src[i - 1] >>> (32 - k)) : 0)) >>> 0; }
function step(dst, src) { shl(s1, src, 2); shl(s2, src, 1); for (let i = 0; i < WORDS; i++) dst[i] = (s1[i] ^ ((s2[i] | src[i]) >>> 0)) >>> 0; }
function bit(a, b) { return (b < 0 || b >= NB) ? 0 : (a[b >>> 5] >>> (b & 31)) & 1; }

// --- generic tests on a 0/1 array --------------------------------------
// A period is only accepted with at least MINCYCLES full periods of evidence
// past its onset.  Without that guard the test accepts vacuously -- an onset
// near the end of the sequence leaves no pair to compare, and the first run of
// this file reported "period 2001, onset 2000" for ten different moduli, which
// is what a check with an unstated denominator looks like.
const MINCYCLES = 8;
function eventuallyPeriodic(u, pcap, ncap) {
  const S = u.length;
  for (let p = 1; p <= pcap; p++) {
    let bad = -1;
    for (let i = S - p - 1; i >= 0; i--) if (u[i + p] !== u[i]) { bad = i; break; }
    const onset = bad + 1;
    if (onset > ncap) continue;
    if (S - onset < MINCYCLES * p) continue;      // not enough evidence
    return { p, onset, cycles: Math.floor((S - onset) / p) };
  }
  return null;
}
function factors(u, L, from) {
  const s = new Set();
  let v = 0;
  for (let i = from; i < u.length; i++) {
    v = ((v << 1) | u[i]) >>> 0;
    if (i - from >= L - 1) s.add(v & ((1 << L) - 1));
  }
  return s.size;
}

// ---------------- A. rational-speed reads -------------------------------
console.log('=== A. reads at rational speed v = p/q in the (row, bit) plane ===');
console.log('   bit b = p*s + c of row t = q*s + d.  position x = b - t.');
console.log('   v      c   d    terms   eventually periodic (p<=4096, onset<=S/2)?   distinct factors of length 24');
{
  const speeds = [
    [0, 1, 5, 0], [0, 1, 400, 0],
    [1, 4, 0, 0], [1, 3, 0, 0], [1, 2, 0, 0], [2, 3, 0, 0], [3, 4, 0, 0],
    [1, 1, 0, 0], [1, 1, -1, 0], [1, 1, 1, 0],
    [5, 4, 0, 0], [4, 3, 0, 0], [3, 2, 0, 0], [7, 4, 0, 0],
    [2, 1, 0, 0], [2, 1, -1, 0], [2, 1, -5, 0], [2, 1, -8, 0], [2, 1, -9, 0],
  ];
  // collect all reads in one pass over the rows
  const S = [];
  for (const _ of speeds) S.push([]);
  let R = zero(); R[0] = 1; const tmp = zero();
  for (let t = 0; t <= T; t++) {
    for (let i = 0; i < speeds.length; i++) {
      const [p, q, c, d] = speeds[i];
      if ((t - d) % q !== 0 || t < d) continue;
      const s = (t - d) / q, b = p * s + c;
      if (b < 0) continue;
      S[i].push(bit(R, b));
    }
    step(tmp, R); R.set(tmp);
  }
  for (let i = 0; i < speeds.length; i++) {
    const [p, q, c, d] = speeds[i], u = S[i];
    const per = eventuallyPeriodic(u, 4096, Math.floor(u.length / 2));
    const fac = factors(u, 24, Math.floor(u.length / 2));
    const vs = (p / q).toFixed(4);
    console.log(`  ${vs.padStart(7)}  ${String(c).padStart(3)} ${String(d).padStart(3)}  ${String(u.length).padStart(7)}   ${per ? `YES  period ${per.p}, onset ${per.onset}` : 'no'.padEnd(28)}   ${fac}`);
  }
}

// ---------------- B. arithmetic residues --------------------------------
console.log('\n=== B. rowNat t mod m ===');
{
  const TT = 60000;
  for (const m of [3, 5, 7, 9, 11, 13, 17, 31, 255, 257]) {
    const M = BigInt(m);
    // rowStep is not a ring map, so the residue cannot be stepped on its own:
    // the whole row has to be carried, which is feasible to a few thousand rows
    let big = 1n; const seq = [];
    for (let t = 0; t <= 4000; t++) { seq.push(Number(big % M)); big = (4n * big) ^ ((2n * big) | big); }
    const per = eventuallyPeriodic(seq, 2048, 2000);
    const distinct = new Set(seq.slice(2000)).size;
    console.log(`  m = ${String(m).padStart(4)}:  rows 0..4000, eventually periodic? ${per ? `YES period ${per.p} onset ${per.onset}` : 'no'};  distinct residues in the tail: ${distinct} of ${m}`);
  }
}

// ---------------- C. row popcount ---------------------------------------
console.log('\n=== C. popcount of rowNat t ===');
{
  let big = 1n; const pc = [], par = [];
  for (let t = 0; t <= 4000; t++) {
    let c = 0, x = big; while (x) { c += Number(x & 1n); x >>= 1n; }
    pc.push(c); par.push(c & 1);
    big = (4n * big) ^ ((2n * big) | big);
  }
  const per = eventuallyPeriodic(par, 2048, 2000);
  console.log(`  popcount parity, rows 0..4000: eventually periodic? ${per ? `YES period ${per.p}` : 'no'};  distinct factors of length 24 in the tail: ${factors(par, 24, 2000)}`);
  console.log(`  popcount(t)/t over t in [3500,4000]: ${(pc.slice(3500).reduce((a, b, i) => a + b / (3500 + i), 0) / 501).toFixed(5)}  (A070952, no law in print)`);
  let mono = 0;
  for (let t = 1; t <= 4000; t++) if (pc[t] < pc[t - 1]) mono++;
  console.log(`  popcount decreases on ${mono} of 4000 steps -- not monotone`);
}

// ---------------- D. local conservation laws ----------------------------
console.log('\n=== D. 2-row x w-column blocks that never occur in the picture ===');
{
  const TT = 4000;
  for (const w of [1, 2, 3, 4, 5, 6, 7]) {
    let cur = zero(); cur[0] = 1;
    const seen = new Set();
    const tmp2 = zero();
    for (let t = 0; t < TT; t++) {
      step(tmp2, cur);
      // every window that lies inside row t+1's cone, so both rows are real cells
      for (let b = 0; b + w <= 2 * (t + 1) + 1; b++) {
        let top = 0, bot = 0;
        for (let i = 0; i < w; i++) { top = (top << 1) | bit(cur, b + i); bot = (bot << 1) | bit(tmp2, b + i); }
        seen.add(top * (1 << w) + bot);
      }
      cur.set(tmp2);
    }
    const all = 1 << (2 * w);
    // what the RULE alone allows: in a 2 x w block the bottom cells at offsets
    // 2 .. w-1 are a function of the top three above them; the leftmost two
    // bottom cells read cells outside the window and are free.  So the rule
    // permits 2^w * 4 blocks for w >= 2, and 4 for w = 1.
    let allowed = 0;
    for (let v = 0; v < all; v++) {
      const top = (v >> w) & ((1 << w) - 1), bot = v & ((1 << w) - 1);
      const tb = (i) => (top >> (w - 1 - i)) & 1;      // top cell at offset i
      const bb = (i) => (bot >> (w - 1 - i)) & 1;
      let ok = true;
      for (let i = 2; i < w; i++) if (bb(i) !== (tb(i - 2) ^ (tb(i - 1) | tb(i)))) { ok = false; break; }
      if (ok) allowed++;
    }
    console.log(`  w = ${w}: ${seen.size} of ${all} blocks occur; the rule alone permits ${allowed}` +
      `  -> ${seen.size === allowed ? 'EQUAL: no local law beyond the rule' : 'DIFFERENT: an extra law'}`);
  }
}

// ---------------- D2. the forbidden block as a packed-row identity -------
console.log('\n=== D2. crystal 8 in the packed-row vocabulary ===');
console.log('   claim: (rowStep r >> 2) AND r AND (r >> 1) = 0 -- two adjacent black bits');
console.log('   at b, b+1 force bit b+2 of the next row white.');
{
  let big = 1n, bad = 0;
  for (let t = 0; t <= 3000; t++) {
    const nx = (4n * big) ^ ((2n * big) | big);
    if (((nx >> 2n) & big & (big >> 1n)) !== 0n) bad++;
    big = nx;
  }
  console.log(`  rows 0..3000: ${bad} violations`);
  // and: does it ever constrain the centre column alone?
  let r = 1n, both = 0, forced = 0;
  for (let t = 0; t <= 20000; t++) {
    const c0 = (r >> BigInt(t)) & 1n, c1 = (r >> BigInt(t + 1)) & 1n;
    const nx = (4n * r) ^ ((2n * r) | r);
    if (c0 === 1n && c1 === 1n) { both++; if (((nx >> BigInt(t + 2)) & 1n) === 0n) forced++; }
    r = nx;
  }
  console.log(`  at the origin: column 0 and column 1 both black at ${both} of 20001 rows;`);
  console.log(`  column 1 white at the next row in ${forced} of those ${both} -- the law fires, and it`);
  console.log('  constrains column 1, never column 0 on its own.');
}
