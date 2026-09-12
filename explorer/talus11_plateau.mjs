// Talus, 2026-09-12.  The cheap companion: does the alternating maximum have a
// closed form?
//
// f_ALT(a) is the longest ALTERNATING block of the centre column of a
// configuration white at every x < -a (talus10's class C1, which is the right
// class here because an alternating column excludes the zero configuration by
// itself).  talus10_alt.mjs measured a = 1..26:
//     8 8 8 8 9 10 10 17 17 17 17 17 17 20 22 26 26 26 36 36 36 36 36 36 36 36
// Condrey's constant-word maxima have a closed form (2*floor(w/2)+2 and
// 2*ceil(w/2)+1).  A closed form here would be evidence that the extinction is
// a mechanism after all; its continued absence is evidence that it is a count.
//
// The tree has exactly 2^k nodes at every level k <= a, because for k <= a the
// forced left cell absorbs the pinned column value and nothing prunes.  So the
// cost is Theta(2^a) and cannot be argued down.  Two passes:
//   [E] exhaustive, as far as the clock allows, with the time per a printed so
//       the next reader can price the next value;
//   [L] witness-hunt beyond that -- a node budget and the deepest block found,
//       which is a LOWER bound and is enough to detect a jump (not a plateau).

const ABORT = "budget";

function search(a, cap, budget) {
  const off = cap + 8;
  const col = new Uint8Array(cap + 6);
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let best = 0, nodes = 0, over = false;

  function rec(k) {
    if (k > cap) return;
    if (++nodes > budget) { over = true; throw ABORT; }
    const cv = col[k - 1] ^ 1;                       // the column is pinned
    for (const rc of [0, 1]) {
      const rdk = RD[k], rd1 = RD[k - 1], rd2 = k >= 2 ? RD[k - 2] : null;
      rdk[0] = rc;
      for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
      const ldk = LD[k], ld1 = LD[k - 1], ld2 = k >= 2 ? LD[k - 2] : null;
      ldk[0] = 0;
      for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
      const lc = ldk[k - 1] ^ (col[k - 1] | rdk[k - 1]) ^ cv;
      if (k > a && lc === 1) continue;
      col[k] = cv;
      if (lc === 1) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      ldk[k] = cv; rdk[k] = cv;
      if (k + 1 > best) best = k + 1;
      rec(k + 1);
      if (lc === 1) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
    }
  }

  try {
    for (const s of [0, 1]) {
      col[0] = s; LD[0][0] = s; RD[0][0] = s;
      if (1 > best) best = 1;
      rec(1);
    }
  } catch (e) { if (e !== ABORT) throw e; }
  return { best, exact: !over, nodes };
}

const PUB = [8, 8, 8, 8, 9, 10, 10, 17, 17, 17, 17, 17, 17, 20, 22, 26, 26, 26,
             36, 36, 36, 36, 36, 36, 36, 36];

console.log("[E] exhaustive, with timings (published a=1..26 reproduced first)");
const f = [];
let agree = 0;
for (let a = 1; a <= 40; a++) {
  const t0 = Date.now();
  const r = search(a, 3 * a + 40, 4e9);
  const dt = (Date.now() - t0) / 1000;
  f[a] = r.best;
  const pub = a <= 26 ? PUB[a - 1] : null;
  if (pub !== null && pub === r.best) agree++;
  console.log(`    a=${String(a).padStart(2)}  f=${String(r.best).padStart(3)}` +
    `${pub !== null ? (pub === r.best ? "  (= published)" : `  (published ${pub} -- MISMATCH)`) : ""}` +
    `   ${r.nodes} nodes, ${dt.toFixed(1)} s`);
  if (dt > 420) { console.log(`    stopping: a=${a} took ${dt.toFixed(0)} s, a=${a + 1} would take about ${(2 * dt).toFixed(0)} s`); break; }
}
console.log(`    ${agree} of the 26 published values reproduced`);

console.log("\n[F] structure of the sequence so far");
{
  const vals = f.slice(1).filter((v) => v !== undefined);
  console.log(`    f(a), a=1..${vals.length}: ${vals.join(" ")}`);
  const jumps = [];
  for (let a = 2; a < vals.length + 1; a++) if (f[a] !== f[a - 1]) jumps.push([a, f[a - 1], f[a]]);
  console.log(`    jumps at a = ${jumps.map((j) => j[0]).join(", ")}`);
  console.log(`    values taken = ${[...new Set(vals)].join(", ")}`);
  console.log(`    plateau lengths = ${(() => {
    const out = []; let run = 1;
    for (let a = 2; a <= vals.length; a++) { if (f[a] === f[a - 1]) run++; else { out.push(run); run = 1; } }
    out.push(run); return out.join(", ");
  })()}`);
  console.log(`    f(a) - 2a      = ${vals.map((v, i) => v - 2 * (i + 1)).join(" ")}`);
  console.log(`    f(a) / a       = ${vals.map((v, i) => (v / (i + 1)).toFixed(2)).join(" ")}`);
  // the inverse: e(L) = least a with f(a) >= L, over the values actually taken
  const taken = [...new Set(vals)].sort((x, y) => x - y);
  console.log(`    e(L) = least a with f(a) >= L, for the L taken:`);
  console.log(`      L = ${taken.join(", ")}`);
  console.log(`      e = ${taken.map((L) => { for (let a = 1; a <= vals.length; a++) if (f[a] >= L) return a; }).join(", ")}`);
}

console.log("\n[L] witness hunt beyond the exhaustive range (LOWER bounds only)");
{
  const start = f.length;
  for (let a = start; a <= start + 10; a++) {
    const r = search(a, 3 * a + 40, 3e7);
    console.log(`    a=${String(a).padStart(2)}  f >= ${r.best}${r.exact ? "  (exact after all)" : ""}   ${r.nodes} nodes`);
  }
}
