// Talus, 2026-09-12.  What the left-only system actually is, for w = 011.
//
// THE CONE WORD.  Pin the centre column to w and choose column +1.  The leftward
// solve then reconstructs row 0 to the left of the origin:
//      W_k := C_k[0] = cell(-k, 0),   k = 1, 2, 3, ...
// So the cone word IS row 0 read leftward, and the rung's question is exactly
//      "is  0^(a-1) 1 0^infinity  in the image of  x |-> W(x) ?"
// The free bits x_m are column 1 at the WHITE times of w -- one per period for
// 011, because a black centre cell swallows column 1 through the OR.
//
// Four measurements:
//  [D] D(a), the deepest column the target word is matched to, exactly.
//  [I] |image of W restricted to length K| -- how sparse the image is.
//  [N] the Nerode width of the image language at each depth: the number of
//      distinct residual languages, i.e. how much memory a finite-state
//      invariant would need.  Bounded => an invariant exists.
//  [R] what achievable cone words look like: zero-run lengths, density.

const P3 = [[0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0]];
const show = (w) => w.join("");

// --------------------------------------------------------------------------
// [D] exact D(a).  D(a) = the largest K with the constraints at columns 1..K
//     simultaneously satisfiable, where column k < a is free, column a is black
//     and column k > a is white.  Off-by-one fixed: at entry to rec(j) the
//     columns 1..j have been tested and passed.
// --------------------------------------------------------------------------
function coneDepth(word, a, JMAX, budget) {
  const p = word.length;
  const C = [];
  for (let k = 0; k <= JMAX + 3; k++) C.push(new Uint8Array(JMAX + 3));
  for (let t = 0; t <= JMAX + 2; t++) C[0][t] = word[t % p];
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  const ok0 = (k, v) => (k > a ? v === 0 : k === a ? v === 1 : true);
  function rec(j) {                       // columns 1..j already satisfied
    if (j > best) best = j;
    if (j > JMAX) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    const branch = word[j % p] === 0 ? [0, 1] : [0];
    for (const b of branch) {
      let good = true;
      C[1][j] = C[0][(j + 1) % p] ^ (C[0][j % p] | b);
      if (j === 0 && !ok0(1, C[1][0])) good = false;
      for (let k = 2; good && k <= j + 1; k++) {
        const t = j - k + 1;
        C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
        if (t === 0 && !ok0(k, C[k][0])) good = false;
      }
      if (good) rec(j + 1);
    }
  }
  try { rec(0); } catch (e) { if (e !== AB) throw e; }
  return { best, status, nodes };
}

console.log(`[D] D(a), exact, for the six primitive period-3 words.  a = 1..40.`);
const Dtab = {};
for (const w of P3) {
  const row = [];
  for (let a = 1; a <= 40; a++) {
    const r = coneDepth(w, a, 600, 6e8);
    row.push(r.status === "exact" ? r.best : r.status);
  }
  Dtab[show(w)] = row;
  console.log(`    w=${show(w)}  ${row.map((v) => String(v).padStart(4)).join("")}`);
}
{
  const row = Dtab["011"];
  let worst = 0, worstA = 0;
  for (let a = 1; a <= 40; a++) if (typeof row[a - 1] === "number") {
    const r = row[a - 1] / a; if (r > worst) { worst = r; worstA = a; }
  }
  console.log(`    w=011: worst D(a)/a over a=1..40 is ${worst.toFixed(3)} at a=${worstA}`);
  let allNum = row.every((v) => typeof v === "number");
  console.log(`    every cell exact (no cap, no budget): ${allNum}`);
}

// --------------------------------------------------------------------------
// the cone word of an assignment
// --------------------------------------------------------------------------
function coneWord(word, x, K) {
  const p = word.length, T = p * x.length + 2;
  const C = [];
  for (let k = 0; k <= K + 1; k++) C.push(new Uint8Array(T + 2));
  for (let t = 0; t <= T + 1; t++) C[0][t] = word[t % p];
  const whites = [];
  for (let t = 0; t < p; t++) if (word[t] === 0) whites.push(t);
  for (let t = 0; t + 1 <= T; t++) {
    let r = 0;
    if (word[t % p] === 0) {
      const m = Math.floor(t / p) * whites.length + whites.indexOf(t % p);
      r = m < x.length ? x[m] : 0;
    }
    C[1][t] = C[0][(t + 1) % p] ^ (C[0][t % p] | r);
  }
  for (let k = 2; k <= K; k++)
    for (let t = 0; t + k <= T; t++) C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
  const out = [];
  for (let k = 1; k <= K; k++) out.push(C[k][0]);
  return out;
}

const W011 = [0, 1, 1];
const M = 13, KTOT = 3 * M - 2;            // 13 free bits reach cone depth 37
const words = [];
for (let v = 0; v < (1 << M); v++) {
  const x = []; for (let i = 0; i < M; i++) x.push((v >> i) & 1);
  words.push(coneWord(W011, x, KTOT).join(""));
}
console.log(`\n[I] the image of the cone map, w = 011: how many length-K rows are`);
console.log(`    achievable?  Upper bound 2^(#free bits reached) = 2^ceil(K/3).`);
console.log(`    K    |image|   2^ceil(K/3)   2^K`);
for (let K = 1; K <= 30; K++) {
  const s = new Set(words.map((w) => w.slice(0, K)));
  console.log(`   ${String(K).padStart(2)}  ${String(s.size).padStart(9)}  ${String(2 ** Math.ceil(K / 3)).padStart(12)}   2^${K}`);
}

console.log(`\n[N] the Nerode width of the image language at depth K: the number of`);
console.log(`    distinct residual sets among achievable length-K prefixes, with the`);
console.log(`    rest of the word (length ${KTOT}-K) as the lookahead.  A BOUNDED width`);
console.log(`    means a finite-state invariant exists and the rung is decidable.`);
console.log(`    K   |image_K|   Nerode width`);
for (let K = 1; K <= KTOT - 8; K++) {
  const byPrefix = new Map();
  for (const w of words) {
    const p = w.slice(0, K), s = w.slice(K);
    let set = byPrefix.get(p); if (!set) { set = new Set(); byPrefix.set(p, set); }
    set.add(s);
  }
  const sigs = new Set();
  for (const [, set] of byPrefix) sigs.add([...set].sort().join("|"));
  console.log(`   ${String(K).padStart(2)}  ${String(byPrefix.size).padStart(9)}   ${sigs.size}`);
}

console.log(`\n[R] what achievable rows look like: the longest run of white cells`);
console.log(`    strictly inside the first ${KTOT} columns, over all ${1 << M} assignments.`);
{
  let best = 0, at = "";
  const hist = new Map();
  for (const w of words) {
    let run = 0, mx = 0;
    for (const ch of w) { if (ch === "0") { run++; if (run > mx) mx = run; } else run = 0; }
    hist.set(mx, (hist.get(mx) || 0) + 1);
    if (mx > best) { best = mx; at = w; }
  }
  console.log(`    longest white run ${best}, first witness row ${at}`);
  const keys = [...hist.keys()].sort((p, q) => p - q);
  console.log(`    distribution of the longest white run: ` + keys.map((k) => `${k}:${hist.get(k)}`).join(" "));
  let ones = 0, tot = 0;
  for (const w of words) for (const ch of w) { tot++; if (ch === "1") ones++; }
  console.log(`    black density of achievable rows: ${(ones / tot).toFixed(4)}`);
}
