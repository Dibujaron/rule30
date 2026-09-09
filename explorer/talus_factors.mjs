// Talus, 2026-09-08. A hard lower bound on any eventual period.
//
// Scanning lags only rules out periods up to the largest lag scanned. Factor
// counting does better: a sequence that is eventually periodic with period q
// has at most q distinct factors of each length in its tail (crystal 21, the
// Morse-Hedlund reformulation). So counting the distinct length-n windows in a
// tail of length L bounds *every* eventual period from below at once, with no
// cap, and the bound is only limited by L.
//
// Reported for column 1 and column -1 of X_b at several boundaries b, with the
// seed's own centre column and a fair coin as controls.

const T = 1000000;
const TAILFROM = 500000;

function halfline(b, T) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W);
  let s = new Uint32Array(W);
  const col = new Uint8Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    col[t] = (r[0] >>> 1) & 1;
    const last = Math.min(W - 2, (t >> 5) + 1);
    for (let i = 0; i <= last; i++) {
      const cur = r[i];
      const up = (cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0);
      const down = (cur >>> 1) | (r[i + 1] << 31);
      s[i] = up ^ (cur | down);
    }
    s[last + 1] = 0;
    s[0] = (s[0] & ~1) | (b[(t + 1) % p] & 1);
    const tmp = r; r = s; s = tmp;
  }
  return col;
}

function seedCentre(T) {
  const c = new Uint8Array(T);
  const W = ((2 * T + 96) >> 5) + 2;
  let r = new Uint32Array(W), s = new Uint32Array(W);
  r[0] = 1;
  for (let t = 0; t < T; t++) {
    c[t] = (r[t >> 5] >>> (t & 31)) & 1;
    const last = Math.min(W - 2, (2 * t >> 5) + 1);
    for (let i = last; i >= 0; i--) {
      const cur = r[i];
      const d1 = (cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0);
      const d2 = (cur << 2) | (i > 0 ? r[i - 1] >>> 30 : 0);
      s[i] = d2 ^ (d1 | cur);
    }
    s[last + 1] = 0;
    const tmp = r; r = s; s = tmp;
  }
  return c;
}

// distinct factors of length n in col[from..to), n <= 32
function factorCount(col, from, to, n) {
  const seen = new Set();
  let w = 0;
  for (let t = from; t < from + n - 1; t++) w = ((w << 1) | col[t]) >>> 0;
  const mask = n === 32 ? 0xffffffff : ((1 << n) - 1) >>> 0;
  for (let t = from + n - 1; t < to; t++) {
    w = (((w << 1) | col[t]) & mask) >>> 0;
    seen.add(w);
  }
  return seen.size;
}

// NOTE (Talus, same day): the first version of this script called factorCount
// with `to = T` for every sequence, including column -1, whose array has length
// T - 1. The final window then read one element past the end, which JavaScript
// hands back as `undefined` and `|` turns into 0 -- one spurious factor at every
// length. It made an exactly 8-periodic column -1 report NINE distinct factors
// of length 8, and I spent a run hunting a defect that was mine. Every count
// below is with `to` taken from the array itself.
const tail = T - TAILFROM;
console.log(`tail of length ${tail} starting at index ${TAILFROM}`);
console.log('any eventual period with onset <= that index is at least the factor count');
console.log('');
console.log('sequence                       n=8   n=12   n=16   n=24    n=32');
function line(name, col) {
  const c = [8, 12, 16, 24, 32].map((n) => String(factorCount(col, TAILFROM, col.length, n)).padStart(6));
  console.log(`${name.padEnd(30)}${c.join(' ')}`);
}

for (const s of ['10', '110', '100000', '11100110', '11111110']) {
  const b = s.split('').map(Number);
  const c1 = halfline(b, T);
  line(`X_{${s}} column 1`, c1);
  const cm = new Uint8Array(T - 1);
  const p = b.length;
  for (let t = 0; t + 1 < T; t++) cm[t] = b[(t + 1) % p] ^ (b[t % p] | c1[t]);
  line(`X_{${s}} column -1`, cm);
}
line('the seed centre column', seedCentre(T));
const coin = new Uint8Array(T);
let x = 987654321;
for (let t = 0; t < T; t++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; coin[t] = x & 1; }
line('a fair coin', coin);
console.log('');
console.log(`(the maximum possible at any n is the tail length ${tail}; at n=24 it is also`);
console.log(` capped by 2^24 = ${2 ** 24}, and at n=8, 12, 16 by 256, 4096, 65536)`);
