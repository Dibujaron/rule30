// Talus, 2026-09-12. How long can the centre column of a FINITE configuration
// alternate?  This is the quantity rung 2's window form reduces to: if a
// configuration whose support lies in [-a, a] cannot have an alternating centre
// column longer than 3a cells, then the seed's row a (support in [-a,a]) cannot
// alternate across [a, 4a], so 00 or 11 occurs there.
//
// Block A: exhaustive over every configuration supported in [-a, a].
// Block B: the same with the cone-edge facts the seed's row a actually has.
// Block C: left-extent only (right half unbounded) -- is the right edge needed?

// row of a configuration supported in [-a, a]: integer m, bit j = cell(j - a).
// after t steps bit j = cell(j - a - t); centre is bit (a + t).
// step: m -> (m<<2) ^ ((m<<1) | m).

function altLenBig(m0, a, cap) {
  // number of cells in the alternating prefix of the centre column, capped
  let m = m0;
  let prev = Number((m >> BigInt(a)) & 1n);
  let L = 1;
  for (let t = 1; t <= cap; t++) {
    m = (m << 2n) ^ ((m << 1n) | m);
    const b = Number((m >> BigInt(a + t)) & 1n);
    if (b === prev) return L;
    prev = b;
    L++;
  }
  return L;
}

function blockA(aMax) {
  console.log("[A] exhaustive over all configurations supported in [-a,a]");
  console.log("    a  width  maxAltCells  witness(cells -a..a)   2a+1   3a");
  for (let a = 0; a <= aMax; a++) {
    const n = 2 * a + 1;
    const N = 1 << n;
    let best = 0, bestM = 0;
    const cap = 4 * a + 8;
    for (let m = 0; m < N; m++) {
      // quick reject: centre cell run - need c(0) then c(1) != c(0) etc.
      const L = altLenBig(BigInt(m), a, cap);
      if (L > best) { best = L; bestM = m; }
    }
    let w = "";
    for (let j = 0; j < n; j++) w += (bestM >> j) & 1;
    console.log(`    ${String(a).padStart(2)}  ${String(n).padStart(5)}  ${String(best).padStart(11)}  ${w.padEnd(24)} ${String(2 * a + 1).padStart(4)} ${String(3 * a).padStart(4)}`);
  }
}

function blockB(aMax) {
  // the seed's row a satisfies: cell(-a)=1, cell(-a+1)=1, cell(-a+2)=0,
  // cell(-a+3) = (a even), cell(a)=1, cell(a-1) = (a-1 even).
  // (evolve_left_edge, _second_, _third_, _fourth_diagonal; evolve_right_edge,
  //  evolve_right_second_diagonal.)  Bits: index j corresponds to cell(j-a).
  console.log("\n[B] the same, restricted to the six cone-edge values the seed's row a has");
  console.log("    a  free  maxAltCells  witness                   3a");
  for (let a = 4; a <= aMax; a++) {
    const n = 2 * a + 1;
    const fixed = new Map();
    fixed.set(0, 1);                       // cell(-a)
    fixed.set(1, 1);                       // cell(-a+1)
    fixed.set(2, 0);                       // cell(-a+2)
    fixed.set(3, a % 2 === 0 ? 1 : 0);     // cell(-a+3): black iff a even
    fixed.set(n - 1, 1);                   // cell(a)
    fixed.set(n - 2, (a - 1) % 2 === 0 ? 1 : 0); // cell(a-1)
    const freeIdx = [];
    for (let j = 0; j < n; j++) if (!fixed.has(j)) freeIdx.push(j);
    let base = 0;
    for (const [j, v] of fixed) if (v) base |= 1 << j;
    const N = 1 << freeIdx.length;
    let best = 0, bestM = 0;
    const cap = 4 * a + 8;
    for (let k = 0; k < N; k++) {
      let m = base;
      for (let i = 0; i < freeIdx.length; i++) if ((k >> i) & 1) m |= 1 << freeIdx[i];
      const L = altLenBig(BigInt(m), a, cap);
      if (L > best) { best = L; bestM = m; }
    }
    let w = "";
    for (let j = 0; j < n; j++) w += (bestM >> j) & 1;
    console.log(`    ${String(a).padStart(2)}  ${String(freeIdx.length).padStart(4)}  ${String(best).padStart(11)}  ${w.padEnd(24)} ${String(3 * a).padStart(4)}`);
  }
}

function blockC(aMax, R) {
  // left extent only: white at x < -a, arbitrary in [-a, R].
  console.log(`\n[C] white only at x < -a; cells in [-a, ${R}] free`);
  console.log("    a  maxAltCells (cap)");
  for (let a = 0; a <= aMax; a++) {
    const n = a + 1 + R;
    if (n > 24) { console.log(`    ${a}: skipped, ${n} bits`); continue; }
    const N = 1 << n;
    let best = 0;
    const cap = 2 * R;
    for (let m = 0; m < N; m++) {
      const L = altLenBig(BigInt(m), a, cap);
      if (L > best) best = L;
    }
    console.log(`    ${String(a).padStart(2)}  ${String(best).padStart(11)} (cap ${cap})`);
  }
}

blockA(10);
blockB(10);
blockC(6, 16);
