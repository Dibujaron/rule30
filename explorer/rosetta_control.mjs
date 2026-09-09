/**
 * Controls for the optimistic front's speed: is 0.50106 above 1/2 real?
 *
 *   node explorer/rosetta_control.mjs
 *
 * rosetta_greedy2.mjs measures the never-retreating comparison front G on the
 * settled background over 2 * 10^8 rows and gets speed 0.50106, above the 1/2
 * that the onset wall needs, with every one of twenty 10^7-step blocks above
 * 1/2. The settled words have mean black density exactly 0.5000
 * (rosetta_runs.mjs), so under any model where the cells G reads are fair
 * independent coins the speed would be 1/2 exactly. This script runs the same
 * walk, with the same code path, on three backgrounds:
 *
 *   A. pseudo-random bits of density 1/2 (a hash of the cell's coordinates) --
 *      the estimator's null: it must return 0.5 to within its own error bar;
 *   B. the true settled words with each diagonal's word given a pseudo-random
 *      phase -- kills the alignment between neighbouring diagonals but keeps
 *      every word and every white run;
 *   C. the true settled words with each word replaced by a pseudo-random word
 *      of the same period -- keeps the period profile and nothing else.
 *
 * If A returns 1/2 and B, C return 1/2 while the real background returns
 * 0.50106, the excess is a property of the settled words and not of the walk.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { F as solveF, at, isWhite } from './settledwords.mjs';

const KAPPA0 = 87868;
const STEPS = 40000000;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

/** splitmix-style 32-bit hash, so every background is reproducible. */
function hash(a, b) {
  let h = (a * 0x9e3779b1) ^ (b * 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 16), 0x2545f491);
  h = Math.imul(h ^ (h >>> 13), 0x27d4eb2f);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Lazy settled words S_k for non-decreasing k. */
function makeWords() {
  let kB = 1, A = { p: 1, onset: 0, word: Uint8Array.of(1) }, B = { p: 1, onset: 0, word: Uint8Array.of(1) };
  return (k) => {
    while (kB < k) {
      const sols = solveF(A, B);
      let S;
      if (sols.length === 1) S = sols[0];
      else { if (!BRANCH.has(kB + 1)) throw new Error(`unexpected branch at k = ${kB + 1}`); S = sols[BRANCH.get(kB + 1)]; }
      if (isWhite(S) && kB + 1 >= KAPPA0) throw new Error(`white diagonal at k = ${kB + 1} -- the walk would escape`);
      A = B; B = S; kB++;
    }
    return B;
  };
}

/** The walk: advance while the background cell (k = kappa - 1, index 1 - x) is white. */
function walk(label, cell) {
  const t0 = Date.now();
  let t = Math.round(KAPPA0 / 0.75), x = KAPPA0 - t;
  let advances = 0;
  for (let n = 0; n < STEPS; n++) {
    if (cell(t + x - 1, 1 - x) === 0) { x -= 1; advances++; }
    t++;
  }
  const speed = advances / STEPS;
  const err = 0.5 / Math.sqrt(STEPS);
  console.log(`${label}: speed ${speed.toFixed(5)}; excess over 1/2 = ${((speed - 0.5) / err).toFixed(1)} sigma (sigma = ${err.toFixed(5)}) (${Date.now() - t0} ms)`);
  return speed;
}

const wordsA = makeWords();
walk('real settled background                ', (k, j) => at(wordsA(k), j));

walk('A. pseudo-random bits, density 1/2     ', (k, j) => hash(k, j) & 1);

const wordsB = makeWords();
walk('B. real words, pseudo-random phases    ', (k, j) => { const S = wordsB(k); return at(S, j + hash(k, 7)); });

const wordsC = makeWords();
walk('C. random words of the same periods    ', (k, j) => { const S = wordsC(k); return hash(k, ((j % S.p) + S.p) % S.p) & 1; });
