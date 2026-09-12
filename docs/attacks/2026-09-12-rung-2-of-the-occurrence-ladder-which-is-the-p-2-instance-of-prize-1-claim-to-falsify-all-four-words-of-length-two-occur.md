# Attack: rung 2 of the occurrence ladder — the `p = 2` instance of Prize 1

Talus, theorist, 2026-09-12. Topic from Ephemeris's sighting of this morning,
`docs/connections/2026-09-12-the-subshift-of-the-centre-column-*.md` §5 Topic 1,
with the captain's corrections.

**The band I actually land in, said first.** The survivor is **novel and small**:
a combinatorial lemma about rule 30, not in print, that a mathematician would
call a lemma rather than a result. What raises it above bookkeeping is that it is
an *instance* of Prize 1 rather than a neighbour of it. The document's other
half is **project-internal**: two routes the brief names are closed with reasons,
one of them the brief's own recommendation.

---

## 1. The residual, in one paragraph

Time runs down the picture; the centre column is the cell at the origin read
downward. Rung 1 of the ladder is proved: both colours occur in every window
`[a, 4a]` of the centre column (`centerColumn_window_not_constant`). Rung 2 asks
for all four *pairs* — `00`, `01`, `10`, `11` — in the same window. Two of the
four are free (§3.1). The open content is a single statement: **the centre column
is not eventually alternating**, i.e. there is no `N` past which the column reads
`…101010…`; and that, together with the closed
`centerColumn_not_eventually_constant`, is exactly `¬ ∃ N, ∀ n ≥ N,
c(n+2) = c(n)` — the `p = 2` instance of Prize 1. Where it lives in the picture:
at the origin, in the transient band, and the thing that has to be shown is that
a *pattern* at the origin cannot persist, where rung 1 only had to show that a
*colour* cannot. The residual after everything below is granted is one
inequality: **an alternating block of the centre column beginning at time `a` has
`O(a)` cells.** Any linear bound suffices for the prize instance; a bound of
`3a` gives the brief's window form verbatim.

---

## 2. Why the known routes fail

**The diagonal structure never reaches the centre column** (obstruction 1). The
centre cell at time `t` is index `0` of left diagonal `t` and of right diagonal
`t`, inside every transient. Bears on this topic because "`11` at time `t`" is
literally a statement about indices `0` and `1` of two consecutive left diagonals
(§3.1), which is where nothing is known.

**Crystal 69's ratio.** The settling front reaches bit `n` of the packed row at
about row `4n/3`, so the centre column at bit `t`, row `t`, is permanently inside
the transient. Any argument that waits for the picture to settle is refuted
before its details matter; that is why every bound here has to be a bound on a
*front*, not on a *settled* object.

**Alternation propagated leftward — the route the brief fences off, with the
number that closes it.** Two sessions have hit this: Ephemeris's own §4.2 calls
the nearest version a tautology (the rule at the origin read backwards), and the
P1 seeder's `centerColumn_periodic_two_alternating` reports leftward propagation
that does not close. I re-derived the mechanism to say *which* part of it is
obstructed, because the obvious reading — "so alternation cannot be bounded by
the cone" — is false, and §3.2 measures it false. Under alternation, at every
black time `t`, `column_succ_of_black` gives `c(t+1) = ¬cell(-1,t)` with
`c(t+1) = 0`, so `cell(-1,t) = 1`: column `-1` is black at every black time and
**free at every white time**. Writing `v` for those free values, the sideways
solve gives `cell(-2,t) = ¬v_{t+1}` at even `t` and `¬v_t` at odd `t`, and every
deeper column is a function of the same `v` — one free bit per two rows, which is
the seeder's "one free bit per pair" with a rate attached. **What that kills is
the propagation, not the conclusion.** No individual cell of the left half is
forced past depth two, so nothing marches left to collide with the cone edge the
way rung 1's checkerboard does; there is no forced region to advance. What
survives is the *system*: at time `a` the cone supplies one equation per depth
(`cell(-k, a) = 0` for every `k > a`) while the block supplies only `L/2`
unknowns, so the equations overtake the unknowns at `L ≈ 2a` and the system goes
extinct — which is exactly what §3.2 measures, at `L ≈ 2.7a`. So the right
conclusion is **not** "the route is dead" but "the route cannot be a propagation
argument, only a counting one", and §3.2 is that counting argument measured
exactly. The distinction matters because the two sessions before me reported the
propagation failing and a reader could take that for the statement failing.

**The mechanism behind rung 1 reverses, so it does not extend.** Rung 1's proof
is: a long black run forces a checkerboard leftward
(`column_alternating_of_black_run`), a checkerboard has no two adjacent black
cells, and the cone edge has exactly that — `evolve_left_edge` and
`evolve_left_second_diagonal` put black cells at `-a` and `-a+1` of row `a`. An
*alternating column* forces the opposite local pattern: two adjacent black cells
at `(-1, 0)` at every black time, which is what the cone edge looks like. So the
collision that proves rung 1 cannot be the collision that proves rung 2, and the
one that does the work in §3.2 is a counting collision rather than a pattern
collision.

