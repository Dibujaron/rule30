# Which target words the cone can see

*Talus, 2026-09-12.*

## 1. The residual, in one paragraph

**Band, said first.** Mostly **project-internal**: a criterion with a mechanism
that prices the occurrence ladder in one line, plus a correction to my own
document of this morning. One row is **known** and reported as a control —
Condrey's constant-trace maxima, reproduced exactly with his hypothesis weakened
on one side. And one is, I believe, **novel and small**: an exhaustive table of
how long a coned configuration's centre column can be periodic with period `p`,
for `p ≤ 8` and `a ≤ 12`, which is the computed part of a sufficient condition
for Prize 1. It is a table, not a theorem, and it is small; I say so below rather
than dressing it as a route.

Write `f_W(a)` for the greatest number of cells of the centre column of a
configuration whose black cells all lie at `x ≥ -a` **and which is black at
`-a`**, containing no occurrence of the word `W`. Row `a` of the seed is exactly
such a configuration — white outside the cone by
`evolve_eq_false_of_outside_cone`, black on its edge by `evolve_left_edge` — so a
finite `f_W` says the seed's centre column cannot avoid `W` for long after time
`a`, which is one rung of the occurrence ladder. The question the captain set is
which `W` the cone can see this way, because that says which rungs are worth a
session before any of them is commissioned. **The second clause of that
definition is not decoration and is where this morning's document went wrong;
see the corrections below.**

**The answer is a growth rate, and it is sharp.** Let `λ_W` be the growth rate of
the language of `W`-free words — the number of `W`-free words of length `n` grows
like `λ_W^n`, computed from `W` alone with no automaton in it. Then, over every
one of the 32 targets tested — reading "sees" as *the search terminates
exhaustively at every `a ≤ 6`*, which is a maximum rather than a bound that has
not broken yet:

> the cone sees `W` exactly when `λ_W = 1`,

that is, exactly for `W ∈ {0, 1, 01, 10}` among single words, and for the two
two-word targets `{01,10}` (a constant column) and `{00,11}` (an alternating
column). Every target with `λ_W > 1` — including `00` and `11`, both at
`λ = φ = 1.618` — escapes the search at some `a ≤ 6`, by the depth cap or the
node budget. And the mechanism is
measured, not guessed: **past radius `a` the cone supplies exactly one free bit
per row** (the next right-half cell, after which the column value is forced,
because the left cell that would otherwise flip has to be white), **so the
surviving population multiplies by `2` and is cut by the fraction `λ_W/2` of
forced values the target admits, and grows like `λ_W^k`.** The measured
population growth rate agrees with `λ_W` computed from the word alone.

**The pricing that follows, which is what the captain asked for.** Rung `L` of
the ladder asks that every word of length `L` occur. For `L = 1` both targets
(`avoid 0`, `avoid 1`) have `λ = 1` and the rung is closed already
(`centerColumn_window_not_constant`). For `L = 2` the targets `00` and `11` have
`λ = φ`, so the rung is **not** reachable word by word; what is reachable is the
*disjunction* `{00,11}`, whose `λ` is `1`, and that is exactly the alternating
target this morning's document bounded by `3a`. For `L ≥ 3` every single word has
`λ ≥ 1.755`, and no sub-target of a rung-3 statement has `λ = 1`. **So the
occurrence ladder stops at rung 2, and rung 2 only in the disjunctive form
already done.** The single-colour strengthening the previous brief hoped for —
`11` occurs infinitely often, or `00` does — is exactly the case the cone cannot
see.

**And the criterion then names the ladder that is not dead, which is the part of
this session I would actually spend money on.** "The centre column is periodic
with period `p`" is a target with exactly `2^p` points, so its language has `2^p`
words of every length and **`λ = 1` for every `p`**: the criterion says the cone
sees every rung of it. It does. Writing `f(p,a)` for the longest period-`p` block
of the centre column of a configuration white at every `x < -a` and black at
`-a`, the search terminates — *exhaustively, not to a cap and not to a budget* —
at **every one of the 96 cells `p = 1…8`, `a = 1…12`**, with `f ≤ 27` throughout
and `f(1,a) = a + 2` exactly, which is Condrey's own `w+2`. And this ladder is
not an analogy for P1, it **is** P1:

> if `f(p,a) < ∞` for every `p` and every `a`, then Prize 1 holds.

One line, from two closed nodes: if the seed's centre column were periodic with
period `p` from time `N`, row `N` of the seed is white at every `x < -N`
(`evolve_eq_false_of_outside_cone`) and black at `-N` (`evolve_left_edge`), so it
sits in the class and has a period-`p` column for ever, making `f(p,N)` infinite.
So the finite table above is the computed part of a **sufficient condition for
Prize 1**, in the vocabulary the cone already speaks — which is exactly the shape
the wall's own description asks a proposal to have.

**Two corrections, and the first is to my own document of this morning.**
`talus10`'s search class was "white at every `x < -a`", and that class contains
the **zero configuration**, whose centre column is white for ever. So `f_W` is
infinite there for every `W` that is not a block of zeros, for a reason that has
nothing to do with rule 30, and §3.2 of `docs/attacks/2026-09-12-rung-2-*.md`
is wrong where it reads the constant-target control's collapse to "exactly one
survivor" as *"Condrey's rigidity, reproduced by this instrument, and it is what
a route looks like"*. The one survivor is the zero configuration; I printed its
row-0 window and it is all white. A collapse to one survivor whose `f` is
infinite is the *opposite* of what a route looks like — the route needs
extinction, which is what the alternating target does and the constant target,
in that class, does not. The count/rigidity verdict of that document is
unaffected, and its numbers are all reproduced here; the reading of that one
control is inverted.

