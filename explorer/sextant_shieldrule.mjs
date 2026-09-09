/**
 * The exact criterion for the right-edge shield.
 *
 * `sextant_shieldclass.mjs` found that adding a black cell one place past the
 * rightmost black cell of a finite configuration leaves the centre column
 * unchanged in exactly half of all configurations. The candidate criterion,
 * read off the induction in `sextant_scratch_shield.lean`, is that the
 * rightmost black cell be ISOLATED: white at r - 1. That is what makes the
 * invariant's base case `B_0 r = !X (r-1)` hold.
 *
 * This checks the criterion exhaustively, and also whether the class of finite
 * configurations sharing one centre column is infinite.
 *
 * Nothing here is a proof. See explorer/README.md.
 *
 *   node explorer/sextant_shieldrule.mjs
 */

const DEPTH = 1200;
const PAD = DEPTH + 8;
const PADB = BigInt(PAD);
const step = (x) => (x << 1n) ^ (x | (x >> 1n));
const cfg = (ps) => ps.reduce((s, p) => s | (1n << BigInt(PAD + p)), 0n);

function firstColumnDiff(a, b, depth) {
  for (let t = 0; t < depth; t++) {
    if (((a >> PADB) & 1n) !== ((b >> PADB) & 1n)) return t;
    a = step(a); b = step(b);
  }
  return -1;
}

/** first row where the two pictures differ at a position <= r + t - 1. */
function firstLeftDiff(a, b, r, depth) {
  for (let t = 0; t < depth; t++) {
    const cut = BigInt(PAD + r + t);            // positions < r + t
    if (((a ^ b) & ((1n << cut) - 1n)) !== 0n) return t;
    a = step(a); b = step(b);
  }
  return -1;
}

console.log(`criterion: rightmost black cell at r is isolated (cell r-1 white), depth ${DEPTH}`);
for (const delta of [1, 2, 3]) {
  const table = { 'isolated,ok': 0, 'isolated,fail': 0, 'adjacent,ok': 0, 'adjacent,fail': 0 };
  let leftBad = 0, exFail = null;
  for (let m = 0; m < (1 << 14); m++) {
    const cells = [0];
    for (let b = 0; b < 14; b++) if ((m >> b) & 1) cells.push(b + 1);
    const r = Math.max(...cells);
    const isolated = !cells.includes(r - 1);
    const A = cfg(cells), B = cfg([...cells, r + delta]);
    const t = firstColumnDiff(A, B, DEPTH);
    table[`${isolated ? 'isolated' : 'adjacent'},${t < 0 ? 'ok' : 'fail'}`]++;
    if (t >= 0 && isolated && !exFail) exFail = { cells, t };
    if (isolated && firstLeftDiff(A, B, r, 200) >= 0) leftBad++;
  }
  console.log(
    `  +${delta}: isolated -> column unchanged ${table['isolated,ok']}, changed ${table['isolated,fail']}` +
    `; adjacent -> unchanged ${table['adjacent,ok']}, changed ${table['adjacent,fail']}` +
    (exFail ? `; isolated counterexample {${exFail.cells.join(',')}} at row ${exFail.t}` : '') +
    `; isolated configurations whose pictures differ anywhere left of r + t: ${leftBad}`,
  );
}

// Is the class of one centre column infinite? Extend the seed's chain
// {0}, {0,2}, {0,2,4}, ... as far as the depth allows.
console.log('\nthe seed\'s chain {0, 2, 4, ..., 2k} and {0, 2, ..., 2k, 2k+1}:');
{
  let bad = 0;
  const seed = cfg([0]);
  for (let k = 1; k <= 200; k++) {
    const evens = [0];
    for (let i = 1; i <= k; i++) evens.push(2 * i);
    if (firstColumnDiff(seed, cfg(evens), DEPTH) >= 0) bad++;
    if (firstColumnDiff(seed, cfg([...evens, 2 * k + 1]), DEPTH) >= 0) bad++;
  }
  console.log(`  400 configurations, k <= 200, centre column differs from the seed's in ${bad} of them (depth ${DEPTH})`);
}
