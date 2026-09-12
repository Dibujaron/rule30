/**
 * Sextant, 2026-09-12. Is the one-block bound 3/5 SHARP, and is it sharp as a
 * statement about arbitrary words rather than about rule 30's own rows?
 *
 * Part 1. The witness. The ring 10011 of size 5 has temporal period 5 under
 *   rule 30 and -- printed here -- every state of its cycle has weight 3, so
 *   its time-average black density is exactly 3/5. It saturates every
 *   constraint of the one-block programme at once: rho = 1, G1 = 0, G2 = 1,
 *   w = 2 = rho + G2.
 *
 * Part 2. The inequality as a universal statement. For a finite configuration
 *   c whose leftmost and rightmost black cells are n-1 apart ("span n"),
 *
 *       2*b(F c) + 3*b(c)  <=  3*(n + 2),
 *
 *   where F is one rule 30 step. This is the form a Lean proof would assert;
 *   it must hold for EVERY word, not only for rule 30's own rows, because the
 *   derivation never mentions where the row came from. Checked exhaustively
 *   for every span up to SPAN_MAX, with the maximum of the slack reported so
 *   that tightness is visible rather than inferred.
 *
 * Part 3. The programme's own optimum, by value iteration on
 *   d' <= min(3d, (3/2)(1-d)) with the cone's O(1) corrections carried
 *   exactly, to confirm 3/5 is the supremum of the long-run average and not
 *   merely a fixed point.
 */

function popcount(x) {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

// ---------- Part 1: the witness ring ----------
{
  const N = 5, mask = 31;
  const step = (s) => {
    const l = ((s >>> 1) | (s << (N - 1))) & mask;
    const r = ((s << 1) | (s >>> (N - 1))) & mask;
    return (l ^ (s | r)) & mask;
  };
  console.log('Part 1: the ring 10011 (N=5) under rule 30');
  let s = parseInt('10011', 2);
  const seen = [];
  for (let i = 0; i < 12; i++) {
    seen.push(`${s.toString(2).padStart(N, '0')} weight ${popcount(s)}`);
    s = step(s);
  }
  for (const x of seen) console.log(`  ${x}`);
  // exact cycle
  let a = parseInt('10011', 2), tot = 0, len = 0;
  do { tot += popcount(a); len++; a = step(a); } while (a !== parseInt('10011', 2));
  console.log(`  cycle length ${len}, total weight ${tot} of ${len * N} cells = ${tot}/${len * N} = ${(tot / (len * N)).toFixed(6)}`);
}

// ---------- Part 2: the inequality over all words ----------
// Configuration is a finite bit pattern; bit i = cell i. Span n means
// bit 0 set and bit n-1 set. One step: new(i) = c(i-1) XOR (c(i) OR c(i+1)),
// so on the shifted frame  F = (c<<2) XOR ((c<<1) OR c)  with the image's
// cell i corresponding to old cell i-1.
console.log('');
console.log('Part 2: 2*b(Fc) + 3*b(c) <= 3*(n+2) over EVERY word of span n');
const SPAN_MAX = 22;
console.log(' n   words tested   violations   min slack   argmin word');
for (let n = 1; n <= SPAN_MAX; n++) {
  let viol = 0, minSlack = Infinity, argmin = '';
  const inner = n >= 2 ? 1 << (n - 2) : 1;
  for (let m = 0; m < inner; m++) {
    // c = 1 + (m << 1) + (1 << (n-1)) for n >= 2, else c = 1
    const c = n >= 2 ? (1 | (m << 1) | (1 << (n - 1))) >>> 0 : 1;
    const img = (((c << 2) ^ ((c << 1) | c)) >>> 0);
    const slack = 3 * (n + 2) - (2 * popcount(img) + 3 * popcount(c));
    if (slack < 0) viol++;
    if (slack < minSlack) { minSlack = slack; argmin = c.toString(2).padStart(n, '0').split('').reverse().join(''); }
  }
  console.log(`${String(n).padStart(2)} ${String(inner).padStart(13)} ${String(viol).padStart(12)} ` +
    `${String(minSlack).padStart(11)}   ${argmin}`);
}

// ---------- Part 3: the programme's optimum ----------
console.log('');
console.log('Part 3: value iteration on the one-block programme');
console.log('  maximise the long-run average of d(t) = b(t)/(2t+1) subject to');
console.log('  b(t+1) <= min( 3*b(t), floor((3*w(t)+6)/2) ),  w = 2t+1-b(t)');
{
  // exact integer DP over b for a fixed horizon, maximising sum b(t)
  const T = 4000;
  // best[b] = max total blacks over rows 0..t given b(t) = b -- too large;
  // instead follow the greedy upper envelope: the LP's optimum is a fixed
  // point, so iterate d(t+1) = min(3d, 1.5(1-d)) from several starts.
  for (const d0 of [0.01, 0.3, 0.5, 0.9, 0.99]) {
    let d = d0, sum = 0;
    for (let t = 0; t < T; t++) { sum += d; d = Math.min(3 * d, 1.5 * (1 - d)); }
    console.log(`    start d=${d0}: limit d=${d.toFixed(6)}, running average ${(sum / T).toFixed(6)}`);
  }
  // and the exact integer DP maximising the triangle count for small T
  const TT = 400;
  let layer = new Map([[1, 1]]);   // b(0)=1, total 1
  for (let t = 0; t < TT; t++) {
    const next = new Map();
    for (const [b, tot] of layer) {
      const w = 2 * t + 1 - b;
      const cap = Math.min(3 * b, (3 * w + 6) >> 1, 2 * t + 3);
      for (let nb = 3; nb <= cap; nb++) {
        const cur = next.get(nb);
        if (cur === undefined || cur < tot + nb) next.set(nb, tot + nb);
      }
    }
    layer = next;
  }
  let best = 0;
  for (const [, tot] of layer) if (tot > best) best = tot;
  console.log(`    exact integer DP, T=${TT}: max triangle blacks ${best} of ${TT * TT} cells ` +
    `= ${(best / (TT * TT)).toFixed(6)}   (3/5 = 0.6)`);
}
