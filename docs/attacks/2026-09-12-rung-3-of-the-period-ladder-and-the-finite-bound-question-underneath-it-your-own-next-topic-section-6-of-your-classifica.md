# Rung 3 of the period ladder, and the finite-bound question underneath it

Talus, theorist, 2026-09-12.

## 1. The residual, in one paragraph

**Band, plainly: project-internal.** The session's main deliverable is a
repricing of the topic's headline question, and it rests on a sentence in
print rather than on anything new about rule 30. One thing in it would be
novel-and-small if proved (C2), one is a clean provable lemma that is new
phrasing of known material (C3), and the rung's first three cells are now
kernel-verified rather than script-verified (C5).

The picture is grown downward from a row that is white at every `x < -a` and
black at `-a` — which is exactly what row `N` of rule 30's own picture looks
like, by `evolve_eq_false_of_outside_cone` and `evolve_left_edge`. Call that
class `C2(a)`, and let `f(p,a)` be the longest block, starting at time 0, over
which the centre column of such a configuration repeats with period `p`. If
`f(p,a)` is finite for every `p` and every `a`, Prize 1 follows: a centre
column eventually periodic with period `p` from time `N` would make row `N` a
member of `C2(N)` with an infinite block. The topic asks for finiteness *of any
shape*, which sounds weaker than asking for a bound — and **that is the thing
this session found is not so.** The set `C2(a)` is compact and "the first `T`
cells of the centre column are `p`-periodic" is a closed condition, because a
block of length `T` reads only cells in `[-(T-1), T-1]` of row 0. So the nested
closed sets have a nonempty intersection, and

> `f(p,a) = ∞` **if and only if** some configuration in `C2(a)` has a centre
> column that is exactly `p`-periodic, for ever.

Compactness therefore converts "some finite bound, of any shape" into a
statement about a single configuration, and the shape of the bound stops
mattering — but so does the hoped-for cheapness. Quantified over all `p` and
`a` the statement reads *no configuration white far to the left, with a
leftmost black cell, has an eventually periodic centre column*, and Kopra
2022 §4 writes of exactly that family, one sentence before stating the prize
question as his Problem 4.8: **"it is probably equally difficult for all
configurations of N(Σ₂)"** (lines 553–557). So the finite-bound question is
not a weakening of P1 with a cheaper proof hiding in it; it is the family
version, priced in print at the same difficulty, and the compactness step is
what makes that visible. What remains genuinely smaller is a single **rung** —
one fixed `p` — and rung 3 is real: proved, it would say the centre column of
rule 30 is not eventually periodic with period 3, which is one more period
excluded than the board holds today.

Where in the picture the residual lives: **on the left, and only on the left.**
That is the session's second finding and it inverts the brief's own guess. For
every periodic word of period at most 5 except the all-white one, at every `a`
reached, the cone alone — the leftward solve from columns 0 and 1, with the
right half never mentioned — already makes the block finite, and at 293 of 663
measured cells it gives the exact answer. The all-white word is the single exception, and it is
the one the right half's latch handles, which is Condrey's case and is already
done. So the hard step the brief named (the latch being reset at every black
time) is not the obstruction for `p ≥ 2`: the latch is not needed there at all.

## 2. Why the known routes fail

**"The cone sees exactly the zero-entropy targets"** (obstructions, mine, this
morning) is the topic's premise and it stands: `Σ_p` has `2^p` points, growth
rate 1, so the cone can see it, and the same entry says the rungs above 2 of
the *occurrence* ladder are refuted in advance. Nothing here disturbs it.

**"The cone bounds an alternating centre column and not a single-colour one"**
(obstructions, mine, this morning) is where the brief's hard step comes from:
at `p = 1` Condrey's latch (`column_one_succ_of_white`, `white_run_monotone`)
is armed at every step, and from `p = 2` on it is reset at every black time, so
the `p = 2` bound is a dimension count rather than a rigidity. **Today's
measurement says that entry pointed at the wrong half of the mechanism.** Its
own §"What it would take" asks for a two-step latch — "is the composite map
`col1(2m) ↦ col1(2m+2)` rigid in some weaker sense than monotone?" — and that
question is about the right half. The left half kills every word measured
except the all-white one (C2 below), so a two-step latch is not what rung 3
needs. The entry's count/rigidity verdict is unaffected; its recommendation is
withdrawn by its author.

