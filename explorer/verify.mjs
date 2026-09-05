/**
 * Self-check for the Rule 30 engine.
 *
 * Exits 0 and prints what passed, or exits 1 on the first failure.
 *
 *   node explorer/verify.mjs
 *
 * What this establishes: that the fast BigInt engine computes the same
 * automaton as an independent per-cell implementation derived from the rule
 * number, and that both reproduce the published center column. What it does
 * not establish: anything at all about the prize questions.
 */

import {
  A051023_PREFIX,
  RULE_30,
  centerBitIndex,
  centerColumn,
  centerColumnBits,
  naiveCenterColumn,
  naiveRows,
  ruleTable,
  rows,
} from './rule30.mjs';
import { earliestOnset, scanPeriods } from './periodscan.mjs';

const checks = [];
let failed = 0;

function check(name, fn) {
  try {
    const detail = fn();
    checks.push({ name, ok: true, detail });
  } catch (error) {
    checks.push({ name, ok: false, detail: error.message });
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ---------------------------------------------------------------------------

const GENERATIONS = 600; // the brief asks for at least 500

check('rule 30 is the table 0,1,1,1,1,0,0,0', () => {
  const table = ruleTable(RULE_30);
  const expected = [0, 1, 1, 1, 1, 0, 0, 0];
  assert(
    table.length === expected.length && expected.every((v, i) => table[i] === v),
    `got [${[...table].join(',')}]`,
  );
  return 'index = 4*left + 2*center + 1*right, output = bit index of 30';
});

check('the rule table agrees with left XOR (center OR right)', () => {
  const table = ruleTable(RULE_30);
  for (let index = 0; index < 8; index++) {
    const left = (index >> 2) & 1;
    const center = (index >> 1) & 1;
    const right = index & 1;
    const closedForm = left ^ (center | right);
    assert(
      table[index] === closedForm,
      `neighbourhood ${index.toString(2).padStart(3, '0')}: ` +
        `table says ${table[index]}, closed form says ${closedForm}`,
    );
  }
  return 'all 8 neighbourhoods';
});

check(`first ${A051023_PREFIX.length} center terms equal the A051023 prefix`, () => {
  const got = [...centerColumn(A051023_PREFIX.length)];
  for (let i = 0; i < A051023_PREFIX.length; i++) {
    assert(
      got[i] === A051023_PREFIX[i],
      `term ${i}: engine says ${got[i]}, A051023 says ${A051023_PREFIX[i]}`,
    );
  }
  return got.join('');
});

check(`BigInt engine matches the naive engine over ${GENERATIONS} generations`, () => {
  const fast = centerColumnBits(GENERATIONS);
  const slow = naiveCenterColumn(RULE_30, GENERATIONS);
  assert(fast.length === slow.length, 'length mismatch');
  for (let i = 0; i < GENERATIONS; i++) {
    assert(fast[i] === slow[i], `generation ${i}: fast ${fast[i]}, naive ${slow[i]}`);
  }
  return `${GENERATIONS} center terms identical`;
});

check(`whole rows match the naive engine over ${GENERATIONS} generations`, () => {
  // Stronger than the center column alone: every cell of every row.
  const fast = rows(GENERATIONS);
  const slow = naiveRows(RULE_30, GENERATIONS);
  let g = 0;
  for (const slowRow of slow) {
    const { value: fastRow, done } = fast.next();
    assert(!done, `fast engine ran out at generation ${g}`);
    assert(
      fastRow === slowRow,
      `generation ${g}: rows differ (xor = ${(fastRow ^ slowRow).toString(2)})`,
    );
    g++;
  }
  return `${g} rows identical, cell for cell`;
});

check('light-cone trimming does not change the answer', () => {
  // Long enough that the light-cone mask is actually rebuilt several times:
  // trimming only starts once the cone is narrower than the pattern, i.e. past
  // the halfway mark, and rebuilds every 4096 generations after that.
  const n = 30000;
  const trimmed = centerColumnBits(n, { trim: true });
  const untrimmed = centerColumnBits(n, { trim: false });
  for (let i = 0; i < n; i++) {
    assert(
      trimmed[i] === untrimmed[i],
      `generation ${i}: trimmed ${trimmed[i]}, untrimmed ${untrimmed[i]}`,
    );
  }
  return `${n} generations, trimmed and untrimmed agree`;
});

check('the naive engine reproduces rule 90 as Pascal mod 2', () => {
  // Rule 90 is `left XOR right`, which from a lone cell draws Pascal's triangle
  // mod 2. The cell d places from the center at generation g is C(g, k) mod 2
  // with k = (g + d) / 2, and by Lucas' theorem C(g, k) is odd exactly when
  // k's binary digits are a subset of g's — `(g & k) === k`.
  //
  // Nothing about that shares any reasoning with rule 30, so it is a real test
  // of the "rule number decoded as a lookup table" step.
  const n = 40;
  const center = centerBitIndex(n);
  let g = 0;
  for (const row of naiveRows(90, n)) {
    for (let d = -g; d <= g; d++) {
      const expected =
        (g + d) % 2 !== 0 ? 0 : ((g & ((g + d) / 2)) === (g + d) / 2 ? 1 : 0);
      const got = Number((row >> BigInt(center + d)) & 1n);
      assert(got === expected, `rule 90 gen ${g} offset ${d}: ${got} != ${expected}`);
    }
    g++;
  }
  return `${n} rows of rule 90 match binomial coefficients mod 2`;
});

check('the naive engine reproduces rule 254', () => {
  // Rule 254 turns a cell black if any of its three neighbours is black, so
  // from a lone cell it simply fills the light cone. The center is black at
  // every generation.
  const n = 64;
  const r254 = naiveCenterColumn(254, n);
  for (let i = 0; i < n; i++) {
    assert(r254[i] === 1, `rule 254 generation ${i}: ${r254[i]}`);
  }
  return 'center column is constant 1';
});

check('the period scan finds periods that are really there', () => {
  // A positive control. The failure mode that matters for periodscan.mjs is a
  // scanner that reports "nothing found" no matter what it is given, which
  // would look exactly like a correct null result on Rule 30. So feed it
  // sequences whose periods are known.

  // Purely periodic, period 5.
  const pure = Uint8Array.from({ length: 500 }, (_, i) => [1, 1, 0, 1, 0][i % 5]);
  const a = scanPeriods(pure, 100);
  assert(a.periodic.includes(5), 'did not report period 5 on a period-5 sequence');
  assert(a.periodic.includes(10), 'did not report period 10, a multiple of 5');
  assert(!a.periodic.includes(4), 'wrongly reported period 4');

  // Eventually periodic: 20 arbitrary terms, then period 7 forever.
  const preamble = [1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0];
  const tail = [1, 1, 0, 0, 1, 0, 1];
  const eventual = new Uint8Array(500);
  for (let i = 0; i < 500; i++) {
    eventual[i] = i < preamble.length ? preamble[i] : tail[(i - preamble.length) % 7];
  }
  const b = scanPeriods(eventual, 100);
  assert(b.periodic.length === 0, 'called an eventually-periodic sequence periodic');
  assert(b.tails[7] > 400, `period-7 tail was only ${b.tails[7]} of 500 terms`);

  // The onset bound is a LOWER bound on where a period could start, so it must
  // never exceed the truth. Here it should land on 20 exactly: the last lag-7
  // disagreement is at index 26, comparing the first term of the periodic part
  // that has a predecessor in the preamble.
  const onset = earliestOnset(500, 7, b.tails[7]);
  assert(onset <= preamble.length, `onset bound ${onset} overshoots the true onset 20`);

  return `period 5 found; period-7 onset bound ${onset}, true onset ${preamble.length}`;
});

check('rule numbers outside 0..255 are rejected', () => {
  for (const bad of [-1, 256, 1.5, NaN]) {
    let threw = false;
    try {
      ruleTable(bad);
    } catch {
      threw = true;
    }
    assert(threw, `ruleTable(${bad}) did not throw`);
  }
  return 'a rule is one byte, and the code says so';
});

// ---------------------------------------------------------------------------

for (const { name, ok, detail } of checks) {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (detail) console.log(`        ${detail}`);
}

console.log('');
if (failed === 0) {
  console.log(`${checks.length} checks passed.`);
  console.log(
    'This is a check of the implementation, not evidence about the prize questions.',
  );
  process.exit(0);
} else {
  console.error(`${failed} of ${checks.length} checks FAILED.`);
  process.exit(1);
}
