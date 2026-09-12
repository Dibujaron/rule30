// Talus, 2026-09-12. Rung 2 of the occurrence ladder.
//
// Block 0: engine validation, three independent implementations.
// Block 1: re-measure the brief's inherited claim myself (all four length-2
//          words in [a, 4a] for every a >= 2), and the occurrence gaps.
// Block 2: the ALTERNATING BLOCK length of the centre column as a function of
//          its start time -- the quantity rung 2's window form reduces to.
// Block 3: the free half of the reduction, checked against the real column.

// ---------- engines ----------

function* rowsBig() {
  let r = 1n; // row t packed so bit b is the cell at position b - t
  for (;;) { yield r; r = (4n * r) ^ ((2n * r) | r); }
}

function packedCenter(T) {
  const nw = ((2 * T + 64) >>> 5) + 2;
  let cur = new Uint32Array(nw), nxt = new Uint32Array(nw);
  cur[0] = 1;
  const c = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    c[t] = (cur[t >>> 5] >>> (t & 31)) & 1;
    const top = Math.min(nw - 1, ((2 * t + 3) >>> 5) + 1);
    for (let w = top; w >= 0; w--) {
      const x = cur[w];
      const lo = w === 0 ? 0 : cur[w - 1];
      const x4 = ((x << 2) | (lo >>> 30)) >>> 0;
      const x2 = ((x << 1) | (lo >>> 31)) >>> 0;
      nxt[w] = (x4 ^ (x2 | x)) >>> 0;
    }
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return c;
}

function naiveCenter(T) {
  const W = 2 * T + 5;
  let row = new Uint8Array(W), nxt = new Uint8Array(W);
  const o = T + 2;
  row[o] = 1;
  const c = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    c[t] = row[o];
    for (let i = 1; i < W - 1; i++) nxt[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = row; row = nxt; nxt = tmp;
  }
  return c;
}

// ---------- block 0 ----------
{
  const T = 3000;
  const p = packedCenter(T), n = naiveCenter(T);
  let bad = 0;
  for (let t = 0; t < T; t++) if (p[t] !== n[t]) bad++;
  console.log(`[0] packed vs naive, ${T} rows: ${bad} mismatches`);
  let badB = 0, t = 0;
  for (const r of rowsBig()) {
    if (t >= T) break;
    if (Number((r >> BigInt(t)) & 1n) !== p[t]) badB++;
    t++;
  }
  console.log(`[0] packed vs BigInt, ${T} rows: ${badB} mismatches`);
  console.log(`[0] c(0..39) = ${Array.from(p.slice(0, 40)).join("")}`);
  // hand-verified prefix: rows 0..4 give 1,1,0,1,1 (see document section 3)
  console.log(`[0] prefix check c(0..4)=11011 : ${Array.from(p.slice(0, 5)).join("") === "11011"}`);
}

const T = 3000000;
console.log(`\nbuilding centre column to T = ${T} ...`);
const c = packedCenter(T);

// ---------- block 1: the window form of rung L ----------
{
  const maxA = 100000;
  console.log("\n[1] window form: [a,4a] inclusive, words of length L");
  for (let L = 1; L <= 6; L++) {
    const nW = 1 << L;
    // occurrence lists per word
    const occ = Array.from({ length: nW }, () => []);
    const lim = 4 * maxA + L + 2;
    for (let s = 0; s + L <= lim; s++) {
      let w = 0;
      for (let j = 0; j < L; j++) w = (w << 1) | c[s + j];
      occ[w].push(s);
    }
    let worst = 0, nFail = 0, failWord = -1;
    const ptr = new Int32Array(nW);
    for (let a = 1; a <= maxA; a++) {
      const hi = 4 * a - L + 1; // last start position inside [a,4a]
      let fail = false, fw = -1;
      for (let w = 0; w < nW; w++) {
        const o = occ[w];
        while (ptr[w] < o.length && o[ptr[w]] < a) ptr[w]++;
        if (ptr[w] >= o.length || o[ptr[w]] > hi) { fail = true; fw = w; }
      }
      if (fail) { nFail++; worst = a; failWord = fw; }
    }
    console.log(`    L=${L}: largest failing a = ${worst}, failing a count = ${nFail}` +
      (failWord >= 0 ? `, a witness word ${failWord.toString(2).padStart(L, "0")}` : ""));
  }
  {
    const seen = new Set();
    for (let s = 1; s + 1 <= 4; s++) seen.add((c[s] << 1) | c[s + 1]);
    console.log(`    L=2 at a=1: words present = ${[...seen].map(w => w.toString(2).padStart(2, "0")).sort().join(",")}`);
  }

  console.log("\n[1] occurrences and largest gaps of the four 2-words, to T");
  for (const w of [0, 1, 2, 3]) {
    const b0 = (w >> 1) & 1, b1 = w & 1;
    let last = -1, maxGap = 0, at = -1, nOcc = 0, first = -1;
    for (let t = 0; t + 1 < T; t++) {
      if (c[t] === b0 && c[t + 1] === b1) {
        nOcc++;
        if (first < 0) first = t;
        if (last >= 0 && t - last > maxGap) { maxGap = t - last; at = last; }
        last = t;
      }
    }
    console.log(`    ${w.toString(2).padStart(2, "0")}: ${nOcc} occurrences, first at ${first}, largest gap ${maxGap} (from ${at})`);
  }
}

