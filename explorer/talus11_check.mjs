// Talus, 2026-09-12.  Audit of every number the attack document asserts about the
// period ladder: the two tables transcribed from the two scripts that produced
// them, cross-checked against each other on the cells they share, and the fitted
// bound 2p + 2a + 2 tested as a MAX over the whole range rather than eyeballed.

// talus11_ladder.mjs, class C2, p = 1..8, a = 1..12, every cell exhaustive
const LADDER = {
  1: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  2: [8, 7, 6, 6, 9, 10, 10, 17, 16, 15, 14, 15],
  3: [8, 10, 9, 9, 10, 14, 13, 17, 16, 15, 19, 18],
  4: [8, 10, 10, 11, 13, 14, 14, 17, 16, 19, 20, 20],
  5: [11, 10, 10, 11, 13, 13, 14, 16, 19, 18, 19, 21],
  6: [15, 14, 14, 13, 13, 16, 16, 18, 19, 19, 26, 25],
  7: [11, 11, 10, 19, 18, 18, 18, 21, 20, 25, 24, 23],
  8: [13, 13, 16, 18, 17, 16, 18, 17, 23, 22, 27, 26],
};
// talus11_uniform.mjs, class C2, a fixed, p pushed; every cell exhaustive
const UNIFORM = {
  1: [3, 8, 8, 8, 11, 15, 11, 13, 13, 14, 16, 16, 20, 19, 20, 22, 22, 26, 29, 26, 26, 27, 31, 30],
  2: [4, 7, 10, 10, 10, 14, 11, 13, 12, 14, 17, 17, 19, 18, 21, 22, 25, 26, 28, 26, 31, 33, 32, 30],
  3: [5, 6, 9, 10, 10, 14, 10, 16, 13, 17, 18, 20, 19, 24, 25, 26, 26, 26, 33, 31, 30, 32, 33],
  4: [6, 6, 9, 11, 11, 13, 19, 18, 16, 18, 17, 22, 23, 23, 25, 29, 29, 29, 32, 30, 30, 31],
  5: [7, 9, 10, 13, 13, 13, 18, 17, 17, 19, 20, 22, 24, 23, 26, 28, 28, 28, 31, 29],
  6: [8, 10, 14, 14, 13, 16, 18, 16, 26, 19, 21, 21, 23, 24, 26, 28, 29, 31, 34],
};

let n = 0, dis = 0;
for (const a of [1, 2, 3, 4, 5, 6])
  for (let p = 1; p <= 8; p++) {
    const x = LADDER[p][a - 1], y = UNIFORM[a][p - 1];
    n++;
    if (x !== y) { dis++; console.log(`  DISAGREE p=${p} a=${a}: ladder ${x}, uniform ${y}`); }
  }
console.log(`[A] the two scripts share ${n} cells and disagree on ${dis}`);

const cells = [];
for (let p = 1; p <= 8; p++) for (let a = 1; a <= 12; a++) cells.push([p, a, LADDER[p][a - 1]]);
for (const a of [1, 2, 3, 4, 5, 6]) UNIFORM[a].forEach((f, i) => { if (i + 1 > 8) cells.push([i + 1, a, f]); });
console.log(`[B] ${cells.length} distinct measured cells in all`);

const shapes = [
  ["2p + 2a + 2", (p, a) => 2 * p + 2 * a + 2],
  ["2p + 2a", (p, a) => 2 * p + 2 * a],
  ["p + 2a + 8", (p, a) => p + 2 * a + 8],
  ["3a + p", (p, a) => 3 * a + p],
  ["2p + a + 4", (p, a) => 2 * p + a + 4],
  ["1.5p + 2a + 4", (p, a) => 1.5 * p + 2 * a + 4],
];
console.log(`[C] candidate shapes, tested as a MAX over every cell`);
for (const [name, g] of shapes) {
  let bad = 0, worst = null, slack = Infinity;
  for (const [p, a, f] of cells) {
    if (f > g(p, a)) { bad++; if (!worst) worst = `p=${p} a=${a}: f=${f} > ${g(p, a)}`; }
    slack = Math.min(slack, g(p, a) - f);
  }
  console.log(`    ${name.padEnd(14)} violations ${String(bad).padStart(3)}` +
    `${bad ? "   first " + worst : `   tightest slack ${slack}`}`);
}

console.log(`[D] the excess f - p, by p-band, over every a the uniformity sweep reached`);
for (const [lo, hi] of [[1, 6], [7, 12], [13, 18], [19, 24]]) {
  const v = [];
  for (const a of [1, 2, 3, 4, 5, 6]) UNIFORM[a].forEach((f, i) => { const p = i + 1; if (p >= lo && p <= hi) v.push(f - p); });
  const mean = v.reduce((x, y) => x + y, 0) / v.length;
  console.log(`    p in [${lo},${hi}]: n=${v.length}  mean excess ${mean.toFixed(2)}  max ${Math.max(...v)}`);
}

console.log(`[E] least-squares slope of f in p, per a`);
for (const a of [1, 2, 3, 4, 5, 6]) {
  const ys = UNIFORM[a], n2 = ys.length;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  ys.forEach((f, i) => { const p = i + 1; sx += p; sy += f; sxx += p * p; sxy += p * f; });
  const m = (n2 * sxy - sx * sy) / (n2 * sxx - sx * sx);
  const c = (sy - m * sx) / n2;
  console.log(`    a=${a}: f ~ ${m.toFixed(3)} p + ${c.toFixed(2)}   over p = 1..${n2}`);
}
