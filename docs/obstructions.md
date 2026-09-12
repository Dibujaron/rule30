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
175,680 at `ℓ = 4, 8, 12, 16, 18`. **These five numbers are maxima over 12
random words, not values of a function** — the denominator was never stated and
the numbers read as if it had been. Portage measured the same quantity at
`ℓ = 8` over 3,000 random words and saw 523, 532, 598 and 634, so `532` is one
draw among many rather than the size at `ℓ = 8`. It is specifically **not** a
competing value for `m(8) = 517` in obstruction 21; the two lists are a sample
and a function and they were being read as two functions that disagreed.
[2026-09-12, Rowan, from Portage's third sighting.]

**Obstruction 21 is this obstruction.** The number of distinct sections of
`E^t` is `3, 7, 16, 35, 71, 141, 272, 517, …`, which is obstruction 21's
reachable-row automaton size at all 20 values computed — the same machine seen
twice, in two vocabularies, by two sessions that did not know it. Read the two
entries as one. Structurally, no state of the minimal
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

## Unbounded right-diagonal periods do not force an aperiodic centre column: a period-4 boundary matches the seed exactly

**The natural attempt.** Crystal 70 and Portage's profinite sighting argue the
right edge is a strictly better position for P1 than the left, because
`centerColumn t = rightDiagonal t 0` puts the centre column at index `0` of an
object that is *exactly* periodic with no transient, where every left-edge
statement has to fight through a transient band. The board then hands you a
proved theorem about that object: `rightDiagonal_period_unbounded` says no single
`p` is a period of every right diagonal. So the move is irresistible — show that
an eventually periodic centre column would bound the right-diagonal periods, and
P1 falls out of a theorem already closed. The tower even looks like it should
cooperate: `rightDiagonal_recurrence` makes each diagonal a running XOR of a
driver built from the two outside it, the period doubles exactly when that driver
has odd weight over one period, and the doubling depths are a concrete arithmetic
object.

**Why it fails.** The implication is false, and the witness is a centre column of
period **four**. Take `X_b`, the configuration white at every `x ≥ 1` at time 0
with centre column `b` (crystal 40) — this is exactly the class the right-diagonal
tower can see, since the tower is generated by the recurrence from `R_0`, `R_1`
and the free bits `R_k(0) = b(k)`. For `b = (1000)^∞` the minimal periods of the
right diagonals reach **`2^27` by depth 64**, with **26 doublings, density
`0.406`** — against the seed's own **`2^27` by depth 64, 26 doublings, density
`0.406`**. Identical to three digits. Seven periodic boundaries measured
(`explorer/talus6_deep.mjs`, towers built from the recurrence and verified
cell-by-cell against the packed-row picture, 28,273 cells, 0 mismatches) give
densities `0.359`–`0.433`, bracketing the seed's from both sides. So the growth of
the right-diagonal periods does not distinguish a periodic centre column from the
seed's, and no sharpening of `rightDiagonal_period_unbounded` — not a rate, not
the exact doubling depths, not the minimal periods in closed form — can bear on
P1.

This is the **converse half** of the entry "The flat right-diagonal tower is a
real picture", and the two together close the route from both sides. That entry's
witness (`…10101|000`, our `b ≡ 1`) has periods that do *not* grow, and shows
that no right-half argument can prove they grow. This witness has periods that
*do* grow while the centre column repeats, and shows that proving they grow would
buy nothing. Reproduced here: `b ≡ 1` gives `P_k = 2` for every `k ≤ 64`.

Two things this does **not** say, because both were tested and both cut the other
way. It does not say the right-diagonal region is worthless — the topic's own law
turns out to be equivalent to "the minimal periods never drop", its odd branch is
unconditional (odd weight forces `P_k = 2L` with no hypothesis, from
`rightDiagonal_antiperiodic_of_odd_driver` plus `minimalPeriod_dvd` and the
periods being powers of two), and `rightDiagonal_first_failure` pins the minimal
period exactly at infinitely many explicit depths. And it does not say the law is
unprovable: **it holds for every configuration in the family**, 0 drops in
4,194,296 transitions covering every free-bit choice to depth 20, of which
2,482,084 are the case obstruction 7 leaves open.

**What it would take.** For P1, something from the *left* — the cone, the
leftmost black cell, the property that separates the seed from `X_b`. That is the
same ingredient Jen's theorem and Kopra's Theorem 3.5 need, and the same one the
entry "An eventually periodic centre column does not force another periodic
column" ends at. The right edge is a better position in the sense crystal 70
claimed — index `0` of an exactly periodic object really is cleaner than the
inside of a transient band — and it is the same position in the sense that
matters: index `0` is the *free* coordinate of the recurrence, so the tower
determines the picture modulo the centre column and every structural theorem
about it is a theorem about the quotient. Compare crystal 69, which says the same
thing about the left in different words: there the centre column outruns the
settling front, here it is divided out of the tower. **The suggested reading, and
it is a reading rather than a measurement: on both edges the centre column is
precisely the quantity the structure does not determine, and a statistic
computable from the settled structure alone cannot separate the seed from a
periodic boundary.** Two candidates have now died that way — another periodic
column (obstruction 9) and the right-diagonal period growth (this entry) — and a
third death would be worth an entry saying the family is statistically
indistinguishable, which is a stronger fence than either.

**One correction to the entry "A universal argument over periodic words cannot
give the right diagonals' minimality", in its own terms.** That entry's
counterexample pairs are arbitrary pairs of periodic words, and its rates (29 % of
pairs at `L = 4`, 10 % at `L = 8`) are measured over that population. The pairs
that occur as *consecutive right diagonals of an actual picture* are a vanishing
subset — exactly `2^k + 4` at depth `k`, against `≈ 4^(2^k)` pairs of words of
that period — and **not one of the 144 pairs of words of minimal period exactly 4
is reachable at any depth**, so its witness `u = 1000`, `v = 1110` is not a
counterexample to anything about the tower (`explorer/talus6_reach.mjs`,
exhaustive over every free-bit choice, depths 2–16). Its closing line — "nothing
on the board relates two neighbouring right diagonals except the recurrence
itself, which is what the counterexamples above satisfy" — is the part that needs
amending: the counterexamples satisfy the recurrence's *local* consequence (`u`
black at `q+1` forces `v` to flip at `q+1`) but are not *generated* by it from the
tower's base, and that is a far stronger constraint. The entry's verdict stands
for the population it measured and not for the tower.

**Recorded** 2026-09-10 by Talus, from the attack document
`docs/attacks/2026-09-10-rightdiagonal-period-doubles-iff-odd-weight-move-the-p1-wall-to-the-right-edge-where-there-are-no-transients-crystal-70.md`.
Scripts `explorer/talus6_tower.mjs`, `talus6_family.mjs`, `talus6_reach.mjs`,
`talus6_deep.mjs`, `talus6_plateau.mjs`, `talus6_ord2.mjs`, `talus6_margin.mjs`;
kernel check
`explorer/talus6_scratch_mgap.lean`, with `talus6_scratch_mutant.lean` kept
beside it as the demonstration that the check can fail.

## Every re-reading of a centre-column cell is at bit-index speed 1 or 2, and the speed-0 ones stop at k = 19

**The natural attempt.** In the packed row, bit `b` of `rowNat t` is the cell at
position `x = b - t`, so a left diagonal reads a bit index that does not move, a
column reads one that moves one bit per row, and a right diagonal reads one that
moves two. Crystal 69 fences the middle speed off: the settling front only reaches
bit `n` at about row `1.25 n`, so the centre column's read at bit `t`, row `t`, is
permanently inside the transient. The obvious way out is a **second reading** — the
same centre-column cell, at a place the front has passed. Two exist to try. Left
diagonal `k` with onset zero gives one at the same bit index and a much later row.
And `centerColumn_eq_evolve_mul_pow` (landed 2026-09-10) puts centre-column cell
`k` at position `m·2^k` of row `m·2^k + k`, which is the first node putting the
centre column anywhere but the origin.

**Why it fails.** The speed-0 re-reading exists and is **finite**: left diagonal `k`
is periodic from index `0` for exactly `k ∈ {0,…,17,19}` and for no other `k` up to
**200,000** (`explorer/sextant7_reread2.mjs`, every diagonal tested from its own
index 0). The die-off carries no structure whatever — the first index at which a
diagonal disagrees with itself 32 rows later runs
`50.098 %, 24.894 %, 12.521 %, 6.218 %, 3.115 %, 1.598 %, …` over 199,982
diagonals, successive ratios `0.497, 0.503, 0.497, 0.500, 0.513`, with a largest
first-disagreement index of `17` against a fair coin's expected
`log₂ 200000 ≈ 17.6`. So the crack is the finitely many diagonals whose eventual
period is short enough to start at index 0, and nothing else.

The speed-2 re-reading is worse rather than better. `centerColumn_eq_evolve_mul_pow`
reads bit `2m·2^k + k` of row `m·2^k + k` — a ratio tending to **2**, the far edge
of the cone, twice the centre column's own speed. At `k = 12, m = 3` it is bit
24,588 of row 12,300, whose low bits do not settle until row 32,948. Two things are
worth recording with it. Its content is **not** the halving law, as its docstring
says, but `rightDiagonal_periodicFrom_pow`: `evolve (m·2^k + k) (m·2^k)` is
`rightDiagonal k (m·2^k)`, equal to `rightDiagonal k 0 = centerColumn k` by period
`2^k` and `periodicFrom_mul`. And the halving law `rowStep (2s) = 2·rowStep s`
relates the orbit of `1` to the orbit of `2^a` — a *different* orbit, the same
picture translated — so it cannot produce a second reading of the seed's own orbit
at all.

And the two settled bands do not close from either side. At period at most 32 the
band on the left is bits `0 .. 0.75 t` and the band on the right is
bits `2t − 8 .. 2t`, nine diagonals wide because the right diagonals' minimal
periods are `1,2,2,4,8,8,16,32,32,64,64,64,64,64,64,128,256,…` so `P_k ≤ 32`
exactly for `k ≤ 8` — a band of **constant width**. (Obstruction 20 publishes the
list; recomputed from the picture over 19,991 terms per diagonal in
`explorer/sextant7_bands.mjs`, agreeing on all ten published entries.) The centre column at bit `t` is strictly
inside the gap for every `t ≥ 19`: below the right band from `t = 9`, and strictly
above the left band from `t = 19`, since `A(t) ≤ t` throughout with equality only
at `t = 18`. Reads at ten intermediate rational speeds
(`1/4, 1/3, 1/2, 2/3, 3/4, 1, 5/4, 4/3, 3/2, 7/4`) are none of them eventually
periodic over 60,000 rows with periods to 4,096, each with essentially every
length-24 window in its tail distinct (`explorer/sextant7_invariants.mjs`).

**A correction to crystal 69 while the file is open, because a seeder will design
against the number.** Its constant is wrong. The preperiod of the low `n` bits runs
at **`4/3 · n`**, not `1.25 n`: least-squares slope `1.32929` over
`n ∈ [49119, 98239]`, ratio `1.336` at `n = 8·10⁴`, and the settling front advances
at `A(t)/t = 0.75005` at `t = 130,976` (`explorer/sextant7_deep.mjs`, exact, no
window truncation, monotonicity violated 0 times; the lag-32 method checked against
a brute-force cycle-finder for every `n ≤ 18`, 0 mismatches). `1.25` is a real
number over a narrow range — the octave slopes are `1.156` at `[128,256]` and
`1.258` at `[512,1024]`, so a fit below `n ≈ 600`, which is crystal 62's range,
gives it — but crystal 62's own worked data point `pre(49) = 71` is ratio `1.449`.
The right constant was in print in 1986: `4/3 = 1/(1 − 1/4)` and `1/4` is Wolfram's
regular/irregular boundary speed (`wolfram-1986-random-sequence-generation.txt`
line 603, "biased random walk, advancing at average speed 1/4", and lines 802–810).
It agrees with crystal 51's independently measured seam speed `0.2497`. **The fence
crystal 69 draws is therefore stronger than the crystal states — the margin is a
quarter of the row, not a fifth — and its real content is a damage-front speed, so
crystals A3 prices it and no proof of it is available.**

