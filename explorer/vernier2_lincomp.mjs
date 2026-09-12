// Vernier, 2026-09-12. Linear complexity, with an honest null.
//
// My first control was xorshift32, which is F_2-LINEAR by construction, so its
// linear complexity is 32 whatever the sequence looks like -- a check that
// Berlekamp-Massey works, not a random null. A random sequence has L(N) ~ N/2.
// Replaced here by a nonlinear mixer (splitmix64-style) and by a second
// independent source.

function berlekampMassey(s) {
  const n = s.length;
  let C = new Uint8Array(n + 1), B = new Uint8Array(n + 1);
  C[0] = 1; B[0] = 1;
  let L = 0, mm = 1;
  for (let N = 0; N < n; N++) {
    let d = s[N];
    for (let i = 1; i <= L; i++) d ^= C[i] & s[N - i];
    if (d === 1) {
      const T = C.slice();
      for (let i = 0; i + mm <= n; i++) C[i + mm] ^= B[i];
      if (2 * L <= N) { L = N + 1 - L; B = T; mm = 1; } else mm++;
    } else mm++;
  }
  return L;
}

function splitmixBits(seed, n) {
  let x = BigInt(seed);
  const M = (1n << 64n) - 1n;
  const out = [];
  while (out.length < n) {
    x = (x + 0x9e3779b97f4a7c15n) & M;
    let z = x;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & M;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & M;
    z = z ^ (z >> 31n);
    for (let i = 0; i < 64 && out.length < n; i++) out.push(Number((z >> BigInt(i)) & 1n));
  }
  return out;
}

function centreColumn(T) {
  let r = 1n; const out = [Number(r & 1n)];
  for (let t = 1; t <= T; t++) { r = (4n * r) ^ ((2n * r) | r); out.push(Number((r >> BigInt(t)) & 1n)); }
  return out;
}

const T = 4096;
const cases = [
  ['rule30 centreColumn', centreColumn(T - 1)],
  ['splitmix64 bits (nonlinear PRNG)', splitmixBits(1, T)],
  ['splitmix64 bits, second seed', splitmixBits(987654321, T)],
  ['rule90 column1, black at 2^j-1', Array.from({ length: T }, (_, n) => (n >= 1 && ((n + 1) & n) === 0 ? 1 : 0))],
  ['Thue-Morse', Array.from({ length: T }, (_, n) => { let p = 0, x = n; while (x) { p ^= x & 1; x >>= 1; } return p; })],
  ['period-37', Array.from({ length: T }, (_, n) => (n % 37 < 19 ? 1 : 0))],
];
for (const [name, s] of cases) {
  const L = berlekampMassey(s);
  console.log(JSON.stringify({ name, N: T, L, LoverHalfN: +(L / (T / 2)).toFixed(4) }));
}
