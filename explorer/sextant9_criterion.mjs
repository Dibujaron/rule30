// Sextant, 2026-09-12. Topic: the 4^-t constraint.
//
// C2: an EXACT decision procedure for "is this word row t of a finite
// configuration?", and the claim that it costs exactly two bits per step.
//
// The procedure. Rule 30 is left-permutive, so x(i-1) = y(i) XOR (x(i)|x(i+1)):
// given the image y and two cells of x at the right, x is determined leftward.
// A FINITE preimage must be white far to the right, and the only right tail
// consistent with y white far right is the all-white one, so the finite
// preimage -- if it exists -- is UNIQUE and is computed by one right-to-left
// sweep.  Left of y's support the recursion degenerates to x(i-1) = x(i)|x(i+1),
// which is all-white if the pair (x(a-1), x(a)) is (0,0) and all-BLACK forever
// otherwise.  So finiteness of the preimage is exactly two bits, at the left
// edge, per backward step.
//
// Tested three ways: against brute-force enumeration of every finite
// configuration of small span; against the count 2^(n-2t-2) that
// pre-injectivity predicts; and the two-bit claim itself is measured, not
// assumed (the rate at which the two bits come out white).

function step(row) {
  const n = row.cells.length, c = row.cells;
  const get = (k) => (k < 0 || k >= n) ? 0 : c[k];
  const out = new Uint8Array(n + 2);
  for (let j = 0; j < n + 2; j++) out[j] = get(j - 2) ^ (get(j - 1) | get(j));
  return { left: row.left - 1, cells: out };
}
function evolveRow(row, t) { let r = row; for (let s = 0; s < t; s++) r = step(r); return r; }
function key(row) {           // canonical: trim white, then the bit string
  let a = 0, b = row.cells.length - 1;
  while (a <= b && !row.cells[a]) a++;
  while (b >= a && !row.cells[b]) b--;
  if (a > b) return '';
  return Array.from(row.cells.slice(a, b + 1)).join('');
}

// self-check
{
  let r = { left: 0, cells: Uint8Array.from([1]) };
  const want = ['1', '111', '11001', '1101111'];
  for (let t = 0; t < 4; t++) { if (key(r) !== want[t]) { console.log('ENGINE FAIL', t, key(r)); process.exit(1); } r = step(r); }
  console.log('engine self-check OK (rows 0..3 = 1 111 11001 1101111)');
}

// ---------------------------------------------------------------------------
// One backward step.  Input: a trimmed bit string y (support exactly its own
// length, both ends black).  Output: {ok, word} -- ok is false when the two
// cells left of the support come out non-white, i.e. no finite preimage.
// Returns the trimmed preimage word when ok.
function backOne(y) {
  const n = y.length;
  // absolute frame: y occupies [0, n-1].  x occupies at most [-2, n-1];
  // x(i) = 0 for i >= n-1 (shown in the header), and we solve leftward from
  // i = n-1 down to i = -1, computing x(i-1).
  const lo = -2;                       // we need x(-1) and x(-2) to test
  const x = new Int8Array(n + 2);      // x[p - lo] holds x(p), p in [-2, n-1]
  const get = (p) => (p >= n - 1 || p < lo) ? 0 : x[p - lo];
  const set = (p, v) => { if (p >= lo && p < n - 1) x[p - lo] = v; };
  for (let i = n - 1; i >= -1; i--) {
    const yi = (i >= 0 && i < n) ? (y.charCodeAt(i) - 48) : 0;
    set(i - 1, yi ^ (get(i) | get(i + 1)));
  }
  // The two bits.  y's support starts at a = 0, so the pair to test is
  // (x(a-1), x(a)) = (x(-1), x(0)).  The loop already computed
  // x(-2) = x(-1) | x(0), so testing x(-1) = 0 and x(-2) = 0 is exactly that
  // pair.  (x(0) = 0 is then automatic, which is why the preimage's support
  // starts at 1: the cone shrinks by one cell going backwards.)
  if (get(-1) !== 0 || get(-2) !== 0) return { ok: false };
  let s = '';
  for (let p = 0; p <= n - 2; p++) s += get(p);
  // trim
  let a = 0, b = s.length - 1;
  while (a <= b && s[a] === '0') a++;
  while (b >= a && s[b] === '0') b--;
  if (a > b) return { ok: true, word: '' };
  return { ok: true, word: s.slice(a, b + 1), leadingWhite: a };
}

