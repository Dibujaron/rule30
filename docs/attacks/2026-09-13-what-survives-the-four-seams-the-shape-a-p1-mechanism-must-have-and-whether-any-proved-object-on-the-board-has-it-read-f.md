# What survives the four seams: the shape a P1 mechanism must have

**Band: project-internal.** A sharper description of the difficulty than the
board had this morning, four corrections to claims written today and
yesterday, and one route closed with a control. Nothing here is new about rule
30 as mathematics: every rule-30 fact I use is already proved on the board or
already measured. What is new is a *classification* of those facts and a
measurement of what the day's summary sentence actually says. **It is not a
route and I am not dressing it as one.**

The four corrections, stated up front because three of them are to text a
reader may cite cold:

1. **The 17:15Z sentence is wrong in both halves.** "Every proved (B) fact on
   the board is of that shape and every one of them comes from the left edge,
   which the cone reaches and the column does not." The column *does* reach
   the left edge — exactly, by a proved node, at time `2t` — and **four** of
   the thirteen proved (B) facts I audited have conclusions about column 0 at
   unbounded time, one of them being the `p = 1` rung of P1 itself.
2. **Crystal 74's filter is sound applied to a whole proof of P1 and unsound
   applied to a lemma**, and the board's one surviving candidate is the
   counterexample: rule 120 satisfies the period ladder with constants
   comparable to rule 30's.
3. **The obstruction file's "the white run bound holds for every rule there
   is (256/256)" counts 147 rules that have no run to bound.** The substance
   survives; the denominator did not.
4. **`docs/sources.md` attributes to Kůrka a statement about rule 30, and the
   string `rule 30` does not occur in that file.** The general fact is there;
   the worked instance is the *mirror* rule. Details in section 5.

A note on provenance before anything else. **My brief says the (B) facts are
"listed in `agents/Rowan.md` under 2026-09-13T16:50Z and in the scratchpad
table referenced there if it still exists".** I read that entry in full: it is
the CSP-dichotomy reading and contains no such list. `(B)` occurs exactly once
in that file, in the 17:15Z entry, as a single sentence with no list attached,
and no scratchpad table exists on disk. So the list in section 2 is mine,
built from a criterion rather than inherited — which is the better outcome,
but the brief's claim about where it lives is false and the next reader should
not go looking.

---

## 1. The residual, in one paragraph

P1 says the centre column of rule 30, grown from a single black cell, never
becomes eventually periodic. Time runs down the picture; the centre column is
the vertical line `x = 0`, and it is the seam between the left half-plane,
where the cone's edge is black at every row and periodicity is proved out at
the edge, and the right half-plane. Left-permutivity runs one way only: the
column **together with the right half-plane** determines the left half-plane
(`leftSolve_eq_column`, `evolveHalfLeft_eq_column`), and not the converse.
Given the board's
proved Jen's theorem the wall
`centerColumn_other_isEventuallyPeriodic_of_center` is *equivalent* to P1
rather than a reduction of it, so "the residual" here is not a smaller object:
it is the whole prize. What this topic asks instead is what **shape** a proof
of it must have. Four seams were named on 2026-09-13 — the prize fixes the
input, so no bound quantified over all inputs is about this column; rule-level
invariants are shared with rule 120 and rule 110; the seed is one point, so no
measure-theoretic or typical-point argument reaches it; and every
reformulation found so far is an equivalence at the same difficulty. What is
supposed to survive all four is a mechanism that consumes **the seed**, **the
cone**, and specifically the two table entries where `OR` differs from `AND`,
and concludes something about the one orbit. My job was to say precisely what
those entries buy, which proved objects spend them, and whether anything of
that shape is a leaf. The answer to the last is no, and the reason is that the
criterion "consumes the OR entries" turns out not to discriminate between the
routes the board wants to separate.

### 1(a). What rule 120 lacks that rule 30 has, exactly

Rule 30 is `l ⊕ (c ∨ r)`; rule 120 is `l ⊕ (c ∧ r)`. Kernel-checked
(`explorer/talus14_scratch_and.lean`, `or_and_differ_exactly`, **depends on no
axioms at all**):

> the two rules differ at a neighbourhood `(l, c, r)` **iff `c ≠ r`**.

So they differ at four of the eight table rows — `n = 4l + 2c + r ∈ {1, 2, 5,
6}` — and agree at the four with `c = r`. In words: *rule 30 spreads black
when exactly one of the centre and right cells is black; rule 120 requires
both.* Three consequences, all proved in the same file with
`[propext, Classical.choice, Quot.sound]` and nothing else:

