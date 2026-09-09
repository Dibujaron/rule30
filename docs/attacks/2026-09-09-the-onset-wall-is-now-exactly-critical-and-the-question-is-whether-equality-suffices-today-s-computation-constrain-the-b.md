# The onset wall at exact criticality

*Talus, 2026-09-09. Topic: does the onset induction tolerate a front-speed
bound of exactly 1/2, and under what domination does a bound over admissible
rings transfer to the settled words?*

**The two-line answer.** Yes, the induction tolerates equality, with room: the
line lemma has zero per-step slack but the anchor supplies a budget of 18 and
the ring class's amplitude is 3. And no, the equality does not transfer,
because the constraint set that produces it is not the settled words' — under
the constraint the board can actually prove, the same period-3 witness that
killed the previous version runs at exactly 4/7. Separately and independently:
on rule 30's own settled background the reachable-set machine is **absorbed and
runs at speed exactly 1**, and the thing that stops the real front doing the
same is a fact about the picture that the machine cannot see.

---

## 1. The residual, in one paragraph

Time runs down the picture. Outside a band down the middle, the seed's picture
is exactly the *settled picture* — the evolution of the settled words, one
periodic word per left diagonal (crystals 44, 46, 47). The band is where they
differ, and its left edge is a damage front `F(t)`: the leftmost cell of row
`t` at which the seed and the settled picture disagree. `leftDiagonal_onset_le`
— every left diagonal has settled by its own index `k` — says exactly that this
front never runs left faster than half a cell per row, in the sharp form
`2 F(t) + t ≥ 1` (crystal 51). The front's first cell is `(t, x) = (18, 0)`, so
the quantity starts at 18; it bottoms at 17 at `t = 19` and thereafter grows,
because the front actually runs at about 0.25. **The residual is a worst-case
bound on that one speed.** Everything else the wall needs is on the board:
`leftDiagonal_onset_le_of_line` turns the wall into one Boolean condition per
diagonal, and `leftDiagonal_periodicFrom_step_of_black` and
`bool_driven_periodicFrom_of_return` discharge the two branches. What is open
is a number: the leftward speed of one damage front, which crystals A3 says is
not available for arbitrary pairs of configurations, and which this pair —
seed against its own settled picture — is supposed to make special.

---

## 2. Why the known routes fail

**Obstruction 1, the diagonal structure never reaches the centre column.**
Bears on this wall only obliquely: it says the board knows nothing about the
transients, and the onset wall is a statement about exactly the transients.

**Obstruction 6, iterating the reset lemmas builds a front that cannot
retreat.** The reset-lemma induction bounds the onset by the sum of first-black
gaps and measures `2.00 k` against a truth of `0.336 k`, because the reset
front is monotone and the true seam retreats on 26 % of rows. In the
coordinates used here, `onset(k) ≤ c·k` is a front speed of `c/(1+c)`, so
`c = 2` is speed `2/3` and the wall is `c = 1`, speed `1/2`. Confirmed here
independently: the real front's diagonal index is non-decreasing, it advances
by at most one cell per row, and it visits **1059 of the 1969 diagonals** in
`18 … 1986` (`explorer/talus3_visit.cjs`), matching obstruction 6's 55 %.

**Obstruction 11, the environment-based speed bound.** Rowan's greedy walker,
which uses the advance law alone, runs at `0.5011 ± 0.0000104` on rule 30's
period-32 settled words — above `1/2`, flat in `T`, and below `1/2` only for
background periods in the forties, a window containing no power of two.
Reproduced here at shallower depth: the greedy walker gives 0.506 from diagonal
8000 and 0.5045 from 20000 (`explorer/talus3_diag.cjs`).

**Obstruction 12 and its two addenda, the reachable-set bound.** Alidade's
machine adds the kernel-proved survival law to the advance law and measures
0.4531 on the settled words. The route to turning that into a theorem is a
worst-case bound over a constraint set the settled picture provably belongs to.
"The background is a rule 30 picture" is too weak — the period-3 ring
`010011111000` runs at 0.5715. The second addendum then constrains to rule 30
rings of power-of-two *row* period with no eventually-white diagonal and gets
exactly `1/2` at `N = 4, 8, 16`. **That is the constraint set this session
attacks, and section 3 kills it twice.**

**Crystals A3.** No bound below speed 1 on a left damage front is provable for
arbitrary pairs; the worst case is exactly 1.

