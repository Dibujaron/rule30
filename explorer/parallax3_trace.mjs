// Parallax, 2026-09-09, thermodynamic-formalism sighting.
//
// THE TRACE MEASURE OF RULE 30 UNDER THE UNIFORM ENSEMBLE.
//
// Under the (1/2,1/2) Bernoulli measure on Config (the measure of maximal
// entropy for the shift, preserved by rule 30 because rule 30 is surjective —
// crystal 3/36, Hedlund), what is the joint distribution of the centre column
// word (c_0, ..., c_{n-1})?
//
// c_t depends only on cells in [-t, t], so the word of length n depends only on
// the window [-(n-1), n-1], of width 2n-1, and its distribution is the pushforward
// of the uniform measure on {0,1}^{2n-1}.
//
// Claim to test: EVERY word of length n has EXACTLY 2^{n-1} preimage windows,
// i.e. the trace measure is exactly Bernoulli(1/2) at every finite length.
//
// Also tested: the same for the pair-of-columns trace (columns 0 and 1 together),
// and for a "one-sided" ensemble (windows white on x <= -1), which is the class
// the seed actually lives in.

const bit = (r, j) => (r >>> j) & 1;

// One rule 30 step on a fixed-width row packed into an int, bit j = position j.
// new(j) = old(j-1) XOR (old(j) OR old(j+1)); cells outside the width are white.
const step = (r, mask) => (((r << 1) ^ (r | (r >>> 1))) & mask) >>> 0;

// Column word of length n at offset `off` (bit index of the cell being read),
// from a window of width W. Returns an int whose bit t is the cell at time t.
function columnWord(w0, W, n, off) {
  const mask = (W === 31 ? 0x7fffffff : ((1 << W) - 1)) >>> 0;
  let r = w0, out = 0;
  for (let t = 0; t < n; t++) {
    out |= bit(r, off) << t;
    r = step(r, mask);
  }
  return out >>> 0;
}

console.log('=== A. full ensemble: distribution of the centre column word ===');
console.log('n  windows      distinct words  min count  max count  uniform?');
for (let n = 1; n <= 12; n++) {
  const W = 2 * n - 1;            // positions -(n-1) .. (n-1)
  const off = n - 1;              // the origin
  const N = 1 << W;
  const counts = new Int32Array(1 << n);
  for (let w = 0; w < N; w++) counts[columnWord(w, W, n, off)]++;
  let mn = Infinity, mx = -Infinity, distinct = 0;
  for (let v = 0; v < (1 << n); v++) {
    if (counts[v] > 0) distinct++;
    if (counts[v] < mn) mn = counts[v];
    if (counts[v] > mx) mx = counts[v];
  }
  console.log(
    String(n).padEnd(3), String(N).padEnd(12), String(distinct).padEnd(15),
    String(mn).padEnd(10), String(mx).padEnd(10),
    (mn === mx && mn === (1 << (n - 1))) ? 'YES (= 2^(n-1))' : 'NO');
}

console.log();
console.log('=== B. full ensemble: the PAIR (column 0, column 1) jointly ===');
console.log('n  windows      distinct pairs  min count  max count  uniform?');
for (let n = 1; n <= 10; n++) {
  // column 1 at time t needs cells in [1-t, 1+t]; both words of length n need
  // [-(n-1), n]. Width 2n.
  const W = 2 * n;
  const off0 = n - 1, off1 = n;
  const N = 1 << W;
  const counts = new Int32Array(1 << (2 * n));
  for (let w = 0; w < N; w++) {
    const a = columnWord(w, W, n, off0), b = columnWord(w, W, n, off1);
    counts[(a << n) | b]++;
  }
  let mn = Infinity, mx = -Infinity, distinct = 0;
  for (let v = 0; v < (1 << (2 * n)); v++) {
    if (counts[v] > 0) distinct++;
    if (counts[v] < mn) mn = counts[v];
    if (counts[v] > mx) mx = counts[v];
  }
  console.log(
    String(n).padEnd(3), String(N).padEnd(12), String(distinct).padEnd(15),
    String(mn).padEnd(10), String(mx).padEnd(10),
    (mn === mx) ? `YES (all = ${mn})` : 'NO');
}

console.log();
console.log('=== C. the number-like ensemble: windows white on x <= -1 ===');
console.log('(the class the seed lives in: uniform on cells x = 0..n-1, white left)');
console.log('n  configs      distinct words  min count  max count  entropy/step');
for (let n = 1; n <= 22; n++) {
  const W = n + 1;             // positions 0 .. n (white to the left)
  const off = 0;
  const N = 1 << n;            // cells 0..n-1 free; cell n irrelevant for t<n
  const counts = new Map();
  for (let w = 0; w < N; w++) {
    const v = columnWord(w, W, n, off);
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  let mn = Infinity, mx = -Infinity;
  for (const c of counts.values()) { if (c < mn) mn = c; if (c > mx) mx = c; }
  console.log(
    String(n).padEnd(3), String(N).padEnd(12), String(counts.size).padEnd(15),
    String(mn).padEnd(10), String(mx).padEnd(10),
    (Math.log2(counts.size) / n).toFixed(4));
}
