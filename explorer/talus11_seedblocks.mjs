// Talus, 2026-09-12.  The seed's own W-free blocks, deep, for the one argument
// in the document that needs them: row a of the seed is a member of C5(a), so
// f_W(a) >= the seed's W-free block starting at time a.  If that block is long
// somewhere, f_W cannot be the decreasing arithmetic run the small-a searches
// show, and the criterion's "unbounded" verdict has a witness rather than a
// failed search.
//
// Engine: word-packed rows, validated against the repo's naive evolution on the
// first rows before any large number is printed.

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

// naive control
function naiveCenter(T) {
  let row = new Uint8Array(2 * T + 3);
  row[T + 1] = 1;
  const c = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    c[t] = row[T + 1];
    const nr = new Uint8Array(row.length);
    for (let i = 1; i < row.length - 1; i++) nr[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    row = nr;
  }
  return c;
}

{
  const a = packedCenter(400), b = naiveCenter(400);
  let bad = 0;
  for (let i = 0; i < 400; i++) if (a[i] !== b[i]) bad++;
  console.log(`[V] packed engine vs naive evolution over 400 rows: ${bad} mismatches`);
  console.log(`    first 20 centre cells: ${Array.from(a.slice(0, 20)).join("")}`);
}

const T = 3000000;
const C = packedCenter(T);
console.log(`\n[B] the seed's centre column to ${T} rows`);
for (const [nm, w] of [["11", [1, 1]], ["00", [0, 0]], ["01", [0, 1]], ["10", [1, 0]],
                       ["0", [0]], ["1", [1]], ["000", [0, 0, 0]], ["111", [1, 1, 1]]]) {
  const m = w.length;
  let best = 0, bestAt = 0, start = 0, ratio = 0, ratioAt = 0;
  for (let t = 0; t + m <= T; t++) {
    let hit = true;
    for (let i = 0; i < m; i++) if (C[t + i] !== w[i]) { hit = false; break; }
    if (hit) {
      const len = t + m - 1 - start;          // cells [start, t+m-2] are W-free
      if (len > best) { best = len; bestAt = start; }
      if (start >= 1 && len / start > ratio) { ratio = len / start; ratioAt = start; }
      start = t + 1;
    }
  }
  console.log(`    ${nm.padStart(4)}-free: longest block ${String(best).padStart(4)} cells from t = ${String(bestAt).padStart(8)}` +
    `;  worst length/start ratio ${ratio.toFixed(3)} at a = ${ratioAt}`);
}
