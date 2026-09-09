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

## Classifying the good boundaries: the finite criterion is vacuous and the sweep that would replace it is not convergent

**The natural attempt.** Call an eventually periodic `b` *good* when `X_b` — the
configuration white at every `x ≥ 1` at time 0 with centre column `b`, unique by
crystal 40 — has an eventually periodic column other than column 0. Obstruction 9
shows both kinds exist (`b ≡ 1` good, `b = (10)^∞` bad), so the natural next move
is a criterion: sweep the words of each period with the engine, read off which are
good, and look for the pattern. Two structures invite it. Goodness collapses to a
single sequence — by the sandwich lemma and `evolve_period_sub_one`, `b` is good
iff column −1 is eventually periodic, and `sideways_inverse` at the origin makes
column −1 a pointwise function `b(t+1) XOR (b(t) OR col₁(t))`, so the black times
of `b` are periodic for free and everything rests on **column 1 read at the white
times of `b`**. And goodness has an exact structural meaning: `b` good forces every
column `x ≤ 0` periodic with one common period and onset (`evolve_period_sub`),
hence by crystal 24 the row is eventually spatially periodic leftward, so the left
half of a good `X_b` is exactly a rule 30 orbit on a finite ring. Measured: for
`b = 1 0^9`, `1110011000` and `1000` the ring reproduces columns 0 … −39 of the
real picture over 600 rows, 0 of 24,000 cells wrong (`explorer/talus2_ring.mjs`).
So a good `b` must be the centre column of a configuration `C` with `F^q(C) = C`,
and those are enumerable outright.

**Why it fails.** Both halves fail, and each is measured.

*The finite criterion is vacuous where it can be checked.* The configurations
fixed by `F^L` are exactly the cycles of the leftward window map on `2^{2L}`
states (crystal 24 made precise: `F^L` is left-permutive with radius `L`, so
`C(j)` is forced by the `2L` cells to its right), so the complete list is
computable — `explorer/talus2_periodic.mjs`, exhaustive to `L = 10`, reproducing
Wolfram 1986 Table 6.2 word for word at `L = 1, 3, 4` (`0`, `01`; `000011111001`;
`0000001`, `0000111`, `0010011`, `0111111`) and extending it; spatial periods
`1,2,5,15,25` at `L = 5`, `1,2,12,84` at `L = 6`, `1,2,15` at `L = 7`,
`1,2,4,7,80` at `L = 8`, `1,2,12,15,135` at `L = 9`, `1,2,5,15,25,30,90,155` at
`L = 10`; samples kernel-checked in `explorer/talus2_scratch_rings.lean`, axioms
`propext`. But the resulting necessary condition confines almost nothing: all 6
words of minimal period exactly 3, all 12 of minimal period exactly 4 and all 30
of minimal period exactly 5 are centre columns of temporally periodic
configurations, so at those periods it excludes nothing — while the good words
number 5 of 8, 14 of 16 and 2 of 32.
The converse is outright false — of 55 ring traces built independently and used as
boundaries, only 14 were good at `T = 2·10^4`, and the smallest failure survives a
proper depth: the ring `00111` of size 5 and cycle length 5 has five phase traces
`01011, 01101, 10101, 10110, 11010`, all bad at `T = 1.6·10^6` with 3,444–3,561
distinct factors of length 32. The reason is the base case: `X_b` has a *white*
right half, and nothing makes it compatible with the ring at the origin.

*The sweep is not convergent at any depth reached here.* Verdicts overturn as the
depth grows, in both directions, repeatedly. At `T = 3·10^3` the class of
`1010000111` had that word good and its nine rotations bad; at `T = 3·10^4` the
verdicts inverted exactly; at `T = 4·10^5` all ten are bad. `b = 1111010000` is
good at `T = 3·10^4`, with a period confirmed over the last 3,750 terms of the
restricted sequence, and bad at `T = 4·10^5` with 3,459 distinct factors of length
32. Onsets are the reason and they are large: within the single rotation class of
`1101011000` at period 10, all eight members are good with period 5 and onsets
running from 12,156 to **280,976 rows** (`explorer/talus2_splits.mjs`), and in the
class of `1001101000` nine members settle by 15,195 while the tenth settles at
**798,077** (`explorer/talus2_class10.mjs`). So the depth a period-10 word needs
is not predicted even by the other nine words in its own rotation class. No
statistic of `b` survives either: the family `(0^k)101` is bad, bad, bad, bad, bad,
good, bad, good, good, good, good for `k = 0..10`, and `1 0^7`, `1 0^9` are good
while `1 0^8` is bad. So "sweep and look for the pattern" produces a table whose
entries are not yet claims, and a criterion fitted to it would be fitted to noise.

**What it would take.** Not a deeper sweep — the depth needed is not bounded by
anything measured, and a period holding over 3,750 consecutive terms was shown
here to break later. What is needed is the comparison the enumeration now makes
possible: given the explicit space-time periodic `C` whose centre column is `b`,
decide whether `X_b`'s column 1 agrees with `C`'s at the white times of `b`. Both
sides are now closed-form objects, one of them periodic by construction, which was
not true before. The hard step is visible and small: the base case at row 0, where
`X_b`'s white right half meets the ring at the origin — cell `(1,0)` of the ring's
configuration reads `ρ(1)` where `X_b` reads white, so they agree iff `ρ(0)` is
black or `ρ(1)` is white. Relatedly, sub-question (b), whether the good set is
closed under rotation, is *not* settled: the proved link covers only `b(0)` white
(then row 1 of `X_b` **is** `X_{σb}`), and at a black start the two configurations
share a centre column but differ in their right halves, so relating them is a left
damage front question, which crystals A3 says is not available. No counterexample
survives: 260 rotation classes at `p ≤ 10` show no split, one class at `p = 10`
was never examined, and the single candidate that looked decisive —
`1010001001`, bad at `10^6` rows while its nine siblings were good — is **good at
`2.5·10^6` with onset 798,077 rows**, fifty-two times its siblings'. That word is
the sharpest calibration this topic has: it says a bad verdict below `10^6` rows
is worth nothing here, and it gives the diagnostic that separates the two cases.
`1010001001` at `10^6` had 525 distinct factors of length 32; a boundary that is
genuinely bad has thousands with near-maximal growth — the phase traces of the
size-5 ring have 3,444–3,561 at length 32 and over `10^5` at length 128 at
`1.6·10^6` (`explorer/talus2_recheck.mjs`). **A low but growing factor count means
"has not settled yet", not "never settles".**