**Obstruction 9** ("an eventually periodic centre column does not force another
periodic column") is the standing warning that a *family* version of a P1
statement can be outright false, with witness `b = (10)^∞`. It is the reason §1
spends its effort on whether the family version here is false rather than on
proving it. It is not: nothing in 188 exhaustive ladder cells, 663 per-word
cells or 405 left-only cells produced a surviving configuration, and the family
statement is Kopra's, which is expected true.

**Crystal 9** (two adjacent complete columns determine everything to their left —
the Meier–Staffelbach weakness) is the machinery C2 runs, and it is closed on the
board as `leftSolve_eq_column`. It does not by itself bound anything: in its own
setting it is a *recovery* result on a ring, where there is no cone to
contradict. What it fails to supply is any reason the solved picture should be
white where the cone says it must be, and that is the whole of C2's residual.

**Crystal 69** (the centre column outruns the settling front) and **crystals
A3** (no bound on a left damage front is available) are why the right half
cannot be steered: a right-half cell at radius `k` reaches the origin at time
`k` only along one diagonal and otherwise at time about `4k`. C3 below turns
that into an exact condition and measures it at 0 mismatches.

**Obstruction 7** and **"A universal bound on the recurrence's hitting times"**
are the shape this project has used to kill four routes: a survival that a coin
would also produce. I ran that test against my own best result and **it took a
claim out of this document** — see §5. The surviving form of C2 is calibrated
against the linear rules, not against a broad null.

**A route I considered and dropped in twenty minutes.** With the column pinned
to `011`, the leftward solve gives column `-1` as `(x_m, 0, 1)` over each
period, with one free bit `x_m = 1 ⊕ col1(3m)` per period, and column `-4` comes
out as `(x_m ⊕ x_{m+1} ⊕ 1, 0, 1)` — the same shape. If that self-similarity
continued, the cone conditions would be `⊕_{i ⊆ j} u_i = 1` for all large `j`
with `u = x ⊕ 1`, which the Möbius transform solves outright, so the system
would always be satisfiable and every rung would be false. It does not
continue: the step from column `-1` to column `-4` uses columns `-2` and `-3`,
and column `-3` is not of the same shape as column `0`, so the recursion is not
self-similar and the system is not linear — the ORs of two unknowns appear at
column `-5`. Recorded because the linear shape is very tempting for two steps.

**New dead end appended to `docs/obstructions.md`**: "The finite-bound question
is Kopra's family question, and the work is all in the left half".

## 3. Candidate claims

### C1. Compactness: an infinite block is a single configuration

**The claim.** In English: a `p`-periodic block of the centre column can be made
arbitrarily long, inside the class white at `x < -a` and black at `-a`, exactly
when some configuration of that class has a `p`-periodic centre column for all
time. In the project's vocabulary: with `C2(a) = {X : (∀ x < -a, X x = false) ∧
X (-a) = true}`,

```
(∀ T, ∃ X ∈ C2(a), ∀ t, t + p ≤ T → column X 0 (t+p) = column X 0 t)
  ↔ (∃ X ∈ C2(a), ∀ t, column X 0 (t+p) = column X 0 t)
