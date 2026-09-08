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
