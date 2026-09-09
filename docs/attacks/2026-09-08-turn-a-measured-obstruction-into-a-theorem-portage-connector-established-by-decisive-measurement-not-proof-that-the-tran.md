# Attack: the free companion of `centerColumn_other_of_cohomologous_column`

*Is there any `x ≠ 0` and `j` for which `t ↦ centerColumn t XOR evolve (t + j) x`
is eventually periodic?* — turning Portage's measured non-cocycle into a
theorem, or saying precisely why it resists.

Sextant, 2026-09-08.

Everything called a *theorem* below was accepted by `lake env lean` on a
scratch file under `explorer/`, with the axioms printed; everything else is a
measurement with its script, its depth and its null model named.

---

## 1. The residual, in one paragraph

Time runs down the picture. The centre column is the vertical line through the
origin; column `x` is the vertical line `x` cells to its side; the topic's
object is the cell-by-cell XOR of the two with the second line slid `j` rows
up, `d(t) = c(t) XOR cell(t + j, x)`. The board already proves what that
difference is *for*: if `d` repeats and the centre column repeats, then column
`x` repeats on its own (`centerColumn_other_of_cohomologous_column`), and Jen's
theorem forbids two columns repeating — so **a single periodic difference would
prove the first prize conjecture**. The topic's statement is the denial: no
`x ≠ 0`, no `j`, no period. It is not the residual and is not equivalent to it.
What it is, exactly: the residual asks whether a *line* of the picture can
repeat; the difference statement asks whether two lines can agree *up to a
repeating correction*, i.e. whether the seed's picture is a bounded-period
perturbation of a shifted copy of itself, read down one vertical. In the damage
language the board already uses, `cell(t + j, x)` is the centre column of the
picture grown from row `j` slid `x` cells sideways — a second finite
configuration — so `d` is **the centre column of the damage pattern between two
rule 30 pictures**, and the statement is that no such damage column is
eventually periodic. That is where it lives and that is why it is hard: the
centre column sits in the *interior* of the damage cone, and nobody can control
a damage pattern's left front (crystals A3, obstruction 6).

---

## 2. Why the known routes fail

**Obstruction 1 (the diagonal structure never reaches the centre column)**
applies verbatim and needs no restatement: `d` is read at the origin, index 0
of diagonal `t`, which is inside the transient of every diagonal it belongs to.

**Obstruction 3 (counting the right sides)** applies in a sharper form here. A
sweep can only ever fail to find a witness, and the near-witnesses are
*unbounded*: the family `x = j = L` has `d = 0` on `[0, m(L))` with `m(L)`
growing without bound as `L` runs through the powers of two (§3.5), so at any
depth there are pairs whose difference has
been zero for longer than any bound you fixed in advance. Falsification here is
one-sided in the strong sense: no computation distinguishes a long near-witness
from a witness.

**Crystals A3 and obstruction 6 (the left damage front).** Reduce the weakest
case — `d` eventually *zero* — as far as it goes and you land exactly on A3.
`d = 0` from row `N` says the finite configurations `A = evolve N` and
`B = (row N+j slid x cells)` have the same centre column for ever; the two are
distinct whenever `(j, x) ≠ (0, 0)` (their cone edges are at different places,
which is a three-line argument from `evolve_left_edge` / `evolve_right_edge`);
and the only tool that forces two distinct configurations apart at the origin
is "the damage reaches the origin", i.e. a bound on the left front, which A3
says is not available, the worst case being speed exactly 1. There is one
escape and it is narrow: when `x = j` the two configurations share their right
edge, so their rightmost difference lies *left* of the origin and
`rightmost_difference_moves_right` carries it into the origin at a known row —
that is exactly the board's `rightDiagonal_first_failure`, and it only works
from row 0, because past the agreement depth `m(L)` (which is 24 at `L = 256`,
and logarithmic in `L`) the rightmost difference sits right of the origin and
marches away (§3.5).

