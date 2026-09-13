// Groma, 2026-09-13. Can left-permutivity feed a lower bound on the centre
// column's factor complexity? The brief asks this directly.
//
// The answer on paper: over the class of ALL configurations it gives the bound
// for free and therefore gives nothing. `evolveFrom_leftPermutive` has radius t,
// so two configurations agreeing on (-L, L] and differing at -L have different
// centre cells at time L; and the centre cells at times t < L read only [-t, t],
// which lies inside (-L, L]. So flipping the cell at -L keeps the prefix
// c[0 .. L-1] and flips c[L]: EVERY realised prefix is right-special. The
// class's language is the full shift at every length, and the residual is about
// one orbit.
//
// [A] checks that on the automaton: over all configurations supported in
//     [-L, L], every realised centre-column prefix of length L has both
//     continuations.
// [B] the version that is NOT automatic, and is where the cone bites: inside the
//     board's class A2(a) (white at x < -a, black at -a) the flip at -L is not
//     available once L > a, so prefixes can become one-way. The measurement is
//     the least length at which some realised prefix has a single continuation.

function centrePrefix(cells, lo, L) {
  // cells: Uint8Array over positions lo .. lo+cells.length-1, white elsewhere
  const pad = L + 3;
  const W = cells.length + 2 * pad;
  let row = new Uint8Array(W);
  row.set(cells, pad);
  const origin = pad - lo; // index of x = 0
  const out = new Uint8Array(L + 1);
  for (let t = 0; t <= L; t++) {
    out[t] = row[origin];
    const nxt = new Uint8Array(W);
    for (let i = 1; i < W - 1; i++) nxt[i] = (row[i - 1] ^ (row[i] | row[i + 1])) & 1;
    row = nxt;
  }
  return out;
}

console.log('[A] all configurations supported in [-L, L]: is every realised centre-column');
console.log('    prefix of length L right-special (both continuations realised)?');
for (let L = 1; L <= 9; L++) {
  const n = 2 * L + 1;
  const cont = new Map(); // prefix (L bits) -> mask of realised next bits
  for (let v = 0; v < (1 << n); v++) {
    const cells = new Uint8Array(n);
    for (let i = 0; i < n; i++) cells[i] = (v >> i) & 1;
    const c = centrePrefix(cells, -L, L);
    let key = 0;
    for (let t = 0; t < L; t++) key = (key << 1) | c[t];
    cont.set(key, (cont.get(key) || 0) | (1 << c[L]));
  }
  let rs = 0;
  for (const m of cont.values()) if (m === 3) rs++;
  console.log(`  L = ${L}: ${cont.size} realised prefixes, ${rs} right-special  ${rs === cont.size ? '(ALL)' : '*** NOT ALL ***'}`);
}

console.log('\n[B] inside the cone class A2(a) (white at x < -a, black at x = -a), where the');
console.log('    flip at -L is unavailable once L > a: the least prefix length with a');
console.log('    one-way (not right-special) realised prefix, and how many such prefixes.');
console.log('    R = right extent enumerated; a prefix of length L needs row-0 cells up to +L.');
for (let a = 1; a <= 7; a++) {
  const out = [];
  for (let L = 1; L <= 13; L++) {
    const R = L; // cells -a .. L ; cells beyond +L cannot affect c[0..L]
    const n = a + 1 + R;
    if (n > 22) break;
    const cont = new Map();
    for (let v = 0; v < (1 << (n - 1)); v++) {
      const cells = new Uint8Array(n);
      cells[0] = 1; // x = -a is black
      for (let i = 0; i < n - 1; i++) cells[1 + i] = (v >> i) & 1;
      const c = centrePrefix(cells, -a, L);
      let key = 0;
      for (let t = 0; t < L; t++) key = (key << 1) | c[t];
      cont.set(key, (cont.get(key) || 0) | (1 << c[L]));
    }
    let oneway = 0;
    for (const m of cont.values()) if (m !== 3) oneway++;
    out.push(`${L}:${cont.size}/${oneway}`);
    if (oneway > 0 && out.length > 0) { /* keep going a little */ }
  }
  console.log(`  a = ${a}:  L:realised/one-way  ${out.join('  ')}`);
}
