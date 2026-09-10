// Talus, 2026-09-10.  Deep tower runs.
//
// The topic's hope: rightDiagonal_period_unbounded is PROVED on this board, so
// if unbounded right-diagonal periods forced an aperiodic centre column, P1
// would fall.  The tower sees exactly the right half plus the centre column,
// i.e. exactly the family X_b (crystal 40).  So the hope is testable: is there
// an eventually periodic b whose tower periods grow without apparent bound?
//
// Runs the seed and several periodic boundaries as deep as memory allows and
// reports the period sequence and the doubling density.

const DEPTH = 64;
const MAXLEN = 1 << 27;

function minPeriod(w) {
  const N = w.length;
  for (let d = 1; d < N; d <<= 1) {
    let ok = true;
    for (let i = 0; i + d < N; i++) if (w[i] !== w[i + d]) { ok = false; break; }
    if (ok) return d;
  }
  return N;
}

// ---- the seed's centre column, from the packed-row engine ----
function shiftUp(r, k, words) {
  const out = new Uint32Array(words);
  const w = k >> 5, b = k & 31;
  if (b === 0) { for (let i = r.length - 1; i >= 0; i--) if (i + w < words) out[i + w] = r[i]; }
  else for (let i = r.length - 1; i >= 0; i--) {
    const v = r[i];
    if (i + w < words) out[i + w] |= (v << b) >>> 0;
    if (i + w + 1 < words) out[i + w + 1] |= (v >>> (32 - b));
  }
  return out;
}
function seedCentre(n) {
  const c = new Uint8Array(n + 1);
  let r = new Uint32Array(1); r[0] = 1;
  c[0] = 1;
  for (let t = 0; t < n; t++) {
    const words = ((2 * (t + 1)) >> 5) + 1;
    const a = shiftUp(r, 2, words), b = shiftUp(r, 1, words);
    const o = new Uint32Array(words);
    for (let i = 0; i < words; i++) o[i] = (a[i] ^ (b[i] | (i < r.length ? r[i] : 0))) >>> 0;
    r = o;
    c[t + 1] = (r[(t + 1) >> 5] >>> ((t + 1) & 31)) & 1;
  }
  return c;
}

function runTower(name, bitAt, depth) {
  const P = [];
  let u = Uint8Array.from([bitAt(0)]);
  P.push(1);
  const buf = new Uint8Array(2); buf[0] = bitAt(1); buf[1] = buf[0] ^ u[0];
  let v = buf.slice(0, minPeriod(buf));
  P.push(v.length);
  let doublings = 0, drops = 0, reached = 1, lawFail = 0;
  for (let k = 2; k <= depth; k++) {
    const L = Math.max(u.length, v.length);
    if (2 * L > MAXLEN) break;
    const g = new Uint8Array(L);
    for (let j = 0; j < L; j++) g[j] = v[(j + 1) % v.length] | u[(j + 2) % u.length];
    let W = 0; for (let j = 0; j < L; j++) W += g[j];
    const b2 = new Uint8Array(2 * L);
    b2[0] = bitAt(k);
    for (let j = 0; j + 1 < 2 * L; j++) b2[j + 1] = b2[j] ^ g[j % L];
    const p = minPeriod(b2);
    if (p !== ((W % 2 === 1) ? 2 * L : L)) lawFail++;
    if (p > L) doublings++;
    if (p < L) drops++;
    P.push(p);
    reached = k;
    u = v; v = b2.slice(0, p);
  }
  console.log(`${name}: depth ${reached}, final period 2^${Math.log2(P[P.length - 1])}, ` +
    `${doublings} doublings (density ${(doublings / reached).toFixed(3)}), ${drops} drops, ${lawFail} law failures`);
  console.log(`   log2 P_k = ${P.map((x) => Math.log2(x)).join(',')}`);
  return P;
}

const c = seedCentre(DEPTH);
runTower('seed              ', (k) => c[k], DEPTH);
for (const b of ['1000', '10', '110', '11111110', '1101011000', '100000000000']) {
  runTower(`b=(${b})^inf`.padEnd(18), (k) => Number(b[k % b.length]), DEPTH);
}