**Kopra's Lemma 3.2, and the board's `evolve_period_sub_one`: no difference
analogue exists.** This is the only proved mechanism anywhere near the topic.
Kopra's Theorem 3.5 (width-2 traces are never eventually periodic, for any
configuration white far to the left) is proved by Lemma 3.2: a periodic
width-`w` trace forces the trace one column left to be periodic, with *no*
growth of the preperiod for a left-permutive rule; iterate leftward and the
left-spreading property is contradicted. The board's `evolve_period_sub_one`
is the same lemma for rule 30. Both are statements about *columns*. The
difference statement needs them for *differences of columns*, and there is no
such lemma: §3.2 is a theorem that the difference of two pictures is not a
dynamical object at all. That is Portage's measured "the transient part is not
a cocycle", in the form that kills the route for everyone rather than for us.

**Portage 3.5 (the observable is at depth `t`).** Every cocycle, coboundary,
Toeplitz or odometer argument needs a fixed continuous observable; the centre
column at time `t` reads depth `t`. His analysis is unchanged by anything here
and I did not re-run it.

**New dead end: the separation route** — appended to `docs/obstructions.md` as
its last entry, "The centre column does not separate finite configurations: the
right-edge shield". The natural way to close the `d = 0` case is to prove that the
centre column *separates* finite configurations, so that `A` and `B` above must
be equal. That statement is **false**, and provably so (§3.3): the seed and the
seed with one extra black cell at position 1 have the same centre column at
every time, and so do infinitely many other finite configurations. Any route
through "recover the configuration from its centre column" is dead before it
starts — which also means the difference statement cannot be reduced to a
uniqueness property of columns.

**Considered and not a route: assuming the prize.** A proof of the topic's
statement may assume the centre column is aperiodic, for free (§3.1). This is a
licence, not a failure, and it says where the statement's content lives: in the
world where P1 is true, which is the world everyone believes we are in.

**The question the topic asks to answer plainly.** Is the difference statement
as hard as the residual, and is there a reduction? The honest answer: **they
are not equivalent, and the only proved relation runs one way.** `¬P1 ⟹ (the
difference statement)`, kernel-checked in §3.1; equivalently `P1 ∨ (the
difference statement)` is a theorem of the board today. Nothing reduces the
residual to the difference statement or back. On hardness my judgement, which
is an argument and not a proof: the difference statement is *harder* than the
residual to attack, because the residual at least has equivalent
reformulations with structure to grip (the half-line pair, the cone
constraint), while the difference statement's weakest instance — two adjacent
columns equal from some row on — already needs a left-front bound, and its
strongest available tool, Kopra's Lemma 3.2, provably does not transfer.

---

## 3. Candidate claims

### 3.1 If any difference is eventually periodic, the centre column is not

**The claim.** For `x ≠ 0` and any `j`, if `t ↦ centerColumn t XOR evolve (t+j) x`
is eventually periodic then `centerColumn` is not eventually periodic. So the
topic's statement holds automatically in the world where the prize conjecture
is false, and a proof of it may assume the prize conjecture's conclusion.

```lean
theorem sextant_center_aperiodic_of_cohomologous (x : ℤ) (j : ℕ) (hx : x ≠ 0)
    (hd : ∃ p > 0, ∃ N, PeriodicFrom (fun t => xor (centerColumn t) (evolve (t + j) x)) p N) :
    ¬ (∃ p > 0, ∃ N, PeriodicFrom centerColumn p N)
```

**What it would give.** It fixes the shape of the topic on the board: the
difference statement is a statement about the P1-true world only, and its
negation is a *proof* of P1. A captain reading five documents on this topic
should have this line on the board before any of the others, because without it
the free companion looks like a competitor to the residual when it is in fact
its shadow.

**Falsification.** Not applicable — it is a proof, three lines from
`centerColumn_other_of_cohomologous_column` and
`isEventuallyPeriodic_column_unique`, both closed nodes. Kernel-accepted,
`explorer/sextant_scratch_coboundary.lean`, axioms `propext, Classical.choice,
Quot.sound`. The thing that could have made it worthless is if the hypothesis
were vacuous in a hidden way — it is not: the hypothesis is exactly Portage's
sufficient condition, and the sweep of §3.5 says only that no small `(x, j, p)`
satisfies it.

