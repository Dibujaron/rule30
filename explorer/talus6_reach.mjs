// Talus, 2026-09-10.  Obstruction 7 says no universal argument over periodic
// words gives right-diagonal minimality, with witness u = 1000, v = 1110 at
// L = 4.  But those are ARBITRARY words.  The pairs (R_{k-2}, R_{k-1}) that
// actually occur as consecutive right diagonals are a much smaller set.
//
// This script:
//   1. enumerates the reachable consecutive pairs at each depth (exhaustively
//      over free bits), and reports how many of ALL pairs of that period they
//      are;
//   2. asks whether obstruction 7's witness pair is reachable;
//   3. counts, over reachable pairs vs all pairs, how often the driver
//      g(j) = v(j+1) | u(j+2) collapses (minper(g) < L) and, when it does,
//      whether the collapse is the harmless kind (minper(g) = L/2 with odd
//      weight over that half) or a genuine period drop;
//   4. tests the local pairing law that the recurrence one level down supplies:
//      u(q+1) = 1 forces v(q+1) != v(q).

const DEPTH = 14;

function minPeriod(w) {
  const N = w.length;
  for (let d = 1; d < N; d <<= 1) {
    let ok = true;
    for (let i = 0; i + d < N; i++) if (w[i] !== w[i + d]) { ok = false; break; }
    if (ok) return d;
  }
  return N;
}
const asStr = (w) => Array.from(w).join('');

function integrate(u, v, bit) {
  const L = Math.max(u.length, v.length);
  const g = new Uint8Array(L);
  for (let j = 0; j < L; j++) g[j] = v[(j + 1) % v.length] | u[(j + 2) % u.length];
  const gp = minPeriod(g);
  let wg = 0; for (let j = 0; j < gp; j++) wg += g[j];
  const buf = new Uint8Array(2 * L);
  buf[0] = bit;
  for (let j = 0; j + 1 < 2 * L; j++) buf[j + 1] = buf[j] ^ g[j % L];
  const p = minPeriod(buf);
  return { w: buf.slice(0, p), L, gp, gOddOverOwnPeriod: wg % 2 === 1, P: p };
}

// ---- 1 & 3: reachable pairs, level by level ----
let level = new Map();  // key -> [u, v]
for (const b0 of [0, 1]) for (const b1 of [0, 1]) {
  const R0 = Uint8Array.from([b0]);
  const buf = new Uint8Array(2); buf[0] = b1; buf[1] = b1 ^ b0;
  const r1 = buf.slice(0, minPeriod(buf));
  level.set(asStr(R0) + '|' + asStr(r1), [R0, r1]);
}
console.log('depth  reachable-pairs  by-(|u|,|v|)  collapses  harmless  drops');
for (let k = 2; k <= DEPTH; k++) {
  const next = new Map();
  let collapses = 0, harmless = 0, drops = 0;
  for (const [, [u, v]] of level) {
    for (const bit of [0, 1]) {
      const r = integrate(u, v, bit);
      if (r.gp < r.L) {
        collapses++;
        if (r.P >= r.L) harmless++; else drops++;
      }
      next.set(asStr(v) + '|' + asStr(r.w), [v, r.w]);
    }
  }
  level = next;
  const shapes = new Map();
  for (const [, [u, v]] of level) {
    const key = `${u.length},${v.length}`;
    shapes.set(key, (shapes.get(key) || 0) + 1);
  }
  const shapeStr = Array.from(shapes).map(([s, n]) => `${s}:${n}`).join(' ');
  console.log(`${k}  ${level.size}  ${shapeStr}  ${collapses}  ${harmless}  ${drops}`);
}

