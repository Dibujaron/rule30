// Astrolabe, 2026-09-13.  Three things the first d_n script could not reach.
//
// [V] VALIDATION against the paper's own published values.  Durr-Rapaport-
//     Theyssier's Lemma 10 states "For rule 132 we have d_n = n+1", and the
//     same value is stated for rule 23.  If my implementation of their
//     definition is right it must reproduce n+1 at every n for both.
//
// [D] rule 30's d_n pushed to n = 13, with the ONE-WAY complexity log2 d_n
//     read against its own ceiling n, to decide DRT's open question for this
//     rule: is d_n polynomial or exponential?
//
// [R] the left/right information rate.  rows(M_c^n) counts what the LEFT half
//     of row 0 can say to the origin; cols counts the RIGHT half.  The two
//     differ enormously for rule 30.  This block measures both rates in bits
//     per cell and runs the mirror rule 86 as the orientation control.
//
// Exact and exhaustive throughout; no sampling.

const W32 = 32;
function ruleBit(rule, l, c, r) { return (rule >> (4 * l + 2 * c + r)) & 1; }

function distinctRows(rule, n, centre, swap) {
  const words = Math.max(1, (1 << n) / W32);
  const width = 2 * n + 1;
  const origin = n;
  const freeMask = [];
  for (let k = 0; k < n; k++) {
    const m = new Uint32Array(words);
    for (let idx = 0; idx < 1 << n; idx++) if ((idx >> k) & 1) m[idx >>> 5] |= 1 << (idx & 31);
    freeMask.push(m);
  }
  const ONES = new Uint32Array(words).fill(0xffffffff | 0);
  const cur = [], nxt = [];
  for (let i = 0; i < width; i++) { cur.push(new Uint32Array(words)); nxt.push(new Uint32Array(words)); }
  const seen = new Set();
  for (let a = 0; a < 1 << n; a++) {
    for (let i = 0; i < width; i++) cur[i].fill(0);
    for (let k = 0; k < n; k++) {
      const fixedIdx = swap ? origin + 1 + k : k;
      const freeIdx = swap ? k : origin + 1 + k;
      if ((a >> k) & 1) cur[fixedIdx].set(ONES);
      cur[freeIdx].set(freeMask[k]);
    }
    if (centre) cur[origin].set(ONES);
    let lo = 0, hi = width - 1, bg = 0;
    for (let t = 0; t < n; t++) {
      const nlo = lo + 1, nhi = hi - 1;
      for (let i = nlo; i <= nhi; i++) {
        const L = cur[i - 1], C = cur[i], R = cur[i + 1], O = nxt[i];
        O.fill(0);
        for (let nb = 0; nb < 8; nb++) {
          if (((rule >> nb) & 1) === 0) continue;
          const sl = (nb >> 2) & 1, sc = (nb >> 1) & 1, sr = nb & 1;
          for (let w = 0; w < words; w++) {
            const x = sl ? L[w] : ~L[w], y = sc ? C[w] : ~C[w], z = sr ? R[w] : ~R[w];
            O[w] |= x & y & z;
          }
        }
      }
      for (let i = nlo; i <= nhi; i++) cur[i].set(nxt[i]);
      bg = ruleBit(rule, bg, bg, bg);
      lo = nlo; hi = nhi;
    }
    seen.add(Buffer.from(cur[origin].buffer.slice(0)).toString('latin1'));
  }
  return seen.size;
}
const dn = (rule, n) => Math.max(
  distinctRows(rule, n, 0, false), distinctRows(rule, n, 0, true),
  distinctRows(rule, n, 1, false), distinctRows(rule, n, 1, true));

// ------------------------------------------------------------------- [V]
console.log('[V] VALIDATION: DRT Lemma 10 says d_n = n+1 for rule 132, and the');
console.log('    same value for rule 23.  My implementation of their definition:');
for (const rule of [132, 23]) {
  const row = [], want = [];
  for (let n = 1; n <= 10; n++) { row.push(dn(rule, n)); want.push(n + 1); }
  const ok = row.every((v, i) => v === want[i]);
  console.log(`  rule ${String(rule).padStart(3)}: d_n = [${row.join(',')}]  expected [${want.join(',')}]  ${ok ? 'MATCH' : '*** MISMATCH ***'}`);
}

