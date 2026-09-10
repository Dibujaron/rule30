# Attack: `rightDiagonal_period_doubles_iff_odd_weight` — moving the P1 wall to the right edge

Talus, theorist, 2026-09-10.

**Headline, because the brief asked for it first.** The topic asked me to check
before anything else whether the minimal period `P_k` is itself a wall, and to
stop if it is. It is not a wall — I can say a great deal about it, and two of
the candidates below are cheap and, as far as the held sources go, new. But the
*premise* of the topic dies instead, and it dies harder than the wall would
have: **the right-diagonal minimal periods carry no information about P1 at
all.** A centre column of period 4 produces a tower whose periods reach `2^27`
by depth 64 with a doubling density of `0.406` — the seed's own figures to
three digits. So `rightDiagonal_period_unbounded`, which is *proved* on this
board, cannot imply P1, and no sharpening of it can either. Crystal 70's
argument that "index 0 of an exactly periodic object" is a better position than
the left edge is right about the geometry and wrong about the content: index 0
is the one coordinate the tower does not determine, and the periods are what is
left when you throw it away.

## 1. The residual, in one paragraph

Time runs down the picture and the black cells spread outward in a cone. The
**right diagonals** are the lines running down-left from the cone's right edge:
`rightDiagonal k j` is the cell `j` steps along the `k`-th of them, that is, the
cell at position `j` after `j + k` steps. Unlike the left diagonals, these have
no transient at all — diagonal `k` repeats exactly, from its very first cell,
with some period dividing `2^k` (proved: `rightDiagonal_periodicFrom_pow`). Each
diagonal is built from the two outside it by a running XOR: writing `R_k` for
diagonal `k` and `g_k(j) = R_{k-1}(j+1) OR R_{k-2}(j+2)` for its *driver*,
`R_k(j+1) = R_k(j) XOR g_k(j)`. A running XOR of a word of period `L` closes
after `L` steps exactly when that word has an even number of black cells per
period, so the board already holds both halves of the arithmetic — the odd case
(`rightDiagonal_antiperiodic_of_odd_driver`) and the even case
(`rightDiagonal_periodicFrom_step_of_even_driver`) — as statements about *a*
period. **The residual of this topic is minimality**: that the *least* period of
`R_k` is `2L` in the odd case and `L` in the even one, where `L` is the larger
of the two least periods above it. The gap is entirely in the even case: `L`
being a period does not by itself forbid `L/2` from being one too. Written as
one inequality, the whole topic is **"the minimal periods never drop"**,
`P_k ≥ max(P_{k-1}, P_{k-2})` — see C4, where that equivalence is derived. The
residual lives at the right edge of the picture, in the settled region, and
that is exactly its problem: the centre column is `R_k(0)`, the one free
constant the running XOR does not fix, so everything in this residual is a
statement about the picture with the centre column divided out.

## 2. Why the known routes fail

**Obstruction 7 — "a universal argument over periodic words cannot give the
right diagonals' minimality."** It shows that for *arbitrary* words `u` of
period dividing `L` and `v` of exact period `L`, the driver `j ↦ v(j+1) OR
u(j+2)` can have a shorter period: at `L = 4`, `u = 1000`, `v = 1110` collapses
to period 2, and 29 % of pairs do at `L = 4`, 10 % at `L = 8`. **This
obstruction measured the wrong population, and correcting it is the main
positive finding of this session.** The pairs that occur as *consecutive right
diagonals of an actual picture* are a vanishing subset: exhaustively, the
reachable set of consecutive pairs at depth `k` has exactly `2^k + 4` elements
at every `k` from 2 to 14 (`explorer/talus6_reach.mjs`), and **`(1000, 1110)` is
not among them at any
depth searched — indeed not one of the 144 pairs of words of minimal period
exactly 4 is reachable at all** (searched exhaustively over every free-bit
choice, depths 2–16). See C5. Obstruction 7's closing line, "nothing on the
board relates two neighbouring right diagonals except the recurrence itself,
which is what the counterexamples above satisfy", is the part that needs
amending: the counterexamples satisfy the *local* consequence of the recurrence
(`u` black at `q+1` forces `v` to flip at `q+1`, checked at 0 violations in
2,697,240 positions and provable in one line) but they do not satisfy being
*generated* by it from the tower's base, and that is a far stronger constraint.

