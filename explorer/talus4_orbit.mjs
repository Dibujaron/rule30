// Talus, 2026-09-09. The truncated packed-row map g_n(r) = (4r XOR (2r|r)) mod 2^n.
//
// Questions:
//  (a) what is the exact eventual period and preperiod of the orbit of 1 under g_n?
//  (b) how does the preperiod compare to 2k = 2(n-1), the time the wall reads at?
//  (c) what is the MINIMAL p with g^[2k](1) = g^[2k+p](1) -- is it 16, and why?
//
// Method: run the orbit with BigInt, store every value in a Map, find the first
// repeat. Exact, no sampling.

const NMAX = 24; // widths n = k+1 from 1 to NMAX

function g(r, mask) {
  return ((4n * r) ^ ((2n * r) | r)) & mask;
}

console.log("n  k=n-1   preperiod  period   2k    pre<=2k?  minimal-p-at-2k");
for (let n = 1; n <= NMAX; n++) {
  const mask = (1n << BigInt(n)) - 1n;
  const k = n - 1;
  const seen = new Map();
  let r = 1n & mask;
  let t = 0;
  while (!seen.has(r)) {
    seen.set(r, t);
    r = g(r, mask);
    t++;
  }
  const pre = seen.get(r);
  const per = t - pre;
  // minimal p such that orbit(2k) == orbit(2k+p): if 2k >= pre it is per, else none
  let minp = null;
  if (2 * k >= pre) minp = per;
  console.log(
    `${String(n).padStart(2)} ${String(k).padStart(5)} ${String(pre).padStart(10)} ${String(per).padStart(7)} ${String(2 * k).padStart(5)}   ${2 * k >= pre ? "yes" : "NO "}      ${minp === null ? "none" : minp}`,
  );
}
