# Attack: falsify `rightDiagonal_period_doubles_iff_odd_weight`

**Theorist.** Sextant, 2026-09-08.

**Topic.** The minimal period of right diagonal `k` is `2L` when the driver
`g_k` has odd weight over one period `L`, and `L` otherwise; measured to
140,000 terms with every depth covered by at least two guaranteed periods.
The right diagonals have no transients, so this is a doubling criterion on
the side where index 0 is not inside one.

**Verdict in one line.** The criterion did not die: it survives to depth
`k = 65`, where the period is `2^27` and the diagonal was read over
`1.07 × 10^9` terms. But it is several statements of very different difficulty
glued together, and taking them apart is the result of this session: the
**doubling** half is an elementary theorem, minimality included (C1); the
**non-doubling** half at every depth that follows a doubling is also a
theorem, by an argument that turns a collapse there into "the diagonal two
further out is constant black", which no right diagonal past the edge is
(C4); and what is left open is the non-doubling half *inside a plateau* — a
run of depths with equal periods — where no argument about periodic words can
reach it, because the recurrence permits a collapse and `29 %` of the abstract
states at `L = 4` realise one.

Notation throughout. `R_k = rightDiagonal k`, `R_k j = evolve (j + k) j`;
`P_k` is the minimal period of `R_k`; `L = max (P_{k-1}) (P_{k-2})` (both are
powers of two, so the least common period is the max); and `g_k` is the
driver of the board's `rightDiagonal_recurrence`,

```
R_k (j+1) = R_k j  ^^  g_k j,      g_k j = R_{k-1} (j+1) || R_{k-2} (j+2).
```

---

## 1. The residual, in one paragraph

Time runs down the picture; count diagonals in from the right edge, and read
diagonal `k` downward as the sequence `j ↦ R_k j`. Unlike the left, nothing
here is transient: every right diagonal repeats from its very first cell,
and its first cell is the centre column at time `k`. Each diagonal is the
running XOR of the one-bit driver `g_k`, which is itself built from the two
diagonals outside it, so a period of those two is a period of `g_k`, and
integrating a word of period `L` gives back a word of period `L` when the
word has even weight and an antiperiodic word of period `2L` when it has odd
weight. That is the whole criterion, and the part of it that is open is not
the doubling but the *not*-doubling: to say the minimal period **is** `L`
rather than some divisor of it, one has to know that `g_k` itself has no
shorter period than `L` — equivalently that `P_k ≥ P_{k-1}`, that the tower
of right-diagonal periods never steps down. Everything else follows in a few
lines from theorems already on the board. So the residual of this topic lives
at the outer edge of the picture, not at the seam: it is the statement that
the OR of two neighbouring right diagonals cannot accidentally acquire half
the period they have, at any of the infinitely many depths where the chance
to do so arises. Section 3 closes two thirds of those depths — every depth
where the period doubles, and every depth immediately after one — and leaves
the residual on the *plateaus*, the runs of consecutive depths that share a
period, where both diagonals feeding the driver fail half-periodicity and can
in principle cover for each other.

## 2. Why the known routes fail

Six of the seven entries in `docs/obstructions.md` are about the left side, and
most of them bear on this topic only by contrast; the ones with teeth here are
the first and the seventh, and I add an eighth.

- **The diagonal structure never reaches the centre column** (entry 1). It
  names the right diagonals explicitly: `rightDiagonal t 0` is the centre
  cell at time `t`, at the *start* of that diagonal. This topic does not
  escape that — but it inverts the reason. On the left, index 0 is inside a
  transient; on the right there is no transient, and index 0 is instead the
  one datum the recurrence does **not** supply: integrating `g_k` fixes `R_k`
  only up to a constant, and the constant is the centre column. So on the
  right the centre column is not hidden by a transient, it is the constant of
  integration, and every statement about the right diagonals that does not
  mention it is a statement about the *derivative* tower only.
