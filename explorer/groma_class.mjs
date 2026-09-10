// Groma, 2026-09-10.  Four tests that decide whether the switch-index reading
// lands the residual in any structure class of combinatorics on words.
//
// A. THE GAP AUTOMATON.  Is g(t) = min{x >= 1 : cell(t,x)=1} determined by
//    (centre colour at t, g(t)) alone?  Predicted rule:
//       c=0, g>=2 -> g-1      (the leftmost black walks left at speed 1)
//       c=0, g=1  -> 1        (white_run_monotone)
//       c=1, g>=3 -> 1        (a black centre plants a black at x=1)
//       c=1, g=2  -> 2
//       c=1, g=1  -> ESCAPE   (unpredicted; the one state that can raise g)
//    If the prediction holds everywhere but the escape state, the whole
//    aperiodic content of column 1 sits in the escape events.
//
// B. THE COARSE-GRAINING LAW.  Is p_j(n) about p_white(n * Lbar), where Lbar
//    is the mean white-run length?  If so, reading integers instead of bits
//    rescales the Morse-Hedlund measurement by a constant and changes nothing.
//
// C. WHERE LINEARITY BREAKS.  For b = 1 0^8 the white-time column looks like
//    p(n) = 6n + c up to n = 30.  Measured further, where does the second
//    difference turn positive, and does 1/(defect density) predict it?
//
// D. NIVAT.  P(2,n) of the space-time picture, counted at all positions, as
//    the hypothesis of Nivat's conjecture would require.

const T = Number(process.env.GROMA_T ?? 1000000);

function halflineTrace(b, T, wantGap) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W), s = new Uint32Array(W);
  const col0 = new Uint8Array(T), col1 = new Uint8Array(T);
  const gap = wantGap ? new Int32Array(T) : null;
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    col0[t] = r[0] & 1;
    col1[t] = (r[0] >>> 1) & 1;
    if (wantGap) {
      let g = -1;
      const wl = Math.min(W - 1, (t >> 5) + 1);
      for (let i = 0; i <= wl; i++) {
        const v = i === 0 ? (r[0] & ~1) : r[i];
        if (v !== 0) { g = (i << 5) + (31 - Math.clz32(v & -v)); break; }
      }
      gap[t] = g;
    }
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
  return { col0, col1, gap };
}