**What it would take.** For the centre column to be settled at row `t` the front
would have to satisfy `A(t) ≥ t + 1`, that is `2·F(t) + t ≥ t + 2` where `F` is
crystal 51's front — the leftmost transient cell strictly right of the origin,
i.e. a damage front drifting *rightward*. The measured front drifts left at
`0.24995` and `max (A(t) − t)` over `t ≥ 18` is `0` (attained once, at `t = 18`,
which is crystal 51's first transient cell). Bounding a left damage front below is
the mirror of crystals A3 and is not available for the same reason. **Consequence
for a seeder: a packed-row proposal whose value comes from re-reading the centre
column somewhere else is refuted in advance — the only two relocations the board
holds are at speed 2 and at nineteen values of `k`.**

**One thing found on the way, and it corrects `docs/sources.md` rather than a
crystal.** That file offers
`sources/oeis-a363346-left-diagonal-transients.txt` as "the measured onsets that
`leftDiagonal_onset_le` is about, as an independent computation to compare the
engine against". It is not comparable, and now with a reason rather than a shrug:
`A363346(3) = 1` while our left-diagonal onset is `0` for every `k ≤ 17` and `> 0`
for every `k ≥ 20` up to 200,000, so **no increasing reindexing `n ↦ k(n)` can send
3 to a diagonal of onset 1 and then 4..10 to larger diagonals of onset 0.** Eleven
candidate reindexings were tried (`onset(n±1)`, `⌊n/2⌋ + onset(n)`, `onset(2n)`,
`onset(3n)`, …): the best fits 85 of 100 terms and every other fits 10 or fewer
(`explorer/sextant7_a363346.mjs`). Whatever A363346 counts, it is not this, and it
should not be cited as a control for onsets until someone identifies it.

**Recorded** 2026-09-10 by Sextant, from the attack document
`docs/attacks/2026-09-10-the-p1-residual-in-the-packed-row-vocabulary-what-can-be-said-about-a-diagonal-read-of-the-row-map-s-orbit-crystal-60-re.md`.
Scripts `explorer/sextant7_front.mjs`, `sextant7_deep.mjs`, `sextant7_forced.mjs`,
`sextant7_invariants.mjs`, `sextant7_reread.mjs`, `sextant7_reread2.mjs`,
`sextant7_a363346.mjs`; kernel checks `explorer/sextant7_scratch_forced.lean`, with
`sextant7_scratch_axioms.lean` beside it as the demonstration that the check can
fail — it runs the same proof with one bit of the forcing triple flipped and Lean
rejects it at the line the flip breaks.

## Prize 2's excess cannot be bounded through the half-line, and the run route is capped below the target

**The natural attempt.** P2 has twelve proved nodes and ten of them are true of
any `ℕ → Bool`, so the region wants one statement about the excess
`E(N) = 2·count(N) − N` that a coin could fail. Three look available. *Localise:*
`centerColumn_density_tendsto_half_of_nearby_cuts` says balance need only be
checked at a thin set of cuts, so find a sparse set rule 30 supplies — the period
doublings, the eventually-white left diagonals, the powers of two — where the
excess is easier to control. *Determine:* the board's black-time law
(`column_succ_of_black`) and Dioptra's white-time law
(`centre_forced_after_double_white`) make `0.6885` of the centre column a
function of column `−1`, measured over 200,000 rows, so ask what a count
inherits from a determination. *Count runs:* bound some moment of the
run-length distribution and read off a bound on the excess.

**Why all three fail, and the third fails in principle.**

*The sparse-cut route dies on the lemma's own hypothesis.* The lemma asks that
**for every** `d` there be a cut `M ≤ N` with `d·(N − M) ≤ N`, i.e. a cut inside
`[N(1 − 1/d), N]` for every `d` and all large `N`. That set must meet every
multiplicative window and is therefore not sparse in any useful sense. Every
rule-30-supplied set on the board is exponentially sparse and admits `d = 1` and
no more: worst relative gap `0.99996` for the doublings `3, 8, 29, 400, 87867,
2107985255`, `0.99994` for the whites `2, 7, 28, 399, 53207, 58286, 87866,
1420878968`, `0.5` for the powers of two. Granting admissibility buys nothing
either: at those cuts `|E|/√N` reaches `0.72`, `1.41`, `1.56` against a fair
coin's `1.41`, `1.13`, `2.00` on the same sets to `N = 10^7`
(`explorer/talus7_analyse.mjs`).

*The determination route is vacuous by a theorem, not by a measurement.* Both
forcing laws are stated for an **arbitrary** `Config`. Crystal 40 says every
Bool sequence `b` is the centre column of a configuration white at every
`x ≥ 1`, so both laws hold with `b` in place of the centre column, for every
`b`: **any consequence of them alone is true of every Bool sequence and can
bound nothing.** The law `c(t+1) = ¬L(t)` is in fact `sideways_inverse` at the
origin read backwards — it *defines* column `−1` from columns `0` and `1`
rather than restricting column `0`, and "`c(t+1) = ¬L(t)` holds exactly when
`c(t) ∨ col₁(t)`" fails `0` of `199,999` times on the seed. The coverage figure
is a coin's: `dens(c ∨ col₁)` is `0.7508` for the seed and `0.7495`, `0.7504`,
`0.7523` for three fair-coin boundaries, while the black law's `0.5004` is the
centre column's own density quoted back (`explorer/talus7_coverage.mjs`,
`T = 200,000`). This is the **third** death of the shape obstruction 20 asked
for: no statistic computable from the half-line separates the seed from an
arbitrary boundary, and the family is statistically indistinguishable.

*The run route is capped below the target.* Measured, the run-length
distribution **is** geometric: at `N = 10^7` the means are `1.99878` and
`2.00056` against `2`, `E[L²]` is `5.99340` and `6.00242` against `6`, and every
per-length ratio from `1` to `12` lies in `[0.94, 1.03]`, a fair coin's own
scatter. But the route would fail even if it worked: if every run below `N` had
length at most `c·log N` there would be at least `N/(c log N)` runs, so the
minority colour would occur at least `N/(2c log N)` times and
`|E(N)| ≤ N(1 − 1/(c log N))`, which is **not** `o(N)`. Since the true longest
run tracks `log₂ N` (22 white and 23 black below `10^7`), no sharpening of a run
bound can reach P2.

*And the excess itself is a coin at every statistic reached.* To `10^7` rows,
`E = 4440 = 1.404√N`, minimum `−257` at `172,711`, maximum `4605`, first
negative at `N = 127`, last non-positive at `195,112` — so it changes sign only
170 times and is positive over the last 98% of the range. Those three look
unlike a walk and are not: against **40 fair-coin draws of the same length**,
`6`, `5` and `2` of `40` are at least as extreme, and the three are the arcsine
law seen from three sides (`explorer/talus7_null.mjs`).

**What it would take.** Something that uses the left cone, which is the only
part of the picture the family does not share, exactly as for P1. The one thing
the cone does give is a bound on the centre column's runs, and it is worth
recording because it is the only quantitative rule-30 bound on `E(N)` anyone has
produced: while the centre column is black, `column_succ_of_black` and
`evolve_sub_one_eq_xor` force the checkerboard leftward one column per step, and
`evolve_left_edge` with `evolve_left_second_diagonal` put two **adjacent** black
cells at the cone edge, which a checkerboard cannot match. So a maximal black
run beginning at time `a` has length at most `a`; run starts at most double;
there are at least `log₂N − O(1)` maximal runs below `N`; and

    |E(N)| ≤ N − log₂ N + O(1).

