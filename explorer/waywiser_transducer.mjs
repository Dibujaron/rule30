/**
 * One step of rule 30 is a four-state transducer; the picture is its orbit.
 *
 *   node explorer/waywiser_transducer.mjs
 *
 * The row map is rowStep r = (4r) XOR ((2r) OR r), so bit i of the output is
 * r_{i-2} XOR (r_{i-1} OR r_i): a sliding window that needs the two previously
 * read bits and the current one. Read least-significant-bit first, that is a
 * Mealy machine with four states (the pair of bits already read) and one output
 * bit per input bit. This script builds that machine from its state table alone
 * and checks it against rowStep on the seed's orbit and on random inputs.
 *
 * Why it matters for the Walnut vantage: a transducer is exactly the kind of
 * object the automata-theoretic decision procedures accept as input. What they
 * do NOT accept is an ORBIT of one. The distance between "the step is regular"
 * and "the picture is regular" is the whole problem, and this script is the
 * cheapest possible statement of where the line falls.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

// State = (b1, b2) = (the bit two places below the current one, the bit one
// place below), both 0 before the row starts. Output at position i is
// b1 XOR (b2 OR r_i); the new state is (b2, r_i).
function transduce(rBits) {
  let b1 = 0, b2 = 0;
  const out = [];
  // two extra zero bits at the top, because 4r is two bits wider than r
  for (const bit of rBits.concat([0, 0])) {
    out.push(b1 ^ (b2 | bit));
    b1 = b2; b2 = bit;
  }
  return out;
}

const toBits = (n) => { const b = []; let x = n; while (x > 0n) { b.push(Number(x & 1n)); x >>= 1n; } return b; };
const fromBits = (b) => { let x = 0n; for (let i = b.length - 1; i >= 0; i--) x = (x << 1n) | BigInt(b[i]); return x; };
const rowStep = (r) => (4n * r) ^ ((2n * r) | r);

let bad = 0;
let r = 1n;
for (let t = 0; t < 400; t++) {
  if (fromBits(transduce(toBits(r))) !== rowStep(r)) bad++;
  r = rowStep(r);
}
console.log(`4-state Mealy machine against rowStep on the seed's first 400 rows: ${bad} mismatches`);

let bad2 = 0;
let x = 123456789n;
for (let i = 0; i < 2000; i++) {
  x = (x * 6364136223846793005n + 1442695040888963407n) & ((1n << 200n) - 1n);
  if (fromBits(transduce(toBits(x))) !== rowStep(x)) bad2++;
}
console.log(`same, on 2000 random 200-bit rows: ${bad2} mismatches`);
console.log('state table (state -> on input 0 / on input 1, as output|newstate):');
for (const [b1, b2] of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
  const o0 = b1 ^ (b2 | 0), o1 = b1 ^ (b2 | 1);
  console.log(`  (${b1},${b2})  0: out ${o0} -> (${b2},0)    1: out ${o1} -> (${b2},1)`);
}
console.log('\nSo the one-step relation { (r, rowStep r) } is a 2-recognizable relation on N^2,');
console.log('and the t-step relation is its t-fold composition, which is 2-recognizable for each');
console.log('FIXED t. What is not available is the relation { (t, rowNat t) }, which is the orbit.');
