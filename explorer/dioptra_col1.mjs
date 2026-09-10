// Dioptra, 2026-09-10.  Obstruction 3's named gap: "Neither number is about
// column 1."  This is the number that is.
//
// Enumerate every configuration white on x <= -1 whose centre column agrees
// with the seed's to depth D (that is exactly the Meier-Staffelbach search
// tree, and its size is obstruction 3's window count), and count the DISTINCT
// column-1 prefixes and column-(-1) prefixes the whole tree produces.
//
// CORRECTNESS OF THE TRUNCATION.  Row 0 is free on x in [0, D] and white
// elsewhere.  col0(t) reads row 0 on [0, t], so the level-k check is exact.
// col1(t) reads row 0 on [0, t+1], so at level k only col1(0..k-1) is decided;
// the prefix recorded at level k therefore stops at t = k-1.  col(-1)(t) reads
// row 0 on [0, t-1], so col(-1)(0..k) is decided at level k.

const D = 28;
const PAD = 6;

function seedCentre(rows) {
  const w = 2 * rows + 2 * PAD + 3, off = rows + PAD;
  let cur = new Uint8Array(w); cur[off] = 1;
  const c = new Uint8Array(rows + 1);
  for (let t = 0; t <= rows; t++) {
    c[t] = cur[off];
    const nxt = new Uint8Array(w);
    for (let i = 1; i < w - 1; i++) nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
    cur = nxt;
  }
  return c;
}

const cTrue = seedCentre(D + 2);
console.log('seed centre column to depth', D, ':', Array.from(cTrue.subarray(0, D + 1)).join(''));

const W = 2 * D + 14, OFF = D + 7;
const rows = []; for (let i = 0; i <= D + 2; i++) rows.push(new Uint8Array(W));

const y = new Uint8Array(D + 1);
const nodes = new Int32Array(D + 1);
const col1 = []; const colm = [];
for (let k = 0; k <= D; k++) { col1.push(new Set()); colm.push(new Set()); }

function build(k) {
  rows[0].fill(0);
  for (let x = 0; x <= k; x++) rows[0][OFF + x] = y[x];
  for (let t = 0; t < k; t++) {
    const cur = rows[t], nxt = rows[t + 1];
    nxt.fill(0);
    for (let i = 1; i < W - 1; i++) nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
  }
}

function dfs(k) {
  build(k);
  if (rows[k][OFF] !== cTrue[k]) return;
  nodes[k]++;
  let s1 = '', sm = '';
  for (let t = 0; t <= k - 1; t++) s1 += rows[t][OFF + 1];   // decided
  for (let t = 0; t <= k; t++) sm += rows[t][OFF - 1];       // decided
  col1[k].add(s1); colm[k].add(sm);
  if (k === D) return;
  for (const b of [0, 1]) { y[k + 1] = b; dfs(k + 1); }
}
for (const b of [0, 1]) { y[0] = b; dfs(0); }

console.log('\n  k\twindows\t\tcol1 prefixes (to t=k-1)\tcol(-1) prefixes (to t=k)');
for (let k = 0; k <= D; k++) {
  console.log(`  ${k}\t${nodes[k]}\t\t${col1[k].size}\t\t\t\t${colm[k].size}`);
}

console.log(`\n  the ${col1[D].size} distinct column-1 prefixes at depth ${D}:`);
for (const s of [...col1[D]].sort()) console.log('    ' + s);
console.log(`  the ${colm[D].size} distinct column-(-1) prefixes at depth ${D}:`);
for (const s of [...colm[D]].sort()) console.log('    ' + s);

// where do the column-1 prefixes differ, and is the centre column white or
// black there?
{
  const list = [...col1[D]].sort();
  const L = list[0].length;
  const diffs = [];
  for (let t = 0; t < L; t++) {
    const vals = new Set(list.map(s => s[t]));
    if (vals.size > 1) diffs.push(t);
  }
  console.log(`\n  positions where the column-1 prefixes disagree: [${diffs.join(', ')}]`);
  console.log(`  centre column there                            : [${diffs.map(t => cTrue[t]).join(', ')}]`);
  console.log('  (the theory says disagreement is possible only at BLACK centre times,');
  console.log('   because at a white centre time col1(t) = col0(t+1) xor col(-1)(t) and');
  console.log('   col(-1) is a function of the centre column alone.)');
  const blackTimes = []; for (let t = 0; t < L; t++) if (cTrue[t]) blackTimes.push(t);
  console.log(`  black centre times below ${L}: ${blackTimes.length}, so the ceiling is 2^${blackTimes.length} = ${2 ** blackTimes.length}`);
}
