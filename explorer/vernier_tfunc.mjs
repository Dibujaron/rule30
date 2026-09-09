// Vernier / connector, 2026-09-09.
// The T-function view of rule 30: T(r) = (4r) XOR ((2r) OR r) on Nat, and its
// reductions mod 2^n.  Everything here is a check of one dictionary row.
//
// Row model (Rule30/Basic.lean): rowNat 0 = 1, rowNat (t+1) = T (rowNat t),
// and bit (x + t) of rowNat t is the cell at position x at time t.

const T = (r) => (4n * r) ^ ((2n * r) | r);

const bit = (r, i) => ((r >> BigInt(i)) & 1n) === 1n;

// ---- row model, as BigInts -------------------------------------------------
function rows(n) {
  const out = new Array(n + 1);
  let r = 1n;
  out[0] = r;
  for (let t = 1; t <= n; t++) { r = T(r); out[t] = r; }
  return out;
}

// ---- dictionary row 1: left diagonal k = bit k of the row numbers ----------
// leftDiagonal k j = evolve (j+k) (-j) = bit_{k} (rowNat (j+k)).
// Check against a direct cell-by-cell evolution on an array.
function directPicture(T_) {
  // cells[t] = Uint8Array of width 2t+1, index x+t
  const pics = [new Uint8Array([1])];
  for (let t = 1; t <= T_; t++) {
    const prev = pics[t - 1];
    const w = 2 * t + 1;
    const cur = new Uint8Array(w);
    for (let i = 0; i < w; i++) {
      // position x = i - t; reads x-1, x, x+1 of previous row (indices i-2,i-1,i in prev)
      const g = (j) => (j >= 0 && j < prev.length ? prev[j] : 0);
      cur[i] = g(i - 2) ^ (g(i - 1) | g(i));
    }
    pics.push(cur);
  }
  return pics;
}

function checkDictionary() {
  const N = 400;
  const R = rows(N);
  const P = directPicture(N);
  let bad = 0, cells = 0;
  for (let t = 0; t <= N; t++) {
    for (let i = 0; i < 2 * t + 1; i++) {
      cells++;
      if ((bit(R[t], i) ? 1 : 0) !== P[t][i]) bad++;
    }
  }
  // centre column = bit t of row t ; left diagonal k = bit k of row (j+k)
  let badC = 0;
  for (let t = 0; t <= N; t++) if ((bit(R[t], t) ? 1 : 0) !== P[t][t]) badC++;
  let badD = 0;
  for (let k = 0; k <= 30; k++) for (let j = 0; j + k <= N; j++) {
    const fromBits = bit(R[j + k], k) ? 1 : 0;
    const fromPic = P[j + k][(j + k) - j]; // position -j -> index (-j)+(j+k)=k
    if (fromBits !== fromPic) badD++;
  }
  console.log(`[dict] rows vs direct evolution: ${bad} mismatches over ${cells} cells`);
  console.log(`[dict] centreColumn t = bit_t(r_t): ${badC} mismatches over ${N + 1} times`);
  console.log(`[dict] leftDiagonal k j = bit_k(r_{j+k}): ${badD} mismatches, k<=30, j+k<=${N}`);
}

// ---- the map mod 2^n: structure -------------------------------------------
function graphStats(n) {
  const size = 1 << n;
  const mask = size - 1;
  const f = (r) => (((4 * r) ^ ((2 * r) | r)) & mask) >>> 0;
  // image size (injectivity)
  const hit = new Uint8Array(size);
  for (let r = 0; r < size; r++) hit[f(r)] = 1;
  let img = 0;
  for (let r = 0; r < size; r++) img += hit[r];
  // rho decomposition of every state, iteratively (colour = 0 unknown,
  // 1 on-cycle, 2 done), computing tail length and cycle length per state.
  const state = new Uint8Array(size);
  const cyc = new Int32Array(size);   // cycle length of the component
  const tail = new Int32Array(size);  // steps to reach the cycle
  const path = new Int32Array(size);
  const cycleLens = new Map();
  for (let s = 0; s < size; s++) {
    if (state[s] === 2) continue;
    let len = 0, x = s;
    const seen = new Map();
    while (state[x] !== 2) {
      if (seen.has(x)) { // found a fresh cycle
        const start = seen.get(x);
        const clen = len - start;
        cycleLens.set(clen, (cycleLens.get(clen) || 0) + 1);
        for (let i = start; i < len; i++) { state[path[i]] = 2; cyc[path[i]] = clen; tail[path[i]] = 0; }
        for (let i = start - 1; i >= 0; i--) { state[path[i]] = 2; cyc[path[i]] = clen; tail[path[i]] = start - i; }
        len = -1; break;
      }
      seen.set(x, len);
      path[len++] = x;
      x = f(x);
    }
    if (len >= 0) { // ran into an already-resolved state x
      const clen = cyc[x], t0 = tail[x];
      for (let i = len - 1; i >= 0; i--) { state[path[i]] = 2; cyc[path[i]] = clen; tail[path[i]] = t0 + (len - i); }
    }
  }
  let maxTail = 0, maxCyc = 0, lcm = 1;
  for (let r = 0; r < size; r++) { if (tail[r] > maxTail) maxTail = tail[r]; if (cyc[r] > maxCyc) maxCyc = cyc[r]; }
  for (const c of cycleLens.keys()) lcm = lcmInt(lcm, c);
  return {
    n, size, img, injective: img === size,
    cycleLens: [...cycleLens.entries()].sort((a, b) => a[0] - b[0]),
    maxTail, maxCyc, lcmCycles: lcm,
    tailOf1: tail[1 & mask], cycOf1: cyc[1 & mask],
  };
}
const gcdInt = (a, b) => (b ? gcdInt(b, a % b) : a);
const lcmInt = (a, b) => (a / gcdInt(a, b)) * b;

