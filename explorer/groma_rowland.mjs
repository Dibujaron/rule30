// Groma, 2026-09-10.  Rowland's contrast.
//
// Rowland 2006 (sources/rowland-2006-local-nested-structure.txt, lines 107-122)
// shows that the length of the maximal run of black cells at the OUTER edge of
// the cone is a function of the 2-adic valuation of the row index alone:
// l(t) = a(ord_2(t)), with a(n) strictly increasing.
//
// This sighting's object g(t) = min { x >= 1 : cell(t,x) = black } is the same
// kind of statistic -- a gap read off each row -- taken at the ORIGIN instead
// of at the edge.  Is it also a function of ord_2 of anything?
//
// Test: the conditional distribution of g(t) given ord_2(t), given ord_2(t+1),
// and given t mod 2^k.  If g were determined by any of these the conditional
// distributions would be point masses.

const T = 400000;

function seedGaps(T) {
  const W = ((2 * T + 96) >> 5) + 3;
  let r = new Uint32Array(W), s = new Uint32Array(W);
  const col0 = new Uint8Array(T);
  const gap = new Int32Array(T);
  const rightRun = new Int32Array(T);
  r[0] = 1;
  for (let t = 0; t < T; t++) {
    col0[t] = (r[t >> 5] >>> (t & 31)) & 1;
    // leftmost black at x >= 1
    let g = -1;
    const b1 = t + 1, i0 = b1 >> 5, mask = (0xffffffff << (b1 & 31)) >>> 0;
    const wl = Math.min(W - 1, ((2 * t) >> 5) + 1);
    for (let i = i0; i <= wl; i++) {
      const v = ((i === i0 ? r[i] & mask : r[i]) >>> 0);
      if (v !== 0) { g = (i << 5) + (31 - Math.clz32(v & -v)) - t; break; }
    }
    gap[t] = g;
    // Rowland's statistic: length of the maximal black run at the right edge,
    // i.e. starting at bit 2t and walking down
    let run = 0;
    for (let b = 2 * t; b >= 0; b--) {
      if ((r[b >> 5] >>> (b & 31)) & 1) run++; else break;
    }
    rightRun[t] = run;
    const last = Math.min(W - 2, ((2 * t) >> 5) + 2);
    for (let i = last; i >= 0; i--) {
      const cur = r[i], prev = i > 0 ? r[i - 1] : 0;
      const l2 = ((cur << 2) | (prev >>> 30)) >>> 0;
      const l1 = ((cur << 1) | (prev >>> 31)) >>> 0;
      s[i] = (l2 ^ (l1 | cur)) >>> 0;
    }
    const tmp = r; r = s; s = tmp;
  }
  return { col0, gap, rightRun };
}

const ord2 = (n) => { let k = 0; while (n > 0 && (n & 1) === 0) { n >>= 1; k++; } return k; };

const { gap, rightRun } = seedGaps(T);

// control: reproduce Rowland's l(t) = a(ord_2(t)), first values 1,3,1,4,1,3,1,6,...
// Rowland's l(t) is read off row t-1, so it equals rightRun[t-1]: l(t) = a(ord_2(t)).
console.log('control -- Rowland\'s right-edge run length l(t) = rightRun[t-1], t = 1..16:');
console.log('  ' + Array.from({ length: 16 }, (_, i) => rightRun[i]).join(', '));
console.log('  (Rowland 2006 prints 1, 3, 1, 4, 1, 3, 1, 6, 1, 3, 1, 4, 1, 3, 1, 7)');
{
  const byOrd = new Map();
  for (let t = 1; t < T; t++) {
    const k = ord2(t);
    if (!byOrd.has(k)) byOrd.set(k, new Set());
    byOrd.get(k).add(rightRun[t - 1]);
  }
  const bad = [...byOrd.entries()].filter(([, s]) => s.size > 1);
  console.log(`  l(t) is a function of ord_2(t): ${bad.length === 0 ? 'YES, 0 violations over t < ' + T : 'NO, ' + bad.length + ' classes with >1 value'}`);
  console.log('  a(n) for n = 0..12: ' + [...byOrd.entries()].sort((a, b) => a[0] - b[0]).slice(0, 13).map(([k, s]) => [...s][0]).join(', '));
  console.log('  (Rowland 2006 prints a(0..12) = 1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29, 34)');
}

console.log('');
console.log('the object of this sighting -- g(t), the gap from the origin to the first black on the right');
for (const [label, key] of [['ord_2(t)', (t) => ord2(t)], ['ord_2(t+1)', (t) => ord2(t + 1)],
                            ['t mod 8', (t) => t % 8], ['t mod 64', (t) => t % 64]]) {
  const by = new Map();
  for (let t = 1; t < T; t++) {
    const k = key(t);
    if (!by.has(k)) by.set(k, new Map());
    const m = by.get(k);
    m.set(gap[t], (m.get(gap[t]) ?? 0) + 1);
  }
  let maxVals = 0, minPurity = 1;
  for (const [, m] of by) {
    const tot = [...m.values()].reduce((a, c) => a + c, 0);
    const top = Math.max(...m.values());
    if (m.size > maxVals) maxVals = m.size;
    if (top / tot < minPurity) minPurity = top / tot;
  }
  console.log(`  conditioned on ${label.padEnd(11)}: up to ${maxVals} distinct gaps per class, ` +
    `worst class is ${(100 * minPurity).toFixed(1)}% one value  -> ${maxVals > 1 ? 'NOT a function of it' : 'a function of it'}`);
}
const hist = new Map();
for (let t = 1; t < T; t++) hist.set(gap[t], (hist.get(gap[t]) ?? 0) + 1);
const tot = T - 1;
console.log('  unconditional law of g: ' +
  [...hist.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${(v / tot).toFixed(4)}`).join(' '));