**And the second correction answers the brief's second question outright.** The
`00`-free anomaly — "finite exhaustively at 16, 16, 27, 31 for a reason nobody
has identified" — has a reason, and it is the same one: `0`, `00`, `000`, `0000`
are the only words whose avoidance excludes the zero configuration, so they are
the only words that could have come out finite in that class at all. `00` is not
an anomaly, it is one of the two cases (`0` and `00`) where excluding the zero
configuration happened to be enough. In the corrected class it goes the other
way with everything else of positive entropy.

**The brief's two things to look for, plainly.** *The plateau:* the alternating
maxima have **no closed form**, and **I did not reach `a = 34`** — this session
re-derived the published values exhaustively to `a = 25`, 25 of the 26, and
stopped nine short of what the brief asked. But the criterion supplies the reason
a closed form should not be expected, which is worth more than a longer table
would have been: the alternating target sits exactly at `λ = 1`, the criterion's
critical point, so `f_alt(a)` is the extinction depth of a population whose
expected growth rate is exactly `1`. A quantity at criticality fluctuates rather
than closing, and the irregular plateaus `8,8,8,8,9,10,10,17,…` are what that
looks like. So the count is the whole story, and the criterion names the number
that makes it one. *And "does RIGID coincide with the target making column 1
monotone?":* **no**, and the counterexample is the best-behaved target on the
board. `avoid 0` — an all-black column — has **no white times at all**, so
`white_run_monotone`'s latch never arms, and it is nonetheless bounded by `f ≤ a`
and tight at every odd `a`. Its mechanism is the checkerboard collision with the
cone's two black cells, not the latch. Two different mechanisms produce two seen
targets; `λ = 1` covers both and the latch covers one.

## 2. Why the known routes fail

Every entry below bears on this topic; the rest of `docs/obstructions.md` does
not.

- **"The cone bounds an alternating block and not a single-colour one"**
  (2026-09-12, mine). Its conclusion survives and is now explained rather than
  measured: the single colour is unreachable because `λ_{11} = λ_{00} = φ > 1`,
  not merely because a search hit its cap. Its own §"what it would take" asked
  whether the two-step map `col1(2m) ↦ col1(2m+2)` is rigid; that question is
  untouched here and is still the only crack.
- **"An eventually periodic centre column does not force another periodic
  column"** (2026-09-08, mine) and **"the `4^-t` sparsity"** (2026-09-12,
  Sextant) both end at the same place: no statistic of the family separates the
  seed. The criterion here is a statistic of the *target*, not of the seed, so it
  does not collide with either — it says which targets are bounded over the whole
  family, which is exactly what an occurrence rung needs.
- **Crystal 40** (the centre column is a free coordinate). This is why the class
  matters so much: given any `b` there is a configuration with centre column `b`
  and a white right half, so a bound on `f_W` can only come from the *left*
  constraint. The zero-configuration failure above is crystal 40's shadow — the
  weakest left constraint admits the weakest configuration.
- **Obstruction 7 and "a universal bound on the recurrence's hitting times"**
  both killed routes whose content was "more equations than unknowns". This
  session's criterion is a count of exactly that shape and **is not offered as a
  proof**: it is offered as a *filter*, which is what the captain asked for. The
  one thing that makes it more than arithmetic is that the predicted rate is
  `λ_W` computed from the word with no rule 30 in it, and the measured rate
  matches it — so the null is built in rather than argued.
- **A route I considered and did not pursue.** One could try to prove
  `f_W(a) < ∞` for a `λ_W = 1` target by showing the surviving set is a
  *rigidity* (collapses to one configuration) rather than a count. That is
  Condrey's mechanism and it does work for the constant target; claim C4 below
  shows it does not transfer to the alternating one, which is this morning's
  result restated with the correction applied.
- **The new dead end, appended to `docs/obstructions.md` as *"The cone sees
  exactly the zero-entropy targets, and the class that forgets the cone edge sees
  everything"*.** It records two things: the class hazard (a search class that
  only bounds the left support contains the zero configuration, so every
  occurrence target that is not a block of zeros is unbounded there for free) and
  the pricing (an occurrence-rung proposal above rung 2 is refuted in advance).
  It also carries the correction to the entry above it, in that entry's own
  terms, as the format requires.

## 3. Candidate claims

Four claims, C1 to C4, with a correction and a control interleaved where they are
needed rather than at the end — the correction because C1 does not make sense
until the class error is on the table, the control because it is what makes C1's
instrument believable.

Four *classes* are used throughout, each the seed's own row `a` with one more
closed node cited about it. Every one of them contains row `a` of the seed, so
every bound below is a bound a proof could aim at.

| | what it fixes | cited from |
|---|---|---|
| `A1` | white at every `x < -a` | `evolve_eq_false_of_outside_cone` |
| `A2` | `A1` + black at `-a` | `evolve_left_edge` |
| `A3` | `A2` + black at `-(a-1)` | `evolve_left_second_diagonal` |
| `A5` | `A3` + the third, fourth and fifth diagonals | `evolve_left_{third,fourth,fifth}_diagonal` |

`A2` is the weakest of these that excludes the zero configuration, which is the
whole difficulty; `A1` is what `talus10` searched.

### C1 — the cone sees exactly the zero-entropy targets