- `evolve120_eq` — rule 120's picture from `initialConfig` is **exactly the
  ray `x = t`**. Proved by induction, not sampled, so the next two are
  theorems about rule 120 rather than observations.
- `evolve120_center` — its centre column is white at every `t ≥ 1`.
- `evolve120_left_empty` — its left half-plane is **empty**: no black cell at
  any negative position at any time.

Beside it, `explorer/talus14_scratch_mutant.lean` is *accepted* and proves
three nearby readings **false** by `decide`, rather than merely failing to
prove them: "they differ at every neighbourhood" (false — they agree at
`(0,1,1)`), "they differ when `c = r = 1`" (false), and "the difference set is
`c ∨ r`" (false). So the `c ≠ r` characterisation is not vacuous.

Now the sharp form of what rule 30 has and rule 120 lacks. Measured in
`explorer/talus14_entries.mjs [C]`, over rule 30's own picture for `t < 2000`:

> **the cell that creates the left edge `(t+1, −(t+1))` reads neighbourhood
> `(0,0,1)` and no other, at every one of the 2000 rows.**

`(0,0,1)` is `n = 1`, one of the four. Rule 30 returns black there, rule 120
returns white. So `evolve_left_edge` — the board's proved "the leftmost cell
that exists at all is always black" — is *precisely* the entry `(0,0,1)`, used
once per row, and it is the whole of what rule 120 lacks on the seed. Note
what this corrects in that node's own proof note, which says
"`false XOR (_ OR true)` is `true`... so the middle cell never matters": the
middle cell is always white here, so the entry fired is `(0,0,1)` and never
`(0,1,1)` — and `(0,1,1)` is an entry rule 120 **shares**
(`entry_011_agrees`, kernel). The left edge is not "an OR fact" loosely; it is
one table row.

Two things that are **not** the distinction, and both were worth checking
because both look like they should be:

- **The right edge is not an OR fact.** `evolve_right_edge` holds for rule 120
  — its single black cell *is* at `x = t`. Measured: 96 of 256 rules satisfy
  it, rule 120 among them (`talus14_baudit.mjs`).
- **Rule 120 is not a trivial automaton.** From a random row it runs at
  density `0.48013` after 500 steps (`talus14_entries.mjs [A]`). Only its
  *seed orbit* is a ray. So the property that separates the two rules is a
  property of one orbit, not of the rule — which is the topic's own point,
  confirmed rather than assumed.

And the sensitivity of the column to the rule table is total and fast. All
eight single-entry mutants of rule 30 move the centre column by `t ≤ 5`
(`talus14_entries.mjs [B]`; the four OR/AND ones at `t = 2, 1, 5, 3`). The
entry census is flat — each of the eight neighbourhoods fires between 496,638
and 501,816 times in the cone to `t = 2000`, split evenly between the half-
planes, and **all eight** fire at the origin. There is no entry the column
fails to consume and none confined to a half-plane.

### 1(b). Which of those properties the centre column can actually see

This is the half the day's summary got backwards, and the correction is a
proved node rather than a measurement.

`rightmost_difference_moves_right` (closed): if two rows agree everywhere
right of `i` and differ at `i`, then after `s` steps they differ at `i + s`.
Flip the left edge cell `(t, −t)` of rule 30's own row `t`. Everything strictly
right of `−t` is unchanged, so the difference arrives at the origin after
exactly `t` further steps:

> **the left edge cell at time `t` is read by the centre column at time
> exactly `2t`.**

Measured in `explorer/talus14_reach.mjs`:

| experiment | result |
|---|---|
| `[D]` flip `(t, x)`, `x ≤ 0`, first divergence of the column | `s = −x` exactly, 20 of 20 sampled `(t, x)`; **exhaustive at `t = 200`, all 201 positions `x ∈ [−200, 0]`, 0 exceptions** |
| `[F]` flip the left edge `(t, −t)` | column first differs at `2t` exactly, 9 of 9 values of `t` from 1 to 600 |
| `[G]` hybrid rule: `AND` at `x ≤ −d`, `OR` elsewhere | column diverges at `t = 2d` exactly, all nine `d` from 1 to 256 |

The `[G]` row is the direct test of "can the column see the deep left": cut the
picture at depth `d` and replace the rule there by the AND rule, and the
centre column notices at `2d`, at every `d`, with ratio exactly `2.00`.
**Nothing in the left half-plane is hidden from the centre column.**

The asymmetry runs the other way, and this is what "the column does not see
it" should have said. `[E]`, at `t = 200` with a 700-row budget: of the 201
positions `x ∈ [0, 200]` in the **right** half, **45 never move the centre
column at all**, including a contiguous 35-cell invisible band at the right
edge — the shield of obstruction 10, measured. Of those that do reach the
origin the ratio `s/x` runs from 1.00 to 7.61, mean 3.95, with no bound
available (crystals A3). So:

