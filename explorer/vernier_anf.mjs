// Vernier / connector, 2026-09-09.
// The centre cell at time t, as a Boolean function of the start word, in the
// T-function encoding: bit_t(T^t(x)) depends only on bits 0..t of x, so it is a
// Boolean function F_t of t+1 variables.  (Picture reading: row 0 occupies
// positions 0..t and is white at every negative position -- the left cone edge.)
// Compute its algebraic normal form by the Moebius transform and report the
// algebraic degree, the monomial count and the balance.
//
// The question this answers is the vantage's own: does the algebraic normal form
// of 4r XOR (2r OR r) make its behaviour computable?  For the MAP the ANF is one
// fixed quadratic; for the t-th centre cell it is this.

const TMAX = 22;

function centreBit(x, t, n) {
  const mask = (1 << n) - 1;
  let r = x & mask;
  for (let i = 0; i < t; i++) r = (((4 * r) ^ ((2 * r) | r)) & mask) >>> 0;
  return (r >>> t) & 1;
}

console.log(' t  vars  deg  monomials  /2^(t+1)   ones   balanced?   deg/vars');
for (let t = 0; t <= TMAX; t++) {
  const n = t + 1;
  const N = 1 << n;
  const f = new Uint8Array(N);
  let ones = 0;
  for (let x = 0; x < N; x++) { f[x] = centreBit(x, t, n); ones += f[x]; }
  // Moebius transform in place -> ANF coefficients
  const a = f.slice();
  for (let i = 0; i < n; i++) {
    const b = 1 << i;
    for (let x = 0; x < N; x++) if (x & b) a[x] ^= a[x ^ b];
  }
  let deg = 0, mons = 0;
  for (let x = 0; x < N; x++) if (a[x]) { mons++; const d = popcnt(x); if (d > deg) deg = d; }
  console.log(
    `${String(t).padStart(2)}  ${String(n).padStart(4)}  ${String(deg).padStart(3)}  ${String(mons).padStart(9)}  ${(mons / N).toFixed(4)}   ${String(ones).padStart(6)}   ${ones * 2 === N ? 'yes' : 'NO '}        ${(deg / n).toFixed(3)}`
  );
}
function popcnt(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}