**The claim.** In English: the cone bounds the `W`-free blocks of a coned
configuration's centre column exactly when the `W`-free words grow polynomially
rather than exponentially. Precisely, let `λ_W` be the growth rate of the
language `{ v : v contains no occurrence of W }` — a number computed from `W`
alone, with no automaton in it. Then `f_W(a)` is finite for every `a` exactly
when `λ_W = 1`.

In the project's vocabulary the object is: for `X : Config` with `X x = false`
for every `x < -a` and `X (-a) = true`, the greatest `L` such that the word
`(column X 0 0, …, column X 0 (L-1))` has no factor equal to `W`; and `f_W(a)`
is the supremum over that class. The definition the board lacks is the factor
relation on a finite prefix of a column — everything else is `column`,
`evolve` and the cone.

**What it would give.** It prices the occurrence ladder outright. Rung `L`
("every word of length `L` occurs in the centre column, infinitely often")
needs `f_W` finite for all `2^L` words of length `L`.

- `L = 1`: both targets are `λ = 1`, and the rung is already closed —
  `centerColumn_window_not_constant`.
- `L = 2`: `01` and `10` are `λ = 1`, but `00` and `11` are `λ = φ = 1.618`. So
  the rung is **not** reachable word by word. What is reachable is the
  disjunction — the two-word target `{00,11}`, an *alternating* column, which is
  `λ = 1` — and that is exactly this morning's `f ≤ 3a`. The single-colour
  strengthening the previous brief wanted is precisely the unreachable half.
- `L ≥ 3`: a rung-3 failure means one particular word of length 3 is missing,
  and each of those eight targets has `λ ≥ 1.755`. **Unreachable**, and there is
  no disjunctive escape: unlike `L = 2`, where rung 1 applied twice collapses the
  four targets to the single `λ = 1` target `{00,11}`, nothing collapses eight
  positive-entropy targets into a zero-entropy one.

So the ladder stops at rung 2, in the disjunctive form already done.

**Falsification.** `explorer/talus11_cone.mjs` and `explorer/talus11_seen.mjs`,
every word of length `1..4` (30 words) plus the targets `{01,10}` and `{00,11}`,
`a = 1..6`, in `A1`, `A2`, `A3` and `A5`; depth cap 40, node budget `1.5·10^6`,
the search aborting the moment any configuration reaches the cap so the budget
is spent on the finite cases. `explorer/talus11_deep.mjs` computes `λ_W` for all
32 targets by transfer matrix, cross-checked against an exact count of the
`W`-free words of length 12.

*Survives.* The set of targets whose search is **exhaustive at every `a ≤ 6`** is,
in `A2` and again in `A3`, exactly

> `{ 0, 1, 01, 10, {01,10}, {00,11} }`,

and that is exactly the set with `λ_W = 1`. The values, `a = 1..6`:

| target | `λ` | `A2` | `A3` |
|---|---|---|---|
| `0` | 1 | 1, 4, 3, 6, 5, 8 | 1, 1, 3, 3, 5, 5 |
| `1` | 1 | 3, 3, 5, 5, 7, 7 | 0, 2, 5, 4, 7, 6 |
| `01` | 1 | 3, 7, 9, 9, 8, 10 | 3, 6, 6, 8, 8, 10 |
| `10` | 1 | 4, 8, 8, 7, 8, 10 | 1, 4, 8, 7, 8, 8 |
| `{01,10}` | 1 | 3, 4, 5, 6, 7, 8 | 1, 2, 5, 4, 7, 6 |
| `{00,11}` | 1 | 8, 7, 6, 5, 9, 10 | 3, 7, 6, 5, 6, 8 |

Every one of the other 26 targets reaches the cap or the budget at some `a ≤ 6`.
`f` is *not* monotone in `a`, and should not be: `A2(a)` and `A2(a+1)` fix the
black cell at different places, so they are disjoint classes rather than nested
ones.

*Distrust the result you like.* Four things could produce this besides the claim
being true, and each was checked.

1. *A trivial witness, as in `A1`.* Ruled out by construction in `A2`–`A5` and
   confirmed by the population signature: a trivial witness shows up as a
   population frozen at a small constant (`1` or `4`) with growth rate exactly
   `1.0000`, which is what `A1` shows for `1`, `01`, `10` and `{01,10}` and what
   `A2` and `A3` show for nothing.
2. *The counting alone, with no rule 30 in it.* This is the dangerous one,
   because the one-bit-per-row accounting uses only left-permutivity and the
   cone. Crystal 66's filter, run on my own proposal in
   `explorer/talus11_filter.mjs`: replacing `OR` by `XOR` gives rule 150, and
   `l XOR r` gives rule 90, both left-permutive, so the same solve is valid.
   **The filter fires the right way.** At `λ = 1` rule 30 goes extinct
   (`avoid 0` at depth 8, `avoid 1` at 7, constant at 8, alternating at 10,
   `avoid 01` at 10) while rules 150 and 90 stay **alive** with a frozen
   population at every one of those five targets. Above `λ = 1` all three rules
   are alive, and the two linear rules sit on `λ` exactly — `1.618`, `1.755`,
   `1.839`, `1.928` on `00`, `101`, `000`, `1111` — where rule 30 scatters around
   it (`1.752`, `1.623`, `1.862`, `1.917`). So the `λ > 1` half of the criterion
   is generic and the `λ = 1` half is rule 30's.
