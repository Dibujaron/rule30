/**
 * What is the maximiser, and why is its number exactly 1/2?
 *
 *   node explorer/half2_struct.cjs
 *
 * Prints, for the background that attains the maximum at N = 4, 8 and 16:
 * the space-time cycle, the white density of every left diagonal, the DP's
 * advance / stay / retreat counts around its own cycle, and whether the
 * reachable set ever has a gap (if it never does, the DP has degenerated to a
 * single walker and the "reachable set" machinery is doing nothing here).
 *
 * Nothing here is a proof.
 */
'use strict';
const L = require('./half2_lib.cjs');

function analyse(word, label) {
  const N = word.length;
  const cyc = L.attractor(Uint8Array.from(word));
  const T = cyc.length;
  console.log(`\n=== ${label}: ring width ${N}, row period ${T} ===`);
  for (let t = 0; t < T; t++) console.log('   ' + Array.from(cyc[t]).map((x) => (x ? '#' : '.')).join(''));
  console.log(`   white left diagonals: ${JSON.stringify(L.whiteDiagonals(cyc, N))}  (must be empty)`);
  console.log(`   row period is a power of two: ${L.isPow2(T)}`);

  // white density along each left diagonal, over its full period N*T
  const span = N * T;
  const dens = [];
  for (let d = 0; d < N; d++) {
    let white = 0;
    for (let t = 0; t < span; t++) if (cyc[t % T][((d - t) % N + N) % N] === 0) white++;
    dens.push(`${white}/${span}`);
  }
  console.log(`   white density of each left diagonal: ${dens.join(' ')}`);

  // the DP around its own cycle: moves, and whether R ever has a gap
  const H = 8 * N + 64;
  let m = 0, phase = 0;
  let set = new Uint8Array(H).fill(1);
  const seen = new Map();
  const moves = [];
  let gapRows = 0, rows = 0;
  for (let step = 0; step < 20000; step++) {
    const k = phase + '|' + (((m % N) + N) % N) + '|' + set.join('');
    if (seen.has(k)) {
      const [s0] = seen.get(k);
      const cycMoves = moves.slice(s0);
      const adv = cycMoves.filter((x) => x === -1).length;
      const sta = cycMoves.filter((x) => x === 0).length;
      const ret = cycMoves.filter((x) => x > 0).length;
      console.log(`   DP state cycle: length ${cycMoves.length}; advances ${adv}, stays ${sta}, retreats ${ret}`);
      console.log(`   exact speed = (${adv} - ${cycMoves.filter((x) => x > 0).reduce((a, b) => a + b, 0)}) / ${cycMoves.length} = ${-cycMoves.reduce((a, b) => a + b, 0)}/${cycMoves.length}`);
      console.log(`   rows on which R had a GAP: ${gapRows} of ${rows} (0 means the reachable set is an interval throughout and the DP is a plain walker here)`);
      return;
    }
    seen.set(k, [step, m]);
    // gap test: is the set of offsets an initial interval?
    let last = -1, gap = false;
    for (let o = 0; o < H; o++) { if (set[o]) { if (last >= 0 && o > last + 1) gap = true; last = o; } }
    rows++; if (gap) gapRows++;

    const row = cyc[phase];
    const S = (x) => row[((x % N) + N) % N];
    const targets = []; let lo = Infinity;
    for (let o = 0; o < H; o++) {
      if (!set[o]) continue;
      const x = m + o, Lc = S(x - 1), C = S(x), R = S(x + 1);
      let v, isRay;
      if (Lc === 0) { v = o - 1; isRay = false; }
      else if (C === 0 && R === 0) { v = o; isRay = false; }
      else if (C === 0 && R === 1) { v = o + 1; isRay = true; }
      else { v = o; isRay = true; }
      targets.push([v, isRay]); if (v < lo) lo = v;
    }
    const next = new Uint8Array(H);
    for (const [v, isRay] of targets) {
      const o = v - lo;
      if (isRay) { for (let j = Math.max(0, o); j < H; j++) next[j] = 1; }
      else if (o >= 0 && o < H) next[o] = 1;
    }
    moves.push(lo);
    m += lo; set = next; phase = (phase + 1) % T;
  }
  console.log('   DP did not cycle');
}

analyse([1, 0, 0, 0], 'N=4 maximiser seed 1000');
analyse([1, 1, 0, 0, 0, 0, 0, 0], 'N=8 maximiser seed 11000000');
analyse('1011011000000000'.split('').map(Number), 'N=16 maximiser seed 1011011000000000');
analyse([1, 0, 1, 1], 'the period-4 word 1011 itself');
