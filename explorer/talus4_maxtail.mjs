// Talus, 2026-09-09. Exhaustive worst-case preperiod of g_n over ALL 2^n starts.
//
// This is the exact quantity the all-starts route needs:
//   leftDiagonal_onset_le_of_stepMod_preperiod's hypothesis holds at k iff
//   maxTail(k+1) <= 2k.
// stepMod_preperiod_le_of_le_11 is the instance k <= 11 (plus "every cycle length
// divides 4" at those widths).
//
// One byte per state: 255 unvisited, 254 on the current path, else the distance to
// the cycle set. Depth stays well under 254 in this range, and the script asserts it.

const NMAX = Number(process.env.TALUS_NMAX ?? 28);

function maxTail(n) {
  const S = 1 << n;
  const mask = S - 1;
  const d = new Uint8Array(S).fill(255);
  const path = new Int32Array(4096);
  let worst = 0, argWorst = 0;
  for (let s = 0; s < S; s++) {
    if (d[s] !== 255) continue;
    let len = 0;
    let x = s;
    while (d[x] === 255) {
      d[x] = 254;
      path[len++] = x;
      if (len >= 4096) throw new Error("path overflow at n=" + n);
      x = (((4 * x) ^ ((2 * x) | x)) & mask) >>> 0;
    }
    let base;
    if (d[x] === 254) {
      // a fresh cycle: everything from x's position onwards is at distance 0
      let start = 0;
      while (path[start] !== x) start++;
      for (let i = start; i < len; i++) d[path[i]] = 0;
      len = start;
      base = 0;
    } else {
      base = d[x];
    }
    for (let i = len - 1; i >= 0; i--) {
      base += 1;
      if (base >= 254) throw new Error("depth overflow at n=" + n);
      d[path[i]] = base;
      if (base > worst) { worst = base; argWorst = path[i]; }
    }
  }
  return { worst, argWorst, tail1: d[1 & mask] };
}

console.log(" n    k=n-1    2k      maxTail   maxTail/n   tail(1)  tail(1)/n   maxTail<=2k?   worst start x");
for (let n = 1; n <= NMAX; n++) {
  const t0 = Date.now();
  const { worst, argWorst, tail1 } = maxTail(n);
  const k = n - 1;
  console.log(
    `${String(n).padStart(2)} ${String(k).padStart(7)} ${String(2 * k).padStart(7)} ${String(worst).padStart(9)}    ${(worst / n).toFixed(4)}  ${String(tail1).padStart(8)}    ${(tail1 / n).toFixed(4)}       ${worst <= 2 * k ? "yes" : "NO "}      ${argWorst}   (${((Date.now() - t0) / 1000).toFixed(1)}s)`,
  );
}
