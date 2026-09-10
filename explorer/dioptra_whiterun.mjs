// Dioptra, 2026-09-10.
//
// The Meier-Staffelbach / Spencer "0*1*" observation, checked and turned into
// a statement in the project's own vocabulary.
//
// Spencer 2013 (sources/spencer-2013-ca-cryptographic-generators.txt, line 990):
//   "Meier and Staffelbach note in [28] that where the temporal sequence is a
//    sequence of 0s, the right-adjacent sequence must match 0*1*."
//
// Derivation (one line from rule30_eq):  at a WHITE centre cell,
//     col1(t+1) = col0(t) XOR (col1(t) OR col2(t)) = col1(t) OR col2(t)
// so col1 is NON-DECREASING across every white run of the centre column.
// Combined with the board's `column_one_of_white`
//     col1(t) = col0(t+1) XOR col(-1)(t)
// this becomes a forbidden block in the pair of columns (0, -1):
//     col0(t)=col0(t+1)=col0(t+2)=0  forbids  (col(-1)(t), col(-1)(t+1)) = (1,0).
//
// Tests A..G below.  Every picture is grown as a real bi-infinite row, wide
// enough that the cone never reaches the array edge.

const T = 4000;      // rows for the structural tests
const PAD = 8;

// ---------------------------------------------------------------------------
// A generic rule 30 evolution on a padded array.  cells[i] is position i-off.
function pictureFrom(row0, off, rows) {
  // row0: Uint8Array; off: index of position 0; rows: number of rows
  const w = row0.length;
  const pic = [];
  let cur = Uint8Array.from(row0);
  for (let t = 0; t < rows; t++) {
    pic.push(cur);
    const nxt = new Uint8Array(w);
    for (let i = 1; i < w - 1; i++) nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
    cur = nxt;
  }
  return { pic, off };
}

function seedPicture(rows) {
  const w = 2 * rows + 2 * PAD + 3;
  const off = rows + PAD;
  const row0 = new Uint8Array(w);
  row0[off] = 1;
  return pictureFrom(row0, off, rows);
}

// X_b: white at every x >= 1 at time 0, centre column b.  Built the way
// crystal 40 does: the left half is free, so grow a real row by choosing
// row 0 to be white everywhere except we drive it as a half-line.  Easier:
// evolve the right half-line from the boundary b directly.
function halfRight(b, rows) {
  // colR[t][k] = cell at position k+1 at time t; row 0 all white.
  let cur = new Uint8Array(rows + 3);
  const out = [];
  for (let t = 0; t < rows; t++) {
    out.push(cur);
    const nxt = new Uint8Array(rows + 3);
    nxt[0] = b[t] ^ (cur[0] | cur[1]);
    for (let k = 1; k < rows + 2; k++) nxt[k] = cur[k - 1] ^ (cur[k] | cur[k + 1]);
    cur = nxt;
  }
  return out; // out[t][0] is column 1 at time t
}