**Obstruction 8 — "the flat right-diagonal tower is a real picture, so no
argument from the right half alone can work."** The recurrence fixes `R_k` only
up to `R_k(0)`, which is the centre column at time `k`; choosing every constant
black gives a tower of period 2 at every depth, and that tower is an actual
rule 30 picture, the one grown from `…1 0 1 0 1 | 0 0 0…`. Reproduced here: the
boundary `b ≡ 1` gives `P_k = 2` for every `k ≤ 64` (`talus6_family.mjs`, test
C). So no statistic of the right half decides whether the periods grow. This
obstruction stands, unchanged, and this session adds its converse half — see
the new obstruction entry below.

**Obstruction 9 — "an eventually periodic centre column does not force another
periodic column, so the residual is false without the left cone."** The family
`X_b` — the configuration white at every `x ≥ 1` at time 0 with centre column
`b` — is exactly the class of configurations the right-diagonal tower can see,
and the P1 residual is false in it. That is the reason the family is the right
null for anything computed from the right half, and it is the null I used.

**Obstruction 2 — "the centre column as a boundary condition."** Any statement
proved about the half-line automaton driven by a periodic boundary is a
statement about `X_b`, not about the seed. Same fence, reached from the other
side.

**Crystal 70's own premise, which is the route this session was sent to test.**
`centerColumn t = rightDiagonal t 0` does put the centre column at index 0 of an
exactly periodic object. But index 0 is the *free* coordinate. The map from
centre columns to towers is a bijection onto the family, and trivially so in both
directions: every `b` generates a tower by the recurrence, and every tower gives
back its `b` by `b(k) = R_k(0)`. So reading the tower's periods is reading a
digest of the centre column — one bit per depth, "did it double" — and that
digest does not distinguish periodic centre columns from the seed's, measured
below to depth 64. (A *single* consecutive pair `(R_{k-1}, R_k)` does *not*
remember `b`: at depth 14 there are `2^15 = 32,768` towers and `2^14 + 4 = 16,388`
distinct pairs, so a pair is shared by about two towers. The bijection is with the
whole tower, not with any one level of it, and I separate the two because I first
wrote the pair count down as the *proof* of the bijection, which it is not — the
counts do not even divide evenly.) **New dead end, appended to
`docs/obstructions.md`:** *"Unbounded right-diagonal periods do not imply an
aperiodic centre column: a period-4 boundary matches the seed's growth."*

**One route I considered and did not pursue.** Since the odd/even criterion is a
parity of the driver's weight, one could hope the parity sequence is a
computable digest of the centre column with a life of its own — the doubling
depths as a sequence to study directly. It is not new: those depths are exactly
Rowland's `a(n)` (verified below for `n = 0..26`), and Rowland says of `a(n)` in
print that "it displays no obvious regularity by which the *n*th term may be
computed (even conjecturally) in shorter than exponential time".

## 3. Candidate claims

All measurements come from an engine that builds the tower from the recurrence
and the centre column alone and was **verified cell-by-cell against the packed-row
picture: 28,273 cells, 0 mismatches** (`explorer/talus6_tower.mjs`). Every claim
below was computed with it.

### C1. Below the first-failure depth, the shift *is* a period — of the whole diagonal, not just at one index

**The claim.** Take row `p` of the picture. Its rightmost cell is black; let
`m(p)` be the distance from it to the nearest black cell strictly to its left.
Then `p` is a period of *every* right diagonal shallower than `m(p)`:

> for every `p > 0` and every `k < m(p)`, `PeriodicFrom (rightDiagonal k) p 0`.

**What it would give.** `rightDiagonal_first_failure` is on the board and says
the slid row agrees with the seed's own at every time before `m(p)` — that is,
`rightDiagonal k p = rightDiagonal k 0` for `k < m(p)`, agreement at **one
index**. C1 upgrades that to full periodicity of those diagonals, which is what
turns the first-failure lemma into a statement about periods. Together with C2 it
gives the exact identity

