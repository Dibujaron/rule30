# Attack: centerColumn_other_isEventuallyPeriodic_of_center — the centre column of the settled configuration

Sextant, 2026-09-07, fourth attack on this wall. Everything below is an
argument, not a proof; every number is a description of a finite prefix,
and every survival names what else could have produced it.

## 1. The residual, in one paragraph

Time runs down the picture. The prize conjecture P1 has been reduced, by
theorems on the board, to one implication: if the centre column ever
repeats, some other column repeats too, and since no two columns can
both repeat, that implication is the same as saying the centre column
never repeats. Every left diagonal settles into a periodic word from some
onset on, and the settled cells form a region on the left whose boundary,
the *seam*, runs down the picture at about a quarter of the cone's
half-width from the left edge. The settled cells are the rule 30
evolution of one configuration, the *settled configuration* `Σ`, whose
picture has no transients at all; the seed's picture is that picture
plus a *transient band* to the right of the seam, and the centre column
runs down the middle of the band. This document is about `Σ`'s own
centre column `s`, the sequence the seed's centre column would be if its
diagonals had no transients, and about how much of the left of the
picture is `Σ`'s and how much is the seed's. The residual lives in the
band, at its centre; the finding here is that everything left of a front
inside the band is the same for every configuration white far to the
left, up to a translation along the edge by a single integer, so the
residual cannot be decided by anything on the left.

## 2. Why the known routes fail

- *The diagonal structure never reaches the centre column*
  (`docs/obstructions.md`, first entry): the centre cell is index zero of
  its diagonal, inside the transient of every diagonal past the first
  few. Confirmed again here: `s(k) = c(k)` exactly for `k ≤ 17`, where the
  onsets are zero, and at the coin-flip rate `0.497`–`0.502` in every
  block of 40,000 after that (`explorer/settledcenter.mjs`).
- *The centre column as a boundary condition* (second entry): the
  sequence-level statement is false for `b ≡ true`; a proof must carry the
  white cone. `Σ` is white on `x < 0`, so `s` is a boundary that does carry
  it, and it passes the black-time identity at every one of 240,000 times
  (§3, C2), as it must.
- *Counting the right sides consistent with the centre column* (third
  entry): the count measures a horizon, not the column.
- *The settled part of the left diagonals does not depend on the centre
  column* (fourth entry): the settled region is the seed's up to a shift.
  This document sharpens that entry into a new one, appended to
  `docs/obstructions.md` today: not only the settled words but the whole
  region left of the damage front, seam and a strip of transient
  included, is the seed's picture translated along the edge by one
  integer `N`, for every configuration tested, and the complement-type
  branch at diagonal 53208 that Rowland expected to break "only one left
  side" is inherited by all of them. The left side of the picture knows
  one integer about the configuration and nothing else. A proof of the
  residual has to be about the band right of that front.
- A route I considered and killed today (§5): bound the onsets of the
  diagonals by a *reset front* computed from the settled words alone,
  using the two reset lemmas on the board. The bound is valid at every one
  of 59,999 diagonals and useless: it advances by at least one index per
  diagonal by construction and by two on average, where the true onsets
  advance by `0.336`.

## 3. Candidate claims

### C1. The settled centre column is definable on the board, and its definition does not depend on the index chosen

**The claim.** Read the seed's picture down a column far to the left,
starting at the left edge. If the column's distance from the origin is a
multiple of `2^k` and past the onsets, the `k`-th cell below the edge is
the same whichever such column is read, and that common value is the
centre column of the settled configuration. Precisely:

```
settledCenter (k : ℕ) : Bool := leftDiagonal k (2 ^ k)       -- = evolve (2 ^ k + k) (-(2 ^ k))
∀ k m, 1 ≤ m → leftDiagonal k (m * 2 ^ k) = settledCenter k
```

and more generally `leftDiagonal k N = settledCenter k` for every `N ≥ 2 ^ k`
with `2 ^ k ∣ N`. In the picture: `s k = S_k(0)`, the settled word of
diagonal `k` read at index zero, where the centre column reads the
diagonal's transient instead.

