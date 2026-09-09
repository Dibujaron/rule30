// Talus, 2026-09-09.  The rigidity law, tested where the reduction says it must break.
//
// Reduction (verified exhaustively in talus5_odd.mjs, exactly to n=520 in talus5_formula.mjs):
//   |A(n)| - |A(n-1)| = #{odd periodic points of T_n},
// and the odd periodic points are exactly the "left sides of rule 30 truncated to n cells".
// So the law says: the odd periodic set is one cycle, of the largest length in the graph.
//
// The odd periodic set branches at every bit w with bit w identically white on a cycle:
// there bit w+1 obeys x' = bit(w-1) XOR x, a running XOR, so its complement solves it too.
// At a DOUBLING white the complement is the same cycle read half a period later; at a
// COMPLEMENT-type white it is a genuinely different cycle, and then #odd = 2*maxCycle.
//
// This script, at one width at a time, with a bit-packed engine:
//   (1) runs the seed's orbit to its cycle and reads the cycle's period off the picture,
//   (2) lists every bit identically white over that cycle -- the branch points,
//   (3) at each branch point flips bit w+1 and asks whether the flipped state is periodic
//       and whether it is on the seed's own cycle.
//
// usage: node talus5_second.mjs

const W = 32;
function makeEngine(n) {
  const words = Math.ceil(n / W);
  const topBits = n - (words - 1) * W;
  const topMask = topBits === 32 ? 0xffffffff : (((1 << topBits) >>> 0) - 1) >>> 0;
  function step(src, dst) {
    for (let i = words - 1; i >= 0; i--) {
      const a = src[i];
      const b = i >= 1 ? src[i - 1] : 0;
      dst[i] = (((a << 2) | (b >>> 30)) ^ (((a << 1) | (b >>> 31)) | a)) >>> 0;
    }
    dst[words - 1] = (dst[words - 1] & topMask) >>> 0;
  }
  return { words, step };
}
const eq = (a, b, w) => { for (let i = 0; i < w; i++) if (a[i] !== b[i]) return false; return true; };
const bitOf = (st, b) => (st[(b / 32) | 0] >>> (b % 32)) & 1;

// --- engine validation against BigInt, before any large run --------------------
{
  let bad = 0, tested = 0;
  for (const n of [1, 2, 3, 5, 8, 17, 31, 32, 33, 40, 63, 64, 65, 100, 129]) {
    const { words, step } = makeEngine(n);
    const mask = (1n << BigInt(n)) - 1n;
    let big = 1n;
    let cur = new Uint32Array(words); cur[0] = 1;
    let nxt = new Uint32Array(words);
    for (let t = 0; t < 60; t++) {
      big = ((4n * big) ^ ((2n * big) | big)) & mask;
      step(cur, nxt); [cur, nxt] = [nxt, cur];
      let v = 0n;
      for (let i = words - 1; i >= 0; i--) v = (v << 32n) | BigInt(cur[i] >>> 0);
      tested++;
      if (v !== big) bad++;
    }
  }
  console.log(`engine check, packed vs BigInt, ${tested} rows over 15 widths: ${bad} mismatches\n`);
}

// run `start` for T steps keeping the last (p+1) states; report whether it is p-periodic
function settle(n, start, p, T) {
  const { words, step } = makeEngine(n);
  const ring = [];
  for (let i = 0; i <= p; i++) ring.push(new Uint32Array(words));
  ring[0].set(start.subarray(0, words));
  let lastDiff = -1;
  for (let t = 1; t <= T; t++) {
    const cur = ring[t % (p + 1)];
    step(ring[(t - 1) % (p + 1)], cur);
    if (t >= p && !eq(ring[(t - p) % (p + 1)], cur, words)) lastDiff = t;
  }
  const states = [];
  for (let i = 0; i < p; i++) states.push(Uint32Array.from(ring[(T - i + p + 1) % (p + 1)]));
  return { states, pre: lastDiff + 1, settled: lastDiff < T - p, words };
}

function minimalPeriod(states, words) {
  const p = states.length;
  for (let d = 1; d <= p; d++) {
    if (p % d) continue;
    let ok = true;
    for (let i = 0; i < p && ok; i++) if (!eq(states[i], states[(i + d) % p], words)) ok = false;
    if (ok) return d;
  }
  return p;
}

function report(n, P, T) {
  const { words } = makeEngine(n);
  const one = new Uint32Array(words); one[0] = 1;
  const base = settle(n, one, P, T);
  if (!base.settled) { console.log(`n=${n}: seed NOT settled by t=${T} (pre>=${base.pre})`); return; }
  const minP = minimalPeriod(base.states, words);
  // bits identically white over one period
  const or = new Uint32Array(words);
  for (const st of base.states) for (let i = 0; i < words; i++) or[i] |= st[i];
  const whites = [];
  for (let b = 0; b < n; b++) if (!((or[(b / 32) | 0] >>> (b % 32)) & 1)) whites.push(b);
  const oddSeed = bitOf(base.states[0], 0);
  console.log(`n=${n}: seed cycle settled by t=${base.pre}, minimal period ${minP} (ran with p=${P}), bit0=${oddSeed}`);
  console.log(`  bits identically white on the cycle: [${whites.join(', ')}]`);
  for (const w of whites) {
    const b = w + 1;
    if (b >= n) { console.log(`  w=${w}: branch bit ${b} is outside width ${n}`); continue; }
    const flipped = Uint32Array.from(base.states[0]);
    flipped[(b / 32) | 0] ^= (1 << (b % 32)) >>> 0;
    const alt = settle(n, flipped, P, T);
    let same = false;
    if (alt.settled) for (const st of base.states) if (eq(st, alt.states[0], words)) same = true;
    const altP = alt.settled ? minimalPeriod(alt.states, words) : '?';
    // is the flipped orbit exactly seed XOR 2^b ?
    let shifted = alt.settled;
    if (alt.settled) {
      let found = false;
      for (let ph = 0; ph < P && !found; ph++) {
        let ok = true;
        for (let i = 0; i < P && ok; i++) {
          const a = alt.states[i], s = base.states[(i + ph) % P];
          for (let j = 0; j < words && ok; j++) {
            const x = j === ((b / 32) | 0) ? (s[j] ^ ((1 << (b % 32)) >>> 0)) >>> 0 : s[j];
            if (a[j] !== x) ok = false;
          }
        }
        if (ok) found = true;
      }
      shifted = found;
    }
    console.log(
      `  w=${w} -> flip bit ${b}: settled=${alt.settled} pre=${alt.pre} minPeriod=${altP} | ` +
        `on the seed's cycle? ${same ? 'YES (same cycle, other phase -- a doubling white)' : 'NO  ** A SECOND ODD CYCLE **'}` +
        `${shifted ? ' | flipped orbit = seed orbit XOR 2^' + b : ''}`
    );
  }
  console.log('');
}

// small widths first: the known doubling whites 2, 7, 28, 399
report(30, 8, 200);
report(401, 16, 1200);
// the critical width: the first complement-type white is at bit 53207, so the branch
// bit is 53208 and the first width that can hold it is n = 53209.
report(53209, 16, 110000);
