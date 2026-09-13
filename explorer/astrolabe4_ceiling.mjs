// Astrolabe, 2026-09-13.  The EXACT Neciporuk ceiling at small n, because the
// asymptotic form n^2/(4 log n) is not the ceiling at the n this project can
// reach and reading it as one is a "well-formed and wrong" error.
//
// Neciporuk: L(f) >= (1/4) sum_i log2 s_i over a partition into blocks.
// For a block of size b, log2 s_i <= min(2^b, n-b): at most 2^(2^b) functions
// on b variables, and at most 2^(n-b) settings of the other variables.
// So the best the method can EVER output, for any function whatever, is
//   ceiling(n) = max over b of  floor(n/b) * min(2^b, n-b) / 4.
// The trivial lower bound for a function depending on all n variables is n-1.

console.log(' n   best b   exact ceiling   n^2/(4 log2 n)   trivial n-1   ceiling beats trivial?');
for (let n = 9; n <= 40; n++) {
  let best = 0, bestB = 0;
  for (let b = 1; b <= n; b++) {
    const blocks = Math.floor(n / b);
    const per = Math.min(Math.pow(2, b), n - b);
    const v = blocks * per / 4;
    if (v > best) { best = v; bestB = b; }
  }
  const asym = (n * n) / (4 * Math.log2(n));
  console.log(
    String(n).padStart(2) + String(bestB).padStart(8) + best.toFixed(2).padStart(16) +
    asym.toFixed(2).padStart(17) + String(n - 1).padStart(14) +
    (best > n - 1 ? '   YES' : '   no'));
}
