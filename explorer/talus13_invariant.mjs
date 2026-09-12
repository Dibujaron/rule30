// Talus, 2026-09-12.  Three tests the topic asked for, on w = 011.
//
// [P] The brief's own hope: an invariant on the pair (col(-3k-1), col(-3k)).
//     C_1 = (x_m, 0, 1) and C_4 = (y_m, 0, 1) with y_m = x_m + x_{m+1} + 1, so
//     the SHAPE (.,0,1) repeats once.  Does it repeat again?  Which columns have
//     a shape at all -- i.e. which of the three residues of a column are constant
//     in m, and which are functions of a bounded number of free bits?
// [L] Is the image of the cone map an affine subspace, or does it carry any
//     affine relation among the W_k at all?  An affine image would make the rung
//     linear algebra.
// [C] The rule control.  The leftward solve needs LEFT-PERMUTIVITY, so the honest
//     population is the 16 left-permutive elementary rules, not all 256:
//     R(l,c,r) = l XOR g(c,r), g one of 16 functions.  Rule 30 is g = c OR r.

const P = 3, W = [0, 1, 1];

// ---------------------------------------------------------------------------
// a left-permutive rule is l XOR g(c,r); g is 4 bits g00,g01,g10,g11.
// forward:  new(i) = c(i-1) XOR g(c(i), c(i+1))
// leftward: c(i-1)  = new(i) XOR g(c(i), c(i+1))
// The column-1 bit r(t) is INVISIBLE at time t iff g(c(t),0) = g(c(t),1).
// ---------------------------------------------------------------------------
function ruleNumber(g) {           // Wolfram number of l XOR g(c,r)
  let n = 0;
  for (let idx = 0; idx < 8; idx++) {
    const l = (idx >> 2) & 1, c = (idx >> 1) & 1, r = idx & 1;
    const out = l ^ g[c * 2 + r];
    if (out) n |= 1 << idx;
  }
  return n;
}
const G30 = [0, 1, 1, 1];
console.log(`[C0] sanity: g = c OR r gives rule ${ruleNumber(G30)} (want 30);`);
console.log(`     g = r gives ${ruleNumber([0, 1, 0, 1])} (want 90); g = c XOR r gives ${ruleNumber([0, 1, 1, 0])} (want 150);`);
console.log(`     g = c gives ${ruleNumber([0, 0, 1, 1])} (want 60).`);

// columns of the left solve for a general left-permutive rule
function solveTriangle(g, word, xbits, K, T) {
  const p = word.length;
  const C = [];
  for (let k = 0; k <= K + 1; k++) C.push(new Uint8Array(T + 3));
  for (let t = 0; t <= T + 2; t++) C[0][t] = word[t % p];
  for (let t = 0; t + 1 <= T + 1; t++) {
    const r = xbits(t);
    C[1][t] = C[0][(t + 1) % p] ^ g[C[0][t % p] * 2 + r];
  }
  for (let k = 2; k <= K; k++)
    for (let t = 0; t + k <= T + 1; t++) C[k][t] = C[k - 1][t + 1] ^ g[C[k - 1][t] * 2 + C[k - 2][t]];
  return C;
}

// ---------------------------------------------------------------------------
// [P] the shape of each column
// ---------------------------------------------------------------------------
console.log(`\n[P] the shape of column -k, as a function of the period residue.`);
console.log(`    For each k and each residue s in {0,1,2}, is C_k[3m+s] the same for`);
console.log(`    every m and every assignment (a CONSTANT), and how many free bits`);
console.log(`    x_0..x_{M-1} does C_k[0] actually read?  The (.,0,1) shape of C_1 and`);
console.log(`    C_4 is "residues 1 and 2 constant".`);
{
  const M = 10, T = 3 * M, KM = 22;
  const samples = [];
  for (let v = 0; v < (1 << M); v++) {
    const x = []; for (let i = 0; i < M; i++) x.push((v >> i) & 1);
    samples.push(solveTriangle(G30, W, (t) => (t % 3 === 0 ? (1 ^ (x[(t / 3) | 0] ?? 0)) : 0), KM, T));
  }
  console.log(`    k   residue0   residue1   residue2      shape`);
  for (let k = 1; k <= KM; k++) {
    const info = [];
    for (let s = 0; s < 3; s++) {
      // constant across m and across assignments?
      let v0 = null, cst = true;
      for (const C of samples) for (let m = 0; 3 * m + s + k <= T; m++) {
        const v = C[k][3 * m + s];
        if (v0 === null) v0 = v; else if (v !== v0) { cst = false; }
      }
      info.push(cst ? `const ${v0}` : "varies ");
    }
    const shape = (info[1].startsWith("const") && info[2].startsWith("const"))
      ? `(.,${info[1].slice(6)},${info[2].slice(6)})` : "";
    console.log(`   ${String(k).padStart(2)}   ${info[0]}    ${info[1]}    ${info[2]}      ${shape}`);
  }
}