// ------------------------------------------------------------------- [D]
const ND = 13;
console.log(`\n[D] rule 30 (and its mirror 86) to n = ${ND}.  rows = what the LEFT`);
console.log('    half of row 0 can say; cols = what the RIGHT half can say.');
console.log('    "deficit" is n - log2(rows), the bits Alice may omit.');
console.log(' n   rows(M0)  cols(M0)  log2rows  deficit  log2cols  cols-bits/cell');
const rowsSeq = [], colsSeq = [];
for (let n = 1; n <= ND; n++) {
  const r = distinctRows(30, n, 0, false);
  const c = distinctRows(30, n, 0, true);
  rowsSeq.push(r); colsSeq.push(c);
  console.log(
    String(n).padStart(2) + String(r).padStart(11) + String(c).padStart(10) +
    Math.log2(r).toFixed(4).padStart(10) + (n - Math.log2(r)).toFixed(4).padStart(9) +
    Math.log2(c).toFixed(4).padStart(10) + (Math.log2(c) / n).toFixed(4).padStart(16));
}
console.log('rule 30 rows(M0): ' + rowsSeq.join(', '));
console.log('rule 30 cols(M0): ' + colsSeq.join(', '));
// least-squares slope of log2(cols) against n over the second half
{
  const pts = [];
  for (let n = Math.ceil(ND / 2); n <= ND; n++) pts.push([n, Math.log2(colsSeq[n - 1])]);
  const k = pts.length;
  const sx = pts.reduce((a, p) => a + p[0], 0), sy = pts.reduce((a, p) => a + p[1], 0);
  const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0), sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
  const slope = (k * sxy - sx * sy) / (k * sxx - sx * sx);
  console.log(`least-squares slope of log2(cols) vs n over n = ${Math.ceil(ND / 2)}..${ND}: ${slope.toFixed(4)} bits per cell`);
  const pts2 = [];
  for (let n = Math.ceil(ND / 2); n <= ND; n++) pts2.push([n, Math.log2(rowsSeq[n - 1])]);
  const sy2 = pts2.reduce((a, p) => a + p[1], 0), sxy2 = pts2.reduce((a, p) => a + p[0] * p[1], 0);
  const slope2 = (k * sxy2 - sx * sy2) / (k * sxx - sx * sx);
  console.log(`least-squares slope of log2(rows) vs n over the same range:       ${slope2.toFixed(4)} bits per cell`);
}

// ------------------------------------------------------------------- [R]
console.log('\n[R] the same two rates for a panel of rules, n = 10.  The four');
console.log('    bipermutive rules are the brief\'s control and must come out at 2.');
console.log('rule   rows   cols   log2rows/n  log2cols/n   left-permutive?');
const LP = new Set(); // left-permutive: flipping l always flips the output
for (let r = 0; r < 256; r++) {
  let ok = true;
  for (let c = 0; c < 2; c++) for (let rr = 0; rr < 2; rr++)
    if (ruleBit(r, 0, c, rr) === ruleBit(r, 1, c, rr)) ok = false;
  if (ok) LP.add(r);
}
for (const rule of [30, 86, 45, 106, 110, 22, 18, 90, 150, 105, 165, 60, 102, 184]) {
  const n = 10;
  const r = distinctRows(rule, n, 0, false), c = distinctRows(rule, n, 0, true);
  console.log(String(rule).padStart(4) + String(r).padStart(7) + String(c).padStart(7) +
    (Math.log2(r) / n).toFixed(4).padStart(13) + (Math.log2(c) / n).toFixed(4).padStart(12) +
    '   ' + (LP.has(rule) ? 'yes' : 'no'));
}
console.log('\nthe 16 left-permutive rules: ' + [...LP].join(', '));
