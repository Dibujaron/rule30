// Talus, 2026-09-12.  The left half alone, verified three ways.
//
// talus12_halves.mjs reported that for rule 30 the set L of column-1 prefixes
// whose leftward solve keeps the cone white is EMPTY at moderate depth -- so the
// cone alone bounds a periodic block, with no appeal to the right half at all.
// That is the session's main claim and it came out of one bitmask routine, so
// before it is believed:
//   [V1] a second implementation, plain arrays, no bit tricks, compared on every
//        one of the 2^T prefixes;
//   [V2] an end-to-end control -- a real configuration white at x < -a, evolved
//        forward, must have its own (col0, col1) accepted;
//   [V3] the left-only bound compared against the exhaustive outward DFS, which
//        shares no code with either.

// ---------- implementation 1: bitmasks (as in talus12_halves) ---------------
function leftOK_mask(col0mask, col1mask, a, T) {
  let A = col0mask >>> 0, B = col1mask >>> 0, len = T;
  for (let k = 1; k <= T - 2; k++) {
    let C = ((A >>> 1) ^ (A | B)) >>> 0;
    len -= 1;
    if (len <= 0) break;
    const M = len >= 32 ? 0xffffffff : ((1 << len) - 1) >>> 0;
    C = (C & M) >>> 0;
    if (k > a && (C & 1)) return k;     // the column that broke it
    B = A; A = C;
  }
  return 0;
}

// ---------- implementation 2: plain arrays ---------------------------------
// sideways_inverse:  c(i-1)[t] = c(i)[t+1] XOR ( c(i)[t] OR c(i+1)[t] )
function leftOK_arr(col0, col1, a, T) {
  let right = col0.slice(0, T);          // c(i+1) = column 0
  let mid = col1.slice(0, T);            // c(i)   = column 1  -- solving for column 0? no:
  // start at i = 0: c(-1) from c(0) and c(1)
  let ci = col0.slice(0, T);             // c(i)   = column 0
  let cip = col1.slice(0, T);            // c(i+1) = column 1
  for (let k = 1; k <= T - 2; k++) {
    const n = ci.length - 1;
    if (n <= 0) break;
    const cim = new Array(n);
    for (let t = 0; t < n; t++) cim[t] = ci[t + 1] ^ (ci[t] | cip[t]);
    if (k > a && cim[0] === 1) return k;
    cip = ci; ci = cim;
  }
  return 0;
}

// ---------- the real automaton, for the end-to-end control ------------------
// a configuration is an array over x in [-LO, HI]; index 0 is x = -LO
function evolveRow(row) {
  const n = row.length, out = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const l = i > 0 ? row[i - 1] : 0, c = row[i], r = i < n - 1 ? row[i + 1] : 0;
    out[i] = l ^ (c | r);
  }
  return out;
}

const periodic = (w, T) => { const c = []; for (let t = 0; t < T; t++) c.push(w[t % w.length]); return c; };
const show = (w) => w.join("");
const maskOf = (arr, T) => { let m = 0; for (let t = 0; t < T; t++) m |= (arr[t] ? 1 : 0) << t; return m >>> 0; };

// ================= [V1] two implementations, every prefix ==================
console.log(`[V1] bitmask vs plain-array leftward solve, over every column-1 prefix`);
let cmp = 0, dis = 0;
for (const word of [[0, 1, 1], [1, 0, 0], [0, 1], [1], [0], [1, 1, 1, 0], [1, 0, 1, 1, 0]]) {
  for (const a of [2, 3, 5, 7]) {
    const T = 14, col0 = periodic(word, T), m0 = maskOf(col0, T);
    for (let v = 0; v < (1 << T); v++) {
      const col1 = []; for (let t = 0; t < T; t++) col1.push((v >> t) & 1);
      const r1 = leftOK_mask(m0, v, a, T), r2 = leftOK_arr(col0, col1, a, T);
      cmp++;
      if ((r1 === 0) !== (r2 === 0) || r1 !== r2) dis++;
    }
  }
}
console.log(`     ${cmp} prefixes compared, ${dis} disagreements`);

// ================= [V2] end-to-end: real configurations pass ===============
console.log(`\n[V2] end-to-end control: evolve a genuine configuration white at x < -a`);
console.log(`     and black at -a, read off its own column 0 and column 1, and feed`);
console.log(`     them to the solver.  Every one must be accepted.`);
let ok = 0, bad = 0;
let seedv = 123456789;
const rnd = () => { seedv ^= seedv << 13; seedv >>>= 0; seedv ^= seedv >>> 17; seedv ^= seedv << 5; seedv >>>= 0; return seedv; };
for (let trial = 0; trial < 4000; trial++) {
  const a = 1 + (rnd() % 8);
  const T = 16;
  const LO = a + T + 4, HI = T + 6;
  const row = new Array(LO + HI + 1).fill(0);
  const org = LO;                      // index of x = 0
  row[org - a] = 1;                    // black at -a
  for (let x = -a + 1; x <= HI; x++) row[org + x] = rnd() & 1;
  let cur = row;
  const c0 = [], c1 = [];
  for (let t = 0; t < T; t++) { c0.push(cur[org]); c1.push(cur[org + 1]); cur = evolveRow(cur); }
  const r = leftOK_arr(c0, c1, a, T);
  if (r === 0) ok++; else { bad++; if (bad <= 5) console.log(`     REJECTED a=${a} at column -${r}`); }
}
console.log(`     ${ok} accepted, ${bad} wrongly rejected`);

