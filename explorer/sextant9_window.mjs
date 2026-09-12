// Sextant, 2026-09-12. Topic: the 4^-t constraint.
//
// C1: every word occurs as a WINDOW of row t of some FINITE configuration,
// for every t.  Constructive: solve leftward t times from the target word
// (free cells set to white), pad the result with white on both sides, evolve
// t steps, and read the window back.
//
// Engine self-check first, against an ASYMMETRIC known object: the seed's
// rows 1..4 of rule 30 are 111, 11001, 1101111, 110010001? -- rows 1..3 are
// hand-verified in the attack document and row 3 = 1101111 is not a
// palindrome, so a mirrored engine (rule 86) fails it.

const T_MAX = 8;
const N_MAX = 16;

// A row is {left, cells:Uint8Array}; everything outside is white.
function step(row) {
  const n = row.cells.length;
  const c = row.cells;
  const get = (k) => (k < 0 || k >= n) ? 0 : c[k];
  const out = new Uint8Array(n + 2);
  // out[j] sits at absolute position (left-1)+j; its inputs are row indices j-2, j-1, j.
  for (let j = 0; j < n + 2; j++) out[j] = get(j - 2) ^ (get(j - 1) | get(j));
  return { left: row.left - 1, cells: out };
}

function evolveRow(row, t) { let r = row; for (let s = 0; s < t; s++) r = step(r); return r; }

function show(row) { return Array.from(row.cells).join(''); }

// --- self-check -------------------------------------------------------------
{
  let r = { left: 0, cells: Uint8Array.from([1]) };
  const want = ['1', '111', '11001', '1101111'];
  for (let t = 0; t < 4; t++) {
    if (show(r) !== want[t]) { console.log('ENGINE FAIL at row', t, show(r), 'want', want[t]); process.exit(1); }
    r = step(r);
  }
  // asymmetry: row 3 reversed is 1111011, which a mirrored engine would produce
  console.log('engine self-check: rows 0..3 = ' + want.join(' ') + '  (row 3 is not a palindrome: OK)');
}

// --- leftward solve ---------------------------------------------------------
// Given a target word y occupying absolute positions [0, n-1] at time s,
// return the word x at time s-1 occupying [-1, n], with the two free cells
// (positions n-1 and n) set to `free` (a 2-bit number, bit0 = cell n-1,
// bit1 = cell n).  Relation: x(i-1) = y(i) XOR (x(i) OR x(i+1)).
function solveBack(y, free) {
  const n = y.length;
  const x = new Uint8Array(n + 2);          // x[j] sits at absolute position j-1
  x[n] = free & 1;                          // absolute n-1
  x[n + 1] = (free >> 1) & 1;               // absolute n
  for (let i = n - 1; i >= 0; i--) {
    // x(i-1) = y(i) XOR (x(i) | x(i+1));  index into x is (abs + 1)
    x[i] = y[i] ^ (x[i + 1] | x[i + 2]);
  }
  return x;                                  // absolute positions [-1, n]
}

// Solve back t times with all free cells white; returns the row-0 word
// occupying absolute positions [-t, n-1+t].
function preimageWord(w, t) {
  let cur = w;                               // occupies [0, n-1] in ITS OWN frame
  for (let s = 0; s < t; s++) cur = solveBack(cur, 0);
  return cur;
}

// --- C1: exhaustive window test --------------------------------------------
let totalTested = 0, totalFail = 0;
const firstFail = [];
for (let t = 0; t <= T_MAX; t++) {
  for (let n = 1; n <= (t <= 4 ? N_MAX : 12); n++) {
    if (n > 16) continue;
    const words = 1 << n;
    if (words > (1 << 16)) continue;
    let fail = 0;
    for (let code = 0; code < words; code++) {
      const w = new Uint8Array(n);
      for (let j = 0; j < n; j++) w[j] = (code >> j) & 1;
      const pre = preimageWord(w, t);        // absolute [-t, n-1+t]
      const row0 = { left: -t, cells: pre };
      const rowT = evolveRow(row0, t);       // left = -2t
      // read absolute positions [0, n-1] out of rowT
      let ok = true;
      for (let j = 0; j < n; j++) {
        const idx = (0 + j) - rowT.left;
        if (rowT.cells[idx] !== w[j]) { ok = false; break; }
      }
      totalTested++;
      if (!ok) { fail++; totalFail++; if (firstFail.length < 5) firstFail.push({ t, n, code }); }
    }
    if (fail) console.log(`t=${t} n=${n}: ${fail} FAILURES of ${words}`);
  }
}
console.log(`C1 construction: ${totalTested} (t, word) pairs tested, ${totalFail} failures`);
if (firstFail.length) console.log('first failures', firstFail);

// --- cross-check by brute-force search (no construction) --------------------
// Collect every factor of length n appearing in row t over ALL finite
// configurations of span <= S, and check the factor set is complete.
function factorsAtDepth(t, span, n) {
  const seen = new Set();
  for (let m = 1; m <= span; m++) {
    const hi = m === 1 ? 1 : (1 << (m - 2));
    for (let mid = 0; mid < hi; mid++) {
      const cells = new Uint8Array(m);
      cells[0] = 1; cells[m - 1] = 1;
      for (let j = 1; j < m - 1; j++) cells[j] = (mid >> (j - 1)) & 1;
      const r = evolveRow({ left: 0, cells }, t);
      for (let s = 0; s + n <= r.cells.length; s++) {
        let code = 0;
        for (let j = 0; j < n; j++) code |= r.cells[s + j] << j;
        seen.add(code);
      }
    }
  }
  return seen;
}
for (const [t, span, n] of [[1, 12, 6], [2, 12, 6], [3, 14, 8], [4, 14, 8], [5, 16, 8], [6, 18, 8]]) {
  const s = factorsAtDepth(t, span, n);
  console.log(`brute force: t=${t}, configs of span<=${span}: ${s.size} of ${1 << n} words of length ${n} occur as a factor`);
}