```

and, quantified over `a` and using that the leftmost black cell moves left one
cell per step and stays black, the negation of the right-hand side for every
`p` and `a` is equivalent to: no configuration white far to the left with a
leftmost black cell has an *eventually* periodic centre column.

**What it would give.** It is what makes "some finite bound of any shape"
precise, and then prices it. The forward direction needs nothing new. The
reverse is König's lemma over the free coordinates (the cells in `[-a+1, ∞)`),
using `evolveFrom_eq_of_agree_on_window` for the closedness of each condition.
After it, the ladder's own finiteness question has no bound in it at all, and
the remaining content is Kopra's Problem 4.8 for a family rather than for the
seed.

**Falsification.** The compactness step is an argument, not a measurement, so
what was falsified is the *conclusion's hypothesis*: is some `f(p,a)` actually
infinite? `explorer/talus12_ladder.mjs`, `p = 1..12`, `a = 1..18`, cap 96, node
budget `6·10^8`, cells whose predicted width exceeded `6·10^6` skipped: **188
cells, every one exhaustive and finite**, largest value 32, attained at three
cells (`p = 6, a = 17`; `p = 8, a = 14`; `p = 9, a = 13`). Per word rather than
per period: `explorer/talus12_leftdfs3.mjs`, every primitive word of period at
most 5, **663 cells at which the exhaustive search terminated, all finite**.
*What else could produce this.* An exhaustive search reports a finite maximum
either because the maximum is finite or because the search is over-pruning. Two
controls: row `a` of the seed is itself a member of `C2(a)`, so `f(p,a)` must be
at least the seed's own `p`-periodic block starting at time `a` — 188 cells
checked against the seed carried to 300,000 terms by a packed engine, **0
violations**, and tight at one; and the whole search was re-run with a general,
rule-agnostic version that loops over `cell(-k)` and `cell(+k)` separately
instead of solving for `cell(-k)`, **48 rule-30 cells, 0 disagreements**
(`explorer/talus12_cause.mjs`). The first three cells of the `p = 3` row are
also kernel-verified — see C5.

**Novelty.** Not new, and the point of the claim is whose it is. Kopra 2022,
`sources/kopra-2022-natural-class.txt` lines 553–560, states Problem 4.8 (is the
seed's width-1 trace eventually periodic?) and says immediately before it that
the question "is probably equally difficult for all configurations of `N(Σ₂)`".
Jen 1990 Proposition 3 (line 288) and Kopra Theorem 3.5 (line 316) both conclude
"at most one" periodic column, which permits one, so neither forbids a coned
configuration from having a periodic centre column. Searched `sources/` for
`compact`, `König`, `limit point`, `Tychonoff`, `closed subset`, `eventually
periodic`, `at most one`, `arbitrary initial`, `periodic trace`, `permutive`.
The compactness argument itself is textbook.

**Route.** `evolveFrom_eq_of_agree_on_window` (closed) gives that each condition
is finitely determined; `evolve_left_edge` and `evolve_eq_false_of_outside_cone`
(both closed) give that row `N` of a coned picture is again coned. The one step
that is actually work is stating `C2(a)` and its compactness in Lean without
Mathlib's `Set` machinery fighting the `Config = ℤ → Bool` representation. Size
M as a node, and it proves nothing about rule 30 — it is a fence that stops the
next session from hunting a bound.

### C2. The cone alone bounds the block — for every word but the all-white one

**The claim.** In English: pin the centre column to a periodic word and solve
the picture leftward from columns 0 and 1, as `leftSolve` does. The demand that
every column left of `-a` be white at time 0 is then already unsatisfiable at a
finite depth, with no reference at all to what the right half of the
configuration does — except for the all-white word, where it never is. In the
project's vocabulary: with `leftSolve_eq_column` identifying `leftSolve c d k`
with `column X (-k)`, define

```
LB(w,a) = the largest j such that some prefix c₁(0..j-1) admits
          leftSolve (periodic w) c₁ a 0 = true  and
          leftSolve (periodic w) c₁ k 0 = false for every a < k ≤ j
