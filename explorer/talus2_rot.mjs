// Talus, 2026-09-08. (b) Rotation closure at p = 9, 10 with the corrected
// classifier, and the exact shape of the gap at a black start.
//
// The proved half: if b(0) = false then row 1 of X_b is white at every x >= 1
// (its cell at x = 1 is b(0)), and its centre column is sigma b, so by crystal
// 40's uniqueness that row IS X_{sigma b}; goodness carries over. When
// b(0) = true the same row has a BLACK cell at x = 1, so it is a different
// configuration Y from X_{sigma b}: same centre column, different right half.
// This measures how far apart Y and X_{sigma b} actually are.

const T = 30000;

function col1(b, T) {
  const p = b.length;
  const words = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(words), s = new Uint32Array(words);
  const out = new Uint8Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    out[t] = (r[0] >>> 1) & 1;
    const last = Math.min(words - 2, (t >> 5) + 1);
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
  return out;
}

function classify(b, T) {
  const p = b.length;
  const c1 = col1(b, T);
  const v = [];
  for (let t = 0; t < T; t++) if (b[t % p] === 0) v.push(c1[t]);
  if (v.length === 0) return 'GOOD';
  const M = Math.max(64, v.length >> 2);
  const start = v.length - M;
  const count = (n) => {
    const st = new Set();
    for (let i = start; i + n <= v.length; i++) { let h = ''; for (let j = 0; j < n; j++) h += v[i + j]; st.add(h); }
    return st.size;
  };
  const f32 = count(32), f128 = count(128);
  if (f32 === f128 && f32 <= M / 4) {
    for (let cand = 1; cand <= f32; cand++) {
      let ok = true;
      for (let i = start; i + cand < v.length; i++) if (v[i + cand] !== v[i]) { ok = false; break; }
      if (ok) return 'GOOD';
    }
    return 'UNDECIDED';
  }
  if (f32 >= 200) return 'BAD';
  return 'UNDECIDED';
}

function bits(n, p) { const a = []; for (let i = 0; i < p; i++) a.push((n >> i) & 1); return a; }

console.log(`=== rotation closure at p = 9, 10, classifier at T = ${T} ===`);
for (const p of [9, 10]) {
  const m = new Map();
  let g = 0, bd = 0, u = 0;
  for (let n = 0; n < (1 << p); n++) {
    const b = bits(n, p);
    const r = classify(b, T);
    m.set(b.join(''), r);
    if (r === 'GOOD') g++; else if (r === 'BAD') bd++; else u++;
  }
  const seen = new Set();
  let split = 0, classes = 0;
  const splitList = [];
  for (let n = 0; n < (1 << p); n++) {
    const b = bits(n, p);
    if (seen.has(b.join(''))) continue;
    const cls = [];
    let cur = b;
    for (let i = 0; i < p; i++) { cls.push(cur.join('')); seen.add(cur.join('')); cur = cur.slice(1).concat(cur.slice(0, 1)); }
    classes++;
    const vs = cls.map((w) => m.get(w));
    if (vs.includes('GOOD') && vs.includes('BAD')) { split++; splitList.push(cls.map((w) => `${w}:${m.get(w)}`).join(' ')); }
  }
  console.log(`p=${p}: GOOD ${g}, BAD ${bd}, UNDECIDED ${u}; classes ${classes}, classes with a GOOD and a BAD member: ${split}`);
  for (const l of splitList.slice(0, 10)) console.log('   ' + l);
}

// ---------------------------------------------------------------- the gap
console.log('');
console.log('=== the black-start gap: Y = row 1 of X_b versus X_{sigma b} ===');
console.log('Both have centre column sigma b; Y has a black cell at x = 1 at time 0 and');
console.log('X_{sigma b} does not. Where do their pictures differ?');
console.log('');

function pictureCols(b, K, T) {
  // columns 0, -1, ..., -(K-1) of X_b, and column 1
  const c0 = new Uint8Array(T);
  for (let t = 0; t < T; t++) c0[t] = b[t % b.length];
  const c1 = col1(b, T);
  const cols = [c0];
  const cm = new Uint8Array(T);
  for (let t = 0; t + 1 < T; t++) cm[t] = c0[t + 1] ^ (c0[t] | c1[t]);
  cols.push(cm);
  for (let k = 2; k < K; k++) {
    const nx = new Uint8Array(T);
    for (let t = 0; t + 1 < T - k; t++) nx[t] = cols[k - 1][t + 1] ^ (cols[k - 1][t] | cols[k - 2][t]);
    cols.push(nx);
  }
  return { cols, c1 };
}

console.log('b (good, starts black)  first row where col -1 of X_{sigma b} differs from col -1 of X_b shifted');
console.log('                        and: is sigma b good?');
for (const s of ['1000', '1100', '1110', '10000000', '11111110', '1110011000', '11111011110', '10110100001']) {
  const b = s.split('').map(Number);
  if (b[0] !== 1) { console.log(`${s}: starts white, covered by the proved link`); continue; }
  const sb = b.slice(1).concat(b.slice(0, 1));
  const TT = 4000, K = 40;
  const A = pictureCols(b, K, TT);      // X_b
  const B = pictureCols(sb, K, TT);     // X_{sigma b}
  // col -1 of X_b read from row 1 vs col -1 of X_{sigma b} read from row 0
  let first = -1;
  for (let t = 0; t + 1 < TT - K; t++) if (A.cols[1][t + 1] !== B.cols[1][t]) { first = t; break; }
  let diffs = 0, tested = 0;
  for (let t = 0; t + 1 < 2000; t++) { tested++; if (A.cols[1][t + 1] !== B.cols[1][t]) diffs++; }
  console.log(`${s.padEnd(23)} first differing row ${String(first).padEnd(8)} disagreement rate over 2000 rows: ${(diffs / tested).toFixed(3)}   sigma b = ${sb.join('')}: ${classify(sb, T)}`);
}