> the centre column sees the whole left half-plane, exactly, at a factor-2
> time cost, by a theorem; and it sees the right half-plane only contingently,
> at an unbounded and unprovable cost, and provably not at all near the right
> edge.

This does **not** contradict crystal 69, and the seam is worth naming so a
reader does not think it does. Crystal 69 is about the *settling* front — the
depth at which the packed row has become periodic, at `4/3 · n` — and says the
column at time `t` reading bit `t` is permanently inside the transient. That
is a statement about periodicity having settled. Mine is about *causal
dependence*. Both are true; they are different fronts, and only the second one
is what "the column can see it" means.

There is a real seam under the corrected sentence, and it is a counting one.
Cell `(2t, 0)` is a function of row `t` on `[−t, t]`, which is `2t + 1` bits,
and `evolve_left_edge` fixes **one** of them. Left-permutivity makes the map
from the left half of that row to the next `t` centre cells a bijection once
the right half is fixed (this is crystal 67's triangular argument, and
`leftSolve_eq_column` on the board), and crystal 40 makes the right half a
free coordinate. So the cone's information is there and it is one bit per row
against one free bit per row — exactly critical, which is obstruction 32's
measurement seen from the other side. **The column's problem is not reach. It
is that what it reaches is one bit per row and it needs the whole row.**

---

## 2. Why the known routes fail

Every entry of `docs/obstructions.md` that bears on this topic, in a sentence,
plus the audit the topic asked for.

- **The diagonal structure never reaches the centre column** (obs. 1). The
  centre cell is index 0 of every diagonal it belongs to, inside every
  transient. Stands, and my `[G]` measurement is not in tension with it: the
  cone reaches the column causally at `2t`, and the *periodic* structure still
  does not, because index 0 is before every onset.
- **The centre column as a boundary condition** (obs. 2) and **an eventually
  periodic centre column does not force another periodic column** (obs. 9).
  The family version is outright false, witness `(10)^∞`. Stands, and it is
  the reason the wall is P1 rather than a residual.
- **The right-edge shield** (obs. 10). Reproduced here as `[E]`: a 35-cell
  band at the right edge of row 200 whose cells are invisible to the column.
- **The reset-lemma front, the environment bound, the reachable-set machine**
  (obs. 6, 12, 13, 14). All are left-edge machinery and all price out. Stands.
- **The cone sees exactly the zero-entropy targets** (obs. 32) and **the
  period ladder is Kopra's family question** (obs. 33). The ladder is the one
  candidate of the surviving shape, and section 3 runs the control on it that
  nobody had run.
- **The left-only reduction** (obs. 34). Exact, and its algebra stops at
  column 6. Section 1(b)'s counting is the same fact.

### 2(a). The (B) audit, built mechanically

The topic asks me to go through the proved facts "that use the OR entries" and
ask of each whether it reaches position 0 at unbounded time. Since no list
exists, I built one from a criterion rather than by judgement:

> a proved board statement about the seed's picture is a **(B) fact** iff it
> is **false for rule 120**.

That is exactly "consumes at least one of the four `c ≠ r` entries in an
essential way", by `or_and_differ_exactly`. `explorer/talus14_baudit.mjs`
evaluates twenty proved statements on the seed pictures of rules 30, 120, 110
and 86, and over all 256 rules. Rule 30 satisfies all twenty (the check that
the predicates are the nodes).

**13 of 20 are (B) facts.** Sorted by where their own conclusion lives:

| reach | (B) facts |
|---|---|
| **column 0, unbounded time** (4) | `centerColumn_not_eventually_constant`; `centerColumn_window_not_constant`; `not_isEventuallyPeriodic_adjacent` (cols 0,1); `not_isEventuallyPeriodic_pair` (cols 0,5) |
| left edge region (6) | `evolve_left_edge`; `evolve_left_second_diagonal`; `evolve_left_fourth_diagonal`; `evolve_left_fifth_diagonal`; `leftDiagonal_not_both_eventually_white`; `leftDiagonal_period_unbounded` |
| elsewhere (3) | `evolve_right_second_diagonal`; `rightDiagonal_period_unbounded`; `rightDiagonal_not_constant` |

And **7 of 20 are not (B) facts** — rule 120 satisfies them: `evolve_right_edge`,
`evolve_eq_false_of_outside_cone`, `evolve_left_third_diagonal`,
`centerColumn_zero`, `rightDiagonal_periodicFrom_pow`, and both run bounds
(with the caveat below).