// ---- the onset-wall equivalence, as an orbit statement --------------------
// onset(k) <= k for all k  <=>  for all k, r_{2k} == r_{2k + 2^k} mod 2^{k+1}.
// Also: what is the LEAST p > 0 with r_{2k} == r_{2k+p} mod 2^{k+1}?
function returnPeriods(kmax) {
  const R = rows(2 * kmax + 200);
  const out = [];
  for (let k = 0; k <= kmax; k++) {
    const m = (1n << BigInt(k + 1)) - 1n;
    const base = R[2 * k] & m;
    let p = 0;
    for (let q = 1; q <= 64; q++) {
      if (2 * k + q >= R.length) break;
      if ((R[2 * k + q] & m) === base) { p = q; break; }
    }
    out.push([k, p]);
  }
  return out;
}

// least p such that r_{2k} == r_{2k+p} mod 2^{k+1}, for large k, without
// storing every row: keep a ring buffer of the last 64 rows.
function returnPeriodDeep(kmax, sample) {
  const need = 2 * kmax + 70;
  const buf = new Array(70);
  let r = 1n;
  const results = [];
  const targets = new Set(sample);
  const pending = new Map(); // t -> k for which r_t is the base
  for (const k of sample) pending.set(2 * k, k);
  const bases = new Map();
  for (let t = 0; t <= need; t++) {
    if (pending.has(t)) {
      const k = pending.get(t);
      bases.set(k, { base: r & ((1n << BigInt(k + 1)) - 1n), t0: t, p: 0 });
    }
    for (const [k, b] of bases) {
      if (b.p === 0 && t > b.t0 && t - b.t0 <= 64) {
        if ((r & ((1n << BigInt(k + 1)) - 1n)) === b.base) b.p = t - b.t0;
      }
    }
    r = T(r);
    if (t > 2 * kmax + 66) break;
  }
  for (const k of sample) results.push([k, bases.get(k).p]);
  return results;
}

const mode = 'all';

if (mode === 'all' || mode === 'dict') checkDictionary();

if (mode === 'all' || mode === 'graph') {
  console.log('\n[graph] functional graph of T mod 2^n over all 2^n starts');
  console.log('n  |image|/2^n  inj?  cycle lengths (len x count)      maxTail  lcm(cycles)  tail(1) cyc(1)');
  for (let n = 1; n <= 22; n++) {
    const s = graphStats(n);
    const cl = s.cycleLens.map(([l, c]) => `${l}x${c}`).join(' ');
    console.log(`${String(n).padStart(2)}  ${(s.img / s.size).toFixed(4)}      ${s.injective ? 'Y' : 'N'}     ${cl.padEnd(30)}  ${String(s.maxTail).padStart(7)}  ${String(s.lcmCycles).padStart(11)}  ${String(s.tailOf1).padStart(6)} ${String(s.cycOf1).padStart(6)}`);
  }
}

if (mode === 'all' || mode === 'period') {
  console.log('\n[period] least p<=64 with r_{2k} == r_{2k+p} mod 2^{k+1}');
  const rp = returnPeriods(120);
  const byP = new Map();
  for (const [k, p] of rp) { if (!byP.has(p)) byP.set(p, []); byP.get(p).push(k); }
  for (const [p, ks] of [...byP.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  p=${p}: k = ${ks.length <= 12 ? ks.join(',') : ks.slice(0, 6).join(',') + ' ... ' + ks.slice(-3).join(',') + `  (${ks.length} values)`}`);
  }
  console.log('\n[period] deep samples');
  const deep = returnPeriodDeep(5000, [200, 399, 400, 401, 1000, 2000, 3000, 4000, 5000]);
  for (const [k, p] of deep) console.log(`  k=${k}: least p = ${p}`);
}
