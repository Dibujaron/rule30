// Talus, 2026-09-12.  The rule-90 witness: closed form, the two recursions the
// Lean proof will actually use, and the aperiodicity evidence.
//
// WARNING TO THE NEXT READER.  Rule 90 is `left XOR right`, which is
// MIRROR-SYMMETRIC.  The project's standard guard against an orientation
// error -- "does the mirror rule pass the same check?" -- is worthless here,
// because rule 90's mirror IS rule 90.  So this file grows the picture TWO
// independent ways (a bit-packed row, and a plain Config-style array indexed
// by position) and compares them cell by cell; and the Lean file beside it
// (talus9_scratch_rule90.lean) has the kernel evaluate `ElementaryCA.step 90`
// itself against this table.
//
// Conventions match Rule30/Basic.lean: cell at position x of row t is bit
// (x + t) of the packed row; packed row 0 = 1.

const DEPTH = 200000;      // packed-row engine
const DEPTH_SLOW = 600;    // cell-by-cell cross-check
const HALF = DEPTH_SLOW + 4;

// ---------- engine 1: packed rows, rowStep90 r = (4r) XOR r ----------
function packed(depth) {
  let r = 1n;
  const col0 = new Uint8Array(depth + 1);
  const col1 = new Uint8Array(depth + 1);
  const col2 = new Uint8Array(depth + 1);
  for (let t = 0; t <= depth; t++) {
    col0[t] = Number((r >> BigInt(t)) & 1n);
    col1[t] = Number((r >> BigInt(t + 1)) & 1n);
    col2[t] = Number((r >> BigInt(t + 2)) & 1n);
    r = (4n * r) ^ r;
  }
  return { col0, col1, col2 };
}

// ---------- engine 2: cell by cell, from the lookup table of rule 90 ----------
// step r c i = testBit r (4*left + 2*centre + right), exactly Rule30/Basic.lean.
function ruleBit(rule, l, c, rr) {
  return (rule >> (4 * l + 2 * c + rr)) & 1;
}
function slow(depth, rule) {
  // row[j] is the cell at position j - HALF
  let row = new Uint8Array(2 * HALF + 1);
  row[HALF] = 1;
  const cols = { m1: [], c0: [], c1: [], c2: [] };
  const rows = [];
  for (let t = 0; t <= depth; t++) {
    cols.m1.push(row[HALF - 1]);
    cols.c0.push(row[HALF]);
    cols.c1.push(row[HALF + 1]);
    cols.c2.push(row[HALF + 2]);
    rows.push(row.slice());
    const next = new Uint8Array(2 * HALF + 1);
    for (let j = 1; j < 2 * HALF; j++) next[j] = ruleBit(rule, row[j - 1], row[j], row[j + 1]);
    row = next;
  }
  return { cols, rows };
}

const P = packed(DEPTH);
const S = slow(DEPTH_SLOW, 90);

console.log("=== 0. the two engines agree, and rule 90 IS `left xor right` ===");
let mism = 0;
for (let t = 0; t <= DEPTH_SLOW; t++) {
  if (P.col0[t] !== S.cols.c0[t]) mism++;
  if (P.col1[t] !== S.cols.c1[t]) mism++;
  if (P.col2[t] !== S.cols.c2[t]) mism++;
}
console.log(`  packed vs cell-by-cell, columns 0,1,2, t<=${DEPTH_SLOW}: ${mism} mismatches`);
// and the table really is left xor right
let tbl = 0;
for (let l = 0; l < 2; l++)
  for (let c = 0; c < 2; c++)
    for (let rr = 0; rr < 2; rr++) if (ruleBit(90, l, c, rr) !== (l ^ rr)) tbl++;
console.log(`  lookup table of 90 against (left xor right), all 8 neighbourhoods: ${tbl} mismatches`);

// the first 8 rows, printed, so a human can check the picture is Sierpinski
console.log("  first 7 rows (positions -6..6):");
for (let t = 0; t < 7; t++) {
  let s = "    ";
  for (let x = -6; x <= 6; x++) s += S.rows[t][HALF + x] ? "#" : ".";
  console.log(s + `   t=${t}`);
}

// ---------- 1. closed forms ----------
function isPow2(m) {
  return m > 0 && (m & (m - 1)) === 0;
}
console.log("");
console.log("=== 1. closed forms, depth " + DEPTH + " ===");
let bad0 = 0,
  first0 = -1;
for (let t = 0; t <= DEPTH; t++) {
  const want = t === 0 ? 1 : 0;
  if (P.col0[t] !== want) {
    bad0++;
    if (first0 < 0) first0 = t;
  }
}
console.log(`  centre column = decide(t = 0): ${bad0} mismatches` + (first0 >= 0 ? ` (first t=${first0})` : ""));

let bad1 = 0,
  first1 = -1;
for (let t = 0; t <= DEPTH; t++) {
  // "exists j >= 1 with t+1 = 2^j"  ==  t+1 is a power of two and t >= 1
  const want = isPow2(t + 1) && t >= 1 ? 1 : 0;
  if (P.col1[t] !== want) {
    bad1++;
    if (first1 < 0) first1 = t;
  }
}
console.log(`  column 1 = decide(exists j>=1, t+1 = 2^j): ${bad1} mismatches` + (first1 >= 0 ? ` (first t=${first1})` : ""));