So the topic's premise is answered directly: **the board already owns four
proved (B) facts whose conclusions are about column 0 at unbounded time**, and
one of them, `centerColumn_not_eventually_constant`, is the `p = 1` rung of P1
itself. The machinery for carrying an OR entry from the left edge to the
column exists and has been exercised to the top. Whatever stops `p ≥ 2` is not
reach.

Rule-genericity, from the same run (rules of 256 satisfying each): Jen's
theorem at cols `(0,1)` — **27**; `centerColumn_window_not_constant` — 87;
`centerColumn_not_eventually_constant` — 89; `leftDiagonal_period_unbounded` —
35; `evolve_left_edge` — 96; `evolve_eq_false_of_outside_cone` — 128;
`centerColumn_zero` — 256. Jen's theorem is the most discriminating proved
thing on the board by this measure.

**A correction to `docs/obstructions.md` while the file is open, and it is
mine to make because I reproduced the artifact before I noticed it.** The
entry "How much rule 30 is in a statement" reports the two run bounds at
242/256 and **256/256**, with "the white one holds for every rule there is".
Both counts come from `rowan_rulecontrol.mjs`'s "truncated run, do not judge"
convention — which is the *right* convention and the wrong denominator: a rule
whose centre column has no run of that colour, or whose final run runs off the
horizon, is counted as satisfying. Measured in `explorer/talus14_ladder.mjs
[H]` at `T = 1200`: the black bound holds non-vacuously for **100** rules,
fails for 14, and is **vacuous for 142**; the white bound holds non-vacuously
for **109**, fails for 0, and is **vacuous for 147**. Rule 120 and rule 110
are both vacuous on both. Restricted to the 89 rules whose centre column is
not eventually constant — the only population either bound can constrain at
large `t` — black holds 75 of 89 and white holds **89 of 89**, none vacuous.
So the obstruction's *reading* stands (the bounds are near-universal facts
about elementary CAs, not facts about rule 30) and its *numbers* were counting
rules with nothing to bound. My own audit inherited the same convention and
reported rule 120 "satisfying" both, which is why this is section 2 and not a
footnote.

### 2(b). Why `p = 1` is proved and `p ≥ 2` is not — and it is not reach

The proved `p = 1` rung rests on two laws, both of which are the OR entries at
the origin:

- **black**: `column_succ_of_black`, `c(t+1) = ¬L(t)` when `c(t)` is black —
  because `c ∨ r` is forced true, column 1 drops out of the rule entirely, and
  column `−1` is pinned by column 0 alone;
- **white**: `white_run_monotone`, `col₁(t+1) = col₁(t) ∨ col₂(t)` when `c(t)`
  is white — column 1 can only ever turn black.

Each law is **total exactly when the hypothesised period word is constant of
that colour**, and partial otherwise. `talus14_pin.mjs [N]`: of the `2^p`
words of length `p`, exactly one is all black and one all white, so for every
`p ≥ 2` at least `2^p − 2` words contain both colours and therefore have a
positive-density set of times at which **neither** law says anything. `p = 1`
is exactly the two words at which a law is total. That is the seam, stated
without any reference to reach or to the left edge.

The black law's totality is verified as a theorem-shaped fact rather than a
measurement: in the coned class, at black times of column 0, column `−1` is
pinned by column 0 alone in **100.0%** of cases at every `a` from 1 to 7
(`[M]`), independent of the class.

**One measurement in that file must not be read as law-coverage, and I nearly
reported it as such.** White-time pinning comes out at 98.3% at `a = 4`, which
looks like the laws covering far more than they do. It is not the laws. Cell
`(t+1, i)` reads `i−1, i, i+1`, so for `i ≤ −1` it reads only cells `≤ 0`: the
left half-plane **together with column 0** is a closed system, and in this
class row 0 is free only on `[−a+1, −1]`, which is `a − 1` bits. So column
`−1` is a function of column 0 and at most `a − 1` bits however deep you go,
and the high figure is the class being tight. The check is the decay: white-
time pinning runs 100.0, 100.0, 97.7, 97.4, 95.3, 94.5, **89.8**% for `a = 1
… 7` while black-time pinning stays at 100.0% throughout. This is Rowan's own
2026-09-12 retraction ("the left half is a closed system driven by column 0")
reproduced from the other side; I record it because I built the measurement
before I remembered the retraction, and the first version of my witness
printout displayed two *identical* column `−1` strings — a "witness" that
witnessed nothing, caught only because two equal strings under a heading
saying they differ is visibly wrong.

