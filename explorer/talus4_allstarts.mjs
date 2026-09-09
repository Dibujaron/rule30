// Talus, 2026-09-09. The all-starts hypothesis of leftDiagonal_onset_le_of_stepMod_preperiod:
//   for every k and every x < 2^(k+1), the orbit of x under g_{k+1} is periodic from 2k.
// stepMod_preperiod_le_of_le_11 verifies it to k = 11 with period 4.
//
// Here: the exact functional graph of g_n on all 2^n states, for n = 1..NMAX.
//   maxTail(n)   = max over ALL x of the preperiod of x  (the all-starts route needs <= 2(n-1))
//   maxCycle(n)  = max cycle length in the whole graph
//   tail1, cyc1  = the orbit of 1's own preperiod and period
//   oddCycles(n) = how many distinct cycles the ODD starts land on, and their lengths
//
// Also checks the homogeneity g(2^m y) = 2^m g(y), which reduces every start to an
// odd one at a smaller width.

const NMAX = 24;

function build(n) {
  const S = 1 << n;
  const mask = S - 1;
  const next = new Int32Array(S);
  for (let x = 0; x < S; x++) next[x] = (((4 * x) ^ ((2 * x) | x)) & mask) >>> 0;
  return next;
}

// depth[x] = steps from x until it first lands on a cycle node; 0 for cycle nodes.
// cycId[x] = id of the cycle x eventually enters.
function analyse(n) {
  const S = 1 << n;
  const next = build(n);
  const color = new Uint8Array(S); // 0 unvisited, 1 on current path, 2 done
  const depth = new Int32Array(S).fill(-1);
  const cycId = new Int32Array(S).fill(-1);
  const cycLen = [];
  const path = new Int32Array(S);
  const pos = new Int32Array(S).fill(-1);
  for (let s = 0; s < S; s++) {
    if (color[s] === 2) continue;
    let len = 0;
    let x = s;
    while (color[x] === 0) {
      color[x] = 1;
      pos[x] = len;
      path[len++] = x;
      x = next[x];
    }
    if (color[x] === 1) {
      // new cycle found: from pos[x] to len-1
      const start = pos[x];
      const L = len - start;
      const id = cycLen.length;
      cycLen.push(L);
      for (let i = start; i < len; i++) { depth[path[i]] = 0; cycId[path[i]] = id; }
      for (let i = start - 1; i >= 0; i--) { depth[path[i]] = depth[path[i + 1]] + 1; cycId[path[i]] = id; }
    } else {
      // hit a finished node
      let d = depth[x], c = cycId[x];
      for (let i = len - 1; i >= 0; i--) { d += 1; depth[path[i]] = d; cycId[path[i]] = c; }
    }
    for (let i = 0; i < len; i++) { color[path[i]] = 2; pos[path[i]] = -1; }
  }
  return { depth, cycId, cycLen, next };
}

// homogeneity check
{
  let bad = 0, checked = 0;
  for (let n = 1; n <= 18; n++) {
    const mask = (1 << n) - 1;
    const g = (x, m) => ((4 * x) ^ ((2 * x) | x)) & m;
    for (let m = 0; m < n; m++) {
      const maskLo = (1 << (n - m)) - 1;
      for (let y = 0; y < Math.min(1 << (n - m), 4096); y++) {
        checked++;
        if (g((y << m) & mask, mask) !== ((g(y, maskLo) << m) & mask)) bad++;
      }
    }
  }
  console.log(`homogeneity g(2^m y) mod 2^n == 2^m (g(y) mod 2^(n-m)): ${checked - bad}/${checked} agree`);
}

console.log("");
console.log(" n   k   2k    maxTail  maxTail<=2k?  maxCycle  tail(1)  cyc(1)  #cycles-from-odd  lengths");
for (let n = 1; n <= NMAX; n++) {
  const k = n - 1;
  const { depth, cycId, cycLen } = analyse(n);
  const S = 1 << n;
  let maxTail = 0, argTail = 0;
  for (let x = 0; x < S; x++) if (depth[x] > maxTail) { maxTail = depth[x]; argTail = x; }
  const maxCycle = Math.max(...cycLen);
  const oddIds = new Set();
  for (let x = 1; x < S; x += 2) oddIds.add(cycId[x]);
  const lens = [...new Set([...oddIds].map((i) => cycLen[i]))].sort((a, b) => a - b);
  console.log(
    `${String(n).padStart(2)} ${String(k).padStart(3)} ${String(2 * k).padStart(4)} ${String(maxTail).padStart(9)}   ${maxTail <= 2 * k ? "yes" : "NO "}       ${String(maxCycle).padStart(7)} ${String(depth[1]).padStart(8)} ${String(cycLen[cycId[1]]).padStart(7)} ${String(oddIds.size).padStart(15)}  ${lens.join(",")}   (worst start x=${argTail})`,
  );
}
