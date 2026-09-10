// Two provable step rules for the packed-row agreement front, and the ladder
// they generate.  Crystal 62 refutes the reset-only ladder (slope 1.96 against
// a budget of 2, and C_119 = 237 > 236).  This adds the second rule.
//
// Write r = rowNat T, s = rowNat (T+p), and suppose r = s mod 2^(n+1)
// (bits 0..n agree -- the front is at level n).  Then bit b of the next row is
//   bit(b-2) XOR (bit(b-1) OR bit b),
// so:
//   RESET   bit n of r black                        => bits 0..n+1 agree at T+1
//   DOUBLE  bit n black AND bit (n+1) of BOTH black => bits 0..n+2 agree at T+1
// The second holds because the two ORs are then both `true`, so bit n+2 of the
// successor inherits from bit n, which already agreed.
//
// The ladder never consults the truth: it moves the front by the rules alone.
//
//   node explorer/seeder_ladder.mjs

const LEVELS = 5000;
const P = 16;
const TMAX = LEVELS * 3 + 128;

const WIDTH = BigInt(LEVELS + 8);
const MOD = 1n << WIDTH;
const rows = [];
{
  let r = 1n;
  for (let t = 0; t <= TMAX + P + 8; t++) { rows.push(r); r = ((4n * r) ^ ((2n * r) | r)) % MOD; }
}
const bit = (t, n) => ((rows[t] >> BigInt(n)) & 1n) === 1n;
const agree = (t, n) => ((rows[t] ^ rows[t + P]) & ((1n << BigInt(n + 1)) - 1n)) === 0n;

// sanity: the two rules really are sound against the truth
let checked = 0, violations = 0;
for (let T = 20; T < 3000; T++) {
  for (let n = 0; n < 40; n++) {
    if (!agree(T, n)) continue;
    if (bit(T, n)) {
      checked++;
      if (!agree(T + 1, n + 1)) violations++;
      if (bit(T, n + 1) && ((rows[T + P] >> BigInt(n + 1)) & 1n) === 1n) {
        checked++;
        if (!agree(T + 1, n + 2)) violations++;
      }
    }
  }
}
console.log(`rule soundness: ${checked} instances, ${violations} violations`);

// the ladder
let t = 0, n = 0;
while (!agree(t, 0)) t++;
let doubles = 0, singles = 0, stalls = 0, stalled = [];
const trace = [];
while (n < LEVELS) {
  // wait for the reset
  let u = t;
  while (u < t + 4000 && !bit(u, n)) u++;
  if (u >= t + 4000) {
    // level n's control diagonal is eventually white: crystal 45's white branch,
    // onset moves one index and the period doubles.  Counted, not free.
    stalls++; stalled.push(n); t = t + 1; n = n + 1;
    if (n <= LEVELS) trace.push([n, t]);
    continue;
  }
  const both = bit(u, n + 1) && ((rows[u + P] >> BigInt(n + 1)) & 1n) === 1n;
  t = u + 1;
  n += both ? 2 : 1;
  if (both) doubles++; else singles++;
  if (n <= LEVELS) trace.push([n, t]);
}
console.log(`ladder: reached level ${n} at time ${t}  -> slope ${(t / n).toFixed(4)} (budget 2)`);
console.log(`  double steps ${doubles}, single steps ${singles}, stalled at ${stalled.join(',') || 'never'}`);
let worst = 0, worstN = 0;
for (const [nn, tt] of trace) { if (tt - 2 * nn > worst) { worst = tt - 2 * nn; worstN = nn; } }
console.log(`  worst excess of time over 2*level: ${worst} at level ${worstN}`);
let ratio = 0, ratioN = 0;
for (const [nn, tt] of trace) { if (nn > 4 && tt / nn > ratio) { ratio = tt / nn; ratioN = nn; } }
console.log(`  worst ratio time/level: ${ratio.toFixed(4)} at level ${ratioN}`);