// a deliberately broken control: the same solver must reject a configuration
// that is NOT white outside the cone
let caught = 0, missed = 0;
for (let trial = 0; trial < 4000; trial++) {
  const a = 1 + (rnd() % 6);
  const T = 16;
  const LO = a + T + 8, HI = T + 6;
  const row = new Array(LO + HI + 1).fill(0);
  const org = LO;
  row[org - a] = 1;
  for (let x = -a + 1; x <= HI; x++) row[org + x] = rnd() & 1;
  row[org - a - 1 - (rnd() % 6)] = 1;           // one black cell OUTSIDE the cone
  let cur = row;
  const c0 = [], c1 = [];
  for (let t = 0; t < T; t++) { c0.push(cur[org]); c1.push(cur[org + 1]); cur = evolveRow(cur); }
  if (leftOK_arr(c0, c1, a, T) !== 0) caught++; else missed++;
}
console.log(`     mutant control (one black cell outside the cone): ${caught} caught, ${missed} missed`);

// ================= [L] the left-only bound =================================
// T_L(word, a) = the least depth at which NO column-1 prefix survives the cone
function TL(word, a, TMAX) {
  const p = word.length;
  for (let T = p + 1; T <= TMAX; T++) {
    const col0 = periodic(word, T), m0 = maskOf(col0, T);
    let any = false;
    const N = 1 << T;
    for (let v = 0; v < N; v++) if (leftOK_mask(m0, v, a, T) === 0) { any = true; break; }
    if (!any) return T;
  }
  return null;
}

// ---- the exhaustive outward DFS, for one pinned word (shares no code) ------
function dfsF(a, word, cap, budget) {
  const p = word.length;
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (a <= cap + 3) req[a] = 1;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  function fillRD(k, rc) {
    const rdk = RD[k], rd1 = RD[k - 1], rd2 = RD[k - 2];
    rdk[0] = rc;
    for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
    return rdk[k - 1];
  }
  function rec(k) {
    if (k > cap) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    const ldk = LD[k], ld1 = LD[k - 1], ld2 = LD[k - 2];
    ldk[0] = 0;
    for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
    const base = ldk[k - 1];
    for (const rc of [0, 1]) {
      const centre0 = base ^ (col[k - 1] | fillRD(k, rc));
      const rdk = RD[k];
      const cv = word[k % p];
      const lc = centre0 ^ cv;
      if (req[k] >= 0 && lc !== req[k]) continue;
      col[k] = cv;
      const flip = (lc === 1);
      if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      ldk[k] = cv; rdk[k] = cv;
      if (k + 1 > best) best = k + 1;
      rec(k + 1);
      if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
    }
  }
  try { col[0] = word[0]; LD[0][0] = word[0]; RD[0][0] = word[0]; best = 1; rec(1); }
  catch (e) { if (e !== AB) throw e; }
  return { best, status };
}

console.log(`\n[V3] the left-only bound T_L against the exhaustive f, per WORD.`);
console.log(`     T_L = least depth at which NO column-1 prefix keeps the cone white.`);
console.log(`     f   = the exhaustive longest block for that word (outward DFS).`);
console.log(`     T_L is an upper certificate only if f < T_L at every cell.`);
let viol = 0, cells = 0, gapSum = 0, gapMax = -1, gapAt = "";
for (const word of [[0], [1], [0, 1], [1, 1], [0, 0, 1], [0, 1, 1], [1, 0, 0], [1, 1, 0], [0, 1, 0], [1, 0, 1],
                    [0, 0, 1, 1], [1, 1, 1, 0], [1, 0, 1, 1], [0, 1, 1, 0, 1]]) {
  let line = `     w=${show(word).padEnd(5)} |`;
  for (const a of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const t = TL(word, a, 22);
    const f = dfsF(a, word, 60, 2e8);
    cells++;
    if (t === null) { line += `  a${a}: TL>22 f=${f.best}`; continue; }
    if (f.best >= t) { viol++; line += `  a${a}: *TL=${t} f=${f.best}*`; }
    else {
      const g = t - f.best; gapSum += g;
      if (g > gapMax) { gapMax = g; gapAt = `w=${show(word)} a=${a}`; }
      line += `  a${a}:${t}/${f.best}`;
    }
  }
  console.log(line);
}
console.log(`     ${cells} cells, ${viol} violations of f < T_L; mean gap ${(gapSum / cells).toFixed(2)}, worst ${gapMax} at ${gapAt}`);
