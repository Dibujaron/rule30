// Pantograph, 2026-09-11.  Two checks for the P3-sayability sighting.
//
// A. The positive control the model needs: an elementary CA, same single-cell
//    seed, whose column is NOT eventually periodic and whose n-th bit is
//    computable in O(log n) time.  Rule 90, column 1.  If this holds, then no
//    argument that uses only "elementary CA grown from one black cell" can
//    prove P3, and P1-style aperiodicity does not imply P3-style hardness.
//
// B. A falsification attempt on the POINTWISE form of P3 (Prize.lean's
//    `IsAtLeastLinear`, which asks `n <= k * cost n` for EVERY large n).  That
//    form dies if the centre column has any infinite easily-computable
//    subsequence.  Look for the simplest kind: an arithmetic progression, or
//    the powers of two, on which the centre column is constant.
//
// Bit convention is Rule30/Basic.lean's: cell at position x of row t is bit
// (x + t) of rowNat t;  rowNat 0 = 1.

const DEPTH_90 = 20000;
const DEPTH_30 = 1 << 16; // 65536

// ---------- A. rule 90 ----------
// rowStep_90 r = (4r) XOR r   -- left neighbour XOR right neighbour.
function rule90Columns(depth) {
  let r = 1n;
  const col0 = [];
  const col1 = [];
  for (let t = 0; t <= depth; t++) {
    col0.push(Number((r >> BigInt(t)) & 1n));
    col1.push(Number((r >> BigInt(t + 1)) & 1n));
    r = (4n * r) ^ r;
  }
  return { col0, col1 };
}

// Closed form claimed for rule 90 column 1: 1 exactly when t = 2^j - 1.
function isPowerOfTwo(m) {
  return m > 0 && (m & (m - 1)) === 0;
}
function col1ClosedForm(t) {
  return isPowerOfTwo(t + 1) ? 1 : 0;
}

const { col0, col1 } = rule90Columns(DEPTH_90);

let bad0 = 0;
for (let t = 1; t <= DEPTH_90; t++) if (col0[t] !== 0) bad0++;
let bad1 = 0;
let firstBad1 = -1;
for (let t = 0; t <= DEPTH_90; t++) {
  if (col1[t] !== col1ClosedForm(t)) {
    bad1++;
    if (firstBad1 < 0) firstBad1 = t;
  }
}
const ones1 = [];
for (let t = 0; t <= DEPTH_90; t++) if (col1[t] === 1) ones1.push(t);

console.log("=== A. rule 90, single black cell ===");
console.log(`centre column (col 0): first 12 = ${col0.slice(0, 12).join("")}`);
console.log(`  nonzero entries after t=0, to t=${DEPTH_90}: ${bad0}`);
console.log(`column 1: first 20 = ${col1.slice(0, 20).join("")}`);
console.log(`  black at t = ${ones1.slice(0, 12).join(", ")}, ...  (count ${ones1.length})`);
console.log(
  `  closed form "t+1 is a power of two": mismatches to t=${DEPTH_90}: ${bad1}` +
    (firstBad1 >= 0 ? ` (first at t=${firstBad1})` : "")
);
// aperiodicity of column 1: gaps between successive black times double, so no
// period can survive.  Report the gaps as the evidence.
const gaps = [];
for (let i = 1; i < Math.min(ones1.length, 12); i++) gaps.push(ones1[i] - ones1[i - 1]);
console.log(`  gaps between black times: ${gaps.join(", ")} -- unbounded, so not eventually periodic`);

// ---------- B. rule 30 ----------
// rowStep r = (4r) XOR ((2r) OR r)
function rule30Centre(depth) {
  let r = 1n;
  const c = new Uint8Array(depth + 1);
  for (let t = 0; t <= depth; t++) {
    c[t] = Number((r >> BigInt(t)) & 1n);
    r = (4n * r) ^ ((2n * r) | r);
  }
  return c;
}

const c30 = rule30Centre(DEPTH_30);
console.log("");
console.log("=== B. rule 30 centre column: hunting an easy infinite subsequence ===");
console.log(`depth ${DEPTH_30}; first 24 = ${Array.from(c30.slice(0, 24)).join("")}`);

// B1: powers of two
const pow2 = [];
for (let k = 0; (1 << k) <= DEPTH_30; k++) pow2.push(c30[1 << k]);
console.log(`c(2^k) for k=0..${pow2.length - 1}: ${pow2.join("")}`);

// B2: arithmetic progressions n = r mod m, m <= 64, constant on the tail?
let constantClasses = 0;
let examples = [];
for (let m = 1; m <= 64; m++) {
  for (let rr = 0; rr < m; rr++) {
    let first = -1,
      constant = true,
      count = 0;
    for (let n = rr; n <= DEPTH_30; n += m) {
      if (n < 64) continue; // allow a finite prefix of mess
      if (first < 0) first = c30[n];
      else if (c30[n] !== first) {
        constant = false;
        break;
      }
      count++;
    }
    if (constant && count > 8) {
      constantClasses++;
      if (examples.length < 5) examples.push(`${rr} mod ${m}`);
    }
  }
}
console.log(
  `arithmetic progressions (m <= 64) on which the tail is constant: ${constantClasses}` +
    (examples.length ? ` (${examples.join("; ")})` : "")
);

// B3: how balanced is each class?  worst deviation from 1/2, as a sanity read.
let worst = { m: 0, r: 0, dev: 0, n: 0 };
for (let m = 2; m <= 64; m++) {
  for (let rr = 0; rr < m; rr++) {
    let ones = 0,
      tot = 0;
    for (let n = rr; n <= DEPTH_30; n += m) {
      ones += c30[n];
      tot++;
    }
    const dev = Math.abs(ones / tot - 0.5);
    if (dev > worst.dev) worst = { m, r: rr, dev, n: tot };
  }
}
console.log(
  `worst class imbalance: ${worst.r} mod ${worst.m}, density ${(0.5 + worst.dev).toFixed(4)} over ${worst.n} terms ` +
    `(a fair coin over ${worst.n} terms has sd ${(0.5 / Math.sqrt(worst.n)).toFixed(4)})`
);
