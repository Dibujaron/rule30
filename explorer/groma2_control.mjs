// Groma, 2026-09-13. Three controls for the bispecial/Cassaigne vantage.
//
// [A] The coupon-collector null for the centre column's factor counts. A distinct
//     factor count on a finite window is a LOWER bound; the right comparison is
//     not 2^n but the expected number of distinct values a uniform sample of the
//     same size would show. Without this a "p(n) < 2^n" reads as structure.
//
// [B] The minimal eventual period of left diagonal k, for rule 30 and for the
//     two linear rules, with the centre column of each beside it. This is the
//     brief's control: `leftDiagonal_period_unbounded` is proved for rule 30 and
//     is offered as structure that might feed a complexity lower bound.
//
// [C] Crystal 66's filter applied to that offer: OR -> XOR.

const T30 = 200000;
const TGEN = 20000;

// ---------- rule 30 packed engine (bit b of row t is cell x = b - t) ----------
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

function distinctFactors(seq, from, to, n) {
  const set = new Set();
  let code = 0n;
  const mask = (1n << BigInt(n)) - 1n;
  for (let i = from; i < to; i++) {
    code = ((code << 1n) | BigInt(seq[i])) & mask;
    if (i - from >= n - 1) set.add(code);
  }
  return set.size;
}

console.log('[A] centre column factor counts against the coupon-collector null');
console.log('    (rows 100000..200000; M samples of a uniform word of length n)');
const c30 = centreColumn30(T30);
const from = T30 >> 1, to = T30;
console.log('  n   p(n)        null E[distinct]   ratio');
for (let n = 10; n <= 26; n++) {
  const M = to - from - n + 1;
  const N = Math.pow(2, n);
  const expected = N * (1 - Math.exp(-M / N));
  const p = distinctFactors(c30, from, to, n);
  console.log(`  ${String(n).padStart(2)}  ${String(p).padStart(9)}  ${expected.toFixed(1).padStart(16)}   ${(p / expected).toFixed(4)}`);
}

// ---------- generic elementary CA from a single black cell ----------
function diagPeriods(rule, T, KMAX) {
  const W = 2 * T + 3;
  const off = T + 1; // cell x is index x + off
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  cur[off] = 1;
  const table = [];
  for (let i = 0; i < 8; i++) table.push((rule >> i) & 1);
  const diag = [];
  for (let k = 0; k <= KMAX; k++) diag.push(new Uint8Array(T + 1));
  const centre = new Uint8Array(T + 1);
  for (let t = 0; t <= T; t++) {
    centre[t] = cur[off];
    for (let k = 0; k <= KMAX; k++) if (t >= k) diag[k][t - k] = cur[off + k - t];
    if (t === T) break;
    const lo = off - t - 1, hi = off + t + 1;
    for (let i = lo; i <= hi; i++) {
      const l = cur[i - 1] | 0, ce = cur[i] | 0, r = cur[i + 1] | 0;
      nxt[i] = table[4 * l + 2 * ce + r];
    }
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  // minimal eventual period of each diagonal, tested on the last quarter
  const res = [];
  const a0 = Math.floor((T - KMAX) * 0.6), a1 = T - KMAX - 1;
  for (let k = 0; k <= KMAX; k++) {
    const d = diag[k];
    let per = -1;
    for (let p = 1; p <= 4096; p++) {
      let ok = true;
      for (let j = a0; j + p <= a1; j++) if (d[j] !== d[j + p]) { ok = false; break; }
      if (ok) { per = p; break; }
    }
    res.push(per);
  }
  return { periods: res, centre };
}

function tailConstant(centre, T) {
  const a = Math.floor(T * 0.6);
  const v = centre[a];
  for (let t = a; t <= T; t++) if (centre[t] !== v) return null;
  return v;
}

console.log('\n[B]/[C] minimal eventual period of left diagonal k (period tested to 4096)');
const KM = 40;
for (const rule of [30, 90, 150, 86]) {
  const { periods, centre } = diagPeriods(rule, TGEN, KM);
  const tc = tailConstant(centre, TGEN);
  const pc = distinctFactors(centre, Math.floor(TGEN * 0.6), TGEN, 8);
  console.log(`\n  rule ${rule}:  centre column tail ${tc === null ? 'not constant' : 'CONSTANT ' + tc}, p(8) on the tail = ${pc}`);
  console.log(`    k:period  ${periods.map((p, k) => `${k}:${p}`).join(' ')}`);
  const mx = Math.max(...periods.filter((p) => p > 0));
  console.log(`    largest diagonal period below k=${KM}: ${mx}`);
}
