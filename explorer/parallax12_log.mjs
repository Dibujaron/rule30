// Parallax 12 / F. The one linear-form-in-logarithms object rule 30 has.
//
// Step 2 of Steiner's argument is archimedean: the cycle forces 2^s/3^r close
// to 1, i.e. |s log 2 - r log 3| small, and that is the linear form Baker then
// bounds. The orbit's SIZE is where the difficulty lives in the 3x+1 problem.
//
// Rule 30's row map has an exact height law, bitlen(r_t) = 2t+1, so write
//
//     log2(r_t) = 2t + theta_t,     theta_t in [0, 1),
//
// and theta_t is the whole archimedean content of the orbit -- the nearest
// thing here to the fractional part that Kopra's dictionary between rule 30 and
// the powers of a rational is about.
//
// Claim to test: theta_t, truncated to k bits of precision, is PURELY periodic
// in t, with period max(P_0..P_k) where P_j is the minimal period of right
// diagonal j. Reason: bit 2t-j of r_t is the cell at position t-j at time t,
// which is rightDiagonal j at index t-j, and the right diagonals are periodic
// from index 0 with no transient. If so, the archimedean size of rule 30's
// orbit is completely and explicitly known -- the exact opposite of the 3x+1
// case -- and it still says nothing, because it is a function of the top bits
// while the prize is about the middle bit.

const step = (r) => (4n * r) ^ ((2n * r) | r);

const T = 2000;
const rows = [];
{ let r = 1n; for (let t = 0; t < T; t++) { rows.push(r); r = step(r); } }

// top k+1 bits of r_t (t >= k), as an integer
function topBits(r, t, k) {
  const L = 2 * t + 1;            // bitlen
  return Number((r >> BigInt(L - 1 - k)) & ((1n << BigInt(k + 1)) - 1n));
}

function leastPeriod(seq, maxP) {
  for (let p = 1; p <= maxP; p++) {
    let ok = true;
    for (let i = 0; i + p < seq.length; i++) if (seq[i] !== seq[i + p]) { ok = false; break; }
    if (ok) return p;
  }
  return null;
}

// minimal periods of the right diagonals, read off the picture.
// rightDiagonal j i = evolve (i+j) i = bit (i + (i+j)) = bit (2i+j) of row i+j.
// (The first version of this read bit i of row i+j, which is position -j: a
// LEFT diagonal. It returned null periods and NaN maxima, which is how it was
// caught -- the main measurement in F2 was unaffected and already agreed with
// the board's published list.)
function rightDiagPeriods(kmax) {
  const P = [];
  for (let j = 0; j <= kmax; j++) {
    const s = [];
    for (let i = 0; 2 * i + j < 2 * (i + j) + 1 && i + j < T; i++)
      s.push(Number((rows[i + j] >> BigInt(2 * i + j)) & 1n));
    P.push(leastPeriod(s.slice(0, 600), 512));
  }
  return P;
}

console.log("== F1  minimal periods of the right diagonals (board obstruction 20 list) ==");
const P = rightDiagPeriods(15);
console.log(`  P_0..P_15 = ${P.join(", ")}`);
console.log(`  board publishes 1,2,2,4,8,8,16,32,32,64,64,64,64,64,64,128 -- match: ${P.slice(0, 16).join(",") === "1,2,2,4,8,8,16,32,32,64,64,64,64,64,64,128"}`);

console.log("\n== F2  is theta_t, to k bits, purely periodic in t? ==");
console.log("   k   least period of top k+1 bits   max(P_0..P_k)   equal");
for (let k = 0; k <= 14; k++) {
  const seq = [];
  for (let t = k; t < 800; t++) seq.push(topBits(rows[t], t, k));
  const p = leastPeriod(seq, 512);
  const m = Math.max(...P.slice(0, k + 1));
  console.log(`  ${String(k).padStart(3)}   ${String(p ?? ">512").padStart(10)}                    ${String(m).padStart(6)}        ${p === m}`);
}
console.log("  and the periodicity is from the FIRST index, no transient:");
{
  const k = 10, m = Math.max(...P.slice(0, k + 1));
  let bad = 0, n = 0;
  for (let t = k; t + m < 1500; t++) { n++; if (topBits(rows[t], t, k) !== topBits(rows[t + m], t + m, k)) bad++; }
  console.log(`  k=${k}, period ${m}: ${bad} failures of ${n} comparisons from t = ${k}`);
}

console.log("\n== F3  so theta_t takes finitely many values, explicitly ==");
{
  const k = 12;
  const vals = new Set();
  for (let t = k; t < 1500; t++) vals.add(topBits(rows[t], t, k));
  console.log(`  distinct top-13-bit patterns over t = 12..1499 : ${vals.size}`);
  console.log(`  (a coin would give min(2^12, 1488) = 1488; the count is the period)`);
  // theta_t = log2(r_t) - 2t.  The top k+1 bits are 1 followed by k bits, and
  // r_t = 2^(2t) * (1 + f) with f the fraction those k bits give, so
  // theta_t = log2(1 + f) in [0,1).
  const th = [];
  for (let t = k; t < k + 8; t++) {
    const f = topBits(rows[t], t, k) / 2 ** k - 1;
    th.push(Math.log2(1 + f).toFixed(6));
  }
  console.log(`  theta_t = log2(r_t) - 2t  for t = 12..19 : ${th.join(" ")}`);
  console.log(`  (all in [0,1) as they must be, since bitlen(r_t) = 2t+1)`);
}

console.log("\n== F4  does theta_t carry the centre column? ==");
{
  // The centre column is bit t of r_t: the MIDDLE bit. theta_t is the top bits.
  // Agreement rate between c(t) and the leading fractional bit of theta_t.
  let agree = 0, n = 0;
  for (let t = 20; t < 1500; t++) {
    const c = Number((rows[t] >> BigInt(t)) & 1n);
    const th1 = topBits(rows[t], t, 1) & 1; // second-most-significant bit
    n++; if (c === th1) agree++;
  }
  console.log(`  c(t) vs bit 1 of theta_t : agreement ${(agree / n).toFixed(4)} over ${n} rows (coin: 0.5)`);
  // and the decisive structural point
  console.log(`  theta_t is periodic to every precision; c is conjecturally not.`);
  console.log(`  So the archimedean size of the orbit is FULLY KNOWN and is not the`);
  console.log(`  prize. In the 3x+1 problem the size is the whole difficulty.`);
}
