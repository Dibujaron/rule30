// Talus, 2026-09-12.  The next topic's first data point, run rather than parked.
//
// The invisibility lemma says the whole left half of the picture is a function of
// the centre column together with column 1 read ONLY at the centre column's WHITE
// times.  So two configurations that share the seed's centre column AND the seed's
// white-time column-1 bits have the seed's entire left half, cell for cell,
// however much they differ at the black times.  Do such pairs exist?
//
// Enumerate every configuration white at x < 0, black at 0, arbitrary on [1, W].
// Keep those whose centre column matches the seed's to depth T.  Group them by
// their column-1 restricted to the white times of the centre column, and ask
// whether the BLACK-time bits vary inside a group.

// Run at three depths, because a count taken at one depth is a count about that
// depth: these configurations differ far to the right and separate deeper, which
// is obstruction 3's finite-depth artefact.
let T = 17, W = T + 1;                // column 1 at time t reads row 0 on [1-t, 1+t]
let PAD = T + 3;
let N = PAD + W + 1 + PAD, ORIG = PAD;
function setDepth(t) { T = t; W = T + 1; PAD = T + 3; N = PAD + W + 1 + PAD; ORIG = PAD; }

function evolveCols(rowInit) {
  let cur = Uint8Array.from(rowInit), nxt = new Uint8Array(N);
  const c0 = new Uint8Array(T + 1), c1 = new Uint8Array(T + 1);
  c0[0] = cur[ORIG]; c1[0] = cur[ORIG + 1];
  for (let t = 1; t <= T; t++) {
    for (let i = 1; i < N - 1; i++) nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
    nxt[0] = 0; nxt[N - 1] = 0;
    const tmp = cur; cur = nxt; nxt = tmp;
    c0[t] = cur[ORIG]; c1[t] = cur[ORIG + 1];
  }
  return { c0, c1 };
}

// the seed
const seedRow = new Uint8Array(N); seedRow[ORIG] = 1;
const seed = evolveCols(seedRow);
console.log(`[s] the seed's centre column to t=${T}: ${Array.from(seed.c0).join("")}`);
console.log(`    the seed's column 1:              ${Array.from(seed.c1).join("")}`);
const whiteTimes = [], blackTimes = [];
for (let t = 0; t <= T; t++) (seed.c0[t] ? blackTimes : whiteTimes).push(t);
console.log(`    white times of the centre column (where column 1 is visible): ${whiteTimes.join(",")}`);
console.log(`    black times (where the OR hides column 1):                    ${blackTimes.join(",")}`);

// CONTROL: the invisibility claim itself, on random pairs -- two configurations
// with the same centre column and the same white-time column-1 bits must have the
// same cell(-k, 0) for every k.  Computed from the leftward solve.
function leftRow(c0, c1, K) {
  const C = [];
  for (let k = 0; k <= K + 1; k++) C.push(new Uint8Array(T + 2));
  for (let t = 0; t <= T; t++) C[0][t] = c0[t];
  for (let t = 0; t + 1 <= T; t++) C[1][t] = C[0][t + 1] ^ (C[0][t] | c1[t]);
  for (let k = 2; k <= K; k++) for (let t = 0; t + k <= T; t++) C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
  const out = []; for (let k = 1; k <= K; k++) out.push(C[k][0]);
  return out.join("");
}
{
  let s = 0x1234567 >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s & 1; };
  let bad = 0, n = 0;
  for (let trial = 0; trial < 4000; trial++) {
    const a = new Uint8Array(T + 1), b = new Uint8Array(T + 1);
    for (let t = 0; t <= T; t++) { const v = rnd(); a[t] = v; b[t] = seed.c0[t] ? rnd() : v; }
    n++;
    if (leftRow(seed.c0, a, T - 1) !== leftRow(seed.c0, b, T - 1)) bad++;
  }
  console.log(`\n[V] invisibility control: ${n} random pairs agreeing at the white times`);
  console.log(`    only, same centre column -- differing left rows: ${bad}`);
  // and the check must be able to fail: differ at a WHITE time
  let bad2 = 0;
  for (let trial = 0; trial < 400; trial++) {
    const a = new Uint8Array(T + 1), b = new Uint8Array(T + 1);
    for (let t = 0; t <= T; t++) { const v = rnd(); a[t] = v; b[t] = v; }
    b[whiteTimes[0]] ^= 1;
    if (leftRow(seed.c0, a, T - 1) !== leftRow(seed.c0, b, T - 1)) bad2++;
  }
  console.log(`    flipping one WHITE-time bit instead: ${bad2}/400 left rows differ  <- can fail`);
}

// the sweep, at three depths
console.log(`\n[E] every configuration white at x<0, black at 0, arbitrary on [1,W],`);
console.log(`    keeping those whose centre column matches the seed to time T.`);
console.log(`    T   W   matching   white-time patterns   max black-time patterns   seed's group`);
for (const depth of [15, 17, 19, 21]) {
  setDepth(depth);
  const srow = new Uint8Array(N); srow[ORIG] = 1;
  const sd = evolveCols(srow);
  const wT = [], bT = [];
  for (let t = 0; t <= T; t++) (sd.c0[t] ? bT : wT).push(t);
  const groups = new Map();
  let matching = 0;
  const row = new Uint8Array(N);
  for (let v = 0; v < (1 << W); v++) {
    row.fill(0);
    row[ORIG] = 1;
    for (let i = 0; i < W; i++) row[ORIG + 1 + i] = (v >> i) & 1;
    const { c0, c1 } = evolveCols(row);
    let ok = true;
    for (let t = 0; t <= T; t++) if (c0[t] !== sd.c0[t]) { ok = false; break; }
    if (!ok) continue;
    matching++;
    const wkey = wT.map((t) => c1[t]).join("");
    const bkey = bT.map((t) => c1[t]).join("");
    let g = groups.get(wkey); if (!g) { g = new Set(); groups.set(wkey, g); }
    g.add(bkey);
  }
  let maxg = 0;
  for (const [, g] of groups) if (g.size > maxg) maxg = g.size;
  const sg = groups.get(wT.map((t) => sd.c1[t]).join(""));
  console.log(`   ${String(T).padStart(2)}  ${String(W).padStart(2)}  ${String(matching).padStart(9)}   ` +
    `${String(groups.size).padStart(19)}   ${String(maxg).padStart(23)}   ${sg ? sg.size : 0}` +
    `   (${wT.length} white, ${bT.length} black times)`);
}
console.log(`\n    A group of size > 1 is a pair of configurations with the seed's`);
console.log(`    centre column and the seed's ENTIRE left half, differing at column 1.`);
console.log(`    The "white-time patterns" column is the one to watch: it is how many`);
console.log(`    distinct left halves the seed's centre column admits at that depth.`);