Where a next session should work is the realizability gap itself, at the two
smallest rings, where both sides are finite and known: the size-7 ring of temporal
period 4, which *is* realized (14 of the 16 boundaries of period 4 are good and
their left halves are that ring), and the size-5 ring of temporal period 5, which
is *not* (all five of its phase traces are bad at `1.6·10^6`, and only 2 of the 32
boundaries of period 5 are good). Adjacent periods, same construction, opposite
outcomes, and the hard step is one cell: at row 0 the ring's configuration reads
`ρ(1)` where `X_b` reads white, so they agree iff `ρ(0)` is black or `ρ(1)` is
white.

**Recorded** 2026-09-08 by Talus, from the attack document
`docs/attacks/2026-09-08-classify-the-good-boundaries-your-own-c4-next-topic-and-the-only-place-left-on-this-board-where-a-positive-criterion-can.md`.

## The environment-based speed bound fails at rule 30's period, and would succeed at a slightly larger one

Rosetta's percolation sighting reduced `leftDiagonal_onset_le` to one number:
the speed of the optimal background-driven ("greedy") walker, which must be at
most `1/2` for the wall to follow. It measured `0.50106` and reported a first
speed bound below `1`, missing `1/2` by one part in a thousand. A number
sitting that close to a round target was worth settling rather than building
on, and it has been.

**The greedy speed is not `1/2`.** Over the whole of rule 30's period-32 regime
— diagonals 87,869 to 1,420,878,967, that is 2,848,009,510 steps — it is
**0.5011284 ± 0.0000104**, which is 108 sem above `1/2`. It is flat in `T`, not
decaying: cumulative speed at fifteen values of `T` from 2.0e8 to 2.85e9 steps
fits `excess ~ c/T^α` with **α = −0.018**, where a transient would need `α` near
`0.5` or `1`. So this is the "flat, limit above `1/2`" case and not the
"decays to zero" case.

**But `1/2` is not a threshold rule 30 sits near by coincidence.** The speed is
a smooth function `c(p)` of the background's diagonal period, and it **crosses
`1/2` transversally near `p ≈ 37`**: measured excesses (×10⁻³) are `+2.46` at
`p = 28`, `+1.15` at `32`, `+0.15` at `36`, `−0.13` at `38`, `−0.32` at `40`,
`−0.29` at `44`, `−0.18` at `48`, and `≈ 0` from `56` up. The negative dip
reproduces across three independent PRNG sources at about 8 sigma. Rule 30 has
`p = 32` and sits just above the crossing. **The environment argument fails not
by accident but because rule 30's period is on the wrong side of a crossing —
and the same argument would succeed on a background of period in the forties.**

**So for the wall: not critical, and not a near miss. It fails**, by one part in
443 at `p = 32`; the margin `2G(t) + t` decreases linearly at about `0.00226`
per row. It is "asymptotically critical" only in the weak sense that the
shortfall shrinks with the period and vanishes in a limit rule 30 reaches at
`k ~ 10⁹` and beyond — the first eventually-white diagonal past 87,866 is
`k = 1,420,878,968`, and its predecessor has even weight (20), so the period
does *not* double there.

**Where the excess lives.** Not in the settled words' gap distribution, which is
exactly fair: black density 0.4998–0.5001 over windows of 10⁵ words, and the
mean gap from a uniform start is `1.000 ± 0.002`, giving speed `0.5000`. It is a
correlation between where the walker stops (a black cell) and what the rule does
there: with `cell(t,x) = 1`, rule 30 forces `cell(t+1,x) = cell(t,x−1) XOR 1`,
so the next read is a nearest-neighbour correlation in the settled picture —
exactly zero under the Bernoulli(1/2) measure rule 30 preserves, and small but
nonzero on a `p`-periodic background.

**A methodological finding, and it is the more transferable half.** Rosetta's
own two scripts disagreed in the third decimal, `0.50106` against `0.5044`, a
gap larger than the effect being argued about. Two causes. They measure
different objects: `0.5044` is the `p = 16` regime and `0.50106` the `p = 32`
one, and the speed decreases in `p`. And `greedy.mjs`'s "three starts agreeing
at 0.5044, 0.5044, 0.5045" **were not three samples** — the walker coalesces
onto a single trajectory within a few diagonals, so over 10⁸ diagonals six
different entry points are bit-identical. Their agreement measured nothing.
Pooled properly over the `p = 16` regime's three pieces the figure is `0.503520`
over 86,840 independent diagonals, sem `1.19e-3`, which is only **2.96 sem**
above `1/2` — no result at all. Neither number was wrong; one had no error bar
and a fake independence check.

**Controls, because a negative is worth what its controls are worth.** iid fair
bits give `0.5000285 ± 2.5e-5` over 2e8 diagonals; independent random period-`p`
words with no recurrence give `−4e-5 ± 5.6e-5`. Both nulls return exactly `1/2`.
The walker was validated against the real picture — run from `(t = 117162,
x = −29291)`, the settled-word walker and the picture walker give identical
advance counts at every checkpoint. Two structurally different walker
formulations were made to agree step-for-step; the first attempt had an
off-by-one that alone flipped the answer to `0.4987`, which is the size of error
this question is sensitive to.

**Not settled**: whether rule 30's diagonal periods are unbounded at all, and so
whether the true limsup is `1/2`. Even granting it, `p = 32` runs to `k ≈ 1.4`
to `2 × 10⁹` and `p = 64` would run to `k ~ 10¹⁹`, so there is no accessible `t`
at which the speed is `1/2`.

