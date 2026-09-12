// Talus, 2026-09-12.  The brief suggests the single-colour route: "11 occurs
// infinitely often" is the k = 2 instance of the closed
// centerColumn_not_isEventuallyPeriodic_of_long_black_runs.  That asks for a
// bound on the length of an 11-FREE block of the centre column, which is
// strictly weaker as a hypothesis than the ALTERNATING block of talus10_dfs.mjs
// -- an alternating block is 11-free and 00-free at once.
//
// Same exact DFS, but the column word is now a branch too, constrained only by
// the local rule of the target set:
//    ALT   : c(t+1) != c(t)                 (one word per phase)
//    NO11  : not (c(t) = 1 and c(t+1) = 1)  (Fibonacci-many words)
//    NO00  : not (c(t) = 0 and c(t+1) = 0)
// The left cell at -k stays forced by left-permutivity at radius k, so the tree
// is still exactly the set of configurations whose column lies in the target
// set, and its extinction depth is the answer.

function centreAt(cfg, k, off) {
  let row = cfg.slice(off - k, off + k + 1);
  for (let t = 1; t <= k; t++) {
    const n = row.length - 2;
    const nr = new Uint8Array(n);
    for (let i = 0; i < n; i++) nr[i] = row[i] ^ (row[i + 1] | row[i + 2]);
    row = nr;
  }
  return row[0];
}

// allowed(prev, next) -> Bool
function search(a, allowed, starts, cap, verify) {
  const off = cap + 4;
  const cfg = new Uint8Array(2 * cap + 12);
  const col = new Uint8Array(cap + 4);
  let best = 0, bestCol = null;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 2; k++) { LD.push(new Uint8Array(cap + 3)); RD.push(new Uint8Array(cap + 3)); }
  let nodes = 0;

  function rec(k) {
    if (k > cap) return;
    if (++nodes > 4e8) throw new Error("node budget");
    for (const rc of [0, 1]) {
      cfg[off + k] = rc;
      const rdk = RD[k], rd1 = RD[k - 1], rd2 = k >= 2 ? RD[k - 2] : null;
      rdk[0] = rc;
      for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
      const ldk = LD[k], ld1 = LD[k - 1], ld2 = k >= 2 ? LD[k - 2] : null;
      ldk[0] = 0;
      for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
      const centre0 = ldk[k - 1] ^ (col[k - 1] | rdk[k - 1]);
      for (const cv of [0, 1]) {
        if (!allowed(col[k - 1], cv)) continue;
        const lc = centre0 ^ cv;
        if (k > a && lc === 1) continue;
        cfg[off - k] = lc;
        col[k] = cv;
        const flip = (lc === 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
        ldk[k] = cv; rdk[k] = cv;
        if (verify && centreAt(cfg, k, off) !== cv) throw new Error(`bad k=${k}`);
        if (k + 1 > best) { best = k + 1; bestCol = col.slice(0, k + 1); }
        rec(k + 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      }
    }
    cfg[off + k] = 0; cfg[off - k] = 0;
  }

  for (const s of starts) {
    cfg[off] = s; col[0] = s;
    LD[0][0] = s; RD[0][0] = s;
    if (1 > best) { best = 1; bestCol = Uint8Array.from([s]); }
    rec(1);
  }
  return { best, bestCol, nodes };
}

const ALT = (p, n) => n !== p;
const NO11 = (p, n) => !(p === 1 && n === 1);
const NO00 = (p, n) => !(p === 0 && n === 0);

console.log("[V] the alternating target, reproduced through the word-branching code");
console.log("    talus10_dfs.mjs [L] a=1..10 -> 8,8,8,8,9,10,10,17,17,17");
{
  let s = "    here                  -> ";
  for (let a = 1; a <= 10; a++) s += search(a, ALT, [0, 1], 6 * a + 24, false).best + (a < 10 ? "," : "");
  console.log(s);
}

console.log("\n[N] the single-colour targets, same instrument, white left of -a");
console.log("      a | alternating | 11-free | 00-free |   3a  | note");
for (let a = 1; a <= 9; a++) {
  const cap = Math.min(46, 8 * a + 20);
  const alt = search(a, ALT, [0, 1], cap, false);
  let n11, n00;
  try { n11 = search(a, NO11, [0, 1], cap, false); } catch (e) { n11 = { best: -1 }; }
  try { n00 = search(a, NO00, [0, 1], cap, false); } catch (e) { n00 = { best: -1 }; }
  const cap11 = n11.best >= cap ? " 11-free HIT CAP" : "";
  const cap00 = n00.best >= cap ? " 00-free HIT CAP" : "";
  console.log(`    ${String(a).padStart(3)} | ${String(alt.best).padStart(11)} | ${String(n11.best).padStart(7)} | ` +
    `${String(n00.best).padStart(7)} | ${String(3 * a).padStart(4)}  |${cap11}${cap00}`);
}

console.log("\n[S] and the seed's own longest 11-free / 00-free blocks, for scale");
{
  function packedCenter(T) {
    const nw = ((2 * T + 64) >>> 5) + 2;
    let cur = new Uint32Array(nw), nxt = new Uint32Array(nw);
    cur[0] = 1;
    const c = new Uint8Array(T);
    for (let t = 0; t < T; t++) {
      c[t] = (cur[t >>> 5] >>> (t & 31)) & 1;
      const top = Math.min(nw - 1, ((2 * t + 3) >>> 5) + 1);
      for (let w = top; w >= 0; w--) {
        const x = cur[w], lo = w === 0 ? 0 : cur[w - 1];
        nxt[w] = ((((x << 2) | (lo >>> 30)) >>> 0) ^ ((((x << 1) | (lo >>> 31)) >>> 0) | x)) >>> 0;
      }
      const tmp = cur; cur = nxt; nxt = tmp;
    }
    return c;
  }
  const T = 3000000, c = packedCenter(T);
  for (const [name, bad] of [["11-free", (i) => c[i] === 1 && c[i + 1] === 1],
                             ["00-free", (i) => c[i] === 0 && c[i + 1] === 0]]) {
    let run = 1, best = 0, at = 0, worstRatio = 0, worstA = 0;
    let startIdx = 0;
    for (let t = 0; t + 1 < T; t++) {
      if (bad(t)) { if (run > best) { best = run; at = startIdx; } startIdx = t + 1; run = 1; }
      else run++;
      const cur = t + 1 - startIdx + 1;
      if (startIdx >= 1 && cur / startIdx > worstRatio) { worstRatio = cur / startIdx; worstA = startIdx; }
    }
    console.log(`    longest ${name} block below ${T}: ${best} cells starting at t = ${at};` +
      ` worst length/start ratio ${worstRatio.toFixed(3)} at a = ${worstA}`);
  }
}
