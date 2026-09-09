/**
 * Parallax, session 4 — discrepancy of the centre column across scales.
 *
 * An eventually periodic sequence has D(n) = (s/p)n + O(1): either bounded
 * (balanced period) or linear. So "D unbounded AND o(n)" implies aperiodic.
 * The question this measures is whether max|D| looks like it is growing at
 * all, and at what rate, over four octaves.
 *
 * Controls: Thue-Morse (aperiodic, D bounded -- the counterexample that shows
 * this property is strictly stronger than aperiodicity), Rudin-Shapiro
 * (aperiodic, D ~ sqrt n, PROVED by Brillhart-Morton), the balanced periodic
 * word 0011 (D bounded), and a xorshift null.
 *
 * Nothing here proves anything.
 */

import { centerColumnBits } from './rule30.mjs';

const N = 1 << 21;

function thueMorse(n) {
  const a = new Uint8Array(n);
  for (let i = 1; i < n; i++) a[i] = a[i >> 1] ^ (i & 1);
  return a;
}
function rudinShapiro(n) {
  const a = new Uint8Array(n);
  for (let i = 1; i < n; i++) a[i] = (i & 1 && i & 2) ? a[i >> 1] ^ 1 : a[i >> 1];
  return a;
}
function periodic(n, w) {
  const a = new Uint8Array(n);
  for (let i = 0; i < n; i++) a[i] = w[i % w.length];
  return a;
}
function xorshift(n, seed = 0x2f4b7c1) {
  const a = new Uint8Array(n);
  let s = seed >>> 0;
  for (let i = 0; i < n; i++) {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    a[i] = s & 1;
  }
  return a;
}

function octaves(a, name) {
  const rows = [];
  let d = 0, maxAbs = 0;
  let next = 1 << 12;
  for (let i = 0; i < a.length; i++) {
    d += a[i] ? -1 : 1;
    const m = Math.abs(d);
    if (m > maxAbs) maxAbs = m;
    if (i + 1 === next) {
      rows.push([next, d, maxAbs, (maxAbs / Math.sqrt(next)).toFixed(3)]);
      next <<= 1;
    }
  }
  console.log(`\n=== ${name} ===`);
  console.log('        N        D(N)   max|D|   max|D|/sqrt(N)');
  for (const [n, dd, mm, r] of rows) {
    console.log(`  ${String(n).padStart(9)}  ${String(dd).padStart(8)}  ${String(mm).padStart(7)}   ${r}`);
  }
}

console.log('building rule 30 centre column ...');
const c30 = centerColumnBits(N);
octaves(c30, 'rule 30 centre column');
octaves(thueMorse(N), 'Thue-Morse (aperiodic, D bounded)');
octaves(rudinShapiro(N), 'Rudin-Shapiro (aperiodic, D ~ sqrt n, PROVED)');
octaves(periodic(N, [0, 0, 1, 1]), 'periodic 0011 (balanced, D bounded)');
octaves(xorshift(N), 'xorshift (null)');