> `m(p) = min { k : p is not a period of rightDiagonal k }`,

and hence C3.

**Falsification.** `explorer/talus6_tower.mjs`, tower to depth 48 with exact
minimal periods, `m(p)` computed from the real rows for every `p ≤ 65536`.
Result: **survives** — for all 65,536 values of `p`, `m(p)` is *exactly* the
first depth whose minimal period fails to divide `p` (65,536 tight, 0 loose).
Kernel-checked on a window in `explorer/talus6_scratch_mgap.lean`, accepted by
`lake env lean` (`m(p)` for `p = 1..20` equals
`1,3,1,4,1,3,1,6,1,3,1,4,1,3,1,7,1,3,1,4`; the shift agreement for every
`k < m(p)` over 16 indices, `p ≤ 24`; and the failure at `k = m(p)`, C2 below).
**That kernel check has been seen to fail**: `explorer/talus6_scratch_mutant.lean`
is the same file with the range of `k` widened by one, and the kernel rejects it
— so the accepted version is not vacuous.

*Distrust the result you like.* Three things other than the claim could have
produced this. (i) `m(p) = 1` for every odd `p`, and `P_1 = 2 ∤ p` trivially, so
half the sample is free — the odd `p` are 32,768 of the 65,536 and prove
nothing. The content is in the even `p`, of which there are 32,768, with `m(p)`
running up to 41; excluding the odd ones the check is still 32,768 for 32,768.
(ii) `m(p)` is small, so `k < m(p)` is a short range and a coincidence is cheaper
than it looks. It is smaller than I first wrote: I had "growing like `2.4 log₂ p`",
which is true only along the powers of two. **`m(p)` depends on `ord₂(p)` alone** —
measured, `m(p) = a(ord₂(p))` at all 65,536 values with 0 failures, matching
Rowland's published `a(0..16)` (`explorer/talus6_ord2.mjs`) — so it is 1 at every
odd `p` however large, and 41 is its maximum over the whole range. Against that,
the identity is still *tight in both directions*, which a coincidence would not
be: the first failing depth is never *earlier* than `m(p)` either, in 65,536
cases.
(iii) my tower engine could be wrong in a way that reproduces `m(p)` by
construction — it cannot, because `m(p)` is read from the packed rows and the
periods from the recurrence, and the two share no code beyond the centre column;
and the tower itself was checked against the rows at 28,273 cells.

**Novelty.** Rowland 2006 §1 and §3 are the nearest statements. He defines
`R(t)` (the same gap, in his mirrored rule-86 frame), proves `I(t) = a(ord₂(t))`
and, in the sentence this whole topic descends from, writes that `a(n)`
"characterizes the period lengths of the diagonals on the right side of rule 30"
— informally, with no proof and no statement of what "characterizes" means. C1
is one exact half of that sentence, made precise. Searched `sources/` for
*minimal period*, *exact period*, *least period*, *period of the diagonal*,
*period length*, *right diagonal*: no matches for the first four anywhere in the
corpus; *period length* only in Rowland, at the lines quoted. Honest category:
**a precise form of a remark made without proof in print, with the proof route
supplied.**

**Route.** The tower is determined by its free bits: `R_0` is constant, `R_1` is
fixed by `R_1(0)` and `R_0`, and thereafter `rightDiagonal_recurrence` fixes
`R_k` from `R_{k-1}`, `R_{k-2}` and `R_k(0)`. Now shift the whole tower by `p`:
`S_k(j) := R_k(j + p)` satisfies the same recurrence, with free bits
`S_k(0) = R_k(p)`. `rightDiagonal_first_failure` says exactly that
`R_k(p) = R_k(0)` for every `k < m(p)`, so `S_k` and `R_k` have the same free
bits up to depth `m(p) - 1`, and strong induction on `k` gives `S_k = R_k`
there — which is the claim. **The one hard step is the base**, and it is not
hard: `R_0` is constantly black (`evolve_right_edge`) so `S_0 = R_0` outright,
and `R_1` alternates (`evolve_right_second_diagonal`) so `S_1 = R_1` follows
from `R_1(p) = R_1(0)`, i.e. from `p` even, which is what `m(p) ≥ 2` supplies.
Cites: `rightDiagonal_first_failure`, `rightDiagonal_recurrence`,
`evolve_right_edge`, `evolve_right_second_diagonal`. Size M.

