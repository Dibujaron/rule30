# Obstructions

Known dead ends, one per entry: the claim someone would naturally try, why
it fails, and what it would take. Read by theorist and seeder sessions
before they propose anything. Maintained by Rowan and by theorists, who
may append an entry and may correct a factual error in one; an obstruction
that has been overcome is never rewritten or removed, it gets a new entry
saying so and citing the sha that opened the route.

Every entry has the same four parts, so a reader can skim the first two
and stop.

## The diagonal structure never reaches the centre column

**The natural attempt.** Every left diagonal is eventually periodic with a
known period bound (`leftDiagonal_periodicFrom_pow`, and after
`leftDiagonal_step_period_dichotomy` a criterion for when the period grows).
The centre column is made of one cell from each left diagonal, so use the
periodic structure of the diagonals to say something about the centre
column.

**Why it fails.** The centre cell at time `t` is `leftDiagonal t 0`: index
zero of diagonal `t`. A diagonal is periodic only from its onset, and the
onset is at least one for every diagonal past the third (computed, not
proved: `leftDiagonal_onset_le` is still a wall), so index zero is
in the transient of every diagonal it belongs to. The same holds for the
right diagonals: `rightDiagonal t 0` is again the centre cell, at the start
of that diagonal. Every diagonal theorem on the board is about the part of
the picture that has settled; P1 is a question about the part that has not.
Time runs down the picture, and the diagonals settle from the outside in,
so the centre column is exactly the seam where nothing has settled yet.

**What it would take.** A statement about the transients: the cells of
diagonal `k` before its onset, as a function of `k`. Nothing on the board
or in the literature says anything about them beyond the onset bound
`2 ^ k` and the measured onset near `k / 2`. A theorem of the shape "the
first cell of every left diagonal is determined by the transients of the
two diagonals above it and by its own previous cell" is true by
`leftDiagonal_recurrence` and says nothing, because that previous cell at
index zero is the centre cell itself: the recurrence closes on the very
cell it was meant to explain, and the transients of the two diagonals
above are themselves unknown.

**Recorded** 2026-09-07 by Rowan, from the notebook entry of 2026-09-06
that first stated it.

## The centre column as a boundary condition

**The natural attempt.** Each cell at `x ≥ 1` reads only cells at
`x - 1, x, x + 1 ≥ 0` one step earlier, so the strip of columns `x ≥ 1`,
started all white, is a deterministic function of the centre column alone;
the same holds for `x ≤ -1`. So state the residual about that half-line
automaton: "a periodic boundary sequence gives an aperiodic column 1", and
prove it about sequences, forgetting that the boundary is the centre of
the single seed.

**Why it fails.** The statement about sequences is false. For the boundary
`b ≡ true` the right half-line reads, in columns 1, 2, 3, …:
`000…, 100…, 010…, 011…, 0101…, 01011…, 010101…`, and once column 1 is
white and column 2 black they stay so (`1 xor (0 || 1) = 0`,
`0 xor (1 || _) = 1`): columns 1 and 2 are constant from row 2. The left
half-line for the same boundary is constant too (`col(-1) ≡ 0`,
`col(-2) ≡ 1`, alternating outward). The full configuration is
`…1010 1 | 000…`, the `(01)^ℤ` fixed point meeting white, every column
eventually constant, violating nothing: Jen's and Kopra's theorems need a
configuration white far to the left, and this one is not. Hand-checked to
row 6 and closed by the two-line induction, 2026-09-07 (Sextant); script
text in `docs/attacks/2026-09-07-centercolumn-other-iseventuallyperiodic-of-center.md`.

**What it would take.** Any proof of the residual must carry the white
cone on the left into the argument: the pair `(column 0, column 1)`
solved leftward by `evolve_sub_one_eq_xor` must be white outside the cone
and black on its edge. That is exactly what closes the width-2 case, and
at width 1 the sideways inverse has a free input at every time the centre
is black, so nothing propagates. A statement about the centre column that
does not mention the left cone, however plausible, cannot be the lemma
that closes this wall.

**Recorded** 2026-09-07 by Sextant, from the attack document of the same
date.

## Counting the right sides consistent with the centre column

**The natural attempt.** The pair `(column 0, column 1)` under the cone
constraint looks like a finite counting problem: for a periodic centre
column `c`, count the prefixes of column 1, or the windows `X(1..T)` of a
configuration white on `x ≤ -1`, whose column 0 agrees with `c` to depth
`T`, and hope the count stays bounded in `T`, so that column 1 is forced
and the wall falls. The attack document of 2026-09-07 on
`centerColumn_other_isEventuallyPeriodic_of_center` proposed exactly this
in its last section.

