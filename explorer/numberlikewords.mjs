/**
 * How many column words can a configuration white on x <= -1 show?
 *
 *   node explorer/numberlikewords.mjs
 *
 * For t <= T_MAX, every window X(0..t) with the left half white is grown
 * for t steps and its column-0 word c(0..t) recorded; the number of distinct
 * words is printed with the ratio to the previous depth. All 2^(t+1) column
 * words occur for unrestricted windows (each exactly 2^t times, see
 * leftsolve.mjs); with a white left half the count is far smaller, and its
 * growth rate is the entropy of the column subshift of Kopra's number-like
 * configurations, which is where the residual generalised to all such
 * configurations lives.
 *
 * The search shares prefixes: a window X(0..t) is extended to X(0..t+1) by
 * one new right diagonal, computed from the two outermost diagonals of the
 * window's triangle, as in whiteleft.mjs.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const T_MAX = 22;

const words = Array.from({ length: T_MAX + 1 }, () => new Set());
const periodicWords = Array.from({ length: T_MAX + 1 }, () => new Set());

// stack of [T, Dprev, Dcur, word] ; word = column bits c(0..T) packed
const stack = [];
for (const x0 of [0, 1]) stack.push([0, new Uint8Array(0), Uint8Array.of(x0), x0]);
// left half-line column -1 is shared only when column 0 is shared; here each
// window has its own column, so carry cell(t,-1) per window: it depends on
// c(0..t-1) only, so recompute it from the word each time (cheap for t <= 22).
function leftColumn(word, T) {
  // column -1 of the half-line x <= -1 driven by c(0..T-1), white start
  let row = new Uint8Array(T + 3);
  const L = new Uint8Array(T + 1);
  for (let t = 0; t <= T; t++) {
    L[t] = row[1];
    const cur = row.slice(); cur[0] = (word >> t) & 1;
    for (let k = 1; k <= T + 1; k++) row[k] = cur[k + 1] ^ (cur[k] | cur[k - 1]);
  }
  return L;
}

while (stack.length) {
  const [T, Dprev, Dcur, word] = stack.pop();
  words[T].add(word);
  if (T === T_MAX) continue;
  const L = leftColumn(word, T);
  for (let y = 0; y <= 1; y++) {
    const D = new Uint8Array(T + 2);
    D[0] = y;
    for (let s = 0; s < T; s++) D[s + 1] = Dprev[s] ^ (Dcur[s] | D[s]);
    D[T + 1] = L[T] ^ (Dcur[T] | D[T]);
    stack.push([T + 1, Dcur, D, word | (D[T + 1] << (T + 1))]);
  }
}

console.log('distinct column words c(0..t) of windows white on x <= -1');
console.log('    t   words    2^(t+1)   ratio to t-1   periodic words (p<=t) realised / total');
let prev = null;
for (let t = 0; t <= T_MAX; t++) {
  let periodicTotal = 0, periodicRealised = 0;
  if (t <= 14) {
    for (let word = 0; word < (1 << (t + 1)); word++) {
      let periodic = false;
      for (let p = 1; p <= t && !periodic; p++) {
        let ok = true;
        for (let s = p; s <= t; s++) if (((word >> s) & 1) !== ((word >> (s - p)) & 1)) { ok = false; break; }
        periodic = ok;
      }
      if (periodic) { periodicTotal++; if (words[t].has(word)) periodicRealised++; }
    }
  }
  const n = words[t].size;
  console.log(`  ${String(t).padStart(3)}  ${String(n).padStart(7)}  ${String(1 << (t + 1)).padStart(8)}   ${prev ? (n / prev).toFixed(3).padStart(8) : '   -    '}       ${t <= 14 ? `${periodicRealised} / ${periodicTotal}` : '(not counted)'}`);
  prev = n;
}
