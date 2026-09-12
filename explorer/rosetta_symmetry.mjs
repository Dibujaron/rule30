// Rosetta, 2026-09-12. Does rule 30 admit any value-flipping bijection of the
// kind that proves Champernowne / Thue-Morse balance?
//
// The mechanism behind every EXACT block-length-1 balance in the literature is
// a pairing: an involution of the index set that complements the value.
// Thue-Morse: t -> t XOR 1, since t_{2n} = 1 - t_{2n+1}. Champernowne base 2:
// within the block of all d-bit words, w -> ~w. Antiperiodicity (which this
// board proves for right diagonals at a doubling): j -> j + L/2.
//
// Three exhaustive checks:
// (1) the stabiliser of rule 30 in the standard ECA symmetry group
//     {id, mirror, complement, both} -- the only source of a picture-level
//     complementing involution;
// (2) the same for every rule, as a control that the test can say yes;
// (3) the centre column under the two index involutions Thue-Morse supplies,
//     t -> t + h and t -> t XOR m, over 2^20 terms.

const N = 1 << 20;

const table = (r) => Array.from({ length: 8 }, (_, i) => (r >> i) & 1);
const mirror = (r) => {
  const t = table(r);
  let out = 0;
  for (let i = 0; i < 8; i++) {
    const l = (i >> 2) & 1, c = (i >> 1) & 1, rr = i & 1;
    out |= t[4 * rr + 2 * c + l] << i;   // swap left and right neighbour
  }
  return out;
};
const complement = (r) => {
  const t = table(r);
  let out = 0;
  for (let i = 0; i < 8; i++) out |= (1 - t[7 - i]) << i;
  return out;
};

let groupOk = true;
for (let r = 0; r < 256; r++) {
  if (mirror(mirror(r)) !== r) groupOk = false;
  if (complement(complement(r)) !== r) groupOk = false;
  if (mirror(complement(r)) !== complement(mirror(r))) groupOk = false;
}
console.log('(1) group axioms hold for mirror/complement:', groupOk);
console.log('    mirror(30) =', mirror(30), '(board: rule 30 mirrors to 86)');
console.log('    mirror(90) =', mirror(90), '(board: rule 90 is amphichiral)');
console.log('    complement(30) =', complement(30), ' both(30) =', mirror(complement(30)));
const names = ['id', 'mirror', 'complement', 'mirror+complement'];
const imgs30 = [30, mirror(30), complement(30), mirror(complement(30))];
console.log('    orbit of 30:', [...new Set(imgs30)].sort((a, b) => a - b));
console.log('    stabiliser of 30:', imgs30.map((x, i) => [x, names[i]]).filter(([x]) => x === 30).map(([, n]) => n));

let nontrivial = [];
for (let r = 0; r < 256; r++) {
  if ([mirror(r), complement(r), mirror(complement(r))].some((x) => x === r)) nontrivial.push(r);
}
console.log('(2) rules with a nontrivial stabiliser:', nontrivial.length, 'of 256;',
  '90 in?', nontrivial.includes(90), '150 in?', nontrivial.includes(150), '30 in?', nontrivial.includes(30));

// ---- (3) the centre column ---------------------------------------------
function centreColumn(n, rule) {
  // packed row, bit x+t of row t is the cell at x. rule 30: l XOR (c OR r).
  const out = new Uint8Array(n);
  let r = 1n;
  for (let t = 0; t < n; t++) {
    out[t] = Number((r >> BigInt(t)) & 1n);
    if (rule === 30) r = (4n * r) ^ ((2n * r) | r);
    else if (rule === 90) r = (4n * r) ^ r;            // left XOR right
    else if (rule === 150) r = (4n * r) ^ (2n * r) ^ r; // left XOR centre XOR right
    r &= (1n << BigInt(2 * t + 4)) - 1n;
  }
  return out;
}
const c = centreColumn(N, 30);
console.log('(3) centre column first 24:', [...c.slice(0, 24)].join(''));
let b = 0; for (let t = 0; t < N; t++) b += c[t];
console.log('    N =', N, 'black =', b, 'excess 2b-N =', 2 * b - N,
  '=', ((2 * b - N) / Math.sqrt(N)).toFixed(4), 'sqrt(N)');

// crystal 66's filter, computed for P2 rather than P1
for (const rule of [90, 150]) {
  const d = centreColumn(1 << 16, rule);
  let k = 0; for (let t = 0; t < d.length; t++) k += d[t];
  console.log('    rule', rule, 'centre column density over 2^16:', (k / d.length).toFixed(6),
    'first 12:', [...d.slice(0, 12)].join(''));
}

console.log('\n-- pairing test A: t -> t + h (does any shift complement?) --');
let best = { h: 0, rate: 0.5 };
for (let h = 1; h <= 1024; h++) {
  let flips = 0;
  for (let t = 0; t + h < N; t++) flips += c[t] ^ c[t + h];
  const rate = flips / (N - h);
  if (Math.abs(rate - 0.5) > Math.abs(best.rate - 0.5)) best = { h, rate };
}
console.log('    most extreme h <= 1024:', best.h, 'flip rate', best.rate.toFixed(6),
  '(a complementing involution needs 1.000000)');

console.log('-- pairing test B: t -> t XOR m (the Thue-Morse mechanism) --');
let bestX = { m: 0, rate: 0.5 };
for (let m = 1; m < 512; m++) {
  let flips = 0;
  for (let t = 0; t < N; t++) flips += c[t] ^ c[t ^ m];
  const rate = flips / N;
  if (Math.abs(rate - 0.5) > Math.abs(bestX.rate - 0.5)) bestX = { m, rate };
}
console.log('    most extreme m < 512:', bestX.m, 'flip rate', bestX.rate.toFixed(6),
  '(Thue-Morse at m = 1 gives 1.000000)');

// the control: run the same test on Thue-Morse, so the test is known to fire
const tm = new Uint8Array(N);
for (let t = 1; t < N; t++) tm[t] = tm[t >> 1] ^ (t & 1);
let f = 0; for (let t = 0; t < N; t++) f += tm[t] ^ tm[t ^ 1];
console.log('    CONTROL Thue-Morse, m = 1: flip rate', (f / N).toFixed(6));
let tb = 0; for (let t = 0; t < N; t++) tb += tm[t];
console.log('    CONTROL Thue-Morse excess 2b-N over 2^20:', 2 * tb - N);
