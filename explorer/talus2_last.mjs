// Talus, 2026-09-08. The last rotation class still reported split at
// T = 400000: 1001101000 came out GOOD with onset 15,190 and its rotation
// 1010001001 came out BAD. Since a sibling class in the same run had a member
// whose onset was 280,976 rows (70% of that depth), a BAD verdict there is not
// yet a claim. This runs the pair, and two more members of the class, to 10^6.

const T = 1000000;

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

console.log(`=== the class of 1001101000 at T = ${T} ===`);
for (const w of ['1001101000', '1010001001', '0100010011', '0011010001']) {
  console.log(`  ${w}  ${analyse(w, T)}`);
}