**Novelty.** A corollary of a node closed today plus Jen's theorem; Portage 3.2
states the enabling half ("`c` eventually periodic **and** `d` eventually
periodic ⟹ column `x` eventually periodic — trivial once stated") and does not
take the contrapositive. New phrasing of a known implication, and I would label
it that way on the board. It composes with Talus's observation of the same day
(`docs/obstructions.md`, the entry before mine): given
`not_isEventuallyPeriodic_pair`, the wall
`centerColumn_other_isEventuallyPeriodic_of_center` is logically equivalent to
`¬ IsEventuallyPeriodic centerColumn`, so "a periodic difference proves P1" and
"a periodic difference brings the wall down" are the same sentence, and this
claim is the precise sense in which the free companion sits *under* the wall
rather than beside it.

**Route.** Done.

### 3.2 The difference of two rule 30 pictures is not a dynamical object

**The claim.** There is no map at all — of any radius, not even a global one —
that sends one row of the difference between two rule 30 pictures to the next.
Formally: two pairs of configurations whose differences agree at *every*
position, whose differences one step later do not.

```lean
theorem sextant_damage_not_autonomous :
    ∃ X Y X' Y' : Config, (∀ i, xor (X i) (Y i) = xor (X' i) (Y' i)) ∧
      ∃ i, xor (rule30 X i) (rule30 Y i) ≠ xor (rule30 X' i) (rule30 Y' i)
```

The witness is as small as it can be: `X` all white and `Y` black at 0 only,
against `X'` black at 1 only and `Y'` black at 0 and 1. Both differences are
the single cell at the origin; one step later the difference at the origin is
`1` in the first pair and `0` in the second, because the rule reads its right
neighbour through an `OR` and the two pairs disagree on what that neighbour is.

**What it would give.** It is the theorem the topic asks for. Portage
established by measurement that the transient part of the telescoped sum is not
a cocycle over the settled part (five configurations, 108,528 cells, held-out
prediction `0.495–0.536`); this says the underlying reason in a form that needs
no measurement and admits no exception: **damage in rule 30 is not a
cellular automaton on the damage**, so every argument that transports
periodicity, boundedness or any other property along a *difference* has to
carry one of the two pictures with it. In particular Kopra's Lemma 3.2 — the
engine of the strongest published theorem near P1 — has no difference analogue,
and neither does the board's `evolve_period_sub_one`.

**Falsification.** Not applicable; it is an existential, verified. Kernel:
`explorer/sextant_scratch_coboundary.lean`, axioms `propext, Classical.choice,
Quot.sound`. The thing to distrust here is not the truth but the *strength*: a
sceptic can say that a difference plus one of the two pictures is a dynamical
object, which is true and is exactly what the statement leaves open. Stated
sharply: the pair `(X, E)` evolves; `E` alone does not.

**Novelty.** Wolfram 1986 §5 is the difference-pattern section and treats `E`
throughout as a thing with a front and a speed, never as a system; his estimate
of `λ_L` (0.2428) explicitly abandons the assumption that the front's motion
depends only on the neighbouring values, which is this fact in statistical
clothing ("Such phenomena make the probabilities for different difference
patterns unequal, and invalidate this purely statistical approach", lines
604–608). Kopra 2022 has no occurrence of *difference*, *damage* or
*perturbation*; Rowland 2006 and Jen 1990 likewise (searched both Rowland
extractions for difference/perturb/damage/same column, Jen for
difference/damage/cohomolog/coboundar; the only Jen hits are his rule 18
linearisation). So: elementary, and as far as the held sources go, not written
down. Its value is entirely in being the statement rather than in being hard.

**Route.** Done.

### 3.3 The centre column does not separate finite configurations: the right-edge shield

**The claim.** Let `X` be a configuration with a black cell at `r`, white
everywhere right of `r`, and **white at `r - 1`** (its rightmost black cell is
isolated). Let `Y` be `X` with one extra black cell at `r + 1`, or at `r + 2`.
Then at every row `t` the two pictures agree at every position `< r + t`: the
difference never leaves a two- or three-cell strip riding the right edge. In
particular `X` and `Y` have the same centre column, for ever. Iterating the
`r + 2` form gives an infinite family: **infinitely many distinct finite
configurations have exactly the seed's own centre column.**

```lean
theorem shieldGen_same_column (hr : X r = true) (hiso : X (r - 1) = false)
    (hout : ∀ i : ℤ, r < i → X i = false) (x : ℤ) (t : ℕ) (hx : x < r + t) :
    column (addRight X r) x t = column X x t
theorem shieldGen2_same_column …                          -- the same at r + 2
def chainCfg : ℕ → Config                                 -- the seed, plus cells at 2, 4, …, 2k
  | 0 => initialConfig
  | k + 1 => addRight2 (chainCfg k) (2 * k)
theorem chainCfg_center_column (k t : ℕ) (ht : 1 ≤ t) : column (chainCfg k) 0 t = centerColumn t
theorem chainCfg_injective (k m : ℕ) (h : k < m) : chainCfg k ≠ chainCfg m
```

Why it is true, in one line: `rule30_left_local_law` (crystals A2) says a
difference at `i` spreads to `i - 1` only when the cell at `i - 1` is white,
and this difference has the picture's own black right edge on its left at every
row. The isolation hypothesis is exactly what makes the induction's base case
hold, and it is exactly right: over all 16,384 configurations with cells in
`[0, 15)` and a black cell at 0, "the rightmost black cell is isolated" and
"the centre column is unchanged" agree 16,384 times out of 16,384, in both
directions (`explorer/sextant_shieldrule.mjs`, depth 1,200).

**What it would give.** It kills the separation route (§2) outright, and it
sharpens `config_eq_of_right_and_column`: that node's hypothesis "the two rows
agree strictly right of the origin" cannot be weakened to "both rows are
finite", which is the weakening anyone attacking the `d = 0` case would reach
for first. It also says something about the prize's third question: the centre
column does not determine the configuration even inside the number-like class,
so no argument of the form "read the configuration off the column" can work.
Corollary, and it is proved rather than measured: **infinitely many distinct
finite configurations have exactly the seed's centre column** — the chain
`{0}`, `{0,2}`, `{0,2,4}`, …, each step adding a cell two past the right edge,
which stays isolated so the shield applies again (`chainCfg_center_column`,
`chainCfg_injective`). The measurement that came first, and agrees: 400 chain
members to `k = 200` at depth 1,200, `explorer/sextant_shieldrule.mjs`.

**Falsification.** The claim is proved, so what is at stake is whether the
measurement that suggested it was read correctly. `explorer/sextant_colsep.mjs`
enumerated every configuration supported in a window and sorted the centre
columns: `[0,16)`, 65,536 configurations, depth 320 — collisions, and every
colliding pair differed only at or past its own rightmost black cell.
`explorer/sextant_shield.mjs` tracked the difference pattern itself to 60,000
rows: for `B = {0,1}` and `B = {0,2}` the difference never reaches position 0
and takes exactly **two** distinct shapes in a window riding the edge, which is
what said the invariant was finite-state and provable; for `B = {0,1,2}`,
`{0,5}`, `{0,20}`, `{-1,0}` the difference reaches the origin at rows 3, 11, 39
and 1. What else could have produced the collisions: (i) the difference simply
had not arrived yet — ruled out by depth (a cell at position `k` reaches the
origin in about `4k` rows at the measured front speed, and the depths used are
20 to 75 times the window width, with the controls arriving on schedule);
(ii) a bug reading the column — the engine reproduces A051023 from the
single-cell configuration in every script; (iii) my own hope — the criterion
was *predicted* from the failed base case of the induction and then tested
against all 16,384 configurations *including* the ones expected to fail, and
the two halves came out 8,192 / 8,192 with no exception either way.

**Novelty.** The nearest statements in print are about *freedom*, not about
explicit collisions: Wolfram 1986 §4 (lines 439–443, 464–468) says the leftward
solve can be started from any pair of site values, so "an equal number of
initial configurations" evolve to any given temporal sequence — over all
configurations, with no finiteness; and lines 546–550 estimate that "about 1.2
sites suffice in principle to determine the values of all other sites". The
cryptographic literature has the same fact as a cost (Spencer 2013 §3, the
Meier–Staffelbach attack: about `n/2` coins are needed to fill in the unknown
left neighbours). What is not in either: a *proved* pair of number-like
configurations with identical centre columns, an exact criterion for when
adding a cell changes nothing, and the statement that the difference is
confined to the right edge for ever. Wolfram 1986 §5 says the opposite in
words for the generic case — "This instability implies that information on
localized changes eventually propagates throughout the cellular automaton"
(lines 563–565) — which is true of his disordered configurations and false in
the number-like class, with a proof. Searched: rowland (both extractions),
jen, kopra, kurka, wolfram-1986, spencer for *right edge / rightmost /
isolated / difference / perturb / damage / same column*.

And the two moves appear to generate the *whole* class, not merely a piece of
it. Of the 4,095 non-empty subsets `S` of `{1, …, 12}`, exactly 12 make
`seed ∪ S` share the seed's centre column to depth 3,000, and of the 65,535
subsets of `{1, …, 16}`, exactly 16 do — and in both windows the set found is
*exactly* what the two proved moves generate (the chain
`{2}, {2,4}, …` and each chain member with one more cell at `r + 1`:
`{1}, {2,3}, {2,4,5}, …`), with nothing extra and nothing missing
(`explorer/sextant_shieldclass.mjs`).

One thing the measurement did *not* predict, and the proof had to fix: my first
`+2` invariant carried only "the two edge cells of `Y` are complementary", which
is true and is not enough — the step at the cell just left of the edge needs
`Y`'s edge cell to be the complement of `X`'s *second* right-diagonal cell,
which is a phase relation, not a parity one. Lean rejected the branch where
both are white. The corrected invariant is the same one the `+1` case uses.

**Route.** Done, twice: `explorer/sextant_scratch_shield.lean` (the seed and
the seed plus a cell at 1, using `evolve_right_edge` and
`evolve_eq_false_of_outside_cone`) and `explorer/sextant_scratch_shield_general.lean`
(arbitrary `X`, proving the two cone facts for a general finite configuration
along the way, and both shield forms, and the chain). Axioms `propext,
Quot.sound` — no choice, except for the chain corollaries, which pick up
`Classical.choice` from the board's `column`. As board nodes this is five or six
statements: the general right edge, the general cone, the two invariants, and
the two chain corollaries; the invariants are the only ones with any work in
them, and the work is four index cases each, not an idea.

### 3.4 Two adjacent columns of the seed cannot disagree at every time

**The claim.** For every `i`, there is no `N` with `evolve t i ≠ evolve t (i+1)`
for all `t ≥ N`. That is the topic's statement, unconditionally, for
`x = 1, j = 0, p = 1` in the branch where the difference is eventually `1`.

```lean
theorem sextant_adjacent_difference_not_eventually_one (i : ℤ) :
    ¬ ∃ N, ∀ t ≥ N, evolve t i ≠ evolve t (i + 1)
```

Why: if the pair is ever `(white, black)` past `N` it is `(white, black)` for
ever — the rule at `i+1` reads `white XOR (black OR anything) = black`, and the
hypothesis then forces `white` at `i` — so both columns are eventually
constant; and if the pair is never `(white, black)` past `N` it is
`(black, white)` throughout, so both columns are eventually constant again.
Either way two adjacent columns are eventually periodic, which
`not_isEventuallyPeriodic_adjacent` forbids.

**What it would give.** The first unconditional instance of the topic's
statement on the board, and the shape of the only kind of argument that has
worked: not a property of the difference, but a *local absorption* — a state of
the pair that is a trap. It would be cited by any attempt at the other `p = 1`
branch, and it is the reason to look at the pair `(evolve t i, evolve t (i+1))`
as a two-state machine rather than at `d` alone.

**Falsification.** It is proved (kernel:
`explorer/sextant_scratch_coboundary.lean`, axioms `propext, Classical.choice,
Quot.sound`), and the engine agrees with what it implies: the longest constant
run of *any* `d` over all 38,700 pairs of the sweep, for `t < 20,000`, is 30
(control 29), so in particular no adjacent pair of the seed's columns disagrees
for more than 30 consecutive rows anywhere in that window.

**Novelty.** Not in the held sources. Jen 1990 and Kopra 2022 prove that two
columns are never *both* eventually periodic; nothing in either says anything
about a pair being complementary. The proof is two lines of rule 30 plus a
closed node, so this is "cheap and true"; its worth is that it is an instance
of the wall rather than a lemma beside it.

**Route.** Done. The companion branch — `d` eventually **zero** for an adjacent
pair, i.e. two adjacent columns equal from some row on — is *not* closed, and
is §6.

### 3.5 The sweep, and the near-witness family

**The claim.** No `(x, j, p)` in a large box gives an eventually periodic
difference; and the family that comes closest is `x = j = L`, whose difference
is zero exactly on `[0, m(L))` where `m(L)` is Rowland's first-failure depth —
the white void at the right edge of row `L`, plus one.

**Falsification.** `explorer/sextant_diffsweep.mjs`, two runs. Deep and wide:
400,000 rows, `|x| ≤ 150`, `-32 ≤ j ≤ 96` (**38,700 pairs**), every period
`p ≤ 16,384`, required to hold from `t = 200,000` to `t = 399,896` — **0
survivors**; longest partial period run 28 (xorshift32 control through the
identical code path: 27), longest constant run of any `d` 30 (control 29),
longest `d = 0` prefix 18 at `(x, j) = (-96, 96)` (control 15). Shallower and
wider in `x`: 120,000 rows, columns `|x| ≤ 320`, sweep `|x| ≤ 96`,
`-16 ≤ j ≤ 48`, `p ≤ 8,192` from `t = 60,000` — 0 survivors, longest partial run
31 (control 27), longest constant run 30 (control 27), longest `d = 0` prefix
18 at `(-48, 48)`. In both runs the extraction is checked against A051023 and
against the cone (white before `|x|`, black at `|x|`) on every column, 0
violations. Note where the longest `d = 0` prefix sits in both: at `x = -j`,
the *left* diagonal family, and it stops at 18 — the depth to which the settled
centre column agrees with the real one (crystal 46).

The diagonal family `x = j = L`, all `L` rather than Portage's powers of two
(`L ≤ 320` in the first run, `L ≤ 200` in the second): `d = 0` on `[0, m)` with
`m = 1, 3, 4, 6, 7, 9, 15, 16, 24` at `L = 1, 2, 4, …, 256`, and small `m`
(9 or 15) at every `L` that is not a high power of two. Those nine values are
exactly what crystal 12 prints for the rightmost black run as a function of
`ord₂` — Cairn's white-void sequence plus one — so the near-witness lengths of
this family are Rowland's, already in print, and they grow without bound,
roughly linearly in `log₂ L`; each one is finite exactly because the periods of
the right diagonals are unbounded. The board's seeded node
`rightDiagonal_first_failure` **is** this statement for row 0: read in the
topic's vocabulary it says `d_{L,L} = 0` on `[0, m)` and `≠ 0` at `m`. It does
not say `d_{L,L}` is not eventually zero *later*, and that gap is not a
technicality: the same argument at row `N` needs the rightmost difference
between row `N` and the slid row `N + L` to sit left of the origin, which holds
only while `N` is below the agreement depth `m(L)`.

**What it would give.** Nothing on its own; it is the due diligence that says
the statement is worth calling true, and it identifies the one family where the
near-misses grow. Distrust: the sweep is a coin test, and a coin passes it —
which is the point of quoting the control. A survivor would have been a proof
of P1, so the sweep is also the cheapest possible search for the prize, and it
found nothing.

**Novelty.** Portage's sweep is the same object at `|x| ≤ 24`, `j ∈ [-8, 24]`,
`p ≤ 4,096`, `t ∈ [20,000, 60,000)`; this is 24 times the pairs, 4 times the
periods and 5 times the window, plus the diagonal family beyond powers of two
and the identification with `rightDiagonal_first_failure`, which is new here.

---

## 4. What survived

All five, and three of them are theorems the kernel has checked rather than
claims: §3.1 (a periodic difference would prove P1, so a proof of the topic's
statement may assume P1), §3.2 (damage is not a dynamical object), §3.3 (the
right-edge shield, in general form), §3.4 (adjacent columns cannot disagree for
ever). §3.5 is a measurement and survives as one. **I would seed §3.3 first.**
It is the only one that changes what anybody attempts next: it removes an
entire class of routes to the `d = 0` case, it is the sharpest thing this
session found, and it is the only result here that is worth writing up outside
this project — a proved, explicit, infinite family of finite configurations
sharing the seed's own centre column, against a printed statement (Wolfram
1986 §5) that says localized changes always spread. Then §3.1, which is three
lines and fixes the frontier's shape; then §3.4; then §3.2, whose value is as
an obstruction rather than as supply. What did **not** survive is the topic's
own hope: no instance of the difference statement beyond §3.4 is proved, and
the honest answer to "is it as hard as the residual" is in §2 — not equivalent,
one-way implication only, and in my judgement harder to attack.