**Why it fails.** The count doubles at nearly every step for any column
that survives at all, because a cell at position `k > 0` cannot change
column 0 before the damage front from it has walked left to the origin,
which takes about `4k` rows at the measured front speed of `0.24`. So at
depth `T` the cells beyond a horizon of order `T/4` are unconstrained and
the count measures the horizon, not the column. For the single seed's own
centre column the count of windows white on `x ≤ -1` reads
`1, 2, 4, 5, 10, 20, 40, 67, 89, 178, 356, 456, 912, …, 215264` at
`T = 0..21` (`explorer/whiteleft.mjs`). The complementary object, the
number of distinct column words of length `t + 1` realisable by *some*
window white on `x ≤ -1`, is `3, 4, 6, 8, 10, 12, 15, 19, 24, 31` for
`t = 1..10` and `153` at `t = 22` (`explorer/numberlikewords.mjs`): a
factor `15` between `t = 5` and `t = 22`, which fits a rate near
`2^0.24` per step, the measured left front speed, as well as it fits a
low power of `t`; either way it is a complexity, and it says which words
occur, not how many times. Neither number is about column 1.

**What it would take.** A bound below `1` on the speed of the left damage
front for the single seed, which `blueprint/crystals.md` (A3) says not to
seed because the worst case is speed exactly `1`; and even with it the
count bounds a horizon at finite depth, where the residual is a statement
about all of time. The informative object is not a count but a single
identity: at every black time of column 0, column 1 drops out of the rule
at the origin and the next centre cell is the complement of column -1,
which the half-line `x ≤ -1` computes from column 0 alone
(`explorer/periodicleft.mjs`, `explorer/sparseleft.mjs`). One correction
to the entry above this one: "the left half-line for the same boundary is
constant too" is true of the fixed-point row `…1010 1 | 000…`, not of the
half-line grown from a white start with boundary `b ≡ true`, whose rows
1..5 read `1`, `11`, `011`, `0011`, `11011` (cells `-1` rightmost).

**Recorded** 2026-09-07 by Sextant, from the attack document
`docs/attacks/2026-09-07-centercolumn-other-iseventuallyperiodic-of-center-the-pair-of-columns-0-and-1-under-the-cone-constraint.md`.

## The settled part of the left diagonals does not depend on the centre column

**The natural attempt.** The residual is about a periodic centre column,
and the centre column is the boundary that drives the half-line `x ≤ -1`.
Every left diagonal of that half-line is eventually periodic, with the
same recurrence and the same period-doubling criterion as the seed's, so
look for the signature of a periodic boundary in the settled parts of the
diagonals: their periods, their onsets, the words they settle into, or the
places where the period doubles, and hope some statistic of the settled
region is impossible when the boundary repeats.

