// Astrolabe, 2026-09-13.  Two questions the previous scripts raise.
//
// [M] Is rule 30 the MAXIMISER of d_n among the 256 elementary rules?  At
//     n = 6 and 7 it is fifth (rules 106,120,169,225 lead); at n = 8 it is
//     first.  This block settles n = 9.
//
// [S] Goles-Guillon-Rapaport's TRACED problem is the one problem in this field
//     that is literally about the centre column:
//        f^z(u,v) = 1  iff  the trace of  u . z0 . v  equals the target z.
//     The single seed is the entry u = 0^n, v = 0^n, z0 = 1, with z the seed's
//     own centre column.  This block measures the YES-set of f^z for THAT z:
//     its size, and whether it is a combinatorial RECTANGLE (a product set).
//     If it is a rectangle the traced complexity at the seed's own target is
//     O(1) and the model says nothing about the seed; if it is not, there is a
//     structure to look at.  This is the project's own crystal-40 family
//     question (which configurations produce the seed's centre column) asked
//     in the field's own vocabulary.
//
// Exact and exhaustive; no sampling.

const W32 = 32;
function ruleBit(rule, l, c, r) { return (rule >> (4 * l + 2 * c + r)) & 1; }

function distinctRows(rule, n, centre, swap) {
  const words = Math.max(1, (1 << n) / W32);
  const width = 2 * n + 1, origin = n;
  const freeMask = [];
  for (let k = 0; k < n; k++) {
    const m = new Uint32Array(words);
    for (let idx = 0; idx < 1 << n; idx++) if ((idx >> k) & 1) m[idx >>> 5] |= 1 << (idx & 31);
    freeMask.push(m);
  }
  const ONES = new Uint32Array(words).fill(0xffffffff | 0);
  const cur = [], nxt = [];
  for (let i = 0; i < width; i++) { cur.push(new Uint32Array(words)); nxt.push(new Uint32Array(words)); }
  const seen = new Set();
  for (let a = 0; a < 1 << n; a++) {
    for (let i = 0; i < width; i++) cur[i].fill(0);
    for (let k = 0; k < n; k++) {
      const fi = swap ? origin + 1 + k : k, gi = swap ? k : origin + 1 + k;
      if ((a >> k) & 1) cur[fi].set(ONES);
      cur[gi].set(freeMask[k]);
    }
    if (centre) cur[origin].set(ONES);
    let lo = 0, hi = width - 1, bg = 0;
    for (let t = 0; t < n; t++) {
      const nlo = lo + 1, nhi = hi - 1;
      for (let i = nlo; i <= nhi; i++) {
        const L = cur[i - 1], C = cur[i], R = cur[i + 1], O = nxt[i];
        O.fill(0);
        for (let nb = 0; nb < 8; nb++) {
          if (((rule >> nb) & 1) === 0) continue;
          const sl = (nb >> 2) & 1, sc = (nb >> 1) & 1, sr = nb & 1;
          for (let w = 0; w < words; w++) {
            const x = sl ? L[w] : ~L[w], y = sc ? C[w] : ~C[w], z = sr ? R[w] : ~R[w];
            O[w] |= x & y & z;
          }
        }
      }
      for (let i = nlo; i <= nhi; i++) cur[i].set(nxt[i]);
      bg = ruleBit(rule, bg, bg, bg); lo = nlo; hi = nhi;
    }
    seen.add(Buffer.from(cur[origin].buffer.slice(0)).toString('latin1'));
  }
  return seen.size;
}

// ------------------------------------------------------------------- [M]
console.log('[M] max d_n over all 256 elementary rules');
for (const n of [9]) {
  const defs = [];
  for (let rule = 0; rule < 256; rule++) {
    defs.push(Math.max(distinctRows(rule, n, 0, false), distinctRows(rule, n, 0, true),
      distinctRows(rule, n, 1, false), distinctRows(rule, n, 1, true)));
  }
  const sorted = defs.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
  console.log(`  n=${n}: ceiling ${1 << n}; rule 30 d_n = ${defs[30]}, rank ${sorted.findIndex((p) => p[1] === 30) + 1} of 256`);
  console.log('  top 10: ' + sorted.slice(0, 10).map((p) => p[1] + ':' + p[0]).join('  '));
  console.log('  at the ceiling: ' + (sorted[0][0] === (1 << n) ? sorted.filter((p) => p[0] === (1 << n)).map((p) => p[1]).join(',') : 'NONE'));
}

// ------------------------------------------------------------------- [S]
// plain scalar simulation: trace of the configuration u . z0 . v over cells
// -n..n with white outside, read at the origin for times 0..n.
function trace(rule, n, u, v, z0) {
  const width = 2 * n + 1;
  let cur = new Uint8Array(width);
  for (let k = 0; k < n; k++) { cur[k] = (u >> k) & 1; cur[n + 1 + k] = (v >> k) & 1; }
  cur[n] = z0;
  let out = String(cur[n]);
  let lo = 0, hi = width - 1, bg = 0;
  for (let t = 0; t < n; t++) {
    const nxt = new Uint8Array(width);
    const nlo = lo + 1, nhi = hi - 1;
    for (let i = nlo; i <= nhi; i++) nxt[i] = ruleBit(rule, cur[i - 1], cur[i], cur[i + 1]);
    cur = nxt; bg = ruleBit(rule, bg, bg, bg); lo = nlo; hi = nhi;
    out += String(cur[n]);
  }
  return out;
}

console.log('\n[S] the traced problem f^z at the SEED\'s own target z.');
console.log('    z = rule 30\'s centre column, times 0..n, from the single seed.');
console.log('  n   |z|   YES pairs   distinct nonempty rows   product set?   log2(YES)');
for (let n = 2; n <= 12; n++) {
  const z = trace(30, n, 0, 0, 1);
  const A = 1 << n;
  const rowsOf = new Map();
  let yes = 0;
  for (let u = 0; u < A; u++) {
    const bits = [];
    for (let v = 0; v < A; v++) if (trace(30, n, u, v, 1) === z) { bits.push(v); yes++; }
    if (bits.length) {
      const key = bits.join(',');
      rowsOf.set(key, (rowsOf.get(key) ?? 0) + 1);
    }
  }
  const nonEmptyRows = [...rowsOf.values()].reduce((a, b) => a + b, 0);
  const isProduct = rowsOf.size === 1;
  console.log('  ' + String(n).padStart(2) + String(z.length).padStart(6) + String(yes).padStart(12) +
    String(rowsOf.size).padStart(24) + '   ' + (isProduct ? 'YES (rectangle)' : 'no ').padEnd(16) +
    (yes ? Math.log2(yes).toFixed(3) : '-').padStart(8) + `   nonemptyrows=${nonEmptyRows}  z=${z}`);
}

console.log('\n[S2] the same for the linear control (rule 90) and for rule 45.');
for (const rule of [90, 150, 45]) {
  for (const n of [8, 10]) {
    const z = trace(rule, n, 0, 0, 1);
    const A = 1 << n;
    const rowsOf = new Map(); let yes = 0;
    for (let u = 0; u < A; u++) {
      const bits = [];
      for (let v = 0; v < A; v++) if (trace(rule, n, u, v, 1) === z) { bits.push(v); yes++; }
      if (bits.length) rowsOf.set(bits.join(','), (rowsOf.get(bits.join(',')) ?? 0) + 1);
    }
    console.log(`  rule ${rule} n=${n}: YES=${yes}, distinct nonempty rows=${rowsOf.size}, product=${rowsOf.size === 1}, z=${z}`);
  }
}
