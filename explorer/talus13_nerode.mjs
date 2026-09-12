// Talus, 2026-09-12.  The image of the cone map for w = 011, and how much memory
// it needs.  Split out of talus13_image.mjs so the expensive D(a) sweep does not
// hold it up.
//
// W_k = C_k[0] = cell(-k, 0) is row 0 read leftward.  The rung asks whether the
// word 0^(a-1) 1 0^infinity is in the image of x |-> W(x).  [I] measures how
// sparse the image is, [N] measures the Nerode width -- a BOUNDED width would
// mean a finite-state invariant exists and the rung is decidable by automaton.

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

// control: the cone word must agree with a forward evolution of the row it claims
{
  const W = [0, 1, 1];
  let s = 12345 >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s & 1; };
  let checks = 0, bad = 0;
  for (let trial = 0; trial < 200; trial++) {
    const M = 12, K = 28;
    const x = []; for (let i = 0; i < M; i++) x.push(rnd());
    const w = coneWord(W, x, K);
    // rebuild row 0 on [-K, R] : left part = the cone word reversed, origin = W[0],
    // right part = whatever; we only need to check the centre column back out of it.
    // Do it by taking the FULL left solve as a row and evolving.  The right half is
    // not determined by (col0, col1), so instead check the defining recursion at
    // every interior cell of the solved triangle.
    const p = 3, T = p * M + 2;
    const C = [];
    for (let k = 0; k <= K + 1; k++) C.push(new Uint8Array(T + 2));
    for (let t = 0; t <= T + 1; t++) C[0][t] = W[t % p];
    for (let t = 0; t + 1 <= T; t++) {
      let r = 0;
      if (W[t % p] === 0) { const m = t / p | 0; r = m < M ? x[m] : 0; }
      C[1][t] = C[0][(t + 1) % p] ^ (C[0][t % p] | r);
    }
    for (let k = 2; k <= K; k++) for (let t = 0; t + k <= T; t++) C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
    // forward rule 30 must hold at (-k, t) -> (-k, t+1) for 1 <= k <= K-1
    for (let k = 1; k <= K - 1; k++) for (let t = 0; t + k + 2 <= T; t++) {
      checks++;
      const left = C[k + 1][t], ctr = C[k][t], right = C[k - 1][t];
      if (C[k][t + 1] !== (left ^ (ctr | right))) bad++;
    }
    if (w[0] !== C[1][0]) bad++;
  }
  console.log(`[V] the solved triangle obeys rule 30 forward: ${checks} cells, ${bad} wrong`);
}

const W011 = [0, 1, 1];
const M = 13, KTOT = 3 * M - 2;
const words = [];
for (let v = 0; v < (1 << M); v++) {
  const x = []; for (let i = 0; i < M; i++) x.push((v >> i) & 1);
  words.push(coneWord(W011, x, KTOT).join(""));
}
console.log(`\n[I] the image of the cone map, w = 011, over all ${1 << M} assignments.`);
console.log(`    K    |image_K|   2^ceil(K/3)   2^K`);
for (let K = 1; K <= 30; K++) {
  const s = new Set(words.map((w) => w.slice(0, K)));
  console.log(`   ${String(K).padStart(2)}  ${String(s.size).padStart(10)}  ${String(2 ** Math.ceil(K / 3)).padStart(12)}   2^${K}`);
}

console.log(`\n[N] Nerode width of the image language: distinct residual sets among`);
console.log(`    achievable length-K prefixes, lookahead ${KTOT}-K.  Bounded => an`);
console.log(`    invariant exists.`);
console.log(`    K   |image_K|   Nerode width   lookahead`);
for (let K = 1; K <= KTOT - 6; K++) {
  const byPrefix = new Map();
  for (const w of words) {
    const p = w.slice(0, K), s = w.slice(K);
    let set = byPrefix.get(p); if (!set) { set = new Set(); byPrefix.set(p, set); }
    set.add(s);
  }
  const sigs = new Set();
  for (const [, set] of byPrefix) sigs.add([...set].sort().join("|"));
  console.log(`   ${String(K).padStart(2)}  ${String(byPrefix.size).padStart(10)}   ${String(sigs.size).padStart(12)}   ${KTOT - K}`);
}

console.log(`\n[R] achievable rows: longest white run, and black density.`);
{
  let best = 0, at = "";
  const hist = new Map();
  for (const w of words) {
    let run = 0, mx = 0;
    for (const ch of w) { if (ch === "0") { run++; if (run > mx) mx = run; } else run = 0; }
    hist.set(mx, (hist.get(mx) || 0) + 1);
    if (mx > best) { best = mx; at = w; }
  }
  console.log(`    longest white run inside the first ${KTOT} columns: ${best}`);
  console.log(`    witness row (column -1 leftmost): ${at}`);
  const keys = [...hist.keys()].sort((p, q) => p - q);
  console.log(`    distribution: ` + keys.map((k) => `${k}:${hist.get(k)}`).join(" "));
  let ones = 0, tot = 0;
  for (const w of words) for (const ch of w) { tot++; if (ch === "1") ones++; }
  console.log(`    black density of achievable rows: ${(ones / tot).toFixed(4)}`);
}

console.log(`\n[T] the TAIL question: how far can a row stay white after its last black?`);
console.log(`    For each assignment, find the last black column L and the run of`);
console.log(`    whites after it inside the first ${KTOT}.  D(a) is the max of (L + run)`);
console.log(`    over assignments whose last black is at exactly a.`);
{
  const bestByA = new Map();
  for (const w of words) {
    let L = -1;
    for (let i = 0; i < w.length; i++) if (w[i] === "1") L = i;
    if (L < 0) continue;
    const a = L + 1;                 // column index of the last black
    const reach = w.length;          // whites from a+1 to KTOT
    const cur = bestByA.get(a) || 0;
    if (reach > cur) bestByA.set(a, reach);
  }
  const as = [...bestByA.keys()].sort((p, q) => p - q);
  console.log(`    a with an all-white tail to column ${KTOT}: ` + (as.length ? as.join(",") : "(none)"));
}
