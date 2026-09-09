// Talus, 2026-09-08. The rotation class of 1001101000 is the one candidate
// counterexample to rotation closure that survived T = 10^6: three members are
// good with the white-time restriction eventually CONSTANT (q = 1, onsets 0 to
// 15,190) and 1010001001 is bad with 525 distinct factors of length 32 in the
// last quarter of a 10^6-row run.
//
// Both breaks in the class sit at a black first cell, so the proved link
// (b(0) white => row 1 of X_b IS X_{sigma b}) does not span them: this is
// exactly the unexplained gap, and if it holds up it settles sub-question (b)
// in the negative.
//
// All ten members at 10^6, and the odd one out at 2.5 x 10^6.

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

function analyse(s, T) {
  const b = s.split('').map(Number);
  const p = b.length;
  const c1 = col1(b, T);
  const v = [];
  for (let t = 0; t < T; t++) if (b[t % p] === 0) v.push(c1[t]);
  const M = Math.max(64, v.length >> 2);
  const start = v.length - M;
  const count = (n) => {
    const st = new Set();
    for (let i = start; i + n <= v.length; i++) { let h = ''; for (let j = 0; j < n; j++) h += v[i + j]; st.add(h); }
    return st.size;
  };
  const f32 = count(32), f128 = count(128);
  let q = 0;
  for (let cand = 1; cand <= Math.min(3000, M >> 2) && !q; cand++) {
    let ok = true;
    for (let i = start; i + cand < v.length; i++) if (v[i + cand] !== v[i]) { ok = false; break; }
    if (ok) q = cand;
  }
  if (!q) return `BAD   factors 32/128 = ${f32}/${f128}`;
  let onsetV = 0;
  for (let i = start - 1; i >= 0; i--) if (v[i + q] !== v[i]) { onsetV = i + 1; break; }
  const whites = b.filter((x) => x === 0).length;
  return `GOOD  q=${q} onset(time)=${Math.round((onsetV * p) / whites)}  factors 32/128 = ${f32}/${f128}`;
}

const cls = ['1001101000', '0011010001', '0110100010', '1101000100', '1010001001',
             '0100010011', '1000100110', '0001001101', '0010011010', '0100110100'];
console.log('=== every member of the class of 1001101000, at T = 10^6 ===');
console.log('(cyclic order under sigma; a * marks a black first cell, where the proved link does not apply)');
for (const w of cls) {
  console.log(`  ${w}${w[0] === '1' ? ' *' : '  '}  ${analyse(w, 1000000)}`);
}
console.log('');
console.log('=== the odd one out, at T = 2.5 x 10^6 ===');
console.log(`  1010001001  ${analyse('1010001001', 2500000)}`);
