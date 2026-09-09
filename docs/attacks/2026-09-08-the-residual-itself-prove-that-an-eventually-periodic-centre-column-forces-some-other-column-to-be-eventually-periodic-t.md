# The residual itself

*Attack document. Talus, 2026-09-08. Topic: prove that an eventually
periodic centre column forces some other column to be eventually
periodic.*

## 1. The residual, in one paragraph

Time runs down the picture. One black cell at the top, a cone widening by
one cell a row on each side, black along both edges, white outside. The
centre column is the cone's axis read downward, and P1 says it never falls
into a repeat. The board reduces P1, through Jen's theorem that no two
distinct columns of this picture are both eventually periodic, to one
implication: *if the centre column repeats, some other column repeats
too.* Where that implication lives is the seam immediately either side of
the axis. The whole right half of the picture — every cell at `x ≥ 1` — is
a deterministic function of the centre column alone, because such a cell
reads only cells at `x ≥ 0` one step earlier and row 0 is white there; and
once columns 0 and 1 are known the whole left half follows by the sideways
solve. So the picture is a machine whose input is the centre column, and
the residual asks whether a periodic input forces a periodic output at one
particular place. The machine's state at time `t` is a word of length `t`:
the input is consumed at a depth that grows with time, and that is the
usual one-sentence statement of the difficulty. This document replaces it
with two sharper ones. **First, the residual is not a residual.** Given
Jen's theorem, which the board has proved unconditionally, the implication
is *logically equivalent* to P1 itself, so nothing has been shaved off and
no smaller thing remains to prove. **Second, the implication is false as a
statement about eventually periodic inputs.** There is a rule 30
configuration, white everywhere right of the origin at time 0 exactly as
the seed is, whose centre column is the two-periodic sequence `1010…` and
which has no other eventually periodic column at all — measured, not
proved, but measured to depth `5 · 10^5` and backed by a factor count that
puts any eventual period of the neighbouring columns above 998,977, where
an eventually periodic sequence of period `q` can have at most `q`. So no
proof can go
through the periodicity of the centre column alone; it must use the seed's
left cone, and the left cone is exactly what Jen's proof already uses to
force the *opposite* conclusion. What the session leaves behind that is
usable is a rewriting of the wall that does *not* go through Jen, and so
survives into the family where the hypothesis is actually satisfiable: the
existential "some column" collapses to the single column `−1`, and half of
that column — its values at the black times of the centre column — is
already pinned by a proved identity. The wall is a statement about one
column and about half of its cells.

## 2. Why the known routes fail

**Obstructions already on the board that bear on this topic.**

- *The diagonal structure never reaches the centre column.* Every diagonal
  theorem is about the settled part of the picture; the centre cell at
  time `t` is index 0 of diagonal `t`, inside every one of those
  diagonals' transients. The centre column is exactly the seam where
  nothing has settled.
- *The centre column as a boundary condition.* This is the half-line view
  used throughout this document. It kills the sequence-level statement in
  the direction "a periodic boundary gives an *aperiodic* column 1", with
  the witness `b ≡ true`, whose half-line has every column eventually
  constant. C1 below kills the other direction, so the sequence-level
  statement is now dead both ways; the new entry appended to
  `docs/obstructions.md` records that, and records that the two dead
  halves together are the sharp form of the difficulty.
- *Counting the right sides consistent with the centre column.* The count
  of windows agreeing with a column word to depth `T` doubles per step and
  measures a horizon, not the column.
- *The settled part of the left diagonals does not depend on the centre
  column*, and *the left of the picture knows one integer about the
  configuration.* Both say the left region is the seed's up to a shift for
  every configuration anyone has tried, so no statistic of it can see a
  periodic boundary.
- *Iterating the reset lemmas builds a front that cannot retreat.* The
  seam is a damage front that retreats on 26 % of rows, so a monotone
  induction over-counts it sixfold. The front in this document is a
  different one — between the picture and its own time shift — but stands
  on the same missing ingredient, a bound on the speed of a left damage
  front (crystals A3).
- The two right-diagonal entries and the flat-tower entry bear on this
  topic only through what the brief already grants: the right-diagonal
  recurrence is free by one bit per depth and that bit is the centre
  column.

**Routes tried or considered here.**