### C2. The first-failure lemma with its witness kept

**The claim.** `p` is *not* a period of `rightDiagonal (m p)`:

> for every `p > 0`, `¬ PeriodicFrom (rightDiagonal (m p)) p 0`.

**What it would give.** This is `rightDiagonal_period_unbounded` with the
existential opened. That theorem says only "for every `p` some diagonal fails to
repeat at `p`"; C2 names the diagonal, and the name is small — `m(p)` grows like
`2.4 log₂ p`. Taking `p = 2^n` and using that the minimal periods are powers of
two, it reads `P_{m(2^n)} > 2^n`: **the first quantitative rate this board has
for how fast the right-diagonal periods grow.**

**Falsification.** Same script, same range: for all 65,536 values of `p` with
`m(p) ≤ 48`, `P_{m(p)}` divides `p` in **0** cases — **survives**. Kernel-checked
for `p ≤ 24` in `explorer/talus6_scratch_mgap.lean`.

*Distrust the result you like.* This one is not really a measurement: it is a
two-line consequence of a **proved** node, and the measurement is a check on my
reading of that node rather than evidence for the claim. `rightDiagonal_first_failure`
concludes `evolve (m + p) p ≠ evolve m 0`, and `rightDiagonal k j` is
`evolve (j + k) j`, so with `j = p`, `k = m` that is
`rightDiagonal m p ≠ rightDiagonal m 0` — while `PeriodicFrom f p 0` at `n = 0`
says `f p = f 0`. What could go wrong is exactly an index slip of that kind, so
the numerical check is aimed at the slip and not at the automaton.

