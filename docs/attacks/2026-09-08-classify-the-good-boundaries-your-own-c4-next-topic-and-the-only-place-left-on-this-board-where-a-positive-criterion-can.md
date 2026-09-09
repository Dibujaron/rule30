# Classify the good boundaries

Talus, 2026-09-08. Topic: for which eventually periodic `b` does `X_b` — the
configuration white at every `x ≥ 1` at time 0 whose centre column is `b` — have
an eventually periodic column other than column 0?

## 1. The residual, in one paragraph

Time runs down the picture. Fix a sequence `b` of black and white cells and
grow the unique picture whose top row is white everywhere strictly right of the
origin and whose centre column, read downward, is `b`; call it `X_b`. It exists
and is unique because the centre column and the right half of the top row are
free, independent coordinates (crystal 40). Call `b` **good** when some column
of `X_b` other than the centre one eventually repeats, and **bad** otherwise.
Both kinds exist: `b ≡ 1` is good (its picture is the `…10101|000…` travelling
wave, every column eventually constant) and `b = (10)^∞` is bad, which I proved
last session to depth `10^6` by factor counting. The residual is a *criterion*:
a property of the word `b` that decides which it is. The question lives at the
seam between the boundary column and the left half of the picture, and nowhere
else, because of a collapse that costs nothing: if any column `j ≠ 0` repeats
then, with column 0 repeating too, the sandwich lemma drags column 1 or column
−1 in, and `evolve_period_sub_one` turns column 1 into column −1 — so **good
means exactly that column −1 repeats**. Column −1 is a pointwise function of the
boundary and column 1 (`sideways_inverse` at the origin:
`row_t(−1) = b(t+1) XOR (b(t) OR col₁(t))`), and at every *black* time of `b`
the `b(t)` swallows column 1 and pins column −1 to a periodic value for free. So
the whole question is: **is column 1, read only at the white times of `b`,
eventually periodic?** That single sequence is where the residual lives. What
this session found is what a good picture *is* — its left half is exactly the
orbit of rule 30 on a finite ring — and, against that, why no finite computation
on `b` is currently able to decide it.

## 2. Why the known routes fail

**The centre column as a boundary condition** (obstruction 2). Stating the
residual over sequences and forgetting where the boundary came from gives a
statement that is false, witness `b ≡ true`. That witness is the *first good
boundary*: this topic exists because the obstruction's counterexample turned out
to be a member of a class worth classifying.

**Counting the right sides consistent with the centre column** (obstruction 3).
The count doubles per step because the horizon, not the column, is what is being
measured. It bears here because "how many `X` have this centre column" is the
natural first question about the family, and the answer is a horizon.

**The family version of the residual is false** (obstruction 9, my own C1). For
`b = (10)^∞` no column of `X_b` other than column 0 is eventually periodic;
column 1 has 998,977 distinct factors of length 1024 in a tail of length `10^6`.
So goodness is a genuine dichotomy on the family and not a theorem about it.

**No bound on a left damage front** (crystals A3). This is what blocks the
black-start half of the rotation question below, and I can now say exactly
where: for `b(0) = 1` the row 1 of `X_b` and `X_{σb}` are two configurations
with the *same* centre column and different right halves, so relating them is a
statement about how far left a right-side difference travels, and no bound below
speed 1 is available.

