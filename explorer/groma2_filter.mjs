// Groma, 2026-09-13. Crystal 66's filter on the Kamae-Zamboni cone result, plus
// a deeper factor count for the centre column.
//
// [A] p(n) of the centre column on a deeper run, so that "p(n) >= n+1 holds for
//     every n below X" can be stated with X read off a measurement rather than
//     quoted. p is non-decreasing, so p(n0) = 2^n0 gives p(n) >= n+1 for all
//     n <= 2^n0 - 1 at once.
//
// [B] the cone search of groma2_kz2.mjs, parameterised by the elementary rule,
//     on the KZ rungs. Crystal 66: if the bound survives OR -> XOR it is a fact
//     about left-permutive cones and not about rule 30. Rules 90 and 150 are the
//     two linear left-permutive rules; rule 45 is the only other rule that climbs
//     the board's occurrence ladder; rule 86 is NOT a control (it is rule 30's
//     mirror, hence right-permutive, so the left-cone class is the wrong one).

// ---------------- [A] ----------------
function centreColumn30(T) {
  const words = ((2 * T + 2) >> 5) + 2;
  const a = new Uint32Array(words);
  a[0] = 1;
  const c = new Uint8Array(T + 1);
  let top = 0;
  for (let t = 0; t <= T; t++) {
    c[t] = (a[t >>> 5] >>> (t & 31)) & 1;
    if (t === T) break;
    const nt = ((2 * (t + 1)) >>> 5) + 1;
    if (nt > top) top = Math.min(nt, words - 1);
    for (let i = top; i >= 0; i--) {
      const cur = a[i], lo = i > 0 ? a[i - 1] : 0;
      const s1 = ((cur << 1) | (lo >>> 31)) >>> 0;
      const s2 = ((cur << 2) | (lo >>> 30)) >>> 0;
      a[i] = (s2 ^ (s1 | cur)) >>> 0;
    }
  }
  return c;
}

const T = 1200000;
console.log(`[A] centre column of the seed, T = ${T}; p(n) over the whole prefix`);
const c = centreColumn30(T);
console.log(`    prefix t = 0..23: ${Array.from(c.slice(0, 24)).join('')}   (orientation guard, A051023)`);
let full = 0;
for (let n = 10; n <= 26; n++) {
  const set = new Set();
  let code = 0n;
  const mask = (1n << BigInt(n)) - 1n;
  for (let i = 0; i <= T; i++) {
    code = ((code << 1n) | BigInt(c[i])) & mask;
    if (i >= n - 1) set.add(code);
  }
  const sat = set.size === (1 << n);
  if (sat) full = n;
  console.log(`    n = ${String(n).padStart(2)}   p(n) = ${String(set.size).padStart(9)}   2^n = ${String(2 ** n).padStart(9)}   ${sat ? 'FULL' : ''}`);
}
console.log(`    largest n with p(n) = 2^n : ${full}`);
console.log(`    => p is non-decreasing, so p(n) >= n+1 for every n <= ${2 ** full - 1};`);
console.log(`       Morse-Hedlund's inequality first has a chance of failing at n = ${2 ** full}.`);

// ---------------- [B] ----------------
function makeRung(n, TARGET, maxLen) {
  const W = [];
  const rec = (pref, next) => {
    if (pref.length === n) { W.push(pref.slice()); return; }
    for (let d = next; d <= maxLen - 1; d++) { pref.push(d); rec(pref, d + 1); pref.pop(); }
  };
  if (n === 1) W.push([0]); else rec([0], 1);
  const nw = W.length;
  const bySpan = [];
  for (let s = 0; s < maxLen; s++) bySpan.push([]);
  const look = [];
  for (let q = 0; q < nw; q++) { bySpan[W[q][n - 1]].push(q); look.push(Int32Array.from(W[q].map((d) => W[q][n - 1] - d))); }
  const pc = new Uint8Array(1 << (1 << n));
  for (let i = 1; i < pc.length; i++) pc[i] = pc[i >> 1] + (i & 1);
  return { nw, bySpan, look, pc, n, TARGET };
}
function rungStep(R, hist, i, masks) {
  for (let s = 0; s <= i; s++) {
    const list = R.bySpan[s];
    for (let z = 0; z < list.length; z++) {
      const q = list[z], lk = R.look[q];
      let code = 0;
      for (let r = 0; r < R.n; r++) code = (code << 1) | hist[i - lk[r]];
      const m = masks[q] | (1 << code);
      if (R.pc[m] >= R.TARGET) return false;
      masks[q] = m;
    }
  }
  return true;
}