**What it would give.** A definition in the existing vocabulary, with no
settled-word object, for the sequence `s` that C2, C3 and the fourth
obstruction entry are about. On its own it decides nothing; without it
nothing about `Σ` can be stated on the board.

**Falsification.** `explorer/settledcenter.mjs` (372,100 engine rows,
12 s): `s(k)` computed from the diagonal recurrence alone, with the seven
branch bits below 240,000 read from the picture, against the picture's
cells `evolve (N + k) (-N)`:

| check | values | mismatches |
|---|---|---|
| `N = 2^17`, `k ≤ 240,000` | 240,001 | 0 |
| `N = 100,000 = 32 · 3125`, `k ≤ 240,000` | 240,001 | 0 |
| `evolve (m 2^k + k) (-(m 2^k))`, `k ≤ 17`, every `m ≥ 1` the rows reach | 744,183 | 0 |

Kernel (`explorer/scratch_settledcenter.lean`, accepted by `lake env lean`,
from `rowCell`): the values `s(0..10) = 11011100110`, the index `2 · 2^k`
for `k ≤ 9` and `3 · 2^k` for `k ≤ 8` giving the same value, and
`s k = centerColumn k` for `k ≤ 10`. *Survives.* What else could produce
the survival: the recurrence-computed `s` and the picture's column are
independent except at the seven branch reads, which are at index
`0.55k + 16`, not at `N`; the closed-form check reads 744,183 cells the
recurrence never saw. The one thing the checks share is the engine, which
`explorer/verify.mjs` checks against a rule-number implementation.

**Novelty.** New phrasing. The periodic words are Jen's and Rowland's
(`rowland-2006`, Proposition 2 and §5, where the diagonals are the
"columns" of the left-justified picture); the cell at index `2^k` of
diagonal `k` as a definition of a sequence is not in any held source.
Searched `rowland-2006` (both extractions), `jen-1990`, `kopra-2022`,
`wolfram-1986` for "left side", "left edge", "leftmost", "2-adic",
"p-adic", "bi-infinite", "infinite past": Rowland's "p-adic convergence
in the exponent" (line 321) is about the right side's rows `2^n`.

**Route.** `leftDiagonal_periodicFrom_pow` gives `N₀ ≤ 2 ^ k` and
`PeriodicFrom (leftDiagonal k) (2 ^ k) N₀`; `periodicFrom_mul` or a
one-line induction on `m` walks from `2 ^ k` to `m · 2 ^ k`. Size S. The
only step is that `2 ^ k ≥ N₀`, which the existential already says.

### C2. The settled picture is the rule 30 evolution of the settled configuration, stated without a settled-word definition

**The claim.** With `S(t, x) = leftDiagonal (t + x) (2 ^ (t + x + 1) - x)`
for `x ≥ -t` (an index at or past `2 ^ (t+x)`, hence past the onset, and
congruent to `-x` modulo the period), and
`Σ x = leftDiagonal x (2 ^ (x + 1) - x)` for `x ≥ 0`, white for `x < 0`:

```
∀ t : ℕ, ∀ x : ℤ, -t ≤ x → column Σ x t = S(t, x)
```

so in particular `column Σ 0 = settledCenter` by C1. In the picture:
the settled words, extended periodically to every index, are a rule 30
orbit; the seed's picture is that orbit plus a transient band; and `Σ`
is a configuration white far to the left whose picture has no transient
at all, with an infinite past inside the class of such configurations.

**What it would give.** The object behind crystal 44, on the board with
no new definition: `Σ` is a `Config`, so `column_succ_of_black`,
`column_one_of_white`, `evolveHalfLeft_eq_column` and Kopra's width-2
theorem (crystal 18) all apply to it. It makes C3 a statement about a
`Config`. After it, the residual is exactly as open as before: it
describes the region the residual does not live in.