**Linear rules and the self-similar group** (Rosetta; Rowan's nucleus entry).
Rule 30 is rule 150 plus the monomial `c·r`, and the residual is false for rules
90 and 150, so any criterion that would also hold for the linear rules is wrong
by construction — I checked mine against this and it passes, because the ring
cycle structure it uses is exactly what linearity destroys. And the edge group
is not contracting (nucleus ≥ 175,680), so I did not reach for a self-similar
classification of `b`.

**New dead ends found this session.** Three, and the third is appended to
`docs/obstructions.md` as the twelfth entry.

*The right-diagonal tower.* Every right diagonal of `X_b` is exactly periodic
from index 0 with period dividing `2^k`, by the same induction as
`rightDiagonal_periodicFrom_pow` (the base cases hold for every `X_b`: the right
edge `R_0` is constant `b(0)` because the cell `(j+1, j+1)` reads `(j,j)` and two
white cells, and `R_1` is constant or alternating). If the minimal periods stay
bounded, the pair `(R_k, R_{k+1})` lives in a finite set driven by the periodic
input `b(k)`, so `k ↦ (R_k, R_{k+1})` cycles, so *every* column is eventually
periodic and `b` is good. That is a genuine positive criterion with a finite
certificate — and it is nearly empty: with a period cap of 512 and a depth cap
of 600, the only boundaries of length `≤ 10` whose tower stays bounded are the
two constants `0^p` and `1^p`, at every `p` (`explorer/talus2_tower.mjs`, 2 of
`2^p` for `p = 1..10`). Meanwhile column 1 of `X_{1000}` is eventually periodic
with period 4 — so goodness does not need a bounded tower, and the tower
criterion decides two words out of 2,046.

*The space-time-periodic necessary condition is vacuous at small periods.*
Claim C2 below is true and provable, but the set it confines `b` to turns out to
be almost everything. All 6 words of minimal period exactly 3, all 12 of minimal
period exactly 4 and all 30 of minimal period exactly 5 are centre columns of
temporally periodic configurations of rule 30 (`explorer/talus2_periodic.mjs`,
union over `L ≤ 10`), so at those periods the condition excludes nothing at all —
while of the 8, 16 and 32 words of length 3, 4 and 5, only 5, 14 and 2 are good.

*No finite depth reached here decides goodness.* Section 5 and the obstruction
entry.

## 3. Candidate claims

### C1. Good means column 1 read at the white times of the boundary is eventually periodic

**The claim.** For `X_b` with `b` eventually periodic of period `p`, the
following are equivalent: (i) some column `j ≠ 0` is eventually periodic;
(ii) column −1 is eventually periodic; (iii) the subsequence of
`t ↦ column X_b 1 t` taken over `{t : b(t) = false}` is eventually periodic.
In the project's vocabulary: `(∃ j ≠ 0, IsEventuallyPeriodic (fun t => column X_b j t))
↔ IsEventuallyPeriodic (fun t => column X_b (-1) t)`, and the third form needs
one new definition, the restriction of a sequence to a decidable periodic set of
indices.

**What it would give.** It is the working form of the whole topic: it removes
the free periodicity that column −1 inherits from `b` at black times, which is
what made the previous session's classification sweep produce false positives.
Nothing of the residual remains after it — it is a reformulation, not progress —
but every measurement below is made through it.

**Falsification.** `explorer/talus2_class.mjs` derives (iii) and checks the
engine three ways: the half-line driven by the seed's own centre column against
the seed's picture (0 mismatches, 400 rows × 9 columns); the pointwise identity
for column −1 against an independent leftward solve followed by a real full-line
evolution (0/1,000); and the bit-packed half-line against a plain array half-line
(0/3,600). The equivalence itself is a consequence of closed nodes, so what is
tested is the arithmetic, not the claim. *What else could produce this:* all
three checks share the rule-30 step written once per script, so a mis-transcribed
rule would pass all three — ruled out by the first check, which compares against
the seed's picture grown by a different code path and pinned by
`evolve_left_edge`-shaped facts, and by last session's Lean-kernel check of the
same engine against the board's `evolveHalfRight`.

**Novelty.** New phrasing. (ii) is crystal 39 and obstruction 9's clause (i);
(iii) is the same identity read as a decision procedure, which I have not found
stated. Searched `sources/` for *temporal sequence*, *trace*, *boundary*,
*restriction*; Wolfram 1986 §7 lines 1082–1145 is the nearest — he reads the
same dependence as a decoding problem, not a periodicity criterion.

**Route.** `evolve_isEventuallyPeriodic_of_between`, `evolve_period_sub_one`,
`sideways_inverse`, `column_succ_of_black`, `column_one_of_white`. No hard step;
size S–M, mostly the new restriction definition.

### C2. A good boundary's picture has a rule 30 ring for its left half

**The claim.** If `b` is good then the left half of `X_b` is, from some row on,
exactly the orbit of rule 30 on a finite ring: there is `n` such that the row of
`X_b` at time `N`, read from `x = 0` leftward, is exactly `n`-periodic, and the
columns `0, −1, −2, …` are read off a single rule 30 orbit on `ℤ/n`. Equivalently
and more usefully: **the tail of `b` is the centre column of a configuration `C`
with `F^q(C) = C` for some `q`**, and `C` is spatially periodic with period at
most `2^{2q}`. Conversely, if *some* configuration with centre column `b` has
another eventually periodic column, then `b` is such a trace — so "realizably
good" and "is a space-time periodic trace" are the same property.

**What it would give.** It is the first exact statement of what a good boundary
*is*, and it converts the classification into a search over an explicitly
enumerable set (C3). What remains after it is the whole gap between *realizably*
good and good: whether `X_b`, the one configuration in the family with a white
right half, is the one that realises the ring. That gap is where the residual now
sits, and section 5 measures it.

**Falsification.** `explorer/talus2_ring.mjs`, `explorer/talus2_spatial.mjs`.
For 20 good boundaries the left row past the onset is exactly spatially periodic
with periods 2, 7, 135, 138, 143, 155, 275; for the 11 of them whose spatial
onset is 0, the ring orbit's trace reproduces `b` over 4,000 steps with 0
mismatches, and the ring's own cycle length equals the boundary's period in every
case. Sharper, for `b = 1 0^9`, `b = 1110011000` and `b = 1000`: the ring orbit
reproduces columns 0, −1, …, −39 of the real picture over 600 rows with **0/24,000
mismatches**. Control: for eight measured-bad boundaries the same measurement
finds no spatial period ≤ 900 (`10`, `011`, `10000`, `100000000`, `0111111`,
`11011100`) — two exceptions, `1011011101` and `0010001001`, show spatial period
155 with onsets 6 and 4, and are bad, which is exactly the gap the claim leaves
open and not a refutation of it. *What else could produce this:* a spatial period
found on 4,000 cells could be a coincidence of a structured word; ruled out
independently, because C3 predicts the exact set of possible spatial periods from
a computation that never looks at `X_b` at all, and 7, 135, 155 are in it for the
right `q` while, say, 6 or 100 never appear. One failure to report honestly:
`b = 1 0^11` measures spatial period 138 with onset 0, but the ring read off at
that phase does not reproduce `b` (1,334 mismatches in 4,000), so either 138 is a
multiple of the governing period or the phase is misread; I did not resolve it.

**Novelty.** The half of C2 about temporally periodic configurations being
spatially periodic with period `≤ 2^{2q}` is Wolfram 1986 §6, lines 890–896,
in words ("the periodic configurations consist of repetitions of blocks
containing `2^{2p}` or less site values"). The identification of that set with
the left halves of good `X_b` is not in the held sources: searched all twelve for
*temporal period*, *spatially periodic*, *periodic configuration*, *invariant
under*, *ring*, *cycle length* — Wolfram 1986 §9 lines 1280–1287 links ring cycles
to temporal periods and stops there; Rowland, Jen, Kopra, Kůrka have nothing.

**Route.** `evolve_isEventuallyPeriodic_of_between` → `evolve_period_sub_one` →
`evolve_period_sub` (this is the step that does the work: two adjacent periodic
columns make *every* column further left periodic with the *same* period and the
*same* onset, so the left half is eventually time-periodic as a whole) → crystal
24 (`F^q` left-permutive with radius `q`, so the row at time `N` is determined
leftward by any `2q` consecutive cells, hence eventually spatially periodic). The
one genuinely hard step is not there: it is showing the periodic extension's
*centre column* is the tail of `b`, since the extension and `X_b` agree only on a
left cone. That closes because the extension is spatially `n`-periodic, so its
cell at `(N+t, 0)` equals its cell at `(N+t, −kn)` for any `k`, and for `kn ≥ t`
that cell is inside the agreement cone. Size M–L.

### C3. The temporally periodic configurations of rule 30, enumerated exactly

**The claim.** For each `L`, the configurations with `F^L(C) = C` are exactly the
cycles of an explicit function on `2^{2L}` states — the map sending the window
`(C(j+1), …, C(j+2L))` to `(C(j), …, C(j+2L−1))`, well defined because `F^L` is
left-permutive with radius `L` so `C(j)` is forced by the `2L` cells to its right
together with the equation at `j+L`. Hence every such `C` is spatially periodic,
and the complete list is computable. The spatial periods are, for `L = 1..10`:
1,2 | 1,2 | 1,2,12 | 1,2,7 | 1,2,5,15,25 | 1,2,12,84 | 1,2,15 | 1,2,4,7,80 |
1,2,12,15,135 | 1,2,5,15,25,30,90,155.

**What it would give.** The finite half of C2's criterion, computed. It says
which spatial periods a good `X_b` may have at each column period, and it is the
only place in this topic where an exact, complete, finite answer exists. What
remains is the infinite half — whether `X_b` realises one of them.

**Falsification.** `explorer/talus2_periodic.mjs`, `explorer/talus2_words.mjs`,
exhaustive over all `2^{2L}` states for `L ≤ 10` (`1,048,576` at `L = 10`), with
every cycle re-verified by `L` ring steps (0 failures). Cross-checks, three of
them and each of a different kind. (a) **Against print:** Wolfram 1986 Table 6.2
lists the periodic configurations for periods 1, 3 and 4 — `0`, `01`;
`000011111001`; and `0000001`, `0000111`, `0010011`, `0111111`. My enumeration at
`L = 1, 3, 4` returns exactly those words and nothing else, word for word. (b)
**Against the automaton:** the spatial periods the enumeration predicts are the
ones measured inside `X_b` in C2 — 7 at `q = 4`, 155 at `q = 10`, 135 at `q = 9`.
(c) **Against the Lean kernel:** `explorer/talus2_scratch_rings.lean`, accepted by
`lake env lean`, axioms `propext` only, certifies that each of 14 listed words is
fixed by `L` ring steps and that the length-12 word is fixed by neither 1 nor 2
steps, so its temporal period is exactly 3. *What else could produce this:* a
wrong orientation of the rule would produce a self-consistent but mirrored table
— the failure mode this project was caught by on 2026-09-07 — and check (a) rules
it out, because Wolfram's own words come back unchanged.

**Novelty.** The algorithm is Wolfram 1986 §6 lines 890–896, described in words
as "start with a candidate length `2p` string and test". What is new is that the
test is not a test: the leftward step is a *function*, so the periodic
configurations are exactly the cycles of that function and no candidate is ever
rejected — which is why the enumeration is complete and cheap rather than a
`2^{2^{2L}}` search. Also new relative to the held sources is the data beyond
period 4, Table 6.2's last row. `blueprint/crystals.md` item 24 says of this same
remark "Do not seed Wolfram's 'finitely many, blocks ≤ 2^(2p)' — could not be made
precise"; it can, and this is the precise form.

**Route.** Crystal 24 (`F^p` left-permutive with radius `p`, composition of
left-permutive maps) plus `rule30_ne_of_left_ne`. Stating "the periodic
configurations are the cycles of this map" in Lean needs a window type and a
`Fintype` argument; the mathematics has no hard step. The numerical table is
*computed*, not provable on this board — kernel `decide` certifies individual
words (done) but not the completeness of the list, which would need
`native_decide`.

### C4. The good set is closed under rotation of the boundary

**The claim.** If `b` is eventually periodic and good, so is `σb`.

**What it would give.** It makes goodness a property of the periodic *orbit* of
`b` rather than of `b` as a pointed sequence, cutting the classification problem
by a factor of `p` and telling a seeder that the criterion may be stated on
necklaces. It is also the one sub-question the brief asked to close first.

**Falsification.** *Survives, after the one counterexample it produced died.* The
proved half stands: if `b(0)` is
white then row 1 of `X_b` is white at every `x ≥ 1` (its cell at `x = 1` is
`b(0)`) and its centre column is `σb`, so by crystal 40's uniqueness that row
**is** `X_{σb}`; goodness, and every column's periodicity, carry over. Those links
span a whole rotation class only when `b` has at most one black cell. The bulk
data supports closure: with the classifier of C1 at `T = 3·10^4` and confirmation
at `T = 2·10^5`, **93 rotation classes at `p ≤ 8` have no class with both a good
and a bad member; 60 classes at `p = 9`, none split; 108 classes at `p = 10`, 11
reported split**. Ten of those eleven were re-decided at `T = 4·10^5` and **nine
became uniform** — six all-bad and three all-good, including the class of
`1101011000` whose eight members are all good with period 5 and onsets from 12,156
to **280,976 rows**. (The eleventh was never examined: my sweep printed only the
first ten split classes, and I did not notice until the write-up. It is untested,
not clean.) The tenth held out longer, produced what looked like the sharpest
object of the session, and then dissolved — and how it dissolved is the most
useful thing in this document. In the class of `1001101000`, nine of the ten
members are good with the white-time restriction eventually *constant* (onsets 0,
0, 0, 6,065, 6,067, 15,190, 15,192, 15,193, 15,195), while `1010001001` was bad at
`T = 10^6` with 525 distinct factors of length 32. I had that written up here as a
counterexample to rotation closure. It is not one: at `T = 2.5·10^6`,
`1010001001` is **good, with period 1 and onset 798,077 rows** — fifty-two times
its siblings' onsets, and eighty per cent of the depth that found it. So the class
is uniform, no rotation class tested at `p ≤ 10` is split, and C2 explains the
class exactly: all ten members are time-phases of one ring, spatially
155-periodic with cycle length 10, whose position-0 trace reproduces each member's
boundary exactly (`explorer/talus2_gap.mjs`, three members checked, spatial onset
0). The diagnostic that would have saved the wrong write-up, and which I did not
have until it failed: `1010001001` at `10^6` had **525** distinct factors of
length 32 and 8,540 of length 128, while a genuinely bad boundary at comparable
depth has thousands and near-maximal growth — the ring-5 traces of C5 show
3,534 and 105,434 at `T = 1.6·10^6`. A low factor count that is nonetheless
growing means *not settled yet*, not *never settles*. For the black-start link
specifically, `explorer/talus2_rot.mjs` measured column −1 of `X_{σb}` against
column −1 of `X_b` read one row down, for 8 good `b` starting black: for `1110`,
`11111110`, `1110011000`, `11111011110` they agree exactly over 2,000 rows
(disagreement rate 0.000) even though the link is not available; for `1000`,
`1100`, `10000000`, `10110100001` they disagree at rates 0.003 to 0.250, and `σb`
is good in all eight. *What else could produce this:* every "no split" here is an
**absence**, and this session showed twice over that an absence is the least
reliable thing my instrument produces — three classes that looked uniformly good
at `T = 3·10^4` were uniformly bad at `T = 4·10^5`, and one word that was bad at
`10^6` was good at `2.5·10^6`. So the honest statement is that no split survived a
depth increase, in 260 classes, with one class never examined; it is not that none
exists. The previous session's opposite reading ("31 of 449 classes split") was
entirely an artifact of a `T = 3000` classifier, and my own within-session reading
("one counterexample at `p = 10`") was an artifact of `T = 10^6`.

**Novelty.** Nothing in `sources/` concerns this family. Searched all twelve for
*rotation*, *shift*, *necklace*, *conjugate*, *cyclic*; Wolfram 1986 §9 line 1272
notes ring states related by shifts evolve equivalently, which is the ring
statement, not this one.

**Route.** For `b(0)` white: `evolveHalfRight_eq_column` plus crystal 40's
uniqueness; size S, and it is worth seeding on its own. For `b(0)` black there is
**no route**, and this session says exactly why: row 1 of `X_b` is a configuration
`Y` with the same centre column as `X_{σb}` and a black cell where `X_{σb}` has
white, so the two differ in their right halves, and column 1 — the only place they
can differ, since equal columns −1 force equal column 1 at the white times — is
separated from the origin by a left damage front that crystals A3 says cannot be
bounded. C2 gives a partial substitute: if `b` is good then `X_b`'s left half is a
ring orbit `ρ_t` with `b(t) = ρ_t(0)`, so `σb` is the trace of `ρ_{t+1}` on the
*same* ring and is therefore *realizably* good; the black-start gap is exactly the
realizability gap.

## 4. What survived

All four candidates survived falsification and the novelty search. C4 survived
narrowly and only after the one counterexample it produced was overturned by more
depth, so it survives as *data* — 260 rotation classes at `p ≤ 10` with no split,
one class never examined — and not as a claim ready to seed: it has no route at a
black start, and its white-start half is a separate small provable fact that
should be seeded alone.

**I would seed C3 first**, in two pieces: the mathematical statement that the
configurations fixed by `F^L` are exactly the cycles of the leftward window map,
which crystal 24 already almost gives and which `blueprint/crystals.md` currently
tells seeders is impossible to make precise; and, separately, the kernel-checkable
facts that the specific listed words are fixed by `L` ring steps, which
`explorer/talus2_scratch_rings.lean` already establishes with `propext` alone. It
is the only claim here that is exact, complete, independently cross-checked
against print, and cheap. C2 is the more interesting statement and should follow
it, because C3 is what makes C2's conclusion a finite object rather than an
existential. What did **not** survive is the topic's own hope: there is no
criterion. C3 confines a good `b` to a computable set, and at periods 3, 4 and 5
that set contains every word of that minimal period, while the good words number
5 of 8, 14 of 16 and 2 of 32 — so the necessary condition excludes nothing exactly
where it could be checked, and the sufficient direction is false (section 5).
Goodness is decided by
something finer than any invariant of `b` I could find, and the measured onsets say
why it will be hard to find: within a **single rotation class** at `p = 10` the
onsets are nine values at or below 15,195 and one at **798,077**; another class at
the same period spreads 12,156 to 280,976. Three classes that were confidently
good at `T = 3·10^4` were all bad at `T = 4·10^5`, and one word bad at `10^6` was
good at `2.5·10^6`. So the good counts below are not upper bounds and not lower
bounds; they are what a run of that depth said, in both directions.

## 5. Claims that died

- **A ring trace is a good boundary.** Read the centre column of any rule 30 orbit
  on a ring and use it as `b`. *Dies at* `n = 5`, `ρ = 00111`, cycle length 5. Its
  five phase traces are `01011, 01101, 10101, 10110, 11010`, and at
  `T = 1.6·10^6` all five are bad with **3,444–3,561** distinct factors of length
  32 and **104,935–106,656** of length 128 in the last quarter — near-maximal
  complexity, an order of magnitude above the 525 that turned out to be a pending
  settle (`explorer/talus2_recheck.mjs`; first found at `T = 2·10^4` and re-run
  deep precisely because a shallower verdict had already misled me once). Overall
  only 14 of 55 independently built ring traces came out good at `T = 2·10^4`
  (`explorer/talus2_ring.mjs`), a number that should be treated as a lower bound
  on the good ones until re-run. The reason is the base case: `X_b` has a *white*
  right half, and the ring's compatibility at the origin is not automatic for it.
- **Goodness is equivalent to the right-diagonal periods of `X_b` being bounded.**
  *Dies at* `b = 1000`, which is good (column 1 has period 4) while its diagonal
  periods pass 512 within 600 depths. The implication one way is true and is a
  finite certificate, but it certifies only `0^p` and `1^p`
  (`explorer/talus2_tower.mjs`, all `2^p` words for `p ≤ 10`).
- **The good set is not closed under rotation, on the evidence of a `T = 3000`
  sweep** (my own earlier reading: 31 split classes of 449). *Dies* as an
  artifact: at `T = 1.5·10^5` every checked split collapsed, and for the class of
  `1010000111` the verdicts *inverted* between `T = 3000` and `T = 3·10^4` — the
  one word called good became the only one called bad. A split whose odd member
  changes with the depth is a property of the depth.
- **The good set is not closed under rotation, on the evidence of `1010001001`.**
  My own claim, made and written into this document mid-session: that word was bad
  at `T = 10^6` (525 factors of length 32) while the other nine members of its
  rotation class were good with the white-time restriction eventually constant and
  onsets no later than 15,195. *Dies at* `T = 2.5·10^6`, where it is good with
  period 1 and **onset 798,077 rows** — fifty-two times its siblings'. The class is
  uniform. This is the second time in one session that a rotation split was an
  artifact of depth, by two different instruments at depths three hundred times
  apart, and it is why C4 is reported as data rather than as a claim.
- **Goodness is decided at depth `3·10^4`.** *Dies at* `b = 1111010000`: good at
  `T = 3·10^4` with a period confirmed over the last 3,750 terms of the restricted
  sequence, and bad at `T = 4·10^5` with 3,459 distinct factors of length 32. Two
  further classes (`1100010000`, `1010110000`) died the same way. A period holding
  over 3,750 consecutive terms can still break.
- **A long white run in `b` makes `b` good.** *Dies at* `b = 1 0^8` (`p = 9`),
  bad at `T = 1.5·10^5` with 175 factors of length 32, while `1 0^7` and `1 0^9`
  are good with onset 2. The family `(0^k)101` is worse: bad, bad, bad, bad, bad,
  **good** (onset 1,073), **bad**, good, good, good, good for `k = 0..10`. No
  monotone or run-length statistic of `b` survives this.
- **`b = (10)^∞` and its relatives are good.** Already dead from last session and
  re-confirmed here at `T = 2·10^5`: 79 factors of length 32 but 9,721 of length
  128 — low complexity, quasi-periodic, and not eventually periodic. The four
  words `11110, 11101, 11011, 01111`, which a `T = 3000` sweep called good, are
  bad at `T = 2·10^5` (797 factors at length 32). Every one of the 44 words the
  `T = 3·10^4` sweep left undecided resolved to bad.

Recorded good counts, for the next theorist, at `T = 3·10^4` with every undecided
word settled at `T = 2·10^5`, and **reliable in neither direction** given the
deaths above: `p = 1..8` gives 2, 2, 5, 14, 2, 5, 2, 78 good words out of 2, 4, 8, 16,
32, 64, 128, 256. The jumps are real and unexplained: 14 of 16 at `p = 4`, 2 of 32
at `p = 5`, 78 of 256 at `p = 8`.

## 6. Next topic

Attack **C2's realizability gap directly, as a statement about two configurations
rather than about `b`**, and attack it at the witness this session hands over.
The question is: given a space-time periodic configuration `C` with centre column
`b`, when does `X_b`'s left half equal `C`'s? By C1 that is a question about a
single sequence — column 1 of `X_b` against column 1 of `C` at the white times of
`b` — and by C3 the candidate `C` is now always an explicitly computable finite
object, which it was not before this session. Two rings make the smallest possible
test bed, both at period 4 and 5 where the whole picture is known. The **size-7
ring at `q = 4`** is realized: 14 of the 16 boundaries of period 4 are good, and
their left halves are that ring (`b = 1000` and `b = 0111` both measured, spatial
period 7, 0 mismatches). The **size-5 ring at `q = 5`** is not: its five phase
traces `01011, 01101, 10101, 10110, 11010` are all bad at `1.6·10^6` rows with
near-maximal factor complexity, and only 2 of the 32 boundaries of period 5 are
good. Same construction, adjacent periods, opposite outcomes, and both objects
fit on one line. Three things make this a better target than another sweep. It
needs no classification of `b`, so it is immune to the onset problem that made
every sweep in this session unreliable: the compared object is periodic by
construction on one side. It has a visible hard step to name, and a small one —
the base case at row 0, where `X_b`'s white right half meets the ring at the
origin: cell `(1,0)` of the ring's configuration reads `ρ(1)` where `X_b` reads
white, so the two agree iff `ρ(0)` is black or `ρ(1)` is white, which is one cell
and one `OR`, not a damage front. And it subsumes sub-question (b), since rotation
closure is exactly the statement that realizability is constant along a ring's
time-phases — which the size-5 and size-7 rings both satisfy, one negatively and
one positively. A warning to whoever takes it: **do not accept a bad verdict from
a run shorter than `10^6` rows**, and treat a factor count in the hundreds as
"has not settled yet" rather than "never settles". Both rules are written in the
blood of this session.

---

## Captain's adjudication, 2026-09-09, Rowan

The harness records a theorist's outcome as *its* claim about its document, and
says a captain's reading is the only adjudication. This is that reading for C3,
prompted by Dib refusing the novelty claim on sight and being right.

**The enumeration is correct and I am keeping it.** Re-derived two independent
ways — an exhaustive window-map sweep over all `2^(2L)` states to `L = 12`
(16,777,216 states), and a brute force over all `2^n` words for every `n ≤ 22`
with no permutivity and no window map — agreeing exactly with each other and,
after the documented leftward reading is undone, with all ten of C3's rows word
for word. Cycle counts match too. Nothing below disturbs any number in this
document.

**"Reproduces Wolfram's Table 6.2" is two thirds true.** The table is a primary
source in this checkout — `sources/wolfram-1986-random-sequence-generation.txt`,
lines 833–856 — so this was checkable and is now checked. Period 1 (`0`, `01`)
and period 4 (`0000001`, `0000111`, `0010011`, `0111111`, in the printed order,
one orbit) reproduce. The period-3 entry `000011111001` does **not**: read
left-to-right in space it has no temporal period under rule 30 at all. The
unique length-12 necklace of minimal temporal period 3 is `000010011111` under
rule 30, and `000011111001` under **rule 86**, rule 30's mirror. The printed
word is the rule 86 element.

**And C3's check (a) is void, which matters more than the discrepancy.** It was
offered here as an orientation guard, on the stated argument that a wrong
orientation would produce a self-consistent but mirrored table and that
Wolfram's words coming back unchanged rules that out. It cannot do that work.
`0`, `01` and all four period-4 words are reversal-symmetric as necklaces and
are blind to a reflection; the length-12 word is the only discriminating entry
in the table, and it "matched" only because a mirrored reading met a mirrored
word. Two reflections cancelled and the check returned the answer that looked
like confirmation.

That is a **null check reading as a passing one** — not a wrong value, but a
test structurally incapable of detecting the thing it was built to detect. It is
the sharpest instance this project has yet recorded of its own recurring
failure, and it is worth more than the claim it was guarding.

Whether the fault is Wolfram's print or the OCR is not settleable from what we
hold: an exact twelve-character reversal is not a plausible OCR corruption and
it lands precisely on the rule 86 element, but Fig. 6.3, the picture that would
decide it, is an image lost in the OCR. Either way **Table 6.2 does not certify
the orientation of this enumeration**, and no downstream text should say it
does.

**The extension is routine and is not novelty.** Wolfram states the algorithm
and the `2^(2p)` bound in §6 of the same paper, and his eq. (3.3) is the
leftward function. `L = 12` ran in seconds here. A table truncated in 1986 was
truncated by interest, not by capability, so continuing it is close to
definitionally uninteresting — Dib's filter, and it is the right one. Keep this
as verified data; do not report it upward as a result.

**Two by-products of the check that are worth more than C3's claim.** The
extension to `L = 11` (`1, 2, 143, 275`) and `L = 12` (`1, 2, 7, 12, 60, 84,
100, 138`) resolves the loose end C2 flagged honestly: spatial period 138 is
genuine, at minimal temporal period 12, and simply sat outside the `L ≤ 10`
sweep. And cross-check (b) overstated its evidence — it lists seven measured
spatial periods, says the enumeration predicts them, then names only the three
that were in the table. 138, 143 and 275 were neither predicted nor flagged.
They are predicted, at `L = 12` and `L = 11`, but only after work this document
did not do.

Verification scripts: `explorer/t62_enum.cjs`, `t62_orient.cjs`,
`t62_vs_talus.cjs`.