// ---------- 2. the three lemmas the Lean proof uses ----------
console.log("");
console.log("=== 2. the identities the Lean proof will actually cite ===");

// (a) parity: cell is white whenever x + t is odd.  checked over the whole slow picture.
let badPar = 0;
for (let t = 0; t <= DEPTH_SLOW; t++)
  for (let x = -t; x <= t; x++)
    if (((x + t) & 1) === 1 && S.rows[t][HALF + x] !== 0) badPar++;
console.log(`  (a) E t x = false when x+t odd: ${badPar} violations over ${DEPTH_SLOW + 1} rows (whole cone)`);

// (b) two-step stride:  E(t+2) x = E t (x-2) xor E t (x+2)
let badTwo = 0;
for (let t = 0; t + 2 <= DEPTH_SLOW; t++)
  for (let x = -(t + 2) + 2; x <= t + 2 - 2; x++)
    if (S.rows[t + 2][HALF + x] !== (S.rows[t][HALF + x - 2] ^ S.rows[t][HALF + x + 2])) badTwo++;
console.log(`  (b) E(t+2) x = E t (x-2) xor E t (x+2): ${badTwo} violations`);

// (c) the scaling law:  E(2t)(2y) = E t y
let badScale = 0,
  scaleN = 0;
for (let t = 0; 2 * t <= DEPTH_SLOW; t++)
  for (let y = -t - 2; y <= t + 2; y++) {
    scaleN++;
    if (S.rows[2 * t][HALF + 2 * y] !== S.rows[t][HALF + y]) badScale++;
  }
console.log(`  (c) E(2t)(2y) = E t y: ${badScale} violations over ${scaleN} pairs`);

// (d) the column-1 recursion:  E(2s+1) 1 = (s==0) xor E s 1
let badRec = 0;
for (let s = 0; 2 * s + 1 <= DEPTH; s++) {
  const want = (s === 0 ? 1 : 0) ^ P.col1[s];
  if (P.col1[2 * s + 1] !== want) badRec++;
}
console.log(`  (d) E(2s+1) 1 = decide(s=0) xor (E s 1): ${badRec} violations to t=${DEPTH}`);

// ---------- 3. aperiodicity, and the shape of the gaps ----------
console.log("");
console.log("=== 3. column 1 is not eventually periodic ===");
const ones = [];
for (let t = 0; t <= DEPTH; t++) if (P.col1[t]) ones.push(t);
console.log(`  black times to ${DEPTH}: ${ones.join(", ")}`);
// direct falsification of every small (period, onset) pair, as a control on the argument
let survivors = 0;
const MAXP = 4096,
  ONSET = 20000;
for (let p = 1; p <= MAXP; p++) {
  let ok = true;
  for (let t = ONSET; t + p <= DEPTH; t++)
    if (P.col1[t + p] !== P.col1[t]) {
      ok = false;
      break;
    }
  if (ok) survivors++;
}
console.log(`  periods p<=${MAXP} holding from onset ${ONSET} to ${DEPTH}: ${survivors}`);

// ---------- 4. the DFA the machine runs, against the closed form ----------
// little-endian digits of n; state (sawDigit, allOnes); out = saw && ones.
function encodeNatLE(n) {
  const l = [];
  while (n > 0) {
    l.push(n & 1);
    n >>= 1;
  }
  return l; // [] for n = 0, and the last entry is always 1
}
console.log("");
console.log("=== 4. the two-bit automaton on little-endian digits ===");
let badDfa = 0,
  firstDfa = -1,
  badCanon = 0;
for (let n = 0; n <= DEPTH; n++) {
  const l = encodeNatLE(n);
  if (n >= 1 && l[l.length - 1] !== 1) badCanon++;
  let saw = 0,
    ones = 1;
  for (const b of l) {
    ones = ones & b;
    saw = 1;
  }
  const out = saw & ones;
  if (out !== P.col1[n]) {
    badDfa++;
    if (firstDfa < 0) firstDfa = n;
  }
}
console.log(`  out(fold) = column 1 of rule 90, n<=${DEPTH}: ${badDfa} mismatches` + (firstDfa >= 0 ? ` (first n=${firstDfa})` : ""));
console.log(`  encodeNat n ends in 1 for every n>=1 (canonicity): ${badCanon} violations`);

// ---------- 5. controls: does the same closed form hold for other rules? ----------
// If it did, the statement would be about "an elementary CA from one black cell"
// rather than about rule 90, and would prove nothing about rule 90 in particular.
console.log("");
console.log("=== 5. control: which of the 256 rules have this column 1? ===");
const matches = [];
for (let r = 0; r < 256; r++) {
  const sr = slow(120, r);
  let ok = true;
  for (let t = 0; t <= 120; t++) {
    const want = isPow2(t + 1) && t >= 1 ? 1 : 0;
    if (sr.cols.c1[t] !== want) {
      ok = false;
      break;
    }
  }
  if (ok) matches.push(r);
}
console.log(`  rules whose column 1 matches "t+1 a power of two, t>=1" to t=120: ${matches.join(", ")}`);