**Falsification.** `explorer/settledorbit.mjs`: `Σ` on `[0, 30000]` from
the recurrence alone, grown by the engine for 10,000 steps, against
`S_{t+x}(-x)` on every cell of the cone of the known part:
300,040,001 cells, 0 mismatches (7.5 s). Kernel: the values `Σ(0..9)` from
`rowCell`. The black-time identity `s(t) = 1 → s(t+1) = ¬S(t, -1)`, which
the orbit property forces, holds at all 240,000 times
(`settledcenter.mjs`). *Survives.* What else could produce it: the
recurrence's solutions satisfy the recurrence at every index by
construction, and the recurrence is the rule in diagonal coordinates, so
the orbit property is close to tautological once the words are periodic
on all of `ℤ`; the content is the identification of those words with
`leftDiagonal` at the stated indices, which is C1's check.

**Novelty.** Not in print as a configuration. Rowland §5 has the idea
that the left side is "the same" for every rightful row; nothing there or
in Jen, Kopra or Wolfram 1986 names the limit object or evolves it.

**Route.** Induction on `t`. The cell `(t + 1, x)` is `rule30_eq` on
`(t, x - 1), (t, x), (t, x + 1)`; move each of the four `leftDiagonal`
indices to the common frame `M - x` with `M = 2 ^ (t + x + 3)` by the
periodicity from C1 (each shift is a multiple of that diagonal's `2 ^ k`),
and the recurrence `leftDiagonal_recurrence` at `m = t + x - 1`,
`i = M - x - 1` is the rule at those three cells. Edge cases `x = -t` and
`x = -t - 1` are `evolve_left_edge`, `evolve_left_second_diagonal`,
`evolve_left_third_diagonal`. The hard step is index bookkeeping across
`ℕ`/`ℤ` casts with `2 ^ (t+x+1) - x` inside a `toNat`; size M–L, and the
cast-heavy shape is exactly what the captain's `ℕ` rule warns about, so
the statement should be seeded in diagonal coordinates
(`leftDiagonal (t+x) j` with `j : ℕ`) rather than through `column`.

### C3. The settled centre column is not eventually periodic

**The claim.** `¬ IsEventuallyPeriodic settledCenter`; by C2, Kopra's
width-1 problem (his Problem 4.8, `kopra-2022` lines 553–560, which he
says "is probably equally difficult for all configurations of N(2)") for
the configuration `Σ`.

**What it would give.** Nothing for the residual directly: `Σ` is a
different configuration and the seed's column is `s xor e` with `e` the
band's centre column, balanced and uncorrelated with `s` (`P(s = c)` is
`0.500` at lag 0 and `0.499`–`0.502` at lags `-3..3`). It is the
canonical instance of Kopra's problem, on a configuration with no
transients, and the sequence with the lowest information content in the
whole picture: `s` to depth `K` is fixed by the recurrence and about
`log₂ log₂ K` branch bits (seven below 240,000).

**Falsification.** `explorer/settledcenter.mjs`, 240,001 terms, every lag
`1..120,000`, the last disagreement at each lag as `periodscan.mjs` does:
longest agreeing tail 16 cells (at lag 9544); the seed's own column gives
15 on the same scan; the positive control (period 977 from index 50,000)
is found with a tail of 189,027. `Σ` itself, read across, is not
spatially eventually periodic either (tail 16). Factor counts of `s` for
`n ≤ 22` match those of the seed's column and of a random sequence to
within a percent (`2, 4, …, 16384, 32759, 63891, 110055, …, 233253`);
density `0.4997`; `P(s(t) = s(t+d)) = 0.498`–`0.501` for `d ≤ 12`.
*Survives, with the usual meaning:* a period above 120,000 or an onset
above 240,000 is untouched, as for the seed's column. What else could
produce it: a wrong `s`, excluded by C1's cell-for-cell checks.

**Novelty.** Nobody has computed this sequence; it is not in any held
source or on OEIS under its first 40 terms as far as a search of the held
texts shows (no online search was made). The *question* is Kopra's.

