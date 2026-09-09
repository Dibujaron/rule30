// Vernier / connector, 2026-09-09.
// The Mahler expansion of the rule-30 T-function  T(x) = 4x XOR (2x OR x).
// Every continuous map Z_2 -> Z_2 is  T(x) = sum_k a_k * C(x,k)  with
//   a_k = sum_{j=0..k} (-1)^(k-j) C(k,j) T(j),
// and the coefficients are what Anashin's criteria for 1-Lipschitz maps are
// usually stated in.  The question: is this expansion sparse or structured?
// (For comparison, Klimov-Shamir's own generator x + (x^2 OR 5) has a short one,
// since x^2 = 2*C(x,2) + C(x,1).)

const T = (r) => (4n * r) ^ ((2n * r) | r);

const K = 256;
// binomials
const C = [];
for (let n = 0; n <= K; n++) {
  C.push(new Array(n + 1));
  C[n][0] = 1n; C[n][n] = 1n;
  for (let r = 1; r < n; r++) C[n][r] = C[n - 1][r - 1] + C[n - 1][r];
}
const Tv = [];
for (let j = 0; j <= K; j++) Tv.push(T(BigInt(j)));

const a = [];
for (let k = 0; k <= K; k++) {
  let s = 0n;
  for (let j = 0; j <= k; j++) {
    const term = C[k][j] * Tv[j];
    s += ((k - j) % 2 === 0) ? term : -term;
  }
  a.push(s);
}

const v2 = (x) => { if (x === 0n) return Infinity; let n = x < 0n ? -x : x, v = 0; while ((n & 1n) === 0n) { n >>= 1n; v++; } return v; };

console.log('k   a_k                      v_2(a_k)   |a_k| bits');
for (let k = 0; k <= 24; k++) {
  const s = a[k].toString();
  const bits = a[k] === 0n ? 0 : (a[k] < 0n ? -a[k] : a[k]).toString(2).length;
  console.log(`${String(k).padStart(2)}  ${s.padEnd(24)} ${String(v2(a[k])).padStart(6)}   ${bits}`);
}

let zeros = 0, nonzero = [];
for (let k = 0; k <= K; k++) { if (a[k] === 0n) zeros++; else nonzero.push(k); }
console.log(`\nzero coefficients among k <= ${K}: ${zeros}  (so the expansion is ${zeros > K / 2 ? 'sparse' : 'DENSE'})`);
console.log(`nonzero k: ${nonzero.length <= 40 ? nonzero.join(',') : nonzero.slice(0, 30).join(',') + ' ... (' + nonzero.length + ' of ' + (K + 1) + ')'}`);
console.log(`v_2(a_k) for k = 0..40: ${a.slice(0, 41).map((x) => (x === 0n ? '-' : v2(x))).join(',')}`);
console.log(`bit-length of a_k for k = 0..40: ${a.slice(0, 41).map((x) => (x === 0n ? 0 : (x < 0n ? -x : x).toString(2).length)).join(',')}`);
// Anashin's 1-Lipschitz shape: v_2(a_k) >= floor(log2 k) is the usual necessary
// condition (a_k divisible by 2^{ceil(log2 k)} up to a unit).  Check the margin.
console.log('\nk   v_2(a_k)   floor(log2 k)   slack');
for (let k = 1; k <= 40; k++) {
  const v = a[k] === 0n ? Infinity : v2(a[k]);
  const l = Math.floor(Math.log2(k));
  console.log(`${String(k).padStart(2)}  ${String(v).padStart(8)}   ${String(l).padStart(13)}   ${v === Infinity ? 'inf' : v - l}`);
}
