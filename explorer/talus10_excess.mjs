// Talus, 2026-09-12.  A bridge from Prize 2's own quantity to rung 2.
//
// E(N) = 2 * #{n < N : c(n) = 1} - N, the centre column's excess.
//
// If 11 does not occur in [N, T] then the black cells there are isolated, so
// there are at most ceil((T-N+1)/2) of them and
//     E(T+1) = E(N) + (2 * blacks[N,T] - (T-N+1)) <= E(N) + 1.
// So "limsup E = +infinity" implies 11 occurs infinitely often.  Dually, if 00
// does not occur in [N,T] the whites are isolated and E(T+1) >= E(N) - 1, so
// "liminf E = -infinity" implies 00 occurs infinitely often.  Either gives
// "c is not eventually alternating", which with the closed
// centerColumn_not_eventually_constant is the p = 2 instance of Prize 1.
//
// This script (a) checks the inequality's arithmetic directly on the column,
// (b) measures E, and (c) states the null honestly against coin draws.

function packedCenter(T) {
  const nw = ((2 * T + 64) >>> 5) + 2;
  let cur = new Uint32Array(nw), nxt = new Uint32Array(nw);
  cur[0] = 1;
  const c = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    c[t] = (cur[t >>> 5] >>> (t & 31)) & 1;
    const top = Math.min(nw - 1, ((2 * t + 3) >>> 5) + 1);
    for (let w = top; w >= 0; w--) {
      const x = cur[w], lo = w === 0 ? 0 : cur[w - 1];
      nxt[w] = ((((x << 2) | (lo >>> 30)) >>> 0) ^ ((((x << 1) | (lo >>> 31)) >>> 0) | x)) >>> 0;
    }
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return c;
}

const T = 10000000;
console.log(`building the centre column to ${T} ...`);
const c = packedCenter(T);

// E(N) for N = 0..T
const E = new Int32Array(T + 1);
for (let n = 0; n < T; n++) E[n + 1] = E[n] + (c[n] ? 1 : -1);

console.log("\n[E] the excess");
let mx = -1e9, mxAt = 0, mn = 1e9, mnAt = 0;
for (let n = 0; n <= T; n++) {
  if (E[n] > mx) { mx = E[n]; mxAt = n; }
  if (E[n] < mn) { mn = E[n]; mnAt = n; }
}
console.log(`    E(${T}) = ${E[T]} = ${(E[T] / Math.sqrt(T)).toFixed(3)} sqrt(N)`);
console.log(`    max E = ${mx} at N = ${mxAt};  min E = ${mn} at N = ${mnAt}`);
console.log("    running max / min of E by decade:");
for (let k = 2; k <= 7; k++) {
  const lim = Math.pow(10, k);
  let a = -1e9, b = 1e9;
  for (let n = 0; n <= lim; n++) { if (E[n] > a) a = E[n]; if (E[n] < b) b = E[n]; }
  console.log(`      10^${k}: max ${String(a).padStart(6)}  min ${String(b).padStart(6)}`);
}

// (a) the inequality, checked directly: over every interval [N,T'] with no 11,
// is E(T'+1) <= E(N) + 1?
console.log("\n[A] the inequality E(T+1) <= E(N)+1 on every maximal 11-free interval");
{
  let bad = 0, n = 0, count = 0, worst = -1e9;
  while (n < T - 1) {
    // maximal interval [n, m] containing no 11
    let m = n;
    while (m + 1 < T && !(c[m] === 1 && c[m + 1] === 1)) m++;
    // [n, m] is 11-free as a set of positions n..m (pairs (t,t+1) for t<m)
    if (m > n) {
      count++;
      const lhs = E[m + 1], rhs = E[n] + 1;
      if (lhs > rhs) bad++;
      if (lhs - rhs > worst) worst = lhs - rhs;
    }
    n = m + 1;
  }
  console.log(`    ${count} maximal 11-free intervals, ${bad} violations, worst slack ${worst}`);
}
console.log("[A] and dually on every maximal 00-free interval, E(T+1) >= E(N)-1");
{
  let bad = 0, n = 0, count = 0, worst = 1e9;
  while (n < T - 1) {
    let m = n;
    while (m + 1 < T && !(c[m] === 0 && c[m + 1] === 0)) m++;
    if (m > n) {
      count++;
      const lhs = E[m + 1], rhs = E[n] - 1;
      if (lhs < rhs) bad++;
      if (lhs - rhs < worst) worst = lhs - rhs;
    }
    n = m + 1;
  }
  console.log(`    ${count} maximal 00-free intervals, ${bad} violations, worst slack ${worst}`);
}

// (c) the null: is the excess's growth distinguishable from a coin's?
console.log("\n[C] null: 12 xorshift32 coin draws of the same length, max and min of E");
let s = 0x1234567;
const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s & 1; };
let aboveMax = 0, belowMin = 0;
for (let d = 0; d < 12; d++) {
  let e = 0, a = -1e9, b = 1e9;
  for (let n = 0; n < T; n++) { e += rnd() ? 1 : -1; if (e > a) a = e; if (e < b) b = e; }
  if (a >= mx) aboveMax++;
  if (b <= mn) belowMin++;
  if (d < 4) console.log(`      draw ${d}: max ${String(a).padStart(6)}  min ${String(b).padStart(6)}`);
}
console.log(`    coin draws with max at least the seed's (${mx}): ${aboveMax}/12`);
console.log(`    coin draws with min at most the seed's (${mn}): ${belowMin}/12`);
console.log(`    (a coin's E is recurrent, so limsup E = +inf a.s.; for the seed it is open)`);
