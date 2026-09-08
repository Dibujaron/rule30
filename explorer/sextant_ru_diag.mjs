/**
 * Sextant: diagnose the single m-disagreement Test D of
 * sextant_rightunbounded.mjs reported, and check the exact form
 *
 *     evolve (t + p) p = evolve t 0   <=>   t < m(p)
 *
 * against the per-cell engine, both directions, for every p in range.
 *
 *   node explorer/sextant_ru_diag.mjs
 */

const T = 600, W = 2 * T + 9, OFF = T + 4;
const table = new Uint8Array(8);
for (let i = 0; i < 8; i++) table[i] = (30 >> i) & 1;
let a = new Uint8Array(W), b = new Uint8Array(W);
a[OFF] = 1;
const rows = [];
for (let t = 0; t < T; t++) {
  rows.push(a.slice());
  for (let i = 1; i < W - 1; i++) b[i] = table[(a[i - 1] << 2) | (a[i] << 1) | a[i + 1]];
  const tmp = a; a = b; b = tmp;
}
const cell = (t, x) => rows[t][OFF + x];

// m(p): least d >= 1 with cell(p, p-d) black. Search the whole row this time.
function m(p) {
  for (let d = 1; d <= 2 * p + 1; d++) if (cell(p, p - d)) return d;
  return -1;
}

let both = 0, mismatch = 0, first = [];
for (let p = 1; p <= 250; p++) {
  const mp = m(p);
  for (let t = 0; t + p < T; t++) {
    const eq = cell(t + p, p) === cell(t, 0);
    const pred = t < mp;
    if (eq !== pred) { mismatch++; if (first.length < 6) first.push([p, t, mp, eq ? 1 : 0]); }
    both++;
  }
}
console.log(`exact form  evolve(t+p) p = evolve t 0  <=>  t < m(p)`);
console.log(`tested ${both} (p,t) pairs, p = 1..250, t to row ${T}: ${mismatch} mismatches`);
if (mismatch) console.log('first mismatches (p, t, m(p), equal?):', JSON.stringify(first));

// the reported m-disagreement: print m(p) for the small p, both ways
const bad = [];
for (let p = 1; p <= 150; p++) {
  let m2 = -1;
  for (let d = 1; d <= p; d++) if (cell(p, p - d)) { m2 = d; break; }
  if (m2 !== m(p)) bad.push([p, m2, m(p)]);
}
console.log('p where the d<=p search differs from the full-row search (p, capped, true):', JSON.stringify(bad));

// row 1 and row 2 in full, to read the convention off by eye
for (const t of [0, 1, 2, 3, 4]) {
  let s = '';
  for (let x = -t; x <= t; x++) s += cell(t, x) ? '#' : '.';
  console.log(`row ${t}: ${s}   m(${t}) = ${m(t)}`);
}
