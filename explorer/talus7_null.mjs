/**
 * Talus, 2026-09-10. A null for the one statistic of the centre column's
 * excess that did not look like a coin.
 *
 * Over 10^7 terms the excess E(N) = 2*count(N) - N changes sign 170 times, is
 * never below -257, and is strictly positive from N = 195,112 on. One coin
 * draw gave 1220 sign changes, a minimum of -729, and last non-positive at
 * 1,092,532. One draw is not a null: the three statistics above are strongly
 * dependent (they are all the arcsine law seen from different sides), and the
 * number of sign changes of a simple walk is itself of order sqrt(N) with a
 * heavy-tailed distribution. So run 40 draws and report where rule 30 sits.
 */

const N = 10_000_000;
const DRAWS = 40;

function xs(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x; };
}

function stats(next) {
  let E = 0, minE = 0, maxE = 0, sign = 0, changes = 0, lastNonPos = 0;
  for (let i = 0; i < N; i += 32) {
    let w = next();
    const lim = Math.min(32, N - i);
    for (let j = 0; j < lim; j++) {
      E += (w & 1) ? 1 : -1;
      w >>>= 1;
      if (E < minE) minE = E;
      if (E > maxE) maxE = E;
      if (E <= 0) lastNonPos = i + j + 1;
      const s = Math.sign(E);
      if (s !== 0 && sign !== 0 && s !== sign) changes++;
      if (s !== 0) sign = s;
    }
  }
  return { E, minE, maxE, changes, lastNonPos };
}

const RULE30 = { changes: 170, minE: -257, maxE: 4605, lastNonPos: 195112 };
console.log(`rule 30 at N=${N}: signChanges=${RULE30.changes} minE=${RULE30.minE} ` +
  `maxE=${RULE30.maxE} lastNonPos=${RULE30.lastNonPos} (frac ${(RULE30.lastNonPos / N).toFixed(4)})`);
console.log(`\n${DRAWS} fair-coin draws:`);

let beChanges = 0, beMin = 0, beLast = 0;
const chs = [], mins = [], lasts = [];
for (let d = 0; d < DRAWS; d++) {
  const g = xs(0x1000001 + d * 2654435761);
  const s = stats(g);
  chs.push(s.changes); mins.push(s.minE); lasts.push(s.lastNonPos);
  if (s.changes <= RULE30.changes) beChanges++;
  if (s.minE >= RULE30.minE) beMin++;
  if (s.lastNonPos <= RULE30.lastNonPos) beLast++;
}
chs.sort((a, b) => a - b); mins.sort((a, b) => a - b); lasts.sort((a, b) => a - b);
const q = (a, p) => a[Math.floor(p * (a.length - 1))];
console.log(`  signChanges : min ${chs[0]} q25 ${q(chs, 0.25)} median ${q(chs, 0.5)} q75 ${q(chs, 0.75)} max ${chs[chs.length - 1]}`);
console.log(`  minE        : min ${mins[0]} q25 ${q(mins, 0.25)} median ${q(mins, 0.5)} q75 ${q(mins, 0.75)} max ${mins[mins.length - 1]}`);
console.log(`  lastNonPos  : min ${lasts[0]} median ${q(lasts, 0.5)} max ${lasts[lasts.length - 1]}`);
console.log(`\n  draws at least as extreme as rule 30:`);
console.log(`    signChanges <= 170        : ${beChanges} of ${DRAWS}`);
console.log(`    minE        >= -257       : ${beMin} of ${DRAWS}`);
console.log(`    lastNonPos  <= 195112     : ${beLast} of ${DRAWS}`);