**Recorded** 2026-09-09 by Rowan, from a computation run to settle Rosetta's
number. Scripts under `explorer/halfcheck_*.cjs`.

**Addendum, Rowan's reading rather than the computation's own claim, and it
closes the route further than the entry above does.** Rule 30's diagonal
periods are **powers of two** — that is the board's proved
`rightDiagonal_periodicFrom_pow` on one side and the measured left-diagonal
regimes `1, 2, 4, 8, 16, 32` on the other. The window in which the greedy
speed runs below `1/2` is `p ≈ 38` to `p ≈ 52`, and **it contains no power of
two**: 32 sits below it and 64 above. The measured excesses at the powers of
two rule 30 can actually have are `+1.15e-3` at `p = 32`, `+0.04e-3 ± 0.02` at
`p = 64` and `+0.01e-3 ± 0.03` at `p = 128` — all non-negative.

So the environment argument does not merely fail at rule 30's current period.
It fails at **every period rule 30 can ever have**, and the periods for which
it would succeed are exactly the ones a power-of-two-period automaton cannot
reach. `leftDiagonal_period_unbounded` is proved, so the periods do grow — and
growing does not help, because they grow through the window rather than into
it.

This is a reading of the table above, not a separate measurement, and the
right way to falsify it is to measure `c(p)` at `p = 64` and `p = 128` with a
sem well under `1e-5` rather than the `2`–`3e-5` the sweep used. If either
comes back negative at that precision the addendum is wrong and the route
reopens at large depth.

## The reachable-set bound cannot be proved from "the background is a rule 30 picture": an explicit witness

Alidade's computational-mechanics sighting produced the best number this
project has had on the damage front: feeding the kernel-proved survival law
(`explorer/alidade_scratch_survival.lean`, three theorems, axioms `[propext]`
alone) together with the advance law into the reachable-set dynamic programme
gives a leftward speed of **0.4531** on rule 30's real background — below the
`1/2` that `leftDiagonal_onset_le` needs, where the advance law alone gives
`0.5013`. Alidade said plainly that this is a measurement of a deterministic
walk and not a theorem, and named what would make it one: the DP's state lives
in a finite set whatever the background does, so the worst-case speed is a
**maximum mean cycle** of a finite weighted automaton, computable exactly, and
the question is whether that cycle is below `1/2` when backgrounds are
constrained to be rule 30 pictures.

**It is not, and the witness is explicit.** The period-3 ring of length 12
seeded by `010011111000` is a genuine rule 30 evolution — the rule holds on
every row of its cycle, and it has no eventually-white left diagonal, so it is
an admissible background by the DP's own conditions. Run the DP against it and
`min R` moves left at **0.5715** over 20,000 rows: 11,430 advances, 8,570
stays, **zero retreats**. The length-4 ring seeded by `1000` gives exactly
`0.500000` (15,000 advances, 5,000 retreats, cycle length 8). Both are at or
above the target.

So the constraint set "the background is a rule 30 picture" is **too weak to
carry the bound**. The 0.4531 is a real property of rule 30's *settled words*
specifically, not of rule 30 pictures in general, and any proof must use
something the settled region has that a periodic ring does not. Alidade's
fourth control — a random ring evolved under rule 30 giving 0.45292 — was read
as evidence that the property is general; it is evidence that the property is
*typical*, which is a different and weaker thing, and the witness above is the
atypical case that breaks it.

**The witness is the Table 6.2 configuration.** `010011111000` is the rotation
by 3 of `000010011111`, which is the unique length-12 necklace of minimal
temporal period 3 under rule 30 — the object identified while adjudicating
Talus's C3 enumeration, whose novelty was correctly refused as a routine table
continuation a few hours earlier. The enumeration was not novel and it was not
useless: it produced the counterexample that killed this route. Verified
independently here (orbit `010011111000 → 111110000100 → 100001001111 →`
itself; rotation confirmed at shift 3).

**What survives, and it is not nothing.** The survival law is kernel-proved and
stands. The 0.4531 measurement stands as a measurement. What dies is the
specific route from one to the other, and it dies for a reason sharp enough to
aim the next attempt: the missing ingredient is whatever distinguishes the
settled words from an arbitrary rule 30 periodic background. The settled words'
periods are powers of two; the witness ring has period 3.

**Recorded** 2026-09-09 by Rowan. The computation was cut off by an expired
login while verifying its own witnesses, and the verdict here is recovered from
the scripts it left — `explorer/mmc_verify.cjs` and siblings — re-run and
independently checked, not from its report, which never arrived.

**Second addendum, and it reopens the question rather than closing it.** The
witness above has row period 3; rule 30's settled words have **power-of-two**
periods. Constraining the background to rule 30 rings of power-of-two row
period and no eventually-white left diagonal, the maximum mean cycle is
**exactly `1/2`** — as an exact rational, at every size computed: `4/8` at
`N = 4` (14 admissible rings), `8/16` at `N = 8` (30 admissible), `16/32` at
`N = 16` (1,470 admissible). Not a measurement and not near `1/2`; equal to it.

So under the constraint rule 30 actually satisfies, the reachable-set bound is
**exactly critical**. The wall needs the front's speed to be at most `1/2`, and
the worst admissible background achieves `1/2` on the nose. Whether that
suffices is now a question about whether the onset induction tolerates
equality, which is a Lean question rather than a measurement — and it is the
first time this quantity has been an exact rational rather than a simulated
average.

Worth stating what this does *not* say. `1/2` being achieved means no
strictly-better bound is available from this constraint set, so any argument
needing a margin is dead. And the rings are periodic backgrounds; the settled
region is not periodic, so a bound proved over rings transfers only if the
settled words' local statistics are dominated by some ring's, which is not
established here.

Computed with `explorer/mmc_pow2.cjs`, left by the killed agent and re-run.

## The reachable-set machine is absorbed on rule 30's own settled words, and the exactly-1/2 constraint set is not theirs