- **The settled part of the left diagonals does not depend on the centre
  column** (entry 4) and **the left of the picture knows one integer about
  the configuration** (entry 5). These say the left settled region is
  boundary-blind. The right side is the opposite and I checked it: flipping
  the single constant `c(30) = R_30 0` leaves the doubling positions below 30
  untouched and changes every one after it, and the constant sequence `c ≡ 1`
  makes the tower flat forever (`explorer/sextant_rightdriver.mjs`, test C).
  So no route to this topic can be "read the tower and forget the column".
- **A universal bound on the recurrence's hitting times cannot prove the
  period wall** (entry 7, mine, 2026-09-08). The left analogue of exactly
  this failure: a statement true of the seed's orbit but false for the
  generic word cannot be proved by quantifying over words. The right side
  reproduces it with a different witness set, and that is the new entry
  below.
- **New, appended to `docs/obstructions.md` as "A universal argument over
  periodic words cannot give the right diagonals' minimality".** A proof of
  the non-doubling branch of the criterion on the plateaus, phrased over all
  pairs of periodic words, is false: with `v` of exact period `L` and `u` any word of
  period dividing `L`, the OR `j ↦ v(j+1) || u(j+2)` has a shorter period for
  `33 %` of pairs at `L = 4` and `14 %` at `L = 8`, and the integrated word
  has minimal period below `L` for `29 %` and `10 %` of them; the smallest
  witness is `u = 1000`, `v = 1110`, where the new diagonal has period `2`
  instead of `4`. So the seed's own words have to enter the proof.
- **Routes I considered and did not pursue.** (i) A backward walk on pairs,
  the argument that closes `leftDiagonal_pair_never_eventually_shifted` and
  gives the left periods' unboundedness: it needs the pair map to have
  in-degree one, and on the right the map `(R_{k-2}, R_{k-1}) ↦ R_k` loses
  information backwards — `R_{k-2}` is recoverable only where `R_{k-1}` is
  white, so the in-degree is `2^(weight)`. (ii) Rowland's Proposition 2 read
  in the mirror. It is about the left diagonals, its conclusion is
  `α_m ≤ α + 1` with a criterion for equality, and it says nothing about the
  case that is open here; his right-diagonal result, Lemma 2, gives only
  "period length dividing `l(k) · lcm(p_{m-1}, p_{m-2})`", i.e. `P_k ∣ 2L` —
  an upper bound, which is the half that was never in doubt.

## 3. Candidate claims

### C1. The doubling half is a theorem, minimality included

**The claim.** If the driver has odd weight over one period `L`, then
diagonal `k` is *antiperiodic* at `L` — every cell is the complement of the
cell `L` later — and therefore has minimal period exactly `2L`, with no
appeal to any minimality of the driver.

In the project's vocabulary, for `k` in the shifted form the board prefers:

```lean
(hL0 : PeriodicFrom (rightDiagonal k) L 0)
(hL1 : PeriodicFrom (rightDiagonal (k+1)) L 0)
(hodd : Odd ((Finset.range L).sum
          (fun j => if rightDiagonal (k+1) (j+1) || rightDiagonal k (j+2) then 1 else 0)))
⊢ (∀ j, rightDiagonal (k+2) (j + L) = ! rightDiagonal (k+2) j)
  ∧ PeriodicFrom (rightDiagonal (k+2)) (2*L) 0
  ∧ ¬ PeriodicFrom (rightDiagonal (k+2)) L 0
```

The board has no `minimalPeriod` for `ℕ → Bool`; that is the missing
definition. Until it exists, "the minimal period is `2L`" is stated as the
pair *`2L` is a period* and *`L` is not*, which pins it, because every period
of a sequence periodic from 0 with period `2^k` is a power of two dividing
`2^k`, and the only power of two dividing `2L` but not `L` is `2L`.

**What it would give.** Half of the topic's statement outright, and the
reason the other half is hard: the argument for `2L` never needs to know that
the driver has no shorter period, while the argument for `L` does. It would
be cited by any proof of the full criterion and by anything that wants the
*exact* period of a right diagonal rather than a bound.