*Route A — prove the residual about arbitrary eventually periodic
boundaries.* Forget that the boundary is the seed's own centre column and
prove "periodic input, periodic column 1" for every periodic input. This
is what any induction on the half-line, or any finite-state argument over
periodic words, would deliver. It is false; C1 is the measurement and
`(10)^∞` is the smallest witness. This is the session's main result and is
appended to `docs/obstructions.md`.

*Route B — use Jen's theorem on the hypothetical picture.* Under the
hypothesis the seed is a configuration with an eventually periodic centre
column, and Jen says at most one of its columns is eventually periodic.
That is not a route but the negation of one: the seed is *unconditionally*
on the wrong side of the disjunction, so the wall's hypothesis and its
conclusion are contradictory rather than merely unproved. C0 makes this
precise: the wall is equivalent to P1.

*Route C — the damage front between the picture and its own time shift.*
Under the hypothesis the picture agrees with its `p`-shift on column 0
forever, and the residual asks for one more column of agreement. The
disagreement is a damage pattern whose left front is pinned off the
origin, and the residual is exactly "the pinned front eventually clears
column 1 or column −1". Measured in the family where the hypothesis is
satisfiable (`explorer/talus_front.mjs`, `T = 1.2 × 10^5`), the front does
not clear: for `b = (10)^∞` it takes only the values 1 and 2, forever, and
for `b = 110` only 1 to 15 with mean 3.65. Where the boundary *is* good
the front has a positive floor instead — 4 for `b = 1000`, 4 for
`b = 1000000000` — and then stops there rather than escaping, so only
finitely many columns on the right are ever periodic. A theorem forbidding
a pinned front would close the wall, and no bound on a left front's speed
is available in either direction (crystals A3). This is not a new dead end
so much as the previous one seen from the other side, so I have not filed
it separately.

*Route D — read the hypothesis as a bound on factor complexity.* If the
centre column is eventually periodic with period `p`, its tail has at most
`p` distinct factors of each length (crystal 21). One hopes that a
bounded-complexity input forces bounded-complexity output somewhere. It
does not, and the failure is sharp: the columns of `X_{(10)^∞}` have
*extremely* low complexity at short lengths and maximal complexity at long
ones — 48 distinct factors of length 32 in a tail of `10^6`, and 998,977
of length 1024, which is every window in the tail
(`explorer/talus_defect.mjs`). A periodic boundary buys a locally regular
picture with defects whose positions are effectively random. Complexity is
not conserved column by column, and no bound on it transfers.

## 3. Candidate claims

### C0. The frontier wall is P1, not a residual of it

**The claim.** In English: given Jen's theorem, the implication "if the
centre column repeats then some other column repeats" is not weaker than
"the centre column never repeats" — the two are the same statement. In the
project's vocabulary:

```
(IsEventuallyPeriodic centerColumn → ∃ j : ℤ, j ≠ 0 ∧ IsEventuallyPeriodic (fun t => evolve t j))
  ↔ ¬ IsEventuallyPeriodic centerColumn
```

**What it would give.** Nothing toward P1, and that is its content: it
retires the reading of `centerColumn_other_isEventuallyPeriodic_of_center`
as a reduction. A captain sequencing work off that wall should know that a
decomposition of it is a decomposition of the whole prize, and that the
same holds for `centerColumn_right_isEventuallyPeriodic_of_center` and for
any "column `j`" variant: all of them are equivalent to each other and to
P1, because each has a hypothesis that Jen's theorem already contradicts.
What is *not* equivalent is the same statement read in a family where the
hypothesis is satisfiable; that is what C2 and C3 are for.

**Falsification.** Not an engine claim — it is a two-line derivation from
two nodes on the board, so what could produce it falsely is a misreading
of those nodes rather than a bad measurement. What I checked: that
`not_isEventuallyPeriodic_pair` is unconditional (no hypothesis beyond
`i < j`) and covers every pair of distinct columns, so it applies at every
`j ≠ 0` against the centre column; and that
`centerColumn_not_eventually_periodic_of_any_other`, which is the forward
half, is already proved. Both read from `blueprint/index.md`. The backward
half is vacuous implication introduction.

**Novelty.** The wall's own description says "proving it proves P1", which
is the forward half. I found nothing on the board or in
`docs/obstructions.md` saying the converse, and the framing of the topic —
"the residual is what would still have to be shown" — reads as though
something had been subtracted. Not a literature question: it is about this
board's node set.

