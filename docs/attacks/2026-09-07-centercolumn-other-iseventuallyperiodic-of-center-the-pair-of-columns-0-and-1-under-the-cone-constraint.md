# Attack: `centerColumn_other_isEventuallyPeriodic_of_center`, the pair of columns 0 and 1 under the cone constraint

Sextant, 2026-09-07, second session on this wall. An argument, not a
proof. Every survival below names the script, the depth, and what else
could have produced it. Scripts are under `explorer/` and run with
`node explorer/<file>.mjs`; the kernel checks are in
`explorer/scratch_blacktime.lean` and were accepted by
`lake env lean explorer/scratch_blacktime.lean` with no output.

## 1. The residual, in one paragraph

Time runs down the picture. The centre column is the vertical line through
the apex; column 1 is the line one cell to its right. The wall says: if the
centre column ever settles into a repeating pattern, some other column
repeats too, and Jen's theorem on the board then makes that impossible, so
the centre column never repeats, which is the first prize conjecture. This
session's topic is the pair of columns 0 and 1 and what the cone forces on
it. Two facts frame it. Columns 0 and 1 together determine everything to
their left, one column per step of the sideways inverse
(`evolve_sub_one_eq_xor`): that is why a repeating pair walks left, hits the
black left edge, and dies (`not_evolve_period_adjacent`). And each
half-line, `x ≥ 1` and `x ≤ -1`, is driven by column 0 alone from an
all-white start. So the residual lives at the origin, on the seam between a
left half that is nested and eventually periodic diagonal by diagonal and a
right half that repeats along every diagonal from its first cell, and the
one cell where the two halves meet is the centre cell itself. What would
have to be true is that no repeating boundary sequence can be its own
consequence there: that the rule at the origin, fed a periodic column 0 and
whatever the two half-lines make of it, contradicts the column it was fed.

## 2. Why the known routes fail

- **The diagonal structure never reaches the centre column**
  (`docs/obstructions.md`). Still true, and this session put a number on
  it. The onsets of the left diagonals, recounted from 12,000 rows
  (`explorer/leftonsets.mjs`), are `0..3` for `k ≤ 23` and then grow to
  `0.34k`–`0.48k` for `k = 48..100`, so the settled part of diagonal `k`
  begins at index about `0.4k`, which is position `-0.29t` at time `t`.
  The centre cell (index 0) and column -1 (index 1) sit inside the
  transient of every diagonal past `k = 17`. Section 3, C2 shows the whole
  content of the residual is the value of column -1 at black times, which
  is exactly the index-1 cells of those transients.
- **The centre column as a boundary condition** (`docs/obstructions.md`,
  my previous entry). Still true in the direction it states: the constant
  boundary `b ≡ true` has periodic half-line columns on both sides. This
  session sharpens *which* side matters: the cone constraint on the pair
  reduces, at black times, to an identity in column 0 and column -1 alone
  (C2), and that identity kills every periodic boundary tested without ever
  consulting the right half (C3). One sentence in that entry is imprecise
  and is corrected in the new entry: the left half-line grown from a white
  start with boundary `b ≡ true` is not constant; the constant left side
  belongs to the fixed-point row `…1010 1 | 000…`.
