// Astrolabe, 2026-09-13. Communication-complexity vantage, aimed at P3.
//
// Durr-Rapaport-Theyssier (arXiv cs/0210008, TCS 322 (2004) 355-368) classify
// the 256 elementary rules by the growth of d_n.  Their definition, fetched
// from ar5iv:
//
//   M_0^n(i,j) := f^n(b_i^<-, 0, b_j)     (centre cell fixed to 0)
//   M_1^n(i,j) := f^n(b_i^<-, 1, b_j)     (centre cell fixed to 1)
//   d_n := max { #distinct rows of M_0^n, #distinct cols of M_0^n,
//                #distinct rows of M_1^n, #distinct cols of M_1^n }
//
// b_k is k in binary on exactly n bits; Alice holds the n cells left of the
// origin, Bob the n cells right of it, and the value read is the origin cell
// after n steps.
//
// log2 d_n is exactly the ONE-WAY communication complexity of the prediction
// problem, and it is also a Neciporuk term: the number of distinct subfunctions
// obtained by fixing every variable outside Alice's block.
//
// Method: bit-parallel over the free side's 2^n inputs.  Each cell carries a
// 2^n-bit mask, one bit per assignment; a CA step is bitwise.  The window is
// exactly the light cone -n..n with the (evolving, uniform) background outside,
// so nothing is approximated and non-quiescent rules are handled correctly.
// Exact and exhaustive; no sampling anywhere in this file.

const W32 = 32;

function ruleBit(rule, l, c, r) { return (rule >> (4 * l + 2 * c + r)) & 1; }