**Route.** `centerColumn_not_eventually_periodic_of_any_other` gives one
direction verbatim; the other is `fun h _ => absurd ... h`. Size S. The
only hard step is deciding whether a captain wants it on the board at all,
since its value is documentary.

### C1. The residual for arbitrary eventually periodic boundaries — **dies**

**The claim.** In English: let `b` be any eventually periodic sequence and
let `X_b` be the configuration that is white at every `x ≥ 1` at time 0
and whose centre column is `b` (crystal 40: column 0 and the right half
are free coordinates, so `X_b` exists and is unique, and the seed is
`X_c` for `c = centerColumn`). Then some column of `X_b` other than
column 0 is eventually periodic. In the vocabulary: for every
`X : Config` with `∀ k : ℕ, X (k+1) = false` and
`IsEventuallyPeriodic (column X 0)`, there is `j ≠ 0` with
`IsEventuallyPeriodic (column X j)`.

**What it would give.** The residual, immediately and with room to spare:
the seed is one member of this family, and the hypothesis would be used
only through the periodicity of the boundary. It is the statement any
induction on the half-line, or any argument over the finite system of
periodic words, would actually prove.

**Falsification. Dies at `b = (10)^∞`**, the smallest non-constant
periodic sequence. `explorer/talus_deep.mjs` (`T = 1.5 × 10^5`, every lag
`q ≤ 2 × 10^4`, agreement required over the last 75,000 terms) finds no
eventual period for columns 1, 2 or 3; `explorer/talus_other.mjs`, same
depth, extends that to every column from `−24` to `24`, both sides, with
the left columns computed by the sideways solve;
`explorer/talus_witness.mjs` takes columns 1 and −1 to `T = 5 × 10^5` with
every lag `q ≤ 10^5` and onset `≤ 2.5 × 10^5`. The sweep
(`explorer/talus_halfline.mjs`, `explorer/talus_class.mjs`) says the death
is typical rather than special: at period 5 only 2 of 32 boundaries are
good, at period 7 only 2 of 128, at period 9 only 8 of 512.

*What else could have produced this.* Four things, and each was checked.
(i) *A mirrored or otherwise wrong engine* — the project has been caught
twice by a model that passed every symmetric check. The bit-packed
half-line was run against the seed's own right half with the seed's centre
column as its boundary: 0 mismatches over 400 rows × 8 columns
(`explorer/talus_verify.mjs`), and against an independent BigInt
implementation on 40 random boundaries: 0 mismatches. Its agreement with
the board's own `evolveHalfRight` was then checked *by the Lean kernel*
for the boundary `(10)^∞` over rows 0–7 and positions 1–5
(`explorer/talus_scratch_halfline.lean`, accepted by `lake env lean`).
(ii) *The half-line and sideways-solve models being fictions.* `X_b` was
rebuilt as an actual row of cells and evolved by a separate full-line
BigInt engine: its column 0 reproduced `b` and its column 1 reproduced the
half-line's answer, 0 mismatches over 3,000 rows, for seven boundaries
(`explorer/talus_config.mjs`). (iii) *A short run.* This was a real
problem: the first sweep at `T = 4000` reported `11100110` and
`01110011` as good and they are not periodic at all, and a second pass at
`T = 30000` again mislabelled two boundaries whose apparent onset was
itself a large fraction of the run. Every number quoted here is from a run
where the onset is at most half the depth. (iv) *Mistaking a
quasi-periodic sequence for an aperiodic one.* Column 1 of `X_{(10)^∞}`
agrees with its own shift by 5606 for 289 consecutive terms, where a coin
would manage 17; its density is 0.41, not 0.5; and it has only 48 distinct
factors of length 32. All of that says "nearly periodic", and a period
just past the largest lag scanned would explain it. The factor count
settles it in the other direction, and rigorously: an eventually periodic
sequence with period `q` has at most `q` distinct factors of any length,
and this one has **998,977 distinct factors of length 1024 in a tail of
length `10^6` — every window in the tail distinct**
(`explorer/talus_defect.mjs`). So any eventual period with onset below
`10^6` is at least 998,977, which is more than the tail can hold. For
contrast, at length 32 the seed's own centre column has 499,949 distinct
factors in a tail of 500,000 where this column has 48
(`explorer/talus_factors.mjs`). The counterexample is a picture that is
locally regular and globally random; the seed is random at every scale.
This does not weaken the counterexample, because under the wall's
hypothesis the seed's centre column would itself have complexity at most
`p`.

