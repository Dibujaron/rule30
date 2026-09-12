// Parallax 12 / D. P1 as the irrationality of one explicitly given constant,
// and the archimedean step of a cycle-exclusion argument, transported.
//
// A binary expansion is eventually periodic exactly when the number is rational.
// So with  alpha = sum_{t>=0} c(t) 2^{-(t+1)},  c the centre column:
//
//     P1  <=>  alpha is irrational
//     "c has period p from index N"  <=>  alpha in Z / (2^N (2^p - 1))
//
// Steiner's argument for the 3x+1 map runs: (1) the return condition is one
// linear equation whose coefficient is 2^s - 3^r; (2) an ARCHIMEDEAN size
// estimate forces 2^s/3^r close to 1; (3) Baker bounds s; (4) finite check.
// Step (2), transported, is a question about how well alpha is approximated by
// the rationals with denominators 2^N(2^p - 1) -- a Liouville-type question
// about one named constant.
//
// Measured here: for each period p, the longest run on which the centre column
// is p-periodic, anywhere below T. That is exactly the approximation quality:
// a run of length D starting at N gives |alpha - q| < 2^{-(N+D)} for the
// corresponding q. Null: a fair coin, where the longest such run is p + log2(T).

const T = 100000;

// packed-row engine: bit i of row t is the cell at position i - t.
const W = ((2 * T + 4) >> 5) + 2;
function shl(src, dst, k) { // dst = src << k  (bitwise, little-endian words)
  const wo = k >>> 5, bo = k & 31;
  for (let i = W - 1; i >= 0; i--) {
    let v = 0;
    if (i - wo >= 0) {
      v = src[i - wo] << bo;
      if (bo && i - wo - 1 >= 0) v |= src[i - wo - 1] >>> (32 - bo);
    }
    dst[i] = v >>> 0;
  }
}
const cur = new Uint32Array(W), a1 = new Uint32Array(W), a2 = new Uint32Array(W), nxt = new Uint32Array(W);
cur[0] = 1;
const col = new Uint8Array(T);
for (let t = 0; t < T; t++) {
  col[t] = (cur[t >>> 5] >>> (t & 31)) & 1;
  shl(cur, a1, 1); shl(cur, a2, 2);
  for (let i = 0; i < W; i++) nxt[i] = (a2[i] ^ (a1[i] | cur[i])) >>> 0;
  cur.set(nxt);
}

// validate against the known opening of A051023
const head = Array.from(col.slice(0, 24)).join("");
console.log(`== D0  engine check ==`);
console.log(`  centerColumn(0..23) = ${head}`);
console.log(`  expected (A051023)  = 110111001100010110010011   match: ${head === "110111001100010110010011"}`);

function longestPeriodicRun(seq, p) {
  // longest D such that seq[i] == seq[i+p] for i = N..N+D-p-1, over all N
  let best = 0, bestN = 0, run = 0, start = 0;
  for (let i = 0; i + p < seq.length; i++) {
    if (seq[i] === seq[i + p]) { if (run === 0) start = i; run++; if (run + p > best) { best = run + p; bestN = start; } }
    else run = 0;
  }
  return [best, bestN];
}

function smBits(seed) {
  const M = (1n << 64n) - 1n;
  let s = BigInt(seed) & M;
  let buf = 0n, have = 0;
  const g = () => {
    s = (s + 0x9e3779b97f4a7c15n) & M;
    let z = s;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & M;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & M;
    return z ^ (z >> 31n);
  };
  return () => { if (have === 0) { buf = g(); have = 64; } const b = Number(buf & 1n); buf >>= 1n; have--; return b; };
}
const coin = (seed) => { const f = smBits(seed); const a = new Uint8Array(T); for (let i = 0; i < T; i++) a[i] = f(); return a; };
const coins = [coin(11), coin(2222), coin(30303)];

console.log(`\n== D1  longest p-periodic run in the centre column below T = ${T} ==`);
console.log(`     (a run of length D from N certifies |alpha - q| < 2^-(N+D) and no more)`);
console.log(`  p    rule30 (run, start)      coin runs        log2(T)+p`);
for (const p of [1, 2, 3, 4, 5, 8, 12, 16, 24, 32, 48, 64]) {
  const [d, nn] = longestPeriodicRun(col, p);
  const cs = coins.map((c) => longestPeriodicRun(c, p)[0]);
  console.log(`  ${String(p).padStart(3)}  ${String(d).padStart(5)} at N=${String(nn).padStart(6)}      ${cs.map((x) => String(x).padStart(4)).join(" ")}      ${(Math.log2(T) + p).toFixed(1)}`);
}

console.log(`\n== D2  the approximation exponent: best (N+D)/(N+p) over all N, p<=64 ==`);
console.log(`     a Liouville-type gain needs this ratio to be large; 1 means no gain.`);
{
  const score = (seq) => {
    let best = 0, arg = "";
    for (let p = 1; p <= 64; p++) {
      let run = 0, start = 0;
      for (let i = 0; i + p < seq.length; i++) {
        if (seq[i] === seq[i + p]) {
          if (run === 0) start = i;
          run++;
          const D = run + p, N = start;
          const r = (N + D) / (N + p);
          if (r > best) { best = r; arg = `p=${p} N=${N} D=${D}`; }
        } else run = 0;
      }
    }
    return [best, arg];
  };
  const [b, a] = score(col);
  console.log(`  rule 30 : ${b.toFixed(4)}   at ${a}`);
  coins.forEach((c, i) => { const [bb, aa] = score(c); console.log(`  coin ${i + 1}  : ${bb.toFixed(4)}   at ${aa}`); });
  console.log(`  => the exponent is attained at tiny N, where it is arithmetically empty;`);
  console.log(`     the seed and the coin are the same object at this statistic.`);
}