**Route.** No route. Kopra's Theorem 3.5 gives the width-2 statement for
`Σ`; the width-1 statement is the wall in another configuration.

### C4. There is only one left side of rule 30, up to a translation along the edge

**The claim.** For every configuration white far to the left with its
leftmost black cell at the origin, there is an integer `N` such that the
configuration's picture equals the seed's picture translated by
`(t, x) ↦ (t + N, x - N)` on every settled cell of the seed's translated
picture, and on a strip of the transient band beyond the seam. In the
vocabulary, the settled-region half:

```
∀ X : Config, (∀ i < 0, X i = false) → X 0 = true →
  ∃ N : ℤ, ∀ k : ℕ, ∃ J, ∀ j ≥ J, evolveFrom X (j + k) (-j) = evolve (j + k - N) (N - j)
```

(with the casts and `toNat` a seeder would add; for `N > 0` take
`J ≥ N`). The seam half, that the agreement holds from the seed's own
onset translated by `N`, needs an onset definition the board does not
have. Consequences: every configuration takes the seed's word at
Rowland's complement-type branch point (his column 53209, our diagonal
53208) and at the next one (58287), so the "other left sides" of
Rowland's tree (next branch at his 72577, ours 72576) are recurrence
solutions that no configuration has been seen to realise; and the settled
centre column of any such configuration is the seed's settled column
`-N` read from the edge, `k ↦ S_k(-N)`, so the settled centre columns
realised by configurations form the seed's family `{k ↦ S_k(n) : n ∈ ℤ}`
and not Rowland's binary tree.

**What it would give.** For the residual, a negative: the region left of
the damage front carries one integer of information about the
configuration, so no statement about the settled region, the seam, or
the strip beyond it can be the lemma that closes this wall. That is the
new obstruction entry. For the board, a computed fact contradicting the
expectation of the only paper that discusses the question: Rowland
conjectured that the eventual *periods* are independent of the row and
called that "likely false", naming 53209 as the counterexample "if in
fact they do occur"; here the periods, the phases, the seam positions
and the transient strip are all the seed's up to `N`, and the
counterexample does not occur in 40 tries.

**Falsification.** Four scripts.

- `explorer/leftsides.mjs` (40 configurations: the seed plus one cell at
  1, 2, 7, 100; blocks of 100 and 3000 black cells; `(10)`, `(100)`,
  `(1000)`, `(110)` repeated; a block at 3000..3999; 20 random right halves
  of width 3000, 4 of width 20000, 4 sparse at density 1/16; each grown to
  139,600 rows, the recurrence orbit run to diagonal 90,000 with branch
  bits read from that configuration's picture, spot-checked against it at
  30 diagonals each). All 40 take, at 53208, a cyclic shift of the seed's
  word `0000110001000001` and branch next at 58287, never at 72576; the
  integer `N` read off the seam (the last black cell) of each of the three
  eventually-white diagonals 53207, 58286 and 87866 is the same at all
  three for 40 of 40 (values from `-123` to `34`); and the cyclic shift of
  the word at 53208 is `-N mod 16` in every case. The seam of 87866 is
  where the period-32 phase is decided, so `N` is checked across two
  levels.
- `explorer/branch53208.mjs`: the four diagonals 53205..53208 over 81
  indices around the seam, actual and settled, are identical cell for
  cell for the seed, the 3000-block (shifted by 1) and a random right
  half (shifted by 2), transient cells included.
- `explorer/frontmargin.mjs` and `frontmargin2.mjs`: row by row, the
  leftmost cell where the configuration differs from the seed's translate
  (the damage front) against the leftmost cell where the seed's translate
  differs from its own settled picture (the seam). Seven configurations to
  row 80,000 and three to 200,000: the seed's seam runs at
  `0.248t`–`0.254t`, the damage front at `0.241t`–`0.246t` once `t ≥ 20,000`,
  and the margin at row 79,000 is 650–760 cells (2270 for the wide block,
  whose front is still accelerating); across the doubling to period 32
  (rows 120,000–180,000) the margin is 490–1428 cells with the same `N`.
