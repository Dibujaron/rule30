# The left-only reduction for one word: `w = 011` at general `a`

Talus, theorist, 2026-09-12.

## 1. The residual, in one paragraph

**Band, plainly: project-internal**, and the deliverable is the obstruction
rather than the invariant. Two things here are provable and new-but-tiny — an
exact closed form for the six cells of row 0 nearest the origin on the left under
a period-3 centre column, kernel-proved with clean axioms (C1), and the
*invisibility lemma* that the whole left half depends on column 1 only at the
centre column's white times (C4) — and a mathematician would call both routine,
the first a ten-minute computation and the second an induction over two closed
nodes. Everything else in the session closes a route. One number in §6 could be
worth more than project-internal if it survives depth, and it is offered there as
the next topic rather than as a claim, because four data points is four data
points.

**The left-edge trap, explicitly, because the brief asked.** I am not in it, and
the check is not the sentence the brief was suspicious of. The objects here are
column 0 (pinned to the periodic word), column 1 (free), and **row 0 read
leftward** — `cell(-1,0), cell(-2,0), …`. Row 0 is the initial condition, not a
diagonal: `leftDiagonal k j = evolve (j+k) (-j)` never reaches time 0 at a
negative position, so no statement in this document is about `leftDiagonal` at
any `k`, large or small, and none is about the settled region where periodicity
is already proved. What the reduction *does* land on is the other standing
hazard, and I should name it rather than the one I dodged: solving leftward from
a periodic column and demanding row 0 be white past `-a` is exactly the
hypothesis of Jen's Proposition 3 and Kopra's Theorem 3.5 — the cone — so the
reduction ends where every P1 route ends, at a statement about a configuration
that is white far to the left. It is smaller than the rung, and it is in the
same country.