**Novelty.** Not new as mathematics — it is the proof of
`rightDiagonal_period_unbounded` with a line kept instead of discarded (that
proof's own note says the difference "arrives at the centre after exactly that
many steps and the diagonal at that depth is caught out"). New as a **statement**
on the board, and it is the statement everything quantitative here needs. Honest
category: **a sharpening of a closed node, free.**

### C3. The minimal period is pinned exactly at infinitely many explicit depths

**The claim.** For every `n`,

> `P_k ≤ 2^n` for every `k < m(2^n)`, and `P_{m(2^n)} ≥ 2^(n+1)`;

and hence, if `m(2^n) < m(2^(n+1))`, **`P_{m(2^n)} = 2^(n+1)` exactly**, where
`P_k` is `minimalPeriod (rightDiagonal k)`.

**What it would give.** An exact value of the minimal period at an infinite,
explicitly described set of depths, with only the plateau interiors left open —
which is precisely the part C4 is about. It is C1 and C2 pressed together: C1
gives the upper bound (`P_k` divides `2^n`, and the periods are powers of two by
`rightDiagonal_periodicFrom_pow` with `minimalPeriod_dvd`), C2 the lower.

**Falsification.** `explorer/talus6_deep.mjs`, seed tower to depth 64.
`m(2^n)` for `n = 0..16` came back `1,3,4,6,7,9,15,16,24,25,27,29,34,36,37,39,41`
and the depths at which `P_k` doubles came back
`1,3,4,6,7,9,15,16,24,25,27,29,34,36,37,39,41,43,48,49,51,54,55,58,60,63,64` —
**all 27 of Rowland's published `a(0..26)`, to the integer.** So `P_{m(2^n)}` is
`2^(n+1)` at every `n` reachable, and the identification `m(2^n) = a(n)` holds
over the whole range measured. **Survives.**

*Distrust the result you like.* The strongest alternative explanation is that
both sides are the same computation wearing two hats — and they nearly are, which
is the point of the agreement rather than a defect in it: `m` is read off the
rows and the doubling depths off the recurrence, so the agreement is a real
cross-check between two codepaths. The genuinely independent confirmation is that
the list matches **Rowland's printed `a(n)`**, computed in 2006 from row 2^40 by
a different method entirely, at all 27 values my depth reaches. That is the check
I would keep if I had to keep one. What is *not* established: the strict
monotonicity `m(2^n) < m(2^(n+1))`, which I have only as a measurement over
`n ≤ 16` and as Rowland's unproved parenthetical "(strictly) increasing"; the
first display above needs nothing beyond C1 and C2 and should be seeded on its
own if that is in doubt.

**Novelty.** Same sentence of Rowland's as C1, and this is the other half of it.
Rowland proves `a(n) ≥ n + 1` (his Theorem 1 and the `I(t) = a(ord₂(t))`
structure) but proves nothing relating `a(n)` to a *minimal* period. Honest
category: **new as a statement; the ingredients are all in print or on the
board.**

**Route.** C1 + C2 + `minimalPeriod_dvd` + `rightDiagonal_periodicFrom_pow`.
The one step that is actually hard is nothing in the mathematics but the
bookkeeping that a divisor of `2^k` that does not divide `2^n` exceeds `2^n`.
Size S once C1 and C2 exist.

### C4. The topic's law is exactly "the periods never drop", and its odd half is unconditional

**The claim.** Let `L = max(P_{k-1}, P_{k-2})` and let `W` be the number of
black cells of the driver `g_k` over `[0, L)`. Then

> `rightDiagonal_period_doubles_iff_odd_weight` ⟺ `P_k ≥ L` for every `k`,

and the odd branch holds **unconditionally**: `W` odd forces `P_k = 2L` with no
hypothesis at all. More sharply, for any word satisfying `R(j+1) = R(j) XOR g(j)`
the minimal period of `R` is `minper(g)` doubled when `g` has odd weight over
*its own* minimal period, and `minper(g)` otherwise; so the whole law is a claim
about the driver's period, not about the diagonal's.

**What it would give.** It removes half of the topic outright and states the
other half as one inequality. After it, the only open thing is: on a plateau —
consecutive depths with equal periods — the driver never collapses to a shorter
period with even half-weight.

**Falsification.** The equivalence is a derivation, not a measurement; here it
is. `2L` is always a period of `R_k` (the driver has period `L`), so `P_k`
divides `2L`, and `P_k` is a power of two. If `W` is odd then `L` is not a
period (`rightDiagonal_antiperiodic_of_odd_driver`), so `P_k` cannot divide `L`,
so `P_k = 2L` — the odd branch, free. If `W` is even then `L` is a period
(`rightDiagonal_periodicFrom_step_of_even_driver`), so `P_k ≤ L`, and the law's
claim `P_k = L` is exactly `P_k ≥ L`. Numerically: over the seed to depth 64,
**0 law failures and 0 drops in 63 depths**; over 4,194,296 tower transitions
covering every free-bit choice to depth 20, **0 drops**; over 400 random towers
to depth 44, **0 drops**; over seven periodic boundaries to depth ~64, **0 law
failures and 0 drops**. **Survives.**

*Distrust the result you like.* Two things. First, the driver almost never has
anything to say: over the seed's 47 depths, `minper(g_k) < L` happened **once**,
at `k = 2`, so 46 of the 47 depths are the trivial case where the driver has full
period and the law is immediate. The law's content is concentrated in the rare
collapse, and my seed sample contains one instance. That is why the family sweep
matters: over the exhaustive family the collapse happens 8 times *per depth*, and
**every one of them is harmless** (`talus6_reach.mjs`: 8 collapses, 8 harmless, 0
drops, at every depth from 2 to 14). Second, "0 drops" is an absence, and my own
notebook says an absence needs a depth argument that a presence does not — here
the argument is that the sample is *exhaustive* over the family to depth 20
rather than deep on one path, so it is not a depth question.

**Novelty.** The reduction of a running XOR's minimal period to its driver's is
textbook. What is not in print, as far as the corpus goes, is that the topic's
law is equivalent to monotonicity of the right-diagonal periods; searched
`sources/` for *monotone*, *nondecreasing*, *never decreases*, *minimal period*
— nothing. Rowland 2006 Proposition 2 and Lemma 3 are the analogous criterion
for the **left** diagonals and are about a period, not the least one. Honest
category: **new phrasing, and the phrasing is the contribution.**

**Route.** The odd branch: `rightDiagonal_antiperiodic_of_odd_driver`,
`minimalPeriod_dvd`, `periodicFrom_mul`, plus "`L` is a power of two" from
`rightDiagonal_periodicFrom_pow`. Size S — this is worth seeding today. The
even branch is C5's business.

### C5. No-drop is a property of the whole family, not of the seed

**The claim.** For *every* configuration white at `x ≥ 1` at time 0 — every
`X_b`, `b` arbitrary — the right-diagonal minimal periods never drop. And in the
sharper form the measurement actually supports: **for every consecutive pair of
right diagonals of any such configuration with `L = max(P_{k-1}, P_{k-2}) ≥ 4`,
the driver `g_k` has minimal period exactly `L`** — which implies no-drop, since
`P_k` is then `L` or `2L`.

**What it would give.** It says a proof of the topic's law need not use anything
seed-specific, so it can be an induction on the tower rather than an argument
about rule 30's particular centre column. That matters because obstruction 8
says no seed-specific argument from the right half exists at all: if no-drop
*were* seed-specific it would be unprovable, and C5 says it is not.

**Falsification.** `explorer/talus6_family.mjs`: exhaustive depth-first
enumeration of **every** free-bit choice to depth 20 — 4,194,296 transitions,
**0 drops**; 400 random towers to depth 44, 17,188 steps, **0 drops**; ten
periodic boundaries to depth 60, **0 drops**. `explorer/talus6_deep.mjs`: seven
towers to depth ~64, **0 drops**. `explorer/talus6_plateau.mjs` splits the same
sweep by case: of 4,194,296 steps, **2,482,084 are the OPEN case** (plateau
interior, `minper(u) = minper(v)`, the one obstruction 7 leaves open) and
1,712,212 the closed one, with 0 drops in each. And the sharper form: **the
driver collapses (`minper(g) < L`) at `L = 2` only** — 760 times out of the 1,444
steps at `L = 2`, and **0 times at every `L` from 4 to 2048**, over the whole
sweep. **Survives.**

*Distrust the result you like.* The exhaustive sweep is exhaustive in the free
bits but only to depth 20, and the periods there reach 2048 — so the sweep tests
small periods thoroughly and large periods not at all, while obstruction 7's
counterexample rate *falls* with `L` (29 % at `L = 4`, 0.027 % at `L = 32`). So
the sweep is strongest exactly where a counterexample would be commonest, which
is the right way round, but it is not a statement about `L = 2^20`. The random
deep towers cover large `L` at 17,188 samples, which against obstruction 7's own
decay rate `2^(-0.37 L)` is worth nothing as evidence — I say so rather than
counting it. The one number I would have quoted carelessly is "0 drops in 4.19
million transitions", which overstates the case by a factor of nearly two, since
1.7 million of those are the case obstruction 7 already closes; the honest figure
is 2.48 million open-case steps. What the sweep *does* settle, and settles
completely, is the population question: **not one of the 144 pairs of words of
minimal period exactly 4 occurs as a consecutive pair of right diagonals**, at any
depth from 2 to 16, so obstruction 7's `(1000, 1110)` is not a counterexample to
anything about the tower. (`L = 4` and `L = 16` in fact have *no* open steps at
all in the whole family: a tower that reaches period 4 or 16 always doubles at the
very next depth. I have no explanation and flag it as an observation.)

**Novelty.** Rowland 2006 §3 is close and should be read by whoever takes this
on: he observes that for a general "rightful" row `R` there is a nondecreasing
`b_R(n)` playing `a(n)`'s role, which "may be eventually constant (so `R(t)` may
be periodic)" — that is the flat tower and the bounded case — and his
Conjecture 1 says the rows with *nonperiodic* `R(t)` are exactly the seed's own
rows. **Nondecreasing** is his word, so the monotonicity is asserted in print for
the whole family; he does not phrase it as minimality of a diagonal period and
does not prove it. Honest category: **essentially Rowland's `b_R(n)` monotone,
restated as a diagonal-period fact and measured.**

