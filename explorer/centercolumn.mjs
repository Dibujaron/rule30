/**
 * Generate the Rule 30 center column and report the running density of 1s.
 *
 *   node explorer/centercolumn.mjs [N] [options]
 *
 * Options:
 *   --checkpoints=K   report at roughly K evenly spaced points as well as the
 *                     1-2-5 decade points (default 0, decades only)
 *   --no-trim         keep every cell instead of discarding those that can no
 *                     longer reach the center; slower, same answer
 *   --print=K         also print the first K terms as a digit string
 *   --out=FILE        write the whole column to FILE as one line of digits
 *   --quiet           only print the final line
 *
 * Prize question 2 asks whether each colour occurs with equal asymptotic
 * frequency in this column. A density that hovers near 0.5 is consistent with
 * that and proves nothing about it; the point of printing several checkpoints
 * is to make the drift visible rather than to hide it behind one final number.
 */

import { writeFileSync } from 'node:fs';
import { centerColumn } from './rule30.mjs';

const DEFAULT_GENERATIONS = 100_000;

const { generations, options } = parseArgs(process.argv.slice(2));
const checkpoints = buildCheckpoints(generations, options.checkpoints);

if (!options.quiet) {
  console.log(`Rule 30 center column, ${fmt(generations)} generations.`);
  console.log(`trim: ${options.trim ? 'on' : 'off'}`);
  console.log('');
  console.log(
    pad('n', 12) + pad('ones', 12) + pad('density', 12) + pad('density-0.5', 14) + 'elapsed',
  );
}

const collecting = options.out !== null || options.print > 0;
const collected = collecting ? new Uint8Array(generations) : null;

const started = process.hrtime.bigint();
let ones = 0;
let n = 0;
let nextCheckpoint = 0;

for (const bit of centerColumn(generations, { trim: options.trim })) {
  ones += bit;
  if (collected) collected[n] = bit;
  n++;

  if (n === checkpoints[nextCheckpoint]) {
    nextCheckpoint++;
    if (!options.quiet) report(n, ones);
  }
}

const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;

if (options.quiet) report(n, ones);

console.log('');
console.log(
  `${fmt(n)} generations in ${(elapsedMs / 1000).toFixed(2)}s ` +
    `(${fmt(Math.round(n / (elapsedMs / 1000)))} generations/s)`,
);
console.log(
  `density of 1s: ${(ones / n).toFixed(9)}  ` +
    `(${fmt(ones)} ones, ${fmt(n - ones)} zeros, excess ${signed(2 * ones - n)})`,
);
console.log('');
console.log(
  'This is empirical. It is consistent with the density tending to 1/2 and is',
);
console.log('not evidence that it does. Prize question 2 is open.');

if (options.print > 0) {
  const k = Math.min(options.print, n);
  console.log('');
  console.log(`first ${k} terms:`);
  console.log(digits(collected.subarray(0, k)));
}

if (options.out !== null) {
  writeFileSync(options.out, digits(collected) + '\n');
  console.log('');
  console.log(`wrote ${fmt(n)} digits to ${options.out}`);
}

// ---------------------------------------------------------------------------

function report(at, onesSoFar) {
  const density = onesSoFar / at;
  const seconds = Number(process.hrtime.bigint() - started) / 1e9;
  console.log(
    pad(fmt(at), 12) +
      pad(fmt(onesSoFar), 12) +
      pad(density.toFixed(6), 12) +
      pad(signedFixed(density - 0.5, 6), 14) +
      `${seconds.toFixed(2)}s`,
  );
}

/**
 * Checkpoint positions: 1, 2, 5, 10, 20, 50, ... up to N, plus N itself, plus
 * `extra` evenly spaced points if asked for. Decade spacing is the useful
 * default because drift in a density is a question about orders of magnitude.
 */
function buildCheckpoints(total, extra) {
  const set = new Set([total]);
  for (let scale = 1; scale <= total; scale *= 10) {
    for (const m of [1, 2, 5]) {
      const at = scale * m;
      if (at >= 1 && at <= total) set.add(at);
    }
  }
  for (let i = 1; i <= extra; i++) {
    set.add(Math.max(1, Math.round((total * i) / extra)));
  }
  return [...set].sort((a, b) => a - b);
}

function digits(bits) {
  // Chunked, because String.fromCharCode.apply on a million-element array
  // overflows the argument limit.
  let s = '';
  const CHUNK = 4096;
  for (let i = 0; i < bits.length; i += CHUNK) {
    const slice = bits.subarray(i, Math.min(i + CHUNK, bits.length));
    s += String.fromCharCode(...slice.map((b) => 48 + b));
  }
  return s;
}

function parseArgs(argv) {
  const options = {
    trim: true,
    checkpoints: 0,
    print: 0,
    out: null,
    quiet: false,
  };
  let generations = DEFAULT_GENERATIONS;
  let sawPositional = false;

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--no-trim') {
      options.trim = false;
    } else if (arg === '--quiet') {
      options.quiet = true;
    } else if (arg.startsWith('--checkpoints=')) {
      options.checkpoints = requireCount(arg);
    } else if (arg.startsWith('--print=')) {
      options.print = requireCount(arg);
    } else if (arg.startsWith('--out=')) {
      options.out = arg.slice('--out='.length);
    } else if (arg.startsWith('-')) {
      fail(`unknown option: ${arg}`);
    } else if (!sawPositional) {
      generations = Number(arg.replaceAll('_', ''));
      if (!Number.isInteger(generations) || generations < 1) {
        fail(`N must be a positive integer, got: ${arg}`);
      }
      sawPositional = true;
    } else {
      fail(`unexpected argument: ${arg}`);
    }
  }
  return { generations, options };
}

function requireCount(arg) {
  const value = Number(arg.slice(arg.indexOf('=') + 1).replaceAll('_', ''));
  if (!Number.isInteger(value) || value < 0) fail(`not a count: ${arg}`);
  return value;
}

function printHelp() {
  console.log(
    [
      'Usage: node explorer/centercolumn.mjs [N] [options]',
      '',
      `  N                 generations to compute (default ${DEFAULT_GENERATIONS})`,
      '  --checkpoints=K   K extra evenly spaced density reports',
      '  --no-trim         do not discard cells outside the light cone',
      '  --print=K         print the first K terms',
      '  --out=FILE        write the column to FILE as digits',
      '  --quiet           final line only',
    ].join('\n'),
  );
}

function fail(message) {
  console.error(`centercolumn: ${message}`);
  process.exit(2);
}

// Function declarations, not consts: the reporting code above runs at module
// top level, before a `const` down here would have been initialised.
function pad(s, width) {
  return String(s).padEnd(width);
}
function fmt(x) {
  return x.toLocaleString('en-US');
}
function signed(x) {
  return x >= 0 ? `+${fmt(x)}` : fmt(x);
}
function signedFixed(x, places) {
  return (x >= 0 ? '+' : '') + x.toFixed(places);
}