**The residual.** Pin the centre column to the word `011` repeating and let
column 1 be free. The sideways solve (`sideways_inverse`, `leftSolve_eq_column`;
Meier–Staffelbach's leftward solve, crystal 9) then reconstructs the whole left
half of the picture, and in particular row 0 at every negative position. Call

> `W_k := cell(-k, 0)`, the **cone word**,

which is row 0 read leftward. The rung at this word and this `a` is exactly the
claim that

> the word `0^(a-1) 1 0 0 0 …` is **not** in the image of the map from column 1
> to the cone word.

Three facts make that a clean question and one of them makes it a hard one. The
map is **injective** on the bits that matter, and the bits that matter are the
values of column 1 at the **white** times of the centre column — one per period,
because a black centre cell swallows column 1 through the `OR`. So the image of
the first `K` columns has exactly `2^⌈K/3⌉` points inside `{0,1}^K`, a set of
density `2^(-2K/3)`. The rung asks that a specific point lie outside that set,
for every `a`. And the image has no structure to hang an argument on: it
satisfies exactly **three** affine relations, all of them living on columns 1
to 6, at every depth measured to column 45; its residual language needs an
unbounded number of states; and the depth `D(a)` to which the target word *is*
matched sits inside the spread of a random image with the same free-bit rate.
So what would have to be true for the rung to fall is that something beyond
counting rules the image, and this session's measurements say there is nothing
beyond counting.

## 2. Why the known routes fail

**"The cone bounds an alternating centre column and not a single-colour one"**
(obstructions, mine, this morning) established that the `p = 2` bound is a
dimension count rather than a rigidity. Its "what it would take" asked for a
two-step latch on column 1; my rung-3 document withdrew that, and this session
says why in a sharper form: the count is not a heuristic here, it is the exact
structure — `2^⌈K/3⌉` points in `{0,1}^K` — and there is nothing else.

**"The period ladder's finiteness question is Kopra's family question"**
(obstructions, mine, this evening) is the fence that keeps this topic to one
word and one rung. It stands untouched.

**Obstruction 9** ("an eventually periodic centre column does not force another
periodic column") is the reason the cone is in the statement at all: drop it and
the family version is outright false. Nothing here drops it.

**Crystal 9** (Meier–Staffelbach: two adjacent complete columns determine
everything to their left) is the machinery, and it is closed on the board as
`leftSolve_eq_column`. It supplies the reduction and no bound: in its own
setting it is a recovery result on a ring, where there is no cone to contradict.

**Crystal 66's filter** is the one route-test that fires *for* this work rather
than against it, and §3's C4 runs it: replacing the `OR` by `XOR` makes every
column-1 bit visible, so each new column introduces a fresh free bit and the map
onto cone words is a bijection — measured as all four of rules 90, 105, 150 and
165 running past the depth cap at every `a` tried, where every other
left-permutive rule is finite. So the finiteness is created by the `OR`, and the
`XOR` rules fail it for a reason visible in one line rather than only in a table.
That is the only sense in
which anything here is about rule 30 rather than about elementary CAs in
general, and C4 says exactly how small that sense is.

**Obstruction 7** and **"A universal bound on the recurrence's hitting times"**
are the shape that has killed four routes on this board: a survival a coin would
also produce. C5 runs that test on this topic's own central quantity and the
answer is the same shape. That is the session's result.

**A route I worked and dropped, and it is the brief's own.** The brief asked for
an invariant on the pair `(col(-3k-1), col(-3k))`, because `col(-1)` and
`col(-4)` both have the shape `(·, 0, 1)` over a period, with the second's free
bit an affine function of the first's. The shape does not recur: over an
exhaustive sweep of all `2^10` assignments, `col(-k)` has residues 1 and 2
constant in `m` **only at `k = 1` and `k = 4`**, and at no other `k ≤ 22`
(`explorer/talus13_invariant.mjs`, block `[P]`). Column `-3` is
`(x_m, ¬x_{m+1}, ¬x_{m+1})`, which is not `col(0)`'s shape, so the pair never
returns to its starting form and the recursion is not self-similar; the `OR` of
two unknowns appears at `col(-5)`. The algebraic consequence is measured rather
than argued: the constraint polynomial at column `k`, in algebraic normal form
over the free bits, is affine only at `k = 1, 2, 3, 4, 7` and by `k = 32` has
degree 9 in 10 variables with 501 monomials, against the **512** a uniformly
random function of 10 variables averages (`explorer/talus13_anf.mjs`).

**New dead end appended to `docs/obstructions.md`**: "The left-only reduction is
exact, and its algebra is three relations on six cells and then nothing".

## 3. Candidate claims

### C1. The closed form: six cells of row 0 from two bits, and exactly three relations

**The claim.** In English: if a configuration's centre column begins
`0 1 1 0 1 1 0` — the period-3 word `011` for seven steps — then the six cells of
row 0 at `x = -1 … -6` are an explicit function of just **two** bits of column 1,
namely its values at the two white centre times `0` and `3`. Writing
`p = column X 1 0` and `q = column X 1 3`:

```
cell(-1,0) = cell(-2,0) = cell(-3,0) = ¬p
cell(-4,0) = q ⊕ ¬p
cell(-5,0) = cell(-4,0) ∨ ¬p
cell(-6,0) = ¬q ⊕ cell(-5,0)
```

Consequently the cone word satisfies exactly three independent affine relations
on those columns — `W₁+W₂ = 0`, `W₂+W₃ = 0`, `W₁+W₄+W₅+W₆ = 1` — **and no
fourth**, and these are the whole of the linear structure at every depth
measured. In the project's vocabulary the hypotheses are `column X 0 t` for
`t = 0…6` and the conclusions are `column X (-k) 0` for `k = 1…6`; the proof
runs on `sideways_inverse` in the form `leftSolve_eq_column` uses.

**What it would give.** It is the invariant the brief hoped for, delivered and
then bounded. It settles the rung at `a = 1, 2, 3, 4` outright — for `a = 1` and
`a = 2` because `W₁ = W₂ = W₃` contradicts a black cell followed immediately by
a white one, and for `a = 3` and `a = 4` because `W₅ = W₄ ∨ ¬p` is forced black
whenever `W₃` or `W₄` is the black cone edge. It gives nothing at `a ≥ 5`,
because `W₄, W₅, W₆` are then unconstrained.

**Falsification.** Kernel, not script: `explorer/talus13_scratch_cone.lean`,
accepted by `lake env lean`. `cone_w011_closed_form`, `cone_w011_relations`,
`cone_w011_a1`, `cone_w011_a2`, `cone_w011_a3`, `cone_w011_a4` all print axioms
`[propext, Quot.sound]`; `cone_w011_relation_space_dim_three`,
`cone_w011_relation_generators` and `no_fourth_relation` print `[propext]`;
`cone_w011_image_has_four_points` depends on no axioms at all. The relation space
is enumerated by the kernel over all 64 linear functionals on the six cells and
has exactly `8 = 2³` constant ones, listed as `[0,3,5,6,57,58,60,63]`.

*Distrust the result you like.* Four things could produce this besides the
statement being true, and each was checked. **(i) A vacuous theorem.** The
hypotheses are satisfiable and the conclusion is not constant:
`cone_w011_image_has_four_points` proves by kernel evaluation that the four
`(p,q)` give four distinct rows, so the closed form has content in both bits.
**(ii) A check that cannot fail.** `explorer/talus13_scratch_mutant.lean` is the
same proof with the `-5` clause weakened from `(q ⊕ ¬p) ∨ ¬p` to `(q ⊕ ¬p)` —
dropping the `OR` the rule creates — and Lean rejects it, at that clause and
nowhere else, in the case `p = false, q = true`, which is exactly where the `OR`
bites. **(iii) A Lean statement that is not about the engine's object.** The
engine and the kernel file were written from different derivations and agree:
`explorer/talus13_control.mjs` block `[X]` evaluates the closed form and the
solver at all four `(p,q)` on columns 1..6, **0 mismatches**. **(iv) The
relation count being an artefact of depth 6.** It is not: an independent
Gaussian elimination over the image at `K = 3, 6, …, 45` returns
`2, 3, 3, 3, …, 3` independent relations while a subspace of the same size would
need `2, 4, 6, …, 31` (`explorer/talus13_null.mjs`, block `[L]`, which also
prints the same three generators at `K = 12` that the kernel prints at `K = 6`).

**Novelty.** New as a written statement, and small. The machinery is crystal 9,
which is Meier–Staffelbach 1991 via
`sources/spencer-2013-ca-cryptographic-generators.txt` lines 599–609 and
963–985, run on a ring for recovery rather than on a cone for unsatisfiability.
Condrey arXiv:2609.09431 does the `w = 0` case in a different class, by the
right half's latch. Searched `sources/` for `leftward`, `left triangle`,
`sideways`, `solve for`, `period 3`, `periodic with period`, `temporal
sequence`, `initial row`, `row zero`, `reconstruct`, `preimage`, `affine
relation`, `linear relation`, `algebraic normal form`, `ANF`, `degree of the
polynomial`. The nearest statements in print are about a *pair* of adjacent
periodic columns concluding "at most one" (Jen 1990 Proposition 3, line 288;
Kopra 2022 Lemma 3.2, line 253), which is a different hypothesis and a weaker
conclusion. Nothing in the held corpus writes down the first cells of row 0 as a
function of a hypothesised periodic column.

**Route.** `sideways_inverse` and `leftSolve_eq_column` are closed on the board;
the proof is six applications of the leftward step and a Boolean case split on
two bits — about ninety lines as written, all of it bookkeeping, so **size M**
rather than the S it looks like from the statement. It is honest supply, and it
does not reach the rung:
a node whose `DOES NOT PROVE` field would read "settles the rung at `a ≤ 4` and
nothing beyond, because the relation space is three-dimensional and stops".

### C2. The reduction is exact, and the rung is a sparse-image miss

**The claim.** The map from column 1 to the cone word is injective on the bits
that matter, and the bits that matter number exactly `⌈K/3⌉` by column `K`. So
the achievable rows of length `K` are exactly `2^⌈K/3⌉` of the `2^K` words, and

> rung 3 at the word `011` and support radius `a` is the statement that the
> single word `0^(a-1) 1 0^(K-a)` avoids that set, for every `K`.

In the project's vocabulary: with `f_w(a)` the longest block from time 0 over
which a configuration white at `x < -a` and black at `-a` has centre column `w`
repeating, and `D(a)` the deepest column the cone constraints reach,
`f_w(a) ≤ D(a) + 1`.

**What it would give.** It is the reduction the topic is named for, made exact.
The right half of the configuration, the damage front and the latch are all
absent; what remains is one Boolean system with one free bit per period and one
constraint per column. Anything proving `D(a) < ∞` for every `a` proves rung 3
at this word.

**Falsification.** `explorer/talus13_image.mjs`, `talus13_nerode.mjs`,
`talus13_null3.mjs`, `talus13_dominate.mjs`. The solver first:
`explorer/talus13_w011.mjs` block `[V]` compares every solved column against a
forward evolution of 300 random pictures — **245,100 cells, 0 wrong** — and the
same file runs a mutant solver with `AND` for `OR`, which is wrong on 7,904 of
16,340 cells, so the comparison can fail. `explorer/talus13_nerode.mjs` block
`[V]` checks the solved triangle against the *forward* rule at every interior
cell, **124,200 cells, 0 wrong**. Injectivity: `|image_K| = 2^⌈K/3⌉` exactly at
every `K ≤ 30` over all `2^13` assignments (`talus13_image.mjs`, block `[I]`),
and the dependence measurement independently gives `n(K) = ⌈K/3⌉` at every
`K ≤ 45` with `|image_K| = 2^n(K)` verified at every `K ≤ 33`
(`talus13_null3.mjs`). Domination: `f_011(a) ≤ D(a) + 1` at **24 of 24
exhaustive cells, 0 violations, tight at 13 of them**, worst slack 9 at `a = 24`
(`talus13_dominate.mjs`), where `f` comes from the outward DFS over
configurations by radius — a second engine sharing no code with the leftward
solve. `D(a)` itself is exact at every `a ≤ 60`, no cap and no budget
exhaustion: for `w = 011` it runs
`1, 2, 4, 4, 7, 8, 10, 16, 10, 11, 17, 16, 16, 20, 17, 25, 22, 26, 23, 31, 31,
32, 32, 37, 37, 37, 40, 41, 47, 44, 49, 44, 46, 46, 49, 52, 53, 56, 55, 59` for
`a = 1…40` and reaches 80 at `a = 60`, with worst ratio `D(a)/a = 2.000` at
`a = 8`.

*Distrust the result you like.* An exhaustive search reporting a finite maximum
is either right or over-pruning, and the domination control is the test that
separates them: the left-only bound must never fall below the truth computed by
a different engine, and at 13 of 24 cells it is exactly equal, which an
over-pruning solver could not manage. Separately, the black cell at `-a` is a
real constraint and not decoration: dropping it raises `D` at `a = 3, 9, 12` and
leaves it unchanged at `a = 6, 16, 20` (`talus13_dominate.mjs`, block `[M]`), so
a domination check against the weaker solver would have been no evidence. And
the off-by-one matters and I had it wrong this morning: my rung-3 document's
`LB` counted the column *about to be* tested, so `LB = D + 1` and its stated
`f ≤ LB + 1` is one weaker than the truth `f ≤ D + 1` measured here.

**Novelty.** The reduction is crystal 9's solve on a coned class, which my own
obstruction entry of this evening already records; what is new here is the
exactness — injectivity and the count `2^⌈K/3⌉`. **The nearest thing in print is
much nearer than I expected and I found it only on the proof-reading pass**:
Meier and Staffelbach count the same quantity on a *ring*, and Spencer reports it
at `sources/spencer-2013-ca-cryptographic-generators.txt` lines 986–988 — "for
`n = 300`, the center temporal sequence of a uniform rule 30 CA requires about 18
bits of entropy to guess a compatible seed". That is the same phenomenon,
measured: a known column leaves a small residual freedom, and the freedom is the
column-1 bits the `OR` hides. What is different here is the object — a cone
rather than a ring, a *hypothesised periodic* column rather than a known one, and
the count taken as a function of depth rather than at one `n`. Searched
`sources/` for `image`, `injective`, `one-to-one`, `count of configurations`,
`number of initial`, `equal number`, `preimage`, `Garden of Eden`, `surjective`,
`reachable`, `density of`; every hit inspected. `preimage` is 41 hits and all of
them are Fukś 2013's subject, the preimages of a *block* under one step, which is
crystals 3 and 36; `number of initial` is Wolfram 1986 lines 466 and 654 and
Spencer 1142, the first being crystal 40's print source and the last being
Spencer's own Proposition 4.1, discussed under C4.

**Route.** No route to a proof; the statement is the reduction and the proof is
the rung. What it removes from the rung is the right half, and that removal is
C3 of my rung-3 document, already measured at 0 mismatches.

### C3. There is no finite-state invariant: the Nerode width grows

**The claim.** The language of achievable cone words needs an unbounded number
of states. Precisely, the number of distinct residual sets among achievable
prefixes of length `K` — the Nerode width, which is the number of states any
automaton recognising the language must have at that level — grows by a factor
of about `1.78` every three columns and shows no sign of saturating.

**What it would give.** It is the negative form of the brief's question. An
invariant on the pair `(col(-3k-1), col(-3k))`, or on any bounded amount of
state, would give a finite automaton for the cone language, and then the rung
would be decidable by inspecting that automaton. There is no such automaton.

**Falsification.** `explorer/talus13_null.mjs`, block `[N]`, over all `2^18`
assignments. At lookahead `d = 9`, the widths at `K = 3, 6, …, 45` are
`2, 3, 5, 9, 17, 32, 59, 110, 199, 357, 639, 1137, 2032, 3614, 6448`. The
control that makes this mean something is **lookahead stability**: the same
computation at `d = 15` and `d = 21` gives *identical* numbers at every `K` where
all three are defined, so the width is a property of the language and not of the
window. Without that control the measurement lies in the direction that would
have pleased me: `explorer/talus13_nerode.mjs` ran the same thing with the
lookahead *shrinking* as `K` grew and reported the width collapsing from 359 at
`K = 28` to 64 at `K = 31` — which is the instrument running out of suffixes to
distinguish with, not the language becoming simple.

*Distrust the result you like.* The width is a growing but shrinking *fraction*
of the image: `6448 / 2^14 = 0.39` at `K = 45` against `0.75` at `K = 6`, and
that fraction is falling monotonically. So "the width is unbounded" is what the
data support and "the width is a constant fraction of the image" is not; if the
fraction fell fast enough the width could in principle saturate, and 15 points
over a factor of 3000 is not a proof that it does not. What is solid is that no
bounded automaton fits the first 45 columns.

**Novelty.** The instrument is the one Sextant used on the reachable-row language
in the `4^-t` document (obstruction, 2026-09-12), where the analogous answer was
a finite automaton per depth and no uniform one; this is the same measurement on
a different language, with the same verdict. Searched `sources/` for `Nerode`,
`Myhill`, `sofic`, `regular language`, `finite automat`, `state complexity`,
`factor complexity` — **zero hits across the whole corpus** — and `subshift of
finite type`. `automaton` is unusable as a search term here: 230 hits across ten
files, all of them "cellular automaton". Kůrka's notes have the
general theory of sofic traces; nothing in print treats this language.

**Route.** No route. It is a fence.

### C4. The invisibility lemma, and the rule control that prices it

**The claim, in two parts.** *The lemma:* the entire left half of the picture is
a function of the centre column together with column 1 read **only at the white
times of the centre column**. When `column X 0 t` is black, `c ∨ r` is black
whatever `column X 1 t` holds, so that bit never reaches `leftSolve`. In the
project's vocabulary, `column X (-k) t` is determined by `column X 0` and
`fun t => if column X 0 t then false else column X 1 t`. *The control:* that
deficit is what makes `D(a)` finite, and among the sixteen left-permutive
elementary rules — the only ones for which the leftward solve is even defined —
exactly the four with *full* visibility give an unbounded `D`: rules 90, 105, 150
and 165, whose local map is affine in the right neighbour at both centre values.

**What it would give.** The lemma is the one thing under this rung that is
provable, statable and load-bearing: every count in this document is an instance
of it, and it makes crystal 66's filter a theorem here rather than a habit. The
control is the filter run on this topic's own central quantity rather than
inherited, so any proposed argument whose reasoning survives `OR → XOR` is
refuted before its details matter.

**Falsification of the lemma.** `explorer/talus13_sharehalf.mjs`, block `[V]`:
4,000 random pairs of column-1 sequences that agree at the seed's white times and
are free at its black times, against the seed's own centre column — **0 pairs
give a different row 0 on the left**. And the check can fail: flipping a single
*white*-time bit instead changes the left row in **400 of 400** trials.

**Falsification of the control.** `explorer/talus13_invariant.mjs`, block `[C]`.
Writing a
left-permutive rule as `R(l,c,r) = l ⊕ g(c,r)`, the free-bit rate for `w = 011`
is the number of the three period positions at which `g` depends on `r`. Rate
`3/3`: rules 90, 105, 150, 165 — all three of `D(6)`, `D(9)`, `D(12)` run past
the depth cap 300. Rate `2/3`: rules 75, 120, 135, 180 — finite, `9–12`, `12–24`,
`15–36`. Rate `1/3` (rule 30's class): rules 30, 45, 210, 225 — finite, `5–11`,
`8–10`, `11–16`. Rate `0/3`: rules 15, 60, 195, 240 — finite. The rule numbering
is checked inside the file: `g = c ∨ r` gives 30, `g = r` gives 90, `g = c ⊕ r`
gives 150, `g = c` gives 60.

*Distrust the result you like.* On the lemma: it is a statement about the
**solve**, not about which configurations exist, so the 4,000 pairs are arbitrary
column-1 sequences rather than realisable ones — which is correct for what is
claimed and says nothing whatever about which `(c, r|white)` pairs actually occur
in a picture. That second question is §6's, and its answer is different and more
interesting. On the control: **the honest reading is that the finiteness is
not a property of rule 30.** Twelve of the sixteen left-permutive rules have it,
so a statement that "the cone bounds the block" is a statement about
elementary CAs with a free-bit deficit, not about rule 30 — this is exactly what
the brief's `rowan_rulecontrol.mjs` is for, and the answer here is "12 of 16",
which is the bad end of that instrument's scale. What *is* specific is the
identity of the four exceptions: they are the affine ones, so crystal 66's filter
fires the right way and an `OR`-blind argument is refuted. Note also that
`rowan_rulecontrol.mjs` itself cannot be run on this claim: it grows the seed's
centre column over all 256 rules, and the leftward solve requires
left-permutivity, so the population of sixteen used here is the largest one on
which the statement is even well-posed. And rule 86, this project's standard
orientation guard, is not a control here for the reason my rung-3 document
already records: the mirror of a left-permutive rule is right-permutive, so 86
lands with 90 and 150 for a reason unrelated to rule 30's asymmetry.

**Novelty.** **Both halves are in print and I found the sharper one only on the
proof-reading pass, which is the reason that pass exists.** The affine branch is
Spencer 2013 **Proposition 4.1** (lines 1133–1141): for a hybrid linear CA over
*exactly* rules `{90, 105, 150, 165}`, "since each transition function is affine,
both the right and left triangles are easily solved for, resulting in a full
initial state. This state necessarily produces σ, regardless of the choice of ρ"
— i.e. the right-adjacent sequence is free and every choice reproduces the given
temporal sequence, which is my rate-`3/3` row, on a ring. The rule-30 branch is
his **Proposition 3.4** (lines 1005–1027), that a black cell of the temporal
sequence determines its left neighbour from the sequence alone; that is the
board's `column_succ_of_black` and crystal 39, and it is the one-step form of the
invisibility. What is not in either place is the **classification**: that the two
propositions are the two ends of one scale, that the scale is the free-bit rate
`q/p`, and that among all sixteen left-permutive rules it is exactly Spencer's
four that are unbounded for the cone problem. Schüle–Stoop 2012 lines 579–589
define left- and right-permutivity, which is the vocabulary. Searched `sources/`
for `permutive`, `right-permutiv`, `left-permutiv`, `affine`, `linear CA`,
`hybrid`, `temporal sequence`, `right-adjacent`, `left-adjacent`; the 99 `affine`
/ `hybrid` hits are all Spencer's §4, which is where Proposition 4.1 sits and
which I read.

**Route.** The lemma is the composition of two closed nodes —
`column_succ_of_black` at the black times, `column_one_of_white` at the white
ones — with `leftSolve_eq_column`, by induction on `k`. Size S or M, no hard
step, and it sits under nothing. The control needs no route; it is a filter.

### C5. `D(a)` sits inside a random null — the obstruction

**The claim.** Replace the cone map by a *random* map with the same free-bit
arrival profile — an independent uniform bit at each column for each prefix of
the `⌈K/3⌉` bits available there — and measure how deep the target word
`0^(a-1) 1 0 …` is matched. Rule 30's `D(a)` lies inside that null's full range
at every `a` measured, and inside its inter-quartile range at five of the seven.
So the rung at this word is true for the reason a random
sparse image misses a fixed point, and no argument that only counts can be a
proof of it.

**What it would give.** It is the obstruction the brief asked to have written as
carefully as a proof. If it holds, a proof of the rung must use something the
null does not have, and C1 says what little that is: three affine relations on
six cells, which decide `a ≤ 4` and stop.

**Falsification.** `explorer/talus13_null3.mjs`, 200 draws at each `a`:

| `a` | rule 30's `D(a)` | null min | p25 | median | p75 | max | draws `≥` rule 30 |
|---|---|---|---|---|---|---|---|
| 10 | 11 | 10 | 13 | 14 | 16 | 25 | 198/200 |
| 16 | 25 | 19 | 22 | 23 | 25 | 34 | 60/200 |
| 20 | 31 | 24 | 28 | 29 | 31 | 39 | 58/200 |
| 24 | 37 | 30 | 34 | 35 | 37 | 48 | 69/200 |
| 28 | 41 | 37 | 40 | 41 | 43 | 55 | 135/200 |
| 34 | 46 | 45 | 49 | 50 | 52 | 61 | 199/200 |
| 40 | 59 | 53 | 58 | 59 | 62 | 66 | 116/200 |

Rule 30 is inside the null's inter-quartile range at five of the seven, and at
the bottom of it at `a = 10` and `a = 34`. There is no systematic offset: the
percentiles run `1, 70, 71, 66, 33, 0.5, 42`, median 42. **Nothing in `D(a)`
demands a mechanism.** The null's own control is printed first, because the
previous two attempts at it were broken: `explorer/talus13_control.mjs` built the
random map from a hash of `(column, prefix)` whose low bit depended almost
entirely on the prefix's low bit, and returned the **same** `D(a)` in all 40
draws at every `a`; `explorer/talus13_null2.mjs` replaced the hash with a table
and crashed on `1 << 31`. Both are kept in the tree. The version that counts uses
an explicit table of uniform bits, one per `(column, prefix)`, indexed exactly,
with the depth capped at 66 so that no index exceeds 22 bits, and it prints the
number of distinct values the null takes before any comparison is made.

*Distrust the result you like.* Two caveats, and the first is the one that could
overturn the reading. **The null's columns are independent and the real ones are
not**, provably: the three relations of C1 are exact dependences among columns 1
to 6. So the null is wrong at small `K` in a direction that *helps* rule 30 look
typical, and the agreement is only meaningful at `a` large enough that those six
columns are a small part of the system. **And a null that a quantity sits inside
is weaker evidence than a null it sits outside**: what is established is that
nothing in `D(a)` demands a mechanism, not that no mechanism exists.

**Novelty.** Not a claim about the literature; a null model. The shape is
obstruction 7's and the hitting-time obstruction's, applied to a new quantity.

**Route.** No route, and that is the point.

## 4. What survived

All five, and the shape of the session is that C1 is the invariant the brief
asked for and C3 and C5 are the reason it is the last one. **C1 is what I would seed
first**, as a size-M node whose `DOES NOT PROVE` field says it settles `a ≤ 4`
and stops, because it is kernel-proved, it is the only provable thing here, and
it converts "the brief hoped for an invariant on the pair" into "here is the
complete invariant, it is three-dimensional, and the kernel has enumerated
everything else away". **C2 is the reduction made exact** and is the honest
statement of what the topic bought: the right half really is gone, the free bits
really are one per period, and the rung really is a sparse-image miss — with
`f_011(a) ≤ D(a) + 1` tight at 13 of 24 exhaustive cells, which is 54% against
the 44% (293 of 663) this instrument managed across all words this morning, and
one constant sharper. **C3 and C5 are the obstruction**: no
finite-state invariant fits the first 45 columns, and the depth the target word
reaches is what a random image of the same density reaches. **C4 is the
mechanism and the price of it.** Its lemma — the left half depends on column 1
only at the centre column's white times — is the one statement under this rung
that is provable, load-bearing and not yet on the board, and it is the piece I
would seed second and arguably first — C1 is that lemma made explicit at one word
and six columns, so the lemma is the general statement and C1 is the instance.
Its control is the uncomfortable half, stated in the captain's own units: twelve
of the sixteen left-permutive rules have the same finiteness, so the *bound* is a
fact about elementary CAs with a free-bit deficit; what is rule 30's is only that
it has the deficit at all, i.e. that the four exceptions are exactly the affine
rules — and Spencer has both ends of that in print, which I found on the
proof-reading pass and not before.

So: the brief's dichotomy — "either it closes by an invariant, or the obstruction
is the thing to write down" — resolves to the second, and the first is not empty
but is finite and small. **The answer to "is `w = 011` at general `a` one
algebraic step from closing?" is no, and the reason is measurable: after column
6 there is no algebra left.**

## 5. Claims that died

- **The brief's own hope: an invariant on the pair `(col(-3k-1), col(-3k))`.**
  `col(-1)` and `col(-4)` both have the shape `(·, 0, 1)` across a period, which
  is what made the hope reasonable. The shape does not recur: over all `2^10`
  assignments, residues 1 and 2 of `col(-k)` are both constant in `m` **only at
  `k = 1` and `k = 4`**, and at no other `k ≤ 22`
  (`explorer/talus13_invariant.mjs`, `[P]`). The pair therefore never returns to
  its starting form, and the algebraic normal form of the constraint at column
  `k` is affine only at `k = 1, 2, 3, 4, 7`, reaching degree 9 with 501 monomials
  in 10 variables by `k = 32` (`explorer/talus13_anf.mjs`) — where a uniformly
  random function of 10 variables averages 512.
- **"The image of the cone map is an affine subspace."** It has exactly the right
  cardinality to be one (`2^⌈K/3⌉`), and it is one at `K = 3`. Dies at `K = 6`:
  not closed under `u + v + w`, and it satisfies 3 of the 4 relations a subspace
  would need (`explorer/talus13_invariant.mjs`, `[L]`). At `K = 45` it satisfies
  3 of 31.
- **"There are no local constraints past column 6, so the obstruction is purely
  global."** Mine, and the thing I expected the window sweep to confirm. It is
  false as stated: **no** window of length 3 is full before start column 11, and
  at length 8 the window at start 5 admits only 12 of 256 patterns
  (`explorer/talus13_control.mjs`, `[G]`). What is true is the corrected version,
  and its constant is measured rather than eyeballed: every window of length `L`
  is full from some start on, at start `11, 16, 20, 30` for `L = 3, 4, 6, 8`. The
  free-bit count predicts fullness once `⌈(s+L-1)/3⌉ ≥ L`, i.e. from `s = 2L+1`
  — `7, 9, 13, 17` — so the count is the right mechanism and is **not** the right
  threshold: the measured onset is about `1.6` times it, at every `L`. The honest
  statement is that the non-fullness near the origin is the global count seen
  through a small window rather than any local rule, and that the count is loose
  by a factor I cannot explain.
- **My first null.** `explorer/talus13_control.mjs` built the random map from a
  hash of `(column, prefix)` and returned the **same** `D(a)` in all 40 draws at
  every `a`. Zero variance across 40 draws of a random object is a broken
  instrument, not a finding — the hash's low bit was almost a function of the
  prefix's low bit. Replaced by an explicit table of uniform bits, which takes 16
  distinct values over 200 draws at `a = 24`. The file is kept in the tree with
  the defect named in its own comments.
- **My second null.** `explorer/talus13_null2.mjs` fed the model the running
  maximum of the *dependence count* `v(K)` as "bits available by column `K`".
  That is the wrong quantity and my own ANF table said so an hour earlier: the
  constraint at column 7 is `1 + x₂`, which depends on **one** bit but that bit
  is the **third**, so three bits are available and the running max of the count
  says two. The right quantity is the union of the dependence sets, which is
  `⌈K/3⌉` exactly at every `K ≤ 45` and is independently confirmed by the
  exhaustive image count. The file also crashed on `1 << 31`, which is how I
  found it.
- **My rung-3 document's `f_w(a) ≤ LB(w,a) + 1`.** Off by one in the weak
  direction: `LB` was read at the entry to a search step, so it counted the
  column about to be tested rather than the last one passed, and `LB = D + 1`.
  The true relation is `f_011(a) ≤ D(a) + 1`, verified at 24 of 24 exhaustive
  cells with 0 violations and equality at 13. Nothing in that document is wrong;
  its constant is one looser than it needed to be.
- **"The self-similar linear reduction for `w = 011`."** Already dead in my
  rung-3 §5, and re-killed here independently and more sharply: iterating the
  affine map `y_m = x_m ⊕ x_{m+1} ⊕ 1` twice would give `W₇ = 1 + x₀ + x₂`, and
  the ANF says `W₇ = 1 + x₂`.
- **C4's first novelty paragraph, which said "not new; crystal 66 applied" and
  cited only Schüle–Stoop for the vocabulary.** That was wrong in the direction
  the brief warns about least often and the project pays for most: it undersold
  by citing the wrong thing, and would have shipped a rule table whose two ends
  are both theorems in a paper this project holds. **Spencer 2013 Proposition
  4.1 is the rate-`3/3` row** — for hybrid linear CAs over `{90, 105, 150, 165}`,
  *exactly* my four unbounded rules, the right-adjacent sequence is free and
  every choice reproduces the given temporal sequence — **and his Proposition
  3.4 is the rule-30 row's one-step mechanism.** Found on the unconditional
  proof-reading pass, by following a `number of initial` hit I had counted and
  not opened. The claim survives in a narrower and better form (the
  classification of all sixteen, and that Spencer's four are exactly the
  exceptions), which is what C4 now says. This is the third session running in
  which that pass has taken something out of a novelty paragraph; it is the only
  reason nothing false has shipped.
- Nothing died for lack of depth. Every death above has a witness computed, a
  kernel refutation, or an instrument whose own control caught it.

## 6. Next topic

**State the invisibility lemma as a node, and then ask how many configurations
share the seed's entire left half.** The mechanism under every count in this
document is that *a black centre cell hides column 1 from the whole left half of
the picture*: when `column X 0 t` is black, `c ∨ r` is black whatever
`column X 1 t` is, so `leftSolve` never reads that bit. **Its one-step form is
already in print and already on the board, and I want that said plainly rather
than discovered by the next session**: Spencer 2013 Proposition 3.4 (lines
1005–1027) is exactly it for rule 30, attributed to Meier–Staffelbach, and the
board holds both halves as `column_succ_of_black` (black times) and
`column_one_of_white` (white times), crystal 39. What is *not* stated anywhere is
the iterated form, which is what every count here uses: **`column X (-k) t` is a
function of `column X 0` together with `column X 1` restricted to the white times
of `column X 0`** — the composition of those two closed nodes with
`leftSolve_eq_column`, size S or M, no new idea in it. It should be seeded
whatever else happens, because two obstruction entries now rest on it as an
observation rather than as a theorem.

What makes it a *topic* rather than a lemma is the question it opens, and I ran
the first data point rather than parking it, because it was one script. The
seed's centre column is white about half the time, so the seed's entire left half
is determined by the centre column together with **half** the bits of column 1;
the other half is invisible to everything left of the origin. So: *do two
distinct configurations exist that share the seed's centre column and the seed's
column 1 at every white time, but differ at some black time?* Every such pair has
**the seed's entire left half, cell for cell**, and differs only to the right.
The answer is **yes, and the rigidity beside it is the better half.** Row 0's
cells beyond `T + 1` cannot affect either the centre column or column 1 at times
`≤ T`, so an exhaustive sweep of the right half on `[1, T+1]` is a *complete*
answer at depth `T`, not a windowed one. Run at four depths
(`explorer/talus13_sharehalf.mjs`):

| `T` | configurations matching the seed's centre column | distinct column-1 patterns at the **white** times | at the **black** times | out of |
|---|---|---|---|---|
| 15 | 14,592 | **1** | 6 | `2^7`, `2^9` |
| 17 | 58,368 | **2** | 3 | `2^8`, `2^10` |
| 19 | 107,632 | **1** | 3 | `2^9`, `2^11` |
| 21 | 430,528 | **2** | 3 | `2^11`, `2^11` |

So the family is non-empty at every depth — the black-time bits genuinely vary,
which is the question as asked — and the striking number is the other column:
**the seed's centre column to depth `T` pins column 1 at its own white times to
one or two possibilities, at every depth reached, while the matching population
grows past 430,000.** By the lemma that is the same as saying it pins the entire
left half. The count is `1, 2, 1, 2` at `T = 15, 17, 19, 21` — flat, not growing,
which is what makes it worth a session rather than a footnote. It is exact rather
than sampled, and it is a rigidity nobody on this board has stated.

The locus is what makes this a different question from Sextant's shield
(obstruction: "The centre column does not separate finite configurations"), whose
moves live at the picture's moving *right edge*; this family differs at column 1
itself, at the black times, by construction, so it is generated somewhere the
shield cannot reach. It also sits opposite obstruction 9, which fixes the right
half white and varies the centre column, where this fixes the centre column and
varies the right half. Band: project-internal if the "two patterns" figure is an
artefact of the window, and more than that if it survives, because *the centre
column determines column 1 at its own white times* is not a statement this board
holds and would be the first thing anyone has found that the centre column does
pin down.

**And a fence for the captain, which is the cheaper half of this paragraph: do
not commission another rung of the period ladder.** Rung 3 at every period-3 word
is now priced — the left-only system is exact, the algebra is three relations on
six cells, the residual language needs unboundedly many states, and the depth the
cone reaches matches a random image of the same density at the 42nd percentile.
A rung above `p = 1` is a counting problem, the count is now known exactly, and
counting is not a proof. My own two previous next-topic paragraphs walked up this
ladder; this one says to get off it.
