// Parallax, 2026-09-09. Refinement of parallax3_pressure.mjs, with controls.
//
// Question: can the ensemble's statistics tell the seed's DETERMINISTIC, fully
// understood settled region (left of the seam; diagonals of period 32, closed
// form, zero entropy as a dynamical object) apart from its chaotic bulk?
//
// Measured per region: the firing density 1[11] (= -P'(0) of the firing
// potential), the standardised fluctuation of the row firing count (= P''(0)),
// the chi-square of the length-k block frequencies against uniform, and the
// conditional entropies h_k = H_{k+1} - H_k.
//
// Controls, with the same code path and the same sample sizes:
//   iid   -- every row an independent uniform random row (the ensemble itself)
//   rand  -- rule 30 grown from ONE uniform random row (a mu-typical orbit)
// A measurement that cannot separate the seed's settled region from these is a
// measurement that cannot see determinism.
//
// WARNING about the 'rand' control in THIS file: its array has white cells at
// both ends, and boundary damage travels right at speed exactly 1
// (evolve_right_edge), so by row T the left half of the array is not rule 30 on
// Z at all. It reads a firing density of 0.226 instead of 0.25 and is WRONG.
// It is kept here only so the failure is on the record; the repaired control,
// which measures only the provably uncontaminated middle of a 6T-wide array, is
// explorer/parallax3_control.mjs and reads 0.2500081.

const T = 20000;
const W = 2 * T + 3;
const KMAX = 14;
const SAMPLE_FROM = Math.floor(T * 0.5);

// xorshift128, so the control is reproducible
let s0 = 123456789, s1 = 362436069, s2 = 521288629, s3 = 88675123;
function rnd() {
  const t = s0 ^ (s0 << 11); s0 = s1; s1 = s2; s2 = s3;
  s3 = (s3 ^ (s3 >>> 19)) ^ (t ^ (t >>> 8));
  return (s3 >>> 0) / 4294967296;
}

function blockStats(map, k) {
  let tot = 0; for (const c of map.values()) tot += c;
  let H = 0, chi = 0;
  const exp = tot / (1 << k);
  for (const c of map.values()) { const p = c / tot; H -= p * Math.log2(p); }
  for (let v = 0; v < (1 << k); v++) { const c = map.get(v) || 0; chi += (c - exp) * (c - exp) / exp; }
  const df = (1 << k) - 1;
  return { H, chi, df, z: (chi - df) / Math.sqrt(2 * df), tot };
}

function run(mode) {
  let row = new Uint8Array(W), next = new Uint8Array(W);
  if (mode === 'seed') row[T + 1] = 1;
  else for (let i = 0; i < W; i++) row[i] = rnd() < 0.5 ? 0 : 1;

  const regions = mode === 'seed'
    ? [['settled left [-t,-0.30t]', t => [T + 1 - t, T + 1 - Math.round(0.30 * t)]],
       ['chaotic bulk [-0.20t,t] ', t => [T + 1 - Math.round(0.20 * t), T + 1 + t]]]
    : [['whole row (control)     ', () => [1, W - 2]]];

  const acc = regions.map(() => ({ n: 0, f: 0, z: 0, zz: 0, m: 0, blocks: new Map() }));

  for (let t = 0; t < T; t++) {
    if (t > 200) {
      for (let g = 0; g < regions.length; g++) {
        const [lo, hi] = regions[g][1](t);
        if (hi - lo < 1000) continue;
        const a = acc[g];
        let f = 0;
        for (let i = lo; i < hi; i++) if (row[i] && row[i + 1]) f++;
        const n = hi - lo;
        a.n += n; a.f += f;
        const z = (f - n / 4) / Math.sqrt(n);
        a.z += z; a.zz += z * z; a.m++;
        if (t >= SAMPLE_FROM && t % 11 === 0) {
          for (let i = lo; i + KMAX + 1 < hi; i++) {
            let v = 0; for (let k = 0; k <= KMAX; k++) v = v * 2 + row[i + k];
            a.blocks.set(v, (a.blocks.get(v) || 0) + 1);
          }
        }
      }
    }
    if (mode === 'iid') { for (let i = 0; i < W; i++) row[i] = rnd() < 0.5 ? 0 : 1; continue; }
    next.fill(0);
    for (let i = 1; i < W - 1; i++) next[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    const tmp = row; row = next; next = tmp;
  }

  for (let g = 0; g < regions.length; g++) {
    const a = acc[g];
    console.log(`\n--- ${mode}: ${regions[g][0]} ---`);
    console.log(`firing density                 ${(a.f / a.n).toFixed(7)}   (-P'(0) = 0.25)`);
    console.log(`mean  (N-n/4)/sqrt(n)          ${(a.z / a.m).toFixed(6)}`);
    console.log(`var   (N-n/4)/sqrt(n)          ${(a.zz / a.m - (a.z / a.m) ** 2).toFixed(6)}   (P''(0) = 0.3125)`);
    // marginalise the length-(KMAX+1) counts down to each k
    const at = [];
    for (let k = 1; k <= KMAX + 1; k++) {
      const m = new Map();
      const shift = (KMAX + 1) - k;
      for (const [v, c] of a.blocks) {
        const key = v >>> shift;
        m.set(key, (m.get(key) || 0) + c);
      }
      at.push(blockStats(m, k));
    }
    console.log('k   H_k/k (bits)   h_k = H_k - H_{k-1}   chi^2 vs uniform (z-score)');
    for (let k = 1; k <= KMAX + 1; k++) {
      const s = at[k - 1];
      const hk = k === 1 ? s.H : s.H - at[k - 2].H;
      console.log(String(k).padEnd(4), (s.H / k).toFixed(6).padEnd(15),
        hk.toFixed(6).padEnd(22), `${s.chi.toFixed(0)} (z=${s.z.toFixed(1)})`);
    }
    console.log(`block samples ${a.blocks.size ? [...a.blocks.values()].reduce((x, y) => x + y, 0) : 0}`);
  }
}

console.log('====================== CONTROL: iid rows ======================');
run('iid');
console.log('\n============ CONTROL: rule 30 from a random row ============');
run('rand');
console.log('\n==================== THE SEED ====================');
run('seed');
