// Parallax 12 / C'. The recurrence measurement, with the null repaired.
//
// C2's "coin" null returned L = 33 at every width. That was not a solver bug:
// the referee recovered the coefficients and verified them, 0 failures in 3632
// checks. xorshift32 is an F_2-LINEAR map on 32 bits, so its output bits satisfy
// a linear recurrence of order <= 32 by Cayley-Hamilton, and 33 is that. A
// generator that passes every statistical test is still useless as a null for a
// LINEARITY test. (My own notebook, 2026-09-07: "my pseudo-random sequences were
// random" -- same failure, different generator.)
//
// Repaired null: splitmix64 via BigInt multiplication, which is not F_2-linear,
// cross-checked against Math.random().
//
// And the real question C1 was groping at. At a FIXED bit position, the row
// sequence is a left diagonal, which is eventually periodic -- so it is
// trivially a linear recurrence sequence and Derksen's theorem applies with
// nothing to say. The measurement below asks whether the order L is anything
// other than that eventual periodicity restated.

const table = (rule) => { const t = []; for (let k = 0; k < 8; k++) t.push((rule >> k) & 1); return t; };
const apply = (tb, l, c, r) => tb[4 * l + 2 * c + r];
const bitsOf = (r, n) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = Number((r >> BigInt(i)) & 1n); return b; };
function stepBits(tb, b) {
  const n = b.length, o = new Uint8Array(n);
  for (let i = 0; i < n; i++) o[i] = apply(tb, i >= 2 ? b[i - 2] : 0, i >= 1 ? b[i - 1] : 0, b[i]);
  return o;
}

// splitmix64: the multiplications are not F_2-linear.
const M64 = (1n << 64n) - 1n;
function sm64(seed) {
  let s = BigInt(seed) & M64;
  return () => {
    s = (s + 0x9e3779b97f4a7c15n) & M64;
    let z = s;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & M64;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & M64;
    z = z ^ (z >> 31n);
    return z;
  };
}
function smBits(seed) {
  const g = sm64(seed);
  let buf = 0n, have = 0;
  return () => {
    if (have === 0) { buf = g(); have = 64; }
    const b = Number(buf & 1n); buf >>= 1n; have--;
    return b;
  };
}

function leastRecurrence(rows, n, Lmax, coords) {
  const m = rows.length;
  const cols = coords ?? [...Array(n).keys()];
  for (let L = 1; L <= Lmax; L++) {
    if (m - L < 2) break;
    const pivots = new Array(L).fill(null);
    let inconsistent = false;
    for (let t = 0; t + L < m && !inconsistent; t++) {
      for (const j of cols) {
        let eq = 0n;
        for (let i = 0; i < L; i++) if (rows[t + i][j]) eq ^= 1n << BigInt(i);
        if (rows[t + L][j]) eq ^= 1n << BigInt(L);
        for (let c = 0; c < L; c++) {
          if ((eq >> BigInt(c)) & 1n) {
            if (pivots[c] === null) { pivots[c] = eq; eq = 0n; break; }
            eq ^= pivots[c];
          }
        }
        if (eq === (1n << BigInt(L))) { inconsistent = true; break; }
      }
    }
    if (!inconsistent) return L;
  }
  return null;
}

// tail and period of the truncated orbit of 1
const stepBig = (r) => (4n * r) ^ ((2n * r) | r);
function tailPeriod(n) {
  const M = 1n << BigInt(n);
  const seen = new Map(); let r = 1n % M, t = 0;
  while (!seen.has(r)) { seen.set(r, t); r = stepBig(r) % M; t++; }
  const N = seen.get(r);
  return [N, t - N];
}

console.log("== C4  the repaired null: splitmix64 and Math.random, 260 rows ==");
for (const n of [16, 32, 64]) {
  const f = smBits(1234567 + n);
  const rows = [];
  for (let t = 0; t < 260; t++) { const x = new Uint8Array(n); for (let i = 0; i < n; i++) x[i] = f(); rows.push(x); }
  const rows2 = [];
  for (let t = 0; t < 260; t++) { const x = new Uint8Array(n); for (let i = 0; i < n; i++) x[i] = Math.random() < 0.5 ? 1 : 0; rows2.push(x); }
  console.log(`  n=${String(n).padStart(3)}  splitmix64 L = ${leastRecurrence(rows, n, 120) ?? "none <= 120"}` +
              `   Math.random L = ${leastRecurrence(rows2, n, 120) ?? "none <= 120"}`);
}
console.log("  (xorshift32 gave 33 at every width; that was the generator, not the data)");

console.log("\n== C5  rule 30's L against the tail and period of the truncated orbit ==");
for (const n of [8, 10, 12, 16, 20, 24, 28, 32, 40, 48]) {
  const tb = table(30);
  let b = bitsOf(1n, n);
  const rows = [];
  for (let t = 0; t < 400; t++) { rows.push(b.slice()); b = stepBits(tb, b); }
  const L = leastRecurrence(rows, n, 200);
  const [N, p] = tailPeriod(n);
  console.log(`  n=${String(n).padStart(3)}  L = ${String(L ?? "none").padStart(4)}   tail=${String(N).padStart(3)} period=${String(p).padStart(3)}  tail+period=${String(N + p).padStart(4)}  L<=tail+period: ${L !== null && L <= N + p}`);
}
console.log("  => L is the truncated orbit's own eventual periodicity. Any eventually");
console.log("     periodic sequence is a linear recurrence sequence; there is no content.");

console.log("\n== C6  the point of principle: at a FIXED bit index the row sequence IS");
console.log("        a left diagonal, hence eventually periodic (leftDiagonal_periodicFrom_pow)");
{
  // Read bit b of rowNat t for fixed b: that is leftDiagonal b at index t-b.
  let r = 1n;
  const cols = { 3: [], 7: [], 12: [] };
  const seq = [];
  for (let t = 0; t < 4000; t++) { seq.push(r); r = stepBig(r); }
  for (const b of [3, 7, 12]) {
    const s = seq.slice(b, 4000).map((v) => Number((v >> BigInt(b)) & 1n));
    let found = null;
    for (const p of [1, 2, 4, 8, 16, 32, 64]) {
      let ok = true;
      for (let i = 2000; i + p < s.length; i++) if (s[i] !== s[i + p]) { ok = false; break; }
      if (ok) { found = p; break; }
    }
    console.log(`  bit ${String(b).padStart(3)} of rowNat t: eventual period ${found ?? ">64"} (tested over the last 2000 rows)`);
  }
  console.log("  the centre column is bit t of rowNat t -- a MOVING index, one per step.");
  console.log("  Derksen's theorem is about the zero set of a FIXED coordinate. The centre");
  console.log("  column is not a coordinate of this sequence, so it is not in his language.");
}