**New dead end, appended to `docs/obstructions.md` as the fourteenth entry:**
*the reachable-set machine is absorbed on rule 30's own settled background, and
the constraint that would stop it is a property of the picture rather than of
the background.* Cited from C3 and C4 below.

---

## 3. Candidate claims

### C1. The onset induction tolerates equality; the budget is 18 and the ring class's amplitude is 3

**The claim.** In English: a worst-case front speed of exactly one half is
enough to close the onset wall, provided the bound holds *pathwise with a small
additive constant* — and the constant the wall can afford is 17, while the
constant the admissible-ring class actually needs is 3.

Precisely. `leftDiagonal_onset_le_of_line` reduces the wall to
`∀ m, leftDiagonal (m+1) (m+2) = true ∨ leftDiagonal (m+2) (m+1+2^(m+2)) = leftDiagonal (m+2) (m+1)`,
and its induction carries `∃ N ≤ k, PeriodicFrom (leftDiagonal k) (2^k) N`. Read
the budget: the hypotheses at step `m` are onsets `≤ m` and `≤ m+1`, both used
at index `m+1`; the black branch (`leftDiagonal_periodicFrom_step_of_black`)
returns onset `m+2` and the return branch
(`bool_driven_periodicFrom_of_return`) returns `m+1`. So the budget grows by
exactly one index per diagonal and the black branch spends exactly one:
**the line lemma has zero per-step slack, and equality is precisely what it is
built for.** What it cannot absorb is an *averaged* bound. A maximum mean cycle
of `1/2` says `advances(t) ≤ (t - t₀)/2 + c` for some `c` fixed by the
automaton's potentials, and then
`2F(t) + t ≥ (2F(t₀) + t₀) - 2c`, so the wall needs `2c ≤ 2F(t₀) + t₀ - 1`.

**What it would give.** It closes the gap the topic names. Granting a
worst-case pathwise bound `advances ≤ rows/2 + c` with `2c ≤ 17` over whatever
class the settled words belong to, `leftDiagonal_onset_le` follows from lemmas
already on the board. What remains after it is only the class — which is C2.

**Falsification.** `explorer/talus3_anchor.cjs` builds the settled words by
reading them off the picture at index `J₀ = 20000` (see the died-claims section
for why generating them from the recurrence does not work) and cross-checks
them three ways: the diagonal recurrence holds on them at **60679/60679**
indices, the settled picture obeys rule 30 at **174250/174250** cells, the
periods first reach `2@3, 4@8, 8@29, 16@400` exactly as NKS p. 871 has them,
and the identically-white diagonals below 4000 are exactly `2, 7, 28, 399`
exactly as obstruction 4 has them. On that background the front's first cell is
`(t=18, x=0)` with `2F+t = 18`, and `min (2F(t)+t) = 17 at t = 19` over
`t ≤ 4000` — **an independent reproduction of crystal 51's two numbers**, from
a different construction of the settled words than `explorer/maskfront.mjs`
used. So the budget is `2c ≤ 17`. `explorer/talus3_amp.cjs` then measures the
amplitude on Alidade's admissible-ring class, exhaustively: `2c = 3`, attained
at step 3, at `N = 4`, `N = 8` and `N = 16` alike. The same run reproduces the
second addendum's counts and speeds to the digit — 14, 30 and 1470 admissible
rings, maximum exact speed `4/8`, `8/16`, `16/32` — so it is measuring the same
object. *Survives.*

**Distrust.** Three things could produce `2c = 3` other than the claim. (i) A
short run: 4000 and 6000 steps were used, and the amplitude is attained at step
3 in every case, i.e. it is the initial burst and not a recurring excursion, so
a longer run would only find a *larger* value if the DP had a long cycle — and
the cycles here are 8 to 32 steps. (ii) The maximally-uncertain start:
re-measured from a singleton start (the state a real anchor row supplies, where
the front is known exactly) and it is the same 3. (iii) **The amplitude growing
with the background's period, which is the fatal case, since the settled words'
periods are unbounded (`leftDiagonal_period_unbounded`).** It does not grow at
`N = 4, 8, 16` — but the reason is worse than reassuring: **every admissible
ring at those sizes has row period at most 8** (`explorer/talus3_amp2.cjs`,
exhaustive over all `2^N` words at each size), so the class never probes a
large period at all, and the flatness is a fact about a class of small
backgrounds rather than about the amplitude. That is a second, independent
reason not to lean on the ring class, and it points at C2. That script's
sampled pass at `N = 32` and `N = 64` had not finished when this was written,
so the flatness rests on the exhaustive `N ≤ 16` sizes alone — and given C2 it
is not worth extending.