3. *Small `a` only.* This is a real limitation and is stated as such. `00` and
   `11` are `λ = φ` yet *are* exhaustively finite at small `a`:
   `f_{00}` is `16, 16, 27, 31` in `A1` (`a = 1..4`, reproducing `talus10`'s
   published four values exactly), `16, 15, 27, 31` in `A2` and `8, 15, 15, 31`
   in `A3`, and at `a = 5` the search no longer terminates. `f_{11}` in `A3` is
   `27, 26, 25, 24, 23` exactly at `a = 1..5`. So the criterion is about "finite
   for **every** `a`", not about each `a`: a supercritical population started
   from a small number of individuals still dies out sometimes, and the
   threshold for `00` is `a* = 5`. Above it the population is alive at depth 23
   with `4.7·10^6` survivors and growing.
4. *The decreasing arithmetic runs could be a law.* `f_{11}` in `A3` falls by
   exactly one per `a`, which would be a beautiful bound if it continued, and it
   cannot: row `a` of the seed is a member of `A3(a)`, so `f_{11}(a)` is at least
   the seed's own `11`-free block starting at time `a`, and that block reaches
   **60 cells from `t = 1,256,134`** (`explorer/talus11_seedblocks.mjs`, three
   million rows, engine checked against naive evolution over the first 400).
   The run is one configuration seen from successive rows, not a law.

**Novelty.** Nearest in print is Condrey, arXiv:2609.09431 — the constant target,
which is one of the six the criterion says is seen, and the only one in print.
Spencer 2013 Prop. 3.4 is the nearest *word-level* statement about the temporal
sequence (`10` at time `t` forces the left neighbour black, `11` forces it
white), which is `column_succ_of_black` in another dress and says nothing about
block lengths. Searched `sources/` for `forbidden word`, `forbidden block`,
`avoid`, `does not occur`, `excluded block`, `subshift of finite type`,
`zero configuration`, `quiescent`, `all-zero`, `nonzero finite`,
`topological entropy`, `growth rate`, `golden mean`, `Fibonacci`,
`occurs in the`, `occurrence of`, `block occurs`, `contains every`; every hit
inspected. The `subshift of finite type` hits are all Boyle–Kitchens on the
*spatial* subshift; the `growth rate` hits are Rowland on his `a(n)`. Nothing on
which occurrence targets the cone bounds.

**Route.** No route, and deliberately so: it is a filter for a captain, not a
lemma. What could be proved is one instance — `f_W(a) < ∞` for a single
`λ_W = 1` target — and the board already has two of the six (`avoid 0` inside
`centerColumn_black_run_lt_start`, `avoid 1` inside
`centerColumn_white_run_lt_start`).

### C2 — the survivor population grows at exactly the target's own rate

**The claim.** Past radius `a` the cone supplies **one free bit per row** — the
next right-half cell `X k`, after which the column value at time `k` is *forced*,
because the left cell that would otherwise flip it must be white. So the
surviving population doubles and is then cut by the fraction of forced values the
target admits, which is `λ_W/2` if the forced value is coin-like. Hence
`population at depth k ≍ λ_W^k`, and the search is extinct exactly at `λ_W = 1`.

**What it would give.** The mechanism under C1, and a number that prices any
future target without running the search: compute `λ_W` from the word.

**Falsification.** `explorer/talus11_pop.mjs`. Exact survivor census — exhaustive
to its own depth, never a partial level — in `A2` at `a = 6`, for all 32 targets,
depth 17 to 34 chosen per target so the tree fits in `1.5·10^7` nodes.

*Survives.* For all **26** targets with `λ > 1`, the measured growth rate over the
deepest nine levels divided by `λ` lies in `[0.925, 1.069]`, and **20 of the 26**
are within `2%` — the six outside it are `00` (`1.069`), `011` (`0.943`), `101`
(`0.925`), `0110` (`0.979`), `1011` (`0.977`) and `1101` (`0.976`). For all **6**
targets with `λ = 1` the population is extinct by depth 10. `λ` is computed from the word alone, so the agreement is a statement that rule
30's forced column value is coin-like *against the target* — the null is built in
rather than argued.

*Distrust.* The obvious alternative is that this is arithmetic true of any
left-permutive rule, and for `λ > 1` it is: rules 150 and 90 give `1.618` on
`avoid 00` where rule 30 gives `1.752`. Two honest deviations. Rule 30 runs
about `7%` *above* `λ` on `avoid 00` in `A2`, so the forced value is slightly
biased toward staying in the target rather than exactly coin-like; and at
`λ = 1` the death is far faster than the accounting predicts — a critical
population of ~`10^2` should linger for ~`10^2` levels and instead dies in one,
which is claim C4.

**Novelty.** The accounting is elementary; what is not in print is the
identification of the survivor growth rate with the target language's own growth
rate. Same searches as C1; nothing found.

**Route.** No route. The upper half (`λ > 1` ⇒ unbounded) would need a
construction, not a count: an explicit coned configuration whose column is
`W`-free forever. The census makes one look very likely and exhibits none.

### C3 — the period ladder, which is P1's own, and the cone sees every rung of it

**The claim.** Let `Σ_p` be the target "the centre column is periodic with period
`p`" — in the project's vocabulary, `PeriodicFrom (column X 0) p 0`. It has
exactly `2^p` points, so `λ = 1`, so by C1 the cone sees it at every `p`. Write
`f(p,a)` for the longest period-`p` block over the class `A2(a)`. The claim is
that `f(p,a)` is finite for every `p` and `a`, and the table of its values for
`p ≤ 8`, `a ≤ 12` is below.

