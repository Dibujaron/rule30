// Talus, 2026-09-09.  How special is any of this to rule 30?
//
// Two questions, both about the 256 elementary rules read as T-functions the way Rowan's
// null model reads them: bit i of f(r) is R(r_{i-2}, r_{i-1}, r_i), with the cells outside
// the word white.
//
//  (a) For which rules is the halving identity f(2s) = 2 f(s) true?  I claimed in the
//      attack document that it is not symmetric and distinguishes rule 30 from its
//      mirror.  That claim needs testing, not asserting.
//  (b) For which rules does the rigidity law |A(n)| - |A(n-1)| = maxCycle(n) hold over a
//      range?  This is the null the topic's "exactness" needs and did not have: a random
//      TRIANGULAR map is the wrong comparison if half the elementary rules are exact too.
//
// usage: node talus5_scope.mjs

const NLAW = 18; // exhaustive attractor to this width, for all 256 rules

function makeF(rule, n) {
  const mask = 2 ** n - 1;
  // table[(a<<2)|(b<<1)|c] with a = r_{i-2}, b = r_{i-1}, c = r_i
  const tab = [];
  for (let v = 0; v < 8; v++) tab.push((rule >> v) & 1);
  return (r) => {
    let out = 0;
    for (let i = 0; i < n; i++) {
      const a = i >= 2 ? (r >> (i - 2)) & 1 : 0;
      const b = i >= 1 ? (r >> (i - 1)) & 1 : 0;
      const c = (r >> i) & 1;
      // Wolfram numbering: neighbourhood (left,centre,right) = (a,b,c) -> index a*4+b*2+c
      if (tab[(a << 2) | (b << 1) | c]) out |= 1 << i;
    }
    return out & mask;
  };
}

// sanity: rule 30 read this way must be the arithmetic map
{
  const n = 20, f = makeF(30, n), mask = 2 ** n - 1;
  let bad = 0;
  for (let t = 0; t < 2000; t++) {
    const r = (Math.random() * 2 ** n) >>> 0;
    const want = ((((r * 4) ^ ((r * 2) | r)) >>> 0) & mask) >>> 0;
    if (f(r) !== want) bad++;
  }
  console.log(`sanity: rule 30 as a table vs 4r XOR (2r OR r), 2000 random states at n=20: ${bad} mismatches`);
}

// (a) halving identity
const halving = [];
for (let rule = 0; rule < 256; rule++) {
  const n = 18, f = makeF(rule, n), g = makeF(rule, n - 1);
  let ok = true;
  for (let s = 0; s < 2 ** (n - 1) && ok; s++) if (f(2 * s) !== 2 * g(s)) ok = false;
  if (ok) halving.push(rule);
}
console.log(`\n(a) f(2s) = 2 f(s) holds for ${halving.length} of 256 rules.`);
console.log(`    exactly the rules with R(0,0,0)=0 (the quiescent ones)? ${halving.every((r) => !(r & 1)) && halving.length === 128}`);
console.log(`    rule 30 in the list? ${halving.includes(30)};  its mirror rule 86? ${halving.includes(86)};  complement 135? ${halving.includes(135)}`);

// (b) the rigidity law, exhaustively, for every rule
function attractorStats(f, n) {
  const N = 2 ** n;
  const img = new Int32Array(N), indeg = new Int32Array(N);
  for (let r = 0; r < N; r++) { const s = f(r); img[r] = s; indeg[s]++; }
  const stack = [];
  for (let r = 0; r < N; r++) if (indeg[r] === 0) stack.push(r);
  const gone = new Uint8Array(N);
  while (stack.length) { const r = stack.pop(); gone[r] = 1; const s = img[r]; if (--indeg[s] === 0 && !gone[s]) stack.push(s); }
  let size = 0, odd = 0, oddCycles = 0, maxCyc = 0;
  const seen = new Uint8Array(N);
  for (let r = 0; r < N; r++) if (!gone[r]) { size++; if (r & 1) odd++; }
  for (let r0 = 0; r0 < N; r0++) {
    if (gone[r0] || seen[r0]) continue;
    let x = r0, L = 0, anyOdd = false;
    do { seen[x] = 1; L++; if (x & 1) anyOdd = true; x = img[x]; } while (x !== r0);
    if (L > maxCyc) maxCyc = L;
    if (anyOdd) oddCycles++;
  }
  return { size, odd, oddCycles, maxCyc };
}

const lawRules = [];
for (let rule = 0; rule < 256; rule++) {
  let ok = true, prev = null;
  for (let n = 1; n <= NLAW && ok; n++) {
    const st = attractorStats(makeF(rule, n), n);
    if (prev !== null && st.size - prev.size !== st.maxCyc) ok = false;
    prev = st;
  }
  if (ok) lawRules.push(rule);
}
console.log(`\n(b) |A(n)| - |A(n-1)| = maxCycle(n) for every n = 2..${NLAW}:`);
console.log(`    holds for ${lawRules.length} of 256 rules: [${lawRules.join(', ')}]`);
console.log(`    rule 30 among them? ${lawRules.includes(30)}`);
console.log(`    of the 128 quiescent rules, ${lawRules.filter((r) => !(r & 1)).length} satisfy it.`);

// how many odd cycles do the quiescent rules have at n = NLAW?
const counts = new Map();
for (let rule = 0; rule < 256; rule++) {
  if (rule & 1) continue;
  const st = attractorStats(makeF(rule, NLAW), NLAW);
  counts.set(st.oddCycles, (counts.get(st.oddCycles) || 0) + 1);
}
console.log(`\n(c) number of cycles containing an odd state, at n=${NLAW}, over the 128 quiescent rules:`);
console.log(`    ${[...counts.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k} cycles: ${v} rules`).join(';  ')}`);