**Novelty.** The reduction of the onset wall to a front speed is crystal 51
(Sextant); the reading of the line lemma's budget, and the arithmetic
`2c ≤ 2F(t₀) + t₀ - 1` that converts a mean-cycle bound into an onset bound,
are not in `blueprint/crystals.md` or `docs/obstructions.md`. Searched
`sources/` for `front`, `regular region`, `0.252`, `0.2428`, `damage`: Wolfram
1986 §5 (lines 592–604) gives the front's local law in words, an estimate
`Λ_L = 0.2428 ± 0.0003`, and the remark that "the front can retreat by many
sites in a single time step" — no bound, and nothing about an additive
constant. Nothing in Rowland 2006, Jen 1990, Kopra 2022 or Kůrka is about a
front amplitude.

**Route.** `leftDiagonal_onset_le_of_line` plus a hypothesis of the shape "for
all `t ≥ 18`, the number of rows on which the seam advances between 18 and `t`
is at most `(t-18)/2 + 8`". The hard step is that hypothesis and nothing else,
which is C2's subject.

---

### C2. The exactly-1/2 constraint set is not the settled words', and the constraint that is contains a background running at 4/7

**The claim.** In English: the settled region has no row period at all, so
"rule 30 ring of power-of-two *row* period" is not a property it has. The
property the board does prove of it is that every left diagonal is periodic
with period a power of two (`leftDiagonal_periodicFrom_pow`), and *that*
constraint set contains a background on which the reachable-set machine runs at
exactly `4/7 = 0.5714`.

Precisely. Let a *diagonal-admissible* background be a rule 30 picture in which
every `leftDiagonal k` is periodic with period a power of two and none is
identically white. Then `sup` over diagonal-admissible backgrounds of the
machine's leftward speed is `≥ 4/7 > 1/2`.

**What it would give.** It kills the second addendum's route as stated: no
bound at or below `1/2` is provable from the hypotheses the board holds about
the settled picture, so C1's budget is never reached. What remains is either a
strictly stronger hypothesis about the settled words than power-of-two diagonal
periods, or a different reading of the wall.

**Falsification.** `explorer/talus3_orbit.cjs` runs the machine over the class
that actually matches the settled words. The settled words are the orbit of the
diagonal recurrence on pairs of periodic words (crystal 44, Rowland 2006 §6),
and where the middle word has a black cell the next word is *unique*, so with
no white diagonal the map `(S_k, S_{k+1}) ↦ (S_{k+1}, S_{k+2})` is deterministic
and the class is its orbit space. Enumerated at `L = 2, 4, 8`: the maximum
speed is `4/7`, first attained at `L = 4` by the pair `(u, v) = (0001, 1110)`
and inherited at `L = 8`. `explorer/talus3_witness.cjs` then checks that
background against every clause of the constraint set: rule 30 holds on
**2787015/2787015** cells of a large window; **every** left diagonal below
`k = 20000` has period exactly 4, with **0** diagonals lacking a power-of-two
period; **0** identically white diagonals; and the speed is the exact rational
`4/7`, unchanged at horizons `H = 64, 128, 256` and at 4000 and 20000 steps.
*Survives.*

**Distrust, and one correction to my own first reading.** The witness is
**not new**: its row period is 3 and its spatial period is 12, which makes it
the ring `010011111000` — the Table 6.2 necklace Rowan already used to kill the
weaker constraint set, and its `4/7 = 0.571429` is Rowan's measured `0.5715`
made exact. I found it as a fresh object and it is the same one; what is new is
only *which* constraint set it defeats. It fails "power-of-two row period" (its
row period is 3) and satisfies "power-of-two diagonal periods" (all 4), so it
sits exactly in the gap between the addendum's hypothesis and the board's. The
other thing that could produce a speed above `1/2` is an unsound machine:
`explorer/talus3_sound.cjs` runs a real rule 30 picture against this background
over 5999 rows and finds the true leftmost disagreement **never left of the
machine's minimum, 0 violations**, so the machine is a genuine upper bound
here. It is also *loose* here — that real front nets 0.400 — but a route that
uses the machine as its bound is bound by the machine's number, not by the
looseness.