**Novelty.** The nearest statement in print is Wolfram 1986 §7 (lines
1082–1145 of `sources/wolfram-1986-random-sequence-generation.txt`): the
triangle to the left of the origin is determined by the position-0
sequence together with the position-1 sequence, "if the position 0
sequence consists solely of ones, then the whole triangle of sites is
completely determined, entirely independent of the position 1 sequence",
and the number of position-1 values a given site depends on "varies with
the form of the position 0 sequence". That is the same
dependence-on-the-boundary phenomenon, measured as decoding complexity;
he says nothing about eventual periodicity of the columns and exhibits no
configuration with exactly one eventually periodic column. Jen 1990
Proposition 3 and Kopra 2022 Theorem 3.5 both prove "at most one" and both
carry the hypothesis this family drops — finite initial conditions, and
`x ∈ N(σ)` respectively — so neither is contradicted; Kopra's Problem 4.8
is the width-1 case for the seed. Searched: all twelve files in
`sources/`, for `half-line`, `one-sided`, `boundary condition`,
`temporal sequence`, `eventually periodic`, `column`, `temporal`,
`quiescent`, `left-finite`. Rowland 2006's "columns" are our left
diagonals in a mirrored frame and do not bear on this.

**Route.** None, and none wanted: the claim is false. Its dead form is
the obstruction.

### C2. The existential collapses to column −1

**The claim.** In English: if the centre column repeats, then "some column
other than the centre repeats" and "the column just left of the centre
repeats" are the same statement. In the vocabulary:

```
(IsEventuallyPeriodic centerColumn → ∃ j : ℤ, j ≠ 0 ∧ IsEventuallyPeriodic (fun t => evolve t j))
  ↔ (IsEventuallyPeriodic centerColumn → IsEventuallyPeriodic (fun t => evolve t (-1)))
```

and the same rewriting holds for an arbitrary configuration, where it is
not vacuous.

**What it would give.** It rewrites the frontier wall
`centerColumn_other_isEventuallyPeriodic_of_center` so that the target is
a named column instead of an existential, and the named column is `−1`,
not `1`. That matters because half of column `−1` is already pinned by a
proved identity (C3), where nothing at all is pinned about column 1. It
also says which of the board's two walls is the right target: the frontier
one is genuinely the weaker construction, and C4 exhibits a configuration
where it is achievable and the column-1 wall is not.

**Falsification. Survives** at `T = 3 × 10^5` over nine boundaries
(`explorer/talus_residue.mjs`) and at `T = 1.5 × 10^5` over the range
`−24 … 24` for twelve boundaries (`explorer/talus_other.mjs`): in every
configuration measured, either no column other than 0 is eventually
periodic, or column `−1` is. No configuration was found with a periodic
column at some `|j| ≥ 2` and an aperiodic column `−1`.

*What else could have produced this.* The claim is a consequence of two
proved nodes, so the engine can only catch a misreading of them, and it is
the misreading I was worried about: the board's
`evolve_isEventuallyPeriodic_of_between` is stated for the seed, and I am
using the general form (Jen's sandwich lemma, crystal 16, proved for every
rule and every configuration) in the family. The measurement is over
configurations where the sandwich lemma's *seed* form does not apply at
all, so a false general form would have shown up as a periodic column at
`|j| ≥ 2` beside an aperiodic column `−1`, and none appeared. The scan
stops at `|j| = 24`; a periodic column further out would, by the same
lemma, drag every column between it and 0 with it, so it would have been
seen at `j = ±1`.

**Novelty.** New phrasing of known results, and I would label it that way
on the board. The two ingredients are Jen's sandwich lemma (Jen 1990, via
`evolve_isEventuallyPeriodic_of_between`) and the leftward propagation of
a shared period (`evolve_period_sub_one`, on the board, and Wolfram 1986
Eq. (3.3)). What I did not find, in `sources/` or in the board, is the
conclusion drawn: that the existential in the frontier wall is exactly one
column and that the column is on the *left*.

