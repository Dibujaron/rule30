// t62_enum.cjs -- INDEPENDENT re-derivation of the temporally periodic
// configurations of rule 30, written from scratch to adjudicate Talus's C3.
//
// Rule 30 as this project states it: new(l,c,r) = l XOR (c OR r), i.e.
//   F(C)(i) = C(i-1) XOR (C(i) OR C(i+1)).
//
// Method A (window map): F^L is left-permutive with radius L, so for a config
// with F^L(C) = C the equation at i = j+L determines C(j) from the 2L cells
// C(j+1..j+2L). Cycles of that map on 2^(2L) states = the configs.
//   All words below are printed in NORMAL LEFT-TO-RIGHT SPATIAL ORDER.
// Method B (brute force): every ring of size n <= NMAX, all 2^n of them,
// stepped with a ring evolver, minimal temporal period read off directly.
// No permutivity, no window map, no shared code with A beyond nothing.

const LMAX = 12;
const NMAX = 22;

// ---------- method A ----------

// one shrinking rule-30 step on an integer bit-row: bit p = cell p.
// new bit p = c_{p-1} ^ (c_p | c_{p+1}); bits outside the shrinking window are
// garbage but never read.
function triStep(cells) {
  return ((cells << 1) ^ (cells | (cells >>> 1))) >>> 0;
}
function triL(cells, L) {
  let r = cells >>> 0;
  for (let t = 0; t < L; t++) r = triStep(r);
  return r;
}

function buildMap(L) {
  const W = 2 * L, S = 1 << W, mask = S - 1;
  const next = new Int32Array(S);
  const head = new Uint8Array(S);
  let permutivityFailures = 0;
  for (let s = 0; s < S; s++) {
    const target = (s >>> (L - 1)) & 1;      // C(j+L), which is cells bit L
    const v0 = (triL((s << 1) >>> 0, L) >>> L) & 1;   // with C(j) = 0
    const cj = v0 ^ target;
    // audit left-permutivity explicitly on the small cases
    if (L <= 8) {
      const v1 = (triL((((s << 1) >>> 0) | 1) >>> 0, L) >>> L) & 1;
      if (v1 === v0) permutivityFailures++;
      const chosen = (v0 === target) ? 0 : 1;
      const got = chosen === 0 ? v0 : v1;
      if (got !== target) permutivityFailures++;
    }
    head[s] = cj;
    next[s] = ((((s << 1) >>> 0) | cj) & mask) >>> 0;
  }
  return { next, head, S, permutivityFailures };
}

// all cycles of `next`, each returned as a left-to-right spatial ring word
function cyclesA(L) {
  const { next, head, S, permutivityFailures } = buildMap(L);
  const colour = new Uint8Array(S);
  const out = [];
  for (let s0 = 0; s0 < S; s0++) {
    if (colour[s0]) continue;
    const path = [];
    let s = s0;
    while (colour[s] === 0) { colour[s] = 1; path.push(s); s = next[s]; }
    if (colour[s] === 1) {
      const cyc = path.slice(path.indexOf(s));
      // head along the cycle is C(j), C(j-1), C(j-2), ... : leftward.
      // reverse it to read left-to-right in space.
      const w = cyc.map((x) => head[x]).reverse();
      out.push(Uint8Array.from(w));
    }
    for (const x of path) colour[x] = 2;
  }
  return { cycles: out, permutivityFailures };
}

// ---------- independent ring evolver (arrays, no bit tricks) ----------