// Count distinct rows of M_centre^n: distinct functions (free side) -> centre
// value, as the fixed side ranges over its 2^n inputs.  swap=true exchanges
// the two sides, which counts distinct COLUMNS instead.
function distinctRows(rule, n, centre, swap) {
  const words = Math.max(1, (1 << n) / W32);
  const width = 2 * n + 1;
  const origin = n;

  // free-side cell masks: free cell k is bit k of the free index
  const freeMask = [];
  for (let k = 0; k < n; k++) {
    const m = new Uint32Array(words);
    for (let idx = 0; idx < 1 << n; idx++) if ((idx >> k) & 1) m[idx >>> 5] |= 1 << (idx & 31);
    freeMask.push(m);
  }
  const ZERO = new Uint32Array(words);
  const ONES = new Uint32Array(words).fill(0xffffffff | 0);

  // scratch buffers, reused
  const cur = []; const nxt = [];
  for (let i = 0; i < width; i++) { cur.push(new Uint32Array(words)); nxt.push(new Uint32Array(words)); }

  const seen = new Set();
  const A = 1 << n;
  for (let a = 0; a < A; a++) {
    for (let i = 0; i < width; i++) cur[i].fill(0);
    for (let k = 0; k < n; k++) {
      // fixed side occupies cells -n..-1 (indices 0..n-1) unless swapped
      const fixedIdx = swap ? origin + 1 + k : k;
      const freeIdx = swap ? k : origin + 1 + k;
      if ((a >> k) & 1) cur[fixedIdx].set(ONES);
      cur[freeIdx].set(freeMask[k]);
    }
    if (centre) cur[origin].set(ONES);

    let lo = 0, hi = width - 1;      // live range; shrinks by one each side
    let bg = 0;                       // the uniform background outside [lo,hi]
    for (let t = 0; t < n; t++) {
      const nlo = lo + 1, nhi = hi - 1;
      for (let i = nlo; i <= nhi; i++) {
        const L = cur[i - 1], C = cur[i], R = cur[i + 1], O = nxt[i];
        O.fill(0);
        for (let nb = 0; nb < 8; nb++) {
          if (((rule >> nb) & 1) === 0) continue;
          const sl = (nb >> 2) & 1, sc = (nb >> 1) & 1, sr = nb & 1;
          for (let w = 0; w < words; w++) {
            const x = sl ? L[w] : ~L[w];
            const y = sc ? C[w] : ~C[w];
            const z = sr ? R[w] : ~R[w];
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

function dnParts(rule, n) {
  return [
    distinctRows(rule, n, 0, false),
    distinctRows(rule, n, 0, true),
    distinctRows(rule, n, 1, false),
    distinctRows(rule, n, 1, true),
  ];
}
function dn(rule, n) { return Math.max(...dnParts(rule, n)); }

// DRT's own lists, transcribed from the fetched ar5iv text.
const drtBounded = new Set([0, 1, 2, 3, 4, 5, 7, 8, 10, 12, 13, 15, 19, 24, 27, 28, 29, 32, 34, 36, 38, 42, 46, 51, 60, 71, 72, 76, 78, 90, 105, 108, 128, 130, 136, 138, 140, 150, 154, 156, 160, 170, 172, 200, 204]);
const drtLinear = new Set([11, 14, 23, 33, 35, 43, 44, 50, 56, 58, 77, 132, 142, 152, 168, 178, 184, 232]);
const drtOther = new Set([6, 9, 18, 22, 25, 26, 30, 37, 40, 41, 45, 54, 57, 62, 73, 74, 94, 104, 106, 110, 122, 126, 134, 146, 164]);
const drtClass = (r) => drtBounded.has(r) ? 'bounded' : drtLinear.has(r) ? 'linear' : drtOther.has(r) ? 'other' : null;

// ---------------------------------------------------------------- [A] control
const NA = 9;
console.log(`[A] d_n for named rules, n = 1..${NA}.  DRT class in brackets.`);
for (const rule of [0, 51, 60, 90, 105, 150, 170, 204, 184, 232, 30, 86, 135, 149, 45, 106, 110, 22, 18]) {
  const row = []; for (let n = 1; n <= NA; n++) row.push(dn(rule, n));
  console.log(String(rule).padStart(4) + ` [${String(drtClass(rule) ?? '-').padEnd(7)}] ` + row.map((v) => String(v).padStart(4)).join(' '));
}

// ------------------------------------------------------------ [B] all 256
const NB = 6;
console.log(`\n[B] all 256 rules to n=${NB}; my classification against DRT's lists.`);
const table = [];
for (let rule = 0; rule < 256; rule++) {
  const row = []; for (let n = 1; n <= NB; n++) row.push(dn(rule, n));
  table.push(row);
}
const mine = [];
for (let rule = 0; rule < 256; rule++) {
  const r = table[rule];
  const tail = r.slice(-3);
  const d1 = []; for (let i = 1; i < r.length; i++) d1.push(r[i] - r[i - 1]);
  const t1 = d1.slice(-2);
  if (tail[0] === tail[1] && tail[1] === tail[2]) mine.push('bounded');
  else if (t1[0] === t1[1] && t1[0] > 0) mine.push('linear');
  else mine.push('other');
}
let agree = 0; const disagree = [];
for (let rule = 0; rule < 256; rule++) {
  const d = drtClass(rule); if (d === null) continue;
  if (d === mine[rule]) agree++; else disagree.push(`  ${rule}: DRT=${d} mine=${mine[rule]} d_n=[${table[rule]}]`);
}
console.log(`DRT's three lists name ${drtBounded.size + drtLinear.size + drtOther.size} of 256 rules; agreement ${agree}, disagreement ${disagree.length}`);
for (const d of disagree) console.log(d);
for (const c of ['bounded', 'linear', 'other']) {
  const rs = []; for (let r = 0; r < 256; r++) if (mine[r] === c) rs.push(r);
  console.log(`${c} (${rs.length}): ${rs.join(', ')}`);
}
const last = table.map((r) => r[r.length - 1]);
const order = last.map((v, i) => [v, i]).sort((x, y) => y[0] - x[0]);
console.log(`d_${NB}: ceiling 2^${NB}=${1 << NB}; max ${order[0][0]}; rule 30 = ${last[30]}, rank ${order.findIndex((p) => p[1] === 30) + 1} of 256`);
console.log('top 14: ' + order.slice(0, 14).map((p) => `${p[1]}:${p[0]}`).join(', '));
console.log(`rules at the ceiling: ` + last.map((v, i) => [v, i]).filter((p) => p[0] === (1 << NB)).map((p) => p[1]).join(', '));

// ------------------------------------------------------------- [C] deep
const NC = 11;
for (const rule of [30, 90, 150, 45, 110, 86]) {
  console.log(`\n[C] rule ${rule}: the four counts, d_n, and d_n/2^n, n = 1..${NC}`);
  console.log(' n  rows(M0) cols(M0) rows(M1) cols(M1)    d_n   d_n/2^n  log2d_n   d_n/d_{n-1}');
  let prev = null;
  for (let n = 1; n <= NC; n++) {
    const p = dnParts(rule, n); const d = Math.max(...p);
    console.log(
      String(n).padStart(2) + '  ' + p.map((v) => String(v).padStart(8)).join(' ') +
      String(d).padStart(7) + '  ' + (d / (1 << n)).toFixed(4).padStart(7) +
      '  ' + Math.log2(d).toFixed(3).padStart(7) + '   ' + (prev ? (d / prev).toFixed(4) : '  -'));
    prev = d;
  }
}
