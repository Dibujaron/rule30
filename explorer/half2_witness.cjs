/**
 * Named witnesses: for each, the exact DP speed sandwiched from both sides, the
 * left diagonals' actual minimal periods and white densities, and the speed of
 * the REAL damage front on a wide tiling of the same background.
 *
 *   node explorer/half2_witness.cjs
 *
 * Nothing here is a proof.
 */
'use strict';
const L = require('./half2_lib.cjs');

const f = (r) => { const q = L.reduce(r); return `${r.num}/${r.den} = ${q.num}/${q.den} = ${(r.num / r.den).toFixed(6)}`; };

function diagInfo(cyc, N, d) {
  const T = cyc.length, span = N * T;
  const seq = new Uint8Array(span);
  let whiteCount = 0;
  for (let t = 0; t < span; t++) {
    const v = cyc[t % T][((d - t) % N + N) % N];
    seq[t] = v; if (v === 0) whiteCount++;
  }
  let per = span;
  for (let p = 1; p <= span; p++) {
    if (span % p) continue;
    let ok = true;
    for (let t = 0; t < span && ok; t++) if (seq[t] !== seq[(t + p) % span]) ok = false;
    if (ok) { per = p; break; }
  }
  return { per, whiteCount, span };
}

/** real damage front on a wide tiling of the ring's attractor row */
function realFront(row, steps) {
  const N0 = row.length;
  const copies = Math.ceil((6 * steps + 400) / N0);
  const N = N0 * copies;
  const bg0 = new Uint8Array(N);
  for (let i = 0; i < N; i++) bg0[i] = row[i % N0];
  const rows = [bg0];
  for (let t = 1; t <= steps + 2; t++) rows.push(L.step30(rows[t - 1]));
  const flipAt = Math.floor(N * 0.6 / N0) * N0;
  let cur = Uint8Array.from(bg0); cur[flipAt] ^= 1;
  let F = flipAt, seen = 0;
  for (let t = 0; t < steps; t++) {
    const bg = rows[t];
    let got = null;
    for (let x = flipAt - steps - 5; x <= flipAt + steps + 5; x++) {
      const i = ((x % N) + N) % N;
      if (cur[i] !== bg[i]) { got = x; break; }
    }
    if (got === null) break;
    F = got; seen++;
    cur = L.step30(cur);
  }
  return { speed: seen ? (flipAt - F) / seen : 0, rows: seen };
}

const CASES = [
  ['N=4  seed 1000  (the pow2 family maximiser; period-4 word 1011)', '1000'],
  ['N=14 seed 10110010000000 (spatial period 7, row period 4)', '10110010000000'],
  ['N=14 seed 11110100110000 (row period 14)', '11110100110000'],
  ['N=14 seed 10101101000000 (row period 112)', '10101101000000'],
  ['N=13 seed 1111000100000 (row period 91)', '1111000100000'],
  ['N=12 seed 010011111000 (row period 3; ALL diagonal periods 4)', '010011111000'],
  ['N=12 seed 100111110000 (row period 3; ALL diagonal periods 4)', '100111110000'],
];

for (const [label, seedStr] of CASES) {
  const N = seedStr.length;
  const row0 = Uint8Array.from(seedStr.split('').map(Number));
  const cyc = L.attractor(row0);
  const lo = L.dpSub(cyc, N, 8 * N + 64);
  const hi = L.dpSup(cyc, N, 12);
  const hi20 = L.dpSup(cyc, N, 20);
  console.log(`\n=== ${label} ===`);
  console.log(`  attractor: width ${N}, row period ${cyc.length}`);
  for (const r of cyc.slice(0, 8)) console.log('    ' + Array.from(r).map((x) => (x ? '#' : '.')).join(''));
  if (cyc.length > 8) console.log('    ...');
  const white = L.whiteDiagonals(cyc, N);
  console.log(`  identically-white left diagonals: ${JSON.stringify(white)}`);
  const infos = [];
  for (let d = 0; d < N; d++) infos.push(diagInfo(cyc, N, d));
  console.log(`  left-diagonal minimal periods: ${infos.map((i) => i.per).join(' ')}`);
  console.log(`  all of them powers of two: ${infos.every((i) => L.isPow2(i.per))}`);
  console.log(`  left-diagonal white densities: ${infos.map((i) => (i.whiteCount / i.span).toFixed(4)).join(' ')}`);
  console.log(`  DP exact speed: lower ${lo ? f(lo) : '-'}   upper(P=12) ${hi ? f(hi) : '-'}   upper(P=20) ${hi20 ? f(hi20) : '-'}`);
  const rf = realFront(cyc[0], 2000);
  console.log(`  REAL damage front over ${rf.rows} rows on a wide tiling: speed ${rf.speed.toFixed(6)}`);
}
