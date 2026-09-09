// Vernier / connector, 2026-09-09.
// The functional graph of the rule-30 T-function  T(r) = 4r XOR (2r OR r)
// on n-bit words.  Three questions:
//   (a) how long is the tail (pre-period) of the orbit of 1, and of the WORST
//       start, as a function of n?   [the onset wall is tail(1) <= 2(n-1)]
//   (b) what are the cycles, how many states lie on them, and are the lengths
//       always powers of two?
//   (c) at which n does a cycle of each new length 2^d first appear, and is the
//       seed's orbit on it?

const NMAX = 24;

function analyse(n) {
  const size = 1 << n;
  const mask = size - 1;
  const f = (r) => (((4 * r) ^ ((2 * r) | r)) & mask) >>> 0;

  const tail = new Uint16Array(size);
  const cyc = new Uint16Array(size);
  const done = new Uint8Array(size);
  const path = new Int32Array(4096);
  const seen = new Map();
  const cycleReps = [];        // one representative per cycle
  let cyclicStates = 0;

  for (let s = 0; s < size; s++) {
    if (done[s]) continue;
    seen.clear();
    let len = 0, x = s;
    while (!done[x] && !seen.has(x)) {
      seen.set(x, len);
      if (len >= path.length) throw new Error('path overflow');
      path[len++] = x;
      x = f(x);
    }
    if (seen.has(x)) {
      const start = seen.get(x);
      const clen = len - start;
      cycleReps.push([x, clen]);
      cyclicStates += clen;
      for (let i = start; i < len; i++) { done[path[i]] = 1; cyc[path[i]] = clen; tail[path[i]] = 0; }
      for (let i = start - 1; i >= 0; i--) { done[path[i]] = 1; cyc[path[i]] = clen; tail[path[i]] = start - i; }
    } else {
      const clen = cyc[x], t0 = tail[x];
      for (let i = len - 1; i >= 0; i--) { done[path[i]] = 1; cyc[path[i]] = clen; tail[path[i]] = t0 + (len - i); }
    }
  }

  let maxTail = 0, argMaxTail = 0;
  for (let r = 0; r < size; r++) if (tail[r] > maxTail) { maxTail = tail[r]; argMaxTail = r; }
  const lens = new Map();
  for (const [, l] of cycleReps) lens.set(l, (lens.get(l) || 0) + 1);
  let maxCyc = 0;
  for (const l of lens.keys()) if (l > maxCyc) maxCyc = l;
  // is the seed's orbit on a longest cycle, and is that cycle unique?
  const seedCyc = cyc[1 & mask];
  const countAtMax = lens.get(maxCyc);
  return {
    n, maxTail, argMaxTail, tail1: tail[1 & mask], seedCyc, maxCyc, countAtMax,
    cyclicStates, nCycles: cycleReps.length,
    lens: [...lens.entries()].sort((a, b) => a[0] - b[0]),
    fixedPoints: cycleReps.filter(([, l]) => l === 1).map(([x]) => x),
  };
}

console.log('n   tail(1)  2(n-1)   maxTail  argmax(hex)   cycles (len x count)        onCycle  seedCyc  #longest');
const rows = [];
for (let n = 1; n <= NMAX; n++) {
  const a = analyse(n);
  rows.push(a);
  const cl = a.lens.map(([l, c]) => `${l}x${c}`).join(' ');
  console.log(
    `${String(n).padStart(2)}  ${String(a.tail1).padStart(6)}  ${String(2 * (n - 1)).padStart(6)}  ${String(a.maxTail).padStart(7)}  ${a.argMaxTail.toString(16).padStart(8)}   ${cl.padEnd(26)}  ${String(a.cyclicStates).padStart(7)}  ${String(a.seedCyc).padStart(7)}  ${String(a.countAtMax).padStart(8)}`
  );
}

console.log('\nmaxTail increments:', rows.map((a, i) => (i ? a.maxTail - rows[i - 1].maxTail : a.maxTail)).join(','));
console.log('tail(1) increments:', rows.map((a, i) => (i ? a.tail1 - rows[i - 1].tail1 : a.tail1)).join(','));
console.log('maxTail / n       :', rows.map((a) => (a.maxTail / a.n).toFixed(3)).join(' '));
console.log('violations of maxTail <= 2(n-1):', rows.filter((a) => a.maxTail > 2 * (a.n - 1)).map((a) => a.n).join(',') || 'none');
console.log('cycle lengths that are not powers of two:',
  [...new Set(rows.flatMap((a) => a.lens.map(([l]) => l)))].filter((l) => (l & (l - 1)) !== 0).join(',') || 'none');
console.log('first n with maxCyc = 2^d:', (() => {
  const out = [];
  let cur = 0;
  for (const a of rows) if (a.maxCyc > cur) { cur = a.maxCyc; out.push(`${cur}@n=${a.n}(k=${a.n - 1}, #cycles of that length=${a.countAtMax})`); }
  return out.join('  ');
})());
console.log('fixed points at n=' + NMAX + ':', rows[NMAX - 1].fixedPoints.map((x) => x.toString(2).padStart(NMAX, '0')).join(' '));
console.log('cyclic states / n :', rows.map((a) => (a.cyclicStates / a.n).toFixed(3)).join(' '));