// ---------------------------------------------------------------------------
// [L] affine relations in the image
// ---------------------------------------------------------------------------
console.log(`\n[L] is the image of the cone map an affine subspace of {0,1}^K?`);
console.log(`    (It has exactly 2^ceil(K/3) points, so it COULD be one.)`);
{
  const M = 12, T = 3 * M, KM = 30;
  const rows = [];
  for (let v = 0; v < (1 << M); v++) {
    const x = []; for (let i = 0; i < M; i++) x.push((v >> i) & 1);
    const C = solveTriangle(G30, W, (t) => (t % 3 === 0 ? (1 ^ (x[(t / 3) | 0] ?? 0)) : 0), KM, T);
    const w = []; for (let k = 1; k <= KM; k++) w.push(C[k][0]);
    rows.push(w);
  }
  console.log(`    K   |image|   closed under u+v+w?   #independent affine relations`);
  for (let K = 3; K <= KM; K += 3) {
    const set = new Set(rows.map((w) => w.slice(0, K).join("")));
    const list = [...set].map((s) => { let v = 0n; for (let i = 0; i < K; i++) if (s[i] === "1") v |= 1n << BigInt(i); return v; });
    let closed = true;
    const S = new Set(list.map(String));
    for (let i = 0; closed && i < list.length && i < 40; i++)
      for (let j = 0; closed && j < list.length && j < 40; j++)
        for (let l = 0; closed && l < list.length && l < 40; l++)
          if (!S.has(String(list[i] ^ list[j] ^ list[l]))) closed = false;
    // affine relations: vectors a with <a, w> constant over the image
    let rel = 0;
    // brute force over small K only
    if (K <= 18) {
      for (let a = 1; a < (1 << K); a++) {
        let val = null, ok = true;
        for (const w of rows) {
          let s = 0; for (let i = 0; i < K; i++) if (a & (1 << i)) s ^= w[i];
          if (val === null) val = s; else if (s !== val) { ok = false; break; }
        }
        if (ok) rel++;
      }
      rel = rel > 0 ? Math.log2(rel + 1) : 0;   // #relations counted as a space
    }
    console.log(`   ${String(K).padStart(2)}  ${String(set.size).padStart(8)}   ${closed ? "YES" : "no "}                  ${K <= 18 ? rel.toFixed(0) + " (of " + (K - Math.ceil(K / 3)) + " a subspace would have)" : "(not computed)"}`);
  }
}

// ---------------------------------------------------------------------------
// [C] the 16 left-permutive rules
// ---------------------------------------------------------------------------
console.log(`\n[C] the 16 left-permutive elementary rules on the SAME system: centre`);
console.log(`    column pinned to 011, column 1 free, row 0 white past -a, black at -a.`);
console.log(`    "rate" = meaningful free bits per period.  D(a) at a = 6, 9, 12.`);
function coneDepthG(g, word, a, JMAX, budget) {
  const p = word.length;
  const C = [];
  for (let k = 0; k <= JMAX + 3; k++) C.push(new Uint8Array(JMAX + 3));
  for (let t = 0; t <= JMAX + 2; t++) C[0][t] = word[t % p];
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  const ok0 = (k, v) => (k > a ? v === 0 : k === a ? v === 1 : true);
  function rec(j) {
    if (j > best) best = j;
    if (j > JMAX) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    const c = word[j % p];
    const branch = (g[c * 2 + 0] === g[c * 2 + 1]) ? [0] : [0, 1];   // invisible bit
    for (const b of branch) {
      let good = true;
      C[1][j] = C[0][(j + 1) % p] ^ g[c * 2 + b];
      if (j === 0 && !ok0(1, C[1][0])) good = false;
      for (let k = 2; good && k <= j + 1; k++) {
        const t = j - k + 1;
        C[k][t] = C[k - 1][t + 1] ^ g[C[k - 1][t] * 2 + C[k - 2][t]];
        if (t === 0 && !ok0(k, C[k][0])) good = false;
      }
      if (good) rec(j + 1);
    }
  }
  try { rec(0); } catch (e) { if (e !== AB) throw e; }
  return { best, status };
}
console.log(`    rule   g(00,01,10,11)  rate   D(6)   D(9)   D(12)`);
const lines = [];
for (let gi = 0; gi < 16; gi++) {
  const g = [(gi >> 3) & 1, (gi >> 2) & 1, (gi >> 1) & 1, gi & 1];
  const n = ruleNumber(g);
  let rate = 0;
  for (let t = 0; t < P; t++) { const c = W[t]; if (g[c * 2 + 0] !== g[c * 2 + 1]) rate++; }
  const out = [6, 9, 12].map((a) => { const r = coneDepthG(g, W, a, 300, 2e8); return r.status === "exact" ? String(r.best) : r.status; });
  lines.push({ n, g: g.join(""), rate, out });
}
lines.sort((p, q) => p.rate - q.rate || p.n - q.n);
for (const L of lines)
  console.log(`   ${String(L.n).padStart(5)}   ${L.g}            ${L.rate}/3   ${L.out.map((v) => String(v).padStart(5)).join("  ")}${L.n === 30 ? "   <- rule 30" : ""}`);
