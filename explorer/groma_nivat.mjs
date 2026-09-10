// Groma, 2026-09-10.  Two leftovers from groma_class.mjs, which ran out of
// heap in its fourth loop.
//
// D. NIVAT.  P(2,n) of the seed's space-time picture, counted at all positions
//    the way Nivat's conjecture requires.  The conjecture's hypothesis is
//    P(m,n) <= mn for some m,n; if it were ever satisfied here the picture
//    would be forced periodic, contradicting the cone.  Is it ever satisfied?
//
// B'. The two coarse-graining rows the failed script never printed:
//    p_j(n) against p_w(n * Lbar) for b = 1 0^8 and b = 1010001001.

// -------------------------------------------------------------- D. Nivat
{
  const TT = 1200;
  const W = ((2 * TT + 96) >> 5) + 3;
  let r = new Uint32Array(W), s = new Uint32Array(W);
  r[0] = 1;
  const pic = [];
  for (let t = 0; t < TT; t++) {
    pic.push(r.slice());
    const last = Math.min(W - 2, ((2 * t) >> 5) + 2);
    for (let i = last; i >= 0; i--) {
      const cur = r[i], prev = i > 0 ? r[i - 1] : 0;
      const l2 = ((cur << 2) | (prev >>> 30)) >>> 0;
      const l1 = ((cur << 1) | (prev >>> 31)) >>> 0;
      s[i] = (l2 ^ (l1 | cur)) >>> 0;
    }
    const tmp = r; r = s; s = tmp;
  }
  const bit = (t, x) => { const b = x + t; return b < 0 || b > 2 * t ? 0 : (pic[t][b >> 5] >>> (b & 31)) & 1; };
  console.log('--- D. P(2,n) of the seed picture, patterns at all positions inside the cone');
  console.log(`    (rows 0..${TT}, every position -t <= x <= t-1)`);
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const set = new Set();
    for (let t = 0; t + n <= TT; t++) {
      for (let x = -t; x <= t - 1; x++) {
        let key = '';
        for (let k = 0; k < n; k++) key += String.fromCharCode(48 + bit(t + k, x) * 2 + bit(t + k, x + 1));
        set.add(key);
      }
    }
    const max = 4 ** n;
    console.log(`  P(2,${n}) = ${set.size}   Nivat needs <= ${2 * n}   (maximum possible ${max})`);
  }
}

// -------------------------------------------------- B'. coarse-graining rows
function halflineTrace(b, T) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W), s = new Uint32Array(W);
  const col0 = new Uint8Array(T), col1 = new Uint8Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    col0[t] = r[0] & 1;
    col1[t] = (r[0] >>> 1) & 1;
    const last = Math.min(W - 2, (t >> 5) + 1);
    for (let i = 0; i <= last; i++) {
      const cur = r[i];
      const up = (cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0);
      const down = (cur >>> 1) | (r[i + 1] << 31);
      s[i] = up ^ (cur | down);
    }
    s[last + 1] = 0;
    s[0] = (s[0] & ~1) | (b[(t + 1) % p] & 1);
    const tmp = r; r = s; s = tmp;
  }
  return { col0, col1 };
}

function derive(col0, col1, T) {
  const j = [], white = [], lens = [];
  let t = 0;
  while (t < T) {
    if (col0[t] !== 0) { t++; continue; }
    const s0 = t;
    while (t < T && col0[t] === 0) { white.push(col1[t]); t++; }
    if (t >= T) break;
    const L = t - s0;
    lens.push(L);
    let v = L;
    for (let m = 0; m < L; m++) if (col1[s0 + m] === 1) { v = m; break; }
    j.push(v);
  }
  return { j, white, lens };
}

function complexityAt(seq, from, to, n) {
  const set = new Set();
  for (let i = from; i + n <= to; i++) {
    let key = '';
    for (let k = 0; k < n; k++) key += String.fromCharCode(48 + seq[i + k]);
    set.add(key);
  }
  return set.size;
}

console.log('');
console.log("--- B'. p_j(n) against p_w(n * Lbar) / Lbar, T = 400000 rows");
for (const str of ['100000000', '1010001001', '10']) {
  const b = [...str].map((c) => (c === '1' ? 1 : 0));
  const { col0, col1 } = halflineTrace(b, 400000);
  const { j, white, lens } = derive(col0, col1, 400000);
  const Lbar = lens.reduce((a, c) => a + c, 0) / lens.length;
  const jf = j.length >> 1, wf = white.length >> 1;
  const rows = [];
  for (const n of [2, 4, 6, 8, 12, 16]) {
    const pj = complexityAt(j, jf, j.length, n);
    const m = Math.round(n * Lbar);
    const pw = complexityAt(white, wf, white.length, m);
    rows.push(`n=${n}: p_j=${pj} p_w(${m})=${pw} p_j*Lbar/p_w=${((pj * Lbar) / pw).toFixed(2)}`);
  }
  console.log(`b=${str}  Lbar=${Lbar.toFixed(3)}  (${j.length} letters, ${white.length} white times)`);
  console.log('   ' + rows.join('\n   '));
}