```

then `f_w(a) ≤ LB(w,a) + 1`, and `LB(w,a)` is finite for every primitive word
of period at most 5 except `w = 0`.

**What it would give.** It is the residual of rung 3 in a strictly smaller
object: a statement about `leftSolve` — two columns and a backward recursion,
one Boolean constraint per column — with the right half of the configuration,
the damage front, and the latch all absent. Everything it needs is already
closed on the board: `sideways_inverse`, `leftSolve_eq_column`,
`evolve_left_edge`, `evolve_eq_false_of_outside_cone`. What would remain is the
combinatorial core: why the system is unsatisfiable, and at what depth.

**Falsification.** `explorer/talus12_leftdfs3.mjs`. Three controls run before any
number was read. (i) The sideways solver against the real automaton: 300 random
pictures, every solved column compared cell by cell against a forward
evolution, **90,000 cells, 0 wrong** (`explorer/talus12_leftdfs2.mjs` §V); and a
mutant control in `explorer/talus12_left.mjs`, where one black cell is planted
outside the cone, **4,000 caught, 0 missed**, with 4,000 genuine members of
`C2(a)` all accepted. (ii) Two independent implementations of the leftward
solve, bitmask and plain array, compared on **458,752 column-1 prefixes, 0
disagreements**. (iii) The bound must dominate the truth: over every primitive
word of period at most 5 and `a ≤ 13`, **663 cells where both the left-only
search and the exhaustive outward DFS are exhaustive, 0 violations of
`f ≤ LB + 1`**, tight at **293** of them, mean slack 4.85, worst 44 at
`w = 0010, a = 13`. Finiteness: over the same word set at
`a ∈ {1,2,3,5,8,12,16,20}` — 52 primitive words, 416 cells — **405 have a finite
left-only bound, 8 reach the depth cap 240, and 3 exhaust the node budget** (the
last three are unknown, not infinite). The 8 capped cells are exactly the eight
values of `a` for the all-white word.

*Distrust the result you like.* Three things could produce an empty left
solution set other than a mechanism, and each was checked. **First, the zero
configuration** — this morning's whole obstruction was about a search class that
secretly contained it, and the first version of this measurement contained it
again: "white at `x < -a`" admits the all-white configuration, whose centre
column is white for ever. Imposing `cell(-a,0) = black` is what `C2(a)` actually
says, and every number above has it imposed. It did **not** rescue the all-white
word, which caps with and without the constraint, so my first diagnosis of that
case was wrong and the reason is different: with the column white, the leftward
solve makes column `-1` equal to column 1, and the cone conditions are then a
satisfiable finite system in freely-chosen bits of column 1. **Second, the
counting heuristic** — `T` unknowns against `T-2-a` constraints predicts
`2^(a+2)` solutions, so an empty set looks like a `2^{-2^{a+2}}` event. That
framing is refuted; see §5. **Third, over-pruning** — controls (i) and (iii)
above.

What survives as the honest reading is the comparison against the linear rules.
Rules 90 and 150 are right-permutive as well as left-permutive; for them every
column-1 prefix is realisable by some right half (`|R| = 2^T` at `T = 10, 14,
18, 20`) and the left system has exactly the counted `2^(a+2)` solutions, so the
intersection never empties and the block is unbounded. For rule 30, `L` empties
at a finite depth instead — at `T = 14` for `w = 011, a = 6` and at `T = 18` for
`w = 100, a = 6`, where the linear rules hold `2^(a+2)` at every `T` measured —
and `|R|` runs 15 to 86 rather than `2^T` (`explorer/talus12_halves.mjs`). The
depth matters: rule 30's `L` is not empty at every `T` — it holds 128 prefixes at
`w = 100, a = 3, T = 16` (`explorer/talus12_null.mjs`) — only from some `T` on,
which is exactly what a finite bound means. So crystal 66's filter fires the right way and the finiteness is
created by the `OR` — see C4.

**Novelty.** **The solve itself is not mine and is not new; I wrote the opposite
sentence here before running the search, and the search took it out.** Meier and
Staffelbach 1991 use exactly this leftward solve as their attack on Wolfram's
rule-30 stream cipher: given the centre column and the right-adjacent column,
the whole left half of the computational history is uniquely determined, by
left-toggling. The paper is paywalled and not held; it is described in
`sources/spencer-2013-ca-cryptographic-generators.txt` lines 599–609 ("given
this temporal sequence, they showed that the left half of the CA's computational
history was uniquely determined if the right-adjacent sequence could be
guessed"), with the construction drawn as Spencer's own "left triangle" at lines
115, 963–964, 980–985, 1041–1048. It is already on this board as **crystal 9**,
under that name. What is not in either place is the use: Meier–Staffelbach solve
on a **ring** of `n` cells, where there is no cone at all, and their conclusion
is *recovery* of a seed from a known column. C2 runs the same solve on a coned
configuration, with the column **hypothesised periodic rather than known**, and
asks for **unsatisfiability** against the whiteness of the picture outside the
cone. Spencer's triangles are all ring constructions used for recovery; nowhere
in the held corpus is the solve combined with a cone. The other near neighbours
argue leftward from a periodic **pair** of adjacent columns and conclude "at most
one" — Jen 1990 Proposition 3 (line 288), Kopra 2022 Lemma 3.2 (line 253) — which
is a different hypothesis and a weaker conclusion. Condrey arXiv:2609.09431 is
the `w = 0` case in a different class, by the latch, the one case C2 does not
cover. Searched `sources/` for `leftward`, `sideways`, `left half`, `solve for`,
`solving leftward`, `left-asymptotic`, `left triangle`, `triangle`, `cone`,
`one-sided`, `infinite lattice`, `permutive`, `compact`, `damage`, `difference
pattern`, `regular region`, `constant prefix`, `block of length`.

**Route.** `leftSolve_eq_column` and `sideways_inverse` (both closed) put the
statement in the vocabulary; `evolve_left_edge` and
`evolve_eq_false_of_outside_cone` (closed) give the class. The one step that is
actually hard is the only step: showing the Boolean system is unsatisfiable. It
is not linear (see §2's dropped route), the depth at which it becomes
unsatisfiable is not predicted by anything measured — `LB` for `w = 100` runs
`6, 6, 15, 12, 24, 27, 39` at `a = 1,2,3,5,8,12,16` while for `w = 011` it runs
`1, 2, 4, 7, 16, 16, 25` — and no invariant is visible. So: a real route for the
statement, no route for the proof.

### C3. The right half can move the centre cell only through a white diagonal

**The claim.** In English: building the configuration outward by radius, the one
free datum at radius `k` is the cell at `(0, +k)`, and it changes the centre
cell at time `k` if and only if the centre cell at time `k-1` is white *and*
every cell of the anti-diagonal from `(0, k-1)` to `(k-2, 1)` is white. In the
project's vocabulary, the one-step half of it is the dual of
`rule30_left_local_law` and is a sixteen-case `decide`:

```
rule30_right_local_law (c d : Config) (i : ℤ)
  (h0 : c (i-1) = d (i-1)) (hc : c i = d i) (hr : c (i+1) ≠ d (i+1)) :
  rule30 c i ≠ rule30 d i ↔ c i = false
