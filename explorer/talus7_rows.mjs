/**
 * Talus, 2026-09-10. The other marginal: the ROW count, where rule 30 does
 * constrain a density and the argument is two lines.
 *
 * Write b(t) for the number of black cells in row t, rho(t) for the number of
 * its maximal black runs, and G2(t) for the number of interior white gaps of
 * length at least 2.
 *
 * (a) THE EXACT IDENTITY.  A cell is black next step exactly at a run
 *     boundary (centerColumn_run_boundary / rule30_run_boundary), and inside
 *     the cone the three boundary types are: the leftmost cell of a black run
 *     (rho of them), the cell just right of a run that is followed by two
 *     whites, and the cell just left of a run that is preceded by two whites.
 *     Counting them, with the two infinite outside gaps included:
 *
 *         b(t+1) = rho(t) + 2*G2(t) + 2.
 *
 * (b) THE DENSITY BOUND.  Rule 30 is  l XOR (c OR r), so a black output at i
 *     needs NOT (cell(i-1) AND cell(i)) -- the forbidden block, crystal 8.
 *     There are b - rho adjacent black pairs in row t, each killing one cell
 *     of row t+1, and row t+1 is 2t+3 wide, so
 *         b(t+1) <= 2t + 3 - (b(t) - rho(t)).
 *     Maximal black runs are separated by at least one white, so
 *     rho(t) <= (2t + 1 - b(t)) + 1, and therefore
 *
 *         b(t+1) + 2*b(t) <= 4t + 5,
 *
 *     which forces limsup b(t)/(2t+1) <= 2/3. That is strictly better than the
 *     cone bound b(t) <= 2t+1, which crystals 29 says is all that is provable.
 *
 * Both are checked here at every row below N, and the row excess
 * Erow(t) = 2*b(t) - (2t+1) is measured beside sqrt(t), because if the ROW
 * marginal were better behaved than the column marginal that would be the
 * place to attack P2 from.
 */

const N = 300_000;

const WORDS = ((2 * N + 96) >> 5) + 2;
const r = new Uint32Array(WORDS);
r[0] = 1;

function popcount(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

let prevB = 0, prevRho = 0, prevG2 = 0, prevT = -1;
let idFail = 0, idFirst = -1;
let boundFail = 0, boundFirst = -1, tightest = Infinity, tightestAt = 0;
let maxDens = 0, maxDensAt = 0;
let maxErow = 0, maxErowAt = 0, maxErowNorm = 0;
const sample = [];
const triSample = [];
let S = 0, TRI = 0;

for (let t = 0; t < N; t++) {
  const words = Math.min(WORDS - 1, ((2 * t) >> 5) + 1);
  // b, rho, G2 for row t, over bit positions 0..2t (cell x = bit x+t)
  let b = 0;
  for (let m = 0; m <= words; m++) b += popcount(r[m]);
  let rho = 0, g2 = 0;
  {
    let prevBit = 0, gap = 0, started = false;
    for (let i = 0; i <= 2 * t; i++) {
      const bit = (r[i >> 5] >>> (i & 31)) & 1;
      if (bit === 1) {
        if (prevBit === 0) {
          rho++;
          if (started && gap >= 2) g2++;
          started = true;
        }
        gap = 0;
      } else gap++;
      prevBit = bit;
    }
  }
  // (a) identity, comparing row t-1's structure with row t's count
  if (t >= 1 && prevT === t - 1) {
    const pred = prevRho + 2 * prevG2 + 2;
    if (pred !== b) { idFail++; if (idFirst < 0) idFirst = t; }
    // (b) the inequality, in the form b(t) + 2 b(t-1) <= 4(t-1) + 5
    const lhs = b + 2 * prevB;
    const rhs = 4 * (t - 1) + 5;
    if (lhs > rhs) { boundFail++; if (boundFirst < 0) boundFirst = t; }
    if (rhs - lhs < tightest) { tightest = rhs - lhs; tightestAt = t; }
  }
  const dens = b / (2 * t + 1);
  if (dens > maxDens && t > 10) { maxDens = dens; maxDensAt = t; }
  const Erow = 2 * b - (2 * t + 1);
  if (Math.abs(Erow) > maxErow) { maxErow = Math.abs(Erow); maxErowAt = t; maxErowNorm = Erow / Math.sqrt(t + 1); }
  if (t === 10 || t === 100 || t === 1000 || t === 10000 || t === 100000 || t === N - 1) {
    sample.push(`t=${t} b=${b} dens=${dens.toFixed(5)} Erow=${Erow} Erow/sqrt(t)=${(Erow / Math.sqrt(t + 1)).toFixed(3)}`);
  }
  S += b;
  TRI += 2 * t + 1;
  if (t === 10 || t === 1000 || t === 100000 || t === N - 1) {
    triSample.push(`T=${t + 1}: blacks/cells = ${(S / TRI).toFixed(5)} (bound 2/3 + O(1/T))`);
  }
  prevB = b; prevRho = rho; prevG2 = g2; prevT = t;

  const limit = Math.min(WORDS - 1, (t >> 4) + 1);
  let prev = 0;
  for (let m = 0; m <= limit; m++) {
    const cur = r[m];
    const s2 = ((cur << 2) | (prev >>> 30)) >>> 0;
    const s1 = ((cur << 1) | (prev >>> 31)) >>> 0;
    r[m] = (s2 ^ (s1 | cur)) >>> 0;
    prev = cur;
  }
}

console.log(`rows 0..${N - 1}`);
console.log(`(a) b(t+1) = rho(t) + 2*G2(t) + 2 : ${idFail} failures` +
  `${idFirst >= 0 ? ` (first at t=${idFirst})` : ''}`);
console.log(`(b) b(t+1) + 2*b(t) <= 4t+5      : ${boundFail} failures` +
  `${boundFirst >= 0 ? ` (first at t=${boundFirst})` : ''}; tightest slack ${tightest} at t=${tightestAt}`);
console.log(`    largest row density seen (t>10): ${maxDens.toFixed(5)} at t=${maxDensAt}; the bound allows 0.66667`);
console.log(`    largest |Erow|: ${maxErow} at t=${maxErowAt} (Erow/sqrt(t) = ${maxErowNorm.toFixed(3)})`);
for (const s of sample) console.log(`    ${s}`);
console.log(`    triangle density (the unconditional consequence, S(T)/T^2 <= 2/3 + O(1/T)):`);
for (const s of triSample) console.log(`      ${s}`);