- **Two adjacent columns propagate left** (Jen 1990 Prop. 3; Kopra 2022
  Thm 3.5, whose proof at lines 341–349 of the extraction is the sideways
  walk plus "a column white through its preperiod and one period is white
  forever"). At width 1 the walk needs column 1, which the wall does not
  control; C2 says precisely when it is needed: at white times only.
- **New dead end, appended to `docs/obstructions.md` as "Counting the right
  sides consistent with the centre column".** The question my previous
  document left as its next topic, whether the number of column-1 prefixes
  (equivalently, of windows white on `x ≤ -1`) consistent with a periodic
  column 0 stays bounded in the depth, is the wrong question: the count
  doubles at nearly every step for any column that survives, because a
  cell at position `k` on the right cannot reach the origin before the
  damage front from it has walked left, about `4k` rows. Numbers in C4 and
  section 5.

## 3. Candidate claims

### C1. Column 0 and the right half are free coordinates on configuration space

**The claim.** For every sequence `b : ℕ → Bool` and every right half
`Y : ℕ → Bool` there is exactly one configuration `X : Config` with
`X (k + 1) = Y k` for all `k` and `column X 0 t = b t` for all `t`. In
vocabulary: `∀ b Y, ∃! X : Config, (∀ k : ℕ, X (k + 1) = Y k) ∧ ∀ t, column X 0 t = b t`.
Its finite form: for every `t` and every word `c : Fin (t + 1) → Bool`,
exactly `2 ^ t` of the `2 ^ (2t + 1)` windows `w : Fin (2t + 1) → Bool`
have `column (ofWindow w) 0 s = c s` for all `s ≤ t`. The construction
needs one definition that is missing, the sideways solve
`leftSolve (c d : ℕ → Bool) : ℕ → ℕ → Bool` with `leftSolve c d 0 = c`,
`leftSolve c d 1 = d`,
`leftSolve c d (k + 2) t = xor (leftSolve c d (k + 1) (t + 1)) (leftSolve c d (k + 1) t || leftSolve c d k t)`;
then `X (-k) = leftSolve b (column₁ b Y) k 0`, where `column₁ b Y` is
column 1 of the half-line `x ≥ 1` grown from `Y` with boundary `b`.

**What it would give.** A change of coordinates, not a lemma about the
seed. The single seed is the pair `(b = centerColumn, Y = white)`, so the
residual reads: *for periodic `b`, the sideways solve of `b` and the
white-started right half-line's column 1 is not white at time 0 on every
cell `-k`, `k ≥ 1`.* Two things follow at once. The seed is rigid from the
right: a white right half pins the whole configuration given column 0,
which is why the residual cannot be about column 0 "as a sequence" (my
previous document) and must mention the white left cone. And the seed is
loose from the left: many configurations white on `x ≤ -1` share its
centre column to any finite depth (C4).

**Falsification.** `explorer/leftsolve.mjs`. (1) The sideways solve from
the engine's columns 0 and 1, 3,000 rows, 1,500 columns leftward: 0 cells
disagree with the engine's rows, and `leftSolve c d k 0 = 0` for every
`k = 1..1500`, the cone in its time-0 form. (2) For 12 pseudo-random
`(b, Y)` pairs (xorshift32) and for `b = 1^∞`, `(10)^∞`, `(1100)^∞`, the
configuration built by half-line plus sideways solve has column 0 equal to
`b` to depth 200 in every case; the left half is about half black. (3) For
`t ≤ 10`, all `2 ^ (2t + 1)` windows enumerated: every column word has
exactly `2 ^ t` windows, no exceptions. Kernel: `scratch_blacktime.lean`
checks the time-0 cone for `k ≤ 40` from `rowCell`, and one bijection
instance (`b = (1100)^∞`, `Y` white, 20 steps) by `decide`. **Survives.**
What else could produce it: the construction and the check share the same
rule-30 loop, so a mirror-image error would pass both; ruled out because
(1) compares against `rows` from `rule30.mjs`, which `verify.mjs` checks
against a rule-number decoder, and the kernel instance uses `rowCell`,
which `rowCell_eq_evolve` ties to the definition.

**Novelty.** New phrasing of a known result. Wolfram 1986 §4
(`wolfram-1986-random-sequence-generation.txt`, lines 462–468): "given any
temporal sequence, iteration of Eq. (3.3) yields an equal number of initial
configurations which evolve to it", which is the `2 ^ t` count, and lines
509–516, that a spacetime patch is determined by its boundaries via (3.1)
and (3.3). Crystal 7 is the existence half. The uniqueness with the right
half fixed I did not find stated; searched Kůrka for "column subshift",
"permutive", "trace", Kopra for "Tr", "left expansive" (his Definition 3.1
is the sideways determination in general form). Kůrka Theorem 25 (Coven,
Pivato, Yassawi) is the nearest neighbour: a left-permutive CA with the
right half fixed is an adding machine, which is the right diagonals'
period-doubling in another language.

**Route.** Uniqueness is on the board: two configurations with the same
right half and the same column 0 that differ somewhere have a rightmost
difference at some `i ≤ 0`, and `rightmost_difference_moves_right` puts a
difference at the origin after `-i` steps. Existence is induction on `k`
from `sideways_inverse` once `leftSolve` and the half-line exist. The hard
step: none. Size M with the definitions, S each after.

### C2. At black times the cone constraint forgets column 1

**The claim.** Let `X` be any configuration, `c = column X 0`, `L` its
column -1, `R` its column 1. Then `c (t + 1) = xor (L t) (c t || R t)`,
so at every black time (`c t = true`) `c (t + 1) = ! L t` with `R` absent,
and at every white time `R t = xor (c (t + 1)) (L t)`. Moreover `L` is a
function of `c` and the left half of `X` at time 0 alone: it is column -1
of the half-line `x ≤ -1` grown from `X|_{x < 0}` with boundary `c`. So
for a configuration white beyond `-m`, with left word `w` of length `m`:
**at every black time `t`, `c (t + 1) = ! L_{c,w} t`, a condition on
`(c, w)` only; column 1 enters only at white times, where it is forced to
`xor (c (t + 1)) (L_{c,w} t)`.** Missing definition: the left half-line
`evolveHalfLeft (c : ℕ → Bool) (w : List Bool) : ℕ → ℕ → Bool` and the
agreement theorem `evolveHalfLeft (column X 0) (X|_{x<0}) t k = evolveFrom X t (-(k+1))`.

**What it would give.** The reduction the topic asks for. The pair
`(column 0, column 1)` under the cone constraint is: column 0 must pass the
black-time test against its own left half-line, and column 1 is then
determined at white times and unconstrained by the origin at black times.
A proof of the residual through the left would cite this to discard
column 1 and work in the boundary-driven half-line `x ≤ -1`. What remains
is everything: C3.

**Falsification.** An identity (`sideways_inverse` at `i = 0`), so no
engine run can kill the first half; the second half, that `L` depends on
`c` and the left word only, is `evolve_eq_false_of_outside_cone`-style
induction. Engine check of the pair: `explorer/truecolumn_blacktest.mjs`
runs the black-time identity on the engine's centre column against a
BigInt half-line grown from a white start, 200,000 rows, 100,072 black
times, 0 failures. **Survives.** What else could produce it: a half-line
model that was accidentally the true left side by construction; ruled out
because the half-line here reads only column 0 and never the engine's left
cells, and the same half-line model kills every periodic column in C3.

**Novelty.** New phrasing of a known identity. The sideways inverse is
crystal 1 and `sideways_inverse`; the "free input when the centre is
black" reading is C2 of my previous document and NKS p. 1087. That the
black-time half is a condition on the left half-line alone, and hence on
all of Kopra's number-like configurations `N(2)` with a given column 0, I
did not find in Jen 1990 (searched "injective", "determine", "unique") or
Kopra 2022 (searched "N(2)", "Tr", "Problem 4.8"); both keep the pair whole.

**Route.** Two S nodes (the identity split by the centre's colour) and one
M node (the half-line agreement theorem, induction on `t` with the cone
lemma for the white start). Hard step: none.

### C3. The left half-line conjecture

**The claim.** For every `c : ℕ → Bool` that is eventually periodic and
not eventually white, and every finite left word `w`, there is a black
time `t` with `c (t + 1) = L_{c,w} t`, where `L_{c,w}` is column -1 of the
half-line `x ≤ -1` grown from `w` with boundary `c`. In vocabulary, once
`evolveHalfLeft` exists:
`IsEventuallyPeriodic c → (∀ N, ∃ t ≥ N, c t = true) → ∀ w, ∃ t, c t = true ∧ c (t + 1) = evolveHalfLeft c w t 0`.

**What it would give.** By C2 it implies the wall directly (take
`c = centerColumn`, `w = []`, where the identity holds at every black time)
and also the version for every number-like configuration that Kopra 2022
calls "probably equally difficult" (lines 553–557 of the extraction: the
width-1 trace of any configuration in `N(2)`; Theorem 3.5 is width 2). The
eventually-white case is excluded separately: column 1 is then monotone
(`R (t+1) = R t || column₂ t`), so eventually constant, so column -1 is
eventually constant by the identity, and the pair `(-1, 0)` walks left
into the edge (`not_isEventuallyPeriodic_adjacent` after a shift) unless
column -1 is constant black, which forces the `(10)^ℤ` fixed point on the
left, not number-like. This is stronger than the residual, not a lemma
under it: its value is the object it names. The boundary is periodic with
period `p`, so the `p`-step map `Φ` of the half-line is autonomous, and
the claim says no orbit of `Φ` started from a finite word stays inside the
clopen set where the black-time identity holds.

**Falsification.** Three sweeps, each running every candidate until its
first failure and counting the black-time tests passed.
`explorer/periodicleft.mjs`: every pattern of period `p ≤ 16` (all
phases), left words of length `m ≤ 4`, cap 4,000 rows. Every candidate
with at least one black cell fails; the deepest failure is at row 121
(`p = 13`, `m = 4`, a single pulse per period). The only survivors are
`c ≡ 0`, which has no black times, and those die in the right-side search
of `whiteleft.mjs` by row 5 for every `w ≠ 0` (and `w = 0` is the white
configuration). `explorer/sparseleft.mjs` (BigInt half-line): every
minimal pattern `p ≤ 20` with `m ≤ 1` (3.4 million candidates), single
pulses to `p = 240` with `m ≤ 10` (1,023 words per period), two pulses to
`p = 40` with `m ≤ 8` (198,645 candidates); no survivor to the cap of 200
tests. The largest number of tests passed is 21 (`p = 17`, dense), 19
(single pulse, `p = 155`, `w = 11001`), 19 (two pulses, `p = 26`). Kernel:
`scratch_blacktime.lean` decides that every pattern of period `≤ 5` with
every left word of length `≤ 2` fails by row 40, that is, **no
configuration white on `x ≤ -3` has a column 0 periodic from time 0 with
period at most 5, whatever its right half.** **Survives**, at the depths
stated. What else could produce it, and this is the important paragraph:
the per-test pass rate is `0.50` at every test for every `p ≥ 8`, and the
maximum tests passed sits at or just under `log₂(candidates)` in every
family, which is exactly what a fair coin per black time predicts. So the
sweep is consistent with the claim and equally consistent with "periodic
boundaries fail for no reason at all, just as random ones do", and a
counterexample at large `p`, if one exists, would be a structured
survivor that a coin model assigns probability `2^{-(tests)}`; the sweep
cannot see structure, only its absence. Also the sweep covers columns
periodic from time 0 with a short left word; an eventually periodic
column with a long transient corresponds to a left word as long as the
transient, beyond `m ≤ 10`.

**Novelty.** The statement is Kopra's Problem 4.8 generalised to `N(2)`,
which he raises in words and does not state; in the black-time form it is
not in Kopra 2022, Jen 1990 (Prop. 3 is width 2 for finite initial
conditions), or Rowland 2006 (nothing on boundaries; searched "boundary",
"half", "driven"). Wolfram 1986 §6 discusses the left-hand periods of the
seed, not a driven half-line. New as stated; not a result.

**Route.** No route. It is the wall in a different coat. What the coat
buys: the periods of the left diagonals of the half-line picture are
powers of two for every boundary (the recurrence is
`evolve_left_diagonal_recurrence`, whose base cases hold for any
number-like configuration), and never involve `p`; so the settled region
is 2-adic and the boundary is `p`-periodic, and one might hope the clash
is visible when `p` is odd. The single-pulse sweep shows no dependence of
the tests passed on the parity or 2-adic valuation of `p`
(`p = 2, 4, 8, 16, 32, 64, 128 ↦ 9, 8, 7, 10, 9, 13, 8` tests; odd
`p = 155 ↦ 19`). Recorded so the next theorist does not test it again.

### C4. Finite exclusions for number-like configurations

**The claim.** For every `p ≤ 5` and every left word of length `≤ 2`, no
configuration white beyond the word has column 0 periodic with period `p`
from time 0; the proof is `decide` over the half-line model, and it
extends to whatever `(p, m, T)` the kernel will evaluate. In vocabulary:
`∀ X : Config, (∀ i ≤ -3, X i = false) → ∀ p ≤ 5, 0 < p → ¬ ∀ t ≤ 40, column X 0 (t + p) = column X 0 t`,
provable from C2's agreement theorem plus the kernel check.

**What it would give.** Nothing toward the residual; a rung. It is the
first statement on this board that would be about every number-like
configuration rather than the single seed, and the check that C2's
definitions are the right ones. Crystal 19 (finite exclusions for the
centre column) is the seed-only analogue and needs `rowCell` at depth
1,100; this needs the half-line at depth 40 for all `2^5 · 4` candidates.

**Falsification.** `scratch_blacktime.lean`, part 3, accepted by the
kernel. Engine: `periodicleft.mjs` gives the same conclusion to `p ≤ 16`,
`m ≤ 4`, row 4,000. **Survives** (it is a computation). What else could
produce it: a half-line model in the Lean file that disagrees with
`evolveFrom`; the model was not checked against `evolveFrom` by the
kernel, only against the engine's version of the same model. A captain
seeding this should add the one-line `decide` that `halfLineLeft` on the
seed's centre column matches `rowCell t (-1)` for `t ≤ 30`.

**Novelty.** Not in any source; finite exclusions of this kind are not
published for rule 30 beyond the seed's own column (crystal 19 cites
none). Supply, not insight.

**Route.** C2's definitions, then `decide`. Hard step: the agreement
theorem between the half-line and `evolveFrom`, which is the M node in C2.

## 4. What survived

All four candidates survived their tests: C1 and C2 because they are
identities, checked to 200,000 rows and in the kernel to depth 40; C3 as a
conjecture that no periodic boundary of period at most 20 (dense) or 240
(sparse) survives, with the honest reading that its survival statistics
are those of a fair coin and so carry no evidence of a mechanism; C4 as a
kernel computation. None is a lemma a proof of the residual would cite for
its content; C2 is the one it would cite for its shape, because it is the
first exact statement of what the cone constraint does to the pair: it
deletes column 1 at black times and prescribes it at white times, leaving
a condition on column 0 and the left half-line alone. If a captain seeds
anything, seed in this order: the two definitions (`leftSolve`,
`evolveHalfLeft`) with their agreement theorems, then C2's split identity,
then C4 as a `decide` node; C1 as two S nodes after the definitions; C3 not
at all, since it is stronger than the wall and would sit beside it. The
negative result of this session is as real as the positive one: the
counting route my previous document proposed is dead (obstruction entry),
and the reason it is dead, the slow left damage front, is the same reason
the seed is loose from the left and rigid from the right.

## 5. Claims that died

- **"The number of column-1 prefixes (equivalently, of windows white on
  `x ≤ -1`) consistent with the centre column stays bounded in the
  depth."** My previous document's next-topic question. Dies at `T = 1`:
  the count for the true centre column is `1, 2, 4, 5, 10, 20, 40, 67, 89,
  178, 356, 456, 912, 1824, 3648, 7296, 14592, 29184, 26908, 53816, 107632,
  215264` for `T = 0..21` (`explorer/whiteleft.mjs`, population capped at
  200,000). It doubles because a right-side cell is invisible at the origin
  until the damage front arrives.