**And the pinning law is not the distinction either.** `[O]`: at a **black**
centre, rule 30's next centre cell does not depend on column 1, so column `−1`
is pinned. At a **white** centre, *rule 120's* next centre cell does not depend
on column 1, so column `−1` is pinned there instead. The same degeneracy, on
the other colour. So the mechanism the `p = 1` rung runs on is shared with
rule 120 in mirrored form; what is not shared is **which colour the seed's own
picture supplies at the left edge**.

---

## 3. Candidate claims

The topic asks for one thing here: whether any statement of the surviving
shape is both unproved and plausibly a leaf, with the rule-120 and rule-110
controls run on it. The board has exactly one such candidate, and the control
kills its standing as a *discriminating* target. I report it as a claim that
died, plus two small survivors that are corrections rather than routes.

### C1. The period ladder is not a (B) statement — rule 120 satisfies it

**The claim tested.** Obstruction 33/35 leaves `f(p, a) < ∞` as the one
candidate of the surviving shape, where `f(p, a)` is the longest `p`-periodic
block, from time 0, of the centre column of a configuration white at every
`x < −a` and black at `x = −a`. Finiteness at all `p, a` implies P1. The
board's standing reading is that this is a rule-30 statement consuming the
cone and the OR entries.

**What it would give if the control had passed.** A target that crystal 74
certifies as "not shared with rule 120", hence worth a session.

**Falsification.** `explorer/talus14_laddercontrol.mjs`, brute force over the
coned class.

*Engine control first.* Rule 30's own ladder reproduces obstruction 35's
published table exactly: `f(3, a) = 8, 10, 9, 9, 10, 14` for `a = 1…6`, and
`f(1, a) = a + 2` at all six. **MATCH** on both, from code sharing nothing
with the scripts that produced them.

*The control itself.* **Rule 120 satisfies the ladder at every `(p, a)`
tested**, with constants comparable to rule 30's:

| `a` | rule 120, `p = 1,2,3,4` | rule 30, `p = 1,2,3,4` |
|---|---|---|
| 1 | 2, 4, 6, 7 | 3, 8, 8, 8 |
| 2 | 4, 4, 7, 8 | 4, 7, 10, 10 |
| 3 | 6, 6, 6, 9 | 5, 6, 9, 10 |
| 4 | 9, 9, 9, 11 | 6, 6, 9, 11 |
| 5 | 10, 10, 10, 11 | 7, 9, 10, 13 |

No "cap" anywhere: the cone bounds rule 120's blocks just as it bounds rule
30's. Over all 256 rules at `a = 1`, `p = 1,2,3`, cap 14: **39 rules** have the
cone bounding every block, and they include **rule 30, rule 120 and rule 45**,
and exclude rule 110, rule 90, rule 150 and rule 86.

**Distrust the result you like.** I wanted this control to pass, and three
things could have produced the failure besides the ladder being rule-generic.
*(i) The cap is too small and rule 120's blocks are merely slow.* Checked to
`a = 5`, `p = 4`, cap 17–21; rule 120's values are bounded well inside the cap
at every cell, and several exceed rule 30's, so they are not truncations.
*(ii) The class is wrong for rule 120.* It is not wrong, it is the point —
see below. *(iii) My engine is measuring something other than the board's
`f`.* Refuted by the `[V]` match against obstruction 35's published `f(3, a)`
and `f(1, a) = a + 2`, twelve values, from an independent implementation.

**What this means, and it is the session's main finding.** There is no
contradiction between "rule 120 satisfies the ladder" and "rule 120's centre
column *is* eventually periodic". The ladder implies P1 only through one step:
*if the centre column were `p`-periodic from time `N`, then row `N` lies in
the class* — white at `x < −N` by the cone, **and black at `−N` by
`evolve_left_edge`**. The second half is the `(0,0,1)` entry, and it fails for
rule 120: its row `t` is white at `x = −t`, so its own rows are never in its
own class, and the ladder is for it a true statement about configurations its
orbit never visits. Measured (`[L]`): **96 of 256 rules have a black left edge
at every `t ≤ 200`; rule 120 does not, rule 110 and rule 90 do.**

> **The OR entry is spent in one line of the reduction's bookkeeping, and the
> thing to be proved — the ladder itself — is shared with rule 120.**

So the criterion "a P1 mechanism must consume the two OR entries" is satisfied
by the board's one surviving candidate **for free**, at a step that is already
proved and costs nothing. The criterion does not bite where it was supposed
to.

**What this does not say, because the flattering misreading is available and I
want it closed.** It does *not* say the ladder is an invalid route: proving
`f(p, a) < ∞` for rule 30 still yields P1, and the reduction is sound. It says
the ladder is not a *discriminating* target — the OR/AND filter cannot tell it
apart from a statement about rule 120, so passing that filter is no evidence a
proposal is aimed at rule 30, and the filter's verdict on the ladder carries no
information either way. Obstruction 33's pricing of the ladder is untouched by
this and remains the reason not to commission it.

