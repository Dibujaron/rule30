// Talus, 2026-09-08. The residue decomposition of the two walls.
//
// Suppose column 0 is periodic with period p from N. Then each residue class
// mod p is uniformly black or uniformly white past N, and two proved board
// nodes split the neighbours of the axis along that partition:
//
//   column_succ_of_black : at a BLACK time, column -1 = !column 0 at t+1
//                          -- an explicitly periodic value; column 1 is absent
//                          from the rule at the origin there.
//   column_one_of_white  : at a WHITE time, column 1 = column 0 (t+1) xor
//                          column -1 (t) -- the two neighbours determine each
//                          other.
//
// So: column -1 is eventually periodic  <=>  column 1 restricted to the WHITE
// residues is; and column 1 is eventually periodic  <=>  that, AND column 1
// restricted to the BLACK residues is too. The frontier wall (some column) is
// the first; the strong wall (column 1) is the first plus the second. The black
// residues of column 1 are free of the frontier wall entirely.
//
// This script checks the two identities hold in the family (a guard against an
// orientation error, since both are theorems), and then measures the two halves
// separately, so the gap between the walls is visible as a number.

const T = 300000;
const QMAX = 8000;

function halfline(b, T) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W);
  let s = new Uint32Array(W);
  const col = new Uint8Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    col[t] = (r[0] >>> 1) & 1;
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
  return col;
}

function ep(col, len, QMAX, lo) {
  for (let q = 1; q <= QMAX; q++) {
    let ok = true;
    for (let t = lo; t + q < len; t++) if (col[t + q] !== col[t]) { ok = false; break; }
    if (ok) return q;
  }
  return 0;
}

const cases = ['10', '110', '100000', '11100110', '11111110', '10111111', '1000', '1000000000', '1'];
console.log(`T=${T}, lags <= ${QMAX}, onset <= ${T >> 1}`);
console.log('');
console.log('b            white  identity  col-1 EP  col+1 EP  col+1 on white  col+1 on black');
for (const s of cases) {
  const b = s.split('').map(Number);
  const p = b.length;
  const c1 = halfline(b, T);
  const cm = new Uint8Array(T - 1);
  for (let t = 0; t + 1 < T; t++) cm[t] = b[(t + 1) % p] ^ (b[t % p] | c1[t]);
  // guard: the two board identities, on every row
  let bad = 0;
  for (let t = 0; t + 1 < T; t++) {
    if (b[t % p] === 1) { if (cm[t] !== (1 - b[(t + 1) % p])) bad++; }
    else { if (c1[t] !== (b[(t + 1) % p] ^ cm[t])) bad++; }
  }
  const whites = [];
  for (let r = 0; r < p; r++) if (b[r] === 0) whites.push(r);
  // column 1 read along each residue class, as its own sequence
  function subEP(residues) {
    if (residues.length === 0) return 'n/a';
    for (const r of residues) {
      const sub = new Uint8Array(Math.floor((T - r) / p));
      for (let k = 0; k < sub.length; k++) sub[k] = c1[r + k * p];
      if (ep(sub, sub.length, Math.min(QMAX, sub.length >> 2), sub.length >> 1) === 0) return 'none';
    }
    return 'periodic';
  }
  const blacks = [];
  for (let r = 0; r < p; r++) if (b[r] === 1) blacks.push(r);
  console.log(
    `${s.padEnd(12)} ${String(whites.length).padEnd(6)} ${(bad === 0 ? 'ok' : `${bad} FAIL`).padEnd(9)} ` +
    `${(ep(cm, T - 1, QMAX, T >> 1) || 'none').toString().padEnd(9)} ${(ep(c1, T, QMAX, T >> 1) || 'none').toString().padEnd(9)} ` +
    `${subEP(whites).padEnd(15)} ${subEP(blacks)}`
  );
}
console.log('');
console.log('"white" is how many of the p residues have a white boundary cell.');
console.log('"identity" checks column_succ_of_black on every black time and');
console.log('column_one_of_white on every white time, over all T rows.');
