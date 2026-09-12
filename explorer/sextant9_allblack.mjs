// Sextant, 2026-09-12.  A cross-check that fell out of the density sweep: the
// all-black row of span n came out reachable at t = 1 exactly at n = 12 and
// n = 24 among {12, 16, 20, 24}.  Crystal 25 (Wolfram 1986 §9, crediting the
// Feynmans) says the all-black state of a RING of size N has a predecessor iff
// 3 | N.  This checks the finite-configuration analogue directly.

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

// Is the all-black word of span n a 1-step image of a finite configuration?
// The preimage is forced into [1, n-2]; enumerate it.
console.log('\n n    3|n   all-black span-n word is a 1-step image?   preimage');
for (let n = 3; n <= 22; n++) {
  const m = n - 2;
  let found = null;
  for (let code = 0; code < (1 << m); code++) {
    const padded = new Uint8Array(n);
    for (let j = 0; j < m; j++) padded[j + 1] = (code >> j) & 1;
    const get = (k) => (k < 0 || k >= n) ? 0 : padded[k];
    let ok = true;
    for (let k = 0; k < n; k++) { if ((get(k - 1) ^ (get(k) | get(k + 1))) !== 1) { ok = false; break; } }
    // also the image must be WHITE outside [0, n-1]: positions -1 and n
    if (ok) {
      const g = (k) => (k < 0 || k >= n) ? 0 : padded[k];
      const left = g(-2) ^ (g(-1) | g(0));
      const right = g(n - 1) ^ (g(n) | g(n + 1));
      if (left !== 0 || right !== 0) ok = false;
    }
    if (ok) { found = Array.from(padded).join(''); break; }
  }
  console.log(` ${String(n).padStart(2)}    ${n % 3 === 0 ? 'yes' : ' no'}   ${found ? 'YES' : 'no '}                                     ${found ?? ''}`);
}

// and at t = 2?
console.log('\nat t = 2 (the all-black row as a 2-step image), n = 3..24:');
const hits = [];
for (let n = 3; n <= 24; n++) {
  const m = n - 4;
  if (m < 1) continue;
  let found = false;
  for (let code = 0; code < (1 << m); code++) {
    const cells = new Uint8Array(m);
    for (let j = 0; j < m; j++) cells[j] = (code >> j) & 1;
    let r = cells; r = step(r); r = step(r);            // span m + 4 = n
    let all = true;
    for (let j = 0; j < r.length; j++) if (!r[j]) { all = false; break; }
    if (all) { found = true; break; }
  }
  if (found) hits.push(n);
}
console.log(hits.length ? `reachable at n = ${hits.join(', ')}` : 'the all-black row is a 2-step image at NO span n <= 24');