// ---------- block 2: alternating blocks ----------
{
  // alt[t] = number of cells in the maximal alternating block starting at t
  const alt = new Int32Array(T);
  alt[T - 1] = 1;
  for (let t = T - 2; t >= 0; t--) alt[t] = (c[t + 1] !== c[t]) ? alt[t + 1] + 1 : 1;
  let maxLen = 0, maxAt = -1, worstRatio = 0, worstA = -1, worstL = 0;
  let v3 = 0, v2 = 0, v1 = 0;
  for (let a = 1; a < T - 40; a++) {
    const L = alt[a];
    if (L > maxLen) { maxLen = L; maxAt = a; }
    const r = L / a;
    if (r > worstRatio) { worstRatio = r; worstA = a; worstL = L; }
    if (L > 3 * a) v3++;
    if (L > 2 * a) v2++;
    if (L > a) v1++;
  }
  console.log(`\n[2] alternating blocks of the centre column, T = ${T}`);
  console.log(`    longest: ${maxLen} cells starting at t = ${maxAt}`);
  console.log(`    worst ratio L/a = ${worstRatio.toFixed(4)} at a = ${worstA} (L = ${worstL})`);
  console.log(`    starts a>=1 with L > 3a: ${v3};  L > 2a: ${v2};  L > a: ${v1}`);
  console.log("    longest alternating block with start below 10^k:");
  for (let k = 1; k <= 6; k++) {
    const lim = Math.min(T - 40, Math.pow(10, k));
    let m = 0, at = -1;
    for (let a = 1; a < lim; a++) if (alt[a] > m) { m = alt[a]; at = a; }
    console.log(`      10^${k}: ${m} cells at t = ${at}   (2*log2(10^${k}) = ${(2 * Math.log2(lim)).toFixed(1)})`);
  }
  // the small-a table, where any bound of the form L <= f(a) is tight
  let s = "    small a: ";
  for (let a = 1; a <= 16; a++) s += `${a}:${alt[a]} `;
  console.log(s);
}

// ---------- block 3: the free half of the reduction ----------
{
  const maxA = 100000;
  let bad16 = 0, bad4 = 0, firstBad4 = -1;
  // next-occurrence arrays for 01 and 10
  const mk = (b0, b1) => {
    const nx = new Int32Array(4 * maxA + 8).fill(1 << 30);
    let nextp = 1 << 30;
    for (let t = nx.length - 2; t >= 0; t--) {
      if (c[t] === b0 && c[t + 1] === b1) nextp = t;
      nx[t] = nextp;
    }
    return nx;
  };
  const n01 = mk(0, 1), n10 = mk(1, 0);
  for (let a = 1; a <= maxA; a++) {
    if (n01[a] > 16 * a - 1 || n10[a] > 16 * a - 1) bad16++;
    if (n01[a] > 4 * a - 1 || n10[a] > 4 * a - 1) { bad4++; if (firstBad4 < 0) firstBad4 = a; }
  }
  console.log(`\n[3] 01 and 10 both inside [a,16a] for every a <= ${maxA}: ${bad16} failures`);
  console.log(`[3] 01 and 10 both inside [a,4a]:  ${bad4} failures (first a = ${firstBad4})`);
}
