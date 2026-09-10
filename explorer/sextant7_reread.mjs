// sextant7_reread.mjs   (Sextant, 2026-09-10)
//
// THE question of the topic, done with the right quantity.
//
// centerColumn k = leftDiagonal k 0.  So centre-column cell k is re-readable in
// the SETTLED region -- at the same bit index k, at rows k + m*P_k, i.e. by a
// SPEED-ZERO read where the settling front has long passed -- exactly when left
// diagonal k has onset ZERO, i.e. is periodic from its very first index.
//
// This is the per-diagonal onset o_k, and it is NOT pre(k+1) - k, which is the
// preperiod of the whole prefix of bits 0..k and is therefore a max over j <= k
// of (o_j + j) - k.  I labelled the prefix quantity "onset" in
// sextant7_front.mjs and it cost me a wrong claim: pre(20) - 19 = 1 says the
// PREFIX is not settled at row 19, while o_19 = 0 -- bit 19 alone is.
//
// So: for which k is o_k = 0?  Measured here as deep as the engine reaches.
//
// Also reported: for the k with o_k = 0, the row of the second reading and how
// far behind the settling front it sits, which is the whole point.

const T = 60000;                       // rows
const KMAX = 20000;                    // diagonals
const NB = 2 * KMAX + 4096, WORDS = (NB >>> 5) + 2;
function zero() { return new Uint32Array(WORDS); }
const s1 = zero(), s2 = zero();
function shl(d, s, k) { for (let i = WORDS - 1; i >= 0; i--) d[i] = ((s[i] << k) | (i > 0 ? (s[i - 1] >>> (32 - k)) : 0)) >>> 0; }
function step(d, s) { shl(s1, s, 2); shl(s2, s, 1); for (let i = 0; i < WORDS; i++) d[i] = (s1[i] ^ ((s2[i] | s[i]) >>> 0)) >>> 0; }
function bit(a, b) { return (b < 0 || b >= NB) ? 0 : (a[b >>> 5] >>> (b & 31)) & 1; }

// For each diagonal k we only need: does leftDiagonal k j equal leftDiagonal k (j+P)
// for every j >= 0, for P = 32?  (32 is a multiple of every left diagonal's
// eventual period below bit 2,107,985,255.)  Equivalently: is bit k of rowNat t
// equal to bit k of rowNat (t+32) at EVERY row t >= k?
//
// Keep a rolling window of 33 rows and compare.  A diagonal is "onset 0" iff it
// never disagrees over the whole run.
const LAG = 32;
const ring = [];
for (let i = 0; i <= LAG; i++) ring.push(zero());
ring[0][0] = 1;

const zeroOnset = new Uint8Array(KMAX + 1).fill(1);   // 1 until a disagreement is seen
const firstBreak = new Int32Array(KMAX + 1).fill(-1); // the row where it first broke
let head = 0;
let checked = 0;
for (let t = 0; t < T; t++) {
  const cur = ring[head], nxt = ring[(head + 1) % (LAG + 1)];
  step(nxt, cur);
  head = (head + 1) % (LAG + 1);
  const tNew = t + 1;
  if (tNew >= LAG) {
    // ring[head] is row tNew; ring[(head+1)%(LAG+1)] is row tNew-LAG
    const old = ring[(head + 1) % (LAG + 1)];
    const now = ring[head];
    const tOld = tNew - LAG;
    for (let k = 0; k <= Math.min(KMAX, tOld); k++) {
      if (!zeroOnset[k]) continue;
      if (bit(old, k) !== bit(now, k)) { zeroOnset[k] = 0; firstBreak[k] = tOld; }
    }
    checked++;
  }
}
const zs = [];
for (let k = 0; k <= KMAX; k++) if (zeroOnset[k]) zs.push(k);
console.log(`rows 0..${T}, diagonals 0..${KMAX}, lag ${LAG}`);
console.log(`diagonals with onset 0 (periodic from index 0 with period dividing 32):`);
console.log(`  ${JSON.stringify(zs)}`);
console.log(`  count ${zs.length}; largest ${zs[zs.length - 1]}`);
console.log(`\neach such k gives a SECOND reading of centerColumn k at bit index k, rows k + 32m.`);
console.log(`the settling front A(t) passes bit k at row pre(k+1); for these k that row is small,`);
console.log(`so the second reading is genuinely in the settled region -- for a FINITE set of k.`);

// how much evidence does each surviving k have, and how much does each dead k need?
console.log('\n--- how fast the rest die ---');
{
  const buckets = new Map();
  for (let k = 20; k <= KMAX; k++) {
    if (zeroOnset[k]) continue;
    const d = firstBreak[k] - k;      // index along the diagonal where it first broke
    buckets.set(d, (buckets.get(d) || 0) + 1);
  }
  const ks = [...buckets.keys()].sort((a, b) => a - b);
  console.log(`  first disagreement at diagonal index d, over k = 20..${KMAX}:`);
  for (const d of ks.slice(0, 12)) console.log(`    d = ${d}: ${buckets.get(d)} diagonals`);
  let mx = 0; for (const d of ks) mx = Math.max(mx, d);
  console.log(`    largest first-disagreement index: ${mx}`);
}

// the two diagonals above 17 that survive to 400 in the other script
console.log('\n--- the survivors in detail ---');
for (const k of zs.filter(k => k >= 15)) {
  // read the diagonal and report its minimal period
  console.log(`  k = ${k}: onset 0 to row ${T}; centre-column cell ${k} is a settled cell.`);
}