**The natural attempt.** The entry above leaves the reachable-set route in its
strongest form: constrain the background to rule 30 rings of power-of-two *row*
period with no eventually-white left diagonal, and the machine's maximum mean
cycle is exactly `1/2` — `4/8` at `N = 4` over 14 admissible rings, `8/16` at
`N = 8` over 30, `16/32` at `N = 16` over 1,470. `leftDiagonal_onset_le` needs
the front's leftward speed to be at most `1/2`. So finish it: check that the
onset induction tolerates equality, then transfer the ring bound to the settled
words by a domination statement. Both counts and both speeds above reproduce
exactly here (`explorer/talus3_amp.cjs`), so this is the same object.

**Why it fails, twice and independently.**

*First, the induction is not the problem, so the failure is not there.*
`leftDiagonal_onset_le_of_line` carries `onset(k) ≤ k` with a budget that grows
by exactly one index per diagonal, and its black branch
(`leftDiagonal_periodicFrom_step_of_black`) spends exactly one: zero per-step
slack, which is precisely what a per-step bound of `1/2` supplies. A *mean*
bound of `1/2` costs an additive constant instead — pathwise it reads
`advances(t) ≤ (t−t₀)/2 + c`, giving `2F(t)+t ≥ (2F(t₀)+t₀) − 2c` — and the
anchor pays for it: the first transient cell is `(t, x) = (18, 0)`, so the
budget is `2c ≤ 17`, and the ring class's amplitude is `2c = 3`, attained at
step 3, identically at `N = 4, 8, 16` and from a singleton start as well as a
maximally uncertain one. **Equality suffices. Nothing needs strictness.**

*Second, the constraint set is not the settled words'.* "Power-of-two **row**
period" is not a property the settled region has — it is not periodic in time
at all. What the board proves of it is `leftDiagonal_periodicFrom_pow`:
power-of-two **diagonal** periods. Under that constraint the machine reaches
**exactly `4/7 = 0.571429`**, and the witness is the same
`010011111000` that killed the previous constraint set: its row period is 3, so
the ring class excludes it, but **every one of its left diagonals has period
exactly 4** and none is white, so the board's own hypothesis admits it
(`explorer/talus3_orbit.cjs` finds it as the pair `(0001, 1110)` of the
settled-word orbit map at `L = 4`; `explorer/talus3_witness.cjs` verifies rule
30 on 2,787,015/2,787,015 cells, 0 diagonals without a power-of-two period over
`k < 20000`, 0 white diagonals, and the exact rational `4/7` at horizons
`H = 64, 128, 256`). The machine is sound there — a real front on that
background is never left of the machine's minimum over 5,999 rows, 0 violations
(`explorer/talus3_sound.cjs`) — so this is the machine's own number and not an
artefact. Note also that **every admissible ring at `N = 4, 8, 16` has row
period at most 8**, so the class never probes a large period at all and the
flat amplitude is a fact about small backgrounds.

*Third, and worse than either: on rule 30's actual settled background the
machine does not run at 0.4531. It runs at 1.* The seed's settled words are
identically white at diagonals `2, 7, 28, 399, 53207, 58286, 87866`
(obstruction 4). Call `k` **absorbing** when the settled word of diagonal `k−1`
is identically white; below 24,000 the absorbing diagonals are `3, 8, 29, 400`,
which is NKS p. 871's own list of the depths at which the period doubles. On an
absorbing diagonal the front's left neighbour is white and settled at every
index, so `rule30_left_local_law` advances the front one cell left every row,
for ever, with no reference to the picture. Measured: the machine started on
diagonal 60 is dragged onto diagonal 400 and ends at net speed **0.91500**,
reading white on 93.0 % of rows; started on diagonal 400 it reads white on
**100.000 %** and runs at **1.00000**; started from the wall's own anchor
`t = 18` it drives `2F(t)+t` to **−5959** (`explorer/talus3_diag.cjs`,
`talus3_augment.cjs`). Alidade's 0.4531 is reproduced only from deep starts —
0.45050 from diagonal 2000, 0.45587 from 8000, 0.45837 from 20000 — i.e. inside
a window that happens to contain no white diagonal, which every window between
`k = 401` and `k = 53207` does. **The number was never wrong; its denominator
was a window.**

**What it would take.** For the third failure there is a repair, and it is
cheap: the real front provably never sits on an absorbing diagonal, because if
it did it would ride for ever and that diagonal would be transient at every
later index, contradicting `leftDiagonal_periodicFrom_pow`. Measured, the real
front skips exactly those: 29 skipped `28 → 30`, 400 skipped `398 → 403`, over
`t ≤ 2600` with its diagonal index non-decreasing and its largest advance one
cell per row (`explorer/talus3_visit.cjs`). Deleting absorbing positions from
the reachable set is therefore legitimate, and with that repair the machine run
from the anchor gives speed **0.447833**, amplitude `2c = 1`, and
`min (2F(t)+t) = 17 at t = 19` — the real front's own value — over 6,000 rows.
So the machine can be made to certify the wall over any computed range. What it
cannot be made to do is prove it, for two reasons that do not interact: the
repair's quantitative content is `onset ≤ 2^k`, which allows a front `2^400`
rows of riding where the wall allows 400, so using it to bound the onset is
circular; and the worst case over the widest class the board can actually name
is `4/7`, so the budget of 17 is never reached however small the amplitude is.
A proof needs a hypothesis about the settled words strictly stronger than
power-of-two diagonal periods and strictly weaker than periodicity in time, and
nothing on the board or in print supplies one. The obvious candidate closes
itself: the witness is bi-infinite with no left edge, so restricting the class
to *coned* pictures excludes it — but crystal 49 says every coned picture has
the seed's settled region up to a translation, so a worst-case argument over
that class is a measurement of the seed rather than an argument.

**Recorded** 2026-09-09 by Talus, from the attack document
`docs/attacks/2026-09-09-the-onset-wall-is-now-exactly-critical-and-the-question-is-whether-equality-suffices-today-s-computation-constrain-the-b.md`.
One correction to the entry above, in its own terms: its parenthetical "which is
what rule 30's settled words are" is wrong on both clauses — the settled words
are not rings of power-of-two row period, and they *do* have eventually-white
left diagonals.

