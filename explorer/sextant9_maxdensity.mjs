// Sextant, 2026-09-12.  C5, the fence, in its strongest form.
//
// C1 says every word occurs as a WINDOW of row t of a finite configuration.
// Take the word to be all-black of length L: the construction gives a finite
// configuration of span L + 2t whose row t has span L + 4t and contains L
// consecutive black cells, so its black density is at least L / (L + 4t),
// which tends to 1 as L grows with t fixed.  So for every t there are t-step
// images of finite configurations of black density arbitrarily close to 1, and
// the 4^-t constraint imposes NO density ceiling at all.
//
// This file checks the construction really does it, at t up to 40 and L up to
// 4000, by forward evolution from the constructed configuration.

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

function solveBack(y) {                      // free cells white
  const n = y.length;
  const x = new Uint8Array(n + 2);           // x[j] is absolute position j-1
  for (let i = n - 1; i >= 0; i--) x[i] = y[i] ^ (x[i + 1] | x[i + 2]);
  return x;
}

console.log('\n  t      L   config span   row span   black run found   row density   L/(L+4t)');
for (const t of [1, 2, 4, 8, 16, 40]) {
  for (const L of [10, 100, 1000, 4000]) {
    const w = new Uint8Array(L).fill(1);
    let cur = w;
    for (let s = 0; s < t; s++) cur = solveBack(cur);   // span L + 2t
    let r = cur;
    for (let s = 0; s < t; s++) r = step(r);            // span L + 4t
    // the window sits at absolute [0, L-1]; r's left coordinate is -2t
    let runOK = true;
    for (let j = 0; j < L; j++) if (r[j + 2 * t] !== 1) { runOK = false; break; }
    let b = 0; for (let j = 0; j < r.length; j++) b += r[j];
    console.log(` ${String(t).padStart(2)}  ${String(L).padStart(5)}   ${String(cur.length).padStart(11)}  ${String(r.length).padStart(9)}   ${runOK ? 'yes' : 'NO '}               ${(b / r.length).toFixed(6)}      ${(L / (L + 4 * t)).toFixed(6)}`);
  }
}

console.log('\nand the other end: an all-WHITE window of length L, giving density near 0');
console.log('  t      L   row span   white run found   row density');
for (const t of [1, 4, 16]) {
  for (const L of [100, 4000]) {
    const w = new Uint8Array(L);             // all white
    let cur = w;
    for (let s = 0; s < t; s++) cur = solveBack(cur);
    let r = cur;
    for (let s = 0; s < t; s++) r = step(r);
    let runOK = true;
    for (let j = 0; j < L; j++) if (r[j + 2 * t] !== 0) { runOK = false; break; }
    let b = 0; for (let j = 0; j < r.length; j++) b += r[j];
    console.log(` ${String(t).padStart(2)}  ${String(L).padStart(5)}  ${String(r.length).padStart(9)}   ${runOK ? 'yes' : 'NO '}               ${(b / r.length).toFixed(6)}`);
  }
}