- **"The single seed is the only configuration white on `x ≤ -1` with the
  true centre column, at every finite depth."** Same witness; the infinite
  statement is open and is the question whether every right-side
  difference reaches the origin.
- **"The count of periodic column words with a white-left realisation is
  what matters."** Dies as a route: at `t = 10`, 20 of 1,480 periodic
  words are realisable and so are 31 of all 2,048 words
  (`explorer/numberlikewords.mjs`), so periodic words are not
  distinguished from the rest by realisability at finite depth.
- **"The distinct column words of white-left windows grow like `1.3^t`."**
  My first reading of `t ≤ 10`. Dies at `t = 22`: the counts are
  `3, 4, 6, 8, 10, 12, 15, 19, 24, 31, 38, 44, 51, 58, 66, 76, 86, 100,
  113, 126, 137, 153` for `t = 1..22`, a factor 15 over 17 steps, fitting
  a rate near `2^0.24` as well as a low power of `t`.
- **"Sparse periodic boundaries beat the coin."** Dies: single pulses to
  `p = 240` pass at most 19 tests with 1,023 words per period and 239
  periods, which is the coin's own expected maximum.
- **"The 2-adic clash: the tests passed depend on the parity of `p`."**
  Dies: no dependence visible in the single-pulse table (C3).
