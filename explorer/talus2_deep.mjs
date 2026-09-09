// Talus, 2026-09-08. Deep confirmation of the classification, and of the
// rotation splits the T=3000 sweep reported.
//
// Two instruments, deliberately different in kind:
//   (i)  exhaustive lag search on v = column 1 restricted to the white times of
//        b, over every q up to QMAX, with the onset required to sit in the
//        first half of the run (last session's false positives were all claims
//        whose onset was a large fraction of the depth);
//   (ii) distinct-factor counts of the tail of v (crystal 21): if the tail of
//        length M has P(n) distinct factors of length n, then any eventual
//        period whose onset lies before the tail is at least P(n). This is the
//        instrument that decided the (10)^inf witness last session, and it has
//        no cap on the range of periods it excludes.

const T = 150000;
const QMAX = 4000;

function col1(b, T) {
  const p = b.length;
  const words = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(words);
  let s = new Uint32Array(words);
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

function whiteRestrict(b, c1) {
  const p = b.length;
  const v = [];
  for (let t = 0; t < c1.length; t++) if (b[t % p] === 0) v.push(c1[t]);
  return Uint8Array.from(v);
}

// least q <= QMAX whose failures all lie before L/2; returns [q, onset]
function eventualPeriod(v, QMAX) {
  const L = v.length;
  const half = L >> 1;
  for (let q = 1; q <= QMAX && q < half; q++) {
    let ok = true;
    for (let i = half; i + q < L; i++) if (v[i + q] !== v[i]) { ok = false; break; }
    if (!ok) continue;
    let onset = 0;
    for (let i = half - 1; i >= 0; i--) if (v[i + q] !== v[i]) { onset = i + 1; break; }
    return [q, onset];
  }
  return [0, -1];
}

// distinct factors of length n in the final M terms of v
function factors(v, n, M) {
  const start = v.length - M;
  const set = new Set();
  for (let i = start; i + n <= v.length; i++) {
    let h = '';
    for (let j = 0; j < n; j++) h += v[i + j];
    set.add(h);
  }
  return set.size;
}

function report(s) {
  const b = s.split('').map(Number);
  const c1 = col1(b, T);
  const v = whiteRestrict(b, c1);
  if (v.length === 0) { console.log(`${s.padEnd(13)} all black: column -1 = NOT(shift of b), good by construction`); return; }
  const [q, onset] = eventualPeriod(v, QMAX);
  const M = Math.min(20000, v.length >> 1);
  const f32 = factors(v, 32, M);
  const f128 = factors(v, 128, M);
  const verdict = q > 0 ? `GOOD q=${q} onset=${onset}` : `no period <= ${QMAX}`;
  console.log(
    `${s.padEnd(13)} |v|=${String(v.length).padEnd(7)} ${verdict.padEnd(26)} factors(32)=${String(f32).padEnd(7)} factors(128)=${f128}`
  );
}

console.log(`=== deep confirmation, T = ${T}, lags to ${QMAX}, onset forced into the first half ===`);
console.log('');
console.log('--- the split rotation classes: one good and one bad member each ---');
const pairs = [
  ['11011100', '10111001'], ['11011100', '10011011'],
  ['10110101', '01101011'],
  ['101100000', '011000001'],
  ['100001111', '111110000'],
  ['111011010', '101101011'],
  ['011101111', '111101110'],
  ['1010100000', '0101000001'],
  ['0010001001', '1001001000'],
  ['1110011000', '0011000111'],
  ['1001101101', '1101101100'],
  ['1011011101', '1110110110'],
  ['11110010000', '10010000111'],
  ['10110100001', '11011010000'],
  ['10110101011', '11101101010'],
  ['11111011110', '10111101111'],
];
for (const [g, bd] of pairs) {
  console.log(`  class of ${g}:`);
  report('  ' + g === '  ' + g ? g : g);
  report(bd);
}

console.log('');
console.log('--- the single-black-cell family b = 1 0^(p-1) ---');
for (let p = 1; p <= 16; p++) {
  let s = '1';
  for (let i = 1; i < p; i++) s += '0';
  report(s);
}

console.log('');
console.log('--- the single-white-cell family b = 0 1^(p-1) ---');
for (let p = 1; p <= 16; p++) {
  let s = '0';
  for (let i = 1; i < p; i++) s += '1';
  report(s);
}
