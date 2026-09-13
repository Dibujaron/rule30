// Astrolabe, 2026-09-13. Algebraic-circuit vantage.
//
// Two things.
//
// (1) The Moebius transform is an invertible linear map on each side, so the ANF
//     coefficient matrix M_f (Raz's matrix) and the COMMUNICATION matrix C_f
//     (entry (y,z) = f(y,z)) satisfy M_f = U C_f V with U, V invertible, hence
//     have the same rank over F2. Checked here rather than asserted.
//     Consequence: rank_{Y,Z}(f) is a communication measure. Since rank over F2 is
//     at most rank over Q for an integer matrix, log2 of it lower-bounds the
//     deterministic communication complexity of the cone map under that split.
//
// (2) The split that matters to this project is the origin: Alice holds row 0 at
//     x < 0, Bob holds row 0 at x >= 0. Measure the rank there as t grows.

const PAT = [0xaaaaaaaa, 0xcccccccc, 0xf0f0f0f0, 0xff00ff00, 0xffff0000];

function ruleAnfBits(rule) {
  const a = [];
  for (let i = 0; i < 8; i++) a.push((rule >> i) & 1);
  for (let j = 0; j < 3; j++) for (let m = 0; m < 8; m++) if ((m >> j) & 1) a[m] ^= a[m ^ (1 << j)];
  return a;
}

// returns the packed TRUTH TABLE of the cone function (bit m = f at input m)
function coneTruth(rule, t) {
  const n = 2 * t + 1, L = 2 ** (n - 5);
  const anf = ruleAnfBits(rule);
  const terms = [];
  for (let m = 0; m < 8; m++) if (anf[m]) terms.push(m);
  let cur = [], nxt = [];
  for (let j = 0; j < n; j++) {
    const v = new Uint32Array(L);
    if (j < 5) v.fill(PAT[j] >>> 0);
    else { const sh = j - 5; for (let w = 0; w < L; w++) v[w] = ((w >>> sh) & 1) ? 0xffffffff : 0; }
    cur.push(v); nxt.push(new Uint32Array(L));
  }
  for (let s = 1; s <= t; s++) {
    for (let j = s; j <= n - 1 - s; j++) {
      const l = cur[j - 1], c = cur[j], r = cur[j + 1], o = nxt[j];
      for (let w = 0; w < L; w++) {
        const lw = l[w], cw = c[w], rw = r[w];
        let v = 0;
        for (let i = 0; i < terms.length; i++) {
          const m = terms[i];
          let p = 0xffffffff;
          if (m & 4) p &= lw;
          if (m & 2) p &= cw;
          if (m & 1) p &= rw;
          v ^= p;
        }
        o[w] = v >>> 0;
      }
    }
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return { n, tt: cur[t], L };
}

function moebius(a, n, L) {
  for (let j = 0; j < 5 && j < n; j++) {
    const low = (~PAT[j]) >>> 0, sh = 1 << j;
    for (let w = 0; w < L; w++) a[w] = (a[w] ^ (((a[w] & low) << sh) >>> 0)) >>> 0;
  }
  for (let j = 5; j < n; j++) {
    const blk = 1 << (j - 5);
    for (let base = 0; base < L; base += 2 * blk)
      for (let k = 0; k < blk; k++) a[base + blk + k] ^= a[base + k];
  }
  return a;
}

function rankBits(mat, rows, W) {
  const pivotOf = new Map();
  let rank = 0;
  const v = new Uint32Array(W);
  for (let r = 0; r < rows; r++) {
    v.set(mat.subarray(r * W, r * W + W));
    for (;;) {
      let lead = -1;
      for (let w = 0; w < W; w++) if (v[w] !== 0) { lead = (w << 5) + (31 - Math.clz32((v[w] & (-v[w] >>> 0)) >>> 0)); break; }
      if (lead < 0) break;
      const pv = pivotOf.get(lead);
      if (pv === undefined) { pivotOf.set(lead, v.slice()); rank++; break; }
      for (let w = lead >>> 5; w < W; w++) v[w] ^= pv[w];
    }
  }
  return rank;
}

// build the (2^a x 2^b) matrix from a packed table over 2^n bits, where the Y
// variables are the LOW a bit positions in yVars and Z the rest.
function matFromTable(tab, n, yVars, zVars) {
  const a = yVars.length, b = zVars.length;
  const rows = 1 << a, W = Math.max(1, Math.ceil((1 << b) / 32));
  const mat = new Uint32Array(rows * W);
  const N = 2 ** n;
  for (let m = 0; m < N; m++) {
    if (!((tab[m >>> 5] >>> (m & 31)) & 1)) continue;
    let ys = 0, zs = 0;
    for (let i = 0; i < a; i++) if ((m >>> yVars[i]) & 1) ys |= 1 << i;
    for (let i = 0; i < b; i++) if ((m >>> zVars[i]) & 1) zs |= 1 << i;
    mat[ys * W + (zs >>> 5)] ^= (1 << (zs & 31));
  }
  return { mat, rows, W };
}

console.log('=== (1) rank of the ANF matrix equals rank of the communication matrix ===');
console.log('  rule   t    partition        rank(M_f)  rank(C_f)');
for (const rule of [30, 45, 90, 110]) {
  for (const t of [3, 4, 5, 6, 7]) {
    const { n, tt, L } = coneTruth(rule, t);
    const comm = tt.slice();
    const anf = moebius(tt, n, L);
    const a = Math.ceil(n / 2);
    const yVars = [], zVars = [];
    for (let j = 0; j < n; j++) (j < a ? yVars : zVars).push(j);
    const A = matFromTable(anf, n, yVars, zVars);
    const C = matFromTable(comm, n, yVars, zVars);
    const ra = rankBits(A.mat, A.rows, A.W), rc = rankBits(C.mat, C.rows, C.W);
    console.log(`  ${String(rule).padStart(4)}  ${String(t).padStart(2)}   left|right (${a}|${n - a})` +
      `      ${String(ra).padStart(6)}     ${String(rc).padStart(6)}   ${ra === rc ? 'equal' : 'DIFFER'}`);
  }
}

console.log('');
console.log('=== (2) the origin split: Alice holds row 0 at x < 0, Bob at x >= 0 ===');
console.log('full rank = 2^min(t, t+1) = 2^t.  D = deterministic communication complexity of the cone map.');
console.log('  t    n   |A|=t |B|=t+1   full    rank   log2(rank)   log2/t   rank/2^(t/2)   rule90  rule150');
for (let t = 3; t <= 11; t++) {
  const res = {};
  for (const rule of [30, 90, 150]) {
    const { n, tt, L } = coneTruth(rule, t);
    const anf = moebius(tt, n, L);
    const yVars = [], zVars = [];
    for (let j = 0; j < n; j++) (j < t ? yVars : zVars).push(j); // j < t  <=>  x = j-t < 0
    const M = matFromTable(anf, n, yVars, zVars);
    res[rule] = rankBits(M.mat, M.rows, M.W);
  }
  const full = 2 ** t;
  const r = res[30];
  console.log(`  ${String(t).padStart(2)}  ${String(2 * t + 1).padStart(3)}     ${String(t).padStart(2)}   ${String(t + 1).padStart(3)}` +
    `   ${String(full).padStart(5)}  ${String(r).padStart(6)}   ${Math.log2(r).toFixed(3).padStart(8)}` +
    `  ${(Math.log2(r) / t).toFixed(3)}      ${(r / 2 ** (t / 2)).toFixed(3)}` +
    `        ${String(res[90]).padStart(4)}    ${String(res[150]).padStart(4)}`);
}
