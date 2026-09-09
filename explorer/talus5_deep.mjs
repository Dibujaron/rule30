// Talus, 2026-09-09.  Same enumeration as talus5_enumerate.mjs, at the two widths past
// the first failure: 72577 (the second branch's own first white, our bit 72575) and
// 87868 (NKS's fifth doubling, where maxCycle goes 16 -> 32).  Run with p = 32 so a
// doubled period still settles.
//
// usage: node talus5_deep.mjs

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
  for (let d = 1; d <= p; d++) { if (p % d) continue; let ok = true; for (let i = 0; i < p && ok; i++) if (!eqw(states[i], states[(i + d) % p], words)) ok = false; if (ok) return d; }
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
  const t0 = Date.now();
  const { words } = engine(n);
  const one = new Uint32Array(words); one[0] = 1;
  const seed = settle(n, one, p, T);
  if (!seed) { console.log(`n=${n}: seed did not settle with p=${p} by t=${T}`); return; }
  const cycles = []; const seen = new Set();
  const add = (c) => { for (const st of c.states) if (seen.has(key(st))) return false; for (const st of c.states) seen.add(key(st)); cycles.push(c); return true; };
  add(seed);
  const q = [seed];
  while (q.length) {
    const c = q.shift();
    c.whites = whitesOf(c.states, words, n);
    for (const w of c.whites) {
      const b = w + 1; if (b >= n) continue;
      const fl = Uint32Array.from(c.states[0]); fl[(b / 32) | 0] ^= (1 << (b % 32)) >>> 0;
      const alt = settle(n, fl, p, T);
      if (!alt) { console.log(`  n=${n}: flip at w=${w} did not settle`); continue; }
      if (add(alt)) q.push(alt);
    }
  }
  const lens = cycles.map((c) => minPeriod(c.states, words));
  const nOdd = lens.reduce((a, b) => a + b, 0);
  console.log(`n=${n}: odd cycles = ${cycles.length}, minimal periods [${lens.join(', ')}], increment = ${nOdd}, maxCycle = ${Math.max(...lens)}, ratio ${nOdd / Math.max(...lens)}   [${((Date.now() - t0) / 1000).toFixed(1)}s]`);
  cycles.forEach((c, i) => console.log(`   cycle ${i}: period ${lens[i]}, whites [${c.whites.join(',')}]`));
  console.log('');
}

enumerateOdd(72577, 32, 150000);
enumerateOdd(87868, 32, 185000);
