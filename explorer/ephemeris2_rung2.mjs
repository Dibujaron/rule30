/**
 * Ephemeris, 2026-09-12. Rung 2 of the occurrence ladder, measured.
 *
 * Rung 1 is proved on the board: `centerColumn_window_not_constant` says both
 * letters occur in every window [a, 4a], a >= 1.  Rung 2 is the same statement
 * for the four words of LENGTH TWO.  This script asks, for every a up to N/4,
 * whether all four of 11, 00, 10, 01 occur inside [a, 4a] -- and reports the
 * largest a at which any of them fails, so the handoff carries a number rather
 * than a hope.  Also reported: the same question with the window [a, 4a]
 * replaced by [a, 2a] and [a, 8a], so a theorist knows how much of the margin
 * is the window constant.
 *
 * Engine: the validated low-end packed row map (see ephemeris2_subshift.mjs).
 */

import { centerColumnBits } from './rule30.mjs';

const N = 400_000;

function centerPacked(n) {
  const WORDS = (n >> 5) + 3;
  const r = new Uint32Array(WORDS);
  r[0] = 1;
  const out = new Uint8Array(n);
  for (let t = 0; t < n; t++) {
    out[t] = (r[t >> 5] >>> (t & 31)) & 1;
    const limit = Math.min(WORDS - 1, (t >> 4) + 1);
    let prev = 0;
    for (let j = 0; j <= limit; j++) {
      const cur = r[j];
      const s2 = ((cur << 2) | (prev >>> 30)) >>> 0;
      const s1 = ((cur << 1) | (prev >>> 31)) >>> 0;
      r[j] = (s2 ^ (s1 | cur)) >>> 0;
      prev = cur;
    }
  }
  return out;
}

const c = centerPacked(N);
{
  const big = centerColumnBits(3000);
  let bad = 0;
  for (let i = 0; i < 3000; i++) if (c[i] !== big[i]) bad++;
  console.log(`engine vs BigInt (3000): ${bad} mismatches`);
  if (bad) throw new Error('engine disagrees');
}

const WORDS = [['11', 1, 1], ['00', 0, 0], ['10', 1, 0], ['01', 0, 1]];

/** next[i] = least j >= i with the word starting at j, or N. */
function nextOcc(p, q) {
  const next = new Int32Array(N + 1).fill(N);
  for (let i = N - 2; i >= 0; i--) next[i] = (c[i] === p && c[i + 1] === q) ? i : next[i + 1];
  return next;
}

for (const mult of [2, 4, 8]) {
  const report = [];
  for (const [name, p, q] of WORDS) {
    const next = nextOcc(p, q);
    let lastFail = -1, fails = 0;
    for (let a = 1; mult * a + 1 < N; a++) {
      const j = next[a];              // first occurrence start at or after a
      if (j + 1 > mult * a) { fails++; lastFail = a; }   // word must END by time mult*a
    }
    report.push(`${name}: ${fails} failures, last at a=${lastFail}`);
  }
  console.log(`window [a, ${mult}a]:  ` + report.join('   '));
}

// The ladder: for each length k, the least power-of-two multiplier m such that
// every word of length k occurs inside [a, m*a] for every a >= 2.
console.log('');
for (let k = 1; k <= 6; k++) {
  const nexts = [];
  for (let w = 0; w < 1 << k; w++) {
    const b = [];
    for (let j = k - 1; j >= 0; j--) b.push((w >> j) & 1);
    const next = new Int32Array(N + 1).fill(N);
    for (let i = N - k; i >= 0; i--) {
      let ok = true;
      for (let j = 0; j < k; j++) if (c[i + j] !== b[j]) { ok = false; break; }
      next[i] = ok ? i : next[i + 1];
    }
    nexts.push(next);
  }
  // threshold form: with the window [a, 4a] fixed, the largest a that fails
  {
    let lastBad = -1, bad = 0;
    for (const next of nexts) {
      for (let a = 1; 4 * a + k < N; a++) if (next[a] + k - 1 > 4 * a) { bad++; if (a > lastBad) lastBad = a; }
    }
    console.log(`length ${k}: window [a,4a] fails ${bad} times, last at a=${lastBad}  ` +
      `(so it holds for every a > ${lastBad} up to ${Math.floor(N / 4)})`);
  }
  let chosen = null;
  for (let m = 2; m <= 1024; m *= 2) {
    let bad = 0, lastBad = -1;
    for (const next of nexts) {
      for (let a = 2; m * a + k < N; a++) {
        if (next[a] + k - 1 > m * a) { bad++; if (a > lastBad) lastBad = a; }
      }
    }
    if (bad === 0) { chosen = m; break; }
    if (m === 1024) chosen = `>1024 (last failure a=${lastBad})`;
  }
  console.log(`length ${k}: least power-of-two window multiplier with no failure for a >= 2 over a < ${N}/m : ${chosen}   (2^k = ${2 ** k})`);
}

// the same for rung 3, the eight words of length three, at the [a, 4a] window
console.log('');
for (const mult of [4, 8, 16]) {
  let worst = -1, tot = 0;
  for (let w = 0; w < 8; w++) {
    const b = [(w >> 2) & 1, (w >> 1) & 1, w & 1];
    const next = new Int32Array(N + 1).fill(N);
    for (let i = N - 3; i >= 0; i--)
      next[i] = (c[i] === b[0] && c[i + 1] === b[1] && c[i + 2] === b[2]) ? i : next[i + 1];
    for (let a = 1; mult * a + 2 < N; a++) {
      const j = next[a];
      if (j + 2 > mult * a) { tot++; if (a > worst) worst = a; }
    }
  }
  console.log(`length 3, window [a, ${mult}a]: ${tot} failures over all eight words, last at a=${worst}`);
}
