// Talus, 2026-09-08. Why goodness looked rotation-invariant.
//
// The classification data has the good boundaries arriving in whole rotation
// classes, with onsets that step by exactly one as the word is rotated (100,
// 010, 001 at onsets 297, 298, 299; the eight rotations of 1010000000 at
// 464..471). There is a reason for one direction of that, and it is provable.
//
// If b(0) = false then row 1 of X_b's picture is white at every x >= 1 (its
// cell at x = 1 is xor(b(0), white || white) = b(0) = false), and its centre
// column is b shifted by one. By crystal 40's uniqueness -- column 0 plus the
// right half pin the configuration -- that row IS X_{sigma b}. So the picture of
// X_{sigma b} is the picture of X_b read from row 1 on, and goodness, onsets
// minus one, and every column's periodicity carry over.
//
// When b(0) = true the same row has a black cell at x = 1 and the relation
// fails, so the argument covers only part of each rotation class. The data
// nonetheless shows whole classes agreeing, which is not explained.
//
// This script checks the relation, and checks whether the unexplained half
// holds too.

const T = 4000;

function pic(b, T, W) {
  const p = b.length;
  const words = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(words);
  let s = new Uint32Array(words);
  const rows = [];
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    const line = new Uint8Array(W);
    for (let x = 0; x < W; x++) line[x] = (r[x >> 5] >>> (x & 31)) & 1;
    rows.push(line);
    const last = Math.min(words - 2, (t >> 5) + 1);
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
  return rows;
}

function rot(b) { return b.slice(1).concat(b.slice(0, 1)); }

console.log('claim: if b starts white, the picture of X_{sigma b} is the picture');
console.log('of X_b from row 1 on. Checked on 60 positions and 3900 rows.');
console.log('');
console.log('b            b(0)   mismatches between X_{sigma b} row t and X_b row t+1');
for (const s of ['0100', '0010', '0001', '1000', '0110', '01110011', '11100110', '0101000000', '1010000000', '01', '10']) {
  const b = s.split('').map(Number);
  const A = pic(rot(b), T, 60);
  const B = pic(b, T, 60);
  let bad = 0;
  for (let t = 0; t < T - 1; t++) for (let x = 0; x < 60; x++) if (A[t][x] !== B[t + 1][x]) bad++;
  console.log(`${s.padEnd(12)} ${b[0]}      ${bad}`);
}