**What it would give.** Prize 1, as a sufficient condition, and that is not an
analogy. If the centre column were eventually periodic with period `p` from time
`N`, then row `N` of the seed — white at every `x < -N` by
`evolve_eq_false_of_outside_cone` and black at `-N` by `evolve_left_edge` — is a
member of `A2(N)` whose centre column is period-`p` for ever, so `f(p,N) = ∞`.
Contrapositive: `∀ p a, f(p,a) < ∞` implies `¬ IsEventuallyPeriodic
centerColumn`. The converse does not hold and is not claimed: `f` is a supremum
over a family that the seed only belongs to, so this is strictly stronger than
P1, and that is the usual price of a family statement.

**Falsification.** `explorer/talus11_period.mjs` and
`explorer/talus11_ladder.mjs`. `Σ_p` is encoded as the `2^p` forbidden words of
length `p+1` whose first and last symbols differ, which is exactly
`x(n+p) = x(n)`. Depth cap 64, node budget `2.5·10^8`.

*Survives, and every cell is a maximum rather than a bound.* All **96** cells
`p = 1…8`, `a = 1…12` in `A2` terminated exhaustively — no cap, no budget:

| `p` \ `a` | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
| 2 | 8 | 7 | 6 | 6 | 9 | 10 | 10 | 17 | 16 | 15 | 14 | 15 |
| 3 | 8 | 10 | 9 | 9 | 10 | 14 | 13 | 17 | 16 | 15 | 19 | 18 |
| 4 | 8 | 10 | 10 | 11 | 13 | 14 | 14 | 17 | 16 | 19 | 20 | 20 |
| 5 | 11 | 10 | 10 | 11 | 13 | 13 | 14 | 16 | 19 | 18 | 19 | 21 |
| 6 | 15 | 14 | 14 | 13 | 13 | 16 | 16 | 18 | 19 | 19 | 26 | 25 |
| 7 | 11 | 11 | 10 | 19 | 18 | 18 | 18 | 21 | 20 | 25 | 24 | 23 |
| 8 | 13 | 13 | 16 | 18 | 17 | 16 | 18 | 17 | 23 | 22 | 27 | 26 |

`f(p,a) ≥ p` is trivial (a word shorter than `p` is vacuously `p`-periodic), so
the informative quantity is the excess `f − p`, which runs from `2` to `20` over
the table and is `≤ 2a + 8` at every cell. `f(1,a) = a + 2` at all twelve values,
which is Condrey's `w + 2` — his headline number — in a class where only the left
side is bounded. The extremal words are what one would hope: at `a = 10` the
`p = 2` optimum is `010101010101010` and the `p = 3` optimum is
`001001001001001`.

*Pushed in `p` rather than in `a`* (`explorer/talus11_uniform.mjs`, a direct
period test cross-checked against the forbidden-word encoding at 48 cells, 0
mismatches, and agreeing with the ladder table at all 48 cells the two scripts
share): exhaustive to `p = 24, 24, 23, 22, 20, 19` at `a = 1…6`. `f` grows
linearly in `p`, with least-squares slope `1.100, 1.183, 1.313, 1.274, 1.222,
1.242`, so the excess `f − p` is **not** bounded in `p`; its mean by band is
`6.44`, `7.31`, `9.00`, `9.25` over `p ∈ [1,6], [7,12], [13,18], [19,24]`. What
does hold, checked as a maximum over all **180** distinct cells measured in this
session rather than eyeballed, is `f(p,a) ≤ 2p + 2a + 2`, with tightest slack `0` at
`(p,a) = (2,1)`; `p + 2a + 8` and `1.5p + 2a + 4` also survive, `2p + 2a` (2
violations) and `3a + p` (40) do not (`explorer/talus11_check.mjs`). Those are
fits over a short range, offered as shapes for a proof to aim at and not as laws
— what the argument actually needs is only that *some* finite bound exists.

*Kernel-confirmed at four cells.* `explorer/talus11_scratch_ladder.lean` decides
`f(1,1) = 3`, `f(2,1) = 8`, `f(3,1) = 8` and `f(2,2) = 7` outright — the centre at
time `t` reads row 0 on `[-t, t]`, so a block of `L` cells is settled by the
`2^(L+a-1)` windows of `[-L, L-1]`, which the kernel enumerates. Each is a
matching pair, "no window reaches `f+1`" beside "some window reaches `f`", so
neither half is vacuous; the list model is tied to the board by
`model_agrees_with_board`, which decides that it reproduces `rowCell t 0` for
`t < 18` on the seed; and all five theorems print `[propext]` alone.
`explorer/talus11_scratch_ladder_mutant.lean` sits beside it as the demonstration
that the check can fail: it moves one claim by a single cell, Lean rejects it at
line 45 exactly where predicted, and the same file *accepts* a theorem proving
the mutated statement false rather than merely unproved.

*Distrust the result you like.* Three things, and the third is the one that
worries me.

1. *The class could be too small.* It is not: `A2` allows an arbitrary, infinite
   right half, so it is strictly larger than the finite-support configurations
   the seed's rows are, and the bound is therefore stronger than needed.
2. *The instrument could be flattering itself.* Every one of the 96 exhaustive
   cells was checked against the seed's own period-`p` block starting at time
   `a` — the seed is a member of the class, so `f` must be at least that — with
   **0 violations**; and `f(1,a)` reproduces Condrey independently.
3. *`p ≤ 8` and `a ≤ 12` is a small window, and the cost grows like `2^{p+a}`.*
   This is the real limitation and it is not fixable by spending longer. What
   makes the window worth reporting anyway is that it is **exhaustive** — a
   maximum at every cell rather than a search that has not died yet — which is
   the thing this instrument usually cannot deliver.

