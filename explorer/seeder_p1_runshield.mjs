/**
 * Seeder scratch, 2026-09-10. The run-shield claim:
 *
 *   if X and Y have the same cell at the origin at times t..t+j,
 *   and that cell is black at times t..t+j-1,
 *   then X and Y agree at every position 0, -1, ..., -j at time t.
 *
 * Tested over random configuration pairs. Also reports the sharpness: does
 * i = j+1 fail? Empirical only; see explorer/README.md.
 */

function step(row) {
  const n = row.length;
  const out = new Array(n).fill(false);
  for (let i = 0; i < n; i++) {
    const l = i > 0 ? row[i - 1] : false;
    const c = row[i];
    const r = i < n - 1 ? row[i + 1] : false;
    out[i] = (l !== (c || r));
  }
  return out;
}
function grow(row0, steps) {
  const rows = [row0];
  for (let t = 0; t < steps; t++) rows.push(step(rows[t]));
  return rows;
}
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 801, ORIGIN = 400, T = 320;
const rnd = mulberry(20260910);

let hits = 0, fail = 0, sharpChecked = 0, sharpFail = 0;
const byJ = new Map();

for (let trial = 0; trial < 600; trial++) {
  const base = Array.from({ length: W }, () => rnd() < 0.5);
  const X = base.slice(), Y = base.slice();
  const flips = 1 + Math.floor(rnd() * 3);
  for (let f = 0; f < flips; f++) {
    const p = ORIGIN + 1 + Math.floor(rnd() * 250);
    Y[p] = !Y[p];
  }
  const rx = grow(X, T + 20), ry = grow(Y, T + 20);
  const cx = (t, x) => rx[t][ORIGIN + x];
  const cy = (t, x) => ry[t][ORIGIN + x];

  for (let t = 0; t <= T; t++) {
    for (let j = 0; j <= 12; j++) {
      // hypothesis: origin agrees at t..t+j and is black at t..t+j-1
      let ok = true;
      for (let s = 0; s <= j && ok; s++) if (cx(t + s, 0) !== cy(t + s, 0)) ok = false;
      for (let s = 0; s < j && ok; s++) if (!cx(t + s, 0)) ok = false;
      if (!ok) continue;
      hits++;
      byJ.set(j, (byJ.get(j) ?? 0) + 1);
      for (let i = 0; i <= j; i++) {
        if (cx(t, -i) !== cy(t, -i)) {
          fail++;
          if (fail <= 3) console.log(`   FAIL t=${t} j=${j} i=${i}`);
        }
      }
      // sharpness: is position -(j+1) sometimes different?
      sharpChecked++;
      if (cx(t, -(j + 1)) !== cy(t, -(j + 1))) sharpFail++;
    }
  }
}

console.log(`run-shield: ${hits} hypothesis hits, ${fail} failures`);
console.log(`sharpness : of ${sharpChecked} hits, position -(j+1) differs ${sharpFail} times` +
  ` (a nonzero count means i <= j is the exact reach)`);
const js = [...byJ.entries()].sort((a, b) => a[0] - b[0]).map(([j, n]) => `j=${j}:${n}`);
console.log(`hits by j : ${js.join(' ')}`);
