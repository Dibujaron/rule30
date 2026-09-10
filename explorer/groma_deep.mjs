// Groma, 2026-09-10.  The one deep computation this sighting asks for.
//
// Devyatov's dichotomy caps the subword complexity of every morphic sequence
// at O(n^2).  At T = 2e6 rows the switch-index sequence of X_{(10)^inf} has
// p(n)/n^2 = 0.09, 0.09, 0.20, 1.60 at n = 16, 32, 64, 128 -- climbing where a
// morphic sequence's would flatten, but measured over only two octaves, which
// this project has learned is not a law.  This run takes the same measurement
// to n = 512 on 1e7 rows (5e6 letters), where p(256) and p(512) are far below
// saturation if the trend continues.
//
// Cost is quadratic in the depth: 2e6 rows is 48s, so 1e7 rows is about 20
// minutes.  Windows are packed into 16-bit code units rather than digit
// strings, so a Set of 1e6 windows of length 512 costs about 60 MB, not 1 GB.

const T = 10000000;

// binary boundary b = 10, so every white run of the centre column has length 1
// and the switch index is column 1 read at the white times, one bit per run.
function run() {
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W), s = new Uint32Array(W);
  const j = new Uint8Array((T >> 1) + 4);
  let nj = 0;
  const t0 = Date.now();
  r[0] = 1; // b(0) = 1
  for (let t = 0; t < T; t++) {
    if ((r[0] & 1) === 0) j[nj++] = (r[0] >>> 1) & 1;
    const last = Math.min(W - 2, (t >> 5) + 1);
    for (let i = 0; i <= last; i++) {
      const cur = r[i];
      const up = (cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0);
      const down = (cur >>> 1) | (r[i + 1] << 31);
      s[i] = up ^ (cur | down);
    }
    s[last + 1] = 0;
    s[0] = (s[0] & ~1) | (((t + 1) & 1) ? 0 : 1); // b(u) = 1 if u even, 0 if odd
    const tmp = r; r = s; s = tmp;
    if ((t & 0xfffff) === 0 && t > 0) {
      process.stdout.write(`  ... row ${t}, ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
    }
  }
  return j.subarray(0, nj);
}

// distinct factors of length n, windows packed 16 bits per code unit
function complexity(seq, from, to, n) {
  const set = new Set();
  const units = (n + 15) >> 4;
  const buf = new Array(units);
  for (let i = from; i + n <= to; i++) {
    for (let u = 0; u < units; u++) {
      let v = 0;
      const base = i + (u << 4);
      const lim = Math.min(16, n - (u << 4));
      for (let k = 0; k < lim; k++) v = (v << 1) | seq[base + k];
      buf[u] = v;
    }
    set.add(String.fromCharCode.apply(null, buf));
  }
  return set.size;
}

console.log(`deep complexity of the switch-index sequence of X_{(10)^inf}, T = ${T} rows`);
const j = run();
console.log(`  ${j.length} letters`);
const from = j.length >> 1, to = j.length;
console.log(`  measuring on the last ${to - from} letters`);
for (const n of [16, 32, 64, 96, 128, 192, 256, 384, 512]) {
  const c = complexity(j, from, to, n);
  console.log(
    `  p(${String(n).padStart(3)}) = ${String(c).padStart(9)}   p/n = ${(c / n).toFixed(1).padStart(9)}   ` +
    `p/n^2 = ${(c / (n * n)).toFixed(3).padStart(8)}   ` +
    `(sample ${to - from}, ${((100 * c) / (to - from)).toFixed(2)}% of positions)`
  );
}
