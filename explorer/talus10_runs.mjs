// Talus, 2026-09-12.  The seed's own longest 11-free and 00-free blocks, for
// scale against the family bound in the attack document, plus the excess at a
// depth that lands quickly.

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

const T = 3000000;
const c = packedCenter(T);

// longest block of the column containing no occurrence of the given 2-word
console.log(`[S] the seed's own maximal blocks, T = ${T}`);
for (const [name, b0, b1] of [["11-free", 1, 1], ["00-free", 0, 0]]) {
  let start = 0, best = 0, bestAt = 0, worstRatio = 0, worstA = 0, worstLen = 0;
  for (let t = 0; t + 1 < T; t++) {
    if (c[t] === b0 && c[t + 1] === b1) {
      const len = t + 1 - start;          // cells start .. t, the pair breaks it
      if (len > best) { best = len; bestAt = start; }
      if (start >= 1 && len / start > worstRatio) { worstRatio = len / start; worstA = start; worstLen = len; }
      start = t + 1;
    }
  }
  console.log(`    longest ${name} block: ${best} cells from t = ${bestAt};` +
    ` worst length/start = ${worstRatio.toFixed(3)} at a = ${worstA} (len ${worstLen})`);
}

// the excess
const E = new Int32Array(T + 1);
for (let n = 0; n < T; n++) E[n + 1] = E[n] + (c[n] ? 1 : -1);
console.log(`\n[E] excess, T = ${T}: E(T) = ${E[T]} = ${(E[T] / Math.sqrt(T)).toFixed(3)} sqrt(N)`);
console.log("    running max / min of E by decade:");
for (let k = 2; k <= 6; k++) {
  const lim = Math.pow(10, k);
  let a = -1e9, b = 1e9;
  for (let n = 0; n <= lim; n++) { if (E[n] > a) a = E[n]; if (E[n] < b) b = E[n]; }
  console.log(`      10^${k}: max ${String(a).padStart(6)}  min ${String(b).padStart(6)}`);
}

// the implication's arithmetic
for (const [name, b0, b1, dir] of [["11-free", 1, 1, 1], ["00-free", 0, 0, -1]]) {
  let bad = 0, count = 0, n = 0, worst = null;
  while (n < T - 1) {
    let m = n;
    while (m + 1 < T && !(c[m] === b0 && c[m + 1] === b1)) m++;
    if (m > n) {
      count++;
      const lhs = E[m + 1], rhs = E[n] + dir;
      const slack = dir === 1 ? lhs - rhs : rhs - lhs;
      if (slack > 0) bad++;
      if (worst === null || slack > worst) worst = slack;
    }
    n = m + 1;
  }
  const ineq = dir === 1 ? "E(T+1) <= E(N)+1" : "E(T+1) >= E(N)-1";
  console.log(`\n[A] over every maximal ${name} interval, ${ineq}: ` +
    `${count} intervals, ${bad} violations, worst excursion ${worst}`);
}