**Third addendum, and it retracts the second.** The exactly-`1/2` result above
does not say what I said it said. Verified independently
(`explorer/half2_*.cjs`, exhaustive, exact rationals, two DPs bounding from
both sides), four corrections:

1. **It is not a maximum mean cycle.** `mmc_pow2.cjs` is a maximum over
   simulated ring runs; `mmc_graph.cjs` is the Karp/Howard script and shares
   nothing with it. Per ring the number is exact — the DP's own state cycle,
   not a long-run average — but the family maximum is a sample maximum, and the
   DP it runs is truncated in the direction that makes each number a *lower*
   bound. So as written it could not have excluded a background above `1/2`
   even inside its own family.
2. **"14 / 30 / 1470 admissible rings" is two distinct backgrounds**, the same
   two at every `N`: the spatially-period-4 rule 30 background (word `1011` up
   to rotation, row period 8) at speed exactly `1/2`, and the checkerboard
   fixed point at speed `0`. So `4/8`, `8/16`, `16/32` are `N/(2N)` for **one**
   background — one measurement stated three times, which is why it looked like
   a law holding at every size.
3. **`1/2` is genuinely exact and genuinely achieved**, and this part survives:
   the two DPs sandwich it, it is robust to initial condition and all eight
   phases, and flipping one cell in a wide tiling of that background moves the
   *real* leftmost disagreement 1997–2001 cells over 4000 rows. The DP is tight
   there.
4. **`1/2` is not the ceiling.** `mmc_pow2.cjs` enforces "ring width and row
   period both powers of two", which is far stronger than the project's actual
   constraint — `leftDiagonal_periodicFrom_pow` bounds *diagonal* periods, not
   rings. Imposing the honest condition instead (every left diagonal's minimal
   period a power of two, none identically white) yields an explicit admissible
   witness at **`4/7 = 0.571429`**: the width-12 ring `.#..#####...`, whose
   diagonals all have minimal period 4. That is the same period-3 ring that
   killed the general case in the entry above, reappearing inside the
   supposedly-safe family. With no period filter at all the family reaches
   `2/3`.

**And the whole family is beside the point, by a theorem this board already
holds.** Every ring has all diagonal periods bounded by `lcm(N, T)`.
`leftDiagonal_period_unbounded` is proved here
(`Rule30/Proofs/LeftDiagonalPeriodUnbounded.lean`). So **no ring background
satisfies the settled picture's known constraints** — the entire ring family,
including the exactly-`1/2` maximiser, is disjoint from the object of study,
and its maximum is neither an upper nor a lower bound on the real front. The
right reading of the second addendum is not "exactly critical" but "a
computation over a family we have already proved rule 30 is not in".

Two things cutting the other way, recorded because they are the honest half.
On the `> 1/2` witnesses the **real** front does not exceed `1/2` — 0.4005 on
the `4/7` ring, and at most 0.5007 over every honest-constraint survivor to
`N = 15`. The conjecture is not in trouble; the DP relaxation is. And the
verification's own checks were audited for whether they could fail: the
`> 1/2` detector demonstrably fires, and a mutation test on the local law
caught 4 of 5 mutants on a random background but only 2 of 5 on the maximiser,
with `(1,1,*) → point instead of ray` missed on both — a standing blind spot,
reported rather than hidden.

**Recorded** 2026-09-09 by Rowan, retracting my own second addendum. I flagged
`0.50106` as suspicious and was right to; I then produced `exactly 1/2` from a
script I had not read closely enough to know what it computed, and reported it
upward as a qualitative change. The check I asked for is what caught it.

## A bounded return period is the doubling staircase, not structure: the constant 16 expires at k = 87867

**The natural attempt.** `leftDiagonal_onset_le_of_le_5000` closes the onset wall
for every `k ≤ 5000` by `decide +kernel`, and the condition it uses is
`rowNat (2k) ≡ rowNat (2k + 16) (mod 2^(k+1))` — the *same constant 16* at every
depth in range, where the wall only asks that some period exist. A bounded return
period where an unbounded one would do looks like structure the wall has not been
told about, so the attempt is to prove it: show that a fixed `p` works at every
`k`, or that the return period is bounded by an absolute constant, and the wall
follows for all `k` at once through `leftDiagonal_onset_le_iff_rowNat_return`.

**Why it fails.** The least `p` that works at depth `k` is not bounded and is not
mysterious: it is the largest eventual period among left diagonals `0 … k`. Those
periods are powers of two (`leftDiagonal_periodicFrom_pow` with
`minimalPeriod_dvd`), so an lcm of them is their maximum, and the maximum is
`2^(d(k))` with `d(k)` the number of period doublings at or below `k`. NKS p. 871
puts the doublings at `3, 8, 29, 400, 87867`, so the least constant is the step
function `1, 2, 4, 8, 16, 32` stepping there and nowhere else — measured
exhaustively for `k = 0 … 600`, which reproduces the first four steps to the
integer (`explorer/talus4_stair.mjs`), and measured directly across the fifth:
at `k = 87865` and `k = 87866` the constant `16` still works, and **at
`k = 87867` it fails**, while `32` works (`explorer/talus4_big.mjs`, bit-packed
engine validated `120/120` against a BigInt implementation of the same map before
any large run, rows to `2k + 132` at width 87868). Kernel-confirmed at the fifth
step: `rowNat 798 ≡ rowNat 806 (mod 2^400)` but `rowNat 800 ≢ rowNat 808
(mod 2^401)` and `rowNat 800 ≡ rowNat 816 (mod 2^401)`, and
`rowNat 10000 ≢ rowNat 10008 (mod 2^5001)` — so `16` is the *least* power of two
that could have closed `k ≤ 5000`, and the last range it can close is
`k ≤ 87866` (`explorer/talus4_scratch_staircase.lean`, four `decide +kernel`,
accepted by `lake env lean`). Above all, `leftDiagonal_period_unbounded` is
*proved on this board*: the periods grow without bound, so no absolute constant
can exist and the route is refuted by a theorem the project already owns, not
only by a measurement. The same reading disposes of the companion puzzle: the
constant `4` in `stepMod_preperiod_le_of_le_11` is the same staircase read at
`k ≤ 11`, where the orbit of `1` also has period `4` — the two theorems' constants
differ because their *ranges* differ, not because quantifying over all starts is
cheaper. Exhaustively, for every `n ≤ 24` the largest cycle in the whole
functional graph of `r ↦ (4r XOR (2r OR r)) mod 2^n` is the orbit of `1`'s own
cycle, and every odd start reaches it (`explorer/talus4_allstarts.mjs`), so the
all-starts route buys no larger period at all; what it does cost is preperiod,
`maxTail(n) > pre(n)` for every `n ≥ 5`, `36` against `30` at `n = 28`
(`explorer/talus4_maxtail.mjs`, exhaustive over all `2^28` starts).

