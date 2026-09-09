/**
 * Follow-up to parallax2_expansive.mjs.
 *
 * That script found: at width 1 and height h = 0, every column word of length
 * d+1 occurs and EXACTLY HALF of them fail to determine the cell to the left,
 * at every depth d from 1 to 14. Two questions follow.
 *
 * (A) WHICH half? The conjecture is that a column word determines the cell to
 *     its left exactly when the anchor cell is BLACK -- because
 *     cell(0,t+1) = cell(-1,t) XOR (cell(0,t) OR cell(1,t)) and a black
 *     cell(0,t) makes the OR equal 1 whatever cell(1,t) is. If that is the
 *     whole story then EXTRA DEPTH BUYS NOTHING: the ambiguity at a white
 *     anchor is never resolved by looking further down the column.
 *
 * (B) Does HEIGHT help? Kopra's dimensions are (h, d, w): h rows above the
 *     anchor and d below. His hypothesis is s < 1/h with s the spreading
 *     speed, and rule 30 has s = 1, so only h = 0 is usable -- but knowing
 *     whether height would have helped separates two different barriers.
 *     Here the block is times [0, h+d] at position 0 and the cell to be
 *     determined is (-1, h).
 *
 * Exhaustive again, and for the same cone reason: cell(0,t) depends only on
 * cells [-t,t] of row 0, and cell(-1,h) depends only on cells [-1-h, -1+h].
 * A window of 2T+1 cells with T = h+d covers both.
 */

const T_MAX = 11;

function step(x, mask) {
  return ((x << 1) ^ (x | (x >>> 1))) & mask;
}

/** Column at position 0 for times 0..T, plus cell(-1,h), from window w. */
function trace(w, T, h, mask) {
  let x = w;
  let word = 0;
  let leftCell = 0;
  for (let t = 0; t <= T; t++) {
    word |= ((x >>> T) & 1) << t;
    if (t === h) leftCell = (x >>> (T - 1)) & 1;
    x = step(x, mask);
  }
  return [word, leftCell];
}

console.log('(A) which column words determine the cell to the left?  (h = 0)\n');
console.log('  d   words  determined  ambiguous   all determined words black at anchor?  all ambiguous white?');
for (let d = 1; d <= T_MAX; d++) {
  const T = d;
  const n = 2 * T + 1;
  const mask = (1 << n) - 1;
  const seen = new Uint8Array(2 ** (T + 1));
  for (let w = 0; w < 2 ** n; w++) {
    const [word, left] = trace(w, T, 0, mask);
    seen[word] |= 1 << left;
  }
  let det = 0;
  let amb = 0;
  let detAllBlack = true;
  let ambAllWhite = true;
  for (let word = 0; word < seen.length; word++) {
    if (seen[word] === 0) continue;
    const anchorBlack = (word & 1) === 1;
    if (seen[word] === 3) {
      amb++;
      if (anchorBlack) ambAllWhite = false;
    } else {
      det++;
      if (!anchorBlack) detAllBlack = false;
    }
  }
  console.log(
    `  ${String(d).padStart(2)}  ${String(det + amb).padStart(6)}  ${String(det).padStart(10)}  ${String(amb).padStart(9)}   ${String(detAllBlack).padStart(37)}  ${String(ambAllWhite).padStart(19)}`,
  );
}

console.log('\n(B) does looking UPWARD in time help?  block = times [0, h+d] at position 0,');
console.log('    cell to determine = (-1, h).  Fraction of realised words that determine it.\n');
console.log('   h \\ d      1        2        3        4        5        6');
for (let h = 0; h <= 5; h++) {
  let line = `   ${String(h).padStart(2)}    `;
  for (let d = 1; d <= 6; d++) {
    const T = h + d;
    const n = 2 * T + 1;
    const mask = (1 << n) - 1;
    const seen = new Uint8Array(2 ** (T + 1));
    for (let w = 0; w < 2 ** n; w++) {
      const [word, left] = trace(w, T, h, mask);
      seen[word] |= 1 << left;
    }
    let det = 0;
    let tot = 0;
    for (let word = 0; word < seen.length; word++) {
      if (seen[word] === 0) continue;
      tot++;
      if (seen[word] !== 3) det++;
    }
    line += (det / tot).toFixed(4).padStart(9);
  }
  console.log(line);
}
