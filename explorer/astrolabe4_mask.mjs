// Astrolabe, 2026-09-13.  Does the right-hand information rate equal the
// fraction of updates at which the right argument is VISIBLE?
//
// Every left-permutive rule is new = l XOR g(c,r).  The right neighbour matters
// at an update exactly when g(c,0) != g(c,1), i.e. only for certain values of
// the centre cell c.  For rule 30, g = c OR r: g(0,.) = r (visible) and
// g(1,.) = 1 (masked), so the right argument is visible exactly at the WHITE
// cells.  That is obstruction 34's invisibility lemma, one column out.
//
// PREDICTION: the right-hand rate measured in astrolabe4_gate.mjs (bits per
// cell that Bob's half can convey to the origin) should equal the fraction of
// updates inside the cone at which the right argument is visible.
//
// This is a real prediction with two sharp cases: rules 180 and 210 are
// non-affine in r and yet have rate ~0.086 and 0.000.  Under the mechanism
// their visibility fractions must be ~0.086 and ~0.000 too.  If they are near
// 1/2 instead, the mechanism is refuted and the 1/2 is a coincidence.

function ruleBit(rule, l, c, r) { return (rule >> (4 * l + 2 * c + r)) & 1; }

// does the right argument matter, given centre value c?
function rVisible(rule, c) {
  // g(c,r) = rule(0,c,r) since new = l XOR g(c,r) and l=0 gives g
  return ruleBit(rule, 0, c, 0) !== ruleBit(rule, 0, c, 1);
}

// fraction of in-cone updates whose right argument is visible, averaged over
// uniformly random initial windows of width 2n+1 with white outside.
function visibility(rule, n, trials, seedInit) {
  let seed = seedInit >>> 0;
  const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed & 1; };
  let vis = 0, tot = 0, black = 0, cells = 0;
  const width = 2 * n + 1;
  for (let tr = 0; tr < trials; tr++) {
    let cur = new Uint8Array(width);
    for (let i = 0; i < width; i++) cur[i] = rnd();
    let lo = 0, hi = width - 1;
    for (let t = 0; t < n; t++) {
      const nxt = new Uint8Array(width);
      const nlo = lo + 1, nhi = hi - 1;
      for (let i = nlo; i <= nhi; i++) {
        if (rVisible(rule, cur[i])) vis++;
        tot++;
        black += cur[i]; cells++;
        nxt[i] = ruleBit(rule, cur[i - 1], cur[i], cur[i + 1]);
      }
      cur = nxt; lo = nlo; hi = nhi;
    }
  }
  return [vis / tot, black / cells];
}

// the rates measured in astrolabe4_gate.mjs, transcribed
const RATE = {
  135: 0.5213, 30: 0.5167, 120: 0.4777, 75: 0.4745, 45: 0.4684, 225: 0.4672,
  180: 0.0857, 15: 0.0000, 60: 0.0000, 90: 0.0000, 105: 0.0000, 150: 0.0000,
  165: 0.0000, 195: 0.0000, 210: 0.0000, 240: 0.0000,
};
const GNAME = {
  15: '1', 30: 'c OR r', 45: 'c OR !r', 60: 'c', 75: '!c OR r', 90: 'r',
  105: '!(c XOR r)', 120: 'c AND r', 135: '!(c AND r)', 150: 'c XOR r',
  165: '!r', 180: 'c AND !r', 195: '!c', 210: '!c AND r', 225: '!(c OR r)', 240: '0',
};

const n = 12, trials = 4000;
console.log(`visibility fraction against measured right-hand rate; n=${n}, ${trials} random windows`);
console.log('rule  g                r visible when   visibility   black dens   RATE     |diff|');
const rows = [];
for (const rule of [135, 30, 120, 75, 45, 225, 180, 210, 150, 90, 105, 165, 60, 195, 15, 240]) {
  const when = [rVisible(rule, 0) ? 'c=0' : null, rVisible(rule, 1) ? 'c=1' : null].filter(Boolean).join(',') || 'never';
  const [vis, dens] = visibility(rule, n, trials, 0x9e3779b9 ^ (rule * 2654435761));
  const rate = RATE[rule];
  rows.push([rule, vis, rate]);
  console.log(String(rule).padStart(4) + '  ' + GNAME[rule].padEnd(16) + when.padStart(14) +
    vis.toFixed(4).padStart(13) + dens.toFixed(4).padStart(13) +
    rate.toFixed(4).padStart(9) + Math.abs(vis - rate).toFixed(4).padStart(9));
}

// correlation over the 16
const xs = rows.map((r) => r[1]), ys = rows.map((r) => r[2]);
const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
let sxy = 0, sxx = 0, syy = 0;
for (let i = 0; i < xs.length; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
console.log(`\nPearson correlation over the 16 left-permutive rules: ${(sxy / Math.sqrt(sxx * syy)).toFixed(4)}`);
const maxdiff = rows.reduce((a, r) => Math.max(a, Math.abs(r[1] - r[2])), 0);
console.log(`largest |visibility - rate| over the 16: ${maxdiff.toFixed(4)}`);
console.log('\nThe two cases that decide it:');
for (const rule of [180, 210]) {
  const [vis] = visibility(rule, n, trials, 0x12345 ^ rule);
  console.log(`  rule ${rule} (g = ${GNAME[rule]}): visibility ${vis.toFixed(4)}, measured rate ${RATE[rule].toFixed(4)}`);
}