**The one caveat, stated rather than buried.** The witness is a bi-infinite
picture with no left edge, so it is not the settled picture of a configuration
white far to the left, and `leftDiagonal_periodicFrom_pow`'s bound is "period
divides `2^k`", which pins diagonals 0 and 1 to period 1 in a coned picture and
would exclude the witness read from an edge. That objection is real and it does
not help, for two reasons. Near the front the diagonal index is in the
thousands and beyond, where "divides `2^k`" says nothing but "a power of two",
so the witness's local behaviour is admissible at every depth the front
occupies. And if the class *is* restricted to coned pictures, crystal 49 says
there is essentially only one settled region up to a translation — so a
worst-case argument over that class is not an argument at all, it is a
measurement of the seed, which is where this route started.

**Novelty.** Obstruction 12's second addendum states the `1/2` result and its
own caveat ("the rings are periodic backgrounds; the settled region is not, so
a bound proved over rings transfers only if the settled words' local statistics
are dominated by some ring's, which is not established here"). This claim
answers that caveat in the negative and says why: the transfer fails at the
first step, because the hypothesis doing the work in the ring class is one the
settled region does not have, and the hypothesis it does have is already
defeated. Not in print: searched `sources/` for `eventually white`,
`nonwhite diagonal`, `white diagonal`, `all-white`; Rowland 2006 lines 905–936
uses eventually-white diagonals as the doubling criterion and nothing else.

**Route.** No route, and that is the point — the claim is that a route is
closed.

---

### C3. On rule 30's own settled background the machine is absorbed and runs at speed exactly 1

**The claim.** In English: the seed's settled words have identically white
diagonals, and a front sitting on the diagonal just inside one of them advances
every single row for ever. The reachable-set machine, started anywhere shallower
than the first such diagonal, is dragged onto it and thereafter runs at speed
exactly 1. Alidade's 0.4531 is a measurement inside a window that happens to
contain none of them.

Precisely. Call `k` *absorbing* when the settled word of `leftDiagonal (k-1)` is
identically white. Below 24000 the absorbing diagonals are exactly `3, 8, 29,
400`, which is obstruction 4's list of eventually-white diagonals `2, 7, 28,
399` shifted by one, and — as far as 400 — exactly NKS p. 871's list of the
diagonals at which the period doubles. On an absorbing diagonal the front's
left neighbour is white and settled at every index, so
`rule30_left_local_law` (crystals A2) makes the difference propagate one cell
left every row: speed 1, with no dependence on the picture at all.

**What it would give.** It says the reachable-set machine, as built, proves
nothing about the seed unless it is augmented, and it names the augmentation.
That augmentation is C4.

**Falsification.** `explorer/talus3_diag.cjs`, on the settled words verified as
in C1: started with the front at `x = 0` on diagonal 60, the machine ends on
diagonal 400 with net speed **0.91500** and reads a white cell on its left on
**93.0 %** of rows; started on diagonal 400 it reads white on **100.000 %** of
rows and runs at **1.00000**. Started deeper, where no white diagonal lies
ahead, it reproduces Alidade: **0.45050** from diagonal 2000, **0.45587** from
8000, **0.45837** from 20000, against the greedy walker's 0.506 and 0.5045 on
the same backgrounds. The settled words' black density over `k ∈ [100, 30000)`
is 0.49987, so the 93 % is absorption and not a density artefact.
`explorer/alidade_dp4.mjs`, re-run unmodified, gives 0.45292 on a random ring —
so the machine here is the same machine. *Survives.*

**Distrust.** Two things could produce speed 1 besides absorption. A horizon
artefact: the machine's minimum advances exactly when the background cell
immediately left of it is white — no element at a positive offset can produce a
value below the minimum — so no truncation and no ray enters, and `H` is not in
the argument at all; the runs used `H = 300`, and on the witness background the
independent horizon sweep `H = 64, 128, 256` changed nothing. And a wrong
settled word: the words are the ones checked at 60679/60679 recurrence indices
in C1, and their white set `2, 7, 28, 399` is obstruction 4's independently.
The first version of that word construction *did* manufacture 33 spurious white
diagonals — see section 5 — and that is exactly the failure this check rules
out.

**Novelty.** Obstruction 4 records the eventually-white diagonals; obstruction 6
records that the front rides a diagonal along a white run and leaves at the next
black cell. Neither says that a *fully* white neighbouring word makes the ride
unbounded, nor that Alidade's number is conditional on the measuring window
containing no such diagonal. Searched `sources/` as in C2 and found nothing;
Wolfram 1986 §5 discusses a front between two disordered configurations, where
the question does not arise.

**Route.** No route to a theorem, because this claim is a defect report on a
measurement rather than a statement about the automaton. Its one piece of
mathematics — a front standing on a white settled cell advances — is
`rule30_left_local_law` and is kernel-checked in C4.

---

### C4. The front never sits on an absorbing diagonal — and that is provable, but only from the bound the wall is trying to sharpen

**The claim.** In English: the real front skips exactly the diagonals the
machine is absorbed by, and it must, because a front that rode one for ever
would leave that diagonal transient at every index. So the machine may
legitimately be told to delete any reachable position on an absorbing diagonal.
With that repair, run from the wall's own anchor, the machine certifies the wall
over every row computed.

Precisely. If `leftDiagonal (k-1)` is eventually white from index `N`, then for
`j ≥ N` the front is never at `leftDiagonal k` index `j`. Proof sketch: at the
front the two pictures agree strictly left and differ at the front cell, so
`rule30_left_local_law` says they differ one cell left next row exactly when
that cell is white; on an absorbing diagonal it is white at every index, so the
front rides diagonal `k` for ever and `leftDiagonal k` differs from its settled
word at every index past `j`, contradicting
`leftDiagonal_periodicFrom_pow`.

**What it would give.** It repairs C3's defect using only closed nodes. But the
onset bound it draws on is `N ≤ 2^k`, and the wall needs `N ≤ k`: the available
reason the front must leave diagonal 400 allows it `2^400 ≈ 10^120` rows of
riding where the wall allows 400. So the repair is available as a *predicate*
(never be there at all) but the quantitative version is circular.

**Falsification.** `explorer/talus3_visit.cjs` follows the real front to
`t = 2600`: its diagonal index is non-decreasing, its largest advance is
**1 cell per row**, and of the absorbing diagonals `3` and `8` lie below its
first diagonal (18) while **29 is skipped, 28 → 30**, and **400 is skipped,
398 → 403**. Zero visits, as the argument requires.
`explorer/talus3_augment.cjs` then runs the machine with absorbing positions
deleted: from the anchor `t = 18` with the front at `x = 0`, the plain machine
gives speed **0.998167** and drives `2F+t` down to **−5959**, while the
augmented machine gives **0.447833**, amplitude `2c = 1`, and
**min (2F(t)+t) = 17 at t = 19** — the real front's own value, to the unit, over
6000 rows. *Survives.*

**Distrust.** The augmented machine agreeing with the real front's margin
exactly could mean the repair is right, or it could mean the machine has been
narrowed until it is the real front. It has not: the augmented machine's speed
is 0.4478 where the real front's net speed is 0.2356 (2357 cells of advance
against 1419 of retreat over 3982 rows, `explorer/talus3_anchor.cjs`, against
crystal 51's 0.2497 over 160,000), so it is still a strict over-approximation;
the two coincide only at `t = 19`, where the front has barely moved and every
bound is tight. One caution for whoever re-runs this: `talus3_augment.cjs`
prints the real front's speed as 0.3256, counting advance and retreat *events*
rather than cells, and a retreat can be several cells — the cell-counted 0.2356
is the one to quote. And the deletion is not fitted to the data: the absorbing
set is computed from the settled words alone, before the front is looked at.

**Novelty.** New as far as the held sources go, searched as in C2. The
ingredients are all on the board (`rule30_left_local_law`,
`leftDiagonal_periodicFrom_pow`); the composition, and the observation that the
excluded set is NKS p. 871's own list of doubling depths, is not recorded in
`blueprint/crystals.md` or `docs/obstructions.md`.

**Route.** Two S-sized nodes. The first — "a front standing on a white settled
cell advances one place left, and on a black one it does not" — is one rewrite
of `rule30_left_local_law` each way, and is **kernel-checked**:
`explorer/talus3_scratch_ride.lean`, accepted by `lake env lean`,
`front_advances_on_white` and `front_stalls_on_black` both on axioms
`[propext, Quot.sound]`. The second is "so the front is never on the diagonal
inside an eventually-white one", an induction on rows closed by contradiction
with `leftDiagonal_periodicFrom_pow`; that one is not checked here. The hard
step is nowhere in those two and everywhere in what they are for: they repair
the machine on the seed's background, and C2 says the machine's worst-case
bound over any class the board can name is still above `1/2`.

---

## 4. What survived

All four, and together they answer the topic's two questions cleanly and in
opposite directions. **(1) The onset induction does tolerate equality.**
`leftDiagonal_onset_le_of_line` has zero per-step slack, which is exactly what
a per-step bound of `1/2` supplies; an averaged bound costs an additive
constant `2c`, the anchor at `(18, 0)` supplies a budget of 17, and the
admissible-ring class's amplitude is 3, measured exhaustively at `N = 4, 8, 16`
from both a maximally uncertain and a singleton start. "It needs strictness" is
*not* the answer: strictness is not needed anywhere, and a session spent
looking for the step that needs it would find none. **(2) The transfer does not
hold, and it is not as hard as the wall — it is false.** The ring class's
binding hypothesis is a power-of-two *row* period, which the settled region does
not have; the hypothesis it does have is power-of-two *diagonal* periods, and
the same `010011111000` runs at exactly `4/7` under that one. I would seed C4
first, because it is two S nodes of genuine content that hold whatever happens
to the rest, and because it is the only one of the four that adds something to
the board rather than removing something from it. C2 and C3 belong in
`docs/obstructions.md`, where I have put them.

---

## 5. Claims that died

- **"The maximum mean cycle of exactly 1/2 is a fact about backgrounds like the
  settled words."** Died at `L = 4`: the pair `(0001, 1110)` generates a
  diagonal-admissible background of diagonal period 4 with no white diagonal on
  which the machine runs at exactly `4/7`. Every clause of
  `leftDiagonal_periodicFrom_pow` holds on it, checked over 20000 diagonals.
- **"The settled words can be generated from the diagonal recurrence alone."**
  Died at the first eventually-white diagonal, `k = 2`: where the middle word is
  white the recurrence has two periodic solutions and the branch must be read
  off the picture. Guessing it puts the words in the wrong phase, which shows up
  not as a small error but as a front of speed 1.000000 and
  `min(2F+t) = −39993` — a completely different picture wearing the right
  periods (`2@3, 4@8, 8@29, 16@400` reproduced exactly while the phases were
  wrong). The failure mode is worth recording: **the periods are not evidence
  that the words are right.**
- **"A diagonal's period can be read by testing candidate `p` over `6p`
  samples."** Died on the same run: six equal cells accept `p = 1`, which
  manufactured **33 spurious identically-white diagonals** (117, 165, 225, …)
  where there are four. Every candidate must be tested over the same window.
- **"A real front on the witness background runs at 0.594, faster than the
  machine."** Died on inspection: that measurement re-evolved the background in
  a truncated array whose edge corruption reaches the front after about 1950 of
  the 3996 rows, and separately read the picture outside its own cone, where the
  word index `k = t + x` is negative. Redone properly
  (`explorer/talus3_sound.cjs`, background read from its closed form, 5999
  rows): the real front nets 0.400 and is **never** left of the machine's
  minimum, 0 violations. The machine is sound; my harness was not.
- **"`min (2F(t)+t) = 17` is a fact I should take from crystal 51."** Not dead,
  but re-derived from scratch here on independently constructed settled words,
  because C1's whole budget is that one number.

---

## 6. Next topic

**Attack the absorbing diagonals as a positive object: is the front's skipping
of them the same mechanism as obstruction 6's skipped diagonals, and does it
have a quantitative form?** The board now has two facts that look like one
thing seen twice. Obstruction 6 says the front visits 55 % of diagonals and the
skipped ones settle *before* their drivers, killed inside the band by two
transients meeting in one `||` (68 %) rather than by a black settled neighbour
(4 %). C4 says the front provably never visits the absorbing diagonals — the
branch points of the settled-word orbit, `3, 8, 29, 400, 53208, 58287, 87867`,
which is NKS p. 871's own table. If the general skipping has the same cause as
the provable skipping, then the 45 % of diagonals the front misses are missed
for a reason, and a lower bound on the *skip rate* is a lower bound on the
front's diagonal index, which is a bound on the seam's speed of exactly the kind
the wall needs and of a kind no reachable-set machine can produce, because it is
a statement about the picture inside the band and not about the background
outside it. The measurement that would decide it is cheap and nobody has made
it: for each skipped diagonal, is its settled predecessor white over the stretch
the front would have ridden, and does the skip rate correlate with the local
white-run length of the settled words? That is the first quantity I have seen on
this wall that is about the transient band rather than about the settled region,
and obstruction 1 has been saying for two days that the band is where the answer
has to live.