**Falsification.** `explorer/sextant_rightperiods.mjs` (window of 64 depths,
`2^24 = 16,777,216` rows, cross-checked against a real 400-row triangle: 0
disagreements on 25,600 cells) and `explorer/sextant_rightdeep.mjs` (no
storage, two lockstep windows per lag, 128 depths, `8 · 2^a + 128` rows for
lag `2^a`, deepest pass `1,073,741,952` rows). *Survives.* Every depth
`k ≤ 65` has `P_k` equal to the criterion's prediction, and every one of the
27 doubling depths shows `P_k = 2L`. The antiperiodicity itself was checked
directly at 21 of them, over the whole half-period, as the hypothesis of C4's
mechanism test, and by Portage independently at all 16 below `k = 40`. Kernel: one
instance, `k = 6`, `L = 8`, checked through `rowCell` in
`explorer/scratch_rightdoubling.lean` — the driver's weight over `[0,8)` is
odd, `R_6` is 16-periodic on `[0,128)` and `R_6 0 ≠ R_6 8`; accepted with
axioms `[propext]` alone.

*What else could have produced this.* Two things, and I checked both. The
first run of the deep scan reported minimal period 1 for every depth above
16: the short passes for small lags had not run far enough for a deep depth
to be inside the cone at all, so both lockstep windows were reading white
cells and every lag looked like a period. The fix is the `+ W` in the row
count, and the corrected run agrees with the array-based script depth for
depth where they overlap (`k ≤ 54`), which is the cross-check that matters —
two implementations, one storing all rows and testing lags by masks over
stored words, one storing nothing and running two windows in lockstep. The
second: the mask test is a test over *all* depths at once, so a bug in the
bit indexing would show as a whole column of wrong periods rather than one;
the reported sequence agrees with Portage's independent script to `k = 39`
and with OEIS A094605's terms as quoted there.

**Novelty.** The criterion itself is not new: brunni.de's rule 30 findings
page states the doubling condition for the right diagonals observationally
("the sum up to p is 1"), and Rowland 2006 Proposition 2 is the same
criterion for the *left* diagonals, proved. What is not in either is the
observation that on the right the odd branch carries its own minimality —
Rowland's Proposition 2 concludes `α_m = α + 1`, i.e. the period length, only
under his standing convention that the period lengths in play are the exact
ones, and his Lemma 2 (the right-diagonal statement) gives divisibility only.
Searched: `rowland-2006-*` (both extractions) for `period`, `doubl`,
`Lemma 2`, `Proposition 2`, `Theorem 1`; all of `sources/` for
`minimal period`, `least period`, `exact period` — no hit anywhere.

**Route.** `rightDiagonal_recurrence` gives the one-bit machine;
`bool_xor_driven_periodicFrom` (on the board, and already used by
`rightDiagonal_periodicFrom_step`) gives `2L` as a period from 0;
`periodicFrom_mul` lifts `P_{k-1}, P_{k-2}` to the common `L`. The one step
that is actually work is the antiperiodicity: the XOR of the driver over any
window of length `L` equals its weight over `[0, L)`, which is an induction
on the window's left end using the driver's periodicity — the same fold the
proof note of `bool_xor_driven_periodicFrom` describes.

### C2. The non-doubling half is exactly "the periods never decrease"

**The claim.** Write `m_k` for the minimal period of the driver `g_k`. Then
(i) the minimal period `P_k` is `m_k` or `2 m_k`, and (ii) `L` is always a
period of `R_k` when the weight is even, so the *only* open part of the
criterion is `P_k ≥ L`, and for `k ≥ 3` that is equivalent to `m_k = L`, and
inductively to `P_k ≥ P_{k-1}`: the tower of right-diagonal minimal periods
never steps down.

In the project's vocabulary the provable half is