**Route.** For `j ≥ 2`: `evolve_isEventuallyPeriodic_of_between` at
`i = 1`, `w = j - 2`, with boundaries column 0 and column `j`, gives
column 1; then `evolve_period_sub_one` on the adjacent pair (0, 1) gives
column `−1`. For `j ≤ −2`: the same lemma at `i = j+1`, `w = -j-2` gives
column `j+1`, and an induction on `-j` walks in to column `−1`. The one
step that is actually hard is none of these; it is the bookkeeping of
putting the two columns on a common period and onset before each
application, which is the friction every proof in this region has paid.
Size M.

### C3. The wall is about the white times only

**The claim.** In English: suppose the centre column repeats with period
`p` from time `N`. Then each residue class mod `p` is uniformly black or
uniformly white from `N` on, and on the black classes column `−1` is
already known and already periodic — it is the complement of the next
centre cell. So the wall is a statement about the white classes alone: the
frontier wall holds exactly when column 1, read only at the times the
centre column is white, is eventually periodic. The column-1 wall asks for
that *and* for column 1 read at the black times, about which nothing at
all is known. In the vocabulary: with `PeriodicFrom centerColumn p N` and
`0 < p`,

```
∀ t ≥ N, centerColumn t = true  → evolve t (-1) = ! centerColumn (t+1)
∀ t ≥ N, centerColumn t = false → evolve t 1 = (centerColumn (t+1) ^^ evolve t (-1))
```

and hence `IsEventuallyPeriodic (fun t => evolve t (-1))` is equivalent to
the eventual periodicity of each sequence `k ↦ evolve (r + k*p) 1` over
the white residues `r`.

**What it would give.** It halves the wall. After C2 the target is one
column; after C3 it is one column at half its times, and the other half
carries an explicit closed form. It also locates the gap between the
board's two walls exactly: the black-time values of column 1 are the whole
of the difference.

**Falsification. Survives.** `explorer/talus_residue.mjs`, `T = 3 × 10^5`,
nine boundaries: the two identities were checked at every one of the
300,000 rows for every boundary, 0 failures; and the predicted equivalence
held in every case — column `−1` is eventually periodic exactly when
column 1 restricted to the white residues is (`11111110`, `10111111`,
`1000`, `1000000000`, `1` on one side; `10`, `110`, `100000`, `11100110`
on the other).

*What else could have produced this.* The identities are proved nodes
(`column_succ_of_black`, `column_one_of_white`), so a clean pass proves
only that my indexing matches theirs; that is what it was for, since an
off-by-one in `t` versus `t+1` here would have produced a coherent and
wrong reduction. The equivalence itself could have passed vacuously if
every boundary in the sample had had both halves periodic or neither —
`110` is the case that separates them (black residues periodic, white
residues not), and `11111110` is the reverse.