---

## 5. Claims that died

- **"The centre column separates finite configurations."** Dead, provably: the
  seed and `{0,1}` have the same centre column at every time (§3.3). This was
  going to be the reduction of the whole `p = 1` case. Died at the first
  enumeration, `explorer/sextant_colsep.mjs`, 4,096 configurations, depth 120.
- **"The first-failure argument runs at every row."** For `x = j = L` the
  rightmost difference between row `N` and the slid row `N + L` lies left of the
  origin only while `N` is under the agreement depth `m(L)` (24 at `L = 256`,
  logarithmic in `L`); past that
  it sits to the right and marches away. So `rightDiagonal_first_failure` gives
  the `d = 0` prefix and *not* "`d` is not eventually zero". I believed the
  stronger version for about twenty minutes; the arithmetic of where the
  rightmost difference sits killed it, not a measurement.
- **"A periodic difference propagates leftward the way periodicity does."**
  Dead at one step, with a four-configuration witness (§3.2).
- **"`d` eventually zero forces the two configurations to be equal."** Dead by
  §3.3: distinct finite configurations can share a centre column.
- **"The `d = 0` branch for adjacent columns falls to the forbidden block."**
  Not dead but not closed: two adjacent columns equal from `N` on forces column
  `i` to have no two consecutive black cells from `N` on (the forbidden block,
  crystal 8) and makes every column to its left a fixed sliding-block function
  of that one column. Nothing on the board forbids either, and the second is a
  P3-flavoured statement, not a P1 one.
