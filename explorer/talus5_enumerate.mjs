// Talus, 2026-09-09.  The increment |A(n)| - |A(n-1)| at widths no enumeration can reach.
//
// By the halving identity (kernel-proved in talus5_scratch_halving.lean) the increment is
// the number of ODD periodic points of T_n.  Those are enumerable without touching the
// 2^n state space: an odd periodic point's bits are forced upward by the recurrence except
// at a bit w that is identically white on its own orbit, where bit w+1 is a running XOR and
// may be complemented.  So the odd cycles are the closure of {seed cycle} under
// "flip bit w+1 at a white w", and this script computes that closure at a given width.
//
// usage: node talus5_enumerate.mjs

const W = 32;
function engine(n) {
  const words = Math.ceil(n / W);
  const topBits = n - (words - 1) * W;
  const topMask = topBits === 32 ? 0xffffffff : (((1 << topBits) >>> 0) - 1) >>> 0;
  const step = (src, dst) => {
    for (let i = words - 1; i >= 0; i--) {
      const a = src[i], b = i >= 1 ? src[i - 1] : 0;
      dst[i] = (((a << 2) | (b >>> 30)) ^ (((a << 1) | (b >>> 31)) | a)) >>> 0;
    }
    dst[words - 1] = (dst[words - 1] & topMask) >>> 0;
  };
  return { words, step };
}
const eqw = (a, b, w) => { for (let i = 0; i < w; i++) if (a[i] !== b[i]) return false; return true; };
const key = (st) => Array.from(st).join(',');

// settle `start` with a period-p ring buffer; returns the cycle states or null
function settle(n, start, p, T) {
  const { words, step } = engine(n);
  const ring = [];
  for (let i = 0; i <= p; i++) ring.push(new Uint32Array(words));
  ring[0].set(start.subarray(0, words));
  let lastDiff = -1;
  for (let t = 1; t <= T; t++) {
    const cur = ring[t % (p + 1)];
    step(ring[(t - 1) % (p + 1)], cur);
    if (t >= p && !eqw(ring[(t - p) % (p + 1)], cur, words)) lastDiff = t;
  }
  if (lastDiff >= T - p) return null;
  const states = [];
  for (let i = 0; i < p; i++) states.push(Uint32Array.from(ring[(T - p + 1 + i) % (p + 1)]));
  return { states, pre: lastDiff + 1, words };
}
function minPeriod(states, words) {
  const p = states.length;
  for (let d = 1; d <= p; d++) {
    if (p % d) continue;
    let ok = true;
    for (let i = 0; i < p && ok; i++) if (!eqw(states[i], states[(i + d) % p], words)) ok = false;
    if (ok) return d;
  }
  return p;
}
function whitesOf(states, words, n) {
  const or = new Uint32Array(words);
  for (const st of states) for (let i = 0; i < words; i++) or[i] |= st[i];
  const out = [];
  for (let b = 0; b < n; b++) if (!((or[(b / 32) | 0] >>> (b % 32)) & 1)) out.push(b);
  return out;
}

function enumerateOdd(n, p, T) {
  const { words } = engine(n);
  const one = new Uint32Array(words); one[0] = 1;
  const seed = settle(n, one, p, T);
  if (!seed) { console.log(`n=${n}: seed did not settle with p=${p} by t=${T}`); return; }
  const cycles = [];
  const seenKeys = new Set();
  const addCycle = (c) => {
    for (const st of c.states) if (seenKeys.has(key(st))) return false;
    for (const st of c.states) seenKeys.add(key(st));
    cycles.push(c);
    return true;
  };
  addCycle(seed);
  const queue = [seed];
  while (queue.length) {
    const c = queue.shift();
    const wh = whitesOf(c.states, words, n);
    c.whites = wh;
    for (const w of wh) {
      const b = w + 1;
      if (b >= n) continue;
      const flipped = Uint32Array.from(c.states[0]);
      flipped[(b / 32) | 0] ^= (1 << (b % 32)) >>> 0;
      const alt = settle(n, flipped, p, T);
      if (!alt) { console.log(`  n=${n}: flip at w=${w} did not settle with p=${p}`); continue; }
      if (addCycle(alt)) queue.push(alt);
    }
  }
  const lens = cycles.map((c) => minPeriod(c.states, words));
  const nOdd = lens.reduce((a, b) => a + b, 0);
  const allOdd = cycles.every((c) => c.states.every((st) => st[0] & 1));
  console.log(`n=${n}:  odd cycles = ${cycles.length}, minimal periods [${lens.join(', ')}], #odd periodic points = ${nOdd}`);
  console.log(`        every state odd? ${allOdd};  whites per cycle: ${cycles.map((c) => '[' + (c.whites || whitesOf(c.states, words, n)).join(',') + ']').join(' ')}`);
  const maxOdd = Math.max(...lens);
  console.log(`        maxCycle(n) = ${maxOdd} (largest odd cycle here; every level below has one no longer)`);
  console.log(`        increment |A(n)|-|A(n-1)| = ${nOdd};  law wants ${maxOdd};  ratio ${nOdd / maxOdd}`);
  console.log('');
}

// the last width where the law can still hold, and the first where it cannot
enumerateOdd(53208, 16, 108000);
enumerateOdd(53209, 16, 110000);
// through the next branch point: Rowland's column 58288 is our white 58286
enumerateOdd(58288, 16, 120000);