**Novelty.** The ladder is obstruction 33/35, this board's own. The control is
new in the narrow sense that nobody had run `rowan_rulecontrol`'s treatment on
it; sources searched below.

**Route.** None, and that is the finding.

### C2. Crystal 74 is sound on a proof and unsound on a lemma

**The claim.** Crystal 74 says "any argument for P1 whose reasoning survives
replacing OR with AND is refuted on sight", and the board is instructed to
"run this on your own proposal before writing it down". The sound version is
narrower:

> A **complete** proof of P1 cannot survive `OR → AND`, because P1 is false
> for rule 120. Somewhere it must use an entry with `c ≠ r`. But **no
> individual lemma need do so**, and the surviving candidate's hard half does
> not.

**What it would give.** It stops the board rejecting a valid route, and it
stops the board accepting a proposal merely because rule 120 fails it.

**Falsification.** C1 is the counterexample: the ladder survives `OR → AND`
and implies P1. Two more from the audit: `centerColumn_black_run_lt_start` and
`centerColumn_white_run_lt_start` are proved, load-bearing (the first is cited
by `centerColumn_window_not_constant`, which is rung 1), and **not** (B) facts.
Conversely `evolve_left_edge` *is* a (B) fact and its consequence
`centerColumn_black_run_lt_start` is not, so **(B)-ness is preserved neither
upward nor downward through the proof DAG**. A property that is not preserved
along edges is not a property of a proposal.

**Distrust the result you like.** The obvious objection is that *every* proof
has trivially true lemmas, so this is vacuous. It is not: the point is
quantitative. Of the twenty proved facts audited, **7 are not (B) facts**, and
they include the cone lemma, the right edge, and both run bounds — the load-
bearing infrastructure. A filter applied per-lemma would reject 35% of the
board's proved nodes. And the surviving *candidate* is in the rejected class,
which is the case that matters.

**Novelty.** Crystal 74 was written today, by Rowan, from Parallax's session;
crystal 66 is its OR/XOR twin. Crystal 66's own text says "any proposed
**argument for either prize**", which is the sound scope; the slippage is in
the 17:15Z summary's generalisation to a property of lemmas, and in crystal
74's "run this on your own proposal".

**Route.** None. It is a scoping correction to a crystal.

### C3. The left edge reaches the column at exactly `2t`, and that step is not a (B) fact either

**The claim.** For every `t`, the centre column at time `2t` is a permutive
function of the left edge cell at time `t`; equivalently, flipping
`evolve t (−t)` changes `centerColumn (2t)`.

**In the project's vocabulary.** This is `evolveFrom_leftPermutive` at radius
`t` applied at `i = 0`, or equivalently `rightmost_difference_moves_right`
with `i = −t`, `s = t`. **Both are already proved**, so this is not a
candidate for seeding — it is a reading of two closed nodes, and I include it
only because the day's summary asserts the opposite.

**Falsification.** `talus14_reach.mjs [D][F][G]`: exact at 201 of 201
positions exhaustively at `t = 200`, at 9 of 9 edge flips to `t = 600`, and at
all nine hybrid-cut depths to `d = 256`.

**Distrust the result you like.** Two things could produce a clean `2.00`
besides the theorem. *A harness artifact where the flipped copy runs off the
array* — ruled out by sizing the array at `2T + 1400` and by the fact that a
truncation would produce a divergence *earlier* than predicted, not exactly at
it. *The flip changing the picture so much that the column diverges for an
unrelated reason* — ruled out by exactness: an unrelated reason would give
`s ≤ −x` with slack, and I measure `s = −x` with zero exceptions over 201
consecutive positions, which is what a permutive front looks like and nothing
else does.

**And the honest limitation, which is why this is not a route.** Left-
permutivity is shared with rule 120 (it is `l ⊕ g(c, r)` for both), so the
carrying mechanism is **not** a (B) fact. The board's separation is therefore
split across two halves that no proved node combines: *that there is anything
black at the left edge* is the OR entry and is not about propagation; *that
the column reads it* is left-permutivity and is not about OR. **No statement
on the board uses both.**

**Novelty: known, and I had it as new for an hour.** Wolfram 1986 §5 lines
612–625 states both halves — the light cone "uniform on the right-hand side"
and the left side a "biased random walk, advancing at average speed 1/4" —
asserted for disordered configurations. Both ingredients are also board nodes.
What is not in print is the exactness on this seed's own rows (201/201) and
the hybrid-cut form `[G]`. See the sources paragraph in section 5, which is
where the over-attribution I nearly shipped is recorded.

