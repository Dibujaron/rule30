/**
 * Talus, 2026-09-10. Pick concrete black runs of the centre column for the
 * Lean kernel check of the forced alternation, and print the cells the kernel
 * will be asked about so the two can be compared by eye before it is run.
 */

const N = 20000;
const WORDS = ((2 * N + 96) >> 5) + 2;
const r = new Uint32Array(WORDS);
r[0] = 1;
const rowsKept = new Map();
const c = new Uint8Array(N);
for (let t = 0; t < N; t++) {
  const bit = (i) => (i < 0 ? 0 : (r[i >> 5] >>> (i & 31)) & 1);
  c[t] = bit(t);
  const left = new Uint8Array(40);
  for (let j = 0; j < 40; j++) left[j] = bit(t - j);
  rowsKept.set(t, left);
  const limit = Math.min(WORDS - 1, (t >> 4) + 1);
  let prev = 0;
  for (let m = 0; m <= limit; m++) {
    const cur = r[m];
    const s2 = ((cur << 2) | (prev >>> 30)) >>> 0;
    const s1 = ((cur << 1) | (prev >>> 31)) >>> 0;
    r[m] = (s2 ^ (s1 | cur)) >>> 0;
    prev = cur;
  }
}

let i = 0;
const found = [];
while (i < N) {
  const col = c[i];
  let j = i;
  while (j < N && c[j] === col) j++;
  if (col === 1 && j - i >= 8 && j < N) found.push([i, j - i]);
  i = j;
}
console.log(`black runs of length >= 8 below ${N}: ${found.length}`);
for (const [a, L] of found.slice(0, 4)) {
  const left = rowsKept.get(a);
  const cells = [];
  for (let k = 0; k < L; k++) cells.push(left[k]);
  console.log(`  a=${a} L=${L}  cell(a,-j) for j=0..${L - 1}: [${cells.join(', ')}]`);
  console.log(`    matches the checkerboard [j even]: ${cells.every((v, k) => v === (k % 2 === 0 ? 1 : 0))}`);
  console.log(`    centre column at a-1 .. a+L: ${Array.from({ length: L + 2 }, (_, m) => c[a - 1 + m]).join('')}`);
}
