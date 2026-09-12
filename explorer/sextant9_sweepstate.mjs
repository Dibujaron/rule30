// Sextant, 2026-09-12.  Grounding the next topic before writing it down.
//
// The backward sweep of C2, run on the seed's row t, carries at input position
// p the pairs (y_k(p-k), y_k(p-k+1)) for k = 1..t, where y_k is row t-k.  At
// p = 0 the k-th entry is the cell (t-k, -k), and the line {(t-k, -k)} is
// exactly `time - position = t`, which is RIGHT DIAGONAL t read at index -k.
//
// So the sweep's state at the origin is the negative-index extension of right
// diagonal t, and rightDiagonal k j = evolve (j+k) j is defined down to
// j = -k, where it reads the INITIAL ROW at position -k.
//
// Three checks:
//  (1) the identification, cell by cell, against the picture;
//  (2) that the backward form of rightDiagonal_recurrence really does run the
//      tower down to index -k;
//  (3) that the boundary value rightDiagonal k (-k) is the initial row -- the
//      seed for rule 30, and something else for the flat-tower witness
//      ...10101|000 of the obstruction "The flat right-diagonal tower is a
//      real picture".

function stepArr(row) {
  const n = row.length;
  const out = new Uint8Array(n + 2);
  const get = (k) => (k < 0 || k >= n) ? 0 : row[k];
  for (let j = 0; j < n + 2; j++) out[j] = get(j - 2) ^ (get(j - 1) | get(j));
  return out;
}
{ let r = Uint8Array.from([1]); for (let s = 0; s < 3; s++) r = stepArr(r);
  if (Array.from(r).join('') !== '1101111') { console.log('ENGINE FAIL'); process.exit(1); }
  console.log('engine self-check OK (row 3 = 1101111)'); }

// the seed's picture, rows 0..T, as rows[t][x + T] for |x| <= t
const T = 400;
const W = 2 * T + 1;
const rows = [];
{
  let cur = new Uint8Array(W); cur[T] = 1;
  rows.push(cur);
  for (let t = 1; t <= T; t++) {
    const prev = rows[t - 1];
    const nxt = new Uint8Array(W);
    for (let i = 0; i < W; i++) {
      const l = i - 1 >= 0 ? prev[i - 1] : 0, c = prev[i], r = i + 1 < W ? prev[i + 1] : 0;
      nxt[i] = l ^ (c | r);
    }
    rows.push(nxt);
  }
}
const cell = (t, x) => rows[t][x + T];

// (1) rightDiagonal k j = evolve (j+k) j, for j from -k up
function rd(k, j) { const t = j + k; if (t < 0 || t > T) return null; return cell(t, j); }
{
  let bad = 0, tested = 0;
  for (let k = 0; k <= 200; k++) {
    for (let j = -k; j <= 150; j++) {
      const v = rd(k, j); if (v === null) continue;
      // the sweep's identification: state entry k of the sweep on row t at p=0
      // is cell(t-k, -k) = rd(t, -k) with t the depth.  Check with t = k.
      tested++;
      if (j < 0 && Math.abs(j) > k + j) { /* outside cone */ if (v !== 0) bad++; }
    }
  }
  console.log(`(1) right diagonal k at negative index: ${tested} cells read, ${bad} non-white outside the cone`);
}

// how far back is right diagonal t white?
console.log('\n(2) right diagonal t, read BACKWARDS from index 0, for the seed:');
console.log(' t    indices 0,-1,-2,...  (the sweep state at the origin), first white-forever index');
for (const t of [8, 16, 32, 64]) {
  const seq = [];
  for (let j = 0; j >= -t; j--) { const v = rd(t, j); seq.push(v === null ? '?' : v); }
  // last non-white index
  let last = 0;
  for (let i = 0; i < seq.length; i++) if (seq[i] === 1) last = i;
  console.log(` ${String(t).padStart(2)}   ${seq.slice(0, 24).join('')}${seq.length > 24 ? '…' : ''}   white from index -${last + 1} down (cone says -${Math.floor(t / 2) + 1})`);
}

// (3) the boundary value: rightDiagonal k (-k) is the initial row at -k
{
  let bad = 0;
  for (let k = 0; k <= 300; k++) {
    const v = rd(k, -k);
    const want = (k === 0) ? 1 : 0;
    if (v !== want) { bad++; if (bad <= 3) console.log('   boundary mismatch at k =', k, v, want); }
  }
  console.log(`\n(3) rightDiagonal k (-k) = initialConfig (-k) for k = 0..300: ${bad} mismatches`);
}

// the same for the flat-tower witness ...10101 | 000
{
  const M = 400;                       // positions -M..M
  let cur = new Uint8Array(2 * M + 1);
  for (let x = -M; x <= 0; x++) if (((-x) % 2) === 0) cur[x + M] = 1;   // 1 at 0,-2,-4,...
  const rowsF = [cur];
  for (let t = 1; t <= 300; t++) {
    const prev = rowsF[t - 1];
    const nxt = new Uint8Array(2 * M + 1);
    for (let i = 0; i < 2 * M + 1; i++) {
      const l = i - 1 >= 0 ? prev[i - 1] : (((M + 1 - i) % 2 === 0) ? 1 : 0), c = prev[i], r = i + 1 <= 2 * M ? prev[i + 1] : 0;
      nxt[i] = l ^ (c | r);
    }
    rowsF.push(nxt);
  }
  const cellF = (t, x) => rowsF[t][x + M];
  const rdF = (k, j) => { const t = j + k; if (t < 0 || t > 300) return null; return cellF(t, j); };
  const vals = [];
  for (let k = 0; k <= 12; k++) vals.push(rdF(k, -k));
  console.log(`    flat-tower witness ...10101|000: rightDiagonal k (-k) for k=0..12 = ${vals.join('')}`);
  console.log('    (the seed gives 1000000000000 -- this is the cone condition, and the witness fails it)');
  // and its right diagonals at non-negative index, for the record
  const r1 = []; for (let j = 0; j < 12; j++) r1.push(rdF(1, j));
  const r5 = []; for (let j = 0; j < 12; j++) r5.push(rdF(5, j));
  console.log(`    its rightDiagonal 1 = ${r1.join('')}, rightDiagonal 5 = ${r5.join('')}  (flat: (10)^inf)`);
}

// (4) does the BACKWARD recurrence run?  R_k(j) = R_k(j+1) XOR (R_{k-1}(j+1) | R_{k-2}(j+2))
{
  let bad = 0, tested = 0;
  for (let k = 2; k <= 200; k++) {
    for (let j = -k; j <= 100; j++) {
      const a = rd(k, j), b = rd(k, j + 1), c = rd(k - 1, j + 1), d = rd(k - 2, j + 2);
      if (a === null || b === null || c === null || d === null) continue;
      tested++;
      if (a !== (b ^ (c | d))) bad++;
    }
  }
  console.log(`\n(4) backward recurrence R_k(j) = R_k(j+1) XOR (R_{k-1}(j+1) | R_{k-2}(j+2))`);
  console.log(`    holds at ${tested} cells INCLUDING every negative index down to j = -k: ${bad} failures`);
}