**Route.** Partial, and the split is clean. The sweep says the target to aim at
is not "no drop" but **"the driver has full period `L`, once `L ≥ 4`"**, which is
strictly stronger and, on the evidence, exactly true: no collapse at any `L ≥ 4`
in 4.19 million steps, and the only collapses at all are the harmless `L = 2`
ones where the driver is constantly black. Write `h = L/2`. `P_k < L` requires
the driver `g_k` to be `h`-periodic with even weight over `[0, h)`. Working out
when `g_k(j) = v(j+1) OR u(j+2)` can be `h`-periodic gives a per-position
condition: at every `q` where `v` is white, either its `h`-partner is black and
`u(q+1)` is black, or the partner is white and `u(q+1)` matches *its* partner.
**Right after a doubling this closes**: `v` is then antiperiodic at `h` and `u`
has period `h`, so the condition runs over every residue class mod `h` and forces
`u` to be constantly black, which `rightDiagonal_not_constant` (proved) forbids.
That is obstruction 7's own closed case, re-derived. **The hard step is the
interior of a plateau**, where `u` and `v` both have minimal period exactly `L`
and neither is antiperiodic, so the condition constrains only the positions where
`v` is white and its partner differs. The extra ingredient available and not yet
used is the recurrence one level down, which says `u` black at `q+1` forces `v`
to flip at `q+1` — true, provable in one line, and checked at 0 violations in
2,697,240 positions, but **not sufficient by itself**: obstruction 7's
`(1000, 1110)` satisfies it and is still not reachable, so whatever excludes it
is a global property of the tower and not this local one. Finding that property
is the residual.