```lean
(hL0 : PeriodicFrom (rightDiagonal k) L 0) (hL1 : PeriodicFrom (rightDiagonal (k+1)) L 0)
(heven : ¬ Odd (...same sum as C1...))
⊢ PeriodicFrom (rightDiagonal (k+2)) L 0
```

and the open half is `¬ PeriodicFrom (rightDiagonal (k+2)) (L/2) 0`.

**What it would give.** It is the reduction, and it is worth a node on its
own because it changes what a prover is asked for: not "prove the criterion"
but "prove that an OR of two neighbouring right diagonals never has half
their period". It also settles what to seed from Portage's connection
document: **the Lean statement proposed there is entirely provable**, because
it asks only for `PeriodicFrom ... L 0` in the even case and for the minimal
period only in the odd case, which is C1. The topic's own phrasing — minimal
in both branches — is the one that contains an open statement.

**Falsification.** `explorer/sextant_rightperiods.mjs` reports `m_k` beside
`P_k` for every depth. *Survives, with one exception that is not a
counterexample.* For `3 ≤ k ≤ 54`, `m_k = L` at every depth. At `k = 2`,
`m_2 = 1 < L = 2`: the driver is identically black, because `R_0` is the
right edge and always black. The criterion still gives the right answer there
(`P_2 = 2 = L`) but for the wrong reason — the driver has odd weight over its
*own* period 1, so the period doubles from 1 to 2, and `2` happens to equal
`L`. That is the whole content of clause (i): `P_k = L` holds either because
`m_k = L`, or because `m_k = L/2` with odd weight over `m_k`, and the second
alternative is realised exactly once in the picture, at `k = 2`.

*What else could have produced this.* The equality `m_k = L` could be an
artifact of measuring `m_k` with the same machinery as `P_k`; it is not — the
driver is a different word (`B = (A<<1)|(A<<2)` in the window) and its lag
masks are accumulated separately in the same pass. And `m_k = L` is not
forced by `P_k = L`: `P_k ∈ {m_k, 2 m_k}` allows `m_k = L/2`, which is
precisely the `k = 2` case, so the measurement can and does distinguish them.

**Novelty.** No source searched states anything about the minimality of a
rule 30 diagonal period. Rowland's Lemma 2 is divisibility; his Proposition 2
is the left side; Wolfram 1986 §6 has "periods increase very slowly" as an
observation about the strip automaton. Searched: all of `sources/` for
`minimal period`, `least period`, `exact period`, `period length exactly`.

**Route.** For the provable half: telescoping, as in C1. For the open half:
C4 closes it at every depth that follows a doubling, and on the plateaus
there is no route — every route I can name reduces to bounding the number of
positions where the driver fails to have half the period, and that count is a
measurement (below), not a mechanism.

### C3. The driver is a white pair in one row, and the criterion counts white pairs

**The claim.** `g_k j = 0` exactly when row `j + k` is white at *both*
positions `j+1` and `j+2` — the two cells immediately to the right of the
diagonal's own cell `(j+k, j)`. Since `L` is even, the criterion reads: **the
period doubles at depth `k` iff the number of `j` in one period for which row
`j+k` has a white pair at `(j+1, j+2)` is odd.** Corollary, and the reason
the two branches differ: a word of period `L/2` has an even number of zeros
in any window of length `L`, so an odd white-pair count *by itself* forbids
the shorter period — which is C1's minimality, obtained by counting instead
of by antiperiodicity.

In the project's vocabulary: `g_k j = evolve (j+k) (j+1) || evolve (j+k) (j+2)`,
i.e. `¬ g_k j ↔ evolve (j+k) (j+1) = false ∧ evolve (j+k) (j+2) = false`.

**What it would give.** It moves the criterion out of the language of
diagonals and into the language of the picture: doubling is a parity of white
pairs along a diagonal. Together with C4 it turns the open half of the
criterion, in half of all depths, into a statement about the *existence* of a
white pair rather than about periods.