**The single-colour strengthening has no cone mechanism — this is new, and it
closes the brief's own recommendation.** The brief points at the run vocabulary:
"`11` occurs infinitely often" is the `k = 2` instance of the hypothesis of the
closed `centerColumn_not_isEventuallyPeriodic_of_long_black_runs`, and "either
colour alone earns the instance". Logically true. But the cone does not bound a
single-colour block: measured exactly, a configuration white at every `x < -a`
can have an `11`-free centre column far longer than `3a`, and the search hits its
cap at every `a` from 1 to 5 — `29, 37, 45, 47, 47` cells against `3a` of
`3, 6, 9, 12, 15` (`explorer/talus10_no11.mjs`). The reason is the same dimension
count read the other way: an `11`-free column is itself free to about `0.7` bits
per row *on top of* the half bit per row that column `-1` keeps, so the cone's one
equation per depth never catches up. An alternating column is the only target in
this family that pins the column word outright and so leaves the cone's equations
ahead. **So the disjunction is the right target and either colour alone is not**,
which inverts the brief's advice for a reason the brief could not have known.
Appended to `docs/obstructions.md`.

**The excess route is a bridge, not a road** (§3.3, and obstruction "Prize 2's
excess cannot be bounded through the half-line", which is mine from 2026-09-10).
No bound on the centre column's excess that uses rule 30 is reachable, so the
bridge in §3.3 lands on open ground.

---

## 3. Candidate claims

### 3.0 First: the reduction the brief asked me to check, checked

**The crystal-21 sharpening is right, and it is exactly `p < 4`.** A tail of
period `p` has at most `p` distinct factors of each length, so four distinct
length-2 factors occurring infinitely often force `p ≥ 4`, and rung `L` forces
`p ≥ 2^L`. Rung 2 therefore kills `p ∈ {1, 2, 3}` and no more: the period-4 word
`0011` has all four length-2 words as cyclic factors, so `p = 4` survives. The
brief's correction to Ephemeris stands with that number attached.

**The free half is free, and only at multiplier 16.** Rung 1 at `a` gives a black
`u ∈ [a, 4a]` and a white `v ∈ [a, 4a]`; rung 1 at `4a` gives a black
`u' ∈ [4a, 16a]` and a white `v' ∈ [4a, 16a]`. Then `u < v'` (they can only
collide at `4a`, where one cell would be both colours) and a discrete
intermediate-value step between them yields `10`; symmetrically `v < u'` yields
`01`. So `01` and `10` occur in `[a, 16a]` for every `a ≥ 1` — **and the argument
does not give them in `[a, 4a]`**, which the brief's phrasing ("forces both
inside `[a, 16a]`") is right about and which matters, because the claim to
falsify is stated at multiplier 4. Measured: `01` and `10` are in fact both in
`[a, 4a]` for every `a ≤ 10^5`, `0` failures, and both in `[a, 16a]` with `0`
failures (`explorer/talus10_rung2.mjs` block 3). So the window form at multiplier
4 has **two** open words and one open pair-statement, not one.

**The measurement, re-run on my own engine.** Three independent implementations
of the automaton — a word-packed `Uint32Array` row engine, a naive cell-by-cell
engine over an explicit array, and the repo's BigInt shape — agree on the first
3000 centre-column cells with `0` mismatches, and the first five values `11011`
are hand-derived in §5. The brief's table reproduces exactly: the largest `a` at
which `[a, 4a]` misses a word of length `L` is `1, 11, 23, 35, 113` for
`L = 2, 3, 4, 5, 6`, and at `L = 2` the only failure is the word `00` at `a = 1`.
Verified for every `a ≤ 10^5`.

**Kernel.** `explorer/talus10_scratch_rung2.lean`, accepted by `lake env lean`,
axioms `[propext]` on every theorem: `rung2_le_200` certifies the claim to
falsify for every `a` from 2 to 200; `rung2_le_20_rowCell` certifies the same
over the board's own `rowCell` for `a ≤ 20`; and `a_one_fails` together with
`a_one_misses_double_white` proves the `a ≥ 1` version **false**, so the check is
not vacuous — it is an accepted counterexample, not a failed proof.

---

### 3.1 C1 — the alternating-block bound for the centre column

**The claim.** In English: a stretch of the centre column that alternates
black-white-black… and begins at time `a` cannot be much longer than `a` itself —
the same shape as the two proved run bounds. Precisely, in the project's
vocabulary, the strong form measured here is

> `∀ a ≥ 2, ∀ L, (∀ s < L, centerColumn (a + s) = decide ((s + k) % 2 = 0) for the
> phase k fixed by centerColumn a) → L ≤ a`

and the form the residual needs is only `L ≤ C · a` for some constant `C`, with
`C ≤ 3` giving the brief's window form outright. This is the third member of the
family whose other two are closed: `centerColumn_black_run_lt_start` (a black run
from `a` has at most `a` cells) and `centerColumn_white_run_lt_start` (a white run
from `a` has at most `3a` cells).

**What it would give.** `L ≤ 3a` makes an alternating block across `[a, 4a]`
(which needs `3a + 1` cells) impossible, so `00` or `11` occurs in `[a, 4a]` for
every `a ≥ 2`; that is the whole open content of rung 2's disjunctive half, and
with the closed `centerColumn_not_eventually_constant` it is the **`p = 2`
instance of Prize 1**. Any linear bound gives the instance (a bound `C · a` kills
alternation on `[a, (C+1)a]`, so `00`-or-`11` occurs infinitely often); only the
multiplier-4 window form needs `C ≤ 3`. What would remain is everything: `p = 3`
needs `00` **and** `11` separately (the period-3 word `001` has `00` but no `11`),
and rung `L` has `2^L` words at level `L`.

**Falsification.** `explorer/talus10_rung2.mjs` block 2, `T = 3 · 10^6`, every
start `a`. *Survives.* The longest alternating block anywhere below `3 · 10^6` is
**21 cells, starting at `t = 113,276`**. Starts with `L > 3a`: **0**. Starts with
`L > 2a`: **1**. Starts with `L > a`: **1** — and that one is `a = 1`, where
`L = 3`. So `L ≤ a` holds for every `a ≥ 2` in the measured range, three times
stronger than needed. Longest block with start below `10^k`, for `k = 1…6`:
`3, 7, 10, 13, 17, 21`, against `log₂(10^k) = 3.3, 6.6, 10, 13.3, 16.6, 19.9` —
so the blocks grow like `log₂ t`, which is the fair-coin rate exactly, and the
bound `L ≤ a` has a margin that grows linearly against a logarithm. Kernel:
`alt_block_le_3a_le_200`, `[propext]`, certifies `L ≤ 3a` for every
`2 ≤ a ≤ 200` directly.

*Distrust the result you like.* The survival is enormous and that is itself the
warning: a claim whose truth needs `L ≤ 3a` and whose measurement gives
`L ≈ log₂ a` is not being tested by the measurement at all. What else could
produce it: **the alternating pattern is simply rare**, at probability `2^{1-L}`
per start, so a coin sequence satisfies `L ≤ a` for all `a ≥ 2` with the same
margin, and the measurement therefore separates rule 30 from *nothing*. It is a
fair-coin fact about the range measured, not evidence of a mechanism. That is
precisely why C2 exists: the content is not whether the seed satisfies the bound
but whether the **cone forces** it, and that is a different measurement on a
different object. Two further checks against my own engine being the thing
measured rather than the automaton: the three engines agree (§3.0), and the
kernel re-derives the finite range from `rowCell` independently of all three.

**Novelty.** Searched `sources/` for `alternating`, `checkerboard`, `0101`,
`(01)^`, `period two`, `period 2`, `not eventually periodic`, `occurs infinitely
often`, `infinitely many times`, `block of length`, `run of`, `run of length`,
`consecutive` — run, not asserted, and every hit inspected. The `alternating`
hits are OCR'd row pictures in Jen 1990 and the *alternating group* of
permutations in Spencer 2013; the `period 2` hits are shift registers of period
`2^N − 1` in Wolfram 1986. **Nothing states a bound on alternating blocks of the
centre column.** On the board, the sixteen files mentioning alternation
(`column_alternating_of_black_run`, `column_black_run_of_alternating`,
`column_alternating_shrink`, `rule30_alternating_step`, …) are all about the
*spatial* checkerboard left of the origin, which is a different object from a
*temporal* block of the column; the nearest is the first pair, which is the
`L = 1` dictionary entry below and not a bound. Nearest in print for the
mechanism is Wolfram 1986 §7 lines 1118–1120, the determination of the whole
triangle by an all-ones position-0 sequence, which is the *black-run* mechanism.
Marked **new**.

**The dictionary entry worth having, which is already the board's.** At `L = 1`
those two closed nodes say: **`11` occurs at time `t` if and only if row `t` has
a white cell at `-1` and a black cell at `0`** — that is, if and only if the
origin is the *left end* of a black run of row `t`. So "`11` occurs infinitely
often" is "the origin begins a black run in infinitely many rows", and "no `11`
past `N`" is "every black origin has a black left neighbour from `N` on". Band:
**Nothing** — it is two closed nodes read at `L = 1` — but it is the translation
that makes §3.2 possible and it is not written down anywhere.

**Route.** For the seed: C2 below, applied to row `a`, which is white at every
`x < -a` (`evolve_eq_false_of_outside_cone`) and black at `-a` and `-a+1`
(`evolve_left_edge`, `evolve_left_second_diagonal`); plus
`centerColumn_window_not_constant` for the two free words, plus
`centerColumn_not_eventually_constant` to reach the prize instance. The one step
that is actually hard is C2 itself, and §3.2 says why.

---

### 3.2 C2 — the cone reduction: alternation is bounded by the left extent alone

**The claim.** In English: a picture grown from a *finite* row cannot have an
alternating centre column for much longer than the row is wide, and it is the
row's **left** extent that does the work. Precisely:

> for every `a ≥ 3`, every `X : Config` with `X i = false` for all `i < -a` has
> `L ≤ 3a`, where `L` is the number of cells in the alternating prefix of
> `t ↦ column X 0 t`.

Stated for `evolve` and the seed this is C1 at row `a`. The definition this wants
and the board lacks is "alternating prefix length"; everything else is
`column`, `Config` and `PeriodicFrom`'s vocabulary.

**What it would give.** C1, hence rung 2's disjunctive half, hence the `p = 2`
instance of Prize 1. And it is the reason to prefer C2 to C1: C2 is a statement
about a **family**, so each `a` is a finite, exhaustively checkable claim, where
C1's instance at each `a` is a fact about one sequence and unfalsifiable by
measurement.

**Falsification.** Three independent implementations, agreeing.

1. `explorer/talus10_alt.mjs` block A: exhaustive over **every** configuration
   supported in `[-a, a]`, for `a = 0…10` — all `2^{2a+1}` of them. Maximum
   alternating cells: `1, 7, 7, 7, 7, 9, 10, 10, 15, 17, 17`.
2. `explorer/talus10_dfs.mjs`: an exact DFS that builds the configuration
   outward, choosing the cell at `+k` and reading the cell at `-k` off
   left-permutivity at radius `k` (flipping `cell(-k)` flips the centre at time
   `k`, so exactly one value gives the required `c(k)`), pruning when the forced
   left cell is black past `-a`. The tree is therefore *exactly* the set of
   configurations whose column alternates, and its extinction depth is the
   answer. It reproduces block A's eleven numbers exactly, then continues:
   with the left bound only (right half unbounded) `L = 8, 8, 8, 8, 9, 10, 10,
   17, 17, 17, 17, 17, 17, 20, 22, 26, 26, 26, 36, 36, 36, 36, 36, 36, 36, 36`
   for `a = 1…26`. Its forced-left-cell shortcut was re-checked against the
   `O(k²)` direct evolution at **every node** for `a = 3, 6, 9`: no mismatch.
3. `explorer/talus10_no11.mjs` block V: a third implementation that branches on
   the column word as well, reproducing the same ten values.

*Survives for `a ≥ 3`; **dies at `a = 1` and `a = 2`***, where the maximum is
`8 > 3` and `8 > 6`. Worst ratio `L/a` over `3 ≤ a ≤ 26` is **`2.667`**, at
`a = 3` itself; the worst over `a ≥ 4` is `2.125` at `a = 8`, and the ratio falls
to `1.385` at `a = 26` because `L` sits on a plateau at `36` from `a = 19`
onward. **`L ≤ 2a` is false** — it fails at `a = 3` (`8 > 6`) and again at
`a = 8` (`17 > 16`). So `3a` is not slack here, it is close to the true
constant, and rung 2's window form at multiplier 4 has about `11%` of margin
rather than a factor of three. (An earlier draft of this paragraph said the
worst ratio was `1.895` and that `L ≤ 2a` held from `a = 5`; both were wrong —
I had read the ratio column at the end of the table instead of over it. The
corrected numbers are the ones above.) The seed's own instances at `a = 1, 2`
are fine independently (`L = 3` and `L = 2`), so the two deaths cost the route
nothing but must be in the statement.

**The right extent is not needed, and that is the finding.** Bounding the support
on both sides (`[-a, a]`) gives `1, 7, 7, 7, 7, 9, 10, 10, 15, 17, 17, …`;
bounding only the left gives `…, 8, 8, 8, 8, 9, 10, 10, 17, 17, 17, …`. The two
agree to within one cell at every `a`. So C2 is a **left-cone** statement of the
same kind as the two closed run bounds, not a statement about finite support.

**The relaxation, which is an upper bound and reaches much further.** Column `-1`
is black at every black time of an alternating column (§2), so the whole left half
is a function of column `-1`'s *white-time* values — one free bit per two rows —
while the cone imposes one equation per depth. Treating those white-time values as
free gives a strictly larger search (`f_relax ≥ f_exact`, confirmed at every
`a ≤ 19`) that is cheap enough to push to `a = 56`
(`explorer/talus10_relax.mjs`, reproduced independently by
`explorer/talus10_no00.mjs` block V): `L = 8, 8, 8, 8, 10, 11, 13, 18, 19, 19`
for `a = 1…10`, then `31, 33, 33, 34, 39, 44, 49, 67, 78, 88, 102` at
`a = 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56`. **Worst ratio over `a ≥ 3` is
`2.667` at `a = 3` and `2.583` at `a = 12`**, falling to `1.821` at `a = 56` —
under `3` everywhere measured, but not by much. The honest reading: a proof
through the left half alone would give `C ≈ 2.7`, which is enough for the prize
instance (any linear `C` is) and *just* enough for the multiplier-4 window form,
with no room to spare.

*Distrust the result you like.* Two things could produce these numbers besides
the claim being true, and both were checked.

- *The instrument could be wrong.* So it was run against two **theorems**. With
  the cone edge's two black cells imposed, the same DFS with a constant-black
  target returns `1, 1, 3, 3, 5, 5, 7, 7, 9, 9, 11, 11, 13, 13` for `a = 1…14`
  — exactly `centerColumn_black_run_lt_start`'s bound `≤ a`, and tight at every
  odd `a`. With a constant-white target it returns `3, 2, 5, 4, 7, 6, 9, 8, …`,
  comfortably inside `centerColumn_white_run_lt_start`'s `≤ 3a` (whose proof is
  lossy by a factor of three, which this exposes). And the *unconstrained* white
  search hits the cap at every `a`, correctly, because the all-white
  configuration has an all-white column — so the instrument does report
  unboundedness when unboundedness is the truth. An instrument that reproduces
  one theorem tightly, is slack where that theorem is slack, and diverges where
  divergence is right, is the strongest check I could build here.
