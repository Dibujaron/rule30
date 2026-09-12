// Rosetta, 2026-09-12. Where the reachable set's Fourier mass lives.
//
// Two fixes to rosetta6_reach.mjs, both of which changed answers:
//
// (1) ORIENTATION. The mirror check there was vacuous twice over. Mirroring the
//     picture fixes the centre column, so rule 86's centre column EQUALS rule
//     30's, and row weights are mirror-invariant too. The asymmetric anchor
//     that does work is a LEFT DIAGONAL: in the packed row (bit b = cell b - t)
//     a left diagonal is a FIXED bit index and a right diagonal moves two bits
//     per row. Obstruction 4's eventually-white left diagonals are k = 2, 7,
//     28, 399, so bit 2 of rowNat t must be white for all large t, and under
//     the mirror bit 2 is a right diagonal instead and is purely periodic.
//
// (2) NORMALISATION. A_t built from all 2^m configs in a window is a nested
//     union over effective span, and that nesting alone produces a huge
//     autocorrelation at h = 2^(N-1) (flip the rightmost cell). The honest set
//     is Sextant's: configs of span EXACTLY m. Both are reported.

const STEP = {
  30: (r) => (4 * r) ^ ((2 * r) | r),
  86: (r) => ((4 * r) | (2 * r)) ^ r,
  90: (r) => (4 * r) ^ r,
  150: (r) => (4 * r) ^ (2 * r) ^ r,
};

const pc = (x) => { let c = 0; while (x) { x &= x - 1; c++; } return c; };

function orientation() {
  console.log('=== orientation, by an asymmetric board fact ===');
  for (const rule of [30, 86]) {
    let r = 1;
    const bit2 = [];
    for (let t = 0; t <= 40; t++) { bit2.push((r >> 2) & 1); r = STEP[rule](r); }
    const tail = bit2.slice(5).join('');
    console.log(`  rule ${rule}: bit 2 of rowNat t, t=0..40 = ${bit2.join('')}`);
    console.log(`     tail from t=5 all white? ${/^0+$/.test(tail) ? 'YES' : 'NO'}`
      + `   (left diagonal 2 is eventually white: obstruction 4)`);
  }
  // and the reversal identity: rule 86's row must be rule 30's row reversed,
  // and the rows must not be palindromes, or the test proves nothing.
  let a = 1, b = 1, allrev = true, anyPal = false;
  for (let t = 0; t <= 14; t++) {
    const n = 2 * t + 1;
    let rev = 0;
    for (let i = 0; i < n; i++) if ((a >> i) & 1) rev |= 1 << (n - 1 - i);
    if (rev !== b) allrev = false;
    if (rev === a) anyPal = true;
    a = STEP[30](a); b = STEP[86](b);
  }
  console.log(`  rule 86 row = reverse(rule 30 row), t<=14: ${allrev ? 'YES' : 'NO'}`);
  console.log(`  any row a palindrome (which would make it vacuous)? ${anyPal ? 'YES' : 'NO'}`);
  console.log();
}

// A_t(m), span-exact: configs with bit 0 and bit m-1 both set. The image then
// has bit 0 and bit N-1 set (the cone edges are black), so strip those two
// coordinates and the set lives in F_2^(N-2) with density 4^-t.
function spanExact(rule, m, t) {
  const step = STEP[rule];
  const N = m + 2 * t;
  const D = N - 2;
  const size = 1 << D;
  const ind = new Int32Array(size);
  const members = [];
  const fixedTop = 1 << (N - 1);
  for (let mid = 0; mid < (1 << (m - 2)); mid++) {
    const c = 1 | (mid << 1) | (1 << (m - 1));
    let r = c;
    for (let s = 0; s < t; s++) r = step(r);
    if ((r & 1) !== 1 || (r & fixedTop) === 0) throw new Error('cone edge not black');
    const y = (r >> 1) & (size - 1); // drop bit 0 and bit N-1
    if (ind[y]) throw new Error('collision: map not injective');
    ind[y] = 1; members.push(y);
  }
  return { D, size, ind, members: Int32Array.from(members), K: members.length, N };
}

function wht(a) {
  const n = a.length;
  for (let len = 1; len < n; len <<= 1)
    for (let i = 0; i < n; i += len << 1)
      for (let j = i; j < i + len; j++) {
        const u = a[j], v = a[j + len];
        a[j] = u + v; a[j + len] = u - v;
      }
}