**Novelty.** The `p = 1` row is Condrey's theorem (arXiv:2609.09431, unrefereed,
held in `sources/`). The `p = 2` row is this morning's alternating result in a
sharper class. Rows `p = 3…8` I believe are new; the equivalence with P1 is a
routine compactness restatement and should be reported as such, not as a
discovery. Sources searched as for C1, plus `periodic with period`,
`eventually periodic` and `temporal sequence` — 132 hits over seven files, every
one inspected by file. Rowland 2006 is the only source that bounds a column's
period at all, and his columns are those of `f^t R` for a *ring* `R` (his Lemma 2
and §2, "column `m` of `f^t R` is periodic with period length dividing `l(k)`"),
a class with no cone in it; his line 831 is about the left *diagonals*. Jen 1990
and Kopra 2022 both bound **pairs** of columns and neither bounds a single
column's periodic blocks. Nothing bounds the length of a period-`p` block of the
centre column of a coned configuration.

**Route.** The natural one, and it is the first route this session produces
rather than prices: prove `f(p,a) ≤ g(p,a)` for a fixed small `p` by the
mechanism that already works at `p = 1`. The board has both `p = 1` halves —
`centerColumn_black_run_lt_start` (tight at every odd `a`, reproduced here) and
`centerColumn_white_run_lt_start` — and `p = 2` has
`column_alternating_of_black_run` and `column_black_run_of_alternating` waiting
for it. The hard step is the one this morning named and did not solve: at `p = 1`
the latch `white_run_monotone` is armed at every step, and at `p ≥ 2` it is reset
at every black time.

### Not a claim but a correction — `talus10`'s class contains the zero configuration

**The claim.** The class "white at every `x < -a`" contains the zero
configuration, whose centre column is white for ever, so `f_W(a) = ∞` there for
every `W` that is not a block of zeros. The only single words that could have
come out finite in that class are `0`, `00`, `000`, `0000`, and only the first
two did.

**What it would give.** It corrects §3.2 of
`docs/attacks/2026-09-12-rung-2-*.md` and explains the `00`-free anomaly that
this topic was set to explain.

**Falsification.** `explorer/talus11_cone.mjs` §[W]. For `avoid 1`, `avoid 11`,
`avoid 101` and `avoid 1111` at `a = 4` the deepest column found is all white and
the configuration realising it is all white — printed, not inferred. For the
constant target at `a = 5` the population runs `2 4 8 16 32 64 63 1 1 1 …`,
collapses to `1` at depth 7 and stays `1` to depth 40, and the survivor's row-0
window over 121 cells is printed and is all white. In `A1` at `a = 6` the same
signature appears for `avoid 1`, `avoid 01` and the constant target (population
frozen at `1`) and for `avoid 10` (frozen at `4`), while `avoid 0` and the
alternating target go extinct — which is why those two were the only `A1`
finites.

*Distrust.* The one reading that would rescue the old framing is that "collapse
to exactly one survivor" is Condrey's rigidity even when the survivor is the zero
configuration. It is not, for a reason that does not depend on taste: Condrey's
theorem is that **no nonzero** configuration has a constant trace, and a class
whose only survivor has `f = ∞` gives no bound at all. Extinction is what a route
needs and the alternating target is the one that does it.

**Novelty.** Not a claim about rule 30; a claim about a search class. Nothing to
search.

### Not a claim but a control — Condrey's two maxima do not depend on the right half

**The claim.** Condrey's sharp constant-prefix bounds are `2⌈w/2⌉+1` when the
initial centre is white and `2⌊w/2⌋+2` when it is black, for support radius `w`
— bounding the configuration on **both** sides. Measured here with the right half
completely unbounded and only the left extent `a` fixed, the same two formulas
hold exactly. So the bound is a function of the left extent alone.

**Falsification.** `explorer/talus11_cone.mjs` §[C], `a = 1..10`, exhaustive.
`avoid 0` (an all-black column) in `A1` gives `2, 4, 4, 6, 6, 8, 8, 10, 10, 12`,
which is `2⌊a/2⌋+2` at all ten values. `avoid 1` (an all-white column) in `A2`
gives `3, 3, 5, 5, 7, 7, 9, 9, 11, 11`, which is `2⌈a/2⌉+1` at all ten values.
The two formulas land in *different* classes, and correctly: an all-black column
excludes the zero configuration by itself, so `A1` suffices there, while an
all-white column needs `A2` to exclude it.

*Distrust.* A formula matching at ten values is worth little on its own, so two
theorems were used as controls instead. In `A3` the all-black target returns
`1, 1, 3, 3, 5, 5, 7, 7, 9, 9`, which is inside
`centerColumn_black_run_lt_start`'s `run ≤ a` and **tight at every odd `a`** — the
instrument reproduces a closed node exactly, and is slack where that node's proof
is slack. And every accepted node of every search in this session had its centre
cell re-derived by direct evolution from the configuration: 52,502 nodes, 0
disagreements. Separately, 119 exhaustive cells were checked against the seed's
own `W`-free block starting at time `a` — the seed is a member of every class, so
`f` must be at least its block — with **0 violations**.

**Novelty.** Known: this is Condrey's theorem, in an unrefereed preprint held in
`sources/`, with the hypothesis weakened on one side. Report it as a control, not
a finding.

### C4 — at `λ = 1` the survivors die simultaneously, not gradually

**The claim.** The extinction that bounds a `λ = 1` target is not a random walk
hitting zero. The whole surviving set dies at one level.