- `explorer/translated.mjs`: the configuration "seed plus a cell at 1"
  is the seed on the whole cone at every sampled row, because the right
  edge is black and a difference beyond it never enters; "seed plus a cell
  at 7" matches no translate in `-3..3`, because its `N` is `-58`.

*Survives at the depths tested.* What else could produce the survival,
and what I checked: (a) my first version of this test reported 5 of 16
configurations on "the other side", and it was my labelling: the
solver's branch labels change under the shifts chosen at the doubling
branches, so only cyclic words are comparable; the rewritten test
compares words. (b) The protection of the seam is a **margin, not a
law**: at rows below about 2100 the damage front ran ahead of the seed's
translated seam in 5 of 7 configurations, by up to 68 cells (row 2097).
A complement-type branch at such a depth would be configuration-dependent;
there is none below 53207 (the eventually-white diagonals 2, 7, 28, 399
are all doubling-type, whose two words are shifts of each other and are
absorbed into `N`). The margin grows at about `0.009t` and the front's
fluctuations grow more slowly, so the branches at 53208 and 58287 look
safe and later ones safer, but a configuration built to push its damage
front 3.5 % ahead of the average for 70,000 rows would take the other
branch, and nothing I know forbids one. (c) All 40 configurations have a
bounded right half; a right half with structure at every scale was not
tried. (d) The two front speeds are NKS's `0.2428` (damage) and `0.252`
(regular-region boundary), both measured on random rows, and the same
numbers came out here on the seed's translates, so the margin is the
difference of two averages that were not established as different in
print either.

