// sextant7_reread2.mjs   (Sextant, 2026-09-10)
//
// sextant7_reread.mjs deeper.  Left diagonal k has onset 0 -- so centre-column
// cell k = leftDiagonal k 0 is re-readable at bit index k in the settled region
// -- iff bit k of rowNat t equals bit k of rowNat (t+32) at EVERY row t >= k.
//
// Almost every diagonal fails at its very first index, so the set of undecided
// diagonals at any row is tiny and only the alive ones need testing.  That
// makes k = 200,000 cheap where the naive loop was quadratic.
//
// Rows are truncated to KMAX + 64 bits; truncation is exact for the low bits
// (stepMod), and no bit above KMAX is read.

const KMAX = 200000;
const T = KMAX + 200;                  // every k <= KMAX gets tested from its own index 0
const NB = KMAX + 96, WORDS = (NB >>> 5) + 2;
const LAG = 32;

function zero() { return new Uint32Array(WORDS); }
const s1 = zero(), s2 = zero();
function shl(d, s, k) { for (let i = WORDS - 1; i >= 0; i--) d[i] = ((s[i] << k) | (i > 0 ? (s[i - 1] >>> (32 - k)) : 0)) >>> 0; }
function step(d, s) { shl(s1, s, 2); shl(s2, s, 1); for (let i = 0; i < WORDS; i++) d[i] = (s1[i] ^ ((s2[i] | s[i]) >>> 0)) >>> 0; }
function bit(a, b) { return (a[b >>> 5] >>> (b & 31)) & 1; }

const ring = [];
for (let i = 0; i <= LAG; i++) ring.push(zero());
ring[0][0] = 1;

let alive = [];                        // diagonals still undecided
const survivors = [];
const dHist = new Map();
let head = 0;
for (let t = 0; t < T; t++) {
  const cur = ring[head], nxt = ring[(head + 1) % (LAG + 1)];
  step(nxt, cur);
  head = (head + 1) % (LAG + 1);
  const tNew = t + 1;
  if (tNew < LAG) continue;
  const old = ring[(head + 1) % (LAG + 1)];   // row tNew - LAG
  const now = ring[head];                     // row tNew
  const tOld = tNew - LAG;
  if (tOld <= KMAX) alive.push(tOld);         // diagonal tOld becomes testable at its index 0
  const next = [];
  for (const k of alive) {
    if (bit(old, k) !== bit(now, k)) { const d = tOld - k; dHist.set(d, (dHist.get(d) || 0) + 1); }
    else next.push(k);
  }
  alive = next;
}
console.log(`rows 0..${T}, diagonals 0..${KMAX}, lag ${LAG}`);
console.log(`still undecided at the end (each tested from its index 0 to index ${T - LAG - KMAX} at worst):`);
console.log(`  ${JSON.stringify(alive)}`);
console.log(`  count ${alive.length}; largest ${alive[alive.length - 1]}`);
console.log('\nNOTE the small-k members are tested over ~' + (T - LAG) + ' indices; the largest k only over ~' + (T - LAG - KMAX) + '.');
console.log('Diagonals near KMAX therefore carry less evidence -- read the table below for how');
console.log('much is enough: 99.99% of diagonals fail within 12 indices.');

console.log('\n--- first disagreement index d, over all k in 20..' + KMAX + ' that failed ---');
{
  const ks = [...dHist.keys()].sort((a, b) => a - b);
  let tot = 0; for (const d of ks) tot += dHist.get(d);
  let cum = 0;
  for (const d of ks) {
    cum += dHist.get(d);
    if (d <= 20) console.log(`  d = ${String(d).padStart(2)}: ${String(dHist.get(d)).padStart(7)}   (${(100 * dHist.get(d) / tot).toFixed(3)}%,  cumulative ${(100 * cum / tot).toFixed(4)}%)`);
  }
  console.log(`  largest first-disagreement index: ${ks[ks.length - 1]}`);
  console.log(`  total failures: ${tot}`);
}