// ---- 2: is obstruction 7's witness reachable? ----
// Rebuild the reachable pairs at every depth up to DEPTH and search for
// (u, v) equal, up to rotation, to (1000, 1110).
{
  const target = ['1000', '1110'];
  const rots = (s) => Array.from({ length: s.length }, (_, i) => s.slice(i) + s.slice(0, i));
  const targetSet = new Set();
  for (const a of rots(target[0])) for (const b of rots(target[1])) targetSet.add(a + '|' + b);
  let lvl = new Map();
  for (const b0 of [0, 1]) for (const b1 of [0, 1]) {
    const R0 = Uint8Array.from([b0]);
    const buf = new Uint8Array(2); buf[0] = b1; buf[1] = b1 ^ b0;
    lvl.set(asStr(R0) + '|' + asStr(buf.slice(0, minPeriod(buf))), [R0, buf.slice(0, minPeriod(buf))]);
  }
  let found = null;
  for (let k = 2; k <= 16 && !found; k++) {
    const next = new Map();
    for (const [, [u, v]] of lvl) for (const bit of [0, 1]) {
      const r = integrate(u, v, bit);
      const key = asStr(v) + '|' + asStr(r.w);
      if (targetSet.has(key)) found = { k, key };
      next.set(key, [v, r.w]);
    }
    lvl = next;
  }
  console.log('\n2. obstruction 7 witness (1000, 1110) reachable as consecutive diagonals:',
    found ? JSON.stringify(found) : 'NO, searched depths 2..16');
  // how many pairs of period exactly 4 x 4 are reachable at all, out of 16 x 16?
  let lvl2 = new Map();
  for (const b0 of [0, 1]) for (const b1 of [0, 1]) {
    const R0 = Uint8Array.from([b0]);
    const buf = new Uint8Array(2); buf[0] = b1; buf[1] = b1 ^ b0;
    lvl2.set(asStr(R0) + '|' + asStr(buf.slice(0, minPeriod(buf))), [R0, buf.slice(0, minPeriod(buf))]);
  }
  const seen44 = new Set(), seenAll = new Set();
  for (let k = 2; k <= 16; k++) {
    const next = new Map();
    for (const [, [u, v]] of lvl2) for (const bit of [0, 1]) {
      const r = integrate(u, v, bit);
      const key = asStr(v) + '|' + asStr(r.w);
      seenAll.add(key);
      if (v.length === 4 && r.w.length === 4) seen44.add(key);
      next.set(key, [v, r.w]);
    }
    lvl2 = next;
  }
  console.log(`   reachable (period 4, period 4) consecutive pairs: ${seen44.size} of the 12 x 12 = 144 ` +
    `pairs of words of minimal period exactly 4`);
  console.log('   they are:', Array.from(seen44).sort().join(' '));
}

// ---- 4: the local pairing law from the recurrence one level down ----
{
  // For consecutive diagonals (u, v) = (R_{k-2}, R_{k-1}):
  //    v(j+1) = v(j) XOR ( u(j+1) OR R_{k-3}(j+2) )
  // so u(j+1) = 1 forces v(j+1) != v(j).  Check on reachable triples, and
  // measure how often an ARBITRARY pair of periodic words satisfies it.
  let lvl = [];
  for (const b0 of [0, 1]) for (const b1 of [0, 1]) {
    const R0 = Uint8Array.from([b0]);
    const buf = new Uint8Array(2); buf[0] = b1; buf[1] = b1 ^ b0;
    lvl.push([R0, R0, buf.slice(0, minPeriod(buf))]);  // (w, u, v) with w a dummy at the base
  }
  let checked = 0, viol = 0;
  for (let k = 2; k <= 16; k++) {
    const next = [];
    for (const [, u, v] of lvl) for (const bit of [0, 1]) {
      const r = integrate(u, v, bit);
      // law on the NEW consecutive pair (v, w): v(j+1)=1 forces w(j+1) != w(j)
      const w = r.w, N = Math.max(v.length, w.length) * 2;
      for (let j = 0; j < N; j++) {
        if (v[(j + 1) % v.length] === 1) {
          checked++;
          if (w[(j + 1) % w.length] === w[j % w.length]) viol++;
        }
      }
      next.push([u, v, w]);
    }
    lvl = next.slice(0, 4096);
  }
  console.log(`\n4. pairing law "v black at q+1 forces w to flip at q+1": ` +
    `${checked} positions checked on reachable pairs, ${viol} violations`);
}