- **"The two onset figures for the left diagonals, near `k/2` in
  `docs/obstructions.md` and `0..3` in my previous scan, contradict each
  other."** Dies: both are right at their `k`. `explorer/leftonsets.mjs`
  at 12,000 rows: onset `0..3` for `k ≤ 23`, then `0.34k`–`0.48k` for
  `k = 48..100`. The A363346 b-file gives `83` at `n = 100` against my
  `34` at `k = 100`, so it measures a different quantity, and the file's
  index alignment could not be settled from the numbers alone.
- **"The left half-line for the boundary `b ≡ true` is constant"** (my
  previous document, C1, and the obstruction entry). Dies at row 3 for the
  white-started half-line: rows 1..5 read `1`, `11`, `011`, `0011`,
  `11011` (cell `-1` rightmost). The constant left side is the fixed-point
  row's, a different initial condition; the obstruction's conclusion is
  unaffected.
- **"My pseudo-random sequences were random."** The first runs used an
  LCG whose low bit alternates and whose product overflows a JS double;
  every "random" case was a near-constant or alternating sequence. Fixed
  with xorshift32 and rerun; the bijection cases in C1 are the rerun.

## 6. Next topic

Attack the transients of the left diagonals under a periodic boundary,
because C2 and C3 together say that is where the residual now sits: at
every black time of column 0, column -1 is prescribed, and column -1 at
time `t` is the index-1 cell of left diagonal `t - 1`, which by the onset
recount is inside the transient of every diagonal past `k = 17`. The
walls `leftDiagonal_onset_le` and `leftDiagonal_period_le` are about the
length and period of the settled part; nobody has a statement about the
content of the unsettled part, and the half-line picture is the right
place to look for one, because there the boundary is a free parameter and
the diagonal recurrence `evolve_left_diagonal_recurrence` still holds for
every cell at `x ≤ -1`. The concrete question: for the half-line grown
from a white start with boundary `c`, write the index-1 cell of diagonal
`k` as a function of `c (0..k)`; measure how many of those `k + 1` bits it
actually depends on and whether the dependence on `c k` is affine (it is
the leftmost input of the diagonal's first step, so it should be). If
column -1 at time `t` is affine in `c t` with a coefficient that is a
function of the settled diagonals, the black-time test becomes a linear
recurrence with 2-adic coefficients against a `p`-periodic forcing, and
that is the first form of the residual anyone could compute with. Before
that, a captain should seed `leftSolve`, `evolveHalfLeft`, their agreement
theorems, and C2, so the half-line is on the board in checkable form.