**What it would give.** If true it says there is a shared obstruction — an
invariant every survivor violates at the same depth — which is the shape a
*proof* has, and it is a different shape from Condrey's collapse-to-one. It would
reopen, in a new form, the question this morning's document closed as "a count".

**Falsification.** `explorer/talus11_filter.mjs` §[S], full population traces,
rule 30, class `A1`, and the census traces in `talus11_pop.mjs`. The alternating
target:

| `a` | `f` | trace | survivors on the last level |
|---|---|---|---|
| 6 | 10 | `2 4 8 16 32 64 128 97 120 99 0` | 99 |
| 8 | 17 | `2 4 … 512 301 24 20 40 80 160 52 104 0` | 104 |
| 10 | 17 | `2 4 … 2048 1863 3378 6100 8463 4651 104 0` | 104 |
| 12 | 17 | `2 4 … 8192 9888 9343 4651 104 0` | 104 |
| 14 | 20 | `2 4 … 32768 31869 29704 19316 9832 16080 0` | 16080 |

and the all-black target is starker still: its population is **exactly `2^k`**
with no deaths at all until the whole level dies at once — `1 2 4 … 128 0` at
`a = 6`, `… 32768 0` at `a = 14`. There, the simultaneous death is not a
conjecture: it is `centerColumn_black_run_lt_start`'s checkerboard collision with
the cone's two black cells, a closed node, and **every** configuration in the
class has an all-black column of exactly the same length. So at least one
`λ = 1` target's extinction is provably a single shared obstruction rather than a
count, and the board already owns it.

*The plateau, which the brief asked about separately.*
`explorer/talus11_plateau.mjs` re-derived the alternating maxima from scratch,
from code that shares only its geometry with `talus10_alt.mjs`, and reproduced
the published `8,8,8,8,9,10,10,17,17,17,17,17,17,20,22,26,26,26,36,…` exactly at
**every `a ≤ 25`** — 25 of the 26 published values — with the cost per `a` printed so the next reader
can price the next value: under `0.1 s` to `a = 15`, `0.6 s` at `a = 18`, then
`190.7 s` at `a = 19` where `f` jumps to 36, and `281`–`381 s` for each of
`a = 20…25`, the node count creeping from `1.06·10^9` to `2.21·10^9` over that
stretch rather than doubling.
**I did not reach `a = 34` and no closed form appeared** — the jumps at
`5, 6, 8, 14, 15, 16, 19` have none I can see, and Condrey's constant-word maxima
do. What the criterion supplies in place of a longer table is a reason not to
expect one: the alternating target sits at `λ = 1` exactly, so `f_alt(a)` is an
extinction depth of a population whose expected growth is exactly `1`, and a
quantity at criticality fluctuates rather than closing. That is a better answer
than another eight values would have been, and it is the one the brief asked to
be given plainly.

*Distrust, and this is still the weakest claim in the document.* For the
alternating target the counting null would put 99 simultaneous deaths at `2^-99`,
and that null is wrong: the survivors on a level share almost all of their
configuration and differ only in the last few right-half cells, so correlated
death is unsurprising. What would settle it is the *identity* of the obstruction,
which the all-black case has and the alternating case does not. The `104` at
`a = 8, 10, 12` — the same number three times, with the same `f = 17` — is the
same coincidence this morning's document recorded and could not explain, and I
still cannot.

**Novelty.** Not searched; it is a statement about a search, not about the
literature.

## 4. What survived

C1, C2 and C3 survived falsification and the novelty search. C1 and C2 are one
thing — a criterion with a mechanism — and I would seed **neither**, because
neither is a theorem and their value is as a filter. **C3 is the one I would
seed, and it is the only thing here that is a route rather than a price.** The
statement to seed is the smallest open rung of the period ladder:

> for every `a ≥ 1`, a configuration white at every `x < -a` and black at `-a`
> has no period-3 block of its centre column longer than `f(3,a)`,

with `f(3,·) = 8, 10, 9, 9, 10, 14, 13, 17, 16, 15, 19, 18` measured exhaustively
for `a ≤ 12`. `p = 1` is Condrey's and half of it is already on the board;
`p = 2` is this morning's; `p = 3` is the first rung nobody has, it is a
combinatorial lemma about rule 30 rather than a restatement, and — unlike the
four sufficient conditions crystal 72 fences off — it satisfies that fence's
third clause outright, being a strictly smaller object: two quantifiers, a
bounded target with `2^3` points, and a finite exhaustive table to check a proof
against at every `a ≤ 12`.

The Condrey row is a control, not a finding, and should be reported as his. The
class error is a correction and belongs in `docs/obstructions.md`, which is where
I have put it. C4 is an observation I do not trust enough to build on and have
said so twice.

The honest summary for a captain, which is what the topic asked for. **The
occurrence ladder is priced and it is short.** Rung 1 is closed. Rung 2 is
reachable only as the disjunction, which this morning's document already
delivered as `f ≤ 3a` measured to `a = 26`. Rung 3 and above are refuted in
advance — every sub-target has `λ ≥ 1.755`, and the cone supplies one bit per row
against `log₂ λ ≥ 0.81` bits of target freedom. **No session should be spent on
an occurrence rung above 2.** What should be spent instead is a session on the
*period* ladder, which is the same instrument aimed at the targets the criterion
says are reachable, whose rungs compose into Prize 1 rather than into a
combinatorial curiosity, and whose first eight rungs are already measured
exhaustively.

## 5. Claims that died

- **"`f_W(a)` is a meaningful classification in the class `white at x < -a`."**
  Mine, this morning, and the premise of this topic. Dies at the zero
  configuration, which is in that class and has `f_W = ∞` for every `W`
  containing a `1`. Depth: immediate; the witness is printed.
