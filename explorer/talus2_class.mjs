// Talus, 2026-09-08. A trustworthy classifier for "good" boundaries.
//
// X_b := the configuration white at every x >= 1 at time 0 whose centre column
// is b (crystal 40: column 0 and the right half are free coordinates, so X_b
// exists and is unique). good b := some column of X_b other than 0 is
// eventually periodic.
//
// THREE REDUCTIONS, each from a closed node, that make the test cheap and
// remove the false positives that spoiled last session's sweep.
//
// (1) good b  <=>  column -1 of X_b is eventually periodic.
//     If column j > 0 is e.p. then, with column 0 e.p. too, the sandwich lemma
//     (evolve_isEventuallyPeriodic_of_between) makes column 1 e.p., and then
//     evolve_period_sub_one makes column -1 e.p.  If column j < 0 is e.p. the
//     sandwich lemma gives column -1 directly.
//
// (2) column -1 is a POINTWISE function of b and column 1:
//     sideways_inverse at i = 0 reads
//         row_t(-1) = row_{t+1}(0) XOR (row_t(0) | row_t(1))
//                   = b(t+1) XOR (b(t) | c1(t)).
//     So no left solve is needed at all to decide goodness.
//
// (3) At every black time of b the value b(t)=1 swallows c1(t), so
//         good b  <=>  c1 restricted to the WHITE times of b is e.p.
//     This is the honest form: the black-time entries of column -1 are periodic
//     for free, and last session's lag scan on column -1 was reading that
//     free periodicity as evidence. Restricting to the white times removes it.
//
// The engine is the bit-packed right half-line: row stored with bit x at
// position x, x = 0 the boundary, forced to b(t) at every step.

const TSWEEP = 3000;
const PMAX = 11;

function col1(b, T) {
  const p = b.length;
  const words = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(words);
  let s = new Uint32Array(words);
  const out = new Uint8Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    out[t] = (r[0] >>> 1) & 1;
    const last = Math.min(words - 2, (t >> 5) + 1);
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
  return out;
}

// full picture of X_b on x in [0, W), rows 0..T-1 -- used only for self-checks
function pic(b, T, W) {
  const p = b.length;
  const words = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(words);
  let s = new Uint32Array(words);
  const rows = [];
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    const line = new Uint8Array(W);
    for (let x = 0; x < W; x++) line[x] = (r[x >> 5] >>> (x & 31)) & 1;
    rows.push(line);
    const last = Math.min(words - 2, (t >> 5) + 1);
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
  return rows;
}

// the seed's own picture, for the engine check
function seedRows(T, W) {
  const words = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(words), s = new Uint32Array(words);
  const off = 16; // bit index of x = 0 inside word 0 ... use a centred layout
  const rows = [];
  r[0] = 1 << off;
  for (let t = 0; t < T; t++) {
    const line = new Uint8Array(2 * W + 1);
    for (let d = -W; d <= W; d++) {
      const bit = off + d + 32 * 8;
      line[d + W] = (r[bit >> 5] >>> (bit & 31)) & 1;
    }
    rows.push(line);
    for (let i = 0; i < words; i++) {
      const cur = r[i];
      const up = (cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0);
      const down = (cur >>> 1) | (i + 1 < words ? r[i + 1] << 31 : 0);
      s[i] = up ^ (cur | down);
    }
    const tmp = r; r = s; s = tmp;
  }
  return rows;
}

// restrict c1 to the white times of b, in order
function whiteRestrict(b, c1) {
  const p = b.length;
  const v = [];
  for (let t = 0; t < c1.length; t++) if (b[t % p] === 0) v.push(c1[t]);
  return Uint8Array.from(v);
}

// least q <= QMAX such that v[i+q] = v[i] for every i >= lo, plus the onset.
// Returns [q, onset, tailLen] or [0,-1,0].
function eventualPeriod(v, QMAX, lo) {
  const L = v.length;
  for (let q = 1; q <= QMAX; q++) {
    let ok = true;
    for (let i = lo; i + q < L; i++) if (v[i + q] !== v[i]) { ok = false; break; }
    if (ok) {
      let onset = 0;
      for (let i = lo - 1; i >= 0; i--) if (v[i + q] !== v[i]) { onset = i + 1; break; }
      return [q, onset, L - onset];
    }
  }
  return [0, -1, 0];
}

function bits(n, p) { const a = []; for (let i = 0; i < p; i++) a.push((n >> i) & 1); return a; }