function ringStepArr(w) {
  const n = w.length, o = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const l = w[(i - 1 + n) % n], c = w[i], r = w[(i + 1) % n];
    o[i] = (l ^ (c | r)) & 1;
  }
  return o;
}
function eqArr(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
function temporalPeriodArr(w, cap) {
  let v = w;
  for (let t = 1; t <= cap; t++) { v = ringStepArr(v); if (eqArr(v, w)) return t; }
  return -1;
}
function minSpatialPeriod(w) {
  const n = w.length;
  for (let d = 1; d <= n; d++) {
    if (n % d !== 0) continue;
    let ok = true;
    for (let i = 0; i < n; i++) if (w[i] !== w[i % d]) { ok = false; break; }
    if (ok) return d;
  }
  return n;
}
function canon(w) {   // least rotation, as a string
  const n = w.length;
  let best = null;
  for (let r = 0; r < n; r++) {
    let s = '';
    for (let i = 0; i < n; i++) s += w[(r + i) % n];
    if (best === null || s < best) best = s;
  }
  return best;
}
function canonStr(str) { return canon(Uint8Array.from(str.split('').map(Number))); }
function revStr(str) { return str.split('').reverse().join(''); }

// ---------- method B: brute force over every ring ----------

function bruteForce(nmax, lmax) {
  // returns Map: canonical word -> {n, minTemporal}
  const found = new Map();
  for (let n = 1; n <= nmax; n++) {
    const mask = (n >= 32) ? -1 : ((1 << n) - 1);
    const total = 1 << n;
    for (let w = 0; w < total; w++) {
      let v = w, per = -1;
      for (let t = 1; t <= lmax; t++) {
        const A = (((v << 1) | (v >>> (n - 1))) & mask) >>> 0;   // bit i = c_{i-1}
        const B = v;
        const C = (((v >>> 1) | (v << (n - 1))) & mask) >>> 0;   // bit i = c_{i+1}
        v = ((A ^ (B | C)) & mask) >>> 0;
        if (v === w) { per = t; break; }
      }
      if (per < 0) continue;
      const arr = Uint8Array.from(Array.from({ length: n }, (_, i) => (w >>> i) & 1));
      if (minSpatialPeriod(arr) !== n) continue;   // count each config once, at its minimal period
      const c = canon(arr);
      const prev = found.get(c);
      if (!prev || per < prev.minTemporal) found.set(c, { n, minTemporal: per });
    }
  }
  return found;
}

// ---------- run ----------

console.log('=== METHOD A: cycles of the window map, L = 1..' + LMAX + ' ===');
console.log('measured over: ALL 2^(2L) window states, exhaustive, no sampling.');
console.log('every cycle word re-verified by L steps of an independent array ring evolver.');
console.log('');
console.log(' L   states     cycles  ring-check  perm-audit  spatial periods (count x length)');
const byL = new Map();
for (let L = 1; L <= LMAX; L++) {
  const { cycles, permutivityFailures } = cyclesA(L);
  let bad = 0;
  const hist = new Map();
  const words = [];
  for (const w of cycles) {
    let v = w;
    for (let t = 0; t < L; t++) v = ringStepArr(v);
    if (!eqArr(v, w)) { bad++; continue; }
    if (minSpatialPeriod(w) !== w.length) { bad++; continue; }  // cycle length must BE the minimal period
    hist.set(w.length, (hist.get(w.length) || 0) + 1);
    words.push(canon(w));
  }
  byL.set(L, { words, hist });
  const lens = Array.from(hist.keys()).sort((a, b) => a - b);
  console.log(
    ` ${String(L).padEnd(3)} ${String(1 << (2 * L)).padEnd(10)} ${String(cycles.length).padEnd(7)} ` +
    `${bad === 0 ? 'OK     ' : 'FAIL ' + bad} ${' '.repeat(4)}${permutivityFailures === 0 ? 'OK  ' : 'FAIL ' + permutivityFailures}` +
    `      ${lens.map((n) => `${hist.get(n)}x${n}`).join(', ')}`
  );
}

console.log('');
console.log('=== spatial period SETS per L (compare with Talus C3) ===');
for (let L = 1; L <= LMAX; L++) {
  const lens = Array.from(byL.get(L).hist.keys()).sort((a, b) => a - b);
  console.log(`L=${L}: ${lens.join(',')}`);
}

console.log('');
console.log('=== METHOD B: brute force over every ring of size n <= ' + NMAX + ' ===');
console.log('measured over: all 2^n words for each n = 1..' + NMAX + ' (' +
  (Array.from({ length: NMAX }, (_, i) => 2 ** (i + 1)).reduce((a, b) => a + b, 0)).toLocaleString() +
  ' words total), minimal temporal period <= ' + LMAX + ', kept at minimal spatial period.');
const bf = bruteForce(NMAX, LMAX);
const bfByPeriod = new Map();
for (const [c, info] of bf) {
  if (!bfByPeriod.has(info.minTemporal)) bfByPeriod.set(info.minTemporal, []);
  bfByPeriod.get(info.minTemporal).push({ c, n: info.n });
}
for (const t of Array.from(bfByPeriod.keys()).sort((a, b) => a - b)) {
  const items = bfByPeriod.get(t);
  const hist = new Map();
  for (const it of items) hist.set(it.n, (hist.get(it.n) || 0) + 1);
  console.log(`min temporal period ${String(t).padStart(2)}: ${String(items.length).padStart(3)} configs, spatial ` +
    Array.from(hist.keys()).sort((a, b) => a - b).map((n) => `${hist.get(n)}x${n}`).join(', '));
}

console.log('');
console.log('=== CROSS-CHECK A vs B (configs of spatial period <= ' + NMAX + ') ===');
let mismatch = 0;
for (let L = 1; L <= LMAX; L++) {
  const setA = new Set(byL.get(L).words.filter((w) => w.length <= NMAX));
  const setB = new Set();
  for (const [c, info] of bf) if (L % info.minTemporal === 0 && info.n <= NMAX) setB.add(c);
  const onlyA = Array.from(setA).filter((x) => !setB.has(x));
  const onlyB = Array.from(setB).filter((x) => !setA.has(x));
  if (onlyA.length || onlyB.length) {
    mismatch++;
    console.log(`L=${L}: MISMATCH  onlyA=${onlyA.join(',')}  onlyB=${onlyB.join(',')}`);
  } else {
    console.log(`L=${L}: agree, ${setA.size} configs of spatial period <= ${NMAX}`);
  }
}
console.log(mismatch === 0 ? 'A and B agree on every L.' : `${mismatch} L values disagree.`);

// ---------- Wolfram Table 6.2, as transcribed from the checkout OCR ----------
// sources/wolfram-1986-random-sequence-generation.txt lines 833-856:
//   TABLE 6.2   Period / Element
//   (1)  o          -> "0"
//        01
//   (3)  000011111001
//   4    0000001
//        0000111
//        0010011
//        0111111
const TABLE62 = [
  { period: 1, words: ['0', '01'] },
  { period: 3, words: ['000011111001'] },
  { period: 4, words: ['0000001', '0000111', '0010011', '0111111'] },
];

console.log('');
console.log('=== AGAINST WOLFRAM 1986 TABLE 6.2 (transcribed from the checkout) ===');
for (const row of TABLE62) {
  const L = row.period;
  const mine = new Set(byL.get(L).words);
  for (const w of row.words) {
    const c = canonStr(w);
    const cr = canonStr(revStr(w));
    const hit = mine.has(c), hitRev = mine.has(cr);
    // also: what is its own minimal temporal period in my data?
    const arr = Uint8Array.from(w.split('').map(Number));
    const tp = temporalPeriodArr(arr, 64);
    const arrR = Uint8Array.from(revStr(w).split('').map(Number));
    const tpR = temporalPeriodArr(arrR, 64);
    console.log(
      `  p=${L} ${w.padEnd(13)} as-written: canon=${c.padEnd(13)} in-my-L=${hit ? 'YES' : 'no '} minTemporalPeriod=${tp}` +
      ` | reversed: canon=${cr.padEnd(13)} in-my-L=${hitRev ? 'YES' : 'no '} minTemporalPeriod=${tpR}`
    );
  }
  const extra = Array.from(mine).filter((c) => {
    const all = new Set();
    for (const w of row.words) { all.add(canonStr(w)); }
    // period-1 words are also period-3 and period-4 configs
    for (const r2 of TABLE62) if (L % r2.period === 0) for (const w of r2.words) all.add(canonStr(w));
    return !all.has(c);
  });
  console.log(`  -> my L=${L} enumeration has ${mine.size} configs; not accounted for by Table 6.2 rows dividing ${L}: ${extra.length ? extra.join(', ') : '(none)'}`);
}

console.log('');
console.log('=== the temporal orbit of the period-4 row (are they "different phases"?) ===');
{
  let w = Uint8Array.from('0000001'.split('').map(Number));
  const seen = [];
  for (let t = 0; t < 5; t++) { seen.push(canon(w)); w = ringStepArr(w); }
  console.log('  orbit of 0000001 under F (canonical rotations): ' + seen.join(' -> '));
  console.log('  Table 6.2 period-4 words in canonical rotation: ' +
    TABLE62[2].words.map((x) => canonStr(x)).join(', '));
}