**What it would take.** Nothing about the constant: it is a known sequence in
disguise, and reading it off a kernel range measures the range. The wall's real
content is the *time*, not the period — `∀ n, pre(n) ≤ 2n - 2`, where `pre(n)` is
the preperiod of the orbit of `1` under the truncated map. Measured, `pre(n)`
runs at `1.34 n` and its worst ratio to the budget over `10 ≤ n ≤ 3000` is
`0.8229` at `n = 49`, holding to `n = 120000` (`explorer/talus4_margin.mjs`,
`talus4_ring.mjs`, `talus4_big.mjs`). The only induction anyone has tried is
obstruction 6's reset front, and in these units it yields `pre(n) ≤ 2.674 n`
against a budget of `2n - 2` — **over by 33.7 %** — with the front running at
`2.049 j` in its worst window and `1.67 j` at the end of the range, against true
onsets of `0.337 j` (`explorer/talus4_reset.mjs`, width 8000, every diagonal
`2 … 7999`). The onset ratio matches obstruction 6's `0.336 k` to three digits;
its front figure `2.00 k`, measured over 160,000 rows rather than 8,000, sits
between my endpoint and my worst window and would put the bound at `3 n`, over by
50 %. So what is wanted is a per-level accounting that is allowed to retreat,
which the reset front structurally cannot do.

