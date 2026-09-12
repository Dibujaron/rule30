// Sextant, 2026-09-12. Topic: the 4^-t constraint.
//
// C2b, and the point of the session.  Every word occurs as a FACTOR of a row
// at depth t (sextant9_window.mjs), so the topic's negative does not exist in
// the factor reading.  It does exist in the WHOLE-ROW reading, and the
// question this file settles is whether that negative is anything more than
// the cone edges: is "row t is a t-step image of a finite configuration"
// equivalent to a condition on a bounded prefix and a bounded suffix?
//
// Method: enumerate the reachable set exactly (every finite configuration of
// span n - 2t, evolved t steps), then ask whether it is the set of black-ended
// words whose length-L prefix is a legal prefix and whose length-L suffix is a
// legal suffix, for each L.  A word with a legal prefix and a legal suffix
// that is still not reachable is a constraint no edge condition can express.

function step(row) {
  const n = row.length;
  const out = new Uint8Array(n + 2);
  const get = (k) => (k < 0 || k >= n) ? 0 : row[k];
  for (let j = 0; j < n + 2; j++) out[j] = get(j - 2) ^ (get(j - 1) | get(j));
  return out;
}
{ let r = Uint8Array.from([1]); for (let s = 0; s < 3; s++) r = step(r);
  if (Array.from(r).join('') !== '1101111') { console.log('ENGINE FAIL'); process.exit(1); }
  console.log('engine self-check OK (row 3 = 1101111)'); }

function reachableSet(t, n) {              // rows of span exactly n at depth t
  const m = n - 2 * t;
  const out = new Set();
  if (m < 1) return out;
  const hi = m === 1 ? 1 : (1 << (m - 2));
  for (let mid = 0; mid < hi; mid++) {
    const c = new Uint8Array(m);
    c[0] = 1; c[m - 1] = 1;
    for (let j = 1; j < m - 1; j++) c[j] = (mid >> (j - 1)) & 1;
    let r = c; for (let s = 0; s < t; s++) r = step(r);
    out.add(Array.from(r).join(''));
  }
  return out;
}

console.log('\n=== is reachability a prefix+suffix condition? ===');
console.log('For each t: the smallest L for which {black-ended, prefix in P_L, suffix in S_L}');
console.log('equals the reachable set exactly.  "none" means no L up to floor(n/2) works,');
console.log('i.e. the constraint is not an edge condition at any bounded width.\n');
console.log(' t    n   reachable   |P_L| growth ...                     verdict');

const witnesses = [];
for (let t = 1; t <= 7; t++) {
  const n = 2 * t + 10;                    // config span 10, so 256 reachable rows
  const R = reachableSet(t, n);
  const all = [];
  for (let code = 0; code < (1 << (n - 2)); code++) {
    let s = '1';
    for (let j = 0; j < n - 2; j++) s += (code >> j) & 1;
    s += '1';
    all.push(s);
  }
  let verdict = 'none', sizes = [];
  for (let L = 1; L <= Math.floor(n / 2); L++) {
    const P = new Set(), S = new Set();
    for (const w of R) { P.add(w.slice(0, L)); S.add(w.slice(n - L)); }
    sizes.push(`${L}:${P.size}/${S.size}`);
    let ok = true, firstBad = null;
    for (const w of all) {
      const pred = P.has(w.slice(0, L)) && S.has(w.slice(n - L));
      const tru = R.has(w);
      if (pred !== tru) { ok = false; if (!firstBad && pred && !tru) firstBad = w; }
    }
    if (ok) { verdict = 'L = ' + L; break; }
    if (L === Math.floor(n / 2) && firstBad) witnesses.push({ t, n, L, w: firstBad });
  }
  console.log(` ${String(t).padStart(2)} ${String(n).padStart(4)}  ${String(R.size).padStart(9)}   ${sizes.slice(0, 7).join(' ')}   ${verdict}`);
}

// ---------------------------------------------------------------------------
// The smallest witness: a word with a legal prefix and a legal suffix at every
// width, which is still not a t-step image.  Search t upward and n upward.
console.log('\n=== the smallest non-edge witness ===');
outer:
for (let t = 1; t <= 6; t++) {
  for (let n = 2 * t + 3; n <= 2 * t + 12; n++) {
    const R = reachableSet(t, n);
    if (R.size < 2) continue;
    const L = Math.floor(n / 2);
    const P = new Set(), S = new Set();
    for (const w of R) { P.add(w.slice(0, L)); S.add(w.slice(n - L)); }
    let found = null;
    for (let code = 0; code < (1 << (n - 2)); code++) {
      let s = '1';
      for (let j = 0; j < n - 2; j++) s += (code >> j) & 1;
      s += '1';
      if (!R.has(s) && P.has(s.slice(0, L)) && S.has(s.slice(n - L))) { found = s; break; }
    }
    if (found) {
      // exhibit the two reachable rows that share its prefix and its suffix
      let pw = null, sw = null;
      for (const w of R) { if (!pw && w.slice(0, L) === found.slice(0, L)) pw = w; if (!sw && w.slice(n - L) === found.slice(n - L)) sw = w; }
      console.log(`t = ${t}, span n = ${n}, half-width L = ${L}`);
      console.log(`  NOT a ${t}-step image of any finite configuration:  ${found}`);
      console.log(`  but its first ${L} cells are the first ${L} of the reachable row ${pw}`);
      console.log(`  and its last  ${L} cells are the last  ${L} of the reachable row ${sw}`);
      console.log(`  reachable rows of this span: ${R.size} of ${1 << (n - 2)} black-ended words`);
      break outer;
    }
  }
}

// ---------------------------------------------------------------------------
// How far in does a single flip reach?  Take reachable rows, flip one interior
// cell, and count how often reachability survives, by distance from the left
// edge.  An edge condition would show survival 1 everywhere past its width.
console.log('\n=== single-cell flips: does an interior flip break reachability? ===');
for (const t of [1, 2, 3, 4, 6, 8]) {
  const n = 2 * t + 12;
  const R = reachableSet(t, n);
  const surv = new Array(n).fill(0), tot = new Array(n).fill(0);
  for (const w of R) {
    for (let p = 1; p < n - 1; p++) {
      const f = w.slice(0, p) + (w[p] === '1' ? '0' : '1') + w.slice(p + 1);
      tot[p]++;
      if (R.has(f)) surv[p]++;
    }
  }
  const prof = [];
  for (let p = 1; p < n - 1; p++) prof.push((surv[p] / tot[p]).toFixed(3));
  console.log(`t=${t}, n=${n}: survival of a flip at position 1..${n - 2}: ${prof.join(' ')}`);
}