**Falsification.** `explorer/sextant_rightdriver.mjs`, test A: rebuilt a real
3,000-row triangle and compared cell by cell against the window and against
the driver. *Survives*: 0 disagreements on 183,985 diagonal cells for both
the window and the pair identity. The measured density of white pairs along
the diagonals is `0.2570` (a random row would give `0.25`), and the per-depth
counts in `sextant_rightperiods.mjs` are `0.25 L` to within a percent at
every depth from `k = 26` on.

*What else could have produced this.* An index identity that is true of the
window but false of the picture would show as 0 disagreements against a
window I built myself. That is why test A recomputes the picture from a plain
row array with no depth coordinates at all and reads the pair out of *that*.
The first version of this test had the offsets wrong — see section 5 — and
still reported 0 disagreements, because both sides of the comparison were
built from the same wrong convention; the fix was to write the pair as a read
of the triangle at explicit `(row, position)` and not as anything shifted.

**Novelty.** The complement reading (zeros, not weight) is not in the held
sources; brunni.de states the weight form. Rowland's left-side criterion is
"an odd number of black cells in each repeating block" of the diagonal two
further out — a count on a *diagonal*, not on adjacent cells of a *row*, and
his OR sits in a different slot of the recurrence. Searched:
`rowland-2006-*`, `wolfram-1986-*`, `kopra-2022-*` for `adjacent`, `pair`,
`block`, `white`; nothing on the pair form.

**Route.** One rewrite of `rightDiagonal_recurrence` plus the definition of
`rightDiagonal`, no induction: it is a coordinate statement, of the same size
as `leftDiagonal_recurrence`. The corollary (odd count ⇒ not `L/2`-periodic)
needs the counting lemma "a sequence with period `q` has an even number of
zeros in any window of length `2q`", which is a `Finset` fact about a
two-block window, size S–M.

### C4. Right after a doubling there is no collapse, and this is a theorem

**The claim.** Two statements, the second resting on the first.

*(a) No right diagonal past the edge is constant.* For every `k ≥ 1`,
`rightDiagonal k` takes both colours. (`rightDiagonal 0` is the right edge and
is constantly black — `evolve_right_edge` — and it is the only one.)

*(b) After a doubling the driver keeps the full period.* Suppose `q` is a
period of `rightDiagonal k` from 0, and `rightDiagonal (k+1)` is
**antiperiodic** at `q` — `∀ j, R_{k+1} (j+q) = ! R_{k+1} j`, which is exactly
C1's conclusion at the previous depth, i.e. the previous depth doubled. Then
for every `j`,

```
g_{k+2} j ≠ g_{k+2} (j + q)   ↔   rightDiagonal k (j+2) = false,
```

so the driver has period `q` **iff** `rightDiagonal k` is constantly black,
which by (a) happens only for `k = 0`. Hence for `k ≥ 1` the driver's minimal
period is the full `L = 2q`, and by C2 the criterion determines the minimal
period of `rightDiagonal (k+2)` exactly, in both branches.

The proof of (b) is four lines: with `a = R_{k+1} (j+1)` and
`b = R_k (j+2)`, periodicity of `b` at `q` and antiperiodicity of `a` turn the
comparison into `a || b` against `!a || b`, which differ exactly when `b` is
white. The proof of (a) is a descent: if `R_m` is constant then its driver is
identically white, so `R_{m-1}` is white from index 1 and `R_{m-2}` from index
2, and a purely periodic sequence white from an index is white everywhere; so
`R_{m-2}` is constant too, and the descent ends at `rightDiagonal 1`, which
alternates (`evolve_right_second_diagonal`), or at `rightDiagonal 0`, which is
black (`evolve_right_edge`).