## 4. What survived

All five. C2 is a two-line consequence of a closed node and should be seeded
first, because C1 and C3 are stated in terms of it and because it is the board's
first quantitative handle on how fast the right-diagonal periods grow. C1 is the
substantial new lemma — the shift identity — and its route is complete: the
tower is determined by its free bits, so the `p`-shifted tower coincides with the
original exactly as far as `rightDiagonal_first_failure` says the free bits
coincide. C3 falls out of the two and pins `minimalPeriod (rightDiagonal k)` to
an exact power of two at infinitely many explicit depths, which nothing on the
board or in print does. C4's odd branch is free and should be taken today; its
even branch is the topic's residual, restated as one inequality. C5 is the
finding that changes how the residual should be attacked: it is a property of
every white-right-half configuration, not of the seed, and obstruction 7's
counterexamples are not consecutive diagonals of any picture, so a universal
induction on the tower is *not* excluded — which is the opposite of what
obstruction 7 currently tells a seeder. **What did not survive is the topic's
premise**, and that is the result of the session: the tower's period structure is
identical in law and in statistics for a period-4 centre column and for the
seed's, so no theorem about right-diagonal periods, however sharp, bears on P1.

## 5. Claims that died

- **"The right diagonals are a better position for P1 than the left edge"**
  (crystal 70, Portage's profinite sighting). Dies at `b = (1000)^∞`: a centre
  column of period 4 gives a tower reaching minimal period `2^27` by depth 64
  with doubling density `0.406`, against the seed's `2^27` at depth 64 and
  density `0.406` — identical to three digits (`explorer/talus6_deep.mjs`).
  Seven periodic boundaries give densities `0.359`–`0.433`, bracketing the seed.
- **"Unbounded right-diagonal periods imply an aperiodic centre column."** The
  attractive corollary, since `rightDiagonal_period_unbounded` is proved. Same
  witness, same depth. This is the implication that would have proved P1 outright,
  and it is false in the only family where its hypothesis is testable.
- **"Obstruction 7's counterexample pairs are the obstacle."** Dies on
  reachability: 0 of the 144 pairs of words of minimal period exactly 4 occur as
  consecutive right diagonals, over every free-bit choice at depths 2–16
  (`explorer/talus6_reach.mjs`). The reachable set has `2^k + 4` elements at
  depth `k`, against `≈ 4^(2^k)` pairs of words of that period.
- **"The local pairing law from the recurrence one level down is what kills the
  collapse."** My own conjecture on seeing that `u` black at `q+1` forces `v` to
  flip at `q+1`. Dies on obstruction 7's own witness: `u = 1000`, `v = 1110`
  satisfies the flip law at every position and is still unreachable, so the flip
  law is necessary and not sufficient.
- **"`P_k` is a wall because nothing bounds it below."** The topic's own opening
  question, and the answer is no: `P_{m(2^n)} > 2^n` follows from a closed node
  in two lines (C2). Since `m(2^n) = a(n)` and `a(n)/n` runs `2.33`–`2.56` over
  the published range, that reads `P_{a(n)} ≥ 2^(n+1)`, i.e. growth at exponent
  `n / a(n) ≈ 0.42` per depth — which is the `2^(0.41 k)` the topic called "only
  a measurement". **It is not a fit: it is the reciprocal of the growth rate of
  Rowland's `a(n)`.** (That `a(n)/n` converges at all is not known; the exponent
  is a statement about the range measured, not a limit.)