**Novelty.** The two identities are on the board already and are Sextant's
C2 from the second attack of 2026-09-07; obstruction 3's closing paragraph
states the black-time half in words ("at every black time of column 0,
column 1 drops out of the rule at the origin"). What is new is the use
made of them: the partition of the wall along the residue classes, and the
statement that the black classes are *finished* rather than merely
convenient. Searched `sources/` for `residue`, `black time`, `parity of
the column`, and Wolfram 1986 §7 again; the closest is his remark that a
position-0 sequence of all ones determines the triangle independently of
position 1, which is this identity in the degenerate case where every time
is black.

**Route.** `column_succ_of_black` at the seed gives the first identity;
`column_one_of_white` gives the second. The equivalence then needs one
piece of arithmetic that is not on the board: that a `Bool` sequence is
eventually periodic if and only if each of its `p` sub-sequences along the
residues mod `p` is. That is elementary but is the one real step, and it
wants stating in `ℕ` throughout, per the captain's rule. Size M.

### C4. Column −1 can repeat while column 1 does not

**The claim.** In English: the board's two walls are different
constructions, not just different phrasings. There is a configuration
white at every `x ≥ 1` at time 0 whose centre column is periodic with
period 8, whose column `−1` is periodic with period 8 from index 0, and
whose column 1 is not eventually periodic. In the vocabulary: `X_b` for
`b = 11111110` (black except at `t ≡ 7 mod 8`), for which
`PeriodicFrom (column X_b (-1)) 8 0` and
`¬ IsEventuallyPeriodic (column X_b 1)`.

**What it would give.** It is the evidence that C2 and C3 are not empty
bookkeeping: the frontier wall's conclusion is reachable in a case where
the column-1 wall's is not, so aiming at column `−1` is a real weakening
and not a relabelling. It also exhibits the mechanism C3 predicts: `b` is
white on exactly one residue class, column 1 is white at every one of
those times, so column `−1` is forced by the boundary alone at every time.

**Falsification. Survives.** Found by `explorer/talus_pm1.mjs` (sweep
`T = 6000` over all 510 boundaries of period `≤ 8`, then confirmation at
`T = 9 × 10^4` with every lag `≤ 4000`): eight boundaries separate, and
they are exactly the eight words of period 8 with a single white cell.
Re-read off a real picture by the full-line BigInt engine rather than the
solve (`explorer/talus_sep.mjs`): columns `−2`, `−1`, `0` all exactly
8-periodic, columns 1 and 2 not, with the full-line and half-line column 1
agreeing on 4,800 rows. Column 1 is black at 0 of the 250,000 times
`t ≡ 7 mod 8` below `2 × 10^6`, and column `−1` fails 8-periodicity at 0
of `2 × 10^6` indices (`explorer/talus_defect.mjs`).

*What else could have produced this.* An onset of exactly 0 and a period
of exactly 8 is the shape of a bug, so this one was attacked hardest, and
it did throw one false alarm — mine. The factor count first reported
**nine** distinct factors of length 8 for column `−1`, one more than an
8-periodic sequence can have, which sent me hunting a defect for a run;
the ninth factor was an off-by-one in my own counter, which read one
element past the end of the column `−1` array. Corrected, the count is
exactly 8 at every length up to 32. Column 1 of the same configuration has
758 factors of length 32, so the two columns are not both reading the same
buffer. The remaining honest gap is the usual one: "column 1 is not
eventually periodic" is a statement to depth `2 × 10^6`, not a theorem,
and the sub-claim that carries it — column 1 white at every `t ≡ 7 mod 8`
— is exactly the kind of statement that has held for a million terms and
failed later elsewhere in this project.

**Novelty.** I found nothing in `sources/` exhibiting a rule 30
configuration with exactly one eventually periodic column, in either
direction. Jen 1990 Proposition 3 and Kopra 2022 Theorem 3.5 prove "at
most one" under hypotheses this configuration fails, so both are
consistent with it and neither predicts it. Searched the same twelve files
with the same terms as C1, plus `adjacent`, `trace`, `Tr[`.

**Route.** No route to a Lean statement, and I would not seed it. Its
place is the obstruction entry and this document; a captain wanting it on
the board would first need `X_b` as a definition, which means crystal 40's
existence half, which is not yet a node.

## 4. What survived

C1 died, and its death is the session's result. C0, C2, C3 and C4
survived. **I would seed C2 first**: it is the only one that changes what
a prover is aiming at, it costs an M-sized proof out of two nodes that are
already closed, and after it the frontier wall reads "if the centre column
repeats, the column just left of it repeats" — one named column instead of
an existential over `ℤ`. C3 should follow immediately, because it is what
makes C2 worth having: with the black times pinned by
`column_succ_of_black`, the wall is a statement about column 1 at the
white times of the centre column and about nothing else, and that is the
smallest form of P1 this board has had. C0 I would land as documentation
rather than as mathematics — it costs three lines and it stops the next
session from reading the frontier wall as a reduction and looking for a
smaller one, because there is none. C4 is not a Lean statement and should
stay in this document and in `docs/obstructions.md`. What I would not do
is spend another session on the half-line abstraction in either direction:
with obstruction 2 killing one half and C1 the other, the abstraction is
closed.

## 5. Claims that died

- **C1, the residual for arbitrary eventually periodic boundaries.** Dies
  at `b = (10)^∞`, period 2, the smallest non-constant periodic sequence:
  the configuration it determines has no eventually periodic column other
  than column 0. Depth `5 × 10^5` for columns `±1` with every lag
  `≤ 10^5`; depth `1.5 × 10^5` for columns `−24 … 24`; and 998,977
  distinct factors of length 1024 in a tail of `10^6`, which puts any
  eventual period with onset below `10^6` above 998,977.
  `explorer/talus_deep.mjs`, `talus_other.mjs`, `talus_witness.mjs`,
  `talus_defect.mjs`.
- **"Good boundaries are rare at every period."** The sweep at `T = 4000`
  gave good fractions of 0.26 at period 8 and 0.17 at period 10 against
  0.016 at periods 7 and 9, and I read the even periods as an artifact.
  They are not: at `T = 3 × 10^4` the fractions are 0.273 and 0.167, and
  the boundaries survive to `T = 1.2 × 10^5`. Goodness really is common at
  some periods and vanishing at others, with no pattern I could find —
  which is itself the reason C1's death is decisive rather than
  anecdotal.
- **The `T = 4000` classification.** Reported 67 good boundaries of period
  8 and 178 of period 10; at `T = 6 × 10^4` several of them (`11100110`,
  `01110011`, `1000101111`) were not periodic at all. The same happened
  again at `T = 3 × 10^4` for the boundaries whose onset was itself a
  large fraction of the run: of the eight with onset above 1000, two
  (`1000100001`, `1011011101`) failed at `T = 1.2 × 10^5`. Every count in
  this document is an upper bound for that reason, and the period-10 count
  should be read as 169 or fewer, not 171.
- **A defect in an 8-periodic column, at index unknown, hunted for one
  run.** There is none. The factor counter read one element past the end
  of the column `−1` array, JavaScript returned `undefined`, `|` turned it
  into 0, and one spurious factor appeared at every length — enough to
  make an exactly 8-periodic sequence report nine distinct factors of
  length 8. The value was true and the conclusion was false, which is this
  project's recorded failure mode; what caught it was that the anomaly was
  *exactly one*, which is not what a real defect looks like.

## 6. Next topic

Attack **the classification of good boundaries**: for which eventually
periodic `b` does the configuration `X_b` — white at every `x ≥ 1` at time
0, centre column `b` — have an eventually periodic column other than
column 0? After C0 there is no residual of P1 smaller than P1, and after
C1 there is no argument from periodicity alone, so the only remaining
place a positive criterion can come from is a property that separates the
good boundaries from the bad ones; the residual is then exactly the
statement that a periodic centre column of the *seed* would have to be
good. The question is finite in shape — it is a property of a periodic
word — and nobody has looked at it: the measured good fractions are 1,
0.50, 0.63, 0.88, 0.06, 0.08, 0.02, 0.27, 0.02, 0.17 at periods 1 to 10,
which is neither monotone nor parity-driven nor anything else I could see,
and the confirmed onsets range from 0 to 7,171 (at period 9), with the
largest surviving one at period 10 being 1,103 after the two apparently
larger ones failed at greater depth. Three concrete
sub-questions a session could hold on to, and one of them already has half
an answer. **(a)** Is goodness decided by a finite computation on `b`?
**(b)** Is the good set closed under rotation of `b`? The data says yes at
every period measured — the good boundaries arrive in whole rotation
classes, with onsets that step by exactly one as the word is rotated (`100`,
`010`, `001` at onsets 297, 298, 299; the eight rotations of `1010000000`
at 464 to 471). Half of that is provable and cheap: *if `b` starts white
then `X_{σb}` is row 1 of `X_b`'s own picture*, because that row is white at
every `x ≥ 1` (its cell at `x = 1` is `xor(b 0, false) = b 0 = false`) and
its centre column is `σb`, so crystal 40's uniqueness identifies the two;
verified at 0 mismatches over 3,900 rows × 60 positions for six boundaries
starting white, and it fails for every boundary starting black
(`explorer/talus_rotate.mjs`). But those links only connect the rotations
`r_k` and `r_{k+1}` at positions where `b k = false`, so they span a whole
rotation class exactly when `b` has at most one black cell — for `b = 110`
they connect `011` to `110` and leave `101` alone, and `101`'s badness is
unexplained. Closing that gap is a small, self-contained piece of work with
a real conclusion either way. **(c)** Does goodness coincide with the left
half of `X_b` being eventually *spatially* periodic? Crystal 24 makes it a
necessary condition, and `explorer/talus_class.mjs` confirmed it for the
two good boundaries whose period was small enough to test (spatial period 7
in the row, for `b = 1000` and `b = 1110`) but could not test the rest,
because a temporal period `q` only bounds the spatial period by `2^{2q}`. The alternative topic, if
a captain wants to stay on the seed rather than the family, is column `−1`
at the white times of the centre column — the object C2 and C3 leave the
wall standing on — but that is the wall itself in its smallest coat, and
the classification question is the one with a finite object in it.