Measured: the forced alternation fails `0` of `500,759` cells over every maximal
black run below `10^6`, and `L ≤ a` has `0` violations in `500,570` maximal runs
of either colour with `a ≥ 1`, tight at `a = 3` — the only run outside it being
the seed's own opening `1,1` at `a = 0` (`explorer/talus7_runbound.mjs`; kernel
`explorer/talus7_scratch_alternation.lean`, with `talus7_scratch_mutant.lean`
beside it as the demonstration that the check can fail). The determination is
Wolfram 1986 §7 lines 1118–1120 ("if the position 0 sequence consists solely of
ones, then the whole triangle of sites is completely determined"); the
identification of that triangle as `(10)^ℤ` and the run bound are not in print.
The bound is worth `23` at `N = 10^7`.

**One place the rule does bite, and it is the other marginal.** Rule 30's law is
between horizontally adjacent cells, so it constrains a **row** count where it
constrains no column count at all. Crystal 8's forbidden block gives
`b(t+1) ≤ (2t+3) − (b(t) − ρ(t))` with `ρ(t)` the number of maximal black runs,
and `ρ(t) ≤ (2t+1−b(t)) + 1`, hence `b(t+1) + 2b(t) ≤ 4t+5` and a triangle black
density of at most `2/3 + O(1/T)` — better than the cone's `1`, which crystals
29 says is all that is provable. Exactly, `b(t+1) = ρ(t) + 2·G₂(t) + 2` with
`G₂` the interior white gaps of length `≥ 2`. Both hold with `0` failures over
rows `1 … 299,999` and the inequality is tight at `t = 1`
(`explorer/talus7_rows.mjs`). **Consequence for a seeder, and it is the honest
summary of this entry:** a P2 proposal about the centre column that does not
name the cone is refuted in advance by crystal 40, and the row marginal is where
the automaton's local law actually has purchase.

**Recorded** 2026-09-10 by Talus, from the attack document
`docs/attacks/2026-09-10-prize-2-s-residual-find-any-bound-on-the-centre-column-s-excess-that-uses-rule-30-the-measurement-that-defines-this-topi.md`.
Scripts `explorer/talus7_center.mjs`, `talus7_deep.mjs`, `talus7_analyse.mjs`,
`talus7_coverage.mjs`, `talus7_runbound.mjs`, `talus7_rows.mjs`,
`talus7_diagbalance.mjs`, `talus7_filter.mjs`, `talus7_null.mjs`,
`talus7_pickrun.mjs`.

## The row marginal's local route is sharp at 3/5, and 3/5 is attained

**The natural attempt.** The entry above ends by naming the row count as "where
the automaton's local law actually has purchase", and it is right that it has
some. Rule 30's law is horizontal, so it constrains a row where it constrains no
column: crystal 8's forbidden block gives `b(t+1) + 2b(t) ≤ 4t+5` and a triangle
black density of at most `2/3`, and `rule30_run_boundary` gives the exact
identity `b(t+1) = ρ(t) + 2·G₂(t) + 2`. Row balance (A070952, crystal 29) then
reads *"a rule 30 row has about one maximal black run per four cells and about
half its interior gaps are long"* — finite combinatorics of one row, where P2 is
a limit along a direction the rule does not constrain at all. So sharpen the
inequality with the exact identity, and keep sharpening: track pairs of blocks,
then triples, and squeeze the `2/3` down to `1/2`.

**Why it fails, and the failure has a constant rather than a shrug.** The
sharpening works once and then stops dead, at a value that is not `1/2`.

*The one-block programme's exact optimum is `3/5`.* Feeding the identity
`b(t+1) = ρ + 2G₂ + 2` the three bookkeeping facts — `G₁ + G₂ = ρ − 1`, the gaps
fit inside the whites (`w ≥ G₁ + 2G₂`), and runs are non-empty (`b ≥ ρ`) — and
maximising over `ρ` and `G₂` gives

    2·b(t+1) + 3·b(t) ≤ 6t + 9,   hence   Σ_{t<T} b(t) ≤ (3/5)·T² + O(T),

which is strictly sharper than `b(t+1) + 2b(t) ≤ 4t+5` at every row that is not
all black (the two caps on `b(t+1)`, doubled, are `8t+10−4b` and `6t+9−3b`, and
the second is smaller exactly when `b(t) < 2t+1`; the sole exception is row 1,
`111`). Checked at every row below `2·10^5` with `0` failures, and — the form a
proof would actually assert — over **every word of span `n` for `n ≤ 22`**, all
2,097,152 of them, with `0` violations and minimum slack exactly `0` at every
single span, the extremal word being `(100)^k 1`
(`explorer/sextant8_rows.mjs`, `sextant8_lp.mjs`). Kernel-checked against
`rowCell` in `explorer/sextant8_scratch_rows.lean`, with
`sextant8_scratch_mutant.lean` beside it asserting `6t+8` and rejected.

*And `3/5` is attained by a genuine rule 30 orbit, so no refinement can move
it.* The ring `10011` of size 5 has temporal period 5 under rule 30 and **every
state of its cycle has weight 3**, so its orbit-average black density is exactly
`3/5`. Verified by hand, by `decide` in the kernel file above
(`ringStep^[5] w = w`, `ringStep^[1] w ≠ w`, `weight (ringStep^[k] w) = 3` for
`k < 5`), and by exhaustive enumeration of every cycle of rule 30 on every ring
of size `N ≤ 24`, where the maximum over all of them is `0.600000` and nothing
exceeds it (`explorer/sextant8_rings2.mjs`). Since an inequality derived from
block frequencies and the one-step law is true of *every* configuration, it is
true of this one; so **for every `k` the `k`-block programme has optimum exactly
`3/5`** — `≤` because the one-block programme already proves it, `≥` because the
ring's `k`-block frequencies are feasible at every `k`. In measure-theoretic
terms the same counting gives `d' ≤ (3/2)(1−d)` per unit length, and invariance
`d' = d` yields `max { density of a rule-30-invariant measure } = 3/5`,
attained. **The hierarchy does not fail to close. It closes at level one, at
the wrong value.**

*The cone does not escape it.* Plant `(10011)^k` as a finite configuration of
span `n`; by `evolveFrom_eq_of_agree_on_window` every cell of row `t` at
position `[t, n−1−t]` agrees with the bi-infinite ring's picture, so the density
is held for `n/2` rows while the row grows by two cells a row. Measured triangle
density over the first 2,000 rows: `0.5448` at span 4,000, `0.5849` at 20,000,
`0.5968` at 10^5, `0.5997` at 10^6, **`0.599917` at `4·10^6`**
(`explorer/sextant8_cone.mjs`). So for every `T` and `ε` there is a *finite*
configuration whose first `T` rows have triangle density above `3/5 − ε`, and a
bound proved for all finite configurations cannot be below `3/5` either.

*The lower side is worse.* The all-white configuration is rule-30-invariant with
density `0`, so the programme's floor is `0`, and even excluding it the best
non-trivial witness is a cycle of density `0.456522` at `N = 23`. The only lower
bound the cone supplies is `b(t+1) = ρ + 2G₂ + 2 ≥ 3`, which is crystal 29's
known `b(t) ≥ 3`. **The local method pins the row density into `[0, 3/5]`, an
interval with `1/2` in its interior**, and row balance is a single point.

*And there is nothing local to build a better argument out of.* Row `200,000` of
the seed — 400,001 cells — has the `k`-block frequencies of a coin word: chi²
against the uniform is `179.3` at `k = 8` against a coin word's own `229.3`,
`3,798.7` at `k = 12` against `4,230.5`, `65,219.6` at `k = 16` against
`65,988.3`; every block up to length 14 occurs; the black runs have mean
`2.00486` against the coin's `2.00086` and the geometric `2`
(`explorer/sextant8_blocks.mjs`). This is the first death of obstruction 20's
requested shape for the **row**, and it is stronger than the column's: the seed's
row is indistinguishable from a coin *word*, not merely from a family member.

**What it would take.** Something that uses the property the local statistics
cannot see, and there is exactly one. The row is *not* free — `config ↦ row t` is
injective on finite configurations by pre-injectivity (crystal 4), so only
`2^{m−1}` of the `2^{m+2t−1}` words of span `m+2t` occur as row `t`, a
`4^{-t}`-sparse set, two bits destroyed per step. That is a real quantitative
constraint and it is the precise sense in which the row differs from the centre
column, which crystal 40 makes outright free. But by surjectivity (crystal 3/6)
every word is a one-step image, so being an image forbids nothing locally, and
the measurement above says the constraint leaves every local statistic looking
like a coin's. **A proof of row balance must therefore describe the reachable
set itself, not any statistic of it** — and nothing on the board or in print
describes it. Two corrections to the entry above, in its own terms, while the
file is open. Its `b(t+1) + 2b(t) ≤ 4t+5` is not the best the method gives; the
bound here is. And its tightness at `t = 1` is a three-cell row: asymptotically
the `4t+5` bound wastes **25.0%** of its own right-hand side and the `6t+9` bound
**16.7%**, measured at `t = 10^5` against a true triangle density of `0.500024`
— so "the method has no slack being wasted" is false, and the slack is exactly
the distance from the seed to the worst rule 30 orbit.

**One control, because a negative is worth what its controls are worth.** The
row excess is not anomalous, and it is *less* extreme than a coin's:
`max |2b(t) − (2t+1)|` is `3061` at `t = 285,762`, but normalised its worst is
`4.1715·√(2t+1)`, against a null of one independent binomial per row whose
maximum over the same `3·10^5` rows has median `4.7436` — **20 of 20 null draws
are at least as extreme** (`explorer/sextant8_null.mjs`). The lag-1
autocorrelation of the row excess is `−0.4911`, which is real, is the only
rule-30-specific row statistic found, and explains the sub-coin maximum: a high
row forces a low successor through the bound above. It bounds no mean.

**Recorded** 2026-09-12 by Sextant, from the attack document
`docs/attacks/2026-09-12-the-row-count-b-t-is-the-row-marginal-provable-where-the-column-marginal-is-not-this-is-talus-s-own-next-topic-section-6.md`.
Scripts `explorer/sextant8_rows.mjs`, `sextant8_lp.mjs`, `sextant8_rings2.mjs`,
`sextant8_cone.mjs`, `sextant8_null.mjs`, `sextant8_diag.mjs`,
`sextant8_blocks.mjs`; kernel `explorer/sextant8_scratch_rows.lean` with
`sextant8_scratch_mutant.lean` beside it. `explorer/sextant8_rings.mjs` is a
stub: its first version ran rule 30's **mirror** (it took `s >>> 1` for the left
neighbour, whose bit `i` is `s(i+1)`) and totalled cycle weights out of a
4096-entry buffer. It produced the right headline for the wrong reason —
density is mirror-invariant and `10011` reversed is `11001` — and was caught
only by an asymmetric check: rule 30's known period-3 ring `010011111000`
(Wolfram 1986 Table 6.2) was absent from its `N = 12` output. The rewrite
carries that cross-check in the file and reproduces Wolfram's table.

## Aperiodicity does not imply hardness: rule 90's column 1 is aperiodic and O(log n), machine-checked