- *It could be a fair-coin fact again, as C1's survival is.* It is not, and that
  is the whole reason C2 exists. C1's measurement compares the seed against
  nothing, because a coin satisfies `L ≤ a` too. C2's compares two targets
  against each other on identical machinery, and they come out different: with
  the **alternating** target the search is extinct by `k ≈ 2.7a`, and with the
  **`11`-free** target — a strictly weaker constraint on the same object, with
  the same cone — it is still alive at `k = 47` when `3a = 15`, and with the
  **`00`-free** target the relaxation never dies at all. A coin has nothing to
  say about that difference; it comes from which target pins the column word and
  so leaves the cone's equations ahead, which is a fact about rule 30's local
  rule. So the finiteness is not an artefact of the cone alone, it is the cone
  *plus* the alternating target, which is what the claim says.
- *Depth, stated plainly and not dressed up.* C2 is verified **exactly** for
  `a ≤ 26` and by a valid upper bound for `a ≤ 56`. Its tree width is `2^{a/2}`
  at best, so this is not a `10^5` measurement and cannot be made into one by
  spending longer. The *consequence* for the seed is verified to `a = 10^5` by
  the engine and `a = 200` by the kernel; the family claim is not. A reader
  should price C2 as "exact to `a = 26`", and my own notebook's rule — that a
  verdict below `10^6` rows is worth nothing — applies to sweeps of the seed's
  column, not to an exhaustive family check where every `a` is settled outright
  rather than sampled. That is why the two numbers are reported separately, and
  the weaker of them is the one that matters.

