// EXHAUSTIVE per-state tail census for T mod 2^n, n <= 26ish.
// d(r) = number of steps for r to reach a cycle.  Gives the full histogram
// of tail lengths (not just the max) and the list of states attaining the max.
//
// usage: node collapse_tails.cjs [nmax] [nmin]
const { makeStep32 } = require('./collapse_lib.cjs');

function census(n) {
  const size = 2 ** n;
  const step = makeStep32(n);
  // 1. mark cyclic states by shrinking the image (exhaustive, exact)
  const words = Math.max(1, size / 32);
  let cur = new Uint32Array(words);
  if (size >= 32) cur.fill(0xffffffff); else cur[0] = (2 ** size - 1);
  let curCount = size;
  for (;;) {
    const next = new Uint32Array(words);
    for (let w = 0; w < words; w++) {
      let bits = cur[w];
      while (bits) { const lsb = bits & -bits; const idx = 31 - Math.clz32(lsb); bits ^= lsb; const y = step(w * 32 + idx); next[y >>> 5] |= 1 << (y & 31); }
    }
    let cnt = 0;
    for (let w = 0; w < words; w++) { let x = next[w]; x = x - ((x >> 1) & 0x55555555); x = (x & 0x33333333) + ((x >> 2) & 0x33333333); x = (x + (x >> 4)) & 0x0f0f0f0f; cnt += (x * 0x01010101) >> 24; }
    if (cnt === curCount) break;
    cur = next; curCount = cnt;
  }
  const onCycle = (v) => (cur[v >>> 5] >>> (v & 31)) & 1;
  // 2. d(r) by memoized walk
  const d = new Int16Array(size).fill(-1);
  for (let r = 0; r < size; r++) if (onCycle(r)) d[r] = 0;
  const stack = new Int32Array(4096);
  for (let r0 = 0; r0 < size; r0++) {
    if (d[r0] >= 0) continue;
    let sp = 0, x = r0;
    while (d[x] < 0) { stack[sp++] = x; d[x] = -2; x = step(x); }
    let base = d[x];
    while (sp > 0) { const y = stack[--sp]; base += 1; d[y] = base; }
  }
  const hist = new Map();
  let max = 0;
  for (let r = 0; r < size; r++) { const v = d[r]; hist.set(v, (hist.get(v) || 0) + 1); if (v > max) max = v; }
  const argmax = [];
  for (let r = 0; r < size && argmax.length < 12; r++) if (d[r] === max) argmax.push(r);
  let nArgmax = 0;
  for (let r = 0; r < size; r++) if (d[r] === max) nArgmax++;
  return { max, hist, argmax, nArgmax, attractor: curCount, tail1: d[1 % size], tail9: size > 9 ? d[9] : null, mean: [...hist.entries()].reduce((a, [v, c]) => a + v * c, 0) / size };
}

const nmax = Number(process.argv[2] || 24);
const nmin = Number(process.argv[3] || 4);
console.log(' n  maxTail  #argmax  smallest argmax states           meanTail  tail(1)  tail(9)  frac at max');
for (let n = nmin; n <= nmax; n++) {
  const c = census(n);
  console.log(
    [String(n).padStart(2), String(c.max).padStart(7), String(c.nArgmax).padStart(8),
     ' ' + c.argmax.slice(0, 6).join(',').padEnd(30),
     c.mean.toFixed(2).padStart(8), String(c.tail1).padStart(7), String(c.tail9).padStart(7),
     (c.nArgmax / 2 ** n).toExponential(2).padStart(11)].join(' ')
  );
  if (process.env.HIST) {
    const h = [...c.hist.entries()].sort((a, b) => a[0] - b[0]).map(([v, k]) => `${v}:${k}`).join(' ');
    console.log('    hist ' + h);
  }
}