- **"Some `(x, j, p)` in the box works."** 38,700 pairs, `p ≤ 16,384`, a
  200,000-row window: none (§3.5). A survivor would have proved P1.
- **The shield is *not* general in the direction one hopes.** Adding a cell
  three places past the right edge changes the column in 8,192 of 8,192
  configurations, and adding one past a *non-isolated* right edge changes it in
  8,192 of 8,192. The phenomenon reaches exactly two cells past the edge, and
  needs the edge cell to be isolated.
- **My first `+2` invariant.** "The two edge cells of the perturbed picture are
  complementary" is true, is preserved by the step, and is *not* enough: the
  cell just left of the edge needs a phase relation to the unperturbed
  picture's second right diagonal, not a parity relation between the two
  perturbed cells. Lean rejected the branch where both are white; the
  measurement would never have caught it, because in the real pictures the
  phases happen to line up.

---

## 6. Next topic

**Can two adjacent columns of the seed be equal from some row on?** That is the
one remaining `p = 1` branch of this topic's statement at its smallest instance
— §3.4 closes the complementary branch, and the two together would give the
first complete instance of the free companion. It is worth attacking next for
three reasons: it is stated in the board's existing vocabulary with no new
definition; the hypothesis is unusually rich, since it forces column `i` to
contain no two consecutive black cells from that row on (crystal 8) and makes
every column to the left of it a fixed sliding-block function of column `i`
alone, with no growth of the preperiod (rule 30 is left-permutive, so Kopra's
`h = 0`); and both of those are checkable properties of the seed's own picture
that nothing on the board yet forbids. The two things to hand whoever takes it:
the shield (§3.3), because it says the analogous freedom does exist *between*
pictures and so warns against any argument that would prove too much; and the
observation that "the left half-plane is a sliding-block function of one
column" is a statement about the third prize question, so a proof may well have
to borrow from irreducibility rather than from periodicity. The supply question
underneath, and a good session on its own, is the **shield class**: the chain
`{0}, {0,2}, {0,2,4}, …` is now proved to share the seed's centre column, and
the open half is how big that class is — which finite configurations have a
given centre column, whether the class is always infinite, and whether the
`+1` and `+2` moves generate all of it — inside the windows `{1, …, 12}` and
`{1, …, 16}` they generate it exactly, 12 of 4,095 and 16 of 65,535 with no
exceptions either way (§3.3), which is sharp enough to be worth a proof attempt. `explorer/sextant_shieldclass.mjs` and
`explorer/sextant_colsep.mjs` compute the class by enumeration and are the place
to start.
