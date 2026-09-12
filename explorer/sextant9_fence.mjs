// Sextant, 2026-09-12. Topic: the 4^-t constraint.  The fence: what the
// reachable set buys for P2, which is nothing, measured three ways.
//
// (a) The 3/5 density witness of last session (the ring 10011) is IN the
//     reachable set at every depth, as a single ROW and not only as a triangle
//     average -- so conditioning the row bound on "row t is a t-step image"
//     cannot move 3/5.
// (b) The density range over the reachable set at fixed t, as the span grows.
// (c) How rigid is the LEFT end of a reachable row: the number of distinct
//     length-L prefixes over the whole reachable set.  This is the provable,
//     finite-t shadow of crystal 49's "there is only one left side".

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

// --- (a) the 3/5 witness, planted in a cone, read ROW BY ROW ---------------
console.log('\n=== (a) the ring 10011 planted as a FINITE configuration ===');
console.log('span 200001; density of the middle (span - 2t) cells of row t, which is');
console.log('exactly the part the cone has not reached, plus the density of the whole row.\n');
{
  const reps = 40000;                       // 5 * 40000 = 200000 cells
  const base = [1, 0, 0, 1, 1];
  const cells = new Uint8Array(reps * 5 + 1);
  for (let i = 0; i < reps * 5; i++) cells[i] = base[i % 5];
  cells[reps * 5] = 1;                      // make the right end black
  let r = cells;
  const span0 = r.length;
  console.log(' t     row span    middle density    whole-row density');
  for (let t = 0; t <= 60; t++) {
    if (t > 0) r = step(r);
    if (t % 10 !== 0 && t !== 1 && t !== 5) continue;
    // middle = positions untouched by either cone: indices [2t, len-1-2t] in the
    // current frame (the row grew by t cells each side and the cone eats in at
    // speed 1 from each original end)
    let a = 2 * t, b = r.length - 1 - 2 * t;
    let mb = 0; for (let j = a; j <= b; j++) mb += r[j];
    let wb = 0; for (let j = 0; j < r.length; j++) wb += r[j];
    console.log(` ${String(t).padStart(2)}  ${String(r.length).padStart(9)}    ${(mb / (b - a + 1)).toFixed(6)}          ${(wb / r.length).toFixed(6)}`);
  }
  console.log('3/5 = 0.600000');
}

// --- (b) density range over the reachable set, fixed t, growing span -------
console.log('\n=== (b) density range over ALL reachable rows at fixed t ===');
console.log(' t    m      n   #configs    max        min        mean');
for (const t of [1, 2, 3, 4]) {
  for (const m of [10, 14, 18, 22]) {
    const hi = 1 << (m - 2);
    if (hi > (1 << 20)) continue;
    let maxD = -1, minD = 2, sum = 0;
    for (let mid = 0; mid < hi; mid++) {
      const c = new Uint8Array(m); c[0] = 1; c[m - 1] = 1;
      for (let j = 1; j < m - 1; j++) c[j] = (mid >> (j - 1)) & 1;
      let r = c; for (let s = 0; s < t; s++) r = step(r);
      let b = 0; for (let j = 0; j < r.length; j++) b += r[j];
      const d = b / r.length;
      if (d > maxD) maxD = d; if (d < minD) minD = d; sum += d;
    }
    console.log(` ${String(t).padStart(2)} ${String(m).padStart(4)} ${String(m + 2 * t).padStart(6)} ${String(hi).padStart(10)}   ${maxD.toFixed(6)}   ${minD.toFixed(6)}   ${(sum / hi).toFixed(6)}`);
  }
}

// --- (c) how rigid is the left end of a reachable row ----------------------
console.log('\n=== (c) distinct length-L prefixes over the reachable set at depth t ===');
console.log('(a forced prefix of length L means only 1 distinct prefix; 2^L means free)');
for (const t of [2, 4, 8, 16, 32]) {
  const m = 16;
  const hi = 1 << (m - 2);
  const rows = [];
  for (let mid = 0; mid < hi; mid++) {
    const c = new Uint8Array(m); c[0] = 1; c[m - 1] = 1;
    for (let j = 1; j < m - 1; j++) c[j] = (mid >> (j - 1)) & 1;
    let r = c; for (let s = 0; s < t; s++) r = step(r);
    rows.push(r);
  }
  const out = [];
  for (const L of [1, 2, 3, 4, 6, 8, 12, 16, 24, 32]) {
    if (L > rows[0].length) break;
    const P = new Set();
    for (const r of rows) { let s = ''; for (let j = 0; j < L; j++) s += r[j]; P.add(s); }
    out.push(`${L}:${P.size}`);
  }
  console.log(` t=${String(t).padStart(2)}, m=${m}, ${rows.length} reachable rows of span ${m + 2 * t}: |P_L| = ${out.join(' ')}`);
}