**What it would give.** Together with C1 it closes the criterion at every
depth where the period doubles and at every depth immediately after one. In
the range measured, depths 2 to 65, that is 26 doublings and 27 successors,
8 of them both: **45 of the 64 depths settled, 19 open**, and the 19 are
exactly `11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 31, 32, 33, 45, 46, 47, 53,
57, 62` — the interior of each plateau, a run of consecutive depths with equal
periods, where `R_{k-1}` is not antiperiodic and the two diagonals feeding
the driver can in principle cover for each other (counts printed by
`explorer/sextant_rightdeep.mjs`). It also explains the single
anomaly in the picture: `k = 2` is the one depth where the driver's minimal
period is smaller than `L`, and it is exactly the excluded case of (b), where
the diagonal two out is the black right edge.

**Falsification.** The derivation has a fingerprint that is not implied by its
conclusion, so I tested the mechanism and not the outcome:
`explorer/sextant_rightperiods.mjs` checks, at every depth with
`P_{k-2} < P_{k-1}`, that `R_{k-1}` really is antiperiodic at `q` and that
`g_k j ≠ g_k (j+q)` holds exactly where `R_{k-2} (j+2)` is white. *Survives*:
21 such depths for `k ≤ 54`, `0` antiperiodicity failures and `0` mechanism
failures over the whole window `[0, q)` at each — `q` runs from 1 to
`1,048,576`, so the deepest single test is a million positions. The white-cell
count of `R_{k-2}` in one `q`-window is `0` at `k = 2` alone (the black edge)
and about `q/2` everywhere else, up to `524,692` at `k = 52`, so the collapse
that (b) excludes is excluded by a wide margin and not by a hair.

*What else could have produced this.* The cheap version of this test is the
count: the mechanism forces the number of positions where `g_k` fails
half-periodicity to equal the number of its zeros, and that is easy to read
off the main table. It is **not** a discriminator, and I nearly wrote that it
was: `marg = zeros` also holds accidentally at 8 of the 19 plateau depths
(`k = 11, 12, 13, 14, 18, 31, 45, 53`), because the equality really says only
that no two zeros of the driver sit `L/2` apart. That is why the test above
compares the two sets position by position over the whole window instead of
comparing their sizes, and why the antiperiodicity of `R_{k-1}` — the
hypothesis of (b), which nothing else in the run depends on — is checked
separately at each of the 21 depths.

**Novelty.** Not in the held sources. Rowland 2006 has the analogous
"eventually white ⟹ the next diagonal is eventually black" observation for the
left (lines 905–908) but nothing about a constant right diagonal or about the
driver's period; searched `rowland-2006-*`, `wolfram-1986-*`, `kopra-2022-*`
for `constant`, `all black`, `never white`, `adjacent`, `pair`.

**Route.** (a) `rightDiagonal_recurrence`, `evolve_right_edge`,
`evolve_right_second_diagonal`, and `rightDiagonal_periodicFrom_pow` for the
"white from an index ⟹ white everywhere" step; strong induction downward, size
M. (b) `rightDiagonal_recurrence` and a four-case `Bool` split, size S, once
C1 supplies the antiperiodicity. Neither has a hard step; the work is index
bookkeeping of the same kind as `leftDiagonal_recurrence`'s.

### C5. The period tower is a functional of the centre column

**The claim.** The recurrence determines the right diagonals only up to one
bit per depth, and that bit is the centre column: `R_k 0 = centerColumn k`.
Running the tower from `R_0 = 1^∞`, `R_1 = (10)^∞` with a chosen constant at
each depth reproduces the picture exactly when the constants are the seed's,
and gives a different tower otherwise — including a completely flat tower
(period 2 at every depth, no doubling after `k = 1`) when the constants are
all black. So no proof that the right periods grow, or that the criterion's
non-doubling branch is tight, can be a statement about the recurrence alone.

**What it would give.** It is the honest boundary of the topic, and it is
also the one bridge to P1 in this region: it says the doubling positions
`1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29, 34, 36, 37, 39, 41, 43, 48, 49,
51, 54, …` are a functional of the centre column, and the centre column is
what P1 is about.

