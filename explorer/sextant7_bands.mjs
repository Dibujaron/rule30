// sextant7_bands.mjs   (Sextant, 2026-09-10)
//
// Two claims the attack document makes by citation; measured here instead.
//
//  1. The cone in packed-row form: rowNat t has bit length exactly 2t + 1.
//     (Kernel-checked to t = 120 in sextant7_scratch_forced.lean; here to 20000.)
//  2. The bounded-period settled band on the RIGHT has constant width: the right
//     diagonals' minimal periods are 1,2,2,4,8,8,16,32,32,64,... so P_k <= 32
//     exactly for k <= 8, and bits 2t-8 .. 2t are the whole of it.
//     (Obstruction 20 gives the list; recomputed here from the picture.)

const T = 20000, NB = 2 * T + 96, WORDS = (NB >>> 5) + 2;
function zero() { return new Uint32Array(WORDS); }
const s1 = zero(), s2 = zero();
function shl(d, s, k) { for (let i = WORDS - 1; i >= 0; i--) d[i] = ((s[i] << k) | (i > 0 ? (s[i - 1] >>> (32 - k)) : 0)) >>> 0; }
function step(d, s) { shl(s1, s, 2); shl(s2, s, 1); for (let i = 0; i < WORDS; i++) d[i] = (s1[i] ^ ((s2[i] | s[i]) >>> 0)) >>> 0; }
function bit(a, b) { return (b < 0 || b >= NB) ? 0 : (a[b >>> 5] >>> (b & 31)) & 1; }

console.log('=== 1. bit length of rowNat t ===');
{
  let R = zero(); R[0] = 1; const tmp = zero();
  let bad = 0, firstBad = -1;
  const KRIGHT = 20;                       // right diagonals 0..20, collected on the way
  const rd = []; for (let k = 0; k <= KRIGHT; k++) rd.push([]);
  for (let t = 0; t <= T; t++) {
    if (bit(R, 2 * t) !== 1) { bad++; if (firstBad < 0) firstBad = t; }
    for (let b = 2 * t + 1; b <= 2 * t + 8 && b < NB; b++) if (bit(R, b) !== 0) { bad++; if (firstBad < 0) firstBad = t; }
    for (let k = 0; k <= Math.min(KRIGHT, 2 * t); k++) rd[k].push(bit(R, 2 * t - k));
    step(tmp, R); R.set(tmp);
  }
  console.log(`  rows 0..${T}: bit 2t set and bits 2t+1..2t+8 clear -- ${bad} violations${firstBad >= 0 ? ` (first at t=${firstBad})` : ''}`);

  console.log('\n=== 2. minimal periods of the right diagonals ===');
  const P = [];
  for (let k = 0; k <= KRIGHT; k++) {
    const u = rd[k];
    let p = 1;
    for (; p <= 4096; p *= 2) {
      let ok = true;
      for (let i = 0; i + p < u.length; i++) if (u[i] !== u[i + p]) { ok = false; break; }
      if (ok) break;
    }
    P.push(p);
  }
  console.log(`  P_k for k = 0..${KRIGHT}: ${P.join(',')}`);
  const last = P.findIndex(p => p > 32) - 1;
  console.log(`  largest k with P_k <= 32: ${last}  -> the band bits 2t-${last} .. 2t has ${last + 1} diagonals`);
  console.log(`  (obstruction 20's published list starts 1,2,2,4,8,8,16,32,32,64 -- agrees: ${P.slice(0, 10).join(',') === '1,2,2,4,8,8,16,32,32,64'})`);
  console.log(`  each period verified over ${rd[KRIGHT].length} terms, i.e. >= ${Math.floor(rd[KRIGHT].length / P[KRIGHT])} cycles at the deepest`);
}