function lowBit(g) { return Math.log2(g & -g) | 0; }
function highBit(g) { return 31 - Math.clz32(g); }

function report(label, S, band) {
  const { D, size, ind, members, K } = S;
  const f = new Float64Array(size);
  for (let i = 0; i < size; i++) f[i] = ind[i];
  wht(f);
  const rndLevel = Math.sqrt(K); // sd of a random set's character sum
  let maxAll = 0, maxAllAt = 0, exact = 0;
  // the middle band: characters whose support lies entirely in [lo, hi]
  const lo = Math.floor(D * band), hi = D - 1 - Math.floor(D * band);
  let maxMid = 0, maxMidAt = 0, midCount = 0;
  for (let g = 1; g < size; g++) {
    const v = Math.abs(f[g]);
    if (v > maxAll) { maxAll = v; maxAllAt = g; }
    if (Math.round(v) === K) exact++;
    if (lowBit(g) >= lo && highBit(g) <= hi) {
      midCount++;
      if (v > maxMid) { maxMid = v; maxMidAt = g; }
    }
  }
  // top few coefficients and how wide their support is
  const idx = [];
  for (let g = 1; g < size; g++) idx.push(g);
  idx.sort((p, q) => Math.abs(f[q]) - Math.abs(f[p]));
  const top = idx.slice(0, 6).map((g) =>
    `${(Math.abs(f[g]) / K).toFixed(3)}@[${lowBit(g)}..${highBit(g)}]`);
  console.log(`${label}  F_2^${D}  |A|=${K}  density=${(K / size).toExponential(3)} (4^-t=${(4 ** -S.Nt).toExponential(3)})`);
  console.log(`   exact linear relations (|A^(g)|=|A|, g!=0) : ${exact}`);
  console.log(`   max_{g!=0}     |A^(g)|/|A| = ${(maxAll / K).toFixed(5)} at bits [${lowBit(maxAllAt)}..${highBit(maxAllAt)}]`);
  console.log(`   max over MIDDLE band [${lo}..${hi}] (${midCount} chars) = ${(maxMid / K).toFixed(5)} at bits [${lowBit(maxMidAt)}..${highBit(maxMidAt)}]`);
  console.log(`      random-set scale sqrt(|A|)/|A| = ${(rndLevel / K).toFixed(5)};  2sqrt(D ln2 /|A|) = ${(2 * Math.sqrt(D * Math.LN2 / K)).toFixed(5)}`);
  console.log(`   top coefficients (value @ [lowest..highest set bit]): ${top.join('  ')}`);
  let wmin = 1e9, wmax = -1, wsum = 0;
  for (const y of members) { const w = pc(y) + 2; if (w < wmin) wmin = w; if (w > wmax) wmax = w; wsum += w; }
  console.log(`   row weights: min=${wmin} max=${wmax} mean=${(wsum / K).toFixed(3)} of span ${S.N} (mean/N=${(wsum / K / S.N).toFixed(4)})`);
  console.log();
}

function randomSet(D, K, seed) {
  let s = seed >>> 0;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const size = 1 << D;
  const ind = new Int32Array(size);
  const members = new Int32Array(K);
  let n = 0;
  while (n < K) { const x = Math.floor(rnd() * size); if (!ind[x]) { ind[x] = 1; members[n++] = x; } }
  return { D, size, ind, members, K, N: D + 2, Nt: 0 };
}

orientation();

console.log('=== span-exact reachable set: where the Fourier mass lives ===');
console.log('(a character is labelled by [lowest..highest set bit]; low bits are');
console.log(' left diagonals, high bits are right diagonals, the middle is the');
console.log(' band the centre column sits in)\n');

for (const [m, t] of [[8, 6], [10, 5], [12, 4], [14, 3], [16, 2]]) {
  for (const rule of [30, 90, 150]) {
    const S = spanExact(rule, m, t); S.Nt = t;
    report(`rule ${rule}  m=${m} t=${t}`, S, 1 / 3);
  }
  const D = m + 2 * t - 2;
  report(`RANDOM     m=${m} t=${t}`, randomSet(D, 1 << (m - 2), 777 + m), 1 / 3);
  console.log('----------------------------------------------------------\n');
}