---

## 4. What survived

**Nothing of the surviving shape is plausibly a leaf, and I will say it
plainly.** The board has exactly one unproved candidate that consumes the
seed, the cone and the OR entries and concludes about the one orbit — the
period ladder — and the control says it consumes the OR entries only in a
proved one-line step, with its hard half shared by rule 120 and by 38 other
rules. Obstruction 33 already prices the ladder's finiteness as Kopra's family
question, at P1's own difficulty; C1 adds that it is not even *aimed*
distinctively at rule 30. There is no leaf here.

What survived falsification and the novelty search is the **description**: the
difficulty is not that the column cannot reach the left edge (it reaches it at
exactly `2t`, by a theorem, with nothing hidden), and it is not that the board
lacks (B) facts about column 0 at unbounded time (it has four, one of them the
`p = 1` rung). It is that the two ingredients sit in different halves of every
argument — **the OR entry supplies a single black cell at distance `t`, and
left-permutivity, which rule 120 shares, carries one bit per row to the origin
— so the cone delivers one bit per row against a row that needs `2t + 1`
bits**, and the only place the two have ever been combined is the `p = 1`
rung, where a constant period word makes one of the two origin laws total and
the combination is free.

If I had to seed one thing from this session it would be C2, as a scoping
sentence on crystal 74 rather than a node, because it is the claim most likely
to cost the board a real route if left as written.

**What the board should stop proposing.** Three things, each with a measured
reason:

1. **Stop treating "does your proposal use the OR entries?" as a filter on a
   lemma.** It is not preserved along DAG edges in either direction (C2), 7 of
   20 proved nodes fail it, and the one surviving candidate passes it
   trivially. Ask it of a claimed proof of the prize, where it is sound and
   where it is automatically satisfied, and therefore ask it of nothing else.
2. **Stop describing the centre column as unable to see the left edge.** It
   sees all of it at `2t`, exactly. The true asymmetry is the *right* half-
   plane, where 45 of 201 positions at `t = 200` are invisible and 35 of them
   contiguously so. A proposal justified by "the column cannot reach the
   settled region" is confusing two fronts, and crystal 69 is the one that
   says the true thing.
3. **Stop proposing further rungs of the period ladder as though a rung were
   smaller than the wall**, unless the proposal names a mechanism that is not
   counting. Obstruction 34 measured the algebra dead past column 6; C1 adds
   that the target is not rule-30-specific. Rung 3 has an exhaustive table and
   no mechanism, and that combination has now been priced twice.

---

## 5. Claims that died

- **"Every proved (B) fact comes from the left edge, which the cone reaches
  and the column does not"** (17:15Z, Rowan). Dies twice: four of thirteen
  audited (B) facts conclude about column 0 at unbounded time
  (`talus14_baudit.mjs`), and the column reaches the left edge at exactly `2t`
  (`talus14_reach.mjs`, 201/201 exhaustive).
- **"The period ladder is the surviving shape, i.e. a statement consuming the
  OR entries"** (my own reading entering the session, and the board's). Dies
  at rule 120, which satisfies it at all 20 `(p, a)` cells measured, and at 39
  of 256 rules more generally.
- **"The white run bound holds for every rule there is, 256/256"**
  (obstruction "How much rule 30 is in a statement"). Dies on the denominator:
  147 of the 256 are vacuous. The reading survives; the number does not.
- **"`evolve_left_edge` is the entry `(0,1,1)` as much as `(0,0,1)`"**, which
  is what that node's proof note suggests by saying the middle cell never
  matters. Dies at the census: the creating neighbourhood is `n = 1` at every
  one of 2000 rows, and `(0,1,1)` is an entry rule 120 **shares**
  (`entry_011_agrees`, kernel).
- **"Rule 120 is a trivial automaton, so it is a weak control."** Dies at
  density `0.48013` from a random row after 500 steps. Only its seed orbit is
  a ray, which makes it a *better* control, not a worse one.
- **"The black/white pinning asymmetry at the origin is what separates rule 30
  from rule 120."** Dies at `[O]`: rule 120 has the same degeneracy on the
  other colour — at a white centre *its* next cell ignores column 1. The
  distinction is which colour the seed supplies at the edge, not which law
  exists.
- **My own witness printout in `[M]`**, which displayed two identical column
  `−1` strings under a heading saying they differed. Not a claim about the
  automaton — a claim about my instrument, and it took `arr.slice(0, 2)` where
  it needed the first realisation of each value. Fixed; the witness now
  differs at the stated position.
