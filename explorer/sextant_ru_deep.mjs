/**
 * Sextant (theorist, 2026-09-08): the same claim as test A of
 * sextant_rightunbounded.mjs, one order of magnitude deeper.
 *
 *   node explorer/sextant_ru_deep.mjs
 *
 * tau(p) = the first t with evolve (t+p) p != evolve t 0;
 * m(p)   = the distance from the right edge of row p to the next black cell.
 * The claim is tau = m, for every p.
 *
 * The window is 128 depths, which is enough only if no tau and no m in range
 * exceeds 127; the run asserts that rather than assuming it. It also prints
 * m(2^a) for a <= 24, to compare against the 41 values of Rowland's a(n)
 * printed at line 128 of rowland-2006-local-nested-structure.txt — four of
 * them (a = 21..24) beyond what the shallower run could reach.
 */

const t0 = Date.now();
const WORDS = 4, WBITS = 128;
const P = 1 << 24;
const NROW = P + WBITS + 4;
const pic = new Uint32Array(NROW * WORDS);
{
  const cur = new Uint32Array(WORDS), s1 = new Uint32Array(WORDS), s2 = new Uint32Array(WORDS);
  cur[0] = 1;
  for (let t = 0; t < NROW; t++) {
    const base = t * WORDS;
    for (let w = 0; w < WORDS; w++) pic[base + w] = cur[w];
    for (let w = WORDS - 1; w >= 0; w--) {
      s1[w] = ((cur[w] << 1) | (w > 0 ? cur[w - 1] >>> 31 : 0)) >>> 0;
      s2[w] = ((cur[w] << 2) | (w > 0 ? cur[w - 1] >>> 30 : 0)) >>> 0;
    }
    for (let w = 0; w < WORDS; w++) cur[w] = (cur[w] ^ (s1[w] | s2[w])) >>> 0;
  }
}
const bit = (t, d) => (pic[t * WORDS + (d >>> 5)] >>> (d & 31)) & 1;
console.log(`picture: ${NROW} rows x ${WBITS} depths (${((Date.now() - t0) / 1000).toFixed(1)} s)`);

let mismatch = 0, capped = 0, maxTau = 0, argMax = 0;
for (let p = 1; p <= P; p++) {
  let tau = -1;
  for (let t = 0; t < WBITS; t++) if (bit(t + p, t) !== bit(t, t)) { tau = t; break; }
  let m = -1;
  for (let d = 1; d < WBITS; d++) if (bit(p, d)) { m = d; break; }
  if (tau < 0 || m < 0) { capped++; continue; }
  if (tau !== m) mismatch++;
  if (tau > maxTau) { maxTau = tau; argMax = p; }
}
console.log(`p = 1..${P} (${P.toExponential(2)}): tau != m at ${mismatch}; hit the ${WBITS}-depth cap ${capped} times`);
console.log(`max tau = ${maxTau} at p = ${argMax}`);

const rowland = [1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29, 34, 36, 37, 39, 41, 43, 48, 49, 51, 54, 55, 58, 60];
const mine = [];
for (let a = 0; a <= 24; a++) {
  const p = a === 0 ? 1 : 2 ** a;
  let m = -1;
  for (let d = 1; d < WBITS; d++) if (bit(p, d)) { m = d; break; }
  mine.push(m);
}
console.log(`m(2^a), a = 0..24: ${mine.join(',')}`);
console.log(`Rowland a(0..24):   ${rowland.join(',')}`);
console.log(`agree on all 25 terms: ${mine.every((v, i) => v === rowland[i])}`);
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