**Novelty.** Rowland 2006 §5, lines 910–946: the conjecture ("there is
really only one left side of rule 30") is stated for the eventual
periods only, judged likely false, with the branch at 53209 as the
expected counterexample and 58288 / 72577 as the next branches; the
recurrence tree here (`explorer/leftsides_tree.mjs`) reproduces his
three numbers exactly. The translation form, the integer `N`, the seam
strip, and the observation that the counterexample is never realised are
not in any held source. Not held: NKS p. 871, which could contain the
observation; the claim should be read as new to this project's texts.

**Route.** No route to the full claim. It says the damage front between
two configurations aligned by `N` stays inside the seed's transient
band, a statement about two front speeds, and crystals A3 says why no
speed below 1 is provable. Two finite pieces are provable and small: for
a fixed `X` and fixed `k`, agreement of `X`'s diagonal with the seed's
shifted diagonal on a window is a `decide` over `rowCell` and a row model
for `X`; and the statement "if `X` and `Y` agree on diagonals `m, m+1`
from index `J` and diagonal `m+1` is black at `j+1 ≥ J`, they agree on
diagonal `m+2` from `j+1`" is the reset lemma
`bool_driven_periodicFrom_of_reset` with the two orbits in place of
the periodic driver, size S, and is the only mechanism by which
agreement propagates inward.

## 4. What survived

All four candidates survived falsification and the novelty search. I
would seed C1 first, as one S node with the definition
`settledCenter k := leftDiagonal k (2 ^ k)`, because C2 and C3 cannot be
stated without it and its proof is two existing lemmas; then C2 in
diagonal coordinates as the M–L node it is, since it puts `Σ` on the
board as a `Config` and every half-line and Kopra theorem then applies to
it. C3 is a computed fact for the crystals list beside crystal 19, not a
node. C4 is the result of the session: a computed fact that contradicts
Rowland's expectation, with the honest caveat that its mechanism is a
margin between two front speeds; it belongs in the crystals list as
computed, and in `docs/obstructions.md` as the reason the left of the
picture cannot close this wall, which is where I have put it. None of the
four moves the residual, and I say so: the residual lives in the band,
and this session's finding is that the band's left front is the edge of
what the configuration is allowed to influence.

## 5. Claims that died

- *"Five of sixteen configurations take Rowland's other branch at 53208."*
  Died on inspection of the recurrence tree: the solver's branch labels
  are not shift-invariant, and every one of the five was the seed's word
  shifted. Depth: 16 configurations, diagonal 76,000. The corrected test
  is C4.
- *"The settled configurations of all boundaries form a `ℤ₂`-torsor of
  translates of the seed's."* Died reading Rowland §5 and running
  `leftsides_tree.mjs`: complement-type branches (53208, 58287, 72576)
  give words that are not cyclic shifts of each other, so the recurrence's
  solution set is a binary tree, not a torsor. What survives is C4: the
  *realised* settled pictures form the integer translates, i.e. one path
  of the tree.
- *"The branch at a complement-type point is decided by settled values of
  the drivers."* Died at 53208: the driver diagonal 53206 settles at
  17910 and the eventually-white diagonal 53207 at 17909, so the last
  reset of 53208 reads a transient cell of its driver. The branch is
  inherited because the whole seam strip is inherited, not because the
  settled words force it.
- *"The damage front never enters the seed's transient band"* as a law.
  Died at rows 479–2097: margins of `-57`, `-32`, `-68` cells in five of
  seven configurations (`frontmargin.mjs`). It is a margin that grows
  with `t`.
- *"The reset front bounds the onsets usefully."* `R_0 = R_1 = 0`,
  `R_k` = the first black cell of `S_{k-1}` after `max(R_{k-1}, R_{k-2})`,
  or that maximum plus the period when `S_{k-1}` is white, computed from
  the recurrence alone (`explorer/resetfront.mjs`). The bound `o_k ≤ R_k`
  holds at all 59,999 diagonals checked and follows from
  `leftDiagonal_periodicFrom_step_of_black` and
  `leftDiagonal_periodicFrom_step` by induction, but `R_k ≥ k` by
  construction (each step advances by at least one) and `R_k / k = 2.00`
  measured, while `o_k / k = 0.336` and `o_k = R_k` at none of the 59,999.
  Diagonals settle before their drivers do, because a black cell on a
  diagonal masks its driver's value through the `||`; the reset is not
  the mechanism of settling, so no bound built on resets alone can reach
  the onset wall `leftDiagonal_onset_le`.
- *"`s` differs from `c` only where the onset is positive, so the
  agreement rate says something."* It says nothing: `0.500` in every block,
  and `s(0..17) = c(0..17)` is the zero-onset prefix.

## 6. Next topic

The next attack on this wall should leave the left of the picture alone
and go to the band: specifically to the *masking* mechanism just named,
because it is the one local law of the transient band that is both
provable and not on the board. Diagonal `k` settles before its drivers
settle (`o_k < max(o_{k-1}, o_{k-2})` for most `k`, the seam of 53207 one
index before its driver's), and the only way that can happen is that a
black cell of diagonal `k` at index `i` makes `D_k(i+1)` independent of
`D_{k-1}(i+1)`. The lemma "if `leftDiagonal (m+2) i = true` and diagonal
`m` agrees with its settled word at `i+2`, then diagonal `m+2` at `i+1`
agrees with the settled word's recurrence value whatever diagonal `m+1`
holds" is a one-line consequence of `leftDiagonal_recurrence`, and a
front built from it, unlike the reset front, can move slower than one
index per diagonal, which is what `leftDiagonal_onset_le` needs and what
the measured `0.336` says is true. I would ask the theorist to compute
that front from the settled words and the seed's own diagonals, measure
it against the onsets to 60,000 as `resetfront.mjs` does for the reset
front, and say whether it is the seam. If it is, the onset wall has a
decomposition into a provable propagation lemma and a statement about a
recurrence-defined sequence; if it is not, the seam depends on the band
and the two front speeds of C4 are the right object, and the question
becomes why the seed's seam runs at `0.252t` while every damage front
runs at `0.243t`.
