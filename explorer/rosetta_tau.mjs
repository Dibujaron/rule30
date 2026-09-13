/**
 * Rosetta, 2026-09-13. The BSZ quantitative trade, tabulated.
 *
 * BSZ (as restated in arXiv:1902.10179): if |sum_{m<=M} phi(pm) conj(phi(qm))|
 * <= tau M for all distinct primes p,q <= e^{1/tau} and M large, then
 * |sum_{n<=N} a(n) phi(n)| <= 2 sqrt(tau log(1/tau)) N for N large, for every
 * multiplicative a with |a| <= 1. Take a = 1 and phi(n) = (-1)^{centerColumn n}:
 * the left side is |E(N)|, Prize 2's excess.
 *
 * This prints, for each tau, the prime bound, how many primes and pairs that is,
 * and the resulting constant in |E(N)| <= c N. log is taken natural; the source
 * does not say which, so the c column is marked in the document.
 *
 *   node explorer/rosetta_tau.mjs
 */
function piOf(x) {
  if (x > 5e8) return null;
  const n = Math.floor(x);
  const sieve = new Uint8Array(n + 1);
  let count = 0;
  for (let i = 2; i <= n; i++) {
    if (!sieve[i]) { count++; if (i * i <= n) for (let j = i * i; j <= n; j += i) sieve[j] = 1; }
  }
  return count;
}
console.log('tau      primes <= e^(1/tau)      pi          pairs        c = 2 sqrt(tau ln(1/tau))');
for (const tau of [0.3, 0.2, 0.1, 0.05, 0.02, 0.01, 0.001]) {
  const B = Math.exp(1 / tau);
  const c = 2 * Math.sqrt(tau * Math.log(1 / tau));
  const pi = B <= 5e8 ? piOf(B) : null;
  const pairs = pi === null ? null : (pi * (pi - 1)) / 2;
  console.log(
    `${tau.toFixed(3).padStart(6)}  ${B.toExponential(3).padStart(12)}  ${(pi === null ? '(too large)' : String(pi)).padStart(12)}  ${(pairs === null ? '-' : pairs.toExponential(2)).padStart(12)}   ${c.toFixed(4)}`
  );
}