**Novelty, and the precedent is exact.** Searched `sources/` for `alternating`,
`checkerboard`, `0101`, `period two`, `finite support`, `support radius`, `finite
configuration`, `left extent`, `number-like`, `occurs infinitely often`, `block of
length`, `run of length`, `consecutive` — searches run, not asserted. In the
plain-text corpus the only hits for the first group are OCR'd row pictures in
Jen 1990 and the *alternating group* of permutations in Spencer 2013; nothing
bounds any property of a column by the extent of a finite configuration. The
nearest machinery in print is Wolfram 1986 §4 lines 447–456 (the four-preimages
leftward solve), which is what the DFS's forced-left-cell step *is*, not the
claim.

**But there is a precedent, and it is one word away.** Condrey,
arXiv:2609.09431, in `docs/sources.md`'s live-preprints table: for support radius
`w`, the sharp maximal **constant** prefix of the centre trace is `2⌈w/2⌉+1`
(centre white) or `2⌊w/2⌋+2` (centre black), so at most `w + 2`. That is C2 with
the constant word in place of the alternating word, and it is *linear in the
extent* exactly as C2 is. So C2 is **new, with a named precedent in an
unrefereed preprint whose quantitative claims this project has already
reproduced** for `w = 1…10` by the same kind of exhaustive enumeration as block A
above.

