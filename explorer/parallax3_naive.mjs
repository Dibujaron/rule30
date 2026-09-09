// Parallax, 2026-09-09. A deliberately slow, obviously-correct enumerator,
// used only to referee a disagreement between explorer/parallax3_trace.mjs
// (section C) and explorer/numberlikewords.mjs about how many centre-column
// words of length n a configuration white on x <= -1 can show.
//
// No bit tricks: a plain array with explicit positions and generous padding.

const PAD = 40;

// Grow the picture from a configuration given as cells[0..m-1] at positions
// 0..m-1, white everywhere else, and return the centre column word of length n
// as a string.
function column(cells, n) {
  const W = 2 * PAD + cells.length + 2 * n;
  const origin = PAD + n;              // array index of position 0
  let row = new Uint8Array(W);
  for (let i = 0; i < cells.length; i++) row[origin + i] = cells[i];
  let out = '';
  for (let t = 0; t < n; t++) {
    out += row[origin];
    const next = new Uint8Array(W);
    for (let i = 1; i < W - 1; i++) next[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    row = next;
  }
  return out;
}

console.log('n   configs   distinct centre-column words of length n (white on x <= -1)');
for (let n = 1; n <= 18; n++) {
  const seen = new Set();
  for (let w = 0; w < (1 << n); w++) {
    const cells = [];
    for (let i = 0; i < n; i++) cells.push((w >> i) & 1);
    seen.add(column(cells, n));
  }
  const list = n <= 5 ? '  ' + [...seen].sort().join(' ') : '';
  console.log(String(n).padEnd(4), String(1 << n).padEnd(9), String(seen.size).padEnd(6), list);
}

// And the same for the FULL ensemble, as a referee for section A.
console.log();
console.log('full ensemble (cells -(n-1)..(n-1) free): counts per column word');
for (let n = 1; n <= 9; n++) {
  const counts = new Map();
  const W = 2 * n - 1;
  for (let w = 0; w < (1 << W); w++) {
    const cells = [];
    for (let i = 0; i < W; i++) cells.push((w >> i) & 1);
    // cells[i] sits at position i-(n-1); shift the origin by building an array
    const WW = 2 * PAD + W + 2 * n;
    const origin = PAD + n + (n - 1);
    let row = new Uint8Array(WW);
    for (let i = 0; i < W; i++) row[origin + i - (n - 1)] = cells[i];
    let out = '';
    for (let t = 0; t < n; t++) {
      out += row[origin];
      const next = new Uint8Array(WW);
      for (let i = 1; i < WW - 1; i++) next[i] = row[i - 1] ^ (row[i] | row[i + 1]);
      row = next;
    }
    counts.set(out, (counts.get(out) || 0) + 1);
  }
  const vals = [...counts.values()];
  console.log(String(n).padEnd(3), 'distinct', String(counts.size).padEnd(6),
    'min', String(Math.min(...vals)).padEnd(6), 'max', String(Math.max(...vals)).padEnd(6),
    'expected 2^(n-1) =', 1 << (n - 1));
}
