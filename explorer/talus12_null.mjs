// Talus, 2026-09-12.  What else could have produced |L| = 0?
//
// The claim is that for rule 30 the cone constraints on the leftward solve are
// UNSATISFIABLE -- no column-1 prefix at all keeps the picture white outside the
// cone, once the centre column is pinned to a periodic word.  Counting says the
// opposite: T unknowns (the bits of column 1) against T-2-a constraints (one per
// column -k, k > a, read at time 0), so 2^(a+2) solutions are expected, and
// rules 90 and 150 hit that number exactly.  An empty set is therefore a
// 2^-2^(a+2)-ish event under a random model -- but a random model of WHAT?
//
// The null used here is a population rather than a model: the leftward step for
// rule 30 is one particular Boolean function of three arguments,
//     col(-(k+1))[t] = G( col(-k)[t+1], col(-k)[t], col(-(k-1))[t] ),
//     G(x,y,z) = x XOR (y OR z),
// and there are 256 such functions.  Run the same computation with each of them
// and see how many give an empty L.

function leftCount(G, col0, col1bits, a, T) {
  // columns as arrays; returns true if this column-1 prefix survives
  let ci = col0.slice(0, T);
  let cip = col1bits.slice(0, T);
  for (let k = 1; k <= T - 2; k++) {
    const n = ci.length - 1;
    if (n <= 0) break;
    const cim = new Array(n);
    for (let t = 0; t < n; t++) cim[t] = G(ci[t + 1], ci[t], cip[t]);
    if (k > a && cim[0] === 1) return false;
    cip = ci; ci = cim;
  }
  return true;
}

const fnOf = (idx) => (x, y, z) => (idx >> ((x << 2) | (y << 1) | z)) & 1;
const periodic = (w, T) => { const c = []; for (let t = 0; t < T; t++) c.push(w[t % w.length]); return c; };
const show = (w) => w.join("");

// rule 30's own leftward step, as an index into the 256
let RULE30_IDX = 0;
for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) {
  const v = x ^ (y | z);
  if (v) RULE30_IDX |= 1 << ((x << 2) | (y << 1) | z);
}
console.log(`[N] rule 30's leftward step  G(x,y,z) = x XOR (y OR z)  is function #${RULE30_IDX} of 256.`);
console.log(`    |L| for each of the 256 three-argument Boolean functions in its place.`);

for (const [word, a, T] of [[[0, 1, 1], 3, 16], [[1, 0, 0], 3, 16], [[0, 1], 5, 16], [[0, 1, 1], 6, 16], [[1, 1, 1, 0], 3, 16]]) {
  const col0 = periodic(word, T);
  const counts = [];
  for (let idx = 0; idx < 256; idx++) {
    const G = fnOf(idx);
    let n = 0;
    for (let v = 0; v < (1 << T); v++) {
      const b = []; for (let t = 0; t < T; t++) b.push((v >> t) & 1);
      if (leftCount(G, col0, b, a, T)) n++;
    }
    counts.push(n);
  }
  const zero = counts.filter((c) => c === 0).length;
  const expected = Math.pow(2, a + 2);
  const atLeastExp = counts.filter((c) => c >= expected).length;
  const sorted = [...counts].sort((x, y) => x - y);
  console.log(`\n    w=${show(word)} a=${a} T=${T}:  rule 30 gives |L| = ${counts[RULE30_IDX]}`);
  console.log(`      of the 256 functions, ${zero} give 0, ${atLeastExp} give at least the counted`);
  console.log(`      expectation 2^(a+2) = ${expected}; median ${sorted[128]}, max ${sorted[255]}`);
}