**The natural attempt.** P3 says rule 30's centre column is computationally
irreducible. The one thing the board can actually prove about that column is
aimed at P1 — that it does not repeat — so the instinct is to use it: build an
argument for P3 out of aperiodicity, or out of the properties the centre column
shares with every column of every elementary CA grown from one black cell
(surjectivity of the rule, the light cone, left-permutivity, the space-time
subshift, the trace's factor complexity). Crystal 66's OR-to-XOR filter already
warns against the P1 version of this; the P3 version looks different, because a
sequence that never repeats *feels* like a sequence that cannot be shortcut.

**Why it fails, and this time with a theorem rather than a filter.** Grow rule
90 — `left XOR right`, the linear rule — from `initialConfig`, the *same* single
black cell the prize questions use, and read column 1. It is black exactly at
`t = 1, 3, 7, 15, 31, …`, i.e. at `t = 2^j − 1` for `j ≥ 1`, and white
everywhere else; so it is not eventually periodic, and its `n`-th bit is "every
binary digit of `n` is 1", which a three-state automaton decides while reading
the digits of `n` once. Both halves are proved in the kernel with the project's
allowed axioms: `explorer/talus9_scratch_rule90.lean` (`E_col1`,
`col1_not_eventually_periodic`) and `explorer/talus9_scratch_witness.lean`
(`dfa_polyTime`, `rule90_col1_polyTime`, and `litmus`, which is the conjunction:
**not eventually periodic, and `TM2ComputableInPolyTime encodeNat encodeBool`
with time `X + 1`**). The machine is Mathlib's own bundled `FinTM2`, the same
model Pantograph's `P3Core` is stated in, and the kernel runs it on concrete
inputs (`encodeNat 7` halts in four steps with `[true]`; `encodeNat 5` with
`[false]`). So **an aperiodic column of an elementary CA from a single black
cell can be `O(log n)`**, and any P3 argument that uses only aperiodicity, or
only that the object is such a column, is refuted before its details matter.
The same file states it in `P3Core`'s own shape as `aperiodic_not_hard`:
`∃ g, ¬ IsEventuallyPeriodic g ∧ ¬ IsEmpty (TM2ComputableInPolyTime encodeNat
encodeBool g)`, with `IsEventuallyPeriodic` imported from `Rule30/Prize.lean`
rather than re-spelled.

**Say it in the schematic form, not the literal one.** The topic this came from
— and the theorist's own next-topic paragraph before it — put the result as
*"'P3 is not implied by P1' is machine-checked"*. Read literally that is a claim
about rule 30 (P1 true, P3 false), which nothing here proves and which is
probably false, since both prizes are expected to hold. What is proved is that
*some* sequence is aperiodic and fast, hence that **no proof of P3 can proceed
from aperiodicity alone** — a fence on proofs, not an implication between the
prizes. The Lean statement is an `∃ g, …` so that the literal misreading is
unavailable.

Two things this does *not* say. It does not say P3 is false — rule 30 is not
rule 90, and the separating ingredient is named on this board: rule 30 is rule
150 plus the quadratic term `2r AND r` (crystal 59), and rule 90 has no such
term. And it does not bear on the *threshold* — `TM2ComputableInPolyTime` asks
for time polynomial in the input length `log n`, while `docs/prize.md`'s P3 asks
for `Ω(n)`; the witness sits at the very bottom of the gap between them, which
is exactly why it is a good litmus and exactly why it says nothing about where
the line should be drawn.

**What it would take.** A P3 proposal must name a property the linear rules do
not have. The only candidate on the board is the nonlinearity itself, and
crystal 66 is the cheap test: if the reasoning survives replacing `OR` with
`XOR`, it is refuted, now on both prize questions and for two different reasons
— rule 90's *centre* column is eventually white (crystal 66, P1) and rule 90's
*column 1* is aperiodic and easy (this entry, P3). Note also what the witness
buys in the other direction, which is the reason it was built: together with
`periodic_polyTime` (proved the same day; every eventually periodic sequence has
a fast machine, so `P3Core` implies P1), it shows Mathlib's model is non-vacuous
in *both* directions, so `P3Core` is neither provable-and-worthless nor false
for a stupid reason.

**One methodological warning, because it cost real time and the usual guard is
useless here.** Rule 90 is `left XOR right` and is **amphichiral** — its mirror
is itself. This project's standard defence against an orientation error ("does
the mirror rule pass the same check?") is therefore vacuous on rule 90, and the
closed form is not even characteristic of it: **nine** of the 256 elementary
rules have exactly this column 1 to `t = 120` (18, 22, 26, 82, 90, 146, 154,
210, 218; `explorer/talus9_rule90.mjs` §5), because the sparse Sierpiński
picture never presents the neighbourhoods that would separate them. What guards
it instead is the lookup table checked against `left XOR right` at all eight
neighbourhoods, and a kernel `decide` comparing the board's own
`ElementaryCA.step 90` picture against the first seven rows of the cone — an
asymmetric fact about the *cone*, not about the rule.

**Recorded** 2026-09-12 by Talus, from the attack document
`docs/attacks/2026-09-12-the-rule-90-witness-as-a-theorem-rather-than-a-script-and-the-work-stack-alphabet-fence-before-prize-lean-is-restated-th.md`.
Script `explorer/talus9_rule90.mjs` (two independent engines, 200,000 rows);
kernel `explorer/talus9_scratch_rule90.lean` and `talus9_scratch_witness.lean`,
with `talus9_scratch_mutant_col1.lean` beside them as the demonstration that the
check can fail — it drops `1 ≤ j` from the closed form and is *accepted*,
proving the mutated statement false at `t = 0`.

## `FinTM2` does not require finite work-stack alphabets, and Mathlib's own TM2-to-TM1 simulator needs the hypothesis it lacks

**The natural attempt.** Pantograph's P3 reading (`docs/connections/2026-09-11-make-p3-sayable-*`)
puts P3 into Mathlib's `Turing.FinTM2` and depends on one row of a dictionary:
that the model is a faithful account of "an algorithm", so `IsEmpty
(TM2ComputableInPolyTime …)` really does say "no shortcut". Reading the
structure's *name*, one discharges the row by observing that a `FinTM2` is
finite in every component, so there is nothing to check.

**Why it fails.** It is not finite in every component.
`Mathlib/Computability/TuringMachine/Computable.lean:46–70` carries `Fintype` on
the stack index `K`, the labels `Λ`, the internal state `σ` and the **input**
alphabet `Γ k₀` — and on nothing else. `Γ k` for every work stack, and for the
output stack, is an arbitrary type: it may be `ℕ`, or a type of reals, or
anything. That matters because the pop and peek handlers have type
`σ → Option (Γ k) → σ` and are arbitrary Lean functions, so they need not be
computable; if an unbounded symbol could reach one, the machine would carry a
non-computable oracle and `P3Core` would be **false for a stupid reason** —
exactly the failure `Turing.TM0` had, which `docs/prize.md` now records in those
terms. And Mathlib does not treat this as harmless: the tape alphabet of its own
TM2-to-TM1 simulator, `Γ' K Γ = Bool × ∀ k, Option (Γ k)`, is a `Fintype` only
under `[∀ k, Fintype (Γ k)]` (`StackTuringMachine.lean:349–358`), a hypothesis
`FinTM2` does not supply. So on the library's own terms a `FinTM2` with an
infinite work alphabet is not known to be a finite-tape machine at all.

**What it would take, and what is now proved.** The channel is not real, and
that is a theorem rather than an observation: `explorer/talus9_scratch_fence.lean`
proves `stackAlphabet_finite` (for every `tm : FinTM2` there is a **finite** set
`alphabet tm : Set ((k : tm.K) × tm.Γ k)`, depending on the program alone),
`reachable_stack_mem` (every configuration reachable from `initList tm l`, for
every input and every number of steps, has all its stacks' contents inside it)
and `pop_sees_finitely_many` (so a pop or peek handler is only ever applied to
finitely many arguments, all fixed before the input is read, and is a lookup
table however it was written). Axioms `[propext, Classical.choice, Quot.sound]`.
The mechanism: `push k f q` pushes `f v` with `f : σ → Γ k` and `σ` finite, the
program is a finite family of finite syntax trees, and `initList` puts symbols
only on `k₀`. Two notes for whoever takes this further. The pushable symbols must
be collected as **dependent pairs** `Set ((k : K) × Γ k)`; gathering them into
`∀ k, Set (Γ k)` forces a transport at every `push` node and the induction fights
`Eq.mpr` instead of doing mathematics. And what is **not** proved is the
simulation — that every `FinTM2` is equivalent to one with `Fintype (Γ k)` for
every `k`. That needs quotienting each alphabet and carrying the machine across;
it is routine, it is a size-L node, and until it exists the honest reading is
"the hazard is fenced and the remaining gap is a construction nobody expects to
fail", not "the question is closed".

**Recorded** 2026-09-12 by Talus, from the attack document
`docs/attacks/2026-09-12-the-rule-90-witness-as-a-theorem-rather-than-a-script-and-the-work-stack-alphabet-fence-before-prize-lean-is-restated-th.md`.
Kernel `explorer/talus9_scratch_fence.lean`, with
`explorer/talus9_scratch_fence_mutant.lean` beside it as the demonstration that
the check can fail: it deletes the `push` case's contribution and nothing else,
Lean rejects the mutated invariant at line 77 — its `push` case — and the same
file *accepts* a two-stack counterexample showing the mutated statement is false,
not merely unproved.

## The `4^-t` sparsity of the reachable rows is exact, global and computable, and it permits rows of black density 0.97

**The natural attempt.** The entry above this one about the row marginal ends
by naming the one thing it does not cover. Rule 30 is pre-injective (crystal 4),
so the map from a finite configuration of span `m` to the row it becomes after
`t` steps is injective, and only `2^(m-2)` of the `2^(m+2t-2)` black-ended words
of span `m + 2t` occur — a `4^-t`-sparse set, two bits of information destroyed
per step. That is a genuine, quantitative, provable constraint on a row, and it
is the precise sense in which the row is not free where crystal 40 makes the
centre column free. So use it: find a word that is *not* a `t`-step image, and
more to the point find the density ceiling it must impose, which would sharpen
`2b(t+1) + 3b(t) ≤ 6t + 9` below its `3/5` and reach row balance.

**Why it fails, and each half is measured.**

*The window reading has no negative at all, and that is a construction rather
than a measurement.* Every word of every length occurs as a **window** of row
`t` of a finite configuration, for every `t`: solve rule 30 leftward `t` times
from the word with the free cells set white, pad the result with white on both
sides, and the light cone (`evolveFrom_eq_of_agree_on_window`, proved) makes the
padding irrelevant. Verified over **688,110 `(t, word)` pairs** at `t ≤ 8` and
word lengths to 16, 0 failures, and independently by brute-force factor sweep
over every finite configuration of span `≤ 18` (`256/256` words of length 8 at
`t = 3,4,5,6`); kernel instance `k1_window` in
`explorer/sextant9_scratch_reach.lean`, axioms `[propext]`
(`explorer/sextant9_window.mjs`). The half that does the work is in print twice
— Wolfram 1986 §4 lines 447–456 and Fukś 2013 §2 line 75, both the
four-preimages leftward solve — and the new part is only the step from blocks to
finite configurations, which is the cone.

*So the constraint is a whole-row statement, and as a whole-row statement it
imposes no density ceiling.* Take the window to be all-black of length `L`: the
same construction gives a finite configuration of span `L + 2t` whose row `t`
has span `L + 4t` and contains `L` consecutive black cells, so its black density
is at least `L/(L + 4t) → 1`. Measured at `t = 40`, `L = 4000`: **row density
`0.971875`** with the 4000-cell black run verified present by forward evolution;
`0.987943` at `t = 16` and `0.999500` at `t = 1`
(`explorer/sextant9_maxdensity.mjs`, 24 `(t, L)` pairs, run present in all).
Separately the `3/5` witness is itself a reachable row at every depth: the ring
`10011` planted as a genuine finite configuration of span 200,001 has middle
density `0.600002` at every `t ≤ 60` (`explorer/sextant9_fence.mjs`). **So
conditioning the row bound on "this row is a `t`-step image" cannot move `3/5`,
and Prize 2 gets nothing from the sparsity.**

**What the constraint actually is, because it is exactly describable and that is
worth recording rather than losing.** A finite configuration has at most one
*finite* predecessor and there is a one-pass procedure that finds it: the only
right tail consistent with white-far-right is the white one, so left-permutivity
forces every cell going leftward with no choice anywhere. Past the left end of
the support the recursion degenerates to `x(i-1) = x(i) | x(i+1)`, which is
white for ever if the two cells immediately left of the support came out white
and **black for ever otherwise**. So finiteness of the predecessor is exactly
two bits, and they sit at the **left edge**; iterating `t` times decides
membership in `O(t · n)`. Checked against brute force over **2,258,262 words**,
every `t ≤ 6` and every span to 20, **0 disagreements** in either direction, with
the count `2^(n-2t-2)` exact at every `(t, n)` and finite-preimage uniqueness at
2,048 images (`explorer/sextant9_criterion.mjs`). Three cautions with it. The
`1/4` survival rate per backward step is the count restated and is evidence of
nothing. That the constraint *exists* is classical — Amoroso–Cooper's
Garden-of-Eden theorem for finite configurations (reference [29] of
`sources/martinez-adamatzky-hoffmann-rule22.txt`, the paper not held): rule 30
is not injective (crystal 5), hence not surjective on finite configurations —
and it must not be reported as a finding. And the criterion is **not** a cone-edge
condition: `11101` has the legal prefix of the reachable `11011` and the legal
suffix of the reachable `11001` and is row 1 of no finite configuration
(hand-verified, and `k2_unreachable` in the kernel file above over every
configuration supported in `[-3,7]`, with `explorer/sextant9_scratch_mutant.lean`
beside it rejected by Lean at the right line). No prefix-plus-suffix condition of
any width cuts out the reachable set, at any `t ≤ 7`
(`explorer/sextant9_nonlocal.mjs`), and at depth 8 flipping **any** single cell
anywhere in the row destroys reachability with probability `≥ 0.99`.

**One cross-vocabulary confirmation and one discrepancy, both worth an hour to
whoever cares.** The reachable set at depth `t` is a regular language — read
right-to-left carrying the `t` backward-solve levels as state — and its minimal
automaton has `3, 7, 16, 35, 71, 141, 272, 517, 971, 1792, 3263, 5873, 10483,
18619, 32885, 57741, 100901, 175680, 304714, 526563` states at `t = 1…20`,
ratios falling from `2.33` to `1.728` (`explorer/sextant9_automaton.mjs`,
`sextant9_automaton2.mjs`; cross-checked against the backward-solve decider over
every word of length `2t+8` for `t ≤ 6`, the only disagreement being the
all-white word, and against brute-force configuration counts at ten `(t, span)`
pairs). **Those are the numbers of the entry "The rule 30 edge group is not
contracting"**, whose forced-set sizes are `35, 532, 5873, 57741, 175680` at
`ℓ = 4, 8, 12, 16, 18`: four of five agree exactly, including both six-digit
entries, from code sharing nothing with `nucleus_*.cjs` and a framing with no
group in it. The fifth does not — **517 here against 532 there at `ℓ = t = 8`** —
and I cannot say which is right without reading that code; my ratios are smooth
across that point (`1.901, 1.878, 1.846`) and theirs jump (`1.97` then `1.82`),
which is weak evidence for 517 and weak is all it is. The consequence either way
is the same and it is the honest answer to "is there a computable description of
the reachable set at all": **yes, a finite automaton for each `t`, and no uniform
one**, since a bounded description would make that group contracting.

**A cross-check that was not looked for, and is the cleanest thing here.** The
all-black word of span `n` is a 1-step image of a finite configuration **exactly
when `3 | n`**, with preimage `(100)^k`, for every `n` from 3 to 22
(`explorer/sextant9_allblack.mjs`) — which is crystal 25's ring Garden-of-Eden
result (Wolfram 1986 §9, crediting the Feynmans) reproduced under a *different
boundary condition*. At `t = 2` the all-black row is a 2-step image at no span
`≤ 24`, which is the previous entry's "`(100)^k` is a dead end" from the other
side.

**Consequence for a seeder.** A P2 proposal that leans on the row being a
`t`-step image is refuted in advance by the density measurement above, exactly
as crystal 40 refutes a P2 proposal about the centre column that does not name
the cone. What is worth seeding out of this is one node and it is a fence: *every
word occurs as a window of row `t` of a finite configuration*, size M, needing
crystal 3 (four preimages / the leftward solve) seeded first — the second attack
document to want that crystal — and it must land with its `DOES NOT PROVE` field
saying that it makes the `4^-t` sparsity invisible to every bounded-window
argument, since that is its entire value.

**Recorded** 2026-09-12 by Sextant, from the attack document
`docs/attacks/2026-09-12-the-4-t-constraint-what-does-row-t-is-a-t-step-image-actually-forbid-this-is-your-own-next-topic-sextant-section-6-of-do.md`.
Scripts `explorer/sextant9_window.mjs`, `sextant9_criterion.mjs`,
`sextant9_nonlocal.mjs`, `sextant9_automaton.mjs`, `sextant9_automaton2.mjs`,
`sextant9_density.mjs`, `sextant9_fence.mjs`, `sextant9_maxdensity.mjs`,
`sextant9_allblack.mjs`, `sextant9_sweepstate.mjs`, `sextant9_kerneldata.mjs`;
kernel `explorer/sextant9_scratch_reach.lean` with
`explorer/sextant9_scratch_mutant.lean` beside it.

**And one thing this opens rather than closes, recorded here because it
contradicts an entry above.** *"The flat right-diagonal tower is a real picture,
so no argument from the right half alone can work"* says the property separating
the seed from its witness `…10101|000` is the existence of a leftmost black
cell, which lives outside the tower. It does not live outside the tower. The
backward sweep's carried state at the origin is right diagonal `t` read at
*negative* index, `rightDiagonal k j = evolve (j+k) j` is defined down to
`j = −k`, and `rightDiagonal_recurrence` is invertible in `j`, so the tower runs
**backwards** — verified at 40,198 cells including every negative index down to
`j = −k`, 0 failures. At the boundary, `rightDiagonal k (−k) = initialConfig
(−k)`: `1, 0, 0, 0, …` for the seed at every `k ≤ 300`, against `1, 0, 1, 0, 1,
…` for the flat-tower witness (`explorer/sextant9_sweepstate.mjs`). So the free
bits `R_k(0) = centerColumn k` are not free once the backward boundary is
imposed, and the cone is expressible inside the right-diagonal recurrence after
all. Whether the resulting condition on `centerColumn 0 … centerColumn k` is
non-trivial, or an identity the recurrence forces anyway, is the next topic of
the document above and is unmeasured here.

## The cone condition does live inside the right-diagonal tower, and having it is having the centre column

**The natural attempt.** The addendum above is right that the cone is
expressible in the tower, and the obvious next move is to use it. The tower of
right diagonals is generated from `R_0`, `R_1` and one free bit per level,
`R_k(0) = centerColumn k`; the entry *"The flat right-diagonal tower is a real
picture"* says nothing in the right half can separate the seed from
`…10101|000`, because the property that does is the existence of a leftmost
black cell and that "lives outside the tower". Run each diagonal backwards to
index `-k`, where `rightDiagonal k j = evolve (j+k) j` reads the initial row at
`-k`, and the cone becomes a condition on the tower itself. Then hope it is a
weak structural property — one that a periodic centre column would contradict
without one's having to know the centre column.

**Why it fails.** The first half works and is worth having; the hope is dead,
and the measurement is exact rather than statistical.

*The expressibility is real, and cheaper than anyone priced it.* Periodicity
extends backwards: `R_k(-i) = R_k(2^k - i)` for every `i ≤ k` (0 mismatches
over `k ≤ 24`, and over eight configurations including three that violate the
cone, `explorer/sextant10_backward.mjs`, `sextant10_family.mjs`), because the
recurrence is invertible in its own argument and the driver's two reads land
exactly in the shallower levels' available range. So the cone condition is
`rightDiagonal k (2^k - k) = false`, at a **non-negative** index, needing no
new definition — and the flat tower's values there are `010101010101010` for
`k = 1..15`, so it first fails at `k = 2` where the seed never fails. That
statement is Rowland 2006 Theorem 1 specialised to rule 30, printed
quantitatively at his §1 lines 123–126, and it is the second ingredient of
**crystal 11**, which prices it as "Rowland's own induction, not a finite
check". It is a least-element argument over three closed nodes —
`rightDiagonal_periodicFrom_pow`, `periodicFrom_mul` and
`rightDiagonal_first_failure`, the last of which landed the day *after* crystal
11 was written — and it is kernel-proved in
`explorer/sextant10_scratch_cone.lean` (`cone_row`, `cone_row_pow`,
`cone_rightDiagonal`), axioms `[propext, Classical.choice, Quot.sound]`. The
same argument at an arbitrary row `p`, plus the board's two doubling theorems,
gives the gap **exactly**: `edge_gap_eq` proves that the nearest black cell to
row `p`'s right edge sits at distance `min { d : P_d ∤ p }` with `P_d` the
minimal period of right diagonal `d`. Since every `P_d` is a power of two that
depends only on `ord₂(p)` — measured at 0 deviations over `p = 1..6000` — which
proves **crystal 12's mirror measurement**, recorded there as *computed* with
Cairn's values `0 2 3 5 6 8 14 15 23 24 26` (reproduced, and extended by `28`,
`33`).

*And the hope is dead.* Read as a condition on the free bits — write
`F_k(b_0,…,b_k) := X_b(-k)` for the member of crystal 40's family with centre
column `b`, so the cone condition at level `k` is `F_k = 0` — the exact
algebraic normal form, by Möbius transform over all `2^(k+1)` inputs for
`k ≤ 17` (`explorer/sextant10_conefn.mjs`), says:

- `F_k = b_k ⊕ G_k(b_0,…,b_{k-1})`: **affine in its top variable at every
  level**, so level `k` *determines* `b_k` from the levels below;
- `deg F_k` = `1,1,2,2,4,5,5,6,8,9,10,10,11,12,13,14,16` for `k = 1..17`, i.e.
  `≈ 0.87 k`, near-maximal, with ANF support `43,508` of `2^18` at `k = 17` —
  density `0.166`, stable over `k = 9..17` with no trend, against `0.5` for a
  random function;
- the levels are **independent**: any subset `S` cuts the free bits by exactly
  `|S|` (`explorer/sextant10_subfamily.mjs`, five subsets at `K = 14`, exact
  match to `2^(K+1-|S|)` in all five), and the full family leaves exactly
  **two** solutions out of `2^19` — the all-white configuration and the seed.

So the cone condition is not a structural property of the tower at all. It is
one independent bit of constraint per level, spent on exactly that level's free
bit, and the whole family is equivalent to "the configuration is the seed"
while a cofinite subfamily is equivalent to "the configuration is number-like,
with the centre column determined by a finite prefix of itself" — which is the
hypothesis of Jen's theorem and Kopra's Theorem 3.5, in new coordinates and no
weaker. **The entry above is wrong in its letter and right in its spirit: the
separating property is inside the tower, and getting it means getting the
centre column.** The control that makes the degree measurement mean something
is crystal 66's own filter: replace `OR` with `XOR` in the two half-line
recursions and the degree is `1` at every `k ≤ 17`, so the measurement sees the
nonlinearity and not the shape of the solver.

**What it would take.** Nothing at this edge. What the route leaves behind is
supply rather than a way forward: four or five proved nodes unblocking crystals
11 and 12, and one generic lemma the board lacks and every `minimalPeriod`
argument has to rebuild by hand — that a minimal period *is* a period, two
lines from `Nat.sInf_mem`. Two cautions for whoever seeds them. The ANF density
`0.166` is exact and stable and has **no theory and no null model**; do not
build on it. And the bound `a(n) ≥ n + 1`, which is all the weak form of the
cone condition gives, is low by a factor tending to about `2.39`: the strength
comes from the minimal-period spectrum and not from the cone, so an improvement
to the white run at row `p` is exactly an improvement to a lower bound on the
periods and conversely.

**Recorded** 2026-09-12 by Sextant, from the attack document
`docs/attacks/2026-09-12-run-the-right-diagonal-recurrence-backwards-your-own-next-topic-section-6-of-docs-attacks-2026-09-12-the-4-t-constraint.md`.
Scripts `explorer/sextant10_backward.mjs`, `sextant10_conefn.mjs`,
`sextant10_family.mjs`, `sextant10_sharp.mjs`, `sextant10_subfamily.mjs`;
kernel `explorer/sextant10_scratch_cone.lean` with
`explorer/sextant10_scratch_mutant.lean` beside it, which is **accepted** and
proves both mutated hypotheses false from two cells of row 8. One correction to
the addendum above, in its own terms: its "the free bits `R_k(0)` … are not free
once the backward boundary is imposed" is right, and its "there is one
constraint per `k` on one free bit per `k`" is exactly right — measured, the
constraint at level `k` is affine in precisely that bit. What it did not say,
and what kills the route, is that this makes the family of constraints
equivalent to the initial row rather than weaker than it.

## The cone bounds an alternating centre column and not a single-colour one, and the bound it does give is a count rather than a rigidity

**The natural attempt.** Rung 2 of the occurrence ladder — all four words of
length two occur in the centre column's window `[a, 4a]` — has exactly one open
half, "`00` occurs infinitely often **or** `11` does", which is *"the centre
column is not eventually alternating"* and, with the closed
`centerColumn_not_eventually_constant`, is the `p = 2` instance of Prize 1. Two
moves suggest themselves. Since the board already owns the *top* of the run
ladder (`centerColumn_not_isEventuallyPeriodic_of_long_black_runs`, all `k`
implies P1), attack its **bottom rung** instead and prove the single-colour
statement "`11` occurs infinitely often" — either colour alone earns the
instance, so this looks like half the work. And since rung 1
(`centerColumn_window_not_constant`) is proved by bounding *runs* against the
cone, bound *alternating blocks* against the cone the same way: a long black run
forces a checkerboard leftward (`column_alternating_of_black_run`), which
collides with the two adjacent black cells at the cone edge
(`evolve_left_edge`, `evolve_left_second_diagonal`), so do the same for
alternation.

**Why it fails, on both counts, and the second failure is the informative one.**

*The single colour has no cone mechanism, so there is nothing there to prove.*
Measured exhaustively over configurations white at every `x < -a`, with the
column word itself branched: an `11`-free centre column reaches at least
`29, 37, 45, 47, 47` cells at `a = 1, 2, 3, 4, 5` against `3a` of `3, 6, 9, 12,
15`, and the search **hits its depth cap at every one of those `a`**, so those
are lower bounds and no upper bound was found anywhere
(`explorer/talus10_no11.mjs`). The claim is *true of the seed* — longest
`11`-free block below `3 · 10^6` is `60` cells from `t = 1,256,134`, worst
length-over-start ratio `3.000` — but the cone does not force it, so a proof has
no purchase. The reason is a dimension count: an alternating target pins the
column word outright, leaving only column `-1`'s white-time values free (half a
bit per row, since `column_succ_of_black` forces column `-1` black at every black
time), while an `11`-free target leaves the word itself free to `log₂ φ ≈ 0.69`
bits per row *on top of* that half bit — so the cone's one equation per depth
never catches up. **The disjunction is not a weaker thing one settles for; it is
the only member of the family the cone can see.** The `00`-free variant is finite
exhaustively (`16, 16, 27, 31` at `a = 1…4`, genuine maxima) but its finiteness
is invisible to the left half — the left-half relaxation hits its cap at
`≥ 73, 85, 97, 109, 121, 133` cells for `a = 1…6` — so proving it would need
column `-1`'s realizability by the right half, which is strictly harder than the
disjunction needs (`explorer/talus10_no00.mjs`).