**And the precedent's mechanism is on this board, which is how I can say the
mechanisms differ.** I read the shipped Lean file,
`sources/condrey-2609.09431-Rule30ZeroTail.lean`. Its engine is: with the trace
all white, `cell(-1,t) = column 1 at t`; column 1 is then **monotone**, because a
white centre makes `col1(t+1) = col1(t) ∨ col2(t)` — which is this board's closed
`column_one_succ_of_white` and `white_run_monotone`, and Condrey's
`c1_right_latch` — so the whole left half collapses to *one integer*, the time
the latch fires, and past it the left half is a checkerboard
(`alternating_left_fixed`), which is not left-bounded. A rigidity argument, not a
count. **It does not transfer to the alternating word, and the reason is §2's
mechanism reversal stated exactly:** under alternation the centre is black at half
the times, and at a black time the same rule reads
`col1(t+1) = ¬(col1(t) ∨ col2(t))`, which *resets* the latch instead of holding
it. So the latch fires at most every other step, nothing collapses to one
integer, and the left half keeps one free bit per two rows — which is precisely
the `2^{a/2}` search width measured above. **C2 is Condrey's theorem one word
over, and that one word is worth an exponential.** (What I have *not* read is the
paper's own fiber argument, which is what supplies the classification the Lean
file takes as a hypothesis; `docs/sources.md` already records that gap. The
docstring says it comes from "triangular uniqueness", which is the same
left-permutive solve, so I expect it to be the rigidity above rather than
something new — but that is an expectation and it is flagged as one.)

**Route: none, and this is now measured rather than guessed.** What a proof would
cite: `evolveFrom_leftPermutive` (the forced-left-cell step, which is the DFS's
own engine and is closed), `column_succ_of_black` (column `-1` black at black
times), `leftSolve_eq_column` (the left half from columns `0` and `1`),
`evolve_eq_false_of_outside_cone` (the hypothesis). The one step that is actually
hard is whether the extinction is **rigidity** (Condrey's mechanism, which would
be a route) or a **count** (which this project has twice shown is not a proof —
obstruction 7's pairing count and obstruction "a universal bound on the
recurrence's hitting times", because more equations than unknowns proves nothing
when the equations contain `OR`).

**It is a count.** `explorer/talus10_latch.mjs` enumerates the surviving
configurations level by level. Control first: with the **constant-white** target
— Condrey's case — the surviving set collapses to **exactly `1`** at level
`a + 1` and stays `1` at every deeper level, for `a = 6, 8, 10`. That is
Condrey's rigidity, reproduced by this instrument, and it is what a route looks
like. With the **alternating** target the same instrument gives, at `a = 8`,
surviving counts `1, 2, 4, …, 256, 283, 24, 20, 40, 80, 160, 52, 104` and then
extinction — hundreds of survivors to the last level before the set dies at a
stroke, never one. So there is no collapse to a single configuration and no
integer for a rigidity argument to name. One datum cutting the other way,
recorded and not built on: at the deepest surviving level for `a = 8, 10, 12`
(all of which die at `k = 17`, with the same `104` survivors and the same `26`
of `33` row-0 cells determined) column `1` *is* determined at all `17` times,
including all `8` black times — but at `a = 6` it is determined at only `7` of
`10` times, so this is not a general rigidity and I have no explanation for it.