**Falsification.** `explorer/sextant_rightdriver.mjs`, test C. *Survives*: the
tower run with the seed's own constants reproduces the picture's minimal
periods for every depth to `k = 54` (0 failures against the picture); the
tower with constants `≡ 1` has period 2 from `k = 1` on for all 60 depths
computed; flipping the single constant `c(k₀)` leaves the doublings below
`k₀` and changes those above (`k₀ = 30`: doublings agree to 29 and diverge at
32 against the seed's 34).

*What else could have produced this.* The first version of this test
disagreed with the picture at two depths, and the cause was mine: I had built
the tower with the driver `R_{k-1}(j) || R_{k-2}(j+1)` — Portage's offsets,
one to the left of the board's `rightDiagonal_recurrence`. That shift does
not change the weight over a full period, so it is invisible to the
criterion, but it shifts each integrated word by one, which misaligns the
next level. With the board's offsets the tower matches the picture exactly,
which is what makes the counterfactual runs believable.

**Novelty.** Portage's connection document of 2026-09-08 states the "constant
of integration" reading and is the source of the framing; what is added here
is the counterfactual — that the tower is *not* determined by the recurrence,
with the flat all-black-constants witness — and the check that the seed's
constants reproduce the picture.

**Route.** No route to anything: it is a negative result about routes.

## 4. What survived

All five candidates survived, and the criterion itself survived a
falsification attempt three orders of magnitude deeper than the topic's
140,000 terms: 0 failures at every depth `k ≤ 65`, where the minimal period
is `2^27` and the deepest lag pass read `1,073,741,952` rows. The claim I
would seed first is **C1**, the doubling half with its minimality, because it
is a complete theorem whose ingredients are all on the board
(`rightDiagonal_recurrence`, `bool_xor_driven_periodicFrom`,
`periodicFrom_mul`), because it is the half of the topic that can be closed
outright, and because **C4** — the session's real find — needs its
antiperiodicity as a hypothesis. C4 should be seeded immediately after it, in
its two pieces: *no right diagonal past the edge is constant* (a small node
worth having on its own; it is the first statement on this board that says a
right diagonal is never degenerate) and *after a doubling the driver keeps the
full period*. Those two together turn a claim that was open at every depth
into one that is open only on the interior of a plateau, and they explain the
one anomaly in the picture, `k = 2`, as the excluded case rather than as
noise. **C2** is the reduction that says what is left; **C3** is the
vocabulary it is most naturally said in; **C5** belongs in the crystals as a
warning, not as a node. The honest summary of the topic: the statement is
true as far as anyone can compute, two thirds of it is now a theorem nobody
has written down, and the remaining third is a new open problem of the same
species as the left-side walls — a lower bound on a period, in an orbit that
nothing distinguishes from a generic one.

## 5. Claims that died

- **"The minimal period of the driver `g_k` is always `L`."** Dies at `k = 2`:
  `g_2` is identically black, minimal period 1, against `L = 2`. Harmless —
  the criterion still predicts `P_2 = 2` correctly — but it means C2's
  equivalence has to be stated for `k ≥ 3`, and it is the one place in the
  picture where the "even weight" branch holds for a reason other than the
  one the criterion gives.
- **"The zero counts of the driver in the two halves of a period differ."** A
  would-be certificate against a collapse (unequal halves make `L/2`-periodicity
  impossible). Dies at `k = 10` (8 and 8), and again at `k = 14` (8/8), `k = 21`
  (31/31), `k = 5` (1/1). Depth: all depths `k ≤ 54`,
  `explorer/sextant_rightperiods.mjs`.
- **"A universal statement over periodic words gives the non-doubling branch."**
  Dies at `L = 4` with `u = 1000`, `v = 1110`: `v` has exact period 4 and the
  integrated word has minimal period 2. Rates: `29 %` of pairs at `L = 4`,
  `10.2 %` at `L = 8` (both exhaustive), `1.35 %` at `L = 16`, `0.027 %` at
  `L = 32`, none in 400,000 samples at `L = 64`
  (`explorer/sextant_rightdriver.mjs`, test B). The rate decays roughly like
  `2^(-0.37 L)`, which is exactly why no counterexample is expected in the
  seed and exactly why no proof can come from counting.
- **"Period doubling on the right is evidence that the centre column is
  aperiodic."** Dies immediately: the abstract tower run with the periodic
  constant sequence `c(k) = k mod 2` doubles 22 times, up to `2^22`, just as
  the seed's does (`sextant_rightdriver.mjs`, test C). A periodic centre
  column does not flatten the tower, so the tower's growth is no witness for
  P1.
- **"The right diagonals have minimal period exactly `2^k`."** Already dead in
  my notebook from 2026-09-07 (`k = 2`: period 2, not 4); recorded here so the
  next theorist does not retest it. `P_k` grows like `2^(0.41 k)`, not `2^k`.
- **A dead measurement, not a claim.** The first deep run reported minimal
  period 1 for every depth above 16. The passes for small lags were only `8·2^a`
  rows long, and a depth `k` has no cell at all before row `k`, so both lockstep
  windows were reading cone-exterior white cells and every lag looked like a
  period. The number was true of what was measured and false of what it was
  taken to mean.

## 6. Next topic

Attack **what is left of this criterion after C4: the plateau case.** Stated
as the next theorist should get it: *if `rightDiagonal k` and
`rightDiagonal (k+1)` have the same minimal period `L`, must the driver
`g_{k+2} j = R_{k+1} (j+1) || R_k (j+2)` also have minimal period `L`?* C4
settles the case where `R_{k+1}` is antiperiodic at `L/2` by turning a
collapse into "`R_k` is constant black"; on a plateau `R_{k+1}` is not
antiperiodic, both feeding diagonals fail half-periodicity, and the collapse
condition becomes a mixed one — where only `R_{k+1}` flips under the half
shift, `R_k` must be black there; where only `R_k` flips, `R_{k+1}` must be
black; where both flip, they must differ. That is three local conditions on
two neighbouring diagonals, all three checkable, and the measured number of
positions where they fail together runs from `0.16 L` to `0.25 L` at every
plateau depth to `k = 54` — so the question is whether some pairing law
between adjacent right diagonals forbids all three at once, in the way the
forbidden block forbids `11` above a black cell. It is the last third of a
claim whose other two thirds are now theorems — 19 of the 64 depths below
`k = 65`, listed in C4 — which makes it the cheapest open statement on this
board to finish.

And it splits once more, which is where I would start. At the *second* depth
of every plateau — `k` with a doubling at `k-2` — the diagonal `R_{k-2}` is
antiperiodic at `L/2` by C1, so `R_{k-2}` flips at *every* position under the
half shift and the first of the three conditions — the one that asks anything
where `R_{k-2}` does not flip — is vacuous; the fingerprint is that its class
of violations is empty, and it is empty at exactly those 15 depths of
the 32 measured (`explorer/sextant_rightperiods.mjs`, plateau block: `3, 6, 9,
11, 18, 27, 29, 31, 36, 39, 41, 43, 45, 51, 53`, all with a doubling two
depths earlier, against `0.5 q` violations there and `0.375 q` at the rest).
What is left at those depths is a single statement of C4's kind: *wherever
`rightDiagonal (k-1)` agrees with its own half-period shift, is it ever
white?* — measured `0.25 q` such white positions at every one of them, and a
collapse needs all of them to be black. That is one existential about one
diagonal, and it would close half of what remains.

Second choice, and a genuinely open question I could not settle here:
**are the right-diagonal minimal periods unbounded?** On the left that is
proved (`leftDiagonal_period_unbounded`, from the in-degree-one pair map); on
the right the pair map has in-degree `2^(weight)`, the same proof does not
run, the abstract system contains flat towers (constants `≡ 1`), and I found
no statement in print either way — so the right side may be missing a theorem
the left side already has.
