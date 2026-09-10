// Talus, 2026-09-10.  Does the no-drop law hold for EVERY white-right-half
// configuration, or only for the seed?
//
// X_b is the configuration white at every x >= 1 at time 0 whose centre column
// is b (crystal 40).  Its right-diagonal tower is built by exactly the same
// recurrence, with free bits R_k(0) = b(k).  So enumerating free bits
// enumerates the family.
//
// The law "P_k = 2L iff the driver has odd weight over one period L" is
// EQUIVALENT to no-drop, P_k >= L = max(P_{k-1}, P_{k-2}):
//   - odd weight: L is not a period, P_k | 2L, P_k a power of two, so P_k = 2L
//     unconditionally;
//   - even weight: L is a period, so P_k | L, and the law says P_k = L.
// So the whole content of the topic is: the minimal periods never drop.
//
// Three tests.
//   A. exhaustive DFS over all free-bit choices to depth EXH, deduping states,
//      looking for a drop.
//   B. random deep towers.
//   C. the periodic boundary b = (1000)^inf, which the 2026-09-08 sweep found
//      "good" (column 1 eventually periodic) with diagonal periods past 512.

const EXH = 20;
const RAND_TOWERS = 400, RAND_DEPTH = 44;
const MAXLEN = 1 << 22;

function minPeriod(w) {
  const N = w.length;
  for (let d = 1; d < N; d <<= 1) {
    let ok = true;
    for (let i = 0; i + d < N; i++) if (w[i] !== w[i + d]) { ok = false; break; }
    if (ok) return d;
  }
  return N;
}

// one step of the tower: (u = R_{k-2}, v = R_{k-1}, bit) -> R_k (minimal period)
function step(u, v, bit) {
  const L = Math.max(u.length, v.length);
  if (2 * L > MAXLEN) return null;
  const buf = new Uint8Array(2 * L);
  buf[0] = bit;
  for (let j = 0; j + 1 < 2 * L; j++)
    buf[j + 1] = buf[j] ^ (v[(j + 1) % v.length] | u[(j + 2) % u.length]);
  const p = minPeriod(buf);
  return buf.slice(0, p);
}

function key(u, v) { return u.join('') + '|' + v.join(''); }

// ---------------- A. exhaustive, depth-first ----------------
{
  let drops = 0, firstDrop = null, totalTrans = 0;
  const perDepthMaxP = new Int32Array(EXH + 1);
  function dfs(u, v, k, bits) {
    if (k > EXH) return;
    const L = Math.max(u.length, v.length);
    for (const bit of [0, 1]) {
      const w = step(u, v, bit);
      if (!w) continue;
      totalTrans++;
      if (w.length > perDepthMaxP[k]) perDepthMaxP[k] = w.length;
      if (w.length < L) {
        drops++;
        if (!firstDrop) firstDrop = { k, bits: bits + bit, u: u.join(''), v: v.join(''), w: w.join(''), L, P: w.length };
      }
      dfs(v, w, k + 1, bits + bit);
    }
  }
  // base: R_0 = b(0)^inf.  The seed has b(0)=1; b(0)=0 is the degenerate branch.
  for (const b0 of [0, 1]) for (const b1 of [0, 1]) {
    const R0 = Uint8Array.from([b0]);
    const buf = new Uint8Array(2);
    buf[0] = b1; buf[1] = b1 ^ b0;           // R_1(j+1) = R_1(j) XOR R_0(j+1)
    const r1 = buf.slice(0, minPeriod(buf));
    dfs(R0, r1, 2, '' + b0 + b1);
  }
  console.log(`A. exhaustive DFS over all free-bit choices to depth ${EXH}: ` +
    `${totalTrans} transitions, ${drops} drops`, firstDrop ? JSON.stringify(firstDrop) : '(none)');
  console.log('   largest period seen at each depth:', Array.from(perDepthMaxP.slice(2)).join(','));
}

// ---------------- B. random deep towers ----------------
{
  let seed = 12345;
  const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >> 17; seed ^= seed << 5; seed >>>= 0; return seed & 1; };
  let drops = 0, firstDrop = null, tested = 0;
  const finalP = [];
  for (let t = 0; t < RAND_TOWERS; t++) {
    let u = Uint8Array.from([1]);
    const buf = new Uint8Array(2); buf[0] = rnd(); buf[1] = buf[0] ^ 1;
    let v = buf.slice(0, minPeriod(buf));
    for (let k = 2; k <= RAND_DEPTH; k++) {
      const L = Math.max(u.length, v.length);
      const w = step(u, v, rnd());
      if (!w) break;
      tested++;
      if (w.length < L) { drops++; if (!firstDrop) firstDrop = { t, k, L, P: w.length }; }
      u = v; v = w;
    }
    finalP.push(v.length);
  }
  finalP.sort((a, b) => a - b);
  console.log(`B. ${RAND_TOWERS} random towers to depth ${RAND_DEPTH}: ${tested} steps, ${drops} drops`,
    firstDrop ? JSON.stringify(firstDrop) : '(none)');
  console.log(`   final period: min ${finalP[0]}, median ${finalP[RAND_TOWERS >> 1]}, max ${finalP[RAND_TOWERS - 1]}`);
}

// ---------------- C. periodic boundaries ----------------
{
  const words = ['1', '10', '1000', '11', '110', '1110', '10101', '1111111', '11111110', '100000000'];
  for (const b of words) {
    let u = Uint8Array.from([Number(b[0])]);
    const b1 = Number(b[1 % b.length]);
    const buf = new Uint8Array(2); buf[0] = b1; buf[1] = b1 ^ u[0];
    let v = buf.slice(0, minPeriod(buf));
    const P = [u.length, v.length];
    let drops = 0;
    for (let k = 2; k <= 60; k++) {
      const L = Math.max(u.length, v.length);
      const w = step(u, v, Number(b[k % b.length]));
      if (!w) { P.push(-1); break; }
      if (w.length < L) drops++;
      P.push(w.length);
      u = v; v = w;
    }
    console.log(`C. b=(${b})^inf  drops=${drops}  P_0..=${P.slice(0, 61).join(',')}`);
  }
}