```

Its Bool-level content is checked rather than asserted:
`right_local_law` in `explorer/talus12_scratch_rung3.lean` proves
`∀ l c r r', (r30 l c r != r30 l c r') = (c == false && (r != r'))`, and it
depends on **no axioms at all**. The diagonal statement is that one-step law
iterated along a right diagonal,
with `column_succ_of_black` (closed) supplying the `col(k-1) = black` case
outright.

**What it would give.** It is the cause the brief asked for, and it is what
makes C2 the right place to work. Once the right half cannot move the column,
the surviving population is a multiplicity rather than a diversity: many
configurations carrying the same column, dying together. The observed
"one-level death" is that — at the death level every survivor holds the same
forced value and it is the wrong one.

**Falsification.** `explorer/talus12_cause.mjs`, five census runs
(`w/a = 011/8, 011/12, 100/10, 01/8, 00001/9`), every node of the exhaustive
tree. The predicted condition against the observed freedom: **0 mismatches**, at
every node of every run. The deepest level at which any survivor had any
freedom at all: **4, 4, 9, 7, 11** — against final depths 17, 17, 15, 17, 19. So
past a shallow level the centre column is a forced trajectory. The forced value
is very far from independent across survivors: at `011/8` level 16 the split is
144 against 624, at `00001/9` level 18 it is 676 against 1408, where independent
coins at those population sizes would give near-equal halves; and at the death
level the split is `1248/0`, `5324/0`, `320/0`, `104/0`, `1352/0`.

*Distrust the result you like.* The death level being unsplit is **tautological**
— a total death means every survivor agreed on the wrong value, so of course it
is unsplit, and I nearly wrote that as the finding. The non-tautological content
is the two numbers above it: that a population of 1248 can be unanimous at all,
and that when it is not, the split is lopsided rather than binomial. Also: about
half the levels *are* split (11 of 17, 13 of 17, 9 of 15, 7 of 17, 10 of 19), so
"the forced value is shared" is a tendency and not a law, and I am not claiming
more.

**Novelty.** New phrasing of known material. The one-step law is the mirror of
`rule30_left_local_law`, which is crystals A2 and is on the board; Wolfram 1986
§5 states the left version in words for the difference pattern of two random
rows. The diagonal iteration is the same argument as obstruction 6's front, read
along a right diagonal instead of a left one. Searched `sources/` for
`right-permutive`, `permutive`, `damage`, `difference pattern`, `front`,
`diagonal`.

**Route.** `rule30_right_local_law` is a size-S node, one `decide` after
unfolding `rule30_eq`, and sits under nothing. The iterated form needs an
induction along `rightDiagonal` and is size M. Neither reaches the wall; the
value is that it prices the right half out of the rung.

### C4. Crystal 66's filter, applied to finiteness itself

**The claim.** The finiteness of `f` is created by the failure of
right-permutivity. Rule 30 is left-permutive and not right-permutive; its
mirror 86 and the linear rules 90 and 150 are right-permutive, and for all three
of those the block is unbounded.

**What it would give.** The fence that crystal 66 exists to be. Any proposed
argument for a rung whose reasoning survives replacing `OR` by `XOR` is refuted
before its details matter, and now that is measured on this particular question
rather than inherited.

**Falsification.** `explorer/talus12_cause.mjs` §G, with a **general** search that
loops over `cell(-k)` and `cell(+k)` and computes the column, assuming no
permutivity in either direction — because the fast search solves for `cell(-k)`
and is legitimate only for a left-permutive rule, so its rule-86 row was
meaningless (see §5). Over seven `(word, a)` cases: rule 30 finite at all seven
(3, 5, 6, 5, 4, 4, 5); **rules 86, 90 and 150 run past the depth cap, reporting
47, at all seven**; rule 110, which is neither left- nor right-permutive, is finite on the
five non-constant words and unbounded on the two constant ones. Control: the
general search reproduces the fast one on 48 rule-30 cells with 0 disagreements.

*Distrust the result you like.* Rule 86 is rule 30's mirror, so it is this
project's standard orientation guard — and it is **not** a control for this
statement, because the mirror of a left-permutive rule is right-permutive, so 86
lands on the same side of the filter as 90 and 150 for a reason that has nothing
to do with rule 30's own asymmetry. What the filter shows is a three-rule
population on one side and a two-rule population on the other; the honest
reading is "right-permutivity is what breaks it", and rule 110's mixed behaviour
is the evidence that failing right-permutivity is necessary and not sufficient.

**Novelty.** Not new; it is crystal 66 applied. Schüle–Stoop 2012 (lines
579–589) define left- and right-permutivity and record that an ECA is positively
expansive only if it is both, which is the printed form of the dichotomy this
filter uses. Searched `sources/` for `right-permutiv`, `left-permutiv`,
`permutive` (hits in Wolfram 1986 line 385, Kopra lines 109–312, Schüle–Stoop
563–698, Condrey's Lean file) and `expansive` (65 hits in three files, all
inspected, all about the topological property rather than about a bound).

**Route.** No route needed; this is a filter, not a statement to prove.

### C5. The rung itself: `f(3,a)`, and the shape of the bound

**The claim.** `f(3,1) = 8`, `f(3,2) = 10`, `f(3,3) = 9`, and along the whole
exhaustive row `f(3,a) ≤ 2a + 6`.

**What it would give.** Rung 3 proved — `f(3,a) < ∞` for every `a` — would say
the centre column of rule 30 is not eventually periodic with period 3, and the
same for every coned configuration. Periods 1 and 2 are the rungs below it; this
is the first one nobody has.

**Falsification.** The row, exhaustive, from `explorer/talus12_ladder.mjs` and
`explorer/talus12_rung3deep.mjs`: `8, 10, 9, 9, 10, 14, 13, 17, 16, 15, 19, 18,
23, 24, 23, 22, 28, 27, 28, 32, 31, 30, 30, 31, 32` for `a = 1..25`, every cell
exhaustive (`a = 26` exhausted a budget of `1.2·10^9` nodes at depth 35).
**Kernel-verified**, not merely computed, at the first three cells of the row,
each in both directions — that no configuration reaches `f+1` and that one
reaches `f`:
`explorer/talus12_scratch_rung3.lean`, accepted by `lake env lean` with axioms
`[propext]` alone — `rung3_a1_no9`, `rung3_a1_yes8`, `rung3_a2_no11`,
`rung3_a2_yes10`, `rung3_a3_no10`, `rung3_a3_yes9`, plus `rung1_a3_no6` /
`rung1_a3_yes5` for the `p = 1` row. Each is a `decide` over every one of the
`2^(T+a-1)` configurations the light cone allows, in a packed-`Nat` row model
whose first eleven centre cells are checked against `11011100110`, which is
crystal 46's `settledCenter s(0..10)` on the board. The file carries
`mutant_a1_8_is_false`, which **proves** the same statement one cell shorter is
false rather than merely failing to prove it, so the check demonstrably can
fail.

*Distrust the result you like.* `2a + 6` is a fitted shape over a small range and
I am reporting it as one, exactly as the brief demands of `2p + 2a + 2`. The
range is `a = 1..25` at `p = 3`, **25 exhaustive cells, 0 violations**, tight at
`a = 1` and `a = 2` and nowhere else, with slack growing to 24 at `a = 25`. That
growing slack is the honest warning: the shape is fitted on the two smallest
cells and the data are drifting away from it, so `2a + 6` is very probably not
the truth — `f(3,a)/a` falls from 8 at `a = 1` to 1.28 at `a = 25` with no sign
of settling. The left-only bound of C2 cannot extend the test: at `a = 20` it is
56 for the word `010` alone, already above `2a + 6 = 46`, and two of the eight
period-3 words (`000`, and `100` where the node budget ran out) have no
left-only bound there at all.
Separately, and because the brief asked: `2p + 2a + 2` was re-tested on the
**extended** table, `p = 1..12` and `a = 1..18`, **188 exhaustive cells, 0
violations**, worst `f - (2p+2a+2) = 0` at `p = 2, a = 1`. It did not break. It
is still a fitted shape and two citations do not make it a law.

**Novelty.** The `p = 1` row is Condrey's, in a different class: `f(1,a) = a+2`
exactly for `a = 1..18`, against his `w + 2`, and split by word the all-white
column gives `2⌈a/2⌉ + 1` at all eleven values of `a ≤ 20` measured, which is his
centre-0 formula with the left radius in place of his support radius. The
classes differ — his is finite support on both sides, ours is unbounded on the
right — so the exact agreement is an observation worth recording and not a
citation of his theorem. `p ≥ 2` is not in print. Searched `sources/` for
`period 3`, `periodic with period`, `temporal sequence is periodic`, `not
eventually periodic`, `aperiodic`, `constant prefix`, `block of length`,
`initial segment`, `trace`, `block`. The last two are not clean negatives —
`trace` hits 65 times across Kopra, Schüle–Stoop and Boyle–Kitchens and `block`
61 times across nine files — and every hit was inspected: Kopra's are his
width-`w` trace theorems (never a fixed period), Jen's `temporal sequence` is
the same object with the "at most one" conclusion, Wolfram 1986's `period 3` at
lines 879–885 is a table of temporally periodic *configurations*, and
Spencer's `period 3` at line 1326 is about rules 90/165. None fixes a period
and asks how long a block can be.

**Route.** Through C2: the rung is a left-only statement. The hard step is C2's
hard step.

## 4. What survived

C1 survived and is the session's answer to the question the brief named as its
priority: the death is **compactness** — that is exactly what converts "a finite
bound of any shape" into "no such configuration exists" — and the price of the
conversion is that the resulting statement is Kopra's family question, which he
prices in print at P1's own difficulty. So the shape of the bound genuinely
stops mattering, and the target that is left is not cheaper than the prize. C2
survived falsification and the novelty search and is the one I would seed first,
because it is the only thing here that makes a rung *smaller* rather than
merely restated: it removes the right half of the configuration from the
problem entirely, it is exact at 293 of 663 cells, and everything it is phrased
in is already closed on the board. C3 survived and is the cause the brief asked
for, with the caveat that half of its content is tautological and I have marked
which half. C4 is a filter and survived as one. C5's three cells are now kernel
facts; its `2a + 6` is a fitted shape and is labelled as one. The claim I most
wanted — that an empty left solution set is an improbable event — did not
survive its null, and is in §5.

## 5. Claims that died

- **"`|L| = 0` is a `2^{-2^{a+2}}` event, so it is a mechanism rather than a
  coincidence."** Mine, and the sentence I most wanted to keep. The counting
  heuristic is `T` unknowns against `T-2-a` constraints, so `2^(a+2)` solutions
  expected, and rules 90 and 150 hit that number exactly. Dies against a
  population null: replace rule 30's leftward step `G(x,y,z) = x ⊕ (y ∨ z)` by
  each of the 256 three-argument Boolean functions and **130 to 198 of them give
  an empty `L`**, with the population median 0, at all five `(word, a)` tested
  (`explorer/talus12_null.mjs`). An empty solution set is the *typical* outcome
  for a system of this shape, not a rare one. What survives is the narrower
  comparison in C2: rule 30's `L` empties at a finite depth, where the two linear
  rules hold exactly the counted `2^(a+2)` at every depth measured.
- **"The single-column leftward solve against the cone is new, and nobody in the
  held corpus runs it."** Mine, written into C2's novelty paragraph **before** the
  search it claimed to report. Dies on the first grep for `leftward`: the solve
  is Meier–Staffelbach 1991's attack on Wolfram's rule-30 cipher, described in
  `sources/spencer-2013-ca-cryptographic-generators.txt` lines 599–609 and drawn
  as Spencer's "left triangle" at lines 963–985, and it is already on this board
  as crystal 9. What survives of C2 after the correction is the *use* — a coned
  class rather than a ring, a hypothesised rather than a known column, and
  unsatisfiability rather than recovery — which is narrower than what I wrote and
  is what C2 now claims. My own notebook already says a search sentence is a
  measurement and must be run before it is typed; this is the second session in
  which I have typed one first, and the only reason nothing false shipped is the
  proof-reading pass that re-runs every such sentence.
- **The rule-86 row of the first filter run.** `explorer/talus12_branch.mjs`
  reports `f = cap` for rules 86, 90 and 150, and the rule-86 entry is
  meaningless: that search solves for `cell(-k)` from the wanted column value,
  which assumes left-permutivity, and rule 86 is right-permutive instead. Redone
  with a general search in `explorer/talus12_cause.mjs`; the answer happened to
  be the same, which is luck and not vindication.
- **"Imposing the black cell at `-a` will rescue the all-white word."** Mine,
  from diagnosing the zero configuration correctly in general and then applying
  it to the wrong case. Dies at every `a` from 1 to 20: the left-only search caps
  at depth 240 with the constraint and without it, identically
  (`explorer/talus12_leftdfs3.mjs` §S). The reason is different — with the column
  white, `sideways_inverse` makes column `-1` equal to column 1, and the cone
  conditions become a satisfiable finite system in freely chosen bits of column
  1. The all-white word is killed by the right half's latch, not by the cone.
- **The self-similar linear reduction for `w = 011`.** Columns `-1` and `-4` both
  have the form `(y_m, 0, 1)` with `y^{j+1}_m = y^j_m ⊕ y^j_{m+1} ⊕ 1`, which
  would make the cone conditions `⊕_{i ⊆ j} u_i = 1` — solvable for every `j`
  by the Möbius transform, hence every rung false. Dies at the next step: the
  recursion from `-4` to `-7` is driven by the pair `(col(-4), col(-3))`, and
  `col(-3) = (x_m, ¬x_{m+1}, ¬x_{m+1})` is not of the same shape as `col(0)`, so
  there is no self-similarity and ORs of two unknowns appear at `col(-5)`. Died
  on paper, against the measured `|L| = 0` that contradicted it.
- **My typed prefix of the seed's centre column.** The Lean file asserted
  `1 1 0 1 1 1 0 1` and the kernel proved it false; the truth is
  `1 1 0 1 1 1 0 0 1 1 0`, confirmed by two independent engines
  (`explorer/talus12_seedprint.mjs`) and equal to crystal 46's `settledCenter
  s(0..10)`. This is the second session running in which I have typed a prefix of
  A051023 from memory and been wrong about it.
- **"Mean offspring is exactly 1, so the surviving set is a critical branching
  process and dies almost surely."** True as arithmetic — a survivor has 2, 0 or
  1 children according as the forced column value is constant-and-right,
  constant-and-wrong, or steerable, and averaging over the two possible required
  values gives 1 in every case — and it explains nothing, because the offspring
  counts are not independent across survivors: C3 measures splits of 144 against
  624 where independence would give near-equal halves. A branching-process
  reading of a deterministic tree is a null model, not a mechanism, and this one
  is refuted by its own correlations.
- Nothing died for lack of depth. Every death above has a witness computed or a
  kernel refutation rather than a search that ran out.

## 6. Next topic

**Prove the left-only reduction for one word, or find the invariant that makes
it fail to be provable.** C2 says rung 3 — and every rung except the all-white
one — is a statement about `leftSolve` alone: pin the centre column to a periodic
word, solve leftward from columns 0 and 1, and show that the demand "white at
time 0 outside the cone" is unsatisfiable. That target is strictly smaller than
anything else on this board aimed at P1: it has no right half in it, no damage
front, no latch, and it is exact at 293 of the 663 cells where it was measured
against the truth. The concrete next session is the single word `w = 011` at
general `a`, because §2's dropped route already worked out columns `-1` through
`-4` by hand and found the exact place the linear shape breaks — `col(-3)` is not
of `col(0)`'s form, so the fourth step introduces an OR of two unknowns. That is
one algebraic step, in a system with one free bit per period and one constraint
per column, and either it can be closed by an invariant on the pair
`(col(-3k-1), col(-3k))` or the obstruction to closing it is the thing to write
down. Do **not** take the whole ladder as the target: C1 shows that is Kopra's
family question, and he says in print it is probably as hard as the prize.
