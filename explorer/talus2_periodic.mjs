// Talus, 2026-09-08. Enumerate EVERY temporally periodic configuration of
// rule 30, exactly, for each small period L -- and read off their centre
// columns. That finite list is the complete set of candidate good boundaries
// with column period L.
//
// WHY IT IS FINITE AND COMPLETE. F^L is left-permutive with left radius L
// (crystal 24: a composition of left-permutive maps is left-permutive, radii
// add). So for a configuration C with F^L(C) = C, the equation at position
// j+L reads C(j+L) = (F^L C)(j+L), a function of C(j..j+2L) that is a
// BIJECTION in C(j) with the others held. Hence C(j) is determined by the 2L
// cells C(j+1..j+2L). The map
//     s = (C(j+1),...,C(j+2L))  |-->  s' = (C(j),...,C(j+2L-1))
// is a function on 2^(2L) states, so C is a bi-infinite orbit of a function on
// a finite set, so C lies entirely inside a CYCLE of that function: C is
// spatially periodic with period the cycle length, at most 2^(2L). Enumerating
// the cycles of that map therefore enumerates every temporally L-periodic
// configuration of rule 30, with no sampling and no depth cutoff.
//
// The centre columns of those configurations are exactly the sequences b that
// a GOOD boundary of column period L must have as its tail, because
//   good b => columns 0 and -1 e.p. with a common (q, N)   [sandwich lemma,
//             evolve_period_sub_one]
//          => every column x <= 0 periodic with the same (q, N)
//             [evolve_period_sub]
//          => the row at time N is eventually spatially periodic leftward
//             [crystal 24, exactly as above]
//          => its periodic extension is a spatially periodic configuration
//             agreeing with X_b on a left ray, hence temporally q-periodic,
//             with centre column the tail of b.

const LMAX = 10;

// one rule 30 step on an array, shrinking by one cell at each end
function shrink(u) {
  const o = new Uint8Array(u.length - 2);
  for (let i = 1; i + 1 < u.length; i++) o[i - 1] = u[i - 1] ^ (u[i] | u[i + 1]);
  return o;
}
function applyL(u, L) { let v = u; for (let i = 0; i < L; i++) v = shrink(v); return v; }

// ring step in the k coordinate used elsewhere: w'[k] = w[k+1] ^ (w[k] | w[k-1])
function ringStep(w) {
  const n = w.length;
  const o = new Uint8Array(n);
  for (let k = 0; k < n; k++) o[k] = w[(k + 1) % n] ^ (w[k] | w[(k - 1 + n) % n]);
  return o;
}
function eq(a, c) { if (a.length !== c.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== c[i]) return false; return true; }

function minimalPeriod(w) {
  const n = w.length;
  for (let q = 1; q <= n; q++) {
    let ok = true;
    for (let i = 0; i < n; i++) if (w[i] !== w[i % q]) { ok = false; break; }
    if (ok) return q;
  }
  return n;
}

// the leftward map on 2L-bit states, as an integer -> integer table.
// state bits: bit i of s holds C(j+1+i), i = 0..2L-1.
function buildMap(L) {
  const W = 2 * L, S = 1 << W;
  const next = new Int32Array(S);
  const head = new Uint8Array(S);   // the new leftmost cell C(j)
  const u = new Uint8Array(2 * L + 1);
  for (let s = 0; s < S; s++) {
    for (let i = 0; i < W; i++) u[i + 1] = (s >> i) & 1;
    const target = u[L + 1 - 1 + 1 - 1 + 1]; // C(j+L) = bit (L-1) of s -> u[L]
    let found = -1;
    for (let c = 0; c < 2; c++) {
      u[0] = c;
      const r = applyL(Uint8Array.from(u), L);
      if (r[0] === u[L]) { found = c; break; }
    }
    if (found < 0) { next[s] = -1; head[s] = 0; continue; }  // cannot happen
    head[s] = found;
    // new state = (C(j), ..., C(j+2L-1)) = found, then s bits 0..W-2
    next[s] = (found | ((s & ((1 << (W - 1)) - 1)) << 1));
    void target;
  }
  return { next, head, W, S };
}

// all cycles of the map, as ring words
function cycles(L) {
  const { next, head, S } = buildMap(L);
  const colour = new Uint8Array(S);  // 0 unseen, 1 on stack, 2 done
  const out = [];
  for (let s0 = 0; s0 < S; s0++) {
    if (colour[s0]) continue;
    const path = [];
    let s = s0;
    while (colour[s] === 0) { colour[s] = 1; path.push(s); s = next[s]; }
    if (colour[s] === 1) {
      const start = path.indexOf(s);
      const cyc = path.slice(start);
      // ring word: the head cells along the cycle, read leftward
      const w = Uint8Array.from(cyc.map((x) => head[x]));
      out.push(w);
    }
    for (const x of path) colour[x] = 2;
  }
  return out;
}

console.log('=== every temporally L-periodic configuration of rule 30, by exhaustive');
console.log('    enumeration of the leftward map on 2^(2L) states ===');
console.log('');
console.log(' L    states   cycles   distinct spatial periods                  distinct centre columns');
const traceSets = new Map();
for (let L = 1; L <= LMAX; L++) {
  const cs = cycles(L);
  const spatial = new Set(), traces = new Set();
  let checked = 0, badcheck = 0;
  for (const w of cs) {
    // verify: the ring word really is fixed by L ring steps
    let v = w;
    for (let i = 0; i < L; i++) v = ringStep(v);
    checked++;
    if (!eq(v, w)) { badcheck++; continue; }
    spatial.add(w.length);
    // centre column: the trace at EVERY ring position, because which cell of
    // the ring sits at x = 0 is a free choice and each choice is a different
    // configuration with a different centre column.
    const orbit = [];
    let x = w;
    for (let i = 0; i < L; i++) { orbit.push(x); x = ringStep(x); }
    for (let m = 0; m < w.length; m++) {
      const arr = Uint8Array.from(orbit.map((row) => row[m]));
      const q = minimalPeriod(arr);
      traces.add(arr.slice(0, q).join(''));
    }
  }
  traceSets.set(L, traces);
  const sp = Array.from(spatial).sort((a, c) => a - c);
  console.log(
    ` ${String(L).padEnd(4)} ${String(1 << (2 * L)).padEnd(8)} ${String(cs.length).padEnd(8)} ${sp.join(',').slice(0, 40).padEnd(41)} ${traces.size}${badcheck ? '   RING CHECK FAILURES: ' + badcheck + '/' + checked : ''}`
  );
}

console.log('');
console.log('=== the centre columns themselves (minimal period form) ===');
for (let L = 1; L <= LMAX; L++) {
  const t = Array.from(traceSets.get(L)).sort();
  console.log(`L=${L} (${t.length}): ${t.join(' ')}`);
}

console.log('');
console.log('=== union over L <= ' + LMAX + ', grouped by the word length ===');
const all = new Set();
for (let L = 1; L <= LMAX; L++) for (const w of traceSets.get(L)) all.add(w);
for (let p = 1; p <= LMAX; p++) {
  const l = Array.from(all).filter((w) => w.length === p).sort();
  console.log(`length ${p} (${l.length}): ${l.join(' ')}`);
}