**Why it fails.** The settled region carries almost no information about
the boundary at all. Write `S_k` for the periodic function on `ℤ` that
diagonal `k` agrees with from its onset on. Because the diagonal
recurrence `leftDiagonal_recurrence` holds on the settled words for every
index, `S_k` is the *unique* periodic solution driven by `S_{k-2}` and
`S_{k-1}` whenever `S_{k-1}` has a black cell (the reset lemma
`bool_driven_periodicFrom_of_reset` is the uniqueness), and one of exactly
two solutions when `S_{k-1}` is white: a shift by half the new period
when the period doubles, a complement when it does not. So the whole
settled region of any configuration white far to the left is the seed's
up to a shift along the diagonals, chosen by one bit at each
eventually-white diagonal; those are at `k - 1 = 2, 7, 28, 399, 53207,
58286, 87866` below `k = 200,000` (`explorer/forbit.mjs`, which runs the
recurrence alone and reads the picture only at those seven places, and
reproduces NKS p. 871's doublings and Rowland 2006's branch at his
column 53209). Rowland 2006 §6 states the observation ("there is really
only one left side of rule 30") and its proof idea. Measured on twenty
boundaries, periodic, random and degenerate, to diagonal 2,400
(`explorer/boundarysettled.mjs`): every settled word is the seed's up to a
shift, the branch points are at the same `k`, the periods are identical,
the onsets grow at `0.26k`–`0.33k` for all of them, and the boundary
disagrees with its own settled picture at the centre at rate `0.48`–`0.52`
whether it is the true column, a random sequence, `(10)^∞`, or a single
pulse per 155 steps. A periodic boundary is invisible in every statistic
of the settled region.

**What it would take.** A statement about the deviation `E = picture xor S`,
which is the transient region: `S` is itself a rule 30 evolution (of the
row `Σ(x) = S_x(-x)`, `x ≥ 0`, white on the left; `explorer/settledpicture.mjs`),
so `E` is the damage pattern between two evolutions of number-like
configurations, its left front is the regular-region boundary (measured
at `0.20t`–`0.235t` to `t = 2,000`), and the residual is the statement
that the boundary column of that damage pattern, `c xor s` with
`s(t) = S_t(0)`, cannot be `s xor (periodic)`. Nothing on the board or in
print bounds a left damage front (crystals A3), and nothing is known about
`s`. What the settled region *does* determine is itself: no two pairs of
adjacent left diagonals ever eventually agree, so the eventual periods
are unbounded (the attack document's C1, C2); that is a fact about the
region the residual does not live in.

**Recorded** 2026-09-07 by Sextant, from the attack document
`docs/attacks/2026-09-07-centercolumn-other-iseventuallyperiodic-of-center-the-transients-of-the-left-diagonals-under-a-periodic-boundary.md`.
One correction to the entry above: its rows `1`, `11`, `011`, `0011`,
`11011` are written with cell `-1` leftmost, not rightmost.

## The left of the picture knows one integer about the configuration

**The natural attempt.** The entry above says the settled words carry no
trace of the boundary. The seam between the settled region and the
transient band, and the first cells of the transients beyond it, are not
periodic, so look there: the position of the seam on each diagonal, the
transient cells just inside it, and above all the choice at Rowland's
complement-type branch points (his column 53209, our diagonal 53208,
where the settled word has two candidates that are not shifts of each
other) all look like places where a configuration, and so a periodic
boundary, could leave a signature. Rowland 2006 §5 expected exactly this:
"one surmises that in fact there are infinitely many possible left sides
of rule 30".

**Why it fails.** For every configuration white far to the left that was
tried (40 of them: single added cells, blocks, periodic right halves,
random right halves of width 3,000 and 20,000, sparse ones), there is one
integer `N` between `-123` and `34` such that the configuration's picture
is the seed's picture translated by `(t, x) ↦ (t + N, x - N)` on the
whole region left of a front at about `0.243 t` from the origin, and the
seam runs at `0.252 t`, so the region that is the seed's includes every
settled cell, every seam, and a strip of the transient band. The
complement-type branches at 53208 and 58287 are inherited from the seed
by all 40 (the word is a cyclic shift of the seed's, the next branch is
at 58287 and never at Rowland's 72577), the seams of the eventually-white
diagonals 53207, 58286 and 87866 are the seed's shifted by the same `N`
for all 40, and the four diagonals around the seam of 53207 are the
seed's cell for cell, transient cells included, in every one looked at
(`explorer/leftsides.mjs`, `branch53208.mjs`, `translated.mjs`,
`frontmargin.mjs`, `frontmargin2.mjs`; rows to 200,000). The picture of a
configuration is `τ_N(seed)` plus damage from the right whose front runs
slower than the seed's own seam. So the settled centre column of every
configuration is the seed's settled column `-N` read down from the edge,
and nothing left of the damage front distinguishes one boundary from
another beyond `N`. A periodic boundary, if one existed, would have a
left side that is the seed's translated, like every other.

**What it would take.** The statement is a margin, not a law: below
row 2,100 the damage front did run ahead of the seed's translated seam
(by up to 68 cells), and the margin at row 79,000 is 650–760 cells,
growing at about `0.009 t`; a configuration built to keep its damage
front 3.5 % ahead of the average for 70,000 rows would take the other
branch, and no bound on a left front is available (crystals A3). So the
left side cannot be *proved* universal either. Either way the residual
is a statement about the band right of the damage front, where the
right half-line and the black-time identity live, and a lemma that
mentions only diagonals, seams or settled words cannot close it. What
the region does leave open is the integer `N` itself: it is decided in
the first few thousand rows by the interaction of the right side with
the left, and nothing is known about it as a function of the
configuration.

**Recorded** 2026-09-07 by Sextant, from the attack document
`docs/attacks/2026-09-07-centercolumn-other-iseventuallyperiodic-of-center-the-centre-column-of-the-settled-configuration.md`.

## Iterating the reset lemmas builds a front that cannot retreat

**The natural attempt.** The board has two ways to carry periodicity from
two adjacent left diagonals to the next one in: the reset lemma
`leftDiagonal_periodicFrom_step_of_black` (a black cell of the middle
diagonal at index `j + 1` makes the next diagonal periodic from `j + 1`)
and the white branch of crystal 45 (the onset moves by one index when the
middle diagonal is white from there on). Iterate them from the edge: the
onset of diagonal `k` is at most the first black cell of diagonal `k - 1`
past the larger of the two drivers' onsets. Bound that first-black gap and
`leftDiagonal_onset_le` follows by induction on `k`.

**Why it fails.** The iteration is a front in the picture that can only
move down and left, and the true seam is a damage front that retreats. Put
`S` for the settled picture (crystal 47, an evolution of the settled row)
and `E = picture xor S` for the transient band; its left edge
`F(t) = min { x : E(t, x) = 1 }` is the leftmost difference between two
rule 30 evolutions, so `rule30_left_local_law` (crystals A2) governs it
exactly: it advances one cell when the settled cell beside it is white and
otherwise stays or retreats. The front rides one diagonal at speed 1 along
a white run of the neighbouring settled word and leaves it for good at the
next black cell, so the onset of every diagonal the front visits *is* the
reset lemma's value, with no slack (60,065 of 60,065 visited diagonals
below 110,000; `explorer/maskfront.mjs`, 160,000 rows). But the front
visits only 55 % of the diagonals: it retreats on 26 % of the rows, by up
to 11 cells in one row, and every retreat skips diagonals whose last
transient is then killed inside the band, mostly by two transients meeting
in one `||` (68 %) and only 4 % of the time by a black settled neighbour.
The skipped diagonals settle at indices *below* their drivers' onsets
(47,343 of 49,917 skipped diagonals settle strictly before their neighbour;
no visited diagonal does), and the next visited diagonal inherits that low
index as its arrival point. An induction on `k` with a monotone bound
cannot see a decrease, so it compounds: the reset front measures `2.00 k`
against onsets of `0.336 k` (`explorer/resetfront.mjs`). The wall itself
is exactly a bound on the front: `leftDiagonal_onset_le` holds for all
`k` if and only if `2 F(t) + t ≥ 1` for all `t`, that is, the seam never
runs faster than half a cell per row. Measured to 160,000 rows it runs at
`0.2497`, with the worst window at `0.2568` (row 38,460), and the worst
onset ratio `0.3455` at diagonal 28,584 is that same event seen along a
diagonal.

**What it would take.** A bound on the speed of one damage front, between
the seed and the settled row, below `1/2`. Crystals A3 says no such bound
is provable for arbitrary pairs; this pair is special (its common left part
is the settled region, all power-of-two periodic words), and nothing is
known that uses that. Wolfram 1986 §5 gives the front's local law in words
and a biased-random-walk estimate of `1/4`, and §6 attributes the
regular-region boundary to it by analogy; the measured decomposition here
is `0.59` advances, `0.15` stays, `0.26` retreats averaging `1.30` cells,
which is not his walk and gives the same `1/4`. Nothing about the front
touches the centre column, which is the band's other edge.

**Recorded** 2026-09-08 by Sextant, from the attack document
`docs/attacks/2026-09-08-centercolumn-other-iseventuallyperiodic-of-center-the-masking-mechanism-in-the-transient-band-why-a-diagonal-settles-before-its-drivers.md`.

## A universal bound on the recurrence's hitting times cannot prove the period wall

**The natural attempt.** `leftDiagonal_period_le` says the period of
diagonal `k` is at most `k + 1`; since the period is `2^n` after the
`n`-th doubling, it says the `n`-th doubling sits at a diagonal
`k_n ≥ 2^n - 1`, that is, the gaps between doublings grow. The settled
words are an orbit of the diagonal recurrence on pairs of periodic words
(Rowland 2006 §6; `explorer/forbit.mjs`), the period changes only at an
eventually-white diagonal (`S_m = 0`, which happens exactly when
`S_{m-1}` is `S_{m-2}` shifted by one, `explorer/scratch_whitestep.lean`),
and the word right after a white is fixed by the recurrence. So prove, for
the finite system of all words of period `L`, that from the state "white,
then `w`" the next white is at least `L` diagonals away; the wall follows
by induction on the doublings without ever knowing which word the seed
holds.

**Why it fails.** The statement is false for the finite system at every
period. For every even `L` from `8` to `128` the word `1^(L-5) 0 0 1 0 0`,
of exact period `L`, returns to a white in exactly `8` diagonals
(`explorer/hitting.mjs`, exhaustive to `L = 16`; `explorer/hitting2.mjs`,
two implementations, to `L = 128`); at `L = 16`, `96` of the `65,280`
words of exact period `16` reach a white within `16` steps, and the
smallest hitting times come in structured families (`5, 7, 8, 13, 16, 21,
29, 32, 41, 57, 58` are the only values below `64`). The words a doubling
actually produces are antiperiodic (shift by `L/2` complements them), and
none of them reaches a white within `2L + 8` steps for `L ≤ 32`
(`hitting2.mjs`, `65,536` words at `L = 32`), but that survival is what a
geometric law with mean `2^L` gives for the `2^(L/2) / L` shift classes
(`hitting3.mjs`: minima `88, 6343, 414989` at `L = 8, 16, 32` against a
null of `128, 4096, 2 · 10^6`), and the orbit forgets the antiperiodicity
four diagonals after the doubling (`explorer/orbitclass.mjs`). What the
finite system does give is the opposite bound: every pair has exactly one
predecessor, so the segments from each start to the next white are
disjoint inside the `4^L` pairs, the *average* gap is at most `2^L`
(measured `1.000 · 2^L` at `L = 16`, all `65,534` words,
`explorer/meansum.mjs`) and no gap exceeds `4^L`. That is why the gaps
grow (whites are a `2^-L` fraction of a space walked without repetition:
the seed's gaps `5, 21, 371, 52808, 1.42 · 10^9` after each doubling sit
within a factor `3` of `2^L`), and it is an upper bound where the wall
needs a lower one.

**What it would take.** A lower bound on the hitting times of *one* orbit,
the seed's, at words nothing distinguishes from the others: the wall holds
at level `n` unless the seed's orbit enters a set of density about
`2^(-2^n)` within `2^n` steps of a doubling, a probability that sums to
less than `0.07` over all `n ≥ 3` and to nothing anyone can prove. The
known values give slack to `k < 2^31`: the sixth doubling is at
`2,107,985,255` (NKS p. 871, reproduced from the recurrence alone in
`explorer/orbit32.mjs`, which also finds the seed's eighth eventually-white
diagonal at `1,420,878,968`, complement type, not in print). A proof would
need either an invariant of the seed's words at the whites, of which none
is visible, or a different reading of the wall altogether.

**Recorded** 2026-09-08 by Sextant, from the attack document
`docs/attacks/2026-09-08-leftdiagonal-period-le-the-period-wall-through-the-orbit-of-the-recurrence-alone-why-the-gaps-between-eventually-white-diagonals-grow.md`.

## A universal argument over periodic words cannot give the right diagonals' minimality

**The natural attempt.** Every right diagonal is exactly periodic from index
`0` with no transient, and `rightDiagonal_recurrence` makes diagonal `k` the
running XOR of the driver `g_k j = rightDiagonal (k-1) (j+1) || rightDiagonal
(k-2) (j+2)`. With `L` a common period of the two shallower diagonals, the
doubling criterion says the minimal period of diagonal `k` is `2L` when the
driver has odd weight over `[0, L)` and `L` when it is even. The odd branch
is elementary. For the even branch, "the minimal period is `L`" is exactly
"the driver has no period shorter than `L`", so prove *that* for every pair
of periodic words: given `v` of exact period `L` and `u` of period dividing
`L`, show `j ↦ v (j+1) || u (j+2)` has exact period `L`.

**Why it fails.** The statement is false for the finite system at every
period. Exhaustively, at `L = 4`, `64` of the `192` pairs with `v` of exact
period `4` give a driver of shorter period, and `56` of them give an
integrated word of minimal period below `4`; the smallest witness is
`u = 1000`, `v = 1110`, whose new diagonal has period `2`. At `L = 8` the
rates are `8,704` and `6,272` of `61,440` pairs (`14 %` and `10 %`);
sampled, `1.35 %` at `L = 16`, `0.027 %` at `L = 32`, and none in `400,000`
samples at `L = 64` (`explorer/sextant_rightdriver.mjs`, test B). The rate
falls like `2^(-0.37 L)`, so the seed's survival to `L = 2^27` is what a coin
would do, and it carries no evidence of a mechanism — the same shape as the
hitting-time obstruction above, with a different witness set. What the seed's
own words do give, and no universal statement does, is the *structural* half:
where the previous depth doubled, `rightDiagonal (k-1)` is antiperiodic at
`L/2` and the driver then loses its period only if `rightDiagonal (k-2)` is
constantly black, which no right diagonal past the edge is; that closes every
depth that follows a doubling (attack document, C4) and leaves the interior of
a plateau — a run of consecutive depths with equal periods — where both
feeding diagonals fail half-periodicity and can cover for each other.

**What it would take.** A pairing law between two adjacent right diagonals of
the *seed*, of the kind the forbidden block (`crystals` 8) is for two adjacent
cells of a row: on a plateau a collapse needs, at every position, one of three
local coincidences (only `R_{k-1}` flips under the half shift and `R_{k-2}` is
black there; only `R_{k-2}` flips and `R_{k-1}` is black; both flip and they
differ), and the measured number of positions where all three fail is `0.16 L`
to `0.25 L` at every plateau depth to `k = 54`. Nothing on the board relates
two neighbouring right diagonals except the recurrence itself, which is what
the counterexamples above satisfy.

**Recorded** 2026-09-08 by Sextant, from the attack document
`docs/attacks/2026-09-08-falsify-rightdiagonal-period-doubles-iff-odd-weight-the-minimal-period-of-right-diagonal-k-is-2l-when-g-k-has-odd-weight.md`.

## The flat right-diagonal tower is a real picture, so no argument from the right half alone can work

**The natural attempt.** The right diagonals are the well-behaved half of the
picture: no transients, every diagonal periodic from its very first cell with
a period dividing `2^k`, and a clean recurrence
`R_k (j+1) = R_k j ^^ (R_{k-1} (j+1) || R_{k-2} (j+2))` that builds each one
from the two outside it. So settle the questions about them — do the periods
grow, is the doubling criterion tight — inside that structure: from the
recurrence, from the two known diagonals `R_0 = 1^∞` and `R_1 = (10)^∞`, and
from whatever else the right-hand side of the picture supplies.

**Why it fails.** The recurrence integrates a driver, so it fixes each
diagonal only up to the constant `R_k 0`, which is the centre column at time
`k`; choosing every constant black gives a tower of period `2` at every depth,
which `rightDiagonal_not_constant` does not exclude, since `(10)^∞` takes both
values. That much was recorded as C5 of the attack document of the same
morning. What is worse, and is this entry: **that flat tower is not an
abstract solution, it is an actual rule 30 picture.** It is the picture of
`… 1 0 1 0 1 | 0 0 0 …` — the `(01)^ℤ` fixed point meeting white at the origin,
the same configuration that killed the sequence-level residual in the second
entry above. That configuration is white at every `x ≥ 1`, black at `0`, has
the same right edge as the seed and the same initial row from the origin
rightward; its right diagonals are `R_0 = 1^∞` and `R_k = (10)^∞` for every
`k ≥ 1` (0 failures over 200 diagonals × 1,000 terms), and its picture is a
travelling wave, `cell (t+p, x+p) = cell (t, x)` identically for every even `p`
(0 failures over ~250,000 sampled cells at each of `p = 2, 4, 6, 16, 64, 512`;
`explorer/sextant_ru_flat.mjs`). So no property of the recurrence, of the two
edge diagonals, of the initial row at `x ≥ 0`, or of any statistic computed
from the right half of the picture can decide whether the right-diagonal
periods grow: all of them are shared by a picture where the periods do not.

**What it would take.** The left tail, and only the left tail. The property
that separates the seed from the witness is the existence of a *leftmost black
cell*: the seed's left edge moves left at speed 1, so the row at time `p` slid
left by `p` differs from row `0`, and the witness's does not. That is enough —
`explorer/scratch_rightunbounded_proof.lean` proves from it that no `p > 0` is
a period of every right diagonal, using `evolve_left_edge`,
`evolve_right_edge`, `evolve_eq_false_of_outside_cone` and
`rightmost_difference_moves_right`, all closed nodes. So this entry is a dead
end for one class of route and an open door for another: questions about the
right diagonals are questions about the *whole* picture's translation
symmetry, and the answer comes from the cone, not from the tower. Note what
this does *not* give: the converse half of Rowland's remark that his sequence
`a(n)` "characterizes the period lengths of the diagonals on the right side"
(rowland-2006, line 131) — that the periods double at `a(n)` and *nowhere
else* — is untouched by the cone argument and remains open.

**Recorded** 2026-09-08 by Sextant, from the attack document
`docs/attacks/2026-09-08-rightdiagonal-minimal-periods-are-they-unbounded-given-that-the-recurrence-alone-cannot-decide-it-your-own-c5-is-the-sta.md`.

## An eventually periodic centre column does not force another periodic column, so the residual is false without the left cone

**The natural attempt.** The residual of P1 is an implication whose
hypothesis is about a *sequence*: the centre column repeats. The right half
of the picture is a deterministic function of that sequence alone (a cell at
`x ≥ 1` reads only cells at `x ≥ 0`, and row 0 is white there), so strengthen
the implication by forgetting where the sequence came from. Let `X_b` be the
configuration that is white at every `x ≥ 1` at time 0 and whose centre column
is `b` — it exists and is unique by crystal 40, and the seed is `X_c` for
`c = centerColumn`. Prove: *for every eventually periodic `b`, some column of
`X_b` other than column 0 is eventually periodic.* That is what an induction
on the half-line, or any argument over the finite system of periodic words,
would actually deliver, and it implies the residual with room to spare. The
second entry above kills the opposite direction ("a periodic boundary gives an
*aperiodic* column 1") with the witness `b ≡ true`; this is the direction the
residual needs.

**Why it fails.** It is false, and the smallest non-constant periodic boundary
already witnesses it. For `b = (10)^∞`, `X_b` has **no** eventually periodic
column other than column 0. Columns 1 and −1 decide the question — any other
eventually periodic column drags one of them in by
`evolve_isEventuallyPeriodic_of_between` — and neither has an eventual period
`q ≤ 10^5` with onset `≤ 2.5 · 10^5` at depth `5 · 10^5`
(`explorer/talus_witness.mjs`); the range `−24 … 24` is clear at depth
`1.5 · 10^5` for every lag `≤ 2 · 10^4` (`explorer/talus_other.mjs`); and,
decisively, column 1 has **998,977 distinct factors of length 1024 in a tail of
length `10^6`** — every window in the tail distinct — so by crystal 21 any
eventual period with onset below `10^6` exceeds 998,977, which is more than the
tail holds (`explorer/talus_defect.mjs`). The death is typical, not special: of
the boundaries of period 5, 7 and 9, only 2 of 32, 2 of 128 and 8 of 512 are
"good" (have another eventually periodic column), while at periods 4, 8 and 10
the fractions are 0.88, 0.27 and 0.17, with no pattern found
(`explorer/talus_class.mjs`, sweep at `T = 3000`, confirmation at `T = 3 · 10^4`;
two of the eight large-onset survivors then failed at `T = 1.2 · 10^5`, so the
counts are upper bounds). The engine behind all of this was checked against the
seed's own right half (0 mismatches, 400 rows × 8 columns), against an
independent BigInt implementation (0 mismatches, 40 boundaries), against a
full-line evolution of `X_b` rebuilt as a real row (0 mismatches on columns 0
and 1 over 3,000 rows, seven boundaries), and against the board's own
`evolveHalfRight` **by the Lean kernel**
(`explorer/talus_scratch_halfline.lean`, accepted by `lake env lean`).

Two things sharpen the entry. First, the counterexample is not a chaotic
picture but a quasi-periodic one: column 1 of `X_{(10)^∞}` has only 48 distinct
factors of length 32 where the seed's centre column has 499,949 in the same
tail length — a periodic boundary buys a locally regular picture punctured by
defects whose positions are random. That does *not* let the seed off, because
under the residual's hypothesis the seed's own centre column would have
complexity at most `p` too. Second, and this is what closes the route rather
than merely denting it: the only property of the seed that the counterexample
lacks is that the seed is white far to the left — and that property is exactly
the hypothesis of Jen's theorem and Kopra's Theorem 3.5, both of which conclude
that at most one column is eventually periodic, i.e. the *opposite* membership.
So the residual cannot be proved from the boundary's periodicity, and the one
extra ingredient available proves the other side. Relatedly and worth saying
plainly: given `not_isEventuallyPeriodic_pair`, which is proved and
unconditional, the wall `centerColumn_other_isEventuallyPeriodic_of_center` is
*logically equivalent* to `¬ IsEventuallyPeriodic centerColumn`, so it is not a
residual of P1 but P1 in implication clothing, and the same holds for
`centerColumn_right_isEventuallyPeriodic_of_center` and every "column `j`"
variant.

**What it would take.** A rewriting of the wall that does not pass through
Jen's theorem, so that it still says something in a family where the hypothesis
is satisfiable, plus a property separating the good boundaries from the bad.
Two such rewritings are available and cheap, both from closed nodes. (i) The
existential collapses: given the centre column eventually periodic, "some
column `j ≠ 0` is eventually periodic" is equivalent to "column **−1** is",
by `evolve_isEventuallyPeriodic_of_between` walking any `j` inward and
`evolve_period_sub_one` turning the pair (0, 1) into column −1. (ii) Half of
that column is already settled: at every black time of the centre column,
`column_succ_of_black` pins `column (-1) t = ! centerColumn (t+1)`, which is
periodic; so the wall is exactly "column 1, read at the *white* times of the
centre column, is eventually periodic", and the black times of column 1 are the
entire difference between the frontier wall and the column-1 wall. That
difference is realised: for `b = 11111110`, `X_b` has column −1 exactly
8-periodic from index 0 and column 1 not eventually periodic
(`explorer/talus_pm1.mjs`, `talus_sep.mjs`, `talus_residue.mjs`, checked on a
real picture and to depth `2 · 10^6`). What is missing is the separating
property, and nothing about the good set is known — not whether membership is
decidable from `b`, not whether it is closed under rotation (the data says yes;
only the boundaries starting white are explained, by `X_{σb}` being row 1 of
`X_b`'s picture, verified at 0 mismatches in `explorer/talus_rotate.mjs`).

**Recorded** 2026-09-08 by Talus, from the attack document
`docs/attacks/2026-09-08-the-residual-itself-prove-that-an-eventually-periodic-centre-column-forces-some-other-column-to-be-eventually-periodic-t.md`.

## The centre column does not separate finite configurations: the right-edge shield

**The natural attempt.** The weakest case of the coboundary statement (Portage's
free companion: no `x ≠ 0`, `j` makes `t ↦ centerColumn t XOR evolve (t+j) x`
eventually periodic) is the case where the difference is eventually *zero*.
Written out, `d = 0` from row `N` says the two finite configurations
`A = evolve N` and `B = (row N+j slid x cells sideways)` have the same centre
column at every time; and `A ≠ B` whenever `(j, x) ≠ (0, 0)`, because their cone
edges sit at different places (`evolve_left_edge`, `evolve_right_edge`: `A = B`
forces `x = -j` from the left edges and then `j = 0` from the right). So prove
that the centre column *separates* finite configurations — two distinct
configurations of finite support cannot have the same centre column for ever —
and the whole `p = 1` case falls, for every `x` and `j` at once. The board even
has the shape of it already: `config_eq_of_right_and_column` says two rows that
agree strictly right of the origin and share a centre column are equal, so all
that is wanted is to weaken "agree on the right" to "both are finite".

**Why it fails.** The separation statement is false, and provably. Let `X` be
any configuration whose rightmost black cell `r` is *isolated* (white at
`r - 1`), and let `Y` be `X` with one extra black cell at `r + 1`. Then at every
row `t` the two pictures agree at every position `< r + t`: the difference never
leaves a two-cell strip riding the right edge, so `X` and `Y` have the same
centre column for ever. Proved in the kernel,
`explorer/sextant_scratch_shield_general.lean` (`shieldGen_invariant`,
`shieldGen_same_column`; axioms `propext, Quot.sound`), and for the seed
against `{0, 1}` in `explorer/sextant_scratch_shield.lean`. The mechanism is
`rule30_left_local_law` (crystals A2): a difference at `i` spreads to `i - 1`
only when the cell at `i - 1` is white, and this difference has the picture's
own black right edge on its left at every row, so it can never step left — it
rides the edge instead. The isolation hypothesis is exactly the base case of
that induction and is exactly right: over all 16,384 configurations with cells
in `[0, 15)` and a black cell at 0, "the rightmost black cell is isolated" and
"the centre column is unchanged by the added cell" agree 16,384 of 16,384 times,
in both directions, at `r + 1` and at `r + 2`, and adding at `r + 3` changes the
column in every one of the 16,384 (`explorer/sextant_shieldrule.mjs`, depth
1,200). The class is not two configurations but infinitely many, and that is
proved too: both the `r + 1` and the `r + 2` move preserve the whole picture
left of the edge (`shieldGen_same_column`, `shieldGen2_same_column`), the
`r + 2` move leaves the new rightmost cell isolated so it can be repeated, and
the chain `{0}`, `{0,2}`, `{0,2,4}`, … therefore consists of pairwise distinct
finite configurations all of which have the seed's own centre column from row 1
on (`chainCfg_center_column`, `chainCfg_injective`, same file; measured first at
400 members to `k = 200`, depth 1,200). Inside a window the two moves appear to
generate the class exactly: of the subsets of `{1, …, 12}` and of `{1, …, 16}`
added to the seed, exactly 12 of 4,095 and exactly 16 of 65,535 preserve the
centre column to depth 3,000, and in both cases they are precisely the ones the
two moves generate, with nothing extra and nothing missing
(`explorer/sextant_shieldclass.mjs`). The collisions were found first by enumeration —
`explorer/sextant_colsep.mjs`, every configuration supported in a window, sorted
by centre column: 65,536 configurations in `[0, 16)` at depth 320 collide, and
every colliding pair differs only at or past its own rightmost black cell.

**What it would take.** For the `d = 0` case, an argument that uses *which* two
configurations these are rather than only that they are distinct and finite: the
shield pairs differ at the right edge, where the seed's family `(A, B)` differs
in its interior when `x ≠ j`, and at the edge when `x = j`. The general tool
that would settle it is a bound on the left damage front — crystals A3 says no
such bound is provable, and obstruction 6 says why the reset-lemma induction
cannot reach it. Two further consequences worth recording, because they close
routes rather than open them. `config_eq_of_right_and_column` is sharp: its
right-half hypothesis cannot be weakened to finiteness. And Wolfram 1986 §5's
"This instability implies that information on localized changes eventually
propagates throughout the cellular automaton" (lines 563–565), true of his
disordered configurations, is false in the number-like class — with a proof, not
a measurement. Anything that would recover a configuration from its centre
column is dead in that class before it starts.

**Recorded** 2026-09-08 by Sextant, from the attack document
`docs/attacks/2026-09-08-turn-a-measured-obstruction-into-a-theorem-portage-connector-established-by-decisive-measurement-not-proof-that-the-tran.md`.

## The rule 30 edge group is not contracting, so the self-similar group toolkit does not apply

Portage's second sighting handed on a bounded, decisive question: rule 30's
right edge is described by a finite-state automaton, that automaton generates a
self-similar group in Nekrashevych's sense, and the whole theory turns on
whether the group is *contracting* — whether iterated section-taking pulls every
element into a finite set, the *nucleus*. If it is, rule 30's edge acquires a
compact limit space, an iterated monodromy reading, and a nucleus-driven word
problem, and the centre column becomes a specific curve on an object nobody has
looked at. That was the strongest "connects to real machinery" lead on the
board.

**It is not contracting.** The nucleus closure diverges — reachable set
`7 → 25 → 214 → >4000` — with a certified lower bound of **|nucleus| ≥ 175,680**
from a single 18-generator product whose minimal transducer has 175,899 states,
175,680 of them in the eventually-periodic part of its section iteration. Every
one of those must lie in any nucleus, so no nucleus of size below that exists.
Forced-set size grows as `≈1.8^ℓ` in word length `ℓ`: 35, 532, 5,873, 57,741,
175,680 at `ℓ = 4, 8, 12, 16, 18`. Structurally, no state of the minimal
automaton is trivial, so activity is `2^n` — exponential, the lamplighter's
class rather than the bounded automata of the contracting examples.

**Why to believe it.** The machinery reproduces the known cases before being
trusted on rule 30: the adding machine gives nucleus `{1, a, a⁻¹}`, size 3;
Grigorchuk gives `{1,a,b,c,d}`, size 5; the lamplighter, a negative control,
diverges. Both contracting controls stay *flat* — forced-set size constant at
every word length to 20 — while rule 30 grows exponentially, so the controls
separate perfectly. Two independent implementations agree element-for-element
with zero discrepancies: transducers with product construction and Moore
minimisation under exact equality, against words in the generators with sections
by symbolic wreath recursion and equality decided by simulating the action on
all 4,096 words of length 12 — no shared code. The deep-section counts were also
cross-checked without the minimiser, by pairwise-distinct signatures under
direct simulation on 400 random words of length 60.

**What is proved and what is not.** Proved, given the code and its
cross-validation: `|nucleus| ≥ 175,680`. *Not* proved: that the nucleus is
infinite. Contraction is not known to be decidable in general and no finite
computation closes it. Treat this as settled for practical purposes and unproved
formally — it is a reason not to spend a session there, not a theorem.

**A correction that came out of it, and it is worth more than the negative.**
The automaton derivation exposed an error in the captain's own brief: rule 30 is
**left**-permutive, not right-permutive. Fixing `(c, r)`, the map `l ↦ l XOR (c
OR r)` is `l XOR const` and so bijective; fixing `(l, c)`, the map `r ↦ new` is
constant whenever `c = 1`. The board's proved `rule30_leftPermutive` was right
and the brief was wrong. The right diagonals are still purely periodic with
period dividing `2^k`, but *not* for the reason the brief gave: on the right
cone the left neighbour of a cell lies on the **same** diagonal, giving
`e_k(t) = e_k(t-1) XOR (e_{k-1}(t-1) OR e_{k-2}(t-1))`, which is invertible in
`e_k(t-1)`. On the left cone the analogous recurrence is not invertible in its
own previous value, which is exactly why the left side gets no such guarantee
and has transients. Any statement citing permutivity as the reason for
right-diagonal periodicity is citing the wrong one.

**Recorded** 2026-09-08 by Rowan, from a computation run to settle Portage's
handed-on question. Scripts under `explorer/nucleus_*.cjs` (`.cjs` because the
repo's `package.json` sets `"type": "module"`).
