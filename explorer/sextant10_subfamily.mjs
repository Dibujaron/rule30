// Sextant, 2026-09-12.  The cone conditions are INDEPENDENT: F_k is affine in
// b_k with a different top variable at each level, so any SUBSET S of the
// levels cuts the free bits by exactly |S|.  Consequence: a sparse subfamily
// still excludes the flat tower while leaving the centre column massively
// underdetermined -- and a COFINITE subfamily determines the centre column
// from a finite prefix of itself, which is exactly "white far to the left".
//
// Counted here against the prediction 2^(K+1-|S|).

function coneF(b, K) {
  const W = K + 4;
  const H = [new Uint8Array(W)];
  for (let t = 0; t < K; t++) {
    const p = H[t], n = new Uint8Array(W);
    n[0] = b[t] ^ (p[0] | p[1]);
    for (let k = 1; k < W - 1; k++) n[k] = p[k - 1] ^ (p[k] | p[k + 1]);
    H.push(n);
  }
  const L = [Uint8Array.from(b)];
  { const l1 = new Uint8Array(K + 1);
    for (let t = 0; t + 1 <= K; t++) l1[t] = b[t + 1] ^ (b[t] | H[t][0]);
    L.push(l1); }
  for (let k = 2; k <= K; k++) {
    const cur = new Uint8Array(K + 1);
    for (let t = 0; t + 1 <= K - k + 1; t++) cur[t] = L[k - 1][t + 1] ^ (L[k - 1][t] | L[k - 2][t]);
    L.push(cur);
  }
  const out = new Uint8Array(K + 1);
  for (let k = 0; k <= K; k++) out[k] = L[k][0];
  return out;
}

const K = 14;
const N = 1 << (K + 1);
const sets = [
  ['all levels 1..14', Array.from({ length: K }, (_, i) => i + 1)],
  ['powers of two 1,2,4,8', [1, 2, 4, 8]],
  ['the even levels', [2, 4, 6, 8, 10, 12, 14]],
  ['just k = 2 (kills the flat tower)', [2]],
  ['cofinite: levels 5..14', [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
];
console.log(`words b in {0,1}^${K + 1} satisfying the cone condition on a subset S of levels:`);
console.log('  S                                    |S|   solutions   2^(K+1-|S|)');
for (const [name, S] of sets) {
  let count = 0;
  const b = new Uint8Array(K + 1);
  for (let m = 0; m < N; m++) {
    for (let i = 0; i <= K; i++) b[i] = (m >> i) & 1;
    const F = coneF(b, K);
    let ok = true;
    for (const k of S) if (F[k] !== 0) { ok = false; break; }
    if (ok) count++;
  }
  console.log(`  ${name.padEnd(36)} ${String(S.length).padStart(3)}   ${String(count).padStart(9)}   ${1 << (K + 1 - S.length)}`);
}