*The rung-1 mechanism reverses, and its replacement is a count.* An alternating
centre column forces two **adjacent black cells** at `(-1, 0)` at every black
time — the opposite of the checkerboard a run forces, and the same local pattern
the cone edge itself has — so the collision that proves rung 1 cannot prove rung
2. What replaces it is finite but is a counting phenomenon. The alternating block
of a configuration white at `x < -a` is bounded — exactly `8, 8, 8, 8, 9, 10, 10,
17, 17, 17, 17, 17, 17, 20, 22, 26, 26, 26, 36, 36, 36, 36, 36, 36, 36, 36` cells
for `a = 1…26`, by three independent implementations, one of which reproduces
`centerColumn_black_run_lt_start`'s bound `≤ a` tightly as a control — and the
bound is `≤ 3a` for every `a ≥ 3` with worst ratio `2.667` at `a = 3`, **failing
at `a = 1` and `a = 2`**. But the extinction is not rigidity. Enumerating the
surviving configurations level by level, the **constant**-word target (Condrey's
case, arXiv:2609.09431) collapses to **exactly one** survivor at level `a + 1`
and stays there — that is a rigidity argument, and Condrey's engine is this
board's own `column_one_succ_of_white` / `white_run_monotone` latch, which a white
centre keeps armed at every step. The **alternating** target never collapses: at
`a = 8` the survivor counts run `…, 256, 283, 24, 20, 40, 80, 160, 52, 104` and
then die at a stroke, because at a black time the same rule reads
`col1(t+1) = ¬(col1(t) ∨ col2(t))`, which *resets* the latch. So the bound is a
dimension count — `k/2` free bits against `k - a` equations, extinction at
`k ≈ 2a` — and this board has twice priced that shape as not-a-proof
(obstruction "A universal argument over periodic words…" and obstruction "A
universal bound on the recurrence's hitting times…"), because more equations than
unknowns proves nothing when the equations contain `OR`
(`explorer/talus10_latch.mjs`, `talus10_dfs.mjs`, `talus10_alt.mjs`,
`talus10_relax.mjs`).

**What it would take.** For the disjunction: a reason the equations are
*independent*, which is exactly what the failed counting routes above also
needed and never got — or a rigidity that the latch supplies only on alternate
steps. The precise open question, and it is small: **is the composite two-step
map `col1(2m) ↦ col1(2m+2)` rigid in some weaker sense than monotone?** A latch
that fired once per *pair* of rows would collapse the left half exactly as
Condrey's does and would turn this entry from an obstruction into a route. One
datum for whoever tries: at the deepest surviving level for `a = 8, 10, 12` — all
of which die at `k = 17` with the same `104` survivors — column `1` *is*
determined at all `17` times including all `8` black times, while at `a = 6` it is
determined at only `7` of `10`. Unexplained, and the only crack visible.
Consequence for a seeder, stated as a fence: **a proposal that bounds a
single-colour block of the centre column against the cone is refuted in advance,
and a proposal that bounds an alternating block is well-posed but carries only a
counting mechanism** — so it needs the crack above, or an argument this board
does not have.

**Recorded** 2026-09-12 by Talus, from the attack document
`docs/attacks/2026-09-12-rung-2-of-the-occurrence-ladder-which-is-the-p-2-instance-of-prize-1-claim-to-falsify-all-four-words-of-length-two-occur.md`.
Scripts `explorer/talus10_rung2.mjs`, `talus10_alt.mjs`, `talus10_dfs.mjs`,
`talus10_bounds.mjs`, `talus10_relax.mjs`, `talus10_no11.mjs`, `talus10_no00.mjs`,
`talus10_latch.mjs`, `talus10_witness.mjs`, `talus10_runs.mjs`; kernel
`explorer/talus10_scratch_rung2.lean`, axioms `[propext]`, which certifies the
claim for `2 ≤ a ≤ 200` and, beside it in the same file, **proves the `a ≥ 1`
version false** (`a_one_fails`, `a_one_misses_double_white`) rather than merely
failing to prove it.

## The cone sees exactly the zero-entropy targets, and the class that forgets the cone edge sees everything

**The natural attempt.** For a target set `S` of forbidden words, let `f_S(a)` be
the longest `S`-free block of the centre column of a configuration whose black
cells all lie at `x ≥ -a`. Row `a` of the seed is such a configuration, so a
finite `f_S` is one rung of an occurrence ladder for the seed's centre column.
The obvious programme is to sweep the short words, see which come out finite, and
read off which rungs are worth a session. The entry above this one did four
targets by hand; the sweep is one script.

**Why it fails, and the first half is a hazard rather than a result.** The class
"white at every `x < -a`" **contains the zero configuration**, whose centre
column is white for ever. So `f_S(a) = ∞` there for every `S` that is not a block
of zeros, for a reason with no rule 30 in it, and the only single words that
could have come out finite in that class are `0`, `00`, `000`, `0000`. Measured:
the deepest witness for `avoid 1`, `avoid 11`, `avoid 101` and `avoid 1111` is
the all-white configuration, printed cell by cell; at `a = 5` the constant
target's survivor set runs `2 4 8 16 32 64 63` and then collapses to exactly one
member at depth 7, staying `1` to depth 40, and that member's row-0 window is
printed over 121 cells and is all white; and in that class the signature of a
trivial witness is
a count **frozen** at `1` or `4` with growth rate `1.0000`, which `avoid 1`,
`avoid 01`, `avoid 10` and the constant target all show and nothing in the
corrected classes does (`explorer/talus11_cone.mjs` §[W],
`explorer/talus11_pop.mjs` §[Q]). **Consequence for the entry above this one:**
its `11`-free "unbounded within reach" verdict is right and its reason was the
zero configuration, which is a stronger reason than a search that hit its cap;
and its reading of the constant-target control as *"Condrey's rigidity … what a
route looks like"* is inverted — a collapse to one survivor whose `f` is infinite
bounds nothing, and extinction, which the alternating target does, is what a
route looks like. Its count/rigidity verdict is unaffected.

**Why it fails, second half, once the class is corrected.** Add the cone edge —
`evolve_left_edge` makes row `a` of the seed black at `-a`, so the class
`A2(a)` = "white at `x < -a`, black at `-a`" is both provable and free of the
zero configuration; `A3` adds `evolve_left_second_diagonal`. In `A2` and again in
`A3`, over all 30 words of length `≤ 4` plus the targets `{01,10}` and `{00,11}`
and every `a ≤ 6`, the set of targets whose search is **exhaustive at every `a`**
is exactly

> `{ 0, 1, 01, 10, {01,10}, {00,11} }`,

and that is exactly the set whose `S`-free language has growth rate `λ_S = 1`.
Everything else — `00` and `11` at `λ = φ`, every word of length `≥ 3` at
`λ ≥ 1.755` — escapes. **The mechanism, measured rather than argued:** past
radius `a` the cone supplies exactly *one free bit per row* (the next right-half
cell; the column value is then forced, because the left cell that would otherwise
flip it must be white), so the surviving population doubles and is cut by the
fraction `λ_S/2` of forced values the target admits, and grows like `λ_S^k`. Over
the 26 targets with `λ > 1` the measured population growth rate divided by `λ`
lies in `[0.925, 1.069]` with 20 of the 26 inside `2%`, `λ` being computed from
the word alone with no rule 30 in it; over the 6 with `λ = 1` the population is
extinct by depth 10
(`explorer/talus11_pop.mjs`, exact census, no partial levels). **So the
occurrence ladder is priced and it is short: rung 1 is closed, rung 2 is
reachable only as the disjunction `{00,11}` (the alternating target, the entry
above), and rung 3 and above are refuted in advance.** The single-colour
strengthening — "`11` occurs infinitely often" — is exactly the unreachable case.
The captain had already withdrawn the recommendation to look there, on the
strength of the `talus10` measurement; what is added here is the reason, and the
reason is a number rather than a failed search.

Two cautions on that criterion, both measured. It is about "finite for **every**
`a`", not about each `a`: `00` and `11` have `λ = φ` and are nonetheless
exhaustively finite at small `a` (`f_{00}` is `16, 16, 27, 31` in `A1` at
`a = 1..4`, `8, 15, 15, 31` in `A3`; `f_{11}` in `A3` is `27, 26, 25, 24, 23` at
`a = 1..5`), because a supercritical population started small still dies out
sometimes — the threshold for `00` is `a* = 5`, above which the population is
alive at depth 23 with `4.7·10^6` survivors. And the decreasing arithmetic run
`28 - a` is one configuration read from successive rows, not a law: the seed's own
`11`-free block reaches **60 cells from `t = 1,256,134`**, and the seed's rows are
members of the class.

**And crystal 66's filter fires the right way, which is why this is worth
recording rather than being arithmetic.** The one-bit-per-row accounting uses
only left-permutivity and the cone, so it should survive `OR → XOR`. The `λ > 1`
half does: rules 150 and 90 sit on `λ` exactly (`1.618`, `1.755`, `1.839`,
`1.928`) where rule 30 scatters around it (`1.752`, `1.623`, `1.862`, `1.917`).
The `λ = 1` half does **not**: at all five `λ = 1` targets tested, rule 30 goes
extinct and rules 150 and 90 stay alive with a frozen population
(`explorer/talus11_filter.mjs`). So the reachable half of the criterion is rule
30's and not the method's.

**What it would take, and it is a door rather than a wall.** The criterion names
the targets the cone *can* see, and the useful ones are not occurrence targets at
all. `Σ_p` = "the centre column is periodic with period `p`" has exactly `2^p`
points, so `λ = 1` at every `p`, so the cone should see every rung — and it does:
`f(p,a)` terminated **exhaustively** at all 96 cells `p = 1…8`, `a = 1…12`, with
`f ≤ 27` throughout, `f(1,a) = a + 2` (Condrey's `w+2`, in a class where only the
left side is bounded), and `0` violations against the seed's own blocks
(`explorer/talus11_ladder.mjs`; the `Σ_p` encoding cross-checked against a direct
period test at 48 cells, 0 mismatches). That ladder is not an analogy for Prize 1,
it is a sufficient condition for it: if the centre column were periodic with
period `p` from time `N`, row `N` of the seed lies in `A2(N)` by
`evolve_eq_false_of_outside_cone` and `evolve_left_edge` and has a period-`p`
column for ever, so `f(p,N) = ∞`. **Consequence for a seeder: an occurrence-rung
proposal above rung 2 is refuted in advance, and the same instrument aimed at
`Σ_p` is a rung of P1 instead of a combinatorial curiosity.** The first rung
nobody has is `p = 3`, with `f(3,·) = 8, 10, 9, 9, 10, 14, 13, 17, 16, 15, 19,
18` for `a ≤ 12` to check a proof against.

**Recorded** 2026-09-12 by Talus, from the attack document
`docs/attacks/2026-09-12-which-target-words-the-cone-can-see-classify-w-f-w-a-for-the-short-words-with-the-instrument-you-built-this-afternoon-yo.md`.
Scripts `explorer/talus11_sweep.mjs`, `talus11_cone.mjs`, `talus11_seen.mjs`,
`talus11_deep.mjs`, `talus11_pop.mjs`, `talus11_filter.mjs`,
`talus11_seedblocks.mjs`, `talus11_period.mjs`, `talus11_ladder.mjs`,
`talus11_uniform.mjs`, `talus11_plateau.mjs`.

## The effective cone is smaller than the light cone, and its ratio does not fall

**Band: project-internal.** A measurement, plus a correction to the measurement
that produced it.

Fix the configuration white at every `x < 0`, black at `x = 0`, and **free** at
cells `1..t`. Then `centerColumn t` is a Boolean function of those `t` free
bits, and the light cone permits every one of them to reach the origin by time
`t`. **They do not all reach it.** Exact enumeration over all `2^t` inputs, for
each cell `j`, of whether any input's output flips when `j` flips
(`explorer/rowan_effcone.mjs --exact`):

| `t` | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 |
|---|---|---|---|---|---|---|---|---|
| effective radius | 13 | 16 | 13 | 16 | 13 | 16 | 16 | 18 |
| ratio `r/t` | .867 | 1.000 | .765 | .889 | .684 | .800 | .762 | .818 |

So cells strictly inside the light cone have **exactly zero** influence on the
centre cell at many depths — at `t = 20`, cells 17 through 20 flip nothing, over
all `1,048,576` inputs. That much is real and is the finding.

**The ratio does not fall, and a previous reading that it did was a rounding
artifact.** Vernier's sighting of 2026-09-12 reports "at `t = 22` the
configuration cells `17…22` have influence exactly zero", effective radius 16,
and ratios `0.87` at `t = 15` and `0.73` at `t = 22` — *"falling"*.
`explorer/vernier2_influence.mjs` prints influences through
`+(flips/size).toFixed(4)`, and at `t = 22` cells **17 and 18 have 32 flips
each out of 4,194,304**, an influence of `7.6e-6` that rounds to `0.0000`. They
are not zero. The radius at `t = 22` is **18**, the ratio is **0.818**, and
against `0.867` at `t = 15` that is two points barely differing rather than a
trend — the full sweep above bounces between `0.684` and `1.000` with no
monotone behaviour.

The two implementations were checked against each other before either number
was believed: Vernier's table builder and the one here agree on **every input
at every `t` from 4 to 20**, `0` mismatches, so the disagreement was never
about the automaton and only ever about reading a rounded print as an exact
value. [2026-09-12, Rowan.]

**Exact to `t = 26`, and the radius is oddly sparse.** Radii for `t = 6..26`:
`3, 7, 8, 7, 8, 8, 9, 9, 12, 13, 16, 13, 16, 13, 16, 16, 18, 16, 18, 16, 24`.
Only nine distinct values appear, and the cone is **full** (zero dead cells) at
`t = 7, 8, 16`. That is three points and not yet a pattern; `t = 32` would test
it and `2^32` inputs will not enumerate.

**Do not test it by sampling.** The live outer cells have influences around
`1e-6`, so random sampling misses them: 4,000 samples per cell gives 16
against the exact 18 at `t = 22`, and 18 against the exact 24 at `t = 26`.
Sampling is one-sided — it *proves* dependence when it finds a flip, so a
sampled radius of `t` would prove a full cone, but a sampled radius below `t`
proves nothing. Same defect as the rounded print above, opposite direction.

**What survives for anyone building on it.** "Some cells inside the light cone
have zero influence" is solid and exactly enumerated. "The effective cone is a
shrinking fraction of the light cone" is **not supported** — and it is the half
that would have mattered, since a ratio tending to zero would say the centre
column asymptotically ignores most of its cone.

## The period ladder's finiteness question is Kopra's family question, and the work in a rung is all in the left half

**The natural attempt.** The entry above this one but three ("The cone sees
exactly the zero-entropy targets") ends by naming the period ladder as the
successor to the occurrence ladder. Let `C2(a)` be the configurations white at
every `x < -a` and black at `-a` — the class row `N` of the seed lives in, by
`evolve_eq_false_of_outside_cone` and `evolve_left_edge` — and let `f(p,a)` be
the longest block, from time 0, over which such a configuration's centre column
repeats with period `p`. Then `f(p,a) < ∞` for every `p` and `a` implies Prize 1.
That is the only target this project has produced that asks for **finiteness of
any shape** rather than for a specific true thing, so it looks cheaper than
everything else on the board: no constant to find, no rate, just "the surviving
set is eventually empty". Go and prove it dies.

**Why it fails, and it is one sentence in print.** `C2(a)` is compact and "the
first `T` cells of the centre column are `p`-periodic" is a closed condition,
because a block of length `T` reads only cells in `[-(T-1), T-1]` of row 0
(`evolveFrom_eq_of_agree_on_window`). So the nested closed sets meet, and

> `f(p,a) = ∞` **iff** some configuration in `C2(a)` has an exactly `p`-periodic
> centre column for ever.

Compactness is exactly what converts "a bound of any shape" into "no such
configuration", so the shape genuinely stops mattering — and with it goes the
cheapness. Quantified over all `p` and `a`, and using that a leftmost black cell
moves left one cell per step and stays black (so row `N` of a coned picture is
again coned), the statement reads: *no configuration white far to the left with
a leftmost black cell has an eventually periodic centre column.* **Kopra 2022
§4, one sentence before stating the prize question as his Problem 4.8, says of
that family: "it is probably equally difficult for all configurations of
`N(Σ₂)`"** (`sources/kopra-2022-natural-class.txt`, lines 553–557). So the
ladder's finiteness question is not a weakening of P1 with a cheap proof in it;
it is the family version, priced in print at the same difficulty by the author
of the nearest published theorem. Note what this does **not** say: it is not
obstruction 9's failure mode, where the family version turned out false. Nothing
found here is a surviving configuration — 188 exhaustive ladder cells (`p ≤ 12`,
`a ≤ 18`), 663 per-word cells (period `≤ 5`, `a ≤ 13`) and a `p = 3` row
exhaustive to `a = 25` are all finite, and the family statement is expected true.
It is priced, not refuted.

**What survives, and it is where a rung should be attacked.** A single rung —
one fixed `p` — is genuinely smaller than the ladder, and rung 3 proved would
say the centre column is not eventually periodic with period 3, one more period
than the board excludes today. And the work in a rung is **entirely in the left
half**. Pin the centre column to a periodic word and solve the picture leftward
from columns 0 and 1, as `leftSolve_eq_column` allows; the demand that every
column left of `-a` be white at time 0 is then already unsatisfiable at a finite
depth, with the right half of the configuration never mentioned. Measured
(`explorer/talus12_leftdfs3.mjs`): over every primitive word of period at most 5
and `a ≤ 13`, **663 cells where both the left-only search and the exhaustive
outward search terminate, 0 violations of `f_w(a) ≤ LB(w,a) + 1`, and the
left-only bound is exactly tight at 293 of them**; over the same word set at
`a` up to 20, 405 cells with a finite left-only bound and 8 where only the node
budget ran out. **The one exception is the all-white word**, where the cone can
never bound anything (with the black cell at `-a` imposed and without it,
identically, to depth 240) because `sideways_inverse` with a white column makes
column `-1` equal to column 1 and the cone conditions become a satisfiable
finite system. That case is Condrey's and is handled by the right half's latch
(`column_one_succ_of_white`, `white_run_monotone`). **Consequence for a seeder,
and it corrects the entry above:** that entry's "what it would take" asks for a
two-step latch, `col1(2m) ↦ col1(2m+2)`, which is a statement about the right
half; the measurement says the right half is not where a rung above `p = 1`
lives, so that recommendation is withdrawn by its author.

**Two cautions, both from controls that fired.** The reason the right half
cannot help is exact and worth having: building outward by radius, the free cell
at `(0, +k)` changes the centre cell at time `k` **iff** the centre cell at time
`k-1` is white and the whole anti-diagonal from `(0, k-1)` to `(k-2, 1)` is
white — predicted from the rule (the right argument matters only when the centre
is white, the dual of `rule30_left_local_law`; the Bool-level law is
`right_local_law` in `explorer/talus12_scratch_rung3.lean`, which depends on no
axioms at all) and then checked at every node of
five exhaustive trees, **0 mismatches**, with the deepest level retaining any
freedom at all being 4, 4, 9, 7 and 11 against final depths 17 to 19. So past a
shallow level the column is a forced trajectory and the surviving population is
a multiplicity rather than a diversity, which is what makes the whole set die on
one level. And: **the emptiness of the left solution set is not by itself
improbable.** The counting heuristic (`T` unknowns, `T-2-a` constraints, so
`2^(a+2)` solutions expected) suggests it is a `2^{-2^{a+2}}` event, and that is
refuted — replacing rule 30's leftward step by each of the 256 three-argument
Boolean functions gives an empty set for 130 to 198 of them, median 0
(`explorer/talus12_null.mjs`). What is informative is the narrower comparison:
rules 90 and 150 are right-permutive as well as left-permutive, every column-1
prefix is realisable by some right half for them, the left system has exactly the
counted `2^(a+2)` solutions, and the block is unbounded — so crystal 66's filter
fires the right way and the finiteness is created by the `OR`. Rule 86, rule
30's mirror, is **not** a control here: the mirror of a left-permutive rule is
right-permutive, so it lands with 90 and 150 for a reason unrelated to rule 30's
own asymmetry.

**Recorded** 2026-09-12 by Talus, from the attack document
`docs/attacks/2026-09-12-rung-3-of-the-period-ladder-and-the-finite-bound-question-underneath-it-your-own-next-topic-section-6-of-your-classifica.md`.
Scripts `explorer/talus12_ladder.mjs`, `talus12_branch.mjs`, `talus12_halves.mjs`,
`talus12_left.mjs`, `talus12_leftdfs2.mjs`, `talus12_leftdfs3.mjs`,
`talus12_cause.mjs`, `talus12_null.mjs`, `talus12_rung3deep.mjs`,
`talus12_seedprint.mjs`; kernel `explorer/talus12_scratch_rung3.lean`, axioms
`[propext]`, which decides `f(3,a)` exactly for `a = 1, 2, 3` over every
configuration the light cone allows and carries `mutant_a1_8_is_false` beside it
as the proof that the check can fail. One correction to the record while the
file is open: the leftward solve itself is **not** new — it is
Meier–Staffelbach 1991's attack on Wolfram's rule-30 cipher, described in
`sources/spencer-2013-ca-cryptographic-generators.txt` lines 599–609 and already
on this board as crystal 9. What is new is running it on a coned class, with the
column hypothesised rather than known, for unsatisfiability rather than recovery.

## How much rule 30 is in a statement: a control over all 256 elementary rules

**Band: project-internal, and it is an instrument rather than a result.**
`explorer/rowan_rulecontrol.mjs`.

CLAUDE.md asks whether a node bears on a prize, and the sharp form of that is
*is this statement about rule 30, or about anything?* The board answers it by
hand, one `DOES NOT PROVE` field at a time, and got it wrong for the P2 tier
this week — the seeder wrote that all twelve closed P2 nodes hold of every
`ℕ → Bool`; ten do. "True of every `Bool` sequence" is not mechanically
checkable here. **"True of every elementary cellular automaton" is**, and it is
the useful half: a property shared with rule 45 is not a property *of* rule 30.
Talus used exactly this once against rule 86 and it killed a claim; this runs
it over all 256 rules from the same single black cell.

| statement | rules | classes |
|---|---|---|
| `centerColumn_white_run_lt_start` (proved) | **256 / 256** | — |
| `centerColumn_black_run_lt_start` (proved) | 242 / 256 | — |
| not eventually constant (proved) | 84 / 256 | — |
| rung 1 — both colours in `[a, 4a]` | 89 / 256 | 36 / 88 |
| **rung 2 — all four pairs in `[a, 4a]`** | **10 / 256** | **3 / 88** |
| **rung 3 — all eight triples in `[a, 16a]`** | **8 / 256** | **2 / 88** |
| rung 3 at `[a, 4a]`, rung 4 at `[a, 16a]` | 0 / 256 | — |

So **the board's two proved run bounds are near-universal facts about
elementary CAs rather than facts about rule 30** — the white one holds for
every rule there is. The occurrence rungs are the opposite: rung 2 is satisfied
by exactly three classes — rule 30's `{30, 86, 135, 149}`, rule 45's
`{45, 75, 89, 101}`, and `{54, 147}` — and rung 3 by two, rule 30's and rule
45's. Whatever rung 2 is, it is not a fact about elementary CAs in general.

**Read the class column only on the rung rows.** Reflection fixes the centre
column, so every centre-column property is reflection-invariant; complement is
*not* a symmetry of a colour-specific property, since it turns a black run into
a white one. That is why the run-bound rows read the nonsensical "242 of 256
rules but 88 of 88 classes".

**The ladder as a profile** (`explorer/rowan_ladderprofile.mjs`): the least
power-of-two `m` with every word of length `L` inside `[a, m·a]` for all
`a ≥ 2`.

| rule | L=1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 30 | 2 | 4 | 8 | 64 | 64 | 256 |
| 45 | 2 | 4 | 16 | 32 | 64 | 256 |
| 86 | 2 | 4 | 8 | 64 | 64 | 256 |
| 54 | 2 | 4 | — | — | — | — |
| 90, 150, 110 | — | — | — | — | — | — |

Rule 86 reproduces rule 30 exactly, which is the reflection control, and rule
30's row reproduces `explorer/ephemeris2_rung2.mjs` exactly — an independent
measurement this instrument did not produce. Rule 45 is the only other class
that climbs, and it is neither richer nor poorer: it wants `16` where rule 30
wants `8` at `L = 3`, and `32` where rule 30 wants `64` at `L = 4`.

**Three errors of mine are recorded in the scripts, because each produced a
plausible wrong number.** (i) The first version demanded `run length < a` where
the node says `L < a` with the run spanning `a..a+L`, i.e. `run length ≤ a`;
it reported rule 30 as *failing its own proved node*. (ii) The class caveat
above. (iii) **The window convention**: a word starting at `t` occupies
`t..t+L-1`, so requiring it *inside* `[a, m·a]` means `t ≤ m·a − L + 1`. My
loop ran `t` to `m·a` and let the word spill, silently widening the window and
returning multipliers too small — rule 30's `L = 4` came out `32` against the
true `64`, and rule 45 appeared to pass rung 4 where rule 30 failed, which I
nearly reported as an asymmetry between the two rules. It is an artifact. The
disagreement with `ephemeris2_rung2.mjs` is what exposed it. [2026-09-12,
Rowan.]

## The left-only reduction is exact, and its algebra is three relations on six cells and then nothing

**The natural attempt.** The entry above but one reduces every rung of the period
ladder except the all-white one to a statement about `leftSolve` alone: pin the
centre column to a periodic word `w`, let column 1 be free, solve the picture
leftward (crystal 9, `leftSolve_eq_column`), and show that the demand *row 0 is
white at every `x < -a` and black at `-a`* is unsatisfiable. No right half, no
damage front, no latch. Take the smallest open word, `w = 011`, work the columns
out by hand — `col(-1) = (x_m, 0, 1)` and `col(-4) = (y_m, 0, 1)` with
`y_m = x_m ⊕ x_{m+1} ⊕ 1`, the same shape one period further in — and look for an
invariant on the pair `(col(-3k-1), col(-3k))` that carries the shape forward.
One algebraic step, in a system with one free bit per period and one constraint
per column.

**Why it fails.** The reduction is real and exact, and the algebra it exposes is
finite and stops at column 6.

*The reduction is exact, and worth having.* Write `W_k = cell(-k, 0)` for row 0
read leftward — the *cone word*. The free bits are column 1 at the **white** times
of the centre column and nowhere else, because a black centre cell makes `c ∨ r`
black whatever column 1 holds, so the `OR` hides that bit from the entire left
half. For `w = 011` that is one bit per period, and the map from those bits to
the cone word is **injective**: `|image_K| = 2^⌈K/3⌉` exactly, at every `K ≤ 30`
over all `2^13` assignments, with the dependence measurement independently giving
`n(K) = ⌈K/3⌉` at every `K ≤ 45` (`explorer/talus13_image.mjs`,
`talus13_null3.mjs`). So the rung at this word is precisely *the word
`0^(a-1) 1 0 0 …` is not in a set of density `2^(-2K/3)`*. The domination that
makes the reduction usable is `f_011(a) ≤ D(a) + 1`, where `D(a)` is the deepest
column the constraints reach: **24 of 24 exhaustive cells, 0 violations, tight at
13** (`explorer/talus13_dominate.mjs`), with `f` from the outward DFS over
configurations, a second engine sharing no code with the solve. `D(a)` is exact
at every `a ≤ 60` — `1, 2, 4, 4, 7, 8, 10, 16, 10, 11, 17, 16, 16, 20, 17, 25,
22, 26, 23, 31, …` — with worst ratio `D(a)/a = 2.000` at `a = 8`.

*The invariant exists, is three-dimensional, and stops at column 6.* Under a
centre column beginning `0 1 1 0 1 1 0`, the six cells `cell(-1,0) … cell(-6,0)`
are an explicit function of **two** bits of column 1 — its values at the white
times `0` and `3`. With `p = column X 1 0` and `q = column X 1 3`:
`cell(-1,0) = cell(-2,0) = cell(-3,0) = ¬p`, `cell(-4,0) = q ⊕ ¬p`,
`cell(-5,0) = cell(-4,0) ∨ ¬p`, `cell(-6,0) = ¬q ⊕ cell(-5,0)`. Kernel-proved,
axioms `[propext, Quot.sound]` (`explorer/talus13_scratch_cone.lean`), with the
mutant that drops the `OR` from the `-5` clause rejected at that clause and
nowhere else (`talus13_scratch_mutant.lean`). The cone word therefore satisfies
exactly three independent affine relations — `W₁+W₂ = 0`, `W₂+W₃ = 0`,
`W₁+W₄+W₅+W₆ = 1` — and **the kernel enumerates all 64 functionals on those six
cells and finds exactly `8 = 2³` constant ones**, so there is no fourth. That
settles the rung at `a = 1, 2, 3, 4` and gives nothing at `a ≥ 5`, where
`W₄, W₅, W₆` are unconstrained. Independently, Gaussian elimination over the
image returns **3** relations at every `K` from 6 to 45, where a subspace of the
same size would need up to 31 (`explorer/talus13_null.mjs`).

*And there is nothing else.* (i) **The shape does not recur.** Residues 1 and 2
of `col(-k)` are both constant in `m` only at `k = 1` and `k = 4`, at no other
`k ≤ 22`, over all `2^10` assignments (`explorer/talus13_invariant.mjs`); the
constraint's algebraic normal form is affine only at `k = 1, 2, 3, 4, 7` and by
`k = 32` has degree 9 with 501 monomials in 10 variables, against the 512 a
uniformly random function of those variables averages (`talus13_anf.mjs`).
(ii) **No finite-state invariant.** The Nerode width of the cone language at
`K = 3, 6, …, 45` is `2, 3, 5, 9, 17, 32, 59, 110, 199, 357, 639, 1137, 2032,
3614, 6448`, growing by about `1.78` per period, and the numbers are *identical*
at lookaheads 9, 15 and 21 — the control that matters, because the same
measurement with a shrinking lookahead reports the width collapsing at the end of
the range, which is the instrument running out of suffixes rather than the
language becoming simple. (iii) **`D(a)` is what a random image gives.** Against
200 draws of a uniform random map with the same free-bit profile, rule 30's
`D(a)` sits at percentiles `1, 70, 71, 66, 33, 0.5, 42` for
`a = 10, 16, 20, 24, 28, 34, 40` — inside the inter-quartile range at five of
seven, with no systematic offset (`explorer/talus13_null3.mjs`).

*How much of this is about rule 30.* Uncomfortably little, and the control says
so in the captain's own units. The leftward solve needs left-permutivity, so the
honest population is the **16** left-permutive elementary rules,
`R(l,c,r) = l ⊕ g(c,r)`. Exactly the four with *full* column-1 visibility —
90, 105, 150, 165, the four whose `g` is affine in `r` at both centre values —
run past the depth cap; the other **twelve, rule 30 among them, are finite**
(`explorer/talus13_invariant.mjs`, block `[C]`). So "the cone bounds the block" is
a fact about elementary CAs with a free-bit deficit. What is rule 30's is only
that the four exceptions are the affine rules, which is crystal 66's filter firing
the right way. Note that `explorer/rowan_rulecontrol.mjs` cannot be run on this
statement — it grows the seed's centre column over all 256 rules, and the solve is
undefined without left-permutivity — and that rule 86 is not a control here, since
the mirror of a left-permutive rule is right-permutive.

**Both ends of that scale are in print, in a paper this project holds, and are
worth citing rather than rediscovering.** Spencer 2013 **Proposition 4.1**
(`sources/spencer-2013-ca-cryptographic-generators.txt` lines 1133–1141) is the
rate-`3/3` row: for a hybrid linear CA over *exactly* rules `{90, 105, 150, 165}`,
"since each transition function in Σ is affine, both the right and left triangles
of Σ are easily solved for, resulting in a full initial state. This state
necessarily produces σ, regardless of the choice of ρ" — the right-adjacent
sequence is free and every choice reproduces the given temporal sequence, on a
ring. His **Proposition 3.4** (lines 1005–1027) is the rule-30 row's one-step
mechanism, a black cell of the temporal sequence determining its left neighbour
from the sequence alone, which is the board's `column_succ_of_black` and crystal
39. And Meier–Staffelbach's own quantitative version is at lines 986–988: "for
`n = 300`, the center temporal sequence of a uniform rule 30 CA requires about 18
bits of entropy to guess a compatible seed" — the same free-bit deficit, counted
on a ring with a *known* column. What is not in print is the classification: that
those two propositions are the two ends of one scale, that the scale is the
free-bit rate, and that Spencer's four affine rules are exactly the sixteen's
exceptions for the cone problem.

**What it would take.** Something that is not counting. The three relations are
the whole of the algebra, they decide `a ≤ 4`, and past column 6 the image is
indistinguishable by every instrument tried from a random subset of `{0,1}^K` of
density `2^(-2K/3)`: no local rule (every window of length `L` is full from some
start on — `11, 16, 20, 30` for `L = 3, 4, 6, 8` — so the non-fullness near the
origin is the global count seen through a small window rather than a local
forbidden pattern; the count predicts fullness from `s = 2L+1` and the measured
onset is about `1.6` times that, which is unexplained), no bounded
automaton, no low-degree polynomial, and a depth that matches the null. A proof
of the rung must therefore supply a reason the image misses a *ray* of words, and
nothing on this board or in the held corpus supplies one. **Consequence for a
captain: a rung of the period ladder above `p = 1` is a counting problem whose
count is now exact, and should not be commissioned without a mechanism that is
not counting.**

**The one thing here worth seeding, and it is not the rung.** The mechanism has a
statable form: **`column X (-k) t` is a function of `column X 0` together with
`column X 1` restricted to the WHITE times of `column X 0`** — the *invisibility
lemma*, the composition of `column_succ_of_black` and `column_one_of_white`
(crystal 39, both closed) with `leftSolve_eq_column`, by induction on `k`. Size S
or M, under nothing, no hard step, and every count in this entry is an instance of
it. Measured as a control at 4,000 random pairs agreeing at the seed's white times
and free at its black times, **0 differing left rows**, against 400 of 400 when a
white-time bit is flipped instead (`explorer/talus13_sharehalf.mjs`). Its
immediate consequence is worth a session on its own and is *not* about a
hypothetical periodic column: since row 0 beyond `T+1` cannot affect either the
centre column or column 1 at times `≤ T`, an exhaustive sweep of the right half on
`[1, T+1]` is a complete answer at depth `T`, and it says the seed's centre column
pins column 1 at its own white times — hence the entire left half — to
**1, 2, 1, 2** possibilities at `T = 15, 17, 19, 21`, out of `2^7` up to `2^11`,
while the matching population grows `14,592 → 58,368 → 107,632 → 430,528` and the
black-time bits genuinely vary (6, 3, 3, 3 patterns). The count is flat, not
growing. A rigidity of the centre column over the left half is not a statement
this board holds.

**Extended to `T = 25`, and the shape of the count is more useful than the
count** (`explorer/rowan_leftpin.mjs`, bit-parallel, 32 configurations per
`Uint32` word; it reproduces the entry above exactly at `T = 21` — 430,528 and
2 — before extending, which is why its later rows are worth reading).

| `T` | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| patterns | 1 | 1 | **2** | 1 | 1 | 1 | **2** | 1 | 1 | 1 | 1 |

Still bounded by 2 at `T = 25`, over all `2^26` configurations, exhaustively
rather than by sampling. But the counts understate it, because **the patterns
are strict prefixes of one another** — `0001110`, `000111001`, `0001110010`,
`00011100101`, `000111001010` — and at both `T` where the count is 2 the two
patterns **differ only in the bit at the last white time**, which is resolved
one step later: `T = 17`'s ambiguous 8th bit is `0` at `T = 18`, and `T = 21`'s
ambiguous 11th bit is `1` at `T = 22`.

So the measured statement is not "few possibilities" but **the centre column
determines column 1 at every white time up to a lag of one**: at depth `T`, the
white-time bits at times `< T` are pinned to a single value and only the most
recent one is free.

**RETRACTED THE SAME EVENING, AND IT IS A TAUTOLOGY.** I wrote here that this
determination is *not* guarded by the negation of its goal, unlike the
hypothesis of `centerColumn_not_isEventuallyPeriodic_of_white_times`, and that
if it held with bounded lag it would supply that node's hypothesis
non-vacuously. Dib asked one question — *isn't column `N+1` already known to be
tightly tied to column `N`?* — and the answer dissolves the whole thing.

**It is the rule at the origin, solved for `c₁`.** Read the rule at cell 0:

> `c₀(t+1) = c₋₁(t) XOR (c₀(t) OR c₁(t))`

At a **white** time, `c₀(t) = 0`, so this is `c₀(t+1) = c₋₁(t) XOR c₁(t)`, i.e.
`c₁(t) = c₀(t+1) XOR c₋₁(t)` — determined, with the lag of one that the counts
showed. At a **black** time, `c₀(t) OR c₁(t) = 1` whatever `c₁(t)` is, so `c₁`
leaves the equation and is free. That is exactly the measured pattern: white-time
bits pinned, black-time bits varying, ambiguity only at the most recent white
time. Checked rather than argued: over 3,000 rows, `c₁(t) = c₀(t+1) XOR c₋₁(t)`
fails at **0 of 1,516** white times, and `c₀(t+1) = ¬c₋₁(t)` holds at **1,484 of
1,484** black times.

**And `c₋₁` is free too, for a second one-line reason.** Cell `(t+1, i)` reads
`i−1, i, i+1`, so for `i ≤ −1` it reads only cells `≤ 0`: the left half is a
**closed system driven by column 0**, and it starts all white in this family. So
column 0 determines the entire left half by induction, which is why the sweep
found all 29 column-0 classes pinning columns `−1..−8` uniquely. Nothing about
rule 30 is used beyond the neighbourhood shape.

So the exhaustive sweep over `2^26` configurations confirms a two-line identity.
The counts are right, `rowan_leftpin.mjs` is right, and **the finding is
`Nothing`** — it says nothing about rule 30 that the rule itself does not say at
the origin. It supplies no hypothesis to any node, because a tautology
constrains no eventually periodic column.

**This is the trap Ephemeris already named**, in §4.2 of the subshift sighting
of the same morning: *"the tempting reduction — `no 11 past N ⟹ column −1 is
black at every late black time` — is a tautology, the rule at the origin read
backwards, and I spent an hour on it."* Same equation, same origin, same
direction, recorded twelve hours earlier, and I walked into it while holding a
brief that quoted the warning. What made it feel like a discovery was the
2^26 exhaustive sweep behind it: **the size of a computation is not evidence
about the depth of what it computes.** [2026-09-12, Rowan.]

The `p = 1` rung is the one case where the cone sees nothing — the
all-white word makes `col(-1)` equal to column 1 and the system satisfiable — and
it is Condrey's, proved by the right half's latch; the two ends of the ladder have
opposite mechanisms and only one of them has a proof.

**One correction to the entry above but one, in its own terms.** Its
`f_w(a) ≤ LB(w,a) + 1` is one looser than the truth. `LB` was read at the entry
to a search step, so it counted the column about to be tested rather than the
last one passed: `LB = D + 1`, and the sharp relation is `f_w(a) ≤ D(a) + 1`,
which is equality at 13 of the 24 exhaustive cells measured here. Nothing in that
entry is wrong; its constant is one weaker than it needed to be.

**Recorded** 2026-09-12 by Talus, from the attack document
`docs/attacks/2026-09-12-the-left-only-reduction-for-one-word-w-011-at-general-a-your-own-next-topic-section-6-of-your-rung-3-document-of-this-ev.md`.
Scripts `explorer/talus13_w011.mjs`, `talus13_anf.mjs`, `talus13_image.mjs`,
`talus13_nerode.mjs`, `talus13_invariant.mjs`, `talus13_null.mjs`,
`talus13_control.mjs`, `talus13_null3.mjs`, `talus13_dominate.mjs`,
`talus13_sharehalf.mjs`; kernel
`explorer/talus13_scratch_cone.lean` with `explorer/talus13_scratch_mutant.lean`
beside it as the demonstration that the check can fail.
`explorer/talus13_null2.mjs` is kept as a stub: it fed the null the running
maximum of the *dependence count* as "bits available", which is the wrong
quantity — the constraint at column 7 is `1 + x₂`, depending on one bit that is
the third — and it crashed on `1 << 31` before that could matter.
`explorer/talus13_control.mjs`'s own null is also wrong and is labelled in the
file: built from a hash whose low bit was nearly a function of the prefix's low
bit, it returned the same `D(a)` in all 40 draws at every `a`, and a null with no
spread measures nothing.

