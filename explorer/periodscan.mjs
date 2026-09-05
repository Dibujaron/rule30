/**
 * Search the Rule 30 center column for eventual periodicity.
 *
 *   node explorer/periodscan.mjs [N] [options]
 *
 * Options:
 *   --max-period=P    largest period to test (default floor(N/2))
 *   --top=K           show the K best candidates (default 10)
 *   --no-trim         keep every cell in the engine; slower, same answer
 *
 * ## What this can and cannot conclude
 *
 * Prize question 1 asks whether the center column is *eventually* periodic:
 * whether there exist a period p > 0 and an onset N0 such that s[i] = s[i-p]
 * for every i >= N0 + p.
 *
 * A search can only ever settle that question one way. If it finds a p that
 * holds for the whole computed tail, that is a candidate — still not a proof,
 * since the pattern could break at term N+1 — but it would be extraordinary and
 * worth investigating. If it finds nothing, that is **not evidence of
 * aperiodicity**. It rules out exactly the periods tested, and only for onsets
 * no later than the bound reported below. Every period above P is untouched,
 * and there are infinitely many of those.
 *
 * There is also no pigeonhole argument waiting in the wings. The configuration
 * is an infinite row that grows by two cells per step, so there is no finite
 * state space to exhaust and therefore no N beyond which a null result would
 * become conclusive. Computation cannot settle this question. It can only fail
 * to refute it, one period at a time.
 */

import { centerColumnBits } from './rule30.mjs';

const DEFAULT_GENERATIONS = 200_000;

/**
 * For every period p from 1 to `maxPeriod`, find how long a tail of `s` is
 * consistent with that period.
 *
 * For a fixed p, walk backwards from the last term while s[i] === s[i-p]. The
 * index where that first fails is the LAST place the sequence disagrees with
 * itself at lag p. Call it m.
 *
 *   - If the walk runs off the front, the whole of `s` is p-periodic.
 *   - Otherwise s[i] = s[i-p] holds for every i in (m, N), and fails at m. Any
 *     eventual period p must therefore have onset N0 with N0 + p > m, i.e.
 *     N0 >= m - p + 1. That is the tightest lower bound on the onset this data
 *     supports.
 *
 * The backwards walk stops almost immediately on a sequence that does not
 * repeat itself, so the whole scan costs about O(P) rather than O(N*P).
 *
 * @param {Uint8Array} s
 * @param {number} maxPeriod
 * @returns {{tails: Int32Array, periodic: number[], comparisons: number}}
 *   `tails[p]` is the number of trailing indices i with s[i] === s[i-p];
 *   `periodic` lists any p for which the whole of `s` repeats.
 */
export function scanPeriods(s, maxPeriod) {
  const n = s.length;
  const tails = new Int32Array(maxPeriod + 1);
  const periodic = [];
  let comparisons = 0;

  for (let p = 1; p <= maxPeriod; p++) {
    let i = n - 1;
    while (i - p >= 0 && s[i] === s[i - p]) i--;
    comparisons += n - i;
    if (i - p < 0) {
      periodic.push(p);
      tails[p] = n - p;
    } else {
      tails[p] = n - 1 - i;
    }
  }
  return { tails, periodic, comparisons };
}

/**
 * The earliest index at which an eventual period `p` could still begin, given
 * that its agreeing tail is `tail` terms long in a sequence of `n` terms.
 *
 * @param {number} n
 * @param {number} p
 * @param {number} tail
 * @returns {number}
 */
export function earliestOnset(n, p, tail) {
  return Math.max(0, n - tail - p);
}

if (import.meta.main) main();

// ---------------------------------------------------------------------------