// Decide: is `w` row t of a finite configuration?
function reachable(w, t) {
  let cur = w;
  for (let s = 0; s < t; s++) {
    if (cur === '') return { ok: false, why: 'empty' };
    const r = backOne(cur);
    if (!r.ok) return { ok: false, why: 'step ' + s };
    cur = r.word;
  }
  return { ok: true, pre: cur };
}

// ---------------------------------------------------------------------------
// Test 1: exhaustive agreement with brute force, at every depth t and span n.
function bruteReachable(t, n) {          // set of row-t words of length exactly n
  const out = new Set();
  const m = n - 2 * t;
  if (m < 1) return out;
  const hi = m === 1 ? 1 : (1 << (m - 2));
  for (let mid = 0; mid < hi; mid++) {
    const cells = new Uint8Array(m);
    cells[0] = 1; cells[m - 1] = 1;
    for (let j = 1; j < m - 1; j++) cells[j] = (mid >> (j - 1)) & 1;
    out.add(key(evolveRow({ left: 0, cells }, t)));
  }
  return out;
}

let disagreements = 0, checked = 0;
for (let t = 1; t <= 6; t++) {
  for (let n = 2 * t + 1; n <= Math.min(2 * t + 14, 20); n++) {
    const truth = bruteReachable(t, n);
    // every word of length n with both ends black
    let fp = 0, fn = 0, total = 0;
    for (let code = 0; code < (1 << (n - 2)); code++) {
      let s = '1';
      for (let j = 0; j < n - 2; j++) s += (code >> j) & 1;
      s += '1';
      const dec = reachable(s, t).ok;
      const tru = truth.has(s);
      total++; checked++;
      if (dec && !tru) fp++;
      if (!dec && tru) fn++;
    }
    if (fp || fn) { disagreements += fp + fn; console.log(`t=${t} n=${n}: DISAGREE fp=${fp} fn=${fn} of ${total}`); }
    const predicted = (n - 2 * t === 1) ? 1 : (n - 2 * t >= 2 ? (1 << (n - 2 * t - 2)) : 0);
    if (truth.size !== predicted) console.log(`t=${t} n=${n}: COUNT ${truth.size} != predicted ${predicted}`);
  }
}
console.log(`criterion vs brute force: ${checked} words decided, ${disagreements} disagreements`);
console.log('count 2^(n-2t-2) confirmed at every (t,n) above (no COUNT lines printed means exact)');

// ---------------------------------------------------------------------------
// Test 2: the two bits.  Over all words of length n with black ends, measure
// the survival rate at each backward step.  Predicted 1/4 per step if the two
// bits are fair; the exact count is 2^(n-2t-2)/2^(n-2), i.e. 4^-t.
for (const n of [18, 20]) {
  let alive = [];
  for (let code = 0; code < (1 << (n - 2)); code++) {
    let s = '1';
    for (let j = 0; j < n - 2; j++) s += (code >> j) & 1;
    s += '1';
    alive.push(s);
  }
  const rates = [];
  let cur = alive;
  for (let t = 1; t <= 7; t++) {
    const next = [];
    for (const s of cur) {
      const r = backOne(s);
      if (r.ok && r.word !== '') next.push(r.word);
    }
    rates.push((next.length / cur.length).toFixed(6));
    cur = next;
    if (!cur.length) break;
  }
  console.log(`n=${n}: survival rate per backward step = ${rates.join(' ')}   (1/4 = 0.250000)`);
}

// ---------------------------------------------------------------------------
// Test 3: is the FINITE preimage unique?  For each reachable word at t=1,
// count the finite preimages by brute force over a generous span.
{
  const n = 14;
  let multi = 0, tested = 0;
  const pre = new Map();
  for (let m = 1; m <= n - 2; m++) {
    const hi = m === 1 ? 1 : (1 << (m - 2));
    for (let mid = 0; mid < hi; mid++) {
      const cells = new Uint8Array(m);
      cells[0] = 1; cells[m - 1] = 1;
      for (let j = 1; j < m - 1; j++) cells[j] = (mid >> (j - 1)) & 1;
      const img = key(evolveRow({ left: 0, cells }, 1));
      const w = Array.from(cells).join('');
      if (!pre.has(img)) pre.set(img, []);
      pre.get(img).push(w);
    }
  }
  for (const [img, list] of pre) { tested++; if (list.length > 1) { multi++; if (multi <= 3) console.log('MULTIPLE finite preimages of', img, list); } }
  console.log(`finite-preimage uniqueness: ${tested} images from configs of span<=${n - 2}, ${multi} with more than one preimage`);
}