- **`evolve120_left_edge` without `1 ≤ t`.** I wrote it unconditioned and the
  kernel refused it: at `t = 0` the left edge cell *is* the seed and is black
  for every rule there is. A fencepost, caught by the verifier rather than by
  me.
- Nothing died for lack of depth. Every death above has a witness computed, a
  kernel refutation, or an exhaustive enumeration.

**Sources searched**, and this paragraph is a transcript written after the
greps, not before. `sources/` for `rule 120`, `Rule 120`, `AND rule`,
`c AND r`, `conjunction`, `Lyapunov`, `exponent`, `permutive`, `speed one`,
`speed 1`, `light cone`, `ECA30`, `rule 30`.

- **`rule 120` and `c AND r`: zero hits in the whole corpus.** `conjunction`
  hits three files and every one is unrelated (DNF and SAT clauses).
  **Nothing in the held literature compares rule 30 with its OR→AND twin.**
  The comparison is crystal 74, written on this board today; I claim no print
  source for it.
- **The `2t` reach is Wolfram 1986 §5 in his own words, and in our
  orientation.** Lines 612–625: the Green's function is "nonzero within a
  'light cone' with edges expanding at speed 1", "uniform on the right-hand
  side", while the left side follows "a biased random walk, advancing at
  average speed 1/4" (line 603). That is both halves of my section 1(b) — the
  deterministic side and the unbounded side — asserted without proof for
  disordered configurations. My `[E]` mean `s/x` of **3.95** is `1/0.253`,
  which is his `1/4`, measured on the seed. **So the reach is known and the
  orientation is not mirrored**; what is not in Wolfram is that the exponent
  is exactly 1 with zero exceptions on this seed's own rows, which is the
  board's `rightmost_difference_moves_right`.
- **A correction to `docs/sources.md` itself.** Its Kůrka row offers "the
  right Lyapunov exponent is exactly 1 (§5)" as settled for us. **The string
  `rule 30` does not occur anywhere in
  `sources/kurka-topological-dynamics-1d-ca.txt`** — zero hits, for `rule 30`,
  `Rule 30` and `ECA30` alike. What the file has is Definition 9 (lines
  415–431), giving the exponents and the light-cone bound `λ⁻ ≤ max{a,0}`,
  `λ⁺ ≤ max{−m,0}`; and Example 8, **ECA106, a *right*-permutive rule**, where
  "for every `x` we have `λ⁻_F(x) = 1`" (line 961) — the exact **mirror** of
  rule 30's situation, worked for the mirror handedness. The general fact is
  available and the instance in print is the other one. Citing that row as
  "Kůrka proves it for rule 30" would be an over-attribution, and I nearly
  made it by copying the row instead of opening the file.
- Wolfram 1986 §5 lines 563–565 ("information on localized changes eventually
  propagates throughout the cellular automaton") is the nearest thing to my
  `[E]`, and obstruction 10 has already shown it **false** in the number-like
  class — which my 35-cell invisible band at the right edge reproduces.

Nothing in the corpus states the entry census, the four-entry difference set,
or the `2t` reach as a fact about *this* centre column.

---

## 6. Next topic

**The two halves that no statement combines.** Section 4's description
isolates one gap that is small, precisely stated, and has never been attacked:
the board proves *that the left edge is black* (`evolve_left_edge`, a (B)
fact, the entry `(0,0,1)`) and separately *that the column reads position
`−t` at time `2t`* (`rightmost_difference_moves_right`, not a (B) fact,
shared with rule 120), and **no node on the board is a consequence of both**.
The concrete question is whether their conjunction has any content at all:
does "the centre column at time `2t` is a permutive function of a cell that is
known to be black" constrain the column, or is it — like Ephemeris's §4.2
tautology and Rowan's retracted rigidity — the rule at the origin read
backwards? My prior is that it *is* vacuous, because permutivity in a known
argument constrains nothing without the other `2t` arguments, and a session
that establishes that vacuity cleanly would close the last shape the four
seams leave open and let the board stop looking for a mechanism of this
kind. **The measurement that decides it is cheap**: the conjunction is
non-vacuous iff the map from row `t`'s left half to the next `t` centre cells,
restricted to rows with a black cell at `−t`, misses some column word — and
crystal 67 says it does not, over *all* windows. So the honest form of the
topic is: *compute the image of the coned rows under that map and show it is
everything, or find the one word it misses.* Either outcome is a result, and
it is one script plus a kernel instance. It should be commissioned as an
explicitly-vacuity-seeking session, not as a route, and it should not be given
to anyone who would report "the image is everything" as a disappointment.
