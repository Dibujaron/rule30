/**
 * How general is the right-edge shield, and how big is a centre column's
 * class of finite configurations?
 *
 * `sextant_shield.mjs` showed the seed and the seed plus a black cell at 1 (or
 * at 2) have the same centre column, and `sextant_scratch_shield.lean` proves
 * the first of those. This script asks two follow-up questions the theorem
 * does not answer:
 *
 *   A. which other configurations share the seed's centre column? (all subsets
 *      of positions 1..12 added to the seed, to depth DEPTH);
 *   B. is the shield a general fact about finite configurations -- does adding
 *      a black cell one or two places past the RIGHTMOST black cell of an
 *      arbitrary finite configuration leave its centre column unchanged?
 *      (random configurations, and every configuration of small width).
 *
 * Nothing here is a proof. See explorer/README.md.
 *
 *   node explorer/sextant_shieldclass.mjs
 */

const DEPTH = 3000;
const PAD = DEPTH + 8;
const PADB = BigInt(PAD);
const step = (x) => (x << 1n) ^ (x | (x >> 1n));

function sameColumn(a, b, depth) {
  for (let t = 0; t < depth; t++) {
    if (((a >> PADB) & 1n) !== ((b >> PADB) & 1n)) return t;
    a = step(a); b = step(b);
  }
  return -1;                  // agreed all the way
}

const cfg = (positions) => positions.reduce((s, p) => s | (1n << BigInt(PAD + p)), 0n);

// --- A. the seed's own class ------------------------------------------------

for (const WIDTH of [12, 16]) {
  console.log(`A. subsets S of positions 1..${WIDTH} with column(seed + S) = column(seed), depth ${DEPTH}:`);
  const seed = cfg([0]);
  const keep = [];
  for (let m = 1; m < (1 << WIDTH); m++) {
    const S = [];
    for (let b = 0; b < WIDTH; b++) if ((m >> b) & 1) S.push(b + 1);
    if (sameColumn(seed, cfg([0, ...S]), DEPTH) < 0) keep.push('{' + S.join(',') + '}');
  }
  // what the two proved moves generate: the chain {2,4,...,2k}, each of them
  // optionally with one more cell at 2k+1
  const generated = new Set();
  for (let k = 1; 2 * k <= WIDTH; k++) {
    const evens = [];
    for (let i = 1; i <= k; i++) evens.push(2 * i);
    generated.add('{' + evens.join(',') + '}');
    if (2 * k + 1 <= WIDTH) generated.add('{' + [...evens, 2 * k + 1].join(',') + '}');
  }
  if (1 <= WIDTH) generated.add('{1}');
  const extra = keep.filter((s) => !generated.has(s));
  const missing = [...generated].filter((s) => !keep.includes(s));
  console.log(`   ${keep.length} of ${(1 << WIDTH) - 1} nonempty subsets: ${keep.join(' ') || '(none)'}`);
  console.log(`   the two shield moves generate ${generated.size} of them; in the class but not generated: ${extra.join(' ') || 'none'}; generated but not in the class: ${missing.join(' ') || 'none'}`);
}

// --- B. is the shield general? ---------------------------------------------

console.log(`\nB. adding a black cell just past the rightmost black cell of a finite configuration:`);
{
  let s = 0x12345678;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };
  const trials = [];
  for (let n = 0; n < 400; n++) {
    const width = 4 + (rnd() % 20);
    const cells = [];
    for (let p = 0; p < width; p++) if (rnd() & 1) cells.push(p - (rnd() % 5));
    if (cells.length === 0) continue;
    const uniq = [...new Set(cells)].sort((a, b) => a - b);
    trials.push(uniq);
  }
  for (const delta of [1, 2, 3]) {
    let ok = 0, bad = 0, firstBad = null, worst = Infinity;
    for (const cells of trials) {
      const r = Math.max(...cells);
      const A = cfg(cells), B = cfg([...cells, r + delta]);
      const t = sameColumn(A, B, DEPTH);
      if (t < 0) ok++;
      else {
        bad++;
        if (t < worst) { worst = t; }
        if (!firstBad) firstBad = { cells, t };
      }
    }
    console.log(
      `   cell at (rightmost + ${delta}): centre column unchanged in ${ok} of ${ok + bad} configurations` +
      (bad ? `; earliest failure at row ${worst}, e.g. {${firstBad.cells.join(',')}} fails at row ${firstBad.t}` : ''),
    );
  }
}

// --- C. exhaustive check of B on every configuration of width <= 14 ---------

console.log(`\nC. exhaustive, every configuration with cells inside [0, 14) and a black cell at 0:`);
for (const delta of [1, 2, 3]) {
  let ok = 0, bad = 0, worst = Infinity, ex = null;
  for (let m = 0; m < (1 << 13); m++) {
    const cells = [0];
    for (let b = 0; b < 13; b++) if ((m >> b) & 1) cells.push(b + 1);
    const r = Math.max(...cells);
    const t = sameColumn(cfg(cells), cfg([...cells, r + delta]), 400);
    if (t < 0) ok++; else { bad++; if (t < worst) { worst = t; ex = cells; } }
  }
  console.log(
    `   cell at (rightmost + ${delta}): unchanged in ${ok} of ${ok + bad}` +
    (bad ? `; earliest failure row ${worst}, e.g. {${ex.join(',')}}` : ''),
  );
}