- **"The constant target's collapse to exactly one survivor is Condrey's
  rigidity and is what a route looks like."** Mine, §3.2 of this morning's
  document. Dies on printing the survivor: it is the all-white configuration, so
  `f = ∞` and the collapse bounds nothing. The count/rigidity verdict of that
  document stands; the reading of the control is inverted.
- **"The `00`-free finiteness in `A1` is an anomaly with no explanation."** The
  topic's own framing and mine. Dies with the above: `0` and `00` are two of the
  four words whose avoidance excludes the zero configuration, and the only two
  short enough for the exclusion to bite.
- **"RIGID coincides with the target making column 1 monotone."** The topic's
  first thing to look for. Dies at `avoid 0`: an all-black column has **no white
  times at all**, so `white_run_monotone`'s latch never arms, and it is
  nonetheless the most tightly bounded target on the board (`f ≤ a`, tight at
  every odd `a`, `centerColumn_black_run_lt_start`). Its mechanism is the
  checkerboard collision with the cone's two black cells, not the latch. Two
  different mechanisms produce two seen targets and the criterion covers both.
- **"`f_{11}(a) = 28 - a`."** Mine, from five consecutive exact values in `A3`.
  Dies against the seed itself: row `a` of the seed is in `A3(a)` and the seed's
  own `11`-free block reaches 60 cells, so the run cannot continue. It is one
  configuration read from successive rows.
- **"The criterion might be a fact about left-permutivity rather than about rule
  30."** Mine, and the thing I most expected to have to concede. Dies the useful
  way: under `OR → XOR` the `λ = 1` targets stay **alive** for rules 150 and 90
  and die for rule 30, at all five targets tested.
- **"The excess `f(p,a) − p` is bounded in `p`, so the period ladder collapses to
  `f ≤ p + g(a)`."** Mine, written into §6 from the `a = 1` row, where the excess
  sits in `[2, 10]` over `p = 1…24` and looks flat. Dies on the arithmetic I had
  not done: the band means are `6.44, 7.31, 9.00, 9.25` over
  `p ∈ [1,6],[7,12],[13,18],[19,24]` and the least-squares slope of `f` in `p` is
  `1.100, 1.183, 1.313, 1.274, 1.222, 1.242` at `a = 1…6`, so the excess grows.
  The conclusion survives in a weaker shape (`2p + 2a + 2`, 0 violations at 180
  cells) and the
  P1 implication needs no shape at all, only finiteness. Caught by computing the
  max and the fit over the whole range instead of reading the first row — which
  is the rule my own notebook already carries, broken again and caught inside the
  session this time.
- **"The measured/λ ratios lie in `[0.925, 1.020]`."** Mine, written into C2 from
  a table **sorted by `λ`**, whose very first `λ > 1` row is `00` at `1.069` — the
  largest value in the column and the one I read past. The true range is
  `[0.925, 1.069]`. Same error as the one above and the same fix: take the max,
  do not read the column. It is the third time in three sessions I have eyeballed
  an extremum off the end of a table.
- Nothing died for lack of depth. Every death above has a witness computed rather
  than searched for.

## 6. Next topic

**Rung 3 of the period ladder: prove that a configuration white at every
`x < -a` and black at `-a` has no period-3 block of its centre column longer
than some explicit `g(a)`.** It should be attacked next because it is the first
rung of *Prize 1's own ladder* that nobody has — `p = 1` is Condrey's and half of
it is on the board as `centerColumn_black_run_lt_start` and
`centerColumn_white_run_lt_start`, `p = 2` is this morning's alternating result —
and because, unlike the four sufficient conditions crystal 72 fences off, it
passes that fence's third clause outright: it is a strictly smaller object, with
a bounded target of `2^3` points, two quantifiers, and an exhaustive table
`f(3,a) = 8, 10, 9, 9, 10, 14, 13, 17, 16, 15, 19, 18` for `a ≤ 12` that a
candidate proof can be checked against at every cell rather than at a limit. The
machinery it would cite is already closed: `column_alternating_of_black_run` and
`column_black_run_of_alternating` for the `p = 2` half, `sideways_inverse` and
`leftSolve_eq_column` for the solve, `evolve_left_edge` and
`evolve_left_second_diagonal` for the class. The one hard step is the one this
morning named and did not solve — at `p = 1` the latch `white_run_monotone` is
armed at every step, and from `p = 2` on it is reset at every black time — and
the new datum for whoever takes it is that at `λ = 1` the whole surviving set
dies on one level rather than decaying, which for `p = 1` is provably a single
shared obstruction (`centerColumn_black_run_lt_start`'s checkerboard collision,
with the population exactly `2^k` and no deaths at all until every configuration
dies at once) and for `p ≥ 2` has no identified cause. **And the reason to want the
rung rather than to admire it: the ladder looks like it collapses to a single
inequality.** Pushing `p` at fixed small `a` (`explorer/talus11_uniform.mjs`,
exhaustive to `p = 24, 24, 23, 22, 20, 19` at `a = 1…6`), `f` grows linearly in
`p` with slope `1.10` to `1.31`, and **`f(p,a) ≤ 2p + 2a + 2` holds at all 180
distinct cells measured in this session**, tight at `(p,a) = (2,1)`.
That is a fitted shape over a small range and must not be built on as a law; what
matters is that *some* finite bound in `p` and `a`, of any shape, implies
Prize 1. Establishing or breaking it is the companion measurement, and it is
cheap at small `a`.