function main() {
  const { generations, options } = parseArgs(process.argv.slice(2));

  // A period of p can only be observed at all if the sequence contains two
  // consecutive stretches of length p, so p > N/2 is untestable no matter what
  // the data says.
  const maxTestable = Math.floor(generations / 2);
  const maxPeriod = Math.min(options.maxPeriod ?? maxTestable, maxTestable);

  console.log('Rule 30 center column: eventual-periodicity scan.');
  console.log('');

  let t = process.hrtime.bigint();
  const s = centerColumnBits(generations, { trim: options.trim });
  const generateMs = Number(process.hrtime.bigint() - t) / 1e6;

  t = process.hrtime.bigint();
  const { tails, periodic, comparisons } = scanPeriods(s, maxPeriod);
  const scanMs = Number(process.hrtime.bigint() - t) / 1e6;

  const n = s.length;
  const isPeriodic = new Set(periodic);

  console.log(`terms computed          ${fmt(n)}`);
  console.log(`periods tested          1 .. ${fmt(maxPeriod)}`);
  if (options.maxPeriod !== null && options.maxPeriod > maxTestable) {
    console.log(
      `                        (asked for ${fmt(options.maxPeriod)}; capped at ` +
        `floor(N/2), above which no period can repeat even once)`,
    );
  }
  console.log(`generate                ${(generateMs / 1000).toFixed(2)}s`);
  console.log(
    `scan                    ${(scanMs / 1000).toFixed(2)}s ` +
      `(${fmt(comparisons)} comparisons)`,
  );
  console.log('');

  // Rank by how many full repetitions the agreeing tail represents. A tail of
  // 40 terms means little at p = 20 and a great deal at p = 2.
  const ranked = [];
  for (let p = 1; p <= maxPeriod; p++) ranked.push(p);
  ranked.sort((a, b) => tails[b] / b - tails[a] / a || tails[b] - tails[a]);
  const top = ranked.slice(0, options.top);

  console.log(`best candidates, ranked by repeats (top ${top.length}):`);
  console.log('');
  console.log(
    '  "repeats" is tail length / p — how many times the candidate period was',
  );
  console.log(
    '  seen to repeat. A genuine period would show a number far above 1. Values',
  );
  console.log('  below 1 mean the period never completed even once.');
  console.log('');
  console.log(
    col('period p', 12) +
      col('tail length', 14) +
      col('repeats', 10) +
      col('last mismatch at', 18) +
      'earliest possible onset',
  );
  for (const p of top) {
    const tail = tails[p];
    console.log(
      col(fmt(p), 12) +
        col(fmt(tail), 14) +
        col((tail / p).toFixed(2), 10) +
        col(isPeriodic.has(p) ? 'none' : fmt(n - 1 - tail), 18) +
        (isPeriodic.has(p)
          ? '0 (periodic throughout)'
          : `>= ${fmt(earliestOnset(n, p, tail))}`),
    );
  }
  console.log('');

  // How surprising is the longest agreement? For an unbiased coin the agreeing
  // tail at lag p has P(tail >= k) = 2^-k, so across P lags the longest is
  // about log2(P). A sanity baseline, not a model of Rule 30.
  let longest = 0;
  let longestAt = 1;
  for (let p = 1; p <= maxPeriod; p++) {
    if (tails[p] > longest) {
      longest = tails[p];
      longestAt = p;
    }
  }
  console.log(
    `longest agreeing tail   ${fmt(longest)} terms, at p = ${fmt(longestAt)} ` +
      `(a fair coin over ${fmt(maxPeriod)} lags would give about ` +
      `${Math.log2(maxPeriod).toFixed(1)})`,
  );
  console.log('');

  if (periodic.length > 0) {
    console.log('RESULT: CANDIDATE FOUND — check this by hand before believing it.');
    console.log(
      `All ${fmt(n)} computed terms repeat at period(s) ` +
        periodic.slice(0, 20).map(fmt).join(', ') +
        (periodic.length > 20 ? ', ...' : ''),
    );
    console.log(
      'Rerun with a larger N. A real period survives that; an artefact does not.',
    );
    console.log('Even if it survives, a finite prefix is not a proof.');
    return;
  }

  // Below the smallest onset bound, no tested period can have started.
  let weakestOnset = Infinity;
  for (let p = 1; p <= maxPeriod; p++) {
    const onset = earliestOnset(n, p, tails[p]);
    if (onset < weakestOnset) weakestOnset = onset;
  }

  console.log(`RESULT: no period p in 1..${fmt(maxPeriod)} survives ${fmt(n)} terms.`);
  console.log('');
  console.log('Precisely what that means:');
  console.log(
    `  - For every p from 1 to ${fmt(maxPeriod)} there is an index m with ` +
      's[m] != s[m-p].',
  );
  console.log(
    `  - So no period in that range can have set in before index ` +
      `${fmt(weakestOnset)}; the data forces a later onset for every one of them.`,
  );
  console.log('');
  console.log('What that does NOT mean:');
  console.log('  - It is not evidence that the center column is aperiodic.');
  console.log(
    `  - Periods above ${fmt(maxPeriod)} are entirely untested, and there are ` +
      'infinitely many of them.',
  );
  console.log(
    '  - No N makes a null result conclusive. The row grows by two cells per',
  );
  console.log(
    '    step, so there is no finite state space to exhaust and no pigeonhole',
  );
  console.log('    argument to reach for. Prize question 1 is open.');
}

// ---------------------------------------------------------------------------

function col(s, width) {
  return String(s).padEnd(width);
}

function fmt(x) {
  return x.toLocaleString('en-US');
}

function parseArgs(argv) {
  const options = { maxPeriod: null, top: 10, trim: true };
  let generations = DEFAULT_GENERATIONS;
  let sawPositional = false;

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      console.log(
        [
          'Usage: node explorer/periodscan.mjs [N] [options]',
          '',
          `  N                 terms of the center column (default ${DEFAULT_GENERATIONS})`,
          '  --max-period=P    largest period to test (default floor(N/2))',
          '  --top=K           show the K best candidates (default 10)',
          '  --no-trim         do not discard cells outside the light cone',
        ].join('\n'),
      );
      process.exit(0);
    } else if (arg === '--no-trim') {
      options.trim = false;
    } else if (arg.startsWith('--max-period=')) {
      options.maxPeriod = count(arg, 1);
    } else if (arg.startsWith('--top=')) {
      options.top = count(arg, 1);
    } else if (arg.startsWith('-')) {
      fail(`unknown option: ${arg}`);
    } else if (!sawPositional) {
      generations = Number(arg.replaceAll('_', ''));
      if (!Number.isInteger(generations) || generations < 4) {
        fail(`N must be an integer of at least 4, got: ${arg}`);
      }
      sawPositional = true;
    } else {
      fail(`unexpected argument: ${arg}`);
    }
  }
  return { generations, options };
}

function count(arg, min) {
  const value = Number(arg.slice(arg.indexOf('=') + 1).replaceAll('_', ''));
  if (!Number.isInteger(value) || value < min) fail(`not a count >= ${min}: ${arg}`);
  return value;
}

function fail(message) {
  console.error(`periodscan: ${message}`);
  process.exit(2);
}
