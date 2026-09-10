// The agreement front of the seed's packed row, and what advances it.
//
// Fix a shift p.  Let a(n) = least t with rowNat t = rowNat (t+p)  mod 2^(n+1).
// `rowNat_agree_forward` says each level's agreement set is upward closed, and
// `rowNat_return_succ_iff` says
//     t+1 in A(n+1)  <->  t in A(n) and (bit n of rowNat t is black or t in A(n+1)).
// So a(n+1) is at most 1 + (first t >= a(n) with bit n black) -- the "reset"
// cascade of crystal 62, measured there at 1.96k against a budget of 2k -- and
// is smaller exactly when the second disjunct fires first: the "early settling"
// crystal 62 asks a seeder to price.  This script separates the two.
//
//   node explorer/seeder_front.mjs

const LEVELS = 4000;
const P = 16; // the shift; 16 is the constant that closes leftDiagonal_onset_le_of_le_5000
const TMAX = LEVELS * 4 + 64;

// rows as BigInt, kept mod 2^(LEVELS+2) so the numbers stay bounded
const WIDTH = BigInt(LEVELS + 4);
const MOD = 1n << WIDTH;
const rows = [];
{
  let r = 1n;
  for (let t = 0; t <= TMAX + P + 8; t++) { rows.push(r); r = ((4n * r) ^ ((2n * r) | r)) % MOD; }
}
const agree = (t, n) => ((rows[t] ^ rows[t + P]) & ((1n << BigInt(n + 1)) - 1n)) === 0n;
const bit = (t, n) => ((rows[t] >> BigInt(n)) & 1n) === 1n;

let a = 0;
while (!agree(a, 0)) a++;
let resets = 0, earlies = 0, immediate = 0;
let maxGap = 0, sumGap = 0;
let cascade = a;      // the reset-only cascade C of crystal 62
let maxCascade = 0;
const earlySizes = [];
const whiteLevels = [];
for (let n = 0; n < LEVELS; n++) {
  // true next front
  let next = a;
  while (!agree(next, n + 1)) next++;
  // the reset-only prediction from the true front a
  let t = a;
  while (t < TMAX && !bit(t, n)) t++;
  const resetPred = t < TMAX ? t + 1 : Infinity; // Infinity: diagonal n is eventually white
  if (next < resetPred) { earlies++; if (resetPred < Infinity) earlySizes.push(resetPred - next); else whiteLevels.push(n); } else resets++;
  if (next === a) immediate++;
  const gap = next - a;
  sumGap += gap; if (gap > maxGap) maxGap = gap;
  a = next;
  // the pure cascade, never consulting the truth
  let c = cascade;
  while (c < TMAX && !bit(c, n)) c++;
  cascade = c < TMAX ? c + 1 : cascade; // undefined at a white level; hold it
  if (cascade - 2 * (n + 1) > maxCascade) maxCascade = cascade - 2 * (n + 1);
}
earlySizes.sort((x, y) => y - x);
console.log(`shift p = ${P}, levels = ${LEVELS}`);
console.log(`true front a(${LEVELS}) = ${a}   slope ${(a / LEVELS).toFixed(4)}   budget slope 2`);
console.log(`reset-only cascade      = ${cascade}   slope ${(cascade / LEVELS).toFixed(4)}`);
console.log(`advances: reset-driven ${resets}, early ${earlies} (${(100 * earlies / LEVELS).toFixed(1)}%), of which zero-cost ${immediate}`);
console.log(`gap a(n+1)-a(n): max ${maxGap}, mean ${(sumGap / LEVELS).toFixed(4)}`);
console.log(`early savings: total ${earlySizes.reduce((x, y) => x + y, 0)}, largest ${earlySizes.slice(0, 8).join(',')}`);
console.log(`cascade worst excess over 2(n+1): ${maxCascade}`);
console.log(`levels whose control diagonal is eventually white (no reset ever): ${whiteLevels.join(',')}`);

// Does the front ever need more than one step per level?  (a(n+1) = a(n) or a(n)+... )
let ge2 = 0;
