// Talus, 2026-09-08. Print the ring words of the temporally L-periodic
// configurations, so the data can be put in front of the Lean kernel and
// compared with Wolfram 1986 Table 6.2.

function shrink(u) {
  const o = new Uint8Array(u.length - 2);
  for (let i = 1; i + 1 < u.length; i++) o[i - 1] = u[i - 1] ^ (u[i] | u[i + 1]);
  return o;
}
function applyL(u, L) { let v = u; for (let i = 0; i < L; i++) v = shrink(v); return v; }
function ringStep(w) {
  const n = w.length, o = new Uint8Array(n);
  for (let k = 0; k < n; k++) o[k] = w[(k + 1) % n] ^ (w[k] | w[(k - 1 + n) % n]);
  return o;
}
function eq(a, c) { for (let i = 0; i < a.length; i++) if (a[i] !== c[i]) return false; return true; }

function cycles(L) {
  const W = 2 * L, S = 1 << W;
  const next = new Int32Array(S), head = new Uint8Array(S);
  const u = new Uint8Array(2 * L + 1);
  for (let s = 0; s < S; s++) {
    for (let i = 0; i < W; i++) u[i + 1] = (s >> i) & 1;
    let found = -1;
    for (let c = 0; c < 2; c++) { u[0] = c; if (applyL(Uint8Array.from(u), L)[0] === u[L]) { found = c; break; } }
    head[s] = found < 0 ? 0 : found;
    next[s] = found < 0 ? s : (found | ((s & ((1 << (W - 1)) - 1)) << 1));
  }
  const colour = new Uint8Array(S), out = [];
  for (let s0 = 0; s0 < S; s0++) {
    if (colour[s0]) continue;
    const path = [];
    let s = s0;
    while (colour[s] === 0) { colour[s] = 1; path.push(s); s = next[s]; }
    if (colour[s] === 1) out.push(Uint8Array.from(path.slice(path.indexOf(s)).map((x) => head[x])));
    for (const x of path) colour[x] = 2;
  }
  return out;
}

// least rotation, so the same ring always prints the same way
function canon(w) {
  const n = w.length;
  let best = null;
  for (let r = 0; r < n; r++) {
    let s = '';
    for (let i = 0; i < n; i++) s += w[(r + i) % n];
    if (best === null || s < best) best = s;
  }
  return best;
}

console.log('=== ring words of every temporally L-periodic configuration, L <= 10 ===');
console.log('(least rotation; a word of length n means the configuration is spatially n-periodic)');
for (let L = 1; L <= 10; L++) {
  const cs = cycles(L);
  const seen = new Set();
  const items = [];
  for (const w of cs) {
    let v = w;
    for (let i = 0; i < L; i++) v = ringStep(v);
    const ok = eq(v, w);
    const c = canon(w);
    if (seen.has(c)) continue;
    seen.add(c);
    items.push(`${w.length}:${c}${ok ? '' : ' [RING CHECK FAILED]'}`);
  }
  console.log(`L=${L}: ${items.join('  ')}`);
}

console.log('');
console.log('=== against Wolfram 1986 Table 6.2 ===');
console.log('Table 6.2 lists, for his rule (3.1) = rule 30:');
console.log('  period 1: 0 (length 1) and 01 (length 2)');
console.log('  period 3: 000011111001 (length 12)');
console.log('  period 4: 0000001, 0000111, 0010011, 0111111 (length 7, "different phases in a cycle")');
for (const [L, target] of [[3, '000011111001'], [4, '0000001']]) {
  const cs = cycles(L);
  const found = cs.map((w) => canon(w));
  const rots = [];
  for (let r = 0; r < target.length; r++) rots.push(target.slice(r) + target.slice(0, r));
  const canonTarget = rots.slice().sort()[0];
  console.log(`  L=${L}: my cycles ${found.join(', ')}; Table 6.2's ${target} in least rotation is ${canonTarget} -> ${found.includes(canonTarget) ? 'MATCH' : 'NO MATCH'}`);
}
