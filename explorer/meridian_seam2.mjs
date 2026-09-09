/**
 * Meridian B2 — how much of the seed's picture does the wall configuration
 * E = 0^inf | (10)^inf reproduce?
 *
 * Meridian B showed E has the seed's centre column to depth 60,000. The shield
 * lemma preserves the whole picture left of the right edge, so the limit should
 * reproduce the seed's picture on the whole cone |x| <= t, with the (10)
 * background outside it. That is the difference between "shares one column"
 * and "is the same picture", and it is what makes the wall presentation exact.
 *
 * Nothing here proves anything.
 */

const T = 3000;
const W = 4 * T + 40;
const origin = 2 * T + 20;

const stepA = (c) => {
  const n = c.length;
  const o = new Uint8Array(n);
  for (let i = 1; i < n - 1; i++) o[i] = c[i - 1] ^ (c[i] | c[i + 1]);
  return o;
};

let seed = new Uint8Array(W);
seed[origin] = 1;

let wall = new Uint8Array(W);
for (let x = 0; origin + x < W; x += 2) wall[origin + x] = 1;

const bg = new Uint8Array(W);
for (let i = 0; i < W; i++) bg[i] = ((i - origin) % 2 === 0 ? 1 : 0);

const offsetHist = new Map();
let coneCells = 0;
let coneBad = 0;
let outsideCells = 0;
let outsideBad = 0;
let firstBadT = -1;
let firstBadX = 0;

for (let t = 0; t <= T; t++) {
  for (let x = -t; x <= t; x++) {
    coneCells++;
    if (seed[origin + x] !== wall[origin + x]) {
      coneBad++;
      offsetHist.set(x - t, (offsetHist.get(x - t) ?? 0) + 1);
      if (firstBadT < 0) { firstBadT = t; firstBadX = x; }
    }
  }
  // outside the cone on the right: does the wall picture equal the background?
  for (let x = t + 1; x <= t + 40 && origin + x < W - 4; x++) {
    outsideCells++;
    if (wall[origin + x] !== bg[origin + x]) outsideBad++;
  }
  seed = stepA(seed);
  wall = stepA(wall);
}

console.log(`cone |x| <= t : cells ${coneCells}, seed-vs-wall mismatches ${coneBad}` +
  (firstBadT >= 0 ? ` (first at t=${firstBadT}, x=${firstBadX})` : ''));
console.log('mismatch positions as x - t:',
  JSON.stringify([...offsetHist.entries()].sort((a, b) => a[0] - b[0])));
console.log(`right of the cone (t < x <= t+40): cells ${outsideCells}, ` +
  `wall-vs-(10)-background mismatches ${outsideBad}`);
