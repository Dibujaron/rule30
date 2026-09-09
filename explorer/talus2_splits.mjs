// Talus, 2026-09-08. Settle the 11 rotation classes at p = 10 that the
// T = 30000 classifier reported split.
//
// Reason to distrust that report: for the class of 1010000111 the verdicts
// INVERTED between T = 3000 and T = 30000 -- at T = 3000 that word was the
// only GOOD member and the other nine BAD; at T = 30000 it is the only BAD
// member and the other nine GOOD. A split that changes which member is the
// odd one out when the depth changes is a property of the depth, not of the
// automaton.

const T = 400000;

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
  if (v.length === 0) return { verdict: 'GOOD', q: 0, onsetT: 0, f: '1/1' };
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
  if (!q) return { verdict: 'BAD', q: 0, onsetT: -1, f: `${f32}/${f128}` };
  let onsetV = 0;
  for (let i = start - 1; i >= 0; i--) if (v[i + q] !== v[i]) { onsetV = i + 1; break; }
  const whites = b.filter((x) => x === 0).length;
  return { verdict: 'GOOD', q, onsetT: Math.round((onsetV * p) / whites), f: `${f32}/${f128}` };
}

const classes = [
  ['1100010000', '1000100001', '0001000011', '0010000110', '0100001100', '1000011000', '0000110001', '0001100010', '0011000100', '0110001000'],
  ['1111010000', '1010000111'],
  ['1010110000', '0101100001', '1011000010', '0110000101', '1100001010', '1000010101', '0000101011'],
  ['0010001001', '1001001000', '0010010001', '0100100010', '1001000100', '0001001001', '0010010010', '0100100100'],
  ['1001101000', '1010001001'],
  ['1101011000', '1010110001', '0101100011', '1011000110', '0110001101', '1100011010', '1000110101', '0001101011'],
  ['0100100101', '1010100100', '0101001001', '1010010010', '0010010101', '0100101010', '1001010100', '0010101001', '0101010010'],
  ['1111010100', '1010100111'],
  ['1010110011', '1110101100', '1101011001', '0101100111', '1011001110', '0110011101', '1100111010', '1001110101', '0011101011', '0111010110'],
  ['0110011011', '1100110110', '1101101100', '1011011001', '0110110011', '1101100110', '1011001101', '1001101101', '0011011011', '0110110110'],
];

console.log(`=== the reported split classes at p = 10, re-decided at T = ${T} ===`);
for (const cls of classes) {
  console.log('');
  console.log(`class of ${cls[0]}:`);
  for (const w of cls) {
    const r = analyse(w, T);
    console.log(`  ${w}  ${r.verdict.padEnd(5)} q=${String(r.q).padEnd(5)} onset(time)=${String(r.onsetT).padEnd(8)} factors 32/128 = ${r.f}`);
  }
}