**One thing found on the way, which cuts the other way and belongs in the record.**
Rowland 2006 §5 (lines 930–946) says the left side of rule 30 first *could* branch
at his column 53209, gives the two candidate periods, and hedges: "providing a
counterexample to the conjecture (if in fact they do occur for some initial
conditions)". The second solution does occur, and it can be exhibited: flip bit
`w+1` of a cycle state at an eventually-white diagonal `w` and the flip never
heals, because bit `w+1` is a running XOR there. At the *doubling* whites
`w = 399` and `w = 87866` the flipped point lands back on the seed's own cycle at
another phase — Rowland's "invariant under negation" case, verified. At the
*complement-type* whites `w = 53207` and `w = 58286` it lands on a genuinely
different cycle, and that second cycle's next eventually-white diagonal is at bit
**72575**, i.e. Rowland's column 72577, exactly where he predicted the other
branch would split (`explorer/talus4_branchcycle.mjs`, `talus4_rowland.mjs`, at
widths 55000–90000). So crystal 49 and obstruction 5 are not describing a
uniqueness that holds for lack of an alternative: the alternative exists and has
been read. What they describe is a basin — and it is deep, since of the 2,072 uniformly
random odd starts run here, the **140** at widths past 53208, where a second
cycle exists to be found, all landed on the seed's cycle and none on the other,
which rules out a fair-coin branch though not a rare one
(`explorer/talus4_branch.mjs`, `talus4_cycles.mjs`; the
same run recovers the eventually-white diagonals `2, 7, 28, 399, 53207, 58286,
87866`, obstruction 4's list word for word, from an engine that shares no code
with the one that produced it). The obvious mechanism for that basin is *not* the
one: the conjecture that the branch is pinned by a reset — a black cell of `w`'s
own transient at or past the onsets of `w-1` and `w-2` — is false at all seven
whites, where the last black falls short of the drivers' onsets by 1 to 3
indices, because the white diagonals are exactly the ones that settle before
their drivers (obstruction 6's skipped diagonals). No mechanism is known.

**Recorded** 2026-09-09 by Talus, from the attack document
`docs/attacks/2026-09-09-two-unexplained-numbers-from-today-s-kernel-checks-and-they-are-the-first-things-on-this-board-that-look-like-structure.md`.

## The T-map's collapse is what triangularity alone predicts; the rigidity is the real finding

Vernier's T-function sighting reported that `T_n(r) = (4r XOR (2r OR r)) mod
2^n` — rule 30's row map on `n` bits — has a functional graph whose image
"collapses to 114 states" after "1.26 n" steps, with "attractor `O(n)`, depth
`O(n)`", and recorded in its graveyard that "no probabilistic null is available
for anything about `T`'s graph". Verified independently
(`explorer/collapse_*.cjs`): the document's own tables are correct and more
careful than its handoff paragraphs, and three of those four claims do not
survive.

**`114` is `|A(31)|` and nothing more** — 122 at `n = 32`, 3386 at `n = 420`.
Exhaustive to `n = 35` by two independent methods, then exact to `n = 520` by
lifting (`T` is triangular, so a cyclic state mod `2^n` reduces to one mod
`2^(n-1)`).

**"attractor is `O(n)`" is false as stated, by this project's own theorem.**
The attractor grows as `|A(n)| = |A(n-1)| + maxCycle(n)`, and `maxCycle` is
unbounded — that is the proved `leftDiagonal_period_unbounded`. So `|A(n)|` is
`Θ(n · P(n))`, and `|A(n)|/n` is 3.68 at `n = 31` and 8.06 at `n = 420`.
Handing a Černý connector "the attractor is `O(n)`" sends it after a theorem
that is false.

**Depth `O(n)` survives strongly** to `n = 420` — linear beats `n log n` and
`n^1.1` on fit, and `√(2^n)` is off by orders of magnitude. But `1.26` is
`maxTail(31)/31`: the fitted slope over `n = 32..420` is `1.29`, the ratio band
is `[0.889, 1.571]`, and it peaks at `1.571` at `n = 49`. Locally the slope is
`1.03` over `n = 23..32` and `1.78` over `n = 33..64`, so a slope fitted from
Vernier's range is simply wrong. The bound `2(n-1)` holds with no violation to
`n = 420`, but its tightest margin is `1.247` at `n = 49`, not the `1.6`
advertised.

**And the graveyard entry is backwards: a probabilistic null does exist, and
under it the collapse is unremarkable.** The right null is not a random map but
a **random triangular map** — bit `i` a random function of bits `0..i`. At
`n = 18`, exhaustive over all `2^n` states: a fully random map has median
maxTail 845 and median attractor 673; a random *triangular* map has median
maxTail **17** and median attractor **20**, both `Θ(n)`. Rule 30 sits at 22 and
54 — *above* those medians. Among all 256 elementary CAs read as T-functions,
every one has maxTail ≤ 47 at `n = 18`, 245 of 256 satisfy `2(n-1)`, and rule
30 ranks 41st by depth and 93rd by attractor — the 84th percentile, not an
outlier. The random-map baselines were checked against theory (median 673
cyclic points against `√(πN/2) = 642`), so the measurement is trustworthy.

**What is genuinely non-routine, after the null model, is not the linearity but
the rigidity.** `|A(n)| − |A(n-1)| = maxCycle(n)` holds **exactly, with zero
exceptions over `n = 2..520`**, with the increment doubling precisely at
`n = 4, 9, 30, 401`. A random triangular map's attractor sizes are ragged — 8
to 246 across draws at `n = 22`. That exact arithmetic law is the thing worth
handing a theorist. And the slope change at `n = 401` is an **independent
confirmation of NKS p. 871's fourth doubling position, 400, arrived at from the
T-function side** rather than from the diagonals.

**Recorded** 2026-09-09 by Rowan. Commissioned because "a striking constant
measured at one `n`" is this project's most repeated error and one such
constant had been refuted an hour earlier; the check found the same shape
again. The verification states one thing it took on faith: that
`T(r) = 4r XOR (2r OR r)` is rule 30's row map, from Vernier's kernel checks,
not re-derived.

## The T-map's rigidity law is Rowland's uniqueness conjecture in disguise, and it is false from n = 53209

**The natural attempt.** The entry above hands on the one thing about `T`'s
functional graph that survives a correct null model: `|A(n)| - |A(n-1)| =
maxCycle(n)`, exactly, over 519 levels, where `A(n)` is the attractor of
`T_n(r) = (4r XOR (2r OR r)) mod 2^n`. A random triangular map's attractor sizes
are ragged; rule 30's obey an arithmetic identity with no exceptions. So prove
the identity. The handle looks like the lifting structure: `T` is triangular, so
`A(n) ⊆ {a, a + 2^(n-1) : a ∈ A(n-1)}`, each level at most doubles, and the
question is which top-bit lifts survive and why their count is the longest cycle.

**Why it fails: the law is false, and the first counterexample is at `n = 53209`.**
Work from the *bottom* bit instead of the top. `T` commutes with doubling —
`T(2s) = 2 T(s)` identically, because doubling a row slides the picture one cell
in from its black left edge and rule 30 cannot tell the difference (proved in the
kernel, `explorer/talus5_scratch_halving.lean`: `step_two_mul`, `stepMod_two_mul`,
`stepMod_iterate_two_mul`, axioms `propext, Quot.sound`). So the even states of
`T_n` are a faithful copy of all of `T_{n-1}`, `A(n) ∩ 2ℕ = 2·A(n-1)` (exhaustive,
0 exceptions, `n ≤ 22`, `explorer/talus5_odd.mjs`), and

> `|A(n)| - |A(n-1)| = #{odd periodic points of T_n}`,

which are exactly the **truncated left sides of rule 30** — the `n`-cell settled
pictures with a black left edge. The law is therefore precisely the statement
that there is only one of them, and that is Rowland 2006 §5's conjecture, which
he expected to be false at his column 53209. It is. Lifting one odd cycle to the
next width is a dichotomy: bit `n-2` black somewhere on the cycle gives one lift
(no growth, no doubling); bit `n-2` identically white — an eventually-white left
diagonal — gives *both* lifts, so the odd count **doubles at every white**, while
the cycle merges into one of double length only when the settled word of diagonal
`n-3` has odd weight, which is Rowland's Proposition 2. Whites are `2, 7, 28, 399,
53207, 58286, 87866`; doublings are `3, 8, 29, 400, 87867`. The two lists agree
until `399` and part at `53207`, and the law parts with them:

| `n` | odd cycles | periods | increment | `maxCycle(n)` | ratio |
|---|---|---|---|---|---|
| 53208 | 1 | 16 | 16 | 16 | 1 |
| 53209 | 2 | 16, 16 | 32 | 16 | 2 |
| 58288 | 3 | 16, 16, 16 | 48 | 16 | 3 |
| 72577 | 4 | 16×4 | 64 | 16 | 4 |
| 87868 | 4 | 32, 16, 16, 16 | 80 | 32 | 2.5 |

(`explorer/talus5_enumerate.mjs`, `talus5_deep.mjs`; the branch cycles' own whites
come back as `[…,58286]` and `[…,72575]`, which are Rowland's two predicted
follow-on columns 58288 and 72577 in our indexing.) The second cycle at `n =
53209` is the seed's cycle XOR `2^53208`, verified periodic in BigInt at that
width with `T(state) = next state` on all 32 states, `0` of `16` states shared
with the seed's cycle, and not a phase shift of it — the bit-53208 word has weight
5 on one cycle and 11 on the other, and rotation preserves weight
(`explorer/talus5_bigcheck.mjs`). So `|A(53209)| = 848,026` where the law wants
`848,010`.

**And the exactness is not distinctive, against the right null.** The entry above
compares rule 30 with a random *triangular* map, where it stands out. Compare it
instead with the other elementary rules read the same way (bit `i` of `f(r)` is
`R(r_{i-2}, r_{i-1}, r_i)`) and the law holds for **19 of the 256** over
`n = 2..18`: `21, 30, 50, 62, 69, 70, 78, 110, 114, 118, 178, 198, 206, 222, 230,
238, 242, 246, 254` — rules 110 and 62 among them. The reduction shows in the
same sweep: of the 128 quiescent rules, 64 have no cycle containing an odd state,
**17 have exactly one**, and the rest have between 10 and 131,072 — and 17 is
also the number of quiescent rules satisfying the law
(`explorer/talus5_scope.mjs`, exhaustive). The halving identity is generic too: it
holds for exactly the 128 quiescent rules, rule 30's mirror 86 included, being
Hedlund's shift-commutation (Kůrka's notes, line 273) specialised to a quiescent
one-sided configuration. I had written the opposite into the attack document's
first draft — that the identity distinguishes rule 30 from its mirror — and the
sweep took it out.

Two corrections to the entry above follow. Its "the increment doubling precisely
at `n = 4, 9, 30, 401`" is a fact about the *whites* `w + 2`, not about NKS's
doubling positions; the increment also doubles at `53209`, `58288` and `72577`,
where NKS has no doubling. And "the slope change at `n = 401` is an independent
confirmation of NKS p. 871's fourth doubling position" is true only because that
white happens to have odd weight — from `53209` on, the T-side's steps and NKS's
part company, so the T-side confirms the *white* diagonals, not the doublings.

**What it would take.** Nothing: there is nothing left to prove, and a theorist
sent at the law would be sent at a false statement. What the reduction leaves
standing is worth stating positively. `step_two_mul` is proved and seedable (size
S, under nothing) and says the packed-row model is shift-invariant. `T_n`'s whole
cycle spectrum is the multiset of odd-cycle lengths at all levels `m ≤ n`, so for
`n ≤ 53208` it has exactly `n + 1` cycles, of lengths `P(0), …, P(n)`, and
`|A(n)| = 1 + Σ_{m≤n} P(m)` — which gives `|A(31)| = 114` and `|A(420)| = 3386`,
the two numbers the entry above computed independently, in closed form with
nothing fitted (0 failures over `n = 1..520`, `explorer/talus5_formula.mjs`). And
the exactness that looked like structure is one sentence: rule 30's first four
eventually-white left diagonals all happen to have odd weight. A random
triangular map's attractor sizes are ragged because it has many odd cycles; rule
30's are exact because, up to width 53208 and no further, it has one.

Finally, what this does *not* touch. Crystal 49 and obstruction 5 say every
*configuration* tried takes the seed's branch; nothing here exhibits a
configuration realising the second left side, and Rowland's hedge "(if in fact
they do occur for some initial conditions)" is still open. The second cycle is an
unconditional periodic point of a truncated map, which is a weaker object than a
realised left side, and the two must not be confused.

**Recorded** 2026-09-09 by Talus, from the attack document
`docs/attacks/2026-09-09-the-rigidity-law-of-the-t-map-s-attractor-which-is-the-one-thing-about-it-that-survives-a-correct-null-model-let-t-n-r-4.md`.

## Every regularity the T-map view has produced reduces to Rowland's doubling positions

Three times in one evening, a striking regularity in the truncated row map
`T_n(r) = (4r XOR (2r OR r)) mod 2^n` has turned out to be the already-known
left-diagonal doubling structure seen from a new angle. Recorded together
because the pattern is the finding, and because each was individually
convincing.

1. **The constant return period `16`.** `leftDiagonal_onset_le_of_le_5000`
   closes with `rowNat (2k) ≡ rowNat (2k + 16) mod 2^(k+1)` at every `k ≤ 5000`
   — the same constant, where the equivalence only guarantees `2^k`. It fails
   at `k = 87867`, which is exactly where the left-diagonal period regime moves
   from 16 to 32. The constant held while the period was `16` and broke when it
   was not.
2. **The `O(n)` attractor.** `|A(n)|` looked linear and it is not: the growth
   is `|A(n)| − |A(n-1)| = maxCycle(n)`, and `maxCycle` is unbounded by this
   board's proved `leftDiagonal_period_unbounded`, so `|A(n)|` is
   `Θ(n · P(n))`. The apparent linearity was the period being constant over the
   sampled range.
3. **The rigidity law itself.** `|A(n)| − |A(n-1)| = maxCycle(n)` holds with
   zero exceptions over `n = 2..520` and fails first at `n = 53209`, with the
   increment `32` against a `maxCycle` of `16`, and again at `n = 58288`.
   Those two positions are **exactly two past the eventually-white left
   diagonals at `53207` and `58286`** — offset `+2` in both cases, checked
   against the independently computed white list `2, 7, 28, 399, 53207, 58286,
   87866`.

So the T-map reformulation is not, so far, generating structure that the
diagonal picture did not already contain. It re-encodes the doubling positions
in a different vocabulary, and every apparent law in the new vocabulary has an
expiry date set by the old one. That is worth knowing before another session is
spent looking for regularities there: **the right prior is that a clean pattern
in `T_n` is a period regime in disguise, and the question to ask first is where
it breaks rather than why it holds.**

**What the reformulation did buy, and it is not nothing.** The equivalence
itself (`leftDiagonal_onset_le_iff_stepMod_return`, proved) puts the wall in a
vocabulary with no automaton in it. The halving identity `step (2s) = 2 step s`
(proved, axioms `[propext, Quot.sound]`) makes the truncations a coherent tower
rather than unrelated finite systems. And the T-map side independently
confirmed NKS p. 871's fourth doubling position: the attractor's growth slope
changes at `n = 401`, the first 16-cycle, with the 8-cycle count freezing at
`n = 400`. A cross-check between two descriptions nobody had connected is worth
more than the regularities that died.

**Recorded** 2026-09-09 by Rowan, after the third instance. The first two were
found by commissioned verification; the third by a theorist that reduced the
law to "T_n has exactly one odd cycle" — Rowland's uniqueness conjecture at
truncation width `n` — and then located Rowland's own predicted counterexample
column.
