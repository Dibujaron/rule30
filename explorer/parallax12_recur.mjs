// Parallax 12 / C. Skolem-Mahler-Lech, and whether the orbit is a linear
// recurrence sequence at all.
//
// Derksen (Invent. Math. 168 (2007) 175-224, arXiv:math/0510583) proves the
// positive-characteristic analogue of Skolem-Mahler-Lech: the zero set of a
// linear recurrence sequence over a field of characteristic p is described by a
// finite automaton (p-normal / p-automatic). That is a theorem about ONE named
// sequence with an explicitly computable answer -- exactly the shape this
// vantage was chosen for -- and a column of a cellular automaton is literally a
// zero set of the orbit sequence, coordinate by coordinate.
//
// Its one hypothesis is that the sequence satisfies a LINEAR recurrence. So:
// does the sequence of rows satisfy one?
//
// Measured: the least L such that row_{t+L} = sum c_i row_{t+i} over F_2 holds
// for every t in the sample and every coordinate, with the linear rules as
// controls (where L <= n is forced by Cayley-Hamilton) and a coin null.

const table = (rule) => { const t = []; for (let k = 0; k < 8; k++) t.push((rule >> k) & 1); return t; };
const apply = (tb, l, c, r) => tb[4 * l + 2 * c + r];
const bitsOf = (r, n) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = Number((r >> BigInt(i)) & 1n); return b; };
function stepBits(tb, b) {
  const n = b.length, o = new Uint8Array(n);
  for (let i = 0; i < n; i++) o[i] = apply(tb, i >= 2 ? b[i - 2] : 0, i >= 1 ? b[i - 1] : 0, b[i]);
  return o;
}
function xs32(seed) { let s = seed | 0; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; }

// rows: array of Uint8Array(n).  Find least L <= Lmax with a linear recurrence
// holding on every (t, coordinate) available.  Unknowns c_0..c_{L-1}; equation
// per (t,j):  sum_i c_i rows[t+i][j]  =  rows[t+L][j].
function leastRecurrence(rows, n, Lmax) {
  const m = rows.length;
  for (let L = 1; L <= Lmax; L++) {
    if (m - L < 2) break;
    // Gaussian elimination over F_2 on equations packed as BigInt (L coeff bits
    // plus one RHS bit at position L).
    const pivots = new Array(L).fill(null);
    let inconsistent = false;
    for (let t = 0; t + L < m && !inconsistent; t++) {
      for (let j = 0; j < n; j++) {
        let eq = 0n;
        for (let i = 0; i < L; i++) if (rows[t + i][j]) eq ^= 1n << BigInt(i);
        if (rows[t + L][j]) eq ^= 1n << BigInt(L);
        // reduce
        for (let c = 0; c < L; c++) {
          if ((eq >> BigInt(c)) & 1n) {
            if (pivots[c] === null) { pivots[c] = eq; eq = 0n; break; }
            eq ^= pivots[c];
          }
        }
        if (eq === (1n << BigInt(L))) { inconsistent = true; break; } // 0 = 1
      }
    }
    if (!inconsistent) return L;
  }
  return null;
}

console.log("== C1  least linear recurrence order of the row sequence over F_2 ==");
console.log("    (rows from the single seed; Lmax = 120; 260 rows sampled)");
for (const n of [16, 32, 64]) {
  for (const rule of [90, 150, 60, 30, 110, 86, 45]) {
    const tb = table(rule);
    let b = bitsOf(1n, n);
    const rows = [];
    for (let t = 0; t < 260; t++) { rows.push(b.slice()); b = stepBits(tb, b); }
    const L = leastRecurrence(rows, n, 120);
    console.log(`  n=${String(n).padStart(3)} rule ${String(rule).padStart(3)}  least L = ${L === null ? "none <= 120" : L}`);
  }
  console.log("");
}

console.log("== C2  the null: an i.i.d. coin sequence of rows, same shape ==");
for (const n of [16, 32, 64]) {
  const rnd = xs32(7717 + n);
  const rows = [];
  for (let t = 0; t < 260; t++) { const x = new Uint8Array(n); for (let i = 0; i < n; i++) x[i] = rnd() < 0.5 ? 1 : 0; rows.push(x); }
  const L = leastRecurrence(rows, n, 120);
  console.log(`  n=${String(n).padStart(3)} coin       least L = ${L === null ? "none <= 120" : L}`);
}

console.log("\n== C3  a positive control: a genuine linear recurrence, order 5 over F_2 ==");
{
  // v_{t+5} = v_{t+2} + v_t, coordinatewise, from random seeds: L must be <= 5.
  const n = 32, rnd = xs32(4242);
  const rows = [];
  for (let t = 0; t < 5; t++) { const x = new Uint8Array(n); for (let i = 0; i < n; i++) x[i] = rnd() < 0.5 ? 1 : 0; rows.push(x); }
  for (let t = 5; t < 260; t++) {
    const x = new Uint8Array(n);
    for (let i = 0; i < n; i++) x[i] = rows[t - 3][i] ^ rows[t - 5][i];
    rows.push(x);
  }
  console.log(`  n=32 planted order-5 recurrence   least L = ${leastRecurrence(rows, n, 120)}  (expected 5)`);
}
