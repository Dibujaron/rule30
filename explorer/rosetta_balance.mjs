// Rosetta, 2026-09-12. Exact balance along the right diagonals, against a null.
//
// In rosetta_orbit.mjs, 14 of the 25 right diagonals k <= 24 had weight exactly
// P_k/2 over one minimal period. Some of those are forced: a word antiperiodic
// at P/2 (shift by P/2 complements it) is exactly balanced, and this board
// proves antiperiodicity at every period doubling. But four depths -- 8, 10, 17,
// 18 -- were balanced WITHOUT being antiperiodic, and for a word of period 256 a
// coin gives exact balance with probability ~ 5%. So: is the excess real?
//
// Two nulls, because the right null is not obvious:
//   N1  a uniform random word of length P (the naive null)
//   N2  the running XOR of a uniform random driver of length P with even weight
//       -- which is the actual shape of rightDiagonal_recurrence,
//       R_k(j+1) = R_k(j) XOR g_k(j), so R_k is a running XOR and its weight is
//       not a free parameter.

const DEPTH = 30, ROWS = 9000;
const diag = Array.from({ length: DEPTH + 1 }, () => []);
{
  let r = 1n;
  for (let t = 0; t <= ROWS; t++) {
    for (let k = 0; k <= DEPTH && k <= t; k++) diag[k].push(Number((r >> BigInt(2 * (t - k) + k)) & 1n));
    r = (4n * r) ^ ((2n * r) | r);
  }
}

function minimalPeriod(d) {
  let P = 1;
  for (;;) {
    let ok = true;
    for (let j = 0; j + P < d.length && ok; j++) if (d[j] !== d[j + P]) ok = false;
    if (ok) return P;
    if (P > d.length / 4) return -1;          // not established within the window
    P *= 2;                                   // periods are powers of two
  }
}

console.log('  k    P_k   weight   bal  anti   null P(exact balance)   driver weight over P');
let obs = 0, nAnti = 0, nFree = 0, expFree1 = 0;
const freeRows = [];
for (let k = 0; k <= DEPTH; k++) {
  const d = diag[k], P = minimalPeriod(d);
  if (P < 0) { console.log(`  ${String(k).padStart(2)}    period not established in ${d.length} terms`); continue; }
  let w = 0; for (let j = 0; j < P; j++) w += d[j];
  let anti = P > 1;
  if (anti) for (let j = 0; j < P / 2; j++) if (d[j] === d[j + P / 2]) { anti = false; break; }
  const bal = 2 * w === P;
  // exact binomial probability C(P, P/2) / 2^P, in logs
  let lp = -P * Math.LN2;
  for (let i = 1; i <= P; i++) lp += Math.log(i);
  for (let i = 1; i <= P / 2; i++) lp -= 2 * Math.log(i);
  const pNull = P % 2 === 0 ? Math.exp(lp) : 0;
  // the driver g_k(j) = R_k(j) XOR R_k(j+1)
  let gw = 0; for (let j = 0; j < P; j++) gw += d[j] ^ d[(j + 1) % P];
  console.log(`  ${String(k).padStart(2)}  ${String(P).padStart(5)}  ${String(w).padStart(7)}   ${bal ? 'Y' : '.'}    ${anti ? 'Y' : '.'}   ${pNull.toExponential(3).padStart(20)}   ${gw}`);
  if (bal) obs++;
  if (anti) nAnti++; else { nFree++; expFree1 += pNull; freeRows.push({ k, P, w, bal }); }
}
console.log(`\n  observed exactly balanced: ${obs}`);
console.log(`  forced by antiperiodicity: ${nAnti}`);
console.log(`  NOT antiperiodic: ${nFree}, of which balanced: ${freeRows.filter((r) => r.bal).length}`);
console.log(`  null N1 (uniform word) expects ${expFree1.toFixed(3)} balanced among those ${nFree}`);

// ---- null N2: running XOR of a random even-weight driver -----------------
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
console.log('\n  null N2: R(j+1) = R(j) XOR g(j), g uniform of even weight, 200000 draws each');
console.log('   P     P(exact balance)   [N1 for comparison]');
for (const P of [32, 64, 128, 256, 512, 1024]) {
  const rnd = mulberry(12345 + P);
  let hits = 0, trials = 200000;
  const g = new Uint8Array(P), R = new Uint8Array(P);
  for (let s = 0; s < trials; s++) {
    let gw = 0;
    do { gw = 0; for (let j = 0; j < P; j++) { g[j] = rnd() < 0.5 ? 1 : 0; gw += g[j]; } } while (gw % 2 !== 0);
    R[0] = rnd() < 0.5 ? 1 : 0;
    let w = R[0];
    for (let j = 0; j + 1 < P; j++) { R[j + 1] = R[j] ^ g[j]; w += R[j + 1]; }
    if (2 * w === P) hits++;
  }
  let lp = -P * Math.LN2;
  for (let i = 1; i <= P; i++) lp += Math.log(i);
  for (let i = 1; i <= P / 2; i++) lp -= 2 * Math.log(i);
  console.log(`   ${String(P).padStart(4)}   ${(hits / trials).toFixed(6)}          ${Math.exp(lp).toFixed(6)}`);
}
