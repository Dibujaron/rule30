// Talus, 2026-09-08. 1010001001 was BAD at 10^6 rows and GOOD at 2.5 x 10^6,
// with onset 798,077. Every verdict in this session that rests on a shallower
// run is therefore suspect, and the one that matters most is the claim that a
// ring trace need not be good -- which I tested at T = 2 x 10^4.
//
// The smallest witness there was the ring 00111 of size 5, cycle length 5. Its
// phase traces are words of period dividing 5, so they must appear in the p = 5
// sweep, where only 00000 and 11111 came out good. Re-run those traces deep.

const T = 1600000;

function ringStep(w) {
  const n = w.length, o = new Uint8Array(n);
  for (let k = 0; k < n; k++) o[k] = w[(k + 1) % n] ^ (w[k] | w[(k - 1 + n) % n]);
  return o;
}

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
  if (v.length === 0) return 'GOOD (b all black)';
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

// the ring 00111 of size 5, temporal period 5: all five phase traces
const rho = Uint8Array.from([0, 0, 1, 1, 1]);
const orbit = [];
let x = rho;
for (let i = 0; i < 5; i++) { orbit.push(x); x = ringStep(x); }
const traces = new Set();
for (let m = 0; m < 5; m++) traces.add(orbit.map((r) => r[m]).join(''));

console.log(`=== phase traces of the size-5 ring 00111 (temporal period 5), at T = ${T} ===`);
console.log('If any comes out BAD at this depth it is still only "bad so far".');
for (const t of traces) console.log(`  ${t}  ${analyse(t, T)}`);

console.log('');
console.log('=== the four p=5 words the T=3x10^4 sweep called good-then-bad ===');
for (const w of ['11110', '01111']) console.log(`  ${w}  ${analyse(w, T)}`);
