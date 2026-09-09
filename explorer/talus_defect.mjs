// Talus, 2026-09-08. Two things the factor counts made me distrust.
//
// (1) X_{11111110} column -1 looked exactly 8-periodic from index 0 at depth
//     9 x 10^4, but has NINE distinct factors of length 8 in the tail
//     [5x10^5, 10^6) -- one more than an 8-periodic sequence can have. So there
//     is at least one defect out there. Where, and how many?
//     The mechanism was: the boundary is white only at t = 7 mod 8, so column -1
//     is forced by the boundary alone except on that residue class, where it
//     reads column 1. Column 1 was white at every one of the first 5000 such
//     times. This looks for the times where it is not.
//
// (2) X_{(10)^inf} column 1 has only 48 distinct factors of length 32 in a tail
//     of 5 x 10^5 -- quasi-periodic, not chaotic. The complexity profile decides
//     between "aperiodic with linear complexity" and "periodic with a period
//     bigger than the lags scanned": eventually periodic with period q forces
//     the profile to be flat at q from n = q on.

const T = 2000000;

function halfline(b, T) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W);
  let s = new Uint32Array(W);
  const col = new Uint8Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    col[t] = (r[0] >>> 1) & 1;
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
  return col;
}

console.log('(1) X_{11111110}: the times t = 7 mod 8 where column 1 is black');
{
  const b = '11111110'.split('').map(Number);
  const N = 2000000;
  const c1 = halfline(b, N);
  const hits = [];
  for (let t = 7; t < N; t += 8) if (c1[t]) hits.push(t);
  console.log(`  depth ${N}: ${hits.length} such times`);
  console.log(`  first twenty: ${hits.slice(0, 20).join(' ')}`);
  // the defects of column -1 are exactly these
  const cm = new Uint8Array(N - 1);
  for (let t = 0; t + 1 < N; t++) cm[t] = b[(t + 1) % 8] ^ (b[t % 8] | c1[t]);
  const bad = [];
  for (let t = 0; t + 8 < N - 1; t++) if (cm[t + 8] !== cm[t]) bad.push(t);
  console.log(`  column -1 fails 8-periodicity at ${bad.length} indices; first ten: ${bad.slice(0, 10).join(' ')}`);
  if (bad.length) {
    let gapMax = bad[0];
    for (let i = 1; i < bad.length; i++) gapMax = Math.max(gapMax, bad[i] - bad[i - 1]);
    console.log(`  largest gap between failures: ${gapMax}; last failure at ${bad[bad.length - 1]}`);
  }
}

console.log('');
console.log('(2) complexity profile of X_{(10)^inf} column 1 and column -1');
{
  const b = [1, 0];
  const c1 = halfline(b, T);
  const cm = new Uint8Array(T - 1);
  for (let t = 0; t + 1 < T; t++) cm[t] = b[(t + 1) % 2] ^ (b[t % 2] | c1[t]);
  const from = T >> 1;
  // rolling double hash so n may be large
  const M1 = 2147483647, M2 = 2147483629, B1 = 131, B2 = 137;
  function profile(col, len, from, to) {
    const out = [];
    for (const n of [8, 16, 32, 64, 128, 256, 512, 1024, 4096, 16384, 65536, 262144]) {
      if (from + n >= to) break;
      let p1 = 1, p2 = 1;
      for (let i = 0; i < n; i++) { p1 = (p1 * B1) % M1; p2 = (p2 * B2) % M2; }
      let h1 = 0, h2 = 0;
      for (let t = from; t < from + n; t++) {
        h1 = (h1 * B1 + col[t] + 1) % M1;
        h2 = (h2 * B2 + col[t] + 1) % M2;
      }
      const seen = new Set([h1 * 2097152 + (h2 & 2097151)]);
      for (let t = from + n; t < to; t++) {
        h1 = ((h1 * B1) % M1 - (p1 * (col[t - n] + 1)) % M1 + col[t] + 1 + M1 * 2) % M1;
        h2 = ((h2 * B2) % M2 - (p2 * (col[t - n] + 1)) % M2 + col[t] + 1 + M2 * 2) % M2;
        seen.add(h1 * 2097152 + (h2 & 2097151));
      }
      out.push([n, seen.size]);
    }
    return out;
  }
  console.log(`  tail [${from}, ${T}), length ${T - from}`);
  for (const [name, col, len] of [['column  1', c1, T], ['column -1', cm, T - 1]]) {
    const prof = profile(col, len, from, len);
    console.log(`  ${name}: ` + prof.map(([n, c]) => `p(${n})=${c}`).join('  '));
  }
}
