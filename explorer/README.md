# explorer

A Rule 30 engine and two statistics scripts. Node 22, ES modules, no
dependencies, no build step.

## These produce empirical evidence only

The three [Rule 30 prize questions](https://writings.stephenwolfram.com/2019/10/announcing-the-rule-30-prizes/)
are open. Nothing in this directory bears on whether they are true.

- **Aperiodicity.** `periodscan.mjs` can only rule out the periods it tests, up
  to the number of terms it has. Finding no period below some bound is not
  evidence of aperiodicity — it is the absence of one particular kind of
  evidence for periodicity. And no amount of computation will change that:
  the configuration is an infinite row growing by two cells per step, so there
  is no finite state space to exhaust, and therefore no *N* past which a null
  result becomes conclusive.
- **Balance.** `centercolumn.mjs` reports a density near 0.5. A statement about
  an asymptotic limit is not testable by any finite prefix. A sequence can sit
  at 0.5 for a billion terms and converge to 0.4.
- **Irreducibility.** Nothing here addresses it at all. It is a claim about
  lower bounds on computation, and running a program fast says nothing about
  what a cleverer program could not do.

What the explorer is actually for: sanity-checking the Lean definitions against
a fast independent implementation, and making the sequence concrete enough to
have intuitions about. Treat every number it prints as a description of a
finite prefix.

## Scripts

| File | What it is |
|---|---|
| `rule30.mjs` | the engine — module, not a CLI |
| `verify.mjs` | self-check; exits non-zero on failure |
| `centercolumn.mjs` | center column + running density of 1s (prize question 2) |
| `periodscan.mjs` | search for eventual periodicity (prize question 1) |
| `spinecheck.mjs` | engine check of the inversion identity behind the adjacent-columns theorem (prize question 1) |

### verify.mjs

```
node explorer/verify.mjs          # or: npm run verify:explorer
```

Ten checks. The two that matter:

- the BigInt engine agrees with a naive per-cell implementation over 600
  generations — not only on the center column but on **every cell of every
  row**;
- the first 41 center terms are the [OEIS A051023](https://oeis.org/A051023)
  prefix.

The naive side is driven by the *rule number*, not by Rule 30's closed form, so
the two implementations share no reasoning. It also checks rule 90 against
binomial coefficients mod 2 and rule 254 against its light cone, which tests the
rule-number decoding on rules that have nothing to do with rule 30.

One more is worth naming: a **positive control for the period scan**. A scanner
that reported "nothing found" regardless of its input would look exactly like a
correct null result on Rule 30, so `scanPeriods` is also run on a period-5
sequence and on one that turns periodic at index 20 — it has to find both, and
its onset bound has to land at or below the true onset.

This is a check of the implementation. It is not evidence about the prize
questions, and the script says so when it passes.

### centercolumn.mjs

```
node explorer/centercolumn.mjs 1000000
npm run explore:center -- 1000000 --checkpoints=20
```

| Option | |
|---|---|
| `N` | generations, default 100000 |
| `--checkpoints=K` | K extra evenly spaced density reports |
| `--no-trim` | keep every cell; slower, identical output |
| `--print=K` | print the first K terms |
| `--out=FILE` | write the column to FILE as one line of digits |
| `--quiet` | final line only |

Density is reported at 1, 2, 5, 10, 20, 50, ... up to *N*. Decade spacing is
deliberate: drift in a density is a question about orders of magnitude, and one
final number would hide it. Measured excess of 1s over 0s at a few sizes:

| N | ones − zeros | density |
|---|---|---|
| 10,000 | +64 | 0.503200 |
| 100,000 | +196 | 0.500980 |
| 1,000,000 | +1,536 | 0.500768 |
| 2,000,000 | +1,418 | 0.500354 |

The excess grows while the density shrinks, which is what a fair coin would also
do — the excess of a random walk grows like √N. That is a remark about what the
numbers look like, not a result.

### periodscan.mjs

```
node explorer/periodscan.mjs 200000
npm run explore:period -- 200000 --max-period=50000
```

| Option | |
|---|---|
| `N` | terms of the center column, default 200000 |
| `--max-period=P` | largest period tested, default floor(N/2) |
| `--top=K` | show the K best candidates, default 10 |
| `--no-trim` | keep every cell; slower, identical output |

For each period *p* it walks backwards from the last term while `s[i] === s[i-p]`
and records where that first fails. That failure is the **last** disagreement at
lag *p*, so it puts a lower bound on how late an eventual period *p* could have
started. Because the walk terminates almost immediately on a sequence that does
not repeat itself, the whole scan is about O(*P*) rather than O(*N·P*) — the
200,000-term scan above makes about 200,000 comparisons in total, and the time
is entirely in generating the sequence.

`p > N/2` is capped away, because a period needs room to repeat at least once
before there is anything to observe. The output states the bound checked and
says explicitly what a null result does not mean.

Candidates are ranked by **repeats** = tail length / *p*. A real period would
show a value far above 1. At *N* = 200,000 the best is 0.33 — the period never
completed even once.

## The engine

The whole step is one line, applied to an entire row at once:

```js
next = (x << 1n) ^ (x | (x >> 1n))
```

A row is a BigInt, bit *i* is cell *i*, and cell indices increase to the right.
The shift directions are the one genuinely confusing part:

- bit *i* of `x << 1n` is bit *i−1* of `x`, and cell *i−1* is cell *i*'s **left**
  neighbour — so `x << 1n` is the left-neighbour plane, already aligned;
- bit *i* of `x >> 1n` is bit *i+1*, the **right** neighbour.

Read it as: shifting *up* moves each cell's contents into a higher index, so what
arrives at index *i* is what used to sit at *i−1*, on the left. The shift
direction is the opposite of the direction the data appears to move when you draw
the row with low indices on the left. This is easy to get backwards; `verify.mjs`
is what catches it if you do.

Two optimizations are in `centerColumn` and documented at the function:

- **Sliding window.** The row keeps only ~512 spare zero bits below the pattern
  and is shifted up when the pattern eats through them, rather than reserving
  *N* bits of headroom up front. Every bitwise operation costs time proportional
  to the whole BigInt, dead zero bits included, so carrying *N* of them for *N*
  steps is most of the run.
- **Light cone (`trim`).** Information moves one cell per step, so a cell more
  than *N−1−g* from the center at generation *g* cannot reach the center before
  the run ends. Past halfway, the row is masked to that shrinking cone.

Together these took 800,000 generations from 58s to 8.3s. `verify.mjs` checks
that trimming changes no term, and `--no-trim` is available on both CLIs.

## Measured performance

Node v22.20.0, Windows 11, one core. Wall clock for `centerColumn`, measured,
not extrapolated:

| N | time |
|---|---|
| 100,000 | 0.14s |
| 200,000 | 0.53s |
| 400,000 | 2.1s |
| 800,000 | 8.3s |
| 1,000,000 | 12.8s |
| 1,400,000 | 75s |
| 2,000,000 | 207s |

Up to about a million generations this tracks the expected quadratic curve
closely: the row is ~2*g* bits wide at generation *g*, so the total bit-work is
inherently O(*N²*) however tight the inner loop is. There is no arrangement of
BigInt operations that avoids that.

Past a million it degrades faster than quadratic — 1M → 1.4M costs 5.9× where
quadratic predicts 2.0×. Raising the young-generation size (`--max-semi-space-size=64`)
did not help, so it is not simply nursery GC; beyond that the cause is
undiagnosed and the numbers above are reported as measured rather than
explained. Peak RSS stayed under 100 MB throughout.

**Practical ceiling: about 1,000,000 generations in ~13s, and 2,000,000 if you
are willing to wait three and a half minutes.** Anything larger has not been
measured here, and the curve above is a reason not to guess.