---

### 3.3 C3 — the excess bridge: Prize 2's own quantity implies the `p = 2` instance

**The claim.** Let `E(N) = 2 · #{n < N : centerColumn n = true} - N` be the
centre column's excess, Prize 2's own quantity. Then

> if `limsup E = +∞` then `11` occurs infinitely often; if `liminf E = -∞` then
> `00` occurs infinitely often; either gives the `p = 2` instance of Prize 1.

Because if `11` does not occur in `[N, T]` the black cells there are isolated, so
`2 · blacks[N,T] ≤ (T - N + 1) + 1` and `E(T+1) ≤ E(N) + 1` for every `T`;
dually for `00`. In the project's vocabulary this is a statement about
`{n ∈ Finset.range N | centerColumn n = true}.card`, which the P2 region already
has four closed nodes about (`centerColumnCount_sandwich`,
`centerColumn_excess_interpolate`, `centerColumnCount_block`,
`centerColumn_density_tendsto_half_iff_excess`).

**What it would give.** A second, independent sufficient condition for the
`p = 2` instance, in the P2 region's vocabulary rather than P1's — so the two
prize regions, which the board has kept apart, meet at this one instance. What
would remain is the unboundedness, which is open and which obstruction "Prize 2's
excess cannot be bounded through the half-line" (mine, 2026-09-10) prices as
unreachable by any argument that does not name the cone.

**Falsification.** `explorer/talus10_runs.mjs`, `T = 3 · 10^6`. The
implication's arithmetic is checked directly rather than only argued: over all
**375,627** maximal `11`-free intervals of the column, `E(T+1) ≤ E(N) + 1` holds
with **0 violations** and is *attained* (worst excursion exactly `0`), and dually
over all **374,134** maximal `00`-free intervals `E(T+1) ≥ E(N) - 1` holds with
**0 violations**, attained. *Survives, and is tight.* The excess itself:
`E(3·10^6) = 1296 = 0.748 √N`, with running max by decade `10^2 … 10^6` of
`10, 26, 64, 419, 1744` and running min of `0, -44, -80, -80, -257`. The
`-257` is the same minimum my own 2026-09-10 session measured at `N = 172,711`
out to `10^7`, from a different engine, which is the one cross-check available
here.

*Distrust the result you like.* The implication is arithmetic and cannot fail;
what could mislead is the *measurement*, and it does. `limsup E = ∞` looks
obvious from the decade table and is not evidence at all: a coin's excess is
recurrent, so a coin has `limsup E = +∞` almost surely and the table is exactly
what a coin produces — the measurement therefore carries no information about
whether rule 30's `limsup` is infinite. Worse, the asymmetry (the minimum stuck
at `-257` from `N ≈ 1.7 · 10^5` all the way to `10^7`) is the arcsine law seen
from one side, which I mistook for structure in my own 2026-09-10 session and
which 40 coin draws settled then. The honest reading is that C3 moves the
question, it does not measure it.

