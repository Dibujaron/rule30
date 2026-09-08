/**
 * Portage (connector, 2026-09-08): the centre column copied out to the right.
 *
 *   node explorer/portage_copies.mjs
 *
 * Right diagonal k, R_k(j) = cell(j + k, j), is periodic in j from j = 0 with
 * period P_k = A094605(k), and with no transient at all. So
 *
 *     c(k) = R_k(0) = R_k(X) = cell(k + X, X)   for every X divisible by P_k.
 *
 * The centre cell at time k therefore reappears verbatim at position X of row
 * k + X, for every X that P_k divides. Reading that at a fixed X = 2^e: the
 * column at position 2^e reproduces the centre column's first K(e) + 1 terms,
 * where K(e) is the last k with P_k <= 2^e. This script checks the identity
 * against the picture and prints K(e).
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const T = 6000, OFF = T + 1, W = 2 * T + 3;
const P = new Uint8Array(T * W);
P[OFF] = 1;
for (let t = 0; t + 1 < T; t++) {
  const a = t * W, b = (t + 1) * W;
  for (let i = OFF - t - 1; i <= OFF + t + 1; i++) P[b + i] = P[a + i - 1] ^ (P[a + i] | P[a + i + 1]);
}
const cell = (t, x) => (t >= 0 && t < T && x >= -t && x <= t ? P[t * W + OFF + x] : 0);
const c = Array.from({ length: T }, (_, t) => cell(t, 0));

// A094605 as measured by explorer/portage_rightdiag.mjs, k = 0..39
const per = [1, 2, 2, 4, 8, 8, 16, 32, 32, 64, 64, 64, 64, 64, 64, 128, 256, 256, 256, 256,
  256, 256, 256, 256, 512, 1024, 1024, 2048, 2048, 4096, 4096, 4096, 4096, 4096, 8192, 8192];

let checked = 0, bad = 0;
for (let k = 0; k < per.length; k++) {
  for (let X = per[k]; X + k < T; X += per[k]) { checked++; if (cell(k + X, X) !== c[k]) bad++; }
}
console.log(`c(k) = cell(k + X, X) for every X divisible by P_k: ${checked} instances, ${bad} failures`);

for (let e = 0; e <= 12; e++) {
  const X = 1 << e;
  let K = -1;
  for (let k = 0; k < per.length; k++) if (per[k] <= X) K = k; else break;
  const got = [], want = [];
  for (let k = 0; k <= K && k + X < T; k++) { got.push(cell(k + X, X)); want.push(c[k]); }
  console.log(`  column ${String(X).padStart(4)}: reproduces c(0..${K}) = ${want.join('')}  (picture reads ${got.join('')}) ${got.join('') === want.join('') ? 'OK' : 'MISMATCH'}`);
}
