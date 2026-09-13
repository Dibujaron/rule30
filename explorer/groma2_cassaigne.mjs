// Groma, 2026-09-13. The Cassaigne special-factor calculus, run on the object.
//
// [A] For the centre column: p(n), s(n) = p(n+1) - p(n), the bispecial factors of
//     each length and their bilateral multiplicities
//         m(w) = #{(a,b) : awb in L} - #{a : aw in L} - #{b : wb in L} + 1,
//     and the check s(n+1) - s(n) = sum of m(w) over bispecial w of length n.
//     Restricted to n <= 10, where the length-(n+2) factor set is COMPLETE on the
//     sample (coupon-collector expectation 4096.0 of 4096 at length 12), so the
//     extension sets are exact rather than sample-limited.
//
// [B] The Kamae-Zamboni rung, priced against the board's occurrence ladder, over
//     all 256 elementary rules. KZ rung n is "some window of n positions sees at
//     least 2n patterns"; occurrence rung n is "the contiguous window of n
//     positions sees all 2^n". Both are read from the same centre columns.

// ---------- rule 30 packed engine ----------
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

const T = 200000;
const c = centreColumn30(T);
const FROM = T >> 1, TO = T;

function factorSet(n) {
  const set = new Set();
  let code = 0, mask = (1 << n) - 1;
  for (let i = FROM; i < TO; i++) {
    code = ((code << 1) | c[i]) & mask;
    if (i - FROM >= n - 1) set.add(code);
  }
  return set;
}

console.log('[A] the Cassaigne calculus on the centre column (rows 100000..200000)');
console.log('  n   p(n)   s(n)   #factors  #bispecial  #neutral  #strong  #weak   sum m   s(n+1)-s(n)');
const P = [];
for (let n = 1; n <= 13; n++) P[n] = factorSet(n).size;
for (let n = 1; n <= 10; n++) {
  const Ln = factorSet(n), Ln1 = factorSet(n + 1), Ln2 = factorSet(n + 2);
  let bisp = 0, neutral = 0, strong = 0, weak = 0, summ = 0;
  for (const w of Ln) {
    let L = 0, R = 0, B = 0;
    for (const a of [0, 1]) if (Ln1.has((a << n) | w)) L++;
    for (const b of [0, 1]) if (Ln1.has((w << 1) | b)) R++;
    for (const a of [0, 1]) for (const b of [0, 1]) if (Ln2.has((a << (n + 1)) | (w << 1) | b)) B++;
    if (L > 1 && R > 1) {
      bisp++;
      const m = B - L - R + 1;
      summ += m;
      if (m === 0) neutral++; else if (m > 0) strong++; else weak++;
    }
  }
  const s = P[n + 1] - P[n], s1 = P[n + 2] - P[n + 1];
  console.log(`  ${String(n).padStart(2)}  ${String(P[n]).padStart(5)}  ${String(s).padStart(5)}  ${String(Ln.size).padStart(8)}  ${String(bisp).padStart(10)}  ${String(neutral).padStart(8)}  ${String(strong).padStart(7)}  ${String(weak).padStart(5)}  ${String(summ).padStart(6)}  ${String(s1 - s).padStart(11)}`);
}

console.log('\n[A2] Kamae-Zamboni threshold, cleared by the contiguous window alone');
console.log('  n    p(n)    2n   margin p(n)-2n');
for (let n = 1; n <= 13; n++) console.log(`  ${String(n).padStart(2)}  ${String(P[n]).padStart(6)}  ${String(2 * n).padStart(4)}  ${String(P[n] - 2 * n).padStart(14)}`);

// ---------- [B] 256-rule control ----------
const TG = 2000;
function centreGeneric(rule, Tn) {
  const W = 2 * Tn + 3, off = Tn + 1;
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  cur[off] = 1;
  const tab = [];
  for (let i = 0; i < 8; i++) tab.push((rule >> i) & 1);
  const col = new Uint8Array(Tn + 1);
  for (let t = 0; t <= Tn; t++) {
    col[t] = cur[off];
    if (t === Tn) break;
    for (let i = off - t - 1; i <= off + t + 1; i++) nxt[i] = tab[4 * (cur[i - 1] | 0) + 2 * (cur[i] | 0) + (cur[i + 1] | 0)];
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return col;
}

// all windows {0 = d_1 < d_2 < ... < d_n} inside {0..D}
function windows(n, D) {
  const out = [];
  const rec = (pref, next) => {
    if (pref.length === n) { out.push(pref.slice()); return; }
    for (let d = next; d <= D; d++) { pref.push(d); rec(pref, d + 1); pref.pop(); }
  };
  rec([0], 1);
  return out;
}

function patterns(col, win, a, b) {
  const set = new Set();
  const span = win[win.length - 1];
  for (let m = a; m + span <= b; m++) {
    let code = 0;
    for (const d of win) code = (code << 1) | col[m + d];
    set.add(code);
  }
  return set.size;
}

const D = 10;
const WIN = { 2: windows(2, D), 3: windows(3, D), 4: windows(4, D) };
const kzPass = { 2: [], 3: [], 4: [] };
const occPass = { 2: [], 3: [], 4: [] };
for (let rule = 0; rule < 256; rule++) {
  const col = centreGeneric(rule, TG);
  const a = Math.floor(TG * 0.6), b = TG;
  for (const n of [2, 3, 4]) {
    let best = 0;
    for (const w of WIN[n]) { const k = patterns(col, w, a, b); if (k > best) best = k; }
    if (best >= 2 * n) kzPass[n].push(rule);
    const contig = [];
    for (let i = 0; i < n; i++) contig.push(i);
    if (patterns(col, contig, a, b) === (1 << n)) occPass[n].push(rule);
  }
}
console.log(`\n[B] over all 256 elementary rules from one black cell, tail rows ${Math.floor(TG * 0.6)}..${TG}`);
for (const n of [2, 3, 4]) {
  console.log(`  n=${n}:  KZ rung (some window of ${n} positions in {0..${D}} sees >= ${2 * n} patterns): ${kzPass[n].length}/256`);
  console.log(`        occurrence rung (contiguous window sees all ${1 << n}):            ${occPass[n].length}/256`);
  const only = kzPass[n].filter((r) => !occPass[n].includes(r));
  console.log(`        rules passing KZ but not occurrence: ${only.length}`);
}
console.log(`  rule 30 in KZ rung 4? ${kzPass[4].includes(30)};  in occurrence rung 4? ${occPass[4].includes(30)}`);
