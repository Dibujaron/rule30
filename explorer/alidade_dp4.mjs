/**
 * A fourth control for the background-only ceiling: does an ARBITRARY rule 30
 * picture, used as the background, also hold the DP below 1/2?
 *
 *   node explorer/alidade_dp4.mjs
 *
 * explorer/alidade_dp3.mjs shows the ceiling is 0.4534 on the settled words,
 * 0.4515 on pseudo-random bits and 0.4503 on the settled words with randomised
 * phases -- so it is a property of the two laws plus a half-dense background
 * rather than of rule 30's own words. This script asks the remaining question a
 * theorist would ask: the settled picture is itself a rule 30 evolution
 * (crystal 47), so is the bound a property of rule 30 pictures in general? The
 * background here is the evolution of a random ring under rule 30, read as
 * cell(t, x). If the answer is the same 0.45, the property a proof must use is
 * not special to the settled words, and that is the cheapest possible route.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const N = 1 << 13;            // ring size
const ROWS = 400000;
const WIN = 256;

const MASK = (1n << BigInt(N)) - 1n;
function step30(x) {
  const l = ((x << 1n) | (x >> BigInt(N - 1))) & MASK;
  const r = ((x >> 1n) | ((x & 1n) << BigInt(N - 1))) & MASK;
  return (l ^ (x | r)) & MASK;
}
let s = 987654321n, ring = 0n;
for (let i = 0; i < N; i += 32) { s = (s * 6364136223846793005n + 1442695040888963407n) & ((1n << 64n) - 1n); ring |= ((s >> 33n) & 0xffffffffn) << BigInt(i); }
ring &= MASK;
for (let i = 0; i < 200; i++) ring = step30(ring);   // settle onto the attractor

const t0 = Date.now();
let m = 0, G = 0;
let pts = new Uint8Array(WIN); pts[0] = 1;
let rayFrom = 0, overWindow = 0;
let rowStr = '';
const cell = (x) => rowStr.charCodeAt(N - 1 - (((x % N) + N) % N)) === 49 ? 1 : 0;
const blocks = [];
let lastM = 0, lastS = 0, whites = 0, reads = 0;
for (let step = 0; step < ROWS; step++) {
  rowStr = ring.toString(2).padStart(N, '0');
  let rayNew = Infinity;
  const ptsNew = [];
  for (let o = 0; o < WIN; o++) {
    if (!(o >= rayFrom || pts[o] === 1)) continue;
    const x = m + o;
    const L = cell(x - 1), C = cell(x), R = cell(x + 1);
    if (o === 0) { reads++; if (L === 0) whites++; }
    if (L === 0) ptsNew.push(x - 1);
    else if (C === 0 && R === 0) ptsNew.push(x);
    else if (C === 0 && R === 1) { if (x + 1 < rayNew) rayNew = x + 1; }
    else { if (x < rayNew) rayNew = x; }
    if (rayNew < Infinity && x > rayNew + 1) break;
  }
  if (rayNew === Infinity) { overWindow++; rayNew = m + WIN; }
  let mNew = rayNew;
  for (const v of ptsNew) if (v < mNew) mNew = v;
  const nextPts = new Uint8Array(WIN);
  for (const v of ptsNew) { if (v >= rayNew) continue; const o = v - mNew; if (o >= 0 && o < WIN) nextPts[o] = 1; }
  const nextRay = rayNew - mNew;
  if (nextRay >= WIN) overWindow++;
  m = mNew; pts = nextPts; rayFrom = Math.min(nextRay, WIN);
  G = cell(G - 1) === 0 ? G - 1 : G;
  ring = step30(ring);
  if ((step + 1) % 50000 === 0) { blocks.push(-(m - lastM) / (step + 1 - lastS)); lastM = m; lastS = step + 1; }
}
console.log(`background = rule 30 on a random ring of ${N} cells, ${ROWS} rows, window overflows ${overWindow}`);
console.log(`   DP under both laws: ${(-m / ROWS).toFixed(5)}  ${-m / ROWS < 0.5 ? '(below 1/2)' : '(at or above 1/2)'}`);
console.log(`   G under the advance law alone: ${(-G / ROWS).toFixed(5)}`);
console.log(`   white fraction of the cell the DP minimum reads on its left: ${(whites / reads).toFixed(5)}`);
console.log(`   DP over blocks of 50000: ${blocks.map((b) => b.toFixed(5)).join(' ')}`);
console.log(`(${Date.now() - t0} ms)`);