function seedTrace(T, wantGap) {
  const W = ((2 * T + 96) >> 5) + 3;
  let r = new Uint32Array(W), s = new Uint32Array(W);
  const col0 = new Uint8Array(T), col1 = new Uint8Array(T);
  const gap = wantGap ? new Int32Array(T) : null;
  r[0] = 1;
  for (let t = 0; t < T; t++) {
    col0[t] = (r[t >> 5] >>> (t & 31)) & 1;
    col1[t] = (r[(t + 1) >> 5] >>> ((t + 1) & 31)) & 1;
    if (wantGap) {
      let g = -1;
      const b1 = t + 1, i0 = b1 >> 5, mask = (0xffffffff << (b1 & 31)) >>> 0;
      const wl = Math.min(W - 1, ((2 * t) >> 5) + 1);
      for (let i = i0; i <= wl; i++) {
        const v = ((i === i0 ? r[i] & mask : r[i]) >>> 0);
        if (v !== 0) { g = (i << 5) + (31 - Math.clz32(v & -v)) - t; break; }
      }
      gap[t] = g;
    }
    const last = Math.min(W - 2, ((2 * t) >> 5) + 2);
    for (let i = last; i >= 0; i--) {
      const cur = r[i], prev = i > 0 ? r[i - 1] : 0;
      const l2 = ((cur << 2) | (prev >>> 30)) >>> 0;
      const l1 = ((cur << 1) | (prev >>> 31)) >>> 0;
      s[i] = (l2 ^ (l1 | cur)) >>> 0;
    }
    const tmp = r; r = s; s = tmp;
  }
  return { col0, col1, gap };
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

// ============================================== A. the gap automaton
console.log('--- A. is the gap g(t) a finite-state function of (centre colour, g)?');
console.log('name                  rows      escapes    escape%   nonEscapeMispredict  maxEscapeValue  gmax');
for (const spec of [['X_10', '10'], ['X_01011', '01011'], ['X_1 0^8', '100000000'], ['seed', null]]) {
  const [name, str] = spec;
  const tr = str
    ? halflineTrace([...str].map((c) => (c === '1' ? 1 : 0)), 200000, true)
    : seedTrace(200000, true);
  const { col0, gap } = tr;
  let esc = 0, mis = 0, maxEsc = 0, gmax = 0;
  const escVals = new Map();
  for (let t = 0; t + 1 < 200000; t++) {
    const g = gap[t], gn = gap[t + 1], c = col0[t];
    if (g < 0 || gn < 0) continue;
    if (g > gmax) gmax = g;
    if (c === 1 && g === 1) {
      esc++; if (gn > maxEsc) maxEsc = gn;
      escVals.set(gn, (escVals.get(gn) ?? 0) + 1);
      continue;
    }
    let pred;
    if (c === 0) pred = g >= 2 ? g - 1 : 1;
    else pred = g >= 3 ? 1 : 2;
    if (pred !== gn) mis++;
  }
  console.log(
    `${name.padEnd(20)}  ${String(200000).padEnd(9)} ${String(esc).padEnd(10)} ` +
    `${((100 * esc) / 200000).toFixed(2).padEnd(9)} ${String(mis).padEnd(20)} ${String(maxEsc).padEnd(15)} ${gmax}`
  );
  const sv = [...escVals.entries()].sort((a, b) => a[0] - b[0]).slice(0, 12);
  console.log(`${''.padEnd(22)}escape values: ${sv.map(([k, v]) => `${k}:${v}`).join(' ')}`);
}

// ================================== B. the coarse-graining law + C. linearity
console.log('');
console.log('--- B/C. p_j(n) against p_white(n * Lbar), and where linearity breaks');
for (const str of ['10', '01011', '10010', '100000000', '1010001001']) {
  const b = [...str].map((c) => (c === '1' ? 1 : 0));
  const { col0, col1 } = halflineTrace(b, T, false);
  const { j, white, lens } = derive(col0, col1, T);
  const Lbar = lens.reduce((a, c) => a + c, 0) / lens.length;
  const jf = j.length >> 1, wf = white.length >> 1;
  const rows = [];
  for (const n of [8, 16, 24, 32, 48, 64]) {
    const pj = complexityAt(j, jf, j.length, n);
    const m = Math.round(n * Lbar);
    const pw = complexityAt(white, wf, white.length, m);
    rows.push(`n=${n}: p_j=${pj} vs p_w(${m})=${pw} ratio ${(pj / pw).toFixed(2)}`);
  }
  console.log(`b=${str}  Lbar=${Lbar.toFixed(3)}`);
  console.log('   ' + rows.join('  |  '));
  // second difference of p_white
  const pw = [];
  for (let n = 1; n <= 96; n++) pw.push(complexityAt(white, wf, white.length, n));
  const d1 = pw.slice(1).map((v, i) => v - pw[i]);
  console.log(`   p_white first differences n=1..96: ${d1.slice(0, 60).join(',')}`);
}

// ================================================================ D. Nivat
console.log('');
console.log('--- D. P(2,n) of the seed picture, patterns counted at all positions');
{
  const TT = 3000;
  const { } = {};
  // rebuild the picture as a bit matrix (rows of width 2*TT+1) for pattern counting
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
  for (const n of [1, 2, 3, 4, 6, 8, 10, 12]) {
    const set = new Set();
    for (let t = 0; t + n <= TT; t++) {
      for (let x = -t; x <= t - 1; x++) {
        let key = '';
        for (let k = 0; k < n; k++) key += String.fromCharCode(48 + bit(t + k, x) * 2 + bit(t + k, x + 1));
        set.add(key);
      }
    }
    console.log(`  P(2,${n}) = ${set.size}   (Nivat hypothesis needs <= ${2 * n})`);
    if (set.size > 4 * n && n >= 4) break;
  }
}
