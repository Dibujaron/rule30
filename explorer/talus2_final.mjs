// Talus, 2026-09-08. Settle the words the T=30000 sweep left undecided, and
// measure how large the onset of goodness gets.
//
// The onset matters more than the verdict: if the onset is not bounded by any
// function of the period that a run can reach, then no bounded computation on b
// decides goodness, which is sub-question (a).

const T = 200000;

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
  if (v.length === 0) return { verdict: 'GOOD', q: 0, onsetV: 0, onsetT: 0, f32: 1, f128: 1 };
  const M = Math.max(64, v.length >> 2);
  const start = v.length - M;
  const count = (n) => {
    const st = new Set();
    for (let i = start; i + n <= v.length; i++) { let h = ''; for (let j = 0; j < n; j++) h += v[i + j]; st.add(h); }
    return st.size;
  };
  const f32 = count(32), f128 = count(128);
  let q = 0;
  for (let cand = 1; cand <= Math.min(4000, M >> 2) && !q; cand++) {
    let ok = true;
    for (let i = start; i + cand < v.length; i++) if (v[i + cand] !== v[i]) { ok = false; break; }
    if (ok) q = cand;
  }
  if (!q) return { verdict: f32 >= 200 ? 'BAD' : 'BAD(low complexity, not periodic)', q: 0, onsetV: -1, onsetT: -1, f32, f128 };
  let onsetV = 0;
  for (let i = start - 1; i >= 0; i--) if (v[i + q] !== v[i]) { onsetV = i + 1; break; }
  const whites = b.filter((x) => x === 0).length;
  const onsetT = Math.round((onsetV * p) / whites);
  return { verdict: 'GOOD', q, onsetV, onsetT, f32, f128 };
}

console.log(`=== the words the T=30000 sweep left UNDECIDED, at T = ${T} ===`);
console.log('b            verdict                              q      onset(v)  onset(time)  factors 32/128');
const undecided = [
  '10', '01', '1010', '0101',
  '11110', '11101', '11011', '01111',
  '110000', '011000', '001100', '101010', '000110', '100001', '010101', '000011',
  '1000000', '0100000', '1100000', '0010000', '0110000', '0001000', '0011000', '1011000',
  '0000100', '0001100', '0101100', '0000010', '1100010', '0000110', '0010110', '0000001',
  '1000001', '0110001', '1000101', '0000011', '0001011',
  '11000100', '01100010', '10101010', '00110001', '01010101', '10111101',
];
for (const s of undecided) {
  const r = analyse(s, T);
  console.log(
    `${s.padEnd(12)} ${r.verdict.padEnd(36)} ${String(r.q).padEnd(6)} ${String(r.onsetV).padEnd(9)} ${String(r.onsetT).padEnd(12)} ${r.f32}/${r.f128}`
  );
}

console.log('');
console.log('=== how large does the onset get? good words with the biggest onsets ===');
console.log('b                q      onset(v)   onset(time)');
const late = [
  '100', '10100000', '00000101', '011000001', '11110010000', '10110100001',
  '1010100000', '0101000001', '1110011000', '0011000111', '10110101011',
  '11111011110', '0000000101', '000000000101', '0000000000101',
];
for (const s of late) {
  const r = analyse(s, T);
  console.log(`${s.padEnd(16)} ${String(r.q).padEnd(6)} ${String(r.onsetV).padEnd(10)} ${r.onsetT}   ${r.verdict === 'GOOD' ? '' : '(' + r.verdict + ')'}`);
}

console.log('');
console.log('=== the family b = (0^k)101 : does the onset grow with k? ===');
console.log('b                       q      onset(v)   onset(time)   verdict');
for (let k = 0; k <= 10; k++) {
  let s = '';
  for (let i = 0; i < k; i++) s += '0';
  s += '101';
  const r = analyse(s, T);
  console.log(`${s.padEnd(23)} ${String(r.q).padEnd(6)} ${String(r.onsetV).padEnd(10)} ${String(r.onsetT).padEnd(13)} ${r.verdict}`);
}