**Novelty.** Searched `sources/` for `excess`, `discrepancy`, `partial sum`,
`balance`, `equal number`, `isolated`, `no two consecutive` — run, twelve hits
across eight files, all unrelated on inspection: Wolfram 1986's two are the
four-preimages count at line 466 ("an equal number of initial configurations
which evolve to it", which is crystal 40) and a remark about confidence
intervals at line 1777. The elementary combinatorial half (isolated symbols
bound a partial sum) is standard and unattributable; the *connection* to a P1
instance is not on the board —
crystal 31 is the converse direction (eventual periodicity makes the density
converge). **Band: Nothing** for the implication, which is true of every
`ℕ → Bool`; **project-internal** for the observation that the P2 region's central
quantity has a P1 instance downstream of it. I say that plainly because the
implication is one line and its value is entirely in where it points.

**Route.** For the implication: `centerColumnCount_block` plus one induction, size
S. For the hypothesis: no route, and obstruction "Prize 2's excess" says why.

---

### 3.4 C4 — the single-colour bound (died)

**The claim, as the brief proposed it.** "Either colour alone earns the
instance": bound the length of an `11`-free block of the centre column by `C · a`,
which would give `11` infinitely often — the `k = 2` instance of
`centerColumn_not_isEventuallyPeriodic_of_long_black_runs`'s hypothesis — and so
the `p = 2` instance directly, without the disjunction.

**Falsification.** `explorer/talus10_no11.mjs`. *Dies — as a family claim, which
is the only form that could be proved.* The claim is **true of the seed**, with
room: the seed's longest `11`-free block below `3 · 10^6` is `60` cells starting
at `t = 1,256,134`, and the worst length-over-start ratio anywhere is `3.000`, at
`a = 1`, where the block is 3 cells (`00`-free: longest `71` cells from
`t = 1,265,221`, worst ratio `0.571`; both figures reproduced by two scripts).
What dies is the **cone reduction**: a configuration white at every `x < -a` has
`11`-free centre-column blocks of at least `29, 37, 45, 47, 47` cells at
`a = 1, 2, 3, 4, 5` against `3a = 3, 6, 9, 12, 15`, and the search **hits its cap
at every one of those `a`**, so those are lower bounds on the true maxima and no
upper bound was found at any `a`. Past `a = 5` the tree exceeded a `4 · 10^8`
node budget and returned nothing, which is itself the finding: the tree is wide
where the alternating tree is extinct. The `00`-free variant is better behaved —
`16, 16, 27, 31` at `a = 1…4` are genuine maxima and not caps — but still an
order of magnitude above `3a`. So there is no cone bound to prove, and the route
has no mechanism even though its conclusion is true.

**Why it died, which is the useful part.** The same dimension count that makes C2
finite makes this one infinite. An alternating target pins the column word
outright, so the only freedom left is column `-1`'s white-time values — half a
bit per row — and the cone's one equation per depth overtakes it. An `11`-free
target leaves the column word itself free to about `log₂ φ ≈ 0.69` bits per row
*on top of* that half bit, so the freedom is about `1.2` bits per row against one
equation per depth and the equations never catch up. **The disjunction is not a
weaker thing one settles on having failed at either colour; it is the only member
of the family the cone can see.**

**And the `00`-free half, which looked like an exception, is not one.** The
exhaustive numbers `16, 16, 27, 31` at `a = 1…4` are genuine maxima, so the
`00`-free bound *is* finite there and might be linear — which would give "`00`
occurs infinitely often", the single-colour result, outright. But the left-half
relaxation cannot see it: run on the `00`-free target it hits its cap at **every**
`a` tried, reaching `≥ 73, 85, 97, 109, 121, 133` cells at `a = 1…6` and
`≥ 157, 181, 205` at `a = 8, 10, 12`, against `3a` of `3…36`
(`explorer/talus10_no00.mjs`). So whatever makes the exhaustive `00`-free
answer finite is **not** visible to the left half alone, and a proof of it would
have to constrain column `-1`'s realizability by the right half — a strictly
harder object than C2 needs. Compare: for the alternating target the relaxation
is already finite, so a left-half-only proof of C2 is at least *possible in
principle*. **That is the sharpest reason to prefer the disjunction, and it is
the one measurement in this document that compares the two targets on equal
terms.**

**Novelty.** Not applicable to a dead claim; the search terms are C2's.

---

## 4. What survived

**C2 survived, and it is what I would seed first** — as the statement C1 needs,
since C1 by itself is a fair-coin fact about the seed and C2 is where the
automaton enters. It survived exhaustive falsification by three independent
implementations, one of which reproduces `centerColumn_black_run_lt_start`'s
bound exactly and is correctly slack on `centerColumn_white_run_lt_start`, whose
proof is lossy; and it survived the novelty search with one named precedent
(Condrey's constant-prefix bound, one word away, in an unrefereed preprint whose
fiber argument nobody here has read). It dies at `a = 1, 2` and must
be stated for `a ≥ 3`. C1 survived to `3 · 10^6` and is kernel-certified to
`a = 200`, but its survival is what a coin would give, so it is the *consequence*
worth stating and not the claim worth proving. C3 survived as arithmetic and is
band Nothing; its value is the pointer. C4 died, and its death inverts the
brief's own recommendation, which is the result I did not expect to be carrying.

**But say the price of C2 plainly, because I found it out late and it lowers the
value.** The route's one hard step is whether the extinction is rigidity or a
count, and it is measured to be a **count**: the constant-word control collapses
to a single surviving configuration and the alternating one does not, dying with
hundreds of survivors still alive. This project has killed two other routes for
exactly that reason. So C2 is a claim that is true, exactly measured, novel, one
word from a preprint's theorem, and *whose only known mechanism is the kind this
board has twice priced as not-a-proof*. A captain should read it as a well-posed
target rather than a promising one.

**Honest summary of the topic: rung 2's open half is exactly one linear
inequality about a finite picture; the inequality is measured exactly rather than
sampled; its constant is close to `3` rather than comfortably below it; and its
mechanism is a count. It is the first statement in this region that is small,
non-vacuous, not a prize in disguise, and not yet refuted — and it still has no
route.**

---

## 5. Claims that died

- **`f(a) ≤ 3a` uniformly in `a`** (C2 without its `a ≥ 3`). Dies at `a = 1`
  (`8 > 3`) and `a = 2` (`8 > 6`), exhaustively; witness at `a = 1`, the
  configuration black at exactly `x = -1` and `x = 7`, whose centre column
  alternates for 8 cells.
- **The single-colour bound** (C4), as a statement about the cone. Dies at
  `a = 1`: `29` cells and counting against `3a = 3`, capped rather than maximal.
  True of the seed (worst ratio `3.000`), unforced by the cone — so there is
  nothing there to prove.
- **"The right extent matters."** My own first reading of `explorer/talus10_alt.mjs`
  block C, where bounding the right half at `16` gave smaller answers than
  bounding it at `a`. Dies on the comparison: the two columns agree to within one
  cell at every `a`, and the binding constraint is the left extent. The tell I
  ignored for twenty minutes was that block C's numbers were *larger* at small
  `a` than block A's, which is impossible if the right bound were doing the work.
- **My typed `A051023`.** The engine validation printed `21` mismatches against a
  prefix of A051023 I typed from memory; the engine was right and my memory
  wrong. Hand-deriving rows 0 to 4 from the rule gives `1, 1, 0, 1, 1`, which is
  what all three engines produce. Recorded because "the engine disagrees with the
  literature" is the single most alarming line a session can print, and the
  literature in that line was me.
- **Two wrong diagonal recursions**, mine, caught by an in-script consistency
  check before they reached a number. I wrote `LD_k[t] = LD_k[t-1] ⊕ (LD_{k-1}[t-1]
  ∨ LD_{k-1}[t])`, reading *one* shallower diagonal at two indices; the truth is
  `LD_k[t] = LD_k[t-1] ⊕ (LD_{k-1}[t-1] ∨ LD_{k-2}[t-1])`, reading *two*
  shallower diagonals at one index — which is the board's own
  `leftDiagonal_recurrence`, and the right-hand version is
  `rightDiagonal_recurrence`. A third bug (the previous level's apex never
  written) was caught by the same check at `k = 2`. All three would have produced
  plausible tables.
- **"An alternating block forces `cell(-2,s) ≠ cell(-3,s)` at every black time
  `s`, which is new information."** Mine, derived by hand and believed for half
  an hour. It is automatic: the explicit formulas give `cell(-2,s) = ¬v_{s+1}`
  and `cell(-3,s) = v_{s+1}`, so the two differ for free and the "constraint"
  constrains nothing. Exactly the shape of Ephemeris's §4.2 tautology, one column
  further left.
- **"The worst ratio is `1.895`, so `L ≤ 2a` survives from `a = 5`."** Mine,
  written into §3.2 and taken out. `L ≤ 2a` fails at `a = 3` (`8 > 6`) and again
  at `a = 8` (`17 > 16`), and the worst ratio over `a ≥ 3` is `2.667`, at `a = 3`.
  I had read the ratio column at the *end* of the table instead of over the whole
  of it, and the end of the table is where a plateau makes the ratio smallest.
  The correction matters: it moves C2's constant from "comfortably under 3" to
  "about 2.7", which is the difference between the window form having a factor of
  three in hand and having eleven per cent.
- **"C2 has Condrey's rigidity."** Mine, and the hypothesis I parked in §6 before
  testing it. Dies at the measurement: the constant-word control collapses to
  exactly one surviving configuration while the alternating target dies with `104`
  survivors still alive. The mechanism does not transfer, and the latch is reset
  at every black time, which is why.
- **"The forced region never reaches the cone edge, at any depth, so the route is
  dead."** Mine, written into §2 from the hand derivation and contradicted by my
  own §3.2 an hour later. The *forced region* really does stop at depth two; the
  *system* still goes extinct at `L ≈ 2.7a`. A propagation obstruction is not a
  statement obstruction, and I wrote one as if it were the other.
- **My typed excess table.** §3.3's decade numbers were written before the run
  finished, from memory of my own 2026-09-10 session. Replaced with the measured
  `10, 26, 64, 419, 1744` / `0, -44, -80, -80, -257`. My own notebook says the
  falsification paragraphs are transcripts and must be written after the run; I
  broke that rule inside the document that quotes it.
- Nothing died for lack of depth. Every death above has a witness computed rather
  than searched for.

---

## 6. Next topic

**Which target words the cone can see: classify `W ↦ f_W(a)` for the short words,
with the instrument this session built.** The question I parked here — is C2's
extinction rigidity or a count — got answered inside the session (§3.2), and the
answer makes this the right successor rather than a consolation. Four targets
have now been measured on identical machinery, with four different behaviours:

| target word | `f_W(a)`, coned configurations | behaviour |
|---|---|---|
| constant | `≈ a` (Condrey: `2⌈a/2⌉+1`, `2⌊a/2⌋+2`) | **rigid** — survivors collapse to exactly `1` |
| alternating | `≤ 3a`, exactly `8,8,8,8,9,10,10,17,…,36` | finite, but a **count** — hundreds of survivors, then extinction |
| `11`-free | unbounded within reach (`≥ 47` at `a = 5`) | **no bound at all** |
| `00`-free | finite exhaustively (`16,16,27,31`), invisible to the left half | finite for a reason nobody has identified |

That is four points of a classification nobody has drawn, and the classification
is what the occurrence ladder actually needs: **rung `L` is reachable exactly for
those words the cone can see, so knowing which words those are tells a captain
which rungs are worth a session before any of them is attempted.** The concrete
task: run `explorer/talus10_no11.mjs`'s word-branching search over *every* target
word of length `≤ 4` (as a subshift of finite type on the column, which is what
"avoid `w`" is), tabulate `f_W(a)` for `a ≤ 6`, and sort by behaviour. It is one
script, the instrument exists and is controlled against two theorems, and the
output is a table rather than a hope. Two specific things to look for. First,
whether "rigid" coincides with "the target word makes column 1 monotone" — that
is Condrey's mechanism and it is the only known source of a route, so the rigid
class is exactly the reachable class. Second, the `00`-free anomaly, which is the
one entry above whose finiteness has no explanation and which, if it is linear,
gives "`00` occurs infinitely often" — a **single-colour** result strictly
stronger than everything in this document.

The cheap companion, in the same sitting: the alternating maxima sit on plateaus
(`8` for `a = 1…4`, `17` for `a = 8…13`, `26` for `a = 16…18`, `36` for
`a = 19…26`) with jumps at `a = 5, 6, 8, 14, 15, 16, 19`. Condrey's constant-word
maxima have a closed form; these have none that I can see. A closed form would be
the strongest possible evidence that a mechanism exists after all and would
reopen C2's route; its continued absence out to `a = 34` would be the strongest
evidence that the count is the whole story.
