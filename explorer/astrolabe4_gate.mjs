// Astrolabe, 2026-09-13.  Is rule 30's right-side rate of 1/2 bit per cell the
// OR gate, or a coincidence?
//
// Every left-permutive elementary rule has the form  new = l XOR g(c, r)  for
// one of the 16 Boolean functions g of two arguments, and the 16 such rules are
// 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240.
// They share their LEFT structure exactly and differ only in g, so they are the
// control family that isolates what g does to the RIGHT side's information rate.
//
// Rule 30 is g = (c OR r).  If the measured 1/2 is the OR masking the right
// argument whenever c is black, then the rules whose g depends on r only
// through a mask by c should show 1/2 and the rest should not.
//
// Also: does ANY elementary rule attain the ceiling d_n = 2^n exactly?  If the
// deficit is positive for all 256, then rule 30's positive deficit is a class
// property of locality and carries no information -- the warning this vantage
// was handed.  What would carry information is the deficit TENDING TO ZERO.

const W32 = 32;
function ruleBit(rule, l, c, r) { return (rule >> (4 * l + 2 * c + r)) & 1; }

function distinctRows(rule, n, centre, swap) {
  const words = Math.max(1, (1 << n) / W32);
  const width = 2 * n + 1, origin = n;
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
      const fi = swap ? origin + 1 + k : k, gi = swap ? k : origin + 1 + k;
      if ((a >> k) & 1) cur[fi].set(ONES);
      cur[gi].set(freeMask[k]);
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
      bg = ruleBit(rule, bg, bg, bg); lo = nlo; hi = nhi;
    }
    seen.add(Buffer.from(cur[origin].buffer.slice(0)).toString('latin1'));
  }
  return seen.size;
}

function slope(seq, from, to) {
  const pts = []; for (let n = from; n <= to; n++) pts.push([n, Math.log2(seq[n - 1])]);
  const k = pts.length, sx = pts.reduce((a, p) => a + p[0], 0), sy = pts.reduce((a, p) => a + p[1], 0);
  const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0), sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
  return (k * sxy - sx * sy) / (k * sxx - sx * sx);
}

// name g for each left-permutive rule by reading the table at l = 0
function gName(rule) {
  const v = [ruleBit(rule, 0, 0, 0), ruleBit(rule, 0, 0, 1), ruleBit(rule, 0, 1, 0), ruleBit(rule, 0, 1, 1)];
  const names = {
    '0000': '0', '1111': '1', '0011': 'c', '1100': '!c', '0101': 'r', '1010': '!r',
    '0001': 'c AND r', '1110': '!(c AND r)', '0111': 'c OR r', '1000': '!(c OR r)',
    '0110': 'c XOR r', '1001': '!(c XOR r)', '0010': 'c AND !r', '1101': '!(c AND !r)',
    '0100': '!c AND r', '1011': '!(!c AND r)',
  };
  return names[v.join('')] ?? v.join('');
}

const LP = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240];
const NMAX = 12;

console.log('[G] the 16 LEFT-PERMUTIVE rules: new = l XOR g(c,r).  Same left');
console.log('    structure, different g.  Rates are least-squares slopes of');
console.log(`    log2(count) against n over n = 7..${NMAX}, in bits per cell.`);
console.log('rule  g                left rate  right rate   cols(M0) at n=' + NMAX);
const rows = [];
for (const rule of LP) {
  const R = [], C = [];
  for (let n = 1; n <= NMAX; n++) { R.push(distinctRows(rule, n, 0, false)); C.push(distinctRows(rule, n, 0, true)); }
  rows.push([rule, gName(rule), slope(R, 7, NMAX), slope(C, 7, NMAX), C[NMAX - 1], C.slice(0, NMAX)]);
}
rows.sort((a, b) => b[3] - a[3]);
for (const [rule, g, lr, rr, last] of rows) {
  console.log(String(rule).padStart(4) + '  ' + g.padEnd(16) + lr.toFixed(4).padStart(9) + rr.toFixed(4).padStart(12) + String(last).padStart(12));
}
console.log('\n  cols sequences (n = 1..' + NMAX + '):');
for (const [rule, g, , , , seq] of rows) console.log('  ' + String(rule).padStart(4) + ' ' + g.padEnd(16) + ' ' + seq.join(', '));

// ------------------------------------------------------- ceiling check
console.log('\n[H] does ANY of the 256 rules attain d_n = 2^n exactly?  And how');
console.log('    does rule 30\'s deficit n - log2(rows) compare with the best?');
for (const n of [6, 7, 8]) {
  let best = -1, bestRule = -1, atCeiling = [];
  const defs = [];
  for (let rule = 0; rule < 256; rule++) {
    const r = Math.max(distinctRows(rule, n, 0, false), distinctRows(rule, n, 0, true),
      distinctRows(rule, n, 1, false), distinctRows(rule, n, 1, true));
    defs.push(r);
    if (r === (1 << n)) atCeiling.push(rule);
    if (r > best) { best = r; bestRule = rule; }
  }
  const sorted = defs.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
  console.log(`  n=${n}: ceiling ${1 << n}; max d_n = ${best} (rule ${bestRule}); at ceiling: ${atCeiling.length ? atCeiling.join(',') : 'NONE'}`);
  console.log(`        rule 30 d_n = ${defs[30]}, rank ${sorted.findIndex((p) => p[1] === 30) + 1} of 256; top 8: ${sorted.slice(0, 8).map((p) => p[1] + ':' + p[0]).join(' ')}`);
}
