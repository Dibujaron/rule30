// Talus, 2026-09-08. Verification for talus_halfline.mjs.
//
// Three checks, in this order:
//   (A) the bit-packed half-line engine, fed the seed's own centre column as
//       its boundary, reproduces the seed's right half cell for cell;
//   (B) an independent BigInt implementation of the same half-line agrees with
//       the bit-packed one on random periodic boundaries;
//   (C) the eventual periods reported by the sweep, re-measured directly and
//       to greater depth, with the actual onset printed.

// ---------------------------------------------------- bit-packed half-line
function halfline(b, T, ncols) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W);
  let s = new Uint32Array(W);
  const cols = [];
  for (let k = 0; k < ncols; k++) cols.push(new Uint8Array(T));
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    for (let k = 0; k < ncols; k++) {
      const x = k + 1;
      cols[k][t] = (r[x >> 5] >>> (x & 31)) & 1;
    }
    const last = Math.min(W - 2, (t >> 5) + 1);
    for (let i = 0; i <= last; i++) {
      const cur = r[i];
      const up = (cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0);
      const down = (cur >>> 1) | (r[i + 1] << 31);
      s[i] = up ^ (cur | down);
    }
    s[last + 1] = 0;
    s[0] = (s[0] & ~1) | (b[(t + 1) % p] & 1);
    const tmp = r; r = s; s = tmp;
  }
  return cols;
}

// -------------------------------------------------- independent BigInt one
function halflineBig(b, T, ncols) {
  const p = b.length;
  const cols = [];
  for (let k = 0; k < ncols; k++) cols.push(new Uint8Array(T));
  let r = BigInt(b[0] & 1);
  for (let t = 0; t < T; t++) {
    for (let k = 0; k < ncols; k++) cols[k][t] = Number((r >> BigInt(k + 1)) & 1n);
    let n = (r << 1n) ^ (r | (r >> 1n));
    n = (n & ~1n) | BigInt(b[(t + 1) % p] & 1);
    r = n;
  }
  return cols;
}

// ------------------------------------------------------- the seed, on ints
function seedRows(T) {
  const rows = [];
  let r = 1n; // row 0, bit x = position x - t; here we keep the whole row
  // full-line seed: bit i of r is position i - t
  for (let t = 0; t < T; t++) {
    rows.push(r);
    r = (r << 1n) ^ (r | (r >> 1n));
    // the row grows one cell on each side each step; with bit i = position
    // i - t, a step shifts the frame, so re-normalise below.
  }
  return rows;
}

console.log('(A) engine against the seed');
{
  // seed picture, bit i of row t is position i - t
  const T = 400;
  let r = 1n;
  const centre = [];
  const rightHalf = []; // rightHalf[t][k] = cell (t, k+1)
  for (let t = 0; t < T; t++) {
    centre.push(Number((r >> BigInt(t)) & 1n));
    const row = [];
    for (let k = 0; k < 8; k++) row.push(Number((r >> BigInt(t + k + 1)) & 1n));
    rightHalf.push(row);
    r = (r << 2n) ^ ((r << 1n) | r); // shift frame: new bit i is position i-(t+1)
  }
  const cols = halfline(centre, T, 8);
  let bad = 0;
  for (let t = 0; t < T; t++) {
    for (let k = 0; k < 8; k++) if (cols[k][t] !== rightHalf[t][k]) bad++;
  }
  console.log(`  centre column starts ${centre.slice(0, 20).join('')}`);
  console.log(`  mismatches over ${T} rows x 8 columns: ${bad}`);
}

console.log('');
console.log('(B) bit-packed against BigInt, 40 random boundaries, T=1500, 6 columns');
{
  let bad = 0;
  for (let trial = 0; trial < 40; trial++) {
    const p = 3 + (trial % 10);
    const b = [];
    for (let i = 0; i < p; i++) b.push(Math.random() < 0.5 ? 1 : 0);
    const a = halfline(b, 1500, 6);
    const c = halflineBig(b, 1500, 6);
    for (let k = 0; k < 6; k++) for (let t = 0; t < 1500; t++) if (a[k][t] !== c[k][t]) bad++;
  }
  console.log(`  mismatches: ${bad}`);
}

console.log('');
console.log('(C) re-measuring the sweep survivors and non-survivors at T=60000');
{
  const T = 60000;
  const cases = [
    '1', '0', '10', '11', '100', '110', '1000', '1010', '1110',
    '10000', '100000', '1000000', '10000000', '100000000', '1000000000',
    '1011100010', '1111001100', '11100110', '01110011', '1000101111',
  ];
  console.log('  b            col   least eventual period (multiple of |b|, <=64|b|)  onset');
  for (const s of cases) {
    const b = s.split('').map(Number);
    const p = b.length;
    const cols = halfline(b, T, 3);
    for (let k = 0; k < 3; k++) {
      const col = cols[k];
      let found = 0, onset = -1;
      for (let m = 1; m <= 64; m++) {
        const q = m * p;
        if (q * 4 > T) break;
        let lf = -1;
        for (let t = T - q - 1; t >= 0; t--) if (col[t + q] !== col[t]) { lf = t; break; }
        if (lf < T / 4) { found = q; onset = lf + 1; break; }
      }
      console.log(`  ${s.padEnd(12)} ${k + 1}     ${found === 0 ? 'none' : found}   ${found === 0 ? '' : onset}`);
    }
  }
}