function ruleTable(rule) {
  const t = new Uint8Array(8);
  for (let i = 0; i < 8; i++) t[i] = (rule >> i) & 1;
  return t;
}
// two-diagonal incremental evolution, for any elementary rule
function initDiagonals(tab, a, leftBits, L) {
  const pad = L + 3, W = pad + a + 1 + pad;
  let row = new Uint8Array(W);
  for (let i = 0; i <= a; i++) row[pad + i] = leftBits[i];
  const origin = pad + a;
  const B = new Uint8Array(L + 2), C = new Uint8Array(L + 2);
  for (let t = 0; t <= L + 1; t++) {
    B[t] = origin - t >= 0 ? row[origin - t] : 0;
    C[t] = origin - t - 1 >= 0 ? row[origin - t - 1] : 0;
    const nxt = new Uint8Array(W);
    for (let i = 1; i < W - 1; i++) nxt[i] = tab[4 * row[i - 1] + 2 * row[i] + row[i + 1]];
    row = nxt;
  }
  return { B, C };
}

function coneSearch(rule, n, TARGET, a, LMAX, CAP) {
  const tab = ruleTable(rule);
  const R = makeRung(n, TARGET, LMAX + 2);
  let cur = [];
  for (let v = 0; v < (1 << a); v++) {
    const left = new Uint8Array(a + 1);
    left[0] = 1;
    for (let i = 0; i < a; i++) left[1 + i] = (v >> i) & 1;
    const { B, C } = initDiagonals(tab, a, left, LMAX + 2);
    const hist = new Uint8Array(LMAX + 3);
    hist[0] = B[0];
    const masks = new Uint32Array(R.nw);
    if (rungStep(R, hist, 0, masks)) cur.push({ B, C, hist, masks });
  }
  let best = cur.length ? 1 : 0;
  for (let K = 0; K < LMAX; K++) {
    const next = [];
    for (const s of cur) {
      for (const b of [0, 1]) {
        const Bn = new Uint8Array(s.B.length), Cn = s.B;
        Bn[0] = b;
        for (let t = 1; t < s.B.length; t++) {
          // cell(t, K+1-t) from cell(t-1, K-t)=C[t-1], cell(t-1,K+1-t)=B[t-1],
          // cell(t-1,K+2-t)=Bn[t-1]
          Bn[t] = tab[4 * s.C[t - 1] + 2 * s.B[t - 1] + Bn[t - 1]];
        }
        const hist = Uint8Array.from(s.hist);
        hist[K + 1] = Bn[K + 1];
        const masks = Uint32Array.from(s.masks);
        if (rungStep(R, hist, K + 1, masks)) next.push({ B: Bn, C: Cn, hist, masks });
      }
    }
    if (next.length === 0) return { f: best, capped: false };
    best = K + 2;
    if (next.length > CAP) return { f: best, capped: true };
    cur = next;
  }
  return { f: best, capped: true };
}

// validation: the two-diagonal evolution must reproduce the real centre column
{
  const tab = ruleTable(30);
  const a = 0;
  const left = new Uint8Array(1); left[0] = 1;
  let { B, C } = initDiagonals(tab, a, left, 40);
  const got = [B[0]];
  for (let K = 0; K < 22; K++) {
    const Bn = new Uint8Array(B.length);
    Bn[0] = 0; // all cells x >= 1 white: this is the seed
    for (let t = 1; t < B.length; t++) Bn[t] = tab[4 * C[t - 1] + 2 * B[t - 1] + Bn[t - 1]];
    C = B; B = Bn;
    got.push(B[K + 1]);
  }
  const want = '1101110011000101100100'.split('').map(Number);
  const ok = got.length >= want.length && want.every((v, i) => v === got[i]);
  console.log(`\n[validation] two-diagonal evolution reproduces the seed's centre column: ${ok ? 'YES' : '*** NO ***'}`);
  console.log(`    got  ${got.slice(0, 22).join('')}\n    want ${want.join('')}`);
}

console.log('\n[B] crystal 66 filter: the cone search on the KZ rungs, by rule.');
console.log('    f(a) = longest centre-column prefix in class A2(a) that FAILS the rung.');
console.log('    * = population cap, i.e. a lower bound; unbounded means the cone does not see it.');
const LMAX = 70, CAP = 250000;
for (const [n, TARGET] of [[2, 4], [3, 6], [4, 8]]) {
  console.log(`  --- KZ rung ${n} (some ${n}-window sees ${TARGET} patterns), unbounded span`);
  for (const rule of [30, 90, 150, 45]) {
    const row = [];
    for (let a = 1; a <= 8; a++) {
      const r = coneSearch(rule, n, TARGET, a, LMAX, CAP);
      row.push(`${a}:${r.f}${r.capped ? '*' : ''}`);
      if (r.capped) break;
    }
    console.log(`      rule ${String(rule).padStart(3)}:  f(a) = ${row.join(' ')}`);
  }
}
