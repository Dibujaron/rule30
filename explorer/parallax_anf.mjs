/**
 * Parallax / connect: the normal form of the centre cell modulo the ideal.
 *
 * In the "downward" order the T relations
 *     R(t,x) = y(t+1,x) + y(t,x-1) + y(t,x) + y(t,x+1) + y(t,x)*y(t,x+1)
 * have leading terms y(t+1,x) -- pairwise coprime distinct variables -- so by
 * Buchberger's first criterion they ARE a reduced Groebner basis and reduction
 * modulo them is just forward substitution. The normal form of y(t,0) is
 * therefore a polynomial in the row-0 variables y(0,-t..t) alone, and this
 * script computes it: its degree, its number of monomials, and whether the top
 * monomial (all 2t+1 variables) is present.
 *
 * That degree is the "algebraic degree" of the Boolean function
 * (initial row of width 2t+1) |-> (centre cell at time t), which is exactly
 * the quantity an algebraic attack in the Courtois-Meier sense needs to be
 * small. For the LINEAR rules 90 and 150 it is 1 at every t, by construction.
 *
 * Method: bit-slice over all 2^(2t+1) initial rows at once (each cell's truth
 * table is a bitset over assignments), then a Moebius transform of the centre
 * cell's truth table gives the algebraic normal form.
 */

const TMAX = Number(process.env.PARALLAX_TMAX ?? 11);

/** truth table (as Uint8Array of 0/1, length 2^v) of the centre cell at time t */
function centreTruthTable(t, rule = 30) {
  const v = 2 * t + 1;                  // variables: cells x = -t..t
  const N = 1 << v;                     // assignments
  const W = N >>> 5;                    // words per bitset
  // row s holds cells x = -(t-s) .. (t-s); index them 0..2(t-s)
  let cur = [];
  for (let j = 0; j < v; j++) {
    const b = new Uint32Array(W);
    for (let i = 0; i < N; i++) if ((i >>> j) & 1) b[i >>> 5] |= 1 << (i & 31);
    cur.push(b);
  }
  const T = []; for (let n = 0; n < 8; n++) T.push((rule >> n) & 1);
  for (let s = 0; s < t; s++) {
    const next = [];
    for (let j = 1; j < cur.length - 1; j++) {
      const l = cur[j - 1], c = cur[j], r = cur[j + 1];
      const o = new Uint32Array(W);
      if (rule === 30) {
        for (let w = 0; w < W; w++) o[w] = l[w] ^ (c[w] | r[w]);
      } else {
        for (let w = 0; w < W; w++) {
          let acc = 0;
          for (let n = 0; n < 8; n++) {
            if (!T[n]) continue;
            const bl = (n >> 2) & 1, bc = (n >> 1) & 1, br = n & 1;
            let m = 0xffffffff;
            m &= bl ? l[w] : ~l[w]; m &= bc ? c[w] : ~c[w]; m &= br ? r[w] : ~r[w];
            acc |= m;
          }
          o[w] = acc >>> 0;
        }
      }
      next.push(o);
    }
    cur = next;
  }
  const bits = cur[0];                  // the single surviving cell: x = 0 at time t
  const tt = new Uint8Array(N);
  for (let i = 0; i < N; i++) tt[i] = (bits[i >>> 5] >>> (i & 31)) & 1;
  return { tt, v };
}

/** in-place Moebius transform: truth table -> algebraic normal form */
function moebius(tt, v) {
  const N = 1 << v;
  for (let j = 0; j < v; j++) {
    const step = 1 << j;
    for (let i = 0; i < N; i++) if (i & step) tt[i] ^= tt[i ^ step];
  }
}

function popcount(x) { let c = 0; while (x) { c += x & 1; x >>>= 1; } return c; }

console.log('--- A. check: the linear rules must have algebraic degree 1 ---');
for (const rule of [90, 150, 60, 102]) {
  const out = [];
  for (let t = 1; t <= 5; t++) {
    const { tt, v } = centreTruthTable(t, rule);
    moebius(tt, v);
    let deg = 0, terms = 0;
    for (let i = 0; i < (1 << v); i++) if (tt[i]) { terms++; deg = Math.max(deg, popcount(i)); }
    out.push(`t=${t}: deg ${deg}, ${terms} terms`);
  }
  console.log(`  rule ${String(rule).padStart(3)}  ${out.join('   ')}`);
}

console.log('\n--- B. rule 30: degree of the centre cell in the initial row ---');
console.log('  t   vars   degree   monomials   frac of 2^vars   top monomial present?');
for (let t = 1; t <= TMAX; t++) {
  const { tt, v } = centreTruthTable(t, 30);
  moebius(tt, v);
  const N = 1 << v;
  let deg = 0, terms = 0;
  const byDeg = new Array(v + 1).fill(0);
  for (let i = 0; i < N; i++) if (tt[i]) { terms++; const p = popcount(i); byDeg[p]++; if (p > deg) deg = p; }
  console.log(`  ${String(t).padStart(2)}   ${String(v).padStart(4)}   ${String(deg).padStart(6)}` +
    `   ${String(terms).padStart(9)}   ${(terms / N).toFixed(4)}          ` +
    `${tt[N - 1] ? 'yes' : 'no'}`);
  // which monomials realise the top degree? variable j is the cell at x = j - t
  const tops = [];
  for (let i = 0; i < N; i++) if (tt[i] && popcount(i) === deg) {
    const missing = [];
    for (let j = 0; j < v; j++) if (!((i >>> j) & 1)) missing.push(j - t);
    tops.push(`all cells except x = {${missing.join(',')}}`);
  }
  console.log(`       top-degree monomials: ${tops.join(' ; ')}`);
  if (t === TMAX) {
    console.log(`      monomials by degree: ${byDeg.map((c, d) => `${d}:${c}`).join(' ')}`);
  }
}

console.log('\n--- C. the same for the cell at x = 1 and x = -1 is not computed; ' +
  'the point is the centre. ---');
