// Sextant, 2026-09-12. Topic: the 4^-t constraint.
//
// C4: does "row t is a t-step image of a finite configuration" constrain the
// row's black DENSITY?  If the max density over the reachable set fell below
// 3/5 as t grows, the 4^-t constraint would sharpen last session's local bound
// and bear on P2.  Measured exhaustively: enumerate every finite configuration
// of span m (leftmost and rightmost cells black, interior free), evolve t
// steps, and read the density of the resulting row of span m + 2t.

function step(row) {
  const n = row.length;
  const out = new Uint8Array(n + 2);
  const get = (k) => (k < 0 || k >= n) ? 0 : row[k];
  for (let j = 0; j < n + 2; j++) out[j] = get(j - 2) ^ (get(j - 1) | get(j));
  return out;
}
function evolveT(cells, t) { let r = cells; for (let s = 0; s < t; s++) r = step(r); return r; }
{ // self-check against the seed's asymmetric row 3
  let r = Uint8Array.from([1]);
  for (let s = 0; s < 3; s++) r = step(r);
  if (Array.from(r).join('') !== '1101111') { console.log('ENGINE FAIL', Array.from(r).join('')); process.exit(1); }
  console.log('engine self-check OK (row 3 = 1101111, not a palindrome)');
}

function* configs(m) {
  if (m === 1) { yield Uint8Array.from([1]); return; }
  const hi = 1 << (m - 2);
  for (let mid = 0; mid < hi; mid++) {
    const c = new Uint8Array(m);
    c[0] = 1; c[m - 1] = 1;
    for (let j = 1; j < m - 1; j++) c[j] = (mid >> (j - 1)) & 1;
    yield c;
  }
}

function stats(m, t) {
  let maxD = -1, minD = 2, sum = 0, sum2 = 0, count = 0, argmax = null, argmin = null;
  for (const c of configs(m)) {
    const r = evolveT(c, t);
    let b = 0;
    for (let j = 0; j < r.length; j++) b += r[j];
    const d = b / r.length;
    sum += d; sum2 += d * d; count++;
    if (d > maxD) { maxD = d; argmax = Array.from(c).join(''); }
    if (d < minD) { minD = d; argmin = Array.from(c).join(''); }
  }
  const mean = sum / count, varr = sum2 / count - mean * mean;
  return { n: m + 2 * t, count, maxD, minD, mean, sd: Math.sqrt(varr), argmax, argmin };
}

console.log('\n=== max/min/mean black density of row t, over ALL finite configs of span m ===');
console.log('m   t    n   #configs     max        min        mean       sd      (1/2, 3/5 for scale)');
for (const m of [18]) {
  for (let t = 0; t <= 12; t++) {
    const s = stats(m, t);
    console.log(`${String(m).padStart(2)} ${String(t).padStart(3)} ${String(s.n).padStart(4)} ${String(s.count).padStart(9)}   ${s.maxD.toFixed(6)}   ${s.minD.toFixed(6)}   ${s.mean.toFixed(6)}   ${s.sd.toFixed(6)}`);
  }
}

console.log('\n=== same, with n held near 40 and t varied (so the config span shrinks) ===');
console.log(' t    m     n   #configs     max        min        mean');
for (let t = 0; t <= 11; t++) {
  const m = 40 - 2 * t;
  if (m < 1) break;
  if (m - 2 > 20) { console.log(` ${String(t).padStart(2)}  ${String(m).padStart(3)}  ${String(40).padStart(4)}   (2^${m - 2} configs: too many to enumerate)`); continue; }
  const s = stats(m, t);
  console.log(` ${String(t).padStart(2)}  ${String(m).padStart(3)}  ${String(s.n).padStart(4)} ${String(s.count).padStart(9)}   ${s.maxD.toFixed(6)}   ${s.minD.toFixed(6)}   ${s.mean.toFixed(6)}`);
}

console.log('\n=== the extremal configurations, t = 0..8, m = 18 ===');
for (let t = 0; t <= 8; t++) {
  const s = stats(18, t);
  console.log(`t=${t}: max ${s.maxD.toFixed(6)} from config ${s.argmax};  min ${s.minD.toFixed(6)} from config ${s.argmin}`);
}

// Null: the same statistics over all words of span n with black ends, which is
// what "no constraint" would give.
console.log('\n=== null: all words of span n with black ends (the unconstrained set) ===');
for (const n of [18, 24, 30, 40]) {
  // mean density of a uniformly random black-ended word
  const mean = (2 + (n - 2) * 0.5) / n;
  console.log(`n=${n}: max 1.000000, min ${(2 / n).toFixed(6)}, mean ${mean.toFixed(6)}`);
}
