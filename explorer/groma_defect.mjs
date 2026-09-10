// Groma, 2026-09-10.  Is the switch-index sequence of a "bad" boundary a
// quasi-periodic background punctured by defects, and if so are the defect
// gaps a rotation (three-distance) signature?
//
// Two candidate structure classes from combinatorics on words:
//   * p(n) = n + c eventually  ==>  quasi-Sturmian: a morphic image of a
//     Sturmian word, hence a coding of an irrational rotation.  A rotation
//     coding has, by the three-distance theorem, at most 3 distinct return
//     times to any interval -- so at most 3 distinct defect gaps.
//   * p(n) <= K n  ==>  linear complexity, the regime where Durand-Host-Skau
//     type S-adic structure theorems live.
// Anything with p(n) growing faster than every polynomial has positive
// entropy and lies in no structure class at all.
//
// This measures p(n) to large n on a long run, and the defect gaps against
// the best background period.

const T = Number(process.env.GROMA_T ?? 2000000);

function halflineTrace(b, T) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W), s = new Uint32Array(W);
  const col0 = new Uint8Array(T), col1 = new Uint8Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    col0[t] = r[0] & 1;
    col1[t] = (r[0] >>> 1) & 1;
    const last = Math.min(W - 2, (t >> 5) + 1);
    for (let i = 0; i <= last; i++) {
      const cur = r[i];
      const up = (cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0);
      const down = (cur >>> 1) | (r[i + 1] << 31);
      s[i] = up ^ (cur | down);
    }
    s[last + 1] = 0;
    s[0] = (s[0] & ~1) | (b[(t + 1) % p] & 1);
    const tmp = r; r = s; s = tmp;
  }
  return { col0, col1 };
}

function switchSeq(col0, col1, T) {
  const j = [];
  let t = 0;
  while (t < T) {
    if (col0[t] !== 0) { t++; continue; }
    const s0 = t;
    while (t < T && col0[t] === 0) t++;
    if (t >= T) break;
    const L = t - s0;
    let v = L;
    for (let m = 0; m < L; m++) if (col1[s0 + m] === 1) { v = m; break; }
    j.push(v);
  }
  return j;
}

function complexityAt(seq, from, to, n) {
  const set = new Set();
  for (let i = from; i + n <= to; i++) {
    let key = '';
    for (let k = 0; k < n; k++) key += String.fromCharCode(48 + seq[i + k]);
    set.add(key);
  }
  return set.size;
}

function report(name, j) {
  const N = j.length;
  const from = N >> 1, to = N;
  console.log(`\n=== ${name}: ${N} letters, measuring on the last ${to - from}`);
  const ns = [1, 2, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512];
  const out = [];
  for (const n of ns) {
    if (n > (to - from) / 8) break;
    const c = complexityAt(j, from, to, n);
    out.push(`p(${n})=${c}`);
    if (c > (to - from) * 0.9) { out.push('[SATURATED]'); break; }
  }
  console.log('  ' + out.join(' '));
  // p(n)/n and log2 p(n)/n
  const pts = [];
  for (const n of [16, 32, 64, 128, 256]) {
    if (n > (to - from) / 8) break;
    const c = complexityAt(j, from, to, n);
    pts.push(`n=${n}: p/n=${(c / n).toFixed(2)} log2(p)/n=${(Math.log2(c) / n).toFixed(4)}`);
  }
  console.log('  ' + pts.join('  |  '));

  // best background period: smallest q <= QMAX with disagreement rate < 5%
  const QMAX = 4096;
  let best = -1, bestRate = 1;
  const a = from, b2 = to;
  for (let q = 1; q <= QMAX && q < (b2 - a) / 4; q++) {
    let bad = 0;
    const lim = b2 - q;
    for (let i = a; i < lim; i++) if (j[i] !== j[i + q]) bad++;
    const rate = bad / (lim - a);
    if (rate < bestRate) { bestRate = rate; best = q; }
    if (rate < 0.001) break;
  }
  console.log(`  best background period q=${best}, disagreement rate ${(bestRate * 100).toFixed(3)}%`);
  if (best > 0 && bestRate < 0.3) {
    const defects = [];
    const lim = b2 - best;
    for (let i = a; i < lim; i++) if (j[i] !== j[i + best]) defects.push(i);
    const gaps = new Map();
    for (let i = 1; i < defects.length; i++) {
      const g = defects[i] - defects[i - 1];
      gaps.set(g, (gaps.get(g) ?? 0) + 1);
    }
    const sorted = [...gaps.entries()].sort((x, y) => y[1] - x[1]);
    console.log(`  ${defects.length} defect positions, ${gaps.size} distinct gaps; top 12: ` +
      sorted.slice(0, 12).map(([g, c]) => `${g}x${c}`).join(' '));
    console.log(`  three-distance test: ${gaps.size <= 3 ? 'PASSES (rotation signature)' : 'FAILS (' + gaps.size + ' distinct gaps)'}`);
  }
}

for (const str of ['10', '01011', '100000000', '1010001001']) {
  const b = [...str].map((c) => (c === '1' ? 1 : 0));
  const t0 = Date.now();
  const { col0, col1 } = halflineTrace(b, T);
  const j = switchSeq(col0, col1, T);
  report(`b = ${str} (T=${T}, ${((Date.now() - t0) / 1000).toFixed(0)}s)`, j);
}