// ---------------------------------------------------------------- self-checks
console.log('=== engine checks ===');
{
  // A. the half-line driven by the seed's own centre column must reproduce the
  //    seed's columns 1..8.
  const T = 400, W = 12;
  const S = seedRows(T, W);
  const centre = Array.from({ length: T }, (_, t) => S[t][W]);
  const R = pic(centre, T, W);
  let bad = 0;
  for (let t = 0; t < T; t++) for (let x = 0; x <= 8; x++) if (R[t][x] !== S[t][W + x]) bad++;
  console.log(`A. half-line vs seed picture, ${T} rows x 9 columns: ${bad} mismatches`);
}
{
  // B. the pointwise identity for column -1 against a real leftward solve.
  //    row_t(-1) = b(t+1) XOR (b(t) | c1(t)).  The leftward solve here is an
  //    independent computation: build the row at time 0 leftward from columns
  //    0 and 1 by leftSolve, then evolve the whole real row and read x = -1.
  const T = 900, K = 260;
  let bad = 0, tested = 0;
  for (const s of ['10', '110', '1000', '11111110', '1010000000']) {
    const b = s.split('').map(Number);
    const c1 = col1(b, T);
    const c0 = Uint8Array.from({ length: T }, (_, t) => b[t % b.length]);
    // leftSolve: cols[k] = column -k
    let prev = c0, cur = new Uint8Array(T);
    for (let t = 0; t + 1 < T; t++) cur[t] = c0[t + 1] ^ (c0[t] | c1[t]);
    const colsL = [c0, cur];
    for (let k = 2; k < K; k++) {
      const next = new Uint8Array(T);
      for (let t = 0; t + 1 < T - k; t++) next[t] = colsL[k - 1][t + 1] ^ (colsL[k - 1][t] | colsL[k - 2][t]);
      colsL.push(next);
    }
    // real row at time 0 on [-K+1, W]
    const W = 40, len = K + W;
    const row0 = new Uint8Array(len); // index i = position i - (K-1)
    for (let k = 0; k < K; k++) row0[K - 1 - k] = colsL[k][0];
    // evolve it; interior stays valid for t < min(K, W) steps from the edges
    let cur2 = row0;
    const steps = 200;
    for (let t = 0; t < steps; t++) {
      const idxMinus1 = K - 2;
      const got = cur2[idxMinus1];
      const want = b[(t + 1) % b.length] ^ (b[t % b.length] | c1[t]);
      tested++; if (got !== want) bad++;
      const nxt = new Uint8Array(len);
      for (let i = 1; i + 1 < len; i++) nxt[i] = cur2[i - 1] ^ (cur2[i] | cur2[i + 1]);
      cur2 = nxt;
    }
  }
  console.log(`B. column -1 identity vs an independent left solve + real evolution: ${bad}/${tested} mismatches`);
}
{
  // C. the half-line engine against a slow, obvious, array-based half-line.
  let bad = 0, tested = 0;
  for (const s of ['1', '01', '110', '10110', '11111110', '101000000011']) {
    const b = s.split('').map(Number);
    const T = 600;
    const fast = col1(b, T);
    const row = new Uint8Array(T + 4);
    row[0] = b[0];
    for (let t = 0; t < T; t++) {
      tested++; if (row[1] !== fast[t]) bad++;
      const nxt = new Uint8Array(T + 4);
      for (let x = 1; x < T + 3; x++) nxt[x] = row[x - 1] ^ (row[x] | row[x + 1]);
      nxt[0] = b[(t + 1) % b.length];
      row.set(nxt);
    }
  }
  console.log(`C. bit-packed half-line vs a plain array half-line: ${bad}/${tested} mismatches`);
}

// ------------------------------------------------------------ classification
console.log('');
console.log('=== classification sweep, T = ' + TSWEEP + ' ===');
console.log('good b <=> column 1 restricted to the white times of b is eventually periodic.');
console.log('A word is called a candidate when that restriction has a period q <= 300 holding');
console.log('over a tail at least 30q long inside the run.');
console.log('');
console.log(' p    #words   candidates   fraction');
const cands = new Map();
for (let p = 1; p <= PMAX; p++) {
  let n_ok = 0;
  const list = [];
  for (let n = 0; n < (1 << p); n++) {
    const b = bits(n, p);
    const c1 = col1(b, TSWEEP);
    const v = whiteRestrict(b, c1);
    if (v.length === 0) { n_ok++; list.push([b.join(''), 0, 0]); continue; } // b all black
    const [q, onset] = eventualPeriod(v, 300, v.length >> 1);
    if (q > 0 && v.length - onset >= 30 * q) { n_ok++; list.push([b.join(''), q, onset]); }
  }
  cands.set(p, list);
  console.log(` ${String(p).padEnd(4)} ${String(1 << p).padEnd(8)} ${String(n_ok).padEnd(12)} ${(n_ok / (1 << p)).toFixed(3)}`);
}

console.log('');
console.log('=== candidates by period (word, q of the white-time restriction, onset) ===');
for (let p = 1; p <= PMAX; p++) {
  const l = cands.get(p);
  if (l.length === 0) { console.log(`p=${p}: none`); continue; }
  console.log(`p=${p} (${l.length}):`);
  let line = '  ';
  for (const [w, q, o] of l) {
    line += `${w}(q${q},N${o}) `;
    if (line.length > 110) { console.log(line); line = '  '; }
  }
  if (line.trim()) console.log(line);
}

// ------------------------------------------------------------ rotation classes
console.log('');
console.log('=== rotation classes: is candidacy constant on each class? ===');
let classesChecked = 0, classesSplit = 0;
const splits = [];
for (let p = 1; p <= PMAX; p++) {
  const set = new Set(cands.get(p).map(([w]) => w));
  const seen = new Set();
  for (let n = 0; n < (1 << p); n++) {
    const b = bits(n, p);
    const w = b.join('');
    if (seen.has(w)) continue;
    const cls = [];
    let cur = b;
    for (let i = 0; i < p; i++) { cls.push(cur.join('')); seen.add(cur.join('')); cur = cur.slice(1).concat(cur.slice(0, 1)); }
    classesChecked++;
    const vals = cls.map((x) => set.has(x));
    if (vals.some((x) => x) && vals.some((x) => !x)) {
      classesSplit++;
      splits.push([p, cls.filter((x) => set.has(x)), cls.filter((x) => !set.has(x))]);
    }
  }
}
console.log(`classes checked: ${classesChecked}; classes with mixed candidacy: ${classesSplit}`);
for (const [p, g, bd] of splits.slice(0, 40)) console.log(`  p=${p} good=${g.join(',')} bad=${bd.join(',')}`);