// ---------------------------------------------------------------------------
console.log('=== A. col1(t+1) = col1(t) OR col2(t) at every white centre time ===');
{
  const cases = [];
  const seed = seedPicture(T);
  cases.push(['single seed', seed]);
  // random finite configurations
  let rng = 123456789;
  const rand = () => ((rng ^= rng << 13, rng ^= rng >>> 17, rng ^= rng << 5) >>> 0) / 4294967296;
  for (let c = 0; c < 6; c++) {
    const rows = 800;
    const w = 2 * rows + 2 * PAD + 3, off = rows + PAD;
    const row0 = new Uint8Array(w);
    for (let i = off - 30; i <= off + 30; i++) row0[i] = rand() < 0.5 ? 1 : 0;
    cases.push([`random finite #${c}`, pictureFrom(row0, off, rows)]);
  }
  // a periodic-right-half configuration (not a cone at all)
  {
    const rows = 800;
    const w = 2 * rows + 2 * PAD + 3, off = rows + PAD;
    const row0 = new Uint8Array(w);
    for (let i = 0; i < w; i++) row0[i] = (i % 3 === 0) ? 1 : 0;
    cases.push(['(100)^Z', pictureFrom(row0, off, rows)]);
  }
  let allOk = true;
  for (const [name, { pic, off }] of cases) {
    let checked = 0, bad = 0;
    for (let t = 0; t + 1 < pic.length; t++) {
      if (pic[t][off] === 0) {
        checked++;
        const want = pic[t][off + 1] | pic[t][off + 2];
        if (pic[t + 1][off + 1] !== want) bad++;
      }
    }
    if (bad) allOk = false;
    console.log(`  ${name.padEnd(18)} white times ${String(checked).padStart(5)}  failures ${bad}`);
  }
  console.log('  ALL OK:', allOk);
  // a deliberately wrong variant, to show the test can fail
  {
    const { pic, off } = seedPicture(200);
    let bad = 0, checked = 0;
    for (let t = 0; t + 1 < pic.length; t++) {
      if (pic[t][off] === 0) { checked++; if (pic[t + 1][off + 1] !== (pic[t][off + 1] & pic[t][off + 2])) bad++; }
    }
    console.log(`  MUTANT (OR -> AND)  white times ${checked}  failures ${bad}  (must be > 0)`);
  }
}

// ---------------------------------------------------------------------------
console.log('\n=== B/C/D. the forbidden block in the pair (column 0, column -1) ===');
console.log('  claim: col0(t)=col0(t+1)=col0(t+2)=0  forbids  col(-1)(t)=1 and col(-1)(t+1)=0');
{
  const cases = [];
  cases.push(['single seed', seedPicture(T)]);
  let rng = 987654321;
  const rand = () => ((rng ^= rng << 13, rng ^= rng >>> 17, rng ^= rng << 5) >>> 0) / 4294967296;
  for (let c = 0; c < 6; c++) {
    const rows = 800;
    const w = 2 * rows + 2 * PAD + 3, off = rows + PAD;
    const row0 = new Uint8Array(w);
    for (let i = off - 40; i <= off + 40; i++) row0[i] = rand() < 0.5 ? 1 : 0;
    cases.push([`random finite #${c}`, pictureFrom(row0, off, rows)]);
  }
  {
    const rows = 800;
    const w = 2 * rows + 2 * PAD + 3, off = rows + PAD;
    const row0 = new Uint8Array(w);
    for (let i = 0; i < w; i++) row0[i] = (i % 5 < 2) ? 1 : 0;
    cases.push(['(11000)^Z', pictureFrom(row0, off, rows)]);
  }
  let allOk = true, totalOccasions = 0;
  for (const [name, { pic, off }] of cases) {
    let occasions = 0, bad = 0;
    for (let t = 0; t + 2 < pic.length; t++) {
      if (pic[t][off] === 0 && pic[t + 1][off] === 0 && pic[t + 2][off] === 0) {
        occasions++;
        if (pic[t][off - 1] === 1 && pic[t + 1][off - 1] === 0) bad++;
      }
    }
    totalOccasions += occasions;
    if (bad) allOk = false;
    console.log(`  ${name.padEnd(18)} occasions ${String(occasions).padStart(5)}  violations ${bad}`);
  }
  console.log(`  ALL OK: ${allOk}   (${totalOccasions} occasions total)`);
  // is the block really forbidden, or just rare?  Count how often the OTHER
  // three (col(-1)(t), col(-1)(t+1)) patterns occur under the same condition.
  const { pic, off } = seedPicture(T);
  const tally = [0, 0, 0, 0];
  for (let t = 0; t + 2 < pic.length; t++) {
    if (pic[t][off] === 0 && pic[t + 1][off] === 0 && pic[t + 2][off] === 0) {
      tally[pic[t][off - 1] * 2 + pic[t + 1][off - 1]]++;
    }
  }
  console.log(`  seed, (col(-1)(t),col(-1)(t+1)) tally under a triple white centre: ` +
    `00:${tally[0]}  01:${tally[1]}  10:${tally[2]}  11:${tally[3]}   <- 10 is the forbidden one`);
}