- **"The doubling depths are `1,2,4,5,7,...`"** — that is, the reading in my own
  notebook of a 2026-09-08 scan ("period 2 at `k = 2`, 8 at `k = 5`, 32 at
  `k = 8`, 64 at `k = 10..14`"). The true minimal periods are
  `P_k = 1,2,2,4,8,8,16,32,32,64,64,64,64,64,64,128,…` with doublings at
  `1,3,4,6,7,9,15,16,…`, so 8 first appears at `k = 4`, not 5, and 32 at `k = 7`,
  not 8. The old figures were first-appearance depths read one step late; the
  correct list is Rowland's `a(n)` exactly.
- Nothing died for lack of depth this session; the one claim that died on a
  witness had its witness computed rather than searched for.

## 6. Next topic

**Attack C5's residual directly, in its sharp form: prove that the driver of two
consecutive right diagonals has full period.** Concretely: let `u` and `v` be
consecutive right diagonals of any `X_b` with `L = max(minper u, minper v) ≥ 4`,
and show that `j ↦ v(j+1) OR u(j+2)` has minimal period exactly `L`. That is
stronger than the topic's law (it implies no-drop, hence C4, hence the law) and
it is what the evidence actually says: 0 collapses at every `L` from 4 to 2048
over 4.19 million steps, where "no drop" is only the weaker consequence. It is
the right next topic for three reasons no other open question here has together.
It is the *whole* remaining content of this topic, by C4's equivalence —
everything else above is done or free. It is now known to be a **universal**
statement over a family, verified exhaustively over 2.48 million open-case steps,
so it is an induction problem rather than a fact about rule 30's particular centre
column, and obstruction 7's verdict that no universal argument can work is refuted
as stated (it quantified over pairs that are not consecutive diagonals of
anything). And the case right after a doubling already closes, from
`rightDiagonal_not_constant`, so the target is narrow and named. **One warning to
put in that brief's first line**, because this session's whole finding is that the
premise it was sent with was wrong: proving this would settle Rowland's 2006
remark about `a(n)` and give the right-diagonal minimal periods in closed form,
and it would still say **nothing whatever about P1**. Send someone there for
Rowland's conjecture, not for the prize.

**If the captain wants a P1 topic instead**, the reading that survives this
session is that both edges are now fenced for the same reason and the fence has a
shape. Crystal 69 says the centre column outruns the left settling front by a
constant factor; this document says the centre column is the free coordinate the
right tower divides out. In both vocabularies the centre column is the one
quantity the structure does not determine, and every structural theorem is a
theorem about the picture modulo it. The topic that would test whether that is a
real law rather than two coincidences is: **is there any statistic of the seed's
picture, computable from the right half alone, that differs between `X_b` for
eventually periodic `b` and the seed?** Obstruction 9 and this document have
killed two candidates (existence of another periodic column; growth of the
right-diagonal periods) by exhibiting periodic `b` that match the seed. A third
death would be worth an obstruction saying the family is *statistically*
indistinguishable, which is a much stronger fence than either of the two we have.