// ---------------------------------------------------------------------------
console.log('\n=== E/F. what the monotonicity is worth: white-run statistics ===');
{
  const { pic, off } = seedPicture(T);
  const c = new Uint8Array(T); for (let t = 0; t < T; t++) c[t] = pic[t][off];
  const runs = [];
  let t = 0;
  while (t < T) {
    if (c[t] === 0) { let s = t; while (t < T && c[t] === 0) t++; runs.push(t - s); }
    else t++;
  }
  const whites = runs.reduce((a, b) => a + b, 0);
  const bits = runs.reduce((a, L) => a + Math.log2(L + 1), 0);
  const hist = new Map();
  for (const L of runs) hist.set(L, (hist.get(L) ?? 0) + 1);
  const ks = [...hist.keys()].sort((a, b) => a - b);
  console.log(`  rows ${T}, white centre cells ${whites} (density ${(whites / T).toFixed(4)})`);
  console.log(`  maximal white runs ${runs.length}, longest ${Math.max(...runs)}`);
  console.log(`  run-length histogram: ${ks.slice(0, 10).map(k => `${k}:${hist.get(k)}`).join('  ')}${ks.length > 10 ? '  ...' : ''}`);
  console.log(`  bits of column 1 at white times, unconstrained : ${whites}`);
  console.log(`  bits after the 0*1* constraint (sum log2(L+1))  : ${bits.toFixed(1)}`);
  console.log(`  saving factor ${(whites / bits).toFixed(3)}   (per row: ${(whites / T).toFixed(3)} -> ${(bits / T).toFixed(3)})`);
  // black times, where column 1 drops out of the rule at the origin entirely
  console.log(`  black centre cells (column 1 free at the origin) : ${T - whites}`);
}

// ---------------------------------------------------------------------------
console.log('\n=== G. distinct column-1 prefixes under the cone constraint ===');
console.log('  (obstruction 3 named this gap: "Neither number is about column 1.")');
{
  const D = 18;                       // depth
  const seed = seedPicture(D + 2);
  const cTrue = []; for (let t = 0; t < D; t++) cTrue.push(seed.pic[t][seed.off]);
  const blacks = cTrue.reduce((a, b) => a + b, 0);
  // enumerate row 0 on x in [0, D], white on x <= -1 and x > D
  const W = 2 * D + 8, OFF = D + 4;
  const col1set = new Set();
  let consistent = 0;
  const row0 = new Uint8Array(W);
  const bufA = new Uint8Array(W), bufB = new Uint8Array(W);
  for (let mask = 0; mask < (1 << (D + 1)); mask++) {
    row0.fill(0);
    for (let x = 0; x <= D; x++) if ((mask >> x) & 1) row0[OFF + x] = 1;
    let cur = bufA, nxt = bufB;
    cur.set(row0);
    let ok = true; let key = 0;
    for (let t = 0; t < D; t++) {
      if (cur[OFF] !== cTrue[t]) { ok = false; break; }
      key = key * 2 + cur[OFF + 1];
      for (let i = 1; i < W - 1; i++) nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
      nxt[0] = 0; nxt[W - 1] = 0;
      const tmp = cur; cur = nxt; nxt = tmp;
    }
    if (ok) { consistent++; col1set.add(key); }
  }
  console.log(`  depth ${D}: centre column has ${blacks} black times, ${D - blacks} white times`);
  console.log(`  windows white on x<=-1 consistent with the centre column : ${consistent}`);
  console.log(`  distinct column-1 prefixes among them                    : ${col1set.size}`);
  console.log(`  ceiling 2^(#black times)                                 : ${2 ** blacks}`);
  console.log(`  log2(distinct column-1 prefixes) = ${Math.log2(col1set.size).toFixed(2)} bits over ${D} rows` +
    `  (${(Math.log2(col1set.size) / D).toFixed(3)} bits/row)`);
}
